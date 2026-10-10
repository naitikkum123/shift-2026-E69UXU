import React from 'react';
import { TelemetryLogEntry } from '../types/bms';
import { Terminal, Trash2 } from 'lucide-react';

interface AuditLogProps {
  logs: TelemetryLogEntry[];
  onClear: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs, onClear }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            E-MICROMOBILITY AI-BMS Real-Time Event Audit Log
          </h2>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Log</span>
        </button>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-xs pr-1">
        {logs.length === 0 ? (
          <div className="text-slate-500 py-3 text-center">
            No events logged yet. Adjust sliders or select a scenario preset.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 p-2 rounded bg-slate-950/70 border border-slate-800/60"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-slate-400 text-[11px] tabular-nums shrink-0 mt-0.5">
                  [{log.timestamp}]
                </span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                    log.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : log.severity === 'WARNING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {log.severity}
                </span>
                <div>
                  <span className="text-slate-200 font-medium">{log.event}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">{log.details}</div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 uppercase">
                {log.source}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
