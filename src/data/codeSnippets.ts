export const ARDUINO_CPP_CODE = `/**
 * @file erickshaw_ev_controller.ino
 * @brief Embedded AI System Coordinator for Smart E-Rickshaw Electric Vehicle (EV)
 * Target Hardware: ESP32 / STM32 / Arduino Mega with CAN Bus Transceiver (MCP2515)
 *
 * Edge Triggers Implemented:
 * 1. Thermal Overheat Protection (>50°C -> Alarm + 30% Motor Draw Reduction)
 * 2. Passenger Overload Prevention (>6 Passengers -> Overload Alert + Cabin Alarm)
 * 3. Deep Sleep & Prolonged Storage (>3 Years -> Cut GPS/Cellular Ghost Drain)
 * 4. Bluetooth Ignition & Motion Lockout (Vehicle Moving/Ignited -> Lock External Pairing)
 * 5. Telemetry & Battery Health Reporting (SoC, SoH, Cycle Life, Time-to-Full, Wh/km)
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

// ================= Pin Assignments =================
#define PIN_NTC_THERMAL_ADC     34   // Battery Pack NTC thermistor
#define PIN_CABIN_WEIGHT_ADC    35   // Cabin floor strain gauge load cell
#define PIN_CABIN_PIR_CAMERA    32   // Cabin occupancy detection pulse
#define PIN_PIEZO_BUZZER_ALARM  25   // High-priority thermal hardware alarm
#define PIN_CABIN_ALARM_CHIME   26   // Specific cabin overload alarm buzzer
#define PIN_MOTOR_PWM_THROTTLE  18   // PWM Throttle Governor to Motor Controller
#define PIN_RELAY_GPS_POWER     19   // Power gate for GPS Tracking Module
#define PIN_RELAY_CELLULAR_PWR  21   // Power gate for 4G/LTE-M Modem
#define PIN_SPEED_HALL_SENSOR   22   // Wheel speed pulse encoder

// ================= Calibration & Thresholds =================
const float THERMAL_OVERHEAT_THRESHOLD_C = 50.0f; // Rule 1
const int   MAX_RATED_PASSENGERS         = 6;     // Rule 2
const float STORAGE_PROLONGED_YEARS      = 3.0f;  // Rule 3 (3 years inactivity)
const uint32_t STORAGE_DAYS_THRESHOLD    = 1095;  // 3 * 365 days

// Authorized Driver MAC Address (Rule 4)
const String AUTHORIZED_DRIVER_MAC = "AA:BB:CC:DD:EE:01";

// Battery Characteristics (Rule 5)
const int   MAX_RATED_CYCLES = 2500;
int   completedChargeCycles  = 342;
float batteryPackSoH         = 96.8f; // State of Health %
float batteryPackSoC         = 78.5f; // State of Charge %
float nominalMotorCurrentA   = 45.0f; // Nominal draw

// State Variables
float currentBatteryTempC    = 28.5f;
int   detectedPassengerCount = 4;
float vehicleSpeedKmh        = 0.0f;
bool  isBluetoothIgnited     = false;
bool  isMoving               = false;
bool  externalPairingLocked  = false;
uint32_t vehicleInactivityDays = 12;

// BLE Server variables
BLEServer *pServer = NULL;
bool deviceConnected = false;

void setup() {
  Serial.begin(115200);
  Serial.println("[EV-BMS] Bootstrapping Smart E-Rickshaw AI Controller...");

  pinMode(PIN_PIEZO_BUZZER_ALARM, OUTPUT);
  pinMode(PIN_CABIN_ALARM_CHIME, OUTPUT);
  pinMode(PIN_MOTOR_PWM_THROTTLE, OUTPUT);
  pinMode(PIN_RELAY_GPS_POWER, OUTPUT);
  pinMode(PIN_RELAY_CELLULAR_PWR, OUTPUT);
  pinMode(PIN_CABIN_PIR_CAMERA, INPUT);

  // Initialize relays ON by default
  digitalWrite(PIN_RELAY_GPS_POWER, HIGH);
  digitalWrite(PIN_RELAY_CELLULAR_PWR, HIGH);

  // Initialize Bluetooth Low Energy with Strict Security Policy
  BLEDevice::init("E-RICKSHAW-SMART-EV");
  pServer = BLEDevice::createServer();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
  pAdvertising->start();

  Serial.println("[EV-BMS] Microcontroller online. Monitoring sensor streams.");
}

void loop() {
  // 1. Telemetry Acquisition
  readSensors();

  // 2. Execute 5 Edge Triggers
  executeThermalProtection();
  executePassengerOverloadProtection();
  executeProlongedStorageManagement();
  executeBluetoothMotionLockout();
  reportBatteryHealthTelemetry();

  delay(100); // 10 Hz control loop
}

// -------------------------------------------------------------
// TRIGGER 1: Thermal Overheat Protection (Battery Safety)
// -------------------------------------------------------------
void executeThermalProtection() {
  if (currentBatteryTempC > THERMAL_OVERHEAT_THRESHOLD_C) {
    // Sound high-priority audible hardware alarm
    tone(PIN_PIEZO_BUZZER_ALARM, 1500, 80);

    // Command Motor Controller: reduce draw current by 30% immediately
    // Nominal 45A -> 31.5A (Throttle PWM scaled down by 30%)
    float reducedCurrentLimit = nominalMotorCurrentA * 0.70f;
    int pwmThrottle = map(reducedCurrentLimit, 0, nominalMotorCurrentA, 0, 255);
    analogWrite(PIN_MOTOR_PWM_THROTTLE, pwmThrottle);

    Serial.printf("[CRITICAL] OVERHEAT! Temp: %.1fC > 50C. Alarm ON. Motor draw clamped to 70%% (%.1fA)\\n",
                  currentBatteryTempC, reducedCurrentLimit);
  } else {
    noTone(PIN_PIEZO_BUZZER_ALARM);
    // Restore nominal full motor throttle capability
    analogWrite(PIN_MOTOR_PWM_THROTTLE, 255);
  }
}

// -------------------------------------------------------------
// TRIGGER 2: Passenger Overloading Prevention
// -------------------------------------------------------------
void executePassengerOverloadProtection() {
  if (detectedPassengerCount > MAX_RATED_PASSENGERS) {
    // Overload Alert status & sound specific cabin alarm
    tone(PIN_CABIN_ALARM_CHIME, 800, 150);

    Serial.printf("[OVERLOAD ALERT] Passenger count %d exceeds cabin limit of %d! Cabin chime sounding.\\n",
                  detectedPassengerCount, MAX_RATED_PASSENGERS);
  } else {
    noTone(PIN_CABIN_ALARM_CHIME);
  }
}

// -------------------------------------------------------------
// TRIGGER 3: Deep Sleep & Prolonged Storage Management (> 3 Years)
// -------------------------------------------------------------
void executeProlongedStorageManagement() {
  if (vehicleInactivityDays >= STORAGE_DAYS_THRESHOLD) {
    // 1. Automatically transmit emergency AI notice to owner before radio shutdown
    Serial.println("[AI AUTO-DISPATCH] Sending Pre-Shutdown GSM SMS to Owner (+91 98765-XXXXX):");
    Serial.println("  'CRITICAL AI AUTO-ALERT: Vehicle inactive > 3.0 years (1,095+ days). Automated deep sleep activated. GPS and cellular data severed to prevent irreversible battery bricking. Plug in 48V/60V charger immediately.'");

    // 2. Un-driven > 3 years: Disable power to GPS & cellular data modules
    digitalWrite(PIN_RELAY_GPS_POWER, LOW);
    digitalWrite(PIN_RELAY_CELLULAR_PWR, LOW);

    Serial.println("[DEEP SLEEP] Vehicle un-driven > 3 years. GPS & Cellular modules isolated to eliminate ghost drain.");
  } else {
    digitalWrite(PIN_RELAY_GPS_POWER, HIGH);
    digitalWrite(PIN_RELAY_CELLULAR_PWR, HIGH);
  }
}

// -------------------------------------------------------------
// TRIGGER 4: Bluetooth Ignition & Motion Lockout
// -------------------------------------------------------------
void executeBluetoothMotionLockout() {
  isMoving = (vehicleSpeedKmh > 0.5f);

  if (isMoving || isBluetoothIgnited) {
    // Lock out all external pairing requests
    if (!externalPairingLocked) {
      BLEDevice::getAdvertising()->stop(); // Stop broadcasting discovery
      externalPairingLocked = true;
      Serial.println("[SECURITY] Vehicle in motion or BT-ignited. External BLE pairing locked out. External threads terminated.");
    }
  } else {
    if (externalPairingLocked) {
      BLEDevice::getAdvertising()->start();
      externalPairingLocked = false;
    }
  }
}

// -------------------------------------------------------------
// TRIGGER 5: Telemetry & Battery Health Reporting
// -------------------------------------------------------------
void reportBatteryHealthTelemetry() {
  static unsigned long lastReport = 0;
  if (millis() - lastReport >= 1000) {
    lastReport = millis();

    // Lifeline calculations
    float remainingLifePct = ((float)(MAX_RATED_CYCLES - completedChargeCycles) / MAX_RATED_CYCLES) * 100.0f;
    float energyEfficiencyWhKm = 38.2f + (detectedPassengerCount * 3.5f);

    Serial.println("====== TELEMETRY & BATTERY HEALTH REPORT ======");
    Serial.printf("Battery SoC: %.1f%% | SoH: %.1f%% | Lifeline: %.1f%% remaining\\n", batteryPackSoC, batteryPackSoH, remainingLifePct);
    Serial.printf("Charge Cycles: %d / %d | Efficiency: %.1f Wh/km\\n", completedChargeCycles, MAX_RATED_CYCLES, energyEfficiencyWhKm);
    Serial.printf("Motor Current: %.1f A | Vehicle Speed: %.1f km/h\\n", nominalMotorCurrentA, vehicleSpeedKmh);
    Serial.println("================================================");
  }
}

void readSensors() {
  // Read analog thermistor with Steinhart-Hart equation
  int rawAdc = analogRead(PIN_NTC_THERMAL_ADC);
  // Simulating ADC to temperature conversion
  currentBatteryTempC = 25.0f + (rawAdc / 4095.0f) * 45.0f;
}
`;

