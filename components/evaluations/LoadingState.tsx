import React from 'react';
import { RefreshCw } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center text-slate-400 gap-4 py-24">
      <RefreshCw className="animate-spin w-8 h-8 text-indigo-500" />
      <p className="text-sm font-mono tracking-wider">Querying Cloud Supabase Ledger...</p>
    </div>
  );
}
