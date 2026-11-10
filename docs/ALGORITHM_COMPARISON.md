# VeriSight Algorithm Notes

This note describes the code currently in the repository. These are deterministic image cues and rules, not a trained authenticity classifier. Their thresholds have not been calibrated on a representative payment screenshot dataset. No error probability, precision, recall, false-positive rate, or false-negative rate is available.

## Pixel and compression cues

### Error Level Analysis

`backend/app/services/forensic/pixel_analysis/ela.py` re-encodes the decoded image as JPEG (normally Q90; Q75 when the channel heuristic matches a forwarding profile), compares it with the input pixels, and creates a heatmap. For JPEG sources only, it groups residuals into 16×16 blocks and flags statistical outliers above `max(8, mean + 2.6 × standard deviation)`. PNG, WebP, and BMP residuals are not scored. ELA cannot establish that a region was spliced: source compression, later recompression, scaling, and content edges affect the residual.

### High-frequency residual cue

`wavelet_noise.py` applies separable db4-like filters to luminance, measures local 9×9 residual variation, and marks large low-variation regions. Flat interface backgrounds and image resampling can produce similar patterns. The heatmap and point score are exploratory cues; the box does not confirm a splice.

### ORB copy-move cue

`copy_move.py` extracts up to 1500 ORB features, matches Hamming descriptors, filters by descriptor ratio and minimum spatial distance, then bins displacement vectors at a 5-pixel tolerance. A cluster needs at least 10 matches and compact source/destination spans to produce a candidate box. Repeated icons, lettering, and interface patterns can generate matches. The returned count is a number of candidate feature pairs, not a probability or an inlier count.

### JPEG quality sweep

`jpeg_ghosts.py` reports whole-image reconstruction error for seven JPEG qualities on a thumbnail. It does not create a localized ghost map and does not estimate editing truth.

## Text-like geometry and rendering cues

The default `ocr_engine.py` path extracts connected components and assigns placeholder names such as `token_3`; it does not recognize the image's words or numbers. QR-detected regions are excluded from this geometry pass.

`baseline_laser.py` groups nearby component boxes into rows and compares their bottom edges with the row median. A row is flagged using fixed pixel thresholds (3.2 px for multi-token rows, with stricter row-count rules; 4.5 px for two-token rows). Mixed fonts, text wrapping, scaling, and component segmentation can trigger the cue. “Tampered” in the internal laser field means only that this geometric threshold was crossed.

`cielab_patch.py` samples pixels beside component boxes and compares them with a nearby reference strip; it also compares Laplacian variation across components. Gradients, borders, icons, and mixed UI elements can trigger differences. These measurements do not establish that text was replaced.

## Metadata, rules, and QR codes

- Metadata inspection reads available file metadata; a missing EXIF block or software tag does not prove editing or identify the sharing app.
- The clock and transaction-reference rules use available PNG text chunks and token inputs. With the default connected-component extractor, screenshot text is not read, so pixel-only clock and reference checks are unavailable.
- The viewport rules compare dimensions with a small heuristic list. Cropping is common and is not evidence of fraud by itself.
- The C2PA inspector searches bytes for possible marker strings. It does not parse a manifest or validate signatures, trust chains, or asset bindings.
- The QR inspector uses OpenCV to decode readable codes, report the payload type and locate the detected region. It does not validate QR pixel integrity, recipient identity, destination safety, or payment settlement.

## Score and assessment

`ensemble/calibrator.py` adds hand-set points for selected cues and returns one of `INCONCLUSIVE`, `REVIEW_REQUIRED`, or `CORROBORATED_ANOMALIES`. “Corroborated” is a rule label, not a calibrated confidence claim. That verdict requires a candidate ORB region and baseline-geometry box to overlap at the configured IoU threshold. `overall_tamper_score` is heuristic points on a 0–92 display scale. `confidence_score` and region confidence are null because calibration data is absent.

The detector and user interface can help a reviewer inspect the listed pixels and measurements. They cannot prove the file's provenance, determine whether every payment or message screenshot was edited, or confirm that money moved. Payment state requires a trusted provider or bank record.

## Validation status

`backend/tests/` covers implemented functions, synthetic fixtures, input workflows, and selected common transformations. The five bundled fixtures are synthetic regression examples, not a representative benchmark. They do not establish market accuracy. Model training and a proper held-out evaluation require independently sourced, labeled examples and marked manipulation regions; see [MODEL_TRAINING_READINESS.md](MODEL_TRAINING_READINESS.md).
