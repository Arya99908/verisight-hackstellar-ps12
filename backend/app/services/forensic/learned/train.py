"""Train a future mask-localization candidate from a permissioned JSON manifest.

This script does not download data or run as part of the app/deployment. It
refuses to start unless the manifest explicitly records commercial-use and
source-image rights, has all three leakage-safe splits, and includes real
captured authentic examples plus controlled edits.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import random
from pathlib import Path

import numpy as np
from PIL import Image

from app.services.forensic.learned.model import ScreenshotMaskUNet, torch
from app.services.forensic.learned.training_data import TrainingManifest, load_and_validate_manifest


class ScreenshotDataset(torch.utils.data.Dataset):
    def __init__(self, manifest: TrainingManifest, split: str, augment: bool) -> None:
        self.manifest = manifest
        self.samples = [sample for sample in manifest.samples if sample["split"] == split]
        self.augment = augment

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        sample = self.samples[index]
        with Image.open(self.manifest.data_root / sample["image"]) as image_file:
            image = image_file.convert("RGB")
        with Image.open(self.manifest.data_root / sample["mask"]) as mask_file:
            mask = mask_file.convert("L")
        if image.size != mask.size:
            raise ValueError(f"Image/mask size mismatch for sample {sample['id']}.")
        mask_values = np.asarray(mask, dtype=np.uint8)
        mask_has_edit = bool(np.any(mask_values >= 128))
        if sample["label"] == "authentic" and mask_has_edit:
            raise ValueError(f"Authentic sample {sample['id']} must have an all-zero tampering mask.")
        if sample["label"] == "tampered" and not mask_has_edit:
            raise ValueError(f"Tampered sample {sample['id']} must have a non-empty tampering mask.")

        if self.augment:
            image, mask = self._augment_pair(image, mask)
        image, mask = self._letterbox_pair(image, mask)
        image_array = np.asarray(image, dtype=np.float32) / 255.0
        mask_array = (np.asarray(mask, dtype=np.uint8) >= 128).astype(np.float32)
        return (
            torch.from_numpy(image_array).permute(2, 0, 1),
            torch.from_numpy(mask_array).unsqueeze(0),
        )

    @staticmethod
    def _augment_pair(image: Image.Image, mask: Image.Image) -> tuple[Image.Image, Image.Image]:
        # Shared aspect-preserving crops/scales keep UI text and masks aligned.
        crop_fraction = random.uniform(0.78, 1.0)
        crop_width = max(1, round(image.width * crop_fraction))
        crop_height = max(1, round(image.height * crop_fraction))
        left = random.randint(0, max(0, image.width - crop_width))
        top = random.randint(0, max(0, image.height - crop_height))
        box = (left, top, left + crop_width, top + crop_height)
        image, mask = image.crop(box), mask.crop(box)

        scale = random.uniform(0.68, 1.2)
        width = max(32, round(image.width * scale))
        height = max(32, round(image.height * scale))
        image = image.resize((width, height), Image.Resampling.BILINEAR)
        mask = mask.resize((width, height), Image.Resampling.NEAREST)

        if random.random() < 0.6:
            # Approximate resize/recompression from forwarding or screen capture.
            buffer = io.BytesIO()
            image.save(buffer, format="JPEG", quality=random.randint(48, 96))
            buffer.seek(0)
            image = Image.open(buffer).convert("RGB")

        return image, mask

    @staticmethod
    def _letterbox_pair(image: Image.Image, mask: Image.Image) -> tuple[Image.Image, Image.Image]:
        side = ScreenshotMaskUNet.input_size
        image.thumbnail((side, side), Image.Resampling.BILINEAR)
        mask.thumbnail((side, side), Image.Resampling.NEAREST)
        image_canvas = Image.new("RGB", (side, side), color=(0, 0, 0))
        mask_canvas = Image.new("L", (side, side), color=0)
        left = (side - image.width) // 2
        top = (side - image.height) // 2
        image_canvas.paste(image, (left, top))
        mask_canvas.paste(mask, (left, top))
        return image_canvas, mask_canvas


def _loss(logits: torch.Tensor, masks: torch.Tensor) -> torch.Tensor:
    bce = torch.nn.functional.binary_cross_entropy_with_logits(logits, masks)
    probabilities = torch.sigmoid(logits)
    intersection = (probabilities * masks).sum(dim=(1, 2, 3))
    dice = 1.0 - ((2.0 * intersection + 1.0) / (probabilities.sum(dim=(1, 2, 3)) + masks.sum(dim=(1, 2, 3)) + 1.0))
    return bce + dice.mean()


def train(manifest_path: Path, data_root: Path, output_path: Path, epochs: int, batch_size: int) -> None:
    manifest = load_and_validate_manifest(manifest_path, data_root)
    if epochs < 1 or batch_size < 1:
        raise ValueError("epochs and batch size must be positive integers.")

    torch.manual_seed(1729)
    random.seed(1729)
    np.random.seed(1729)
    train_data = ScreenshotDataset(manifest, "train", augment=True)
    validation_data = ScreenshotDataset(manifest, "validation", augment=False)
    train_loader = torch.utils.data.DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=0)
    validation_loader = torch.utils.data.DataLoader(validation_data, batch_size=batch_size, shuffle=False, num_workers=0)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = ScreenshotMaskUNet().to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-4, weight_decay=1e-4)
    best_validation_loss = float("inf")
    best_state: dict[str, torch.Tensor] | None = None

    for epoch in range(epochs):
        model.train()
        for images, masks in train_loader:
            images, masks = images.to(device), masks.to(device)
            optimizer.zero_grad(set_to_none=True)
            loss = _loss(model(images), masks)
            loss.backward()
            optimizer.step()

        model.eval()
        validation_total = 0.0
        validation_batches = 0
        with torch.inference_mode():
            for images, masks in validation_loader:
                loss = _loss(model(images.to(device)), masks.to(device))
                validation_total += float(loss.item())
                validation_batches += 1
        validation_loss = validation_total / max(1, validation_batches)
        print(f"epoch={epoch + 1} validation_loss={validation_loss:.6f}")
        if validation_loss < best_validation_loss:
            best_validation_loss = validation_loss
            best_state = {key: value.detach().cpu().clone() for key, value in model.state_dict().items()}

    if best_state is None:
        raise RuntimeError("Training produced no checkpoint.")

    manifest_digest = hashlib.sha256(manifest.path.read_bytes()).hexdigest()
    split_counts = {split: sum(sample["split"] == split for sample in manifest.samples) for split in ("train", "validation", "test")}
    payload = {
        "format_version": 1,
        "architecture_id": ScreenshotMaskUNet.architecture_id,
        "metadata": {
            "status": "UNVALIDATED_DO_NOT_DEPLOY",
            "dataset_name": manifest.dataset["name"],
            "dataset_source": manifest.dataset["source"],
            "license_id": manifest.dataset["license_id"],
            "permission_evidence": manifest.dataset["permission_evidence"],
            "manifest_sha256": manifest_digest,
            "split_sample_counts": split_counts,
            "input_size": ScreenshotMaskUNet.input_size,
            "selected_by_validation_loss_only": True,
            "test_set_used_for_training_or_selection": False,
        },
        "state_dict": best_state,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = output_path.with_suffix(output_path.suffix + ".tmp")
    torch.save(payload, temporary_path)
    temporary_path.replace(output_path)
    print(f"Saved unvalidated research checkpoint: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True, help="Authorized dataset manifest JSON")
    parser.add_argument("--data-root", type=Path, required=True, help="Root directory for manifest image/mask paths")
    parser.add_argument("--output", type=Path, required=True, help="Output checkpoint path (outside the production bundle)")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=8)
    args = parser.parse_args()
    train(args.manifest, args.data_root, args.output, args.epochs, args.batch_size)


if __name__ == "__main__":
    main()
