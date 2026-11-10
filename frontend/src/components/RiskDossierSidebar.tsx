import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
  Fingerprint,
  Smartphone,
  Clock,
  Key,
  ShieldCheck,
  Zap,
  Target,
} from "lucide-react";
import { ForensicAnalysisReport, BoundingBox } from "../types/forensic";

interface RiskDossierSidebarProps {
  report: ForensicAnalysisReport | null;
  selectedLocus: BoundingBox | null;
  onSelectLocus: (box: BoundingBox | null) => void;
}

export const RiskDossierSidebar: React.FC<RiskDossierSidebarProps> = ({
  report,
  selectedLocus,
  onSelectLocus,
}) => {
  if (!report) {
    return (
      <div className="flex min-h-32 w-full flex-col items-center justify-center border-t border-[#1e293b] bg-[#0b1120] p-4 text-[#64748b] md:min-h-0 md:w-96 md:border-l md:border-t-0">
        <Layers className="w-8 h-8 mb-2 stroke-[1.5]" />
        <span className="text-xs font-mono">NO EVIDENCE DOSSIER LOADED</span>
      </div>
    );
  }

  const {
    overall_tamper_score,
    confidence_score,
    verdict,
    file_sha256,
    image_width,
    image_height,
    channel_detected,
    layer1,
    layer2,
    layer3,
    layer4,
    synergy,
    findings,
  } = report;

  const isAuthentic = verdict === "LIKELY_AUTHENTIC" || verdict === "AUTHENTIC_VERIFIED";
  const isSuspicious = verdict === "SUSPICIOUS_ANOMALIES";
  const isManipulated = verdict === "MANIPULATED_FORGERY";

  // Circular gauge calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (overall_tamper_score / 100) * circumference;

  const gaugeColor = isAuthentic
    ? "#10b981"
    : isSuspicious
      ? "#f59e0b"
      : "#f43f5e";

  const copyHash = () => {
    navigator.clipboard.writeText(file_sha256);
  };

  return (
    <aside className="flex w-full flex-col border-t border-[#1e293b] bg-[#0b1120] text-xs select-text md:h-full md:w-96 md:shrink-0 md:overflow-hidden md:border-l md:border-t-0">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#070b14]/50">
        <div className="flex items-center space-x-2">
          <Fingerprint className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-[#f1f5f9] tracking-wide uppercase">
            Forensic Risk Dossier
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#64748b] bg-[#1e293b] px-1.5 py-0.5 rounded">
          CHAIN-OF-CUSTODY
        </span>
      </div>

      {/* Scrollable Dossier Content */}
      <div className="space-y-4 p-3 md:flex-1 md:overflow-y-auto md:p-4">
        {/* 1. Master Gauge & Verdict Card */}
        <div className="bg-[#070b14] border border-[#1e293b] rounded-xl p-4 flex flex-col items-center relative overflow-hidden shadow-lg">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-[#1e293b]"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={gaugeColor}
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono text-[#f1f5f9]">
                {overall_tamper_score.toFixed(1)}%
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8]">
                Anomaly score
              </span>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="mt-3 flex flex-col items-center w-full">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider flex items-center space-x-1.5 ${
                isAuthentic
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-600"
                  : isSuspicious
                    ? "bg-amber-950/80 text-amber-400 border border-amber-600"
                    : "bg-rose-950/80 text-rose-400 border border-rose-600"
              }`}
            >
              {isAuthentic ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isSuspicious ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{verdict.replace(/_/g, " ")}</span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-[#64748b] mt-1.5">
              <span>Assessment confidence: {confidence_score.toFixed(1)}%</span>
              <span>•</span>
              <span className="truncate max-w-[180px]">{channel_detected}</span>
            </div>
          </div>
        </div>

        {/* 2. Cross-Layer Spatial IoU Synergy Banner */}
        {synergy.synergy_multiplier_applied && (
          <div className="bg-amber-950/30 border border-amber-500/60 rounded-xl p-3 shadow-md shadow-amber-500/10">
            <div className="flex items-center justify-between text-amber-400 font-semibold mb-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Overlapping image indicators</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 font-mono text-[10px]">
                REGION OVERLAP
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              {synergy.synergy_explanation}
            </p>
            {synergy.primary_forgery_locus && (
              <button
                onClick={() =>
                  onSelectLocus(synergy.primary_forgery_locus || null)
                }
                className="mt-2 w-full py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 rounded font-mono text-[10px] flex items-center justify-center space-x-1.5 border border-amber-500/40"
              >
                <Target className="w-3 h-3" />
                <span>Inspect overlapping indicators</span>
              </button>
            )}
          </div>
        )}

        {/* 3. 4-Layer Forensic Scores Breakdown */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-[#64748b] tracking-wider uppercase font-semibold">
            Forensic checks (heuristic)
          </span>

          {/* Layer 1: Physical Signal */}
          <div className="bg-[#070b14] border border-[#1e293b] rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f1f5f9]">
                Layer 1: Physical & Noise Signals
              </span>
              <span className="font-mono text-xs font-bold text-sky-400">
                {layer1.layer_score.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-700"
                style={{ width: `${layer1.layer_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748b] font-mono pt-0.5">
              <span>ELA: {layer1.ela_score.toFixed(1)}%</span>
              <span>Wavelet: {layer1.wavelet_noise_score.toFixed(1)}%</span>
              <span>Clones: {layer1.clone_count}</span>
            </div>
          </div>

          {/* Layer 2: Typographic Geometry & OCR */}
          <div className="bg-[#070b14] border border-[#1e293b] rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f1f5f9]">
                Layer 2: Typography & Geometry
              </span>
              <span className="font-mono text-xs font-bold text-rose-400">
                {layer2.layer_score.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${layer2.layer_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748b] font-mono pt-0.5">
              <span>Drift: +{layer2.max_baseline_drift_px.toFixed(1)}px</span>
              <span>ΔE: {layer2.max_delta_e.toFixed(1)}</span>
              <span>Lasers: {layer2.lasers.length}</span>
            </div>
          </div>

          {/* Layer 3: Metadata & Protocol Rules */}
          <div className="bg-[#070b14] border border-[#1e293b] rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f1f5f9]">
                Layer 3: Metadata & Protocol Rules
              </span>
              <span className="font-mono text-xs font-bold text-purple-400">
                {layer3.layer_score.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${layer3.layer_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748b] font-mono pt-0.5">
              <span>Ratio: {layer3.viewport_aspect_ratio.split(" ")[0]}</span>
              <span>
                Clock Drift: {layer3.clock_paradox_detected ? "PARADOX" : "OK"}
              </span>
              <span>
                Reference: {layer3.upi_utr_valid == null ? "UNAVAILABLE" : layer3.upi_utr_valid ? "FORMAT OK" : "REVIEW"}
              </span>
            </div>
          </div>

          {/* Layer 4: Semantic VLM & Synergy */}
          <div className="bg-[#070b14] border border-[#1e293b] rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f1f5f9]">
                Layer 4: Heuristic Review
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                {layer4.layer_score.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${layer4.layer_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748b] font-mono pt-0.5">
              <span>
                Overlap:{" "}
                {synergy.synergy_multiplier_applied ? "ACTIVE" : "NONE"}
              </span>
              <span>
                Vision model: {layer4.vlm_used ? layer4.vlm_provider : "NOT USED"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Structured Forensic Findings Feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#64748b] tracking-wider uppercase font-semibold">
              Forensic Evidence Log ({findings.length})
            </span>
          </div>

          {findings.length === 0 ? (
            <div className="p-3 bg-[#070b14] border border-[#1e293b] rounded-lg text-center text-[#64748b] font-mono text-[11px]">
              No strong manipulation indicators were detected. This heuristic result does not prove the image’s origin or that a payment occurred.
            </div>
          ) : (
            <div className="space-y-2">
              {findings.map((f) => {
                const isCritical = f.severity === "CRITICAL";
                const isHigh = f.severity === "HIGH";

                return (
                  <div
                    key={f.id}
                    onClick={() => onSelectLocus(f.bounding_box || null)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isCritical
                        ? "bg-rose-950/20 border-rose-800/80 hover:bg-rose-950/30"
                        : isHigh
                          ? "bg-amber-950/20 border-amber-800/80 hover:bg-amber-950/30"
                          : "bg-[#070b14] border-[#1e293b] hover:bg-[#1e293b]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-[#f1f5f9] truncate max-w-[200px]">
                        {f.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isCritical
                            ? "bg-rose-900 text-rose-200"
                            : isHigh
                              ? "bg-amber-900 text-amber-200"
                              : "bg-sky-900 text-sky-200"
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#94a3b8] leading-snug line-clamp-2">
                      {f.description}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                      <span>Layer {f.layer}</span>
                      <span className="text-[#38bdf8]">
                        {f.metric_name}: {f.metric_value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Cryptographic Evidence Metadata */}
        <div className="bg-[#070b14] border border-[#1e293b] rounded-lg p-3 space-y-1.5 text-[11px] font-mono">
          <div className="text-[10px] text-[#64748b] uppercase font-semibold">
            Cryptographic Checksum & Dimensions
          </div>
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="truncate max-w-[220px]" title={file_sha256}>
              SHA-256: {file_sha256.slice(0, 16)}...
            </span>
            <button
              onClick={copyHash}
              className="text-sky-400 hover:text-sky-300 p-0.5"
              title="Copy full SHA-256 hash"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[#64748b]">
            <span>
              Dimensions: {image_width} x {image_height}
            </span>
            <span>Viewport: {layer3.viewport_aspect_ratio.split(" ")[0]}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
