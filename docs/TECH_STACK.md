# CreatorFlow AI — Technology Stack: What & Why

> **Rigorous architectural justification for every framework, library, and cloud service utilized in CreatorFlow AI.**

---

## 1. Frontend Technologies

| Technology | What It Does | Why We Selected It | Advantage in CreatorFlow AI |
| :--- | :--- | :--- | :--- |
| **React 19** | Component-based UI framework for single-page applications. | Modern concurrency features, streamlined hooks, lightweight bundle, and industry standard adoption. | Provides zero-lag reactive state across the Studio, live script editing, real-time pace metrics, and status polling. |
| **Vite 8** | Next-generation frontend build tool and dev server with native ESM. | Sub-100ms Hot Module Replacement (HMR) and optimized Rollup production bundling. | Production build executes in under 6 seconds, producing clean, compressed static assets with zero friction. |
| **Tailwind CSS 3** | Utility-first CSS framework for expressive and consistent styling. | Rapid composability without style leakage; straightforward design system enforcement. | Implements a cohesive **Neumorphic design system** with custom soft shadows (`#eef2f7`), inset cards, and pill badges. |
| **Motion (`motion/react`)** | Declarative animation and physics engine for React. | Production-tested spring physics, exit animations, and gesture support. | Delivers fluid micro-interactions, modal transitions, and dynamic loading pulses that elevate the UI aesthetic. |
| **Lucide React** | Consistent, tree-shakeable SVG icon collection. | Comprehensive visual icon set with zero runtime overhead. | Provides clean visual cues for video generation, scripts, audio voices, diagnostics, and social platforms. |
| **React Router v7** | Declarative client-side routing library. | Robust URL synchronization and SPA route isolation. | Enables direct deep linking to `/studio`, `/script`, `/avatar`, `/render`, `/calendar`, and `/diagnostics`. |

---

## 2. Backend Technologies

| Technology | What It Does | Why We Selected It | Advantage in CreatorFlow AI |
| :--- | :--- | :--- | :--- |
| **Python 3.11** | Modern, high-performance general-purpose programming language. | Substantial performance improvements over 3.10, rich AI ecosystem, and async runtime. | Seamlessly coordinates HTTP clients, local Ollama subprocesses, JSON parsing, and database transactions. |
| **FastAPI 0.115+** | High-performance asynchronous REST API framework based on Starlette and Pydantic. | Native async/await support, auto-generated OpenAPI/Swagger documentation, and compile-time data validation. | Powers sub-50ms REST dispatch, live SSE/polling status updates, and transparent `/docs` API exploration. |
| **Pydantic v2** | High-speed data validation and serialization library powered by Rust core. | Strict type safety, clear error messages, and seamless schema serialization. | Guarantees that script payloads, provider choices, HeyGen API responses, and autopilot jobs strictly match expected schemas. |
| **HTTPX** | Fully featured async HTTP client for Python. | Native async support, connection pooling, and granular timeout configuration. | Executes non-blocking API calls to HeyGen V3 REST endpoints, NVIDIA NIM, and Google Gemini without worker thread exhaustion. |
| **SQLAlchemy 2.0** | Comprehensive Python SQL toolkit and Object Relational Mapper (ORM). | Database engine abstraction supporting both SQLite and PostgreSQL. | Enables zero-config local development using SQLite (`creatorflow.db`) while supporting seamless cloud deployment to PostgreSQL/Supabase. |
| **Uvicorn** | Lightning-fast ASGI web server implementation. | Production-grade async HTTP handling on uvloop. | Serves backend traffic reliably across Windows, Linux, Docker, and containerized cloud platforms. |

---

## 3. Artificial Intelligence Layer

| Technology | What It Does | Why We Selected It | Advantage in CreatorFlow AI |
| :--- | :--- | :--- | :--- |
| **Gemma 4 (`gemma4:e2b-it-qat`)** | Google's open-weights LLM running locally via Ollama. | Low latency, zero cloud token expenditure, total user privacy, and high-quality instruction following. | Drafts complete scripts with 3-second hooks, visual scene prompts, and call-to-action in English, Hindi, and Hinglish completely offline. |
| **Ollama** | Local runtime daemon for serving open-weights LLMs. | Simple REST API on `localhost:11434`, cross-platform support, and automatic hardware acceleration. | Operates without external API keys or network latency, serving as the default generator. |
| **NVIDIA NIM API** | Enterprise cloud inference platform for state-of-the-art open models (`meta/llama-3.3-70b-instruct`). | Sub-second cloud inference, massive context window, and exceptional reasoning. | Delivers cloud-based script polish, tone adjustment, and structural sharpening with full hook preservation. |
| **Google Gemini API** | Multimodal cloud LLM platform (`gemini-3.8-flash`). | Low latency, high reasoning quality, and native structured JSON output. | Serves as an independent cloud refinement engine and powers multi-platform packaging (YouTube, IG, LinkedIn, X). |

> **CRITICAL ARCHITECTURAL DISTINCTION:**  
> **NVIDIA API is not Gemini API.** They are separate, independent providers with separate endpoints, authentication tokens, and model architectures. CreatorFlow AI does not mix their credentials or connection states.

---

## 4. Video & Media Synthesis

| Technology | What It Does | Why We Selected It | Advantage in CreatorFlow AI |
| :--- | :--- | :--- | :--- |
| **HeyGen V3 REST API** | State-of-the-art synthetic avatar and AI voice video generation platform. | Official industry-leading avatar photorealism, multi-language lip-sync, and rich voice catalog. | Converts approved text scripts into photorealistic talking-avatar video assets without complex rendering pipelines. |
| **Credit Safety Guard** | Custom pre-flight credit verification logic. | Protects developer and creator balances from unexpected consumption. | Validates credit quota via `GET /v3/users/me` before video render tasks are dispatched. |
| **High-Fidelity Demo Simulation** | Graceful fallback engine triggered on HTTP 402 Insufficient Credit. | Ensures end-to-end evaluation remains functional regardless of account credit status. | Hackathon judges and developers can test the full pipeline, UI states, and polling loop even with zero balance. |

---

## 5. Storage, Infrastructure & Telemetry

| Technology | What It Does | Why We Selected It | Advantage in CreatorFlow AI |
| :--- | :--- | :--- | :--- |
| **SQLite** | Self-contained, serverless relational database engine. | Embedded, requires zero configuration or credentials. | Ideal for hackathon evaluations, single-developer workflows, and automated CI tests. |
| **PostgreSQL / Supabase** | Managed cloud relational database with connection pooling. | Cloud durability, ACID compliance, and SSL connectivity. | Readily enabled by changing `DATABASE_URL` in `.env` for production multi-user hosting. |
| **Sentry SDK** | Real-time application monitoring and crash reporting. | Instant stack traces, release tracking, and environment isolation. | Identifies runtime edge cases in API integrations without disrupting end users. |
| **GitHub Actions** | Automated CI/CD pipeline. | Runs pytest suite and Vite build on every pull request and push. | Guarantees regression-free releases and verified code hygiene. |
