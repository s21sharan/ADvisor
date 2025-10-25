# Ad Analysis API

REST API endpoint for analyzing advertisements using Moondream vision model. Returns structured JSON or CSV data with ad summaries and metadata.

## Features

- Analyze single or multiple ad images
- Extract: summary, brand, category, text, keywords, CTA, target audience
- Output formats: JSON or CSV
- Ready for integration with other endpoints/services

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Start Moondream server:**

You have two options:

**Option A: Local Moondream Server (Recommended)**
```bash
moondream serve
```
This starts Moondream on `http://localhost:2020/v1`

**Option B: Cloud Moondream API**
```bash
export MOONDREAM_API_KEY="your-api-key"
```
Then uncomment the cloud API line in `ad_analysis_api.py`:
```python
# moondream_model = md.vl(api_key=os.getenv("MOONDREAM_API_KEY"))
```

3. **Start the API server:**
```bash
python ad_analysis_api.py
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "model": "moondream2",
  "endpoints": [...]
}
```

### 2. Analyze Single Ad
```bash
POST /api/analyze-ad
```

**Request (file upload):**
```bash
curl -X POST -F 'image=@path/to/ad.jpg' http://localhost:5000/api/analyze-ad
```

**Request (base64 JSON):**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQ..."}' \
  http://localhost:5000/api/analyze-ad
```

**Response:**
```json
{
  "summary": "Advertisement for Nike running shoes targeting athletes",
  "caption": "Running shoes on track with athletic person",
  "brand": "Nike",
  "product_category": "fitness",
  "extracted_text": "Just Do It. Summer Sale 30% Off",
  "keywords": ["running", "sports", "fitness", "performance", "athletic"],
  "cta": "Shop Now for 30% off",
  "target_audience": "Young adults 18-35, fitness enthusiasts, runners"
}
```

### 3. Analyze Multiple Ads (Batch)
```bash
POST /api/analyze-ads-batch?format=json  # or format=csv
```

**Request (multiple files):**
```bash
curl -X POST \
  -F 'images=@ad1.jpg' \
  -F 'images=@ad2.jpg' \
  -F 'images=@ad3.jpg' \
  http://localhost:5000/api/analyze-ads-batch
```

**Request (JSON with base64 images):**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "images": [
      {"image": "base64data1", "filename": "ad1.jpg"},
      {"image": "base64data2", "filename": "ad2.jpg"}
    ]
  }' \
  http://localhost:5000/api/analyze-ads-batch
```

**Response (JSON format):**
```json
[
  {
    "id": 0,
    "filename": "ad1.jpg",
    "summary": "...",
    "brand": "...",
    "product_category": "...",
    ...
  },
  {
    "id": 1,
    "filename": "ad2.jpg",
    ...
  }
]
```

**Response (CSV format):**
```
id,filename,summary,brand,product_category,extracted_text,keywords,cta,target_audience,caption
0,ad1.jpg,"Nike running shoes",Nike,fitness,"Just Do It. 30% Off","running, sports, fitness","Shop Now","Young adults",""
...
```

## Testing

Run the test client:
```bash
python test_api_client.py
```

This will:
1. Check API health
2. Analyze a single ad (JSON output)
3. Analyze multiple ads (JSON output)
4. Analyze multiple ads (CSV output - saved to `ad_analysis_output.csv`)

## Integration with Other Endpoints

Since Matthew and Sahran need to merge this with another endpoint, here's how to integrate:

### Option 1: Direct Function Import
```python
from ad_analysis_api import analyze_ad_image
from PIL import Image

# In your endpoint
image = Image.open('ad.jpg')
result = analyze_ad_image(image)
# Now you have the structured data to combine with your vector/embedding
```

### Option 2: HTTP Request to This API
```python
import requests

response = requests.post(
    'http://localhost:5000/api/analyze-ad',
    files={'image': open('ad.jpg', 'rb')}
)
ad_data = response.json()
# Combine with your data
```

### Option 3: Same Flask App (Recommended)
Add your endpoint to `ad_analysis_api.py`:

```python
@app.route('/api/combined-analysis', methods=['POST'])
def combined_analysis():
    # Get image
    image = Image.open(request.files['image'].stream).convert('RGB')

    # Get ad analysis from Moondream
    ad_data = analyze_ad_image(image)

    # Get your vector/embedding data
    vector_data = your_vector_function(image)

    # Combine both
    return jsonify({
        "ad_analysis": ad_data,
        "vector_data": vector_data
    })
```

## Output Fields

| Field | Description | Example |
|-------|-------------|---------|
| `summary` | One-sentence description of the ad | "Nike running shoes advertisement" |
| `caption` | Brief visual description | "Running shoes on a track" |
| `brand` | Brand/company name | "Nike" |
| `product_category` | Product category | "fitness" |
| `extracted_text` | Text visible in ad | "Just Do It. 30% Off" |
| `keywords` | 3-5 main themes (array) | ["running", "sports", "fitness"] |
| `cta` | Call-to-action message | "Shop Now" |
| `target_audience` | Intended audience | "Young adults 18-35, fitness enthusiasts" |

## Notes

- Model loads on startup (takes ~30 seconds)
- First request may be slow due to model warm-up
- Supports JPG, PNG image formats
- GPU acceleration automatic if available
- CORS enabled for frontend integration
