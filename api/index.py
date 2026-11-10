"""Vercel ASGI entry point for the FastAPI forensic API."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
for path in (ROOT, BACKEND):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from backend.app.main import app  # noqa: E402

handler = app
