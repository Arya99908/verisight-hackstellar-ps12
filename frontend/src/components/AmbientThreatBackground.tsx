import React, { useEffect, useRef } from "react";

interface AmbientThreatBackgroundProps {
  threatScore?: number; // 0 to 100
  className?: string;
  children?: React.ReactNode;
}

export const AmbientThreatBackground: React.FC<AmbientThreatBackgroundProps> = ({
  threatScore = 0,
  className = "",
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Threat color calculation
  // Authentic (< 25): Cool Emerald/Cyan
  // Suspicious (25-65): Amber/Orange
  // Tampered / Spliced (> 65): Crimson/Rose
  let threatColor1 = "rgba(16, 185, 129, 0.16)"; // emerald
  let threatColor2 = "rgba(14, 165, 233, 0.10)"; // sky
  let threatAccentGlow = "rgba(16, 185, 129, 0.08)";

  if (threatScore >= 65) {
    threatColor1 = "rgba(244, 63, 94, 0.22)"; // rose
    threatColor2 = "rgba(225, 29, 72, 0.14)"; // red
    threatAccentGlow = "rgba(244, 63, 94, 0.12)";
  } else if (threatScore >= 25) {
    threatColor1 = "rgba(245, 158, 11, 0.20)"; // amber
    threatColor2 = "rgba(234, 88, 12, 0.12)"; // orange
    threatAccentGlow = "rgba(245, 158, 11, 0.10)";
  }

  // Mouse proximity spotlight tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#060911] ${className}`}
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* 1. Base Forensic Dual-Scale Grid: 16px micro-dots & 128px macro grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0),
            linear-gradient(to right, rgba(56, 189, 248, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px, 128px 128px, 128px 128px",
        }}
      />

      {/* 2. Hardware-accelerated Cursor Proximity Spotlight (react-bits inspired) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(420px circle at var(--mouse-x) var(--mouse-y), rgba(56, 189, 248, 0.09), transparent 80%)`,
        }}
      />

      {/* 3. Ambient Threat-State Backlight (slow breathing glow based on case risk) */}
      <div
        className="pointer-events-none absolute -top-40 left-1/4 h-[550px] w-[650px] rounded-full blur-[140px] transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle, ${threatColor1} 0%, ${threatColor2} 50%, transparent 80%)`,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-100px] right-10 h-[450px] w-[500px] rounded-full blur-[130px] transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle, ${threatAccentGlow} 0%, transparent 75%)`,
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
    </div>
  );
};
