# AdVisor API

Minimal FastAPI service exposing `/extract` for image/video feature extraction.

## Quick start

1. Create and activate a virtualenv

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install requirements

```bash
pip install -r api/requirements.txt
```

3. Run the server

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

- Healthcheck: `GET /health` returns `{ "ok": true, "service": "advisor-api", "version": "0.1.0" }`
- Toggle log level: set env `LOG_LEVEL=DEBUG`

## Endpoints

### GET /health

Returns service health.

### POST /extract

Accepts `multipart/form-data` with a single file field named `file`.
Supports `image/png`, `image/jpeg`, `video/mp4`.

#### Response shape (example)

```json
{
  "ad_id": "abcd1234",
  "media": {"modality": "image", "width": 640, "height": 480, "duration_ms": null, "fps": null},
  "features": {
    "color": {
      "colorfulness": 12.3456,
      "mean_bgr": [100.12, 120.34, 130.56],
      "std_bgr": [10.23, 11.45, 9.87],
      "palette_hex": ["#aabbcc", "#112233", "#445566", "#778899", "#ffffff"]
    },
    "layout": {"aspect_ratio": 1.3333, "whitespace_ratio": 0.1234},
    "video": null,
    "ocr": {"coverage_pct": 0.0, "text": ""},
    "objects": [],
    "logos": {"present": false, "area_pct": 0.0}
  },
  "version": "fx-0.1.0"
}
```

## Minimal tests

- `GET /health` should return `{ ok: true, service: "advisor-api", version: "0.1.0" }`
- Upload a PNG → 200, `media.modality` == `image`, `features.video` == null, `palette_hex` length 5
- Upload an MP4 → 200, `media.modality` == `video`, `features.video.sampled_frames >= 1`, `media.duration_ms` not null when FPS & frames available
- Unsupported file (e.g., GIF) → 415

## cURL examples

```bash
# PNG
curl -s -X POST http://localhost:8000/extract \
  -F "file=@api/data/images/i0001.png" | jq .

# MP4
curl -s -X POST http://localhost:8000/extract \
  -F "file=@/path/to/sample.mp4" | jq .
```

## Environment

Copy `.env.example` to `.env` as needed. No required variables for MVP.

### Optional OCR

OCR is disabled by default. Enable it and install Tesseract to populate `features.ocr`:

```bash
export ENABLE_OCR=1
brew install tesseract   # macOS
# or see: https://tesseract-ocr.github.io/tessdoc/Installation.html
```

`pytesseract` is included in requirements. If Tesseract is not installed or OCR is disabled, the API returns placeholders for `ocr`.

For videos, OCR is aggregated across sampled frames. Control sampling with:

```bash
# target OCR sampling fps for videos (default 10)
export VIDEO_OCR_FPS=10
```


