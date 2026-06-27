import httpx
import sys

sys.stdout.reconfigure(encoding='utf-8')

api_key = "sk-naotvlpobfjbtoygvirrgjavxrekotoqrmogjgdlslosikgh"
base_url = "https://api.siliconflow.com/v1"
url = f"{base_url}/images/generations"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

params = {
    "model": "Tongyi-MAI/Z-Image-Turbo",
    "prompt": "A high-resolution 2D pixel-art game asset depicting young man, pose, wearing hat on face, wearing armor on body, wearing shoes on feet, against a solid dark gray background",
    "n": 1,
    "size": "1024x1024"
}

try:
    print("Testing COM image generation POST request...")
    with httpx.Client(timeout=120) as client:
        response = client.post(url, headers=headers, json=params)
        print(f"COM status: {response.status_code}")
        print(f"COM response: {response.text}")
except Exception as e:
    print(f"COM error: {e}")
