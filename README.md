# ⚡ WebForge — AI-Powered Web Intelligence Platform

> Extract, analyze, automate, and compare any website. One platform. Powered by [TinyFish AI](https://tinyfish.ai).

---

## 🚀 Features

| Module | Description | TinyFish API |
|--------|------------|-------------|
| **🔍 X-Ray** | Deep extract HTML, Markdown, JSON + auto-detect design tokens (colors, fonts, spacing) + discover assets | Fetch API |
| **🤖 Agent** | Natural-language AI automation with real-time SSE streaming + embedded live browser preview | Agent API |
| **🌐 Search** | Web search with geo/language targeting — one-click extract from any result | Search API |
| **🖥️ Browser** | Launch remote cloud browser sessions with CDP/DevTools inspector | Browser API |
| **📊 Compare** | Side-by-side website comparison — design tokens, content structure, metadata | Fetch API |
| **📋 History** | Persistent extraction timeline with JSON export | localStorage |

---

## 📦 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/CoderRahul01/webforge.git
cd webforge

# Set your TinyFish API key
cp .env.example .env
# Edit .env → add your key from https://agent.tinyfish.ai/api-keys

# Launch with one command
docker compose up --build

# Open http://localhost:3000
```

### Option 2: Local Development

```bash
# Clone and install
git clone https://github.com/CoderRahul01/webforge.git
cd webforge
npm install

# Set your TinyFish API key
cp .env.example .env
# Edit .env → add your key

# Start both servers (Vite + Express)
npm run dev

# Open http://localhost:5173
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│           Vite + React + Router              │
│   ┌──────┬──────┬──────┬──────┬──────┬────┐ │
│   │X-Ray │Agent │Search│Browse│Compar│Hist│ │
│   └──┬───┴──┬───┴──┬───┴──┬───┴──┬───┴──┬─┘ │
│      │      │      │      │      │      │    │
│      └──────┴──────┴──────┴──────┴──────┘    │
│                 src/lib/api.js                │
└──────────────────┬──────────────────────────-┘
                   │  /api/* (Vite proxy in dev)
┌──────────────────▼──────────────────────────┐
│              Backend (Express)               │
│              server.cjs :3001                │
│                                              │
│  /api/fetch    → api.fetch.tinyfish.ai       │
│  /api/search   → api.search.tinyfish.ai      │
│  /api/agent/*  → agent.tinyfish.ai (SSE)     │
│  /api/browser/*→ api.browser.tinyfish.ai     │
└──────────────────────────────────────────────┘
```

### File Structure

```
webforge/
├── server.cjs              # Express API server (all 4 TinyFish API proxies)
├── vite.config.js           # Vite config with dev proxy
├── index.html               # Entry HTML with OG meta tags
├── Dockerfile               # Multi-stage production build
├── docker-compose.yml       # One-command Docker launch
├── src/
│   ├── main.jsx             # React entry with BrowserRouter
│   ├── App.jsx              # Root: ErrorBoundary + ToastProvider + Routes
│   ├── index.css             # Complete dark-mode design system
│   ├── lib/
│   │   └── api.js           # Centralized API client (all endpoints)
│   ├── components/
│   │   ├── Sidebar.jsx      # Navigation with NavLink active states
│   │   ├── Toast.jsx        # Context-based notification system
│   │   ├── ErrorBoundary.jsx # Crash recovery UI
│   │   └── Skeleton.jsx     # Loading shimmer placeholders
│   └── pages/
│       ├── Landing.jsx      # Marketing hero page
│       ├── XRay.jsx         # Multi-format extraction + design tokens
│       ├── Agent.jsx        # AI automation + live preview
│       ├── Search.jsx       # Web search + one-click extract
│       ├── BrowserSession.jsx # Remote browser sessions
│       ├── Compare.jsx      # Side-by-side comparison
│       └── History.jsx      # Extraction timeline + export
├── .env.example             # Environment variable template
└── package.json             # Scripts: dev, build, start
```

---

## 🔌 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check + API key status |
| `POST` | `/api/fetch` | Extract single format (html/markdown/json) |
| `POST` | `/api/fetch/all` | Extract all 3 formats in parallel |
| `GET` | `/api/search` | Web search with location/language params |
| `POST` | `/api/agent/run` | AI agent with SSE streaming + live preview |
| `POST` | `/api/agent/run-sync` | Synchronous agent execution |
| `GET` | `/api/agent/runs/:id` | Get agent run status |
| `POST` | `/api/agent/runs/:id/cancel` | Cancel a running agent |
| `POST` | `/api/browser/session` | Create remote browser session |
| `DELETE` | `/api/browser/session/:id` | Terminate browser session |

---

## 🛠️ Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start Vite (5173) + Express (3001) concurrently |
| `npm run build` | Build React app for production |
| `npm start` | Start production server (serves built app) |
| `npm run lint` | Run ESLint |

---

## 🐳 Docker

The Dockerfile uses a **multi-stage build**:

1. **Stage 1 (builder)**: Installs all deps, runs `vite build`
2. **Stage 2 (production)**: Lean Alpine image with only production deps + built `dist/`

Features:
- **Non-root user** for security
- **Built-in healthcheck** on `/api/health`
- **~80MB** final image

```bash
# Build and run
docker compose up --build

# Or manually
docker build -t webforge .
docker run -p 3000:3000 --env-file .env webforge
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TINYFISH_API_KEY` | ✅ | Your TinyFish API key ([get one here](https://agent.tinyfish.ai/api-keys)) |
| `PORT` | No | Server port (default: 3001 dev, 3000 Docker) |

---

## 📋 Tech Stack

- **Frontend**: React 19, React Router 7, Vite 8
- **Backend**: Express 5, Axios
- **APIs**: TinyFish (Fetch, Search, Agent, Browser)
- **Infra**: Docker, Node 20 Alpine
- **Design**: Inter + JetBrains Mono, CSS variables, dark mode

---

## 📄 License

MIT
