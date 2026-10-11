import { ERickshawTelematics, ControllerActionsOutput, SystemSafetyStatus } from '../types/bms';

export function evaluateERickshawController(telematics: ERickshawTelematics): ControllerActionsOutput {
  // 1. Thermal Overheat Evaluation (> 50°C)
  const isThermalOverheat = telematics.batteryTemp > 50.0;
  const motorDrawReduced = isThermalOverheat;
  const actualMotorDraw = motorDrawReduced
    ? telematics.nominalRatedCurrent * 0.70 // 30% reduction
    : telematics.nominalRatedCurrent;

  // 2. Passenger Overloading Evaluation (> 6 passengers)
  const isOverloaded = telematics.passengerCount > telematics.ratedPassengerCapacity;

  // 3. Deep Sleep & Prolonged Storage Evaluation (> 3 years)
  const isProlongedStorage = telematics.unDrivenDurationYears >= 3.0 || telematics.unDrivenDurationDays >= 1095;

  // 4. Bluetooth Ignition & Motion Lockout Evaluation (moving condition or ignited via BT)
  const isMovingOrIgnited = telematics.vehicleSpeed > 0 || telematics.isMoving || telematics.bluetoothIgnitionActive;

  // 5. Battery Health & Lifeline Calculations
  const remainingCycles = Math.max(0, telematics.maxRatedCycles - telematics.chargeCyclesCompleted);
  const remainingCycleLifePct = Number(((remainingCycles / telematics.maxRatedCycles) * 100).toFixed(1));

  let timeToFullText = 'N/A (Discharging)';
  if (telematics.chargeMode !== 'DISCONNECTED') {
    if (telematics.stateOfCharge >= 99.5) {
      timeToFullText = 'Fully Charged (100%)';
    } else {
      const hrs = Math.floor(telematics.timeToFullMinutes / 60);
      const mins = telematics.timeToFullMinutes % 60;
      timeToFullText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;
    }
  }

  // Resolve Overall Safety Status (highest priority first)
  let overallStatus: SystemSafetyStatus = 'NORMAL';
  if (isThermalOverheat) {
    overallStatus = 'THERMAL_OVERHEAT';
  } else if (isOverloaded) {
    overallStatus = 'OVERLOAD_ALERT';
  } else if (isProlongedStorage) {
    overallStatus = 'DEEP_SLEEP';
  } else if (isMovingOrIgnited) {
    overallStatus = 'SECURITY_LOCKOUT';
  }

  return {
    system_status: overallStatus,
    thermal_override: {
      alarm_active: isThermalOverheat,
      draw_current_limit: isThermalOverheat ? '70% (30% REDUCED)' : '100% (NOMINAL FULL)',
      actual_motor_draw_a: Number(actualMotorDraw.toFixed(1)),
      reason: isThermalOverheat
        ? `Battery temperature (${telematics.batteryTemp.toFixed(1)}°C) breached 50°C critical threshold. Motor draw clamped -30% to prevent thermal runaway.`
        : null,
    },
    passenger_overload: {
      overload_alert: isOverloaded,
      cabin_alarm_active: isOverloaded,
      passenger_count: telematics.passengerCount,
      max_allowed: 6,
      status_text: isOverloaded
        ? `OVERLOAD VIOLATION: ${telematics.passengerCount} passengers detected (Cabin limit: 6). Driver alerted.`
        : `NOMINAL: ${telematics.passengerCount} / 6 passengers onboard within safety regulations.`,
    },
    deep_sleep_storage: {
      deep_sleep_forced: isProlongedStorage,
      gps_module_power: isProlongedStorage ? 'OFF' : 'ON',
      cellular_module_power: isProlongedStorage ? 'OFF' : 'ON',
      non_essential_bus: isProlongedStorage ? 'OFF' : 'ON',
      ghost_drain_ma: isProlongedStorage ? 0.05 : 38.5,
    },
    bluetooth_motion_lockout: {
      external_pairing_locked: isMovingOrIgnited,
      strict_primary_driver_only: isMovingOrIgnited,
      unauthorized_threads_killed: isMovingOrIgnited ? Math.max(3, telematics.killedThreadCount) : 0,
      lockout_reason: isMovingOrIgnited
        ? 'Vehicle in moving condition or Bluetooth ignited. External pairing locked out. Bus access restricted strictly to primary driver.'
        : 'Stationary disarmed state. Safe for authorized configuration.',
    },
    battery_health_reporting: {
      state_of_health_pct: Number(telematics.stateOfHealth.toFixed(1)),
      state_of_charge_pct: Number(telematics.stateOfCharge.toFixed(1)),
      remaining_cycle_life_pct: remainingCycleLifePct,
      time_to_full_display: timeToFullText,
      efficiency_wh_km: Number(telematics.energyEfficiencyWhPerKm.toFixed(1)),
      discharge_c_rate: Number(telematics.instantaneousDischargeRateC.toFixed(2)),
      cycle_count: telematics.chargeCyclesCompleted,
    },
    active_alarms: {
      thermal_hardware_alarm: isThermalOverheat,
      cabin_overload_alarm: isOverloaded,
    },
    ai_storage_message: isProlongedStorage
      ? {
          isSent: true,
          messageId: `AI-MSG-STR-${telematics.unDrivenDurationDays}D`,
          timestamp: 'AUTO-DISPATCHED PRE-SHUTDOWN',
          channel: 'CELLULAR_BURST_SMS',
          recipient: 'Registered Vehicle Owner (+91 98765-XXXXX) & Fleet Management',
          priority: 'CRITICAL',
          subject: 'URGENT AI NOTICE: 3+ Years Prolonged Storage Deep-Sleep Enforced',
          body: `CRITICAL AI AUTO-ALERT: Vehicle inactivity log records ${telematics.unDrivenDurationYears.toFixed(1)} years of prolonged storage (${telematics.unDrivenDurationDays} days). Automated deep-sleep activated. Non-essential power including GPS tracking and cellular modules is now powered down to eliminate ghost drain and prevent irreversible cell bricking. Connect an authorized 48V/60V balancer charger immediately to preserve battery life.`,
          preShutdownStatus: 'CELLULAR & GPS POWER CUT COMPLETED · GHOST DRAIN 0.05 mA',
        }
      : null,
  };
}
