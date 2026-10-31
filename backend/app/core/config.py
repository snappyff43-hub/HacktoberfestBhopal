"""Configuration settings for CreatorFlow AI backend."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory or project root if present
backend_dir = Path(__file__).resolve().parent.parent.parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    load_dotenv()

# HeyGen V3 Configuration
HEYGEN_API_KEY = os.environ.get("HEYGEN_API_KEY", "").strip()
HEYGEN_BASE_URL = os.environ.get("HEYGEN_BASE_URL", "https://api.heygen.com").rstrip("/")

# Ollama & Gemma 4 Configuration
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma4:e2b-it-qat").strip()

# Database Configuration
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./creatorflow.db")

# Server Configuration
PORT = int(os.environ.get("PORT", 8000))
HOST = os.environ.get("HOST", "127.0.0.1")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
