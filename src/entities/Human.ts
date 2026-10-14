import Phaser from 'phaser';
import { GameConfig } from '../config';
import { AlertState } from '../types';
import { AudioManager } from '../utils/AudioManager';

export class Human extends Phaser.Physics.Arcade.Sprite {
  private audioManager: AudioManager;
  private alertState: AlertState = 'idle';
  private wanderCenterX: number;
  private wanderCenterY: number;
  private targetX: number;
  private targetY: number;
  private pauseTimer = 0;
  private isPaused = false;
  private sightCone: Phaser.GameObjects.Graphics | null = null;
  private alertIcon: Phaser.GameObjects.Text | null = null;
  private facingAngle = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, audioManager: AudioManager) {
    super(scene, x, y, '');
    this.audioManager = audioManager;

    this.wanderCenterX = x;
    this.wanderCenterY = y;
    this.targetX = x;
    this.targetY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.drawHuman();
    this.setCollideWorldBounds(true);
    this.setSize(25, 30);

    // Create sight cone
    this.sightCone = scene.add.graphics();
    this.sightCone.setDepth(-1);

    // Create alert icon
    this.alertIcon = scene.add.text(0, 0, '', {
      fontSize: '24px'
    }).setOrigin(0.5);

    this.pickNewTarget();
  }

  private drawHuman(): void {
    const graphics = this.scene.add.graphics();
    
    // Simple human figure
    // Head
    graphics.fillStyle(0xffdbac, 1);
    graphics.fillCircle(0, -10, 8);
    
    // Body
    graphics.fillStyle(0x4a90a4, 1);
    graphics.fillRect(-8, 0, 16, 20);
    
    // Arms
    graphics.fillStyle(0xffdbac, 1);
    graphics.fillRect(-12, 2, 4, 12);
    graphics.fillRect(8, 2, 4, 12);
    
    // Legs
    graphics.fillStyle(0x2d5f6f, 1);
    graphics.fillRect(-8, 20, 6, 10);
    graphics.fillRect(2, 20, 6, 10);

    graphics.generateTexture('human', 40, 50);
    graphics.destroy();

    this.setTexture('human');
  }

  update(delta: number): void {
    if (this.alertState === 'chasing') {
      // Chasing handled by stealth system
      return;
    }

    if (this.isPaused) {
      this.pauseTimer -= delta;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
        this.pickNewTarget();
      }
      this.setVelocity(0, 0);
    } else {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
      
      if (distance < 10) {
        this.isPaused = true;
        this.pauseTimer = GameConfig.human.pauseTime;
        this.setVelocity(0, 0);
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);
        this.facingAngle = angle;
        
        const velocityX = Math.cos(angle) * GameConfig.human.speed;
        const velocityY = Math.sin(angle) * GameConfig.human.speed;
        this.setVelocity(velocityX, velocityY);
      }
    }

    this.updateSightCone();
    this.updateAlertIcon();
  }

  private pickNewTarget(): void {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * GameConfig.human.wanderRadius;
    
    this.targetX = this.wanderCenterX + Math.cos(angle) * radius;
    this.targetY = this.wanderCenterY + Math.sin(angle) * radius;
    
    // Clamp to world bounds
    this.targetX = Phaser.Math.Clamp(this.targetX, 50, GameConfig.worldWidth - 50);
    this.targetY = Phaser.Math.Clamp(this.targetY, 50, GameConfig.worldHeight - 50);
  }

  private updateSightCone(): void {
    if (!this.sightCone) return;

    this.sightCone.clear();
    
    if (this.alertState === 'idle') {
      return; // Don't show sight cone when idle
    }

    const halfAngle = (GameConfig.human.sightAngle * Math.PI / 180) / 2;
    const range = GameConfig.human.sightRange;

    let color = 0xffeb3b;
    let alpha = 0.2;

    if (this.alertState === 'alert') {
      color = 0xff5722;
      alpha = 0.4;
    } else if (this.alertState === 'chasing') {
      color = 0xf44336;
      alpha = 0.5;
    }

    this.sightCone.fillStyle(color, alpha);
    this.sightCone.beginPath();
    this.sightCone.moveTo(this.x, this.y);
    this.sightCone.arc(
      this.x,
      this.y,
      range,
      this.facingAngle - halfAngle,
      this.facingAngle + halfAngle,
      false
    );
    this.sightCone.closePath();
    this.sightCone.fillPath();
  }

  private updateAlertIcon(): void {
    if (!this.alertIcon) return;

    this.alertIcon.setPosition(this.x, this.y - 40);

    if (this.alertState === 'suspicious') {
      this.alertIcon.setText('?');
      this.alertIcon.setColor('#ffeb3b');
    } else if (this.alertState === 'alert') {
      this.alertIcon.setText('!');
      this.alertIcon.setColor('#ff5722');
    } else if (this.alertState === 'chasing') {
      this.alertIcon.setText('‼️');
      this.alertIcon.setColor('#f44336');
    } else {
      this.alertIcon.setText('');
    }
  }

  setAlertState(state: AlertState): void {
    if (this.alertState !== state && state !== 'idle') {
      this.audioManager.playAlert();
    }
    this.alertState = state;
  }

  getAlertState(): AlertState {
    return this.alertState;
  }

  getFacingAngle(): number {
    return this.facingAngle;
  }

  reset(): void {
    this.alertState = 'idle';
    this.isPaused = false;
    this.setPosition(this.wanderCenterX, this.wanderCenterY);
    this.pickNewTarget();
  }

  destroy(): void {
    this.sightCone?.destroy();
    this.alertIcon?.destroy();
    super.destroy();
  }
}
