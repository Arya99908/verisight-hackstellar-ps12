import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  Database,
  FileSearch,
  Layers,
  LineChart,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  analyzeDemoSample,
  fetchDemoSamples,
  fetchHealth,
  fetchModelEvaluation,
  fetchModelStatus,
  ModelEvaluationReport,
  ModelStatus,
} from "../services/api";
import { verdictLabel } from "../services/verdictLabel";
import { DemoSampleMeta, ForensicAnalysisReport } from "../types/forensic";

interface EvaluationDashboardProps {
  onNavigateWorkbench: (sampleId?: string) => void;
}

type FixtureRun = {
  state: "RUNNING" | "MATCH" | "DIFFERS" | "ERROR";
  elapsedMs?: number;
  observedLabel?: string;
  heuristicPoints?: number;
  cueCount?: number;
  error?: string;
};

const isSyntheticRegressionFixture = (sample: DemoSampleMeta) =>
  sample.tags.some((tag) => tag.toLowerCase().includes("synthetic"));

const expectationLabel = (sample: DemoSampleMeta) =>
  sample.expected_verdict === "USER_ASSERTED_AUTHENTIC"
    ? "User-asserted authentic · unverified"
    : verdictLabel(sample.expected_verdict);

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  detail: string;
  tone?: "sky" | "amber" | "slate";
}> = ({ label, value, detail, tone = "sky" }) => {
  const toneClass = tone === "amber" ? "text-amber-200" : tone === "slate" ? "text-slate-200" : "text-sky-200";
  return (
    <article className="rounded-xl border border-white/[0.08] bg-[#0C1322] p-4 shadow-lg shadow-black/10">
      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{detail}</p>
    </article>
  );
};

const CoverageCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  status: string;
  description: string;
}> = ({ icon, title, status, description }) => (
  <article className="rounded-xl border border-white/[0.08] bg-[#0C1322] p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-slate-100">
        <span className="text-sky-300">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <span className="shrink-0 rounded-full border border-emerald-800/60 bg-emerald-950/50 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide text-emerald-300">
        {status}
      </span>
    </div>
    <p className="mt-3 text-xs leading-relaxed text-slate-400">{description}</p>
  </article>
);

const formatTime = (milliseconds: number) =>
  milliseconds < 1000 ? `${milliseconds} ms` : `${(milliseconds / 1000).toFixed(1)} s`;

const ARCHIVE_THRESHOLDS = ["0.60", "0.50", "0.42", "0.39", "0.37", "0.34"];

