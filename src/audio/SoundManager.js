class SoundManager {
    constructor() {
        this.audioCtx = null;
        this.isPlaying = false;
        this.schedulerTimer = null;
        this.nextNoteTime = 0.0;
        this.currentBeat = 0;
        this.volume = 0.4; // default volume
        this.isMuted = false;
        this.currentTrackKey = 'tempest';
        this.lastGameplayTrack = 'cyberpunk';
        this.gainNode = null; // master volume control node

        // Track settings
        this.tempo = 145;
        this.melody = [];
        this.bassline = [];
        this.oscType = 'sawtooth';
        this.bassOscType = 'sawtooth';
        this.lpFilterFreq = 220;
        this.delayFeedback = 0.2;
        this.delayTimeVal = 0.15;
        this.synthDetune = 15;
        this.bassDetune = 20;
        this.synthDecay = 0.15;

        this.noteFreqs = {
            // Octave 2
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            // Octave 3
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            // Octave 4
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            // Octave 5
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
            // Octave 6
            'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98, 'A6': 1760.00
        };

        this.tracks = {
            cyberpunk: {
                tempo: 145,
                oscType: 'sawtooth',
                bassOscType: 'sawtooth',
                lpFilterFreq: 220,
                delayFeedback: 0.2,
                delayTimeVal: 0.15,
                detune: 15,
                bassDetune: 20,
                decay: 0.15,
                description: 'Cyberpunk Overdrive - Fast 145 BPM driving theme with detuned saws and deep bass.',
                melody: [
                    ['E', 4, 2], ['E', 4, 2], ['G', 4, 2], ['E', 4, 2], ['B', 4, 2], ['E', 4, 2], ['A', 4, 2], ['G', 4, 2],
                    ['C', 5, 2], ['C', 5, 2], ['E', 5, 2], ['C', 5, 2], ['G', 5, 2], ['C', 5, 2], ['F#', 5, 2], ['D', 5, 2],
                    ['E', 4, 2], ['E', 4, 2], ['G', 4, 2], ['E', 4, 2], ['B', 4, 2], ['E', 4, 2], ['A', 4, 2], ['G', 4, 2],
                    ['C', 5, 2], ['C', 5, 2], ['E', 5, 2], ['C', 5, 2], ['G', 5, 2], ['C', 5, 2], ['F#', 5, 2], ['D', 5, 2]
                ],
                bass: [
                    'E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'E2',
                    'E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'E2',
                    'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2',
                    'D2', 'D2', 'D2', 'D2', 'D2', 'D2', 'D2', 'D2'
                ]
            },
            tempest: {
                tempo: 112,
                oscType: 'square',
                bassOscType: 'sawtooth',
                lpFilterFreq: 300,
                delayFeedback: 0.3,
                delayTimeVal: 0.12,
                detune: 0,
                bassDetune: 0,
                decay: 0.35,
                description: 'Solar Tempest - Menacing 112 BPM slow industrial march with heavy square chords.',
                melody: [
                    ['D', 4, 4], ['-', 0, 2], ['D#', 4, 2], ['F', 4, 4], ['-', 0, 2], ['G', 4, 2], ['G#', 4, 2], ['F', 4, 2],
                    ['D', 4, 4], ['-', 0, 2], ['F', 4, 2], ['A', 4, 4], ['-', 0, 2], ['G', 4, 2], ['F', 4, 2], ['E', 4, 2],
                    ['D', 4, 4], ['-', 0, 2], ['F', 4, 2], ['G', 4, 4], ['-', 0, 2], ['G#', 4, 2], ['F', 4, 2], ['D', 4, 2],
                    ['D', 5, 4], ['-', 0, 2], ['A', 4, 2], ['F', 4, 4], ['-', 0, 2], ['E', 4, 2], ['C#', 5, 4], ['-', 0, 2]
                ],
                bass: [
                    'D2', '-', 'D2', '-', 'D2', '-', 'D2', '-',
                    'F2', '-', 'F2', '-', 'G2', '-', 'G2', '-',
                    'D2', '-', 'D2', '-', 'D2', '-', 'D2', '-',
                    'A#2', '-', 'A#2', '-', 'A2', '-', 'A2', '-'
                ]
            },
            overdrive: {
                tempo: 140,
                oscType: 'sawtooth',
                bassOscType: 'sawtooth',
                lpFilterFreq: 600,
                delayFeedback: 0.35,
                delayTimeVal: 0.33,
                detune: 40,
                bassDetune: 10,
                decay: 0.25,
                description: 'Nebula Overdrive - Soaring 140 BPM space trance with a massive detuned supersaw lead.',
                melody: [
                    ['C', 5, 4], ['-', 0, 2], ['G', 4, 2], ['A', 4, 4], ['-', 0, 2], ['C', 5, 2], ['D', 5, 2], ['E', 5, 2],
                    ['D', 5, 4], ['-', 0, 2], ['C', 5, 2], ['G', 4, 4], ['-', 0, 2], ['A', 4, 2], ['B', 4, 2], ['G', 4, 2],
                    ['E', 5, 4], ['-', 0, 2], ['B', 4, 2], ['C', 5, 4], ['-', 0, 2], ['E', 5, 2], ['F#', 5, 2], ['E', 5, 2],
                    ['G', 5, 4], ['-', 0, 2], ['D', 5, 2], ['E', 5, 4], ['-', 0, 2], ['G', 5, 2], ['A', 5, 2], ['B', 5, 2]
                ],
                bass: [
                    '-', 'C2', 'C2', 'C2', '-', 'A2', 'A2', 'A2',
                    '-', 'D2', 'D2', 'D2', '-', 'B2', 'B2', 'B2',
                    '-', 'E2', 'E2', 'E2', '-', 'C2', 'C2', 'C2',
                    '-', 'G2', 'G2', 'G2', '-', 'D2', 'D2', 'D2'
                ]
            }
        };
    }

    setPlayingState(playing) {
        this.isPlaying = playing;
        this.dispatchStateEvent();
    }

    setMuteState(muted) {
        this.isMuted = muted;
        this.dispatchStateEvent();
    }

    setVolumeState(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        this.dispatchStateEvent();
    }

    dispatchStateEvent() {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sound-manager-state', {
                detail: {
                    isPlaying: this.isPlaying,
                    isMuted: this.isMuted,
                    volume: this.volume,
                    currentTrack: this.currentTrackKey
                }
            }));
        }
    }

    init() {
        if (this.audioCtx) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
            this.gainNode = this.audioCtx.createGain();
            this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
            this.gainNode.connect(this.audioCtx.destination);
            this.setTrack(this.currentTrackKey);
        } catch (e) {
            console.error('Failed to initialize AudioContext:', e);
        }
    }

    setTrack(trackKey) {
        this.currentTrackKey = trackKey;
        if (trackKey !== 'tempest') {
            this.lastGameplayTrack = trackKey;
        }
        const data = this.tracks[trackKey];
        if (!data) return;

        this.tempo = data.tempo;
        this.melody = data.melody;
        this.bassline = data.bass;
        this.oscType = data.oscType;
        this.bassOscType = data.bassOscType;
        this.lpFilterFreq = data.lpFilterFreq;
        this.delayFeedback = data.delayFeedback;
        this.delayTimeVal = data.delayTimeVal;
        this.synthDetune = data.detune || 0;
        this.bassDetune = data.bassDetune || 0;
        this.synthDecay = data.decay || 0.2;

        // If playing, calculate next scheduling parameters
        if (this.isPlaying && this.audioCtx) {
            // Keep running smoothly
        }
        this.dispatchStateEvent();
    }

    getFreq(note, octave) {
        if (note === 'REST' || note === '-') return null;
        return this.noteFreqs[note + octave] || 440;
    }

    createSynth(time, freq, duration) {
        if (!this.audioCtx || !this.gainNode) return;

        const voiceGain = this.audioCtx.createGain();

        const osc1 = this.audioCtx.createOscillator();
        osc1.type = this.oscType;
        osc1.frequency.setValueAtTime(freq, time);
        osc1.connect(voiceGain);
        osc1.start(time);
        osc1.stop(time + duration);

        let osc2 = null;
        if (this.synthDetune > 0) {
            osc2 = this.audioCtx.createOscillator();
            osc2.type = this.oscType;
            osc2.frequency.setValueAtTime(freq, time);
            osc2.detune.setValueAtTime(this.synthDetune, time);
            osc2.connect(voiceGain);
            osc2.start(time);
            osc2.stop(time + duration);
        }

        // Envelope using synthDecay (ensuring decay target is always after attack)
        const decayTime = Math.max(0.05, Math.min(duration, this.synthDecay));
        voiceGain.gain.setValueAtTime(0, time);
        voiceGain.gain.linearRampToValueAtTime(this.oscType === 'sawtooth' ? 0.08 : 0.2, time + 0.02);
        voiceGain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

        // Delay effect
        const delay = this.audioCtx.createDelay();
        delay.delayTime.value = this.delayTimeVal;
        const delayGain = this.audioCtx.createGain();
        delayGain.gain.value = this.delayFeedback;

        voiceGain.connect(this.gainNode);
        voiceGain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(delay);
        delayGain.connect(this.gainNode);
    }

    createBass(time, freq, duration) {
        if (!this.audioCtx || !this.gainNode) return;

        const voiceGain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        const osc1 = this.audioCtx.createOscillator();
        osc1.type = this.bassOscType;
        osc1.frequency.setValueAtTime(freq, time);
        osc1.connect(filter);
        osc1.start(time);
        osc1.stop(time + duration);

        let osc2 = null;
        if (this.bassDetune > 0) {
            osc2 = this.audioCtx.createOscillator();
            osc2.type = this.bassOscType;
            osc2.frequency.setValueAtTime(freq, time);
            osc2.detune.setValueAtTime(this.bassDetune, time);
            osc2.connect(filter);
            osc2.start(time);
            osc2.stop(time + duration);
        }

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(this.lpFilterFreq, time);
        filter.Q.setValueAtTime(1, time);

        // Envelope (ensuring decay target is always after attack)
        const decayTime = Math.max(0.05, duration - 0.01);
        voiceGain.gain.setValueAtTime(0, time);
        voiceGain.gain.linearRampToValueAtTime(this.bassOscType === 'sawtooth' ? 0.22 : 0.3, time + 0.02);
        voiceGain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

        filter.connect(voiceGain);
        voiceGain.connect(this.gainNode);
    }

    createKick(time) {
        if (!this.audioCtx || !this.gainNode) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.start(time);
        osc.stop(time + 0.15);
    }

    createSnare(time) {
        if (!this.audioCtx || !this.gainNode) return;

        // Noise component
        const bufferSize = this.audioCtx.sampleRate * 0.12;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.audioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.08, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.gainNode);
        noise.start(time);

        // Tone component
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    createHiHat(time) {
        if (!this.audioCtx || !this.gainNode) return;
        const bufferSize = this.audioCtx.sampleRate * 0.03;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.audioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 7000;
        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.03, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.gainNode);
        noise.start(time);
    }

    scheduler() {
        if (!this.isPlaying || !this.audioCtx) return;
        const secondsPerBeat = 60.0 / this.tempo;
        const secondsPerSixteenth = secondsPerBeat / 4;

        while (this.nextNoteTime < this.audioCtx.currentTime + 0.1) {
            this.scheduleNote(this.currentBeat, this.nextNoteTime, secondsPerSixteenth, secondsPerBeat);
            this.nextNoteTime += secondsPerSixteenth;

            const maxBeats = 64;
            this.currentBeat = (this.currentBeat + 1) % maxBeats;
        }
        this.schedulerTimer = setTimeout(() => this.scheduler(), 25);
    }

    scheduleNote(beat, time, secondsPerSixteenth, secondsPerBeat) {
        // Lead melody
        if (beat % 2 === 0) {
            const melodyIndex = Math.floor(beat / 2) % this.melody.length;
            const noteToPlay = this.melody[melodyIndex];
            if (noteToPlay) {
                const freq = this.getFreq(noteToPlay[0], noteToPlay[1]);
                if (freq !== null) {
                    const duration = noteToPlay[2] * secondsPerSixteenth;
                    this.createSynth(time, freq, duration - 0.02);
                }
            }
        }

        // Bassline
        if (beat % 2 === 0) {
            const bassIndex = Math.floor(beat / 2) % this.bassline.length;
            const noteString = this.bassline[bassIndex];
            if (noteString && noteString !== 'REST' && noteString !== '-') {
                const freq = this.noteFreqs[noteString];
                if (freq) {
                    this.createBass(time, freq, (secondsPerBeat / 2) - 0.01);
                }
            }
        }

        // Drums
        if (this.currentTrackKey === 'cyberpunk') {
            if (beat % 4 === 0) this.createKick(time);
            if (beat % 8 === 4) this.createSnare(time);
            if (beat % 2 === 1) this.createHiHat(time);
        } else if (this.currentTrackKey === 'tempest') {
            if (beat % 8 === 0 || beat % 8 === 3) this.createKick(time);
            if (beat % 8 === 4) this.createSnare(time);
            if (beat % 4 === 2) this.createHiHat(time);
        } else if (this.currentTrackKey === 'overdrive') {
            if (beat % 4 === 0) this.createKick(time);
            if (beat % 8 === 4) this.createSnare(time);
            if (beat % 4 === 2) this.createHiHat(time);
        }
    }

    play() {
        this.init();
        if (this.isPlaying && this.audioCtx && this.audioCtx.state === 'running') return;

        const startPlaying = () => {
            this.setPlayingState(true);
            this.nextNoteTime = this.audioCtx.currentTime + 0.015;
            this.currentBeat = 0;
            this.scheduler();
        };

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().then(() => {
                if (this.audioCtx.state === 'running') {
                    startPlaying();
                } else {
                    console.warn('AudioContext is still suspended after resume (Autoplay policy block)');
                    this.setPlayingState(false);
                }
            }).catch(err => {
                console.warn('AudioContext resume failed:', err);
                this.setPlayingState(false);
            });
        } else {
            startPlaying();
        }
    }

    stop() {
        if (!this.isPlaying) return;
        this.setPlayingState(false);
        clearTimeout(this.schedulerTimer);
    }

    setVolume(vol) {
        this.setVolumeState(vol);
        if (this.gainNode) {
            const targetVal = this.isMuted ? 0 : this.volume;
            this.gainNode.gain.setValueAtTime(targetVal, this.audioCtx ? this.audioCtx.currentTime : 0);
        }
    }

    toggleMute() {
        const muted = !this.isMuted;
        this.setMuteState(muted);
        if (this.gainNode) {
            const targetVal = this.isMuted ? 0 : this.volume;
            this.gainNode.gain.setValueAtTime(targetVal, this.audioCtx ? this.audioCtx.currentTime : 0);
        }
        return this.isMuted;
    }
}

// Singleton instance stored globally to persist across Next.js HMR reloads
let soundManagerInstance = null;
if (typeof window !== 'undefined') {
    if (!window.__soundManagerInstance) {
        window.__soundManagerInstance = new SoundManager();
    }
    soundManagerInstance = window.__soundManagerInstance;
}

export default soundManagerInstance;
