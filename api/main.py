import logging
import os
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


API_SERVICE_NAME = "advisor-api"
API_VERSION = "0.1.0"


def _configure_logging() -> None:
    """Configure root logging based on LOG_LEVEL env var (default INFO)."""
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(level=level, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


_configure_logging()
logger = logging.getLogger(__name__)


app = FastAPI(title=API_SERVICE_NAME, version=API_VERSION)

# CORS: allow all origins for MVP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Basic healthcheck endpoint."""
    return {"ok": True, "service": API_SERVICE_NAME, "version": API_VERSION}


# Routers
try:
    # Ensure project root is on sys.path so `extractor` package is importable when running from api/
    project_root = Path(__file__).resolve().parents[1]
    if str(project_root) not in sys.path:
        sys.path.append(str(project_root))

    from api.routes.extract import router as extract_router
    from api.routes.brandmeta import router as brandmeta_router

    app.include_router(extract_router)
    logger.info("/extract route registered")

    app.include_router(brandmeta_router)
    logger.info("/brandmeta route registered")
except Exception as exc:  # pragma: no cover - safe startup if route missing during dev
    logger.warning("Failed to register /extract route: %s", exc)


