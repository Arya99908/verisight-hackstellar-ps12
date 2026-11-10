import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  Activity,
  Waves,
  Copy,
  Split,
  Grid,
  Eye,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
} from "lucide-react";
import {
  ForensicAnalysisReport,
  BoundingBox,
  BaselineLaser,
} from "../types/forensic";
import { SynchronizedLoupe } from "./SynchronizedLoupe";

interface ForensicViewerProps {
  report: ForensicAnalysisReport | null;
  selectedLocus: BoundingBox | null;
}

export type ViewMode =
  "ORIGINAL" | "ELA" | "WAVELET" | "COPY_MOVE" | "LOUPE" | "QUAD";

export const ForensicViewer: React.FC<ForensicViewerProps> = ({
  report,
  selectedLocus,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("ORIGINAL");
  const [showLasers, setShowLasers] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 1280, height: 800 });

  // Loupe tracking state
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateSize = () =>
      setViewportSize({ width: viewport.clientWidth, height: viewport.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [Boolean(report)]);

  useEffect(() => {
    setZoom(1);
  }, [report?.file_sha256]);

  if (!report) {
    return (
      <div className="flex min-h-[55dvh] w-full flex-col items-center justify-center bg-[#070b14] text-[#64748b] md:min-h-0 md:flex-1">
        <Layers className="w-12 h-12 mb-3 stroke-[1.5] text-sky-500/40 animate-pulse" />
        <p className="text-sm font-mono tracking-wider">
          AWAITING SCREENSHOT EVIDENCE INPUT
        </p>
        <p className="text-xs text-[#475569] mt-1">
          Select a golden sample above or upload custom screenshot
        </p>
      </div>
    );
  }

  const {
    image_width,
    image_height,
    original_image_b64,
    layer1,
    layer2,
    all_bounding_boxes,
  } = report;

  // Active channel image selection
  let currentLayerImg = original_image_b64;
  let layerLabel = "Original Image";

  if (viewMode === "ELA") {
    currentLayerImg = layer1.ela_b64;
    layerLabel = "Error Level Analysis (Inferno)";
  } else if (viewMode === "WAVELET") {
    currentLayerImg = layer1.wavelet_noise_b64;
    layerLabel = "Daubechies db4 Wavelet Noise Residual";
  } else if (viewMode === "COPY_MOVE") {
    currentLayerImg = layer1.clone_b64;
    layerLabel = "ORB Keypoint Copy-Move Vectors";
  }

  // Mouse move handler for synchronized loupe
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const yPct = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
    );
    setLoupePos({ x: xPct, y: yPct });
  };

  const clampZoom = (value: number) => Math.min(5, Math.max(1, value));
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((current) => clampZoom(current + (e.deltaY < 0 ? 0.2 : -0.2)));
  };
  const handlePanStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1 || e.button !== 0 || !viewportRef.current) return;
    if ((e.target as HTMLElement).closest("button")) return;
    panStartRef.current = {
      pointerId: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    e.preventDefault();
  };
  const handlePanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = panStartRef.current;
    const viewport = viewportRef.current;
    if (!start || !viewport || start.pointerId !== e.pointerId) return;
    viewport.scrollLeft = start.scrollLeft - (e.clientX - start.clientX);
    viewport.scrollTop = start.scrollTop - (e.clientY - start.clientY);
  };
  const handlePanEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (panStartRef.current?.pointerId !== e.pointerId) return;
    panStartRef.current = null;
    setIsPanning(false);
  };

  return (
    <div className="relative flex h-[72dvh] min-h-[500px] w-full flex-none flex-col overflow-hidden bg-[#070b14] md:h-full md:min-h-0 md:flex-1">
      {/* Top Toolbar: View Mode Tabs + Overlay Toggles */}
      <div className="flex min-h-12 w-full shrink-0 flex-col gap-2 border-b border-[#1e293b] bg-[#0b1120] px-2 py-2 text-xs md:h-12 md:flex-row md:items-center md:justify-between md:px-4 md:py-0">
        {/* Spectral Tabs */}
        <div className="flex max-w-full shrink-0 items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => setViewMode("ORIGINAL")}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition-all ${
              viewMode === "ORIGINAL"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ORIGINAL</span>
          </button>

          <button
            onClick={() => setViewMode("ELA")}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition-all ${
              viewMode === "ELA"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ELA (HEATMAP)</span>
          </button>

          <button
            onClick={() => setViewMode("WAVELET")}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition-all ${
              viewMode === "WAVELET"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>WAVELET NOISE (db4)</span>
          </button>

          <button
            onClick={() => setViewMode("COPY_MOVE")}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition-all ${
              viewMode === "COPY_MOVE"
                ? "bg-pink-600 text-white shadow-sm"
                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>ORB COPY-MOVE</span>
          </button>

          <button
            onClick={() => setViewMode("LOUPE")}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition-all ${
              viewMode === "LOUPE"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>SPLIT LOUPE</span>
          </button>

          <button
            onClick={() => setViewMode("QUAD")}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition-all ${
              viewMode === "QUAD"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>QUAD-SPECTRAL</span>
          </button>
        </div>

        {/* Overlay Switches */}
        <div className="flex max-w-full items-center space-x-3 overflow-x-auto text-[11px] font-mono">
          <label className="flex items-center space-x-1.5 cursor-pointer text-[#94a3b8] hover:text-[#f1f5f9]">
            <input
              type="checkbox"
              checked={showLasers}
              onChange={(e) => setShowLasers(e.target.checked)}
              className="rounded bg-[#1e293b] border-[#334155] text-sky-500 focus:ring-0"
            />
            <span className={showLasers ? "text-sky-400 font-semibold" : ""}>
              Baseline Lasers
            </span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[#94a3b8] hover:text-[#f1f5f9]">
            <input
              type="checkbox"
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
              className="rounded bg-[#1e293b] border-[#334155] text-rose-500 focus:ring-0"
            />
            <span className={showBoxes ? "text-rose-400 font-semibold" : ""}>
              Anomaly Boxes
            </span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[#94a3b8] hover:text-[#f1f5f9]">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded bg-[#1e293b] border-[#334155] text-purple-500 focus:ring-0"
            />
            <span>Grid Overlay</span>
          </label>
        </div>
      </div>

      {/* Main Forensic Canvas */}
      {(() => {
        const availableWidth = Math.max(240, viewportSize.width - 32);
        const availableHeight = Math.max(240, viewportSize.height - 32);
        const quadWidth = Math.min(860, availableWidth, availableHeight * 0.9);
        const fitScale = Math.min(
          availableWidth / image_width,
          availableHeight / image_height,
          1,
        );
        const canvasWidth = Math.round(
          (viewMode === "QUAD" ? quadWidth : image_width * fitScale) * zoom,
        );
        const canvasHeight = Math.round(
          (viewMode === "QUAD" ? quadWidth * (10 / 9) : image_height * fitScale) * zoom,
        );
        return (
          <>
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerCancel={handlePanEnd}
        className="relative min-h-0 flex-1 touch-pan-x touch-pan-y overflow-auto p-2 md:p-4"
        aria-label="Zoomable forensic screenshot viewer"
      >
        <div
          className={`flex ${canvasWidth > availableWidth ? "justify-start" : "justify-center"} ${canvasHeight > availableHeight ? "items-start" : "items-center"}`}
          style={{
            width: Math.max(availableWidth, canvasWidth),
            height: Math.max(availableHeight, canvasHeight),
          }}
        >
        {viewMode === "QUAD" ? (
          /* 2x2 Synchronized Quad-Spectral Grid */
          <div
            className="grid grid-cols-2 gap-3 aspect-[9/10] w-full"
            style={{ width: canvasWidth, height: canvasHeight }}
          >
            <div className="flex flex-col bg-[#0b1120] border border-[#1e293b] rounded-lg overflow-hidden">
              <div className="px-2 py-1 bg-[#070b14] border-b border-[#1e293b] text-[10px] font-mono text-sky-400">
                1. ORIGINAL EVIDENCE CAPTURE
              </div>
              <div className="flex-1 flex items-center justify-center p-2">
                <img
                  src={original_image_b64}
                  alt="Original"
                  className="max-h-full object-contain rounded"
                />
              </div>
            </div>

            <div className="flex flex-col bg-[#0b1120] border border-[#1e293b] rounded-lg overflow-hidden">
              <div className="px-2 py-1 bg-[#070b14] border-b border-[#1e293b] text-[10px] font-mono text-amber-400">
                2. ERROR LEVEL ANALYSIS (INFERNO)
              </div>
              <div className="flex-1 flex items-center justify-center p-2">
                <img
                  src={layer1.ela_b64}
                  alt="ELA"
                  className="max-h-full object-contain rounded"
                />
              </div>
            </div>

            <div className="flex flex-col bg-[#0b1120] border border-[#1e293b] rounded-lg overflow-hidden">
              <div className="px-2 py-1 bg-[#070b14] border-b border-[#1e293b] text-[10px] font-mono text-cyan-400">
                3. DAUBECHIES db4 WAVELET NOISE
              </div>
              <div className="flex-1 flex items-center justify-center p-2">
                <img
                  src={layer1.wavelet_noise_b64}
                  alt="Wavelet"
                  className="max-h-full object-contain rounded"
                />
              </div>
            </div>

            <div className="flex flex-col bg-[#0b1120] border border-[#1e293b] rounded-lg overflow-hidden">
              <div className="px-2 py-1 bg-[#070b14] border-b border-[#1e293b] text-[10px] font-mono text-pink-400">
                4. ORB COPY-MOVE CLONED VECTORS
              </div>
              <div className="flex-1 flex items-center justify-center p-2">
                <img
                  src={layer1.clone_b64}
                  alt="Clone"
                  className="max-h-full object-contain rounded"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Single Multi-Spectral Canvas with SVG Overlay */
          <div
            ref={containerRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
            className="relative max-h-full flex items-center justify-center rounded-lg overflow-hidden shadow-2xl border border-[#1e293b] bg-black"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              aspectRatio: `${image_width} / ${image_height}`,
              cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default",
            }}
          >
            {/* Base Image */}
            <img
              src={currentLayerImg}
              alt="Forensic View"
              className="w-full h-full object-contain select-none pointer-events-none"
            />

            {/* Optional Coordinate Grid */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
            )}

            {/* Interactive SVG Overlay (Lasers & Anomaly Reticles) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${image_width} ${image_height}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Layer 2: Sub-pixel Horizontal Baseline Lasers */}
              {showLasers &&
                layer2.lasers.map((laser, idx) => {
                  const isTampered = laser.is_tampered;
                  const x1 = laser.x_start ?? 40;
                  const x2 = laser.x_end ?? image_width - 40;
                  const y = laser.y_baseline;

                  return (
                    <g key={`laser-${idx}`}>
                      {/* Laser Line */}
                      <line
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        stroke={isTampered ? "#f43f5e" : "#38bdf8"}
                        strokeWidth={isTampered ? "2.5" : "1.5"}
                        strokeDasharray={isTampered ? "none" : "4 3"}
                        className={
                          isTampered ? "laser-critical" : "laser-aligned"
                        }
                      />

                      {/* Laser Left Anchor Dot */}
                      <circle
                        cx={x1}
                        cy={y}
                        r={isTampered ? 4 : 2.5}
                        fill={isTampered ? "#f43f5e" : "#38bdf8"}
                      />

                      {/* Callout Badge for Tampered Drift */}
                      {isTampered && laser.callout_text && (
                        <g transform={`translate(${x2 + 8}, ${y - 8})`}>
                          <rect
                            x="0"
                            y="0"
                            width="110"
                            height="18"
                            rx="3"
                            fill="#f43f5e"
                            stroke="#ffffff"
                            strokeWidth="0.5"
                          />
                          <text
                            x="5"
                            y="13"
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {laser.callout_text}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

              {/* Anomaly Bounding Box Reticles */}
              {showBoxes &&
                all_bounding_boxes.map((box, bIdx) => {
                  const isLocus =
                    box.anomaly_type === "CROSS_LAYER_SYNERGY_LOCUS";
                  const isSelected =
                    selectedLocus &&
                    selectedLocus.x === box.x &&
                    selectedLocus.y === box.y;

                  const strokeColor = isLocus
                    ? "#f59e0b"
                    : box.layer === 1
                      ? "#ec4899"
                      : box.layer === 2
                        ? "#f43f5e"
                        : "#38bdf8";

                  return (
                    <g key={`bbox-${bIdx}`}>
                      {/* Main Box Outline */}
                      <rect
                        x={box.x}
                        y={box.y}
                        width={box.width}
                        height={box.height}
                        fill={
                          isLocus
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(244, 63, 94, 0.08)"
                        }
                        stroke={strokeColor}
                        strokeWidth={isLocus || isSelected ? "3" : "1.8"}
                        strokeDasharray={isLocus ? "none" : "3 3"}
                      />

                      {/* Corner Targeting Reticles */}
                      <line
                        x1={box.x - 4}
                        y1={box.y}
                        x2={box.x + 8}
                        y2={box.y}
                        stroke={strokeColor}
                        strokeWidth="2.5"
                      />
                      <line
                        x1={box.x}
                        y1={box.y - 4}
                        x2={box.x}
                        y2={box.y + 8}
                        stroke={strokeColor}
                        strokeWidth="2.5"
                      />
                      <line
                        x1={box.x + box.width - 8}
                        y1={box.y}
                        x2={box.x + box.width + 4}
                        y2={box.y}
                        stroke={strokeColor}
                        strokeWidth="2.5"
                      />
                      <line
                        x1={box.x + box.width}
                        y1={box.y - 4}
                        x2={box.x + box.width}
                        y2={box.y + 8}
                        stroke={strokeColor}
                        strokeWidth="2.5"
                      />

                      {/* Header Badge */}
                      <g
                        transform={`translate(${box.x}, ${Math.max(16, box.y - 6)})`}
                      >
                        <rect
                          x="0"
                          y="-14"
                          width={Math.min(box.width + 20, 240)}
                          height="16"
                          rx="2"
                          fill={strokeColor}
                        />
                        <text
                          x="4"
                          y="-2"
                          fill="#070b14"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {box.label.slice(0, 32)}
                        </text>
                      </g>
                    </g>
                  );
                })}
            </svg>
          </div>
        )}

        {/* 3x Synchronized Loupe (active in SPLIT LOUPE view or hovering) */}
        <SynchronizedLoupe
          visible={viewMode === "LOUPE" || (isHovering && viewMode !== "QUAD")}
          x={loupePos.x}
          y={loupePos.y}
          originalImgSrc={original_image_b64}
          spectralImgSrc={
            viewMode !== "ORIGINAL" ? currentLayerImg : layer1.ela_b64
          }
          spectralLabel={
            viewMode !== "ORIGINAL" ? layerLabel : "ELA Heatmap Reference"
          }
          imgWidth={image_width}
          imgHeight={image_height}
        />
      </div>
      </div>
      <div className="absolute bottom-6 left-6 z-40 flex items-center gap-1 rounded-xl border border-[#334155] bg-[#070b14]/95 p-1.5 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={() => setZoom((current) => clampZoom(current - 0.25))}
          disabled={zoom <= 1}
          title="Zoom out"
          aria-label="Zoom out"
          className="rounded-lg p-2 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-14 text-center font-mono text-xs text-sky-300" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((current) => clampZoom(current + 0.25))}
          disabled={zoom >= 5}
          title="Zoom in"
          aria-label="Zoom in"
          className="rounded-lg p-2 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-slate-700" />
        <button
          type="button"
          onClick={() => setZoom(1)}
          title="Fit screenshot to view"
          aria-label="Fit screenshot to view"
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs text-slate-300 hover:bg-slate-800"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Fit</span>
        </button>
        <span className="hidden items-center gap-1 pl-2 pr-1 text-[10px] text-slate-500 xl:flex">
          <Move className="h-3 w-3" /> Drag to pan
        </span>
      </div>
      {!isPanning && zoom === 1 && (
        <span className="pointer-events-none absolute bottom-8 right-6 z-30 hidden text-[10px] text-slate-500 xl:block">
          Ctrl/⌘ + scroll to zoom
        </span>
      )}
          </>
        );
      })()}
    </div>
  );
};
