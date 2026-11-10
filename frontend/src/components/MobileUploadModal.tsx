import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Radio,
  Loader2,
} from "lucide-react";
import { NetworkInfo, ForensicAnalysisReport } from "../types/forensic";
import { fetchNetworkInfo, fetchLatestMobileUpload } from "../services/api";

interface MobileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMobileUploadReceived: (report: ForensicAnalysisReport) => void;
}

export const MobileUploadModal: React.FC<MobileUploadModalProps> = ({
  isOpen,
  onClose,
  onMobileUploadReceived,
}) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(true);

  // Load network info on open
  useEffect(() => {
    if (!isOpen) return;

    fetchNetworkInfo()
      .then((info) => setNetworkInfo(info))
      .catch((err) => console.error("Failed to load network info:", err));
  }, [isOpen]);

  // Live polling for stage judge uploads
  useEffect(() => {
    if (!isOpen || !isListening) return;

    const interval = setInterval(async () => {
      try {
        const latestReport = await fetchLatestMobileUpload();
        if (latestReport) {
          onMobileUploadReceived(latestReport);
          onClose();
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, isListening, onMobileUploadReceived, onClose]);

  if (!isOpen) return null;

  const mobileUrl =
    networkInfo?.mobile_upload_url ||
    `http://${window.location.hostname}:5173/?mode=mobile`;

  const copyUrl = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#1e293b] bg-[#070b14] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-600/50 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#f1f5f9] tracking-wide">
                Stage Judge Live Mobile Upload
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Real-time zero-cable screenshot analysis direct from smartphone
                camera
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#1e293b] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Body */}
        <div className="p-6 flex flex-col items-center space-y-5">
          <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-amber-500/30">
            <QRCodeSVG
              value={mobileUrl}
              size={220}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Pulse Status */}
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-full">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LISTENING FOR STAGE JUDGE UPLOAD...</span>
          </div>

          {/* Direct URL */}
          <div className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-mono text-xs text-[#94a3b8] truncate">
                {mobileUrl}
              </span>
            </div>
            <button
              onClick={copyUrl}
              className="p-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-sky-400 transition-all shrink-0 ml-2"
              title="Copy mobile upload URL"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Instructions for HackStellar Judges */}
          <div className="w-full text-[11px] text-[#64748b] space-y-1 text-center leading-relaxed">
            <p>1. Connect smartphone to the same Wi-Fi / Local Area Network.</p>
            <p>2. Scan QR with iOS Camera or Android Google Lens.</p>
            <p>
              3. Snap any UPI payment screenshot on your phone to trigger
              instant 4-layer audit on this screen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 px-6 border-t border-[#1e293b] bg-[#070b14] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-xs font-medium text-[#f1f5f9] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
