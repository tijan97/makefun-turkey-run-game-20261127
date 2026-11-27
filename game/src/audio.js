// Gobble Run sounds: every sound is synthesised with WebAudio at run time,
// so the game ships no audio files and makes no network request. The turkey
// gobbles, corn pops, the oven roars, the knife whistles and the farmer shouts.

export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  // Browsers only let audio start after a user gesture; call from input.
  unlock() {
    if (!this.context) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.context = new AC();
    }
    if (this.context.state === 'suspended') void this.context.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, seconds, type, volume, slideTo = null, delay = 0) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + delay;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + seconds);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain).connect(this.context.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  }

  noise(seconds, volume, lowpass = 1200, delay = 0) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + delay;
    const len = Math.max(1, Math.floor(this.context.sampleRate * seconds));
    const buffer = this.context.createBuffer(1, len, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.context.createBufferSource();
    src.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    src.connect(filter).connect(gain).connect(this.context.destination);
    src.start(t0);
  }

  gobble() {
    // A two-note gobble: low blurt, then a quick triplet.
    this.tone(180, 0.09, 'sawtooth', 0.16, 120);
    this.tone(240, 0.06, 'square', 0.1, 180, 0.1);
    this.tone(260, 0.06, 'square', 0.1, 190, 0.17);
    this.tone(230, 0.07, 'square', 0.1, 170, 0.24);
  }

  jump() { this.tone(320, 0.16, 'sine', 0.18, 640); }
  flap() { this.noise(0.12, 0.1, 900); }
  corn() { this.tone(880, 0.08, 'sine', 0.16, 1320); this.tone(1320, 0.1, 'sine', 0.1, 1760, 0.07); }
  thud() { this.tone(110, 0.18, 'triangle', 0.25, 55); this.noise(0.1, 0.12, 500); }
  knifeWhoosh() { this.noise(0.22, 0.16, 3200); this.tone(1400, 0.18, 'sine', 0.05, 500); }
  ovenRoar() { this.noise(0.5, 0.2, 700); this.tone(90, 0.45, 'sawtooth', 0.1, 60); }
  spotted() { this.tone(520, 0.12, 'square', 0.14, 780); this.tone(780, 0.14, 'square', 0.14, 1040, 0.12); }
  hide() { this.noise(0.25, 0.08, 600); }
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.16, null, i * 0.13));
  }

  // A lazy banjo-ish pluck loop for the farmyard, kept quiet under the action.
  startMusic() {
    if (!this.context || this.musicTimer) return;
    const notes = [392, 330, 262, 330, 392, 494, 440, 330];
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const f = notes[this.musicStep % notes.length];
      this.musicStep += 1;
      this.tone(f, 0.28, 'triangle', 0.045);
      if (this.musicStep % 4 === 1) this.tone(f / 2, 0.3, 'sine', 0.05);
    }, 300);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}
