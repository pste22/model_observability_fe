import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, PauseCircle } from 'lucide-react';
import { LifecycleSource } from '../../types/lifecycle';

interface SourceHealthProps {
  sources: LifecycleSource[];
}

const STALE_THRESHOLD_DAYS = 2;

type Health = 'ok' | 'stale' | 'error' | 'disabled';

function classify(source: LifecycleSource): Health {
  if (!source.enabled) return 'disabled';
  if (!source.healthy) return 'error';
  if (source.stale_days !== null && source.stale_days > STALE_THRESHOLD_DAYS) {
    return 'stale';
  }
  return 'ok';
}

const ICONS: Record<Health, React.ReactNode> = {
  ok: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  stale: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  disabled: <PauseCircle className="h-4 w-4 text-slate-500" />,
};

function formatTimestamp(value: string | null): string {
  if (!value) return 'never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function SourceHealth({ sources }: SourceHealthProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Source Health</h2>
        <span className="text-xs text-slate-500">
          {sources.filter((s) => classify(s) === 'ok').length}/{sources.length} healthy
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Each data source is stamped after every pipeline run, so a moved or dead feed
        surfaces here instead of silently dropping coverage.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => {
          const health = classify(source);
          return (
            <div
              key={source.id}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
            >
              <div className="flex items-center gap-2">
                {ICONS[health]}
                <span className="truncate text-sm font-medium text-slate-200" title={source.name}>
                  {source.name}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-400">
                <div className="truncate" title={source.last_status ?? ''}>
                  {source.last_status ?? 'Not yet checked'}
                </div>
                <div>
                  Last success: {formatTimestamp(source.last_success_at)}
                  {source.stale_days !== null && source.stale_days > STALE_THRESHOLD_DAYS && (
                    <span className="text-amber-400"> ({source.stale_days}d ago)</span>
                  )}
                </div>
                {!source.enabled && (
                  <div className="text-slate-500">Disabled</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
