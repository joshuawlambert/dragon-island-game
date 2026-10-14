import Phaser from 'phaser';

export class DialogBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private textObject: Phaser.GameObjects.Text | null = null;
  private button: Phaser.GameObjects.Container | null = null;
  private currentCallback: (() => void) | null = null;
  private isShowing = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(text: string, callback: () => void): void {
    if (this.isShowing) {
      this.hide();
    }

    this.isShowing = true;
    this.currentCallback = callback;

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(2000);

    // Semi-transparent overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    this.container.add(overlay);

    // Dialog box
    const boxWidth = Math.min(600, width - 40);
    const boxHeight = 200;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const box = this.scene.add.graphics();
    box.fillStyle(0x2d5f6f, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(4, 0x4a90a4, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    this.container.add(box);

    // Text
    this.textObject = this.scene.add.text(width / 2, height / 2 - 20, text, {
      fontSize: '18px',
      color: '#fff',
      align: 'center',
      wordWrap: { width: boxWidth - 40 },
      lineSpacing: 8
    }).setOrigin(0.5);
    this.container.add(this.textObject);

    // Continue prompt
    const continueText = this.scene.add.text(width / 2, height / 2 + 70, 'Click anywhere to continue', {
      fontSize: '14px',
      color: '#a8dadc',
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(continueText);

    // Make overlay clickable
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.once('pointerdown', () => {
      this.hide();
      if (this.currentCallback) {
        this.currentCallback();
      }
    });

    // Fade in animation
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }

  showWithButton(text: string, buttonText: string, callback: () => void): void {
    if (this.isShowing) {
      this.hide();
    }

    this.isShowing = true;
    this.currentCallback = callback;

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(2000);

    // Semi-transparent overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    this.container.add(overlay);

    // Dialog box
    const boxWidth = Math.min(600, width - 40);
    const boxHeight = 250;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const box = this.scene.add.graphics();
    box.fillStyle(0x2d5f6f, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(4, 0x4a90a4, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    this.container.add(box);

    // Text
    this.textObject = this.scene.add.text(width / 2, height / 2 - 40, text, {
      fontSize: '18px',
      color: '#fff',
      align: 'center',
      wordWrap: { width: boxWidth - 40 },
      lineSpacing: 8
    }).setOrigin(0.5);
    this.container.add(this.textObject);

    // Button
    this.button = this.createButton(width / 2, height / 2 + 70, buttonText, () => {
      this.hide();
      if (this.currentCallback) {
        this.currentCallback();
      }
    });
    this.container.add(this.button);

    // Fade in animation
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x4a90a4, 1);
    bg.fillRoundedRect(-100, -25, 200, 50, 12);
    bg.lineStyle(3, 0xffffff, 0.8);
    bg.strokeRoundedRect(-100, -25, 200, 50, 12);

    const label = this.scene.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(200, 50);
    button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x5aa0b4, 1);
      bg.fillRoundedRect(-100, -25, 200, 50, 12);
      bg.lineStyle(3, 0xffffff, 1);
      bg.strokeRoundedRect(-100, -25, 200, 50, 12);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a90a4, 1);
      bg.fillRoundedRect(-100, -25, 200, 50, 12);
      bg.lineStyle(3, 0xffffff, 0.8);
      bg.strokeRoundedRect(-100, -25, 200, 50, 12);
    });

    button.on('pointerdown', () => {
      label.setScale(0.95);
    });

    button.on('pointerup', () => {
      label.setScale(1);
      callback();
    });

    return button;
  }

  hide(): void {
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.container?.destroy();
          this.container = null;
          this.textObject = null;
          this.button = null;
          this.isShowing = false;
        }
      });
    }
  }

  isVisible(): boolean {
    return this.isShowing;
  }
}
