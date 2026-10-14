import Phaser from 'phaser';
import { GameConfig } from '../config';
import { Player } from '../entities/Player';
import { Human } from '../entities/Human';
import { Hunter } from '../entities/Hunter';

export class StealthSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private npcs: (Human | Hunter)[];
  private lastSeenPositions: Map<Human | Hunter, { x: number; y: number; time: number }> = new Map();
  private searchMarkers: Map<Human | Hunter, Phaser.GameObjects.Graphics> = new Map();

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
    let alertState = npc.getAlertState();
    
    if (this.player.isHiding()) {
      // Player is hidden
      if (alertState === 'chasing' || alertState === 'alert') {
        // Remember where we last saw them
        if (!this.lastSeenPositions.has(npc)) {
          this.lastSeenPositions.set(npc, { x: this.player.x, y: this.player.y, time: Date.now() });
          this.createSearchMarker(npc, this.player.x, this.player.y);
        }
      }
      
      // Gradually reset NPC alert state
      if (alertState === 'chasing') {
        npc.setAlertState('alert');
      } else if (alertState === 'alert') {
        npc.setAlertState('suspicious');
      } else if (alertState === 'suspicious') {
        npc.setAlertState('idle');
        this.clearSearchMarker(npc);
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
      alertState = npc.getAlertState();
      if (alertState === 'chasing') {
        npc.setAlertState('alert');
      } else if (alertState === 'alert' || alertState === 'suspicious') {
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
      alertState = npc.getAlertState();
      if (alertState === 'chasing') {
        npc.setAlertState('alert');
      } else if (alertState === 'alert') {
        npc.setAlertState('suspicious');
      } else if (alertState === 'suspicious') {
        npc.setAlertState('idle');
      }
      return;
    }

    // Player is in sight cone - escalate alert
    alertState = npc.getAlertState();
    
    // Closer = faster escalation
    const normalizedDistance = distance / sightRange;
    const currentAlertState = alertState;
    
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
      if (currentAlertState === 'idle' || currentAlertState === 'suspicious') {
        npc.setAlertState('alert');
      } else if (currentAlertState === 'alert') {
        npc.setAlertState('chasing');
      }
    } else {
      // Far but visible - suspicious
      if (currentAlertState === 'idle') {
        npc.setAlertState('suspicious');
      }
    }
  }

  private createSearchMarker(npc: Human | Hunter, x: number, y: number): void {
    const marker = this.scene.add.graphics();
    marker.lineStyle(3, 0xffeb3b, 0.6);
    marker.strokeCircle(x, y, 30);
    marker.strokeCircle(x, y, 40);
    marker.setDepth(3);
    
    this.searchMarkers.set(npc, marker);
  }

  private clearSearchMarker(npc: Human | Hunter): void {
    const marker = this.searchMarkers.get(npc);
    if (marker) {
      marker.destroy();
      this.searchMarkers.delete(npc);
    }
    this.lastSeenPositions.delete(npc);
  }

  reset(): void {
    this.npcs.forEach(npc => {
      npc.setAlertState('idle');
      this.clearSearchMarker(npc);
    });
  }
  
  destroy(): void {
    this.searchMarkers.forEach(marker => marker.destroy());
    this.searchMarkers.clear();
    this.lastSeenPositions.clear();
  }
}
