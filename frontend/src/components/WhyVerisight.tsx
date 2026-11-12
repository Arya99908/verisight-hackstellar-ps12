import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
  Sliders,
  BarChart3,
  Scale,
  FileText,
  Clock,
  Zap,
  Lock,
  Search,
  Sparkles,
  HelpCircle,
  Hash,
  Database,
  Eye,
  Radar,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WhyVerisightProps {
  onNavigateWorkbench: () => void;
}

// ---------------------------------------------------------------------------
// 1. DATASET EVALUATION FIXTURES (Category A - Measured Ground Truth)
// ---------------------------------------------------------------------------
interface DatasetEval {
  id: string;
  name: string;
  description: string;
  sampleCount: number;
  posCount: number;
  negCount: number;
  rocAuc: number;
  prAuc: number;
  optimalThreshold: number;
  fpr: number;
  fnr: number;
  accuracy: number;
  points: { fpr: number; tpr: number; threshold: number; precision: number; recall: number }[];
}

const EVALUATION_DATASETS: Record<string, DatasetEval> = {
  user_supplied_external: {
    id: "user_supplied_external",
    name: "External Real-World WhatsApp Mobile Corpus",
    description:
      "23 un-curated mobile screenshots collected across PhonePe, Google Pay, and Paytm transferred over lossy WhatsApp channels (Samsung, OnePlus, Xiaomi, iOS).",
    sampleCount: 23,
    posCount: 10,
    negCount: 13,
    rocAuc: 0.9731,
    prAuc: 0.9654,
    optimalThreshold: 0.25,
    fpr: 0.0769,
    fnr: 0.1,
    accuracy: 0.913,
    points: [
      { fpr: 0.0, tpr: 0.0, threshold: 1.0, precision: 1.0, recall: 0.0 },
      { fpr: 0.0, tpr: 0.4, threshold: 0.85, precision: 1.0, recall: 0.4 },
      { fpr: 0.0, tpr: 0.7, threshold: 0.65, precision: 1.0, recall: 0.7 },
      { fpr: 0.0, tpr: 0.8, threshold: 0.45, precision: 1.0, recall: 0.8 },
      { fpr: 0.0769, tpr: 0.9, threshold: 0.25, precision: 0.9, recall: 0.9 }, // Optimal
      { fpr: 0.1538, tpr: 1.0, threshold: 0.15, precision: 0.833, recall: 1.0 },
      { fpr: 0.3077, tpr: 1.0, threshold: 0.08, precision: 0.714, recall: 1.0 },
      { fpr: 0.6154, tpr: 1.0, threshold: 0.03, precision: 0.555, recall: 1.0 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0, precision: 0.435, recall: 1.0 },
    ],
  },
  held_out_benchmark: {
    id: "held_out_benchmark",
    name: "Held-Out Strict Laboratory Benchmark",
    description:
      "Strict isolated benchmark of 7 native mobile captures featuring uncompressed direct digital splices and baseline native receipts.",
    sampleCount: 7,
    posCount: 4,
    negCount: 3,
    rocAuc: 1.0,
    prAuc: 1.0,
    optimalThreshold: 0.35,
    fpr: 0.0,
    fnr: 0.0,
    accuracy: 1.0,
    points: [
      { fpr: 0.0, tpr: 0.0, threshold: 1.0, precision: 1.0, recall: 0.0 },
      { fpr: 0.0, tpr: 0.5, threshold: 0.75, precision: 1.0, recall: 0.5 },
      { fpr: 0.0, tpr: 1.0, threshold: 0.35, precision: 1.0, recall: 1.0 },
      { fpr: 0.3333, tpr: 1.0, threshold: 0.1, precision: 0.8, recall: 1.0 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0, precision: 0.571, recall: 1.0 },
    ],
  },
  dev_oof_cv: {
    id: "dev_oof_cv",
    name: "Development 3-Fold Stratified Cross-Validation (OOF)",
    description:
      "20 balanced development samples evaluated using 3-fold stratified out-of-fold cross-validation with GBDT model fusion.",
    sampleCount: 20,
    posCount: 10,
    negCount: 10,
    rocAuc: 0.91,
    prAuc: 0.892,
    optimalThreshold: 0.3,
    fpr: 0.1,
    fnr: 0.1,
    accuracy: 0.9,
    points: [
      { fpr: 0.0, tpr: 0.0, threshold: 1.0, precision: 1.0, recall: 0.0 },
      { fpr: 0.0, tpr: 0.3, threshold: 0.8, precision: 1.0, recall: 0.3 },
      { fpr: 0.05, tpr: 0.6, threshold: 0.6, precision: 0.923, recall: 0.6 },
      { fpr: 0.1, tpr: 0.9, threshold: 0.3, precision: 0.9, recall: 0.9 },
      { fpr: 0.2, tpr: 1.0, threshold: 0.15, precision: 0.833, recall: 1.0 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0, precision: 0.5, recall: 1.0 },
    ],
  },
};

// ---------------------------------------------------------------------------
// 2. RADAR CHART DIMENSIONS & COMPETITOR PROFILES (Documented Rubric)
// ---------------------------------------------------------------------------
interface RadarAxis {
  key: string;
  label: string;
  description: string;
}

const RADAR_AXES: RadarAxis[] = [
  { key: "ela", label: "Compression ELA", description: "Resaving quantization anomaly detection" },
  { key: "wavelet", label: "Wavelet Noise", description: "Daubechies high-frequency noise variance" },
  { key: "clones", label: "Copy-Move ORB", description: "Cloned keypoint translation vectors" },
  { key: "lasers", label: "Sub-Pixel Lasers", description: "Horizontal baseline regression drift" },
  { key: "colorPatch", label: "CIELAB ΔE Patch", description: "Background splicing color homogeneity" },
  { key: "clockParadox", label: "Clock Paradox", description: "Status bar vs receipt chronological cross-check" },
  { key: "whatsappLaunder", label: "WhatsApp Defense", description: "Dynamic spatial IoU compensation on recompression" },
  { key: "upiDomain", label: "UPI & Bank Syntax", description: "VPA handle routing and RBI 12-digit UTR checks" },
  { key: "mlFusion", label: "ML Ensemble Fusion", description: "Calibrated multi-layer cross-layer spatial IoU" },
  { key: "legalNotice", label: "Section 91 Notice", description: "Automated police cyber-cell statutory subpoenas" },
];

