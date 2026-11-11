"""Loader/inference contract tests use only locally initialized test weights.

They verify software behavior and are not model-accuracy or payment-screenshot
validation. A separate, licensed checkpoint evaluation requires approved data.
"""

import io
import pickle

import numpy as np
import pytest
from PIL import Image

torch = pytest.importorskip("torch", reason="install backend/requirements-training.txt for mask model tests")

from app.services.forensic.learned.inference import infer_mask_bytes, load_mask_model
from app.services.forensic.learned.model import ScreenshotMaskUNet


def _test_checkpoint(path):
    model = ScreenshotMaskUNet()
    torch.save({
        "format_version": 1,
        "architecture_id": ScreenshotMaskUNet.architecture_id,
        "metadata": {"status": "TEST_ONLY_RANDOM_INITIALIZATION"},
        "state_dict": model.state_dict(),
    }, path)


def test_model_checkpoint_load_and_mask_inference_smoke(tmp_path):
    checkpoint = tmp_path / "test-only-untrained.pt"
    _test_checkpoint(checkpoint)
    model = load_mask_model(checkpoint)

    image = Image.new("RGB", (192, 288), color=(25, 90, 170))
    payload = io.BytesIO()
    image.save(payload, format="PNG")
    mask = infer_mask_bytes(model, payload.getvalue())

    assert mask.shape == (288, 192)
    assert mask.dtype == np.float32
    assert np.isfinite(mask).all()
    assert float(mask.min()) >= 0.0
    assert float(mask.max()) <= 1.0


def test_model_loader_rejects_unknown_checkpoint_architecture(tmp_path):
    checkpoint = tmp_path / "wrong-architecture.pt"
    torch.save({"format_version": 1, "architecture_id": "unknown", "state_dict": {}}, checkpoint)
    with pytest.raises(ValueError, match="architecture"):
        load_mask_model(checkpoint)


def test_model_loader_rejects_missing_checkpoint(tmp_path):
    with pytest.raises(FileNotFoundError, match="does not exist"):
        load_mask_model(tmp_path / "missing.pt")


def test_model_loader_rejects_corrupt_checkpoint(tmp_path):
    checkpoint = tmp_path / "corrupt.pt"
    checkpoint.write_bytes(b"not a checkpoint")
    with pytest.raises((RuntimeError, ValueError, OSError, EOFError, pickle.UnpicklingError)):
        load_mask_model(checkpoint)


@pytest.mark.parametrize("payload", [b"", b"not-an-image"])
def test_model_inference_rejects_empty_or_corrupt_image_bytes(tmp_path, payload):
    checkpoint = tmp_path / "test-only-untrained.pt"
    _test_checkpoint(checkpoint)
    model = load_mask_model(checkpoint)
    with pytest.raises(ValueError, match="empty|corrupt"):
        infer_mask_bytes(model, payload)
