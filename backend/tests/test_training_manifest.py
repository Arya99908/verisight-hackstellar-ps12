import hashlib
import json
from pathlib import Path

import pytest
from PIL import Image

from app.services.forensic.learned.training_data import load_and_validate_manifest


def _write_manifest(tmp_path: Path) -> tuple[Path, Path, dict]:
    data_root = tmp_path / "authorized-corpus"
    data_root.mkdir()
    permission_record = tmp_path / "permission-record-fixture.txt"
    permission_record.write_text("TEST FIXTURE ONLY; NOT A REAL PERMISSION", encoding="utf-8")
    samples = []
    image_index = 0
    for split in ("train", "validation", "test"):
        for label in ("authentic", "tampered"):
            sample_id = f"{split}-{label}"
            image_path = data_root / f"{sample_id}.png"
            mask_path = data_root / f"{sample_id}-mask.png"
            Image.new("RGB", (16, 16), color=(40 + image_index, 80, 120)).save(image_path)
            image_index += 1
            mask = Image.new("L", (16, 16), color=0 if label == "authentic" else 255)
            mask.save(mask_path)
            samples.append({
                "id": sample_id,
                "image": image_path.name,
                "mask": mask_path.name,
                "split": split,
                "label": label,
                "capture_kind": "captured_authentic" if label == "authentic" else "controlled_edit",
                "groups": {
                    "app_template_id": f"app-{sample_id}",
                    "device_id": f"device-{sample_id}",
                    "contributor_id": f"person-{sample_id}",
                    "original_id": f"original-{sample_id}",
                    "editing_session_id": f"edit-{sample_id}",
                },
            })
    raw = {
        "dataset": {
            "name": "test-only manifest fixture",
            "source": "synthetic files created by this unit test",
            "license_id": "TEST_FIXTURE_DO_NOT_USE",
            "intended_use": "commercial",
            "commercial_use_permitted": True,
            "source_image_rights_confirmed": True,
            "permission_evidence": str(permission_record),
            "permission_evidence_sha256": hashlib.sha256(permission_record.read_bytes()).hexdigest(),
            "permission_reviewed_by": "unit-test-only",
            "permission_reviewed_at": "test-fixture",
        },
        "samples": samples,
    }
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    return manifest_path, data_root, raw


def test_manifest_validator_accepts_complete_permission_metadata_fixture(tmp_path):
    manifest_path, data_root, _ = _write_manifest(tmp_path)
    manifest = load_and_validate_manifest(manifest_path, data_root)
    assert len(manifest.samples) == 6
    assert manifest.dataset["commercial_use_permitted"] is True


def test_manifest_rejects_missing_commercial_permission(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    raw["dataset"]["commercial_use_permitted"] = False
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="explicit permission"):
        load_and_validate_manifest(manifest_path, data_root)


def test_manifest_rejects_synthetic_only_tampering_split(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    raw["samples"][1]["capture_kind"] = "synthetic"
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="captured authentic screenshots and controlled edits"):
        load_and_validate_manifest(manifest_path, data_root)


def test_manifest_rejects_missing_permission_evidence(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    raw["dataset"]["permission_evidence"] = str(tmp_path / "missing-record.txt")
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="existing local record"):
        load_and_validate_manifest(manifest_path, data_root)


def test_manifest_rejects_permission_evidence_inside_repository(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    repository_license = Path(__file__).resolve().parents[2] / "LICENSE"
    raw["dataset"]["permission_evidence"] = str(repository_license)
    raw["dataset"]["permission_evidence_sha256"] = hashlib.sha256(repository_license.read_bytes()).hexdigest()
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="outside the repository"):
        load_and_validate_manifest(manifest_path, data_root)


def test_manifest_rejects_changed_permission_evidence(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    raw["dataset"]["permission_evidence_sha256"] = "0" * 64
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="SHA-256 does not match"):
        load_and_validate_manifest(manifest_path, data_root)


def test_manifest_rejects_source_group_leakage(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    raw["samples"][0]["groups"]["original_id"] = raw["samples"][2]["groups"]["original_id"]
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="Leakage"):
        load_and_validate_manifest(manifest_path, data_root)


def test_manifest_rejects_identical_image_leakage_between_splits(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    raw["samples"][2]["image"] = raw["samples"][0]["image"]
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="byte-identical image"):
        load_and_validate_manifest(manifest_path, data_root)


def test_manifest_rejects_bundled_demo_fixtures(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    fixture_root = tmp_path / "samples"
    fixture_root.mkdir()
    for field in ("image", "mask"):
        name = raw["samples"][0][field]
        (fixture_root / name).write_bytes((data_root / name).read_bytes())
    raw["samples"][0]["image"] = "samples/" + raw["samples"][0]["image"]
    raw["samples"][0]["mask"] = "samples/" + raw["samples"][0]["mask"]
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="demo fixtures"):
        load_and_validate_manifest(manifest_path, tmp_path)


def test_manifest_rejects_path_traversal(tmp_path):
    manifest_path, data_root, raw = _write_manifest(tmp_path)
    raw["samples"][0]["image"] = "../outside.png"
    manifest_path.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="escapes the data root"):
        load_and_validate_manifest(manifest_path, data_root)
