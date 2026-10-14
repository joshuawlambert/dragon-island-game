import Phaser from 'phaser';
import { GameState } from '../types';
import { GameConfig, GrowthStages } from '../config';

export class HUD {
  private container: Phaser.GameObjects.Container;
  private dayText: Phaser.GameObjects.Text;
  private timeText: Phaser.GameObjects.Text;
  private hungerBar: Phaser.GameObjects.Graphics;
  private hungerText: Phaser.GameObjects.Text;
  private stageText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, gameState: GameState) {
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    // Background panel
    const panel = scene.add.graphics();
    panel.fillStyle(0x000000, 0.6);
    panel.fillRoundedRect(10, 10, 300, 140, 8);
    this.container.add(panel);

    // Day counter
    this.dayText = scene.add.text(20, 20, `Day ${gameState.currentDay}`, {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold'
    });
    this.container.add(this.dayText);

    // Time display
    this.timeText = scene.add.text(20, 50, '8:00 AM', {
      fontSize: '18px',
      color: '#a8dadc'
    });
    this.container.add(this.timeText);

    // Hunger label
    const hungerLabel = scene.add.text(20, 80, '🍖 Hunger:', {
      fontSize: '16px',
      color: '#fff'
    });
    this.container.add(hungerLabel);

    // Hunger bar background
    const hungerBg = scene.add.graphics();
    hungerBg.fillStyle(0x333333, 1);
    hungerBg.fillRoundedRect(20, 100, 200, 20, 4);
    this.container.add(hungerBg);

    // Hunger bar (foreground)
    this.hungerBar = scene.add.graphics();
    this.container.add(this.hungerBar);

    // Hunger text
    this.hungerText = scene.add.text(230, 100, '100', {
      fontSize: '16px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0, 0);
    this.container.add(this.hungerText);

    // Growth stage
    const stage = GrowthStages[gameState.growthStage];
    this.stageText = scene.add.text(20, 130, `🐉 ${stage.name}`, {
      fontSize: '14px',
      color: '#9b5799'
    });
    this.container.add(this.stageText);

    // Initial update
    this.updateHunger(gameState.hunger);
  }

  updateDay(day: number): void {
    this.dayText.setText(`Day ${day}`);
  }

  updateTime(timeString: string): void {
    this.timeText.setText(timeString);
  }

  updateHunger(hunger: number): void {
    const maxHunger = GameConfig.player.maxHunger;
    const percent = Math.max(0, Math.min(1, hunger / maxHunger));
    
    this.hungerBar.clear();
    
    // Color based on hunger level
    let color = 0x4caf50; // Green
    if (percent < 0.3) {
      color = 0xf44336; // Red
    } else if (percent < 0.6) {
      color = 0xff9800; // Orange
    }
    
    this.hungerBar.fillStyle(color, 1);
    this.hungerBar.fillRoundedRect(20, 100, 200 * percent, 20, 4);
    
    this.hungerText.setText(Math.floor(hunger).toString());
  }

  updateGrowthStage(stageIndex: number): void {
    const stage = GrowthStages[stageIndex];
    this.stageText.setText(`🐉 ${stage.name}`);
  }

  destroy(): void {
    this.container.destroy();
  }
}
