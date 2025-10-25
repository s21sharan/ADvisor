import logging
import os
from typing import Dict, List, Tuple

import cv2
import numpy as np

from extractor.pipeline.image_features import extract_from_image
from extractor.pipeline.ocr import compute_ocr_stats


logger = logging.getLogger(__name__)


def _sample_frame_indices(total_frames: int, max_samples: int = 40) -> List[int]:
    if total_frames <= 0:
        return []
    samples = min(total_frames, max_samples)
    return [int(round(i * (total_frames - 1) / (samples - 1))) for i in range(samples)] if samples > 1 else [0]


def _compute_motion_and_cuts(frames_gray: List[np.ndarray], fps: float) -> Tuple[float, float, int]:
    if len(frames_gray) < 2:
        return 0.0, 0.0, len(frames_gray)
    diffs = []
    for a, b in zip(frames_gray[:-1], frames_gray[1:]):
        diff = np.mean(np.abs(a.astype(np.float32) - b.astype(np.float32)))
        diffs.append(diff)
    motion = float(np.round(float(np.mean(diffs)), 4)) if diffs else 0.0
    # Cut detection via threshold at mean + 2*std
    threshold = float(np.mean(diffs) + 2.0 * np.std(diffs)) if diffs else float("inf")
    cuts = int(np.sum(np.array(diffs) > threshold)) if diffs else 0
    # Normalize per minute using fps and frames_between_diffs
    per_minute = 0.0
    if fps and fps > 0 and len(frames_gray) > 1:
        seconds = (len(frames_gray) - 1) / fps
        per_minute = float(np.round((cuts / seconds) * 60.0, 4)) if seconds > 0 else 0.0
    return motion, per_minute, len(frames_gray)


def extract_from_video(path: str) -> Tuple[Dict, Dict]:
    """Open video, sample frames, compute motion and cuts; compute image features on a representative frame."""
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise RuntimeError("Failed to open video")

    fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    duration_ms = int(round((total_frames / fps) * 1000.0)) if fps and total_frames else None

    indices = _sample_frame_indices(total_frames, max_samples=40)
    frames_gray: List[np.ndarray] = []
    representative_bgr: np.ndarray = None  # type: ignore[assignment]

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok:
            continue
        if representative_bgr is None:
            representative_bgr = frame.copy()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        frames_gray.append(gray)

    cap.release()

    if representative_bgr is None:
        # fallback: create empty image to keep contract
        representative_bgr = np.zeros((max(1, height), max(1, width), 3), dtype=np.uint8)

    motion, cuts_per_min, sampled = _compute_motion_and_cuts(frames_gray, fps)

    media = {
        "modality": "video",
        "width": int(width),
        "height": int(height),
        "duration_ms": int(duration_ms) if duration_ms is not None else None,
        "fps": float(np.round(fps, 4)) if fps else None,
    }

    # Reuse image feature extraction on a representative frame
    _, image_features = extract_from_image(representative_bgr)
    # Aggregate OCR across sampled frames if enabled
    try:
        if os.getenv("ENABLE_OCR", "false").lower() in {"1", "true", "yes"}:
            # target FPS for OCR across video
            target_fps = float(os.getenv("VIDEO_OCR_FPS", "10"))
            # derive indices for OCR sampling
            if fps and fps > 0:
                duration_s = total_frames / fps
                desired = max(1, int(round(duration_s * max(0.1, target_fps))))
                desired = min(desired, 60)
                if desired <= 1:
                    ocr_indices = [0]
                else:
                    ocr_indices = [int(round(i * (total_frames - 1) / (desired - 1))) for i in range(desired)]
            else:
                # fallback to even sampling if fps unknown
                samples = min(total_frames, 40)
                ocr_indices = [int(round(i * (total_frames - 1) / (samples - 1))) for i in range(samples)] if samples > 1 else [0]

            texts: List[str] = []
            coverages: List[float] = []
            cap2 = cv2.VideoCapture(path)
            for idx in ocr_indices:
                cap2.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ok, frame = cap2.read()
                if not ok:
                    continue
                stats = compute_ocr_stats(frame)
                text = str(stats.get("text", ""))
                if text:
                    texts.append(text)
                coverages.append(float(stats.get("coverage_pct", 0.0)))
            cap2.release()

            # Combine texts by unique word order-preserving
            seen = set()
            combined_words: List[str] = []
            for t in texts:
                for w in t.split():
                    if w not in seen:
                        seen.add(w)
                        combined_words.append(w)
            combined_text = " ".join(combined_words)
            avg_coverage = float(np.round(np.mean(coverages), 4)) if coverages else 0.0
            image_features["ocr"] = {"coverage_pct": avg_coverage, "text": combined_text}
    except Exception as exc:  # pragma: no cover
        logger.debug("Video OCR aggregation failed: %s", exc)
    image_features["video"] = {
        "sampled_frames": int(sampled),
        "motion_intensity": float(motion),
        "cuts_per_min": float(cuts_per_min),
        "text_first_second_pct": 0.0,
        "audio_energy": 0.0,
    }

    return media, image_features


