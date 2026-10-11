import { ERickshawTelematics } from '../types/bms';

export interface ERickshawPreset {
  id: string;
  name: string;
  ruleTag: 'Rule 1' | 'Rule 2' | 'Rule 3' | 'Rule 4' | 'Rule 5' | 'Nominal';
  summary: string;
  telematics: ERickshawTelematics;
}

export const NOMINAL_ERICKSHAW_TELEMATICS: ERickshawTelematics = {
  batteryTemp: 29.5,
  batteryTempRate: 0.2,
  packVoltage: 51.2,
  stateOfCharge: 82.0,
  stateOfHealth: 97.4,
  chargeCyclesCompleted: 340,
  maxRatedCycles: 2500,
  chargeMode: 'DISCONNECTED',
  chargingCurrent: 0.0,
  timeToFullMinutes: 0,
  motorDrawCurrent: 45.0,
  nominalRatedCurrent: 45.0,
  motorDrawReductionPercent: 0,
  motorTemp: 38.0,
  vehicleSpeed: 20.0,
  isMoving: true,
  isIgnited: true,
  passengerCount: 4,
  ratedPassengerCapacity: 6,
  passengerWeightsKg: [68, 72, 60, 65],
  totalPayloadKg: 265,
  unDrivenDurationDays: 4,
  unDrivenDurationYears: 0.01,
  bluetoothIgnitionActive: true,
  authorizedDriverMac: 'AA:BB:CC:DD:EE:01',
  connectedDeviceMac: 'AA:BB:CC:DD:EE:01',
  externalPairingLocked: true,
  killedThreadCount: 4,
  energyEfficiencyWhPerKm: 39.5,
  instantaneousDischargeRateC: 0.88,
};

export const ERICKSHAW_PRESETS: ERickshawPreset[] = [
  {
    id: 'thermal-overheat',
    name: 'Rule 1: Thermal Overheat (>50°C)',
    ruleTag: 'Rule 1',
    summary: 'Battery temperature spikes to 53.2°C (>50°C limit). Motor current clamped by 30% to 31.5A & hardware alarm rings.',
    telematics: {
      ...NOMINAL_ERICKSHAW_TELEMATICS,
      batteryTemp: 53.2,
      batteryTempRate: 3.4,
      motorTemp: 68.0,
      passengerCount: 5,
      motorDrawCurrent: 31.5, // 30% reduced
      motorDrawReductionPercent: 30,
    },
  },
  {
    id: 'passenger-overload',
    name: 'Rule 2: Passenger Overload (>6 Pax)',
    ruleTag: 'Rule 2',
    summary: 'Cabin sensors detect 8 passengers (Rated max: 6). System status triggers Overload Alert and sounds cabin alarm.',
    telematics: {
      ...NOMINAL_ERICKSHAW_TELEMATICS,
      batteryTemp: 34.0,
      passengerCount: 8,
      passengerWeightsKg: [70, 65, 80, 75, 60, 55, 68, 72],
      totalPayloadKg: 545,
      motorDrawCurrent: 45.0,
      motorDrawReductionPercent: 0,
    },
  },
  {
    id: 'prolonged-storage',
    name: 'Rule 3: Deep Sleep Storage (>3 Yrs)',
    ruleTag: 'Rule 3',
    summary: 'Inactivity log records vehicle un-driven for 3.4 years (1,241 days). Shuts down GPS and cellular modules to stop ghost drain.',
    telematics: {
      ...NOMINAL_ERICKSHAW_TELEMATICS,
      batteryTemp: 22.0,
      vehicleSpeed: 0,
      isMoving: false,
      isIgnited: false,
      bluetoothIgnitionActive: false,
      passengerCount: 0,
      totalPayloadKg: 0,
      unDrivenDurationDays: 1241,
      unDrivenDurationYears: 3.4,
      stateOfCharge: 18.5,
      motorDrawCurrent: 0,
    },
  },
  {
    id: 'motion-lockout',
    name: 'Rule 4: BT Motion Lockout & Thread Kill',
    ruleTag: 'Rule 4',
    summary: 'Vehicle is ignited & moving at 24 km/h. External pairing locked out strictly to primary driver; rogue access threads force-killed.',
    telematics: {
      ...NOMINAL_ERICKSHAW_TELEMATICS,
      vehicleSpeed: 24.0,
      isMoving: true,
      bluetoothIgnitionActive: true,
      externalPairingLocked: true,
      killedThreadCount: 7,
    },
  },
  {
    id: 'post-charge-telemetry',
    name: 'Rule 5: Post-Charge Health & Lifeline',
    ruleTag: 'Rule 5',
    summary: 'Charge cycle completed: 100% SoC, 97.2% SoH, remaining cycle life 86.4% computed, 38.2 Wh/km efficiency rating.',
    telematics: {
      ...NOMINAL_ERICKSHAW_TELEMATICS,
      stateOfCharge: 100.0,
      chargeMode: 'BALANCING',
      timeToFullMinutes: 0,
      chargeCyclesCompleted: 341,
      stateOfHealth: 97.2,
      vehicleSpeed: 0,
      isMoving: false,
    },
  },
  {
    id: 'nominal-ride',
    name: 'Nominal E-Rickshaw Commute',
    ruleTag: 'Nominal',
    summary: 'Standard safe operating state with 4 passengers, nominal 29.5°C battery, and verified driver Bluetooth link.',
    telematics: { ...NOMINAL_ERICKSHAW_TELEMATICS },
  },
];