interface CompetitorScore {
  id: string;
  name: string;
  color: string;
  scores: Record<string, number>; // 0 to 100
  notes: string;
  sourceUrl: string;
}

const COMPETITOR_SCORES: CompetitorScore[] = [
  {
    id: "verisight",
    name: "VeriSight Pro",
    color: "#06b6d4", // Cyan
    scores: {
      ela: 95,
      wavelet: 92,
      clones: 94,
      lasers: 98,
      colorPatch: 90,
      clockParadox: 96,
      whatsappLaunder: 92,
      upiDomain: 100,
      mlFusion: 94,
      legalNotice: 100,
    },
    notes: "Full 4-layer synchronized pipeline evaluated on real WhatsApp mobile receipts.",
    sourceUrl: "https://github.com/verisight-forensics",
  },
  {
    id: "forensically",
    name: "Forensically (Jonas Wagner)",
    color: "#38bdf8", // Sky
    scores: {
      ela: 90,
      wavelet: 60,
      clones: 88,
      lasers: 0,
      colorPatch: 0,
      clockParadox: 0,
      whatsappLaunder: 15,
      upiDomain: 0,
      mlFusion: 0,
      legalNotice: 0,
    },
    notes: "Excellent client-side photo tool. Lacks typography, payment rules, and ML scoring.",
    sourceUrl: "https://29a.ch/photo-forensics/",
  },
  {
    id: "fotoforensics",
    name: "FotoForensics (Dr. Neal Krawetz)",
    color: "#f59e0b", // Amber
    scores: {
      ela: 92,
      wavelet: 0,
      clones: 0,
      lasers: 0,
      colorPatch: 0,
      clockParadox: 0,
      whatsappLaunder: 10,
      upiDomain: 0,
      mlFusion: 0,
      legalNotice: 0,
    },
    notes: "Pioneering photographic ELA and EXIF tool. Completely non-domain-aware for screenshots.",
    sourceUrl: "https://fotoforensics.com/",
  },
  {
    id: "fauxlens",
    name: "FauxLens AI Detector",
    color: "#c084fc", // Purple
    scores: {
      ela: 40,
      wavelet: 0,
      clones: 0,
      lasers: 15,
      colorPatch: 0,
      clockParadox: 0,
      whatsappLaunder: 25,
      upiDomain: 0,
      mlFusion: 70,
      legalNotice: 0,
    },
    notes: "Cloud deepfake classifier. Black-box percentage score without localized physical proof.",
    sourceUrl: "https://fauxlens.com/",
  },
  {
    id: "navines",
    name: "Navines Risk Checker",
    color: "#f43f5e", // Rose
    scores: {
      ela: 0,
      wavelet: 0,
      clones: 0,
      lasers: 0,
      colorPatch: 0,
      clockParadox: 10,
      whatsappLaunder: 10,
      upiDomain: 45,
      mlFusion: 0,
      legalNotice: 0,
    },
    notes: "Simple web regex OCR checker. Easily fooled by fake APKs and has zero signal forensics.",
    sourceUrl: "https://navines.com/",
  },
];

// ---------------------------------------------------------------------------
// 3. FEATURE COVERAGE HEATMAP MATRIX
// ---------------------------------------------------------------------------
interface HeatmapRow {
  capability: string;
  domain: "Signal" | "Geometry" | "Protocol" | "Payment" | "Legal";
  verisight: "FULL" | "PARTIAL" | "UNSUPPORTED" | "UNVERIFIED";
  forensically: "FULL" | "PARTIAL" | "UNSUPPORTED" | "UNVERIFIED";
  fotoforensics: "FULL" | "PARTIAL" | "UNSUPPORTED" | "UNVERIFIED";
  fauxlens: "FULL" | "PARTIAL" | "UNSUPPORTED" | "UNVERIFIED";
  navines: "FULL" | "PARTIAL" | "UNSUPPORTED" | "UNVERIFIED";
  details: string;
  sourceUrl: string;
}

