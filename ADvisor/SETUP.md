# Quick Setup Guide

## How Moondream is Connected

The API uses the **Moondream Python SDK** (`moondream` package) which connects to either:
1. **Local Moondream server** running on your machine
2. **Cloud Moondream API** (remote service)

### Architecture

```
Your Flask API (port 5000)
    ↓
Moondream Python SDK
    ↓
Moondream Server (port 2020) or Cloud API
    ↓
Vision Model Analysis
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `flask` - Web API framework
- `flask-cors` - Cross-origin requests
- `moondream` - Moondream Python SDK
- `pillow` - Image processing
- `requests` - HTTP requests

### 2. Start Moondream Server

**Local Server (Recommended):**
```bash
moondream serve
```

This will:
- Download the Moondream model (first time only)
- Start server on `http://localhost:2020/v1`
- Print "Server running on..." when ready

**Cloud API Alternative:**
```bash
export MOONDREAM_API_KEY="your-key-here"
```

Edit `ad_analysis_api.py` line 25-28 and swap:
```python
# Comment out local:
# moondream_model = md.vl(endpoint="http://localhost:2020/v1")

# Uncomment cloud:
moondream_model = md.vl(api_key=os.getenv("MOONDREAM_API_KEY"))
```

### 3. Start the Flask API

In a **new terminal**:
```bash
cd /Users/yashas/Documents/Projects/AdVisor/ADvisor/ADvisor
python ad_analysis_api.py
```

You should see:
```
🌙 Initializing Moondream...
✅ Moondream initialized!

AD ANALYSIS API SERVER
================================================================================
...
* Running on http://0.0.0.0:5000
```

### 4. Test the API

In a **third terminal**:
```bash
python test_api_client.py
```

Or manually:
```bash
# Health check
curl http://localhost:5000/api/health

# Analyze a single ad
curl -X POST -F 'image=@path/to/ad.jpg' http://localhost:5000/api/analyze-ad
```

## How It Works

1. **Flask receives image** (file upload or base64)
2. **Converts to PIL Image** object
3. **Converts to bytes** for Moondream
4. **Calls Moondream SDK** methods:
   - `caption()` - Get image description
   - `query()` - Ask specific questions about the ad
5. **Returns structured JSON/CSV**

### Code Flow Example

```python
# In ad_analysis_api.py

# Initialize connection to Moondream
moondream_model = md.vl(endpoint="http://localhost:2020/v1")

# When image received:
image = Image.open(file)  # PIL Image

# Convert to bytes
img_bytes = io.BytesIO()
image.save(img_bytes, format='PNG')
img_bytes = img_bytes.getvalue()

# Query Moondream
result = moondream_model.query(
    image=img_bytes,
    question="What is this ad about?"
)

answer = result["answer"]  # "This is a Nike shoe advertisement..."
```

## Troubleshooting

### "Cannot connect to Moondream"
- Make sure `moondream serve` is running in another terminal
- Check port 2020 is not blocked

### "Module 'moondream' not found"
```bash
pip install moondream
```

### "Connection refused on port 5000"
- Another app is using port 5000
- Change port in `ad_analysis_api.py` line 241:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

## For Matthew & Sahran

To merge with your endpoint, you can:

### Option 1: Import the function directly
```python
from ad_analysis_api import analyze_ad_image
from PIL import Image

image = Image.open('ad.jpg')
ad_data = analyze_ad_image(image)
# Combine with your vector data
```

### Option 2: Add endpoint to same Flask app
Add your route to `ad_analysis_api.py`:
```python
@app.route('/api/your-endpoint', methods=['POST'])
def your_endpoint():
    # Your code here
    return jsonify(result)
```

Both endpoints will share the same Moondream connection!
