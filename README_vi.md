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

**Pixmith** là một xưởng sáng tạo dùng AI để tạo tài nguyên game pixel-art — hình ảnh, animation, sprite sheet, và nhạc chiptune. Backend dùng FastAPI, frontend dùng Angular, hỗ trợ nhiều nhà cung cấp AI (Tongyi/DashScope, Doubao/Volcengine) và bất kỳ endpoint nào tương thích OpenAI.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Kiến trúc](#%EF%B8%8F-kiến-trúc)
- [Yêu cầu](#-yêu-cầu)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#%EF%B8%8F-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [Các model AI hỗ trợ](#-các-model-ai-hỗ-trợ)
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
- ⚙️ **Đa nhà cung cấp** — Chuyển đổi giữa Tongyi, Doubao, hoặc bất kỳ API OpenAI-compatible nào
- 🌐 **Đa ngôn ngữ** — Giao diện hỗ trợ nhiều ngôn ngữ

## 🏗️ Kiến trúc

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

- **Backend** — FastAPI xử lý API, định tuyến model AI, và xử lý media.
- **Frontend** — Angular SPA cho giao diện người dùng.
- **Cache** — Lưu asset đã tạo trên filesystem local.
- **Logs** — Log server xoay vòng theo ngày (`logs/`).

## 📋 Yêu cầu

- **Python** 3.13+
- **Node.js** 22+
- **Angular CLI** 20+
- API key của ít nhất một nhà cung cấp được hỗ trợ

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
# Mở .env và điền API key

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

## ⚙️ Cấu hình

Toàn bộ cấu hình server nằm ở `projects/server/.env`. Xem `.env.example` để biết danh sách đầy đủ.

| Biến | Mặc định | Mô tả |
|---|---|---|
| `HOST` | `0.0.0.0` | Địa chỉ bind |
| `PORT` | `8000` | Port server |
| `LOG_LEVEL` | `INFO` | Mức log |
| `ALLOWED_ORIGINS` | `http://localhost:4200` | CORS origins (phân cách bằng dấu phẩy) |
| `TONGYI_API_KEY` | *(trống)* | API key DashScope |
| `DOUBAO_API_KEY` | *(trống)* | API key Volcengine |
| `CUSTOM_BASE_URL` | *(trống)* | URL endpoint OpenAI-compatible |
| `CUSTOM_API_KEY` | *(trống)* | API key cho endpoint custom |
| `CUSTOM_MODEL` | *(trống)* | Tên model mặc định cho endpoint custom |
| `CACHE_MAX_AGE_DAYS` | `7` | Ngưỡng tự dọn cache |

> **Không bao giờ commit `.env` chứa key thật.** Dùng `.env.example` làm template.

## 📖 Sử dụng

### Tạo ảnh

```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TONGYI_API_KEY" \
  -d '{
    "prompt": "Ninja pixel-art mặc đồ đen, nhìn chính diện toàn thân, nền xám",
    "model_type": "tongyi",
    "size": "1024*1024"
  }'
```

### Tạo video

```bash
curl -X POST http://localhost:8000/generate/video \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $DOUBAO_API_KEY" \
  -d '{
    "prompt": "Ninja thực hiện đòn chém",
    "base_image_url": "https://example.com/ninja.png",
    "model_type": "doubao"
  }'
```

### Tạo nhạc

```bash
curl -X POST http://localhost:8000/generate/music \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TONGYI_API_KEY" \
  -d '{
    "prompt": "Nhạc chiptune 8-bit vui tươi cho game platformer cuộn ngang",
    "duration": 30,
    "genre": "chiptune",
    "model_type": "tongyi"
  }'
```

Tài liệu API đầy đủ tại `http://localhost:8000/docs` sau khi khởi động server.

## 🤖 Các model AI hỗ trợ

| Khả năng | Nhà cung cấp | Model mặc định |
|---|---|---|
| Tạo ảnh | Tongyi | `wan2.5-t2i-preview` |
| Tạo ảnh | Doubao | `doubao-seedream-4-0-250828` |
| Tạo ảnh | Custom | `dall-e-3` *(hoặc bất kỳ model OpenAI-compatible)* |
| Chỉnh sửa ảnh | Tongyi | `wanx2.1-imageedit` |
| Tạo video | Tongyi | `wan2.5-i2v-preview` |
| Tạo video | Doubao | `doubao-seedance-1-0-pro-250528` |
| Nhạc (chat-based) | Tongyi | `qwen-plus` |
| Nhạc (chat-based) | Doubao | `doubao-seed-1-6-251015` |

Để dùng nhà cung cấp custom, set `model_type: "custom"` và truyền `custom_base_url`, `custom_api_key`, `custom_model` trong request body.

## 📁 Cấu trúc dự án

```
pixmith/
├── projects/
│   ├── server/              # FastAPI backend
│   │   ├── app.py           # Entrypoint ứng dụng
│   │   ├── defs.py          # Pydantic schemas + constants
│   │   ├── routers/         # HTTP endpoints
│   │   └── services/
│   │       ├── gen_models/  # Adapter cho từng nhà cung cấp AI
│   │       │   ├── tongyi/
│   │       │   ├── doubao/
│   │       │   └── custom/
│   │       └── utils/       # Helper cho frame, ảnh, nhạc, path
│   └── ui/                  # Angular 20 frontend
│       └── src/app/
│           ├── components/
│           ├── services/
│           └── interceptors/
├── cache/                   # Asset đã tạo (gitignored)
├── logs/                    # Log server (gitignored)
├── assets/                  # Asset cho docs (screenshot, v.v.)
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

## 🙏 Cảm ơn

- [FastAPI](https://fastapi.tiangolo.com/)
- [Angular](https://angular.dev/)
- [DashScope](https://dashscope.console.aliyun.com/) (Tongyi)
- [Volcengine](https://www.volcengine.com/) (Doubao)
- [rembg](https://github.com/danielgatis/rembg)
