from pathlib import Path

from app.main import app
from app.services.forensic.pipeline import analyze_screenshot
from fastapi.testclient import TestClient

client = TestClient(app)
SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "samples"


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("ok", "HEALTHY")
    assert "VeriSight" in data["service"]


def test_api_demo_samples_list():
    response = client.get("/api/demo-samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) == 5
    sample_ids = [s["id"] for s in samples]
    assert "sample_1" in sample_ids
    assert "sample_2" in sample_ids


def test_sample_1_authentic():
    sample_path = SAMPLES_DIR / "sample_1_authentic_gpay.png"
    assert sample_path.exists()
    with open(sample_path, "rb") as f:
        file_bytes = f.read()

    report = analyze_screenshot(file_bytes, sample_path.name)
    assert report.overall_tamper_score < 35.0
    assert "AUTHENTIC" in report.verdict


def test_sample_2_spliced_amount():
    sample_path = SAMPLES_DIR / "sample_2_spliced_amount.jpg"
    assert sample_path.exists()
    with open(sample_path, "rb") as f:
        file_bytes = f.read()

    report = analyze_screenshot(file_bytes, sample_path.name)
    # Spliced amount should be flagged
    assert report.overall_tamper_score >= 50.0
    assert "AUTHENTIC_VERIFIED" != report.verdict


def test_sample_3_temporal_paradox():
    sample_path = SAMPLES_DIR / "sample_3_fake_generator_paradox.png"
    assert sample_path.exists()
    with open(sample_path, "rb") as f:
        file_bytes = f.read()

    report = analyze_screenshot(file_bytes, sample_path.name)
    assert report.layer3.clock_paradox_detected or report.layer3.upi_utr_valid is False or report.overall_tamper_score >= 40.0


def test_sample_4_whatsapp_laundered():
    sample_path = SAMPLES_DIR / "sample_4_whatsapp_laundered.jpg"
    assert sample_path.exists()
    with open(sample_path, "rb") as f:
        file_bytes = f.read()

    report = analyze_screenshot(file_bytes, sample_path.name)
    assert report.layer3.is_whatsapp_laundered or "WhatsApp" in report.layer3.channel_detected or "Social Media" in report.layer3.channel_detected


def test_sample_5_cloned_receipt():
    sample_path = SAMPLES_DIR / "sample_5_cloned_chat_receipt.jpg"
    assert sample_path.exists()
    with open(sample_path, "rb") as f:
        file_bytes = f.read()

    report = analyze_screenshot(file_bytes, sample_path.name)
    assert report.overall_tamper_score >= 35.0


def test_api_analyze_sample_endpoint():
    response = client.post("/api/analyze-sample/sample_1")
    assert response.status_code == 200
    data = response.json()
    assert "overall_tamper_score" in data
    assert "verdict" in data
    assert "layer1" in data
    assert "layer2" in data
    assert "layer3" in data
    assert "synergy" in data
