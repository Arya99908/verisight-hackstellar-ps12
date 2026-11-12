import React, { lazy, Suspense, useEffect, useState, useCallback, useRef } from "react";
import { NavigationHeader, AppRoute } from "./components/NavigationHeader";
import { Toaster, toast } from "sonner";
import { UploadCloud } from "lucide-react";
import type { ViewMode } from "./components/ForensicViewer";
import type { AttachedForensicContext } from "./types/response";
import {
  ForensicAnalysisReport,
  DemoSampleMeta,
  WhatsAppSimulationResponse,
  BoundingBox,
} from "./types/forensic";
import {
  fetchDemoSamples,
  analyzeDemoSample,
  analyzeUpload,
  simulateWhatsApp,
  fetchHealth,
} from "./services/api";

const ProductOverview = lazy(() => import("./components/ProductOverview").then((m) => ({ default: m.ProductOverview })));
const EvaluationDashboard = lazy(() => import("./components/EvaluationDashboard").then((m) => ({ default: m.EvaluationDashboard })));
const TopCommandBar = lazy(() => import("./components/TopCommandBar").then((m) => ({ default: m.TopCommandBar })));
const ForensicViewer = lazy(() => import("./components/ForensicViewer").then((m) => ({ default: m.ForensicViewer })));
const RiskDossierSidebar = lazy(() => import("./components/RiskDossierSidebar").then((m) => ({ default: m.RiskDossierSidebar })));
const AmbientThreatBackground = lazy(() => import("./components/AmbientThreatBackground").then((m) => ({ default: m.AmbientThreatBackground })));
const WhatsAppSimulatorModal = lazy(() => import("./components/WhatsAppSimulatorModal").then((m) => ({ default: m.WhatsAppSimulatorModal })));
const MobileUploadModal = lazy(() => import("./components/MobileUploadModal").then((m) => ({ default: m.MobileUploadModal })));
const MobileUploadView = lazy(() => import("./components/MobileUploadView").then((m) => ({ default: m.MobileUploadView })));
const ForensicReportModal = lazy(() => import("./components/ForensicReportModal").then((m) => ({ default: m.ForensicReportModal })));
const InternalReviewMemoModal = lazy(() => import("./components/InternalReviewMemoModal").then((m) => ({ default: m.InternalReviewMemoModal })));
const KeyboardShortcutsModal = lazy(() => import("./components/KeyboardShortcutsModal").then((m) => ({ default: m.KeyboardShortcutsModal })));
const WhyVerisight = lazy(() => import("./components/WhyVerisight").then((m) => ({ default: m.WhyVerisight })));
const ResponseModule = lazy(() => import("./components/response/ResponseModule").then((m) => ({ default: m.ResponseModule })));

const RouteLoadingFallback = () => (
  <div role="status" className="grid min-h-48 flex-1 place-items-center bg-[#070b14] text-sm text-slate-300">
    Loading VeriSight…
  </div>
);

const getRouteFromLocation = (): AppRoute => {
  const path = window.location.pathname;
  if (path === "/workbench") return "/workbench";
  if (path === "/evaluation") return "/evaluation";
  if (path === "/response") return "/response";
  if (path === "/why-verisight") return "/why-verisight";
  return "/";
};

export const App: React.FC = () => {
  const isMobileMode =
    new URLSearchParams(window.location.search).get("mode") === "mobile";

  if (isMobileMode) {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <MobileUploadView />
      </Suspense>
    );
  }

  return <MainProductApplication />;
};

