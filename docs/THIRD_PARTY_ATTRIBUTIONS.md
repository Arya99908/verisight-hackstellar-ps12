# VeriSight — Third-Party Code, Algorithm & Asset Attributions

**HackStellar 2026 — Problem Statement 12: "Is This Screenshot Real?"**

---

## 1. Architectural Code Reuse & Licensing Policy

To maintain complete architectural integrity, distribution safety, and license compliance, VeriSight classifies all referenced technologies and algorithms into four distinct categories:

1. **Category A — Direct Integration:** Permissively licensed (MIT, Apache-2.0, BSD) third-party packages installed via standard package managers (`pip`, `npm`).
2. **Category B — Architecture & Interaction Adaptation:** UI/UX workflows, interactive viewer patterns, and REST API conventions adapted from open research and web forensic standards.
3. **Category C — Independent Mathematical Implementation:** Algorithms derived from peer-reviewed scientific literature and open-source inspirations, independently written in Python/OpenCV/NumPy to prevent copyleft (GPL-3.0) contamination.
4. **Category D — Research Reference & Optional Adapters:** Deep learning models and experimental tools evaluated as optional workers with decoupled interface boundaries.

---

## 2. Attributions by Category

### Category A: Direct Open-Source Package Integrations

| Library / Tool | Upstream Repository / Project | License | Purpose in VeriSight |
| :--- | :--- | :--- | :--- |
| **FastAPI** | `tiangolo/fastapi` | MIT | Asynchronous REST backend framework |
| **OpenCV Headless** | `opencv/opencv-python` | Apache-2.0 | Spatial filtering, color conversions, edge detection |
| **NumPy & SciPy** | `numpy/numpy`, `scipy/scipy` | BSD-3-Clause | Vectorized linear algebra, statistical distributions, filtering |
| **scikit-image** | `scikit-image/scikit-image` | BSD-3-Clause | Morphological analysis, block slicing, structural metrics |
| **Pillow (PIL)** | `python-pillow/Pillow` | HPND | Image encoding, EXIF parsing, synthetic rendering |
| **ExifRead** | `ianare/exif-py` | BSD-3-Clause | Detailed TIFF/EXIF tag extraction |
| **qrcode** | `lincolnloop/python-qrcode` | BSD-3-Clause | Generating stage judge mobile upload QR codes |
| **React & Vite** | `facebook/react`, `vitejs/vite` | MIT | Reactive single-page application framework & bundler |
| **Tailwind CSS** | `tailwindlabs/tailwindcss` | MIT | Utility-first design tokens and dark-mode styling |
| **Lucide React** | `lucide-icons/lucide` | ISC | Consistent, tree-shakeable SVG forensic icons |
| **Framer Motion** | `motiondivision/motion` | MIT | Smooth UI animations, drawer transitions, radial gauge |
| **qrcode.react** | `zpao/qrcode.react` | ISC | React component for rendering QR codes |

---

### Category B: Adapted Architectural & Interaction Paradigms

| Reference | Original Project | Description of Adaptation |
| :--- | :--- | :--- |
| **Sherloq-WebUI** | `saintbrodie/sherloq-webui` / Community Web Forensics | Inspired the decoupled REST architecture: client-side reactive canvas paired with backend JSON analysis payloads and base64 heatmaps. |
| **Forensically** | `29a.ch/photo-forensics` by Jonas Wagner | Inspired the interactive dual magnifying loupe and multi-spectral view tabs (Original, ELA, Wavelet, Clones). No source code copied; built with modern React + SVG overlays. |

---

### Category C: Independent Algorithmic Re-implementations

| Algorithm | Published Research / Prior Art | Implementation Details in VeriSight |
| :--- | :--- | :--- |
| **Error Level Analysis (ELA)** | Krawetz (2007); Sherloq `ela.py` | Re-encodes decoded pixels at a selected JPEG quality and visualizes residuals. For JPEG sources, 16×16 block outliers use a configured statistical threshold. The score is disabled for non-JPEG sources; no probability is produced. |
| **High-Frequency Residual Cue** | Mahdian & Saic (2009); Sherloq `noise_separation.py` | Uses custom separable filters, a diagonal high-frequency response and a 9×9 local variation map. It is exploratory and does not establish a splice. |
| **Copy-Move Candidate Matching** | Amerini et al. (2011); Sherloq `copy_move.py` | Uses ORB and Hamming descriptor matching with displacement clustering. Similar interface elements can match; output is a candidate cue, not a validated detector result. |
| **Text-Like Baseline Geometry** | Digital typography rasterization standards | Connected-component boxes are grouped into rows and compared to median baseline positions. The offline path does not recognize text; thresholds have not been validated across devices or interfaces. |
| **CIELAB Perceptual Card Background Patch Detector** | CIE 1976 $\Delta E_{ab}$ standard | Independently implemented in `typography/cielab_patch.py`. Compares inner background margin against outer card reference, flagging $\Delta E_{ab} > 2.4$ discontinuities. |
| **Status-Bar Clock & UPI Format Heuristics** | Displayed image/metadata strings | Prototype-only format and time consistency cues. Current offline mode does not OCR screenshot text; format matches are not bank validation or transaction confirmation. |
| **Cross-Layer Spatial IoU Rule** | Prototype heuristic | Reports a candidate location only when an ORB repeated-feature box overlaps a baseline-geometry cue. The overlap is not a validated authenticity determination. |

---

### Category D: Research References & Optional Worker Adapters

| Reference | Authors & Organization | Status & Role in VeriSight |
| :--- | :--- | :--- |
| **TruFor** | Guillaro et al. (CVPR 2023), GRIP-UNINA | Researched and evaluated. VeriSight implements a clean decoupled adapter interface (`services/forensic/adapters/advanced_model_adapter.py`). Because TruFor requires large model weights (~500MB) and CUDA dependencies, the adapter gracefully reports its status while VeriSight's deterministic mathematical engine operates with zero external dependencies. |
| **Noiseprint** | Cozzolino & Verdoliva (TIFS 2020), GRIP-UNINA | Researched. Found to have limited direct applicability to digital screenshots due to lack of optical camera sensor PRNU in framebuffer captures. |
| **C2PA / Content Credentials** | Coalition for Content Provenance and Authenticity | The prototype only detects possible marker strings. It does not parse manifests or validate signatures, trust chains, or asset binding. |

---

*This inventory describes dependencies and references visible in the repository; it is not an independent legal review.*
