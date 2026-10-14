import Phaser from 'phaser';

export class AudioManager {
  constructor(_scene: Phaser.Scene) {
    // Audio manager uses WebAudio API directly
  }

  // Generate simple procedural sounds using WebAudio API
  private generateTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(volume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      // Silent fail if WebAudio not available
      console.warn('WebAudio not available');
    }
  }

  playStep(): void {
    this.generateTone(100, 0.05, 'sine', 0.1);
  }

  playHide(): void {
    // Descending tone for hiding
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  }

  playUnhide(): void {
    // Ascending tone for unhiding
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  }

  playAlert(): void {
    // Alert sound - quick beep
    this.generateTone(800, 0.1, 'square', 0.25);
  }

  playPickup(): void {
    // Pleasant ascending arpeggio
    const notes = [261.63, 329.63, 392.00]; // C, E, G
    notes.forEach((freq, i) => {
      setTimeout(() => this.generateTone(freq, 0.15, 'sine', 0.15), i * 80);
    });
  }

  playEat(): void {
    // Satisfied sound
    this.generateTone(300, 0.2, 'sine', 0.2);
    setTimeout(() => this.generateTone(350, 0.15, 'sine', 0.15), 100);
  }

  playCaught(): void {
    // Descending sad tone
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  }

  playSuccess(): void {
    // Happy ascending melody
    const notes = [261.63, 293.66, 329.63, 392.00]; // C, D, E, G
    notes.forEach((freq, i) => {
      setTimeout(() => this.generateTone(freq, 0.2, 'sine', 0.2), i * 100);
    });
  }

  playDayEnd(): void {
    // Peaceful resolution
    const notes = [392.00, 329.63, 261.63]; // G, E, C
    notes.forEach((freq, i) => {
      setTimeout(() => this.generateTone(freq, 0.3, 'sine', 0.15), i * 200);
    });
  }
}
