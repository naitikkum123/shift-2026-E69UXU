export type SafetyStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export type BluetoothState =
  | 'CONNECTED'
  | 'DISCONNECTED_STATIONARY'
  | 'DISCONNECTED_MOVING'
  | 'UNAUTHORIZED_HIJACK_ATTEMPT';

export interface HardwareToggles {
  charging_relay: 'ON' | 'OFF';
  motor_power_limit: string; // e.g. "50%" or "100%"
  gps_module: 'ON' | 'OFF';
  cellular_data: 'ON' | 'OFF';
  drivetrain_lock: 'ON' | 'OFF';
}

export interface BmsDecisionOutput {
  safety_status: SafetyStatus;
  hardware_toggles: HardwareToggles;
  owner_notification: string | null;
}

export interface CellData {
  cellNumber: number;
  voltage: number; // in Volts, e.g. 4.02
  temperature: number; // in Celsius
}

export interface VehicleTelematics {
  // Battery Thermal & Power
  batteryTemp: number; // °C
  batteryTempRateOfChange: number; // °C/min (e.g. >2.0 indicates rapidly rising)
  isChargerConnected: boolean;
  chargingCurrent: number; // Amperes (>0 when actively charging)
  packVoltage: number; // Volts (nominal ~48V, full ~54.6V)
  stateOfCharge: number; // % (0 - 100)

  // Motor & Mechanical Dynamics
  motorTemp: number; // °C (spiking if >65°C)
  motorTempRateOfChange: number; // °C/min
  passengerWeight: number; // kg
  ratedCapacityWeight: number; // kg (default 100kg)
  torque: number; // Nm (high strain if >50 Nm)
  vehicleSpeed: number; // km/h (0 = stationary)

  // Inactivity & Storage
  inactiveDays: number; // Days unattended (e.g. >30 days)

  // Connectivity & Security
  bluetoothState: BluetoothState;

  // Additional Subsystem Telematics
  peripheralsDrawWatts: number;
  cellBalanceVarianceMv: number;
}

export interface RuleEvaluationResult {
  ruleId: 1 | 2 | 3 | 4;
  title: string;
  triggered: boolean;
  severity: SafetyStatus;
  conditions: {
    label: string;
    actualValue: string;
    threshold: string;
    met: boolean;
  }[];
  actionTaken: string;
  affectedToggles: Partial<HardwareToggles>;
  notificationGenerated: string | null;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  category: 'Rule 1' | 'Rule 2' | 'Rule 3' | 'Rule 4' | 'Safe' | 'Multi-Fault';
  summary: string;
  telematics: VehicleTelematics;
}

export interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  source: 'RULE_ENGINE' | 'TELEMETRY_STREAM' | 'USER_OVERRIDE';
  ruleId?: 1 | 2 | 3 | 4;
  event: string;
  severity: SafetyStatus;
  details: string;
}
