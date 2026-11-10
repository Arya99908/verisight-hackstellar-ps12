import {
  ForensicAnalysisReport,
  DemoSampleMeta,
  WhatsAppSimulationResponse,
  NetworkInfo,
} from "../types/forensic";

const API_BASE = "/api";

export async function fetchHealth(): Promise<{
  status: string;
  service: string;
  database: "HEALTHY" | "UNAVAILABLE" | "NOT_CONFIGURED";
}> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchDemoSamples(): Promise<DemoSampleMeta[]> {
  const res = await fetch(`${API_BASE}/demo-samples`);
  if (!res.ok) throw new Error("Failed to fetch demo samples");
  return res.json();
}

export async function analyzeDemoSample(
  sampleId: string,
): Promise<ForensicAnalysisReport> {
  const res = await fetch(`${API_BASE}/analyze-sample/${sampleId}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Sample analysis failed");
  }
  return res.json();
}

export async function analyzeUpload(
  file: File,
): Promise<ForensicAnalysisReport> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "Upload analysis failed" }));
    throw new Error(err.detail || "Upload analysis failed");
  }
  return res.json();
}

export async function simulateWhatsApp(
  file: File | Blob,
  filename = "screenshot.png",
): Promise<WhatsAppSimulationResponse> {
  const formData = new FormData();
  formData.append("file", file, filename);
  const res = await fetch(`${API_BASE}/simulate-whatsapp`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "WhatsApp simulation failed" }));
    throw new Error(err.detail || "WhatsApp simulation failed");
  }
  return res.json();
}

export async function fetchNetworkInfo(): Promise<NetworkInfo> {
  const res = await fetch(`${API_BASE}/network-info`);
  if (!res.ok) throw new Error("Failed to fetch network info");
  return res.json();
}

export async function fetchLatestMobileUpload(
  sessionId: string,
): Promise<ForensicAnalysisReport | null> {
  const query = new URLSearchParams({ session_id: sessionId });
  const res = await fetch(`${API_BASE}/latest-mobile-upload?${query}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.report || null;
}

export async function uploadMobile(
  file: File,
  sessionId: string,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  const query = new URLSearchParams({ session_id: sessionId });
  const res = await fetch(`${API_BASE}/mobile-upload?${query}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "Mobile upload failed" }));
    throw new Error(err.detail || "Mobile upload failed");
  }
  await res.json();
}
