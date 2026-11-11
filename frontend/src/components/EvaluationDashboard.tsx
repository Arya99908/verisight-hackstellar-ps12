import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Database, ShieldAlert } from "lucide-react";
import {
  fetchModelEvaluation,
  fetchModelStatus,
  ModelEvaluationReport,
  ModelStatus,
} from "../services/api";

interface EvaluationDashboardProps {
  onNavigateWorkbench: () => void;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  onNavigateWorkbench,
}) => {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [evaluation, setEvaluation] = useState<ModelEvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchModelStatus(), fetchModelEvaluation()])
      .then(([model, report]) => {
        if (!active) return;
        setStatus(model);
        setEvaluation(report);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Status unavailable");
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="flex-1 overflow-y-auto bg-[#060911] p-4 text-slate-100 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Forensic transparency</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Analyzer status & evaluation</h1>
          </div>
          <button onClick={onNavigateWorkbench} className="flex items-center gap-2 self-start rounded-lg border border-sky-500/40 bg-sky-500/15 px-4 py-2 text-sm text-sky-200 hover:bg-sky-500/25">
            Open workbench <ArrowRight className="h-4 w-4" />
          </button>
        </header>

        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
          <p>No trained or calibrated authenticity classifier is deployed. VeriSight reports heuristic review cues; it does not estimate a validated probability, prove an image is genuine or edited, or verify a payment.</p>
        </div>

        {error ? (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">Could not load analyzer status: {error}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-white/10 bg-[#0D1424] p-5">
              <div className="flex items-center gap-2 text-slate-300"><ShieldAlert className="h-5 w-5 text-sky-300" /> Deployed analyzer</div>
              <p className="mt-4 font-mono text-lg font-semibold text-white">{status?.status ?? "Loading…"}</p>
              <dl className="mt-4 space-y-2 text-sm text-slate-400">
                <div className="flex justify-between gap-4"><dt>Method</dt><dd className="text-right text-slate-200">{status?.architecture ?? "—"}</dd></div>
                <div className="flex justify-between gap-4"><dt>Calibration</dt><dd className="text-right text-amber-300">{status?.calibration_status ?? "—"}</dd></div>
                <div className="flex justify-between gap-4"><dt>Classifier</dt><dd className="text-right text-slate-200">None deployed</dd></div>
              </dl>
            </article>

            <article className="rounded-xl border border-white/10 bg-[#0D1424] p-5">
              <div className="flex items-center gap-2 text-slate-300"><Database className="h-5 w-5 text-sky-300" /> Evaluation data</div>
              <p className="mt-4 font-mono text-lg font-semibold text-white">{evaluation?.status ?? "Loading…"}</p>
              <dl className="mt-4 space-y-2 text-sm text-slate-400">
                <div className="flex justify-between"><dt>Bundled synthetic fixtures</dt><dd className="text-slate-200">{evaluation?.dataset_summary.synthetic_fixtures ?? "—"}</dd></div>
                <div className="flex justify-between"><dt>Independent labeled references</dt><dd className="text-slate-200">{evaluation ? evaluation.dataset_summary.independent_authentic_references + evaluation.dataset_summary.independent_manipulated_references : "—"}</dd></div>
                <div className="flex justify-between"><dt>Held-out test cases</dt><dd className="text-slate-200">{evaluation?.dataset_summary.held_out_test_samples ?? "—"}</dd></div>
                <div className="flex justify-between"><dt>Accuracy / calibrated confidence</dt><dd className="text-amber-300">Not available</dd></div>
              </dl>
            </article>
          </div>
        )}
        {status && <p className="text-xs leading-relaxed text-slate-500">{status.message} {evaluation?.message}</p>}
      </section>
    </main>
  );
};
