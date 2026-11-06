# CreatorFlow AI — Deployment Guide

> Last updated: 2026-10-31  
> Authored during Phase 9 QA hardening

---

## Architecture Overview

```
LOCAL DEVELOPMENT
  React (Vite dev, port 5173)
    └─► FastAPI (uvicorn, port 8000)
          ├─► Ollama (localhost:11434) ─► gemma4:e2b-it-qat
          ├─► Gemini API (cloud)
          └─► SQLite (creatorflow.db)

CLOUD PRODUCTION
  Vercel (CDN, React SPA)
    └─► Render / Railway (FastAPI)
          ├─► NVIDIA NIM API (cloud AI)
          ├─► Gemini API (fallback)
          ├─► HeyGen API (video)
          └─► Supabase PostgreSQL
```

> [!IMPORTANT]
> A cloud-hosted backend **cannot** reach `http://localhost:11434`.
> Never point production `OLLAMA_BASE_URL` to localhost.
> NVIDIA NIM or Gemini replaces Ollama in cloud deployments.

---

## Local Development Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | ≥ 3.11 | Backend runtime |
| Node.js | ≥ 18 | Frontend build |
| Ollama | ≥ 0.40 | Local LLM runtime |
| Git | any | Version control |

### 1. Clone & Install

```bash
git clone https://github.com/snappyff43-hub/creatorflow-ai.git
cd creatorflow-ai

# Backend
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your actual credentials (see table below)
```

**Required `.env` variables (local):**

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `sqlite:///./creatorflow.db` | SQLite for local dev |
| `HEYGEN_API_KEY` | `your_heygen_key` | From HeyGen dashboard |
| `GEMINI_API_KEY` | `your_gemini_key` | Google AI Studio |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Local Ollama only |
| `OLLAMA_MODEL` | `gemma4:e2b-it-qat` | Pull via `ollama pull` |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Frontend dev URL |

**Optional for local:**

| Variable | Notes |
|----------|-------|
| `NVIDIA_API_KEY` | NVIDIA NIM — can be left empty locally |
| `SENTRY_DSN` | Error tracking — skip if not configured |

### 3. Pull Ollama Model

```bash
ollama pull gemma4:e2b-it-qat
# Verify:
ollama list
```

### 4. Run Local Stack

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate    # or source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Opens at http://localhost:5173
```

### 5. Verify Local Stack

```bash
# Health check
curl http://localhost:8000/health

# API root
curl http://localhost:8000/

# Run full test suite (unit + security + integration)
cd backend
python -m pytest tests/ -v
```

---

## Cloud Production Deployment

### Frontend → Vercel

#### Automatic (GitHub integration)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `snappyff43-hub/creatorflow-ai`
3. Set **Root Directory** → `frontend`
4. Set **Framework Preset** → Vite
5. Add environment variable:
   - `VITE_API_BASE_URL` → your Render backend URL (e.g. `https://creatorflow-api.onrender.com`)
6. Deploy

#### Manual (Vercel CLI)

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

> [!NOTE]
> `frontend/vercel.json` already includes SPA catch-all routing and `/api/*` proxy rewrites.
> Update the `destination` URL in `vercel.json` to match your actual Render service URL before deploying.

---

### Backend → Render

#### Setup Steps

1. Go to [dashboard.render.com/new/web-service](https://dashboard.render.com/new/web-service)
2. Connect `snappyff43-hub/creatorflow-ai`
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Required Environment Variables on Render

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` (Supabase) |
| `HEYGEN_API_KEY` | Your HeyGen API key |
| `GEMINI_API_KEY` | Your Gemini API key |
| `NVIDIA_API_KEY` | Your NVIDIA NIM API key |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | `nvidia/llama-3.1-nemotron-ultra-253b-v1` |
| `ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app` |
| `OLLAMA_BASE_URL` | *Leave empty — not available in cloud* |

> [!CAUTION]
> **Never set `OLLAMA_BASE_URL` to `http://localhost:11434` in a cloud environment.**
> The cloud server has no access to your laptop. Leave it blank or unset.

#### Using `render.yaml` (Blueprint)

The file `backend/render.yaml` provides an Infrastructure-as-Code definition.
Render will auto-detect it if placed in the repository root, or you can deploy it manually via the Render Dashboard → Blueprints.

---

### Database → Supabase PostgreSQL

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection String** → copy the URI
3. Set `DATABASE_URL` in your Render environment variables
4. On first deploy, tables are auto-created by SQLAlchemy (`create_all`)
5. To use Supabase Storage for video files, set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

> [!NOTE]
> SQLAlchemy automatically normalizes `postgres://` → `postgresql://` for compatibility.

---

## AI Provider Configuration

### Local Development

| Provider | Config | Notes |
|----------|--------|-------|
| Gemma (Ollama) | `OLLAMA_BASE_URL=http://localhost:11434` | Pull model first |
| Gemini | `GEMINI_API_KEY=...` | Cloud fallback |
| NVIDIA NIM | Optional | Set key if available |

### Cloud Production

| Provider | Config | Notes |
|----------|--------|-------|
| NVIDIA NIM | `NVIDIA_API_KEY=...` | Primary cloud AI |
| Gemini | `GEMINI_API_KEY=...` | Fallback if NVIDIA fails |
| Ollama/Gemma | Not available | Laptop-only |

**Priority cascade (cloud):**
```
User request
  → NVIDIA NIM (if NVIDIA_API_KEY set)
  → Gemini API (if GEMINI_API_KEY set)
  → Error: no AI provider configured
```

---

## CI/CD Pipeline

GitHub Actions at `.github/workflows/ci.yml` runs on every push and PR to `main`:

1. **Backend tests** — pytest unit + security tests
2. **Frontend build** — `npm ci && npm run build`

> [!NOTE]
> Integration tests (Ollama, real Gemini, HeyGen) are excluded from CI to avoid requiring live credentials in GitHub Secrets.

To add real integration tests to CI, add secrets:
- `GEMINI_API_KEY` → GitHub repo Settings → Secrets
- Uncomment `test_real_integrations.py` in `ci.yml`

---

## Security Checklist

- [x] `.env` is in `.gitignore` — never committed
- [x] `.env.example` contains only placeholder values
- [x] All API keys are backend-only (not exposed to frontend)
- [x] CORS allows only configured origins
- [x] Input validated via Pydantic (422 on bad requests)
- [x] Request size limits via FastAPI defaults
- [x] Secrets are passed via HTTP headers, not URL query params
- [x] Sentry (when configured) captures errors without logging secrets
- [x] HeyGen paid render requires explicit user approval (402 guard)
- [x] Autopilot duplicate-publish prevention implemented

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `sqlite3.OperationalError: no such column` | Run schema migration script in `backend/` |
| `ModuleNotFoundError: fastapi` | Activate venv before running uvicorn |
| `CORS error in browser` | Add frontend URL to `ALLOWED_ORIGINS` in `.env` |
| `Connection refused :11434` | Start Ollama: `ollama serve` |
| `HeyGen 402 insufficient_credit` | Top up HeyGen credits or use demo mode |
| `NVIDIA_API_KEY not configured` | App falls back to Gemini automatically |
| `postgres:// scheme error` | Updated config normalizes this — restart backend |

