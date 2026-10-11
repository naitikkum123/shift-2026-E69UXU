import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  Flame,
  Zap,
  AlertTriangle,
  Users,
  Moon,
  BatteryCharging,
  Info,
} from 'lucide-react';

// Exact realistic 10-minute trip dataset specified by user
const TRIP_TELEMETRY_DATA = [
  { time: '00:00', current: 34, temp: 35.0, phase: 'Baseline Commute' },
  { time: '02:00', current: 36, temp: 36.0, phase: 'Steady Cruising' },
  { time: '04:00', current: 82, temp: 39.0, phase: 'Overload Starts' },
  { time: '06:00', current: 86, temp: 44.5, phase: 'Thermal Escalation' },
  { time: '07:00', current: 84, temp: 48.2, phase: 'Thermal Threshold Hit' },
  { time: '08:00', current: 40, temp: 47.8, phase: '30% Derating Active' },
  { time: '10:00', current: 38, temp: 43.1, phase: 'Temperature Stabilizing' },
];

// Statement 2 Graph Data: Passenger Occupancy vs Motor Load (Overload Alert at >6 Pax)
const PASSENGER_OVERLOAD_DATA = [
  { passengers: 1, currentDraw: 26, motorTemp: 32, status: '1 Passenger (Driver + 1)' },
  { passengers: 2, currentDraw: 31, motorTemp: 34, status: '2 Passengers' },
  { passengers: 4, currentDraw: 42, motorTemp: 38, status: '4 Passengers (Nominal)' },
  { passengers: 6, currentDraw: 48, motorTemp: 44, status: '6 Passengers (Legal Limit)' },
  { passengers: 7, currentDraw: 68, motorTemp: 52, status: '7 Passengers (Overload Alert)' },
  { passengers: 8, currentDraw: 82, motorTemp: 64, status: '8 Passengers (Cabin Alarm)' },
  { passengers: 9, currentDraw: 90, motorTemp: 72, status: '9 Passengers (Severe Strain)' },
  { passengers: 10, currentDraw: 96, motorTemp: 80, status: '10 Passengers (Critical)' },
];

// Statement 3 Graph Data: Prolonged Storage Quiescent Drain (Cut at >3.0 Years)
const PROLONGED_STORAGE_DATA = [
  { years: 0.0, days: 0, ghostDrainMa: 38.5, socPct: 100, status: 'Active Duty' },
  { years: 0.5, days: 182, ghostDrainMa: 38.5, socPct: 88, status: 'Short Standby' },
  { years: 1.0, days: 365, ghostDrainMa: 38.5, socPct: 76, status: 'Unattended 1 Yr' },
  { years: 2.0, days: 730, ghostDrainMa: 38.5, socPct: 52, status: 'Unattended 2 Yrs' },
  { years: 2.9, days: 1058, ghostDrainMa: 38.5, socPct: 30, status: 'Storage Warning' },
  { years: 3.0, days: 1095, ghostDrainMa: 0.05, socPct: 28, status: 'Deep Sleep Triggered (Relays Cut)' },
  { years: 3.5, days: 1277, ghostDrainMa: 0.05, socPct: 27.5, status: 'Ghost Drain Severed (0.05mA)' },
  { years: 4.0, days: 1460, ghostDrainMa: 0.05, socPct: 27.0, status: 'Cells Preserved' },
];

// Statement 5 Graph Data: Post-Charge Battery Lifeline & SoH Degradation vs Cycle Count
const BATTERY_LIFELINE_DATA = [
  { cycle: 0, sohPct: 100.0, capacityAh: 100.0, efficiency: 98.2 },
  { cycle: 340, sohPct: 96.8, capacityAh: 96.8, efficiency: 97.4 }, // Current vehicle status
  { cycle: 700, sohPct: 92.5, capacityAh: 92.5, efficiency: 96.0 },
  { cycle: 1200, sohPct: 87.0, capacityAh: 87.0, efficiency: 94.5 },
  { cycle: 1800, sohPct: 82.0, capacityAh: 82.0, efficiency: 92.8 },
  { cycle: 2200, sohPct: 78.0, capacityAh: 78.0, efficiency: 91.0 },
  { cycle: 2500, sohPct: 74.5, capacityAh: 74.5, efficiency: 89.2 }, // End of design rated life
];

