import React from 'react';
import { VehicleTelematics, BmsDecisionOutput } from '../types/bms';
import { ShieldAlert, Cpu, BatteryWarning, Info, Flame, Lock } from 'lucide-react';

interface DiagnosticSummaryProps {
  telematics: VehicleTelematics;
  bmsOutput: BmsDecisionOutput;
}

export const DiagnosticSummary: React.FC<DiagnosticSummaryProps> = ({
  telematics,
  bmsOutput,
}) => {
  // Compute electro-thermal calculations
  const jouleanHeatingWatts =
    telematics.chargingCurrent > 0
      ? (telematics.chargingCurrent ** 2 * 0.12).toFixed(1)
      : (telematics.vehicleSpeed > 0 ? ((telematics.torque * 1.8) ** 2 * 0.04).toFixed(1) : '0.0');

  const parasiticQuiescentMa =
    bmsOutput.hardware_toggles.gps_module === 'OFF' &&
    bmsOutput.hardware_toggles.cellular_data === 'OFF'
      ? '0.08 mA (Sleep Mode)'
      : '42.5 mA (Full Active Draw)';

  const daysUntilZeroPercent =
    telematics.chargingCurrent > 0
      ? 'Charging Active'
      : bmsOutput.hardware_toggles.gps_module === 'OFF'
      ? `${Math.max(1, Math.round(telematics.stateOfCharge * 3.8))} Days (Deep Sleep Protected)`
      : `${Math.max(1, Math.round(telematics.stateOfCharge * 0.45))} Days (Parasitic Drain Rapid)`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            E-MICROMOBILITY AI-BMS Diagnostic Analytics
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Model: Edge-BMS Neural Safety Kernel
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Thermal Runaway Index */}
        <div className="p-3.5 rounded bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Thermal Stress Index
            </span>
            <span
              className={
                telematics.batteryTemp > 45 || telematics.motorTemp > 65
                  ? 'text-rose-400 font-bold'
                  : 'text-emerald-400 font-bold'
              }
            >
              {telematics.batteryTemp > 45 ? 'CRITICAL RISK' : telematics.motorTemp > 65 ? 'ELEVATED' : 'NOMINAL'}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-slate-100">
            {jouleanHeatingWatts} W
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Internal I²R Joulean heating loss across cell interconnects and contactors.
          </p>
        </div>

        {/* Metric 2: Parasitic Drain & Autonomy */}
        <div className="p-3.5 rounded bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <BatteryWarning className="w-3.5 h-3.5 text-amber-400" />
              Quiescent Parasitic Load
            </span>
            <span className="text-slate-300 font-bold font-mono">
              {bmsOutput.hardware_toggles.gps_module === 'OFF' ? 'SLEEP GATED' : 'DRAINING'}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-slate-100">
            {parasiticQuiescentMa}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Projected pack endurance: {daysUntilZeroPercent} before deep cell bricking.
          </p>
        </div>

        {/* Metric 3: Security & Interlock State */}
        <div className="p-3.5 rounded bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Drivetrain Interlock
            </span>
            <span
              className={
                bmsOutput.hardware_toggles.drivetrain_lock === 'ON'
                  ? 'text-rose-400 font-bold'
                  : 'text-emerald-400 font-bold'
              }
            >
              {bmsOutput.hardware_toggles.drivetrain_lock === 'ON' ? 'LOCKED' : 'ENGAGED'}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-slate-100">
            {bmsOutput.hardware_toggles.drivetrain_lock === 'ON'
              ? 'Solenoid Engaged'
              : 'Free Throttle'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bluetooth security handshake: {telematics.bluetoothState}.
          </p>
        </div>
      </div>
    </div>
  );
};
