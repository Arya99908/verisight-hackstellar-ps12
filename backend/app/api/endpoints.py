import socket
import os
from uuid import UUID, uuid4
from urllib.parse import quote, urlsplit
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel

from app.core.config import settings
from app.core.schemas import (
    DemoSampleMeta,
    ForensicAnalysisReport,
    WhatsAppSimulationResponse,
)
from app.services.forensic.pipeline import analyze_screenshot
from app.services.supabase_store import database_status, save_case
from app.services.mobile_upload_store import (
    ALLOWED_UPLOAD_TYPES,
    consume_mobile_upload,
    create_signed_upload,
    save_mobile_image,
)
from app.simulation.whatsapp_pipeline import run_whatsapp_simulation

router = APIRouter()

# In-memory storage for latest mobile upload (for stage judge real-time sync)
_LATEST_MOBILE_UPLOAD: dict[str, Any] | None = None


class UploadSessionRequest(BaseModel):
    filename: str
    content_type: str
    size: int
    session_id: UUID | None = None


@router.post("/upload-session")
async def create_upload_session(payload: UploadSessionRequest):
    """Issue a one-file, signed Storage upload so large phone files avoid function body limits."""
    if payload.size < 1 or payload.size > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Choose an image smaller than 20 MB.")
    content_type = payload.content_type.split(";", 1)[0].strip().lower()
    if content_type not in ALLOWED_UPLOAD_TYPES:
        raise HTTPException(status_code=415, detail="Use a PNG, JPG, WebP, or BMP screenshot.")

    session_id = payload.session_id or uuid4()
    try:
        upload = await create_signed_upload(session_id, payload.filename)
        supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        if not supabase_url:
            raise RuntimeError("Supabase Storage is not configured")
        upload_url = (
            f"{supabase_url}/storage/v1/object/upload/sign/mobile-evidence/"
            f"{quote(upload['path'], safe='/')}?token={quote(upload['token'])}"
        )
        public_storage_key = os.getenv("SUPABASE_ANON_KEY", "")
        if not public_storage_key:
            raise RuntimeError("Supabase public storage key is not configured")
        return {
            "session_id": str(session_id),
            "upload_url": upload_url,
            "storage_key": public_storage_key,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Secure screenshot upload is temporarily unavailable. Please try again.",
        ) from exc


@router.post("/analyze-upload-session/{session_id}", response_model=ForensicAnalysisReport)
async def analyze_upload_session(session_id: UUID):
    """Analyze a screenshot already placed in private Storage, then consume and delete it."""
    try:
        report = await consume_mobile_upload(session_id)
        if report is None:
            raise HTTPException(status_code=404, detail="Screenshot upload was not found or was already used.")
        return report
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail="The uploaded screenshot could not be retrieved or analyzed. Please try again with a PNG, JPG, WebP, or BMP file.",
        ) from exc

@router.get("/health")
async def health_check():
    """Health and readiness endpoint."""
    return {
        "status": "HEALTHY",
        "database": await database_status(),
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "active_layers": ["L1_Signal", "L2_Typography_Geometry", "L3_Metadata_Protocol", "L4_Ensemble_Synergy"]
    }

@router.get("/network-info")
async def get_network_info(request: Request):
    """
    Auto-detects the host machine's local LAN IP address for the Stage Judge Mobile Upload QR code.
    """
    local_ip = "127.0.0.1"
    try:
        # Create a UDP socket to discover the primary outbound interface IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.1)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        try:
            local_ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            local_ip = "127.0.0.1"

    origin = request.headers.get("origin")
    referer = request.headers.get("referer")
    if not origin and referer:
        parsed = urlsplit(referer)
        if parsed.scheme and parsed.netloc:
            origin = f"{parsed.scheme}://{parsed.netloc}"
    if not origin:
        forwarded_host = request.headers.get("x-forwarded-host")
        forwarded_proto = request.headers.get("x-forwarded-proto", request.url.scheme)
        host = forwarded_host or request.headers.get("host", f"{local_ip}:5174")
        origin = f"{forwarded_proto}://{host}"

    qr_url = f"{origin}/?mode=mobile"

    return {
        "local_ip": local_ip,
        "frontend_port": 5174,
        "backend_port": 8101,
        "mobile_upload_url": qr_url
    }

