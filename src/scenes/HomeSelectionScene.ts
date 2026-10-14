import Phaser from 'phaser';
import { HomeTypes } from '../config';
import { SaveManager } from '../utils/SaveManager';
import { HomeType } from '../types';

export class HomeSelectionScene extends Phaser.Scene {
  private saveManager: SaveManager;

  constructor() {
    super({ key: 'HomeSelectionScene' });
    this.saveManager = SaveManager.getInstance();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2d5f6f, 0x2d5f6f, 0x1a3a47, 0x1a3a47, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 80, 'Choose Your Home', {
      fontSize: '48px',
      color: '#fff',
      fontStyle: 'bold',
      stroke: '#2d5f6f',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Description
    this.add.text(width / 2, 150, 
      'Where will you make your nest?', {
      fontSize: '20px',
      color: '#a8dadc',
    }).setOrigin(0.5);

    // Home options
    const homes: { key: HomeType; icon: string; title: string; description: string }[] = [
      {
        key: 'MOUNTAIN_CAVE',
        icon: '⛰️',
        title: 'Mountain Cave',
        description: 'High peaks with a view.\nFar from humans.'
      },
      {
        key: 'HILLSIDE_CAVE',
        icon: '🏔️',
        title: 'Hillside Cave',
        description: 'Between mountain and forest.\nBalanced location.'
      },
      {
        key: 'FOREST_HOLLOW',
        icon: '🌲',
        title: 'Forest Hollow',
        description: 'Deep in the woods.\nClose to food and water.'
      }
    ];

    const startX = width / 2 - 320;
    const y = height / 2 + 50;

    homes.forEach((home, index) => {
      const x = startX + index * 320;
      this.createHomeCard(x, y, home.icon, home.title, home.description, () => {
        this.selectHome(home.key);
      });
    });
  }

  private createHomeCard(
    x: number,
    y: number,
    icon: string,
    title: string,
    description: string,
    callback: () => void
  ): void {
    const card = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x3a7f8f, 1);
    bg.fillRoundedRect(-120, -140, 240, 280, 12);
    bg.lineStyle(3, 0xffffff, 0.6);
    bg.strokeRoundedRect(-120, -140, 240, 280, 12);

    const iconText = this.add.text(0, -80, icon, {
      fontSize: '72px',
    }).setOrigin(0.5);

    const titleText = this.add.text(0, 0, title, {
      fontSize: '22px',
      color: '#fff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    const descText = this.add.text(0, 60, description, {
      fontSize: '16px',
      color: '#a8dadc',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);

    card.add([bg, iconText, titleText, descText]);
    card.setSize(240, 280);
    card.setInteractive(new Phaser.Geom.Rectangle(-120, -140, 240, 280), Phaser.Geom.Rectangle.Contains);

    card.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x4a90a4, 1);
      bg.fillRoundedRect(-120, -140, 240, 280, 12);
      bg.lineStyle(4, 0xffffff, 0.9);
      bg.strokeRoundedRect(-120, -140, 240, 280, 12);
      card.setScale(1.05);
    });

    card.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x3a7f8f, 1);
      bg.fillRoundedRect(-120, -140, 240, 280, 12);
      bg.lineStyle(3, 0xffffff, 0.6);
      bg.strokeRoundedRect(-120, -140, 240, 280, 12);
      card.setScale(1);
    });

    card.on('pointerdown', () => {
      card.setScale(1.02);
    });

    card.on('pointerup', () => {
      card.setScale(1.05);
      callback();
    });
  }

  private selectHome(homeType: HomeType): void {
    const state = this.saveManager.getDefaultState();
    state.playerHome = homeType;
    const homeData = HomeTypes[homeType];
    state.currentX = homeData.x;
    state.currentY = homeData.y;
    this.saveManager.save(state);
    
    // Start game with tutorial
    this.scene.start('GameScene', { tutorial: true });
  }
}
