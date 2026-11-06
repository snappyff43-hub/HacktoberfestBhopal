# CreatorFlow AI — Hackathon Demo Script

> **Event:** MLH Hackathon 2026  
> **Duration:** ~8–10 minutes  
> **Presenter Notes:** Steps marked ⚡ are live; steps marked 🎭 use demo mode/pre-recorded output

---

## Setup Before Demo

- [ ] Backend running: `uvicorn app.main:app --reload --port 8000`
- [ ] Frontend running: `npm run dev` → http://localhost:5173
- [ ] Ollama running: `ollama serve` (gemma4:e2b-it-qat loaded)
- [ ] Browser open on http://localhost:5173
- [ ] `.env` loaded with Gemini API key (NVIDIA optional)
- [ ] HeyGen credits insufficient — **demo mode will activate automatically**

---

## Step 1 — Open CreatorFlow AI

**Action:** Navigate to http://localhost:5173

**Say:**
> "CreatorFlow AI is a single platform that takes a creator's idea and turns it into a ready-to-publish short-form video — with AI script generation, multi-platform formatting, avatar-based video creation, and an autopilot publishing scheduler."

**Show:** Landing page with neumorphic UI, dark theme, system status cards.

---

## Step 2 — Check System Status (Diagnostics)

**Action:** Click **Diagnostics** in the navbar.

**Say:**
> "Before we begin, we can see all AI providers in one place. Gemma is running locally via Ollama, Gemini is authenticated, and the system is healthy. NVIDIA NIM would appear here once an API key is configured."

**Show:** Engine cards — Gemma (green), Gemini (green), HeyGen (amber/authenticated), NVIDIA (unconfigured/grey).

> [!NOTE]
> Presenter: If NVIDIA_API_KEY is set, the NVIDIA card will show green. If not, "Not Configured" is expected and correct.

---

## Step 3 — Enter a Content Idea

**Action:** Click **Studio** → Content Studio form.

**Say:**
> "I'll enter a simple content idea. Let's say we're creating educational tech content in Hindi."

**Input:**
- **Idea:** `"Top 5 ways AI is changing software development in 2026"`
- **Target Platform:** YouTube Shorts
- **Language:** Hindi
- **Tone:** Enthusiastic, educational

---

## Step 4 — Generate Script with Local Gemma 4 ⚡

**Action:** Click **Generate Script**.

**Say:**
> "This uses Gemma 4 running *entirely on the local machine* via Ollama — no data leaves this laptop. Watch the generation happen in real time."

**Wait:** ~30–90 seconds for Gemma to complete.

**Show:** Script appearing in the editor.

> [!NOTE]
> Presenter: If Gemma is slow, narrate while waiting: "Gemma 4 is a 27B-parameter multimodal model — running locally, it takes a moment. In production, NVIDIA NIM delivers the same quality at cloud speed."

---

## Step 5 — Open Script Editor

**Action:** Click **Script Editor** in the navbar.

**Say:**
> "The Script Editor gives us full control. We can see the raw generated script and choose to refine it with a cloud AI before finalizing."

**Show:** Script text, word count, export button.

---

## Step 6 — Refine with Cloud AI (Gemini) ⚡

**Action:** Click **Improve with AI** (Gemini refinement button).

**Say:**
> "Now we send the script to Google Gemini for professional refinement — better hooks, clearer structure, stronger call-to-action. Gemini is our cloud fallback when NVIDIA NIM isn't configured."

**Show:** Improved script returned with timing.

---

## Step 7 — Generate 4-Way Platform Variants ⚡

**Action:** Click **Generate Platform Variants**.

**Say:**
> "With one click, we generate four platform-optimized versions of the same content. Each format respects the platform's unique content rules."

**Show:** Tab UI with:
- **YouTube Shorts** — hook + 3 points + CTA, ~60s
- **Instagram Reels** — punchy opener, trending hashtags
- **YouTube Shorts** (alternate) — visual cues, scroll-stopping headline
- **LinkedIn** — professional framing, industry insights

**Say:**
> "No more manually rewriting for each platform. The creator picks the variant they like, applies it, and moves on."

---

## Step 8 — Avatar & Voice Selection

**Action:** Click **Avatar & Voice** in the navbar.

**Say:**
> "CreatorFlow integrates with HeyGen's avatar library. The creator can choose a digital presenter that matches their brand."

**Show:** Avatar grid loaded from HeyGen API.

---

## Step 9 — Video Generation (HeyGen Status) 🎭

**Action:** Click **Generate Video**.

