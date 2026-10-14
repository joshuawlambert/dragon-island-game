import Phaser from 'phaser';
import { GameConfig } from '../config';
import { AlertState } from '../types';
import { AudioManager } from '../utils/AudioManager';
import { Player } from './Player';

export class Hunter extends Phaser.Physics.Arcade.Sprite {
  private audioManager: AudioManager;
  private alertState: AlertState = 'idle';
  private patrolPoints: { x: number; y: number }[] = [];
  private currentPatrolIndex = 0;
  private pauseTimer = 0;
  private isPaused = false;
  private sightCone: Phaser.GameObjects.Graphics | null = null;
  private alertIcon: Phaser.GameObjects.Text | null = null;
  private facingAngle = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, audioManager: AudioManager) {
    super(scene, x, y, '');
    this.audioManager = audioManager;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.drawHunter();
    this.setCollideWorldBounds(true);
    this.setSize(25, 30);

    // Create sight cone
    this.sightCone = scene.add.graphics();
    this.sightCone.setDepth(-1);

    // Create alert icon
    this.alertIcon = scene.add.text(0, 0, '', {
      fontSize: '28px'
    }).setOrigin(0.5);

    // Setup patrol route
    this.setupPatrolRoute();
  }

  private drawHunter(): void {
    const graphics = this.scene.add.graphics();
    
    // Hunter - more intimidating than regular humans
    // Head
    graphics.fillStyle(0xffdbac, 1);
    graphics.fillCircle(0, -10, 8);
    
    // Hat
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(-10, -18, 20, 4);
    graphics.fillRect(-8, -22, 16, 4);
    
    // Body
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(-8, 0, 16, 22);
    
    // Arms
    graphics.fillStyle(0xffdbac, 1);
    graphics.fillRect(-13, 2, 5, 14);
    graphics.fillRect(8, 2, 5, 14);
    
    // Legs
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(-8, 22, 7, 10);
    graphics.fillRect(1, 22, 7, 10);
    
    // Net (tool)
    graphics.lineStyle(2, 0x666666, 1);
    graphics.strokeRect(10, 8, 8, 12);

    graphics.generateTexture('hunter', 40, 50);
    graphics.destroy();

    this.setTexture('hunter');
  }

  private setupPatrolRoute(): void {
    // Patrol route covering key areas
    this.patrolPoints = [
      { x: 2000, y: 800 },
      { x: 2400, y: 1000 },
      { x: 2200, y: 1400 },
      { x: 1800, y: 1200 },
      { x: 1600, y: 800 },
    ];
  }

  update(delta: number, player?: Player): void {
    if (this.alertState === 'chasing' && player) {
      this.chasePlayer(player);
    } else if (this.isPaused) {
      this.pauseTimer -= delta;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      }
      this.setVelocity(0, 0);
    } else {
      this.patrol();
    }

    this.updateSightCone();
    this.updateAlertIcon();
  }

  private patrol(): void {
    const target = this.patrolPoints[this.currentPatrolIndex];
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    
    if (distance < 20) {
      this.isPaused = true;
      this.pauseTimer = GameConfig.hunter.patrolPauseTime;
      this.setVelocity(0, 0);
    } else {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
      this.facingAngle = angle;
      
      const velocityX = Math.cos(angle) * GameConfig.hunter.speed;
      const velocityY = Math.sin(angle) * GameConfig.hunter.speed;
      this.setVelocity(velocityX, velocityY);
    }
  }

  private chasePlayer(player: Player): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.facingAngle = angle;
    
    const velocityX = Math.cos(angle) * GameConfig.hunter.chaseSpeed;
    const velocityY = Math.sin(angle) * GameConfig.hunter.chaseSpeed;
    this.setVelocity(velocityX, velocityY);

    // Check if caught
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (distance < GameConfig.hunter.catchDistance && !player.isHiding()) {
      this.catchPlayer();
    }
  }

  private catchPlayer(): void {
    // Trigger caught event in game scene
    const gameScene = this.scene as any;
    if (gameScene.handleCaught) {
      gameScene.handleCaught();
    }
    
    // Reset hunter state
    this.setAlertState('idle');
  }

  private updateSightCone(): void {
    if (!this.sightCone) return;

    this.sightCone.clear();

    const halfAngle = (GameConfig.hunter.sightAngle * Math.PI / 180) / 2;
    const range = GameConfig.hunter.sightRange;

    let color = 0xff9800;
    let alpha = 0.3;

    if (this.alertState === 'suspicious') {
      color = 0xff9800;
      alpha = 0.3;
    } else if (this.alertState === 'alert') {
      color = 0xff5722;
      alpha = 0.4;
    } else if (this.alertState === 'chasing') {
      color = 0xf44336;
      alpha = 0.6;
    }

    this.sightCone.fillStyle(color, alpha);
    this.sightCone.lineStyle(2, color, 0.8);
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
    this.sightCone.strokePath();
  }

  private updateAlertIcon(): void {
    if (!this.alertIcon) return;

    this.alertIcon.setPosition(this.x, this.y - 45);

    if (this.alertState === 'suspicious') {
      this.alertIcon.setText('?');
      this.alertIcon.setColor('#ff9800');
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

  isCatching(): boolean {
    return this.alertState === 'chasing';
  }

  reset(): void {
    this.alertState = 'idle';
    this.isPaused = false;
    this.currentPatrolIndex = 0;
    this.setPosition(this.patrolPoints[0].x, this.patrolPoints[0].y);
  }

  destroy(): void {
    this.sightCone?.destroy();
    this.alertIcon?.destroy();
    super.destroy();
  }
}
