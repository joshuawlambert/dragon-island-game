export class MusicManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;

  constructor() {
    try {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.08; // Quiet background music
    } catch (error) {
      console.warn('WebAudio not available for music');
    }
  }

  startBackgroundMusic(): void {
    if (!this.context || !this.masterGain || this.isPlaying) return;

    this.isPlaying = true;

    // Gentle, peaceful melody using simple tones
    // C Major scale notes for a cozy feel
    const melody = [
      { freq: 261.63, duration: 0.5 }, // C
      { freq: 293.66, duration: 0.5 }, // D
      { freq: 329.63, duration: 0.5 }, // E
      { freq: 261.63, duration: 0.5 }, // C
      { freq: 293.66, duration: 0.5 }, // D
      { freq: 329.63, duration: 1.0 }, // E
      { freq: 392.00, duration: 0.5 }, // G
      { freq: 329.63, duration: 0.5 }, // E
      { freq: 293.66, duration: 1.0 }, // D
    ];

    let time = this.context.currentTime;

    const playMelody = () => {
      if (!this.isPlaying || !this.context || !this.masterGain) return;

      melody.forEach(note => {
        const osc = this.context!.createOscillator();
        const noteGain = this.context!.createGain();

        osc.connect(noteGain);
        noteGain.connect(this.masterGain!);

        osc.type = 'sine';
        osc.frequency.value = note.freq;

        // Gentle envelope
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(0.3, time + 0.1);
        noteGain.gain.setValueAtTime(0.3, time + note.duration - 0.1);
        noteGain.gain.linearRampToValueAtTime(0, time + note.duration);

        osc.start(time);
        osc.stop(time + note.duration);

        this.oscillators.push(osc);

        time += note.duration;
      });

      // Loop the melody
      setTimeout(playMelody, (time - this.context!.currentTime + 2) * 1000);
    };

    playMelody();
  }

  stopBackgroundMusic(): void {
    this.isPlaying = false;
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators = [];
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}