**Say:**
> "We trigger the video render through HeyGen's API. In a fully funded account, this produces a broadcast-quality video in minutes. Today, our test account has run out of render credits — which HeyGen returns as a 402 response."

**Show:** The app catches the 402, displays an amber "Insufficient Credits" badge, and automatically activates demo mode.

**Say:**
> "CreatorFlow handles this gracefully. It falls back to a clearly labeled sample video so the demo can continue uninterrupted."

> [!IMPORTANT]
> The demo video shown is **clearly labeled** as "DEMO MODE — Sample Output" in the UI. It is not a real generated video.

---

## Step 10 — Video Library

**Action:** Click **Video Library** in the navbar.

**Say:**
> "Every project is saved to the Video Library with its current status — draft, processing, completed, or failed. Creators can track all their content in one place."

**Show:** Video job entry with status badge, project title, created date.

---

## Step 11 — Save Project

**Action:** Click **Save Project** (if not auto-saved).

**Show:** Confirmation toast, project appears in library.

---

## Step 12 — Calendar & Smart Scheduling ⚡

**Action:** Click **Calendar** in the navbar.

**Say:**
> "This is the Autopilot Scheduler. Creators set their publishing preferences once — cadence, preferred platforms, blackout dates when they're unavailable — and the system plans their entire content calendar."

**Show:** Calendar page with empty schedule queue.

**Action:** Click **+ Add Blackout Date** → add tomorrow's date.

**Say:**
> "If I'm traveling tomorrow, I mark it as unavailable. The autopilot respects that."

---

## Step 13 — Run Autopilot Planner ⚡

**Action:** Click **Plan Weekly Schedule** (Autopilot plan button).

**Say:**
> "The planner evaluates the topic backlog, checks blackout dates, applies the cadence preference, and generates an optimized weekly schedule — skipping unavailable days automatically."

**Show:** Scheduled posts appear in the queue with Smart Approval badges.

**Say:**
> "Smart Approval mode means the AI plans and queues posts, but a human must approve each one before it publishes. This is the default — creators stay in control."

**Action:** Click **Simulate Publish** on one scheduled post.

**Show:** Approval required dialog if in Smart Approval mode, or publish confirmation in Autopilot mode.

> [!NOTE]
> No real social media content is published during this demo. Simulate Publish is a safe test action.

---

## Step 14 — Architecture Summary

**Say:**
> "Let me quickly show the architecture that makes this possible."

**Show (slide or diagram):**
```
Creator's Idea
    ↓
Gemma 4 (local, private)  →  Script Draft
    ↓
Gemini / NVIDIA NIM       →  Refined Script + Platform Variants
    ↓
HeyGen API                →  Avatar Video
    ↓
Autopilot Scheduler       →  Smart Publishing Queue
    ↓
Creator's Audience
```

**Highlight:**
- Local AI (Gemma) keeps drafts private
- Cloud AI (NVIDIA/Gemini) provides scale and quality
- HeyGen delivers professional video without a studio
- Autopilot reduces publishing effort to near-zero

---

## Closing

**Say:**
> "CreatorFlow AI is built for the next generation of creators — people who want to produce professional, multi-platform video content consistently, without burning out. It's local-first for privacy, cloud-ready for scale, and AI-native from idea to publish."

**Stack callout:**
- 🧠 Gemma 4 via Ollama (local LLM)
- ⚡ NVIDIA NIM / Google Gemini (cloud AI)
- 🎥 HeyGen API (avatar video)
- 🚀 FastAPI + React + SQLite/PostgreSQL
- 📅 Autopilot scheduling engine

---

## Troubleshooting During Demo

| Issue | Recovery |
|-------|----------|
| Gemma slow to respond | Say: "Local inference — we'd use NVIDIA NIM in production for ~10× speed" |
| HeyGen 402 | Expected — demo mode activates automatically, clearly labeled |
| Gemini API error | Check `.env` has valid `GEMINI_API_KEY` |
| Backend not reachable | Restart: `uvicorn app.main:app --reload --port 8000` |
| Ollama not running | Run: `ollama serve` in a separate terminal |
| Calendar page blank | Backend must be running; check `/api/schedule` endpoint |

---

## What's Not Shown (MVP Boundaries)

| Feature | Status | Notes |
|---------|--------|-------|
| Real social media publishing | Not integrated | Would require OAuth per platform |
| NVIDIA NIM generation | Not configured (no key) | Graceful fallback to Gemini |
| HeyGen real render | 402 — insufficient credits | Demo mode fallback shown |
| Supabase storage | Config ready | Not connected in demo |
| Multi-user auth | Not implemented | Single-user MVP scope |

