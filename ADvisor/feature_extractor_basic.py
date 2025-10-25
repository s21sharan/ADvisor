"""
Basic Feature Extractor for AdVisor
====================================

This is a SIMPLE prototype extractor that processes images and videos
to extract CreativeFeatures for the Community Recommender.

NOTE: This is NOT Matthew's full Feature Extraction Engine.
This is a basic version to test the routing pipeline with real ad data.

Matthew will replace this with advanced computer vision, audio analysis, etc.

Dependencies: Pillow (images), opencv-python (videos)
Install: pip install pillow opencv-python numpy
"""

import os
from pathlib import Path
from typing import List, Tuple, Optional
from dataclasses import asdict
import json

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("⚠️  Missing dependencies. Install with: pip install pillow numpy")
    exit(1)

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    print("⚠️  opencv-python not installed. Video analysis will be limited.")
    print("   Install with: pip install opencv-python")
    HAS_CV2 = False

# Import our data models
from community_recommender import CreativeFeatures, BrandMeta


def analyze_image_basic(image_path: str) -> dict:
    """
    Extract basic features from a static image ad.

    Returns dict with:
    - avg_brightness: 0-1 (how bright the image is)
    - color_variance: 0-1 (how varied the colors are - proxy for "busy-ness")
    - dominant_color_name: string guess at dominant color
    """
    img = Image.open(image_path).convert('RGB')
    img_array = np.array(img)

    # Average brightness
    brightness = np.mean(img_array) / 255.0

    # Color variance (how "busy" the image is)
    color_variance = np.std(img_array) / 128.0  # normalize to ~0-1

    # Dominant color (very rough heuristic)
    avg_r = np.mean(img_array[:, :, 0])
    avg_g = np.mean(img_array[:, :, 1])
    avg_b = np.mean(img_array[:, :, 2])

    # Simple color naming
    if avg_r > avg_g and avg_r > avg_b:
        dominant_color = "warm/red tones"
    elif avg_b > avg_r and avg_b > avg_g:
        dominant_color = "cool/blue tones"
    elif avg_g > avg_r and avg_g > avg_b:
        dominant_color = "green tones"
    else:
        dominant_color = "neutral/balanced"

    return {
        "avg_brightness": brightness,
        "color_variance": color_variance,
        "dominant_color": dominant_color
    }


