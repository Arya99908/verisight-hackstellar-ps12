import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Copy,
  Layers,
  Sparkles,
  Fingerprint,
  Target,
  ChevronDown,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { verdictLabel } from "../services/verdictLabel";
import { ForensicAnalysisReport, BoundingBox } from "../types/forensic";
import { toast } from "sonner";

interface RiskDossierSidebarProps {
  report: ForensicAnalysisReport | null;
  selectedLocus: BoundingBox | null;
  onSelectLocus: (box: BoundingBox | null) => void;
  onOpenReviewMemo?: () => void;
  onOpenReport?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isAdvancedMode?: boolean;
}

export const RiskDossierSidebar: React.FC<RiskDossierSidebarProps> = ({
  report,
  selectedLocus,
  onSelectLocus,
  onOpenReviewMemo,
  onOpenReport,
  isCollapsed = false,
  onToggleCollapse,
  isAdvancedMode = false,
}) => {
  const handleOpenReviewMemo = onOpenReviewMemo;
  // Accordion state for progressive disclosure of layers
  const [openLayers, setOpenLayers] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
  });

  const toggleLayer = (layerNum: number) => {
    setOpenLayers((prev) => ({ ...prev, [layerNum]: !prev[layerNum] }));
  };

  // Severity filter state for findings
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "INFO">("ALL");

  // Animated counting risk score
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!report) return;
    const target = report.overall_tamper_score;
    let start = 0;
    const step = target / 25;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Number(start.toFixed(1)));
      }
    }, 12);
    return () => clearInterval(timer);
  }, [report?.overall_tamper_score, report?.file_sha256]);

  if (!report) {
    return (
      <aside className="flex min-h-24 w-full flex-col items-center justify-center border-t border-white/[0.07] bg-[#0B0F19]/95 p-4 text-slate-500 md:h-full md:w-80 md:border-l md:border-t-0 lg:w-[400px]">
        <Layers className="h-6 w-6 stroke-[1.5] mb-2 text-slate-600" />
        <span className="font-mono text-[11px]">No Evidence Dossier Loaded</span>
      </aside>
    );
  }

  const {
    overall_tamper_score,
    verdict,
    file_sha256,
    image_width,
    image_height,
    layer1,
    layer2,
    layer3,
    layer4,
    ai_origin,
    synergy,
    findings,
  } = report;

  const isCorroborated = verdict === "CORROBORATED_ANOMALIES";
  const isReviewRequired = verdict === "REVIEW_REQUIRED" || isCorroborated;
  const qrInspection = (layer3.details?.qr_inspection || {}) as {
    decoded_count?: number;
    note?: string;
    results?: Array<{
      payload?: string;
      kind?: string;
      payee_vpa?: string;
      payee_name?: string;
      amount?: string;
      currency?: string;
      reference?: string;
      review_cue?: string | null;
    }>;
  };
  const qrResults = Array.isArray(qrInspection.results) ? qrInspection.results : [];

  // Calibrated Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (overall_tamper_score / 100) * circumference;

  const gaugeColor = isReviewRequired ? "#f43f5e" : "#f59e0b";

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error("Clipboard access is unavailable. Select the text to copy it.");
    }
  };

  // Filtered findings
  const filteredFindings = findings.filter((f) => {
    if (severityFilter === "ALL") return true;
    if (severityFilter === "CRITICAL") return f.severity === "CRITICAL";
    if (severityFilter === "HIGH") return f.severity === "HIGH";
    return f.severity !== "CRITICAL" && f.severity !== "HIGH";
  });

  // COLLAPSED MINI-RAIL VIEW
  if (isCollapsed) {
    return (
      <aside className="flex h-12 w-full shrink-0 flex-row items-center justify-between border-t border-white/[0.07] bg-[#0B0F19]/95 px-3 backdrop-blur md:h-full md:w-14 md:flex-col md:border-l md:border-t-0 md:py-3">
        <button
          onClick={onToggleCollapse}
          className="rounded p-1.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100 active:scale-[0.95]"
          title="Expand Risk Dossier panel ([)"
          aria-label="Expand Risk Dossier panel"
        >
          <PanelRightOpen className="h-4 w-4 text-sky-400" />
        </button>

        <div className="flex items-center gap-2 md:flex-col md:gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-bold shadow-sm ${
              isReviewRequired
                ? "border-rose-500/60 bg-rose-950/80 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
              : "border-amber-500/60 bg-amber-950/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
            }`}
            title={`Heuristic points: ${overall_tamper_score.toFixed(1)} (not a probability)`}
          >
            {Math.round(overall_tamper_score)}
          </div>
          <span className="hidden font-mono text-[9px] text-slate-500 md:block uppercase -rotate-90 py-4 tracking-wider">
            DOSSIER
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            {findings.length}
          </span>
        </div>
      </aside>
    );
  }

  // EXPANDED FULL DOSSIER (w-[400px])
  return (
    <aside className="flex h-full w-full flex-col border-t border-white/[0.07] bg-[#0B0F19]/95 text-xs backdrop-blur-md select-text md:w-80 md:shrink-0 md:overflow-hidden md:border-l md:border-t-0 lg:w-[400px]">
      {/* 1. Sidebar Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0D1322] px-3.5">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-sky-400" />
          <h2 className="font-mono font-semibold tracking-wider text-slate-100 uppercase text-[11px]">
            Forensic Risk Dossier
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
            FILE HASH
          </span>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="rounded p-1 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 active:scale-[0.95]"
              title="Collapse sidebar ([)"
              aria-label="Collapse sidebar"
            >
              <PanelRightClose className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Dossier Content with Choreographed Cascade */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-3.5">
        {/* Stage 1 (0ms): ScamShield-Inspired Verdict Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#0E1526]/90 p-3.5 shadow-lg"
        >
          {/* Left: Compact SVG Radial Gauge */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="stroke-white/[0.08]"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke={gaugeColor}
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono text-xl font-bold tabular-nums text-slate-100">
                {displayScore.toFixed(1)}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
                Heuristic points
              </span>
            </div>
          </div>

          {/* Right: High-Contrast Status & Plain-English Heuristic Summary */}
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold text-[11px] tracking-wide ${
                  isReviewRequired
                    ? "border border-rose-500/50 bg-rose-500/15 text-rose-300"
                    : "border border-amber-500/50 bg-amber-500/15 text-amber-200"
                }`}
              >
                {isReviewRequired ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                )}
                <span>{verdictLabel(verdict)}</span>
              </div>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-300 font-sans">
              {isCorroborated
                ? "Anomaly candidates overlap across heuristic layers. This is not proof of editing."
                : isReviewRequired
                  ? "One or more heuristic cues warrant inspection; they can also arise from normal capture, resizing, or recompression."
                  : "No configured strong manipulation cues were found. This does not establish authenticity or payment settlement."}
            </p>
          </div>
        </motion.div>

        {/* Independent AI-origin clues; deliberately separate from the verdict. */}
        <section
          aria-labelledby="ai-origin-heading"
          className="space-y-2.5 rounded-xl border border-violet-500/25 bg-[#111323] p-3.5 shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-violet-300">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <h3 id="ai-origin-heading" className="font-mono text-[10px] font-semibold uppercase tracking-wider">
                AI Origin Indicators
              </h3>
            </div>
            <span className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
              SIGNALS ONLY
            </span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-300">
            {ai_origin?.summary || "No calibrated AI-origin classifier is available."} A missing signal does not mean the image was made by a person.
          </p>
          <div className="space-y-2">
            {(ai_origin?.signals || []).map((signal) => {
              const detected = signal.status === "DETECTED";
              const caution = signal.status === "UNVERIFIED";
              const available = detected || caution;
              const statusText = {
                DETECTED: "DETECTED",
                NOT_DETECTED: "NOT DETECTED",
                UNVERIFIED: "UNVERIFIED",
                NOT_CHECKED: "NOT CHECKED",
                NOT_AVAILABLE: "NOT AVAILABLE",
              }[signal.status] || signal.status;
              return (
                <div key={signal.id} className="rounded-lg border border-white/[0.07] bg-[#090D18] p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-medium leading-snug text-slate-200">{signal.label}</span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wide ${
                        detected
                          ? "border border-violet-700/60 bg-violet-950/70 text-violet-300"
                          : caution
                            ? "border border-amber-700/60 bg-amber-950/60 text-amber-300"
                            : "border border-slate-700 bg-slate-900 text-slate-400"
                      }`}
                      aria-label={`${signal.label}: ${statusText.toLowerCase()}`}
                    >
                      {statusText}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{signal.evidence}</p>
                  <p className={`mt-1 text-[9px] leading-relaxed ${available ? "text-amber-200/80" : "text-slate-500"}`}>
                    {signal.limitation}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="border-t border-white/[0.07] pt-2 text-[10px] leading-relaxed text-amber-100/90">
            Pixel/noise irregularities can occur in ordinary screenshots and are not proof of AI generation. This section does not change the payment or screenshot verdict, and VeriSight does not verify payment settlement.
          </p>
        </section>

        <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-[11px] leading-relaxed text-amber-100">
          Text recognition is not run: the scanner finds text-like regions but does not read amounts, names, timestamps, or UTRs from visible pixels. No payment provider or bank is queried.
        </div>

        {/* QR payload inspection uses only strings decoded from the image. */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2.5 rounded-xl border border-amber-500/25 bg-[#111726] p-3.5 shadow-md"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-mono text-[10px] uppercase tracking-wider">QR Payload Inspection</span>
            </div>
            <span className="rounded border border-amber-800 bg-amber-950 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300">
              {qrInspection.decoded_count ?? qrResults.length} decoded
            </span>
          </div>

          {qrResults.length === 0 ? (
            <p className="text-[10px] leading-relaxed text-slate-400">
              No readable QR payload was found. This does not indicate whether the image or any payment is authentic.
            </p>
          ) : qrResults.map((result, index) => (
            <div key={`${result.payload || "qr"}-${index}`} className="space-y-1.5 rounded-lg border border-white/[0.08] bg-[#0A0E1A] p-2 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>{result.kind || "QR payload"}</span>
                {result.payload && (
                  <button
                    type="button"
                    onClick={() => copyText(result.payload!, "QR payload")}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-white/[0.08]"
                    aria-label={`Copy QR payload ${index + 1}`}
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                )}
              </div>
              {result.payee_vpa && <p className="break-all text-slate-200">VPA string: {result.payee_vpa}</p>}
              {result.payee_name && <p className="break-all text-slate-200">Name string: {result.payee_name}</p>}
              {result.amount && <p className="break-all text-slate-200">Amount string: {result.amount} {result.currency || ""}</p>}
              {result.reference && <p className="break-all text-slate-200">Reference string: {result.reference}</p>}
              {result.payload && <p className="break-all text-slate-400">Payload: {result.payload}</p>}
              {result.review_cue && <p className="text-amber-200">{result.review_cue}</p>}
            </div>
          ))}
          <p className="text-[10px] leading-relaxed text-slate-400">
            Decoding does not verify the recipient, URL destination, image authenticity, or payment settlement.
          </p>
          {handleOpenReviewMemo && (
            <button
              type="button"
              onClick={handleOpenReviewMemo}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 py-1.5 px-3 font-mono text-[11px] font-semibold text-black shadow-md shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-[0.98]"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-black" />
              <span>Open Internal Review Memo</span>
            </button>
          )}
        </motion.div>

        {/* Cross-Layer Synergy Banner */}
        {synergy.synergy_multiplier_applied && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"
          >
            <div className="flex items-center justify-between text-amber-300 font-medium">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span className="text-xs font-semibold">Multi-Signal Convergence</span>
              </div>
              <span className="rounded bg-amber-900/60 px-1.5 py-0.5 font-mono text-[9px] text-amber-200 border border-amber-700/50">
                {synergy.multiplier_factor}x BOOST
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/90 font-sans">
              {synergy.synergy_explanation}
            </p>
            {synergy.primary_forgery_locus && (
              <button
                onClick={() => {
                  onSelectLocus(synergy.primary_forgery_locus || null);
                  toast("Targeting Primary Forgery Locus");
                }}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-600/20 py-1 font-mono text-[10px] text-amber-200 hover:bg-amber-600/30 active:scale-[0.98]"
              >
                <Target className="h-3 w-3" />
                <span>Inspect Target Anomaly Region</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Stage 3 (120ms): 4-Layer Forensic Accordion Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              Forensic Analysis Layers
            </span>
            <span>{isAdvancedMode ? "Advanced Mode" : "Simple Mode"}</span>
          </div>

          {/* Layer 1: Physical Signals */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0E1526]/80 overflow-hidden hover:border-white/20 transition-colors">
            <button
              type="button"
              onClick={() => toggleLayer(1)}
              className="flex w-full items-center justify-between p-2.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                {openLayers[1] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className="font-medium text-slate-200 text-xs">
                  Layer 1: Compression & Noise Signals
                </span>
              </div>
              <span className="font-mono text-xs font-bold tabular-nums text-sky-400">
                {layer1.layer_score.toFixed(1)}
              </span>
            </button>
            {/* Color-coded 3px signal bar */}
            <div className="h-[3px] w-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${layer1.layer_score}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-sky-500"
              />
            </div>

            {openLayers[1] && (
              <div className="p-2.5 space-y-2 text-[11px] bg-[#0A0F1D]/50">
                {isAdvancedMode ? (
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-slate-300">
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">ELA CUE</span>
                      {layer1.ela_score.toFixed(1)}
                    </div>
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">WAVELET</span>
                      {layer1.wavelet_noise_score.toFixed(1)}
                    </div>
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">CLONES</span>
                      {layer1.clone_count}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 leading-snug">
                    {layer1.layer_score > 50
                      ? "Inconsistent compression noise found between text and background pixels."
                      : "Pixel compression and noise characteristics appear uniform."}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Layer 2: Geometry & Typography */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0E1526]/80 overflow-hidden hover:border-white/20 transition-colors">
            <button
              type="button"
              onClick={() => toggleLayer(2)}
              className="flex w-full items-center justify-between p-2.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                {openLayers[2] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className="font-medium text-slate-200 text-xs">
                  Layer 2: Typography & Alignment
                </span>
              </div>
              <span className="font-mono text-xs font-bold tabular-nums text-rose-400">
                {layer2.layer_score.toFixed(1)}
              </span>
            </button>
            <div className="h-[3px] w-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${layer2.layer_score}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-rose-500"
              />
            </div>

            {openLayers[2] && (
              <div className="p-2.5 space-y-2 text-[11px] bg-[#0A0F1D]/50">
                {isAdvancedMode ? (
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-slate-300">
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">DRIFT PX</span>
                      +{layer2.max_baseline_drift_px.toFixed(1)}px
                    </div>
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">COLOR ΔE</span>
                      {layer2.max_delta_e.toFixed(1)}
                    </div>
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">LASERS</span>
                      {layer2.lasers.length}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 leading-snug">
                    {layer2.max_baseline_drift_px > 2
                      ? `Font baseline drift of +${layer2.max_baseline_drift_px.toFixed(1)}px detected on payment fields.`
                      : "Text baselines and font rendering match native device geometry."}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Layer 3: Metadata & Protocol Rules */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0E1526]/80 overflow-hidden hover:border-white/20 transition-colors">
            <button
              type="button"
              onClick={() => toggleLayer(3)}
              className="flex w-full items-center justify-between p-2.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                {openLayers[3] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className="font-medium text-slate-200 text-xs">
                  Layer 3: Metadata & Protocol Rules
                </span>
              </div>
              <span className="font-mono text-xs font-bold tabular-nums text-purple-400">
                {layer3.layer_score.toFixed(1)}
              </span>
            </button>
            <div className="h-[3px] w-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${layer3.layer_score}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-purple-500"
              />
            </div>

            {openLayers[3] && (
              <div className="p-2.5 space-y-2 text-[11px] bg-[#0A0F1D]/50">
                {isAdvancedMode ? (
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-slate-300">
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">ASPECT</span>
                      {layer3.viewport_aspect_ratio.split(" ")[0]}
                    </div>
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">CLOCK</span>
                      {layer3.clock_paradox_detected ? "PARADOX" : "OK"}
                    </div>
                    <div className="rounded bg-black/40 p-1 border border-white/5">
                      <span className="block text-[8px] text-slate-500">UTR SYNTAX</span>
                      {layer3.upi_utr_valid == null
                        ? "N/A"
                        : layer3.upi_utr_valid
                        ? "VALID"
                        : "INVALID"}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 leading-snug">
                    {layer3.clock_paradox_detected
                      ? "Clock paradox detected: Transaction time contradicts status bar timestamp."
                      : "Image dimensions and timestamps align with mobile viewport specs."}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Layer 4: Semantic VLM & Synergy */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0E1526]/80 overflow-hidden hover:border-white/20 transition-colors">
            <button
              type="button"
              onClick={() => toggleLayer(4)}
              className="flex w-full items-center justify-between p-2.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                {openLayers[4] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className="font-medium text-slate-200 text-xs">
                  Layer 4: Heuristics & Synergy
                </span>
              </div>
              <span className="font-mono text-xs font-bold tabular-nums text-amber-400">
                {layer4.layer_score.toFixed(1)}
              </span>
            </button>
            <div className="h-[3px] w-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${layer4.layer_score}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-amber-500"
              />
            </div>

            {openLayers[4] && (
              <div className="p-2.5 space-y-2 text-[11px] bg-[#0A0F1D]/50">
                <p className="text-slate-300 leading-snug">
                  {synergy.synergy_multiplier_applied
                    ? "Candidate regions from the image-feature and text-like geometry checks overlap. This can occur without editing."
                    : "No cross-layer geometric spatial overlap detected."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Filterable Evidence Findings Log */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Evidence Log ({findings.length})
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#070B14] p-0.5 text-[9px] font-mono">
              <button
                onClick={() => setSeverityFilter("ALL")}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  severityFilter === "ALL" ? "bg-white/10 text-white" : "text-slate-500"
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setSeverityFilter("CRITICAL")}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  severityFilter === "CRITICAL"
                    ? "bg-rose-950 text-rose-300 border border-rose-800/40"
                    : "text-slate-500"
                }`}
              >
                CRIT
              </button>
              <button
                onClick={() => setSeverityFilter("HIGH")}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  severityFilter === "HIGH"
                    ? "bg-amber-950 text-amber-300 border border-amber-800/40"
                    : "text-slate-500"
                }`}
              >
                HIGH
              </button>
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#0E1526]/60 p-3 text-center font-mono text-[11px] text-slate-500">
              No evidence findings in this category.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFindings.map((f) => {
                const isCritical = f.severity === "CRITICAL";
                const isHigh = f.severity === "HIGH";
                const isSelected =
                  selectedLocus &&
                  f.bounding_box &&
                  selectedLocus.x === f.bounding_box.x &&
                  selectedLocus.y === f.bounding_box.y;

                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      onSelectLocus(f.bounding_box || null);
                      toast(`Locus Focused: ${f.title}`);
                    }}
                    className={`cursor-pointer rounded-xl border p-2.5 transition-all active:scale-[0.98] ${
                      isSelected
                        ? "border-sky-400 bg-sky-950/30 ring-1 ring-sky-400/50"
                        : isCritical
                        ? "border-rose-500/30 bg-rose-950/20 hover:border-rose-500/50"
                        : isHigh
                        ? "border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50"
                        : "border-white/[0.08] bg-[#0E1526]/70 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-200 truncate max-w-[200px]">
                        {f.title}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                          isCritical
                            ? "bg-rose-950 text-rose-300 border border-rose-800/50"
                            : isHigh
                            ? "bg-amber-950 text-amber-300 border border-amber-800/50"
                            : "bg-sky-950 text-sky-300 border border-sky-800/50"
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>

                    <p className="text-[11px] leading-snug text-slate-400 font-sans">
                      {f.description}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <span>Layer {f.layer}</span>
                      <span className="text-sky-400">
                        {f.metric_name}: {f.metric_value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Cryptographic Custody Metadata Card */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0E1526]/70 p-3 space-y-1.5 font-mono text-[11px]">
          <div className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
            Cryptographic Custody
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="truncate max-w-[220px]" title={file_sha256}>
              SHA-256: {file_sha256.slice(0, 16)}...
            </span>
            <button
              onClick={() => copyText(file_sha256, "SHA-256 Hash")}
              className="p-1 rounded text-sky-400 hover:text-sky-300 hover:bg-white/[0.06] active:scale-[0.95]"
              title="Copy complete SHA-256 hash"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>
              Dim: {image_width} × {image_height}
            </span>
            <span>Ratio: {layer3.viewport_aspect_ratio.split(" ")[0]}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
