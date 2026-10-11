import React from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Users,
  Moon,
  Bluetooth,
  Volume2,
  VolumeX,
  BellRing,
} from 'lucide-react';
import { SystemSafetyStatus } from '../types/bms';

interface OwnerNotificationBannerProps {
  status: SystemSafetyStatus;
  isThermalAlarmActive: boolean;
  isCabinAlarmActive: boolean;
  isAudioMuted?: boolean;
  isAlarmSilenced?: boolean;
  onToggleSilence?: () => void;
}

export const OwnerNotificationBanner: React.FC<OwnerNotificationBannerProps> = ({
  status,
  isThermalAlarmActive,
  isCabinAlarmActive,
  isAudioMuted = false,
  isAlarmSilenced = false,
  onToggleSilence,
}) => {
  const isAlarmRinging = (isThermalAlarmActive || isCabinAlarmActive) && !isAudioMuted && !isAlarmSilenced;

  if (status === 'NORMAL') {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              E-MICROMOBILITY AI-BMS System Status
            </div>
            <div className="text-sm font-medium text-slate-200">
              All EV subsystems nominal. Battery temp within limits (&lt;50°C), legal passenger capacity (&le;6 pax), standard motor power.
            </div>
          </div>
        </div>
        <div className="text-right text-xs font-mono text-emerald-400 hidden sm:block">
          ● STATUS: NORMAL (STANDBY)
        </div>
      </div>
    );
  }

  const isThermal = status === 'THERMAL_OVERHEAT';
  const isOverload = status === 'OVERLOAD_ALERT';
  const isStorage = status === 'DEEP_SLEEP';
  const isSecurity = status === 'SECURITY_LOCKOUT';

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isThermal
          ? 'bg-rose-950/50 border-rose-700 text-rose-100 shadow-lg shadow-rose-950/30'
          : isOverload
          ? 'bg-amber-950/50 border-amber-700 text-amber-100 shadow-md'
          : isStorage
          ? 'bg-indigo-950/50 border-indigo-700 text-indigo-100'
          : 'bg-cyan-950/50 border-cyan-700 text-cyan-100'
      }`}
    >
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2 rounded shrink-0 ${
              isThermal
                ? 'bg-rose-900 text-rose-200 border border-rose-600'
                : isOverload
                ? 'bg-amber-900 text-amber-200 border border-amber-600'
                : isStorage
                ? 'bg-indigo-900 text-indigo-200 border border-indigo-600'
                : 'bg-cyan-900 text-cyan-200 border border-cyan-600'
            }`}
          >
            {isThermal ? (
              <AlertOctagon className="w-5 h-5" />
            ) : isOverload ? (
              <Users className="w-5 h-5" />
            ) : isStorage ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Bluetooth className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
              <span className={isThermal ? 'text-rose-400 font-bold' : isOverload ? 'text-amber-400 font-bold' : 'text-slate-300 font-semibold'}>
                {isThermal
                  ? '✖ CRITICAL: THERMAL OVERHEAT PROTECTION ENFORCED'
                  : isOverload
                  ? '▲ PASSENGER OVERLOADING VIOLATION'
                  : isStorage
                  ? '● DEEP SLEEP PROLONGED STORAGE MODE'
                  : '🔒 BLUETOOTH IGNITION & MOTION LOCKOUT'}
              </span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-slate-400">Driver Console Alert</span>
            </div>
            <div className="text-sm font-semibold mt-0.5 tracking-tight font-mono">
              {isThermal
                ? 'Battery temperature breached 50°C! High-priority hardware alarm sounding. Motor draw current reduced by 30% immediately.'
                : isOverload
                ? 'Cabin occupancy exceeds 6 passenger rated capacity! Specific cabin alarm sounding to notify driver.'
                : isStorage
                ? 'Vehicle un-driven for >3 years. GPS & Cellular modules powered down to eliminate ghost drain.'
                : 'Vehicle in motion or Bluetooth-ignited. External pairing locked out strictly to primary driver.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAlarmRinging && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950 border border-rose-500 text-rose-200 text-xs font-mono font-bold animate-pulse">
              <BellRing className="w-4 h-4 text-rose-400" />
              <span>{isThermal ? 'THERMAL ALARM RINGING' : 'CABIN CHIME RINGING'}</span>
            </div>
          )}

          {onToggleSilence && (
            <button
              onClick={onToggleSilence}
              title={isAudioMuted ? 'Unmute Alarms' : 'Silence Active Siren Tone'}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded border transition-colors ${
                isAudioMuted
                  ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  : isAlarmRinging
                  ? 'bg-rose-900 text-rose-100 border-rose-600 hover:bg-rose-800'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              {isAudioMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Unmute</span>
                </>
              ) : isAlarmRinging ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Silence Tone</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
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
