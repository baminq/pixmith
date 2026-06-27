import logging
from typing import Optional

import httpx
from defs import ImageGenerationRequest
from services.gen_models.base_service import BaseImageService
from services.gen_models.common import download_from_url

logger = logging.getLogger(__name__)


class CustomImageService(BaseImageService):
    """Image generation via any OpenAI-compatible API (OpenAI, OpenRouter, etc.)"""

    def __init__(self):
        super().__init__()

    def _build_generation_params(self, request: ImageGenerationRequest) -> dict:
        params = {
            "model": request.custom_model or "dall-e-3",
            "prompt": request.prompt,
            "n": 1,
            "size": request.size.replace("*", "x"),
        }
        if request.seed and request.seed > 0:
            params["seed"] = request.seed
        return params

    def _build_edit_params(self, request):
        raise NotImplementedError("Image editing not supported for custom API")

    def generate(self, request: ImageGenerationRequest) -> str:
        self._validate_request(request)

        params = self._build_generation_params(request)
        api_key = request.api_key or request.custom_api_key
        base_url = request.custom_base_url or "https://api.openai.com/v1"

        if not api_key:
            raise ValueError("API key is required for custom image API")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        url = f"{base_url.rstrip('/')}/images/generations"
        self.logger.info(
            f"Calling custom image API at {base_url} with model {params['model']}"
        )

        try:
            with httpx.Client(timeout=120) as client:
                response = client.post(url, headers=headers, json=params)
                response.raise_for_status()
                result = response.json()

            if not result.get("data"):
                raise Exception("No image data in response")

            image_url = result["data"][0].get("url") or result["data"][0].get(
                "b64_json"
            )
            if not image_url:
                raise Exception("No image URL or base64 data in response")

            if image_url.startswith("data:") or result["data"][0].get("b64_json"):
                import base64

                b64_data = result["data"][0].get(
                    "b64_json",
                    image_url.split(",")[-1] if "," in image_url else image_url,
                )
                cache_path = _save_base64_image(b64_data)
                return cache_path

            return download_from_url(image_url)

        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"Custom image API error: {e.response.status_code} - {e.response.text}"
            )
            raise Exception(
                f"Custom image API error: {e.response.status_code} - {e.response.text}"
            )
        except Exception as e:
            self.logger.error(f"Failed to generate image via custom API: {str(e)}")
            raise


def _save_base64_image(b64_data: str) -> str:
    import base64
    from datetime import datetime

    from services.utils.path import get_cache_file_path

    image_data = base64.b64decode(b64_data)
    cache_path = get_cache_file_path(
        f"custom_img_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    )
    with open(cache_path, "wb") as f:
        f.write(image_data)
    return cache_path


_service = CustomImageService()


def custom_gen_single_image(request: ImageGenerationRequest) -> str:
    _service.logger.info(
        f"Generating image via custom API with prompt: {request.prompt}"
    )
    return _service.generate(request)
