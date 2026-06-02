// @ts-nocheck
import React from 'react';
import { Layers, RefreshCw } from 'lucide-react';

interface EvaluationsHeaderProps {
  projectName?: string;
  onRefresh: () => void;
}

export function EvaluationsHeader({ projectName, onRefresh }: EvaluationsHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="text-indigo-500" /> SchemaInsurance Metrics
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">Active Space: {projectName}</p>
      </div>
      <button
        onClick={onRefresh}
        className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition text-slate-400"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </header>
  );
}
