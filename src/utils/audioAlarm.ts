/**
 * Web Audio API synthesizer for E-Rickshaw Smart EV Controller alarms.
 * Provides distinct hardware alarms for:
 * 1. Thermal Overheat Protection (> 50°C): High-priority piercing siren
 * 2. Passenger Overload Alert (> 6 passengers): Cabin driver chime
 */

class ERickshawAudioAlarm {
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
        this.masterGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
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
   * 1. High-Priority Hardware Alarm: THERMAL OVERHEAT (> 50°C)
   * Rapid aggressive frequency modulation piercing siren
   */
  public playThermalOverheatBurst() {
    if (this.isMuted) return;
    const ctx = this.unlockAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Rapid oscillating siren burst (880Hz to 1600Hz)
    this.createSweepBeep(ctx, now, 880, 1600, 0.15, 'sawtooth');
    this.createSweepBeep(ctx, now + 0.16, 1600, 950, 0.15, 'sawtooth');
    this.createSweepBeep(ctx, now + 0.32, 1000, 1800, 0.20, 'sawtooth');
  }

  /**
   * 2. Cabin Alarm: PASSENGER OVERLOAD ALERT (> 6 passengers)
   * Double acoustic horn/chime pattern inside cabin
   */
  public playCabinOverloadBurst() {
    if (this.isMuted) return;
    const ctx = this.unlockAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Distinctive warning chime pair
    this.createTone(ctx, now, 620, 0.18, 'triangle');
    this.createTone(ctx, now + 0.22, 920, 0.24, 'triangle');
  }

  private createSweepBeep(
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
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.55, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.35, startTime + duration * 0.7);
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

  private createTone(
    ctx: AudioContext,
    startTime: number,
    freq: number,
    duration: number,
    type: OscillatorType
  ) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.48, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + duration * 0.75);
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
   * Starts an autonomous repeating alarm loop matching the trigger
   */
  public startAlarmLoop(type: 'THERMAL' | 'OVERLOAD') {
    this.stopAlarm();
    if (this.isMuted) return;

    if (type === 'THERMAL') {
      this.playThermalOverheatBurst();
    } else {
      this.playCabinOverloadBurst();
    }

    const intervalMs = type === 'THERMAL' ? 800 : 1200;

    this.loopInterval = window.setInterval(() => {
      if (this.isMuted) {
        this.stopAlarm();
        return;
      }
      if (type === 'THERMAL') {
        this.playThermalOverheatBurst();
      } else {
        this.playCabinOverloadBurst();
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

export const erickshawAudioAlarm = new ERickshawAudioAlarm();

// Register global user-gesture unlock listener
if (typeof window !== 'undefined') {
  const unlock = () => {
    erickshawAudioAlarm.unlockAudio();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}
