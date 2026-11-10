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
} from "./services/api";

export const App: React.FC = () => {
  // Check if mobile mode is requested (?mode=mobile)
  const isMobileMode =
    new URLSearchParams(window.location.search).get("mode") === "mobile";

  if (isMobileMode) {
    return <MobileUploadView />;
  }

  // Desktop Workbench State
  const [demoSamples, setDemoSamples] = useState<DemoSampleMeta[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(
    "sample_1",
  );
  const [report, setReport] = useState<ForensicAnalysisReport | null>(null);
  const [selectedLocus, setSelectedLocus] = useState<BoundingBox | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    fetchDemoSamples()
      .then((samples) => {
        setDemoSamples(samples);
        if (samples.length > 0) {
          handleSelectSample("sample_1");
        }
      })
      .catch((err) => console.error("Failed to load demo samples:", err));
  }, []);

  // Handle selecting a golden demo sample
  const handleSelectSample = async (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setSelectedLocus(null);
    setIsLoading(true);

    try {
      const res = await analyzeDemoSample(sampleId);
      setReport(res);
    } catch (err) {
      console.error("Failed to analyze sample:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle custom screenshot upload
  const handleFileUpload = async (file: File) => {
    setSelectedSampleId(null);
    setSelectedLocus(null);
    setIsLoading(true);

    try {
      const res = await analyzeUpload(file);
      setReport(res);
    } catch (err: any) {
      alert(`Upload Analysis Failed: ${err.message}`);
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
      console.error("WhatsApp simulation failed:", err);
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
    <div className="h-screen w-screen flex flex-col bg-[#070b14] overflow-hidden">
      {/* Top Command Bar */}
      <TopCommandBar
        demoSamples={demoSamples}
        selectedSampleId={selectedSampleId}
        onSelectSample={handleSelectSample}
        onFileUpload={handleFileUpload}
        onOpenWhatsAppModal={handleTriggerWhatsAppSimulation}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isLoading={isLoading}
      />

      {/* Main Workspace: Central Multi-Spectral Viewer + Right Risk Dossier */}
      <div className="flex-1 flex overflow-hidden">
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
