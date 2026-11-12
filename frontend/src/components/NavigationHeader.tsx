import React from "react";
import {
  ShieldCheck,
  Compass,
  Layers,
  LineChart,
  ArrowRight,
  Upload,
  ExternalLink,
  Info,
  MessageSquareText,
} from "lucide-react";

export type AppRoute = "/" | "/workbench" | "/evaluation" | "/response" | "/why-verisight";

interface NavigationHeaderProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute, query?: Record<string, string>) => void;
  databaseStatus?: "CHECKING" | "HEALTHY" | "UNAVAILABLE" | "NOT_CONFIGURED";
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentRoute,
  onNavigate,
  databaseStatus = "HEALTHY",
}) => {
  return (
    <nav className="relative z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#090D16]/95 px-4 backdrop-blur-md select-none">
      {/* 1. Left: Brand & Engine Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2.5 group text-left"
          title="VeriSight Pro Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-950/60 text-sky-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-transform group-hover:scale-105">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-mono text-sm font-semibold tracking-wider text-slate-100 group-hover:text-white transition-colors">
                VERISIGHT
              </span>
              <span className="rounded bg-sky-950/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-sky-400 border border-sky-800/40">
                PRO
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {databaseStatus === "HEALTHY" ? "4-Layer Core Active" : `Core: ${databaseStatus}`}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 2. Center: Navigation Tabs */}
      <div className="hidden sm:flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#0A0F1D] p-1 text-xs font-mono">
        <button
          onClick={() => onNavigate("/")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            currentRoute === "/"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Product Overview</span>
        </button>

        <button
          onClick={() => onNavigate("/workbench")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            currentRoute === "/workbench"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Forensic Workbench</span>
        </button>

        <button
          onClick={() => onNavigate("/evaluation")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            currentRoute === "/evaluation"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <LineChart className="h-3.5 w-3.5" />
          <span>Evaluation & Research</span>
        </button>

        <button
          onClick={() => onNavigate("/response")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            currentRoute === "/response"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <MessageSquareText className="h-3.5 w-3.5" />
          <span>Response & Guidance</span>
        </button>

        <button
          onClick={() => onNavigate("/why-verisight")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            currentRoute === "/why-verisight"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <Info className="h-3.5 w-3.5" />
          <span>About VeriSight</span>
        </button>
      </div>

      {/* 3. Right: Primary Action CTA */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("/response")}
          className={`sm:hidden flex h-8 w-8 items-center justify-center rounded-lg border ${
            currentRoute === "/response"
              ? "border-sky-500/40 bg-sky-500/20 text-sky-300"
              : "border-white/10 bg-[#0C1222] text-slate-300"
          }`}
          aria-label="Open Response and Guidance"
          title="Response and Guidance"
        >
          <MessageSquareText className="h-4 w-4" />
        </button>
        {currentRoute !== "/workbench" ? (
          <button
            onClick={() => onNavigate("/workbench")}
            className="flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3.5 py-1.5 text-xs font-medium text-sky-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-all hover:bg-sky-500/25 active:scale-[0.97]"
          >
            <span>Launch Workbench</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onNavigate("/")}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0C1222] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 transition-all active:scale-[0.97]"
          >
            <Compass className="h-3.5 w-3.5 text-slate-400" />
            <span>Product Guide</span>
          </button>
        )}
      </div>
    </nav>
  );
};
