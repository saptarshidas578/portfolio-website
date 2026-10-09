/**
 * Procedural Cosmic Audio Synthesizer (Web Audio API)
 * Generates an ethereal gravitational wave hum, cosmic resonance drone,
 * and relativistic Doppler pitch shifts on scroll. Zero external audio files required.
 */

export class CosmicAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.subGain = null;
    this.droneGain = null;
    this.filter = null;
    this.osc1 = null;
    this.osc2 = null;
    this.noiseNode = null;
  }

  init() {
    if (this.ctx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Dynamic Resonant Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(160, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(4.5, this.ctx.currentTime);
    this.filter.connect(this.masterGain);

    // Sub-bass Gravitational Oscillators (Binaural beating)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = "sine";
    this.osc1.frequency.setValueAtTime(43.6, this.ctx.currentTime); // Deep hum

    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = "triangle";
    this.osc2.frequency.setValueAtTime(44.2, this.ctx.currentTime); // Slight detune

    this.subGain = this.ctx.createGain();
    this.subGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    this.osc1.connect(this.subGain);
    this.osc2.connect(this.subGain);
    this.subGain.connect(this.filter);

    // Cosmic Wind / Plasma Noise Generator
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      output[i] = (b0 + b1 + b2) * 0.35;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.osc1.start();
    this.osc2.start();
    this.noiseNode.start();
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;
    const now = this.ctx.currentTime;

    if (this.isPlaying) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.35, now + 1.2);
    } else {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    }

    return this.isPlaying;
  }

  /**
   * Modulate sound based on scroll progression and camera velocity
   */
  update(scrollProgress, velocity = 0) {
    if (!this.isPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;

    // As user dives into the black hole, filter opens up from 160Hz to 850Hz
    const targetFreq = 160 + Math.pow(scrollProgress, 2.0) * 900 + Math.abs(velocity) * 400;
    this.filter.frequency.setTargetAtTime(Math.min(targetFreq, 1800), now, 0.1);

    // Deepen pitch of sub oscillators (gravitational redshift acoustic analog)
    const baseFreq = Math.max(28.0, 43.6 * (1.0 - scrollProgress * 0.35));
    this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.1);
    this.osc2.frequency.setTargetAtTime(baseFreq + 0.6, now, 0.1);

    // Swell plasma noise volume near horizon
    const noiseVol = 0.15 + Math.pow(scrollProgress, 1.5) * 0.45;
    this.droneGain.gain.setTargetAtTime(noiseVol, now, 0.1);
  }
}
