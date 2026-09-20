"""Interactive terminal client for the website-grounded assistant."""

from mcp.client.streamable_http import streamablehttp_client
from strands import Agent
from strands.models import BedrockModel
from strands.tools.mcp import MCPClient

import config


def build_agent() -> MCPClient:
    return MCPClient(lambda: streamablehttp_client(config.MCP_SERVER_URL))


def main() -> None:
    model = BedrockModel(model_id=config.BEDROCK_MODEL_ID, region_name=config.AWS_REGION)
    with build_agent() as mcp_client:
        tools = mcp_client.list_tools_sync()
        agent = Agent(model=model, system_prompt=config.SYSTEM_PROMPT, tools=tools)
        print(f"Chatbot for {config.SITE_NAME} ready. Type 'exit' to quit.")
        while True:
            try:
                question = input("\nYou: ").strip()
                if question.lower() in {"exit", "quit"}:
                    break
                if question:
                    print(f"\nBot: {agent(question)}")
            except KeyboardInterrupt:
                break
            except Exception as error:
                print(f"\n[Error] {error}. Please try again.")


if __name__ == "__main__":
    main()
