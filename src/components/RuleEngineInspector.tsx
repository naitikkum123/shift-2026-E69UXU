import React from 'react';
import { RuleEvaluationResult } from '../types/bms';
import { ShieldAlert, AlertTriangle, Moon, KeyRound, Check, X } from 'lucide-react';

interface RuleEngineInspectorProps {
  ruleResults: RuleEvaluationResult[];
}

export const RuleEngineInspector: React.FC<RuleEngineInspectorProps> = ({ ruleResults }) => {
  const getRuleIcon = (ruleId: number) => {
    switch (ruleId) {
      case 1:
        return <ShieldAlert className="w-4 h-4" />;
      case 2:
        return <AlertTriangle className="w-4 h-4" />;
      case 3:
        return <Moon className="w-4 h-4" />;
      case 4:
        return <KeyRound className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Operational Logic Rules Evaluation Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic inference engine verifying incoming sensor telematics against 4 core directives
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Cycle: 10ms loop · Zero latency
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ruleResults.map((rule) => {
          const isFired = rule.triggered;
          return (
            <div
              key={rule.ruleId}
              className={`rounded-lg border p-4 transition-all flex flex-col justify-between ${
                isFired
                  ? rule.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-700/80'
                    : 'bg-amber-950/20 border-amber-700/80'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded ${
                        isFired
                          ? rule.severity === 'CRITICAL'
                            ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                            : 'bg-amber-900/80 text-amber-300 border border-amber-700'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {getRuleIcon(rule.ruleId)}
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-400">
                        Rule 0{rule.ruleId} Directive
                      </div>
                      <div className="text-sm font-semibold text-slate-100">
                        {rule.title}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isFired ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold rounded ${
                          rule.severity === 'CRITICAL'
                            ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                            : 'bg-amber-900/80 text-amber-200 border border-amber-700'
                        }`}
                      >
                        ✖ TRIGGERED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-900 rounded border border-slate-800">
                        ● INACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Condition verification table */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Telemetry Trigger Conditions:
                  </div>
                  {rule.conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/70 border border-slate-800/60 font-mono"
                    >
                      <span className="text-slate-300 truncate mr-2">{cond.label}:</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-400 text-[11px]">
                          ({cond.threshold})
                        </span>
                        <span
                          className={`font-semibold tabular-nums ${
                            cond.met ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          {cond.actualValue}
                        </span>
                        {cond.met ? (
                          <Check className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Enforced & Output */}
              <div className="pt-3 border-t border-slate-800/80 text-xs">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Hardware Action:
                </div>
                <div className="text-slate-300 font-medium mt-0.5">
                  {rule.actionTaken}
                </div>
                {rule.notificationGenerated && (
                  <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-200">
                    <span className="text-slate-500 uppercase">Output Notification: </span>
                    "{rule.notificationGenerated}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
