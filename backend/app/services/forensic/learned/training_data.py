"""Manifest validation for permissioned screenshot-mask training data."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


SPLITS = {"train", "validation", "test"}
GROUP_KEYS = (
    "app_template_id",
    "device_id",
    "contributor_id",
    "original_id",
    "editing_session_id",
)


@dataclass(frozen=True)
class TrainingManifest:
    path: Path
    data_root: Path
    dataset: dict[str, Any]
    samples: tuple[dict[str, Any], ...]


def load_and_validate_manifest(manifest_path: str | Path, data_root: str | Path) -> TrainingManifest:
    path = Path(manifest_path).resolve()
    root = Path(data_root).resolve()
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict) or not isinstance(raw.get("dataset"), dict):
        raise ValueError("Manifest must contain a dataset metadata object.")
    if not isinstance(raw.get("samples"), list) or not raw["samples"]:
        raise ValueError("Manifest must contain a non-empty samples list.")

    dataset = raw["dataset"]
    required_dataset_fields = (
        "name", "source", "license_id", "permission_evidence", "permission_evidence_sha256",
        "permission_reviewed_by", "permission_reviewed_at",
    )
    missing = [field for field in required_dataset_fields if not dataset.get(field)]
    if missing:
        raise ValueError(f"Missing dataset permission metadata: {', '.join(missing)}")
    if dataset.get("intended_use") != "commercial" or dataset.get("commercial_use_permitted") is not True:
        raise ValueError("Training requires explicit permission for this project's commercial use.")
    if dataset.get("source_image_rights_confirmed") is not True:
        raise ValueError("Original image rights must be explicitly confirmed for the intended use.")
    evidence = Path(str(dataset["permission_evidence"])).expanduser()
    if not evidence.is_absolute():
        evidence = (path.parent / evidence).resolve()
    if not evidence.is_file():
        raise ValueError("Permission evidence must point to an existing local record.")
    repository_root = Path(__file__).resolve().parents[5]
    try:
        evidence.resolve().relative_to(repository_root)
    except ValueError:
        pass
    else:
        raise ValueError("Keep private permission evidence outside the repository.")
    evidence_digest = hashlib.sha256(evidence.read_bytes()).hexdigest()
    if str(dataset["permission_evidence_sha256"]).lower() != evidence_digest:
        raise ValueError("Permission evidence SHA-256 does not match the reviewed local record.")

    samples = tuple(raw["samples"])
    seen_ids: set[str] = set()
    split_groups: dict[str, dict[str, str]] = {key: {} for key in GROUP_KEYS}
    split_labels: dict[str, set[str]] = {split: set() for split in SPLITS}
    split_capture_kinds: dict[str, set[tuple[str, str]]] = {split: set() for split in SPLITS}
    image_hash_splits: dict[str, str] = {}

    for index, sample in enumerate(samples):
        if not isinstance(sample, dict):
            raise ValueError(f"Sample {index} must be an object.")
        sample_id = str(sample.get("id", ""))
        if not sample_id or sample_id in seen_ids:
            raise ValueError(f"Sample {index} must have a unique non-empty id.")
        seen_ids.add(sample_id)

        split = sample.get("split")
        if split not in SPLITS:
            raise ValueError(f"Sample {sample_id} has an invalid split; use train, validation, or test.")
        label = sample.get("label")
        if label not in {"authentic", "tampered"}:
            raise ValueError(f"Sample {sample_id} has an invalid label.")
        split_labels[split].add(label)

        capture_kind = sample.get("capture_kind")
        if capture_kind not in {"captured_authentic", "controlled_edit", "synthetic"}:
            raise ValueError(f"Sample {sample_id} has an invalid capture_kind.")
        split_capture_kinds[split].add((label, capture_kind))
        if label == "authentic" and capture_kind not in {"captured_authentic", "synthetic"}:
            raise ValueError(f"Authentic sample {sample_id} must be a captured authentic screenshot.")
        if label == "tampered" and capture_kind not in {"controlled_edit", "synthetic"}:
            raise ValueError(f"Tampered sample {sample_id} must be a controlled edit.")

        groups = sample.get("groups")
        if not isinstance(groups, dict):
            raise ValueError(f"Sample {sample_id} must provide split group identifiers.")
        for key in GROUP_KEYS:
            value = str(groups.get(key, ""))
            if not value:
                raise ValueError(f"Sample {sample_id} is missing group id {key}.")
            prior_split = split_groups[key].get(value)
            if prior_split is not None and prior_split != split:
                raise ValueError(f"Leakage: {key}={value!r} occurs in both {prior_split} and {split}.")
            split_groups[key][value] = split

        image_path = _safe_data_path(root, sample.get("image"), sample_id, "image")
        mask_path = _safe_data_path(root, sample.get("mask"), sample_id, "mask")
        if not image_path.is_file() or not mask_path.is_file():
            raise ValueError(f"Sample {sample_id} references a missing image or mask file.")
        if "samples" in {part.lower() for part in image_path.parts}:
            raise ValueError("Bundled demo fixtures under samples/ are prohibited from training.")
        image_digest = hashlib.sha256(image_path.read_bytes()).hexdigest()
        prior_image_split = image_hash_splits.get(image_digest)
        if prior_image_split is not None and prior_image_split != split:
            raise ValueError(f"Leakage: byte-identical image occurs in both {prior_image_split} and {split}.")
        image_hash_splits[image_digest] = split

    for split in SPLITS:
        if not {"authentic", "tampered"}.issubset(split_labels[split]):
            raise ValueError(f"Each split, including the locked test split, needs authentic and tampered labels: {split}.")
        required_sources = {("authentic", "captured_authentic"), ("tampered", "controlled_edit")}
        if not required_sources.issubset(split_capture_kinds[split]):
            raise ValueError(f"Each split needs captured authentic screenshots and controlled edits: {split}.")

    return TrainingManifest(path=path, data_root=root, dataset=dataset, samples=samples)


def _safe_data_path(root: Path, relative: Any, sample_id: str, field: str) -> Path:
    if not isinstance(relative, str) or not relative:
        raise ValueError(f"Sample {sample_id} is missing its {field} path.")
    candidate = (root / relative).resolve()
    try:
        candidate.relative_to(root)
    except ValueError as exc:
        raise ValueError(f"Sample {sample_id} {field} path escapes the data root.") from exc
    return candidate
