"""Official NVIDIA NIM Cloud API service for CreatorFlow AI.

Adheres strictly to NVIDIA Cloud LLM API specification:
https://docs.api.nvidia.com/nim/reference/llm-apis
Endpoint: https://integrate.api.nvidia.com/v1/chat/completions
"""

import json
import logging
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL
from app.schemas.project import GeneratedContentSchema, SceneSchema

logger = logging.getLogger("creatorflow.nvidia")

# Verified popular models on NVIDIA NIM API catalog
CANDIDATE_NVIDIA_MODELS = [
    "meta/llama-3.3-70b-instruct",
    "meta/llama-3.1-70b-instruct",
    "mistralai/mistral-large-2-instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "qwen/qwen2.5-72b-instruct",
]


class NvidiaService:
    """NVIDIA NIM LLM Cloud API Integration."""

    def __init__(
        self,
        api_key: str = NVIDIA_API_KEY,
        base_url: str = NVIDIA_BASE_URL,
        default_model: str = NVIDIA_MODEL,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    def is_configured(self) -> bool:
        """Return True if NVIDIA_API_KEY is configured."""
        return bool(self.api_key and len(self.api_key) > 5)

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def verify_auth(self) -> Dict[str, Any]:
        """Verify API key and fetch active models from GET /models."""
        if not self.is_configured():
            return {
                "configured": False,
                "status": "not_configured",
                "message": "NVIDIA API Key is not set in environment (NVIDIA_API_KEY).",
                "active_model": self.default_model,
                "available_models": [],
            }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    f"{self.base_url}/models",
                    headers=self._headers(),
                )

            if res.status_code == 200:
                data = res.json()
                models = [m.get("id") for m in data.get("data", []) if "id" in m]
                # Check if default_model is in the list, otherwise pick first suitable
                chosen = self.default_model
                if chosen not in models and models:
                    for cand in CANDIDATE_NVIDIA_MODELS:
                        if cand in models:
                            chosen = cand
                            break
                    if chosen not in models:
                        chosen = models[0]

                return {
                    "configured": True,
                    "status": "connected",
                    "provider": "NVIDIA Cloud NIM",
                    "active_model": chosen,
                    "total_models": len(models),
                    "message": "NVIDIA NIM API authenticated successfully.",
                }
            elif res.status_code == 401:
                return {
                    "configured": True,
                    "status": "unauthorized",
                    "message": "NVIDIA API Key is invalid or expired (HTTP 401).",
                    "active_model": self.default_model,
                }
            else:
                return {
                    "configured": True,
                    "status": "error",
                    "message": f"NVIDIA API returned HTTP {res.status_code}: {res.text[:150]}",
                    "active_model": self.default_model,
                }
        except Exception as e:
            return {
                "configured": True,
                "status": "error",
                "message": f"Failed to connect to NVIDIA API: {str(e)}",
                "active_model": self.default_model,
            }

    async def improve_script(
        self,
        base_script: GeneratedContentSchema,
        instructions: Optional[str] = None,
        model_name: Optional[str] = None,
    ) -> GeneratedContentSchema:
        """Improve and refine an existing script using NVIDIA NIM Cloud LLM."""
        if not self.is_configured():
            raise RuntimeError("NVIDIA API Key is not configured in backend environment.")

        target_model = model_name or self.default_model

        user_instructions = instructions or (
            "Elevate this script for maximum viewer retention. "
            "Make the hook irresistible, sharpen storytelling, ensure authentic language flow, "
            "and create tight, visual scene cues for HeyGen avatar delivery."
        )

        prompt = f"""You are a world-class YouTube and viral short-form video director.
Improve and refine the following video script based on the creator's instructions.

[CREATOR DIRECTIVE]:
{user_instructions}

[CURRENT SCRIPT TO ENHANCE]:
Title: {base_script.title}
Hook: {base_script.hook}
Language: {base_script.language}
Script: {base_script.script}
Scenes: {json.dumps([s.model_dump() for s in base_script.scenes], ensure_ascii=False)}
Caption: {base_script.caption}
Hashtags: {json.dumps(base_script.hashtags)}
Call To Action: {base_script.call_to_action}

IMPORTANT RULES:
1. Preserve the requested language ({base_script.language}). If Hindi, use authentic Devanagari or natural Hinglish.
2. Return ONLY a single raw valid JSON object. No markdown fences, no explanatory preambles.
3. The JSON structure MUST match:
{{
  "title": "Improved punchy title",
  "hook": "Strong opening hook for first 3 seconds",
  "script": "Full refined narrative text spoken by the avatar",
  "language": "{base_script.language}",
  "scenes": [
    {{
      "scene_number": 1,
      "description": "Visual camera/avatar instruction",
      "narration": "Line spoken in this scene"
    }}
  ],
  "caption": "Social media caption with emoji",
  "hashtags": ["tag1", "tag2", "tag3"],
  "description": "Video description",
  "call_to_action": "Inspiring closing call to action"
}}
"""

        messages = [
            {"role": "system", "content": "You are an elite video scriptwriter. Output strictly valid JSON."},
            {"role": "user", "content": prompt},
        ]

        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": 0.4,
            "max_tokens": 1500,
        }

        async with httpx.AsyncClient(timeout=35.0) as client:
            res = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=payload,
            )

        if res.status_code != 200:
            raise RuntimeError(f"NVIDIA API Error ({res.status_code}): {res.text[:200]}")

        res_data = res.json()
        raw_text = res_data["choices"][0]["message"]["content"].strip()

        # Parse JSON
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        try:
            parsed = json.loads(raw_text)
            scenes_data = [
                SceneSchema(
                    scene_number=s.get("scene_number", idx + 1),
                    description=s.get("description", "Avatar delivers message with authority"),
                    narration=s.get("narration", ""),
                )
                for idx, s in enumerate(parsed.get("scenes", []))
            ]

            return GeneratedContentSchema(
                title=parsed.get("title", base_script.title),
                hook=parsed.get("hook", base_script.hook),
                script=parsed.get("script", base_script.script),
                language=parsed.get("language", base_script.language),
                scenes=scenes_data or base_script.scenes,
                caption=parsed.get("caption", base_script.caption),
                hashtags=parsed.get("hashtags", base_script.hashtags),
                description=parsed.get("description", base_script.description),
                call_to_action=parsed.get("call_to_action", base_script.call_to_action),
            )
        except Exception as e:
            logger.error("Failed to parse NVIDIA response as JSON: %s. Raw: %s", e, raw_text[:200])
            raise RuntimeError(f"NVIDIA response JSON parse error: {str(e)}")

    async def generate_platform_variants(
        self,
        base_script: GeneratedContentSchema,
        topic: str,
    ) -> Dict[str, Any]:
        """Adapt one core script into 4 platform-tailored formats:

        1. YouTube Landscape (in-depth, 60-90s)
        2. Instagram Reel (visual trend, 30s)
        3. YouTube Shorts (high retention loop, 15-30s)
        4. LinkedIn Thought Leadership (professional text + 1:1 video).
        """
        if not self.is_configured():
            raise RuntimeError("NVIDIA API Key is not configured in backend environment.")

        prompt = f"""You are a multi-platform content strategist.
Adapt this core video concept into 4 distinct, platform-optimized formats.
Do NOT just duplicate the same text; each format must match the platform's native psychology, duration, and hook mechanics.

Topic: {topic}
Original Script: {base_script.script}
Language: {base_script.language}

OUTPUT FORMAT: Return ONLY valid JSON with keys:
{{
  "youtube_long": {{
    "format_name": "YouTube Landscape (16:9)",
    "target_duration": "60-90s",
    "hook": "Educational curiosity hook",
    "narration": "Detailed 3-part breakdown with clear insights",
    "call_to_action": "Subscribe and comment prompt"
  }},
  "instagram_reel": {{
    "format_name": "Instagram Reel (9:16)",
    "target_duration": "30s",
    "hook": "Relatable pattern interrupt",
    "narration": "Fast, high-energy 30-second script with visual callouts",
    "call_to_action": "Save this reel for later"
  }},
  "youtube_shorts": {{
    "format_name": "YouTube Shorts (9:16)",
    "target_duration": "20s",
    "hook": "Urgent, surprising question",
    "narration": "Snappy micro-script designed to loop smoothly",
    "call_to_action": "Check description for details"
  }},
  "linkedin_post": {{
    "format_name": "LinkedIn Thought Leadership (1:1)",
    "target_duration": "45s",
    "hook": "Professional industry perspective",
    "narration": "Actionable business/career takeaway",
    "call_to_action": "What is your experience? Comment below"
  }}
}}
"""

        messages = [
            {"role": "system", "content": "You are an elite social media content strategist. Output strictly valid JSON."},
            {"role": "user", "content": prompt},
        ]

        payload = {
            "model": self.default_model,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 1600,
        }

        async with httpx.AsyncClient(timeout=35.0) as client:
            res = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=payload,
            )

        if res.status_code != 200:
            raise RuntimeError(f"NVIDIA API Error ({res.status_code}): {res.text[:200]}")

        raw_text = res.json()["choices"][0]["message"]["content"].strip()
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        return json.loads(raw_text)


# Singleton
nvidia_service = NvidiaService()
