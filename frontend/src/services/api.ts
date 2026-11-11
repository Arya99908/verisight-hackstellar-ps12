import {
  ForensicAnalysisReport,
  DemoSampleMeta,
  WhatsAppSimulationResponse,
  NetworkInfo,
} from "../types/forensic";

const API_BASE = "/api";

async function fetchStartupData(path: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(`${API_BASE}${path}`, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function responseError(res: Response, fallback: string): Promise<Error> {
  if (res.status === 413) {
    return new Error("This screenshot is too large to upload. Choose an image under 20 MB.");
  }
  const data = await res.json().catch(() => null);
  const detail = typeof data?.detail === "string" ? data.detail : fallback;
  return new Error(detail);
}

export async function fetchHealth(): Promise<{
  status: string;
  service: string;
  database: "HEALTHY" | "UNAVAILABLE" | "NOT_CONFIGURED";
}> {
  const res = await fetchStartupData("/health");
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchDemoSamples(): Promise<DemoSampleMeta[]> {
  const res = await fetchStartupData("/demo-samples");
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
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Screenshot analysis failed. Choose a PNG, JPG, WebP, or BMP image.");
  }
  return res.json();
}

async function uploadFileToPrivateStorage(file: File, sessionId?: string) {
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 20 MB.");
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  const contentType = file.type || ({
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    bmp: "image/bmp",
  } as Record<string, string>)[extension || ""] || "application/octet-stream";
  const sessionRes = await fetch(`${API_BASE}/upload-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      content_type: contentType,
      size: file.size,
      ...(sessionId ? { session_id: sessionId } : {}),
    }),
  });
  if (!sessionRes.ok) {
    throw await responseError(sessionRes, "Could not prepare secure screenshot upload.");
  }

  const { session_id, upload_url, storage_key } = await sessionRes.json();
  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      apikey: storage_key,
      Authorization: `Bearer ${storage_key}`,
      "x-upsert": "false",
      "cache-control": "max-age=3600",
    },
    body: file,
  });
  if (!uploadRes.ok) {
    const detail = await uploadRes.json().catch(() => null);
    throw new Error(
      typeof detail?.message === "string"
        ? detail.message
        : "Secure upload failed. Check your connection and try again.",
    );
  }

  return { session_id: session_id as string };
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
  await uploadFileToPrivateStorage(file, sessionId);
}

export interface ModelStatus {
  status: string;
  active_model_id: string | null;
  active_model_version: string | null;
  architecture: string;
  calibration_status: string;
  promotion_status: string;
  available_models: any[];
  ml_environment_ready: boolean;
  message: string;
}

export interface ModelEvaluationReport {
  dataset_summary: {
    total_samples: number;
    synthetic_fixtures: number;
    independent_authentic_references: number;
    independent_manipulated_references: number;
    held_out_test_samples: number;
  };
  status?: string;
  message?: string;
  metrics: null;
}

export async function fetchModelStatus(): Promise<ModelStatus> {
  const res = await fetchStartupData("/model/status");
  if (!res.ok) throw new Error("Failed to fetch model status");
  return res.json();
}

export async function fetchModelEvaluation(): Promise<ModelEvaluationReport> {
  const res = await fetchStartupData("/model/evaluation");
  if (!res.ok) throw new Error("Failed to fetch model evaluation");
  return res.json();
}
