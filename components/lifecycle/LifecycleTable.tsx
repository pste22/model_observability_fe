import React from 'react';
import { ModelLifecycle } from '../../types/lifecycle';
import { StatusBadge } from './StatusBadge';

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
};

interface LifecycleTableProps {
  models: ModelLifecycle[];
}

export function LifecycleTable({ models }: LifecycleTableProps) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Model</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">End of Life</th>
            <th className="px-4 py-3">Recommended Successor</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950">
          {models.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                No lifecycle records yet. Run the automation worker to populate the matrix.
              </td>
            </tr>
          )}
          {models.map((row) => (
            <tr key={row.model_id} className="hover:bg-slate-900/60">
              <td className="px-4 py-3 font-mono text-slate-100">{row.model_id}</td>
              <td className="px-4 py-3 text-slate-300">
                {PROVIDER_LABELS[row.provider] || row.provider}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3 text-slate-300">
                {row.end_of_life_date || <span className="text-slate-600">—</span>}
              </td>
              <td className="px-4 py-3 font-mono text-slate-300">
                {row.recommended_successor || <span className="text-slate-600">—</span>}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
