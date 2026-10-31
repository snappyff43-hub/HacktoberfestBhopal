# CreatorFlow AI 🎬✨

> **Intelligent AI Content Creation & Avatar Studio powered by Local Gemma 4, Google Gemini Flash & Official HeyGen V3 API.**

Built for the **AI Content Creation Using HeyGen** Hackathon.  
GitHub Repository: [github.com/snappyff43-hub/creatorflow-ai](https://github.com/snappyff43-hub/creatorflow-ai)

---

## 🌟 The Vision

CreatorFlow AI bridges local privacy-centric LLMs with state-of-the-art cloud video synthesis:
```
USER IDEA  ──>  LOCAL GEMMA 4 (Ollama)  ──>  STRUCTURED SCRIPT & HOOK  ──>  INTERACTIVE SCRIPT EDITOR
                                                                                    │
                                                                       ✨ GEMINI SCRIPT POLISH (Consent)
                                                                                    │
                                                                            USER APPROVAL
                                                                                    │
FINAL VIDEO PREVIEW & DOWNLOAD  <──  STATUS & PROGRESS POLLING  <──  HEYGEN V3 AVATAR VIDEO GENERATION
```

---

## 💎 Features
- **Neumorphic Studio Design:** Soft pearl-white (`#eef2f7`) palette, dual soft shadows, inset inputs, indigo & lavender accents.
- **Motion UI Micro-Interactions:** Smooth spring entrances, fluid micro-interactions, accessible design.
- **Local Gemma 4 Intelligence:** Powered offline by local Ollama (`gemma4:e2b-it-qat`), supporting English, native Devanagari Hindi, and Hinglish with zero cloud token cost.
- **Google Gemini Review Layer:** Automated 3-model resilience cascade (`gemini-flash-lite-latest` -> `gemini-2.5-flash-lite` -> `gemini-3.8-flash`) delivering sub-2-second script polish with interactive side-by-side diff previews.
- **Structured Content Generation:** Title, hook, full narration, scene-by-scene visual breakdowns, hashtags, social descriptions, and call to action.
- **Interactive Script Editor:** Real-time editing, word and speaking pace metrics, script regeneration with user feedback, and one-click copy.
- **Safety-First HeyGen V3 Integration:**
  - Real API key authentication with `GET /v3/users/me` credit inspection.
  - Avatar and voice catalog browsing (`GET /v3/avatars/looks`, `GET /v3/voices`).
  - Strict user-approval confirmation gate before submitting video generation tasks.
  - Transparent HTTP 402 handling with graceful High-Fidelity Demo Simulation fallback so hackathon judges can experience the full pipeline end-to-end even when workspace credits are exhausted.
- **Real Project & Video Persistence:** SQLite database tracks projects, scripts, job statuses, and URLs.

---

## 🏗️ Architecture

```
CreatorFlow-AI/
├── frontend/                     # React 19 + Vite + Tailwind CSS + Motion
│   ├── src/
│   │   ├── components/           # Navbar, ToastContainer, CreditSafetyModal
│   │   ├── context/              # Centralized AppContext state
│   │   ├── pages/                # Landing, Studio, Script Editor, Avatar Studio, Video Render, Library, Diagnostics
│   │   ├── services/             # Axios/fetch API client
│   │   └── index.css             # Full Neumorphic design system
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/                  # REST endpoints (/api/health, /api/ai/status, /api/content/generate, etc.)
│   │   ├── core/                 # Config & settings (.env)
│   │   ├── database/             # SQLAlchemy engine & SQLite session
│   │   ├── models/               # Tables: projects, generated_scripts, video_jobs, video_assets
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   └── services/             # gemma_service, gemini_service, heygen_service
│   └── requirements.txt
├── INTEGRATION_TEST_REPORT.md    # Complete 12-step integration test audit & results
├── PROJECT_STATUS.md             # Development tracking
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- [Ollama](https://ollama.ai) with `gemma4:e2b-it-qat` installed:
  ```bash
  ollama run gemma4:e2b-it-qat
  ```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Set HEYGEN_API_KEY and GEMINI_API_KEY in .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
Swagger API docs available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📋 Comprehensive Integration Audit Report
Read [`INTEGRATION_TEST_REPORT.md`](file:///d:/HeyGen/CreatorFlow-AI/INTEGRATION_TEST_REPORT.md) for full benchmark telemetry, response times, model fallback chains, and HeyGen V3 audit logs.
