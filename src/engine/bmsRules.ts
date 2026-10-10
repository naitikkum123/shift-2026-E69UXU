import {
  VehicleTelematics,
  BmsDecisionOutput,
  RuleEvaluationResult,
  HardwareToggles,
  SafetyStatus,
} from '../types/bms';

export interface EvaluationEngineResult {
  output: BmsDecisionOutput;
  ruleResults: RuleEvaluationResult[];
  activeRuleCount: number;
  audibleBeaconActive: boolean;
  peripheralsActive: boolean;
}

export function evaluateBmsRules(
  telematics: VehicleTelematics,
  combineNotifications = false
): EvaluationEngineResult {
  // 1. Nominal Hardware Baseline
  const defaultToggles: HardwareToggles = {
    charging_relay: telematics.isChargerConnected ? 'ON' : 'OFF',
    motor_power_limit: '100%',
    gps_module: 'ON',
    cellular_data: 'ON',
    drivetrain_lock: 'OFF',
  };

  let finalToggles: HardwareToggles = { ...defaultToggles };
  let overallSafety: SafetyStatus = 'SAFE';
  let audibleBeaconActive = false;
  let peripheralsActive = true;
  const triggeredNotifications: { severity: SafetyStatus; priority: number; message: string }[] = [];

  // ==========================================
  // RULE 1: CRITICAL OVERHEATING (OVERCHARGING)
  // Trigger Condition: Battery temperature is rapidly rising (>2.0°C/min) OR exceeds safety thresholds (>45°C)
  // WHILE the vehicle is actively connected to a charger (Current > 0).
  // ==========================================
  const r1TempThresholdMet = telematics.batteryTemp > 45;
  const r1TempRisingMet = telematics.batteryTempRateOfChange >= 2.0;
  const r1ChargerActive = telematics.isChargerConnected && telematics.chargingCurrent > 0;
  const r1Triggered = (r1TempThresholdMet || r1TempRisingMet) && r1ChargerActive;

  const rule1Result: RuleEvaluationResult = {
    ruleId: 1,
    title: 'CRITICAL OVERHEATING (OVERCHARGING)',
    triggered: r1Triggered,
    severity: 'CRITICAL',
    conditions: [
      {
        label: 'Battery Pack Temperature',
        actualValue: `${telematics.batteryTemp.toFixed(1)}°C`,
        threshold: '> 45.0°C',
        met: r1TempThresholdMet,
      },
      {
        label: 'Battery Thermal Gradient (Rate of Rise)',
        actualValue: `${telematics.batteryTempRateOfChange >= 0 ? '+' : ''}${telematics.batteryTempRateOfChange.toFixed(2)}°C/min`,
        threshold: '≥ +2.00°C/min',
        met: r1TempRisingMet,
      },
      {
        label: 'Active Charger Current Flow',
        actualValue: telematics.isChargerConnected
          ? `${telematics.chargingCurrent.toFixed(1)} A`
          : 'Disconnected (0.0 A)',
        threshold: 'Current > 0.0 A',
        met: r1ChargerActive,
      },
    ],
    actionTaken: 'Immediately cut off charging current via Solid-State Contactor Relay.',
    affectedToggles: { charging_relay: 'OFF' },
    notificationGenerated: r1Triggered
      ? 'CRITICAL: Charging suspended. Battery overheating detected.'
      : null,
  };

  if (r1Triggered) {
    finalToggles.charging_relay = 'OFF';
    overallSafety = 'CRITICAL';
    triggeredNotifications.push({
      severity: 'CRITICAL',
      priority: 1, // Highest priority
      message: 'CRITICAL: Charging suspended. Battery overheating detected.',
    });
  }

  // ==========================================
  // RULE 2: ABRASIVE HEAT (OVERLOADING)
  // Trigger Condition: Mechanical/motor temperature is spiking (>65°C or rise rate >= 3.0°C/min),
  // and passenger weight/torque sensors indicate the vehicle is overloaded beyond its rated capacity.
  // ==========================================
  const r2MotorTempMet = telematics.motorTemp > 65 || telematics.motorTempRateOfChange >= 3.0;
  const r2WeightOverloadMet = telematics.passengerWeight > telematics.ratedCapacityWeight;
  const r2TorqueOverloadMet = telematics.torque > 50; // High torque strain
  const r2StrainConditionMet = r2WeightOverloadMet || r2TorqueOverloadMet;
  const r2Triggered = r2MotorTempMet && r2StrainConditionMet;

  const rule2Result: RuleEvaluationResult = {
    ruleId: 2,
    title: 'ABRASIVE HEAT (OVERLOADING)',
    triggered: r2Triggered,
    severity: 'WARNING',
    conditions: [
      {
        label: 'Mechanical / Motor Temperature',
        actualValue: `${telematics.motorTemp.toFixed(1)}°C`,
        threshold: '> 65.0°C or Spiking',
        met: r2MotorTempMet,
      },
      {
        label: 'Passenger / Payload Weight',
        actualValue: `${telematics.passengerWeight.toFixed(0)} kg`,
        threshold: `> ${telematics.ratedCapacityWeight.toFixed(0)} kg (Rated)`,
        met: r2WeightOverloadMet,
      },
      {
        label: 'Torque Sensor Strain',
        actualValue: `${telematics.torque.toFixed(1)} Nm`,
        threshold: '> 50.0 Nm',
        met: r2TorqueOverloadMet,
      },
    ],
    actionTaken: 'Limit motor power output to 50% via ESC firmware governor to prevent thermal runaway.',
    affectedToggles: { motor_power_limit: '50%' },
    notificationGenerated: r2Triggered
      ? 'WARNING: High mechanical strain detected due to overloading. Power restricted to protect the battery.'
      : null,
  };

  if (r2Triggered) {
    finalToggles.motor_power_limit = '50%';
    if (overallSafety === 'SAFE') {
      overallSafety = 'WARNING';
    }
    triggeredNotifications.push({
      severity: 'WARNING',
      priority: 3,
      message:
        'WARNING: High mechanical strain detected due to overloading. Power restricted to protect the battery.',
    });
  }

  // ==========================================
  // RULE 3: DEEP SLEEP PROLONGED STORAGE
  // Trigger Condition: Vehicle has been inactive, stationary, and uncharged for an extended duration (>30 days),
  // and State of Charge (SoC) drops below 20%.
  // ==========================================
  const r3InactivityMet = telematics.inactiveDays > 30;
  const r3StationaryMet = telematics.vehicleSpeed === 0;
  const r3UnchargedMet = !telematics.isChargerConnected || telematics.chargingCurrent === 0;
  const r3SocThresholdMet = telematics.stateOfCharge < 20;
  const r3Triggered = r3InactivityMet && r3StationaryMet && r3UnchargedMet && r3SocThresholdMet;

  const rule3Result: RuleEvaluationResult = {
    ruleId: 3,
    title: 'DEEP SLEEP PROLONGED STORAGE',
    triggered: r3Triggered,
    severity: 'CRITICAL',
    conditions: [
      {
        label: 'Inactivity Duration',
        actualValue: `${telematics.inactiveDays} days`,
        threshold: '> 30 days',
        met: r3InactivityMet,
      },
      {
        label: 'Vehicle Motion State',
        actualValue: telematics.vehicleSpeed === 0 ? 'Stationary (0 km/h)' : `${telematics.vehicleSpeed} km/h`,
        threshold: 'Stationary (0 km/h)',
        met: r3StationaryMet,
      },
      {
        label: 'Uncharged State',
        actualValue: telematics.isChargerConnected ? 'Charging Plugged' : 'Unplugged / No Current',
        threshold: 'Uncharged (0.0 A)',
        met: r3UnchargedMet,
      },
      {
        label: 'State of Charge (SoC)',
        actualValue: `${telematics.stateOfCharge.toFixed(1)}%`,
        threshold: '< 20.0%',
        met: r3SocThresholdMet,
      },
    ],
    actionTaken:
      'Shut down non-essential parasitic draws (GPS, Cellular modem, peripherals) to enter ultra-low quiescent state.',
    affectedToggles: { gps_module: 'OFF', cellular_data: 'OFF' },
    notificationGenerated: r3Triggered
      ? 'CRITICAL ALERT: Vehicle left unattended for months. Deep sleep mode activated to preserve battery life. Please plug in a charger immediately to prevent permanent battery degradation.'
      : null,
  };

  if (r3Triggered) {
    finalToggles.gps_module = 'OFF';
    finalToggles.cellular_data = 'OFF';
    peripheralsActive = false;
    overallSafety = 'CRITICAL';
    triggeredNotifications.push({
      severity: 'CRITICAL',
      priority: 2,
      message:
        'CRITICAL ALERT: Vehicle left unattended for months. Deep sleep mode activated to preserve battery life. Please plug in a charger immediately to prevent permanent battery degradation.',
    });
  }

  // ==========================================
  // RULE 4: BLUETOOTH IGNITION CONTROL & SAFETY HALT
  // Trigger Condition: Owner's authorized Bluetooth device disconnects while the vehicle is stationary,
  // OR an unauthorized Bluetooth signal attempts to hijack the system.
  // ==========================================
  const r4DisconnectStationary =
    telematics.bluetoothState === 'DISCONNECTED_STATIONARY' && telematics.vehicleSpeed === 0;
  const r4HijackAttempt = telematics.bluetoothState === 'UNAUTHORIZED_HIJACK_ATTEMPT';
  const r4Triggered = r4DisconnectStationary || r4HijackAttempt;

  const rule4Result: RuleEvaluationResult = {
    ruleId: 4,
    title: 'BLUETOOTH IGNITION CONTROL & SAFETY HALT',
    triggered: r4Triggered,
    severity: 'CRITICAL',
    conditions: [
      {
        label: 'Bluetooth Link State',
        actualValue:
          telematics.bluetoothState === 'CONNECTED'
            ? 'Authorized Device Paired'
            : telematics.bluetoothState === 'DISCONNECTED_STATIONARY'
              ? 'Disconnected (Stationary)'
              : telematics.bluetoothState === 'DISCONNECTED_MOVING'
                ? 'Disconnected (In-Motion)'
                : 'Unauthorized Hijack Attempt Detected',
        threshold: 'Stationary Disconnect or Hijack Attempt',
        met: r4Triggered,
      },
      {
        label: 'Vehicle Speed',
        actualValue: `${telematics.vehicleSpeed.toFixed(0)} km/h`,
        threshold: 'Stationary (0 km/h)',
        met: telematics.vehicleSpeed === 0,
      },
    ],
    actionTaken:
      'Immobilize drivetrain via electromechanical lock, set bluetooth status SIGNAL_LOST, and emit audible beacon signal.',
    affectedToggles: { drivetrain_lock: 'ON' },
    notificationGenerated: r4Triggered
      ? 'SECURITY: Bluetooth connection lost. Drivetrain locked. Emitting localization signal.'
      : null,
  };

  if (r4Triggered) {
    finalToggles.drivetrain_lock = 'ON';
    audibleBeaconActive = true;
    if (overallSafety !== 'CRITICAL') {
      overallSafety = 'CRITICAL';
    }
    triggeredNotifications.push({
      severity: 'CRITICAL',
      priority: 4,
      message:
        'SECURITY: Bluetooth connection lost. Drivetrain locked. Emitting localization signal.',
    });
  }

  // Determine owner_notification string
  let ownerNotification: string | null = null;
  if (triggeredNotifications.length > 0) {
    if (combineNotifications) {
      ownerNotification = triggeredNotifications.map((n) => n.message).join(' | ');
    } else {
      // Pick highest priority message according to prompt severity
      // Priority ordering: Rule 1 (Overheating) > Rule 3 (Deep Sleep) > Rule 4 (Security) > Rule 2 (Abrasive)
      const sorted = [...triggeredNotifications].sort((a, b) => a.priority - b.priority);
      ownerNotification = sorted[0].message;
    }
  }

  const output: BmsDecisionOutput = {
    safety_status: overallSafety,
    hardware_toggles: finalToggles,
    owner_notification: ownerNotification,
  };

  return {
    output,
    ruleResults: [rule1Result, rule2Result, rule3Result, rule4Result],
    activeRuleCount: triggeredNotifications.length,
    audibleBeaconActive,
    peripheralsActive,
  };
}
