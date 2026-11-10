import React from "react";
import {
  X,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  Calendar,
  Layers,
  FileCheck,
} from "lucide-react";
import { ForensicAnalysisReport } from "../types/forensic";

interface ForensicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ForensicAnalysisReport | null;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!isOpen || !report) return null;

  const {
    file_sha256,
    filename,
    timestamp,
    image_width,
    image_height,
    overall_tamper_score,
    confidence_score,
    verdict,
    channel_detected,
    layer1,
    layer2,
    layer3,
    layer4,
    synergy,
    findings,
  } = report;

  const handlePrint = () => {
    window.print();
  };

  const caseId = `VS-CASE-${file_sha256.slice(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:max-h-full print:w-full print:bg-white print:text-black">
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="h-14 px-6 border-b border-[#1e293b] bg-[#070b14] flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-sky-400" />
            <span className="font-semibold text-sm text-[#f1f5f9]">
              Printable Forensic Audit Dossier
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-all flex items-center space-x-1.5 shadow-md shadow-sky-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#1e293b] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="flex-1 overflow-y-auto p-8 font-sans space-y-6 print:p-0 print:text-black print:overflow-visible">
          {/* Document Header */}
          <div className="border-b-2 border-[#1e293b] print:border-black pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-wider text-[#f1f5f9] print:text-black">
                  VERISIGHT FORENSIC AUDIT DOSSIER
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 print:border-black print:bg-gray-100 print:text-black">
                  OFFICIAL AUDIT REPORT
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] print:text-gray-600 mt-1">
                Multi-Layer Digital Screenshot Verification & Splicing
                Investigation Platform
              </p>
            </div>
            <div className="text-right font-mono text-[11px] text-[#94a3b8] print:text-gray-700 space-y-0.5">
              <div>
                <strong className="text-[#f1f5f9] print:text-black">
                  Case Reference:
                </strong>{" "}
                {caseId}
              </div>
              <div>
                <strong className="text-[#f1f5f9] print:text-black">
                  Timestamp:
                </strong>{" "}
                {timestamp}
              </div>
              <div>
                <strong className="text-[#f1f5f9] print:text-black">
                  Standard:
                </strong>{" "}
                ISO/IEC 27037 Digital Evidence
              </div>
            </div>
          </div>

          {/* Section 1: Executive Verdict & SHA-256 Integrity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#1e293b] print:border-gray-300 bg-[#070b14] print:bg-gray-50 space-y-2">
              <span className="text-[10px] font-mono text-[#64748b] print:text-gray-500 uppercase tracking-wider">
                Investigative Determination
              </span>
              <div className="text-xl font-bold font-mono tracking-wide">
                <span
                  className={
                    verdict === "AUTHENTIC_VERIFIED"
                      ? "text-emerald-400 print:text-emerald-700"
                      : verdict === "SUSPICIOUS_ANOMALIES"
                        ? "text-amber-400 print:text-amber-700"
                        : "text-rose-400 print:text-rose-700"
                  }
                >
                  {verdict.replace(/_/g, " ")}
                </span>
              </div>
              <div className="text-xs text-[#94a3b8] print:text-gray-700">
                Overall Tamper Score:{" "}
                <strong>{overall_tamper_score.toFixed(1)}%</strong> | Calibrated
                Confidence: <strong>{confidence_score.toFixed(1)}%</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#1e293b] print:border-gray-300 bg-[#070b14] print:bg-gray-50 space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-[#64748b] print:text-gray-500 uppercase tracking-wider block">
                Evidence Custody Hashes
              </span>
              <div
                className="truncate text-[#94a3b8] print:text-gray-700"
                title={file_sha256}
              >
                SHA-256: <strong>{file_sha256}</strong>
              </div>
              <div className="text-[#94a3b8] print:text-gray-700">
                Filename: <strong>{filename || "screenshot.png"}</strong>
              </div>
              <div className="text-[#94a3b8] print:text-gray-700">
                Dimensions:{" "}
                <strong>
                  {image_width} x {image_height}
                </strong>{" "}
                ({layer3.viewport_aspect_ratio})
              </div>
              <div className="text-[#94a3b8] print:text-gray-700">
                Inferred Carrier: <strong>{channel_detected}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: 4-Layer Evidentiary Matrix */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-[#94a3b8] print:text-gray-700">
              4-Layer Forensic Measurement Breakdown
            </h4>
            <div className="border border-[#1e293b] print:border-gray-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070b14] print:bg-gray-200 border-b border-[#1e293b] print:border-gray-300 text-[#64748b] print:text-black">
                  <tr>
                    <th className="p-2.5">Layer</th>
                    <th className="p-2.5">Forensic Domain</th>
                    <th className="p-2.5">Key Deterministic Metrics</th>
                    <th className="p-2.5 text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b] print:divide-gray-300 text-[#94a3b8] print:text-gray-800">
                  <tr>
                    <td className="p-2.5 font-bold text-sky-400 print:text-black">
                      L1
                    </td>
                    <td className="p-2.5 text-[#f1f5f9] print:text-black font-semibold">
                      Physical Signal & Wavelet Noise
                    </td>
                    <td className="p-2.5">
                      ELA Score: {layer1.ela_score.toFixed(1)}% | Wavelet db4
                      Noise: {layer1.wavelet_noise_score.toFixed(1)}% | Clones:{" "}
                      {layer1.clone_count}
                    </td>
                    <td className="p-2.5 text-right font-bold text-sky-400 print:text-black">
                      {layer1.layer_score.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-rose-400 print:text-black">
                      L2
                    </td>
                    <td className="p-2.5 text-[#f1f5f9] print:text-black font-semibold">
                      Typography & Geometry
                    </td>
                    <td className="p-2.5">
                      Max Laser Drift: +
                      {layer2.max_baseline_drift_px.toFixed(1)}px | CIELAB ΔE:{" "}
                      {layer2.max_delta_e.toFixed(1)} | Rows Audited:{" "}
                      {layer2.lasers.length}
                    </td>
                    <td className="p-2.5 text-right font-bold text-rose-400 print:text-black">
                      {layer2.layer_score.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-purple-400 print:text-black">
                      L3
                    </td>
                    <td className="p-2.5 text-[#f1f5f9] print:text-black font-semibold">
                      Metadata & Protocol Rules
                    </td>
                    <td className="p-2.5">
                      Viewport Match:{" "}
                      {layer3.is_non_native_viewport ? "Non-Native" : "Native"}{" "}
                      | Temporal Paradox:{" "}
                      {layer3.clock_paradox_detected ? "DRIFT DETECTED" : "OK"}{" "}
                      | UPI UTR:{" "}
                      {layer3.upi_utr_valid === false ? "INVALID" : "VALID"}
                    </td>
                    <td className="p-2.5 text-right font-bold text-purple-400 print:text-black">
                      {layer3.layer_score.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400 print:text-black">
                      L4
                    </td>
                    <td className="p-2.5 text-[#f1f5f9] print:text-black font-semibold">
                      Spatial Ensemble Synergy
                    </td>
                    <td className="p-2.5">
                      Multiplier:{" "}
                      {synergy.synergy_multiplier_applied
                        ? `Active (x${synergy.multiplier_factor})`
                        : "1.0x (No Spatial Overlap)"}
                    </td>
                    <td className="p-2.5 text-right font-bold text-amber-400 print:text-black">
                      {layer4.layer_score.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Itemized Findings Log */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-[#94a3b8] print:text-gray-700">
              Itemized Evidence Log ({findings.length} findings)
            </h4>
            <div className="space-y-2">
              {findings.map((f, idx) => (
                <div
                  key={`finding-${idx}`}
                  className="p-3 rounded-lg border border-[#1e293b] print:border-gray-300 bg-[#070b14] print:bg-white text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#f1f5f9] print:text-black">
                      {idx + 1}. {f.title}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1e293b] print:bg-gray-200 text-sky-400 print:text-black">
                      {f.severity} // L{f.layer}
                    </span>
                  </div>
                  <p className="text-[#94a3b8] print:text-gray-700">
                    {f.description}
                  </p>
                  <div className="font-mono text-[10px] text-[#64748b] print:text-gray-500">
                    Metric: {f.metric_name} = {f.metric_value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Legal & Scientific Disclaimer */}
          <div className="p-3.5 rounded-xl border border-[#1e293b] print:border-gray-300 bg-[#070b14] print:bg-gray-100 text-[11px] text-[#64748b] print:text-gray-600 leading-relaxed">
            <strong>Scientific & Evidentiary Disclaimer:</strong> VeriSight
            produces deterministic, mathematically reproducible forensic
            indicators across pixel signal distributions, sub-pixel typography
            alignment, and metadata consistency. However, digital image analysis
            alone cannot definitively confirm or deny whether a financial
            transaction occurred on the banking settlement network. This dossier
            constitutes technical investigative assistance and should be
            cross-referenced with bank core ledger records.
          </div>
        </div>
      </div>
    </div>
  );
};
