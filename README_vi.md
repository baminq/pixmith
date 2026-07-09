<div align="center">
  <h1 style="font-size: 48px; margin-bottom: 0;">⚒️ Pixmith</h1>
  <p><em>Xưởng rèn tài nguyên game pixel-art bằng AI</em></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Python-3.13-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/Node.js-22-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Angular-20-red.svg" alt="Angular">
  <img src="https://img.shields.io/badge/FastAPI-0.116-009688.svg" alt="FastAPI">
</p>

<p align="center">
  <a href="./README.md">🇬🇧 English</a> · 🇻🇳 Tiếng Việt
</p>

**Pixmith** là xưởng AI để tạo tài nguyên game pixel-art — hình ảnh, animation, sprite sheet và nhạc chiptune. Backend dùng FastAPI, frontend dùng Angular; kết nối bất kỳ API **tương thích OpenAI** nào (OpenAI, OpenRouter, Groq, SiliconFlow, …).

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Kiến trúc](#%EF%B8%8F-kiến-trúc)
- [Yêu cầu](#-yêu-cầu)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#%EF%B8%8F-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [API được hỗ trợ](#-api-được-hỗ-trợ)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)

## ✨ Tính năng

- 🎨 **Tạo ảnh** — Sinh asset pixel-art từ prompt text
- 🎬 **Tạo animation** — Biến frame đầu + prompt thành video ngắn
- ✂️ **Tách frame** — Bóc các frame từ animation để dùng làm sprite 2D
- 🧩 **Xuất sprite sheet** — Gộp các frame thành một sprite atlas (PNG)
- 🧹 **Xóa nền** *(beta)* — Loại bỏ background bằng `rembg`
- 🎵 **Tạo nhạc** — Soạn BGM gốc, có tùy chọn biến tấu chiptune
- 💾 **Cache & lịch sử** — Lưu cache asset đã tạo, có thể duyệt lại
- ⚙️ **Tương thích OpenAI** — Cắm bất kỳ provider nào nói API OpenAI
- 🌐 **Đa ngôn ngữ** — Giao diện tiếng Anh, Việt, Trung

## 🏗️ Kiến trúc

```
┌─────────────────┐      HTTP       ┌──────────────────┐
│  Angular 20 UI  │ ──────────────► │  FastAPI Server  │
└─────────────────┘                 └────────┬─────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │  OpenAI-compatible   │
                                  │  API (bất kỳ)        │
                                  └──────────────────────┘
```

- **Backend** — FastAPI định tuyến API, gọi model và xử lý media.
- **Frontend** — Angular SPA; API key và endpoint cấu hình trong **Settings** (localStorage trình duyệt).
- **Cache** — Lưu asset đã tạo trên filesystem local.
- **Logs** — Log server xoay vòng theo ngày (`logs/`).

## 📋 Yêu cầu

- **Python** 3.13+
- **Node.js** 22+
- **Angular CLI** 20+
- API key từ bất kỳ nhà cung cấp tương thích OpenAI

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/baminq/pixmith.git
cd pixmith
```

### 2. Setup backend

```bash
cd projects/server

python -m venv venv
source venv/bin/activate         # Linux/macOS
venv\Scripts\activate            # Windows

pip install -r requirements.txt

cp .env.example .env
# Tùy chọn: điền default server trong .env

python app.py
```

Server chạy tại `http://0.0.0.0:8000`.

### 3. Setup frontend

```bash
cd projects/ui
npm install
npm start
```

Giao diện chạy tại `http://localhost:4200`.

Mở **Settings** trong UI và thêm base URL, API key, model tương thích OpenAI cho ảnh / nhạc / video.

## ⚙️ Cấu hình

### UI Settings (chính)

Credentials được lưu trong trình duyệt (localStorage) và gửi kèm mỗi request sinh. Cấu hình riêng cho:

| Slot | Mục đích |
|---|---|
| **API ảnh** | Text-to-image |
| **API nhạc** | Sinh nhạc qua chat/completion |
| **API video** | Image-to-video (animation) |

Mỗi slot cần: tên provider, **Base URL**, **API key**, và **Model**.

### Server `.env` (default tùy chọn)

Toàn bộ cấu hình server nằm ở `projects/server/.env`. Xem `.env.example`.

| Biến | Mặc định | Mô tả |
|---|---|---|
| `HOST` | `0.0.0.0` | Địa chỉ bind |
| `PORT` | `8000` | Port server |
| `LOG_LEVEL` | `INFO` | Mức log |
| `ALLOWED_ORIGINS` | `http://localhost:4200` | CORS origins (phân cách bằng dấu phẩy) |
| `CUSTOM_BASE_URL` | *(trống)* | Endpoint OpenAI-compatible mặc định (tùy chọn) |
| `CUSTOM_API_KEY` | *(trống)* | API key mặc định (tùy chọn) |
| `CUSTOM_MODEL` | *(trống)* | Tên model mặc định (tùy chọn) |
| `CACHE_MAX_AGE_DAYS` | `7` | Ngưỡng tự dọn cache |

> **Không bao giờ commit `.env` chứa key thật.** Dùng `.env.example` làm template.

## 📖 Sử dụng

### Tạo ảnh

```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Ninja pixel-art mặc đồ đen, nhìn chính diện toàn thân, nền xám",
    "model_type": "custom",
    "size": "1024*1024",
    "custom_base_url": "https://api.openai.com/v1",
    "custom_api_key": "sk-...",
    "custom_model": "dall-e-3"
  }'
```

### Tạo video

```bash
curl -X POST http://localhost:8000/generate/video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Ninja thực hiện đòn chém",
    "base_image_url": "https://example.com/ninja.png",
    "model_type": "custom",
    "custom_base_url": "https://api.example.com/v1",
    "custom_api_key": "sk-...",
    "custom_model": "your-i2v-model"
  }'
```

### Tạo nhạc

```bash
curl -X POST http://localhost:8000/generate/music \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Nhạc chiptune 8-bit vui tươi cho game platformer cuộn ngang",
    "duration": 30,
    "genre": "chiptune",
    "model_type": "custom",
    "custom_base_url": "https://api.openai.com/v1",
    "custom_api_key": "sk-...",
    "custom_model": "gpt-4o"
  }'
```

Tài liệu API đầy đủ tại `http://localhost:8000/docs` sau khi khởi động server.

## 🤖 API được hỗ trợ

Pixmith gọi bất kỳ endpoint nào triển khai bề mặt tương thích OpenAI cho từng tác vụ:

| Khả năng | Dạng endpoint điển hình | Ví dụ model |
|---|---|---|
| Tạo ảnh | `POST /images/generations` | `dall-e-3`, model ảnh của provider |
| Video / animation | API image-to-video (adapter OpenAI-compatible) | Model I2V của provider |
| Nhạc (chat-based) | `POST /chat/completions` | `gpt-4o`, `gpt-4o-mini`, model chat khác |

Đặt `model_type: "custom"` và truyền `custom_base_url`, `custom_api_key`, `custom_model` trong request body (UI tự làm từ Settings).

Tương thích **OpenAI**, **OpenRouter**, **Groq**, **SiliconFlow**, và gateway tự host expose API OpenAI-compatible.

## 📁 Cấu trúc dự án

```
pixmith/
├── projects/
│   ├── server/              # FastAPI backend
│   │   ├── app.py           # Entrypoint ứng dụng
│   │   ├── defs.py          # Pydantic schemas + constants
│   │   ├── routers/         # HTTP endpoints
│   │   └── services/
│   │       ├── gen_models/  # Adapter nhà cung cấp AI
│   │       │   └── custom/  # Client OpenAI-compatible
│   │       └── utils/       # Helper frame, ảnh, nhạc, path
│   └── ui/                  # Angular 20 frontend
│       └── src/app/
│           ├── components/
│           ├── services/
│           └── interceptors/
├── assets/                  # Screenshot / intro docs
├── cache/                   # Asset đã tạo (gitignored)
├── logs/                    # Log server (gitignored)
├── scripts/                 # Script tiện ích (ví dụ sinh logo)
├── LICENSE                  # MIT
└── README.md
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón. Vui lòng:

1. Mở issue trước để thảo luận thay đổi lớn.
2. Fork → tạo branch → PR. Giữ PR nhỏ và tập trung.
3. Thêm test cho logic mới.
4. Chạy linter trước khi push.

## 📄 Giấy phép

Phát hành dưới [MIT License](LICENSE).

Copyright (c) 2026 [baminq](https://github.com/baminq)

## 🙏 Cảm ơn

- [FastAPI](https://fastapi.tiangolo.com/)
- [Angular](https://angular.dev/)
- [rembg](https://github.com/danielgatis/rembg)
- [music21](https://web.mit.edu/music21/) / [symusic](https://github.com/Yikai-Liao/symusic)
