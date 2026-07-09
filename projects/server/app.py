import logging
import os
import sys
from logging.handlers import TimedRotatingFileHandler

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from routers.generation_router import router as generation_router
from services.utils.path import get_cache_folder, get_log_folder

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def setup_logging():
    logs_dir = get_log_folder()
    os.makedirs(logs_dir, exist_ok=True)

    log_file_pattern = os.path.join(logs_dir, "pixmith_server.log")

    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    file_handler = TimedRotatingFileHandler(
        log_file_pattern, when="midnight", interval=1, backupCount=30, encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    current_log_file = file_handler.baseFilename
    logger = logging.getLogger(__name__)
    logger.info(
        f"Logging initialized. Daily log rotation enabled. Current log file: {os.path.basename(current_log_file)}"
    )

    return current_log_file


log_file = setup_logging()
logger = logging.getLogger(__name__)


app = FastAPI(
    title="Pixmith Server",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frames_dir = os.path.join(get_cache_folder(), "frames")
os.makedirs(frames_dir, exist_ok=True)

music_dir = os.path.join(get_cache_folder(), "music")
os.makedirs(music_dir, exist_ok=True)

app.include_router(generation_router)

app.mount("/frames", StaticFiles(directory=frames_dir), name="frames")
app.mount("/music", StaticFiles(directory=music_dir), name="music")

logger.info("Active endpoints:")
for route in app.routes:
    if isinstance(route, APIRoute):
        logger.info(f"{list(route.methods)} {route.path}")


@app.get("/")
async def root():
    return {"message": "Pixmith Server", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(app, host=host, port=port)
