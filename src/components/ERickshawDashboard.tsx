import React from 'react';
import {
  ERickshawTelematics,
  ControllerActionsOutput,
} from '../types/bms';
import {
  Users,
  Flame,
  Zap,
  Gauge,
  Moon,
  Bluetooth,
  BatteryCharging,
  ShieldCheck,
  ShieldAlert,
  Radio,
  MapPin,
  Clock,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { AiStorageMessageCard } from './AiStorageMessageCard';
import { LiveThermalTelemetryChart } from './LiveThermalTelemetryChart';

interface ERickshawDashboardProps {
  telematics: ERickshawTelematics;
  controllerActions: ControllerActionsOutput;
  onChange: (updated: Partial<ERickshawTelematics>) => void;
}

export const ERickshawDashboard: React.FC<ERickshawDashboardProps> = ({
  telematics,
  controllerActions,
  onChange,
}) => {
  const isOverheat = controllerActions.thermal_override.alarm_active;
  const isOverload = controllerActions.passenger_overload.overload_alert;
  const isStorageSleep = controllerActions.deep_sleep_storage.deep_sleep_forced;
  const isBtLocked = controllerActions.bluetooth_motion_lockout.external_pairing_locked;

  return (
    <div className="space-y-6">
      {/* 5-Rule Edge Trigger Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Thermal Overheat Protection */}
        <div
          className={`p-3.5 rounded-lg border transition-all ${
            isOverheat
              ? 'bg-rose-950/40 border-rose-600 text-rose-100 shadow-md shadow-rose-950/40'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Rule 1 · Thermal Safety</span>
            <Flame className={`w-4 h-4 ${isOverheat ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 text-lg font-bold font-mono">
            {telematics.batteryTemp.toFixed(1)}°C
          </div>
          <div className="mt-1 text-xs">
            {isOverheat ? (
              <span className="text-rose-300 font-semibold flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                Alarm Active (-30% Draw)
              </span>
            ) : (
              <span className="text-emerald-400">Nominal (Threshold &gt;50°C)</span>
            )}
          </div>
        </div>

        {/* Card 2: Passenger Overloading Prevention */}
        <div
          className={`p-3.5 rounded-lg border transition-all ${
            isOverload
              ? 'bg-amber-950/40 border-amber-600 text-amber-100 shadow-md shadow-amber-950/40'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Rule 2 · Cabin Occupancy</span>
            <Users className={`w-4 h-4 ${isOverload ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 text-lg font-bold font-mono">
            {telematics.passengerCount} / 6 Pax
          </div>
          <div className="mt-1 text-xs">
            {isOverload ? (
              <span className="text-amber-300 font-semibold">
                OVERLOAD ALERT · Chime ON
              </span>
            ) : (
              <span className="text-emerald-400">Capacity Legal (Max 6)</span>
            )}
          </div>
        </div>

        {/* Card 3: Deep Sleep & Storage */}
        <div
          className={`p-3.5 rounded-lg border transition-all ${
            isStorageSleep
              ? 'bg-indigo-950/40 border-indigo-600 text-indigo-100'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Rule 3 · Storage Sleep</span>
            <Moon className={`w-4 h-4 ${isStorageSleep ? 'text-indigo-400' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 text-lg font-bold font-mono">
            {telematics.unDrivenDurationYears.toFixed(1)} Yrs
          </div>
          <div className="mt-1 text-xs">
            {isStorageSleep ? (
              <span className="text-indigo-300 font-semibold">GPS & Cell Cut (0W Drain)</span>
            ) : (
              <span className="text-slate-400">Active Duty (&lt; 3 Yrs)</span>
            )}
          </div>
        </div>

        {/* Card 4: Bluetooth Motion Lockout */}
        <div
          className={`p-3.5 rounded-lg border transition-all ${
            isBtLocked
              ? 'bg-cyan-950/40 border-cyan-600 text-cyan-100'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Rule 4 · BT Lockout</span>
            <Bluetooth className={`w-4 h-4 ${isBtLocked ? 'text-cyan-400' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 text-lg font-bold font-mono">
            {isBtLocked ? 'LOCKED OUT' : 'CONFIGURABLE'}
          </div>
          <div className="mt-1 text-xs text-cyan-300">
            {isBtLocked ? `Primary Driver Only · ${controllerActions.bluetooth_motion_lockout.unauthorized_threads_killed} Threads Cut` : 'Stationary Paired'}
          </div>
        </div>

        {/* Card 5: Battery Health Lifeline */}
        <div className="p-3.5 rounded-lg border bg-slate-900 border-slate-800 text-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Rule 5 · Battery Lifeline</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-emerald-400">
            {telematics.stateOfHealth.toFixed(1)}% SoH
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {controllerActions.battery_health_reporting.remaining_cycle_life_pct}% Life Remaining
          </div>
        </div>
      </div>
      
      {/* AI Automated Storage Dispatch Intercept (Prolonged Storage > 3 Years) */}
      <AiStorageMessageCard
        message={controllerActions.ai_storage_message}
        onTriggerTest={() => onChange({ unDrivenDurationYears: 3.4, unDrivenDurationDays: 1241 })}
      />

      {/* Main Interactive Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Telematics Inputs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Passenger Cabin Occupancy Control (Rule 2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Passenger Cabin Matrix & Weight Sensors (Rule 2)
                </h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                isOverload ? 'bg-amber-950 text-amber-300 border border-amber-600' : 'bg-slate-950 text-slate-400'
              }`}>
                {telematics.passengerCount} PASSENGERS
              </span>
            </div>

            {/* Visual Cabin Seating Representation */}
            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800/80 mb-4">
              <div className="text-[11px] font-mono text-slate-400 mb-3 text-center uppercase tracking-wider">
                E-Rickshaw Cabin Seating Plan (Front Driver + Rear Benches)
              </div>
              
              {/* Driver Seat */}
              <div className="flex justify-center mb-3">
                <div className="px-4 py-1.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Driver Seat (Authorized Operator)</span>
                </div>
              </div>

              {/* Rear Bench 1 & 2 Seats (Max 6 rated) */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[1, 2, 3].map((seatNum) => {
                  const isOccupied = telematics.passengerCount >= seatNum;
                  return (
                    <div
                      key={seatNum}
                      className={`p-2.5 rounded text-center text-xs font-mono border transition-all ${
                        isOccupied
                          ? 'bg-slate-800 border-slate-700 text-slate-100'
                          : 'bg-slate-900/40 border-dashed border-slate-800 text-slate-600'
                      }`}
                    >
                      <span>Seat 0{seatNum}</span>
                      <div className="text-[11px] mt-0.5 text-slate-400">
                        {isOccupied ? 'Occupied (~68kg)' : 'Empty'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[4, 5, 6].map((seatNum) => {
                  const isOccupied = telematics.passengerCount >= seatNum;
                  return (
                    <div
                      key={seatNum}
                      className={`p-2.5 rounded text-center text-xs font-mono border transition-all ${
                        isOccupied
                          ? 'bg-slate-800 border-slate-700 text-slate-100'
                          : 'bg-slate-900/40 border-dashed border-slate-800 text-slate-600'
                      }`}
                    >
                      <span>Seat 0{seatNum}</span>
                      <div className="text-[11px] mt-0.5 text-slate-400">
                        {isOccupied ? 'Occupied (~70kg)' : 'Empty'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extra Illegal Passengers (> 6) */}
              {telematics.passengerCount > 6 && (
                <div className="mt-3 p-2.5 rounded bg-amber-950/70 border border-amber-600 text-amber-200 text-xs font-mono text-center">
                  ⚠️ Safety Violation: {telematics.passengerCount - 6} Standing / Overcrowded Occupants Detected Beyond Rated Limit!
                </div>
              )}
            </div>

            {/* Slider to adjust passenger occupancy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Adjust Cabin Occupancy:</span>
                <span className={isOverload ? 'text-amber-400 font-bold' : 'text-slate-100'}>
                  {telematics.passengerCount} Passengers {isOverload ? '(ILLEGAL OVERLOAD)' : '(LEGAL)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={telematics.passengerCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value, 10);
                  onChange({
                    passengerCount: count,
                    totalPayloadKg: count * 68,
                  });
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0 Empty</span>
                <span className="text-emerald-400 font-semibold">6 Rated Limit</span>
                <span className="text-amber-400">10 Overcrowded</span>
              </div>
            </div>
          </div>

          {/* Thermal & Motor Controller Clamping (Rule 1) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Thermal Overheat & Motor Draw Reduction (Rule 1)
                </h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                isOverheat ? 'bg-rose-950 text-rose-300 border border-rose-600' : 'bg-slate-950 text-slate-400'
              }`}>
                {telematics.batteryTemp.toFixed(1)}°C
              </span>
            </div>

            {/* Motor Controller Current Comparator */}
            <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Nominal Current Draw</span>
                <span className="text-lg font-bold text-slate-100">45.0 A</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">100% Full Power Rating</span>
              </div>
              <div className={`p-3 rounded border transition-all ${
                isOverheat ? 'bg-rose-950/60 border-rose-600 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <span className="text-slate-400 block text-[11px]">Motor Controller Clamp</span>
                <span className={`text-lg font-bold ${isOverheat ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {controllerActions.thermal_override.actual_motor_draw_a} A
                </span>
                <span className="text-[11px] block mt-0.5">
                  {isOverheat ? '⚡ REDUCED BY 30% (70% CAP)' : 'Unrestricted'}
                </span>
              </div>
            </div>

            {/* Slider to adjust battery temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Battery Monitoring Thermistor:</span>
                <span className={isOverheat ? 'text-rose-400 font-bold' : 'text-slate-100'}>
                  {telematics.batteryTemp.toFixed(1)}°C {isOverheat ? '(BREACH > 50°C)' : '(NORMAL)'}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="75"
                step="0.5"
                value={telematics.batteryTemp}
                onChange={(e) => onChange({ batteryTemp: parseFloat(e.target.value) })}
                className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>20°C Cool</span>
                <span className="text-rose-400 font-semibold">50.0°C Safety Threshold</span>
                <span>75°C Critical</span>
              </div>
            </div>

            {/* Live Thermal & Overload Telemetry Graph for Rule 1 */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <LiveThermalTelemetryChart />
            </div>
          </div>

          {/* Deep Sleep Storage & Bluetooth Lockout (Rules 3 & 4) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Prolonged Storage (&gt;3 Yrs) & Bluetooth Ignition (Rules 3 & 4)</span>
            </h3>

            {/* Un-driven Duration Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Un-driven Inactivity Duration:</span>
                <span className={isStorageSleep ? 'text-indigo-400 font-bold' : 'text-slate-100'}>
                  {telematics.unDrivenDurationYears.toFixed(1)} Years ({telematics.unDrivenDurationDays} Days)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={telematics.unDrivenDurationYears}
                onChange={(e) => {
                  const yrs = parseFloat(e.target.value);
                  onChange({
                    unDrivenDurationYears: yrs,
                    unDrivenDurationDays: Math.round(yrs * 365),
                  });
                }}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0 Days</span>
                <span className="text-indigo-400 font-semibold">3.0 Years Threshold</span>
                <span>5.0 Years</span>
              </div>
            </div>

            {/* Vehicle Motion & Bluetooth Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <button
                onClick={() => {
                  const moving = !telematics.isMoving;
                  onChange({
                    isMoving: moving,
                    vehicleSpeed: moving ? 22.0 : 0.0,
                  });
                }}
                className={`p-2.5 rounded border text-left transition-colors ${
                  telematics.isMoving
                    ? 'bg-cyan-950/60 border-cyan-600 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[11px] block">Vehicle Motion State:</span>
                <span className="font-bold text-sm block mt-0.5">
                  {telematics.isMoving ? `MOVING (${telematics.vehicleSpeed} km/h)` : 'STATIONARY (0 km/h)'}
                </span>
              </button>

              <button
                onClick={() => onChange({ bluetoothIgnitionActive: !telematics.bluetoothIgnitionActive })}
                className={`p-2.5 rounded border text-left transition-colors ${
                  telematics.bluetoothIgnitionActive
                    ? 'bg-cyan-950/60 border-cyan-600 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[11px] block">Bluetooth Ignition:</span>
                <span className="font-bold text-sm block mt-0.5">
                  {telematics.bluetoothIgnitionActive ? 'IGNITED (Active)' : 'KEY-OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Rule 5 Telemetry & Battery Health Reporting + Hardware Overrides */}
        <div className="lg:col-span-6 space-y-6">
          {/* Rule 5: Telemetry & Battery Health Reporting Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Telemetry & Battery Health Reporting (Rule 5)
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Post-Charge Calculated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs mb-4">
              {/* Metric: SoH */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">State of Health (SoH)</span>
                <span className="text-xl font-bold text-emerald-400 tabular-nums">
                  {controllerActions.battery_health_reporting.state_of_health_pct}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Electrochemical Integrity</span>
              </div>

              {/* Metric: SoC */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">State of Charge (SoC)</span>
                <span className="text-xl font-bold text-cyan-400 tabular-nums">
                  {controllerActions.battery_health_reporting.state_of_charge_pct}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{telematics.packVoltage.toFixed(1)}V Pack</span>
              </div>

              {/* Metric: Lifeline Remaining */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Remaining Lifeline</span>
                <span className="text-xl font-bold text-amber-400 tabular-nums">
                  {controllerActions.battery_health_reporting.remaining_cycle_life_pct}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {telematics.chargeCyclesCompleted} / {telematics.maxRatedCycles} Cycles
                </span>
              </div>

              {/* Metric: Energy Efficiency */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Energy Efficiency</span>
                <span className="text-xl font-bold text-slate-100 tabular-nums">
                  {controllerActions.battery_health_reporting.efficiency_wh_km}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Watt-hours / km</span>
              </div>

              {/* Metric: Discharge Rate */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Discharge C-Rate</span>
                <span className="text-xl font-bold text-slate-100 tabular-nums">
                  {controllerActions.battery_health_reporting.discharge_c_rate} C
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Instantaneous Draw</span>
              </div>

              {/* Metric: Time to Full */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Time-to-Full</span>
                <span className="text-sm font-bold text-slate-200 mt-1 block">
                  {controllerActions.battery_health_reporting.time_to_full_display}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{telematics.chargeMode}</span>
              </div>
            </div>

            {/* Post-Charge Lifetime Gauge */}
            <div className="p-3 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">Battery Life Cycle Depletion Tracker</span>
                <span className="text-emerald-400">
                  {telematics.maxRatedCycles - telematics.chargeCyclesCompleted} Cycles Remaining
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${controllerActions.battery_health_reporting.remaining_cycle_life_pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Edge Trigger Hardware Enforcements & Power Bus */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Hardware Interlocks & Power Gates</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {/* Hardware Interlock 1: High-Priority Thermal Alarm */}
              <div className={`p-3 rounded border flex items-center justify-between ${
                isOverheat ? 'bg-rose-950/40 border-rose-600 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Volume2 className={`w-4 h-4 ${isOverheat ? 'text-rose-400 animate-pulse' : 'text-slate-600'}`} />
                  <div>
                    <span className="font-semibold block">High-Priority Hardware Alarm</span>
                    <span className="text-[11px] text-slate-400">
                      {isOverheat ? 'SOUNDING: 1500Hz Piezo Siren Triggered (>50°C)' : 'Armed in standby'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                  isOverheat ? 'bg-rose-900 text-rose-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isOverheat ? 'ACTIVE ALARM' : 'STANDBY'}
                </span>
              </div>

              {/* Hardware Interlock 2: Cabin Driver Chime */}
              <div className={`p-3 rounded border flex items-center justify-between ${
                isOverload ? 'bg-amber-950/40 border-amber-600 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Volume2 className={`w-4 h-4 ${isOverload ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
                  <div>
                    <span className="font-semibold block">Cabin Driver Overload Chime</span>
                    <span className="text-[11px] text-slate-400">
                      {isOverload ? 'RINGING: Overload Alert > 6 Passengers' : 'Armed in standby'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                  isOverload ? 'bg-amber-900 text-amber-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isOverload ? 'CHIME RINGING' : 'STANDBY'}
                </span>
              </div>

              {/* Hardware Interlock 3: Deep Sleep Power Isolation */}
              <div className={`p-3 rounded border flex items-center justify-between ${
                isStorageSleep ? 'bg-indigo-950/40 border-indigo-600 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <MapPin className={`w-4 h-4 ${isStorageSleep ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <div>
                    <span className="font-semibold block">GPS & Cellular Power Modules</span>
                    <span className="text-[11px] text-slate-400">
                      {isStorageSleep ? 'POWER CUT: 0.05mA Quiescent Ghost Drain' : 'POWER ON: GPS & 4G Active'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                  isStorageSleep ? 'bg-indigo-900 text-indigo-200' : 'bg-emerald-950 text-emerald-400'
                }`}>
                  {isStorageSleep ? 'ISOLATED' : 'POWERED'}
                </span>
              </div>

              {/* Hardware Interlock 4: Bluetooth Pairing & Thread Killer */}
              <div className={`p-3 rounded border flex items-center justify-between ${
                isBtLocked ? 'bg-cyan-950/40 border-cyan-600 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Bluetooth className={`w-4 h-4 ${isBtLocked ? 'text-cyan-400' : 'text-slate-600'}`} />
                  <div>
                    <span className="font-semibold block">External Bluetooth Pairing Bus</span>
                    <span className="text-[11px] text-slate-400">
                      {isBtLocked ? 'LOCKED: Non-driver connection threads force-killed' : 'Unlocked in stationary mode'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                  isBtLocked ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isBtLocked ? 'LOCKED' : 'OPEN'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
