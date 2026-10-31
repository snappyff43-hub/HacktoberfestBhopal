"""Gemma 4 integration service using local Ollama native API.

Provides structured script generation, hook creation, scene breakdowns,
captions, and hashtags in Hindi, English, and Hinglish.
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple
import httpx
from app.core.config import OLLAMA_BASE_URL, OLLAMA_MODEL
from app.schemas.project import GeneratedContentSchema, SceneItem

logger = logging.getLogger("creatorflow.gemma")


class GemmaService:
    """Service for interacting with local Gemma 4 model via Ollama."""

    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def check_status(self) -> Dict[str, Any]:
        """Check if local Ollama daemon is reachable and whether the model is loaded."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # 1. Version check
                v_res = await client.get(f"{self.base_url}/api/version")
                if v_res.status_code != 200:
                    return {
                        "ollama_running": False,
                        "ollama_version": None,
                        "gemma_model_installed": False,
                        "gemma_model_name": self.model,
                        "available_models": [],
                        "message": f"Ollama returned HTTP status {v_res.status_code}",
                    }
                v_data = v_res.json()
                version = v_data.get("version", "unknown")

                # 2. Tags/model check
                tags_res = await client.get(f"{self.base_url}/api/tags")
                models = []
                if tags_res.status_code == 200:
                    data = tags_res.json()
                    models = [m.get("name") for m in data.get("models", []) if "name" in m]

                # Match model name or tag prefix
                is_installed = any(
                    m == self.model
                    or m.startswith(f"{self.model}:")
                    or (self.model.startswith("gemma4") and "gemma4" in m.lower())
                    for m in models
                )

                # Resolved model name to pass to Ollama
                resolved_model = self.model
                for m in models:
                    if m == self.model or m.startswith(f"{self.model}:") or (self.model.startswith("gemma4") and "gemma4" in m.lower()):
                        resolved_model = m
                        break

                return {
                    "ollama_running": True,
                    "ollama_version": version,
                    "gemma_model_installed": is_installed,
                    "gemma_model_name": resolved_model,
                    "available_models": models,
                    "message": f"Ollama v{version} is operational. Model '{resolved_model}' ready."
                    if is_installed
                    else f"Ollama is running, but model '{self.model}' is not pulled yet.",
                }

        except httpx.ConnectError:
            return {
                "ollama_running": False,
                "ollama_version": None,
                "gemma_model_installed": False,
                "gemma_model_name": self.model,
                "available_models": [],
                "message": f"Could not connect to Ollama at {self.base_url}. Ensure Ollama is running.",
            }
        except Exception as e:
            return {
                "ollama_running": False,
                "ollama_version": None,
                "gemma_model_installed": False,
                "gemma_model_name": self.model,
                "available_models": [],
                "message": f"Error inspecting Ollama: {str(e)}",
            }

    async def generate_content(
        self,
        topic: str,
        target_audience: str = "College students",
        content_purpose: str = "Educational",
        language: str = "English",
        tone: str = "Educational",
        platform: str = "YouTube",
        duration_seconds: int = 60,
        feedback: Optional[str] = None,
    ) -> GeneratedContentSchema:
        """Call Ollama /api/chat with Gemma 4 to generate a complete structured video script."""
        status = await self.check_status()
        if not status["ollama_running"]:
            raise RuntimeError(f"Ollama is not running at {self.base_url}. Please start Ollama.")

        # Determine exact model tag to call
        model_to_use = status.get("gemma_model_name") or self.model

        # Build prompt instructions tailored for language and platform
        lang_note = ""
        if language.lower() == "hindi":
            lang_note = "LANGUAGE REQUIREMENT: Generate title, hook, narration, scenes, caption, and description in authentic, natural HINDI (using Devanagari script)."
        elif language.lower() == "hinglish":
            lang_note = "LANGUAGE REQUIREMENT: Generate title, hook, narration, scenes, caption, and description in engaging HINGLISH (conversational Romanized Hindi + English blend widely used by Indian creators)."
        else:
            lang_note = "LANGUAGE REQUIREMENT: Generate content in clear, fluent ENGLISH."

        feedback_note = f"\nADDITIONAL USER EDIT INSTRUCTIONS: {feedback}\n" if feedback else ""

        system_prompt = (
            "You are CreatorFlow AI, an elite viral video producer and AI content strategist. "
            "You create captivating video scripts specifically engineered for AI avatars (like HeyGen) "
            "and social media audiences. "
            "You MUST respond ONLY with a single valid JSON object matching the requested schema. "
            "Do not include any conversational preamble, commentary, or markdown formatting outside the JSON."
        )

        user_prompt = f"""
Create a high-impact video script package for an AI avatar video.

SPECIFICATIONS:
- Topic: {topic}
- Target Audience: {target_audience}
- Goal/Purpose: {content_purpose}
- Language: {language}
- Tone: {tone}
- Target Platform: {platform}
- Target Duration: ~{duration_seconds} seconds
{lang_note}
{feedback_note}

You must return a JSON object with EXACTLY this structure:
{{
  "title": "A catchy, viral title (under 70 chars)",
  "hook": "A powerful 1-2 sentence opening hook that grabs attention within 3 seconds",
  "script": "The complete spoken narration for the presenter avatar. Speak directly to the viewer. Avoid stage directions in the script string.",
  "language": "{language}",
  "scenes": [
    {{
      "scene_number": 1,
      "description": "Visual direction for the scene, graphics, avatar gestures, or overlays",
      "narration": "What the presenter says during this scene"
    }},
    {{
      "scene_number": 2,
      "description": "Visual direction for scene 2",
      "narration": "Narration for scene 2"
    }},
    {{
      "scene_number": 3,
      "description": "Visual direction for scene 3",
      "narration": "Narration for scene 3"
    }}
  ],
  "caption": "Engaging social post caption with emojis suited for {platform}",
  "hashtags": ["3-5", "relevant", "hashtags", "without#symbol"],
  "description": "Detailed video description with context and key takeaways",
  "call_to_action": "Clear ending call-to-action (e.g., Follow for part 2, Share with friends, Comment your thoughts)"
}}

Provide 3 to 5 coherent scenes. The entire script must flow smoothly when spoken aloud by an AI avatar.
"""

        payload = {
            "model": model_to_use,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 1500,
            },
        }

        # 120 seconds timeout to accommodate 8GB RAM CPU/iGPU inference
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
            except httpx.ReadTimeout:
                raise TimeoutError("Ollama took more than 120 seconds to generate the script. Try a slightly shorter prompt.")
            except Exception as e:
                raise RuntimeError(f"Failed to communicate with Ollama: {str(e)}")

        if response.status_code != 200:
            raise RuntimeError(f"Ollama returned error status {response.status_code}: {response.text}")

        res_data = response.json()
        raw_content = res_data.get("message", {}).get("content", "").strip()

        # Clean JSON if wrapped in markdown code blocks
        clean_json_str = raw_content
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_content)
        if match:
            clean_json_str = match.group(1).strip()

        try:
            parsed = json.loads(clean_json_str)
        except json.JSONDecodeError as err:
            logger.error("Failed to parse JSON from Gemma: %s\nRaw output:\n%s", err, raw_content)
            # Fallback extraction: try to extract substring between first { and last }
            first_brace = clean_json_str.find("{")
            last_brace = clean_json_str.rfind("}")
            if first_brace != -1 and last_brace != -1:
                parsed = json.loads(clean_json_str[first_brace : last_brace + 1])
            else:
                raise ValueError(f"Gemma response could not be parsed as JSON: {err}")

        # Clean hashtags list if returned with leading '#'
        if "hashtags" in parsed and isinstance(parsed["hashtags"], list):
            parsed["hashtags"] = [h.lstrip("#").strip() for h in parsed["hashtags"] if h]

        # Pydantic validation
        return GeneratedContentSchema(**parsed)


# Global singleton instance
gemma_service = GemmaService()
