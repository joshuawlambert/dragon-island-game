import Phaser from 'phaser';
import { GameConfig, GrowthStages } from '../config';
import { InputState } from '../types';
import { AudioManager } from '../utils/AudioManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private audioManager: AudioManager;
  private hiding = false;
  private hidingInSpot = false; // Hiding in bush/grass
  private gliding = false;
  private flying = false;
  private growthStage = 0;
  private stepSoundTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, audioManager: AudioManager) {
    super(scene, x, y, '');
    this.audioManager = audioManager;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Draw player
    this.drawPlayer();

    // Physics
    this.setCollideWorldBounds(true);
    this.setSize(30, 30);
  }

  private drawPlayer(): void {
    const graphics = this.scene.add.graphics();
    
    if (this.hiding) {
      // Rock form
      graphics.fillStyle(0x666666, 1);
      graphics.fillCircle(0, 0, 15);
      graphics.fillStyle(0x888888, 1);
      graphics.fillEllipse(-5, -5, 10, 8);
      graphics.fillEllipse(5, 5, 8, 10);
    } else {
      // Dragon form - size varies by growth stage
      const scale = 1 + this.growthStage * 0.3;
      
      // Body
      graphics.fillStyle(0x8b4789, 1); // Purple dragon
      graphics.fillEllipse(0, 0, 20 * scale, 25 * scale);
      
      // Head
      graphics.fillStyle(0x9b5799, 1);
      graphics.fillEllipse(0, -15 * scale, 15 * scale, 15 * scale);
      
      // Eyes
      graphics.fillStyle(0xffeb3b, 1);
      graphics.fillCircle(-5 * scale, -15 * scale, 3 * scale);
      graphics.fillCircle(5 * scale, -15 * scale, 3 * scale);
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(-5 * scale, -15 * scale, 1.5 * scale);
      graphics.fillCircle(5 * scale, -15 * scale, 1.5 * scale);
      
      // Wings (grow with stages)
      if (this.growthStage >= 1) {
        graphics.fillStyle(0x7b3779, 0.8);
        graphics.fillTriangle(-15 * scale, -5 * scale, -25 * scale, -10 * scale, -20 * scale, 5 * scale);
        graphics.fillTriangle(15 * scale, -5 * scale, 25 * scale, -10 * scale, 20 * scale, 5 * scale);
      }
      
      // Tail
      graphics.fillStyle(0x8b4789, 1);
      graphics.fillEllipse(0, 15 * scale, 8 * scale, 12 * scale);
    }

    graphics.generateTexture('player', 60, 60);
    graphics.destroy();

    this.setTexture('player');
  }

  update(input: InputState, delta: number): void {
    if (this.hiding) {
      this.setVelocity(0, 0);
      
      // Unhide if trying to move
      if (input.up || input.down || input.left || input.right) {
        this.hiding = false;
        this.hidingInSpot = false;
        this.audioManager.playUnhide();
        this.drawPlayer();
      }
    } else {
      // Movement
      let velocityX = 0;
      let velocityY = 0;

      if (input.left) velocityX -= 1;
      if (input.right) velocityX += 1;
      if (input.up) velocityY -= 1;
      if (input.down) velocityY += 1;

      // Normalize diagonal movement
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }

      // Speed based on movement mode
      let speed = GameConfig.player.speed;
      
      // Check for glide/fly based on growth stage
      const stage = GrowthStages[this.growthStage];
      
      if (input.glide && stage.canGlide && !this.flying) {
        this.gliding = true;
        speed = GameConfig.player.glideSpeed;
      } else if (input.glide && stage.canFly) {
        this.flying = true;
        this.gliding = false;
        speed = GameConfig.player.flySpeed;
      } else {
        this.gliding = false;
        this.flying = false;
      }
      
      this.setVelocity(velocityX * speed, velocityY * speed);

      // Hide action
      if (input.hide && !this.hiding) {
        this.hiding = true;
        this.hidingInSpot = false; // Rock form, not hiding in spot
        this.audioManager.playHide();
        this.drawPlayer();
      }

      // Smoke ability
      if (input.smoke && stage.canSmoke) {
        this.useSmoke();
      }

      // Step sounds (not while gliding/flying)
      if ((velocityX !== 0 || velocityY !== 0) && !this.hiding && !this.gliding && !this.flying) {
        this.stepSoundTimer += delta;
        if (this.stepSoundTimer > 400) {
          this.audioManager.playStep();
          this.stepSoundTimer = 0;
        }
      }
    }
  }

  private useSmoke(): void {
    // Create smoke puff in front of player
    const angle = Math.random() * Math.PI * 2;
    const distance = GameConfig.player.smokeDistance;
    const smokeX = this.x + Math.cos(angle) * distance;
    const smokeY = this.y + Math.sin(angle) * distance;

    const gameScene = this.scene as any;
    if (gameScene.createSmokePuff) {
      gameScene.createSmokePuff(smokeX, smokeY);
    }

    this.audioManager.playAlert(); // Re-use alert sound for smoke
  }

  isHiding(): boolean {
    return this.hiding || this.hidingInSpot;
  }

  setHidingInSpot(hiding: boolean): void {
    this.hidingInSpot = hiding;
    if (hiding && !this.hiding) {
      this.hiding = false; // Not in rock form
    }
  }

  isGliding(): boolean {
    return this.gliding;
  }

  isFlying(): boolean {
    return this.flying;
  }

  setGrowthStage(stage: number): void {
    this.growthStage = Math.max(0, Math.min(3, stage));
    this.drawPlayer();
  }

  getGrowthStage(): number {
    return this.growthStage;
  }
}
