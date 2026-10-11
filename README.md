# 🔋 Agentic Nexus AI Based BMS Dashboard

## 📌 Overview
**Agentic Nexus AI Based BMS Dashboard** is a smart, edge-computing software layer designed for the commercial e-micromobility sector (specifically local e-rickshaws). It connects to existing low-cost Battery Management Systems (BMS) via Bluetooth (BLE) to provide advanced safety protocols, real-time analytics, and predictive maintenance—transforming "dumb" hardware into a "Smart EV" at zero additional manufacturing cost.

## ⚠️ The Problem
Commercial e-rickshaws in India typically rely on basic hardware that suffers from two major critical failures:
1. **Security Vulnerabilities (BLE Hijacking):** Open or default Bluetooth modules allow anyone with a smartphone scanner to connect to a moving e-rickshaw and remotely cut off power, leading to dangerous sudden stops.
2. **Thermal Damage via Overloading:** Basic BMS units lack intelligent temperature throttling. When overloaded, batteries overheat and degrade rapidly, forcing daily-wage drivers to spend ~₹40,000 on battery replacements every 6–8 months.

## 💡 Our Solution
Instead of overhauling the hardware, we built an intelligent mobile dashboard that acts as an active safety shield. By processing real-time telemetry at the edge, our software enforces strict physics thresholds and dynamic security lockouts to protect the vehicle, the battery, and the passengers.

## 🚀 Key Features

* **🛡️ Anti-Hack Motion Lock (Bluetooth Security):** Uses the smartphone's GPS and accelerometer to track movement. Once the vehicle is in motion, the app restricts the BMS from accepting unauthorized Bluetooth connections, making the vehicle digitally invisible to roadside hackers and preventing remote shut-offs.
* **🌡️ Predictive Thermal Protection:** Continuously monitors battery core temperature. If it crosses a critical threshold (e.g., 48°C) due to overloading, the system triggers alerts and restricts discharge current, allowing the battery to cool and preventing thermal runaway.
* **💤 Deep Sleep Hibernation (Phantom Drain Protection):** Tracks GPS movement data to monitor inactivity. If the vehicle is completely stationary for 48 hours, the app triggers Deep Sleep Mode, suspending background processes and BLE broadcasting to save the battery from deep discharge and permanent damage.
* **📈 Real-Time Telemetry & Live Graphs:** Translates raw hex payloads into dynamic, real-time visual graphs. Users can monitor live charting of discharge current (Amperes), voltage, and core temperature to spot anomalies instantly.
* **📊 Advanced Battery Analytics (SoC & SoH):**
  * **State of Charge (SoC):** Implements the industry-standard Coulomb Counting algorithm to track exact current integration (Amperes in/out), providing a 100% accurate battery percentage rather than fluctuating voltage-based estimates.
  * **State of Health (SoH):** Analyzes charge/discharge cycles to calculate overall battery degradation, enabling predictive maintenance for fleet owners.

## 👥 Stakeholder Impact 

* **Drivers & Passengers:** Saves drivers ₹40,000 in premature battery replacement costs and ensures passenger safety by preventing in-transit fires and power losses.
* **Fleet Owners:** Protects capital assets from driver abuse and provides a centralized dashboard to track live metrics and SoH across the fleet.
* **Local E-Rickshaw OEMs:** Offers a plug-and-play SaaS layer to market basic vehicles as premium "Smart EVs" without R&D or hardware upgrades.

## ⚙️ Architecture & Logic
The system operates on a Closed-Loop Deterministic Edge AI model:
1. **Sense:** Continuous polling of time-series telemetry (Temp, Current, Speed) via Bluetooth.
2. **Think:** Edge rule engine parses Hex to JSON and evaluates multi-modal data against predefined physics and spatial thresholds.
3. **Act:** Instantly dispatches actuation payloads (e.g., dynamic advertising lockouts, current limiting) back to the hardware with zero latency.
