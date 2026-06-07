export type LifecycleStatus =
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'SHUTDOWN'
  | 'EXPIRED_OUTAGE'
  | string;

export interface ModelLifecycle {
  model_id: string;
  provider: string;
  status: LifecycleStatus;
  end_of_life_date: string | null;
  recommended_successor: string | null;
  updated_at: string | null;
}

export interface LifecycleSummary {
  total: number;
  active: number;
  deprecated: number;
  shutdown: number;
}

export interface LifecycleSource {
  id: number;
  source_type: string;
  name: string;
  locator: string;
  provider: string | null;
  enabled: boolean;
  healthy: boolean;
  last_status: string | null;
  last_success_at: string | null;
  last_checked_at: string | null;
  stale_days: number | null;
}

export interface LifecycleData {
  summary: LifecycleSummary;
  models: ModelLifecycle[];
  sources: LifecycleSource[];
}
