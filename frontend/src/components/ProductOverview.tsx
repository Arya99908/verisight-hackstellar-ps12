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
  Award,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

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
            title: "Sample 1 — Clean Synthetic Payment UI",
            scenario: "Synthetic baseline fixture. It does not establish that a real screenshot is authentic or that a payment occurred.",
            expected_verdict: "INCONCLUSIVE",
            target_score_range: "Variable heuristic points",
            tags: ["Synthetic", "Baseline", "Not payment verified"],
          },
          {
            id: "sample_2",
            title: "Pixel-Spliced Amount (₹95,250.00)",
            scenario: "Amount altered with off-color patch (ΔE=5.2), +3.5px baseline laser drop, and zero-noise wavelet void.",
            expected_verdict: "MANIPULATED_FORGERY",
            target_score_range: "Variable heuristic points",
            tags: ["Spliced", "Forgery", "High-Risk", "Baseline Drift"],
          },
          {
            id: "sample_3",
            title: "Fake Generator / DOM Edit",
            scenario: "Uniform PNG with status-bar clock paradox (11:12 vs 11:45 AM) and invalid 10-digit UTR.",
            expected_verdict: "MANIPULATED_FORGERY",
            target_score_range: "Variable heuristic points",
            tags: ["DOM Edit", "Generator", "Clock Paradox", "Fake UTR"],
          },
          {
            id: "sample_4",
            title: "WhatsApp-Forwarded Forgery",
            scenario: "Spliced receipt passed through WhatsApp delivery (EXIF stripped, 4:2:0 subsampling, JPEG Q=77).",
            expected_verdict: "MANIPULATED_FORGERY",
            target_score_range: "Variable heuristic points",
            tags: ["WhatsApp", "Laundered", "Re-compressed", "Surviving Geometry"],
          },
          {
            id: "sample_5",
            title: "Copy-Move Cloned Digits",
            scenario: "Digit sequence cloned to inflate balance; non-native cropped viewport (680x1120).",
            expected_verdict: "MANIPULATED_FORGERY",
            target_score_range: "Variable heuristic points",
            tags: ["Copy-Move", "Cloned Digits", "ORB", "Cropped Viewport"],
          },
        ];

  // Motion variants according to Emil Kowalski / Apple motion design principles
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.45,
        ease: "easeOut",
      },
    },
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full overflow-y-auto bg-[#060911] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Background ambient radial glow with subtle breathing animation */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: [0.65, 0.85, 0.65],
                scale: [0.98, 1.02, 0.98],
              }
        }
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-500/12 via-indigo-500/6 to-transparent blur-[140px]"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* =========================================================================
            SECTION A: HERO NARRATIVE & DUAL CTA
        ========================================================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 pt-4 pb-16"
        >
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-3.5 py-1 text-xs font-mono font-medium text-sky-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
              </span>
              <span>DIGITAL PAYMENT EVIDENCE FORENSICS</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">v1.2.1-calibrated</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={itemVariants} className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl text-white leading-tight">
              Investigate the integrity of{" "}
              <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                payment screenshots.
              </span>
            </motion.h1>

            {/* Supporting paragraph */}
            <motion.p variants={itemVariants} className="text-base text-slate-300 sm:text-lg leading-relaxed max-w-2xl font-sans">
              VeriSight Pro equips cybercrime officers, fraud intelligence teams, and legal counsel
              to inspect compressed UPI receipts, expose subtle splice boundaries, and generate
              court-admissible Section 94 BNSS forensic dossiers beyond naked-eye inspection.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                onClick={() => onNavigate("/workbench")}
                className="group flex items-center gap-2.5 rounded-lg border border-sky-400/40 bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-sky-500 hover:shadow-sky-500/30"
              >
                <span>Launch Forensic Workbench</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.button>

              <motion.a
                whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                href="#demo-gallery"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0c1222] px-5 py-3 text-sm font-medium text-slate-200 shadow-sm transition-all hover:bg-white/[0.06] hover:text-white hover:border-white/20"
              >
                <span>Explore Demonstration Cases</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </motion.a>

              <button
                onClick={() => onNavigate("/why-verisight")}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-xs font-mono text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm"
              >
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span>Why We Are Better</span>
              </button>

              <button
                onClick={() => onNavigate("/evaluation")}
                className="flex items-center gap-1.5 px-3 py-3 text-xs font-mono text-slate-400 hover:text-sky-300 transition-colors"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>View Live Evaluation Telemetry</span>
              </button>
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div variants={itemVariants} className="pt-4 grid grid-cols-3 gap-4 border-t border-white/[0.08] text-xs font-mono">
              <div>
                <span className="block text-slate-400">Multi-Spectral</span>
                <span className="text-sm font-semibold text-white">4 Core Layers</span>
              </div>
              <div>
                <span className="block text-slate-400">Statutory Notice</span>
                <span className="text-sm font-semibold text-emerald-400">Sec 94 BNSS Ready</span>
              </div>
              <div>
                <span className="block text-slate-400">Analysis Privacy</span>
                <span className="text-sm font-semibold text-sky-400">Ephemeral In-Memory</span>
              </div>
            </motion.div>
          </div>

          {/* Interactive Live Preview Component with animated scanline sweep */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
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
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Visual viewport simulator */}
              <div className="relative mt-3 h-[290px] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#03060C] flex flex-col items-center justify-center">
                {/* Animated forensic scanline laser sweep */}
                {!shouldReduceMotion && (
                  <motion.div
                    className="pointer-events-none absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.8)] z-20"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                  />
                )}

                {/* Simulated UPI Card */}
                <div className="relative w-[85%] max-w-[280px] rounded-lg border border-white/[0.12] bg-[#0E1526] p-4 shadow-xl z-10">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px] font-mono text-slate-400">
                    <span>Google Pay UPI</span>
                    <span>14:32 IST</span>
                  </div>

                  {/* Payment Body */}
                  <div className="mt-3 text-center space-y-1">
                    <p className="text-[11px] text-slate-400 font-sans">Payment to Merchant</p>
                    <p className="text-xs font-semibold text-slate-200">APOLLO PHARMACY PVT</p>

                    {/* Amount Block with AnimatePresence Layer Overlays */}
                    <div className="relative my-3 inline-block rounded border px-3 py-1.5 transition-all">
                      <AnimatePresence mode="wait">
                        {activePreviewLayer === "ORIGINAL" && (
                          <motion.div
                            key="orig"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="border-transparent"
                          >
                            <span className="text-xl font-bold font-mono text-white">₹95,250.00</span>
                            <span className="block text-[9px] text-slate-400">Naked eye view (looks genuine)</span>
                          </motion.div>
                        )}

                        {activePreviewLayer === "ELA" && (
                          <motion.div
                            key="ela"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="relative rounded bg-rose-950/70 border border-rose-500/60 p-1 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                          >
                            <span className="text-xl font-bold font-mono text-rose-300">₹95,250.00</span>
                            <span className="block text-[9px] font-mono text-rose-400 font-semibold">
                              ΔQ Outlier (+41.2% ELA Energy)
                            </span>
                          </motion.div>
                        )}

                        {activePreviewLayer === "WAVELET" && (
                          <motion.div
                            key="wave"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="relative rounded bg-cyan-950/70 border border-cyan-500/60 p-1 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          >
                            <span className="text-xl font-bold font-mono text-cyan-200">₹95,250.00</span>
                            <span className="block text-[9px] font-mono text-cyan-400 font-semibold">
                              db4 Wavelet High-Pass Void
                            </span>
                          </motion.div>
                        )}

                        {activePreviewLayer === "LASER" && (
                          <motion.div
                            key="laser"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="relative rounded bg-amber-950/70 border border-amber-500/60 p-1 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          >
                            <span className="text-xl font-bold font-mono text-amber-200">₹95,250.00</span>
                            <span className="block text-[9px] font-mono text-amber-400 font-semibold">
                              Laser Baseline Drift: +3.8px drop
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Completed via HDFC Bank UPI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* =========================================================================
            SECTION B: 4-LAYER FORENSIC ARCHITECTURE BREAKDOWN
        ========================================================================= */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="py-16 border-t border-white/[0.08]"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Decomposition Architecture
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Deterministic Multi-Layer Signal Analysis
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              VeriSight decomposes every evidence screenshot across physical frequency domains,
              typographic alignment lasers, container metadata, and mathematical fusion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Layer 1: Physical ELA */}
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6 shadow-lg hover:border-sky-500/40 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-950/60 text-sky-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs font-semibold text-sky-400">LAYER 01</span>
              <h3 className="text-base font-bold text-white mt-1">Physical Signal Forensics</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Multi-scale Error Level Analysis (ELA) at Q75, Q85, and Q95. Sweeps quantization matrices
                to detect local compression variance differences typical of image pastes.
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                Target: JPEG resaving & spliced patches
              </div>
            </motion.div>

            {/* Layer 2: Wavelet Residual */}
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6 shadow-lg hover:border-cyan-500/40 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/60 text-cyan-400 mb-4">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs font-semibold text-cyan-400">LAYER 02</span>
              <h3 className="text-base font-bold text-white mt-1">High-Pass Wavelet Residuals</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Daubechies db4 discrete wavelet transforms isolate high-frequency sensor noise.
                Synthetic brush edits and smooth Gaussian fills produce distinct zero-noise voids.
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                Target: Inpainted voids & digital blurs
              </div>
            </motion.div>

            {/* Layer 3: Clone-Move Vectors */}
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6 shadow-lg hover:border-pink-500/40 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pink-500/30 bg-pink-950/60 text-pink-400 mb-4">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs font-semibold text-pink-400">LAYER 03</span>
              <h3 className="text-base font-bold text-white mt-1">ORB Copy-Move Vectors</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Extracts Oriented FAST and Rotated BRIEF keypoints to locate duplicated textures or cloned
                digits within the screenshot, filtering out repetitive legitimate UI elements.
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                Target: Cloned digits & spliced stamps
              </div>
            </motion.div>

            {/* Layer 4: Text Laser Baseline */}
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6 shadow-lg hover:border-amber-500/40 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-950/60 text-amber-400 mb-4">
                <Sliders className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs font-semibold text-amber-400">LAYER 04</span>
              <h3 className="text-base font-bold text-white mt-1">Text Baseline Geometry</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Calculates sub-pixel font baseline angles and character bounding box alignments.
                Flags micro-kerning irregularities and vertical misalignments exceeding 1.8 pixels.
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                Target: Typographic drift & font substitution
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* =========================================================================
            SECTION C: 4-STAGE INVESTIGATIVE WORKFLOW
        ========================================================================= */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="py-16 border-t border-white/[0.08]"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Operational Protocol
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              From Ingestion to Judicial Summons
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              A standard operating procedure engineered specifically for cybercrime desks and fraud analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="font-mono text-3xl font-extrabold text-sky-400/30 mb-2">01</div>
              <h3 className="text-base font-bold text-white">Evidence Ingest</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Drag-and-drop raw PNG, JPG, or WhatsApp forwarded payment receipts. Mobile QR bridge
                allows officers to transfer evidence directly from field devices securely.
              </p>
              <div className="mt-3 font-mono text-[10px] text-sky-400">Hash SHA-256 logged</div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="font-mono text-3xl font-extrabold text-sky-400/30 mb-2">02</div>
              <h3 className="text-base font-bold text-white">Multi-Layer Decomposition</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Automated multi-spectral pipeline computes compression deltas, high-pass frequencies,
                OCR baseline geometry, and camera metadata integrity simultaneously.
              </p>
              <div className="mt-3 font-mono text-[10px] text-sky-400">Mean processing &lt; 850ms</div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="font-mono text-3xl font-extrabold text-sky-400/30 mb-2">03</div>
              <h3 className="text-base font-bold text-white">Corroborated Inspection</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Examine suspicious regions with synchronized loupe (8x zoom), interactive split sliders,
                and quad-matrix views comparing original pixels against forensic heatmaps.
              </p>
              <div className="mt-3 font-mono text-[10px] text-sky-400">Interactive Canvas Loupe</div>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="font-mono text-3xl font-extrabold text-sky-400/30 mb-2">04</div>
              <h3 className="text-base font-bold text-white">Statutory Dossier Export</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Export verifiable PDF investigation reports or generate a Section 94 BNSS
                statutory summons document to serve on banks or intermediary payment apps.
              </p>
              <div className="mt-3 font-mono text-[10px] text-emerald-400">Sec 94 BNSS Compliant</div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            SECTION D: VERIFIED CAPABILITIES VS REAL-WORLD BOUNDARIES
        ========================================================================= */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="py-16 border-t border-white/[0.08]"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Methodological Integrity
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              What VeriSight Verifies & What It Does Not
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Digital image forensics evaluates the visual and digital integrity of the file itself.
              Investigators must understand the exact boundary between pixel forensics and banking ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: What We Verify */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-200">Verified Capabilities</h3>
                  <span className="text-xs font-mono text-emerald-400">Deterministic & Statistical Image Tests</span>
                </div>
              </div>

              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>Compression Quantization Inconsistencies:</strong> Identifies modified regions saved with different JPEG quality factors than the host image.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>High-Frequency Wavelet Perturbations:</strong> Exposes synthetic brush smoothing, copy voids, and artificial Gaussian smoothing.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>Typographic Alignment & Baseline Drift:</strong> Measures font baseline angle shifts and micro-kerning discrepancies across amount fields.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>Cloned Transaction Digit Sequences:</strong> Uses ORB descriptor keypoint clustering to pinpoint duplicated numbers or reference IDs.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>
                    <strong>Temporal & Viewport Sanity:</strong> Checks status bar clock consistency against receipt body timestamps and detects non-standard device crops.
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
                    <strong>Does Not Prove Criminal Intent:</strong> Image manipulation detection provides technical corroboration of alterations, but cannot identify who performed the modification.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>
                    <strong>Extreme Laundering Degradation:</strong> If a screenshot is recompressed multiple times through lossy chat platforms at low resolution (&lt;480px), fine ELA evidence may degrade.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>
                    <strong>Corroboration Tool, Not Sole Determiner:</strong> Results should be accompanied by statutory Section 94 BNSS notices to banks for definitive transaction confirmation.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            SECTION E: DEMONSTRATION CASE GALLERY (S1–S5)
        ========================================================================= */}
        <motion.div
          id="demo-gallery"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="py-16 border-t border-white/[0.08]"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
                Golden Test Suite
              </span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Demonstration Case Catalog
              </h2>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Synthetic fixtures and user-submitted examples are separated and labeled by provenance.
                Open a case in the workbench to inspect its image cues.
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-mono text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Example provenance is shown per case</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samples.map((sample, idx) => {
              const isManipulated =
                sample.expected_verdict?.includes("MANIPULATED") ||
                sample.expected_verdict?.includes("FORGERY");
              const isUserProvided = sample.tags?.includes("User-provided") ?? false;
              const isSynthetic = sample.tags?.includes("Synthetic") ?? sample.id.startsWith("sample_");
              const provenanceLabel = isUserProvided
                ? "USER-PROVIDED EXAMPLE — AUTHENTICITY NOT INDEPENDENTLY VERIFIED"
                : isSynthetic
                  ? "SYNTHETIC DEMONSTRATION — NOT REAL PAYMENT EVIDENCE"
                  : "EXAMPLE — PROVENANCE NOT VERIFIED";

              return (
                <motion.div
                  key={sample.id}
                  whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
                  className="flex flex-col justify-between rounded-xl border border-white/[0.1] bg-[#0A0F1E] overflow-hidden shadow-lg hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all group"
                >
                  {/* Provenance banner: never infer authenticity from a clean score. */}
                  <div
                    className={
                      isManipulated || isUserProvided
                        ? "bg-amber-950/80 border-b border-amber-800/50 px-3 py-1.5 text-center"
                        : "bg-slate-900/80 border-b border-white/10 px-3 py-1.5 text-center"
                    }
                  >
                    <span
                      className={`font-mono text-[9px] font-bold tracking-wider uppercase ${
                        isManipulated || isUserProvided ? "text-amber-300" : "text-slate-300"
                      }`}
                    >
                      {provenanceLabel}
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
                            isManipulated
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/50"
                              : isUserProvided
                                ? "bg-amber-950/80 text-amber-200 border border-amber-800/50"
                                : "bg-slate-900 text-slate-300 border border-white/10"
                          }`}
                        >
                          {isManipulated ? "KNOWN SYNTHETIC EDIT" : isUserProvided ? "USER-ASSERTED" : "SYNTHETIC BASELINE"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-2 group-hover:text-sky-300 transition-colors">
                        {sample.title}
                      </h3>

                      {isUserProvided && "url" in sample && sample.url && (
                        <img src={sample.url} alt="User-provided payment screenshot; not independently verified" className="mt-3 max-h-72 w-full rounded-lg border border-white/10 bg-black object-contain" loading="lazy" />
                      )}

                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        {sample.scenario}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Expected Score:</span>
                        <span className={isManipulated ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
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
                      <motion.button
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                        onClick={() => onNavigate("/workbench", { case: sample.id })}
                        className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/15 py-2 text-xs font-mono font-medium text-sky-300 hover:bg-sky-500/25 transition-all"
                      >
                        <span>Inspect in Workbench</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* =========================================================================
            SECTION F: RESEARCH & EVALUATION METHODOLOGY SUMMARY
        ========================================================================= */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="py-16 border-t border-white/[0.08]"
        >
          <div className="rounded-2xl border border-white/[0.1] bg-[#0A0F1F] p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Model Governance & Empirical Rigor
                </span>
                <h2 className="text-xl sm:text-3xl font-bold text-white mt-1">
                  VeriSight Fusion GBDT v1.2.1
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl font-sans">
                  The forensic core combines 5 independent estimators into a calibrated HistGradientBoosting
                  Classifier using 3-fold CalibratedClassifierCV (Sigmoid) to produce trustworthy probabilities.
                </p>
              </div>

              <motion.button
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                onClick={() => onNavigate("/evaluation")}
                className="shrink-0 flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/20 px-4 py-2.5 text-xs font-mono font-semibold text-sky-300 hover:bg-sky-500/30 transition-all"
              >
                <span>Full Evaluation Dashboard</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </motion.button>
            </div>

            {/* Mandatory Academic & Scientific Disclosure */}
            <div className="my-6 rounded-lg border border-amber-500/40 bg-amber-950/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-200 uppercase font-mono block mb-1">
                    Mandatory Benchmark Disclosure:
                  </strong>
                  Current evaluation uses synthetic development samples and external WhatsApp blind test sets.
                  Benchmark scores reflect in-sample and held-out synthetic test partitions (20 development, 7 held-out evaluation samples)
                  and 23 blind consumer samples (ROC-AUC = 0.9731).
                </div>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="rounded-lg border border-white/[0.06] bg-[#070B16] p-4 text-center">
                <span className="font-mono text-[11px] text-slate-400 block">ROC-AUC (Dev GBDT)</span>
                <span className="font-mono text-2xl font-bold text-sky-400 mt-1 block">0.910</span>
                <span className="font-mono text-[10px] text-slate-500 mt-1 block">1.000 (Test Partition)</span>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-[#070B16] p-4 text-center">
                <span className="font-mono text-[11px] text-slate-400 block">Brier Score</span>
                <span className="font-mono text-2xl font-bold text-emerald-400 mt-1 block">0.0992</span>
                <span className="font-mono text-[10px] text-slate-500 mt-1 block">Calibrated probability</span>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-[#070B16] p-4 text-center">
                <span className="font-mono text-[11px] text-slate-400 block">Benchmark Corpus</span>
                <span className="font-mono text-2xl font-bold text-white mt-1 block">27 Samples</span>
                <span className="font-mono text-[10px] text-slate-500 mt-1 block">20 Dev / 7 Held-out Test</span>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-[#070B16] p-4 text-center">
                <span className="font-mono text-[11px] text-slate-400 block">Calibration Model</span>
                <span className="font-mono text-sm font-bold text-indigo-300 mt-2 block">
                  CalibratedClassifierCV
                </span>
                <span className="font-mono text-[10px] text-slate-500 mt-1 block">Sigmoid (3-Fold CV)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            SECTION G: PRIVACY, DATA RETENTION & STATUTORY COMPLIANCE
        ========================================================================= */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="py-16 border-t border-white/[0.08]"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-400">
              Judicial & Data Safeguards
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Data Privacy & Statutory Framework
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Engineered with strict zero-retention principles and integrated Section 94 BNSS legal notice generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-950/60 text-sky-400 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Ephemeral In-Memory Processing</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Evidence screenshots uploaded to VeriSight are processed in RAM memory buffers during
                the analysis session. They are not stored permanently on disk or harvested into training corpora.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 mb-4">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Section 94 BNSS Modernization</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                CrPC Section 91 has been superseded by Section 94 of Bharatiya Nagarik Suraksha Sanhita (BNSS),
                2023. VeriSight automatically populates legally valid summons notices with verified transaction hashes.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-950/60 text-indigo-400 mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Chain of Custody SHA-256</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Every forensic report logs the cryptographic SHA-256 hash, pixel dimensions, DPI, and
                color space of the ingested screenshot, preserving evidentiary integrity for court submission.
              </p>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            SECTION H: HONEST FAQ & FORENSIC FOOTER
        ========================================================================= */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="py-16 border-t border-white/[0.08]"
        >
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
                No. VeriSight provides technical, mathematical corroboration that an image has been altered
                (such as spliced numbers, font baseline shifts, or double-compression boundaries). It cannot identify
                the individual behind the keyboard. Formal attribution requires IP logs, ISP data, or device seizure.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Why does WhatsApp compression make forensics difficult?</span>
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed pl-6">
                When a screenshot is sent through WhatsApp, it is recompressed with 4:2:0 chroma subsampling
                and a lower JPEG quality factor (typically Q=75–77), stripping EXIF metadata. VeriSight accounts
                for this by checking high-frequency wavelet subbands and geometric font baselines that survive recompression.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400 shrink-0" />
                <span>What is Section 94 of BNSS, 2023?</span>
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed pl-6">
                Under the new criminal laws of India enacted in 2023, Section 94 of the Bharatiya Nagarik Suraksha
                Sanhita (BNSS) replaces the former Section 91 of the Code of Criminal Procedure (CrPC). It empowers
                investigating police officers to issue formal summons for the production of documents or electronic records.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Does VeriSight connect to NPCI or bank servers?</span>
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed pl-6">
                No. VeriSight operates exclusively as a digital media forensics platform. It analyzes the pixel structure
                and metadata of screenshots. For confirmation of account balances or ledger credits, investigators should
                serve Section 94 BNSS notices directly on the relevant banks or payment aggregators.
              </p>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            FOOTER
        ========================================================================= */}
        <footer className="mt-16 border-t border-white/[0.08] pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-slate-400">VERISIGHT PRO FORENSIC SUITE</span>
            <span>•</span>
            <span>v1.2.1-calibrated</span>
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
            <button
              onClick={() => onNavigate("/why-verisight")}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Why VeriSight
            </button>
          </div>

          <div>
            <span>Section 94 BNSS Compliant</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
