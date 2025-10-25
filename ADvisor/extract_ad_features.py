"""
Extract features from ads using Moondream vision model
Saves results to JSON for use in routing
"""

import os
import json
import io
import ssl
from pathlib import Path
from PIL import Image
import moondream as md

# Fix SSL certificate verification issue on macOS
import urllib.request
ssl._create_default_https_context = ssl._create_unverified_context

print("🌙 Setting up Moondream vision model...")

# Initialize Moondream - using cloud API
try:
    moondream_model = md.vl(api_key=os.getenv("MOONDREAM_API_KEY"))
    print("✅ Moondream ready!\n")
except Exception as e:
    print(f"❌ Error connecting to Moondream: {e}")
    print("   Make sure MOONDREAM_API_KEY environment variable is set")
    exit(1)


def analyze_image(image_path):
    """Analyze an image and extract ad features"""
    print(f"   📸 Analyzing {Path(image_path).name}...")

    image = Image.open(image_path)

    # Convert to RGB if needed (for PNG with transparency)
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGB')

    # Use Moondream to analyze the ad
    # Get a caption first
    caption_result = moondream_model.caption(image=image)
    caption = caption_result.get("caption", "")

    # Ask specific questions
    summary = moondream_model.query(
        image=image,
        question="Describe this advertisement in one sentence. What product is being advertised?"
    )["answer"]

    category = moondream_model.query(
        image=image,
        question="What category: food, fitness, technology, fashion, sleep, wellness, or other?"
    )["answer"]

    text_content = moondream_model.query(
        image=image,
        question="What text is visible in this ad? List any prices, offers, or headlines."
    )["answer"]

    keywords_raw = moondream_model.query(
        image=image,
        question="What are 3-5 main themes of this ad? Separate with commas."
    )["answer"]

    cta = moondream_model.query(
        image=image,
        question="What is the call-to-action?"
    )["answer"]

    # Parse keywords
    keywords = [k.strip().lower() for k in keywords_raw.split(",") if k.strip()][:5]

    return {
        "filename": Path(image_path).name,
        "type": "image",
        "summary": summary.strip(),
        "caption": caption.strip(),
        "product_category": category.strip().lower(),
        "extracted_text": text_content.strip(),
        "keywords": keywords,
        "cta": cta.strip()
    }


def analyze_video(video_path):
    """Analyze a video by extracting and analyzing multiple frames"""
    print(f"   🎥 Analyzing {Path(video_path).name}...")

    import subprocess
    import glob

    # Create temp directory for frames
    temp_dir = f"/tmp/{Path(video_path).stem}_frames"
    os.makedirs(temp_dir, exist_ok=True)

    # Extract frames at 10 fps
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", "fps=10",
        f"{temp_dir}/frame_%04d.png", "-y"
    ]

    subprocess.run(cmd, capture_output=True, check=True)

    # Get all extracted frames
    frames = sorted(glob.glob(f"{temp_dir}/frame_*.png"))

    if not frames:
        print(f"      ❌ No frames extracted")
        return None

    print(f"      📸 Extracted {len(frames)} frames, analyzing...")

    # Analyze each frame and collect results
    all_summaries = []
    all_captions = []
    all_keywords = []
    all_text = []
    all_ctas = []
    categories = {}

    for i, frame_path in enumerate(frames):
        try:
            frame_result = analyze_image(frame_path)

            # Collect data from each frame
            all_summaries.append(frame_result["summary"])
            all_captions.append(frame_result["caption"])
            all_keywords.extend(frame_result["keywords"])
            all_text.append(frame_result["extracted_text"])
            all_ctas.append(frame_result["cta"])

            # Count categories to find most common
            cat = frame_result["product_category"]
            categories[cat] = categories.get(cat, 0) + 1

        except Exception as e:
            print(f"      ⚠️  Frame {i+1} error: {e}")
            continue

    # Clean up temp frames
    for frame in frames:
        os.remove(frame)
    os.rmdir(temp_dir)

    # Aggregate results
    # Use most common category
    product_category = max(categories.items(), key=lambda x: x[1])[0] if categories else "other"

    # Combine unique keywords
    unique_keywords = list(set(all_keywords))[:5]

    # Create a comprehensive summary by combining ALL frame summaries
    # Sample frames evenly throughout the video to get full coverage
    num_frames = len(all_summaries)
    if num_frames <= 5:
        # Use all summaries if we have 5 or fewer frames
        sample_indices = range(num_frames)
    else:
        # Sample evenly across the video: beginning, middle sections, and end
        sample_indices = [
            0,  # First frame
            num_frames // 4,  # 25% through
            num_frames // 2,  # Middle
            3 * num_frames // 4,  # 75% through
            num_frames - 1  # Last frame
        ]

    sampled_summaries = [all_summaries[i] for i in sample_indices]
    combined_summary = " ".join(sampled_summaries)

    # Use the most detailed caption
    caption = max(all_captions, key=len) if all_captions else ""

    # Combine all extracted text
    extracted_text = " ".join([t for t in all_text if t.strip()])

    # Use first non-empty CTA
    cta = next((c for c in all_ctas if c.strip()), "")

    result = {
        "filename": Path(video_path).name,
        "type": "video",
        "summary": combined_summary[:500],  # Limit length
        "caption": caption[:1000],  # Limit length
        "product_category": product_category,
        "extracted_text": extracted_text[:500],  # Limit length
        "keywords": unique_keywords,
        "cta": cta
    }

    return result


def process_ads_folder(folder_path):
    """Process all images and videos in ads folder"""
    folder = Path(os.path.expanduser(folder_path))

    # Find all media files
    image_exts = {".png", ".jpg", ".jpeg"}
    video_exts = {".mp4", ".mov", ".avi"}

    images = list(folder.glob("images/*.*"))
    images = [f for f in images if f.suffix.lower() in image_exts]

    videos = list(folder.glob("videos/*.*"))
    videos = [f for f in videos if f.suffix.lower() in video_exts]

    print(f"📂 Found {len(images)} images and {len(videos)} videos\n")

    all_features = []

    # Process images
    print("📸 Processing images...")
    for img in sorted(images):
        try:
            features = analyze_image(str(img))
            all_features.append(features)
            print(f"      ✓ {features['product_category']}")
        except Exception as e:
            print(f"      ❌ Error: {e}")

    # Process videos
    print("\n🎥 Processing videos...")
    for vid in sorted(videos):
        try:
            features = analyze_video(str(vid))
            all_features.append(features)
            print(f"      ✓ {features['product_category']}")
        except Exception as e:
            print(f"      ❌ Error: {e}")

    return all_features


if __name__ == "__main__":
    # Process ads folder
    ads_folder = "~/Downloads/ads"

    print("="*80)
    print("MOONDREAM AD FEATURE EXTRACTION")
    print("="*80 + "\n")

    features = process_ads_folder(ads_folder)

    # Save to JSON
    output_file = "moondream_ad_features.json"
    with open(output_file, "w") as f:
        json.dump(features, f, indent=2)

    print(f"\n✅ Processed {len(features)} ads")
    print(f"✅ Saved to: {output_file}")

    # Print summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)

    categories = {}
    for f in features:
        cat = f.get("product_category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1

    print("\nProduct Categories:")
    for cat, count in sorted(categories.items()):
        print(f"  • {cat}: {count} ads")
