import React from 'react';
import { HardwareToggles, SafetyStatus } from '../types/bms';
import {
  Zap,
  Gauge,
  MapPin,
  Radio,
  Lock,
  Unlock,
  Volume2,
  Cpu,
} from 'lucide-react';

interface HardwareRelayMatrixProps {
  toggles: HardwareToggles;
  safetyStatus: SafetyStatus;
  audibleBeaconActive?: boolean;
  peripheralsActive?: boolean;
}

export const HardwareRelayMatrix: React.FC<HardwareRelayMatrixProps> = ({
  toggles,
  safetyStatus,
  audibleBeaconActive = false,
  peripheralsActive = true,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Hardware Actuator & Relay Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time physical contactors, power gates, and electromechanical locks
          </p>
        </div>
        <div className="text-xs font-mono">
          <span className="text-slate-500">Bus Status: </span>
          <span
            className={
              safetyStatus === 'CRITICAL'
                ? 'text-rose-400 font-semibold'
                : safetyStatus === 'WARNING'
                ? 'text-amber-400 font-semibold'
                : 'text-emerald-400 font-semibold'
            }
          >
            {safetyStatus === 'CRITICAL'
              ? '✖ OVERRIDE ENFORCED'
              : safetyStatus === 'WARNING'
              ? '▲ RESTRICTED'
              : '● NOMINAL'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Toggle 1: Charging Relay */}
        <div
          className={`p-3.5 rounded border transition-colors ${
            toggles.charging_relay === 'OFF'
              ? 'bg-rose-950/20 border-rose-800/80 text-rose-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">charging_relay</span>
            <Zap
              className={`w-4 h-4 ${
                toggles.charging_relay === 'OFF' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                toggles.charging_relay === 'OFF' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {toggles.charging_relay}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {toggles.charging_relay === 'OFF' ? 'Contactor Cut' : 'Connected'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Solid-State 60V SSR
          </div>
        </div>

        {/* Toggle 2: Motor Power Limit */}
        <div
          className={`p-3.5 rounded border transition-colors ${
            toggles.motor_power_limit === '50%'
              ? 'bg-amber-950/20 border-amber-800/80 text-amber-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">motor_power_limit</span>
            <Gauge
              className={`w-4 h-4 ${
                toggles.motor_power_limit === '50%' ? 'text-amber-400' : 'text-cyan-400'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                toggles.motor_power_limit === '50%' ? 'text-amber-400' : 'text-slate-100'
              }`}
            >
              {toggles.motor_power_limit}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {toggles.motor_power_limit === '50%' ? 'Clamped' : 'Unrestricted'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ESC Governor PWM
          </div>
        </div>

        {/* Toggle 3: GPS Module */}
        <div
          className={`p-3.5 rounded border transition-colors ${
            toggles.gps_module === 'OFF'
              ? 'bg-rose-950/20 border-rose-800/80 text-rose-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">gps_module</span>
            <MapPin
              className={`w-4 h-4 ${
                toggles.gps_module === 'OFF' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                toggles.gps_module === 'OFF' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {toggles.gps_module}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {toggles.gps_module === 'OFF' ? 'LDO Disabled' : 'GNSS Active'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Deep Sleep Gate
          </div>
        </div>

        {/* Toggle 4: Cellular Data */}
        <div
          className={`p-3.5 rounded border transition-colors ${
            toggles.cellular_data === 'OFF'
              ? 'bg-rose-950/20 border-rose-800/80 text-rose-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">cellular_data</span>
            <Radio
              className={`w-4 h-4 ${
                toggles.cellular_data === 'OFF' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                toggles.cellular_data === 'OFF' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {toggles.cellular_data}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {toggles.cellular_data === 'OFF' ? 'Modem Sleep' : 'LTE-M Online'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            eSIM Baseband LDO
          </div>
        </div>

        {/* Toggle 5: Drivetrain Lock */}
        <div
          className={`p-3.5 rounded border transition-colors ${
            toggles.drivetrain_lock === 'ON'
              ? 'bg-rose-950/20 border-rose-800/80 text-rose-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">drivetrain_lock</span>
            {toggles.drivetrain_lock === 'ON' ? (
              <Lock className="w-4 h-4 text-rose-400" />
            ) : (
              <Unlock className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                toggles.drivetrain_lock === 'ON' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {toggles.drivetrain_lock}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {toggles.drivetrain_lock === 'ON' ? 'Immobilized' : 'Free Wheel'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Electromechanical Solenoid
          </div>
        </div>
      </div>

      {/* Auxiliary Subsystems status bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Volume2
              className={`w-3.5 h-3.5 ${
                audibleBeaconActive ? 'text-rose-400 animate-pulse' : 'text-slate-600'
              }`}
            />
            <span>Audible Beacon: </span>
            <span className={audibleBeaconActive ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
              {audibleBeaconActive ? 'ACTIVE (98 dB Pulsing)' : 'STANDBY'}
            </span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Cpu className={`w-3.5 h-3.5 ${peripheralsActive ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span>Peripherals Bus: </span>
            <span className={peripheralsActive ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
              {peripheralsActive ? 'POWERED (Display, Lights)' : 'POWER CUT (Parasitic 0W)'}
            </span>
          </div>
        </div>

        <div className="text-slate-400">
          MCU Watchdog: 100 Hz / SPI Isolated Bus
        </div>
      </div>
    </div>
  );
};
