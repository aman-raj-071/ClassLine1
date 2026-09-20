"""MCP tools that ground ClassLine help responses in website content."""

from __future__ import annotations

from typing import Any
from urllib.parse import urljoin, urlparse, urldefrag

import httpx
from bs4 import BeautifulSoup
from fastmcp import FastMCP
from starlette.responses import JSONResponse

import config

mcp = FastMCP("ClassLine Website MCP", host="0.0.0.0", port=8000)
_cache: dict[str, str] = {}
_client_headers = {"User-Agent": "ClassLineWebsiteAssistant/1.0"}


def _allowed_url(url: str) -> str:
    candidate = urlparse(url)
    site = urlparse(config.SITE_URL)
    if candidate.scheme not in {"http", "https"} or candidate.netloc != site.netloc:
        raise ValueError("Only pages on the configured ClassLine website can be read.")
    return urldefrag(url)[0]


def _page_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "nav", "footer", "svg"]):
        tag.decompose()
    return " ".join(soup.get_text(" ", strip=True).split())


async def _fetch(url: str) -> str:
    url = _allowed_url(url)
    if url in _cache:
        return _cache[url]
    async with httpx.AsyncClient(headers=_client_headers, follow_redirects=True, timeout=15) as client:
        response = await client.get(url)
        response.raise_for_status()
    _cache[url] = _page_text(response.text)
    return _cache[url]


@mcp.tool()
async def fetch_page(url: str) -> str:
    """Fetch a ClassLine page and return its cleaned readable text."""
    return await _fetch(url)


@mcp.tool()
async def get_site_map() -> list[str]:
    """Return up to 50 known internal pages discovered from the homepage."""
    async with httpx.AsyncClient(headers=_client_headers, follow_redirects=True, timeout=15) as client:
        response = await client.get(config.SITE_URL)
        response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    urls = [config.SITE_URL]
    for anchor in soup.find_all("a", href=True):
        url = urldefrag(urljoin(config.SITE_URL, anchor["href"]))[0]
        try:
            _allowed_url(url)
        except ValueError:
            continue
        if url not in urls:
            urls.append(url)
        if len(urls) >= 50:
            break
    await _fetch(config.SITE_URL)
    return urls


@mcp.tool()
async def search_site(query: str) -> list[dict[str, Any]]:
    """Search pages already cached by the website tools without re-fetching them."""
    terms = [term.lower() for term in query.split() if term.strip()]
    if not terms:
        return []
    matches: list[dict[str, Any]] = []
    for url, page in _cache.items():
        lowered = page.lower()
        score = sum(lowered.count(term) for term in terms)
        if score:
            position = min((lowered.find(term) for term in terms if term in lowered), default=0)
            snippet = page[max(0, position - 140): position + 360]
            matches.append({"url": url, "snippet": snippet, "score": score})
    return sorted(matches, key=lambda item: item["score"], reverse=True)[:10]


@mcp.tool()
async def get_page_section(url: str, heading: str) -> str:
    """Return text that follows a matching h1, h2, or h3 heading on a ClassLine page."""
    url = _allowed_url(url)
    async with httpx.AsyncClient(headers=_client_headers, follow_redirects=True, timeout=15) as client:
        response = await client.get(url)
        response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    target = next((tag for tag in soup.find_all(["h1", "h2", "h3"]) if heading.lower() in tag.get_text(" ", strip=True).lower()), None)
    if target is None:
        return "No matching heading was found on this page."
    content: list[str] = []
    for sibling in target.find_all_next():
        if sibling is not target and sibling.name in {"h1", "h2", "h3"}:
            break
        if sibling.name in {"p", "li"}:
            text = sibling.get_text(" ", strip=True)
            if text:
                content.append(text)
    return "\n".join(content) or "No readable text was found under that heading."


@mcp.custom_route("/health", methods=["GET"])
async def health(_: Any) -> JSONResponse:
    return JSONResponse({"status": "ok", "cachedPages": len(_cache)})


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