export const PYTHON_RASPBERRY_PI_CODE = `#!/usr/bin/env python3
"""
erickshaw_smart_controller.py
Embedded AI System Coordinator for Smart E-Rickshaw Electric Vehicle (EV)
Target Hardware: Raspberry Pi 4 / 5 or NVIDIA Jetson Nano running Linux OS.

Business Logic & Edge Triggers:
1. Thermal Overheat Protection: Temp > 50°C -> Alarm ON + Motor Draw Current -30%
2. Passenger Overloading Prevention: Passengers > 6 -> "Overload Alert" + Cabin Alarm
3. Deep Sleep & Storage Management: Un-driven > 3 years -> Power down GPS & Cellular
4. Bluetooth Ignition & Motion Lockout: Moving/Ignited -> Lock external pairing & kill rogue threads
5. Telemetry & Health Reporting: Compute SoH, SoC, Cycle Life %, Time-to-full, Wh/km
"""

import time
import math
import threading
import logging
from dataclasses import dataclass, field
from typing import Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

@dataclass
class EVTelematicsStream:
    battery_temp_c: float = 32.0          # °C (>50°C triggers Rule 1)
    nominal_draw_current_a: float = 45.0  # Nominal motor draw current
    passenger_count: int = 4             # Cabin occupancy (>6 triggers Rule 2)
    un_driven_years: float = 0.5         # Years inactive (>3 years triggers Rule 3)
    vehicle_speed_kmh: float = 0.0       # Speed (>0 is moving condition)
    is_bluetooth_ignited: bool = False   # Bluetooth ignition state
    authorized_driver_mac: str = "AA:BB:CC:DD:EE:01"
    connected_mac: str = "AA:BB:CC:DD:EE:01"
    state_of_charge_pct: float = 82.0    # SoC %
    state_of_health_pct: float = 96.5    # SoH %
    completed_charge_cycles: int = 340   # Cycles
    max_rated_cycles: int = 2500         # Cycle life threshold
    charge_mode: str = "DISCONNECTED"    # FAST / TRICKLE / BALANCING / DISCONNECTED
    time_to_full_mins: int = 0

class SmartERickshawController:
    THERMAL_OVERHEAT_LIMIT_C = 50.0
    MAX_RATED_PASSENGERS = 6
    PROLONGED_STORAGE_YEARS = 3.0

    def __init__(self):
        self.lock = threading.Lock()
        self.is_running = True
        self.thermal_alarm_active = False
        self.cabin_alarm_active = False
        self.external_pairing_locked = False
        self.gps_powered = True
        self.cellular_powered = True
        self.actual_motor_draw_a = 45.0
        self.killed_threads = 0

    def evaluate_telematics(self, t: EVTelematicsStream) -> dict:
        """Evaluates all 5 operational business logic rules."""
        with self.lock:
            # -------------------------------------------------------------
            # RULE 1: Thermal Overheat Protection (Battery Safety)
            # -------------------------------------------------------------
            if t.battery_temp_c > self.THERMAL_OVERHEAT_LIMIT_C:
                self.thermal_alarm_active = True
                # Reduce draw current by 30% immediately
                self.actual_motor_draw_a = t.nominal_draw_current_a * 0.70
                thermal_status = "CRITICAL_OVERHEAT_CLAMP_ACTIVE"
            else:
                self.thermal_alarm_active = False
                self.actual_motor_draw_a = t.nominal_draw_current_a
                thermal_status = "NORMAL_THERMAL"

            # -------------------------------------------------------------
            # RULE 2: Passenger Overloading Prevention
            # -------------------------------------------------------------
            if t.passenger_count > self.MAX_RATED_PASSENGERS:
                self.cabin_alarm_active = True
                passenger_status = "OVERLOAD_ALERT"
            else:
                self.cabin_alarm_active = False
                passenger_status = "OCCUPANCY_SAFE"

            # -------------------------------------------------------------
            # RULE 3: Deep Sleep & Prolonged Storage Management (> 3 Years)
            # -------------------------------------------------------------
            ai_storage_auto_message = None
            if t.un_driven_years >= self.PROLONGED_STORAGE_YEARS:
                ai_storage_auto_message = (
                    f"CRITICAL AI AUTO-ALERT: Vehicle inactivity log records {t.un_driven_years:.1f} years "
                    f"of prolonged storage. Automated deep sleep mode activated. Power to GPS tracking and "
                    f"cellular modules has been severed to eliminate ghost parasitic drain and prevent permanent "
                    f"electrochemical cell bricking. Connect an authorized 48V/60V battery charger immediately."
                )
                logging.warning(f"[AI AUTO-DISPATCH TRANSMITTED TO OWNER PHONE]: {ai_storage_auto_message}")
                self.gps_powered = False
                self.cellular_powered = False
                storage_status = "DEEP_SLEEP_STORAGE_ISOLATED"
            else:
                self.gps_powered = True
                self.cellular_powered = True
                storage_status = "STANDARD_STANDBY"

            # -------------------------------------------------------------
            # RULE 4: Bluetooth Ignition & Motion Lockout
            # -------------------------------------------------------------
            is_moving = t.vehicle_speed_kmh > 0.0
            if is_moving or t.is_bluetooth_ignited:
                self.external_pairing_locked = True
                # Kill any rogue connection attempts
                self.killed_threads += 1
                bt_status = "MOTION_LOCKOUT_ACTIVE"
            else:
                self.external_pairing_locked = False
                bt_status = "DISARMED_CONFIGURABLE"

            # -------------------------------------------------------------
            # RULE 5: Telemetry & Battery Health Reporting
            # -------------------------------------------------------------
            remaining_cycles = max(0, t.max_rated_cycles - t.completed_charge_cycles)
            remaining_cycle_life_pct = round((remaining_cycles / t.max_rated_cycles) * 100.0, 1)
            efficiency_wh_km = round(38.0 + (t.passenger_count * 3.2), 1)

            report = {
                "system_status": (
                    "THERMAL_OVERHEAT" if self.thermal_alarm_active
                    else "OVERLOAD_ALERT" if self.cabin_alarm_active
                    else "DEEP_SLEEP" if not self.gps_powered
                    else "NORMAL"
                ),
                "hardware_overrides": {
                    "thermal_alarm_piezo": "ACTIVE" if self.thermal_alarm_active else "OFF",
                    "motor_draw_current_limit": f"70% ({self.actual_motor_draw_a:.1f}A)" if self.thermal_alarm_active else "100% (45.0A)",
                    "cabin_overload_chime": "ACTIVE" if self.cabin_alarm_active else "OFF",
                    "gps_module_power": "ON" if self.gps_powered else "OFF (DEEP SLEEP)",
                    "cellular_data_power": "ON" if self.cellular_powered else "OFF (DEEP SLEEP)",
                    "bluetooth_pairing_locked": self.external_pairing_locked,
                    "killed_rogue_threads": self.killed_threads
                },
                "battery_health_lifeline": {
                    "state_of_charge_pct": t.state_of_charge_pct,
                    "state_of_health_pct": t.state_of_health_pct,
                    "remaining_cycle_lifetime_pct": remaining_cycle_life_pct,
                    "energy_efficiency_wh_km": efficiency_wh_km,
                    "charge_mode": t.charge_mode,
                    "time_to_full_mins": t.time_to_full_mins
                }
            }
            return report

if __name__ == "__main__":
    controller = SmartERickshawController()
    logging.info("Starting E-Rickshaw Smart Controller Simulation Engine...")

    # Test Scenario: 8 passengers onboard with 52.4°C battery temp
    telematics = EVTelematicsStream(
        battery_temp_c=52.4,        # Triggers Rule 1
        passenger_count=8,           # Triggers Rule 2
        un_driven_years=0.1,
        vehicle_speed_kmh=18.5,      # Triggers Rule 4
        is_bluetooth_ignited=True
    )

    result = controller.evaluate_telematics(telematics)
    import json
    print(json.dumps(result, indent=2))
`;
