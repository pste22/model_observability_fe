// @ts-nocheck
import React from 'react';
import { TrendingDown } from 'lucide-react';
import { ProjectData } from '../../types/evaluations';

interface SummaryGridProps {
  data: ProjectData | null;
}

export function SummaryGrid({ data }: SummaryGridProps) {
  const latestRun = data?.evaluations[0];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-semibold">Validation Target Schema</span>
        <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg text-emerald-400 border border-slate-800/60 overflow-x-auto">
          {JSON.stringify(data?.target_schema, null, 2)}
        </pre>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-semibold">Latest Run Result</span>
          <div className="text-2xl font-bold text-red-400 flex items-center gap-2 mt-2">
            <TrendingDown className="w-6 h-6 text-red-500" /> {latestRun?.status.replace('_', ' ')}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Completed: {latestRun ? new Date(latestRun.created_at).toLocaleString() : 'N/A'}
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-semibold">Migration Readiness Score</span>
          <div className="text-4xl font-extrabold text-red-500 mt-2">
            {latestRun?.readiness_score.toFixed(1)}%
          </div>
        </div>
        <p className="text-xs text-slate-500">Pipeline status: Immediate migration blocked.</p>
      </div>
    </section>
  );
}
