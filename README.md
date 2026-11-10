# VeriSight - HackStellar PS-12

## Hosted prototype

- **Prototype:** [https://verisight-ps12.vercel.app](https://verisight-ps12.vercel.app)
- **Health:** `https://verisight-ps12.vercel.app/api/health`
- **Demo samples:** `https://verisight-ps12.vercel.app/api/demo-samples`
- **Database:** Supabase project `ytxfhmdzlelcpjsnlndh` (ap-south-1), table `public.forensic_cases`.

The Vercel FastAPI service serves the React dashboard and its API from one public origin. Screenshot analysis results are persisted to Supabase as metadata, verdicts, findings, and layer summaries; uploaded image bytes and heatmap payloads are not stored in the database. The table has RLS enabled with no public read/write policies. The server uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; keep the server key only in Vercel's encrypted environment settings or a local ignored env file. The schema is versioned under `supabase/migrations/`.

The judge mobile handoff uses a one-use session UUID. Its screenshot is kept in the private `mobile-evidence` Storage bucket only until the paired desktop workbench retrieves and analyzes it, then the object is deleted. Abandoned uploads are removed when the next mobile upload arrives after the 24-hour retention window. The `mobile_uploads` table has RLS enabled with no public policies.

Vercel production variables are configured for Production. To recreate a local Supabase integration, apply the migration with the Supabase CLI and set the two variables in an ignored `.env` file before starting the API. Never use the server-side database key in browser code.

The project is deployed from GitHub `Arya99908/verisight-hackstellar-ps12`, branch `main`.

The repository now contains two additive local interfaces: the original lightweight, offline-first workbench at `http://localhost:8100`, and the expanded React/TypeScript four-layer forensics workbench at `http://localhost:5174` backed by FastAPI at port `8101`. The original uploader, simulator, API, samples, and report controls remain in place; the expanded application adds the integrated forensic pipeline, five labeled synthetic examples, mobile QR intake, spectral viewer, and richer report.

## Expanded application quickstart (macOS/Linux)

```bash
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
cd frontend && npm ci && cd ..
./start-verisight.sh
```

Open `http://localhost:5174`. API docs are at `http://localhost:8101/docs`. The original simple prototype can still be run with `.venv/bin/python server.py --port 8100`.

## Expanded feature set

- Layer 1: multi-scale ELA, db4 wavelet noise residuals, ORB copy-move vectors, and JPEG ghost analysis.
- Layer 2: offline OCR/MSER fallback, baseline laser geometry, CIELAB patch checks, and sharpness cues.
- Layer 3: EXIF/PNG metadata inspection, device viewport references, UPI format and temporal consistency rules, and WhatsApp forwarding fingerprints.
- Layer 4: weighted risk aggregation and cross-layer spatial corroboration; status and evidence are returned in structured reports.
- React forensic viewer with spectral modes, synchronized loupe, laser overlay, findings sidebar, sample selection, WhatsApp before/after simulator, mobile upload QR, and printable report.
- Five explicitly watermarked synthetic samples for genuine, spliced, generator, laundered, and clone-move cases.

The advanced implementation is integrated additively from the supplied `verisight-main` project. Existing lightweight files at repository root remain available as a second interface. The full design and component documentation is in `docs/`; an abbreviated quick reference is below.

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

This is a prototype, not a validated forensic product. The React workbench does not contain a trained image-forgery classifier; its five bundled examples are synthetic fixtures. It reports `INCONCLUSIVE`, `REVIEW_REQUIRED`, or `CORROBORATED_ANOMALIES`, never a verified-real or verified-fake result. Its point score is an uncalibrated triage heuristic and classifier confidence is unavailable. QR payloads can be decoded locally for inspection, but the payee, URL destination, and payment state are not verified. C2PA marker detection does not cryptographically validate a manifest. Do not use this demo to decide whether a payment occurred; confirm through the payment provider or bank.

See [MODEL_TRAINING_READINESS.md](docs/MODEL_TRAINING_READINESS.md) for why no model was trained on the current five fixtures and the data, split, calibration, and evaluation needed before an accuracy claim is appropriate.

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

## Lightweight analysis API

`POST /api/analyze` on the port-8100 server returns deterministic ELA, high-pass, JPEG metadata and optional Tesseract observations. This endpoint deliberately reports no calibrated score. The expanded FastAPI service on port 8101 provides the full report contract and is the API used by the React workbench.

## Accuracy and evidence boundary

Synthetic cases and reported benchmark metrics describe a controlled demonstration set. They do not establish real-world fraud detection accuracy. UTR pattern checks do not verify settlement. C2PA trust depends on configured trust material. Treat model scores as investigative triage; confirm payments with the provider.
