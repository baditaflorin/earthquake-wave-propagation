import { seismometer } from "../simulation/scenario";
import type { WaveEvent } from "../simulation/types";
import { distanceKm } from "../simulation/waveMath";

export type AudioStatus = "idle" | "ready" | "unavailable";

export class SeismicAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private statusValue: AudioStatus = "idle";

  get status(): AudioStatus {
    return this.statusValue;
  }

  async enable(): Promise<AudioStatus> {
    if (!("AudioContext" in window) && !("webkitAudioContext" in window)) {
      this.statusValue = "unavailable";
      return this.statusValue;
    }

    const AudioContextClass =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      this.statusValue = "unavailable";
      return this.statusValue;
    }

    this.context ??= new AudioContextClass();
    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.masterGain ??= this.context.createGain();
    this.masterGain.gain.value = 0.42;
    this.masterGain.connect(this.context.destination);
    this.statusValue = "ready";
    return this.statusValue;
  }

  setGain(gain: number): void {
    if (!this.masterGain || !this.context) {
      return;
    }

    this.masterGain.gain.setTargetAtTime(gain, this.context.currentTime, 0.04);
  }

  async playEvent(event: WaveEvent, gain: number): Promise<void> {
    const status = await this.enable();
    if (status !== "ready" || !this.context || !this.masterGain) {
      return;
    }

    this.setGain(gain);

    const distance = distanceKm(event.epicenter, seismometer);
    const pDelay = distance / event.material.pVelocityKmS;
    const sDelay = distance / event.material.sVelocityKmS;
    const now = this.context.currentTime;

    this.playPulse(now + pDelay, 170, 0.08, 0.9, "triangle");
    this.playPulse(now + sDelay, 54, 0.2, 1.8, "sawtooth");
    this.playNoiseBurst(now + sDelay, 1.4);
  }

  dispose(): void {
    this.masterGain?.disconnect();
    void this.context?.close();
    this.context = null;
    this.masterGain = null;
    this.statusValue = "idle";
  }

  private playPulse(
    startAt: number,
    frequency: number,
    attack: number,
    duration: number,
    type: OscillatorType,
  ): void {
    if (!this.context || !this.masterGain) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, frequency * 0.62),
      startAt + duration,
    );

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.55, startAt + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.05);
  }

  private playNoiseBurst(startAt: number, duration: number): void {
    if (!this.context || !this.masterGain) {
      return;
    }

    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(
      1,
      Math.floor(sampleRate * duration),
      sampleRate,
    );
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < channel.length; i += 1) {
      channel[i] = (Math.random() * 2 - 1) * (1 - i / channel.length);
    }

    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(110, startAt);
    filter.Q.value = 1.4;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.34, startAt + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(startAt);
    source.stop(startAt + duration);
  }
}
