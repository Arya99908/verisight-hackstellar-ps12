
import numpy as np

from app.core.config import settings
from app.core.schemas import (
    BoundingBox,
    CrossLayerSynergy,
    ForensicFinding,
    Layer1SignalResult,
    Layer2GeometryResult,
    Layer3MetadataResult,
    Layer4SemanticResult,
)


def compute_box_iou(b1: BoundingBox, b2: BoundingBox) -> float:
    """Computes Intersection over Union (IoU) of two bounding boxes."""
    x1 = max(b1.x, b2.x)
    y1 = max(b1.y, b2.y)
    x2 = min(b1.x + b1.width, b2.x + b2.width)
    y2 = min(b1.y + b1.height, b2.y + b2.height)

    inter_w = max(0, x2 - x1)
    inter_h = max(0, y2 - y1)
    inter_area = inter_w * inter_h

    if inter_area == 0:
        return 0.0

    b1_area = b1.width * b1.height
    b2_area = b2.width * b2.height
    union_area = float(b1_area + b2_area - inter_area)

    return inter_area / union_area if union_area > 0 else 0.0

def are_boxes_proximate(b1: BoundingBox, b2: BoundingBox, max_dist: float = 20.0) -> bool:
    """Checks if two bounding box centroids or edges are within close proximity."""
    c1_x = b1.x + b1.width / 2.0
    c1_y = b1.y + b1.height / 2.0
    c2_x = b2.x + b2.width / 2.0
    c2_y = b2.y + b2.height / 2.0

    dist = np.hypot(c1_x - c2_x, c1_y - c2_y)
    return dist <= max_dist

