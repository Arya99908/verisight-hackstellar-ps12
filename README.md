# VeriSight — HackStellar PS-12 Prototype

Offline-first screenshot forensics workbench with a Python image-analysis API. Serve this folder locally and open `http://localhost:8000`.

```bash
python3 -m pip install -r requirements.txt
python3 server.py
```

## Current prototype

- Image file selection and drag/drop; local-only processing.
- Demo edited payment receipt fixture, analysis findings, visible heuristic score, metadata/limitations, and local SHA-256 when Web Crypto is available.
- Four synchronized evidence panels and finding navigation. The local API computes ELA sweeps at Q75/85/95, Haar-style high-pass residual metrics, 8-pixel block boundary statistics, JPEG DQT/subsampling observations, metadata presence, and SHA-256.
- Optional OCR via locally installed Tesseract; otherwise the OCR layer is explicitly returned as unavailable. UTR/VPA regex checks run only on recognized text.
- Laser overlay toggle, image reset, simulated WhatsApp resize/JPEG re-encode at approximately Q76, and print-to-PDF certificate.
- Responsive layout, case session, protocol and build framework navigation.
- Phone QR intake over the same local Wi-Fi using `server.py`; uploaded screenshots are ignored by Git.

## Accuracy boundary

This is a prototype, not a validated forensic product. Server ELA/residual measures are diagnostic cues, not proof of tampering. OCR is optional and uses Tesseract if installed; otherwise OCR-dependent checks are unavailable. The front-end score remains an uncalibrated triage heuristic. C2PA cryptographic trust-chain verification and calibrated Bayesian fusion are not implemented; status remains unknown/unverified. Do not use this demo to decide whether a payment occurred. Verify through the payment provider.

## Implemented API

`POST /api/analyze` accepts multipart `image` (also `file` or `evidence`) and returns per-layer status, ELA measurements, residual and block-grid statistics, basic JPEG metadata observations, optional OCR word boxes, format-rule cues, SHA-256, findings, and limitations. `score` is deliberately null because no calibrated ensemble is configured.

## Target architecture from the execution brief

Keep the JSON API boundary stable so frontend and forensic modules can progress separately.

```text
POST /api/analyze
multipart image
→ {schema_version, sha256, channel, image, layers, score: null, verdict: REVIEW, findings, limitations}
```

| Layer | Production module | Planned work |
|---|---|---|
| 1. Pixel and frequency forensics | `backend/core/layer1_signal.py` | Multi-scale ELA at Q75/85/95; WhatsApp-adaptive Q70/75/82; db4 wavelet residuals; DCT 8×8 grid; copy-move/ORB evidence |
| 2. OCR geometry | `backend/core/layer2_geometry_ocr.py` | PaddleOCR/EasyOCR boxes; per-character baseline regression; stroke and kerning variance; CIELAB ΔE patching |
| 3. Metadata and protocol | `backend/core/layer3_metadata_rules.py` | EXIF/ICC/PNG chunks; JPEG DQT/subsampling and channel fingerprint; viewport plausibility; UPI UTR/VPA validation; status/receipt time consistency |
| 4. Ensemble and dossier | `backend/core/pipeline.py` | Pydantic result schema; calibrated, benchmarked aggregation; cross-layer evidence links; optional semantic model with explicit provenance |
| Workbench | `frontend/` | Quad-view loupe, laser overlays, findings-to-region navigation, before/after laundering view, mobile QR intake, report export |
| Dataset and QA | `backend/sample_generator.py`, `datasets/` | Consent-safe synthetic genuine/edited pairs; labeled cases, transforms, and expected cues; false-positive measurement by image/channel |

### Recommended repo layout

```text
backend/
  app.py
  api/schemas.py
  core/pipeline.py
  core/layer1_signal.py
  core/layer2_geometry_ocr.py
  core/layer3_metadata_rules.py
  core/layer4_ensemble.py
  core/whatsapp_simulator.py
  reports/certificate.py
frontend/                 # current offline prototype; migrate to React/Vite if needed
  index.html
  src/
datasets/                 # synthetic fixtures and labels only
  golden_cases.json
  README.md
docs/
  API_CONTRACT.md
  DEMO_SCRIPT.md
```

## Build sequence and team handoff

1. **Lock the interface**: define API request limits, versioned JSON response, normalized image coordinates, severity vocabulary, per-layer status (`complete`, `partial`, `unavailable`), and provenance for every finding.
2. **Signal and OCR track**: implement layers 1–2 behind pure functions. Return heatmap assets and normalized text/evidence boxes; never imply a detection when a layer is unavailable.
3. **Rules and dataset track**: implement metadata/protocol rules and the WhatsApp transform; create labeled synthetic controls and edits. Do not treat a regex match as proof of settlement.
4. **Workbench track**: connect panels to backend heatmaps and normalized boxes; ensure clicking a finding selects the same coordinates in all views. Use unknown/partial labels honestly.
5. **Integration and calibration**: benchmark by attack type and channel; report false positives and false negatives with counts. Calibrate thresholds on held-out cases; do not promise 0% false positives.
6. **Freeze and demo**: pin local dependencies/model weights, test airplane-mode startup, create a QR route only on a trusted local network/tunnel, and rehearse the 4-minute demo with a prerecorded fallback.

### Hackathon checkpoints in the supplied brief

- **Nov 9**: bootstrap, API schema, first ELA/wavelet and shell.
- **Nov 10**: geometry/overlay, simulator and synthetic data.
- **Nov 11**: integration, findings navigation, certificate, benchmark.
- **Nov 12, 9 PM**: feature freeze, offline packaging, mobile intake and dress rehearsals.
- **Nov 13**: run the tested build, keep a local backup video, label all model and data limitations.

## Run locally

Requires Python 3. Install the small QR generation dependency with `python3 -m pip install -r requirements.txt`, then run `python3 server.py`. The analysis UI remains offline-first; phone upload requires the phone and laptop to share a trusted local network.
