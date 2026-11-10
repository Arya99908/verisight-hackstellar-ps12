import React, { useEffect, useState } from "react";
import { TopCommandBar } from "./components/TopCommandBar";
import { ForensicViewer } from "./components/ForensicViewer";
import { RiskDossierSidebar } from "./components/RiskDossierSidebar";
import { WhatsAppSimulatorModal } from "./components/WhatsAppSimulatorModal";
import { MobileUploadModal } from "./components/MobileUploadModal";
import { MobileUploadView } from "./components/MobileUploadView";
import { ForensicReportModal } from "./components/ForensicReportModal";
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

  // Modals state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] =
    useState<boolean>(false);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState<boolean>(false);
  const [whatsAppData, setWhatsAppDat] =
    useState<WhatsAppSimulationResponse | null>(null);

  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Load demo samples list and analyze sample_1 on startup
  useEffect(() => {
    fetchHealth()
      .then((health) => setDatabaseStatus(health.database))
      .catch(() => setDatabaseStatus("UNAVAILABLE"));

    fetchDemoSamples()
      .then((samples) => {
        setDemoSamples(samples);
        if (samples.length > 0) {
          handleSelectSample("sample_1");
        } else {
          setAppError("The demo sample list is empty.");
        }
      })
      .catch((err) => setAppError(`Could not load demo samples: ${err.message}`));
  }, []);

  // Handle selecting a golden demo sample
  const handleSelectSample = async (sampleId: string) => {
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
  };

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
      const blob = new Blob([byteArray], { type: "image/png" });

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
        isLoading={isLoading}
      />
      {appError && (
        <div role="alert" className="px-4 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs flex items-center justify-between">
          <span>{appError}</span>
          <button onClick={() => setAppError(null)} className="ml-4 text-rose-100 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Main Workspace: Central Multi-Spectral Viewer + Right Risk Dossier */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <ForensicViewer report={report} selectedLocus={selectedLocus} />
        <RiskDossierSidebar
          report={report}
          selectedLocus={selectedLocus}
          onSelectLocus={(box) => setSelectedLocus(box)}
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
    </div>
  );
};
