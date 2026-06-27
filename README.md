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

**Pixmith** is an AI-powered workshop for crafting pixel-art game assets — images, animations, sprite sheets, and chiptune music. Built with a FastAPI backend and Angular frontend, it supports multiple AI providers (Tongyi/DashScope, Doubao/Volcengine) and any OpenAI-compatible endpoint.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#%EF%B8%8F-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Usage](#-usage)
- [Supported AI Models](#-supported-ai-models)
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
- ⚙️ **Multi-provider** — Switch between Tongyi, Doubao, or any custom OpenAI-compatible API
- 🌐 **i18n** — UI available in multiple languages

## 🏗️ Architecture

```
┌─────────────────┐      HTTP       ┌──────────────────┐
│  Angular 20 UI  │ ──────────────► │  FastAPI Server  │
└─────────────────┘                 └────────┬─────────┘
                                             │
                          ┌──────────────────┼──────────────────┐
                          ▼                  ▼                  ▼
                  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                  │   Tongyi     │  │   Doubao     │  │   Custom     │
                  │  (DashScope) │  │ (Volcengine) │  │  (OpenAI-c.) │
                  └──────────────┘  └──────────────┘  └──────────────┘
```

- **Backend** — FastAPI handles API, AI model routing, and media processing.
- **Frontend** — Angular SPA for the user interface.
- **Cache** — Local filesystem stores generated images, frames, and music.
- **Logs** — Daily-rotated server logs (`logs/`).

## 📋 Prerequisites

- **Python** 3.13+
- **Node.js** 22+
- **Angular CLI** 20+
- An API key from at least one supported provider

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
# Edit .env and add your API key(s)

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

## ⚙️ Configuration

All server configuration lives in `projects/server/.env`. See `.env.example` for the full list.

| Variable | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8000` | Server port |
| `LOG_LEVEL` | `INFO` | Logging level |
| `ALLOWED_ORIGINS` | `http://localhost:4200` | Comma-separated CORS origins |
| `TONGYI_API_KEY` | *(empty)* | DashScope API key |
| `DOUBAO_API_KEY` | *(empty)* | Volcengine API key |
| `CUSTOM_BASE_URL` | *(empty)* | OpenAI-compatible endpoint URL |
| `CUSTOM_API_KEY` | *(empty)* | API key for custom endpoint |
| `CUSTOM_MODEL` | *(empty)* | Default model name for custom endpoint |
| `CACHE_MAX_AGE_DAYS` | `7` | Auto-cleanup threshold for cached files |

> **Never commit `.env` with real keys.** Use `.env.example` as a template.

## 📖 Usage

### Image generation

```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TONGYI_API_KEY" \
  -d '{
    "prompt": "A pixel-art ninja in black gear, full-body front view, gray background",
    "model_type": "tongyi",
    "size": "1024*1024"
  }'
```

### Video generation

```bash
curl -X POST http://localhost:8000/generate/video \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $DOUBAO_API_KEY" \
  -d '{
    "prompt": "The ninja performs a slashing attack",
    "base_image_url": "https://example.com/ninja.png",
    "model_type": "doubao"
  }'
```

### Music generation

```bash
curl -X POST http://localhost:8000/generate/music \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TONGYI_API_KEY" \
  -d '{
    "prompt": "Cheerful 8-bit chiptune for a side-scrolling platformer",
    "duration": 30,
    "genre": "chiptune",
    "model_type": "tongyi"
  }'
```

Full API docs available at `http://localhost:8000/docs` after starting the server.

## 🤖 Supported AI Models

| Capability | Provider | Default Model |
|---|---|---|
| Image generation | Tongyi | `wan2.5-t2i-preview` |
| Image generation | Doubao | `doubao-seedream-4-0-250828` |
| Image generation | Custom | `dall-e-3` *(or any OpenAI-compatible)* |
| Image editing | Tongyi | `wanx2.1-imageedit` |
| Video generation | Tongyi | `wan2.5-i2v-preview` |
| Video generation | Doubao | `doubao-seedance-1-0-pro-250528` |
| Music (chat-based) | Tongyi | `qwen-plus` |
| Music (chat-based) | Doubao | `doubao-seed-1-6-251015` |

To use a custom provider, set `model_type: "custom"` and provide `custom_base_url`, `custom_api_key`, `custom_model` in the request body.

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
│   │       │   ├── tongyi/
│   │       │   ├── doubao/
│   │       │   └── custom/
│   │       └── utils/       # Frame, image, music, path helpers
│   └── ui/                  # Angular 20 frontend
│       └── src/app/
│           ├── components/
│           ├── services/
│           └── interceptors/
├── cache/                   # Generated assets (gitignored)
├── logs/                    # Server logs (gitignored)
├── assets/                  # Docs assets (screenshots, etc.)
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

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [Angular](https://angular.dev/)
- [DashScope](https://dashscope.console.aliyun.com/) (Tongyi)
- [Volcengine](https://www.volcengine.com/) (Doubao)
- [rembg](https://github.com/danielgatis/rembg)
