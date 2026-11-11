import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  ShieldAlert,
  AlertTriangle,
  Building,
  CreditCard,
  Hash,
} from "lucide-react";
import { ForensicAnalysisReport } from "../types/forensic";

interface InternalReviewMemoModalProps {
  report: ForensicAnalysisReport;
  onClose: () => void;
}

export const InternalReviewMemoModal: React.FC<InternalReviewMemoModalProps> = ({
  report,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const qrInspection = (report.layer3.details?.qr_inspection || {}) as {
    results?: Array<{
      kind?: string;
      payee_vpa?: string;
      payee_name?: string;
      amount?: string;
      currency?: string;
      reference?: string;
    }>;
  };
  const qrResults = Array.isArray(qrInspection.results) ? qrInspection.results : [];
  const upiIntent = qrResults.find((item) => item.kind === "UPI_PAYMENT_INTENT");
  const signalTier =
    report.verdict === "CORROBORATED_ANOMALIES"
      ? "Overlapping heuristic cues"
      : report.verdict === "REVIEW_REQUIRED"
        ? "Review cues present"
        : "No strong configured cue";
  const findingLines = (report.findings || []).slice(0, 12).map(
    (finding) => `- [${finding.severity}] ${finding.title}: ${finding.description}`,
  );
  const memoText = [
    "VERISIGHT — INTERNAL IMAGE REVIEW MEMO (DRAFT)",
    "NOT A LEGAL NOTICE. NOT A CERTIFIED FORENSIC REPORT.",
    "This heuristic screenshot review does not prove image authenticity or payment settlement.",
    "",
    `File: ${report.filename || "Unknown filename"}`,
    `Analyzed: ${report.timestamp || "Not available"}`,
    `Image dimensions: ${report.image_width} × ${report.image_height}`,
    `File SHA-256: ${report.file_sha256 || "Not available"}`,
    `Heuristic points: ${Number.isFinite(report.overall_tamper_score) ? report.overall_tamper_score.toFixed(1) : "Not available"} (not a probability)`,
    `Internal heuristic state: ${signalTier}`,
    `Readable QR payloads: ${qrResults.length}`,
    "Calibrated confidence: unavailable",
    "Payment provider or bank queried: no",
    "",
    "Rule-generated finding descriptions:",
    ...(findingLines.length ? findingLines : ["- No finding descriptions were returned."]),
    "",
    "Human follow-up: inspect the original source image and independently verify any transaction with the payment provider or bank.",
    "Reviewer notes:",
    "",
  ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(memoText);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([memoText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VERISIGHT_INTERNAL_REVIEW_MEMO_${(report.file_sha256 || "unknown").substring(0, 10).toUpperCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.opener = null;
    printWindow.document.write("<!doctype html><html><head><meta charset='utf-8'><title>VeriSight Internal Review Memo Draft</title><style>body{font-family:monospace;padding:40px;color:#111;line-height:1.5;font-size:13px}pre{white-space:pre-wrap;overflow-wrap:anywhere}@page{margin:20mm}</style></head><body></body></html>");
    printWindow.document.close();
    const pre = printWindow.document.createElement("pre");
    pre.textContent = memoText;
    printWindow.document.body.appendChild(pre);
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 150);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="review-memo-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0b1120] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#f1f5f9]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#070b14]/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="review-memo-title" className="text-base font-bold tracking-tight text-[#f1f5f9]">
                  Internal Review Memo Draft
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                  NOT A LEGAL NOTICE
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Human-review summary of heuristic image cues; no bank or payment provider is queried
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close internal review memo"
            className="p-2 rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intelligence Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-[#070b14]/50 border-b border-[#1e293b] text-xs">
          <div className="bg-[#0b1120] p-2.5 rounded-lg border border-[#1e293b]">
            <div className="flex items-center space-x-1.5 text-[#94a3b8] mb-1 font-mono text-[10px]">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>QR PAYLOAD VPA</span>
            </div>
            <div className="font-mono font-medium text-white truncate" title={upiIntent?.payee_vpa || "Not decoded"}>
              {upiIntent?.payee_vpa || "N/A"}
            </div>
          </div>

          <div className="bg-[#0b1120] p-2.5 rounded-lg border border-[#1e293b]">
            <div className="flex items-center space-x-1.5 text-[#94a3b8] mb-1 font-mono text-[10px]">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              <span>QR PAYLOAD NAME</span>
            </div>
            <div className="font-medium text-white truncate" title={upiIntent?.payee_name || "Not decoded"}>
              {upiIntent?.payee_name || "N/A"}
            </div>
          </div>

          <div className="bg-[#0b1120] p-2.5 rounded-lg border border-[#1e293b]">
            <div className="flex items-center space-x-1.5 text-[#94a3b8] mb-1 font-mono text-[10px]">
              <Hash className="w-3.5 h-3.5 text-emerald-400" />
              <span>AMOUNT STRING</span>
            </div>
            <div className="font-mono font-medium text-white truncate">
              {upiIntent?.amount ? `${upiIntent.amount} ${upiIntent.currency || ""}` : "N/A"}
            </div>
          </div>

          <div className="bg-[#0b1120] p-2.5 rounded-lg border border-[#1e293b]">
            <div className="flex items-center space-x-1.5 text-[#94a3b8] mb-1 font-mono text-[10px]">
              <Hash className="w-3.5 h-3.5 text-emerald-400" />
              <span>REFERENCE STRING</span>
            </div>
            <div className="font-semibold text-rose-300 truncate">
              {upiIntent?.reference || report.layer3.upi_utr_value || "N/A"}
            </div>
          </div>
        </div>

        {/* Notice Content */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed bg-[#070b14]/70">
          <div className="relative p-5 rounded-xl bg-[#070b14] border border-[#1e293b] shadow-inner">
            <pre className="text-[#cbd5e1] whitespace-pre-wrap select-all font-mono">
              {memoText}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#1e293b] bg-[#070b14]/90">
          <div className="flex items-center space-x-2 text-xs text-[#94a3b8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>File SHA-256 (not proof of authenticity): <code className="text-[#f1f5f9] font-mono">{(report.file_sha256 || "Not available").substring(0, 16)}...</code></span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#1e293b] hover:bg-[#334155] text-white transition-colors border border-[#334155]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy Memo"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#1e293b] hover:bg-[#334155] text-white transition-colors border border-[#334155]"
            >
              <Download className="w-4 h-4" />
              <span>Download Draft</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20 transition-all"
            >
              <Printer className="w-4 h-4 text-black" />
              <span>Print Memo</span>
            </button>
          </div>
        </div>
        {copyFailed && (
          <p role="status" className="border-t border-rose-900 bg-rose-950/40 px-6 py-2 text-xs text-rose-200">
            Clipboard access was blocked. You can select and copy the memo text above.
          </p>
        )}
      </div>
    </div>
  );
};
