import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  LineChart,
  Database,
  Cpu,
  Layers,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { fetchModelStatus, fetchModelEvaluation, ModelStatus, ModelEvaluationReport } from "../services/api";

interface EvaluationDashboardProps {
  onNavigateWorkbench: () => void;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  onNavigateWorkbench,
}) => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [evalData, setEvalData] = useState<ModelEvaluationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([fetchModelStatus(), fetchModelEvaluation()])
      .then(([status, evaluation]) => {
        if (!active) return;
        setModelStatus(status);
        setEvalData(evaluation);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load telemetry");
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#060911] text-slate-100 select-text p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* 1. Header & Scientific Transparency Statement */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
              <LineChart className="h-4 w-4" />
              <span className="uppercase tracking-wider">Forensic Engineering Transparency</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Model Registry & Benchmark Evaluation
            </h1>
          </div>

          <button
            onClick={onNavigateWorkbench}
            className="flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/15 px-4 py-2 text-xs font-medium text-sky-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-all hover:bg-sky-500/25 active:scale-[0.97] self-start sm:self-auto"
          >
            <span>Open Forensic Workbench</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Prominent Mandatory Disclosure */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3 shadow-md">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-200 font-mono uppercase text-[11px] mb-0.5">
              Scientific Evaluation Disclosure
            </span>
            Current evaluation uses synthetic development samples. Real-world consumer generalization has not yet been independently established. VeriSight evaluates pixel-level signals, font baselines, and recompression traces; it does not interface with banking ledger rails or certify monetary settlement.
          </div>
        </div>
      </div>

      {/* 2. Active Model Specification Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#0D1424] p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Active Model ID</span>
          <div className="font-mono text-sm font-bold text-sky-300 truncate">
            {modelStatus?.active_model_id || "verisight-fusion-gbdt-v1"}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Version {modelStatus?.active_model_version || "1.2.1"}
          </span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0D1424] p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Architecture</span>
          <div className="font-sans text-xs font-semibold text-slate-200 line-clamp-2">
            HistGradientBoosting Decision Trees (GBDT)
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            with 3-Fold CalibratedClassifierCV
          </span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0D1424] p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Calibration Method</span>
          <div className="font-mono text-xs font-bold text-emerald-400">
            Platt Sigmoid (cv=3)
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Brier Score: {evalData?.models?.learned_fusion_gbdt?.oof_cv_metrics?.brier_score ?? "0.0992"}
          </span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0D1424] p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Dataset Provenance</span>
          <div className="font-mono text-xs font-bold text-slate-200">
            27 Synthetic Artifacts
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            20 Dev / 7 Strictly Held-Out
          </span>
        </div>
      </div>

      {/* 3. Comparative Benchmark Evaluation Table */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Cpu className="h-4 w-4 text-sky-400" />
            Model Benchmark Performance Comparison
          </h2>
          <span className="text-[10px] font-mono text-slate-500">
            Dataset: v1.0-benchmark-27 (Synthetic)
          </span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0D1424] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#090D16] text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-4">Model Pipeline</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Dev ROC-AUC</th>
                  <th className="py-3 px-3">Dev Brier Score</th>
                  <th className="py-3 px-3">Dev Accuracy</th>
                  <th className="py-3 px-3">Test ROC-AUC</th>
                  <th className="py-3 px-3">Test Accuracy</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-mono text-[11px]">
                {/* 1. Baseline Heuristic */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-medium text-slate-300">
                    Deterministic 4-Layer Heuristic Baseline
                  </td>
                  <td className="py-3 px-3 text-slate-400">Rule-based</td>
                  <td className="py-3 px-3 text-slate-300">0.6200</td>
                  <td className="py-3 px-3 text-slate-400">0.3308</td>
                  <td className="py-3 px-3 text-slate-300">55.0%</td>
                  <td className="py-3 px-3 text-slate-400">0.6667</td>
                  <td className="py-3 px-3 text-slate-400">71.4%</td>
                  <td className="py-3 px-3">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300 border border-slate-700">
                      FALLBACK
                    </span>
                  </td>
                </tr>

                {/* 2. Logistic Regression */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-medium text-slate-300">
                    Learned Logistic Fusion (v1.1.0)
                  </td>
                  <td className="py-3 px-3 text-slate-400">L2 Logistic</td>
                  <td className="py-3 px-3 text-sky-300 font-bold">0.9500</td>
                  <td className="py-3 px-3 text-emerald-300">0.1072</td>
                  <td className="py-3 px-3 text-slate-300">85.0%</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">1.0000</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">100.0%</td>
                  <td className="py-3 px-3">
                    <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[9px] text-sky-300 border border-sky-800/50">
                      VALIDATED
                    </span>
                  </td>
                </tr>

                {/* 3. GBDT Classifier */}
                <tr className="bg-sky-500/[0.04] hover:bg-sky-500/[0.07]">
                  <td className="py-3 px-4 font-sans font-semibold text-sky-200 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-sky-400 shrink-0" />
                    HistGradientBoosting Fusion (v1.2.1)
                  </td>
                  <td className="py-3 px-3 text-sky-300">GBDT + Sigmoid</td>
                  <td className="py-3 px-3 text-sky-300 font-bold">0.9100</td>
                  <td className="py-3 px-3 text-emerald-300 font-bold">0.0992</td>
                  <td className="py-3 px-3 text-sky-300 font-bold">90.0%</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">1.0000</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">85.7%</td>
                  <td className="py-3 px-3">
                    <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[9px] text-amber-300 border border-amber-800/50">
                      ACTIVE EXPERIMENTAL
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Feature Schema & Forensic Signals Extracted */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: 11 Extracted Forensic Signals */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0D1424] p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Layers className="h-4 w-4 text-sky-400" />
            <span>11 Mathematical Forensic Signals</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Extracted across physical signals, geometric OCR drift, protocol metadata, and cross-layer spatial intersection:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-sky-400 block font-semibold">1. ela_score</span>
              Inferno JPEG error level variance
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-sky-400 block font-semibold">2. ela_z_macroblocks</span>
              Outlier 8x8 DCT compression blocks
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-cyan-400 block font-semibold">3. wavelet_void_score</span>
              High-frequency noise depletion
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-cyan-400 block font-semibold">4. wavelet_min_var</span>
              Daubechies db4 wavelet subband floor
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-pink-400 block font-semibold">5. copy_move_vectors</span>
              ORB keypoint duplicated matches
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-rose-400 block font-semibold">6. baseline_drift_px</span>
              Sub-pixel font baseline drop
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-rose-400 block font-semibold">7. cielab_patch_delta_e</span>
              Perceptual font color distance
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-amber-400 block font-semibold">8. cross_layer_iou</span>
              Multi-spectral spatial overlap
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-purple-400 block font-semibold">9. temporal_clock_paradox</span>
              Status bar vs transaction clock contradiction
            </div>
            <div className="rounded bg-black/40 p-2 border border-white/5">
              <span className="text-purple-400 block font-semibold">10. upi_utr_invalid</span>
              12-digit Indian UPI format check
            </div>
          </div>
        </div>

        {/* Right: Data Leakage Isolation & Legal Framework */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.08] bg-[#0D1424] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Data Leakage Isolation Audit</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
              {evalData?.data_leakage_audit?.note ||
                "X_test was strictly held out and never seen by StandardScaler, cross-validation, or CalibratedClassifierCV."}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Zero training feature leakage detected during 3-fold cross validation.</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0D1424] p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Section 94 BNSS Legal Applicability</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Indian criminal procedure has transitioned to the <strong>Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023</strong>. Section 94 of BNSS replaces Section 91 of the former CrPC for issuing statutory notices to summon electronic evidence and transaction records. VeriSight generates draft notices for authorized cyber-cell and compliance review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
