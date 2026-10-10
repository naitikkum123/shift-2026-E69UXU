import React from 'react';
import { VehicleTelematics, BluetoothState } from '../types/bms';
import {
  Thermometer,
  Zap,
  Gauge,
  Weight,
  Clock,
  Battery,
  Bluetooth,
  SlidersHorizontal,
} from 'lucide-react';

interface TelematicsControlPanelProps {
  telematics: VehicleTelematics;
  onChange: (updated: Partial<VehicleTelematics>) => void;
}

export const TelematicsControlPanel: React.FC<TelematicsControlPanelProps> = ({
  telematics,
  onChange,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Sensor Telematics Control Stream
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live physical sensor inputs feeding the AI-BMS diagnostic engine
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-cyan-400">
          ADC Sampling: 16-Bit Synchronous
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Stream 1: Battery Temperature */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                Battery Pack Temp
              </span>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  telematics.batteryTemp > 45 ? 'text-rose-400' : 'text-slate-100'
                }`}
              >
                {telematics.batteryTemp.toFixed(1)}°C
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rule 1 safety threshold: &gt; 45.0°C
            </p>
            <input
              type="range"
              min="15"
              max="65"
              step="0.5"
              value={telematics.batteryTemp}
              onChange={(e) => onChange({ batteryTemp: parseFloat(e.target.value) })}
              className="w-full mt-2 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Rate of Rise (ΔT):</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  onChange({
                    batteryTempRateOfChange:
                      telematics.batteryTempRateOfChange >= 2.0 ? 0.2 : 2.5,
                  })
                }
                className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
                  telematics.batteryTempRateOfChange >= 2.0
                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {telematics.batteryTempRateOfChange >= 2.0
                  ? '+2.5°C/min (Rapid Rise)'
                  : '+0.2°C/min (Normal)'}
              </button>
            </div>
          </div>
        </div>

        {/* Stream 2: Charger & Current */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Charger Current
              </span>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  telematics.chargingCurrent > 0 ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {telematics.isChargerConnected
                  ? `${telematics.chargingCurrent.toFixed(1)} A`
                  : '0.0 A'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rule 1 trigger: Active current flow &gt; 0A
            </p>
            <input
              type="range"
              min="0"
              max="10"
              step="0.2"
              disabled={!telematics.isChargerConnected}
              value={telematics.isChargerConnected ? telematics.chargingCurrent : 0}
              onChange={(e) =>
                onChange({
                  chargingCurrent: parseFloat(e.target.value),
                  isChargerConnected: parseFloat(e.target.value) > 0,
                })
              }
              className={`w-full mt-2 accent-amber-400 h-1.5 bg-slate-800 rounded-lg ${
                telematics.isChargerConnected ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Physical Connector:</span>
            <button
              onClick={() => {
                const nextConnected = !telematics.isChargerConnected;
                onChange({
                  isChargerConnected: nextConnected,
                  chargingCurrent: nextConnected ? (telematics.chargingCurrent || 4.2) : 0,
                });
              }}
              className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
                telematics.isChargerConnected
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {telematics.isChargerConnected ? '● PLUGGED IN' : '○ DISCONNECTED'}
            </button>
          </div>
        </div>

        {/* Stream 3: Motor Temp & Mechanical Heat */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                Motor / Mech Temp
              </span>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  telematics.motorTemp > 65 ? 'text-rose-400' : 'text-slate-100'
                }`}
              >
                {telematics.motorTemp.toFixed(1)}°C
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rule 2 trigger: Spiking &gt; 65.0°C
            </p>
            <input
              type="range"
              min="20"
              max="95"
              step="0.5"
              value={telematics.motorTemp}
              onChange={(e) => onChange({ motorTemp: parseFloat(e.target.value) })}
              className="w-full mt-2 accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Torque Sensor:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={telematics.torque}
                onChange={(e) => onChange({ torque: parseFloat(e.target.value) })}
                className="w-20 accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-[11px] font-mono tabular-nums text-slate-300 w-12 text-right">
                {telematics.torque.toFixed(0)} Nm
              </span>
            </div>
          </div>
        </div>

        {/* Stream 4: Passenger Weight & Rated Capacity */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-amber-400" />
                Passenger Payload
              </span>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  telematics.passengerWeight > telematics.ratedCapacityWeight
                    ? 'text-rose-400'
                    : 'text-slate-100'
                }`}
              >
                {telematics.passengerWeight.toFixed(0)} kg
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rated limit: {telematics.ratedCapacityWeight} kg ({
                telematics.passengerWeight > telematics.ratedCapacityWeight
                  ? 'OVERLOADED'
                  : 'WITHIN SPEC'
              })
            </p>
            <input
              type="range"
              min="0"
              max="180"
              step="1"
              value={telematics.passengerWeight}
              onChange={(e) => onChange({ passengerWeight: parseFloat(e.target.value) })}
              className="w-full mt-2 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Vehicle Speed:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={telematics.vehicleSpeed}
                onChange={(e) => onChange({ vehicleSpeed: parseFloat(e.target.value) })}
                className="w-20 accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-[11px] font-mono tabular-nums text-slate-300 w-14 text-right">
                {telematics.vehicleSpeed.toFixed(0)} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Stream 5: Inactivity & Storage Duration */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Unattended Inactivity
              </span>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  telematics.inactiveDays > 30 ? 'text-amber-400' : 'text-slate-100'
                }`}
              >
                {telematics.inactiveDays} Days
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rule 3 trigger: &gt; 30 days stationary uncharged
            </p>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={telematics.inactiveDays}
              onChange={(e) => onChange({ inactiveDays: parseInt(e.target.value, 10) })}
              className="w-full mt-2 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Pack Voltage:</span>
            <span className="text-[11px] font-mono tabular-nums text-slate-300">
              {telematics.packVoltage.toFixed(1)} V (13S Li-Ion)
            </span>
          </div>
        </div>

        {/* Stream 6: Battery State of Charge (SoC) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                State of Charge (SoC)
              </span>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  telematics.stateOfCharge < 20 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {telematics.stateOfCharge.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rule 3 trigger: SoC &lt; 20.0%
            </p>
            <input
              type="range"
              min="5"
              max="100"
              step="0.5"
              value={telematics.stateOfCharge}
              onChange={(e) => {
                const soc = parseFloat(e.target.value);
                // Approximate 13S voltage from SoC
                const approxV = 39.0 + (soc / 100) * 15.6;
                onChange({
                  stateOfCharge: soc,
                  packVoltage: parseFloat(approxV.toFixed(1)),
                });
              }}
              className="w-full mt-2 accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Reserve Mode:</span>
            <span
              className={`text-[11px] font-mono ${
                telematics.stateOfCharge < 20 ? 'text-rose-400 font-bold' : 'text-emerald-400'
              }`}
            >
              {telematics.stateOfCharge < 20 ? 'DEPLETED / SLEEP TARGET' : 'NOMINAL RANGE'}
            </span>
          </div>
        </div>
      </div>

      {/* Stream 7: Bluetooth Link State Selector */}
      <div className="mt-5 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              Bluetooth Ignition & Authentication Transceiver (Rule 4)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Triggers drivetrain lock & beacon if disconnected stationary OR hijack attempt
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {(
            [
              {
                id: 'CONNECTED',
                label: 'Authorized Paired',
                desc: 'Owner phone bonded with valid cryptographic key',
              },
              {
                id: 'DISCONNECTED_STATIONARY',
                label: 'Signal Lost (Stationary)',
                desc: 'Owner walked away while parked (Triggers Rule 4)',
              },
              {
                id: 'DISCONNECTED_MOVING',
                label: 'Signal Lost (In-Motion)',
                desc: 'Temporary RSSI dropout while riding (Failsafe grace)',
              },
              {
                id: 'UNAUTHORIZED_HIJACK_ATTEMPT',
                label: 'Rogue Hijack Attempt',
                desc: 'Unauthorized spoofing packet detected (Triggers Rule 4)',
              },
            ] as const
          ).map((item) => {
            const isSelected = telematics.bluetoothState === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChange({
                    bluetoothState: item.id as BluetoothState,
                    // If user selects disconnected stationary, ensure speed is 0 for realistic trigger
                    ...(item.id === 'DISCONNECTED_STATIONARY' ? { vehicleSpeed: 0 } : {}),
                    ...(item.id === 'DISCONNECTED_MOVING' && telematics.vehicleSpeed === 0
                      ? { vehicleSpeed: 18 }
                      : {}),
                  });
                }}
                className={`p-2.5 rounded text-left border transition-all ${
                  isSelected
                    ? item.id === 'UNAUTHORIZED_HIJACK_ATTEMPT' ||
                      item.id === 'DISCONNECTED_STATIONARY'
                      ? 'bg-rose-950/40 border-rose-600 text-rose-200'
                      : 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold font-mono">{item.label}</span>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900 border border-current">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
