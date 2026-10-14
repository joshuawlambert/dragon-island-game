import Phaser from 'phaser';
import { SaveManager } from '../utils/SaveManager';

export class TitleScene extends Phaser.Scene {
  private saveManager: SaveManager;

  constructor() {
    super({ key: 'TitleScene' });
    this.saveManager = SaveManager.getInstance();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2d5f6f, 0x2d5f6f, 0x1a3a47, 0x1a3a47, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative elements
    this.addFloatingIslands();
    this.addStars();

    // Title
    this.add.text(width / 2, height * 0.25, '🐉 Dragon Island', {
      fontSize: '64px',
      color: '#fff',
      fontStyle: 'bold',
      stroke: '#2d5f6f',
      strokeThickness: 8,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.35, 'A Cozy Stealth Adventure', {
      fontSize: '24px',
      color: '#a8dadc',
    }).setOrigin(0.5);

    // Check for saved game
    const hasSave = this.saveManager.hasSave();

    let yOffset = height * 0.55;

    if (hasSave) {
      this.createButton(width / 2, yOffset, 'Continue', () => {
        this.scene.start('GameScene', { continue: true });
      });
      yOffset += 80;
    }

    this.createButton(width / 2, yOffset, 'New Game', () => {
      if (hasSave) {
        this.showConfirmNewGame();
      } else {
        this.startNewGame();
      }
    });

    yOffset += 80;

    // Instructions
    this.add.text(width / 2, height - 100, 
      'Desktop: WASD/Arrows to move, Space to hide\nTouch: Virtual joystick and buttons', {
      fontSize: '16px',
      color: '#a8dadc',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    // Credits
    this.add.text(width / 2, height - 30, 
      'Made with Phaser 3 · Sound via WebAudio API', {
      fontSize: '12px',
      color: '#778899',
      align: 'center'
    }).setOrigin(0.5);
  }

  private addFloatingIslands(): void {
    const width = this.cameras.main.width;

    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = 100 + Math.random() * 200;
      const island = this.add.graphics();
      
      // Simple island shape
      island.fillStyle(0x3a7f8f, 0.3);
      island.fillEllipse(0, 0, 80 + Math.random() * 40, 40 + Math.random() * 20);
      island.fillStyle(0x2d6f5f, 0.3);
      island.fillEllipse(0, -10, 60 + Math.random() * 30, 30 + Math.random() * 15);
      
      island.setPosition(x, y);

      // Gentle floating animation
      this.tweens.add({
        targets: island,
        y: y + 20,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private addStars(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.5;
      const star = this.add.graphics();
      star.fillStyle(0xffffff, 0.6);
      star.fillCircle(0, 0, 2);
      star.setPosition(x, y);

      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x4a90a4, 1);
    bg.fillRoundedRect(-120, -30, 240, 60, 16);
    bg.lineStyle(3, 0xffffff, 0.8);
    bg.strokeRoundedRect(-120, -30, 240, 60, 16);

    const label = this.add.text(0, 0, text, {
      fontSize: '28px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(240, 60);
    button.setInteractive(new Phaser.Geom.Rectangle(-120, -30, 240, 60), Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x5aa0b4, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 16);
      bg.lineStyle(3, 0xffffff, 1);
      bg.strokeRoundedRect(-120, -30, 240, 60, 16);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a90a4, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 16);
      bg.lineStyle(3, 0xffffff, 0.8);
      bg.strokeRoundedRect(-120, -30, 240, 60, 16);
    });

    button.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(0x3a7f94, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 16);
      bg.lineStyle(3, 0xffffff, 0.8);
      bg.strokeRoundedRect(-120, -30, 240, 60, 16);
      label.setScale(0.95);
    });

    button.on('pointerup', () => {
      bg.clear();
      bg.fillStyle(0x5aa0b4, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 16);
      bg.lineStyle(3, 0xffffff, 1);
      bg.strokeRoundedRect(-120, -30, 240, 60, 16);
      label.setScale(1);
      callback();
    });
  }

  private showConfirmNewGame(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    const panel = this.add.graphics();
    panel.fillStyle(0x2d5f6f, 1);
    panel.fillRoundedRect(width / 2 - 250, height / 2 - 150, 500, 300, 16);
    panel.lineStyle(4, 0xffffff, 0.8);
    panel.strokeRoundedRect(width / 2 - 250, height / 2 - 150, 500, 300, 16);
    panel.setDepth(1001);

    const warningText = this.add.text(width / 2, height / 2 - 80, 
      '⚠️ Start New Game?', {
      fontSize: '32px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1002);

    const confirmText = this.add.text(width / 2, height / 2 - 20, 
      'This will erase your current progress.\nAre you sure?', {
      fontSize: '20px',
      color: '#a8dadc',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(1002);

    const closeDialog = () => {
      overlay.destroy();
      panel.destroy();
      warningText.destroy();
      confirmText.destroy();
    };

    this.createButton(width / 2 - 100, height / 2 + 80, 'Yes', () => {
      closeDialog();
      this.startNewGame();
    });

    this.createButton(width / 2 + 100, height / 2 + 80, 'No', () => {
      closeDialog();
    });
  }

  private startNewGame(): void {
    this.saveManager.clearSave();
    this.scene.start('HomeSelectionScene');
  }
}