const MainProductApplication: React.FC = () => {
  // Routing State
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromLocation);
  const initialRoute = useRef(currentRoute);

  // Shared Data State
  const [demoSamples, setDemoSamples] = useState<DemoSampleMeta[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get("case") || "sample_1";
  });
  const [report, setReport] = useState<ForensicAnalysisReport | null>(null);
  const [attachedForensicContext, setAttachedForensicContext] = useState<AttachedForensicContext | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [selectedLocus, setSelectedLocus] = useState<BoundingBox | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const analysisRequestRef = useRef(0);
  const [databaseStatus, setDatabaseStatus] = useState<
    "CHECKING" | "HEALTHY" | "UNAVAILABLE" | "NOT_CONFIGURED"
  >("CHECKING");
  const [demoLoadFailed, setDemoLoadFailed] = useState(false);
  const [demoRetry, setDemoRetry] = useState(0);

  // Workstation Ergonomics State
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("ORIGINAL");
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Drag and drop overlay state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);

  // Modals state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState<boolean>(false);
  const [whatsAppData, setWhatsAppDat] = useState<WhatsAppSimulationResponse | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isReviewMemoOpen, setIsReviewMemoOpen] = useState<boolean>(false);

  // Handle selecting a golden demo sample
  const handleSelectSample = useCallback(async (sampleId: string) => {
    const requestId = ++analysisRequestRef.current;
    setSelectedSampleId(sampleId);
    setSelectedLocus(null);
    setViewMode("ORIGINAL");
    setIsLoading(true);
    setAppError(null);

    try {
      const res = await analyzeDemoSample(sampleId);
      if (requestId !== analysisRequestRef.current) return;
      setReport(res);
    } catch (err) {
      if (requestId !== analysisRequestRef.current) return;
      setAppError(
        `Sample analysis failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      toast.error(`Analysis failed for ${sampleId}`);
    } finally {
      if (requestId === analysisRequestRef.current) setIsLoading(false);
    }
  }, []);

  // Synchronized Client-Side Navigation
  const handleNavigate = useCallback(
    (
      route: AppRoute,
      query?: Record<string, string>,
      options?: { skipWorkbenchLoad?: boolean },
    ) => {
      let targetUrl = route;
      if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams(query);
        targetUrl += `?${params.toString()}`;
      }
      window.history.pushState({}, "", targetUrl);
      setCurrentRoute(route);

      if (query?.case) {
        void handleSelectSample(query.case);
      } else if (
        !options?.skipWorkbenchLoad &&
        route === "/workbench" &&
        currentRoute !== "/workbench" &&
        !report
      ) {
        void handleSelectSample(selectedSampleId || "sample_1");
      }
    },
    [currentRoute, handleSelectSample, report, selectedSampleId]
  );

  const handleOpenResponseGuidance = useCallback((targetReport: ForensicAnalysisReport) => {
    setAttachedForensicContext({
      case_id: `VS-CASE-${targetReport.file_sha256.slice(0, 8).toUpperCase()}`,
      filename: targetReport.filename || "screenshot.png",
      file_sha256: targetReport.file_sha256,
      image_width: targetReport.image_width,
      image_height: targetReport.image_height,
      overall_tamper_score: targetReport.overall_tamper_score,
      verdict: targetReport.verdict,
      findings: targetReport.findings,
      synergy: targetReport.synergy,
      limitations: "These are heuristic image-review cues. They do not establish authenticity or payment settlement.",
    });
    handleNavigate("/response");
  }, [handleNavigate]);

  // Listen to browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteFromLocation());
      const queryCase = new URLSearchParams(window.location.search).get("case");
      if (queryCase && queryCase !== selectedSampleId) {
        void handleSelectSample(queryCase);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handleSelectSample, selectedSampleId]);

  // Request catalog and initial sample in parallel
  useEffect(() => {
    let active = true;
    fetchHealth()
      .then((health) => {
        if (active) setDatabaseStatus(health.database);
      })
      .catch(() => {
        if (active) setDatabaseStatus("UNAVAILABLE");
      });

    const catalogRequest = fetchDemoSamples()
      .then((samples) => {
        if (!active) return;
        setDemoSamples(samples);
        setDemoLoadFailed(false);
        if (samples.length === 0) {
          setAppError("The demo sample list is empty.");
        }
      })
      .catch((err) => {
        if (!active) return;
        setDemoLoadFailed(true);
        setAppError(`Could not load demo samples: ${err.message}`);
      });
    void catalogRequest;

    // Load an initial report only for a direct workbench link. The overview
    // must not start a costly analysis the visitor has not requested.
    if (initialRoute.current === "/workbench") {
      const initCase = new URLSearchParams(window.location.search).get("case") || "sample_1";
      void handleSelectSample(initCase);
    }

    return () => {
      active = false;
    };
  }, [demoRetry, handleSelectSample]);

  // Global Keyboard Navigation Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Sample 1 - 5 shortcuts
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const sampleId = `sample_${e.key}`;
        if (currentRoute !== "/workbench") {
          handleNavigate("/workbench", { case: sampleId });
        } else {
          void handleSelectSample(sampleId);
        }
        return;
      }

      // View Modes (only when on workbench)
      if (currentRoute === "/workbench") {
        const key = e.key.toLowerCase();
        if (key === "o") {
          e.preventDefault();
          setViewMode("ORIGINAL");
          toast("Original View applied");
        } else if (key === "e") {
          e.preventDefault();
          setViewMode("ELA");
          toast("Compression (ELA) Heatmap applied");
        } else if (key === "w") {
          e.preventDefault();
          setViewMode("WAVELET");
          toast("Noise (Wavelet) applied");
        } else if (key === "c") {
          e.preventDefault();
          setViewMode("COPY_MOVE");
          toast("Clones (ORB) applied");
        } else if (key === "s") {
          e.preventDefault();
          setViewMode("SPLIT");
          toast("Split Comparison Slider active");
        } else if (key === "l") {
          e.preventDefault();
          setViewMode("LOUPE");
          toast("Dual Loupe active");
        } else if (key === "q") {
          e.preventDefault();
          setViewMode("QUAD");
          toast("Quad-Spectral Matrix active");
        } else if (e.key === "[") {
          e.preventDefault();
          setIsSidebarCollapsed((prev) => !prev);
        } else if (key === "m") {
          e.preventDefault();
          setIsAdvancedMode((prev) => !prev);
          toast(`Mode switched: ${!isAdvancedMode ? "Forensic Advanced" : "Simple"}`);
        } else if (e.key === "?") {
          e.preventDefault();
          setIsShortcutsModalOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectSample, isAdvancedMode, currentRoute, handleNavigate]);

  // Handle custom screenshot upload
  const handleFileUpload = async (file: File) => {
    const requestId = ++analysisRequestRef.current;
    setSelectedSampleId(null);
    setSelectedLocus(null);
    setViewMode("ORIGINAL");
    setIsLoading(true);
    setAppError(null);

    // Switch to workbench if not already there
    if (currentRoute !== "/workbench") {
      handleNavigate("/workbench", undefined, { skipWorkbenchLoad: true });
    }

    try {
      const res = await analyzeUpload(file);
      if (requestId !== analysisRequestRef.current) return;
      setReport(res);
      toast.success(`Analyzed screenshot: ${file.name}`);
    } catch (err) {
      if (requestId !== analysisRequestRef.current) return;
      setAppError(
        `Upload analysis failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      toast.error("Upload analysis failed");
    } finally {
      if (requestId === analysisRequestRef.current) setIsLoading(false);
    }
  };

  // Full window drag-and-drop support
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDraggingFile(false);
      dragCounter.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    dragCounter.current = 0;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        void handleFileUpload(file);
      } else {
        toast.error("Please drop an image file (PNG, JPG, WebP, BMP)");
      }
    }
  };

  // Handle WhatsApp simulation on current screenshot
  const handleTriggerWhatsAppSimulation = async () => {
    if (!report) return;
    setIsWhatsAppModalOpen(true);
    setIsWhatsAppLoading(true);

    try {
      const base64Data =
        report.original_image_b64.split(",")[1] || report.original_image_b64;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const previewMime =
        report.original_image_b64.match(/^data:([^;]+);/)?.[1] || "image/png";
      const blob = new Blob([byteArray], { type: previewMime });

      const simRes = await simulateWhatsApp(
        blob,
        report.filename || "screenshot.png"
      );
      setWhatsAppDat(simRes);
      toast.success("WhatsApp simulation completed");
    } catch (err) {
      setAppError(
        `WhatsApp simulation failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      toast.error("WhatsApp simulation failed");
    } finally {
      setIsWhatsAppLoading(false);
    }
  };

  // Handle stage judge live mobile upload arrival
  const handleMobileUploadReceived = (newReport: ForensicAnalysisReport) => {
    analysisRequestRef.current += 1;
    setSelectedSampleId(null);
    setSelectedLocus(null);
    setReport(newReport);
    setIsLoading(false);
    if (currentRoute !== "/workbench") {
      handleNavigate("/workbench", undefined, { skipWorkbenchLoad: true });
    }
    toast.success("Live mobile screenshot received");
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-[#060911] text-slate-100"
    >
      {/* 1. Global Unified Navigation Header */}
      <NavigationHeader
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        databaseStatus={databaseStatus}
      />

      {/* 2. Main Routed View Area */}
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        <Suspense fallback={<RouteLoadingFallback />}>
          {/* Experience A: Product Overview */}
          {currentRoute === "/" && (
            <ProductOverview
              onNavigate={handleNavigate}
              demoSamples={demoSamples}
            />
          )}

          {/* Experience B: Forensic Workbench */}
          {currentRoute === "/workbench" && (
            <AmbientThreatBackground threatScore={report?.overall_tamper_score || 0}>
            {/* Top Workbench Command Bar */}
            <TopCommandBar
              databaseStatus={databaseStatus}
              demoSamples={demoSamples}
              selectedSampleId={selectedSampleId}
              onSelectSample={handleSelectSample}
              onFileUpload={handleFileUpload}
              onOpenWhatsAppModal={handleTriggerWhatsAppSimulation}
              onOpenMobileModal={() => setIsMobileModalOpen(true)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenReviewMemo={() => setIsReviewMemoOpen(true)}
              onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
              isAdvancedMode={isAdvancedMode}
              onToggleAdvancedMode={() => setIsAdvancedMode((prev) => !prev)}
              isLoading={isLoading}
            />

            {/* Error Banner */}
            {appError && (
              <div
                role="alert"
                className="flex items-center justify-between border-b border-rose-800 bg-rose-950/80 px-4 py-2 text-xs text-rose-200 z-30 shrink-0"
              >
                <span>{appError}</span>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  {demoLoadFailed && (
                    <button
                      onClick={() => setDemoRetry((n) => n + 1)}
                      className="text-rose-100 underline hover:text-white"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => setAppError(null)}
                    className="text-rose-100 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Main Forensic Workspace: Multi-Spectral Viewer + Collapsible Risk Dossier */}
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden relative z-10">
              <ForensicViewer
                report={report}
                selectedLocus={selectedLocus}
                onSelectLocus={(box) => setSelectedLocus(box)}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                isAdvancedMode={isAdvancedMode}
                viewMode={viewMode}
                onViewModeChange={(m) => setViewMode(m)}
              />
              <RiskDossierSidebar
                report={report}
                selectedLocus={selectedLocus}
                onSelectLocus={(box) => setSelectedLocus(box)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
                isAdvancedMode={isAdvancedMode}
                onOpenReport={() => setIsReportModalOpen(true)}
                onOpenReviewMemo={() => setIsReviewMemoOpen(true)}
                onOpenResponseGuidance={() => report && handleOpenResponseGuidance(report)}
              />
            </main>
            </AmbientThreatBackground>
          )}

          {/* Experience C: Research & Evaluation Dashboard */}
          {currentRoute === "/evaluation" && (
            <EvaluationDashboard
              onNavigateWorkbench={(sampleId) =>
                sampleId
                  ? handleNavigate("/workbench", { case: sampleId })
                  : handleNavigate("/workbench")
              }
            />
          )}

          {currentRoute === "/why-verisight" && (
            <WhyVerisight onNavigateWorkbench={() => handleNavigate("/workbench")} />
          )}

          {currentRoute === "/response" && (
            <ResponseModule
              onNavigateWorkbench={() => handleNavigate("/workbench")}
              attachedForensicContext={attachedForensicContext}
              onClearForensicContext={() => setAttachedForensicContext(null)}
            />
          )}
        </Suspense>
      </div>

      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b16]/90 backdrop-blur-md border-4 border-dashed border-sky-400 p-8 text-center animate-in fade-in duration-200 pointer-events-none">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 mb-4 border border-sky-400/40 shadow-xl">
            <UploadCloud className="h-10 w-10 animate-bounce" />
          </div>
          <p className="text-xl font-bold font-mono text-white tracking-wide">
            RELEASE EVIDENCE TO INGEST
          </p>
          <p className="text-xs font-mono text-sky-300 mt-2">
            Supports PNG, JPG, WebP, BMP up to 20MB
          </p>
        </div>
      )}

      {/* Modals */}
      {isWhatsAppModalOpen && (
        <Suspense fallback={null}>
          <WhatsAppSimulatorModal
            isOpen={isWhatsAppModalOpen}
            onClose={() => setIsWhatsAppModalOpen(false)}
            simulationData={whatsAppData}
            isLoading={isWhatsAppLoading}
            onApplyLaunderedImage={(newReport) => setReport(newReport)}
          />
        </Suspense>
      )}

      {isMobileModalOpen && (
        <Suspense fallback={null}>
          <MobileUploadModal
            isOpen={isMobileModalOpen}
            onClose={() => setIsMobileModalOpen(false)}
            onMobileUploadReceived={handleMobileUploadReceived}
          />
        </Suspense>
      )}

      {isReportModalOpen && (
        <Suspense fallback={null}>
          <ForensicReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            report={report}
          />
        </Suspense>
      )}

      {isReviewMemoOpen && report && (
        <Suspense fallback={null}>
          <InternalReviewMemoModal
            report={report}
            onClose={() => setIsReviewMemoOpen(false)}
          />
        </Suspense>
      )}

      {isShortcutsModalOpen && (
        <Suspense fallback={null}>
          <KeyboardShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Tactile Toaster (`ask-sonner` forensic theme) */}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(13, 19, 34, 0.96)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#e2e8f0",
            fontFamily: "ui-monospace, monospace",
            fontSize: "12px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </div>
  );
};
