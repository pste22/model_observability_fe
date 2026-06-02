export interface Evaluation {
  id: string;
  legacy_model_id: string;
  successor_model_id: string;
  status: string;
  readiness_score: number;
  critical_breakers: string[];
  warnings: string[];
  created_at: string;
}

export interface ProjectData {
  project_name: string;
  target_schema: Record<string, string>;
  evaluations: Evaluation[];
}
