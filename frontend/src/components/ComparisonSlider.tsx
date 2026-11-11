import React, { useState, useRef, useCallback } from "react";
import { SlidersHorizontal, Activity, Waves, Copy } from "lucide-react";

interface ComparisonSliderProps {
  originalSrc: string;
  elaSrc: string;
  waveletSrc: string;
  cloneSrc: string;
  aspectRatioWidth: number;
  aspectRatioHeight: number;
  className?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalSrc,
  elaSrc,
  waveletSrc,
  cloneSrc,
  aspectRatioWidth,
  aspectRatioHeight,
  className = "",
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [activeChannel, setActiveChannel] = useState<"ELA" | "WAVELET" | "CLONE">("ELA");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const comparisonSrc =
    activeChannel === "ELA"
      ? elaSrc
      : activeChannel === "WAVELET"
      ? waveletSrc
      : cloneSrc;

  const comparisonLabel =
    activeChannel === "ELA"
      ? "Compression Heatmap (ELA)"
      : activeChannel === "WAVELET"
      ? "Noise Residual (Wavelet db4)"
      : "Cloned Vectors (ORB)";

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(clampedPct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If click on button inside, ignore
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // safe ignore
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      setSliderPos((p) => Math.max(0, p - 5));
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      setSliderPos((p) => Math.min(100, p + 5));
      e.preventDefault();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      {/* Channel Selector for Comparison */}
      <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-[#1e293b] bg-[#0c1322] p-1 text-xs">
        <span className="px-2 font-mono text-[10px] text-[#64748b]">
          COMPARE WITH:
        </span>
        <button
          onClick={() => setActiveChannel("ELA")}
          className={`flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            activeChannel === "ELA"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f1f5f9]"
          }`}
        >
          <Activity className="h-3 w-3" />
          <span>Compression (ELA)</span>
        </button>
        <button
          onClick={() => setActiveChannel("WAVELET")}
          className={`flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            activeChannel === "WAVELET"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f1f5f9]"
          }`}
        >
          <Waves className="h-3 w-3" />
          <span>Noise (Wavelet)</span>
        </button>
        <button
          onClick={() => setActiveChannel("CLONE")}
          className={`flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            activeChannel === "CLONE"
              ? "bg-pink-600 text-white shadow-sm"
              : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f1f5f9]"
          }`}
        >
          <Copy className="h-3 w-3" />
          <span>Clones (ORB)</span>
        </button>
      </div>

      {/* Main Drag Slider Frame */}
      <div
        ref={containerRef}
        role="slider"
        aria-label="Interactive before and after evidence comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPos)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative select-none overflow-hidden rounded-lg border border-[#1e293b] bg-black cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${className}`}
        style={{
          aspectRatio: `${aspectRatioWidth} / ${aspectRatioHeight}`,
          maxWidth: "100%",
          maxHeight: "calc(100% - 40px)",
        }}
      >
        {/* Background Layer: Forensic Spectral Layer (Right) */}
        <img
          src={comparisonSrc}
          alt={comparisonLabel}
          className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
        />

        {/* Foreground Layer: Original Evidence Clipped (Left) */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none select-none"
          style={{
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
          }}
        >
          <img
            src={originalSrc}
            alt="Original Evidence"
            className="h-full w-full object-contain pointer-events-none select-none"
          />
        </div>

        {/* Position Labels */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 rounded border border-sky-800/80 bg-[#070b14]/85 px-2.5 py-1 text-[10px] font-mono text-sky-300 backdrop-blur-sm shadow-md">
          Original Evidence ({Math.round(sliderPos)}%)
        </div>
        <div className="absolute top-3 right-3 pointer-events-none z-10 rounded border border-amber-800/80 bg-[#070b14]/85 px-2.5 py-1 text-[10px] font-mono text-amber-300 backdrop-blur-sm shadow-md">
          {comparisonLabel} ({Math.round(100 - sliderPos)}%)
        </div>

        {/* Hairline Divider with Grip */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)] pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-sky-400 bg-[#090e17] text-sky-300 shadow-2xl">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
