from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int
    points: list[list[int]] | None = None
    label: str
    confidence: float = 1.0
    layer: int
    anomaly_type: str
    details: dict[str, Any] | None = None

class BaselineLaser(BaseModel):
    row_index: int
    y_baseline: float
    slope: float = 0.0
    tokens_count: int
    delta_y_max: float
    is_tampered: bool
    status: str  # "ALIGNED_CYAN" or "CRITICAL_RED"
    callout_text: str | None = None
    token_indices: list[int] = Field(default_factory=list)
    x_start: int | None = None
    x_end: int | None = None

class Layer1SignalResult(BaseModel):
    ela_score: float
    ela_b64: str
    wavelet_noise_score: float
    wavelet_noise_b64: str
    clone_detected: bool
    clone_count: int
    clone_b64: str
    anomalous_blocks_count: int
    layer_score: float
    bounding_boxes: list[BoundingBox] = Field(default_factory=list)
    details: dict[str, Any] = Field(default_factory=dict)

class Layer2GeometryResult(BaseModel):
    baseline_drift_score: float
    max_baseline_drift_px: float
    max_delta_e: float
    cielab_patch_anomaly: bool
    sharpness_z_anomaly: bool
    layer_score: float
    lasers: list[BaselineLaser] = Field(default_factory=list)
    bounding_boxes: list[BoundingBox] = Field(default_factory=list)
    details: dict[str, Any] = Field(default_factory=dict)

class Layer3MetadataResult(BaseModel):
    channel_detected: str
    is_whatsapp_laundered: bool
    exif_stripped: bool
    software_signature: str | None = None
    c2pa_present: bool = False
    c2pa_status: str = "NO_MANIFEST_FOUND"
    viewport_aspect_ratio: str
    is_non_native_viewport: bool
    clock_paradox_detected: bool
    status_bar_clock: str | None = None
    transaction_time: str | None = None
    upi_utr_valid: bool | None = None
    upi_utr_value: str | None = None
    layer_score: float
    bounding_boxes: list[BoundingBox] = Field(default_factory=list)
    details: dict[str, Any] = Field(default_factory=dict)

class Layer4SemanticResult(BaseModel):
    vlm_used: bool = False
    vlm_provider: str | None = None
    semantic_inconsistency: bool = False
    layer_score: float = 0.0
    findings: list[str] = Field(default_factory=list)
    details: dict[str, Any] = Field(default_factory=dict)

class CrossLayerSynergy(BaseModel):
    synergy_multiplier_applied: bool = False
    multiplier_factor: float = 1.0
    primary_forgery_locus: BoundingBox | None = None
    synergy_explanation: str = "No cross-layer anomaly alignment detected."

class ForensicFinding(BaseModel):
    id: str
    layer: int
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"
    title: str
    description: str
    metric_name: str
    metric_value: str
    bounding_box: BoundingBox | None = None

class ForensicAnalysisReport(BaseModel):
    file_sha256: str
    filename: str | None = "screenshot.png"
    timestamp: str
    image_width: int
    image_height: int
    overall_tamper_score: float
    confidence_score: float | None = None
    verdict: str  # INCONCLUSIVE, REVIEW_REQUIRED, or CORROBORATED_ANOMALIES
    channel_detected: str
    layer1: Layer1SignalResult
    layer2: Layer2GeometryResult
    layer3: Layer3MetadataResult
    layer4: Layer4SemanticResult
    synergy: CrossLayerSynergy
    findings: list[ForensicFinding] = Field(default_factory=list)
    all_bounding_boxes: list[BoundingBox] = Field(default_factory=list)
    original_image_b64: str

class DemoSampleMeta(BaseModel):
    id: str
    filename: str
    title: str
    scenario: str
    expected_verdict: str
    target_score_range: str
    description: str
    tags: list[str]
    url: str

class WhatsAppSimulationResponse(BaseModel):
    original_size_bytes: int
    simulated_size_bytes: int
    compression_ratio: float
    original_dimensions: list[int]
    simulated_dimensions: list[int]
    simulated_image_b64: str
    diff_heatmap_b64: str
    reanalysis: ForensicAnalysisReport
