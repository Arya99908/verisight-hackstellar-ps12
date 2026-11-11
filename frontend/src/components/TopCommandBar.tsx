import React, { useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Upload,
  Share2,
  QrCode,
  FileText,
  Loader2,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { DemoSampleMeta } from "../types/forensic";

interface TopCommandBarProps {
  databaseStatus: "CHECKING" | "HEALTHY" | "UNAVAILABLE" | "NOT_CONFIGURED";
  demoSamples: DemoSampleMeta[];
  selectedSampleId: string | null;
  onSelectSample: (sampleId: string) => void;
  onFileUpload: (file: File) => void;
  onOpenWhatsAppModal: () => void;
  onOpenMobileModal: () => void;
  onOpenReportModal: () => void;
  onOpenSection91Modal?: () => void;
  isLoading: boolean;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  databaseStatus,
  demoSamples,
  selectedSampleId,
  onSelectSample,
  onFileUpload,
  onOpenWhatsAppModal,
  onOpenMobileModal,
  onOpenReportModal,
  onOpenSection91Modal,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onFileUpload(file);
  };

  return (
    <header className="relative z-20 flex w-full flex-col gap-2 border-b border-[#1e293b] bg-[#070b14]/95 px-2 py-2 backdrop-blur sm:px-4 md:h-16 md:flex-row md:items-center md:justify-between md:gap-3 md:py-0">
      {/* Brand & System Indicator */}
      <div className="flex min-w-0 items-center space-x-2 md:min-w-[230px] md:space-x-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-wider text-base bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              VERISIGHT
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-semibold tracking-wider">
              PRO-v1.0
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-[#64748b]">
            <span className={`w-1.5 h-1.5 rounded-full ${databaseStatus === "HEALTHY" ? "bg-emerald-500 animate-pulse" : databaseStatus === "CHECKING" ? "bg-amber-400 animate-pulse" : "bg-rose-500"}`} />
            <span className="font-mono">4-LAYER CORE · DB {databaseStatus}</span>
          </div>
        </div>
      </div>

      {/* Golden Demo Sample Selector Pills */}
      <div className="flex w-full max-w-full items-center space-x-1.5 overflow-x-auto rounded-lg border border-[#1e293b] bg-[#0b1120] p-1 md:max-w-[580px] md:flex-1">
        {demoSamples.map((sample, idx) => {
          const isSelected = selectedSampleId === sample.id;
          const isAuthentic = sample.id === "sample_1";
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              disabled={isLoading}
              title={`${sample.title}: ${sample.scenario}`}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                isSelected
                  ? isAuthentic
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-sm shadow-emerald-500/20"
                    : "bg-rose-950 text-rose-300 border border-rose-600 shadow-sm shadow-rose-500/20"
                  : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
              }`}
            >
              <span>{`S${idx + 1}`}</span>
              <span className="hidden sm:inline font-mono">
                {sample.id === "sample_1" && "Clean Synthetic"}
                {sample.id === "sample_2" && "Spliced ₹95k"}
                {sample.id === "sample_3" && "Clock Paradox"}
                {sample.id === "sample_4" && "WhatsApp Recomp"}
                {sample.id === "sample_5" && "ORB Clones"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Commands */}
      <div className="flex w-full items-center gap-1.5 overflow-x-auto md:w-auto md:justify-end md:gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp,image/bmp,.png,.jpg,.jpeg,.webp,.bmp"
          className="hidden"
        />

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="shrink-0 whitespace-nowrap rounded-md border border-[#334155] bg-[#1e293b] px-3 py-2 text-xs font-medium text-[#f1f5f9] transition-all hover:bg-[#334155] flex items-center space-x-1.5"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span>Upload Screenshot</span>
        </button>

        {/* Simulate WhatsApp Button */}
        <button
          onClick={onOpenWhatsAppModal}
          disabled={isLoading}
          className="shrink-0 whitespace-nowrap rounded-md border border-emerald-900/60 bg-[#0f172a] px-3 py-2 text-xs font-medium text-emerald-400 transition-all hover:bg-[#1e293b] hover:text-emerald-300 flex items-center space-x-1.5"
          title="Simulate WhatsApp compression laundering"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Simulate WhatsApp</span>
        </button>

        {/* Stage Judge Mobile QR Sync Button */}
        <button
          onClick={onOpenMobileModal}
          disabled={isLoading}
          className="shrink-0 whitespace-nowrap rounded-md border border-amber-900/60 bg-[#0f172a] px-3 py-2 text-xs font-medium text-amber-400 transition-all hover:bg-[#1e293b] hover:text-amber-300 flex items-center space-x-1.5"
          title="Scan QR to live-upload from phone camera"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Judge Mobile QR</span>
        </button>

        {/* Section 91 Cyber Subpoena Button */}
        {onOpenSection91Modal && (
          <button
            onClick={onOpenSection91Modal}
            disabled={isLoading}
            className="shrink-0 whitespace-nowrap rounded-md border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-xs font-medium text-amber-300 transition-all hover:bg-amber-900/50 hover:text-amber-200 flex items-center space-x-1.5"
            title="Generate Section 91 Statutory Cyber Subpoena (1930 Cyber-Cell Ready)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Section 91 Notice</span>
          </button>
        )}

        {/* Export Printable Dossier Button */}
        <button
          onClick={onOpenReportModal}
          disabled={isLoading}
          className="shrink-0 whitespace-nowrap rounded-md bg-gradient-to-r from-sky-600 to-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-md shadow-sky-600/20 transition-all hover:from-sky-500 hover:to-indigo-500 flex items-center space-x-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Print Dossier</span>
        </button>
      </div>
    </header>
  );
};
