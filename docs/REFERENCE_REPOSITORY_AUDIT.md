# VeriSight — Reference Repository & Ecosystem Audit
**HackStellar 2026 — Problem Statement 12: "Is This Screenshot Real?"**

> This is a research/reference inventory, not a claim that every listed method or third-party system is implemented. The active implementation summary at the end describes this checkout; the prototype has no trained or calibrated authenticity model.

---

## 1. Executive Summary

Digital screenshots present a fundamentally different threat model compared to traditional digital camera photographs:
1. **Absence of Camera Sensor PRNU:** Screenshots originate from GPU framebuffers, display servers, or web canvas buffers. Physical Photo-Response Non-Uniformity (PRNU) is absent.
2. **Sub-Pixel Vector Font Rendering:** Text rendered on modern operating systems (FreeType, DirectWrite, CoreText) exhibits deterministic sub-pixel anti-aliasing, strict typographic baselines, uniform kerning, and consistent local color backgrounds.
3. **Re-encoding:** Some sharing and capture workflows resize or recompress images and alter metadata. The transforms vary by app, OS, media type, and settings; no single dimension or missing EXIF identifies the source.
4. **Possible Editing Paths:** Pixel editing, generated screens, and changed source data are possible threats, but there is no universal metadata or visual clue that proves any one path.

Below is an exhaustive technical audit of the primary open-source forensic repositories and research implementations informing the architecture of **VeriSight**.

---

## 2. Comprehensive Repository Audit

### Repository A: GuidoBartoli/sherloq
* **URL:** `https://github.com/GuidoBartoli/sherloq`
* **Purpose:** Open-source digital image forensic toolset for investigators and analysts.
* **Architecture:** Desktop application built on Python 3 with Qt/PySide GUI, organized into functional packages (`gui/tools/inspection`, `gui/tools/noise`, `gui/tools/jpeg`, `gui/tools/tampering`).
* **Algorithms Implemented:**
  - *Error Level Analysis (ELA):* Absolute difference between original and JPEG re-compressed image ($Q \in [50, 100]$), amplified by dynamic gain factor.
  - *Noise Analysis:* Wavelet decomposition (Daubechies), local min/max deviation, bit-plane slicing, noise separation.
  - *Tampering & Splicing:* Copy-move detection via feature matching (ORB/AKAZE), luminance gradient analysis, JPEG ghost maps, resampling periodicity.
* **Relevant Modules:**
  - `gui/tools/jpeg/ela.py` (Error Level Analysis)
  - `gui/tools/noise/noise_separation.py` (Noise residual isolation)
  - `gui/tools/tampering/copy_move.py` (Keypoint matching & displacement vectors)
  - `gui/tools/jpeg/ghosts.py` (JPEG ghost quality sweep)
* **Dependencies:** `opencv-python`, `numpy`, `scipy`, `PyWavelets`, `matplotlib`, `PySide6`.
* **License:** **GNU General Public License v3.0 (GPL-3.0)**.
* **Tests:** Unit test coverage is sparse; primarily verified via interactive manual GUI execution.
* **Reusability Category:** **C. Independent Implementation**. Due to GPL-3.0 copyleft terms and desktop Qt dependencies, VeriSight reimplements the mathematical signal pipelines independently using standard NumPy/SciPy/PyWavelets/OpenCV, tailored for web service architecture.
* **VeriSight Application:** Layer 1 Pixel & Frequency Engine (Multi-Scale ELA, Daubechies db4 high-pass noise residuals, ORB copy-move displacement vector clustering).
* **Limitations for Screenshots:** 
  - Several tools (e.g., camera PRNU identification) assume raw optical sensors and fail on screenshots.
  - Desktop-centric Qt event loop cannot be served over HTTP without a complete decoupled service layer.

---

### Repository B: saintbrodie/sherloq-webui (and Web Image Forensics Ecosystem)
* **URL:** `https://github.com/saintbrodie/sherloq-webui` (and `29a.ch/photo-forensics` / `fotoforensics.com`)
* **Purpose:** Web-based wrappers and interactive browsers for digital image forensics.
* **Architecture:** Decoupled client-server architecture: FastAPI/Flask backend exposing image transformation endpoints, transmitting base64 heatmaps or coordinate arrays to a reactive frontend canvas.
* **Algorithms Implemented:** Server-side OpenCV processing pipelines; client-side canvas blending, interactive zoom/pan loupes, and channel slicing.
* **Relevant Modules:** Web API routes, asynchronous job dispatchers, base64 image serializers, dual-canvas synchronization.
* **Dependencies:** Python web frameworks (`FastAPI`/`Flask`), React / Vue / HTML5 Canvas.
* **License:** MIT or proprietary/web-service.
* **Tests:** API endpoint integration tests, mock image fixtures.
* **Reusability Category:** **B. Adaptation**. The web service architecture pattern (FastAPI REST backend + React Dark-Mode Canvas with dual synchronized loupe and SVG overlay layers) is adapted for VeriSight.
* **VeriSight Application:** Core workbench layout, asynchronous `/api/analyze` pipeline, base64 heatmap delivery, and interactive 3x magnifying loupe.
* **Limitations:** Prior implementations often suffer from high latency on large images and lack domain-specific validation rules for payment/financial screenshots.

---

### Repository C: grip-unina/TruFor
* **URL:** `https://github.com/grip-unina/TruFor`
* **Purpose:** CVPR 2023 state-of-the-art learned image forgery detection and localization framework.
* **Architecture:** PyTorch-based neural pipeline combining high-level RGB features with low-level noise-sensitive forensic traces via **Noiseprint++**.
* **Algorithms Implemented:**
  - High-pass noise residual extraction via self-supervised CNN (Noiseprint++).
  - Cross-attention transformer fusion between RGB and noise features.
  - Multi-task output head: pixel-level forgery mask + whole-image integrity score + pixel-level reliability map.
