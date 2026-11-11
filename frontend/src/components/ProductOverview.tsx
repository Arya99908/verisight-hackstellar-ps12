import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  FileCheck2,
  Cpu,
  Fingerprint,
  Scale,
  Lock,
  Eye,
  AlertTriangle,
  Activity,
  Sliders,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Terminal,
  Compass,
} from "lucide-react";
import { AppRoute } from "./NavigationHeader";
import { DemoSampleMeta } from "../types/forensic";

interface ProductOverviewProps {
  onNavigate: (route: AppRoute, query?: Record<string, string>) => void;
  demoSamples?: DemoSampleMeta[];
}

export const ProductOverview: React.FC<ProductOverviewProps> = ({
  onNavigate,
  demoSamples = [],
}) => {
  // Interactive Hero Preview state
  const [activePreviewLayer, setActivePreviewLayer] = useState<
    "ORIGINAL" | "ELA" | "WAVELET" | "LASER"
  >("ELA");

  // Fallback demo samples if not passed from parent
  const samples =
    demoSamples.length > 0
      ? demoSamples
      : [
          {
            id: "sample_1",
            title: "Clean Synthetic UI Baseline",
            scenario: "Synthetic demo fixture with few configured review cues; not a genuine payment receipt.",
            expected_verdict: "INCONCLUSIVE",
            target_score_range: "Variable heuristic points",
            tags: ["Synthetic", "Baseline", "Not payment verified"],
          },
          {
            id: "sample_2",
            title: "Pixel-Spliced Amount (₹95,250.00)",
            scenario: "Amount altered with off-color patch (ΔE=5.2), +3.5px baseline laser drop, and zero-noise wavelet void.",
            expected_verdict: "REVIEW_REQUIRED",
            target_score_range: "Variable heuristic points",
            tags: ["Synthetic edit", "Review cue", "Baseline geometry"],
          },
          {
            id: "sample_3",
            title: "Synthetic Metadata Conflict Fixture",
            scenario: "Synthetic PNG with configured metadata cues; visible text and payment details are not issuer-verified.",
            expected_verdict: "REVIEW_REQUIRED",
            target_score_range: "Variable heuristic points",
            tags: ["Synthetic", "Metadata cues", "Not OCR-verified"],
          },
          {
            id: "sample_4",
            title: "Synthetic JPEG Re-encode",
            scenario: "Synthetic re-encoded image; compression profile alone cannot identify its source or prove editing.",
            expected_verdict: "REVIEW_REQUIRED",
            target_score_range: "Variable heuristic points",
            tags: ["Synthetic", "JPEG re-encode", "Source unknown"],
          },
          {
            id: "sample_5",
            title: "Copy-Move Cloned Digits",
            scenario: "Digit sequence cloned to inflate balance; non-native cropped viewport (680x1120).",
            expected_verdict: "REVIEW_REQUIRED",
            target_score_range: "Variable heuristic points",
            tags: ["Synthetic", "Repeated regions", "Candidate matches"],
          },
        ];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full overflow-y-auto bg-[#060911] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent blur-[140px]" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* =========================================================================
            SECTION A: HERO NARRATIVE & DUAL CTA
        ========================================================================= */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 pt-4 pb-16">
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-3.5 py-1 text-xs font-mono font-medium text-sky-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
              </span>
              <span>PAYMENT SCREENSHOT IMAGE REVIEW</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Heuristic prototype</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl text-white leading-tight">
              Investigate the integrity of{" "}
              <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                payment screenshots.
              </span>
            </h1>

            {/* Supporting paragraph */}
            <p className="text-base text-slate-300 sm:text-lg leading-relaxed max-w-2xl font-sans">
              VeriSight analyzes image-level review cues such as compression residuals, repeated
              visual features, and text-like region geometry. It does not read visible receipt text,
              verify a payment, or produce a legally certified forensic conclusion.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate("/workbench")}
                className="group flex items-center gap-2.5 rounded-lg border border-sky-400/40 bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-sky-500 hover:shadow-sky-500/30 active:scale-[0.98]"
              >
                <span>Launch Forensic Workbench</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#demo-gallery"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0c1222] px-5 py-3 text-sm font-medium text-slate-200 shadow-sm transition-all hover:bg-white/[0.06] hover:text-white hover:border-white/20 active:scale-[0.98]"
              >
                <span>Explore Demonstration Cases</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>

              <button
                onClick={() => onNavigate("/evaluation")}
                className="flex items-center gap-1.5 px-3 py-3 text-xs font-mono text-slate-400 hover:text-sky-300 transition-colors"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>View Analyzer Status</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/[0.08] text-xs font-mono">
              <div>
                <span className="block text-slate-400">Analysis</span>
                <span className="text-sm font-semibold text-white">Image heuristics</span>
              </div>
              <div>
                <span className="block text-slate-400">Payment status</span>
                <span className="text-sm font-semibold text-amber-300">Not connected</span>
              </div>
              <div>
                <span className="block text-slate-400">Storage</span>
                <span className="text-sm font-semibold text-sky-400">Case summaries saved</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Preview Component */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-white/[0.12] bg-[#0A0F1D]/90 p-4 shadow-2xl backdrop-blur-xl">
              {/* Header bar of preview */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    INTERACTIVE MULTI-SPECTRAL PREVIEW
                  </span>
                </div>
                <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                  SYNTHETIC SAMPLE S2
                </span>
              </div>

              {/* Spectral layer tabs */}
              <div className="mt-3 flex gap-1 rounded-lg bg-[#060A14] p-1 border border-white/[0.06] text-[11px] font-mono">
                {[
                  { id: "ORIGINAL", label: "01 Original" },
                  { id: "ELA", label: "02 ELA Heatmap" },
                  { id: "WAVELET", label: "03 Wavelet HF" },
                  { id: "LASER", label: "04 Laser Drift" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewLayer(tab.id as any)}
                    className={`flex-1 rounded py-1 text-center font-medium transition-all ${
                      activePreviewLayer === tab.id
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Visual viewport simulator */}
              <div className="relative mt-3 h-[290px] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#03060C] flex flex-col items-center justify-center">
                {/* Simulated UPI Card */}
                <div className="relative w-[85%] max-w-[280px] rounded-lg border border-white/[0.12] bg-[#0E1526] p-4 shadow-xl">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px] font-mono text-slate-400">
                    <span>Illustrative payment UI</span>
                    <span>14:32 IST</span>
                  </div>

                  {/* Payment Body */}
                  <div className="mt-3 text-center space-y-1">
                    <p className="text-[11px] text-slate-400 font-sans">Payment to Merchant</p>
                    <p className="text-xs font-semibold text-slate-200">APOLLO PHARMACY PVT</p>

                    {/* Amount Block with Layer Overlays */}
                    <div className="relative my-3 inline-block rounded border px-3 py-1.5 transition-all">
                      {activePreviewLayer === "ORIGINAL" && (
                        <div className="border-transparent">
                          <span className="text-xl font-bold font-mono text-white">₹95,250.00</span>
                          <span className="block text-[9px] text-slate-400">Synthetic illustration • unverified</span>
                        </div>
                      )}

                      {activePreviewLayer === "ELA" && (
                        <div className="relative rounded bg-rose-950/70 border border-rose-500/60 p-1 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                          <span className="text-xl font-bold font-mono text-rose-300">₹95,250.00</span>
                          <span className="block text-[9px] font-mono text-rose-400 font-semibold">
                            Example ELA display • not a measured result
                          </span>
                        </div>
                      )}

                      {activePreviewLayer === "WAVELET" && (
                        <div className="relative rounded bg-cyan-950/70 border border-cyan-500/60 p-1 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                          <span className="text-xl font-bold font-mono text-cyan-200">₹95,250.00</span>
                          <span className="block text-[9px] font-mono text-cyan-400 font-semibold">
                            Example wavelet display • not a measured result
                          </span>
                        </div>
                      )}

                      {activePreviewLayer === "LASER" && (
                        <div className="relative rounded bg-amber-950/70 border border-amber-500/60 p-1 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                          <span className="text-xl font-bold font-mono text-amber-200">₹95,250.00</span>
                          <span className="block text-[9px] font-mono text-amber-400 font-semibold">
                            Example text-region overlay • not OCR
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-amber-300 flex items-center justify-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Synthetic example • no transaction check</span>
                    </div>
                  </div>
                </div>

                {/* Simulated scan line */}
                <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_10px_#38bdf8] opacity-70 animate-pulse" />
              </div>

              {/* Card Footer with Quick Action */}
              <div className="mt-3 flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  <strong className="text-amber-300">Illustrative only • no probability shown</strong>
                </span>
                <button
                  onClick={() => onNavigate("/workbench", { case: "sample_2" })}
                  className="inline-flex items-center gap-1 rounded bg-sky-500/20 px-2.5 py-1 text-[11px] font-mono font-medium text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-colors"
                >
                  <span>Inspect in Workbench</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION B: 4-LAYER FORENSIC ARCHITECTURE
        ========================================================================= */}
        <div className="py-16 border-t border-white/[0.08]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Corroboration Architecture
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Multi-Spectral Forensic Pipeline
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              The pipeline computes several deterministic image cues. They can miss edits and can
              also react to ordinary resizing, compression, or repeated interface elements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Layer 1: Pixel and frequency cues */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6 shadow-lg hover:border-sky-500/40 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-950/60 text-sky-400 mb-4">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs font-semibold text-sky-400">LAYER 01</span>
              <h3 className="text-base font-bold text-white mt-1">Pixel & Frequency Cues</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Builds ELA and wavelet summaries and finds repeated ORB features. Residuals vary with
                encoding, and repeated icons or interface elements can match without editing.
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                Output: candidate pixel cues
              </div>
            </div>

            {/* Layer 2: Text-like region geometry */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6 shadow-lg hover:border-indigo-500/40 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-950/60 text-indigo-400 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs font-semibold text-indigo-400">LAYER 02</span>
              <h3 className="text-base font-bold text-white mt-1">Text-like Region Geometry</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Compares connected-component geometry and local color/sharpness around text-like regions.
                It does not recognize words, digits, or receipt fields.
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                Output: candidate geometry cues
              </div>
            </div>

            {/* Layer 3: Metadata and QR inspection */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6 shadow-lg hover:border-teal-500/40 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-950/60 text-teal-400 mb-4">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs font-semibold text-teal-400">LAYER 03</span>
              <h3 className="text-base font-bold text-white mt-1">Metadata & QR Inspection</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Reads supported file metadata and decodes QR payloads. Embedded values and QR contents
                are not checked against an issuer, destination account, or payment provider.
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                Output: unverified file/payload cues
              </div>
            </div>

            {/* Layer 4: Rule-based triage */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6 shadow-lg hover:border-amber-500/40 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-950/60 text-amber-400 mb-4">
                <Sliders className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs font-semibold text-amber-400">LAYER 04</span>
              <h3 className="text-base font-bold text-white mt-1">Rule-based Cue Summary</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Applies fixed rules to the candidate cues and flags selected overlaps for inspection.
                The score is not a trained classifier output or probability.
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                Output: heuristic triage points
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION C: 4-STAGE INVESTIGATIVE WORKFLOW
        ========================================================================= */}
        <div className="py-16 border-t border-white/[0.08]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Operational Protocol
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              From Upload to Review
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              A prototype workflow for inspecting image cues. The output is not a legal or payment determination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="font-mono text-3xl font-extrabold text-sky-400/30 mb-2">01</div>
              <h3 className="text-base font-bold text-white">Evidence Ingest</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Upload a supported image or use the paired mobile upload flow. The SHA-256 value identifies
                the uploaded bytes; it does not establish who created or handled the file.
              </p>
              <div className="mt-3 font-mono text-[10px] text-sky-400">Hash SHA-256 logged</div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="font-mono text-3xl font-extrabold text-sky-400/30 mb-2">02</div>
              <h3 className="text-base font-bold text-white">Image Cue Analysis</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                The current pipeline computes residual, repeated-feature, text-like geometry, metadata,
                and QR-decoding cues. It does not read visible receipt text or verify transaction status.
              </p>
              <div className="mt-3 font-mono text-[10px] text-sky-400">No validated accuracy metric</div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="font-mono text-3xl font-extrabold text-sky-400/30 mb-2">03</div>
              <h3 className="text-base font-bold text-white">Corroborated Inspection</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Inspect flagged regions with the workbench zoom and compare the image with generated
                heatmaps. A highlight is a candidate cue and needs independent review.
              </p>
              <div className="mt-3 font-mono text-[10px] text-sky-400">Interactive Canvas Loupe</div>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="font-mono text-3xl font-extrabold text-sky-400/30 mb-2">04</div>
              <h3 className="text-base font-bold text-white">Report & Internal Review Memo</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Export a screenshot review summary or an internal memo draft. Neither is a certified
                forensic report or a legal notice.
              </p>
              <div className="mt-3 font-mono text-[10px] text-amber-300">Internal draft only</div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION D: IMPLEMENTED CHECKS VS REAL-WORLD BOUNDARIES
        ========================================================================= */}
        <div className="py-16 border-t border-white/[0.08]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Methodological Integrity
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              What the Analyzer Checks & What It Does Not
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              These are implemented image cues, not independently validated forensic determinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Implemented checks */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-200">Implemented Image Checks</h3>
                  <span className="text-xs font-mono text-emerald-400">Deterministic heuristics • unvalidated accuracy</span>
                </div>
              </div>

              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>JPEG residual cues:</strong> Compares the uploaded image with a recompressed copy; ordinary encoding differences can produce residuals.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>Wavelet noise variation:</strong> Summarizes local high-frequency variation that may change after compression, resizing, or sharpening.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>Text-like region geometry:</strong> Compares connected-component shapes and baselines; it does not recognize characters or identify an amount field.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>Repeated visual features:</strong> ORB matching finds candidate repeated regions; common interface elements can match too.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>Metadata and QR cues:</strong> Reads supported metadata chunks and decodes QR payloads; it does not compare them with bank records or trust an image's embedded values.
                  </span>
                </li>
              </ul>
            </div>

            {/* Right: Explicit Limitations */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-200">Forensic Limitations & Non-Claims</h3>
                  <span className="text-xs font-mono text-rose-400">Strict Operational Boundaries</span>
                </div>
              </div>

              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>
                    <strong>No Banking Ledger Access:</strong> VeriSight Pro does not access RBI, NPCI, or commercial bank databases. It does not verify whether fiat funds actually settled.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>
                    <strong>Text is not OCR-checked:</strong> Visible amount, recipient, timestamp, and UTR text are not recognized by the deployed pipeline.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>
                    <strong>No classifier evaluation:</strong> No representative labeled payment screenshot set is configured, so accuracy and error rates are unknown.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>
                    <strong>No payment-provider connection:</strong> A screenshot cannot confirm that money settled; check the originating bank or payment app's transaction history/status.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION E: DEMONSTRATION CASE GALLERY (S1–S5)
        ========================================================================= */}
        <div id="demo-gallery" className="py-16 border-t border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
                Synthetic Fixtures
              </span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Demonstration Case Catalog
              </h2>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                These bundled examples are synthetic regression fixtures, not a real-world benchmark.
                Open each one in the workbench to see which configured cues it triggers.
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-mono text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Synthetic development samples only</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samples.map((sample, idx) => {
              const state = sample.expected_verdict;
              const evidenceLabel =
                state === "INCONCLUSIVE" ? "NO STRONG CUES" :
                state === "CORROBORATED_ANOMALIES" ? "OVERLAPPING CUES" :
                state === "REVIEW_REQUIRED" ? "REVIEW CUES" : "STATE UNAVAILABLE";
              const isReviewCue = state !== "INCONCLUSIVE";

              return (
                <div
                  key={sample.id}
                  className="flex flex-col justify-between rounded-xl border border-white/[0.1] bg-[#0A0F1E] overflow-hidden shadow-lg hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all group"
                >
                  {/* Mandatory Top Banner */}
                  <div className="bg-amber-950/80 border-b border-amber-800/50 px-3 py-1.5 text-center">
                    <span className="font-mono text-[9px] font-bold tracking-wider text-amber-300 uppercase">
                      SYNTHETIC DEMONSTRATION — NOT REAL PAYMENT EVIDENCE
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-sky-400">
                          SAMPLE S{idx + 1}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${
                            isReviewCue
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/50"
                              : "bg-amber-950/80 text-amber-300 border border-amber-800/50"
                          }`}
                        >
                          {evidenceLabel}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-2 group-hover:text-sky-300 transition-colors">
                        {sample.title}
                      </h3>

                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        {sample.scenario}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Expected Score:</span>
                        <span className="text-slate-300 font-bold">
                          {sample.target_score_range || "N/A"}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {sample.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-white/[0.06]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => onNavigate("/workbench", { case: sample.id })}
                        className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/15 py-2 text-xs font-mono font-medium text-sky-300 hover:bg-sky-500/25 transition-all active:scale-[0.98]"
                      >
                        <span>Inspect in Workbench</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION F: ANALYZER STATUS
        ========================================================================= */}
        <div className="py-16 border-t border-white/[0.08]">
          <div className="rounded-2xl border border-white/[0.1] bg-[#0A0F1F] p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Model & Evaluation Status
                </span>
                <h2 className="text-xl sm:text-3xl font-bold text-white mt-1">
                  Deterministic image heuristics
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl font-sans">
                  No trained or calibrated authenticity classifier is deployed. The score is a set of
                  rule points, not a probability; the confidence field is unavailable.
                </p>
              </div>

              <button
                onClick={() => onNavigate("/evaluation")}
                className="shrink-0 flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/20 px-4 py-2.5 text-xs font-mono font-semibold text-sky-300 hover:bg-sky-500/30 transition-all active:scale-[0.98]"
              >
                <span>Analyzer Status</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="my-6 rounded-lg border border-amber-500/40 bg-amber-950/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-200 uppercase font-mono block mb-1">
                    Accuracy has not been established
                  </strong>
                  The five bundled examples are synthetic regression fixtures. They do not provide a
                  representative, independently labeled evaluation set, so no real-world accuracy,
                  false-positive rate, or false-negative rate is available.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-lg border border-white/[0.06] bg-[#070B16] p-4 text-center">
                <span className="font-mono text-[11px] text-slate-400 block">Classifier</span>
                <span className="font-mono text-lg font-bold text-amber-300 mt-2 block">None deployed</span>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-[#070B16] p-4 text-center">
                <span className="font-mono text-[11px] text-slate-400 block">Independent labeled references</span>
                <span className="font-mono text-lg font-bold text-amber-300 mt-2 block">None configured</span>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-[#070B16] p-4 text-center">
                <span className="font-mono text-[11px] text-slate-400 block">Accuracy / calibrated confidence</span>
                <span className="font-mono text-lg font-bold text-amber-300 mt-2 block">Unavailable</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION G: DATA HANDLING & INTERNAL DRAFT
        ========================================================================= */}
        <div className="py-16 border-t border-white/[0.08]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Data Handling & Report Scope
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              What is stored and generated
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Case metadata is persisted in Supabase. Uploaded image bytes are not stored in the case table.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-950/60 text-sky-400 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Case summary storage</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                The database stores the case ID, timestamp, filename, SHA-256 hash, dimensions, heuristic
                points, findings, and layer summaries. It does not store the original image in the case row.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-950/60 text-amber-300 mb-4">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Temporary mobile upload</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                The paired mobile flow temporarily uses a private Storage object and deletes it after analysis.
                Cleanup for abandoned uploads is best-effort, not a scheduled deletion guarantee.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-950/60 text-indigo-400 mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Hash & draft report</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                SHA-256 identifies the uploaded bytes. It does not establish chain of custody or prove content
                authenticity. Exported reports and internal review memos are drafts, not certified documents.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION H: HONEST FAQ & FORENSIC FOOTER
        ========================================================================= */}
        <div className="py-16 border-t border-white/[0.08]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Investigator Q&A
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Can VeriSight prove who committed the forgery?</span>
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed pl-6">
                No. VeriSight reports heuristic image cues and cannot conclusively prove an edit or identify
                who made it. Establishing authorship requires evidence outside this screenshot-analysis prototype.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Why does WhatsApp compression make forensics difficult?</span>
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed pl-6">
                Messaging apps may resize or recompress images and may alter metadata; the exact result depends
                on how the image was sent. VeriSight cannot identify WhatsApp or reliably recover the original
                image from a forwarded copy.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Is the internal review memo a legal notice?</span>
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed pl-6">
                No. It is an internal summary of heuristic image cues, not a request to an institution and
                not a legally reviewed document. It does not verify image authenticity or payment settlement.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Does VeriSight connect to NPCI or bank servers?</span>
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed pl-6">
                No. It analyzes image cues and decodes QR payloads, but does not connect to NPCI, a bank, or a
                payment app. Check the participating UPI app or bank's transaction history/status to confirm payment.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FOOTER
        ========================================================================= */}
        <footer className="mt-16 border-t border-white/[0.08] pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-slate-400">VERISIGHT PRO FORENSIC SUITE</span>
            <span>•</span>
            <span>Heuristic prototype</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("/")}
              className="hover:text-slate-300 transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate("/workbench")}
              className="hover:text-slate-300 transition-colors"
            >
              Workbench
            </button>
            <button
              onClick={() => onNavigate("/evaluation")}
              className="hover:text-slate-300 transition-colors"
            >
              Evaluation
            </button>
          </div>

          <div>
            <span>Not a certified forensic tool</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