@router.get("/demo-samples", response_model=list[DemoSampleMeta])
async def get_demo_samples():
    """Returns the 5 golden demonstration screenshots and metadata."""
    samples = [
        DemoSampleMeta(
            id="sample_1",
            filename="sample_1_authentic_gpay.png",
            title="Sample 1 — Clean Synthetic Payment UI (₹1,250.00)",
            scenario="Synthetic clean baseline used to demonstrate low anomaly indicators; it is not a genuine bank or payment receipt.",
            expected_verdict="LIKELY_AUTHENTIC",
            target_score_range="0% – 15%",
            description="Clean synthetic fixture with no corroborated manipulation indicators. The result does not verify a real payment or origin.",
            tags=["Clean Baseline", "Synthetic", "UPI-style", "Aligned"],
            url="/samples/sample_1_authentic_gpay.png"
        ),
        DemoSampleMeta(
            id="sample_2",
            filename="sample_2_spliced_amount.jpg",
            title="Sample 2 — Pixel-Spliced Amount (₹95,250.00)",
            scenario="Amount altered with an off-color patch (ΔE=5.2), +3.5px baseline laser drop, and zero-noise wavelet void.",
            expected_verdict="MANIPULATED_FORGERY",
            target_score_range="70% – 92%",
            description="Synthetic fixture with an edited amount and corroborating geometry and pixel-level review cues.",
            tags=["Spliced", "Forgery", "High-Risk", "Baseline Drift"],
            url="/samples/sample_2_spliced_amount.jpg"
        ),
        DemoSampleMeta(
            id="sample_3",
            filename="sample_3_fake_generator_paradox.png",
            title="Sample 3 — Fake Generator / DOM Edit",
            scenario="Uniform PNG with status-bar clock paradox (11:12 vs 11:45 AM) and invalid 10-digit UTR.",
            expected_verdict="MANIPULATED_FORGERY",
            target_score_range="72% – 92%",
            description="Synthetic fixture with conflicting displayed times and a reference-format mismatch; checks are heuristics, not bank verification.",
            tags=["DOM Edit", "Generator", "Clock Paradox", "Fake UTR"],
            url="/samples/sample_3_fake_generator_paradox.png"
        ),
        DemoSampleMeta(
            id="sample_4",
            filename="sample_4_whatsapp_laundered.jpg",
            title="Sample 4 — WhatsApp-Forwarded Forgery",
            scenario="Sample 2 passed through WhatsApp delivery (EXIF stripped, 4:2:0 subsampling, JPEG Q=77).",
            expected_verdict="MANIPULATED_FORGERY",
            target_score_range="70% – 92%",
            description="Recompressed synthetic edited fixture; compression alone is not considered proof, so the result relies on combined review cues.",
            tags=["WhatsApp", "Laundered", "Re-compressed", "Surviving Geometry"],
            url="/samples/sample_4_whatsapp_laundered.jpg"
        ),
        DemoSampleMeta(
            id="sample_5",
            filename="sample_5_cloned_chat_receipt.jpg",
            title="Sample 5 — Copy-Move Cloned Digits",
            scenario="Digit sequence cloned to inflate balance; non-native cropped viewport (680x1120).",
            expected_verdict="SUSPICIOUS_ANOMALIES",
            target_score_range="25% – 70%",
            description="Synthetic cloned-region fixture. Copy-move matching is a review cue and can match repeated interface elements.",
            tags=["Copy-Move", "Cloned Digits", "ORB", "Cropped Viewport"],
            url="/samples/sample_5_cloned_chat_receipt.jpg"
        )
    ]
    return samples

@router.post("/analyze", response_model=ForensicAnalysisReport)
async def analyze_upload(file: UploadFile = File(...)):
    """Upload and run full 4-layer forensic investigation on any screenshot."""
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds 20MB limit.")
    
    try:
        report = analyze_screenshot(content, filename=file.filename or "upload.png")
        await save_case(report, "upload")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensic investigation failed: {e!s}")

