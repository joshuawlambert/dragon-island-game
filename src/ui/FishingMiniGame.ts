import Phaser from 'phaser';
import { GameConfig } from '../config';

export class FishingMiniGame {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private progressBar: Phaser.GameObjects.Graphics | null = null;
  private targetZone: Phaser.GameObjects.Graphics | null = null;
  private marker: Phaser.GameObjects.Graphics | null = null;
  private isActive = false;
  private progress = 0;
  private markerPosition = 0;
  private markerDirection = 1;
  private targetStart = 0;
  private targetWidth = 0;
  private markerSpeed = 1.5;
  private onComplete: ((success: boolean) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  start(onComplete: (success: boolean) => void): void {
    if (this.isActive) return;

    this.isActive = true;
    this.onComplete = onComplete;
    this.progress = 0;
    this.markerPosition = 0;
    this.markerDirection = 1;

    // Random target zone
    this.targetWidth = 60 + Math.random() * 40;
    this.targetStart = 50 + Math.random() * (250 - this.targetWidth);

    this.createUI();

    // Auto-complete after timeout
    this.scene.time.delayedCall(GameConfig.player.fishingTime, () => {
      if (this.isActive) {
        this.complete(false);
      }
    });
  }

  private createUI(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(2500);

    // Semi-transparent overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, width, height);
    this.container.add(overlay);

    // Title
    const title = this.scene.add.text(width / 2, height / 2 - 100, '🎣 Fishing!', {
      fontSize: '32px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(title);

    const instructions = this.scene.add.text(width / 2, height / 2 - 60, 'Press SPACE or tap when the marker is in the green zone!', {
      fontSize: '18px',
      color: '#a8dadc',
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(instructions);

    // Progress bar background
    const barX = width / 2 - 175;
    const barY = height / 2;

    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRoundedRect(barX, barY, 350, 40, 8);
    this.container.add(barBg);

    // Target zone
    this.targetZone = this.scene.add.graphics();
    this.targetZone.fillStyle(0x4caf50, 0.6);
    this.targetZone.fillRoundedRect(barX + this.targetStart, barY, this.targetWidth, 40, 8);
    this.container.add(this.targetZone);

    // Progress bar
    this.progressBar = this.scene.add.graphics();
    this.container.add(this.progressBar);

    // Marker
    this.marker = this.scene.add.graphics();
    this.container.add(this.marker);

    // Input handler
    const clickHandler = () => {
      this.checkCatch();
    };

    this.scene.input.keyboard?.once('keydown-SPACE', clickHandler);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.once('pointerdown', clickHandler);
  }

  update(delta: number): void {
    if (!this.isActive || !this.marker || !this.progressBar) return;

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const barX = width / 2 - 175;
    const barY = height / 2;

    // Move marker
    this.markerPosition += this.markerDirection * this.markerSpeed * delta * 0.1;

    if (this.markerPosition >= 350) {
      this.markerPosition = 350;
      this.markerDirection = -1;
    } else if (this.markerPosition <= 0) {
      this.markerPosition = 0;
      this.markerDirection = 1;
    }

    // Draw marker
    this.marker.clear();
    this.marker.fillStyle(0xffffff, 1);
    this.marker.fillRect(barX + this.markerPosition - 3, barY - 5, 6, 50);

    // Update progress bar
    this.progressBar.clear();
    this.progressBar.fillStyle(0x4a90a4, 1);
    this.progressBar.fillRoundedRect(barX, barY + 50, 350 * (this.progress / 100), 10, 5);
  }

  private checkCatch(): void {
    if (!this.isActive) return;

    const inTargetZone = this.markerPosition >= this.targetStart && 
                        this.markerPosition <= this.targetStart + this.targetWidth;

    if (inTargetZone) {
      this.progress += 33.3;
      if (this.progress >= 100) {
        this.complete(true);
      } else {
        // Successful hit, speed up
        this.markerSpeed += 0.2;
      }
    } else {
      // Miss - end the game
      this.complete(false);
    }
  }

  private complete(success: boolean): void {
    if (!this.isActive) return;
    
    this.isActive = false;

    // Show result briefly
    if (this.container) {
      const width = this.scene.scale.width;
      const height = this.scene.scale.height;
      
      const result = this.scene.add.text(width / 2, height / 2 + 80, 
        success ? '✓ Caught!' : '✗ Got away!', {
        fontSize: '24px',
        color: success ? '#4caf50' : '#f44336',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.container.add(result);
    }

    this.scene.time.delayedCall(500, () => {
      this.destroy();
      if (this.onComplete) {
        this.onComplete(success);
      }
    });
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isActive = false;
    this.progressBar = null;
    this.targetZone = null;
    this.marker = null;
  }

  isPlaying(): boolean {
    return this.isActive;
  }
}
