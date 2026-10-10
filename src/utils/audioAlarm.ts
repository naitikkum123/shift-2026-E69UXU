/**
 * Web Audio API synthesizer for AI-BMS vehicle audible alarm system.
 * Generates synthesized tones without external asset dependencies.
 */

class BmsAudioAlarm {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private loopInterval: number | null = null;
  private masterGain: GainNode | null = null;

  public unlockAudio(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Dual-pulse high-urgency piezo ring for CRITICAL hazards
   * (Rule 1 Overheating, Rule 3 Deep Sleep Low Batt)
   */
  public playCriticalBurst() {
    if (this.isMuted) return;
    const ctx = this.unlockAudio();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pulse 1
    this.createBeep(ctx, now, 1200, 1600, 0.12, 'sawtooth');
    // Pulse 2
    this.createBeep(ctx, now + 0.15, 1200, 1600, 0.12, 'sawtooth');
    // Pulse 3
    this.createBeep(ctx, now + 0.30, 1400, 1800, 0.15, 'sawtooth');
  }

  /**
   * Two-tone acoustic caution chime for WARNING states
   * (Rule 2 Overloading / Abrasive Heat)
   */
  public playWarningBurst() {
    if (this.isMuted) return;
    const ctx = this.unlockAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    this.createBeep(ctx, now, 750, 750, 0.14, 'sine');
    this.createBeep(ctx, now + 0.16, 1050, 1050, 0.18, 'sine');
  }

  /**
   * High-pitch sonar chirp for SECURITY BEACON / BLUETOOTH HALT (Rule 4)
   */
  public playBeaconBurst() {
    if (this.isMuted) return;
    const ctx = this.unlockAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    this.createBeep(ctx, now, 1850, 2400, 0.10, 'triangle');
    this.createBeep(ctx, now + 0.14, 2100, 2600, 0.12, 'triangle');
  }

  private createBeep(
    ctx: AudioContext,
    startTime: number,
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType
  ) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, startTime);
      if (startFreq !== endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
      }

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.45, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(ctx.destination);
      }

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    } catch {}
  }

  /**
   * Starts an autonomous repeating alarm loop matching the severity mode
   */
  public startAlarmLoop(type: 'CRITICAL' | 'WARNING' | 'BEACON') {
    this.stopAlarm();
    if (this.isMuted) return;

    // Immediately trigger first acoustic ring
    if (type === 'BEACON') {
      this.playBeaconBurst();
    } else if (type === 'CRITICAL') {
      this.playCriticalBurst();
    } else {
      this.playWarningBurst();
    }

    const intervalMs = type === 'BEACON' ? 650 : type === 'CRITICAL' ? 850 : 1400;

    this.loopInterval = window.setInterval(() => {
      if (this.isMuted) {
        this.stopAlarm();
        return;
      }
      if (type === 'BEACON') {
        this.playBeaconBurst();
      } else if (type === 'CRITICAL') {
        this.playCriticalBurst();
      } else {
        this.playWarningBurst();
      }
    }, intervalMs);
  }

  public stopAlarm() {
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }
}

export const bmsAudioAlarm = new BmsAudioAlarm();

// Register global user-gesture unlock listener
if (typeof window !== 'undefined') {
  const unlock = () => {
    bmsAudioAlarm.unlockAudio();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}
