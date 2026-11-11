export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  points?: number[][];
  label: string;
  confidence: number;
  layer: number;
  anomaly_type: string;
  details?: Record<string, any>;
}

export interface BaselineLaser {
  row_index: number;
  y_baseline: number;
  slope: number;
  tokens_count: number;
  delta_y_max: number;
  is_tampered: boolean;
  status: "ALIGNED_CYAN" | "CRITICAL_RED";
  callout_text?: string;
  token_indices: number[];
  x_start?: number;
  x_end?: number;
}

export interface Layer1SignalResult {
  ela_score: number;
  ela_b64: string;
  wavelet_noise_score: number;
  wavelet_noise_b64: string;
  clone_detected: boolean;
  clone_count: number;
  clone_b64: string;
  anomalous_blocks_count: number;
  layer_score: number;
  bounding_boxes: BoundingBox[];
  details: Record<string, any>;
}

export interface Layer2GeometryResult {
  baseline_drift_score: number;
  max_baseline_drift_px: number;
  max_delta_e: number;
  cielab_patch_anomaly: boolean;
  sharpness_z_anomaly: boolean;
  layer_score: number;
  lasers: BaselineLaser[];
  bounding_boxes: BoundingBox[];
  details: Record<string, any>;
}

export interface Layer3MetadataResult {
  channel_detected: string;
  is_whatsapp_laundered: boolean;
  exif_stripped: boolean;
  software_signature?: string;
  c2pa_present: boolean;
  c2pa_status: string;
  viewport_aspect_ratio: string;
  is_non_native_viewport: boolean;
  clock_paradox_detected: boolean;
  status_bar_clock?: string;
  transaction_time?: string;
  upi_utr_valid?: boolean;
  upi_utr_value?: string;
  layer_score: number;
  bounding_boxes: BoundingBox[];
  details: Record<string, any>;
}

export interface Layer4SemanticResult {
  vlm_used: boolean;
  vlm_provider?: string;
  semantic_inconsistency: boolean;
  layer_score: number;
  findings: string[];
  details: Record<string, any>;
}

export interface CrossLayerSynergy {
  synergy_multiplier_applied: boolean;
  multiplier_factor: number;
  primary_forgery_locus?: BoundingBox;
  synergy_explanation: string;
}

export interface ForensicFinding {
  id: string;
  layer: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  description: string;
  metric_name: string;
  metric_value: string;
  bounding_box?: BoundingBox;
}

export interface SyndicateIntelligence {
  syndicate_risk_level: "CRITICAL_SYNDICATE_THREAT" | "MODERATE_REVIEW_REQUIRED" | "LOW" | string;
  threat_indicators: string[];
  entity_summary: {
    payee_vpa?: string | null;
    payee_name?: string | null;
    utr_number?: string | null;
    amount?: string | null;
    qr_linked?: boolean;
    qr_intent?: {
      vpa?: string | null;
      payee?: string | null;
      amount?: string | null;
    } | null;
  };
  recommended_action: string;
}

export interface ForensicAnalysisReport {
  file_sha256: string;
  filename?: string;
  timestamp: string;
  image_width: number;
  image_height: number;
  overall_tamper_score: number;
  confidence_score: number | null;
  verdict:
    | "INCONCLUSIVE"
    | "REVIEW_REQUIRED"
    | "CORROBORATED_ANOMALIES"
    | string;
  channel_detected: string;
  layer1: Layer1SignalResult;
  layer2: Layer2GeometryResult;
  layer3: Layer3MetadataResult;
  layer4: Layer4SemanticResult;
  synergy: CrossLayerSynergy;
  findings: ForensicFinding[];
  all_bounding_boxes: BoundingBox[];
  original_image_b64: string;
  syndicate_intelligence?: SyndicateIntelligence;
  section91_notice?: string;
  assessment_dimensions?: AssessmentDimensions;
  model_metadata?: ModelInferenceMetadata;
}

export interface AssessmentDimensions {
  image_integrity_score: number;
  image_integrity_status: "INTACT" | "COMPRESSION_NOISE" | "TAMPER_DETECTED" | string;
  text_consistency_score: number;
  text_consistency_status: "CONSISTENT" | "SUBPIXEL_DRIFT" | "GEOMETRIC_ANOMALY" | string;
  payment_verification_status: "INDEPENDENT_SOURCE_QUERY_REQUIRED" | string;
  payment_verification_details: string;
  forensic_uncertainty_status: "HIGH_CONFIDENCE" | "MODERATE_UNCERTAINTY" | "INCONCLUSIVE" | string;
  forensic_uncertainty_score: number;
  uncertainty_explanation: string;
}

export interface ModelInferenceMetadata {
  model_id: string;
  model_version: string;
  architecture: string;
  calibration_status: string;
  promotion_status: "EXPERIMENTAL" | "VALIDATED" | "VALIDATED_FALLBACK" | string;
  feature_schema_version: string;
  inference_status: "EXECUTED" | "FALLBACK_HEURISTIC" | "INCONCLUSIVE" | "FAILED" | string;
  calibrated_probability: number | null;
  raw_model_score?: number | null;
  missing_evidence: string[];
  is_operational_triage_alert: boolean;
  is_synthetic_benchmark: boolean;
  disclaimer: string;
}

export interface DemoSampleMeta {
  id: string;
  filename: string;
  title: string;
  scenario: string;
  expected_verdict: string;
  target_score_range: string;
  description: string;
  tags: string[];
  url: string;
}

export interface WhatsAppSimulationResponse {
  original_size_bytes: number;
  simulated_size_bytes: number;
  compression_ratio: number;
  original_dimensions: number[];
  simulated_dimensions: number[];
  simulated_image_b64: string;
  diff_heatmap_b64: string;
  reanalysis: ForensicAnalysisReport;
}

export interface NetworkInfo {
  local_ip: string;
  frontend_port: number;
  backend_port: number;
  mobile_upload_url: string;
}
