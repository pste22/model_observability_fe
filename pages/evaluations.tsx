import React, { useEffect, useState } from 'react';
import { EvaluationsHeader } from '../components/evaluations/EvaluationsHeader';
import { EvaluationsTable } from '../components/evaluations/EvaluationsTable';
import { LoadingState } from '../components/evaluations/LoadingState';
import { SummaryGrid } from '../components/evaluations/SummaryGrid';
import { ProjectData } from '../types/evaluations';

export default function EvaluationsDashboard() {
  const [activeProjectId, setActiveProjectId] = useState('prj_invoice_demo');
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/evaluations?projectId=${encodeURIComponent(activeProjectId)}`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to connect to FastAPI database instance:", err);
      setError('Unable to load evaluations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [activeProjectId]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const header = (
    <EvaluationsHeader
      projectName={data?.project_name}
      activeProjectId={activeProjectId}
      onProjectChange={setActiveProjectId}
      onRefresh={fetchEvaluations}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
        {header}
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
        {header}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-lg rounded-xl border border-red-900/40 bg-red-950/20 p-6">
            <h2 className="text-lg font-semibold text-red-300">Unable to Load Evaluations</h2>
            <p className="mt-2 text-sm text-red-100/90">{error}</p>
            <button
              onClick={fetchEvaluations}
              className="mt-4 rounded-md border border-red-800/60 bg-red-900/30 px-4 py-2 text-sm text-red-100 hover:bg-red-900/50"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.evaluations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
        {header}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">No Evaluations Yet</h2>
            <p className="mt-2 text-sm text-slate-300">
              We did not find any evaluation records for this project.
            </p>
            <button
              onClick={fetchEvaluations}
              className="mt-4 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {header}
      <SummaryGrid data={data} />
      <EvaluationsTable
        evaluations={data?.evaluations ?? []}
        expandedRow={expandedRow}
        onToggleRow={toggleRow}
      />
    </div>
  );
}