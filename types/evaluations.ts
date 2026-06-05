export interface EvaluationMetrics {
  keys_missing?: number;
  type_mismatches?: number;
  value_shifts?: number;
  format_drift?: number;
  provider_failures?: number;
}

export interface EvaluationPerformance {
  legacy_model_id?: string;
  successor_model_id?: string;
  legacy_avg_latency_sec?: number;
  successor_avg_latency_sec?: number;
  latency_delta_pct?: number;
  legacy_avg_completion_tokens?: number;
  successor_avg_completion_tokens?: number;
}

export interface Evaluation {
  id: string;
  legacy_model_id: string;
  successor_model_id: string;
  status: string;
  readiness_score: number;
  critical_breakers: string[];
  warnings: string[];
  metrics?: EvaluationMetrics;
  performance?: EvaluationPerformance;
  remediation?: string[];
  created_at: string;
}

export interface ProjectData {
  project_name: string;
  target_schema: Record<string, string>;
  evaluations: Evaluation[];
}
