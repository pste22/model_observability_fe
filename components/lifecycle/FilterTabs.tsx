import React from 'react';
import { LifecycleSummary } from '../../types/lifecycle';

export type LifecycleFilter = 'ALL' | 'ACTIVE' | 'DEPRECATED' | 'SHUTDOWN';

interface FilterTabsProps {
  active: LifecycleFilter;
  summary: LifecycleSummary;
  onChange: (filter: LifecycleFilter) => void;
}

const TABS: { key: LifecycleFilter; label: string; countKey: keyof LifecycleSummary }[] = [
  { key: 'ALL', label: 'All', countKey: 'total' },
  { key: 'ACTIVE', label: 'Active', countKey: 'active' },
  { key: 'DEPRECATED', label: 'Deprecated', countKey: 'deprecated' },
  { key: 'SHUTDOWN', label: 'Shutdown', countKey: 'shutdown' },
];

export function FilterTabs({ active, summary, onChange }: FilterTabsProps) {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'border-indigo-500/60 bg-indigo-600/20 text-indigo-200'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                isActive ? 'bg-indigo-500/30 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {summary[tab.countKey]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
