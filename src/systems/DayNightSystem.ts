import Phaser from 'phaser';
import { GameConfig } from '../config';

export class DayNightSystem {
  private scene: Phaser.Scene;
  private timeOfDay: number = 8; // Hour (0-24)
  private overlay: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, _startDay: number = 1) {
    this.scene = scene;

    // Create day/night overlay
    this.overlay = scene.add.graphics();
    this.overlay.setDepth(900);
    this.overlay.setScrollFactor(0);
  }

  update(delta: number): void {
    // Advance time (with optional time-skip for testing)
    let secondsPerDay = GameConfig.dayNight.dayLengthSeconds;
    
    // Time-skip for testing: make days 30 seconds instead of 180
    if (GameConfig.dayNight.timeSkipForTesting) {
      secondsPerDay = 30;
    }
    
    const hoursPerSecond = 24 / secondsPerDay;
    this.timeOfDay += (hoursPerSecond * delta) / 1000;

    if (this.timeOfDay >= 24) {
      this.timeOfDay = 0;
    }

    this.updateOverlay();
  }

  private updateOverlay(): void {
    this.overlay.clear();

    const nightStart = GameConfig.dayNight.nightStartHour;
    const nightEnd = GameConfig.dayNight.nightEndHour;
    
    let alpha = 0;

    if (this.timeOfDay >= nightStart || this.timeOfDay < nightEnd) {
      // Night time
      if (this.timeOfDay >= nightStart) {
        // Evening transition (20:00 - 24:00)
        const progress = (this.timeOfDay - nightStart) / (24 - nightStart);
        alpha = Math.min(0.5, progress * 0.5);
      } else {
        // Night to morning (0:00 - 6:00)
        if (this.timeOfDay < nightEnd - 2) {
          alpha = 0.5; // Full night
        } else {
          // Morning transition (4:00 - 6:00)
          const progress = (this.timeOfDay - (nightEnd - 2)) / 2;
          alpha = 0.5 * (1 - progress);
        }
      }
    }

    if (alpha > 0) {
      this.overlay.fillStyle(0x000033, alpha);
      this.overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
    }
  }

  isDaytime(): boolean {
    const nightStart = GameConfig.dayNight.nightStartHour;
    const nightEnd = GameConfig.dayNight.nightEndHour;
    return this.timeOfDay >= nightEnd && this.timeOfDay < nightStart;
  }

  getTimeOfDay(): number {
    return this.timeOfDay;
  }

  getTimeString(): string {
    const hour = Math.floor(this.timeOfDay);
    const minute = Math.floor((this.timeOfDay % 1) * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  setDay(_day: number): void {
    this.timeOfDay = 8; // Reset to morning
  }
}
