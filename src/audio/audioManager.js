// Web Audio API Synthesizer for Focus & Productivity
// Zero external assets required, 100% reliable offline generation

class AudioManager {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.currentAmbientType = 'none';
    this.isMuted = false;
    this.ambientVolume = 0.35;
    this.effectsVolume = 0.7;
    this.isTickEnabled = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play pleasant gong / chime for session completion (Focus or Break completed)
  playChime(type = 'focus') {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.effectsVolume, now);
    masterGain.connect(this.ctx.destination);

    if (type === 'focus') {
      // Elegant crystal bell / tibetan bowl harmonic chime (432Hz base)
      const freqs = [528, 792, 1056, 1584];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const duration = 2.8 - idx * 0.4;
        const volume = (0.35 / (idx + 1));

        gain.gain.setValueAtTime(volume, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + duration);
      });
    } else {
      // Calming soft bamboo wind chime / break bell (softer, welcoming)
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        const duration = 2.2;
        gain.gain.setValueAtTime(0.25, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + duration);
      });
    }
  }

  // Soft wooden mechanical clock tick (optional Cirillo ticking tutor)
  playTick() {
    if (this.isMuted || !this.isTickEnabled) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.015);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);

    gain.gain.setValueAtTime(this.effectsVolume * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.016);
  }

  // Distinct warning tone when pomodoro is voided
  playVoidAlert() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(this.effectsVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.29);
  }

  // Procedural Ambient Sound Generator: White Noise, Brown Noise, Rain Ambiance, Binaural Alpha Beats
  setAmbientSound(type) {
    this.init();
    this.stopAmbient();
    this.currentAmbientType = type;

    if (type === 'none' || this.isMuted) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    if (type === 'brown') {
      this.ambientSource = this.createBrownNoiseNode();
      this.ambientSource.connect(this.ambientGain);
    } else if (type === 'white') {
      this.ambientSource = this.createWhiteNoiseNode();
      this.ambientSource.connect(this.ambientGain);
    } else if (type === 'rain') {
      this.ambientSource = this.createRainAmbianceNode();
      this.ambientSource.connect(this.ambientGain);
    } else if (type === 'binaural') {
      this.ambientSource = this.createBinauralAlphaNode();
      this.ambientSource.connect(this.ambientGain);
    }
  }

  createWhiteNoiseNode() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to soften harshness
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    whiteNoise.connect(filter);
    whiteNoise.start();

    // Return custom container
    return {
      connect: (dest) => filter.connect(dest),
      stop: () => {
        try { whiteNoise.stop(); } catch (e) {}
      }
    };
  }

  createBrownNoiseNode() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    brownNoise.connect(filter);
    brownNoise.start();

    return {
      connect: (dest) => filter.connect(dest),
      stop: () => {
        try { brownNoise.stop(); } catch (e) {}
      }
    };
  }

  createRainAmbianceNode() {
    // Rain is filtered brown noise modulated with soft pink bursts
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    let lastLeft = 0;
    let lastRight = 0;
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      left[i] = (lastLeft + (0.035 * whiteL)) / 1.035;
      right[i] = (lastRight + (0.035 * whiteR)) / 1.035;
      lastLeft = left[i];
      lastRight = right[i];
      left[i] *= 2.8;
      right[i] *= 2.8;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 950;
    bandpass.Q.value = 0.8;

    rainSource.connect(bandpass);
    rainSource.start();

    return {
      connect: (dest) => bandpass.connect(dest),
      stop: () => {
        try { rainSource.stop(); } catch (e) {}
      }
    };
  }

  createBinauralAlphaNode() {
    // 432 Hz left, 442 Hz right = 10 Hz Alpha frequency brainwave resonance
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.value = 216; // Warm subtle carrier

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.value = 226; // 10Hz alpha differential

    const gainL = this.ctx.createGain();
    gainL.gain.value = 0.15;
    const gainR = this.ctx.createGain();
    gainR.gain.value = 0.15;

    oscLeft.connect(gainL);
    oscRight.connect(gainR);

    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);

    oscLeft.start();
    oscRight.start();

    return {
      connect: (dest) => merger.connect(dest),
      stop: () => {
        try {
          oscLeft.stop();
          oscRight.stop();
        } catch (e) {}
      }
    };
  }

  stopAmbient() {
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource = null;
    }
  }

  setAmbientVolume(vol) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    }
  }

  setEffectsVolume(vol) {
    this.effectsVolume = Math.max(0, Math.min(1, vol));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.ambientGain) this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else {
      if (this.ambientGain) this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
