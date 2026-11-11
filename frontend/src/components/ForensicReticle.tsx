import React from "react";
import { Crosshair } from "lucide-react";

interface ForensicReticleProps {
  cursorPos?: { x: number; y: number } | null;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
  className?: string;
}

export const ForensicReticle: React.FC<ForensicReticleProps> = ({
  cursorPos,
  imageWidth,
  imageHeight,
  zoom,
  className = "",
}) => {
  const pixelX = cursorPos ? Math.round((cursorPos.x / 100) * imageWidth) : null;
  const pixelY = cursorPos ? Math.round((cursorPos.y / 100) * imageHeight) : null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-20 ${className}`}
    >
      {/* Corner Bracket Reticles */}
      <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-sky-500/40" />
      <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-sky-500/40" />
      <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-sky-500/40" />
      <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-sky-500/40" />

      {/* Subtle Coordinate HUD at bottom-left */}
      {pixelX !== null && pixelY !== null && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded border border-[#1e293b] bg-[#070b14]/85 px-2.5 py-1 text-[10px] font-mono text-[#94a3b8] backdrop-blur-sm shadow-md">
          <Crosshair className="h-3 w-3 text-sky-400" />
          <span>
            COORD: <strong className="text-white">{pixelX}</strong> × <strong className="text-white">{pixelY}</strong> px
          </span>
          <span className="text-[#475569]">|</span>
          <span>
            SCALE: <strong className="text-sky-300">{Math.round(zoom * 100)}%</strong>
          </span>
        </div>
      )}
    </div>
  );
};
