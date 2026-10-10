import React, { useState, useEffect, useRef } from 'react';
import { NOMINAL_TELEMATICS, PRESET_SCENARIOS } from './data/presets';
import {
  VehicleTelematics,
  ScenarioPreset,
  TelemetryLogEntry,
} from './types/bms';
import { evaluateBmsRules } from './engine/bmsRules';
import { TopBar } from './components/TopBar';
import { ScenarioBar } from './components/ScenarioBar';
import { OwnerNotificationBanner } from './components/OwnerNotificationBanner';
import { HardwareRelayMatrix } from './components/HardwareRelayMatrix';
import { TelematicsControlPanel } from './components/TelematicsControlPanel';
import { RuleEngineInspector } from './components/RuleEngineInspector';
import { JsonOutputViewer } from './components/JsonOutputViewer';
import { BatteryCellMatrix } from './components/BatteryCellMatrix';
import { AuditLog } from './components/AuditLog';
import { DiagnosticSummary } from './components/DiagnosticSummary';
import { bmsAudioAlarm } from './utils/audioAlarm';

export default function App() {
  const [telematics, setTelematics] = useState<VehicleTelematics>(NOMINAL_TELEMATICS);
  const [activePresetId, setActivePresetId] = useState<string | null>('nominal-cruising');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [combineNotifications, setCombineNotifications] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isAlarmSilenced, setIsAlarmSilenced] = useState<boolean>(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      source: 'RULE_ENGINE',
      event: 'E-MICROMOBILITY AI-BMS Engine Bootstrapped',
      severity: 'SAFE',
      details: 'All 4 operational safety rules active. Zero-latency hardware contactor loop initialized. Audible alarm driver armed.',
    },
  ]);

  // Evaluate BMS rules in real time
  const engineResult = evaluateBmsRules(telematics, combineNotifications);
  const { output, ruleResults, audibleBeaconActive, peripheralsActive } = engineResult;

  const prevOutputRef = useRef(output);
  const lastAlarmIncidentKey = useRef<string>('');

  // Handle Audible Alarm Sound when abnormal condition occurs
  useEffect(() => {
    const isAbnormal = output.safety_status !== 'SAFE' || audibleBeaconActive;

    if (isAbnormal) {
      const currentIncidentKey = `${output.safety_status}-${output.owner_notification}-${audibleBeaconActive}`;

      // If a new abnormal incident key occurred, un-silence alarm so new events always alert!
      if (lastAlarmIncidentKey.current !== currentIncidentKey) {
        setIsAlarmSilenced(false);
        lastAlarmIncidentKey.current = currentIncidentKey;
      }

      if (!isAudioMuted && !isAlarmSilenced) {
        setIsAlarmPlaying(true);
        if (audibleBeaconActive) {
          bmsAudioAlarm.startAlarmLoop('BEACON');
        } else if (output.safety_status === 'CRITICAL') {
          bmsAudioAlarm.startAlarmLoop('CRITICAL');
        } else {
          bmsAudioAlarm.startAlarmLoop('WARNING');
        }
      } else {
        bmsAudioAlarm.stopAlarm();
        setIsAlarmPlaying(false);
      }
    } else {
      // Returned to SAFE state
      bmsAudioAlarm.stopAlarm();
      setIsAlarmPlaying(false);
      setIsAlarmSilenced(false);
      lastAlarmIncidentKey.current = '';
    }

    return () => {
      // Cleanup on unmount
      bmsAudioAlarm.stopAlarm();
    };
  }, [output.safety_status, output.owner_notification, audibleBeaconActive, isAudioMuted, isAlarmSilenced]);

  // Detect state changes and log them
  useEffect(() => {
    const prev = prevOutputRef.current;
    const now = output;
    const timestamp = new Date().toLocaleTimeString();

    // Check if safety status changed
    if (prev.safety_status !== now.safety_status) {
      setLogs((prevLogs) => [
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp,
          source: 'RULE_ENGINE',
          event: `Safety Status Transition: ${prev.safety_status} → ${now.safety_status}`,
          severity: now.safety_status,
          details: now.owner_notification || 'System transitioned back to nominal operating state.',
        },
        ...prevLogs.slice(0, 49),
      ]);
    }

    // Check if charging relay toggled
    if (prev.hardware_toggles.charging_relay !== now.hardware_toggles.charging_relay) {
      setLogs((prevLogs) => [
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp,
          source: 'RULE_ENGINE',
          event: `Charging Relay Actuation: ${now.hardware_toggles.charging_relay}`,
          severity: now.hardware_toggles.charging_relay === 'OFF' ? 'CRITICAL' : 'SAFE',
          details:
            now.hardware_toggles.charging_relay === 'OFF'
              ? 'High-speed solid-state relay opened. Charging current isolated.'
              : 'Charging contactor closed. Circuit primed.',
        },
        ...prevLogs.slice(0, 49),
      ]);
    }

    // Check if drivetrain lock toggled
    if (prev.hardware_toggles.drivetrain_lock !== now.hardware_toggles.drivetrain_lock) {
      setLogs((prevLogs) => [
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp,
          source: 'RULE_ENGINE',
          event: `Drivetrain Lock Solenoid: ${now.hardware_toggles.drivetrain_lock}`,
          severity: now.hardware_toggles.drivetrain_lock === 'ON' ? 'CRITICAL' : 'SAFE',
          details:
            now.hardware_toggles.drivetrain_lock === 'ON'
              ? 'Vehicle immobilized due to security rule trigger.'
              : 'Drivetrain unlocked for rider operation.',
        },
        ...prevLogs.slice(0, 49),
      ]);
    }

    // Check if motor power limit changed
    if (prev.hardware_toggles.motor_power_limit !== now.hardware_toggles.motor_power_limit) {
      setLogs((prevLogs) => [
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp,
          source: 'RULE_ENGINE',
          event: `Motor Power Clamp: ${now.hardware_toggles.motor_power_limit}`,
          severity: now.hardware_toggles.motor_power_limit === '50%' ? 'WARNING' : 'SAFE',
          details:
            now.hardware_toggles.motor_power_limit === '50%'
              ? 'ESC governor restricted motor output to 50% to mitigate thermal runaway.'
              : 'ESC governor restored to 100% full rating.',
        },
        ...prevLogs.slice(0, 49),
      ]);
    }

    prevOutputRef.current = now;
  }, [output]);

  // Live sensor streaming jitter simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setTelematics((prev) => {
        // Minor realistic sensor noise
        const tempJitter = (Math.random() - 0.48) * 0.2;
        const currentJitter = prev.isChargerConnected && prev.chargingCurrent > 0
          ? (Math.random() - 0.5) * 0.1
          : 0;
        const motorTempJitter = (Math.random() - 0.48) * 0.3;
        const torqueJitter = prev.vehicleSpeed > 0 ? (Math.random() - 0.5) * 1.5 : 0;
        const speedJitter = prev.vehicleSpeed > 0 ? (Math.random() - 0.5) * 0.8 : 0;

        return {
          ...prev,
          batteryTemp: Math.max(15, Math.min(65, prev.batteryTemp + tempJitter)),
          chargingCurrent: Math.max(0, Math.min(10, prev.chargingCurrent + currentJitter)),
          motorTemp: Math.max(20, Math.min(95, prev.motorTemp + motorTempJitter)),
          torque: Math.max(0, Math.min(80, prev.torque + torqueJitter)),
          vehicleSpeed: Math.max(0, Math.min(45, prev.vehicleSpeed + speedJitter)),
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectionStepName, setInspectionStepName] = useState<string | null>(null);
  const inspectionTimerRef = useRef<number | null>(null);

  // Autonomous Vehicle Inspection Scan Routine
  const stopInspectionScan = () => {
    if (inspectionTimerRef.current !== null) {
      clearTimeout(inspectionTimerRef.current);
      inspectionTimerRef.current = null;
    }
    setIsInspecting(false);
    setInspectionStepName(null);
  };

  const runInspectionScan = () => {
    bmsAudioAlarm.unlockAudio();
    setIsAudioMuted(false);
    bmsAudioAlarm.setMuted(false);
    setIsAlarmSilenced(false);
    setIsInspecting(true);

    const steps = [
      {
        name: 'Phase 1/4: Thermal Overheating Stress (Rule 1)',
        preset: PRESET_SCENARIOS[0], // Rule 1
        duration: 4000,
      },
      {
        name: 'Phase 2/4: Mechanical Overload & Torque Strain (Rule 2)',
        preset: PRESET_SCENARIOS[1], // Rule 2
        duration: 4000,
      },
      {
        name: 'Phase 3/4: Prolonged Storage Quiescent Draw (Rule 3)',
        preset: PRESET_SCENARIOS[2], // Rule 3
        duration: 4000,
      },
      {
        name: 'Phase 4/4: Bluetooth Unauthorized Hijack Intrusion (Rule 4)',
        preset: PRESET_SCENARIOS[5], // Rogue Hijack
        duration: 4000,
      },
      {
        name: 'Phase 5: Diagnostic Recovery & Nominal Clearance',
        preset: PRESET_SCENARIOS[4], // Nominal Cruising
        duration: 2500,
      },
    ];

    let currentStep = 0;

    const executeStep = () => {
      if (currentStep >= steps.length) {
        stopInspectionScan();
        return;
      }

      const step = steps[currentStep];
      setInspectionStepName(step.name);
      handleSelectPreset(step.preset);

      currentStep++;
      inspectionTimerRef.current = window.setTimeout(executeStep, step.duration);
    };

    executeStep();
  };

  const handleToggleInspection = () => {
    if (isInspecting) {
      stopInspectionScan();
      handleResetToNominal();
    } else {
      runInspectionScan();
    }
  };

  useEffect(() => {
    return () => {
      if (inspectionTimerRef.current !== null) {
        clearTimeout(inspectionTimerRef.current);
      }
    };
  }, []);

  const handleSelectPreset = (preset: ScenarioPreset) => {
    bmsAudioAlarm.unlockAudio();
    setActivePresetId(preset.id);
    setIsAlarmSilenced(false);
    setTelematics(preset.telematics);
    setLogs((prev) => [
      {
        id: `preset-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'USER_OVERRIDE',
        event: `Inspection Target Loaded: ${preset.name}`,
        severity: preset.category.includes('Rule') ? 'CRITICAL' : 'SAFE',
        details: preset.summary,
      },
      ...prev.slice(0, 49),
    ]);
  };

  const handleTelematicsChange = (updated: Partial<VehicleTelematics>) => {
    bmsAudioAlarm.unlockAudio();
    setActivePresetId(null);
    setIsAlarmSilenced(false); // Un-silence so any abnormal parameter change rings immediately!
    setTelematics((prev) => ({ ...prev, ...updated }));
  };

  const handleResetToNominal = () => {
    stopInspectionScan();
    setActivePresetId('nominal-cruising');
    setTelematics(NOMINAL_TELEMATICS);
    setIsAlarmSilenced(false);
    bmsAudioAlarm.stopAlarm();
    setIsAlarmPlaying(false);
    setLogs((prev) => [
      {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'USER_OVERRIDE',
        event: 'Manual Reset: Restored Nominal Cruising Telematics',
        severity: 'SAFE',
        details: 'All sensor feeds reset to standard operational baseline.',
      },
      ...prev.slice(0, 49),
    ]);
  };

  const handleToggleAudioMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    bmsAudioAlarm.setMuted(nextMuted);
    if (nextMuted) {
      setIsAlarmPlaying(false);
    }
  };

  const handleToggleSilence = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      bmsAudioAlarm.setMuted(false);
    } else if (isAlarmPlaying) {
      bmsAudioAlarm.stopAlarm();
      setIsAlarmPlaying(false);
      setIsAlarmSilenced(true);
    } else {
      setIsAlarmSilenced(false);
    }
  };

  const handleTestAlarm = () => {
    setIsAudioMuted(false);
    bmsAudioAlarm.setMuted(false);
    bmsAudioAlarm.playCriticalBurst();
    setLogs((prev) => [
      {
        id: `test-alarm-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'USER_OVERRIDE',
        event: 'Audible Piezo Alarm Test Triggered',
        severity: 'WARNING',
        details: 'Simulated 1400Hz siren modulation burst transmitted to vehicle speaker.',
      },
      ...prev.slice(0, 49),
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3-Zone Compliant Top Navigation Bar */}
      <TopBar
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onReset={handleResetToNominal}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={handleToggleAudioMute}
        onTestAlarm={handleTestAlarm}
      />

      {/* Quick Scenario & Autonomous Inspection Bar */}
      <ScenarioBar
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        isInspecting={isInspecting}
        inspectionStepName={inspectionStepName}
        onToggleInspection={handleToggleInspection}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-Time Owner Notification Banner with Alarm Controls */}
        <OwnerNotificationBanner
          notification={output.owner_notification}
          safetyStatus={output.safety_status}
          audibleBeaconActive={audibleBeaconActive}
          isAlarmPlaying={isAlarmPlaying}
          isAudioMuted={isAudioMuted}
          onToggleSilence={handleToggleSilence}
        />

        {/* Tab 1: Overview Console (Default) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Actuator & Hardware Relay Matrix */}
            <HardwareRelayMatrix
              toggles={output.hardware_toggles}
              safetyStatus={output.safety_status}
              audibleBeaconActive={audibleBeaconActive}
              peripheralsActive={peripheralsActive}
            />

            {/* Split Grid: Live Telematics Controls & Direct Mandated JSON Output */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <TelematicsControlPanel
                  telematics={telematics}
                  onChange={handleTelematicsChange}
                />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <JsonOutputViewer bmsOutput={output} />
              </div>
            </div>

            {/* Operational Rules Evaluation Checklist */}
            <RuleEngineInspector ruleResults={ruleResults} />

            {/* Electro-Thermal Diagnostics & Parasitic Load Analytics */}
            <DiagnosticSummary telematics={telematics} bmsOutput={output} />

            {/* Physical 13S Battery Architecture & Heatmap */}
            <BatteryCellMatrix telematics={telematics} />

            {/* Event Audit Log */}
            <AuditLog logs={logs} onClear={() => setLogs([])} />
          </div>
        )}

        {/* Tab 2: Operational Rules Focus */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <RuleEngineInspector ruleResults={ruleResults} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TelematicsControlPanel
                telematics={telematics}
                onChange={handleTelematicsChange}
              />
              <JsonOutputViewer bmsOutput={output} />
            </div>
            <HardwareRelayMatrix
              toggles={output.hardware_toggles}
              safetyStatus={output.safety_status}
              audibleBeaconActive={audibleBeaconActive}
              peripheralsActive={peripheralsActive}
            />
          </div>
        )}

        {/* Tab 3: Hardware Toggles Focus */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            <HardwareRelayMatrix
              toggles={output.hardware_toggles}
              safetyStatus={output.safety_status}
              audibleBeaconActive={audibleBeaconActive}
              peripheralsActive={peripheralsActive}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TelematicsControlPanel
                telematics={telematics}
                onChange={handleTelematicsChange}
              />
              <DiagnosticSummary telematics={telematics} bmsOutput={output} />
            </div>
            <AuditLog logs={logs} onClear={() => setLogs([])} />
          </div>
        )}

        {/* Tab 4: JSON Output Focus */}
        {activeTab === 'json' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <JsonOutputViewer bmsOutput={output} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-slate-100 mb-2">
                    Response Specification Contract
                  </h3>
                  <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                    <p>
                      The AI-BMS engine guarantees strict adherence to the output schema:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 font-mono text-[11px]">
                      <li><strong className="text-cyan-400">safety_status</strong>: SAFE | WARNING | CRITICAL</li>
                      <li><strong className="text-cyan-400">hardware_toggles</strong>: charging_relay, motor_power_limit, gps_module, cellular_data, drivetrain_lock</li>
                      <li><strong className="text-cyan-400">owner_notification</strong>: Exact rule-defined alert message or null</li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Compound Alert Joiner</span>
                    <button
                      onClick={() => setCombineNotifications(!combineNotifications)}
                      className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                        combineNotifications
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {combineNotifications ? 'Joined Strings' : 'Priority Single'}
                    </button>
                  </div>
                </div>

                <DiagnosticSummary telematics={telematics} bmsOutput={output} />
              </div>
            </div>
            <HardwareRelayMatrix
              toggles={output.hardware_toggles}
              safetyStatus={output.safety_status}
              audibleBeaconActive={audibleBeaconActive}
              peripheralsActive={peripheralsActive}
            />
          </div>
        )}

        {/* Tab 5: Battery Pack & Chassis Focus */}
        {activeTab === 'chassis' && (
          <div className="space-y-6">
            <BatteryCellMatrix telematics={telematics} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TelematicsControlPanel
                telematics={telematics}
                onChange={handleTelematicsChange}
              />
              <HardwareRelayMatrix
                toggles={output.hardware_toggles}
                safetyStatus={output.safety_status}
                audibleBeaconActive={audibleBeaconActive}
                peripheralsActive={peripheralsActive}
              />
            </div>
            <AuditLog logs={logs} onClear={() => setLogs([])} />
          </div>
        )}
      </main>

      {/* Clean, Unboxed Footer (Anti-Slop: No Pill Badges, No Mechanical Prefixes) */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>E-MICROMOBILITY AI-BMS Firmware</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic Safety Kernel</span>
            <span aria-hidden="true">·</span>
            <span>Piezo Siren Interlock Active</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Latency &lt; 2.5 ms</span>
            <span aria-hidden="true">·</span>
            <span>Sample Rate 100 Hz</span>
            <span aria-hidden="true">·</span>
            <span>Status: Nominal Isolation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
