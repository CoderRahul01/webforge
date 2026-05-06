# WebForge — AI-Powered Web Intelligence Platform

Extract, analyze, automate, and compare any website with AI-powered intelligence. Built on [TinyFish](https://tinyfish.ai).

## Features

| Module | What It Does |
|--------|-------------|
| **X-Ray** | Deep extract HTML/Markdown/JSON + design tokens + assets |
| **Agent** | Natural-language AI automation with live browser preview |
| **Search** | Web search with geo-targeting → one-click extract |
| **Browser** | Remote cloud browser sessions with CDP/DevTools |
| **Compare** | Side-by-side website design token comparison |
| **History** | Persistent extraction timeline + JSON export |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set your TinyFish API key
cp .env.example .env
# Edit .env and add your key from https://agent.tinyfish.ai/api-keys

# 3. Run development servers
npm run dev
# Opens at http://localhost:5173
```

## Architecture

- **Frontend**: Vite + React + React Router (SPA)
- **Backend**: Express API server (proxies TinyFish APIs)
- **APIs Used**: TinyFish Fetch, Search, Agent (SSE), Browser

## Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start both Vite + Express dev servers |
| `npm run build` | Build React app for production |
| `npm start` | Start production server (serves built app) |

## License

MIT
