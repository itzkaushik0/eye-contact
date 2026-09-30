/**
 * Eye Contact Enforcer - Audio Engine
 * Handles procedural horror synthesizers, Web Speech API voices, 
 * creepy pitch-shifted "I see you" that triggers reliably EVERY TIME you look away.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.speechSynth = window.speechSynthesis;
    this.voices = [];
    this.audioUnlocked = false;
    this.heartbeatInterval = null;
    this.spookyLoopInterval = null;
    this.volume = 0.9;
    
    // Spooky voice lines
    this.spookyLines = [
      "I see you.",
      "I... see... you...",
      "Where are you looking?",
      "Do not look away from me.",
      "Look back into my eyes.",
      "I am watching your every move."
    ];
    this.lineIndex = 0;

    this.initVoices();
    this.setupGlobalUnlock();
  }

  setupGlobalUnlock() {
    const unlock = () => {
      this.init();
    };
    ['click', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlock, { passive: true });
    });
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.audioUnlocked = true;
    this.initVoices();

    // Chrome SpeechSynthesis unfreeze
    if (this.speechSynth && this.speechSynth.paused) {
      this.speechSynth.resume();
    }
  }

  initVoices() {
    if (!this.speechSynth) return;
    const updateVoices = () => {
      this.voices = this.speechSynth.getVoices() || [];
    };
    updateVoices();
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = updateVoices;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  // --- Web Audio SFX Generators ---

  /**
   * Horror Jumpscare / Stinger chord (Low sub-bass strike + dissonant metallic screech)
   */
  playHorrorStinger() {
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Master gain for this sound
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.85, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    masterGain.connect(ctx.destination);

    // Sub-bass impact
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(115, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
    
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(now);
    subOsc.stop(now + 1.5);

    // Dissonant devil's tritone screech (E5 + Bb5)
    const tones = [659.25, 932.33, 311.13];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 8 - 4), now);
      osc.frequency.linearRampToValueAtTime(freq * 0.92, now + 2.0);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(5, now);

      const toneGain = ctx.createGain();
      toneGain.gain.setValueAtTime(0.35, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(filter);
      filter.connect(toneGain);
      toneGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2.2);
    });
  }

  /**
   * Procedural Ghost Whisper fallback (guarantees spooky sound even if TTS is muted)
   */
  playProceduralGhostWhisper() {
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Filtered noise swoosh mimicking eerie breath
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 1.4);
    filter.Q.value = 8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 1.5);
  }

  /**
   * Silence all voices and audio loops when returning to normal
   */
  silence() {
    this.stopHeartbeatLoop();
    this.stopSpookyLoop();
    if (this.speechSynth) {
      try {
        this.speechSynth.cancel();
      } catch (e) {}
    }
    window._activeUtterance = null;
  }

  /**
   * Heartbeat thud when eye contact has been broken for a while
   */
  playHeartbeat() {
    if (!this.audioUnlocked || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  startHeartbeatLoop() {
    if (this.heartbeatInterval) return;
    this.playHeartbeat();
    setTimeout(() => this.playHeartbeat(), 220);
    this.heartbeatInterval = setInterval(() => {
      this.playHeartbeat();
      setTimeout(() => this.playHeartbeat(), 220);
    }, 1100);
  }

  stopHeartbeatLoop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Continuous loop that repeats spooky phrases every 3.2s while looking away
   */
  startSpookyLoop() {
    if (this.spookyLoopInterval) return;
    this.spookyLoopInterval = setInterval(() => {
      this.lineIndex = (this.lineIndex + 1) % this.spookyLines.length;
      this.speakSpookyVoice(this.spookyLines[this.lineIndex]);
    }, 3200);
  }

  stopSpookyLoop() {
    if (this.spookyLoopInterval) {
      clearInterval(this.spookyLoopInterval);
      this.spookyLoopInterval = null;
    }
  }

  // --- Voice Synthesis Engine ---

  /**
   * Creepy Unsettling Voice: "I see you."
   * Guaranteed to play every single time with Chrome bug workarounds & procedural fallback
   */
  speakSpookyVoice(customText = null) {
    this.init();
    this.playHorrorStinger();
    this.playProceduralGhostWhisper();
    this.startHeartbeatLoop();

    if (!this.speechSynth) return;

    // Chromium Workaround: Cancel any paused/hung speech & resume immediately
    try {
      this.speechSynth.cancel();
      if (this.speechSynth.paused) {
        this.speechSynth.resume();
      }
    } catch (e) {}

    const text = customText || this.spookyLines[0]; // Primary "I see you."
    const utterance = new SpeechSynthesisUtterance(text);

    // Keep global reference to prevent V8 garbage-collecting utterance mid-speech!
    window._activeUtterance = utterance;

    // Find best unsettling voice (prefer deeper/male/robotic english voice)
    if (!this.voices || this.voices.length === 0) {
      this.voices = this.speechSynth.getVoices() || [];
    }

    const eerieVoice = this.voices.find(v => 
      v.lang && v.lang.startsWith('en') && (
        v.name.toLowerCase().includes('david') || 
        v.name.toLowerCase().includes('george') || 
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('google uk english male')
      )
    ) || this.voices.find(v => v.lang && v.lang.startsWith('en')) || (this.voices.length > 0 ? this.voices[0] : null);

    if (eerieVoice) utterance.voice = eerieVoice;

    // Pitch down, slow, unsettling
    utterance.pitch = 0.35;
    utterance.rate = 0.62;
    utterance.volume = this.volume;

    utterance.onend = () => {
      window._activeUtterance = null;
    };

    utterance.onerror = (err) => {
      console.warn("Speech error, using procedural whisper fallback:", err);
      window._activeUtterance = null;
      this.playProceduralGhostWhisper();
    };

    // Chrome sometimes hangs if speak is called synchronously after cancel
    setTimeout(() => {
      try {
        if (this.speechSynth) {
          this.speechSynth.resume();
          this.speechSynth.speak(utterance);
        }
      } catch (err) {
        console.warn("speechSynth.speak failed:", err);
      }
    }, 30);
  }
}

// Export singleton instance
window.soundEngine = new SoundEngine();