/** Historical screenshot figures are reproduced for context, never presented as live measurements. */
const ArchivedEvaluationPanel: React.FC = () => {
  const [selectedThreshold, setSelectedThreshold] = useState("0.42");
  const hasRecordedPoint = selectedThreshold === "0.42";

  return (
    <section aria-labelledby="archive-evaluation-title" className="space-y-5">
      <header>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-sky-400">
          <LineChart className="h-4 w-4" /> Forensic engineering transparency
        </div>
        <h2 id="archive-evaluation-title" className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Model Registry &amp; ROC-AUC Evaluation
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">
          Historical figures transcribed from the supplied interface screenshots. Their source records, labels, and calculations have not been independently verified or reproduced by the deployed analyzer.
        </p>
      </header>

      <div role="note" className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-200">Archive figures · unverified · not live model output</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-100/80">
              The current deployment reports heuristic image-review cues only. It does not load the archived model, provide calibrated authenticity probabilities, or verify payment settlement. Treat every number below as an unverified historical claim, not evidence of current accuracy.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ArchiveMetric label="Archive ROC-AUC" value="0.9731" detail="Screenshot-reported · N=23 described samples" tone="sky" />
        <ArchiveMetric label="Archive Brier score" value="0.1124" detail="Screenshot-reported · calibration not verified" tone="green" />
        <ArchiveMetric label="Archive model name" value="verisight-fusion-gbdt-v1" detail="Version 1.2.1 · not deployed in this site" tone="sky" compact />
        <ArchiveMetric label="Data isolation" value="Claim unverified" detail="Screenshot says isolated; split records are unavailable" tone="amber" compact />
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0B1220] px-4 py-3 font-mono text-[11px] leading-6 text-slate-300 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
        <span><span className="text-slate-500">Dataset:</span> User-described WhatsApp screenshots</span>
        <span><span className="text-slate-500">Samples:</span> 23 (labels unverified)</span>
        <span><span className="text-rose-300">Manipulated:</span> 10 claimed</span>
        <span><span className="text-emerald-300">Authentic:</span> 13 claimed</span>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-white/[0.09] bg-[#080D18] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-sky-300">Recreated archive figure</p>
              <h3 className="mt-1 text-base font-semibold text-white">Receiver Operating Characteristic (ROC) Curve</h3>
            </div>
            <span className="rounded border border-amber-500/30 bg-amber-950/30 px-2 py-1 font-mono text-[10px] text-amber-200">AUC 0.9731 · unverified</span>
          </div>
          <div className="mt-4 rounded-xl bg-[#060911] p-2 sm:p-4">
            <svg viewBox="0 0 640 390" className="w-full" role="img" aria-label="Schematic recreation of the ROC curve shown in the supplied screenshot; source scores are unavailable.">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => {
                const x = 62 + tick * 530;
                const y = 318 - tick * 260;
                return <g key={tick}>
                  <line x1="62" y1={y} x2="592" y2={y} stroke="#1e293b" strokeDasharray="3 4" />
                  <line x1={x} y1="58" x2={x} y2="318" stroke="#1e293b" strokeDasharray="3 4" />
                  <text x="50" y={y + 4} textAnchor="end" fill="#64748b" fontSize="11">{tick.toFixed(1)}</text>
                  <text x={x} y="338" textAnchor="middle" fill="#64748b" fontSize="11">{tick.toFixed(1)}</text>
                </g>;
              })}
              <line x1="62" y1="318" x2="592" y2="58" stroke="#475569" strokeDasharray="5 5" />
              <path d="M 62 318 L 62 292 L 62 240 L 62 162 L 103 58 L 592 58" fill="none" stroke="#22c7f5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 62 318 L 62 292 L 62 240 L 62 162 L 103 58 L 592 58 L 592 318 Z" fill="#0ea5e9" opacity=".12" />
              {[[62,292],[62,240],[62,162],[103,58],[357,58],[592,58]].map(([x,y], index) => <circle key={index} cx={x} cy={y} r={index === 3 ? 6 : 4} fill="#22c7f5" stroke="#e0f2fe" strokeWidth="1.5" />)}
              <text x="327" y="376" textAnchor="middle" fill="#94a3b8" fontSize="12">False positive rate (1 − specificity)</text>
              <text x="18" y="190" textAnchor="middle" fill="#94a3b8" fontSize="12" transform="rotate(-90 18 190)">True positive rate (sensitivity)</text>
            </svg>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">Visual trace is an approximate recreation of the supplied screenshot. The original per-image scores and exact plotted coordinates were not provided.</p>
        </article>

        <article className="rounded-2xl border border-white/[0.09] bg-[#0B1220] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-sky-300" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Archive operating point</h3>
            </div>
            <span className="rounded border border-sky-500/30 bg-sky-950/50 px-2 py-1 font-mono text-xs font-bold text-sky-200">τ = {selectedThreshold}</span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">Select an archived threshold</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ARCHIVE_THRESHOLDS.map((threshold) => (
              <button
                key={threshold}
                type="button"
                aria-pressed={selectedThreshold === threshold}
                onClick={() => setSelectedThreshold(threshold)}
                className={`rounded-lg px-2 py-2 font-mono text-xs transition ${selectedThreshold === threshold ? "bg-sky-500 text-slate-950 font-bold" : "bg-[#151d2d] text-slate-300 hover:bg-[#202b40]"}`}
              >τ = {threshold}</button>
            ))}
          </div>

          {hasRecordedPoint ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <ArchiveMetric label="Sensitivity (TPR)" value="100.0%" detail="10 of 10 claimed positives" tone="green" compact />
                <ArchiveMetric label="Specificity" value="92.3%" detail="12 of 13 claimed negatives" tone="green" compact />
                <ArchiveMetric label="Precision (PPV)" value="90.9%" detail="10 / (10 + 1), archive counts" tone="sky" compact />
                <ArchiveMetric label="False-positive rate" value="7.7%" detail="1 false alarm of 13" tone="amber" compact />
              </div>
              <div className="mt-4 border-t border-white/[0.08] pt-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  <span>Confusion matrix at τ = 0.42</span><span>Archive counts</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <ConfusionCell label="True positive" value="10" tone="green" />
                  <ConfusionCell label="False positive" value="1" tone="rose" />
                  <ConfusionCell label="False negative" value="0" tone="amber" />
                  <ConfusionCell label="True negative" value="12" tone="green" />
                </div>
              </div>
            </>
          ) : (
            <div role="status" className="mt-4 rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-xs leading-relaxed text-amber-100/80">
              The supplied screenshots show counts only at τ = 0.42. No results were provided for τ = {selectedThreshold}; metrics are unavailable for this selection.
            </div>
          )}
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">Archive screenshot values are not live predictions or a verified real-world error rate. They do not verify whether funds settled.</p>
        </article>
      </div>
    </section>
  );
};

