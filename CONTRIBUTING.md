# Contributing to CreatorFlow AI

Thank you for your interest in contributing to **CreatorFlow AI**! We welcome community contributions, bug reports, feature requests, and documentation enhancements.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, professional, and collaborative.

---

## Development Setup

### 1. Prerequisites
- **Python:** 3.11 or higher
- **Node.js:** 18 or higher (with npm)
- **Ollama:** with `gemma4:e2b-it-qat` model installed:
  ```powershell
  ollama run gemma4:e2b-it-qat
  ```

### 2. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Configure HEYGEN_API_KEY, NVIDIA_API_KEY, and GEMINI_API_KEY in .env
```

### 3. Frontend Setup
```powershell
cd ../frontend
npm install
```

---

## Running Locally

In Terminal 1 (Backend):
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000
```

In Terminal 2 (Frontend):
```powershell
cd frontend
npm run dev
```

The application will be running at:
- **Frontend SPA:** `http://localhost:5173`
- **FastAPI Backend:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

---

## Testing & Quality Assurance

Before submitting a Pull Request, please ensure all automated tests and build checks pass cleanly:

```powershell
# 1. Run Backend Unit & Security Tests
cd backend
python -m pytest tests/test_unit_endpoints.py tests/test_security_resilience.py -v

# 2. Run Frontend Production Build
cd ../frontend
npm run build
```

---

## Security Invariants

When contributing code, adhere to our core security invariants:
1. **Never commit `.env` or credentials:** Ensure all secrets remain in `.env` (ignored by git).
2. **Never expose external API keys to the browser:** Route all third-party AI and video calls through the FastAPI backend proxy.
3. **Preserve human-in-the-loop credit safety gates:** Paid API operations (video rendering) must require explicit user approval.
4. **Sanitize health diagnostics:** Diagnostic endpoints must never print raw API keys or token substrings.

---

## Submitting Pull Requests

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes using conventional commit conventions:
   ```bash
   git commit -m "feat(module): add new capability"
   ```
3. Push to your fork and submit a Pull Request describing your changes, testing methodology, and any configuration updates required.
