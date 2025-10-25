import logging
import os
from typing import Dict, Literal, Tuple

from api.schemas import ExtractFeatures, ExtractResponse, MediaInfo
from extractor.pipeline.image_features import extract_from_image
from extractor.pipeline.preprocess import decode_image_from_bytes, write_temp_video_file
from extractor.pipeline.video_features import extract_from_video


logger = logging.getLogger(__name__)


def _build_response(ad_id: str, media: Dict, features: Dict) -> ExtractResponse:
    media_model = MediaInfo(**media)
    features_model = ExtractFeatures(**features)
    return ExtractResponse(ad_id=ad_id, media=media_model, features=features_model)


def run_extraction(ad_id: str, data: bytes, modality: Literal["image", "video"], filename: str) -> ExtractResponse:
    """Dispatch extraction based on modality and build the response model."""
    if modality == "image":
        bgr = decode_image_from_bytes(data)
        media, features = extract_from_image(bgr)
        return _build_response(ad_id, media, features)

    # video path
    video_path = write_temp_video_file(data, filename)
    try:
        media, features = extract_from_video(video_path)
        return _build_response(ad_id, media, features)
    finally:
        try:
            os.remove(video_path)
        except OSError:
            logger.debug("Failed to remove temp video file: %s", video_path)


