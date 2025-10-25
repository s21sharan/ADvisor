"""
Test client for ad analysis API
"""

import requests
import json
from pathlib import Path

API_URL = "http://localhost:5000"

def test_health():
    """Test health check endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{API_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_single_ad(image_path):
    """Test single ad analysis"""
    print(f"Analyzing single ad: {image_path}")
    with open(image_path, 'rb') as f:
        response = requests.post(
            f"{API_URL}/api/analyze-ad",
            files={'image': f}
        )
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_batch_ads_json(image_paths):
    """Test batch ad analysis (JSON output)"""
    print(f"Analyzing {len(image_paths)} ads (JSON format)...")
    files = [('images', open(img, 'rb')) for img in image_paths]
    response = requests.post(
        f"{API_URL}/api/analyze-ads-batch",
        files=files
    )
    for f in files:
        f[1].close()

    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_batch_ads_csv(image_paths):
    """Test batch ad analysis (CSV output)"""
    print(f"Analyzing {len(image_paths)} ads (CSV format)...")
    files = [('images', open(img, 'rb')) for img in image_paths]
    response = requests.post(
        f"{API_URL}/api/analyze-ads-batch?format=csv",
        files=files
    )
    for f in files:
        f[1].close()

    print(f"Status: {response.status_code}")
    print("CSV Output:")
    print(response.text)
    print()

    # Save to file
    with open('ad_analysis_output.csv', 'w') as f:
        f.write(response.text)
    print("Saved to: ad_analysis_output.csv\n")


if __name__ == "__main__":
    print("="*80)
    print("AD ANALYSIS API TEST CLIENT")
    print("="*80 + "\n")

    # Test health
    test_health()

    # Find some test images
    ads_folder = Path.home() / "Downloads" / "ads" / "images"
    if ads_folder.exists():
        images = list(ads_folder.glob("*.jpg")) + list(ads_folder.glob("*.png"))
        images = images[:3]  # Test with first 3 images

        if images:
            # Test single ad
            test_single_ad(str(images[0]))

            # Test batch (JSON)
            test_batch_ads_json([str(img) for img in images])

            # Test batch (CSV)
            test_batch_ads_csv([str(img) for img in images])
        else:
            print("No images found in ~/Downloads/ads/images/")
    else:
        print(f"Ads folder not found: {ads_folder}")
        print("Please update the ads_folder path in this script")
