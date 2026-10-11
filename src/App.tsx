import React, { useState, useEffect, useRef } from 'react';
import { NOMINAL_ERICKSHAW_TELEMATICS, ERICKSHAW_PRESETS, ERickshawPreset } from './data/presets';
import { ERickshawTelematics, ControllerActionsOutput } from './types/bms';
import { evaluateERickshawController } from './engine/erickshawController';
import { erickshawAudioAlarm } from './utils/audioAlarm';
import { TopBar } from './components/TopBar';
import { ScenarioBar } from './components/ScenarioBar';
import { OwnerNotificationBanner } from './components/OwnerNotificationBanner';
import { ERickshawDashboard } from './components/ERickshawDashboard';
import { CodeExportView } from './components/CodeExportView';
import { JsonOutputViewer } from './components/JsonOutputViewer';
import { LiveThermalTelemetryChart } from './components/LiveThermalTelemetryChart';

export default function App() {
  const [telematics, setTelematics] = useState<ERickshawTelematics>(NOMINAL_ERICKSHAW_TELEMATICS);
  const [activePresetId, setActivePresetId] = useState<string | null>('nominal-ride');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isAlarmSilenced, setIsAlarmSilenced] = useState<boolean>(false);

  // Evaluate E-Rickshaw Smart Controller Edge Triggers in real time
  const controllerActions: ControllerActionsOutput = evaluateERickshawController(telematics);

  const prevStatusRef = useRef(controllerActions.system_status);
  const lastAlarmIncidentKey = useRef<string>('');

  // Handle Real-Time Acoustic Alarm Sounds (Thermal Overheat or Cabin Overload)
  useEffect(() => {
    const isThermalAlarm = controllerActions.active_alarms.thermal_hardware_alarm;
    const isCabinAlarm = controllerActions.active_alarms.cabin_overload_alarm;
    const isAbnormal = isThermalAlarm || isCabinAlarm;

    if (isAbnormal) {
      const incidentKey = `${isThermalAlarm ? 'THERMAL' : 'CABIN'}-${telematics.batteryTemp.toFixed(0)}-${telematics.passengerCount}`;

      if (lastAlarmIncidentKey.current !== incidentKey) {
        setIsAlarmSilenced(false);
        lastAlarmIncidentKey.current = incidentKey;
      }

      if (!isAudioMuted && !isAlarmSilenced) {
        if (isThermalAlarm) {
          erickshawAudioAlarm.startAlarmLoop('THERMAL');
        } else {
          erickshawAudioAlarm.startAlarmLoop('OVERLOAD');
        }
      } else {
        erickshawAudioAlarm.stopAlarm();
      }
    } else {
      erickshawAudioAlarm.stopAlarm();
      setIsAlarmSilenced(false);
      lastAlarmIncidentKey.current = '';
    }

    return () => {
      erickshawAudioAlarm.stopAlarm();
    };
  }, [
    controllerActions.active_alarms.thermal_hardware_alarm,
    controllerActions.active_alarms.cabin_overload_alarm,
    telematics.batteryTemp,
    telematics.passengerCount,
    isAudioMuted,
    isAlarmSilenced,
  ]);

  // Autonomous Multi-Sensor Inspection Scan Runner
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectionStepName, setInspectionStepName] = useState<string | null>(null);
  const inspectionTimerRef = useRef<number | null>(null);

  const stopInspectionScan = () => {
    if (inspectionTimerRef.current !== null) {
      clearTimeout(inspectionTimerRef.current);
      inspectionTimerRef.current = null;
    }
    setIsInspecting(false);
    setInspectionStepName(null);
  };

  const runInspectionScan = () => {
    erickshawAudioAlarm.unlockAudio();
    setIsAudioMuted(false);
    erickshawAudioAlarm.setMuted(false);
    setIsAlarmSilenced(false);
    setIsInspecting(true);

    const steps = [
      {
        name: 'Trigger 1: Battery Thermal Overheat (>50°C -> Alarm & 30% Motor Draw Reduction)',
        preset: ERICKSHAW_PRESETS[0],
        duration: 4500,
      },
      {
        name: 'Trigger 2: Passenger Cabin Overload (>6 Pax -> Overload Alert & Cabin Alarm)',
        preset: ERICKSHAW_PRESETS[1],
        duration: 4500,
      },
      {
        name: 'Trigger 3: Deep Sleep Storage (>3 Years Inactivity -> GPS & Cellular Cut)',
        preset: ERICKSHAW_PRESETS[2],
        duration: 4000,
      },
      {
        name: 'Trigger 4: Bluetooth Ignition & Motion Lockout (Moving -> Pair Request Cut)',
        preset: ERICKSHAW_PRESETS[3],
        duration: 4000,
      },
      {
        name: 'Trigger 5: Telemetry & Post-Charge Battery Lifeline Calculation',
        preset: ERICKSHAW_PRESETS[4],
        duration: 4000,
      },
      {
        name: 'Diagnostic Return: Nominal Commute Verification',
        preset: ERICKSHAW_PRESETS[5],
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

  // Live Jitter Simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setTelematics((prev) => {
        const tempNoise = (Math.random() - 0.49) * 0.25;
        const speedNoise = prev.isMoving ? (Math.random() - 0.5) * 1.2 : 0;
        const currentNoise = prev.isMoving ? (Math.random() - 0.5) * 0.8 : 0;

        return {
          ...prev,
          batteryTemp: Math.max(20, Math.min(75, prev.batteryTemp + tempNoise)),
          vehicleSpeed: Math.max(0, Math.min(35, prev.vehicleSpeed + speedNoise)),
          motorDrawCurrent: Math.max(0, Math.min(60, prev.motorDrawCurrent + currentNoise)),
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleSelectPreset = (preset: ERickshawPreset) => {
    erickshawAudioAlarm.unlockAudio();
    setActivePresetId(preset.id);
    setIsAlarmSilenced(false);
    setTelematics(preset.telematics);
  };

  const handleTelematicsChange = (updated: Partial<ERickshawTelematics>) => {
    erickshawAudioAlarm.unlockAudio();
    setActivePresetId(null);
    setIsAlarmSilenced(false);
    setTelematics((prev) => ({ ...prev, ...updated }));
  };

  const handleResetToNominal = () => {
    stopInspectionScan();
    setActivePresetId('nominal-ride');
    setTelematics(NOMINAL_ERICKSHAW_TELEMATICS);
    setIsAlarmSilenced(false);
    erickshawAudioAlarm.stopAlarm();
  };

  const handleToggleAudioMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    erickshawAudioAlarm.setMuted(nextMuted);
  };

  const handleToggleSilence = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      erickshawAudioAlarm.setMuted(false);
    } else {
      erickshawAudioAlarm.stopAlarm();
      setIsAlarmSilenced(true);
    }
  };

  const handleTestAlarm = () => {
    setIsAudioMuted(false);
    erickshawAudioAlarm.setMuted(false);
    erickshawAudioAlarm.playThermalOverheatBurst();
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-Time System Status & Driver Notification Banner */}
        <OwnerNotificationBanner
          status={controllerActions.system_status}
          isThermalAlarmActive={controllerActions.active_alarms.thermal_hardware_alarm}
          isCabinAlarmActive={controllerActions.active_alarms.cabin_overload_alarm}
          isAudioMuted={isAudioMuted}
          isAlarmSilenced={isAlarmSilenced}
          onToggleSilence={handleToggleSilence}
        />

        {/* Tab 1: Smart Dashboard (Comprehensive View) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <ERickshawDashboard
              telematics={telematics}
              controllerActions={controllerActions}
              onChange={handleTelematicsChange}
            />

            {/* Live Thermal & Overload Telemetry Chart (User Specified Recharts Component) */}
            <LiveThermalTelemetryChart />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <JsonOutputViewer controllerOutput={controllerActions} />
              </div>
              <div className="lg:col-span-6">
                <CodeExportView />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Telemetry Charts Focus */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <LiveThermalTelemetryChart />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <ERickshawDashboard
                  telematics={telematics}
                  controllerActions={controllerActions}
                  onChange={handleTelematicsChange}
                />
              </div>
              <div className="lg:col-span-6">
                <JsonOutputViewer controllerOutput={controllerActions} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cabin Occupancy Focus (Rule 2) */}
        {activeTab === 'cabin' && (
          <div className="space-y-6">
            <ERickshawDashboard
              telematics={telematics}
              controllerActions={controllerActions}
              onChange={handleTelematicsChange}
            />
          </div>
        )}

        {/* Tab 3: Battery Lifeline & Health Focus (Rule 5) */}
        {activeTab === 'battery' && (
          <div className="space-y-6">
            <ERickshawDashboard
              telematics={telematics}
              controllerActions={controllerActions}
              onChange={handleTelematicsChange}
            />
          </div>
        )}

        {/* Tab 4: Telemetry Output */}
        {activeTab === 'json' && (
          <div className="space-y-6">
            <JsonOutputViewer controllerOutput={controllerActions} />
          </div>
        )}

        {/* Tab 5: Arduino / C++ & Python Code Exporter */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <CodeExportView />
          </div>
        )}
      </main>

      {/* Clean, Unboxed Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>E-MICROMOBILITY AI-BMS Firmware</span>
            <span aria-hidden="true">·</span>
            <span>Edge Safety Kernel</span>
            <span aria-hidden="true">·</span>
            <span>AIS-156 & AIS-038 Compliant</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>10 Hz Real-Time Sampling</span>
            <span aria-hidden="true">·</span>
            <span>PWM Throttle Governor</span>
            <span aria-hidden="true">·</span>
            <span>ESP32 / Raspberry Pi Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
