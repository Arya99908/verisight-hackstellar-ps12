"""Safe local checkpoint loading and pixel-mask inference helpers."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

from app.services.forensic.learned.model import ScreenshotMaskUNet, torch


CHECKPOINT_FORMAT_VERSION = 1


def load_mask_model(checkpoint_path: str | Path, device: str = "cpu") -> ScreenshotMaskUNet:
    """Load only a VeriSight state-dict checkpoint (never arbitrary pickle objects)."""
    path = Path(checkpoint_path)
    if not path.is_file():
        raise FileNotFoundError(f"Model checkpoint does not exist: {path}")

    try:
        payload: Any = torch.load(path, map_location=device, weights_only=True)
    except TypeError as exc:  # Do not silently fall back to unsafe pickle loading.
        raise RuntimeError("This PyTorch build must support safe weights_only checkpoint loading.") from exc

    if not isinstance(payload, dict):
        raise ValueError("Checkpoint must be a dictionary of tensor state and metadata.")
    if payload.get("format_version") != CHECKPOINT_FORMAT_VERSION:
        raise ValueError("Unsupported checkpoint format version.")
    if payload.get("architecture_id") != ScreenshotMaskUNet.architecture_id:
        raise ValueError("Checkpoint architecture does not match this mask model.")
    state_dict = payload.get("state_dict")
    if not isinstance(state_dict, dict):
        raise ValueError("Checkpoint is missing its model state_dict.")

    model = ScreenshotMaskUNet()
    model.load_state_dict(state_dict, strict=True)
    model.to(device)
    model.eval()
    return model


def infer_mask(model: ScreenshotMaskUNet, image_rgb: np.ndarray) -> np.ndarray:
    """Return a 0..1 pixel mask resized to the supplied RGB image dimensions."""
    if not isinstance(image_rgb, np.ndarray) or image_rgb.ndim != 3 or image_rgb.shape[2] != 3:
        raise ValueError("Expected a non-empty HxWx3 RGB uint8 image.")
    if image_rgb.size == 0 or image_rgb.shape[0] == 0 or image_rgb.shape[1] == 0:
        raise ValueError("Image is empty.")
    if image_rgb.dtype != np.uint8:
        raise ValueError("Expected RGB image pixels with uint8 dtype.")

    height, width = image_rgb.shape[:2]
    side = ScreenshotMaskUNet.input_size
    scale = min(side / width, side / height)
    resized_width = max(1, round(width * scale))
    resized_height = max(1, round(height * scale))
    input_image = Image.fromarray(image_rgb, mode="RGB").resize(
        (resized_width, resized_height), Image.Resampling.BILINEAR
    )
    left = (side - resized_width) // 2
    top = (side - resized_height) // 2
    letterboxed = Image.new("RGB", (side, side), color=(0, 0, 0))
    letterboxed.paste(input_image, (left, top))
    input_array = np.asarray(letterboxed, dtype=np.float32) / 255.0
    tensor = torch.from_numpy(input_array).permute(2, 0, 1).unsqueeze(0)
    try:
        device = next(model.parameters()).device
    except StopIteration:
        device = torch.device("cpu")
    tensor = tensor.to(device)

    model.eval()
    with torch.inference_mode():
        logits = model(tensor)
        if logits.ndim != 4 or logits.shape[:2] != (1, 1):
            raise ValueError("Model must return a [1, 1, H, W] logits tensor.")
        if not torch.isfinite(logits).all():
            raise ValueError("Model returned non-finite mask logits.")
        probabilities = torch.sigmoid(logits)
        probabilities = probabilities[:, :, top:top + resized_height, left:left + resized_width]
        probabilities = torch.nn.functional.interpolate(
            probabilities, size=(height, width), mode="bilinear", align_corners=False
        )
    return probabilities[0, 0].detach().cpu().numpy().astype(np.float32, copy=False)


def infer_mask_bytes(model: ScreenshotMaskUNet, image_bytes: bytes) -> np.ndarray:
    """Decode supported image bytes and run local mask inference."""
    if not image_bytes:
        raise ValueError("Image payload is empty.")
    try:
        with Image.open(BytesIO(image_bytes)) as image:
            image_rgb = np.asarray(image.convert("RGB"), dtype=np.uint8)
    except Exception as exc:
        raise ValueError("Image payload is corrupt or uses an unsupported format.") from exc
    return infer_mask(model, image_rgb)
