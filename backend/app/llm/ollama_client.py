import httpx
import os
import json

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

async def query_ollama(prompt: str, model: str = "qwen2.5:7b") -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(f"{OLLAMA_URL}/api/generate", json={
                "model": model,
                "prompt": prompt,
                "stream": False
            })
            response.raise_for_status()
            return response.json().get("response", "")
        except Exception as e:
            print(f"Ollama error: {e}")
            return ""
