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
  embedMode?: boolean;
  id?: string;
}

// ---------------------------------------------------------------------------
// 1. ILLUSTRATIVE DEMO CURVES. These are not measured model results.
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
    name: "Archive-described WhatsApp sample set (N=23; unverified)",
    description:
      "The uploaded archive describes 23 mobile screenshots from PhonePe, Google Pay, and Paytm transferred over WhatsApp. This corpus and its labels are not independently verified in the current deployment.",
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
    name: "Archive-reported laboratory split (N=7; unverified)",
    description:
      "The uploaded archive describes seven native mobile captures and reports a held-out result. The accompanying evaluation document also describes a separate 27-image synthetic dataset; the source records have not been reconciled here.",
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
    name: "Archive: Development 3-Fold Stratified Cross-Validation (OOF)",
    description:
      "The uploaded archive reports 20 development samples and three-fold out-of-fold evaluation. This result has not been reproduced by the current deployment.",
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
// 2. SCHEMATIC RADAR CHART DIMENSIONS. Scores are visual placeholders only.
// ---------------------------------------------------------------------------
interface RadarAxis {
  key: string;
  label: string;
  description: string;
}

const RADAR_AXES: RadarAxis[] = [
  { key: "ela", label: "Compression cues", description: "Concept: inspect image recompression patterns" },
  { key: "wavelet", label: "Wavelet cues", description: "Concept: compare high-frequency image regions" },
  { key: "clones", label: "Repeated patterns", description: "Concept: identify visually similar regions" },
  { key: "lasers", label: "Text layout", description: "Concept: inspect text-like region alignment" },
  { key: "colorPatch", label: "Color regions", description: "Concept: compare color consistency around regions" },
  { key: "clockParadox", label: "Metadata cues", description: "Concept: inspect available file metadata" },
  { key: "whatsappLaunder", label: "Recompression", description: "Concept: account for image resizing and recompression" },
  { key: "upiDomain", label: "QR/payment fields", description: "Concept: parse untrusted readable QR content" },
  { key: "mlFusion", label: "Heuristic review", description: "Prototype: combine selected image-review signals" },
  { key: "legalNotice", label: "Response drafts", description: "Prototype: prepare editable incident-response drafts" },
];

interface SchematicOverlay {
  id: string;
  name: string;
  color: string;
  scores: Record<string, number>;
  notes: string;
}

const SCHEMATIC_OVERLAYS: SchematicOverlay[] = [
  {
    id: "outline_a",
    name: "Illustrative outline A",
    color: "#06b6d4",
    scores: { ela: 95, wavelet: 92, clones: 94, lasers: 98, colorPatch: 90, clockParadox: 96, whatsappLaunder: 92, upiDomain: 100, mlFusion: 94, legalNotice: 100 },
    notes: "Generated placeholder shape only; it is not a measurement of VeriSight or another product.",
  },
  {
    id: "outline_b",
    name: "Illustrative outline B",
    color: "#38bdf8",
    scores: { ela: 90, wavelet: 60, clones: 88, lasers: 0, colorPatch: 0, clockParadox: 0, whatsappLaunder: 15, upiDomain: 0, mlFusion: 0, legalNotice: 0 },
    notes: "Generated placeholder shape only; it is not a measurement of VeriSight or another product.",
  },
  {
    id: "outline_c",
    name: "Illustrative outline C",
    color: "#f59e0b",
    scores: { ela: 92, wavelet: 0, clones: 0, lasers: 0, colorPatch: 0, clockParadox: 0, whatsappLaunder: 10, upiDomain: 0, mlFusion: 0, legalNotice: 0 },
    notes: "Generated placeholder shape only; it is not a measurement of VeriSight or another product.",
  },
  {
    id: "outline_d",
    name: "Illustrative outline D",
    color: "#c084fc",
    scores: { ela: 40, wavelet: 0, clones: 0, lasers: 15, colorPatch: 0, clockParadox: 0, whatsappLaunder: 25, upiDomain: 0, mlFusion: 70, legalNotice: 0 },
    notes: "Generated placeholder shape only; it is not a measurement of VeriSight or another product.",
  },
  {
    id: "outline_e",
    name: "Illustrative outline E",
    color: "#f43f5e",
    scores: { ela: 0, wavelet: 0, clones: 0, lasers: 0, colorPatch: 0, clockParadox: 10, whatsappLaunder: 10, upiDomain: 45, mlFusion: 0, legalNotice: 0 },
    notes: "Generated placeholder shape only; it is not a measurement of VeriSight or another product.",
  },
];

