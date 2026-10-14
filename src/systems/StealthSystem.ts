import Phaser from 'phaser';
import { GameConfig } from '../config';
import { Player } from '../entities/Player';
import { Human } from '../entities/Human';
import { Hunter } from '../entities/Hunter';

export class StealthSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private npcs: (Human | Hunter)[];

  constructor(scene: Phaser.Scene, player: Player, npcs: (Human | Hunter)[]) {
    this.scene = scene;
    this.player = player;
    this.npcs = npcs;
  }

  update(): void {
    this.npcs.forEach(npc => {
      this.checkDetection(npc);
    });
  }

  private checkDetection(npc: Human | Hunter): void {
    if (this.player.isHiding()) {
      // Player is hidden, gradually reset NPC alert state
      const currentState = npc.getAlertState();
      if (currentState === 'chasing') {
        npc.setAlertState('alert');
      } else if (currentState === 'alert') {
        npc.setAlertState('suspicious');
      } else if (currentState === 'suspicious') {
        npc.setAlertState('idle');
      }
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      npc.x,
      npc.y
    );

    const isHunter = npc instanceof Hunter;
    const sightRange = isHunter ? GameConfig.hunter.sightRange : GameConfig.human.sightRange;
    const sightAngle = isHunter ? GameConfig.hunter.sightAngle : GameConfig.human.sightAngle;

    // Check if player is in range
    if (distance > sightRange) {
      // Out of range, gradually calm down
      const currentState = npc.getAlertState();
      if (currentState === 'chasing') {
        npc.setAlertState('alert');
      } else if (currentState === 'alert' || currentState === 'suspicious') {
        npc.setAlertState('idle');
      }
      return;
    }

    // Check if player is in sight cone
    const angleToPlayer = Phaser.Math.Angle.Between(npc.x, npc.y, this.player.x, this.player.y);
    const facingAngle = npc.getFacingAngle();
    const angleDiff = Phaser.Math.Angle.Wrap(angleToPlayer - facingAngle);
    const halfSightAngle = (sightAngle * Math.PI / 180) / 2;

    if (Math.abs(angleDiff) > halfSightAngle) {
      // Player not in sight cone
      const currentState = npc.getAlertState();
      if (currentState === 'chasing') {
        npc.setAlertState('alert');
      } else if (currentState === 'alert') {
        npc.setAlertState('suspicious');
      } else if (currentState === 'suspicious') {
        npc.setAlertState('idle');
      }
      return;
    }

    // Player is in sight cone - escalate alert
    const currentState = npc.getAlertState();
    
    // Closer = faster escalation
    const normalizedDistance = distance / sightRange;
    
    if (normalizedDistance < 0.3) {
      // Very close - immediate chase
      npc.setAlertState('chasing');
      
      // Check if caught
      if (isHunter && distance < GameConfig.hunter.catchDistance) {
        const gameScene = this.scene as any;
        if (gameScene.handleCaught) {
          gameScene.handleCaught();
        }
      }
    } else if (normalizedDistance < 0.6) {
      // Medium distance - alert
      if (currentState === 'idle' || currentState === 'suspicious') {
        npc.setAlertState('alert');
      } else if (currentState === 'alert') {
        npc.setAlertState('chasing');
      }
    } else {
      // Far but visible - suspicious
      if (currentState === 'idle') {
        npc.setAlertState('suspicious');
      }
    }
  }

  reset(): void {
    this.npcs.forEach(npc => {
      npc.setAlertState('idle');
    });
  }
}