@router.post("/analyze-sample", response_model=ForensicAnalysisReport)
async def analyze_sample(sample_id: str = Form(...)):
    """Instantly executes the 4-layer pipeline against a golden demo sample via form body."""
    return await execute_sample_analysis(sample_id)

@router.post("/analyze-sample/{sample_id}", response_model=ForensicAnalysisReport)
async def analyze_sample_path(sample_id: str):
    """Instantly executes the 4-layer pipeline against a golden demo sample via path parameter."""
    return await execute_sample_analysis(sample_id)

async def execute_sample_analysis(sample_id: str) -> ForensicAnalysisReport:
    sample_files = {
        "sample_1": "sample_1_authentic_gpay.png",
        "sample_2": "sample_2_spliced_amount.jpg",
        "sample_3": "sample_3_fake_generator_paradox.png",
        "sample_4": "sample_4_whatsapp_laundered.jpg",
        "sample_5": "sample_5_cloned_chat_receipt.jpg"
    }
    filename = sample_files.get(sample_id)
    if not filename:
        raise HTTPException(status_code=404, detail="Unknown sample ID.")

    sample_path = settings.SAMPLES_DIR / filename
    if not sample_path.exists():
        from samples.generator import generate_all_samples
        generate_all_samples()

    with open(sample_path, "rb") as f:
        content = f.read()

    report = analyze_screenshot(content, filename=filename)
    await save_case(report, "synthetic_sample")
    return report

@router.post("/simulate-whatsapp", response_model=WhatsAppSimulationResponse)
async def simulate_whatsapp(file: UploadFile = File(...)):
    """Simulates WhatsApp laundering on an uploaded image and returns before vs after comparison."""
    content = await file.read()
    try:
        sim_response = run_whatsapp_simulation(content, filename=file.filename or "image.png")
        return sim_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e!s}")

@router.post("/mobile-upload")
async def mobile_upload(request: Request, file: UploadFile = File(...)):
    """
    Mobile upload route accessed by stage judges scanning the QR code on their phones.
    Pairs the upload to the desktop session; Vercel uses private Supabase Storage
    because serverless instances do not share in-memory state.
    """
    global _LATEST_MOBILE_UPLOAD
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds 20MB limit.")
    session_text = request.query_params.get("session_id")
    session_id: UUID | None = None
    if session_text:
        try:
            session_id = UUID(session_text)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid mobile session.") from exc
    if os.getenv("VERCEL") and session_id is None:
        raise HTTPException(status_code=400, detail="Open this upload page from the desktop QR code.")

    # Local development keeps the existing in-memory handoff. Production
    # stores the image privately until the paired desktop retrieves it.
    if os.getenv("VERCEL"):
        stored = await save_mobile_image(session_id, file.filename or "mobile_upload.jpg", content)
        if not stored:
            raise HTTPException(status_code=503, detail="Could not queue the upload for the desktop session.")
        return {"status": "SUCCESS", "message": "Screenshot queued for the paired desktop workbench."}

    report = analyze_screenshot(content, filename=file.filename or "mobile_upload.jpg")

    _LATEST_MOBILE_UPLOAD = {
        "session_id": str(session_id) if session_id else None,
        "filename": file.filename or "mobile_upload.jpg",
        "timestamp": report.timestamp,
        "report": report.model_dump()
    }
    await save_case(report, "mobile_upload")

    return {"status": "SUCCESS", "message": "Screenshot uploaded and analyzed.", "verdict": report.verdict}

@router.get("/latest-mobile-upload")
async def get_latest_mobile_upload(clear: bool = False, session_id: UUID | None = None):
    """
    Desktop workbench polling endpoint. Returns the upload paired to this session.
    """
    global _LATEST_MOBILE_UPLOAD
    if os.getenv("VERCEL"):
        if session_id is None:
            return {"report": None}
        try:
            report = await consume_mobile_upload(session_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Could not retrieve the mobile upload.") from e
        return {"report": report}

    data = _LATEST_MOBILE_UPLOAD
    if session_id and data and data.get("session_id") != str(session_id):
        data = None
    if clear:
        _LATEST_MOBILE_UPLOAD = None
    return {"report": data.get("report") if data else None}
