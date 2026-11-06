# CreatorFlow AI — HeyGen V3 Official API Integration

> **Production specification of synthetic video generation, avatar casting, credit inspection, and resilience mechanisms.**

---

## 1. Overview & Architecture

CreatorFlow AI integrates directly with the **official HeyGen V3 REST API** (`https://api.heygen.com`). Synthetic video generation is an expensive, compute-heavy operation. Consequently, CreatorFlow AI implements a **hardened, security-conscious wrapper** (`backend/app/services/heygen_service.py`) featuring:
1. Server-side only API key storage (zero key exposure to browser).
2. Pre-flight credit quota inspection.
3. Explicit human consent gate before job submission.
4. Intelligent polling loop with exponential backoff.
5. High-fidelity demo simulation fallback for HTTP 402 payment errors.

---

## 2. API Endpoints & Request Lifecycles

### 2.1 User & Credit Inspection
- **Endpoint:** `GET /v3/users/me`
- **Headers:** `x-api-key: <HEYGEN_API_KEY>`
- **Response Handling:**
  ```json
  {
    "code": 100,
    "data": {
      "user_id": "usr_...",
      "username": "creatorflow",
      "credit_balance": 0.0,
      "plan": "free"
    }
  }
  ```
- **Operational Logic:** The backend interrogates the user's available balance. If the balance is zero or below the generation threshold, the frontend displays an informative banner and arms the **High-Fidelity Demo Simulation** fallback.

### 2.2 Avatar Look Catalog
- **Endpoint:** `GET /v3/avatars`
- **Response Handling:** Retrieves photorealistic avatar models with thumbnail URLs, gender classification, and style tags (Studio, Casual, Corporate).

### 2.3 Synthetic Voice Catalog
- **Endpoint:** `GET /v3/voices`
- **Response Handling:** Retrieves high-fidelity AI voices filtered by language (English, Hindi), accent, gender, and emotion parameters.

### 2.4 Video Task Generation Dispatch
- **Endpoint:** `POST /v3/videos`
- **Payload Structure:**
  ```json
  {
    "video_inputs": [
      {
        "character": {
          "type": "avatar",
          "avatar_id": "Angela-inTshirt-20220820",
          "avatar_style": "normal"
        },
        "voice": {
          "type": "text",
          "input_text": "Welcome to CreatorFlow AI! One idea powers all your content.",
          "voice_id": "2d5b0e6cf36f460aa7fc47e3eee4ba54",
          "speed": 1.0
        },
        "background": {
          "type": "color",
          "value": "#0f172a"
        }
      }
    ],
    "dimension": {
      "width": 1920,
      "height": 1080
    },
    "test": false
  }
  ```

### 2.5 Status Polling Loop
- **Endpoint:** `GET /v3/videos/{video_id}`
- **States Handled:** `pending` ➔ `processing` ➔ `completed` / `failed`
- **Interval:** 3 seconds with jitter. Upon completion, the CDN video URL and thumbnail URL are persisted in the database.

---

## 3. Credit Safety Gate & Modal Guard

To eliminate accidental billing and unexpected credit consumption:
1. When the creator clicks "Generate Avatar Video", the frontend **does not** submit the API task immediately.
2. A **Credit Safety Confirmation Modal** opens displaying:
   - Target Avatar & Voice selections.
   - Script word count and estimated credit deduction.
   - Current HeyGen account credit balance.
3. The creator must explicitly click **"Confirm & Render Video"** before the request is dispatched.

---

## 4. HTTP 402 Handling & High-Fidelity Demo Simulation

### The Problem
During hackathon evaluations, developer accounts frequently run out of paid HeyGen rendering credits (returning `HTTP 402 Payment Required: {"message": "insufficient_credit"}`). In standard applications, this results in an unhandled crash or a blank screen, preventing judges from experiencing the avatar studio, polling loop, video player, and asset library.

### Our Solution
When `heygen_service.py` receives an `HTTP 402` from HeyGen:
1. It records the genuine attempt in the audit logs.
2. It transparently shifts the task into **High-Fidelity Demo Simulation Mode**.
3. It assigns a simulated job UUID (`sim_demo_...`), cycles through realistic progress intervals (`pending` ➔ `processing` (45%) ➔ `processing` (85%) ➔ `completed` (100%)), and returns a high-resolution animated avatar preview video.
4. The UI clearly labels the output with a **"High-Fidelity Demo Simulation (HeyGen 402 Fallback)"** banner, ensuring total honesty while delivering a complete end-to-end evaluation experience.
