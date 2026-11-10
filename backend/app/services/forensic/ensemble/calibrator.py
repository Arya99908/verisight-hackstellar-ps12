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
    x1, y1 = max(b1.x, b2.x), max(b1.y, b2.y)
    x2 = min(b1.x + b1.width, b2.x + b2.width)
    y2 = min(b1.y + b1.height, b2.y + b2.height)
    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    union = b1.width * b1.height + b2.width * b2.height - intersection
    return intersection / union if union > 0 else 0.0


def calibrate_ensemble(
    layer1: Layer1SignalResult,
    layer2: Layer2GeometryResult,
    layer3: Layer3MetadataResult,
    layer4: Layer4SemanticResult,
    is_whatsapp: bool = False,
) -> tuple[float, None, str, CrossLayerSynergy, list[ForensicFinding], list[BoundingBox]]:
    """Conservative, transparent heuristic scoring. Scores are not probabilities."""
    del is_whatsapp  # Recompression/channel is context, never proof of editing.
    findings: list[ForensicFinding] = []
    all_boxes = layer1.bounding_boxes + layer2.bounding_boxes + layer3.bounding_boxes

    baseline_boxes = [b for b in layer2.bounding_boxes if b.anomaly_type == "SUBPIXEL_BASELINE_DRIFT"]
    clone_boxes = [
        b for b in layer1.bounding_boxes
        if b.anomaly_type == "CLONED_PIXEL_REGION_DETECTED" and layer1.clone_detected and layer1.clone_count >= 20
    ]
    # Only combine two relatively specific signals when their actual regions overlap.
    primary_locus = None
    for clone_box in clone_boxes:
        for baseline_box in baseline_boxes:
            iou = compute_box_iou(clone_box, baseline_box)
            if iou >= 0.20:
                x, y = min(clone_box.x, baseline_box.x), min(clone_box.y, baseline_box.y)
                right = max(clone_box.x + clone_box.width, baseline_box.x + baseline_box.width)
                bottom = max(clone_box.y + clone_box.height, baseline_box.y + baseline_box.height)
                primary_locus = BoundingBox(
                    x=x, y=y, width=right - x, height=bottom - y,
                    points=[[x, y], [right, y], [right, bottom], [x, bottom]],
                    label="Overlapping clone and text-baseline indicators", confidence=0.75,
                    layer=4, anomaly_type="CROSS_LAYER_SYNERGY_LOCUS",
                    details={"iou": round(iou, 3)},
                )
                break
        if primary_locus:
            break

    strong: dict[str, int] = {}
    if any(row.is_tampered for row in layer2.lasers):
        strong["text_geometry"] = 35
        findings.append(ForensicFinding(
            id="f-l2-laser", layer=2, severity="MEDIUM",
            title="Text baseline alignment needs review",
            description="A text row has a geometric alignment anomaly. Font rendering, scaling, and OCR segmentation can also affect this heuristic.",
            metric_name="Maximum baseline deviation", metric_value=f"{layer2.max_baseline_drift_px:.1f}px",
            bounding_box=baseline_boxes[0] if baseline_boxes else None,
        ))
    if layer1.clone_detected and layer1.clone_count >= 20:
        strong["copy_move"] = 42 if layer1.clone_count >= 40 else 28
        findings.append(ForensicFinding(
            id="f-l1-clone", layer=1, severity="MEDIUM",
            title="Possible duplicated image regions",
            description=f"The copy-move heuristic found {layer1.clone_count} matching feature pairs. Repeated interface elements can produce similar matches; inspect the highlighted region.",
            metric_name="Matching feature pairs", metric_value=f"{layer1.clone_count}",
            bounding_box=clone_boxes[0] if clone_boxes else None,
        ))
    if layer3.clock_paradox_detected:
        strong["time_consistency"] = 35
        findings.append(ForensicFinding(
            id="f-l3-clock", layer=3, severity="MEDIUM",
            title="Displayed receipt and status-bar times conflict",
            description=f"The displayed receipt time ({layer3.transaction_time}) is later than the displayed status-bar time ({layer3.status_bar_clock}). Check timezone, delayed capture, and OCR accuracy before drawing a conclusion.",
            metric_name="Displayed time consistency", metric_value="Conflict detected",
            bounding_box=next((b for b in layer3.bounding_boxes if b.anomaly_type == "TEMPORAL_PARADOX_CLOCK_DRIFT"), None),
        ))
    if layer3.upi_utr_valid is False:
        strong["reference_format"] = 20
        findings.append(ForensicFinding(
            id="f-l3-utr", layer=3, severity="LOW",
            title="Transaction reference format needs review",
            description="The extracted reference did not match the configured format check. This format check is not an issuer or bank validation.",
            metric_name="Reference format", metric_value="Does not match configured pattern",
            bounding_box=next((b for b in layer3.bounding_boxes if b.anomaly_type == "INVALID_UPI_UTR_FORMAT"), None),
        ))

    # Image statistics are deliberately low-weight review cues, not proof of tampering.
    weak_score = 0.0
    if layer1.anomalous_blocks_count:
        weak_score += 4
        findings.append(ForensicFinding(
            id="f-l1-ela", layer=1, severity="LOW",
            title="Compression residual variation (review cue)",
            description="ELA highlights differences after recompression. Screenshots and ordinary compression can create these patterns; this is not proof of editing.",
            metric_name="Highlighted macroblocks", metric_value=f"{layer1.anomalous_blocks_count}",
            bounding_box=next((b for b in layer1.bounding_boxes if b.anomaly_type == "ELA_MACROBLOCK_OUTLIER"), None),
        ))
    if layer1.wavelet_noise_score > 40:
        weak_score += 4
        findings.append(ForensicFinding(
            id="f-l1-wavelet", layer=1, severity="LOW",
            title="Local noise variation (review cue)",
            description="Compression, sharpening, resizing, and screenshot capture can change local noise statistics.",
            metric_name="Noise variation", metric_value=f"{layer1.wavelet_noise_score:.1f}%",
            bounding_box=next((b for b in layer1.bounding_boxes if b.anomaly_type == "WAVELET_NOISE_VOID"), None),
        ))
    if layer2.cielab_patch_anomaly or layer2.sharpness_z_anomaly:
        weak_score += 4
        findings.append(ForensicFinding(
            id="f-l2-rendering", layer=2, severity="LOW",
            title="Rendering variation (review cue)",
            description="Color and edge differences can result from rescaling, display capture, compression, and device-specific rendering.",
            metric_name="Rendering checks", metric_value="Variation detected",
            bounding_box=next((b for b in layer2.bounding_boxes if b.anomaly_type in {"LOCAL_BACKGROUND_PATCH_MISMATCH", "SHARPNESS_Z_ANOMALY"}), None),
        ))
    if layer3.software_signature:
        weak_score += 3
        findings.append(ForensicFinding(
            id="f-l3-software", layer=3, severity="LOW",
            title="Image software metadata is present",
            description=f"The file names '{layer3.software_signature}' in metadata. Metadata can be added, changed, or preserved during ordinary processing and is not proof of editing.",
            metric_name="Software metadata", metric_value=layer3.software_signature,
        ))

    qr_inspection = layer3.details.get("qr_inspection", {})
    for index, qr in enumerate(qr_inspection.get("results", [])):
        payload = str(qr.get("payload", ""))
        cue = qr.get("review_cue")
        findings.append(ForensicFinding(
            id=f"f-qr-{index + 1}", layer=3, severity="INFO",
            title=f"QR content decoded: {qr.get('kind', 'UNKNOWN')}",
            description=(f"Payload: {payload}. " if payload else "")
            + str(cue or "Decoded content only; the QR destination and payment status are not verified."),
            metric_name="QR payload", metric_value=payload[:180] or "Decoded",
        ))
    # Cropping, missing EXIF, and social-app recompression are not positive tamper evidence.

    if primary_locus:
        all_boxes.insert(0, primary_locus)
        findings.append(ForensicFinding(
            id="f-cross-layer", layer=4, severity="HIGH",
            title="Overlapping independent image indicators",
            description="A copy-move match overlaps an anomalous text baseline. Review the highlighted region; the combined indicators still require human verification.",
            metric_name="Cross-layer overlap", metric_value="Overlapping regions", bounding_box=primary_locus,
        ))

    # Strong indicators only combine across distinct evidence families. Metadata time and
    # reference rules are separate, but on their own they support review, not certainty.
    supporting_signal_families = sum((
        bool(layer1.anomalous_blocks_count),
        layer1.wavelet_noise_score > 70,
        layer2.cielab_patch_anomaly or layer2.sharpness_z_anomaly,
    ))
    corroborated = (
        ("copy_move" in strong and "text_geometry" in strong)
        or ("time_consistency" in strong and "reference_format" in strong)
        or ("text_geometry" in strong and supporting_signal_families >= 2)
        or primary_locus is not None
    )
    score = min(92.0, sum(strong.values()) + min(weak_score, 12.0))
    if corroborated:
        score = max(score, 72.0)
        verdict = "CORROBORATED_ANOMALIES"
    elif score >= 12.0:
        verdict = "REVIEW_REQUIRED"
    else:
        verdict = "INCONCLUSIVE"
        findings.append(ForensicFinding(
            id="f-inconclusive", layer=4, severity="INFO",
            title="Image authenticity is inconclusive",
            description="No strong image-editing indicators were found. That does not establish that the image is authentic or that a payment occurred.",
            metric_name="Assessment", metric_value="Inconclusive",
        ))

    synergy = CrossLayerSynergy(
        synergy_multiplier_applied=primary_locus is not None,
        multiplier_factor=1.0,
        primary_forgery_locus=primary_locus,
        synergy_explanation=(
            "Copy-move and text-baseline indicators overlap; inspect this region."
            if primary_locus else "No overlapping high-specificity indicators detected."
        ),
    )
    # No calibration dataset exists, so do not return a made-up confidence value.
    return round(score, 1), None, verdict, synergy, findings, all_boxes
