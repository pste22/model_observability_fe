// @ts-nocheck
import React from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Evaluation } from '../../types/evaluations';

interface EvaluationsTableProps {
  evaluations: Evaluation[];
  expandedRow: string | null;
  onToggleRow: (id: string) => void;
}

function getStatusClass(status: string) {
  if (status === 'PASSED') {
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  }

  if (status === 'WARNING_DRIFT') {
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  }

  return 'bg-red-500/10 text-red-400 border border-red-500/20';
}

export function EvaluationsTable({ evaluations, expandedRow, onToggleRow }: EvaluationsTableProps) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
        Historical Migration Simulation Suite
      </h2>
      <div className="overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-mono">
              <th className="p-4 font-medium">Run ID</th>
              <th className="p-4 font-medium">Source {'->'} Successor Model</th>
              <th className="p-4 font-medium">Status Badge</th>
              <th className="p-4 font-medium">Readiness Score</th>
              <th className="p-4 font-medium text-right">Drill Down</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {evaluations.map((run) => (
              <React.Fragment key={run.id}>
                <tr
                  onClick={() => onToggleRow(run.id)}
                  className="hover:bg-slate-800/40 cursor-pointer transition select-none"
                >
                  <td className="p-4 font-mono font-semibold text-white">{run.id}</td>
                  <td className="p-4 text-xs text-slate-400">
                    <span className="text-slate-200 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {run.legacy_model_id}
                    </span>
                    <span className="mx-2">--&gt;</span>
                    <span className="text-indigo-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {run.successor_model_id}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${getStatusClass(run.status)}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className={`p-4 font-bold ${run.readiness_score > 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {run.readiness_score}%
                  </td>
                  <td className="p-4 text-right text-slate-500">
                    {expandedRow === run.id ? (
                      <ChevronUp className="inline w-4 h-4" />
                    ) : (
                      <ChevronDown className="inline w-4 h-4" />
                    )}
                  </td>
                </tr>

                {expandedRow === run.id && (
                  <tr className="bg-slate-950 border-t border-slate-800">
                    <td colSpan={5} className="p-4">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Detected Structural Code Breakers
                        </h4>
                        <ul className="space-y-1.5">
                          {run.critical_breakers.map((breaker, idx) => (
                            <li
                              key={idx}
                              className="text-xs font-mono bg-red-950/20 text-red-300 border border-red-900/30 p-2.5 rounded-md"
                            >
                              {breaker}
                            </li>
                          ))}
                          {run.critical_breakers.length === 0 && (
                            <li className="text-xs text-slate-500 italic">No structural violations detected.</li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
