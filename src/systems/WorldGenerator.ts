import Phaser from 'phaser';
import { GameConfig, HomeTypes } from '../config';

export class WorldGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generateWorld(): void {
    // Base terrain
    this.createBaseTerrain();
    
    // Regions
    this.createBeach();
    this.createForest();
    this.createVillage();
    this.createMountain();
    this.createLake();
    
    // Homes
    this.createHomes();
    
    // Decorations
    this.addDecorations();
  }

  private createBaseTerrain(): void {
    const graphics = this.scene.add.graphics();
    
    // Grass base
    graphics.fillGradientStyle(0x3a7f3a, 0x3a7f3a, 0x2d6f2d, 0x2d6f2d, 1);
    graphics.fillRect(0, 0, GameConfig.worldWidth, GameConfig.worldHeight);
    
    graphics.setDepth(-100);
  }

  private createBeach(): void {
    // Bottom edge - sandy beach
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xf4e4c1, 1);
    
    for (let x = 0; x < GameConfig.worldWidth; x += 100) {
      const y = GameConfig.worldHeight - 150 + Math.sin(x * 0.01) * 30;
      graphics.fillCircle(x, y, 80);
    }
    
    // Water edge
    graphics.fillStyle(0x4a90e2, 0.6);
    for (let x = 0; x < GameConfig.worldWidth; x += 80) {
      const y = GameConfig.worldHeight - 80 + Math.cos(x * 0.015) * 20;
      graphics.fillCircle(x, y, 60);
    }
    
    graphics.setDepth(-50);

    // Beach label
    this.addLabel(GameConfig.worldWidth / 2, GameConfig.worldHeight - 100, '🏖️ Beach');
  }

  private createForest(): void {
    // Left side - forest area
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x2d5f2d, 1);
    
    for (let i = 0; i < 40; i++) {
      const x = 200 + Math.random() * 800;
      const y = 800 + Math.random() * 1200;
      graphics.fillCircle(x, y, 40 + Math.random() * 30);
    }
    
    graphics.setDepth(-50);

    // Trees (decorative)
    for (let i = 0; i < 30; i++) {
      const x = 200 + Math.random() * 800;
      const y = 800 + Math.random() * 1200;
      this.createTree(x, y);
    }

    this.addLabel(600, 1400, '🌲 Forest');
  }

  private createVillage(): void {
    // Center-right - village/camp area
    const graphics = this.scene.add.graphics();
    
    // Cleared area
    graphics.fillStyle(0x8b7355, 0.6);
    graphics.fillRect(1400, 900, 900, 600);
    
    graphics.setDepth(-50);

    // Tents/buildings
    for (let i = 0; i < 5; i++) {
      const x = 1500 + (i % 3) * 250;
      const y = 1000 + Math.floor(i / 3) * 250;
      this.createTent(x, y);
    }

    // Campfire in center
    this.createCampfire(1900, 1200);

    this.addLabel(1900, 950, '🏕️ Camp');
  }

  private createMountain(): void {
    // Top-right - mountain area
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x666666, 1);
    
    // Mountain shape
    graphics.fillTriangle(2800, 600, 2500, 200, 3100, 200);
    graphics.fillTriangle(2600, 700, 2400, 300, 2900, 300);
    
    // Snow caps
    graphics.fillStyle(0xeeeeee, 1);
    graphics.fillTriangle(2800, 450, 2700, 200, 2900, 200);
    
    graphics.setDepth(-50);

    this.addLabel(2800, 800, '⛰️ Mountain');
  }

  private createLake(): void {
    // Center - lake/river
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x4a90e2, 0.8);
    
    // Lake body
    graphics.fillEllipse(1600, 600, 400, 300);
    
    // River flowing down
    for (let y = 600; y < 1800; y += 50) {
      const width = 80 + Math.sin(y * 0.02) * 20;
      graphics.fillEllipse(1600, y, width, 60);
    }
    
    graphics.setDepth(-50);

    this.addLabel(1600, 550, '💧 Lake');
  }

  private createHomes(): void {
    // Create each home location
    Object.entries(HomeTypes).forEach(([_key, home]) => {
      this.createHome(home.x, home.y, home.name);
    });
  }

  private createHome(x: number, y: number, name: string): void {
    const graphics = this.scene.add.graphics();
    
    // Cave entrance
    graphics.fillStyle(0x333333, 1);
    graphics.fillEllipse(x, y, 80, 60);
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillEllipse(x, y, 60, 45);
    
    graphics.setDepth(0);

    // Home marker
    const marker = this.scene.add.text(x, y - 50, '🏠', {
      fontSize: '32px'
    }).setOrigin(0.5);
    marker.setDepth(10);

    // Label
    const label = this.scene.add.text(x, y + 50, name, {
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    label.setDepth(10);
  }

  private createTree(x: number, y: number): void {
    const graphics = this.scene.add.graphics();
    
    // Trunk
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(x - 5, y, 10, 30);
    
    // Foliage
    graphics.fillStyle(0x2d5f2d, 1);
    graphics.fillCircle(x, y - 10, 25);
    graphics.fillCircle(x - 15, y, 20);
    graphics.fillCircle(x + 15, y, 20);
    
    graphics.setDepth(-10);
  }

  private createTent(x: number, y: number): void {
    const graphics = this.scene.add.graphics();
    
    // Tent
    graphics.fillStyle(0xd2691e, 1);
    graphics.fillTriangle(x, y - 40, x - 40, y + 20, x + 40, y + 20);
    
    // Entrance
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillTriangle(x, y - 20, x - 15, y + 20, x + 15, y + 20);
    
    graphics.setDepth(0);
  }

  private createCampfire(x: number, y: number): void {
    const graphics = this.scene.add.graphics();
    
    // Logs
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(x - 20, y + 5, 40, 8);
    graphics.fillRect(x - 15, y - 5, 8, 40);
    
    // Fire
    graphics.fillStyle(0xff4500, 0.8);
    graphics.fillCircle(x, y, 15);
    graphics.fillStyle(0xffa500, 0.8);
    graphics.fillCircle(x, y - 5, 10);
    graphics.fillStyle(0xffff00, 0.8);
    graphics.fillCircle(x, y - 10, 5);
    
    graphics.setDepth(1);
  }

  private addDecorations(): void {
    // Random rocks
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * GameConfig.worldWidth;
      const y = Math.random() * GameConfig.worldHeight;
      
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0x888888, 1);
      graphics.fillCircle(x, y, 8 + Math.random() * 12);
      graphics.setDepth(-20);
    }

    // Random bushes
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * GameConfig.worldWidth;
      const y = Math.random() * GameConfig.worldHeight;
      
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0x2d6f2d, 1);
      graphics.fillCircle(x, y, 15 + Math.random() * 10);
      graphics.setDepth(-15);
    }
  }

  private addLabel(x: number, y: number, text: string): void {
    const label = this.scene.add.text(x, y, text, {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 12, y: 6 },
      fontStyle: 'bold'
    }).setOrigin(0.5);
    label.setDepth(5);
  }
}
