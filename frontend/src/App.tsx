import React, { useEffect, useState } from "react";
import { TopCommandBar } from "./components/TopCommandBar";
import { ForensicViewer } from "./components/ForensicViewer";
import { RiskDossierSidebar } from "./components/RiskDossierSidebar";
import { WhatsAppSimulatorModal } from "./components/WhatsAppSimulatorModal";
import { MobileUploadModal } from "./components/MobileUploadModal";
import { MobileUploadView } from "./components/MobileUploadView";
import { ForensicReportModal } from "./components/ForensicReportModal";
import { Section91NoticeModal } from "./components/Section91NoticeModal";
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

export const App: React.FC = () => {
  const isMobileMode =
    new URLSearchParams(window.location.search).get("mode") === "mobile";
  return isMobileMode ? <MobileUploadView /> : <DesktopWorkbench />;
};

const DesktopWorkbench: React.FC = () => {
  // Desktop Workbench State
  const [demoSamples, setDemoSamples] = useState<DemoSampleMeta[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(
    "sample_1",
  );
  const [report, setReport] = useState<ForensicAnalysisReport | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [selectedLocus, setSelectedLocus] = useState<BoundingBox | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [databaseStatus, setDatabaseStatus] = useState<"CHECKING" | "HEALTHY" | "UNAVAILABLE" | "NOT_CONFIGURED">("CHECKING");
  const [demoLoadFailed, setDemoLoadFailed] = useState(false);
  const [demoRetry, setDemoRetry] = useState(0);

  // Modals state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] =
    useState<boolean>(false);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState<boolean>(false);
  const [whatsAppData, setWhatsAppDat] =
    useState<WhatsAppSimulationResponse | null>(null);

  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSection91ModalOpen, setIsSection91ModalOpen] = useState<boolean>(false);

  // Keep the normal Sample 1 startup view, but request the catalog and analysis
  // in parallel so the catalog request does not add a serial round trip.
  useEffect(() => {
    let active = true;
    fetchHealth()
      .then((health) => { if (active) setDatabaseStatus(health.database); })
      .catch(() => { if (active) setDatabaseStatus("UNAVAILABLE"); });

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
    void handleSelectSample("sample_1");
    return () => { active = false; };
  }, [demoRetry]);

  // Handle selecting a golden demo sample
  async function handleSelectSample(sampleId: string) {
    setSelectedSampleId(sampleId);
    setSelectedLocus(null);
    setIsLoading(true);
    setAppError(null);

    try {
      const res = await analyzeDemoSample(sampleId);
      setReport(res);
    } catch (err) {
      setAppError(`Sample analysis failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle custom screenshot upload
  const handleFileUpload = async (file: File) => {
    setSelectedSampleId(null);
    setSelectedLocus(null);
    setIsLoading(true);
    setAppError(null);

    try {
      const res = await analyzeUpload(file);
      setReport(res);
    } catch (err) {
      setAppError(`Upload analysis failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle WhatsApp simulation on current screenshot
  const handleTriggerWhatsAppSimulation = async () => {
    if (!report) return;
    setIsWhatsAppModalOpen(true);
    setIsWhatsAppLoading(true);

    try {
      // Convert base64 original to blob
      const base64Data =
        report.original_image_b64.split(",")[1] || report.original_image_b64;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const previewMime = report.original_image_b64.match(/^data:([^;]+);/)?.[1] || "image/png";
      const blob = new Blob([byteArray], { type: previewMime });

      const simRes = await simulateWhatsApp(
        blob,
        report.filename || "screenshot.png",
      );
      setWhatsAppDat(simRes);
    } catch (err) {
      setAppError(`WhatsApp simulation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsWhatsAppLoading(false);
    }
  };

  // Handle stage judge live mobile upload arrival
  const handleMobileUploadReceived = (newReport: ForensicAnalysisReport) => {
    setSelectedSampleId(null);
    setSelectedLocus(null);
    setReport(newReport);
  };

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-[#070b14] md:h-screen md:min-h-0">
      {/* Top Command Bar */}
      <TopCommandBar
        databaseStatus={databaseStatus}
        demoSamples={demoSamples}
        selectedSampleId={selectedSampleId}
        onSelectSample={handleSelectSample}
        onFileUpload={handleFileUpload}
        onOpenWhatsAppModal={handleTriggerWhatsAppSimulation}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSection91Modal={() => setIsSection91ModalOpen(true)}
        isLoading={isLoading}
      />
      {appError && (
        <div role="alert" className="px-4 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs flex items-center justify-between">
          <span>{appError}</span>
          <div className="ml-4 flex shrink-0 items-center gap-3">
            {demoLoadFailed && <button onClick={() => setDemoRetry((n) => n + 1)} className="text-rose-100 underline hover:text-white">Retry</button>}
            <button onClick={() => setAppError(null)} className="text-rose-100 hover:text-white">Dismiss</button>
          </div>
        </div>
      )}

      {/* Main Workspace: Central Multi-Spectral Viewer + Right Risk Dossier */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <ForensicViewer report={report} selectedLocus={selectedLocus} />
        <RiskDossierSidebar
          report={report}
          selectedLocus={selectedLocus}
          onSelectLocus={(box) => setSelectedLocus(box)}
          onOpenSection91Modal={() => setIsSection91ModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <WhatsAppSimulatorModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        simulationData={whatsAppData}
        isLoading={isWhatsAppLoading}
        onApplyLaunderedImage={(newReport) => setReport(newReport)}
      />

      <MobileUploadModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        onMobileUploadReceived={handleMobileUploadReceived}
      />

      <ForensicReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={report}
      />

      {isSection91ModalOpen && report && (
        <Section91NoticeModal
          report={report}
          onClose={() => setIsSection91ModalOpen(false)}
        />
      )}
    </div>
  );
};
