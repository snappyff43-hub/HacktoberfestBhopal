# CreatorFlow AI — 3–5 Minute Hackathon Demo Guide

> **Concise, judge-focused presentation walkthrough highlighting real innovations.**

---

## Quick Demo Checklist (< 60s Preparation)
1. **Backend Server:** `cd backend && python -m uvicorn app.main:app --port 8000`
2. **Frontend UI:** `cd frontend && npm run dev` ➔ `http://localhost:5173`
3. **Local AI Engine:** `ollama serve` (with `gemma4:e2b-it-qat`)
4. **Browser:** Open `http://localhost:5173`

---

## 3–5 Minute Presentation Flow

### Minute 0:00 – 0:45: The Problem & The Vision (Landing Page)
- **Visual:** Open `http://localhost:5173` showcasing the pearl-white Neumorphic studio.
- **Narrative:**  
  *"Content creators face a fragmented nightmare: writing scripts on ChatGPT, pasting into grammar tools, adapting text for 4 different platforms, opening HeyGen for avatars, and juggling spreadsheets for scheduling. CreatorFlow AI unites the entire workflow into a single privacy-first platform: One Idea ➔ AI Script ➔ Cloud Polish ➔ Multi-Platform Content ➔ HeyGen Video ➔ Smart Autopilot."*

### Minute 0:45 – 1:30: Local Gemma 4 Zero-Cost Generation (Studio)
- **Visual:** Navigate to `/studio`. Enter topic: `"Quantum Computing Explained in 60 Seconds"`, Tone: `Punchy`, Language: `English` (or `Hinglish`), Platform: `YouTube Shorts`. Click **"Generate Script"**.
- **Narrative:**  
  *"Notice our hybrid AI approach: the initial script draft is powered locally by Gemma 4 on Ollama. It costs zero API tokens, runs 100% privately, and extracts structured 3-second hooks, narration beats, and visual scene cues."*

### Minute 1:30 – 2:30: Script Editor & Cloud AI Refinement (Script Director)
- **Visual:** Script loads into `/script`. Show real-time word counter and speaking pace gauge. Click **"Polish with Cloud AI"**.
- **Narrative:**  
  *"Creators stay in complete control. If we want cloud-scale refinement, we click Polish. Our backend calls NVIDIA NIM (Llama 3.3 70B) or Google Gemini Flash. We inspect the side-by-side diff: original Gemma on the left, cloud polish on the right. We click 'Accept Polish' with full human consent."*

### Minute 2:30 – 3:30: HeyGen V3 Avatar Casting & Video Synthesis (Avatar Studio)
- **Visual:** Click **"Send to Avatar Studio"** (`/avatar`). Browse live HeyGen avatars (Angela, Wayne) and high-fidelity voices. Click **"Generate Avatar Video"**. Show the **Credit Safety Modal**.
- **Narrative:**  
  *"We integrate the official HeyGen V3 REST API. We browse real avatars and synthetic voices. Because video synthesis consumes paid credits, our Credit Safety Gate requires explicit confirmation before submitting tasks. If credits are exhausted during evaluation, our High-Fidelity Demo Simulation kicks in seamlessly so judges never hit a broken screen."*

### Minute 3:30 – 4:30: Autopilot Scheduling & Multi-Platform Packaging (Calendar)
- **Visual:** Open `/calendar`. Show upcoming slots, topic backlog, and one-click smart approval.
- **Narrative:**  
  *"Finally, the Autopilot engine detects empty schedule slots across the creator's preferred days, prepares scripts in advance, and waits for a single-click approval. One single idea generates YouTube Shorts, Instagram Reels, LinkedIn posts, and an AI avatar video."*

### Minute 4:30 – 5:00: Diagnostics & Live Health Verification
- **Visual:** Open `/diagnostics`. Show live status badges for FastAPI, Gemma Ollama, NVIDIA NIM, Gemini, and HeyGen V3.
- **Narrative:**  
  *"Everything is audited and verified. All backend tests pass, secrets are protected, and the system is production-ready."*