* **Relevant Modules:** `TruFor_train_test/models/`, `eval_test.py`, `test_docker/`.
* **Dependencies:** `torch>=1.12`, `torchvision`, `scipy`, `scikit-image`, large pretrained model weights (~500MB).
* **License:** Academic/Research non-commercial license for weights; MIT for code.
* **Tests:** Rigorous benchmark scripts across DSO-1, Columbia, Coverage, and CocoGlide datasets.
* **Reusability Category:** **D. Research Only / Optional Adapter**.
* **VeriSight Application:** The repository includes an `AdvancedModelAdapter` status stub in `backend/app/services/forensic/adapters/`; it does not load weights or run TruFor inference. The active pipeline is a set of deterministic heuristics. Latency and reliability have not been established as benchmarks.
* **Limitations for Screenshots:** TruFor is trained predominantly on natural photographic tampering (splicing people/objects into camera scenes). Clean digital screenshot cards with flat raster vector graphics can trigger false alarms in the reliability map if not calibrated.

---

### Repository D: grip-unina/noiseprint
* **URL:** `https://github.com/grip-unina/noiseprint`
* **Purpose:** CNN-based camera model fingerprint extraction for blind image forgery localization (TIFS 2020).
* **Architecture:** Siamese CNN trained to suppress semantic image content and isolate model-dependent camera artifacts.
* **Relevant Modules:** `main_extraction.py`, `main_blind.py`.
* **Dependencies:** TensorFlow 1.x / 2.x, NumPy, SciPy.
* **License:** Custom academic research license.
* **Reusability Category:** **D. Research Only**.
* **VeriSight Application:** This reference motivates one exploratory high-frequency residual cue. The active code uses custom separable filters and a 9×9 local variation measurement; the result is not a validated manipulation detector.
* **Limitations for Screenshots:** True camera model fingerprints do not exist in digital screenshots. Attempting to match camera sensors produces noise artifacts.

---

### Repository E: contentauth/c2pa-python & C2PA Toolset
* **URL:** `https://github.com/contentauth/c2pa-python` & `https://github.com/contentauth/c2patool`
* **Purpose:** Official Coalition for Content Provenance and Authenticity (C2PA) standard SDK for reading, validating, and signing cryptographic Content Credentials.
* **Architecture:** Rust core (`c2pa-rs`) with high-performance C-FFI / Python bindings.
* **Algorithms Implemented:**
  - JUMBF (JPEG Universal Metadata Box Format) box traversal.
  - Cryptographic signature validation against trusted trust lists.
  - SHA-256 asset hash binding verification.
  - Assertion validation and ingredient history chain reconstruction.
* **Relevant Modules:** `c2pa.Reader`, manifest inspection.
* **Dependencies:** `c2pa-python` (Rust binary wheel) or pure container chunk parsers for `jumbf` / `c2pa` markers.
* **License:** Apache-2.0 / MIT dual license.
* **Tests:** Verified against `https://github.com/c2pa-org/public-testfiles`.
* **Reusability Category:** **D. Reference only in this checkout**.
* **VeriSight Application:** The active inspector searches file bytes for possible marker strings. It does not parse JUMBF boxes, read a manifest, or produce the cryptographic validation states listed above.
* **Critical Forensic Principle:** A screenshot lacking a C2PA manifest is **not** evidence of forgery (native OS screenshot capture tools do not attach C2PA signatures). Conversely, a valid C2PA signature only verifies who created/edited the file, not whether the payment displayed in the screenshot actually occurred in the banking system.

---

### Repository F: Forensically (29a.ch/photo-forensics)
* **URL:** `https://29a.ch/photo-forensics/`
* **Purpose:** Web-based browser digital image forensics application.
* **Architecture:** Pure client-side JavaScript / HTML5 Canvas application.
* **Forensic Panels:**
  - Synchronized Magnifier with real-time histogram equalization and contrast stretching.
  - Clone Detector with feature clustering and interactive link vectors.
  - Error Level Analysis with adjustable quality slider ($Q$) and amplification gain.
  - Noise Analysis with high-pass filtering.
  - Level Sweep / Luminance slicing.
* **Reusability Category:** **B. Interaction & UX Reference**.
* **VeriSight Application:** Informs the interactive multi-spectral canvas:
  - Dual synchronized 3x loupe (Original vs. ELA / Wavelet side-by-side).
  - High-contrast SVG typography baseline laser lines.
  - Interactive clickable evidence feed with canvas bounding box reticles.

---

## 3. Summary of Architectural Adoptions

| Forensic Layer | Source / Research Reference | What this checkout actually does |
| :--- | :--- | :--- |
| **Layer 1: Image cues** | Image-forensics research | JPEG ELA residuals, custom high-frequency variation, ORB candidate matches, and JPEG quality sweep; heuristic cues, with no trained model. |
| **Layer 2: Component geometry** | OCR/layout research | OpenCV connected components identify text-like shapes; the default path does not recognize text. Baseline and local-color rules can flag ordinary interface rendering. |
| **Layer 3: Metadata and payloads** | Metadata, QR, and provenance references | Reads selected metadata, decodes readable QR payloads, checks limited supplied text/metadata fields, and scans raw bytes for possible C2PA marker strings. It does not identify a source app or validate a payment or credential. |
| **Layer 4: Rule aggregation** | Heuristic evidence combination | Adds hand-set points for selected cues and reports rule states. Spatial overlap is a candidate cue; no probability calibration or accuracy rate is available. |

---

*Last reviewed against this checkout; reference descriptions above are not deployment or model-validation claims.*
