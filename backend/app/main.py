"""Main FastAPI application entry point for CreatorFlow AI.

Features:
- Dual-mode AI Architecture: Local Gemma 4 (Ollama) & Cloud LLMs (NVIDIA NIM / Gemini Flash)
- Structured Request Logging with UUID Request Tracking & Performance Latency Metrics
- Official HeyGen V3 REST Integration & Credit Safety Gate
- Autopilot Social Distribution & Smart Approval Safety Gates
- Production-ready error handling & Sentry Monitoring Integration
"""

from contextlib import asynccontextmanager
from datetime import datetime
import json
import logging
import time
import uuid
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.endpoints import router
from app.core.config import ENVIRONMENT, HOST, PORT, SENTRY_DSN
from app.database.database import init_db

# Configure base structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
)
logger = logging.getLogger("creatorflow.main")

# Sentry Monitoring Initialization (Safe fallback when unconfigured)
sentry_active = False
if SENTRY_DSN and len(SENTRY_DSN.strip()) > 10:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration

        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=ENVIRONMENT,
            traces_sample_rate=1.0,
            integrations=[FastApiIntegration()],
        )
        sentry_active = True
        logger.info("Sentry error monitoring initialized successfully for env '%s'.", ENVIRONMENT)
    except ImportError:
        logger.warning("sentry-sdk package not installed. Sentry error tracking: NOT CONFIGURED.")
    except Exception as e:
        logger.warning("Failed to initialize Sentry: %s. Sentry error tracking: NOT CONFIGURED.", str(e))
else:
    logger.info("SENTRY_DSN is not configured. Sentry error tracking: NOT CONFIGURED.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown procedures."""
    logger.info("Starting CreatorFlow AI Backend. Initializing database schemas...")
    init_db()
    logger.info("CreatorFlow AI backend ready on %s:%s (env: %s).", HOST, PORT, ENVIRONMENT)
    yield
    logger.info("Shutting down CreatorFlow AI backend gracefully.")


app = FastAPI(
    title="CreatorFlow AI API",
    description="Intelligent AI content creation platform integrating local Gemma 4, cloud LLMs, and official HeyGen V3 API.",
    version="1.0.0",
    lifespan=lifespan,
)

class LoggingMiddleware:
    """Pure ASGI structured logging & telemetry middleware.
    
    Avoids BaseHTTPMiddleware thread/task-group deadlocks on Windows and attaches
    Request UUID and latency headers to all HTTP responses.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = str(uuid.uuid4())
        start = time.perf_counter()
        path = scope.get("path", "")
        method = scope.get("method", "")
        status_code = 200

        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
                headers = list(message.get("headers", []))
                headers.append((b"x-request-id", request_id.encode("latin1")))
                headers.append((b"x-response-time-ms", str(round((time.perf_counter() - start) * 1000, 2)).encode("latin1")))
                message["headers"] = headers
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.info(
                "[HTTP_REQUEST] req_id=%s method=%s path=%s status=%s duration_ms=%.2f",
                request_id,
                method,
                path,
                status_code,
                duration_ms,
            )


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)


# Register API routes
app.include_router(router)


@app.get("/")
async def root():
    """Root entry point with service metadata."""
    return {
        "service": "CreatorFlow AI API",
        "status": "operational",
        "docs_url": "/docs",
        "version": "1.0.0",
        "sentry_configured": sentry_active,
    }


@app.get("/health")
async def health_root():
    """Health probe for cloud orchestrators (Render, Railway, Docker, K8s)."""
    return {
        "status": "healthy",
        "service": "CreatorFlow AI Backend",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": ENVIRONMENT,
        "sentry_configured": sentry_active,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