// This matrix describes the current deployment only. It does not compare vendors.
interface HeatmapRow {
  capability: string;
  domain: "Signal" | "Geometry" | "Protocol" | "Payment" | "Legal";
  status: "AVAILABLE" | "LIMITED" | "NOT_CONFIGURED";
  details: string;
}

function renderCapabilityStatus(status: HeatmapRow["status"]) {
  const label = status === "AVAILABLE" ? "AVAILABLE" : status === "LIMITED" ? "LIMITED" : "NOT CONFIGURED";
  const style = status === "AVAILABLE"
    ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
    : status === "LIMITED"
      ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
      : "bg-slate-900 text-slate-300 border-white/[0.08]";
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-bold ${style}`}>{label}</span>;
}

const HEATMAP_DATA: HeatmapRow[] = [
  { capability: "SHA-256 file fingerprint", domain: "Signal", status: "AVAILABLE", details: "Computes a hash of the uploaded image bytes for report identification. A hash does not establish authenticity." },
  { capability: "JPEG error-level review map", domain: "Signal", status: "LIMITED", details: "Shows a recompression difference for supported inputs. These patterns are affected by image history and are not proof of editing." },
  { capability: "Wavelet/noise review cues", domain: "Signal", status: "LIMITED", details: "Computes generic high-frequency variation and candidate regions; it is not specific to tampering or AI origin." },
  { capability: "Repeated-feature candidates", domain: "Signal", status: "LIMITED", details: "ORB matching can surface similar regions. Repeated app icons or interface elements can also match." },
  { capability: "Text-like geometry", domain: "Geometry", status: "LIMITED", details: "Finds text-like components and layout cues. The deployed scan does not read visible words, amounts, names, or references with OCR." },
  { capability: "Candidate region overlays", domain: "Geometry", status: "LIMITED", details: "Displays regions produced by configured heuristics. Boxes identify review candidates, not confirmed edited pixels or pixel-mask ground truth." },
  { capability: "Image metadata inspection", domain: "Protocol", status: "AVAILABLE", details: "Reports metadata that remains in the uploaded file. Metadata can be changed or stripped and is not independently verified." },
  { capability: "QR payload decoding", domain: "Payment", status: "LIMITED", details: "Displays text when a QR code can be decoded. It does not verify the recipient, destination, payment request, or settlement." },
  { capability: "C2PA marker inspection", domain: "Protocol", status: "LIMITED", details: "Reports possible credential markers. The current deployment does not validate a manifest signature or bind it to the image." },
  { capability: "AI generator metadata strings", domain: "Protocol", status: "LIMITED", details: "Checks selected readable metadata strings only. Metadata may be edited or removed; no AI-origin conclusion is produced." },
  { capability: "Visible AI logo / watermark detection", domain: "Protocol", status: "NOT_CONFIGURED", details: "No dedicated visual logo, watermark, or SynthID detector is deployed." },
  { capability: "OCR of payment fields", domain: "Payment", status: "NOT_CONFIGURED", details: "The deployed analyzer does not read visible amounts, payees, dates, or transaction references from screenshot pixels." },
  { capability: "Trained authenticity classifier", domain: "Signal", status: "NOT_CONFIGURED", details: "No trained or calibrated authenticity classifier is deployed. No accuracy, calibration, or confidence claim is available." },
  { capability: "Bank / PSP settlement verification", domain: "Payment", status: "NOT_CONFIGURED", details: "No authorized bank or payment-service transaction-status integration is configured. A screenshot cannot verify settlement." },
  { capability: "Editable incident-report drafts", domain: "Legal", status: "AVAILABLE", details: "Prepares user-editable summaries and drafts. VeriSight does not submit reports, issue legal notices, or certify admissibility." },
];

// ---------------------------------------------------------------------------
// 4. ILLUSTRATIVE SIGNAL MIX. Bar widths are visual placeholders, not learned weights.
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
  latencyMs: string;
  status: "PROTOTYPE";
}

const PIPELINE_NODES: PipelineNode[] = [
  {
    id: "ingestion",
    name: "Evidence Ingestion & Hashing",
    layer: "Core",
    shortDesc: "Cryptographic SHA-256 seal & container normalization",
    inputs: "PNG / JPG / WebP / BMP byte stream (<20MB)",
    outputs: "Decoded image and SHA-256 fingerprint for the review report",
    algorithm: "Image decoding and SHA-256 hashing",
    latencyMs: "Not measured",
    status: "PROTOTYPE",
  },
  {
    id: "metadata",
    name: "Protocol & Metadata Verification",
    layer: "Layer 3",
    shortDesc: "Reads available metadata and reports QR/provenance cues",
    inputs: "Image bytes and available metadata",
    outputs: "Metadata, QR text, and unverified provenance markers where detected",
    algorithm: "Metadata parsing, QR decoding, and marker inspection; no bank lookup",
    latencyMs: "Not measured",
    status: "PROTOTYPE",
  },
  {
    id: "ela",
    name: "Compression ELA & Resaving",
    layer: "Layer 1",
    shortDesc: "Quantization error matrix via Q=95 resaving differential",
    inputs: "Full BGR image",
    outputs: "Inferno heatmap image + block variance score",
    algorithm: "Normalized absolute matrix differential: |I - I_Q95| * scale",
    latencyMs: "Not measured",
    status: "PROTOTYPE",
  },
  {
    id: "wavelet",
    name: "Daubechies Wavelet Noise Consistency",
    layer: "Layer 1",
    shortDesc: "High-frequency sub-band noise energy variance across 16x16 blocks",
    inputs: "Luminance channel Y (YCrCb)",
    outputs: "Wavelet noise mask + regional variance score",
    algorithm: "2D Discrete Wavelet Transform (db4 filter bank)",
    latencyMs: "Not measured",
    status: "PROTOTYPE",
  },
  {
    id: "typography",
    name: "Sub-Pixel Typography Lasers",
    layer: "Layer 2",
    shortDesc: "Examines text-like regions and line-baseline consistency",
    inputs: "Text-like component regions detected in the image",
    outputs: "Heuristic geometry cues and candidate regions for human review",
    algorithm: "Image morphology and baseline geometry heuristics; OCR may be unavailable",
    latencyMs: "Not measured",
    status: "PROTOTYPE",
  },
  {
    id: "syndicate",
    name: "QR & Payment Entity Inspection",
    layer: "Layer 3",
    shortDesc: "Decodes readable QR text and parses possible payment fields",
    inputs: "Decoded QR payloads and image review cues",
    outputs: "Parsed fields that remain unverified; no syndicate or account lookup",
    algorithm: "QR decoding and bounded field parsing; no provider or bank verification",
    latencyMs: "Not measured",
    status: "PROTOTYPE",
  },
  {
    id: "ensemble",
    name: "Heuristic Evidence Fusion",
    layer: "Ensemble",
    shortDesc: "Combines selected image cues into review points and candidate regions",
    inputs: "Available image-review signals and candidate regions",
    outputs: "Heuristic review points and regions; not a probability or legal finding",
    algorithm: "Deterministic rules and signal aggregation; no trained or calibrated classifier",
    latencyMs: "Not measured",
    status: "PROTOTYPE",
  },
];

export const WhyVerisight: React.FC<WhyVerisightProps> = ({
  onNavigateWorkbench,
  embedMode = false,
  id = "why-verisight",
}) => {
  // 1. ROC / PR Sandbox State
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("user_supplied_external");
  const [threshold, setThreshold] = useState<number>(0.25);
  const [curveMode, setCurveMode] = useState<"ROC" | "PR">("ROC");

  // 2. Radar Chart State
  const [activeCompetitors, setActiveCompetitors] = useState<Record<string, boolean>>({
    outline_a: true,
    outline_b: true,
    outline_c: true,
    outline_d: false,
    outline_e: false,
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

    // Illustrative counts derived from synthetic demo curves only.
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
    <div
      id={id}
      className={`${
        embedMode ? "" : "flex-1 overflow-y-auto"
      } bg-[#060a12] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200`}
    >
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
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/60 px-3.5 py-1 text-xs font-mono text-amber-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>HACKSTELLAR 2026 // PROBLEM STATEMENT 12</span>
              <span className="text-slate-500">•</span>
              <span className="font-semibold">ARCHIVE FIGURES • NOT REPRODUCED BY LIVE API</span>
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
              From pixel-level review cues to QR and payment-field inspection, VeriSight
              combines available heuristic image-review cues with QR, metadata, and response-drafting tools.
              Its results are not a trained authenticity prediction, legal finding, or proof of payment settlement.
            </p>

            {/* High-Impact Stat Strip */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl w-full font-mono text-left">
              <div className="rounded-xl border border-cyan-500/30 bg-[#0c1324]/80 p-3.5 shadow-lg backdrop-blur-md">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Archive ROC-AUC
                </span>
                <span className="mt-1 block text-2xl font-bold text-cyan-400">0.9731</span>
                <span className="text-[10px] text-slate-500">23 WhatsApp samples claimed</span>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-[#0c1324]/80 p-3.5 shadow-lg backdrop-blur-md">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Sub-Pixel Lasers
                </span>
                <span className="mt-1 block text-2xl font-bold text-emerald-400">&lt; 0.1 px</span>
                <span className="text-[10px] text-slate-500">Archive claim; not measured here</span>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-[#0c1324]/80 p-3.5 shadow-lg backdrop-blur-md">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Archive latency
                </span>
                <span className="mt-1 block text-2xl font-bold text-amber-400">&lt; 350 ms</span>
                <span className="text-[10px] text-slate-500">Archive claim; not measured here</span>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-[#0c1324]/80 p-3.5 shadow-lg backdrop-blur-md">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Law enforcement
                </span>
                <span className="mt-1 block text-2xl font-bold text-purple-400">Sec 91</span>
                <span className="text-[10px] text-slate-500">Archive reference; no legal process issued</span>
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
                Inspect Archive ROC Data ↓
              </a>
              <a
                href="#capability-radar"
                className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 font-mono text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Explore Capability Map ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: INTERACTIVE ILLUSTRATIVE CURVE SANDBOX */}
      {/* ----------------------------------------------------------------- */}
      <section id="interactive-roc" className="border-b border-white/[0.08] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
                <BarChart3 className="h-4 w-4" />
                <span>Section 2: Archive-Reported Evaluation Sandbox</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
                Interactive ROC-AUC & Decision Threshold Sandbox
              </h2>
              <p className="mt-1 text-xs text-slate-400 max-w-2xl">
                These plotted figures are copied from the uploaded archive and are not reproduced by the live API, which reports heuristic-only. The archive also includes a separate 27-image synthetic evaluation report. Move the threshold to explore the archived curves; this is not a live model evaluation.
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
                    AUC = {(curveMode === "ROC" ? currentDataset.rocAuc : currentDataset.prAuc).toFixed(4)}
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
                    Archive Threshold ({currentDataset.optimalThreshold.toFixed(2)})
                  </span>
                  <span>1.00 (Strict Zero-Alarm)</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Synthetic Demo Matrix and Metrics */}
            <div className="lg:col-span-5 space-y-4">
              {/* Dynamic Metrics Cards */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="rounded-xl border border-cyan-500/30 bg-[#0C1222] p-3 shadow-md">
                  <span className="text-[10px] uppercase text-slate-400 block">True Positive Rate (Recall)</span>
                  <span className="mt-1 text-2xl font-bold text-cyan-300">
                    {(currentStats.tpr * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {currentStats.tp} / {currentDataset.posCount} positive demo points
                  </span>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-[#0C1222] p-3 shadow-md">
                  <span className="text-[10px] uppercase text-slate-400 block">False Positive Rate (FPR)</span>
                  <span className="mt-1 text-2xl font-bold text-rose-300">
                    {(currentStats.fpr * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {currentStats.fp} / {currentDataset.negCount} negative demo points
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
                    <span className="text-[9px] text-slate-400">Illustrative false-positive count</span>
                  </div>

                  {/* False Negative */}
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 block">
                      False Negatives (FN)
                    </span>
                    <span className="text-2xl font-extrabold text-amber-300 block mt-1">
                      {currentStats.fn}
                    </span>
                    <span className="text-[9px] text-slate-400">Illustrative false-negative count</span>
                  </div>

                  {/* True Negative */}
                  <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 block">
                      True Negatives (TN)
                    </span>
                    <span className="text-2xl font-extrabold text-cyan-300 block mt-1">
                      {currentStats.tn}
                    </span>
                    <span className="text-[9px] text-slate-400">Illustrative true-negative count</span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed font-sans">
                  <strong>Archive data only:</strong> These confusion-matrix counts and rates come from the uploaded archive, not live model predictions. The live model endpoint
                  reports heuristic-only and not evaluated; do not use these archived results to estimate current real-world error rates.
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
              <span>Section 3: Schematic Capability Map</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
              10-Axis Capability Map (Illustrative)
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-3xl">
              This animated comparison is a visual mockup only. Scores are placeholder values and do not represent measured
              capabilities of VeriSight or other products; no comparative evaluation has been performed.
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

                  {/* Draw arbitrary schematic outlines; not product profiles. */}
                  {SCHEMATIC_OVERLAYS.map((comp) => {
                    if (!activeCompetitors[comp.id]) return null;

                    const pts = RADAR_AXES.map((axis, i) => {
                      const score = comp.scores[axis.key] || 0;
                      const r = (score / 100) * 160;
                      const angle = (i * 2 * Math.PI) / RADAR_AXES.length - Math.PI / 2;
                      return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
                    }).join(" ");

                    const isPrimaryOutline = comp.id === "outline_a";

                    return (
                      <g key={`radar-poly-${comp.id}`}>
                        <polygon
                          points={pts}
                          fill={comp.color}
                          fillOpacity={isPrimaryOutline ? "0.3" : "0.1"}
                          stroke={comp.color}
                          strokeWidth={isPrimaryOutline ? "2.5" : "1.5"}
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
                              r={isPrimaryOutline ? "3.5" : "2"}
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

            {/* Schematic overlay controls */}
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400 block mb-2">
                Toggle schematic placeholder outlines
              </span>

              {SCHEMATIC_OVERLAYS.map((comp) => {
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
                <strong>Reading this diagram:</strong> The plotted shapes are arbitrary placeholders for demonstrating the interactive control. They do not represent any product or tested capability.
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
                <span>Section 4: Current Deployment Capability Matrix</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
                What This Deployment Can and Cannot Do
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Click a row for a plain-language description of the active implementation and its limits. This matrix describes the deployed prototype, not comparative performance.
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
                  <th className="py-3 px-4">Capability</th>
                  <th className="py-3 px-3 text-cyan-300 font-bold">Status in this deployment</th>
                  <th className="py-3 px-4">What the status means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredHeatmap.map((row, idx) => {
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
                        {renderCapabilityStatus(row.status)}
                      </td>
                      <td className="max-w-2xl py-3 px-4 font-sans text-[11px] leading-relaxed text-slate-400">{row.details}</td>
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
                <span className="font-bold text-cyan-300 text-sm">{selectedHeatmapRow.capability}</span>
                {renderCapabilityStatus(selectedHeatmapRow.status)}
              </div>
              <p className="mt-2 text-slate-300 font-sans text-xs leading-relaxed">{selectedHeatmapRow.details}</p>
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
                <span>Section 5: Prototype Review Pipeline</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
              Interconnected Analytical Architecture
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-3xl">
              Explore the prototype’s image-review stages. Click a stage for the implemented method summary and its limits.
              Runtime latency is not benchmarked, and this workflow does not issue legal notices.
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
                      <span className="text-cyan-400 font-bold">{node.latencyMs}</span>
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
                  Latency: {selectedPipelineNode.latencyMs}
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
            {/* Left 6 Columns: Explanatory signal categories */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-wider">
                <Scale className="h-4 w-4" />
                <span>Section 6: Model Explainability</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-mono">
                Illustrative Signal Mix
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The bars below are visual placeholders showing categories of signals that may be reviewed.
                They are not learned feature-importance weights: VeriSight has no trained or calibrated authenticity classifier.
              </p>

              {/* Progress Bar Weights */}
              <div className="space-y-3 font-mono text-xs pt-2">
                {GBDT_FEATURE_WEIGHTS.map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{feat.name}</span>
                      <span className="font-bold text-white">Illustrative</span>
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
                Example Edit Scenarios to Evaluate
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
                      NOT VALIDATED
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
                Reports image cues that may be consistent with recompression, repeated patterns, or region differences.
                These heuristics cannot confirm an image is authentic or identify every edit.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-[#091122] p-4">
              <span className="text-emerald-400 font-bold block mb-1">2. Semantic Consistency</span>
              <p className="text-[11px] text-slate-300 font-sans">
                May parse readable QR text and inspect available metadata. Parsed values are untrusted and are not checked
                against an issuing bank or payment provider.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-[#091122] p-4">
              <span className="text-amber-400 font-bold block mb-1">3. Interbank Settlement</span>
              <p className="text-[11px] text-slate-300 font-sans">
                Requires an authorized bank or payment-provider status integration. No settlement check is integrated here;
                complaint and evidence exports are drafts and do not freeze accounts or issue legal notices.
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
              Prototype demonstration • accuracy and latency not measured
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
