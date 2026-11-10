import socket
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.core.schemas import (
    DemoSampleMeta,
    ForensicAnalysisReport,
    WhatsAppSimulationResponse,
)
from app.services.forensic.pipeline import analyze_screenshot
from app.simulation.whatsapp_pipeline import run_whatsapp_simulation

router = APIRouter()

# In-memory storage for latest mobile upload (for stage judge real-time sync)
_LATEST_MOBILE_UPLOAD: dict[str, Any] | None = None

@router.get("/health")
async def health_check():
    """Health and readiness endpoint."""
    return {
        "status": "HEALTHY",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "active_layers": ["L1_Signal", "L2_Typography_Geometry", "L3_Metadata_Protocol", "L4_Ensemble_Synergy"]
    }

@router.get("/network-info")
async def get_network_info():
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

    qr_url = f"http://{local_ip}:5174/?mode=mobile"

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
            title="Sample 1 — Genuine GPay UPI (₹1,250.00)",
            scenario="Authentic mobile screenshot with mathematically aligned baselines, uniform noise, and valid UTR.",
            expected_verdict="AUTHENTIC_VERIFIED",
            target_score_range="4% – 9%",
            description="Native capture, zero macroblock compression outliers, aligned typography lasers, seamless card background.",
            tags=["Genuine", "UPI", "GPay", "Aligned"],
            url="/samples/sample_1_authentic_gpay.png"
        ),
        DemoSampleMeta(
            id="sample_2",
            filename="sample_2_spliced_amount.jpg",
            title="Sample 2 — Pixel-Spliced Amount (₹95,250.00)",
            scenario="Amount altered with an off-color patch (ΔE=5.2), +3.5px baseline laser drop, and zero-noise wavelet void.",
            expected_verdict="MANIPULATED_FORGERY",
            target_score_range="91% – 97%",
            description="Layer 1 ELA/Wavelet outlier + Layer 2 Baseline Laser critical drift + CIELAB patch alert.",
            tags=["Spliced", "Forgery", "High-Risk", "Baseline Drift"],
            url="/samples/sample_2_spliced_amount.jpg"
        ),
        DemoSampleMeta(
            id="sample_3",
            filename="sample_3_fake_generator_paradox.png",
            title="Sample 3 — Fake Generator / DOM Edit",
            scenario="Uniform PNG with status-bar clock paradox (11:12 vs 11:45 AM) and invalid 10-digit UTR.",
            expected_verdict="MANIPULATED_FORGERY",
            target_score_range="86% – 93%",
            description="Caught by Layer 3 Temporal Paradox Clock Drift & 10-digit UPI Reference checksum violation.",
            tags=["DOM Edit", "Generator", "Clock Paradox", "Fake UTR"],
            url="/samples/sample_3_fake_generator_paradox.png"
        ),
        DemoSampleMeta(
            id="sample_4",
            filename="sample_4_whatsapp_laundered.jpg",
            title="Sample 4 — WhatsApp-Forwarded Forgery",
            scenario="Sample 2 passed through WhatsApp delivery (EXIF stripped, 4:2:0 subsampling, JPEG Q=77).",
            expected_verdict="MANIPULATED_FORGERY",
            target_score_range="82% – 89%",
            description="Laundered metadata detected; Layer 2 Baseline Laser and Wavelet noise boundaries survive compression.",
            tags=["WhatsApp", "Laundered", "Re-compressed", "Surviving Geometry"],
            url="/samples/sample_4_whatsapp_laundered.jpg"
        ),
        DemoSampleMeta(
            id="sample_5",
            filename="sample_5_cloned_chat_receipt.jpg",
            title="Sample 5 — Copy-Move Cloned Digits",
            scenario="Digit sequence cloned to inflate balance; non-native cropped viewport (680x1120).",
            expected_verdict="MANIPULATED_FORGERY",
            target_score_range="85% – 92%",
            description="Layer 1 ORB Copy-Move detects parallel translation vectors; Layer 3 flags non-native viewport.",
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

    return analyze_screenshot(content, filename=filename)

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
async def mobile_upload(file: UploadFile = File(...)):
    """
    Mobile upload route accessed by stage judges scanning the QR code on their phones.
    Stores latest upload in memory for instant desktop sync.
    """
    global _LATEST_MOBILE_UPLOAD
    content = await file.read()
    report = analyze_screenshot(content, filename=file.filename or "mobile_upload.jpg")

    _LATEST_MOBILE_UPLOAD = {
        "filename": file.filename or "mobile_upload.jpg",
        "timestamp": report.timestamp,
        "report": report.model_dump()
    }

    return {"status": "SUCCESS", "message": "Screenshot uploaded and analyzed.", "verdict": report.verdict}

@router.get("/latest-mobile-upload")
async def get_latest_mobile_upload(clear: bool = False):
    """
    Desktop workbench polling endpoint. Returns latest phone upload if available.
    """
    global _LATEST_MOBILE_UPLOAD
    data = _LATEST_MOBILE_UPLOAD
    if clear:
        _LATEST_MOBILE_UPLOAD = None
    return {"latest": data}
