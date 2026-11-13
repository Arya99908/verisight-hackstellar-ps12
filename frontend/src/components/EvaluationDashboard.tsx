import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  Database,
  FileSearch,
  Layers,
  Loader2,
  RefreshCw,
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
