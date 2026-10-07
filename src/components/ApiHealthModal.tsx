/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, X, CheckCircle2, AlertTriangle, RefreshCw, Key, ExternalLink, Copy, Check } from 'lucide-react';

interface ApiHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHealthStatusChange?: (healthy: boolean) => void;
}

export const ApiHealthModal: React.FC<ApiHealthModalProps> = ({
  isOpen,
  onClose,
  onHealthStatusChange,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenTesting, setTokenTesting] = useState<boolean>(false);
  const [tokenResult, setTokenResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setHealthData(data);
      if (onHealthStatusChange) {
        onHealthStatusChange(data.status === 'UP');
      }
    } catch (err) {
      console.error('Failed to fetch /api/health:', err);
      setError(err instanceof Error ? err.message : 'Failed to reach API endpoint');
      if (onHealthStatusChange) {
        onHealthStatusChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const testUraToken = async () => {
    setTokenTesting(true);
    setTokenResult(null);
    try {
      const res = await fetch('/api/ura?action=token');
      const data = await res.json();
      setTokenResult(data);
    } catch (err) {
      setTokenResult({
        success: false,
        error: err instanceof Error ? err.message : 'Error testing URA endpoint',
      });
    } finally {
      setTokenTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyEnvVarName = () => {
    navigator.clipboard.writeText('URA_ACCESS_KEY');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-slate-900 text-white">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">API Health & Vercel URA Monitor</h3>
              <p className="text-[11px] text-slate-500">Route: /api/health.js & /api/ura.js</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status summary banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            error
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : healthData?.status === 'UP'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {healthData?.status === 'UP' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {error ? 'API Unreachable' : `API Status: ${healthData?.status || 'CHECKING...'}`}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  {error
                    ? error
                    : `Response time: ${healthData?.responseTimeMs || 0}ms · Environment: ${healthData?.environment || 'unknown'}`}
                </div>
              </div>
            </div>

            <button
              onClick={fetchHealth}
              disabled={loading}
              className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Diagnostic Metrics Grid */}
          {healthData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Uptime</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{healthData.uptimeSeconds}s</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Node Runtime</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{healthData.nodeVersion}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Memory Used</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{healthData.memory?.heapUsedMB || 'N/A'} MB</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">URA Key Set</div>
                <div className={`font-mono font-bold mt-0.5 ${healthData.integrations?.ura?.configured ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {healthData.integrations?.ura?.configured ? 'YES (Active)' : 'NO (Pending)'}
                </div>
              </div>
            </div>
          )}

          {/* URA Setup Instructions Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-700" />
                Vercel URA_ACCESS_KEY Configuration
              </h4>
              <button
                onClick={copyEnvVarName}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy URA_ACCESS_KEY'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When deployed on Vercel, navigate to <strong>Settings &gt; Environment Variables</strong> and add:
            </p>

            <div className="p-2 rounded bg-slate-900 text-slate-100 font-mono text-xs flex items-center justify-between">
              <span>URA_ACCESS_KEY="your_ura_access_key_here"</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              * The app operates with official Singapore URA &amp; HDB Master Plan baselines out of the box. Adding your own key activates live token exchange with URA DataService.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={testUraToken}
                disabled={tokenTesting}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{tokenTesting ? 'Testing URA Proxy...' : 'Test URA Endpoint'}</span>
              </button>

              <a
                href="https://www.ura.gov.sg/maps/api/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
              >
                <span>URA Developer Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {tokenResult && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                <pre>{JSON.stringify(tokenResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-md"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
