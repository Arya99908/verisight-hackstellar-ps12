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
  demoSamples: DemoSampleMeta[];
  selectedSampleId: string | null;
  onSelectSample: (sampleId: string) => void;
  onFileUpload: (file: File) => void;
  onOpenWhatsAppModal: () => void;
  onOpenMobileModal: () => void;
  onOpenReportModal: () => void;
  isLoading: boolean;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  demoSamples,
  selectedSampleId,
  onSelectSample,
  onFileUpload,
  onOpenWhatsAppModal,
  onOpenMobileModal,
  onOpenReportModal,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#070b14]/95 backdrop-blur px-4 flex items-center justify-between z-20">
      {/* Brand & System Indicator */}
      <div className="flex items-center space-x-3 min-w-[280px]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">4-LAYER FORENSIC CORE ONLINE</span>
          </div>
        </div>
      </div>

      {/* Golden Demo Sample Selector Pills */}
      <div className="flex items-center space-x-1.5 bg-[#0b1120] p-1 rounded-lg border border-[#1e293b] overflow-x-auto max-w-[580px]">
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
                {sample.id === "sample_1" && "Genuine GPay"}
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
      <div className="flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-md bg-[#1e293b] hover:bg-[#334155] text-xs font-medium text-[#f1f5f9] transition-all flex items-center space-x-1.5 border border-[#334155]"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span className="hidden md:inline">Upload Screenshot</span>
        </button>

        {/* Simulate WhatsApp Button */}
        <button
          onClick={onOpenWhatsAppModal}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-md bg-[#0f172a] hover:bg-[#1e293b] text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-all flex items-center space-x-1.5 border border-emerald-900/60"
          title="Simulate WhatsApp compression laundering"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Simulate WhatsApp</span>
        </button>

        {/* Stage Judge Mobile QR Sync Button */}
        <button
          onClick={onOpenMobileModal}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-md bg-[#0f172a] hover:bg-[#1e293b] text-xs font-medium text-amber-400 hover:text-amber-300 transition-all flex items-center space-x-1.5 border border-amber-900/60"
          title="Scan QR to live-upload from phone camera"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Judge Mobile QR</span>
        </button>

        {/* Export Printable Dossier Button */}
        <button
          onClick={onOpenReportModal}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-md bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-medium text-white transition-all flex items-center space-x-1.5 shadow-md shadow-sky-600/20"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Print Dossier</span>
        </button>
      </div>
    </header>
  );
};
