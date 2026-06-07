import { EvaluationMetrics, EvaluationPerformance } from './evaluations';

export interface SandboxEvaluation {
  status: string;
  score_pct: number;
  metrics?: EvaluationMetrics;
  critical_breakers?: string[];
  warnings?: string[];
  remediation?: string[];
}

export interface SandboxResult {
  legacy_raw: string;
  successor_raw: string;
  evaluation?: SandboxEvaluation;
  performance?: EvaluationPerformance;
  call_errors?: string[];
}

export interface PromoteResult {
  status: string;
  message: string;
  project_id: string;
  benchmark_item_id: string;
}

export interface ProviderInfo {
  error?: string;
}

export interface ModelsResponse {
  models?: string[];
  providers?: Record<string, ProviderInfo>;
}
