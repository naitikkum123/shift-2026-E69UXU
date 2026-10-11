import React, { useState } from 'react';
import { ControllerActionsOutput } from '../types/bms';
import { Copy, Check, Download, Code2, ShieldCheck } from 'lucide-react';

interface JsonOutputViewerProps {
  controllerOutput: ControllerActionsOutput;
}

export const JsonOutputViewer: React.FC<JsonOutputViewerProps> = ({ controllerOutput }) => {
  const [copied, setCopied] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const formattedJson = isCompact
    ? JSON.stringify(controllerOutput)
    : JSON.stringify(controllerOutput, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erickshaw-smart-controller-telematics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>E-MICROMOBILITY AI-BMS JSON Telemetry</span>
              <span className="text-[11px] font-mono font-normal text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Edge Engine Verified</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live edge triggers, hardware interlocks, and post-charge battery health telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded transition-colors"
          >
            {isCompact ? 'Pretty JSON' : 'Compact JSON'}
          </button>
          <button
            onClick={handleDownload}
            title="Download JSON payload"
            className="p-1.5 text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded border transition-colors ${
              copied
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-cyan-950/80 border-cyan-800 text-cyan-300 hover:bg-cyan-900'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-slate-950 rounded border border-slate-800/80 p-4 font-mono text-xs overflow-auto">
        <pre className="text-slate-200 whitespace-pre leading-relaxed tabular-nums">
          <code>{formattedJson}</code>
        </pre>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div>Bus Protocol: ISO 11898 CAN 2.0B / UART Telemetry</div>
        <div>Cycle: 100ms Edge Controller Loop</div>
      </div>
    </div>
  );
};
