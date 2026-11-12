from pathlib import Path
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
SAMPLES_DIR = Path(__file__).resolve().parents[2] / "samples"


def test_each_demo_endpoint_matches_its_published_verdict():
    samples = client.get("/api/demo-samples").json()
    assert len(samples) == 6
    for sample in samples:
        response = client.post(f"/api/analyze-sample/{sample['id']}")
        assert response.status_code == 200
        if sample["id"].startswith("sample_"):
            assert response.json()["verdict"] == sample["expected_verdict"]
        else:
            assert response.json()["filename"] == sample["filename"]
            assert response.json()["confidence_score"] is None


def test_unknown_demo_sample_is_a_404():
    response = client.post("/api/analyze-sample/not-a-sample")
    assert response.status_code == 404


def test_model_status_does_not_claim_a_trained_classifier():
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEURISTIC_ONLY"
    assert data["active_model_id"] is None
    assert data["calibration_status"] == "NOT_CALIBRATED"


def test_model_evaluation_reports_missing_validation_data():
    response = client.get("/api/model/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "NOT_EVALUATED"
    assert data["dataset_summary"]["synthetic_fixtures"] == 5
    assert data["dataset_summary"]["held_out_test_samples"] == 0
    assert data["metrics"] is None


def test_client_side_routes_serve_the_spa_entrypoint():
    for path in ("/workbench", "/evaluation"):
        response = client.get(path)
        assert response.status_code == 200
        assert 'id="root"' in response.text


def test_upload_analysis_endpoint_accepts_an_image():
    image = (SAMPLES_DIR / "sample_1_clean_synthetic_ui.png").read_bytes()
    response = client.post(
        "/api/analyze",
        files={"file": ("capture.png", image, "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["filename"] == "capture.png"


def test_upload_analysis_rejects_unsupported_media_type():
    response = client.post(
        "/api/analyze",
        files={"file": ("animated.gif", b"not an allowed image", "image/gif")},
    )
    assert response.status_code == 415


def test_upload_analysis_returns_client_error_for_empty_or_corrupt_images():
    for payload in (b"", b"not an image"):
        response = client.post(
            "/api/analyze",
            files={"file": ("broken.png", payload, "image/png")},
        )
        assert response.status_code == 422


def test_whatsapp_simulation_rejects_unsupported_media_type():
    response = client.post(
        "/api/simulate-whatsapp",
        files={"file": ("animated.gif", b"not an allowed image", "image/gif")},
    )
    assert response.status_code == 415


def test_signed_upload_session_rejects_empty_and_oversized_files():
    empty = client.post(
        "/api/upload-session",
        json={"filename": "empty.png", "content_type": "image/png", "size": 0},
    )
    oversized = client.post(
        "/api/upload-session",
        json={"filename": "large.png", "content_type": "image/png", "size": 20 * 1024 * 1024 + 1},
    )
    assert empty.status_code == 422
    assert oversized.status_code == 413


def test_whatsapp_simulation_endpoint_returns_comparison():
    image = (SAMPLES_DIR / "sample_1_clean_synthetic_ui.png").read_bytes()
    response = client.post(
        "/api/simulate-whatsapp",
        files={"file": ("capture.png", image, "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["simulated_image_b64"].startswith("data:image/")
    assert response.json()["reanalysis"]["file_sha256"]


def test_production_mobile_upload_requires_paired_session(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    image = (SAMPLES_DIR / "sample_1_clean_synthetic_ui.png").read_bytes()
    response = client.post(
        "/api/mobile-upload",
        files={"file": ("capture.png", image, "image/png")},
    )
    assert response.status_code == 400


def test_mobile_upload_is_delivered_only_to_its_session():
    session_id = str(uuid4())
    image = (SAMPLES_DIR / "sample_1_clean_synthetic_ui.png").read_bytes()
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
