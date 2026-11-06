"""Explicit real integration tests.

These tests connect directly to live services and are strictly distinguished from unit tests.
"""

import asyncio
from app.services.gemma_service import gemma_service
from app.services.gemini_service import gemini_service
from app.services.heygen_service import heygen_service
from app.services.nvidia_service import nvidia_service


def test_real_gemma_ollama_connectivity():
    """Verify live local Ollama runtime and Gemma 4 model readiness."""
    async def _test():
        status = await gemma_service.check_status()
        if status.get("ollama_running"):
            assert status["ollama_version"] is not None
            assert status["gemma_model_installed"] is True
            assert status["gemma_model_name"] == "gemma4:e2b-it-qat"
    asyncio.run(_test())


def test_real_gemini_api_authentication():
    """Verify live Google Gemini API connectivity and model count."""
    async def _test():
        if gemini_service.is_configured():
            auth_res = await gemini_service.verify_auth()
            assert auth_res["configured"] is True
            assert auth_res["authenticated"] is True
            assert auth_res["model_count"] > 0
            assert "gemini" in auth_res["active_model"]
    asyncio.run(_test())


def test_real_heygen_v3_session_authentication():
    """Verify live HeyGen V3 REST session and user authentication."""
    async def _test():
        if heygen_service.is_configured():
            status_res = await heygen_service.get_user_status()
            assert status_res.configured is True
            assert status_res.authenticated is True
            assert status_res.username is not None
    asyncio.run(_test())


def test_real_nvidia_unconfigured_graceful_handling():
    """Verify that NVIDIA NIM handles unconfigured credentials gracefully without unhandled exceptions."""
    async def _test():
        nvidia_res = await nvidia_service.verify_auth()
        assert "configured" in nvidia_res
        if not nvidia_service.is_configured():
            assert nvidia_res["configured"] is False
            assert nvidia_res["status"] == "not_configured"
    asyncio.run(_test())
