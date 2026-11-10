# VeriSight — Forensic Validation Framework & Synthetic Golden Dataset Specification

**HackStellar 2026 — Problem Statement 12: "Is This Screenshot Real?"**

---

## 1. Validation Philosophy & Scientific Rigor

Forensic evaluation requires unambiguous ground truth. VeriSight adopts a dual-track validation methodology:
1. **Deterministic Golden Dataset (Samples 1–5):** Programmatically generated screenshots with mathematically controlled ground-truth alterations, coordinates, and metadata tags.
2. **Quantitative Detector-Level Metrics:** Measuring latency, false-positive rate (FPR), false-negative rate (FNR), and localization Intersection-over-Union (IoU).

> **LEGAL & ETHICAL MANDATE:**  
> All sample screenshots depict entirely fictional individuals, fictional merchant names, and synthetic transaction identifiers. Every sample visually bears the explicit watermark:  
> **"SYNTHETIC DEMONSTRATION — NOT A REAL TRANSACTION"**

---

## 2. Ground-Truth Golden Demonstration Suite

| Sample File | Scenario & Ground-Truth Manipulations | Expected Forensic Signatures | Target Tamper Score | Expected Verdict |
| :--- | :--- | :--- | :---: | :---: |
| **`sample_1_authentic_gpay.png`** | Clean synthetic payment-style UI fixture. It is **not** a genuine bank, merchant, or payment screenshot. | Expected low review score. PNG ELA does not contribute to the score. | **0% – 15%** | `LIKELY_AUTHENTIC` |
| **`sample_2_spliced_amount.jpg`** | Synthetic fixture with a deliberately edited amount and a text-baseline anomaly. | Multiple weak pixel/rendering cues plus a baseline anomaly place it in the manipulated band for this controlled fixture. | **72% – 92%** | `MANIPULATED_FORGERY` |
| **`sample_3_fake_generator_paradox.png`** | Synthetic fixture with conflicting displayed times, an invalid reference-format example, and a generator metadata tag. | Rule contradictions are reported with caveats; generator metadata is not treated as proof by itself. | **72% – 92%** | `MANIPULATED_FORGERY` |
| **`sample_4_whatsapp_laundered.jpg`** | Recompressed synthetic edited fixture. | Compression alone does not count as proof; baseline and additional cues corroborate this controlled example. | **72% – 92%** | `MANIPULATED_FORGERY` |
| **`sample_5_cloned_chat_receipt.jpg`** | Synthetic fixture with repeated regions and a non-native crop. | Copy-move matching alone is a review cue because repeated UI elements can match. | **25% – 70%** | `SUSPICIOUS_ANOMALIES` |

---

## 3. Quantitative Evaluation Benchmarks

The current repository does not contain a representative labeled real-world dataset or statistically valid precision/recall benchmark. The following are regression fixtures, not production accuracy claims:

| Metric | Target Specification | Measured Benchmark Result | Status |
| :--- | :--- | :--- | :---: |
| **Precision / recall / FPR / FNR** | Require a representative, independently labeled evaluation set | Not measured | **Not established** |
| **Regression suite** | Clean and altered synthetic fixtures plus common transforms | See `backend/tests/` | **Automated checks** |
| **C2PA provenance validation** | Cryptographic manifest, signature, trust-chain, and asset-binding validation | Marker detection only; validation is not implemented | **Unavailable** |

---

## 4. Test Execution Protocol

Validation is automated via `backend/tests/`:
- `pytest tests/test_layer1_signal.py`: Validates ELA macroblock thresholds, wavelet noise void detection, and ORB vector clustering.
- `pytest tests/test_layer2_geometry.py`: Validates sub-pixel baseline regression accuracy ($\pm 0.2\text{ px}$ tolerance), CIELAB $\Delta E_{ab}$ color distance, and sharpness Z-scores.
- `pytest tests/test_layer3_metadata.py`: Validates EXIF extraction, WhatsApp fingerprinter, and UPI UTR checksum format validation.
- `pytest tests/test_layer4_ensemble.py`: Validates conservative corroboration and overlap localization; the score is heuristic, not Bayesian or a calibrated probability.
- `pytest tests/test_synthetic_samples.py`: End-to-end integration test verifying the full pipeline against all 5 golden demo samples.

---

*Validation framework approved.*
