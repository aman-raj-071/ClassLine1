"""Configuration shared by the MCP server and the Strands chatbot."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Never search upward into the main application .env. This service has its own
# configuration file so unrelated project content cannot break startup.
load_dotenv(Path(__file__).with_name('.env'))

SITE_NAME = os.getenv("SITE_NAME", "ClassLine")
SITE_URL = os.getenv("SITE_URL", "http://localhost:3000").rstrip("/")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8000/mcp")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

SYSTEM_PROMPT = f"""
You are the official assistant for {SITE_NAME}, accessible at {SITE_URL}.

Your ONLY source of truth is the content retrieved via your tools
(fetch_page, get_site_map, search_site, get_page_section).

Rules:
1. ALWAYS use search_site or fetch_page before answering a factual question. Never answer from prior knowledge.
2. If the information is not found on the website, respond: "I couldn't find that on {SITE_NAME}. You can try asking about 2 related topics that do exist on the site."
3. Cite the source URL for every factual answer as: [Source: <url>]
4. Keep answers concise (under 150 words) unless the user asks for detail.
5. If the user asks something off-topic, politely redirect: "I'm here to help with questions about {SITE_NAME}. Ask me about our products, services, or company."
6. Never invent URLs, prices, names, or features.
7. If a tool call fails, tell the user and offer to try a different question. Do not guess.
""".strip()