const ArchiveMetric: React.FC<{
  label: string;
  value: string;
  detail: string;
  tone: "sky" | "green" | "amber";
  compact?: boolean;
}> = ({ label, value, detail, tone, compact = false }) => {
  const color = tone === "green" ? "text-emerald-300" : tone === "amber" ? "text-amber-200" : "text-sky-200";
  const border = tone === "green" ? "border-emerald-500/20" : tone === "amber" ? "border-amber-500/20" : "border-sky-500/20";
  return (
    <article className={`rounded-xl border ${border} bg-[#0C1322] ${compact ? "p-3" : "p-4"}`}>
      <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 ${compact ? "text-lg" : "text-2xl"} font-semibold tabular-nums ${color}`}>{value}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{detail}</p>
    </article>
  );
};

const ConfusionCell: React.FC<{ label: string; value: string; tone: "green" | "rose" | "amber" }> = ({ label, value, tone }) => {
  const color = tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-300" : "text-emerald-300";
  const border = tone === "rose" ? "border-rose-500/30" : tone === "amber" ? "border-amber-500/30" : "border-emerald-500/30";
  return <div className={`rounded-lg border ${border} bg-black/20 p-2`}><p className="text-[9px] text-slate-400">{label}</p><p className={`mt-1 font-mono text-xl font-bold ${color}`}>{value}</p></div>;
};

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  onNavigateWorkbench,
}) => {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [evaluation, setEvaluation] = useState<ModelEvaluationReport | null>(null);
  const [health, setHealth] = useState<Awaited<ReturnType<typeof fetchHealth>> | null>(null);
  const [samples, setSamples] = useState<DemoSampleMeta[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fixtureRuns, setFixtureRuns] = useState<Record<string, FixtureRun>>({});
  const [runningFixtureId, setRunningFixtureId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    const [healthResult, statusResult, evaluationResult, samplesResult] = await Promise.allSettled([
      fetchHealth(),
      fetchModelStatus(),
      fetchModelEvaluation(),
      fetchDemoSamples(),
    ]);
    const errors: string[] = [];
    if (healthResult.status === "fulfilled") setHealth(healthResult.value);
    else errors.push("service health");
    if (statusResult.status === "fulfilled") setStatus(statusResult.value);
    else errors.push("analyzer status");
    if (evaluationResult.status === "fulfilled") setEvaluation(evaluationResult.value);
    else errors.push("evaluation data");
    if (samplesResult.status === "fulfilled") setSamples(samplesResult.value);
    else errors.push("demo fixture catalog");
    if (errors.length) setLoadError(`Could not refresh ${errors.join(", ")}. Use Refresh to try again.`);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const executeFixture = useCallback(async (sample: DemoSampleMeta) => {
    if (!isSyntheticRegressionFixture(sample)) return;
    setFixtureRuns((previous) => ({ ...previous, [sample.id]: { state: "RUNNING" } }));
    const startedAt = performance.now();
    try {
      const report: ForensicAnalysisReport = await analyzeDemoSample(sample.id);
      const elapsedMs = Math.round(performance.now() - startedAt);
      setFixtureRuns((previous) => ({
        ...previous,
        [sample.id]: {
          state: report.verdict === sample.expected_verdict ? "MATCH" : "DIFFERS",
          elapsedMs,
          observedLabel: verdictLabel(report.verdict),
          heuristicPoints: report.overall_tamper_score,
          cueCount: report.findings.length,
        },
      }));
    } catch (error) {
      setFixtureRuns((previous) => ({
        ...previous,
        [sample.id]: {
          state: "ERROR",
          elapsedMs: Math.round(performance.now() - startedAt),
          error: error instanceof Error ? error.message : "Fixture analysis failed.",
        },
      }));
    }
  }, []);

  const runSingleFixture = useCallback(async (sample: DemoSampleMeta) => {
    if (runningFixtureId || isRunningAll) return;
    setRunningFixtureId(sample.id);
    await executeFixture(sample);
    setRunningFixtureId(null);
  }, [executeFixture, isRunningAll, runningFixtureId]);

  const runAllFixtures = useCallback(async () => {
    const regressionFixtures = samples.filter(isSyntheticRegressionFixture);
    if (runningFixtureId || isRunningAll || regressionFixtures.length === 0) return;
    setFixtureRuns({});
    setIsRunningAll(true);
    for (const sample of regressionFixtures) {
      setRunningFixtureId(sample.id);
      await executeFixture(sample);
    }
    setRunningFixtureId(null);
    setIsRunningAll(false);
  }, [executeFixture, isRunningAll, runningFixtureId, samples]);

  const completedRuns = useMemo(
    () => Object.values(fixtureRuns).filter((run) => run.state !== "RUNNING"),
    [fixtureRuns],
  );
  const matchingRuns = completedRuns.filter((run) => run.state === "MATCH").length;
  const apiHealthy = health?.status === "HEALTHY" || health?.status === "ok";
  const databaseHealthy = health?.database === "HEALTHY";
  const independentReferences = evaluation
    ? evaluation.dataset_summary.independent_authentic_references +
      evaluation.dataset_summary.independent_manipulated_references
    : null;
  const checkBusy = isRunningAll || runningFixtureId !== null;

  return (
    <main className="flex-1 overflow-y-auto bg-[#060911] p-4 text-slate-100 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-6xl space-y-6 pb-8">
        <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-400">VeriSight transparency</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Evaluation & Research Center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Inspect what is running, exercise the bundled demo cases, and see which performance claims the current data can support.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#101827] px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing…" : "Refresh status"}
            </button>
            <button
              type="button"
              onClick={() => onNavigateWorkbench()}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3.5 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-500/25"
            >
              Open workbench <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {loadError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-100">
            <span>{loadError}</span>
            <button type="button" onClick={() => void refresh()} className="rounded border border-amber-500/30 px-2.5 py-1 hover:bg-amber-500/10">Retry</button>
          </div>
        )}

        <ArchivedEvaluationPanel />

        <section className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-[#0D1A30] via-[#0A1221] to-[#0A0F1A] p-5 shadow-xl sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-sky-200">
                <Activity className="h-4 w-4" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">Active review engine</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                {apiHealthy
                  ? "Image-analysis service is responding"
                  : health
                    ? "Image-analysis service is unavailable"
                    : isRefreshing
                      ? "Checking image-analysis service"
                      : "Service status is unavailable"}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {status?.architecture || "Deterministic four-layer image review"}. The scanner produces image-review cues and reviewer evidence. It has no deployed authenticity classifier, and its score is not a probability.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-[290px]">
              <StatusTile label="API service" ok={apiHealthy} value={health ? (apiHealthy ? "Connected" : health.status) : "Checking"} />
              <StatusTile label="Database" ok={databaseHealthy} value={health ? (databaseHealthy ? "Connected" : health.database) : "Checking"} />
              <StatusTile label="Classifier" ok={false} value="Not deployed" />
              <StatusTile label="Calibration" ok={false} value="Not calibrated" />
            </div>
          </div>
        </section>

        <section aria-label="Current evaluation data" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Bundled examples"
            value={evaluation?.dataset_summary.synthetic_fixtures ?? "—"}
            detail="Constructed synthetic fixtures"
          />
          <MetricCard
            label="Independent references"
            value={independentReferences ?? "—"}
            detail="Authentic and manipulated labeled images"
            tone="amber"
          />
          <MetricCard
            label="Held-out test cases"
            value={evaluation?.dataset_summary.held_out_test_samples ?? "—"}
            detail="Locked, independent test split"
            tone="amber"
          />
          <MetricCard
            label="Measured accuracy"
            value="N/A"
            detail="Not reported without representative labeled data"
            tone="slate"
          />
        </section>

        <section className="space-y-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Implemented in this prototype</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Functional coverage</h2>
            </div>
            <p className="max-w-xl text-[11px] leading-relaxed text-slate-500">
              These are available mechanisms, not claims of forensic accuracy or bank verification.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <CoverageCard
              icon={<Layers className="h-4 w-4" />}
              title="Pixel and compression cues"
              status="Implemented"
              description="ELA residual display, wavelet-noise variation, JPEG recompression profile, and ORB repeated-feature candidates. Cues can also occur after normal resizing or app compression."
            />
            <CoverageCard
              icon={<FileSearch className="h-4 w-4" />}
              title="Layout and text-like geometry"
              status="Implemented"
              description="Connected components, baseline alignment, local color and sharpness comparisons. The deployed mode does not read visible words, amounts, or recipient names with OCR."
            />
            <CoverageCard
              icon={<Database className="h-4 w-4" />}
              title="Metadata, QR, and provenance cues"
              status="Implemented"
              description="Reads supported metadata, decodes readable QR payloads, and reports possible C2PA markers as unverified. QR text and metadata are not checked against a bank or issuer."
            />
            <CoverageCard
              icon={<Sparkles className="h-4 w-4" />}
              title="AI-origin evidence panel"
              status="Signals only"
              description="Shows known generator strings in metadata, generic pixel cues, and checks that are unavailable. There is no calibrated AI-origin classifier, visible-logo scan, or SynthID reader."
            />
            <CoverageCard
              icon={<Activity className="h-4 w-4" />}
              title="Reviewer workspace"
              status="Implemented"
              description="Original and forensic views, region overlays, split comparison, loupe and zoom controls, case selection, findings, and a downloadable review memo/report."
            />
            <CoverageCard
              icon={<Upload className="h-4 w-4" />}
              title="Intake and case storage"
              status="Implemented"
              description="Browser and mobile upload flows, recompression simulation, and case-summary persistence. The case table stores analysis metadata, not the original screenshot bytes."
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0B1220]">
          <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <div className="flex items-center gap-2 text-sky-300">
                <ShieldAlert className="h-4 w-4" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">Regression fixture check</span>
              </div>
              <h2 className="mt-1 text-lg font-semibold text-white">Run the bundled examples</h2>
              <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-slate-400">
                Each run calls the live analysis API only on a bundled synthetic fixture and compares the returned review label with its configured software expectation. User-submitted examples are excluded because they are not independent ground truth. This is not an accuracy benchmark.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void runAllFixtures()}
              disabled={checkBusy || !samples.some(isSyntheticRegressionFixture)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3.5 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunningAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
              {isRunningAll ? `Checking ${runningFixtureId ? runningFixtureId.replace("sample_", "sample ") : "fixtures"}…` : "Run synthetic fixture checks"}
            </button>
          </div>

          {completedRuns.length > 0 && (
            <div role="status" className="border-b border-white/[0.08] bg-[#0E1A2C] px-4 py-3 text-xs text-slate-300 sm:px-5">
              {isRunningAll ? (
                <span>Fixture checks running: {completedRuns.length} of {samples.filter(isSyntheticRegressionFixture).length} completed.</span>
              ) : (
                <span>
                  {matchingRuns} of {completedRuns.length} completed run(s) matched configured fixture expectations. This result applies only to these synthetic examples, not real-world detection accuracy.
                </span>
              )}
            </div>
          )}

          {samples.length === 0 ? (
            <div className="p-5 text-sm text-slate-400">{isRefreshing ? "Loading the fixture catalog…" : "No demo fixtures are available. Refresh the page status to retry."}</div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {samples.map((sample, index) => {
                const run = fixtureRuns[sample.id];
                const isActive = run?.state === "RUNNING";
                const stateStyle = run?.state === "MATCH"
                  ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300"
                  : run?.state === "DIFFERS" || run?.state === "ERROR"
                    ? "border-amber-800/60 bg-amber-950/40 text-amber-300"
                    : "border-slate-700 bg-slate-900 text-slate-400";
                const runLabel = run?.state === "MATCH"
                  ? "Expectation matched"
                  : run?.state === "DIFFERS"
                    ? "Output differed"
                    : run?.state === "ERROR"
                      ? "Run failed"
                      : run?.state === "RUNNING"
                        ? "Running…"
                        : isSyntheticRegressionFixture(sample) ? "Not run yet" : "Not evaluated";
                return (
                  <article key={sample.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-950/40 font-mono text-[10px] font-bold text-sky-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-slate-100">{sample.title}</h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{sample.scenario}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                          <span className={`rounded border px-2 py-0.5 ${isSyntheticRegressionFixture(sample) ? "border-white/10 bg-black/20 text-slate-400" : "border-amber-800/50 bg-amber-950/30 text-amber-200"}`}>
                            {isSyntheticRegressionFixture(sample) ? "Synthetic regression fixture" : "User-provided · not ground truth"}
                          </span>
                          <span className="text-slate-500">Configured expectation: <strong className="font-medium text-slate-300">{expectationLabel(sample)}</strong></span>
                          {run?.observedLabel && <span className="text-slate-500">Observed: <strong className="font-medium text-slate-200">{run.observedLabel}</strong></span>}
                          {run?.heuristicPoints !== undefined && <span className="text-slate-500">{run.heuristicPoints.toFixed(1)} heuristic points</span>}
                          {run?.cueCount !== undefined && <span className="text-slate-500">{run.cueCount} review cues</span>}
                          {run?.elapsedMs !== undefined && <span className="text-slate-500">{formatTime(run.elapsedMs)}</span>}
                        </div>
                        {run?.error && <p className="mt-2 text-[10px] text-amber-300">{run.error}</p>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pl-10 sm:pl-0">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-mono ${stateStyle}`}>
                        {run?.state === "MATCH" ? <Check className="mr-1 h-3 w-3" /> : null}
                        {run?.state === "ERROR" ? <X className="mr-1 h-3 w-3" /> : null}
                        {run?.state === "RUNNING" ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                        {runLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => void runSingleFixture(sample)}
                        disabled={checkBusy || !isSyntheticRegressionFixture(sample)}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
                      >
                        {isActive ? "Running…" : "Run check"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateWorkbench(sample.id)}
                        disabled={checkBusy}
                        className="inline-flex items-center gap-1 rounded-lg border border-sky-500/25 bg-sky-500/[0.08] px-2.5 py-1.5 text-[10px] text-sky-200 transition hover:bg-sky-500/[0.16] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Open case <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-white/[0.08] bg-[#0C1322] p-5">
            <div className="flex items-center gap-2 text-slate-100">
              <Database className="h-4 w-4 text-sky-300" />
              <h2 className="text-sm font-semibold">What the current data supports</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              The five bundled files are synthetic examples created for demonstrations and regression checks. There are currently no independently labeled authentic or manipulated payment screenshots and no held-out test split.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <UnavailableMetric label="False-positive / false-negative rates" />
              <UnavailableMetric label="Precision, recall, and PR-AUC" />
              <UnavailableMetric label="Localization IoU / F1" />
              <UnavailableMetric label="Confidence calibration" />
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
              {evaluation?.message || "Metrics remain unavailable until an authorized, representative labeled dataset and locked test set are available."}
            </p>
          </article>

          <article className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              <h2 className="text-sm font-semibold">Use the output as review evidence</h2>
            </div>
            <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-slate-300">
              <li>• A configured expectation match checks only repeatable demo behavior; the fixture label is not independent ground truth.</li>
              <li>• A detected cue can be caused by normal compression, rescaling, UI design, or capture conditions.</li>
              <li>• Visible text and QR contents are not verified with the issuer or recipient.</li>
              <li>• Screenshot analysis cannot confirm whether funds settled; that requires an authorized bank or payment-provider status integration.</li>
            </ul>
            <button
              type="button"
              onClick={() => onNavigateWorkbench()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[10px] font-medium text-amber-100 transition hover:bg-amber-500/15"
            >
              Inspect an image in the workbench <ArrowRight className="h-3 w-3" />
            </button>
          </article>
        </section>
      </section>
    </main>
  );
};

const StatusTile: React.FC<{ label: string; value: string; ok: boolean }> = ({ label, value, ok }) => (
  <div className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2">
    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-1 flex items-center gap-1.5 text-[11px] font-medium ${ok ? "text-emerald-300" : "text-amber-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />{value}
    </p>
  </div>
);

const UnavailableMetric: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2">
    <span className="text-[10px] text-slate-400">{label}</span>
    <span className="shrink-0 rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">Not measured</span>
  </div>
);
