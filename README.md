# CreatorFlow AI 🎬✨

> **Intelligent AI Content Creation & Avatar Studio powered by Local Gemma 4 & Official HeyGen V3 API.**

Built for the **AI Content Creation Using HeyGen** Hackathon.

---

## 🌟 The Vision

CreatorFlow AI bridges local privacy-centric LLMs with state-of-the-art cloud video synthesis:
```
USER IDEA  ──>  LOCAL GEMMA 4 (Ollama)  ──>  STRUCTURED SCRIPT & HOOK  ──>  INTERACTIVE SCRIPT EDITOR
                                                                                    │
                                                                           USER APPROVAL
                                                                                    │
FINAL VIDEO PREVIEW & DOWNLOAD  <──  STATUS & PROGRESS POLLING  <──  HEYGEN V3 AVATAR VIDEO GENERATION
```

## 💎 Features
- **Neumorphic Studio Design:** Soft pearl-white and light-gray palette, dual soft shadows, inset inputs, indigo & lavender accents.
- **Motion UI Animations:** Smooth spring entrances, fluid micro-interactions, and accessible motion controls via `motion/react`.
- **Local Gemma 4 Intelligence:** Powered offline by local Ollama (`gemma4:e2b-it-qat`), supporting English, Hindi (Devanagari), and Hinglish.
- **Structured Content Generation:** Title, hook, full narration, scene-by-scene breakdown, hashtags, description, and call to action.
- **Interactive Script Editor:** Real-time editing, script regeneration with user feedback, and one-click copy.
- **Safety-First HeyGen V3 Integration:**
  - Real API key authentication with `GET /v3/users/me` credit inspection.
  - Avatar and voice catalog browsing (`GET /v3/avatars/looks`, `GET /v3/voices`).
  - Strict user-approval confirmation gate before submitting video generation tasks.
  - Seamless, labeled Demo Mode fallback when API keys or credits are unconfigured.
- **Real Project & Video Persistence:** SQLite database tracks projects, scripts, job statuses, and URLs.

---

## 🏗️ Architecture

```
CreatorFlow-AI/
├── frontend/                     # React 19 + Vite + Tailwind + Motion
│   ├── src/
│   │   ├── components/           # Neumorphic UI design system
│   │   ├── pages/                # Landing, Dashboard, Studio, Editor, Avatar, Library, Settings
│   │   ├── services/             # API client services
│   │   └── styles/               # Neumorphic CSS design tokens
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/                  # REST endpoints
│   │   ├── core/                 # Config & settings
│   │   ├── database/             # SQLAlchemy engine & session
│   │   ├── models/               # Database tables
│   │   ├── schemas/              # Pydantic validation
│   │   └── services/             # Gemma (Ollama) & HeyGen V3 services
│   └── requirements.txt
├── docs/                         # Architecture documentation
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
# Optional: Set HEYGEN_API_KEY in .env

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
