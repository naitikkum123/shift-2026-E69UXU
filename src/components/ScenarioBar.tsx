import React from 'react';
import { ERICKSHAW_PRESETS, ERickshawPreset } from '../data/presets';
import { ShieldAlert, Play, Square } from 'lucide-react';

interface ScenarioBarProps {
  activePresetId: string | null;
  onSelectPreset: (preset: ERickshawPreset) => void;
  isInspecting: boolean;
  inspectionStepName: string | null;
  onToggleInspection: () => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  activePresetId,
  onSelectPreset,
  isInspecting,
  inspectionStepName,
  onToggleInspection,
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Auto Inspection Routine */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleInspection}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded border transition-all whitespace-nowrap shrink-0 ${
              isInspecting
                ? 'bg-rose-950 text-rose-200 border-rose-600 animate-pulse'
                : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-800'
            }`}
          >
            {isInspecting ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Inspection Scan</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Autonomous Multi-Sensor Scan</span>
              </>
            )}
          </button>

          {isInspecting && inspectionStepName && (
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-950/50 border border-amber-800/60 px-2.5 py-1 rounded">
              <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
              <span>Inspection: {inspectionStepName}</span>
            </div>
          )}
        </div>

        {/* Right: Manual Preset Scenario Injections */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">
            Direct Triggers:
          </span>
          {ERICKSHAW_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