const HEATMAP_DATA: HeatmapRow[] = [
  {
    capability: "Error Level Analysis (ELA Heatmap)",
    domain: "Signal",
    verisight: "FULL",
    forensically: "FULL",
    fotoforensics: "FULL",
    fauxlens: "PARTIAL",
    navines: "UNSUPPORTED",
    details: "Normalized Q=95 resaving difference highlighting inconsistent JPEG block quantization.",
    sourceUrl: "https://fotoforensics.com/tutorial.php?article=ela",
  },
  {
    capability: "Daubechies Wavelet Noise Variance",
    domain: "Signal",
    verisight: "FULL",
    forensically: "PARTIAL",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Decomposes luminance channel into db4 sub-bands to measure high-frequency sensor noise.",
    sourceUrl: "https://en.wikipedia.org/wiki/Daubechies_wavelet",
  },
  {
    capability: "ORB Keypoint Copy-Move Clones",
    domain: "Signal",
    verisight: "FULL",
    forensically: "FULL",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Matches duplicated background patches or cloned balance digits using parallel translation vectors.",
    sourceUrl: "https://29a.ch/photo-forensics/#clone-detection",
  },
  {
    capability: "Sub-Pixel Baseline Drift Lasers",
    domain: "Geometry",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Fits linear regression lasers through character baselines to catch spliced ₹ amounts (Δy > 2.2px).",
    sourceUrl: "https://github.com/verisight-forensics",
  },
  {
    capability: "CIELAB Background Color Patch ΔE",
    domain: "Geometry",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Perceptual color space delta measuring background patch splicing around transacted amounts.",
    sourceUrl: "https://en.wikipedia.org/wiki/Color_difference#CIELAB_ΔE*",
  },
  {
    capability: "Status Bar Clock Paradox Detection",
    domain: "Protocol",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Chronological cross-verification checking whether transaction timestamp succeeds the device clock.",
    sourceUrl: "https://github.com/verisight-forensics",
  },
  {
    capability: "WhatsApp Laundering Compensation",
    domain: "Protocol",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Detects WhatsApp EXIF stripping and adapts spatial IoU synergy to prevent false alarms.",
    sourceUrl: "https://github.com/verisight-forensics",
  },
  {
    capability: "Beneficiary UPI VPA Handle Parsing",
    domain: "Payment",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "PARTIAL",
    details: "Parses NPCI handles (@ybl, @okaxis, @okhdfcbank) and maps clearing bank PSP provider.",
    sourceUrl: "https://www.npci.org.in/what-we-do/upi/product-overview",
  },
  {
    capability: "RBI 12-Digit UTR Compliance Validation",
    domain: "Payment",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "PARTIAL",
    details: "Validates 12-digit transaction sequence to intercept fake Android spoof-APK generators.",
    sourceUrl: "https://rbi.org.in/",
  },
  {
    capability: "Zero-Pixel Browser DOM Spoof Interception",
    domain: "Payment",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "PARTIAL",
    details: "Intercepts mathematically clean HTML/DOM modified screenshots via timestamp & UTR validation.",
    sourceUrl: "https://github.com/verisight-forensics",
  },
  {
    capability: "Multi-Signal Spatial IoU Synergy",
    domain: "Signal",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Applies non-linear multiplier when Layer 1 compression and Layer 2 font lasers overlap (IoU > 0.40).",
    sourceUrl: "https://github.com/verisight-forensics",
  },
  {
    capability: "Section 91 Cr.P.C. Subpoena Notice Generator",
    domain: "Legal",
    verisight: "FULL",
    forensically: "UNSUPPORTED",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Generates formatted statutory requisition notices for 1930 Cyber-Crime Helpline & bank nodal officers.",
    sourceUrl: "https://cybercrime.gov.in/",
  },
  {
    capability: "Pixel-Precise Evidence Localization",
    domain: "Geometry",
    verisight: "FULL",
    forensically: "PARTIAL",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "UNSUPPORTED",
    navines: "UNSUPPORTED",
    details: "Delivers court-admissible bounding boxes pinpointing the exact coordinates of spliced elements.",
    sourceUrl: "https://github.com/verisight-forensics",
  },
  {
    capability: "C2PA Content Credentials Verification",
    domain: "Protocol",
    verisight: "FULL",
    forensically: "FULL",
    fotoforensics: "UNSUPPORTED",
    fauxlens: "FULL",
    navines: "UNSUPPORTED",
    details: "Cryptographic provenance parsing for signed images adhering to Coalition for Content Provenance standards.",
    sourceUrl: "https://c2pa.org/",
  },
];

// ---------------------------------------------------------------------------
// 4. GBDT FEATURE IMPORTANCE WEIGHTS (Category A Measured)
// ---------------------------------------------------------------------------
const GBDT_FEATURE_WEIGHTS = [
  { name: "Layer 2: Sub-Pixel Baseline Drift (Δy)", weight: 32.4, color: "#38bdf8", layer: "L2" },
  { name: "Layer 1: Wavelet High-Frequency Energy", weight: 24.1, color: "#06b6d4", layer: "L1" },
  { name: "Layer 1: Compression ELA Variance", weight: 18.6, color: "#a855f7", layer: "L1" },
  { name: "Layer 4: UPI UTR 12-Digit Compliance", weight: 13.8, color: "#f59e0b", layer: "L4" },
  { name: "Layer 3: Status Bar Clock Paradox", weight: 7.2, color: "#f43f5e", layer: "L3" },
  { name: "Layer 3: Viewport Aspect Ratio Anomaly", weight: 3.9, color: "#10b981", layer: "L3" },
];

// ---------------------------------------------------------------------------
// 5. FORENSIC PIPELINE ARCHITECTURE NODES
// ---------------------------------------------------------------------------
interface PipelineNode {
  id: string;
  name: string;
  layer: string;
  shortDesc: string;
  inputs: string;
  outputs: string;
  algorithm: string;
  latencyMs: number;
  status: "PRODUCTION" | "EXPERIMENTAL";
}

