"""Main FastAPI application entry point for CreatorFlow AI."""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router
from app.database.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("creatorflow.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown procedures."""
    logger.info("Initializing database schemas...")
    init_db()
    logger.info("CreatorFlow AI backend ready.")
    yield
    logger.info("Shutting down CreatorFlow AI backend.")


app = FastAPI(
    title="CreatorFlow AI API",
    description="Intelligent AI content creation platform integrating local Gemma 4 and official HeyGen V3 API.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for local development and frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    }


if __name__ == "__main__":
    import uvicorn
    from app.core.config import HOST, PORT

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
