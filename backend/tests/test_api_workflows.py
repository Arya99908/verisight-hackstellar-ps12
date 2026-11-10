from pathlib import Path
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
SAMPLES_DIR = Path(__file__).resolve().parents[2] / "samples"


def test_each_demo_endpoint_matches_its_published_verdict():
    samples = client.get("/api/demo-samples").json()
    assert len(samples) == 5
    for sample in samples:
        response = client.post(f"/api/analyze-sample/{sample['id']}")
        assert response.status_code == 200
        assert response.json()["verdict"] == sample["expected_verdict"]


def test_unknown_demo_sample_is_a_404():
    response = client.post("/api/analyze-sample/not-a-sample")
    assert response.status_code == 404


def test_upload_analysis_endpoint_accepts_an_image():
    image = (SAMPLES_DIR / "sample_1_authentic_gpay.png").read_bytes()
    response = client.post(
        "/api/analyze",
        files={"file": ("capture.png", image, "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["filename"] == "capture.png"


def test_whatsapp_simulation_endpoint_returns_comparison():
    image = (SAMPLES_DIR / "sample_1_authentic_gpay.png").read_bytes()
    response = client.post(
        "/api/simulate-whatsapp",
        files={"file": ("capture.png", image, "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["simulated_image_b64"].startswith("data:image/")
    assert response.json()["reanalysis"]["file_sha256"]


def test_production_mobile_upload_requires_paired_session(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    image = (SAMPLES_DIR / "sample_1_authentic_gpay.png").read_bytes()
    response = client.post(
        "/api/mobile-upload",
        files={"file": ("capture.png", image, "image/png")},
    )
    assert response.status_code == 400


def test_mobile_upload_is_delivered_only_to_its_session():
    session_id = str(uuid4())
    image = (SAMPLES_DIR / "sample_1_authentic_gpay.png").read_bytes()
    uploaded = client.post(
        f"/api/mobile-upload?session_id={session_id}",
        files={"file": ("phone.png", image, "image/png")},
    )
    assert uploaded.status_code == 200
    assert uploaded.json()["status"] == "SUCCESS"

    other_session = client.get(f"/api/latest-mobile-upload?session_id={uuid4()}")
    assert other_session.status_code == 200
    assert other_session.json()["report"] is None

    paired_session = client.get(f"/api/latest-mobile-upload?session_id={session_id}")
    assert paired_session.status_code == 200
    assert paired_session.json()["report"]["filename"] == "phone.png"
