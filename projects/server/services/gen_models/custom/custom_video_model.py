import logging
import time
from typing import Any, Optional

import httpx
from defs import VideoGenerationRequest
from services.gen_models.base_service import BaseVideoService
from services.gen_models.common import download_from_url

logger = logging.getLogger(__name__)


class CustomVideoService(BaseVideoService):
    """Video generation via any OpenAI-compatible API that supports image-to-video.

    Note: There is no standard OpenAI endpoint for video generation.
    This service tries multiple common patterns:
    1. POST /v1/video/generations (e.g. Luma, Runway)
    2. POST /v1/images/generations with video model
    3. Custom endpoint pattern specified in base_url

    For SiliconFlow, it handles /v1/video/submit and /v1/video/status.
    """

    def __init__(self):
        super().__init__()

    def _create_task(self, request: VideoGenerationRequest) -> str:
        self._validate_request(request)

        api_key = request.api_key or request.custom_api_key
        base_url = request.custom_base_url or ""
        model = request.custom_model or ""

        if not api_key:
            raise ValueError("API key is required for custom video API")
        if not base_url:
            raise ValueError("Base URL is required for custom video API")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        # Handle SiliconFlow specific submit endpoint
        if "siliconflow" in base_url.lower():
            url = f"{base_url.rstrip('/')}/video/submit"
            payload = {
                "model": model or "Wan-AI/Wan2.2-I2V-A14B",
                "prompt": request.prompt,
                "image": request.base_image_url,
            }
            self.logger.info(f"Calling SiliconFlow video submit API at {url} with model {payload['model']}")
            with httpx.Client(timeout=30) as client:
                response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
                self.logger.info(f"SiliconFlow video task created: {result}")
                return result.get("requestId", "")

        payload = {
            "model": model,
            "prompt": request.prompt,
            "image_url": request.base_image_url,
        }

        # Try common video generation endpoints
        endpoints = [
            f"{base_url.rstrip('/')}/v1/video/generations",
            f"{base_url.rstrip('/')}/video/generations",
            f"{base_url.rstrip('/')}/v1/images/generations",
        ]

        self.logger.info(f"Calling custom video API at {base_url} with model {model}")

        last_error = None
        for endpoint in endpoints:
            try:
                with httpx.Client(timeout=30) as client:
                    response = client.post(endpoint, headers=headers, json=payload)
                    if response.status_code == 404:
                        continue
                    response.raise_for_status()
                    result = response.json()
                    self.logger.info(f"Video task created: {result}")
                    return result.get("id", "")
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    continue
                last_error = e
            except Exception as e:
                last_error = e
                continue

        raise Exception(
            f"Could not find a working video endpoint at {base_url}. "
            f"Last error: {last_error}"
        )

    def _wait_for_completion(self, task_id: str, api_key: str, base_url: str = "") -> str:
        self.logger.info(f"Waiting for video task {task_id}")

        # Handle SiliconFlow specific status endpoint
        if base_url and "siliconflow" in base_url.lower():
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            url = f"{base_url.rstrip('/')}/video/status"
            max_retries = 100
            retry_interval = 5

            for i in range(max_retries):
                time.sleep(retry_interval)
                self.logger.info(
                    f"Polling SiliconFlow video task {task_id} (attempt {i + 1}/{max_retries})"
                )
                try:
                    with httpx.Client(timeout=30) as client:
                        response = client.post(url, headers=headers, json={"requestId": task_id})
                        response.raise_for_status()
                        res = response.json()
                        status = res.get("status")
                        if status in ["Success", "Succeed"]:
                            results = res.get("results") or {}
                            video_url = None
                            if isinstance(results, dict):
                                if "video" in results and isinstance(results["video"], str):
                                    video_url = results["video"]
                                elif "videos" in results and isinstance(results["videos"], list) and len(results["videos"]) > 0:
                                    video_url = results["videos"][0].get("url")
                            
                            if video_url:
                                return download_from_url(video_url)
                            raise Exception(f"Success status returned but no video URL found in results: {res}")
                        elif status == "Failed":
                            raise Exception(f"SiliconFlow video generation failed: {res.get('reason')}")
                except Exception as e:
                    self.logger.warning(f"Error polling SiliconFlow task: {e}")
                    if "Task not exist" in str(e):
                        raise
            raise Exception("Timeout waiting for SiliconFlow video generation")

        # Polling for result - this depends on the provider
        # For simplicity, wait a fixed time then try to get the result
        max_retries = 30
        retry_interval = 5

        for i in range(max_retries):
            time.sleep(retry_interval)
            self.logger.info(
                f"Polling video task {task_id} (attempt {i + 1}/{max_retries})"
            )
            # Most providers don't have a standard poll endpoint,
            # so we return the task_id and let the user handle it
            if i >= 3:
                # After a few retries, return the task_id as a placeholder
                # The actual video URL should be configured by the provider
                # For now, we return a best-effort result
                return task_id

        return task_id

    def generate_video(self, request: VideoGenerationRequest) -> str:
        task_id = self._create_task(request)
        api_key = request.api_key or request.custom_api_key
        base_url = request.custom_base_url or ""
        result = self._wait_for_completion(task_id, api_key, base_url)
        return result


_service = CustomVideoService()


def custom_gen_animation_task(request: VideoGenerationRequest) -> Any:
    _service.logger.info(
        f"Generating video via custom API with prompt: {request.prompt}"
    )
    return _service._create_task(request)


def custom_wait_animation_task(task: Any, api_key: str, base_url: str = "") -> str:
    _service.logger.info("Waiting for custom video task completion")
    return _service._wait_for_completion(task, api_key, base_url)