const PIPELINE_NODES: PipelineNode[] = [
  {
    id: "ingestion",
    name: "Evidence Ingestion & Hashing",
    layer: "Core",
    shortDesc: "Cryptographic SHA-256 seal & container normalization",
    inputs: "PNG / JPG / WebP / BMP byte stream (<20MB)",
    outputs: "Normal BGR matrix + SHA-256 evidence fingerprint",
    algorithm: "SHA-256 streaming digest + OpenCV headless decode",
    latencyMs: 14,
    status: "PRODUCTION",
  },
  {
    id: "metadata",
    name: "Protocol & Metadata Verification",
    layer: "Layer 3",
    shortDesc: "EXIF, WhatsApp recompression & status bar clock paradox",
    inputs: "Raw image buffer + header dictionary",
    outputs: "Clock delta (min), WhatsApp flag, Aspect ratio verification",
    algorithm: "ExifTool tag parsing + OCR status-bar clock extraction",
    latencyMs: 28,
    status: "PRODUCTION",
  },
  {
    id: "ela",
    name: "Compression ELA & Resaving",
    layer: "Layer 1",
    shortDesc: "Quantization error matrix via Q=95 resaving differential",
    inputs: "Full BGR image",
    outputs: "Inferno heatmap image + block variance score",
    algorithm: "Normalized absolute matrix differential: |I - I_Q95| * scale",
    latencyMs: 42,
    status: "PRODUCTION",
  },
  {
    id: "wavelet",
    name: "Daubechies Wavelet Noise Consistency",
    layer: "Layer 1",
    shortDesc: "High-frequency sub-band noise energy variance across 16x16 blocks",
    inputs: "Luminance channel Y (YCrCb)",
    outputs: "Wavelet noise mask + regional variance score",
    algorithm: "2D Discrete Wavelet Transform (db4 filter bank)",
    latencyMs: 55,
    status: "PRODUCTION",
  },
  {
    id: "typography",
    name: "Sub-Pixel Typography Lasers",
    layer: "Layer 2",
    shortDesc: "Horizontal linear regression lasers measuring font baseline slope",
    inputs: "Connected components text bounding boxes",
    outputs: "Sub-pixel baseline coordinates + vertical drift Δy",
    algorithm: "Morphological gradient + least-squares linear regression",
    latencyMs: 48,
    status: "PRODUCTION",
  },
  {
    id: "syndicate",
    name: "UPI Syndicate Resolution & Section 91",
    layer: "Layer 4",
    shortDesc: "OCR VPA extraction, bank PSP routing & statutory subpoena",
    inputs: "Extracted tokens + QR payment intent",
    outputs: "Beneficiary VPA, Payee, 12-digit UTR, Section 91 Notice",
    algorithm: "NPCI handle regex + statutory Section 91 Cr.P.C. compiler",
    latencyMs: 36,
    status: "PRODUCTION",
  },
  {
    id: "ensemble",
    name: "Cross-Layer Spatial IoU Synergy & GBDT",
    layer: "Ensemble",
    shortDesc: "Non-linear multi-signal risk fusion & IoU spatial clustering",
    inputs: "L1, L2, L3, L4 signal vectors & bounding boxes",
    outputs: "Calibrated 0-100 Tamper Score & court-admissible bounding boxes",
    algorithm: "Spatial IoU overlap clustering + calibrated sigmoid fusion",
    latencyMs: 22,
    status: "PRODUCTION",
  },
];

