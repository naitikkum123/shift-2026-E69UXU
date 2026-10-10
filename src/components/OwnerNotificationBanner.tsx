import React from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  Volume2,
  VolumeX,
  BellRing,
} from 'lucide-react';
import { SafetyStatus } from '../types/bms';

interface OwnerNotificationBannerProps {
  notification: string | null;
  safetyStatus: SafetyStatus;
  audibleBeaconActive?: boolean;
  isAlarmPlaying?: boolean;
  isAudioMuted?: boolean;
  onToggleSilence?: () => void;
}

export const OwnerNotificationBanner: React.FC<OwnerNotificationBannerProps> = ({
  notification,
  safetyStatus,
  audibleBeaconActive,
  isAlarmPlaying = false,
  isAudioMuted = false,
  onToggleSilence,
}) => {
  if (!notification) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Vehicle Notification Dispatch
            </div>
            <div className="text-sm font-medium text-slate-200">
              All telemetry within nominal tolerances. Drivetrain unlocked, no active overrides.
            </div>
          </div>
        </div>
        <div className="text-right text-xs font-mono text-emerald-400 hidden sm:block">
          ● SAFE / NOMINAL
        </div>
      </div>
    );
  }

  const isCritical = safetyStatus === 'CRITICAL';
  const isSecurity = notification.startsWith('SECURITY:');

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isCritical
          ? 'bg-rose-950/40 border-rose-800/80 text-rose-100 shadow-lg shadow-rose-950/30'
          : 'bg-amber-950/40 border-amber-800/80 text-amber-100'
      }`}
    >
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2 rounded shrink-0 ${
              isCritical
                ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                : 'bg-amber-900/80 text-amber-300 border border-amber-700'
            }`}
          >
            {isSecurity ? (
              <ShieldAlert className="w-5 h-5" />
            ) : isCritical ? (
              <AlertOctagon className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
              <span className={isCritical ? 'text-rose-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {isCritical ? '✖ CRITICAL OVERRIDE ENFORCED' : '▲ SYSTEM WARNING DISPATCHED'}
              </span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-slate-400">Target: Owner Mobile App & Dashboard</span>
            </div>
            <div className="text-base font-semibold mt-0.5 tracking-tight font-mono">
              {notification}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAlarmPlaying && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950 border border-rose-500 text-rose-200 text-xs font-mono font-bold animate-pulse">
              <BellRing className="w-4 h-4 text-rose-400" />
              <span>ALARM RINGING (AUTONOMOUS)</span>
            </div>
          )}

          {audibleBeaconActive && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-900/40 border border-rose-700/60 text-rose-300 text-xs font-mono">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>BEACON EMITTING</span>
            </div>
          )}

          {/* Alarm Audio Status & Silence Button */}
          {onToggleSilence && (
            <button
              onClick={onToggleSilence}
              title={isAudioMuted ? 'Unmute Alarm Audio' : 'Silence Active Alarm Tone'}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded border transition-colors ${
                isAudioMuted
                  ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  : isCritical
                  ? 'bg-rose-900 text-rose-100 border-rose-600 hover:bg-rose-800 animate-pulse'
                  : 'bg-amber-900 text-amber-100 border-amber-600 hover:bg-amber-800'
              }`}
            >
              {isAudioMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Unmute Alarm</span>
                </>
              ) : isAlarmPlaying ? (
                <>
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Silence Alarm</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Mute Audio</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
