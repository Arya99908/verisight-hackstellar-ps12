import {
  ForensicAnalysisReport,
  DemoSampleMeta,
  WhatsAppSimulationResponse,
  NetworkInfo,
} from "../types/forensic";
import type {
  CaseRecord,
  ExtractedIncidentDetails,
  FormalComplaint,
  ReportingAuthority,
  UnderstandIncidentResponse,
} from "../types/response";

const API_BASE = "/api";
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const DIRECT_UPLOAD_LIMIT_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  bmp: "image/bmp",
};
const ALLOWED_IMAGE_TYPES = new Set(Object.values(IMAGE_TYPES_BY_EXTENSION));

function getSupportedImageType(file: File): string {
  const mimeType = file.type.split(";", 1)[0].trim().toLowerCase();
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) return mimeType;
  if (!mimeType || mimeType === "application/octet-stream") {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const inferredType = IMAGE_TYPES_BY_EXTENSION[extension];
    if (inferredType) return inferredType;
  }
  throw new Error("Choose a PNG, JPG, WebP, or BMP image.");
}

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
  if (res.status === 415) {
    return new Error("Choose a PNG, JPG, WebP, or BMP image.");
  }
  if (res.status === 422) {
    return new Error("The image could not be read. Choose a valid PNG, JPG, WebP, or BMP file.");
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
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("This screenshot is too large to upload. Choose an image under 20 MB.");
  }
  const contentType = getSupportedImageType(file);

  // Vercel functions have a smaller request-body limit than the app's 20 MB
  // image limit. Large browser uploads use the same one-use private Storage
  // flow as paired mobile uploads, then invoke analysis by session ID.
  if (file.size > DIRECT_UPLOAD_LIMIT_BYTES) {
    const { session_id } = await uploadFileToPrivateStorage(file);
    const res = await fetch(`${API_BASE}/analyze-upload-session/${encodeURIComponent(session_id)}`, {
      method: "POST",
    });
    if (!res.ok) {
      throw await responseError(res, "Screenshot analysis failed. Please try again.");
    }
    return res.json();
  }

  const formData = new FormData();
  formData.append("file", new Blob([file], { type: contentType }), file.name || "screenshot.png");
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw await responseError(res, "Screenshot analysis failed. Please try again.");
  }
  return res.json();
}

async function uploadFileToPrivateStorage(file: File, sessionId?: string) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Choose an image smaller than 20 MB.");
  }
  const contentType = getSupportedImageType(file);
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

async function responseJson<T>(path: string, payload?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/response${path}`, {
    method: payload === undefined ? "GET" : "POST",
    ...(payload === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(typeof data?.detail === "string" ? data.detail : "Response service request failed.");
  }
  return res.json();
}

export function understandIncident(payload: {
  user_text: string;
  language?: string;
  existing_details?: object;
  attached_forensic_summary?: object;
}): Promise<UnderstandIncidentResponse> {
  return responseJson("/understand", payload);
}

export function generateComplaint(payload: {
  details: ExtractedIncidentDetails;
  authority_destination?: string;
  language?: string;
  attached_forensic_report?: Record<string, unknown>;
  custom_narrative_edits?: string;
  complainant_address?: string;
}): Promise<FormalComplaint> {
  return responseJson("/generate-complaint", payload);
}

export function regenerateComplaintSection(payload: {
  section_name: string;
  current_content: string;
  instruction: string;
  target_language?: string;
}): Promise<{ section_name: string; original_content: string; refined_content: string }> {
  return responseJson("/regenerate-section", payload);
}

export function fetchReportingDirectory(category?: string, query?: string): Promise<ReportingAuthority[]> {
  const params = new URLSearchParams();
  if (category && category !== "ALL") params.set("category", category);
  if (query) params.set("q", query);
  return responseJson(`/reporting-directory?${params.toString()}`);
}

export function fetchCases(): Promise<CaseRecord[]> {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem("verisight.response.cases.v1") || "[]");
    return Promise.resolve(Array.isArray(parsed) ? (parsed as CaseRecord[]) : []);
  } catch {
    return Promise.resolve([]);
  }
}

export function fetchCase(caseId: string): Promise<CaseRecord> {
  return fetchCases().then((cases) => {
    const found = cases.find((record) => record.case_id === caseId);
    if (!found) throw new Error("Case not found in this browser tab.");
    return found;
  });
}

export function saveCaseRecord(caseRecord: CaseRecord): Promise<CaseRecord> {
  const updated = { ...caseRecord, updated_at: new Date().toISOString() };
  return fetchCases().then((cases) => {
    const next = [updated, ...cases.filter((record) => record.case_id !== updated.case_id)];
    sessionStorage.setItem("verisight.response.cases.v1", JSON.stringify(next));
    return updated;
  });
}

export function createCaseRecord(payload: {
  details: ExtractedIncidentDetails;
  title?: string;
  forensic_attachment?: Record<string, unknown>;
}): Promise<CaseRecord> {
  const now = new Date().toISOString();
  const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 6).toUpperCase()
    : Math.random().toString(36).slice(2, 8).toUpperCase();
  const record: CaseRecord = {
    case_id: `VS-CASE-${randomId}`,
    created_at: now,
    updated_at: now,
    title: payload.title || `${payload.details.incident_category_label} (${payload.details.incident_date || "Recent"})`,
    category: payload.details.incident_category,
    status: "DRAFTING",
    financial_loss: payload.details.financial_loss_amount || 0,
    authority_destination: payload.details.recommended_pathway,
    details: payload.details,
    forensic_attachment: payload.forensic_attachment,
    timeline: [{
      timestamp: now,
      title: "Incident response draft created",
      description: "Draft created locally in this browser tab. No report was submitted to an authority.",
      actor: "SYSTEM",
    }],
  };
  return saveCaseRecord(record);
}

export async function downloadComplaintPdfBlob(complaint: FormalComplaint): Promise<Blob> {
  const res = await fetch(`${API_BASE}/response/export-complaint-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(complaint),
  });
  if (!res.ok) throw new Error("Could not generate the complaint PDF.");
  return res.blob();
}

export async function downloadDossierPdfBlob(report: object, complaintRef?: string): Promise<Blob> {
  const params = new URLSearchParams();
  if (complaintRef) params.set("complaint_ref", complaintRef);
  const res = await fetch(`${API_BASE}/response/export-dossier-pdf?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error("Could not generate the evidence dossier PDF.");
  return res.blob();
}
