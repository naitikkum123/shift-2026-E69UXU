import React, { useState } from 'react';
import { ARDUINO_CPP_CODE, PYTHON_RASPBERRY_PI_CODE } from '../data/codeSnippets';
import { Copy, Check, Download, Cpu, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

export const CodeExportView: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'arduino' | 'python'>('arduino');
  const [copied, setCopied] = useState(false);

  const currentCode = activeLang === 'arduino' ? ARDUINO_CPP_CODE : PYTHON_RASPBERRY_PI_CODE;
  const fileName = activeLang === 'arduino' ? 'erickshaw_ev_controller.ino' : 'erickshaw_smart_controller.py';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-4 gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Firmware & Simulation Script Exporter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Target code implementations for Arduino / ESP32 microcontrollers and Raspberry Pi simulation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented language selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveLang('arduino')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeLang === 'arduino'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Arduino / C++ (ESP32)</span>
            </button>

            <button
              onClick={() => setActiveLang('python')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeLang === 'python'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Python (Raspberry Pi)</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            title="Download file"
            className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded border transition-colors ${
              copied
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-cyan-950/80 border-cyan-800 text-cyan-300 hover:bg-cyan-900'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Spec Banner */}
      <div className="mb-4 p-3 rounded bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            {activeLang === 'arduino'
              ? 'ESP32 / STM32 / Arduino Microcontroller Architecture (FreeRTOS Ready, 10Hz Control Loop)'
              : 'Linux Daemon / Edge Python 3 Engine (Raspberry Pi 4 / 5, Jetson Nano, CAN socket)'}
          </span>
        </div>
        <span className="text-cyan-400">Target File: {fileName}</span>
      </div>

      {/* Code Body */}
      <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs overflow-auto max-h-[600px] leading-relaxed">
        <pre className="text-slate-200 whitespace-pre">
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
};
