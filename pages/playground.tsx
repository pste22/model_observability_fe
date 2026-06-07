import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Beaker,
  Play,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Wrench,
  Gauge,
  ArrowRight,
  Layers,
  Save,
} from 'lucide-react';
import { SandboxResult, PromoteResult, ModelsResponse } from '../types/sandbox';

// Fallback list used only if the live /api/models lookup fails.
const FALLBACK_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'claude-3-5-sonnet-latest',
  'claude-3-haiku-20240307',
  'claude-sonnet-4-6',
  'claude-opus-4-8',
];

const DEFAULT_SCHEMA = '{\n  "invoice_id": "string",\n  "total": "number"\n}';
const DEFAULT_PROMPT = 'Extract the invoice fields from the document and return JSON.';
const DEFAULT_CONTEXT = 'Invoice #INV-2025-014\nVendor: Acme Corp\nAmount due: $1,250.00';

function statusClass(status: string) {
  if (status === 'PASSED') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (status === 'WARNING_DRIFT') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  return 'bg-red-500/10 text-red-400 border border-red-500/20';
}

export default function PlaygroundPage() {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [inputContext, setInputContext] = useState(DEFAULT_CONTEXT);
  const [schemaText, setSchemaText] = useState(DEFAULT_SCHEMA);
  const [legacyModel, setLegacyModel] = useState('gpt-4o-mini');
  const [successorModel, setSuccessorModel] = useState('claude-3-haiku-20240307');

  const [modelOptions, setModelOptions] = useState<string[]>(FALLBACK_MODELS);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SandboxResult | null>(null);

  const [promoting, setPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);
  const [promoted, setPromoted] = useState<PromoteResult | null>(null);
  const [projectName, setProjectName] = useState('');
  const [groundTruthText, setGroundTruthText] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const res = await fetch('/api/models');
        const json: ModelsResponse & { detail?: string } = await res.json();
        if (!res.ok) {
          throw new Error(json.detail || `Request failed with status ${res.status}`);
        }
        const models = Array.isArray(json.models) && json.models.length > 0 ? json.models : FALLBACK_MODELS;
        setModelOptions(models);
        if (!models.includes(legacyModel)) setLegacyModel(models[0]);
        if (!models.includes(successorModel)) setSuccessorModel(models[models.length > 1 ? 1 : 0]);

        const providerErrors = Object.entries(json.providers || {})
          .filter(([, v]) => v && v.error)
          .map(([k, v]) => `${k}: ${v.error}`);
        if (providerErrors.length > 0) {
          setModelsError(providerErrors.join(' · '));
        }
      } catch (e: any) {
        setModelsError(e.message || 'Could not load models; using fallback list.');
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  const runEvaluation = async () => {
    setError(null);
    setResult(null);

    let targetSchema;
    try {
      targetSchema = JSON.parse(schemaText);
    } catch (e) {
      setError('Target schema must be valid JSON (e.g. {"invoice_id": "string"}).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          input_context: inputContext,
          target_schema: targetSchema,
          legacy_model_id: legacyModel,
          successor_model_id: successorModel,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || `Request failed with status ${res.status}`);
      }
      setResult(json);
      // Pre-fill the editable ground truth with the legacy model's output as a starting point.
      try {
        const baseline = json?.legacy_raw ? JSON.parse(json.legacy_raw) : {};
        setGroundTruthText(JSON.stringify(baseline, null, 2));
      } catch (e) {
        setGroundTruthText(json?.legacy_raw || '{}');
      }
    } catch (e: any) {
      setError(e.message || 'Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const promoteToProject = async () => {
    setPromoteError(null);
    setPromoted(null);

    let targetSchema;
    try {
      targetSchema = JSON.parse(schemaText);
    } catch (e) {
      setPromoteError('Target schema must be valid JSON before promoting.');
      return;
    }

    // Use the reviewed/edited ground truth so the saved baseline is what the user confirmed.
    let groundTruth;
    try {
      groundTruth = groundTruthText.trim() ? JSON.parse(groundTruthText) : {};
    } catch (e) {
      setPromoteError('Ground truth must be valid JSON before promoting.');
      return;
    }

    const name = projectName.trim();
    if (!name) {
      setPromoteError('Please give the project a name before promoting.');
      return;
    }

    setPromoting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          system_prompt: systemPrompt,
          target_schema: targetSchema,
          input_context: inputContext,
          ground_truth: groundTruth,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || `Request failed with status ${res.status}`);
      }
      setPromoted(json);
    } catch (e: any) {
      setPromoteError(e.message || 'Could not promote to a project. Please try again.');
    } finally {
      setPromoting(false);
    }
  };

  const evaluation = result?.evaluation;
  const performance = result?.performance;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Beaker className="text-indigo-500" /> Real-Time Model Drift Playground
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Paste a prompt + document, pick two models, and watch the structural diff execute live.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition text-sm font-semibold text-slate-300"
        >
          <Layers className="w-4 h-4" /> Dashboard
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Sandbox Inputs</h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Input Document / Context</label>
            <textarea
              value={inputContext}
              onChange={(e) => setInputContext(e.target.value)}
              rows={5}
              className="w-full text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Target Schema (JSON)</label>
            <textarea
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              rows={4}
              className="w-full text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 text-emerald-400 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Legacy Model</label>
              <select
                value={legacyModel}
                onChange={(e) => setLegacyModel(e.target.value)}
                disabled={modelsLoading}
                className="w-full text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
              >
                {modelOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Successor Model</label>
              <select
                value={successorModel}
                onChange={(e) => setSuccessorModel(e.target.value)}
                disabled={modelsLoading}
                className="w-full text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-indigo-300 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
              >
                {modelOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {modelsLoading && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading models available to your account…
            </p>
          )}
          {modelsError && (
            <p className="text-xs text-amber-400/80">{modelsError}</p>
          )}

          <button
            onClick={runEvaluation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? 'Running drift comparison…' : 'Run Drift Comparison'}
          </button>

          {error && (
            <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Save as Project</h3>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Invoice Parsing"
                  className="w-full text-sm bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">
                  Ground Truth (expected answer)
                </label>
                <p className="text-[11px] text-slate-500 mb-1">
                  Pre-filled from the legacy model output. Review and edit so the saved baseline is the correct expected answer.
                </p>
                <textarea
                  value={groundTruthText}
                  onChange={(e) => setGroundTruthText(e.target.value)}
                  rows={5}
                  className="w-full text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 text-amber-300 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          )}

          <button
            onClick={promoteToProject}
            disabled={promoting || !result}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-slate-200 transition"
          >
            {promoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {promoting ? 'Promoting to project…' : 'Promote to Project'}
          </button>

          {promoteError && (
            <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-200">
              {promoteError}
            </div>
          )}

          {promoted && (
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3 text-sm text-emerald-200">
              <span className="font-semibold">{promoted.status}</span> — {promoted.message}
              <div className="mt-1 font-mono text-xs text-emerald-300/80">
                project_id: {promoted.project_id} · benchmark_item_id: {promoted.benchmark_item_id}
              </div>
            </div>
          )}
        </section>

        {/* Results panel */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Drift Result</h2>

          {!result && !loading && (
            <p className="text-sm text-slate-500 italic">Run a comparison to see the structural diff here.</p>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Executing both models concurrently…
            </div>
          )}

          {evaluation && (
            <>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${statusClass(evaluation.status)}`}>
                  {evaluation.status}
                </span>
                <span className={`text-2xl font-extrabold ${(evaluation.score_pct ?? 0) > 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {evaluation.score_pct?.toFixed(1)}%
                </span>
                {evaluation.metrics?.format_drift ? (
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    FORMAT DRIFT
                  </span>
                ) : null}
              </div>

              {result.call_errors && result.call_errors.length > 0 && (
                <ul className="space-y-1.5">
                  {result.call_errors.map((err, idx) => (
                    <li key={idx} className="text-xs font-mono bg-red-950/20 text-red-300 border border-red-900/30 p-2.5 rounded-md">
                      {err}
                    </li>
                  ))}
                </ul>
              )}

              {/* Raw outputs side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Legacy raw output</span>
                  <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg text-slate-200 border border-slate-800 overflow-x-auto max-h-48 overflow-y-auto">
                    {result.legacy_raw}
                  </pre>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Successor raw output</span>
                  <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg text-indigo-200 border border-slate-800 overflow-x-auto max-h-48 overflow-y-auto">
                    {result.successor_raw}
                  </pre>
                </div>
              </div>

              {/* Latency comparison */}
              {performance && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Gauge className="w-3.5 h-3.5 text-indigo-400" /> Latency Comparison
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-mono text-slate-200">
                    <span>{performance.legacy_avg_latency_sec?.toFixed(3)}s</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span>{performance.successor_avg_latency_sec?.toFixed(3)}s</span>
                    <span className={`ml-2 font-bold ${(performance.latency_delta_pct ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {(performance.latency_delta_pct ?? 0) > 0 ? '+' : ''}
                      {performance.latency_delta_pct?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Structural breakers */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Structural Breakers
                </h3>
                <ul className="space-y-1.5">
                  {evaluation.critical_breakers?.map((b, idx) => (
                    <li key={idx} className="text-xs font-mono bg-red-950/20 text-red-300 border border-red-900/30 p-2.5 rounded-md">
                      {b}
                    </li>
                  ))}
                  {(!evaluation.critical_breakers || evaluation.critical_breakers.length === 0) && (
                    <li className="text-xs text-slate-500 italic">No structural violations detected.</li>
                  )}
                </ul>
              </div>

              {/* Warnings */}
              {evaluation.warnings && evaluation.warnings.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Drift Warnings
                  </h3>
                  <ul className="space-y-1.5">
                    {evaluation.warnings.map((w, idx) => (
                      <li key={idx} className="text-xs font-mono bg-amber-950/20 text-amber-300 border border-amber-900/30 p-2.5 rounded-md">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Remediation */}
              {evaluation.remediation && evaluation.remediation.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" /> Suggested Corrective Steps
                  </h3>
                  <ol className="space-y-1.5 list-decimal list-inside">
                    {evaluation.remediation.map((step, idx) => (
                      <li key={idx} className="text-xs bg-emerald-950/20 text-emerald-200 border border-emerald-900/30 p-2.5 rounded-md">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
