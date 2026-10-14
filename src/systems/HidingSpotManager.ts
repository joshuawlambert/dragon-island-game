import Phaser from 'phaser';
import { HidingSpot } from '../types';
import { Player } from '../entities/Player';

export class HidingSpotManager {
  private scene: Phaser.Scene;
  private hidingSpots: HidingSpot[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.generateHidingSpots();
  }

  private generateHidingSpots(): void {
    // Bushes in forest area
    for (let i = 0; i < 25; i++) {
      const x = 300 + Math.random() * 900;
      const y = 900 + Math.random() * 1200;
      this.createHidingSpot(x, y, 'bush');
    }

    // Tall grass around lake
    for (let i = 0; i < 20; i++) {
      const x = 1500 + Math.random() * 300;
      const y = 500 + Math.random() * 1400;
      this.createHidingSpot(x, y, 'grass');
    }

    // Bushes near camp
    for (let i = 0; i < 15; i++) {
      const x = 1400 + Math.random() * 900;
      const y = 900 + Math.random() * 600;
      this.createHidingSpot(x, y, 'bush');
    }

    // Grass near beach
    for (let i = 0; i < 12; i++) {
      const x = 400 + Math.random() * 2400;
      const y = 1900 + Math.random() * 300;
      this.createHidingSpot(x, y, 'grass');
    }
  }

  private createHidingSpot(x: number, y: number, type: 'bush' | 'grass'): void {
    const graphics = this.scene.add.graphics();
    const radius = type === 'bush' ? 35 : 40;

    if (type === 'bush') {
      // Bush - darker green circles
      graphics.fillStyle(0x2d6f2d, 0.8);
      graphics.fillCircle(x, y, radius);
      graphics.fillCircle(x - 15, y - 10, radius * 0.7);
      graphics.fillCircle(x + 15, y - 10, radius * 0.7);
      graphics.fillStyle(0x1a4d1a, 0.6);
      graphics.fillCircle(x, y - 15, radius * 0.5);
    } else {
      // Tall grass - lighter green with texture
      for (let i = 0; i < 8; i++) {
        const offsetX = (Math.random() - 0.5) * radius;
        const offsetY = (Math.random() - 0.5) * radius;
        graphics.fillStyle(0x7cb342, 0.6);
        graphics.fillRect(x + offsetX - 3, y + offsetY - 15, 6, 20);
      }
    }

    graphics.setDepth(-12);

    this.hidingSpots.push({
      x,
      y,
      radius,
      type,
      graphics
    });
  }

  checkPlayerInHidingSpot(player: Player): HidingSpot | null {
    for (const spot of this.hidingSpots) {
      const distance = Phaser.Math.Distance.Between(player.x, player.y, spot.x, spot.y);
      if (distance < spot.radius) {
        return spot;
      }
    }
    return null;
  }

  getHidingSpots(): HidingSpot[] {
    return this.hidingSpots;
  }

  highlightSpot(_spot: HidingSpot, _highlight: boolean): void {
    // Graphics don't support tinting, this would need to be redrawn
    // Skipping highlight for now
  }

  destroy(): void {
    this.hidingSpots.forEach(spot => spot.graphics.destroy());
    this.hidingSpots = [];
  }
}
