import Phaser from 'phaser';
import { GameConfig } from '../config';
import { Player } from '../entities/Player';
import { AudioManager } from '../utils/AudioManager';
import { FishingMiniGame } from '../ui/FishingMiniGame';

interface Collectible {
  sprite: Phaser.GameObjects.Graphics;
  type: 'berry' | 'fish' | 'snack' | 'treasure';
  x: number;
  y: number;
  collected: boolean;
  respawnTimer?: number;
}

export class CollectibleManager {
  private scene: Phaser.Scene;
  private player: Player;
  private audioManager: AudioManager;
  private collectibles: Collectible[] = [];
  private interactPrompt: Phaser.GameObjects.Text | null = null;
  private fishingMiniGame: FishingMiniGame | null = null;
  private currentFishingSpot: Collectible | null = null;

  constructor(scene: Phaser.Scene, player: Player, audioManager: AudioManager) {
    this.scene = scene;
    this.player = player;
    this.audioManager = audioManager;

    this.fishingMiniGame = new FishingMiniGame(scene);
    this.spawnInitialCollectibles();
    this.createInteractPrompt();
  }

  private spawnInitialCollectibles(): void {
    // Berries in forest
    for (let i = 0; i < 15; i++) {
      const x = 300 + Math.random() * 700;
      const y = 900 + Math.random() * 1000;
      this.createCollectible(x, y, 'berry');
    }

    // Fish spots at lake/river
    for (let i = 0; i < 8; i++) {
      const x = 1550 + Math.random() * 100;
      const y = 550 + Math.random() * 1200;
      this.createCollectible(x, y, 'fish');
    }

    // Snacks at camp
    for (let i = 0; i < 6; i++) {
      const x = 1500 + Math.random() * 700;
      const y = 1000 + Math.random() * 400;
      this.createCollectible(x, y, 'snack');
    }

    // Treasures scattered
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * GameConfig.worldWidth;
      const y = Math.random() * GameConfig.worldHeight;
      this.createCollectible(x, y, 'treasure');
    }
  }

  private createCollectible(x: number, y: number, type: 'berry' | 'fish' | 'snack' | 'treasure'): void {
    const graphics = this.scene.add.graphics();
    
    switch (type) {
      case 'berry':
        // Berry bush
        graphics.fillStyle(0x2d6f2d, 1);
        graphics.fillCircle(0, 0, 12);
        graphics.fillStyle(0xff1744, 1);
        graphics.fillCircle(-4, -4, 4);
        graphics.fillCircle(4, -4, 4);
        graphics.fillCircle(0, 4, 4);
        break;
        
      case 'fish':
        // Fishing spot (water ripple)
        graphics.lineStyle(2, 0x4a90e2, 1);
        graphics.strokeCircle(0, 0, 10);
        graphics.strokeCircle(0, 0, 15);
        break;
        
      case 'snack':
        // Cooler/basket
        graphics.fillStyle(0xff6b35, 1);
        graphics.fillRect(-10, -8, 20, 16);
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRect(-10, -8, 20, 16);
        break;
        
      case 'treasure':
        // Shiny object (star shape drawn manually)
        graphics.fillStyle(0xffd700, 1);
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? 8 : 4;
          const angle = (i * Math.PI * 2) / 10 - Math.PI / 2;
          points.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          });
        }
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.closePath();
        graphics.fillPath();
        break;
    }

    graphics.setPosition(x, y);
    graphics.setDepth(10);

    this.collectibles.push({
      sprite: graphics,
      type,
      x,
      y,
      collected: false
    });
  }

  private createInteractPrompt(): void {
    this.interactPrompt = this.scene.add.text(0, 0, '', {
      fontSize: '18px',
      color: '#fff',
      backgroundColor: '#000000cc',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5);
    this.interactPrompt.setDepth(1100);
    this.interactPrompt.setScrollFactor(0);
    this.interactPrompt.setVisible(false);
  }

  update(delta: number): void {
    // Update fishing mini-game
    if (this.fishingMiniGame && this.fishingMiniGame.isPlaying()) {
      this.fishingMiniGame.update(delta);
      return; // Don't process other collectibles during fishing
    }

    let nearbyCollectible: Collectible | null = null;
    let minDistance = 60;

    // Find nearest collectible
    for (const collectible of this.collectibles) {
      if (collectible.collected) continue;

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        collectible.x,
        collectible.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearbyCollectible = collectible;
      }
    }

    if (nearbyCollectible) {
      // Show prompt
      const promptText = this.getPromptText(nearbyCollectible.type);
      this.interactPrompt?.setText(promptText);
      this.interactPrompt?.setPosition(
        this.scene.scale.width / 2,
        this.scene.scale.height - 150
      );
      this.interactPrompt?.setVisible(true);

      // Auto-collect on proximity (except fish which needs mini-game)
      if (nearbyCollectible.type !== 'fish') {
        this.collect(nearbyCollectible);
      } else {
        this.startFishing(nearbyCollectible);
      }
    } else {
      this.interactPrompt?.setVisible(false);
    }

    // Update respawn timers
    this.updateRespawnTimers();
  }

  private startFishing(fishSpot: Collectible): void {
    if (this.fishingMiniGame && !this.fishingMiniGame.isPlaying() && this.currentFishingSpot !== fishSpot) {
      this.currentFishingSpot = fishSpot;
      fishSpot.collected = true;
      fishSpot.sprite.setVisible(false);

      this.fishingMiniGame.start((success) => {
        if (success) {
          const gameScene = this.scene as any;
          gameScene.feedPlayer(GameConfig.fish.hungerRestore);
          this.audioManager.playSuccess();
          if (gameScene.fishCaught !== undefined) {
            gameScene.fishCaught++;
          }
        }
        fishSpot.respawnTimer = 5000;
        this.currentFishingSpot = null;
      });
    }
  }

  private getPromptText(type: string): string {
    switch (type) {
      case 'berry':
        return '🫐 Berries - Eating...';
      case 'fish':
        return '🎣 Fishing...';
      case 'snack':
        return '🥪 Camp snack!';
      case 'treasure':
        return '✨ Shiny treasure!';
      default:
        return 'Collect';
    }
  }

  private collect(collectible: Collectible): void {
    collectible.collected = true;
    collectible.sprite.setVisible(false);
    
    this.audioManager.playPickup();

    const gameScene = this.scene as any;

    switch (collectible.type) {
      case 'berry':
        gameScene.feedPlayer(GameConfig.berry.hungerRestore);
        collectible.respawnTimer = GameConfig.berry.respawnTime;
        break;
        
      case 'fish':
        // Handled by mini-game now
        break;
        
      case 'snack':
        gameScene.feedPlayer(GameConfig.snack.hungerRestore);
        collectible.respawnTimer = 60000; // 1 minute
        if (gameScene.campSnacksEaten !== undefined) {
          gameScene.campSnacksEaten++;
        }
        break;
        
      case 'treasure':
        // Treasures don't respawn
        const treasureId = `treasure_${collectible.x}_${collectible.y}`;
        if (!gameScene.getGameState().treasures.includes(treasureId)) {
          gameScene.getGameState().treasures.push(treasureId);
          
          // Auto-decorate home
          if (gameScene.getGameState().homeDecorations.length < gameScene.getGameState().treasures.length) {
            gameScene.getGameState().homeDecorations.push(treasureId);
          }
        }
        break;
    }
  }

  private updateRespawnTimers(): void {
    for (const collectible of this.collectibles) {
      if (collectible.collected && collectible.respawnTimer !== undefined) {
        collectible.respawnTimer -= this.scene.game.loop.delta;
        
        if (collectible.respawnTimer <= 0) {
          collectible.collected = false;
          collectible.sprite.setVisible(true);
          collectible.respawnTimer = undefined;
        }
      }
    }
  }

  respawnAll(): void {
    for (const collectible of this.collectibles) {
      if (collectible.type !== 'treasure') {
        collectible.collected = false;
        collectible.sprite.setVisible(true);
        collectible.respawnTimer = undefined;
      }
    }
  }
}