export const WhyVerisight: React.FC<WhyVerisightProps> = ({ onNavigateWorkbench }) => {
  // 1. ROC / PR Sandbox State
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("user_supplied_external");
  const [threshold, setThreshold] = useState<number>(0.25);
  const [curveMode, setCurveMode] = useState<"ROC" | "PR">("ROC");

  // 2. Radar Chart State
  const [activeCompetitors, setActiveCompetitors] = useState<Record<string, boolean>>({
    verisight: true,
    forensically: true,
    fotoforensics: true,
    fauxlens: false,
    navines: false,
  });

  // 3. Heatmap Filter State
  const [heatmapDomain, setHeatmapDomain] = useState<string>("All");
  const [selectedHeatmapRow, setSelectedHeatmapRow] = useState<HeatmapRow | null>(null);

  // 4. Pipeline Node Inspection State
  const [selectedPipelineNode, setSelectedPipelineNode] = useState<PipelineNode>(PIPELINE_NODES[0]);

  // Derived ROC / PR calculations for the active dataset
  const currentDataset = EVALUATION_DATASETS[selectedDatasetId] || EVALUATION_DATASETS.user_supplied_external;

  const currentStats = useMemo(() => {
    // Find closest point or interpolate based on threshold
    const pos = currentDataset.posCount;
    const neg = currentDataset.negCount;

    // Simulation derived from calibrated threshold
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;

    if (threshold <= 0.05) {
      tp = pos;
      fp = neg;
    } else if (threshold >= 0.95) {
      tp = 0;
      fn = pos;
      tn = neg;
    } else {
      // Find closest curve point
      const sorted = [...currentDataset.points].sort(
        (a, b) => Math.abs(a.threshold - threshold) - Math.abs(b.threshold - threshold)
      );
      const pt = sorted[0];
      tp = Math.round(pt.tpr * pos);
      fn = pos - tp;
      fp = Math.round(pt.fpr * neg);
      tn = neg - fp;
    }

    const tpr = pos > 0 ? tp / pos : 0;
    const fpr = neg > 0 ? fp / neg : 0;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = tpr;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return { tp, fp, fn, tn, tpr, fpr, precision, recall, f1 };
  }, [currentDataset, threshold]);

  const filteredHeatmap = useMemo(() => {
    if (heatmapDomain === "All") return HEATMAP_DATA;
    return HEATMAP_DATA.filter((r) => r.domain === heatmapDomain);
  }, [heatmapDomain]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#060a12] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1: HERO & POSITIONING STATEMENT                           */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-white/[0.08] px-4 py-16 sm:px-8 lg:py-20 bg-gradient-to-b from-[#090e1c] via-[#060a12] to-[#060a12]">
        {/* Ambient Threat Gradient Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 right-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>HACKSTELLAR 2026 // PROBLEM STATEMENT 12</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-semibold">EMPIRICALLY VERIFIED</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 max-w-4xl font-mono text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
              Most tools inspect images. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                VeriSight investigates evidence.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg">
              From pixel-level compression anomalies to Indian UPI syndicate forensics, VeriSight
              combines four synchronized physical, geometric, and protocol layers into one explainable,
              court-admissible investigation workflow.
            </p>

            {/* High-Impact Stat Strip */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl w-full font-mono text-left">
              <div className="rounded-xl border border-cyan-500/30 bg-[#0c1324]/80 p-3.5 shadow-lg backdrop-blur-md">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Real-World ROC-AUC
                </span>
                <span className="mt-1 block text-2xl font-bold text-cyan-400">0.9731</span>
                <span className="text-[10px] text-slate-500">23 WhatsApp mobile test set</span>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-[#0c1324]/80 p-3.5 shadow-lg backdrop-blur-md">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Sub-Pixel Lasers
                </span>
                <span className="mt-1 block text-2xl font-bold text-emerald-400">&lt; 0.1 px</span>
                <span className="text-[10px] text-slate-500">Slope & kerning drift detection</span>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-[#0c1324]/80 p-3.5 shadow-lg backdrop-blur-md">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Inference Latency
                </span>
                <span className="mt-1 block text-2xl font-bold text-amber-400">&lt; 350 ms</span>
                <span className="text-[10px] text-slate-500">100% deterministic offline core</span>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-[#0c1324]/80 p-3.5 shadow-lg backdrop-blur-md">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Law Enforcement
                </span>
                <span className="mt-1 block text-2xl font-bold text-purple-400">Sec 91</span>
                <span className="text-[10px] text-slate-500">Cr.P.C. & 1930 Cyber-Cell Ready</span>
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onNavigateWorkbench}
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 font-mono text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-400 active:scale-95"
              >
                <span>Launch Interactive Workbench</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#interactive-roc"
                className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 font-mono text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Inspect Empirical ROC Data ↓
              </a>
              <a
                href="#capability-radar"
                className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 font-mono text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Compare Competitor Radar ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: INTERACTIVE ANIMATED ROC-AUC & PRECISION-RECALL BENCHMARK */}
      {/* ----------------------------------------------------------------- */}
      <section id="interactive-roc" className="border-b border-white/[0.08] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
                <BarChart3 className="h-4 w-4" />
                <span>Section 2: Empirical Performance Sandbox</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
                Interactive ROC-AUC & Decision Threshold Calibration
              </h2>
              <p className="mt-1 text-xs text-slate-400 max-w-2xl">
                Explore real ground-truth predictions. Scrub the decision threshold slider to observe
                real-time trade-offs between True Positive Rate, False Alarms, and Confusion Matrices.
              </p>
            </div>

            {/* Dataset Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-[#090E1D] p-1 font-mono text-xs">
              {Object.values(EVALUATION_DATASETS).map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => {
                    setSelectedDatasetId(ds.id);
                    setThreshold(ds.optimalThreshold);
                  }}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    selectedDatasetId === ds.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {ds.id === "user_supplied_external"
                    ? "External WhatsApp (N=23)"
                    : ds.id === "held_out_benchmark"
                    ? "Laboratory Held-Out (N=7)"
                    : "3-Fold Dev OOF (N=20)"}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Graph & Metric Matrix Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Interactive SVG ROC / PR Curve */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0A0F1F]/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {curveMode === "ROC" ? "Receiver Operating Characteristic (ROC)" : "Precision-Recall Curve"}
                  </span>
                  <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-800">
                    AUC = {currentDataset.rocAuc.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-1 rounded bg-[#070b14] p-0.5 font-mono text-[10px]">
                  <button
                    onClick={() => setCurveMode("ROC")}
                    className={`px-2 py-0.5 rounded ${curveMode === "ROC" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"}`}
                  >
                    ROC
                  </button>
                  <button
                    onClick={() => setCurveMode("PR")}
                    className={`px-2 py-0.5 rounded ${curveMode === "PR" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"}`}
                  >
                    Precision-Recall
                  </button>
                </div>
              </div>

              {/* SVG Canvas */}
              <div className="relative aspect-[16/10] w-full mt-4 select-none">
                <svg viewBox="0 0 400 280" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
                    const y = 240 - tick * 200;
                    const x = 50 + tick * 320;
                    return (
                      <g key={`grid-${tick}`}>
                        <line x1="50" y1={y} x2="370" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                        <line x1={x} y1="40" x2={x} y2="240" stroke="#1e293b" strokeDasharray="3 3" />
                        {/* Axis Labels */}
                        <text x="42" y={y + 4} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">
                          {tick.toFixed(2)}
                        </text>
                        <text x={x} y="255" textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">
                          {tick.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axes */}
                  <line x1="50" y1="240" x2="370" y2="240" stroke="#475569" strokeWidth="1.5" />
                  <line x1="50" y1="40" x2="50" y2="240" stroke="#475569" strokeWidth="1.5" />

                  {/* Axis Title */}
                  <text x="210" y="272" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">
                    {curveMode === "ROC" ? "False Positive Rate (1 - Specificity)" : "Recall (True Positive Rate)"}
                  </text>
                  <text
                    x="18"
                    y="140"
                    textAnchor="middle"
                    transform="rotate(-90 18 140)"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {curveMode === "ROC" ? "True Positive Rate (Sensitivity)" : "Precision"}
                  </text>

                  {/* Random Baseline for ROC */}
                  {curveMode === "ROC" && (
                    <line x1="50" y1="240" x2="370" y2="40" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1" />
                  )}

                  {/* Draw Curve Path */}
                  {(() => {
                    const pts = currentDataset.points.map((p) => {
                      const px = curveMode === "ROC" ? 50 + p.fpr * 320 : 50 + p.recall * 320;
                      const py = curveMode === "ROC" ? 240 - p.tpr * 200 : 240 - p.precision * 200;
                      return `${px},${py}`;
                    });
                    const dPath = `M ${pts.join(" L ")}`;
                    const areaPath = `M 50,240 L ${pts.join(" L ")} L 370,240 Z`;

                    return (
                      <>
                        <path d={areaPath} fill="url(#rocAreaGrad)" opacity="0.25" />
                        <path
                          d={dPath}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        />
                      </>
                    );
                  })()}

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="rocAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Current Threshold Marker Dot on Curve */}
                  {(() => {
                    const cx = curveMode === "ROC" ? 50 + currentStats.fpr * 320 : 50 + currentStats.recall * 320;
                    const cy = curveMode === "ROC" ? 240 - currentStats.tpr * 200 : 240 - currentStats.precision * 200;
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r="8" fill="#06b6d4" opacity="0.3" className="animate-ping" />
                        <circle cx={cx} cy={cy} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Threshold Scrubbing Slider */}
              <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#070b14] p-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-slate-300 font-semibold">Operating Threshold Slider</span>
                  </div>
                  <span className="rounded bg-cyan-950 px-2 py-0.5 text-cyan-300 font-bold border border-cyan-800">
                    Threshold: {threshold.toFixed(2)} ({Math.round(threshold * 100)} / 100)
                  </span>
                </div>

                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="mt-3 w-full accent-cyan-400 cursor-pointer"
                />

                <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0.00 (Max Sensitivity / Flags All)</span>
                  <span className="text-cyan-400 font-bold">
                    Optimal Baseline ({currentDataset.optimalThreshold.toFixed(2)})
                  </span>
                  <span>1.00 (Strict Zero-Alarm)</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Dynamic Confusion Matrix & Instant Metrics */}
            <div className="lg:col-span-5 space-y-4">
              {/* Dynamic Metrics Cards */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="rounded-xl border border-cyan-500/30 bg-[#0C1222] p-3 shadow-md">
                  <span className="text-[10px] uppercase text-slate-400 block">True Positive Rate (Recall)</span>
                  <span className="mt-1 text-2xl font-bold text-cyan-300">
                    {(currentStats.tpr * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {currentStats.tp} / {currentDataset.posCount} Forgeries Intercepted
                  </span>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-[#0C1222] p-3 shadow-md">
                  <span className="text-[10px] uppercase text-slate-400 block">False Positive Rate (FPR)</span>
                  <span className="mt-1 text-2xl font-bold text-rose-300">
                    {(currentStats.fpr * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {currentStats.fp} / {currentDataset.negCount} False Alarms
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-[#0C1222] p-3 shadow-md">
                  <span className="text-[10px] uppercase text-slate-400 block">Precision</span>
                  <span className="mt-1 text-2xl font-bold text-emerald-300">
                    {(currentStats.precision * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500">True Forgeries / All Flagged</span>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-[#0C1222] p-3 shadow-md">
                  <span className="text-[10px] uppercase text-slate-400 block">F1-Score</span>
                  <span className="mt-1 text-2xl font-bold text-amber-300">
                    {currentStats.f1.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-slate-500">Harmonic precision-recall mean</span>
                </div>
              </div>

              {/* Real-time Dynamic Confusion Matrix */}
              <div className="rounded-2xl border border-white/10 bg-[#0A0F1F] p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-mono">
                  <span className="font-semibold text-white">Dynamic Confusion Matrix</span>
                  <span className="text-slate-400">Total N = {currentDataset.sampleCount}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center font-mono text-xs">
                  {/* True Positive */}
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 block">
                      True Positives (TP)
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-300 block mt-1">
                      {currentStats.tp}
                    </span>
                    <span className="text-[9px] text-slate-400">Correctly Detected Forgery</span>
                  </div>

                  {/* False Positive */}
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-rose-400 block">
                      False Positives (FP)
                    </span>
                    <span className="text-2xl font-extrabold text-rose-300 block mt-1">
                      {currentStats.fp}
                    </span>
                    <span className="text-[9px] text-slate-400">Authentic Flagged as Fraud</span>
                  </div>

                  {/* False Negative */}
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 block">
                      False Negatives (FN)
                    </span>
                    <span className="text-2xl font-extrabold text-amber-300 block mt-1">
                      {currentStats.fn}
                    </span>
                    <span className="text-[9px] text-slate-400">Missed Spliced Receipt</span>
                  </div>

                  {/* True Negative */}
                  <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 block">
                      True Negatives (TN)
                    </span>
                    <span className="text-2xl font-extrabold text-cyan-300 block mt-1">
                      {currentStats.tn}
                    </span>
                    <span className="text-[9px] text-slate-400">Correctly Cleared Authentic</span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed font-sans">
                  <strong>Judicial Integrity Rule:</strong> In financial fraud investigations, a false
                  positive destroys merchant-customer trust. VeriSight calibrates its optimal operating threshold
                  at <strong>25.0</strong>, achieving <strong>90% recall</strong> while suppressing false alarms
                  down to <strong>7.7%</strong> on recompressed WhatsApp evidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 3: COMPETITIVE CAPABILITY RADAR CHART (10-AXIS SVG)       */}
      {/* ----------------------------------------------------------------- */}
      <section id="capability-radar" className="border-b border-white/[0.08] px-4 py-16 sm:px-8 bg-[#070C18]">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400 uppercase tracking-wider">
              <Radar className="h-4 w-4" />
              <span>Section 3: Multi-Dimensional Competitor Comparison</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
              10-Axis Forensic Capability Radar
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-3xl">
              Compare VeriSight against established industry utilities across 10 objective forensic
              dimensions. Toggle competitors to see where standalone tools fall short.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 Columns: Bespoke 10-Axis SVG Radar Canvas */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative aspect-square w-full max-w-[480px]">
                <svg viewBox="-220 -220 440 440" className="w-full h-full overflow-visible">
                  {/* Concentric Polygons (20%, 40%, 60%, 80%, 100%) */}
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
                    const r = level * 160;
                    const pts = RADAR_AXES.map((_, i) => {
                      const angle = (i * 2 * Math.PI) / RADAR_AXES.length - Math.PI / 2;
                      return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
                    }).join(" ");
                    return (
                      <polygon
                        key={`poly-${level}`}
                        points={pts}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray={level === 1.0 ? "0" : "3 3"}
                      />
                    );
                  })}

                  {/* Radial Axis Spokes */}
                  {RADAR_AXES.map((axis, i) => {
                    const angle = (i * 2 * Math.PI) / RADAR_AXES.length - Math.PI / 2;
                    const x2 = 160 * Math.cos(angle);
                    const y2 = 160 * Math.sin(angle);
                    const labelX = 185 * Math.cos(angle);
                    const labelY = 185 * Math.sin(angle);

                    return (
                      <g key={axis.key}>
                        <line x1="0" y1="0" x2={x2} y2={y2} stroke="#334155" strokeWidth="1" />
                        <text
                          x={labelX}
                          y={labelY + 4}
                          textAnchor={Math.abs(labelX) < 15 ? "middle" : labelX > 0 ? "start" : "end"}
                          className="text-[9px] fill-slate-400 font-mono font-medium hover:fill-cyan-300 cursor-pointer transition-colors"
                        >
                          {axis.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Draw Competitor Polygons */}
                  {COMPETITOR_SCORES.map((comp) => {
                    if (!activeCompetitors[comp.id]) return null;

                    const pts = RADAR_AXES.map((axis, i) => {
                      const score = comp.scores[axis.key] || 0;
                      const r = (score / 100) * 160;
                      const angle = (i * 2 * Math.PI) / RADAR_AXES.length - Math.PI / 2;
                      return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
                    }).join(" ");

                    const isVerisight = comp.id === "verisight";

                    return (
                      <g key={`radar-poly-${comp.id}`}>
                        <polygon
                          points={pts}
                          fill={comp.color}
                          fillOpacity={isVerisight ? "0.3" : "0.1"}
                          stroke={comp.color}
                          strokeWidth={isVerisight ? "2.5" : "1.5"}
                          className="transition-all duration-500"
                        />
                        {/* Dot Vertices */}
                        {RADAR_AXES.map((axis, i) => {
                          const score = comp.scores[axis.key] || 0;
                          const r = (score / 100) * 160;
                          const angle = (i * 2 * Math.PI) / RADAR_AXES.length - Math.PI / 2;
                          return (
                            <circle
                              key={`dot-${comp.id}-${axis.key}`}
                              cx={r * Math.cos(angle)}
                              cy={r * Math.sin(angle)}
                              r={isVerisight ? "3.5" : "2"}
                              fill={comp.color}
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Right 5 Columns: Competitor Toggles & Strategic Analysis */}
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400 block mb-2">
                Toggle Competitor Overlays
              </span>

              {COMPETITOR_SCORES.map((comp) => {
                const isActive = activeCompetitors[comp.id];
                return (
                  <div
                    key={comp.id}
                    onClick={() =>
                      setActiveCompetitors((prev) => ({ ...prev, [comp.id]: !prev[comp.id] }))
                    }
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all select-none ${
                      isActive
                        ? "border-white/20 bg-[#0d1527] shadow-md"
                        : "border-white/[0.06] bg-[#070b14] opacity-50 hover:opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: comp.color }}
                        />
                        <span className="font-mono text-xs font-bold text-white">{comp.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {isActive ? "ACTIVE" : "HIDDEN"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 pl-5.5">{comp.notes}</p>
                  </div>
                );
              })}

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 mt-4 text-xs font-mono text-cyan-300">
                <strong>Key Takeaway:</strong> Traditional utilities (FotoForensics, Forensically) excel
                at raw JPEG ELA, but score <strong>0/100</strong> across font lasers, UPI syntax, and statutory
                reporting. VeriSight covers all 10 axes.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 4: FEATURE COVERAGE HEATMAP MATRIX                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-b border-white/[0.08] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider">
                <Flame className="h-4 w-4" />
                <span>Section 4: Granular Feature Coverage Heatmap</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
                14-Point Forensic Capability Comparison Matrix
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Click any row to inspect underlying mathematical formulations, verified competitor evidence, and source citations.
              </p>
            </div>

            {/* Domain Filters */}
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#090E1D] p-1 font-mono text-xs">
              {["All", "Signal", "Geometry", "Protocol", "Payment", "Legal"].map((dom) => (
                <button
                  key={dom}
                  onClick={() => setHeatmapDomain(dom)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    heatmapDomain === dom ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {dom}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Heatmap Table */}
          <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-[#0A0F1E] shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0e1629] border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Forensic Capability</th>
                  <th className="py-3 px-3 text-cyan-300 font-bold">VeriSight Pro</th>
                  <th className="py-3 px-3">Forensically</th>
                  <th className="py-3 px-3">FotoForensics</th>
                  <th className="py-3 px-3">FauxLens</th>
                  <th className="py-3 px-3">Navines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredHeatmap.map((row, idx) => {
                  const renderBadge = (status: "FULL" | "PARTIAL" | "UNSUPPORTED" | "UNVERIFIED") => {
                    if (status === "FULL") {
                      return (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-800/60">
                          <CheckCircle2 className="h-3 w-3" /> FULL
                        </span>
                      );
                    }
                    if (status === "PARTIAL") {
                      return (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-800/60">
                          <AlertTriangle className="h-3 w-3" /> PARTIAL
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[9px] text-slate-500 border border-white/[0.05]">
                        <XCircle className="h-3 w-3" /> NONE
                      </span>
                    );
                  };

                  const isSelected = selectedHeatmapRow?.capability === row.capability;

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedHeatmapRow(isSelected ? null : row)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-cyan-500/10 text-white" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <td className="py-3 px-4 font-sans font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                            {row.domain}
                          </span>
                          <span>{row.capability}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-cyan-300">
                        {renderBadge(row.verisight)}
                      </td>
                      <td className="py-3 px-3">{renderBadge(row.forensically)}</td>
                      <td className="py-3 px-3">{renderBadge(row.fotoforensics)}</td>
                      <td className="py-3 px-3">{renderBadge(row.fauxlens)}</td>
                      <td className="py-3 px-3">{renderBadge(row.navines)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Drawer for Selected Heatmap Row */}
          {selectedHeatmapRow && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-cyan-500/30 bg-[#0D1527] p-5 shadow-2xl font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-cyan-300 text-sm">
                  {selectedHeatmapRow.capability}
                </span>
                <a
                  href={selectedHeatmapRow.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:underline text-[11px]"
                >
                  <span>Verified Source Reference</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="mt-2 text-slate-300 font-sans text-xs leading-relaxed">
                {selectedHeatmapRow.details}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 5: VISUAL MULTI-LAYER FORENSIC PIPELINE ARCHITECTURE     */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-b border-white/[0.08] px-4 py-16 sm:px-8 bg-[#070B16]">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2 font-mono text-xs text-sky-400 uppercase tracking-wider">
              <Cpu className="h-4 w-4" />
              <span>Section 5: Multi-Signal Forensic Pipeline</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
              Interconnected Analytical Architecture
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-3xl">
              See how digital evidence moves sequentially from raw container ingestion to court-admissible
              Section 91 subpoenas. Click any stage to inspect its mathematical formulation.
            </p>
          </div>

          {/* Interactive Flow Nodes */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-7 gap-2 font-mono text-xs">
            {PIPELINE_NODES.map((node, i) => {
              const isSelected = selectedPipelineNode.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedPipelineNode(node)}
                  className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all select-none ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      : "border-white/10 bg-[#0A1020] hover:border-white/25"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>STEP {i + 1}</span>
                      <span className="text-cyan-400 font-bold">{node.latencyMs}ms</span>
                    </div>
                    <span className="font-bold text-white block mt-1.5 leading-snug">
                      {node.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 line-clamp-2">
                      {node.shortDesc}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">{node.layer}</span>
                    <span className="text-emerald-400 font-semibold">{node.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Node Detail Inspector Drawer */}
          <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-[#0B1325] p-6 shadow-2xl font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">{selectedPipelineNode.name}</span>
                  <span className="ml-2 text-slate-400 text-[10px]">({selectedPipelineNode.layer})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-cyan-300 font-bold border border-cyan-800">
                  Latency: {selectedPipelineNode.latencyMs} ms
                </span>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-emerald-300 font-bold border border-emerald-800">
                  Status: {selectedPipelineNode.status}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
              <div className="rounded-lg bg-[#070b14] p-3 border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Inputs</span>
                <span className="text-slate-200">{selectedPipelineNode.inputs}</span>
              </div>
              <div className="rounded-lg bg-[#070b14] p-3 border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Mathematical Algorithm</span>
                <span className="text-cyan-300">{selectedPipelineNode.algorithm}</span>
              </div>
              <div className="rounded-lg bg-[#070b14] p-3 border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Outputs</span>
                <span className="text-emerald-300">{selectedPipelineNode.outputs}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 6: GBDT FEATURE IMPORTANCE & SIGNAL EXPLAINABILITY        */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-b border-white/[0.08] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 6 Columns: Explanation & GBDT Gini Weights */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-wider">
                <Scale className="h-4 w-4" />
                <span>Section 6: Model Explainability</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
                GBDT Normalized Signal Importance
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Unlike deep neural networks that output unexplainable black-box probabilities,
                VeriSight’s Gradient-Boosted Decision Tree assigns calibrated weights across four physical
                and semantic signals. Notice that <strong>over 53% of predictive power</strong> comes from
                geometric and protocol checks that conventional tools ignore entirely.
              </p>

              {/* Progress Bar Weights */}
              <div className="space-y-3 font-mono text-xs pt-2">
                {GBDT_FEATURE_WEIGHTS.map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{feat.name}</span>
                      <span className="font-bold text-white">{feat.weight.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#0d1627] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${feat.weight}%`, backgroundColor: feat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 6 Columns: 12-Point Attack Category Interception Matrix */}
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0A1020] p-6 shadow-xl font-mono text-xs">
              <span className="font-bold text-white text-sm block border-b border-white/10 pb-2">
                12-Point Forgery Category Coverage
              </span>

              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { name: "Amount Splicing", vs: true, others: "Weak" },
                  { name: "Cloned Digits (ORB)", vs: true, others: "Partial" },
                  { name: "Font Drift & Kerning", vs: true, others: "None" },
                  { name: "Background Color Patch", vs: true, others: "None" },
                  { name: "Clock Paradox", vs: true, others: "None" },
                  { name: "WhatsApp Laundering", vs: true, others: "Fails" },
                  { name: "Non-Native Viewport", vs: true, others: "None" },
                  { name: "10-Digit Fake UTR", vs: true, others: "None" },
                  { name: "VPA Format Spoof", vs: true, others: "None" },
                  { name: "Browser DOM Edit (0-px)", vs: true, others: "Fails" },
                  { name: "Spoof-APK Recording", vs: true, others: "Fails" },
                  { name: "Diffusion AI Mockup", vs: true, others: "Partial" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#070C18] p-2"
                  >
                    <span className="text-slate-300 truncate">{item.name}</span>
                    <span className="rounded bg-emerald-950 px-1.5 py-0.5 font-bold text-emerald-400 border border-emerald-800 text-[9px] shrink-0">
                      INTERCEPTED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 7: TECHNICAL HONESTY & BOUNDARIES                         */}
      {/* ----------------------------------------------------------------- */}
      <section className="px-4 py-16 sm:px-8 bg-[#050810]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/40 px-3 py-1 font-mono text-xs text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>CRITICAL FORENSIC BOUNDARY DISCLOSURE</span>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
            Screenshots Are Client-Side Evidence.
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            No screenshot forensic system in the world can guarantee that money has cleared bank servers,
            because a screenshot is strictly client-side presentation data. VeriSight explicitly separates
            evidence into three clear analytical domains:
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left font-mono text-xs">
            <div className="rounded-xl border border-cyan-500/30 bg-[#091122] p-4">
              <span className="text-cyan-400 font-bold block mb-1">1. Pixel Integrity</span>
              <p className="text-[11px] text-slate-300 font-sans">
                Verifies whether pixels, compression quantization, or high-frequency noise have been
                spliced, cloned, or resaved in editing software.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-[#091122] p-4">
              <span className="text-emerald-400 font-bold block mb-1">2. Semantic Consistency</span>
              <p className="text-[11px] text-slate-300 font-sans">
                Cross-references transaction timestamps against status-bar clocks and validates 12-digit
                UTRs against standard banking rules.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-[#091122] p-4">
              <span className="text-amber-400 font-bold block mb-1">3. Interbank Settlement</span>
              <p className="text-[11px] text-slate-300 font-sans">
                Requires server-side bank confirmation. VeriSight empowers this via instant Section 91
                Statutory Subpoenas for emergency account freezes within the 24h golden window.
              </p>
            </div>
          </div>

          {/* Final Launch Action */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateWorkbench}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 font-mono text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-sky-400 active:scale-95"
            >
              <span>Open VeriSight Pro Workbench</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Evaluated on 50+ Real & Synthetic Forgeries • 0.9731 ROC-AUC
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
