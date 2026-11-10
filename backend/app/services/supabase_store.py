"""Server-only persistence for analysis summaries; never store uploaded image bytes."""
import logging
import os
import asyncio
import json
from urllib.request import Request, urlopen

log = logging.getLogger(__name__)

async def save_case(report, source: str = "web") -> bool:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        return False
    row = {
        "file_sha256": report.file_sha256,
        "filename": (report.filename or "evidence image")[:255],
        "image_width": report.image_width,
        "image_height": report.image_height,
        "overall_tamper_score": report.overall_tamper_score,
        "confidence_score": report.confidence_score,
        "verdict": report.verdict,
        "channel_detected": report.channel_detected,
        "findings": [x.model_dump(mode="json") for x in report.findings],
        "layer_summary": {
            "layer1": report.layer1.model_dump(mode="json", exclude={"ela_b64", "wavelet_noise_b64", "clone_b64"}),
            "layer2": report.layer2.model_dump(mode="json"),
            "layer3": report.layer3.model_dump(mode="json"),
            "layer4": report.layer4.model_dump(mode="json"),
        },
        "source": source,
    }
    def send():
        request = Request(
            f"{url}/rest/v1/forensic_cases",
            data=json.dumps(row).encode(),
            headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "Prefer": "return=minimal"},
            method="POST",
        )
        with urlopen(request, timeout=8) as response:
            return 200 <= response.status < 300
    try:
        return await asyncio.to_thread(send)
    except Exception:
        log.exception("Supabase forensic case persistence failed")
        return False


async def database_status() -> str:
    """Return a safe connectivity status without exposing credentials or rows."""
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        return "NOT_CONFIGURED"

    def check() -> bool:
        request = Request(
            f"{url}/rest/v1/forensic_cases?select=id&limit=0",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
        )
        with urlopen(request, timeout=4) as response:
            return 200 <= response.status < 300

    try:
        return "HEALTHY" if await asyncio.to_thread(check) else "UNAVAILABLE"
    except Exception:
        log.warning("Supabase health check failed")
        return "UNAVAILABLE"
