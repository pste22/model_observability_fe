import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { LifecycleData } from '../types/lifecycle';
import { SummaryCards } from '../components/lifecycle/SummaryCards';
import { LifecycleTable } from '../components/lifecycle/LifecycleTable';
import { FilterTabs, LifecycleFilter } from '../components/lifecycle/FilterTabs';
import { SourceHealth } from '../components/lifecycle/SourceHealth';

export default function LifecycleDashboard() {
  const [data, setData] = useState<LifecycleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LifecycleFilter>('ALL');

  const fetchLifecycle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lifecycle');
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      setData(await res.json());
    } catch (err) {
      console.error('Failed to load lifecycle matrix:', err);
      setError('Unable to load the model lifecycle matrix. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLifecycle();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Model Lifecycle Matrix</h1>
          <p className="mt-1 text-sm text-slate-400">
            Automated expiry tracking aggregated from RSS feeds, endoflife.date, and live
            provider model lists.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <Layers className="h-4 w-4" /> Dashboard
          </Link>
          <button
            onClick={fetchLifecycle}
            className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>
      {loading && <div className="mt-10 text-sm text-slate-400">Loading lifecycle matrix…</div>}

      {error && !loading && (
        <div className="mt-8 w-full max-w-lg rounded-xl border border-red-900/40 bg-red-950/20 p-6">
          <h2 className="text-lg font-semibold text-red-300">Unable to Load Matrix</h2>
          <p className="mt-2 text-sm text-red-100/90">{error}</p>
          <button
            onClick={fetchLifecycle}
            className="mt-4 rounded-md border border-red-800/60 bg-red-900/30 px-4 py-2 text-sm text-red-100 hover:bg-red-900/50"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <SummaryCards summary={data.summary} />
          <SourceHealth sources={data.sources} />
          <FilterTabs active={filter} summary={data.summary} onChange={setFilter} />
          <LifecycleTable
            models={data.models.filter((m) => {
              if (filter === 'ALL') return true;
              if (filter === 'SHUTDOWN') {
                return m.status === 'SHUTDOWN' || m.status === 'EXPIRED_OUTAGE';
              }
              return m.status === filter;
            })}
          />
        </>
      )}
    </div>
  );
}
