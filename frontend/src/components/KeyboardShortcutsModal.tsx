import React, { useEffect } from "react";
import { X, Keyboard, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Investigation" | "Inspection Views" | "Canvas & Layout";
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ["1", "-", "5"], description: "Select Golden Demo Sample 1 through 5", category: "Investigation" },
  { keys: ["M"], description: "Toggle Simple / Advanced Forensic Mode", category: "Investigation" },
  { keys: ["["], description: "Toggle Risk Dossier Sidebar (Collapse / Expand)", category: "Canvas & Layout" },
  { keys: ["F"], description: "Fit Evidence to Screen / Reset Zoom", category: "Canvas & Layout" },
  { keys: ["O"], description: "Switch to Original Evidence View", category: "Inspection Views" },
  { keys: ["E"], description: "Switch to Compression Analysis (ELA Heatmap)", category: "Inspection Views" },
  { keys: ["W"], description: "Switch to Noise Consistency (Wavelet Residual)", category: "Inspection Views" },
  { keys: ["C"], description: "Switch to Copy-Move Clones Detection (ORB)", category: "Inspection Views" },
  { keys: ["S"], description: "Switch to Draggable Split Comparison Slider", category: "Inspection Views" },
  { keys: ["L"], description: "Switch to Synchronized 3X Dual Loupe", category: "Inspection Views" },
  { keys: ["Q"], description: "Switch to Quad-Spectral Matrix View", category: "Inspection Views" },
  { keys: ["?"], description: "Show Keyboard Shortcuts Cheatsheet", category: "Canvas & Layout" },
  { keys: ["Esc"], description: "Close Active Modal Dialog", category: "Canvas & Layout" },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: ShortcutItem["category"][] = [
    "Investigation",
    "Inspection Views",
    "Canvas & Layout",
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-[#1e293b] bg-[#0c1322] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2 text-[#f1f5f9]">
            <Keyboard className="h-5 w-5 text-sky-400" />
            <h2 id="shortcuts-dialog-title" className="text-sm font-semibold tracking-wide">
              Keyboard Navigation Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#64748b] transition-colors hover:bg-[#1e293b] hover:text-[#f1f5f9]"
            aria-label="Close shortcuts"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
                {cat}
              </span>
              <div className="divide-y divide-[#1e293b]/60 rounded-lg border border-[#1e293b] bg-[#070b14]/70">
                {SHORTCUTS.filter((s) => s.category === cat).map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <span className="text-[#cbd5e1]">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="min-w-[22px] rounded border border-[#334155] bg-[#1e293b] px-1.5 py-0.5 text-center font-mono text-[11px] font-medium text-sky-300 shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#1e293b] pt-3 text-[11px] text-[#64748b]">
          <span className="flex items-center gap-1 font-mono">
            <Command className="h-3 w-3 text-sky-400" />
            Zero-latency interaction engine
          </span>
          <button
            onClick={onClose}
            className="rounded bg-[#1e293b] px-3 py-1 font-medium text-[#f1f5f9] transition-colors hover:bg-[#334155]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
