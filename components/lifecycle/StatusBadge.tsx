import React from 'react';
import { LifecycleStatus } from '../../types/lifecycle';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'border-emerald-700/50 bg-emerald-900/30 text-emerald-300',
  DEPRECATED: 'border-amber-700/50 bg-amber-900/30 text-amber-300',
  SHUTDOWN: 'border-red-800/50 bg-red-950/40 text-red-300',
  EXPIRED_OUTAGE: 'border-red-800/50 bg-red-950/40 text-red-300',
};

interface StatusBadgeProps {
  status: LifecycleStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cls = STATUS_STYLES[status] || 'border-slate-700 bg-slate-800 text-slate-300';
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {String(status).replace('_', ' ')}
    </span>
  );
}
