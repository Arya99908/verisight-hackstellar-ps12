"""Server-only persistence for analysis summaries; never store uploaded image bytes."""
import logging
import os
import httpx

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
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.post(
                f"{url}/rest/v1/forensic_cases",
                headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "Prefer": "return=minimal"},
                json=row,
            )
            response.raise_for_status()
        return True
    except Exception:
        log.exception("Supabase forensic case persistence failed")
        return False
