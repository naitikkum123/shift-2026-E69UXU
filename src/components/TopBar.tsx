import React from 'react';
import { Activity, Play, Pause, RotateCcw, Volume2, VolumeX, Bell, FileCode } from 'lucide-react';

interface TopBarProps {
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onReset: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  onTestAlarm: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isStreaming,
  onToggleStreaming,
  onReset,
  activeTab,
  onSelectTab,
  isAudioMuted,
  onToggleAudioMute,
  onTestAlarm,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <a
              href="#"
              className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
            >
              E-MICROMOBILITY AI-BMS
            </a>
          </div>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
              }`}
            >
              Smart Dashboard
            </button>
            <button
              onClick={() => onSelectTab('charts')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'charts' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
              }`}
            >
              Live Telemetry Charts
            </button>
            <button
              onClick={() => onSelectTab('cabin')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'cabin' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
              }`}
            >
              Cabin Occupancy (Rule 2)
            </button>
            <button
              onClick={() => onSelectTab('battery')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'battery' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
              }`}
            >
              Lifeline & Health (Rule 5)
            </button>
            <button
              onClick={() => onSelectTab('json')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'json' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
              }`}
            >
              Telemetry Output
            </button>
            <button
              onClick={() => onSelectTab('code')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'code' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Arduino & Python Code</span>
            </button>
          </nav>

          {/* Zone 3: Alarm sound controls + Primary action button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Alarm Sound Master Mute / Unmute */}
            <button
              onClick={onToggleAudioMute}
              title={isAudioMuted ? 'Alarms Muted (Click to enable audio)' : 'Alarms Armed (Click to mute)'}
              className={`p-2 rounded border transition-colors ${
                isAudioMuted
                  ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  : 'bg-rose-950/40 text-rose-300 border-rose-800/80 hover:bg-rose-950/70'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Test Alarm Sound Button */}
            <button
              onClick={onTestAlarm}
              title="Test Piezo Hardware Siren"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Bell className="w-3.5 h-3.5 text-rose-400" />
              <span>Test Alarm</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              title="Reset all telematics to nominal baseline"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Stream Jitter */}
            <button
              onClick={onToggleStreaming}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 ${
                isStreaming
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                  : 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 font-bold'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Live Stream</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