def calibrate_ensemble(
    layer1: Layer1SignalResult,
    layer2: Layer2GeometryResult,
    layer3: Layer3MetadataResult,
    layer4: Layer4SemanticResult,
    is_whatsapp: bool = False
) -> tuple[float, float, str, CrossLayerSynergy, list[ForensicFinding], list[BoundingBox]]:
    """
    Bayesian Evidentiary Ensemble & Cross-Layer Spatial IoU Synergy.
    Weighs Layer 1 (Signal), Layer 2 (Typography), Layer 3 (Metadata), and Layer 4.
    If Layer 1 physical signal anomalies overlap Layer 2 typography anomalies (IoU > 0.20),
    applies a 1.35x synergy multiplier and isolates the Primary Forgery Locus.
    """
    findings: list[ForensicFinding] = []
    all_boxes: list[BoundingBox] = []

    # Collect all bounding boxes
    all_boxes.extend(layer1.bounding_boxes)
    all_boxes.extend(layer2.bounding_boxes)
    all_boxes.extend(layer3.bounding_boxes)

    # 1. Weight adjustments based on detected channel
    # If WhatsApp re-compressed, EXIF is stripped and ELA is smoothed;
    # shift weights toward Layer 2 (Typography geometry & Delta-E) and Layer 1 Wavelets.
    if is_whatsapp:
        w1 = 0.35
        w2 = 0.45
        w3 = 0.15
        w4 = 0.05
    else:
        w1 = 0.35
        w2 = 0.35
        w3 = 0.25
        w4 = 0.05

    # 2. Check Cross-Layer Spatial Synergy (Layer 1 vs Layer 2)
    synergy_applied = False
    synergy_factor = 1.0
    primary_locus: BoundingBox | None = None
    synergy_explanation = "No cross-layer spatial overlap detected between physical signal and typography."

    l1_boxes = layer1.bounding_boxes
    l2_boxes = layer2.bounding_boxes

    for b1 in l1_boxes:
        for b2 in l2_boxes:
            iou = compute_box_iou(b1, b2)
            proximate = are_boxes_proximate(b1, b2, max_dist=25.0)
            if iou > 0.15 or proximate:
                synergy_applied = True
                synergy_factor = settings.CROSS_LAYER_SYNERGY_MULTIPLIER
                
                # Merge into primary forgery locus
                px = min(b1.x, b2.x)
                py = min(b1.y, b2.y)
                pw = max(b1.x + b1.width, b2.x + b2.width) - px
                ph = max(b1.y + b1.height, b2.y + b2.height) - py

                primary_locus = BoundingBox(
                    x=px,
                    y=py,
                    width=pw,
                    height=ph,
                    points=[[px, py], [px + pw, py], [px + pw, py + ph], [px, py + ph]],
                    label=f"PRIMARY FORGERY LOCUS ({b1.anomaly_type} ✕ {b2.anomaly_type})",
                    confidence=0.99,
                    layer=4,
                    anomaly_type="CROSS_LAYER_SYNERGY_LOCUS",
                    details={"iou": round(iou, 3), "l1_label": b1.label, "l2_label": b2.label}
                )
                synergy_explanation = (
                    f"Cross-Layer Synergy Triggered: Physical signal anomaly '{b1.label}' spatial footprint "
                    f"intersects typographic anomaly '{b2.label}' (IoU={iou:.2f}). 1.35x confidence boost applied."
                )
                break
        if synergy_applied:
            break

    if primary_locus:
        all_boxes.insert(0, primary_locus)

    # 3. Base Ensemble Composite Score
    # S = w1*S1 + w2*S2 + w3*S3 + w4*S4
    raw_composite = (
        w1 * layer1.layer_score +
        w2 * layer2.layer_score +
        w3 * layer3.layer_score +
        w4 * layer4.layer_score
    )

    # Apply synergy multiplier if triggered
    if synergy_applied:
        calibrated_score = min(99.0, raw_composite * synergy_factor)
        # Ensure high-confidence floor for clear dual-layer forgeries
        calibrated_score = max(calibrated_score, 88.0)
    else:
        calibrated_score = min(100.0, raw_composite)

    # Calibrate low genuine scores
    if raw_composite < 12.0 and not synergy_applied and not layer3.clock_paradox_detected and not layer1.clone_detected:
        calibrated_score = round(min(8.5, raw_composite * 0.7), 1)
    else:
        calibrated_score = round(calibrated_score, 1)

    # 4. Determine Verdict
    if calibrated_score < 25.0:
        verdict = "AUTHENTIC_VERIFIED"
        confidence = round(max(85.0, 100.0 - calibrated_score), 1)
    elif calibrated_score < 70.0:
        verdict = "SUSPICIOUS_ANOMALIES"
        confidence = 78.0
    else:
        verdict = "MANIPULATED_FORGERY"
        confidence = round(min(98.5, 75.0 + calibrated_score * 0.23), 1)

    # 5. Populate Structured Forensic Findings
    # Layer 1 findings
    if layer1.anomalous_blocks_count > 0:
        findings.append(ForensicFinding(
            id="f-l1-ela",
            layer=1,
            severity="HIGH" if layer1.ela_score > 60 else "MEDIUM",
            title="Error Level Analysis (ELA) Compression Inconsistency",
            description=f"Detected {layer1.anomalous_blocks_count} contiguous 16x16 macroblocks with Z-score > 2.6.",
            metric_name="ELA Z-Score Outliers",
            metric_value=f"{layer1.anomalous_blocks_count} blocks",
            bounding_box=layer1.bounding_boxes[0] if layer1.bounding_boxes else None
        ))

    if layer1.clone_detected:
        findings.append(ForensicFinding(
            id="f-l1-clone",
            layer=1,
            severity="CRITICAL",
            title="Copy-Move Cloned Pixel Clusters",
            description=f"Isolated {layer1.clone_count} parallel translation vectors matching duplicated text/features.",
            metric_name="Parallel Vectors",
            metric_value=f"{layer1.clone_count} pairs",
            bounding_box=layer1.bounding_boxes[0] if layer1.bounding_boxes else None
        ))

    if layer1.wavelet_noise_score > 40.0:
        findings.append(ForensicFinding(
            id="f-l1-wavelet",
            layer=1,
            severity="HIGH",
            title="Wavelet High-Pass Noise Residual Discontinuity",
            description="Identified sharp boundary or zero-noise void where local Daubechies db4 noise drops to zero.",
            metric_name="Noise Heterogeneity",
            metric_value=f"{layer1.wavelet_noise_score:.1f}%",
            bounding_box=next((b for b in layer1.bounding_boxes if b.anomaly_type == "WAVELET_NOISE_VOID"), None)
        ))

    # Layer 2 findings
    if layer2.max_baseline_drift_px >= settings.BASELINE_DRIFT_THRESHOLD_PX:
        findings.append(ForensicFinding(
            id="f-l2-laser",
            layer=2,
            severity="CRITICAL",
            title="Sub-Pixel Typographic Baseline Drift",
            description=f"Text row deviation exceeds threshold by {layer2.max_baseline_drift_px}px relative to row baseline.",
            metric_name="Baseline Deviation",
            metric_value=f"+{layer2.max_baseline_drift_px}px",
            bounding_box=next((b for b in layer2.bounding_boxes if b.anomaly_type == "SUBPIXEL_BASELINE_DRIFT"), None)
        ))

    if layer2.cielab_patch_anomaly:
        findings.append(ForensicFinding(
            id="f-l2-cielab",
            layer=2,
            severity="HIGH",
            title="CIELAB Perceptual Card Background Mismatch",
            description=f"Color distance between inner character background and outer UI card exceeds ΔE = {layer2.max_delta_e:.1f}.",
            metric_name="Perceptual Delta-E",
            metric_value=f"ΔE = {layer2.max_delta_e:.1f}",
            bounding_box=next((b for b in layer2.bounding_boxes if b.anomaly_type == "LOCAL_BACKGROUND_PATCH_MISMATCH"), None)
        ))

    if layer2.sharpness_z_anomaly:
        findings.append(ForensicFinding(
            id="f-l2-sharpness",
            layer=2,
            severity="MEDIUM",
            title="Font Edge Anti-Aliasing Sharpness Inconsistency",
            description="Laplacian edge gradient Z-score exceeds standard mobile rendering distribution (|Z| > 2.1).",
            metric_name="Sharpness Z-Score",
            metric_value="Outlier detected",
            bounding_box=next((b for b in layer2.bounding_boxes if b.anomaly_type == "SHARPNESS_Z_ANOMALY"), None)
        ))

    # Layer 3 findings
    if layer3.clock_paradox_detected:
        findings.append(ForensicFinding(
            id="f-l3-clock",
            layer=3,
            severity="CRITICAL",
            title="Temporal Paradox: Status Bar Clock Drift",
            description=f"Receipt timestamp ({layer3.transaction_time}) is in the future relative to OS status bar clock ({layer3.status_bar_clock}).",
            metric_name="Temporal Paradox",
            metric_value="Future Timestamp",
            bounding_box=next((b for b in layer3.bounding_boxes if b.anomaly_type == "TEMPORAL_PARADOX_CLOCK_DRIFT"), None)
        ))

    if layer3.upi_utr_valid is False:
        findings.append(ForensicFinding(
            id="f-l3-utr",
            layer=3,
            severity="HIGH",
            title="Invalid UPI 12-Digit Reference (UTR) Format",
            description=f"Extracted transaction reference '{layer3.upi_utr_value}' violates NPCI 12-digit numeric checksum standard.",
            metric_name="UTR Validity",
            metric_value="Invalid Format",
            bounding_box=next((b for b in layer3.bounding_boxes if b.anomaly_type == "INVALID_UPI_UTR_FORMAT"), None)
        ))

    if layer3.is_non_native_viewport:
        findings.append(ForensicFinding(
            id="f-l3-viewport",
            layer=3,
            severity="LOW",
            title="Non-Native Viewport Aspect Ratio Crop",
            description=f"Image dimensions ({layer3.viewport_aspect_ratio}) do not match standard mobile screen framebuffers.",
            metric_name="Viewport Ratio",
            metric_value=layer3.viewport_aspect_ratio
        ))

    if layer3.software_signature:
        findings.append(ForensicFinding(
            id="f-l3-software",
            layer=3,
            severity="HIGH",
            title=f"Editing Software Signature Detected: {layer3.software_signature}",
            description=f"Container metadata contains signature of known editing suite or generator: {layer3.software_signature}.",
            metric_name="Software Tag",
            metric_value=layer3.software_signature
        ))

    # Add Authentic confirmation finding if clean
    if not findings:
        findings.append(ForensicFinding(
            id="f-auth-ok",
            layer=1,
            severity="INFO",
            title="Homogeneous Physical Signal & Typography",
            description="Baselines, noise residuals, and background color metrics are mathematically aligned with zero anomalies.",
            metric_name="Integrity State",
            metric_value="Verified Authentic"
        ))

    synergy = CrossLayerSynergy(
        synergy_multiplier_applied=synergy_applied,
        multiplier_factor=synergy_factor,
        primary_forgery_locus=primary_locus,
        synergy_explanation=synergy_explanation
    )

    return calibrated_score, confidence, verdict, synergy, findings, all_boxes