def analyze_video_basic(video_path: str) -> dict:
    """
    Extract basic features from a video ad.

    Returns dict with:
    - duration_sec: length in seconds
    - avg_motion_intensity: 0-1 (how much movement between frames)
    - frame_count: total frames
    - estimated_pacing: "slow", "medium", "fast"
    """
    if not HAS_CV2:
        return {
            "duration_sec": 0,
            "avg_motion_intensity": 0.5,
            "frame_count": 0,
            "estimated_pacing": "medium"
        }

    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps > 0 else 0

    # Sample frames to estimate motion
    motion_scores = []
    prev_frame = None
    sample_interval = max(1, frame_count // 20)  # Sample ~20 frames

    for i in range(0, frame_count, sample_interval):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_frame is not None:
            # Frame difference as motion proxy
            diff = cv2.absdiff(gray, prev_frame)
            motion_score = np.mean(diff) / 255.0
            motion_scores.append(motion_score)

        prev_frame = gray

    cap.release()

    avg_motion = np.mean(motion_scores) if motion_scores else 0.5

    # Estimate pacing based on motion
    if avg_motion < 0.05:
        pacing = "slow"
    elif avg_motion < 0.15:
        pacing = "medium"
    else:
        pacing = "fast"

    return {
        "duration_sec": duration,
        "avg_motion_intensity": avg_motion,
        "frame_count": frame_count,
        "estimated_pacing": pacing
    }


def infer_creative_features(
    file_path: str,
    is_video: bool,
    analysis_data: dict
) -> CreativeFeatures:
    """
    Convert low-level analysis into CreativeFeatures dataclass.

    This uses HEURISTICS and GUESSES. Matthew's real extractor will be much better.
    """

    filename = Path(file_path).stem

    if is_video:
        # Video-specific inference
        motion = analysis_data.get("avg_motion_intensity", 0.5)
        pacing = analysis_data.get("estimated_pacing", "medium")
        duration = analysis_data.get("duration_sec", 0)

        # Guess visual style based on motion
        if motion > 0.2:
            visual_style = "high energy fast cuts"
        elif motion < 0.08:
            visual_style = "minimal calm"
        else:
            visual_style = "moderate pacing"

        # Guess sentiment based on motion (very rough!)
        if motion > 0.2:
            sentiment_tone = "urgent / high energy"
        else:
            sentiment_tone = "calm / reassuring"

        # Motion intensity is directly available
        motion_intensity = min(motion * 5, 1.0)  # scale up

        # Audio profile - we can't actually analyze audio without more libraries
        # So we guess based on motion
        if motion > 0.2:
            audio_voice_profile = "high energy voiceover or music"
        else:
            audio_voice_profile = "soft voiceover or calm music"

        # CTA text - we can't do OCR easily, so we make generic guesses
        cta_text = "Learn More"  # default guess

        # Logo presence - we can't detect this easily, guess medium
        logo_presence_intensity = 0.5

    else:
        # Image-specific inference
        brightness = analysis_data.get("avg_brightness", 0.5)
        variance = analysis_data.get("color_variance", 0.5)
        dominant_color = analysis_data.get("dominant_color", "neutral")

        # Guess visual style
        if variance < 0.3 and brightness > 0.6:
            visual_style = "clean minimal aesthetic"
        elif variance > 0.6:
            visual_style = "busy colorful design"
        elif "cool" in dominant_color:
            visual_style = "calm professional"
        else:
            visual_style = "warm inviting"

        # Images are static
        pacing = "static"
        motion_intensity = 0.0

        # Sentiment guess based on brightness and color
        if brightness > 0.6 and "warm" in dominant_color:
            sentiment_tone = "friendly / inviting"
        elif brightness < 0.4:
            sentiment_tone = "serious / premium"
        else:
            sentiment_tone = "balanced / professional"

        # No audio in images
        audio_voice_profile = "no audio (static image)"

        # CTA guess
        cta_text = "Shop Now"  # default for images

        # Logo presence guess
        logo_presence_intensity = 0.6  # images often have visible logos

    # Themes - we can't extract these without NLP on text in the ad
    # For now, leave empty or make very generic guesses
    themes = ["product showcase"]  # generic

    # Demographics - we can't detect faces/people without face detection
    demographics_explicitly_shown = []  # leave empty for now

    return CreativeFeatures(
        visual_style=visual_style,
        pacing=pacing,
        cta_text=cta_text,
        sentiment_tone=sentiment_tone,
        logo_presence_intensity=logo_presence_intensity,
        motion_intensity=motion_intensity,
        audio_voice_profile=audio_voice_profile,
        themes=themes,
        demographics_explicitly_shown=demographics_explicitly_shown
    )


def extract_features_from_file(file_path: str) -> CreativeFeatures:
    """
    Main entry point: extract features from an image or video file.
    """
    file_ext = Path(file_path).suffix.lower()

    if file_ext in ['.png', '.jpg', '.jpeg']:
        is_video = False
        analysis = analyze_image_basic(file_path)
    elif file_ext in ['.mp4', '.mov', '.avi']:
        is_video = True
        analysis = analyze_video_basic(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")

    return infer_creative_features(file_path, is_video, analysis)


def infer_category_from_image(image_path: str) -> tuple[str, list[str], str, str]:
    """
    Try to infer product category by analyzing the actual image content.

    Returns: (category, target_keywords, value_prop, price_tier)

    Uses simple heuristics based on colors, content, etc.
    In production, Matthew's OCR + LLM would do this properly.
    """
    from PIL import Image
    import numpy as np

    img = Image.open(image_path).convert('RGB')
    img_array = np.array(img)

    # Calculate average colors
    avg_r = np.mean(img_array[:, :, 0])
    avg_g = np.mean(img_array[:, :, 1])
    avg_b = np.mean(img_array[:, :, 2])

    # Get brightness and saturation proxy
    brightness = (avg_r + avg_g + avg_b) / 3
    color_variance = np.std(img_array)

    # Simple heuristic categorization based on visual characteristics
    # (This is VERY crude - Matthew's extractor will be way better)

    # Dark images with low saturation -> sleep/wellness/premium
    if brightness < 100 and color_variance < 80:
        return ("sleep-wellness", ["sleep", "rest", "comfort", "quality"],
                "improve your sleep quality", "premium")

    # Bright colorful high-variance -> food/retail/fun
    elif brightness > 140 and color_variance > 90:
        return ("food-retail", ["food", "meal", "eat", "tasty"],
                "delicious and convenient", "mid")

    # Orange/yellow dominant -> fitness/energy/action
    elif avg_r > avg_b + 20 and avg_r > avg_g:
        return ("fitness-gym", ["gym", "fitness", "workout", "membership"],
                "get fit and save money", "budget")

    # Blue/teal dominant -> tech/health/professional
    elif avg_b > avg_r + 15:
        return ("health-tech", ["health", "technology", "smart", "control"],
                "take control of your health", "premium")

    # Default fallback
    else:
        return ("general-retail", ["product", "quality", "value"],
                "solve your needs", "mid")


def create_default_brand_meta(filename: str, file_path: Optional[str] = None) -> BrandMeta:
    """
    Since we don't have brand metadata, infer it from the image.

    In production, this would come from the advertiser at upload time.
    For testing, we make educated guesses based on visual analysis.
    """
    if file_path and os.path.exists(file_path):
        try:
            category, keywords, value_prop, price = infer_category_from_image(file_path)
        except:
            # Fallback if image analysis fails
            category = "unknown"
            keywords = ["general audience"]
            value_prop = "solve customer needs"
            price = "mid"
    else:
        category = "unknown"
        keywords = ["general audience"]
        value_prop = "solve customer needs"
        price = "mid"

    return BrandMeta(
        product_name=f"Product_{filename}",
        category=category,
        price_positioning=price,
        claimed_value_prop=value_prop,
        target_keywords=keywords
    )


if __name__ == "__main__":
    # Test on a single image
    test_image = os.path.expanduser("~/Downloads/ads/images/i0001.png")

    if os.path.exists(test_image):
        print("Testing feature extractor on sample image...")
        features = extract_features_from_file(test_image)
        print(json.dumps(asdict(features), indent=2))
    else:
        print(f"Test file not found: {test_image}")
