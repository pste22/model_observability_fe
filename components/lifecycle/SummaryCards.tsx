import React from 'react';
import { LifecycleSummary } from '../../types/lifecycle';

interface SummaryCardsProps {
  summary: LifecycleSummary;
}

interface CardProps {
  label: string;
  value: number;
  accent: string;
}

function Card({ label, value, accent }: CardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card label="Tracked Models" value={summary.total} accent="text-white" />
      <Card label="Active" value={summary.active} accent="text-emerald-300" />
      <Card label="Deprecated" value={summary.deprecated} accent="text-amber-300" />
      <Card label="Shutdown" value={summary.shutdown} accent="text-red-300" />
    </div>
  );
}
