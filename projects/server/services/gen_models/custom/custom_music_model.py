import json
import logging
from typing import Optional

import httpx
from defs import (
    DEFAULT_TEXT_ENGINE_MAX_TOKENS,
    MUSIC_GEN_PROMPT,
    MUSIC_SYSTEM_PROMPT,
    MusicGenerationRequest,
    TempChatResponse,
)
from services.gen_models.base_service import BaseMusicService
from services.utils.music_tools import (
    cache_abc_to_file,
    to_chiptune_wav,
    to_original_wav,
)

logger = logging.getLogger(__name__)


class CustomMusicService(BaseMusicService):
    """Music generation via any OpenAI-compatible chat API."""

    def __init__(self):
        super().__init__()
        self.max_tokens = DEFAULT_TEXT_ENGINE_MAX_TOKENS
        self.system_prompt = MUSIC_SYSTEM_PROMPT
        self.user_prompt_template = MUSIC_GEN_PROMPT

    def _build_generation_params(self, request: MusicGenerationRequest) -> dict:
        params = {
            "model": request.custom_model or "gpt-4o",
            "max_tokens": self.max_tokens,
            "temperature": 1.5,
            "messages": [
                {"role": "system", "content": self.system_prompt},
                {
                    "role": "user",
                    "content": self.user_prompt_template.format(
                        duration=request.duration,
                        genre=request.genre,
                        tempo=request.tempo,
                        description=request.prompt,
                    ),
                },
            ],
            "response_format": {"type": "json_object"},
        }
        return params

    def generate_music(self, request: MusicGenerationRequest) -> tuple[str, str]:
        self._validate_request(request)

        params = self._build_generation_params(request)
        api_key = request.api_key or request.custom_api_key
        base_url = request.custom_base_url or "https://api.openai.com/v1"

        if not api_key:
            raise ValueError("API key is required for custom music API")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        url = f"{base_url.rstrip('/')}/chat/completions"
        self.logger.info(
            f"Calling custom music API at {base_url} with model {params['model']}"
        )

        try:
            with httpx.Client(timeout=120) as client:
                response = client.post(url, headers=headers, json=params)
                response.raise_for_status()
                result = response.json()

            content = result["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            notation = parsed.get("notation", "")
            if not notation:
                raise ValueError("No notation in response")

            notation = "\n".join(
                [line for line in notation.splitlines() if line.strip() != ""]
            )

            cache_abc_to_file(notation)
            return (to_original_wav(notation), to_chiptune_wav(notation))

        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"Custom music API error: {e.response.status_code} - {e.response.text}"
            )
            raise Exception(
                f"Custom music API error: {e.response.status_code} - {e.response.text}"
            )
        except Exception as e:
            self.logger.error(f"Failed to generate music via custom API: {str(e)}")
            raise


_service = CustomMusicService()


def custom_gen_abc_music(request: MusicGenerationRequest) -> tuple[str, str]:
    _service.logger.info(
        f"Generating music via custom API with prompt: {request.prompt}"
    )
    return _service.generate_music(request)
