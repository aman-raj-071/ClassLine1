from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mcp.client.streamable_http import streamablehttp_client
from strands import Agent
from strands.models import BedrockModel
from strands.tools.mcp import MCPClient
import config

app = FastAPI(title="Website Chatbot API")

# Only the configured website origins may call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# Initialize MCP client and agent once at startup
mcp_client = MCPClient(
    lambda: streamablehttp_client(config.MCP_SERVER_URL)
)

@app.on_event("startup")
async def startup():
    # Enter the MCP context and keep it open
    mcp_client.__enter__()
    tools = mcp_client.list_tools_sync()
    model = BedrockModel(
        model_id=config.BEDROCK_MODEL_ID,
        region_name=config.AWS_REGION,
    )
    app.state.agent = Agent(
        model=model,
        system_prompt=config.SYSTEM_PROMPT,
        tools=tools,
    )

@app.on_event("shutdown")
async def shutdown():
    mcp_client.__exit__(None, None, None)

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        response = app.state.agent(request.message)
        return ChatResponse(response=str(response))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
