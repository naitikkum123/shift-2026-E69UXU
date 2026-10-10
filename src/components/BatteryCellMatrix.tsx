import React from 'react';
import { VehicleTelematics } from '../types/bms';
import { BatteryCharging, Shield, Thermometer, Layers } from 'lucide-react';
import bmsChassisImg from '../assets/images/escooter_bms_chassis_1791627497385.jpg';

interface BatteryCellMatrixProps {
  telematics: VehicleTelematics;
}

export const BatteryCellMatrix: React.FC<BatteryCellMatrixProps> = ({ telematics }) => {
  // Generate 13 individual cell voltages centered around average cell V
  const avgCellV = telematics.packVoltage / 13;
  const isOverheating = telematics.batteryTemp > 45;

  const cells = Array.from({ length: 13 }, (_, i) => {
    // minor pseudo-realistic millivolt variation
    const noise = Math.sin(i * 1.5) * 0.015 + ((i % 3) - 1) * 0.008;
    const v = Math.min(4.25, Math.max(3.1, avgCellV + noise));
    const cellTemp = telematics.batteryTemp + (i > 5 && i < 10 ? 1.2 : -0.8);
    return {
      cellNum: i + 1,
      voltage: v,
      temp: cellTemp,
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 mb-4 gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>13S Battery Architecture & Thermal Distribution</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual lithium-ion cell balancing matrix and physical ECU chassis integration
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Pack Voltage: <strong className="text-slate-100 tabular-nums">{telematics.packVoltage.toFixed(1)}V</strong></span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span>Cell Variance: <strong className="text-slate-100 tabular-nums">23 mV</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Physical Chassis Image */}
        <div className="lg:col-span-5 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden flex flex-col">
          <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
            <img
              src={bmsChassisImg}
              alt="Electric Micromobility Battery Pack and BMS ECU Module"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Graceful fallback if image cannot load
                e.currentTarget.style.display = 'none';
              }}
            />
            {isOverheating && (
              <div className="absolute inset-0 bg-rose-950/40 backdrop-blur-[1px] flex items-center justify-center p-4">
                <div className="bg-rose-950/90 border border-rose-600 rounded px-3 py-1.5 text-xs font-mono text-rose-200 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>THERMAL RUNAWAY HAZARD OVER 45°C</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 text-xs text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80">
            <span>HW Module: AI-BMS-54V-PRO</span>
            <span>21700 High-Drain Cells</span>
          </div>
        </div>

        {/* Right: 13-Cell Real-Time Matrix */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center justify-between">
            <span>Cell Voltage & Thermal Map</span>
            <span>Passive Bleed Shunt: Standby</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {cells.map((cell) => {
              const isCellHot = cell.temp > 45;
              return (
                <div
                  key={cell.cellNum}
                  className={`p-2.5 rounded border text-xs font-mono flex flex-col justify-between transition-colors ${
                    isCellHot
                      ? 'bg-rose-950/40 border-rose-700/80 text-rose-200'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>C-{cell.cellNum < 10 ? `0${cell.cellNum}` : cell.cellNum}</span>
                    <span className={isCellHot ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                      {cell.temp.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold tabular-nums text-slate-100">
                    {cell.voltage.toFixed(3)} V
                  </div>
                  <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full ${
                        isCellHot
                          ? 'bg-rose-500'
                          : cell.voltage < 3.4
                          ? 'bg-amber-500'
                          : 'bg-cyan-400'
                      }`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, ((cell.voltage - 3.0) / 1.2) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-400 block text-[11px]">Chemistry</span>
              <span className="text-slate-200 font-semibold">NMC 811 Lithium</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Charge Cycles</span>
              <span className="text-slate-200 font-semibold tabular-nums">284 / 1200</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Internal Res. (ESR)</span>
              <span className="text-slate-200 font-semibold tabular-nums">14.2 mΩ</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Thermal Probes</span>
              <span className="text-slate-200 font-semibold">4x NTC 10kΩ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
