"""
API endpoint for ad analysis using Moondream
Returns structured JSON/CSV with ad summaries and info
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import json
import csv
import io
import base64
from pathlib import Path
from PIL import Image
import moondream as md

app = Flask(__name__)
CORS(app)

# Initialize Moondream model
print("🌙 Initializing Moondream...")

# Using Moondream cloud API
moondream_model = md.vl(api_key=os.getenv("MOONDREAM_API_KEY"))

print("✅ Moondream initialized!\n")


def analyze_ad_image(image):
    """Analyze an ad image using Moondream and extract structured info"""

    # Convert PIL image to bytes for Moondream API
    img_byte_arr = io.BytesIO()
    # Convert to RGB if needed (for PNG with transparency)
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGB')
    image.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()

    # Get caption first
    caption_result = moondream_model.caption(image=img_byte_arr)
    caption = caption_result.get("caption", "")

    # Query specific fields using Moondream
    summary = moondream_model.query(
        image=img_byte_arr,
        question="Describe this advertisement in one sentence. What product or service is being advertised?"
    ).get("answer", "")

    category = moondream_model.query(
        image=img_byte_arr,
        question="What category does this ad belong to: food, fitness, technology, fashion, beauty, wellness, automotive, travel, finance, or other?"
    ).get("answer", "")

    text_content = moondream_model.query(
        image=img_byte_arr,
        question="What text is visible in this ad? List any prices, offers, slogans, or headlines."
    ).get("answer", "")

    keywords_raw = moondream_model.query(
        image=img_byte_arr,
        question="What are 3-5 main themes or keywords for this ad? Separate with commas."
    ).get("answer", "")

    cta = moondream_model.query(
        image=img_byte_arr,
        question="What is the call-to-action or main message of this ad?"
    ).get("answer", "")

    brand = moondream_model.query(
        image=img_byte_arr,
        question="What brand or company is this ad for?"
    ).get("answer", "")

    target_audience = moondream_model.query(
        image=img_byte_arr,
        question="Who is the target audience for this ad? (e.g., age group, gender, interests)"
    ).get("answer", "")

    # Parse keywords
    keywords = [k.strip().lower() for k in keywords_raw.split(",") if k.strip()][:5]

    return {
        "summary": summary.strip(),
        "caption": caption.strip(),
        "brand": brand.strip(),
        "product_category": category.strip().lower(),
        "extracted_text": text_content.strip(),
        "keywords": keywords,
        "cta": cta.strip(),
        "target_audience": target_audience.strip()
    }


@app.route('/api/analyze-ad', methods=['POST'])
def analyze_ad_endpoint():
    """
    Endpoint to analyze a single ad image

    Accepts:
    - Multipart file upload (image)
    - JSON with base64 encoded image

    Returns: JSON with ad analysis
    """
    try:
        # Check if image is uploaded as file
        if 'image' in request.files:
            file = request.files['image']
            image = Image.open(file.stream).convert('RGB')

        # Check if image is in JSON as base64
        elif request.is_json and 'image' in request.json:
            image_data = request.json['image']
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]

            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        else:
            return jsonify({"error": "No image provided"}), 400

        # Analyze the ad
        result = analyze_ad_image(image)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/analyze-ads-batch', methods=['POST'])
def analyze_ads_batch_endpoint():
    """
    Endpoint to analyze multiple ad images

    Accepts: Multiple files or array of base64 images
    Returns: JSON array or CSV with all ad analyses
    """
    try:
        format_type = request.args.get('format', 'json')  # json or csv
        results = []

        # Handle multiple file uploads
        if request.files:
            files = request.files.getlist('images')
            for i, file in enumerate(files):
                image = Image.open(file.stream).convert('RGB')
                result = analyze_ad_image(image)
                result['filename'] = file.filename
                result['id'] = i
                results.append(result)

        # Handle JSON array of base64 images
        elif request.is_json and 'images' in request.json:
            images_data = request.json['images']
            for i, img_data in enumerate(images_data):
                # Remove data URL prefix if present
                if isinstance(img_data, dict):
                    image_str = img_data.get('image', img_data.get('data', ''))
                    filename = img_data.get('filename', f'image_{i}')
                else:
                    image_str = img_data
                    filename = f'image_{i}'

                if ',' in image_str:
                    image_str = image_str.split(',')[1]

                image_bytes = base64.b64decode(image_str)
                image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

                result = analyze_ad_image(image)
                result['filename'] = filename
                result['id'] = i
                results.append(result)

        else:
            return jsonify({"error": "No images provided"}), 400

        # Return based on format
        if format_type == 'csv':
            # Convert to CSV
            output = io.StringIO()
            if results:
                fieldnames = ['id', 'filename', 'summary', 'brand', 'product_category',
                             'extracted_text', 'keywords', 'cta', 'target_audience', 'caption']
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()

                for result in results:
                    # Convert keywords list to comma-separated string
                    row = result.copy()
                    row['keywords'] = ', '.join(result['keywords'])
                    writer.writerow(row)

            csv_data = output.getvalue()
            return Response(
                csv_data,
                mimetype='text/csv',
                headers={'Content-Disposition': 'attachment; filename=ad_analysis.csv'}
            )
        else:
            return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "moondream2",
        "endpoints": [
            "/api/analyze-ad",
            "/api/analyze-ads-batch",
            "/api/health"
        ]
    })


if __name__ == '__main__':
    print("\n" + "="*80)
    print("AD ANALYSIS API SERVER")
    print("="*80)
    print("\nEndpoints:")
    print("  POST /api/analyze-ad - Analyze single ad image")
    print("  POST /api/analyze-ads-batch - Analyze multiple ads (returns JSON or CSV)")
    print("  GET  /api/health - Health check")
    print("\nUsage:")
    print("  curl -X POST -F 'image=@ad.jpg' http://localhost:5000/api/analyze-ad")
    print("  curl -X POST -F 'images=@ad1.jpg' -F 'images=@ad2.jpg' http://localhost:5000/api/analyze-ads-batch")
    print("  curl http://localhost:5000/api/analyze-ads-batch?format=csv (for CSV output)")
    print("\n" + "="*80 + "\n")

    app.run(host='0.0.0.0', port=5000, debug=True)
