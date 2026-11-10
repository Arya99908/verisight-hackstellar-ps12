import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  Fingerprint,
  Target,
  Info,
} from "lucide-react";
import { verdictLabel } from "../services/verdictLabel";
import { ForensicAnalysisReport, BoundingBox } from "../types/forensic";

interface RiskDossierSidebarProps {
  report: ForensicAnalysisReport | null;
  selectedLocus: BoundingBox | null;
  onSelectLocus: (box: BoundingBox | null) => void;
}

function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-900 text-red-200 border border-red-700";
    case "HIGH":
      return "bg-orange-900 text-orange-200 border border-orange-700";
    case "MEDIUM":
      return "bg-amber-900 text-amber-200 border border-amber-700";
    case "LOW":
      return "bg-yellow-900 text-yellow-200 border border-yellow-700";
    case "INFO":
      return "bg-blue-900 text-blue-200 border border-blue-700";
    default:
      return "bg-sky-900 text-sky-200 border border-sky-700";
  }
}

function getLayerBadgeClass(layer: number): string {
  switch (layer) {
    case 1:
      return "bg-sky-950 text-sky-300 border border-sky-700";
    case 2:
      return "bg-rose-950 text-rose-300 border border-rose-700";
    case 3:
      return "bg-purple-950 text-purple-300 border border-purple-700";
    case 4:
      return "bg-amber-950 text-amber-300 border border-amber-700";
    default:
      return "bg-[#1e293b] text-[#94a3b8]";
  }
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

  const isReviewRequired = verdict !== "INCONCLUSIVE";

  // Circular gauge calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (overall_tamper_score / 100) * circumference;

  const gaugeColor = isReviewRequired ? "#f43f5e" : "#22c55e";

  const copyHash = () => {
    navigator.clipboard.writeText(file_sha256);
  };

  // Analysis summary values are heuristic measurements, never authenticity probabilities.
  const elaScore = layer1.ela_score;
  const noiseScore = layer1.wavelet_noise_score;
  const cloneCount = layer1.clone_count;
  const qrDecoded = layer3.details?.qr_inspection?.decoded_count ?? 0;
  const clockParadox = layer3.clock_paradox_detected;
  const textRulesAvailable = layer2.details?.ocr_mode !== "OFFLINE_COMPONENTS_ONLY";

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
                {overall_tamper_score.toFixed(1)}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8]">
                Heuristic score · not a probability
              </span>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="mt-3 flex flex-col items-center w-full">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider flex items-center space-x-1.5 ${
                isReviewRequired
                  ? "bg-rose-950/80 text-rose-300 border border-rose-700"
                  : "bg-emerald-950/80 text-emerald-300 border border-emerald-700"
              }`}
            >
              {isReviewRequired ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{verdictLabel(verdict)}</span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-[#64748b] mt-1.5">
              <span className="truncate max-w-[180px]">Image cue: {channel_detected}</span>
            </div>
            <p className="mt-2 max-w-sm text-center text-[10px] leading-relaxed text-[#94a3b8]">
              This is a heuristic triage label, not a calibrated probability. A low signal score does not prove the image is genuine; payment status is not checked.
            </p>
          </div>
        </div>

        {/* 2. Cross-Layer Spatial IoU Synergy Banner */}
        {synergy.region_overlap_found && (
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
            {synergy.primary_review_locus && (
              <button
                onClick={() =>
                  onSelectLocus(synergy.primary_review_locus || null)
                }
                className="mt-2 w-full py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 rounded font-mono text-[10px] flex items-center justify-center space-x-1.5 border border-amber-500/40"
              >
                <Target className="w-3 h-3" />
                <span>Inspect overlapping indicators</span>
              </button>
            )}
          </div>
        )}

        {/* 3. Analysis Summary Section */}
        <div className="bg-[#070b14] border border-[#1e293b] rounded-xl p-3 space-y-2">
          <div className="flex items-center space-x-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-mono text-[#64748b] tracking-wider uppercase font-semibold">
              Analysis Summary
            </span>
          </div>
          <ul className="space-y-1.5 font-mono text-[11px]">
            <li className="flex items-start space-x-2">
              <span className="text-sky-400 shrink-0">•</span>
              <span>
                <span className="text-[#94a3b8]">ELA Score: </span>
                <span className="text-[#f1f5f9] font-semibold">
                  {elaScore.toFixed(1)}/100
                </span>
                <span className="text-[#64748b]"> — {layer1.details?.ela?.scoring_eligible === false ? "not used for scoring on this format" : "heuristic residual measurement; not a tamper probability"}</span>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400 shrink-0">•</span>
              <span>
                <span className="text-[#94a3b8]">Noise Analysis: </span>
                <span className="text-[#f1f5f9] font-semibold">
                  {noiseScore.toFixed(1)}/100
                </span>
                <span className="text-[#64748b]"> — heuristic residual measurement</span>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-pink-400 shrink-0">•</span>
              <span>
                <span className="text-[#94a3b8]">Copy-Move Detection: </span>
                <span
                  className={
                    cloneCount > 0
                      ? "text-rose-300 font-semibold"
                      : "text-emerald-300"
                  }
                >
                  {cloneCount > 0 ? `${cloneCount} matches` : "None detected"}
                </span>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 shrink-0">•</span>
              <span>
                <span className="text-[#94a3b8]">QR Code: </span>
                <span
                  className={
                    qrDecoded > 0 ? "text-purple-300" : "text-[#64748b]"
                  }
                >
                  {qrDecoded > 0
                    ? `Decoded ${qrDecoded}; content is not verified`
                    : "Not found"}
                </span>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-orange-400 shrink-0">•</span>
              <span>
                <span className="text-[#94a3b8]">Clock data: </span>
                <span
                  className={clockParadox ? "text-rose-300 font-semibold" : "text-[#94a3b8]"}
                >
                  {clockParadox ? "Metadata values conflict (unverified)" : textRulesAvailable ? "No rule mismatch observed" : "Image text not checked (OCR unavailable)"}
                </span>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 shrink-0">•</span>
              <span>
                <span className="text-[#94a3b8]">Image cue: </span>
                <span className="text-[#f1f5f9]">{channel_detected}</span>
              </span>
            </li>
          </ul>
        </div>

        {/* 4. 4-Layer Forensic Scores Breakdown */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-[#64748b] tracking-wider uppercase font-semibold">
            Forensic checks (heuristic)
          </span>

          {/* Layer 1: Image cues */}
          <div className="bg-[#070b14] border border-[#1e293b] rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f1f5f9]">
                Layer 1: Image & Residual Cues
              </span>
              <span className="font-mono text-xs font-bold text-sky-400">
                {layer1.layer_score.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-700"
                style={{ width: `${layer1.layer_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748b] font-mono pt-0.5">
              <span>ELA cue: {layer1.ela_score.toFixed(1)}</span>
              <span>Wavelet cue: {layer1.wavelet_noise_score.toFixed(1)}</span>
              <span>ORB candidate pairs: {layer1.clone_count}</span>
            </div>
          </div>

          {/* Layer 2: Typographic Geometry & OCR */}
          <div className="bg-[#070b14] border border-[#1e293b] rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f1f5f9]">
                Layer 2: Typography & Geometry
              </span>
              <span className="font-mono text-xs font-bold text-rose-400">
                {layer2.layer_score.toFixed(1)}
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
                {layer3.layer_score.toFixed(1)}
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
                Clock Drift:{" "}
                {layer3.clock_paradox_detected ? "PARADOX" : "OK"}
              </span>
              <span>
                Reference:{" "}
                {layer3.upi_utr_valid == null
                  ? "UNAVAILABLE"
                  : layer3.upi_utr_valid
                    ? "FORMAT OK"
                    : "REVIEW"}
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
                {layer4.layer_score.toFixed(1)}
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
                {synergy.region_overlap_found ? "FOUND" : "NONE"}
              </span>
              <span>
                Vision model:{" "}
                {layer4.vlm_used ? layer4.vlm_provider : "NOT USED"}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Structured Forensic Findings Feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#64748b] tracking-wider uppercase font-semibold">
              Forensic Evidence Log ({findings.length})
            </span>
          </div>

          {findings.length === 0 ? (
            <div className="p-3 bg-[#070b14] border border-[#1e293b] rounded-lg text-center text-[#64748b] font-mono text-[11px]">
              No strong manipulation indicators were detected. This heuristic
              result does not prove the image's origin or that a payment
              occurred.
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
                    {/* Title row with severity + layer badges */}
                    <div className="flex items-center justify-between mb-1 gap-1 flex-wrap">
                      <span className="font-semibold text-xs text-[#f1f5f9] truncate max-w-[160px]">
                        {f.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${getSeverityBadgeClass(
                            f.severity
                          )}`}
                        >
                          {f.severity}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${getLayerBadgeClass(
                            f.layer
                          )}`}
                        >
                          L{f.layer}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#94a3b8] leading-snug line-clamp-2">
                      {f.description}
                    </p>

                    {/* Metric name: metric_value */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[#64748b]">
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

        {/* 6. Cryptographic Evidence Metadata */}
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
