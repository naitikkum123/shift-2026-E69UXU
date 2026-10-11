import React, { useState } from 'react';
import { AiStorageMessage } from '../types/bms';
import {
  Smartphone,
  Send,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Radio,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface AiStorageMessageCardProps {
  message: AiStorageMessage | null;
  onTriggerTest?: () => void;
}

export const AiStorageMessageCard: React.FC<AiStorageMessageCardProps> = ({
  message,
  onTriggerTest,
}) => {
  const [copied, setCopied] = useState(false);

  if (!message) {
    return (
      <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">
              AI Prolonged Storage Auto-Dispatcher
            </div>
            <div className="text-sm font-medium text-slate-300">
              Vehicle has not exceeded the 3-year inactivity threshold. Auto-transmission on standby.
            </div>
          </div>
        </div>
        {onTriggerTest && (
          <button
            onClick={onTriggerTest}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-indigo-950 text-indigo-300 border border-indigo-700 hover:bg-indigo-900 transition-colors whitespace-nowrap shrink-0"
          >
            Test 3-Year Storage Message
          </button>
        )}
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-indigo-500/70 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-5 shadow-xl shadow-indigo-950/40 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-800/60 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-indigo-900/80 border border-indigo-600 text-indigo-300">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                AI Automated Message Dispatch Intercept
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-600 text-rose-300 animate-pulse">
                AUTO-SENT BY AI
              </span>
            </div>
            <p className="text-xs text-indigo-300 mt-0.5 font-mono">
              Trigger: Prolonged Inactivity &gt; 3 Years (1,095+ Days)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded border transition-colors ${
              copied
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-indigo-950 text-indigo-200 border-indigo-700 hover:bg-indigo-900'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied Message</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulated Mobile Lockscreen Push / SMS Alert Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Phone UI notification box */}
        <div className="md:col-span-8 bg-slate-950/90 rounded-lg p-4 border border-indigo-800/80 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>OUTBOUND PROTOCOL: {message.channel}</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>DELIVERED PRE-SHUTDOWN</span>
            </span>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase">Target Recipient:</div>
            <div className="text-sm font-semibold text-slate-100 mt-0.5">
              {message.recipient}
            </div>
          </div>

          <div className="p-3.5 rounded bg-indigo-950/50 border border-indigo-700/80 text-indigo-100 leading-relaxed text-xs">
            <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{message.subject}</span>
            </div>
            <p className="text-slate-200 mt-1 whitespace-pre-wrap">
              "{message.body}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Dispatch State: {message.timestamp}</span>
            </div>
            <span className="text-cyan-400 font-semibold">{message.preShutdownStatus}</span>
          </div>
        </div>

        {/* Right: Technical Explanation */}
        <div className="md:col-span-4 bg-slate-950/60 rounded-lg p-4 border border-slate-800/80 text-xs font-mono space-y-2.5">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Automated Logic Flow</span>
          </div>
          <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
            <li>
              <strong className="text-slate-200">Trip Point:</strong> Inactivity log crosses 3.0 years (&gt;1,095 days).
            </li>
            <li>
              <strong className="text-slate-200">Auto-Transmission:</strong> High-priority GSM/Cellular burst alert dispatched to owner's phone.
            </li>
            <li>
              <strong className="text-slate-200">Power Severance:</strong> Relays for GPS tracking and LTE-M modem cut power completely.
            </li>
            <li>
              <strong className="text-slate-200">Zero Ghost Drain:</strong> Quiescent current drops from 38.5mA to 0.05mA.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
