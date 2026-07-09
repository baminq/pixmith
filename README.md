<div align="center">
  <h1 style="font-size: 48px; margin-bottom: 0;">⚒️ Pixmith</h1>
  <p><em>Forge pixel-art game assets with AI</em></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Python-3.13-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/Node.js-22-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Angular-20-red.svg" alt="Angular">
  <img src="https://img.shields.io/badge/FastAPI-0.116-009688.svg" alt="FastAPI">
</p>

<p align="center">
  🇬🇧 English · <a href="./README_vi.md">🇻🇳 Tiếng Việt</a>
</p>

**Pixmith** is an AI-powered workshop for crafting pixel-art game assets — images, animations, sprite sheets, and chiptune music. Built with a FastAPI backend and Angular frontend, it connects to any **OpenAI-compatible** API (OpenAI, OpenRouter, Groq, SiliconFlow, and more).

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#%EF%B8%8F-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Usage](#-usage)
- [Supported APIs](#-supported-apis)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🎨 **Image Generation** — Generate pixel-art assets from text prompts
- 🎬 **Animation Generation** — Turn a first frame + prompt into short videos
- ✂️ **Frame Splitting** — Extract frames from animations for use as 2D sprites
- 🧩 **Sprite Sheet Export** — Merge frames into a single sprite atlas (PNG)
- 🧹 **Background Removal** *(beta)* — Strip backgrounds via `rembg`
- 🎵 **Music Generation** — Compose original BGM with optional chiptune variant
- 💾 **Caching & History** — Persistent cache of generated assets with browseable history
- ⚙️ **OpenAI-compatible** — Plug in any provider that speaks the OpenAI API
- 🌐 **i18n** — UI available in English, Vietnamese, and Chinese

## 🏗️ Architecture

```
┌─────────────────┐      HTTP       ┌──────────────────┐
│  Angular 20 UI  │ ──────────────► │  FastAPI Server  │
└─────────────────┘                 └────────┬─────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │  OpenAI-compatible   │
                                  │  API (any provider)  │
                                  └──────────────────────┘
```

- **Backend** — FastAPI handles API routing, model calls, and media processing.
- **Frontend** — Angular SPA; API keys and endpoints are configured in **Settings** (browser localStorage).
- **Cache** — Local filesystem stores generated images, frames, and music.
- **Logs** — Daily-rotated server logs (`logs/`).

## 📋 Prerequisites

- **Python** 3.13+
- **Node.js** 22+
- **Angular CLI** 20+
- An API key from any OpenAI-compatible provider

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/baminq/pixmith.git
cd pixmith
```

### 2. Backend setup

```bash
cd projects/server

python -m venv venv
source venv/bin/activate         # Linux/macOS
venv\Scripts\activate            # Windows

pip install -r requirements.txt

cp .env.example .env
# Optional: set server defaults in .env

python app.py
```

Server starts on `http://0.0.0.0:8000`.

### 3. Frontend setup

```bash
cd projects/ui
npm install
npm start
```

UI available at `http://localhost:4200`.

Open **Settings** in the UI and add your OpenAI-compatible base URL, API key, and model for image / music / video.

## ⚙️ Configuration

### UI Settings (primary)

API credentials are stored in the browser (localStorage) and sent with each generation request. Configure separately for:

| Slot | Purpose |
|---|---|
| **Image API** | Text-to-image generation |
| **Music API** | Chat/completion-based music generation |
| **Video API** | Image-to-video animation |

Each slot needs: provider name, **Base URL**, **API key**, and **Model**.

### Server `.env` (optional defaults)

All server configuration lives in `projects/server/.env`. See `.env.example`.

| Variable | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8000` | Server port |
| `LOG_LEVEL` | `INFO` | Logging level |
| `ALLOWED_ORIGINS` | `http://localhost:4200` | Comma-separated CORS origins |
| `CUSTOM_BASE_URL` | *(empty)* | Optional default OpenAI-compatible endpoint |
| `CUSTOM_API_KEY` | *(empty)* | Optional default API key |
| `CUSTOM_MODEL` | *(empty)* | Optional default model name |
| `CACHE_MAX_AGE_DAYS` | `7` | Auto-cleanup threshold for cached files |

> **Never commit `.env` with real keys.** Use `.env.example` as a template.

## 📖 Usage

### Image generation

```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A pixel-art ninja in black gear, full-body front view, gray background",
    "model_type": "custom",
    "size": "1024*1024",
    "custom_base_url": "https://api.openai.com/v1",
    "custom_api_key": "sk-...",
    "custom_model": "dall-e-3"
  }'
```

### Video generation

```bash
curl -X POST http://localhost:8000/generate/video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "The ninja performs a slashing attack",
    "base_image_url": "https://example.com/ninja.png",
    "model_type": "custom",
    "custom_base_url": "https://api.example.com/v1",
    "custom_api_key": "sk-...",
    "custom_model": "your-i2v-model"
  }'
```

### Music generation

```bash
curl -X POST http://localhost:8000/generate/music \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Cheerful 8-bit chiptune for a side-scrolling platformer",
    "duration": 30,
    "genre": "chiptune",
    "model_type": "custom",
    "custom_base_url": "https://api.openai.com/v1",
    "custom_api_key": "sk-...",
    "custom_model": "gpt-4o"
  }'
```

Full API docs available at `http://localhost:8000/docs` after starting the server.

## 🤖 Supported APIs

Pixmith talks to any endpoint that implements the OpenAI-compatible surface used for the task:

| Capability | Typical endpoint shape | Example models |
|---|---|---|
| Image generation | `POST /images/generations` | `dall-e-3`, provider-specific image models |
| Video / animation | Provider image-to-video API (OpenAI-compatible adapter) | Provider-specific I2V models |
| Music (chat-based) | `POST /chat/completions` | `gpt-4o`, `gpt-4o-mini`, other chat models |

Set `model_type: "custom"` and pass `custom_base_url`, `custom_api_key`, and `custom_model` in the request body (the UI does this automatically from Settings).

Works with providers such as **OpenAI**, **OpenRouter**, **Groq**, **SiliconFlow**, and self-hosted gateways that expose an OpenAI-compatible API.

## 📁 Project Structure

```
pixmith/
├── projects/
│   ├── server/              # FastAPI backend
│   │   ├── app.py           # Application entrypoint
│   │   ├── defs.py          # Pydantic schemas + constants
│   │   ├── routers/         # HTTP endpoints
│   │   └── services/
│   │       ├── gen_models/  # AI provider adapters
│   │       │   └── custom/  # OpenAI-compatible client
│   │       └── utils/       # Frame, image, music, path helpers
│   └── ui/                  # Angular 20 frontend
│       └── src/app/
│           ├── components/
│           ├── services/
│           └── interceptors/
├── assets/                  # Docs / intro screenshots
├── cache/                   # Generated assets (gitignored)
├── logs/                    # Server logs (gitignored)
├── scripts/                 # Utility scripts (e.g. logo generation)
├── LICENSE                  # MIT
└── README.md
```

## 🤝 Contributing

Contributions welcome. Please:

1. Open an issue first to discuss significant changes.
2. Fork → branch → PR. Keep PRs focused and small.
3. Add tests for new logic.
4. Run linters before pushing.

## 📄 License

Released under the [MIT License](LICENSE).

Copyright (c) 2026 [baminq](https://github.com/baminq)

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [Angular](https://angular.dev/)
- [rembg](https://github.com/danielgatis/rembg)
- [music21](https://web.mit.edu/music21/) / [symusic](https://github.com/Yikai-Liao/symusic)
