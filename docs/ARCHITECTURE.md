# VeriSight Architecture and Current Scope

## Overview

VeriSight is a React/Vite frontend and FastAPI backend for visual review of screenshots. The analysis pipeline uses hand-written image measurements and metadata rules. It does not run a trained image classifier, recognize image text by default, verify a payment with a bank, or establish that a file is authentic.

## Request flow

1. The browser accepts a PNG, JPEG, WebP, or BMP image and submits it to the API. Large mobile handoffs use a short-lived signed upload to the private Supabase Storage bucket.
2. FastAPI validates and decodes the image, hashes the original bytes, and runs the analysis layers.
3. The response includes the original image representation, cue maps, candidate regions, measurements, findings, a heuristic points score, and an evidence-state verdict.
4. Case metadata is written server-side to Supabase. The case row excludes image bytes, heatmap payloads, and decoded QR payloads.
5. The browser renders the image and cue maps, supports zoom and manual region inspection, and can print a review dossier.

## Analysis layers

### Layer 1: image cues

- JPEG Error Level Analysis (ELA) produces a residual heatmap. Its block outlier score is disabled for non-JPEG sources. Residual variation is not proof of splicing.
- A custom high-frequency residual map highlights low local variation. Flat interface backgrounds and resampling can produce the same pattern.
- ORB descriptor matching reports candidate repeated-feature pairs. Repeated text and icons can match; a candidate is not a confirmed clone.
- A JPEG quality sweep reports whole-image reconstruction measurements; it does not produce a localized ghost map.

### Layer 2: text-like geometry

The default extractor finds connected components and their bounding boxes; it does not identify words or digits. Baseline grouping and local color/edge measurements can flag ordinary interface rendering. An optional neural OCR path exists in code but is not enabled by the default analysis pipeline.

### Layer 3: metadata, rules, and QR

The API reads selected EXIF/PNG metadata, dimensions, and image encoding. A missing EXIF block or common resize dimension cannot identify a source app. Clock and transaction-reference checks can use supplied metadata text or OCR tokens; pixel-only text is unavailable with the default extractor. OpenCV decodes readable QR payloads for manual inspection, but does not verify pixel integrity, destination safety, payee identity, or payment settlement. The C2PA helper searches raw bytes for possible marker strings only; it does not parse or validate a credential.

### Layer 4: evidence review

The ensemble adds hand-set points for configured cues. The score is a heuristic point scale, not a percentage. `INCONCLUSIVE`, `REVIEW_REQUIRED`, and `CORROBORATED_ANOMALIES` are rule labels, not authenticity probabilities. The corroborated label requires a candidate ORB region to overlap a flagged text-baseline region; even this remains a review cue, not proof.

## Frontend

The workbench provides image/cue-map views, image zoom, region overlays, findings, demo fixture selection, a messaging-style JPEG transform simulator, mobile upload handoff, and a printable review report. Green “Likely accurate” and red “Likely misleading” labels are display simplifications over the heuristic verdicts; neither is a calibrated probability. The interface states that payment status is not checked.

## API and persistence

- `GET /api/health` — readiness and database connectivity status.
- `GET /api/demo-samples` — synthetic regression fixture descriptions.
- `POST /api/analyze` — direct image upload and analysis.
- `POST /api/analyze-sample/{sample_id}` — run a bundled synthetic fixture.
- `POST /api/upload-session` and `POST /api/analyze-upload-session/{session_id}` — signed upload and one-time mobile handoff analysis.
- `POST /api/mobile-upload` and `GET /api/latest-mobile-upload` — local or session-scoped mobile handoff.
- `POST /api/simulate-whatsapp` — educational messaging-style JPEG transform; it is not an exact model of every app's pipeline.
- `GET /api/network-info` — local mobile-handoff URL information.

Supabase `forensic_cases` stores report metadata and findings, not the original image or heatmap/QR payloads. Row-level security is enabled; server writes use the service role key. Mobile uploads are temporarily held in a private Storage bucket, deleted after processing, and expired objects are cleaned on a best-effort basis when a subsequent upload is created. That cleanup is not a scheduled retention guarantee.

## Deployment

The Vercel project serves the Vite-built frontend and FastAPI endpoints from one origin. Runtime credentials are configured as Vercel environment variables; service-role keys must stay server-side and out of the repository.

## Validation boundary

The backend test suite covers code behavior and five synthetic fixtures. It does not measure performance on real payment screenshots, establish false-positive/false-negative rates, or validate market accuracy. Model training requires an independently sourced and labeled dataset, realistic transformations, manipulation masks, separate train/validation/test partitions, and calibrated evaluation. Payment authenticity requires a trusted payment-provider or bank record.
