import React, { useMemo, useState } from "react";
import { ArrowRight, FileCheck2 } from "lucide-react";
import {
  INDIA_MAP_VIEWBOX,
  INDIA_BOUNDARY_PATH,
  INDIA_DOT_MATRIX,
} from "../../data/indiaGeospatial";
import { PublicFraudAdvisory } from "../../data/realWorldCases";

// These coordinates are interface controls only; they are not geographic data.
const ADVISORY_SELECTOR_POINTS = [
  { x: 132, y: 112 },
  { x: 220, y: 172 },
  { x: 304, y: 214 },
  { x: 176, y: 296 },
  { x: 266, y: 346 },
  { x: 133, y: 405 },
];

interface DottedIndiaMapProps {
  advisories: PublicFraudAdvisory[];
  activeAdvisoryId: string;
  onSelectAdvisory: (advisoryId: string) => void;
  onOpenAdvisory: (advisory: PublicFraudAdvisory) => void;
  className?: string;
}

/** A themed advisory selector. The India silhouette is decorative and has no incident pins. */
export const DottedIndiaMap: React.FC<DottedIndiaMapProps> = ({
  advisories,
  activeAdvisoryId,
  onSelectAdvisory,
  onOpenAdvisory,
  className = "",
}) => {
  const [hoveredAdvisoryId, setHoveredAdvisoryId] = useState<string | null>(null);
  const activeIndex = Math.max(0, advisories.findIndex((item) => item.id === activeAdvisoryId));
  const displayAdvisory = useMemo(
    () => advisories.find((item) => item.id === hoveredAdvisoryId)
      || advisories.find((item) => item.id === activeAdvisoryId)
      || advisories[0],
    [advisories, activeAdvisoryId, hoveredAdvisoryId],
  );
  const displayIndex = displayAdvisory ? advisories.findIndex((item) => item.id === displayAdvisory.id) : 0;

  if (!displayAdvisory) return null;

  return (
    <div className={`relative flex w-full flex-col items-center select-none ${className}`}>
      <div className="relative aspect-[440/500] w-full max-w-[380px] overflow-visible">
        <svg
          viewBox={INDIA_MAP_VIEWBOX}
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="Decorative dotted India silhouette used to select public advisories; no incident locations are plotted."
        >
          <defs>
            <radialGradient id="mapBackdrop" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.08" />
              <stop offset="70%" stopColor="#0f766e" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d={INDIA_BOUNDARY_PATH}
            fill="url(#mapBackdrop)"
            stroke="rgba(56, 189, 248, 0.14)"
            strokeWidth="0.8"
          />
          <g className="dot-matrix">
            {INDIA_DOT_MATRIX.map((dot) => (
              <circle
                key={dot.id}
                cx={dot.x}
                cy={dot.y}
                r={1.3}
                fill="rgba(16, 185, 129, 0.45)"
              />
            ))}
          </g>
          {/* Markers reproduce the selector visual; their positions have no geographic meaning. */}
          {advisories.map((advisory, index) => {
            const point = ADVISORY_SELECTOR_POINTS[index % ADVISORY_SELECTOR_POINTS.length];
            const isSelected = advisory.id === displayAdvisory.id;
            return (
              <g
                key={advisory.id}
                role="button"
                tabIndex={0}
                aria-label={`Select advisory ${index + 1}: ${advisory.shortHeadline || advisory.headline}`}
                aria-pressed={advisory.id === activeAdvisoryId}
                className="cursor-pointer outline-none"
                onClick={() => onSelectAdvisory(advisory.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectAdvisory(advisory.id);
                  }
                }}
              >
                {isSelected && <circle cx={point.x} cy={point.y} r="12" fill="none" stroke="#34d399" strokeWidth="1.5" className="animate-ping" />}
                <circle cx={point.x} cy={point.y} r={isSelected ? 6 : 4.5} fill={isSelected ? "#ef4444" : "#10b981"} fillOpacity={isSelected ? ".95" : ".8"} />
                <circle cx={point.x} cy={point.y} r="1.8" fill="#fff" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="-mt-1 flex items-center justify-center gap-2" aria-label="Choose public advisory">
        {advisories.map((advisory, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={advisory.id}
              type="button"
              onMouseEnter={() => setHoveredAdvisoryId(advisory.id)}
              onMouseLeave={() => setHoveredAdvisoryId(null)}
              onFocus={() => setHoveredAdvisoryId(advisory.id)}
              onBlur={() => setHoveredAdvisoryId(null)}
              onClick={() => onSelectAdvisory(advisory.id)}
              aria-label={`Select public advisory ${index + 1}: ${advisory.shortHeadline || advisory.headline}`}
              aria-current={isActive ? "true" : undefined}
              className={`relative grid h-8 w-8 place-items-center rounded-full border transition-all duration-300 ${
                isActive
                  ? "border-emerald-400/80 bg-emerald-400/15 text-emerald-200 shadow-[0_0_16px_rgba(52,211,153,.22)]"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-emerald-400/50 hover:text-emerald-200"
              }`}
            >
              {isActive && <span className="absolute inset-0 rounded-full border border-emerald-300/60 animate-ping" />}
              <span className="relative font-mono text-[10px] font-bold">{index + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="absolute left-[36%] top-[45%] z-10 w-[58%] max-w-56 rounded-xl border border-emerald-500/40 bg-[#06111E]/95 p-3 text-left shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Advisory {displayIndex + 1} · {displayAdvisory.publisher}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-white">
          {displayAdvisory.shortHeadline || displayAdvisory.headline}
        </p>
        <button
          type="button"
          onClick={() => onOpenAdvisory(displayAdvisory)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
        >
          View advisory <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <p className="mt-3 max-w-sm text-center text-[10px] leading-relaxed text-slate-400">
        Marker positions are illustrative selector controls, not incident locations. The source links describe advisories and public reporting.
      </p>
    </div>
  );
};
