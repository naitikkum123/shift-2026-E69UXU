export type SystemSafetyStatus = 'NORMAL' | 'OVERLOAD_ALERT' | 'THERMAL_OVERHEAT' | 'DEEP_SLEEP' | 'SECURITY_LOCKOUT';

export type ChargeMode = 'FAST_CHARGING' | 'TRICKLE_CHARGING' | 'BALANCING' | 'DISCONNECTED';

export interface ERickshawTelematics {
  // 1. Thermal & Battery Core
  batteryTemp: number; // °C (> 50°C is overheat trigger)
  batteryTempRate: number; // °C/min
  packVoltage: number; // Volts (nominal 48V - 54.6V)
  stateOfCharge: number; // % (0 - 100)
  stateOfHealth: number; // SoH % (e.g. 96.5%)
  chargeCyclesCompleted: number; // e.g. 340 cycles
  maxRatedCycles: number; // e.g. 2500 cycles
  chargeMode: ChargeMode;
  chargingCurrent: number; // Amperes
  timeToFullMinutes: number; // e.g. 45 mins

  // 2. Motor & Draw Current Dynamics
  motorDrawCurrent: number; // Current Amperes (e.g. 45A nominal, reduced by 30% to ~31.5A on overheat)
  nominalRatedCurrent: number; // Amperes (e.g. 45A)
  motorDrawReductionPercent: number; // 0% or 30%
  motorTemp: number; // °C
  vehicleSpeed: number; // km/h (0 = stationary)
  isMoving: boolean;
  isIgnited: boolean;

  // 3. Passenger Overload (Cabin Sensors & Pressure Matrix)
  passengerCount: number; // 0 - 10 passengers (Rated: max 6 passengers)
  ratedPassengerCapacity: number; // 6
  passengerWeightsKg: number[]; // weights of detected occupants
  totalPayloadKg: number; // kg

  // 4. Inactivity & Storage
  unDrivenDurationDays: number; // Days (3 years = 1095 days)
  unDrivenDurationYears: number; // Years float

  // 5. Bluetooth Security & Ignition
  bluetoothIgnitionActive: boolean;
  authorizedDriverMac: string;
  connectedDeviceMac: string;
  externalPairingLocked: boolean;
  killedThreadCount: number;

  // 6. Performance Telemetry
  energyEfficiencyWhPerKm: number; // e.g. 38 Wh/km
  instantaneousDischargeRateC: number; // e.g. 0.85 C
}

export interface ControllerActionsOutput {
  system_status: SystemSafetyStatus;
  thermal_override: {
    alarm_active: boolean;
    draw_current_limit: string; // e.g. "70% (30% REDUCED)" or "100% NOMINAL"
    actual_motor_draw_a: number;
    reason: string | null;
  };
  passenger_overload: {
    overload_alert: boolean;
    cabin_alarm_active: boolean;
    passenger_count: number;
    max_allowed: 6;
    status_text: string;
  };
  deep_sleep_storage: {
    deep_sleep_forced: boolean;
    gps_module_power: 'ON' | 'OFF';
    cellular_module_power: 'ON' | 'OFF';
    non_essential_bus: 'ON' | 'OFF';
    ghost_drain_ma: number;
  };
  bluetooth_motion_lockout: {
    external_pairing_locked: boolean;
    strict_primary_driver_only: boolean;
    unauthorized_threads_killed: number;
    lockout_reason: string | null;
  };
  battery_health_reporting: {
    state_of_health_pct: number;
    state_of_charge_pct: number;
    remaining_cycle_life_pct: number;
    time_to_full_display: string;
    efficiency_wh_km: number;
    discharge_c_rate: number;
    cycle_count: number;
  };
  active_alarms: {
    thermal_hardware_alarm: boolean;
    cabin_overload_alarm: boolean;
  };
  ai_storage_message: AiStorageMessage | null;
}

export interface AiStorageMessage {
  isSent: boolean;
  messageId: string;
  timestamp: string;
  channel: 'CELLULAR_BURST_SMS' | 'BLE_BROADCAST' | 'FLEET_TELEMETRY';
  recipient: string;
  priority: 'CRITICAL';
  subject: string;
  body: string;
  preShutdownStatus: string;
}

// ==========================================
// Legacy Types for Backwards Compatibility
// ==========================================
export type SafetyStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export type BluetoothState =
  | 'CONNECTED'
  | 'DISCONNECTED_STATIONARY'
  | 'DISCONNECTED_MOVING'
  | 'UNAUTHORIZED_HIJACK_ATTEMPT';

export interface HardwareToggles {
  charging_relay: 'ON' | 'OFF';
  motor_power_limit: string;
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
  voltage: number;
  temperature: number;
}

export interface VehicleTelematics {
  batteryTemp: number;
  batteryTempRateOfChange: number;
  isChargerConnected: boolean;
  chargingCurrent: number;
  packVoltage: number;
  stateOfCharge: number;
  motorTemp: number;
  motorTempRateOfChange: number;
  passengerWeight: number;
  ratedCapacityWeight: number;
  torque: number;
  vehicleSpeed: number;
  inactiveDays: number;
  bluetoothState: BluetoothState;
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
