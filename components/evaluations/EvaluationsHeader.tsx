import React from 'react';
import Link from 'next/link';
import { Layers, RefreshCw, Beaker, CalendarClock, LogOut } from 'lucide-react';
import { ProjectSelector } from '../ProjectSelector';
import { useAuth } from '../../lib/auth';

interface EvaluationsHeaderProps {
  projectName?: string;
  activeProjectId: string;
  onProjectChange: (id: string) => void;
  onRefresh: () => void;
}

export function EvaluationsHeader({ projectName, activeProjectId, onProjectChange, onRefresh }: EvaluationsHeaderProps) {
  const { logout } = useAuth();
  return (
    <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="text-indigo-500" /> SchemaInsurance Metrics
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">Active Space: {projectName}</p>
      </div>
      <div className="flex items-center gap-2">
        <ProjectSelector currentProjectId={activeProjectId} onProjectChange={onProjectChange} />
        <Link
          href="/lifecycle"
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition text-sm font-semibold text-slate-300"
        >
          <CalendarClock className="w-4 h-4" /> Model Lifecycle
        </Link>
        <Link
          href="/playground"
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition text-sm font-semibold text-white"
        >
          <Beaker className="w-4 h-4" /> Drift Playground
        </Link>
        <button
          onClick={onRefresh}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition text-slate-400"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={logout}
          title="Log out"
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition text-slate-400"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
