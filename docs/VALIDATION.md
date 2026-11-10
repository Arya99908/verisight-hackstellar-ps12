# VeriSight — Forensic Regression Checks & Synthetic Fixture Notes

**HackStellar 2026 — Problem Statement 12: "Is This Screenshot Real?"**

---

## 1. Validation Philosophy & Scientific Rigor

Forensic evaluation requires unambiguous ground truth. VeriSight adopts a dual-track validation methodology:
1. **Synthetic Regression Fixtures (Samples 1–5):** Programmatically generated screenshots with controlled edits and metadata fields for code-path checks.
2. **Future Evaluation Metrics:** Latency, false-positive rate (FPR), false-negative rate (FNR), and localization IoU require a representative labeled test set and have not been measured here.

> **LEGAL & ETHICAL MANDATE:**  
> All sample screenshots depict entirely fictional individuals, fictional merchant names, and synthetic transaction identifiers. Every sample visually bears the explicit watermark:  
> **"SYNTHETIC DEMONSTRATION — NOT A REAL TRANSACTION"**

---

## 2. Synthetic Demonstration Fixtures

| Sample File | Scenario & Ground-Truth Manipulations | Expected Forensic Signatures | Heuristic Score Band | Assessment |
| :--- | :--- | :--- | :---: | :---: |
| **`sample_1_clean_synthetic_ui.png`** | Clean synthetic payment-style UI fixture. It is **not** a genuine bank, merchant, or payment screenshot. | Low heuristic score. PNG ELA does not contribute to the score. | Heuristic value varies by runtime | `INCONCLUSIVE` |
| **`sample_2_spliced_amount.jpg`** | Synthetic fixture with a deliberately edited amount and layout. | Current cues trigger review but do not prove the edit was detected; no overlapping clone/geometry location was produced. | Heuristic value varies by runtime | `REVIEW_REQUIRED` |
| **`sample_3_fake_generator_paradox.png`** | Synthetic fixture with conflicting time/reference examples embedded in PNG metadata. | Metadata-rule cues and unrelated image cues may raise the score; these values are not OCR-recognized or issuer-verified. | Heuristic value varies by runtime | `REVIEW_REQUIRED` |
| **`sample_4_synthetic_jpeg_reencode.jpg`** | Recompressed synthetic edited fixture. | Re-encoding is not used to identify an app; cues trigger review, not localized corroboration. | Heuristic value varies by runtime | `REVIEW_REQUIRED` |
| **`sample_5_cloned_chat_receipt.jpg`** | Synthetic fixture with repeated regions and a non-native crop. | ORB feature matches alone are a review cue because repeated UI elements can match. | Heuristic value varies by runtime | `REVIEW_REQUIRED` |

---

## 3. Quantitative Evaluation Benchmarks

The current repository does not contain a representative labeled real-world dataset or statistically valid precision/recall benchmark. These are regression fixtures, not production accuracy claims:

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
- `pytest tests/test_layer3_metadata.py`: Validates EXIF extraction, weak JPEG profile cue behavior, and supplied UPI reference-format checks.
- `pytest tests/test_layer4_ensemble.py`: Checks the overlap rule and candidate-region reporting; the score is heuristic, not Bayesian or a calibrated probability.
- `pytest tests/test_synthetic_samples.py`: End-to-end checks for the full pipeline against all 5 synthetic demo fixtures.

---

*These fixtures exercise implemented code paths; they do not validate real-world accuracy.*
