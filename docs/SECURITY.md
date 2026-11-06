# CreatorFlow AI — Security Architecture & Resilience

> **Comprehensive security specifications, secret protection, error sanitization, and resilience audits.**

---

## 1. Core Security Principles

CreatorFlow AI adheres to five non-negotiable security rules:
1. **Zero Secret Leakage:** Third-party credentials never enter client code, git history, or error responses.
2. **Server-Side Brokerage:** All interactions with HeyGen, NVIDIA, and Google Gemini are routed exclusively through authenticated backend proxies.
3. **Explicit Financial Consent:** Generative tasks that consume credits or API tokens require human confirmation before dispatch.
4. **Resilient Fallback Design:** Upstream provider failures gracefully degrade rather than crashing the user session.
5. **Sanitized Diagnostics:** Health and status endpoints report operational connectivity without leaking raw tokens or account identifiers.

---

## 2. Credential Isolation & Environment Management

```
.env (IGNORED IN GIT) ──────> FastAPI Backend (app.core.config)
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
               HEYGEN_API_KEY            NVIDIA_API_KEY
               (HeyGen Service)         (NVIDIA Service)
                         │                     │
                         └──────────┬──────────┘
                                    ▼
                          HTTPS (Encrypted Only)
                                    │
                                    ▼
                         External Cloud Services
```

- **`.gitignore` Rules:** Strictly excludes `.env`, `.env.local`, `.env.*.local`, `*.key`, `*.pem`, `*.sqlite`, `*.db`, `node_modules/`, and `venv/`.
- **`.env.example` Template:** Provides clearly labeled placeholders (`your_heygen_v3_api_key_here`, `your_nvidia_nim_api_key_here`, `your_gemini_api_key_here`) with zero real credentials.
- **Frontend Isolation:** The Vite frontend bundle contains zero references to backend secrets or third-party API keys. All frontend network operations communicate strictly with `/api/*` endpoints.

---

## 3. Human Approval Gate for Financial Actions

AI video synthesis and cloud token usage carry real financial costs. To prevent unauthorized or runaway usage:
1. **Pre-flight Credit Check:** Prior to initiating any video generation, the backend queries `GET /v3/users/me` to determine remaining credits.
2. **Interactive Confirmation Modal:** The UI renders an un-dismissible confirmation modal displaying the target duration, credit estimate, and current balance.
3. **Double Click Prevention:** Action buttons automatically disable upon submission to prevent duplicate concurrent render requests.

---

## 4. Local Ollama Network Security

- Local Ollama binds strictly to loopback interface `http://localhost:11434` or `http://127.0.0.1:11434`.
- The FastAPI backend validates all incoming topics and prompt parameters through Pydantic models to prevent prompt-injection attacks.
- Ollama is never exposed directly to external networks or client browsers.

---

## 5. Security & Resilience Test Suite

A dedicated security and resilience test suite (`backend/tests/test_security_resilience.py`) verifies critical security invariants:

| Test Case | Invariant Verified | Result |
| :--- | :--- | :--- |
| `test_diagnostics_does_not_leak_api_keys` | Ensures `/api/diagnostics/ai` never outputs sensitive key strings. | ✅ PASSED |
| `test_root_and_health_no_credentials` | Verifies `/` and `/health` output no environment secrets. | ✅ PASSED |
| `test_nvidia_status_sanitized` | Verifies `/api/nvidia/status` returns boolean configuration without token fragments. | ✅ PASSED |
| `test_heygen_402_graceful_simulation` | Confirms HTTP 402 results in high-fidelity demo fallback rather than unhandled 500 error. | ✅ PASSED |
| `test_invalid_payload_rejection` | Asserts Pydantic rejects malicious or malformed payloads with 422 Unprocessable Entity. | ✅ PASSED |
