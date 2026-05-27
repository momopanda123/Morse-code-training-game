/**
 * Web Audio API synthesizer for clean, pop-free Morse Code beeps.
 * Uses a singleton pattern to ensure only one AudioContext exists across state re-renders.
 */
class MorseAudioEngine {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private frequency: number = 700; // Hz (pleasant audio pitch)
  private volume: number = 0.5; // Normalized 0 to 1
  private isBeeping: boolean = false;

  private init() {
    if (this.ctx) return;
    try {
      // Standard browser AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      // Create oscillator and gain nodes
      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();

      // Configure oscillator
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(this.frequency, this.ctx.currentTime);
      
      // Start with volume at 0
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

      // Connect nodes: oscillator -> gain -> destination
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      
      this.oscillator.start(0);
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser/device or context has not been unlocked.", e);
    }
  }

  public setFrequency(hz: number) {
    this.frequency = hz;
    if (this.ctx && this.oscillator) {
      this.oscillator.frequency.setValueAtTime(hz, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public startBeep() {
    this.init();
    if (!this.ctx || !this.gainNode) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.isBeeping) {
      this.isBeeping = true;
      // Soft ramp up to prevent clicking sound
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01);
    }
  }

  public stopBeep() {
    if (!this.ctx || !this.gainNode) return;

    if (this.isBeeping) {
      this.isBeeping = false;
      // Soft ramp down to prevent clicking
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + 0.02);
    }
  }

  /**
   * Helper to play a short beep of specific duration
   */
  public playBeep(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      this.startBeep();
      setTimeout(() => {
        this.stopBeep();
        resolve();
      }, durationMs);
    });
  }

  /**
   * Play an entire sequence (e.g. ".-..")
   */
  public async playSequence(sequence: string, dotDurationMs: number = 100) {
    const dashDuration = dotDurationMs * 3;
    const symbolGap = dotDurationMs;

    for (let i = 0; i < sequence.length; i++) {
      const symbol = sequence[i];
      if (symbol === '.') {
        await this.playBeep(dotDurationMs);
      } else if (symbol === '-') {
        await this.playBeep(dashDuration);
      }
      // Wait for symbol gap unless it's the last symbol
      if (i < sequence.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, symbolGap));
      }
    }
  }
}

export const morseAudio = new MorseAudioEngine();