export const LiveThermalTelemetryChart: React.FC = () => {
  const [activeGraph, setActiveGraph] = useState<'thermal_trip' | 'passenger_overload' | 'storage_drain' | 'battery_lifeline'>('thermal_trip');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      {/* Title & Category Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              Live Thermal & Overload Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time edge telemetry graphs visualizing thermal derating, passenger strain, and storage life cycles
          </p>
        </div>

        {/* Graph Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveGraph('thermal_trip')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeGraph === 'thermal_trip'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>10-Min Trip (Current vs Temp)</span>
          </button>

          <button
            onClick={() => setActiveGraph('passenger_overload')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeGraph === 'passenger_overload'
                ? 'bg-amber-950 text-amber-300 border border-amber-700 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Passenger Overload (&gt;6 Pax)</span>
          </button>

          <button
            onClick={() => setActiveGraph('storage_drain')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeGraph === 'storage_drain'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Prolonged Storage (&gt;3 Yrs Cut)</span>
          </button>

          <button
            onClick={() => setActiveGraph('battery_lifeline')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeGraph === 'battery_lifeline'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>Battery Lifeline & SoH Decay</span>
          </button>
        </div>
      </div>

      {/* GRAPH 1: 10-Min Trip Dual-Axis Current & Temperature Telemetry (User Requested) */}
      {activeGraph === 'thermal_trip' && (
        <div>
          {/* Summary Metric Badges (Strictly as specified in prompt) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-amber-950/80 border border-amber-500/80 text-amber-300 font-bold flex items-center gap-1.5 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Status: Active Derating (Current Capped at 40A)</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">Current Draw:</span>
                <span className="font-bold text-blue-300">40A (-30% Throttle)</span>
              </div>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-400">Core Temp:</span>
                <span className="font-bold text-rose-300">43.1°C</span>
              </div>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-80 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={TRIP_TELEMETRY_DATA}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'Trip Elapsed Time (mm:ss)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                />

                {/* Left Y-Axis: Discharge Current (A) - Domain [0, 100], Blue */}
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  stroke="#2563eb"
                  tick={{ fill: '#60a5fa', fontSize: 11 }}
                  label={{
                    value: 'Discharge Current (A)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#60a5fa',
                    offset: 5,
                  }}
                />

                {/* Right Y-Axis: Battery Pack Temperature (°C) - Domain [25, 60], Red */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[25, 60]}
                  stroke="#dc2626"
                  tick={{ fill: '#f87171', fontSize: 11 }}
                  label={{
                    value: 'Battery Pack Temperature (°C)',
                    angle: 90,
                    position: 'insideRight',
                    fill: '#f87171',
                    offset: 10,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Discharge Current (A)') return [`${value} A`, name];
                    if (name === 'Battery Pack Temperature (°C)') return [`${value} °C`, name];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Timestamp: ${label}`}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                />

                {/* Horizontal Dashed Reference Line at 48°C on right axis */}
                <ReferenceLine
                  yAxisId="right"
                  y={48}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'Safety Derating Threshold (48°C)',
                    fill: '#dc2626',
                    position: 'insideTopLeft',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />

                {/* Discharge Current Line (#2563eb) */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="current"
                  name="Discharge Current (A)"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563eb', stroke: '#93c5fd', strokeWidth: 1 }}
                  activeDot={{ r: 7, fill: '#60a5fa' }}
                />

                {/* Battery Pack Temperature Line (#dc2626) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temp"
                  name="Battery Pack Temperature (°C)"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#dc2626', stroke: '#fca5a5', strokeWidth: 1 }}
                  activeDot={{ r: 7, fill: '#f87171' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trip Milestone Log Strip */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-400">
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">04:00 Milestone</span>
              <span className="text-amber-400 font-semibold">Overload Starts</span>
              <span className="text-[10px] block text-slate-400">Current surged to 82A</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">07:00 Milestone</span>
              <span className="text-rose-400 font-semibold">Threshold Hit (48.2°C)</span>
              <span className="text-[10px] block text-slate-400">Exceeded 48°C limit</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">08:00 Milestone</span>
              <span className="text-cyan-400 font-semibold">30% Derating Engaged</span>
              <span className="text-[10px] block text-slate-400">Current clamped to 40A</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">10:00 Milestone</span>
              <span className="text-emerald-400 font-semibold">Temp Stabilized (43.1°C)</span>
              <span className="text-[10px] block text-slate-400">Thermal runaway averted</span>
            </div>
          </div>
        </div>
      )}

      {/* GRAPH 2: Passenger Overload Curve (Rule 2) */}
      {activeGraph === 'passenger_overload' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Rule 2: Legal Passenger Threshold: 6 Occupants</span>
              </span>
            </div>
            <div className="text-slate-400">
              Occupancy &gt; 6 triggers <strong className="text-amber-300">Overload Alert</strong> & cabin driver chime
            </div>
          </div>

          <div className="h-80 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PASSENGER_OVERLOAD_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="passengers"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  label={{ value: 'Detected Occupants (Pax)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  stroke="#f59e0b"
                  tick={{ fill: '#fbbf24' }}
                  label={{ value: 'Motor Current Draw (A)', angle: -90, position: 'insideLeft', fill: '#fbbf24', offset: 5 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[20, 90]}
                  stroke="#ef4444"
                  tick={{ fill: '#f87171' }}
                  label={{ value: 'Motor Mechanical Temp (°C)', angle: 90, position: 'insideRight', fill: '#f87171', offset: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontFamily: 'monospace' }}
                  labelFormatter={(pax) => `${pax} Passengers Onboard`}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px' }} />
                <ReferenceLine
                  x={6}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{ value: 'Legal Limit (Max 6 Pax)', fill: '#ef4444', position: 'insideTopLeft' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="currentDraw" name="Current Draw (A)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="motorTemp" name="Motor Mechanical Temp (°C)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GRAPH 3: Prolonged Storage Quiescent Drain (Rule 3) */}
      {activeGraph === 'storage_drain' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-600 font-bold flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" />
                <span>Rule 3: Deep Sleep Trigger at 3.0 Years (1,095 Days)</span>
              </span>
            </div>
            <div className="text-slate-400">
              Ghost drain severed from <strong className="text-slate-200">38.5 mA</strong> to <strong className="text-emerald-400">0.05 mA</strong>
            </div>
          </div>

          <div className="h-80 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROLONGED_STORAGE_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="years"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  label={{ value: 'Inactivity Duration (Years Un-driven)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 45]}
                  stroke="#818cf8"
                  tick={{ fill: '#a5b4fc' }}
                  label={{ value: 'Parasitic Ghost Drain (mA)', angle: -90, position: 'insideLeft', fill: '#a5b4fc', offset: 5 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  stroke="#10b981"
                  tick={{ fill: '#34d399' }}
                  label={{ value: 'State of Charge (%)', angle: 90, position: 'insideRight', fill: '#34d399', offset: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontFamily: 'monospace' }}
                  formatter={(val: any, name: any) => (name.includes('mA') ? [`${val} mA`, name] : [`${val}%`, name])}
                  labelFormatter={(yrs) => `${yrs} Years Inactive`}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px' }} />
                <ReferenceLine
                  x={3.0}
                  stroke="#818cf8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{ value: '3.0 Yrs Isolation Trip', fill: '#818cf8', position: 'insideTopLeft' }}
                />
                <Area yAxisId="left" type="stepAfter" dataKey="ghostDrainMa" name="Parasitic Ghost Drain (mA)" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                <Line yAxisId="right" type="monotone" dataKey="socPct" name="State of Charge (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GRAPH 4: Battery Lifeline & SoH Degradation (Rule 5) */}
      {activeGraph === 'battery_lifeline' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>Rule 5: Coulombic Efficiency & Lifeline SoH Decay (2500 Cycles)</span>
              </span>
            </div>
            <div className="text-slate-400">
              Current Cycle: <strong className="text-cyan-400">340 / 2,500 Cycles</strong> (86.4% Lifetime Remaining)
            </div>
          </div>

          <div className="h-80 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BATTERY_LIFELINE_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="cycle"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  label={{ value: 'Cumulative Charge Cycles (Completed)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                />
                <YAxis
                  domain={[70, 100]}
                  stroke="#10b981"
                  tick={{ fill: '#34d399' }}
                  label={{ value: 'State of Health / Capacity (%)', angle: -90, position: 'insideLeft', fill: '#34d399', offset: 5 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontFamily: 'monospace' }}
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                  labelFormatter={(cycle) => `Cycle #${cycle}`}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px' }} />
                <ReferenceLine
                  x={340}
                  stroke="#06b6d4"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{ value: 'Current Pack (Cycle 340 · 96.8% SoH)', fill: '#06b6d4', position: 'insideTopLeft' }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{ value: 'EV Battery 2nd-Life Retirement Threshold (80% SoH)', fill: '#f59e0b', position: 'insideBottomRight' }}
                />
                <Line type="monotone" dataKey="sohPct" name="State of Health (SoH %)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="efficiency" name="Coulombic Efficiency (%)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Info strip */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Real-time ADC Sampling Rate: 10 Hz · CAN 2.0B Hardware Logging</span>
        </div>
        <span>Double-buffered SVG Engine via Recharts</span>
      </div>
    </div>
  );
};
