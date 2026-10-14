import Phaser from 'phaser';
import { InputState } from '../types';

export class InputManager {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private eKey: Phaser.Input.Keyboard.Key | null = null;
  private shiftKey: Phaser.Input.Keyboard.Key | null = null;
  private qKey: Phaser.Input.Keyboard.Key | null = null;
  
  // Touch controls
  private joystick: Phaser.GameObjects.Container | null = null;
  private joystickBase: Phaser.GameObjects.Graphics | null = null;
  private joystickThumb: Phaser.GameObjects.Graphics | null = null;
  private joystickActive = false;
  private joystickDX = 0;
  private joystickDY = 0;
  private joystickPointer: number | null = null;
  
  private hideButton: Phaser.GameObjects.Container | null = null;
  private hideButtonPressed = false;
  private hideButtonPointer: number | null = null;
  
  private interactButton: Phaser.GameObjects.Container | null = null;
  private interactButtonPressed = false;
  private interactButtonPointer: number | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
  }

  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) return;
    
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.eKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.qKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }

  setupTouchControls(_camera: Phaser.Cameras.Scene2D.Camera): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    // Virtual joystick (bottom left)
    this.joystick = this.scene.add.container(120, height - 120).setScrollFactor(0).setDepth(1000);
    
    this.joystickBase = this.scene.add.graphics()
      .fillStyle(0x000000, 0.3)
      .fillCircle(0, 0, 60)
      .lineStyle(3, 0xffffff, 0.5)
      .strokeCircle(0, 0, 60);
    
    this.joystickThumb = this.scene.add.graphics()
      .fillStyle(0xffffff, 0.6)
      .fillCircle(0, 0, 30);
    
    this.joystick.add([this.joystickBase, this.joystickThumb]);
    this.joystick.setInteractive(new Phaser.Geom.Circle(0, 0, 60), Phaser.Geom.Circle.Contains);

    // Hide button (bottom right)
    this.hideButton = this.scene.add.container(width - 100, height - 120).setScrollFactor(0).setDepth(1000);
    
    const hideButtonBg = this.scene.add.graphics()
      .fillStyle(0x4a90a4, 0.8)
      .fillCircle(0, 0, 50)
      .lineStyle(3, 0xffffff, 0.7)
      .strokeCircle(0, 0, 50);
    
    const hideButtonText = this.scene.add.text(0, 0, '🪨', {
      fontSize: '32px',
      align: 'center'
    }).setOrigin(0.5);
    
    this.hideButton.add([hideButtonBg, hideButtonText]);
    this.hideButton.setSize(100, 100);
    this.hideButton.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);

    // Interact button (above hide button)
    this.interactButton = this.scene.add.container(width - 100, height - 220).setScrollFactor(0).setDepth(1000);
    
    const interactButtonBg = this.scene.add.graphics()
      .fillStyle(0x6ab04c, 0.8)
      .fillCircle(0, 0, 45)
      .lineStyle(3, 0xffffff, 0.7)
      .strokeCircle(0, 0, 45);
    
    const interactButtonText = this.scene.add.text(0, 0, '👋', {
      fontSize: '28px',
      align: 'center'
    }).setOrigin(0.5);
    
    this.interactButton.add([interactButtonBg, interactButtonText]);
    this.interactButton.setSize(90, 90);
    this.interactButton.setInteractive(new Phaser.Geom.Circle(0, 0, 45), Phaser.Geom.Circle.Contains);

    this.setupTouchEvents();
  }

  private setupTouchEvents(): void {
    // Joystick events
    this.joystick?.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.joystickActive = true;
      this.joystickPointer = pointer.id;
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && pointer.id === this.joystickPointer && this.joystick) {
        const local = this.joystick.getLocalPoint(pointer.x, pointer.y);
        const dx = local.x;
        const dy = local.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 40;

        if (distance > maxDistance) {
          this.joystickDX = (dx / distance) * maxDistance;
          this.joystickDY = (dy / distance) * maxDistance;
        } else {
          this.joystickDX = dx;
          this.joystickDY = dy;
        }

        this.joystickThumb?.setPosition(this.joystickDX, this.joystickDY);
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.joystickPointer) {
        this.joystickActive = false;
        this.joystickPointer = null;
        this.joystickDX = 0;
        this.joystickDY = 0;
        this.joystickThumb?.setPosition(0, 0);
      }
      
      if (pointer.id === this.hideButtonPointer) {
        this.hideButtonPressed = false;
        this.hideButtonPointer = null;
      }
      
      if (pointer.id === this.interactButtonPointer) {
        this.interactButtonPressed = false;
        this.interactButtonPointer = null;
      }
    });

    // Hide button events
    this.hideButton?.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.hideButtonPressed = true;
      this.hideButtonPointer = pointer.id;
    });

    // Interact button events
    this.interactButton?.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.interactButtonPressed = true;
      this.interactButtonPointer = pointer.id;
    });
  }

  getInputState(): InputState {
    const keyboard = this.getKeyboardInput();
    const touch = this.getTouchInput();

    return {
      up: keyboard.up || touch.up,
      down: keyboard.down || touch.down,
      left: keyboard.left || touch.left,
      right: keyboard.right || touch.right,
      hide: keyboard.hide || touch.hide,
      interact: keyboard.interact || touch.interact,
      glide: keyboard.glide || touch.glide,
      smoke: keyboard.smoke || touch.smoke,
    };
  }

  private getKeyboardInput(): InputState {
    return {
      up: this.cursors?.up.isDown || this.wasd?.W.isDown || false,
      down: this.cursors?.down.isDown || this.wasd?.S.isDown || false,
      left: this.cursors?.left.isDown || this.wasd?.A.isDown || false,
      right: this.cursors?.right.isDown || this.wasd?.D.isDown || false,
      hide: Phaser.Input.Keyboard.JustDown(this.spaceKey!) || false,
      interact: Phaser.Input.Keyboard.JustDown(this.eKey!) || false,
      glide: this.shiftKey?.isDown || false,
      smoke: Phaser.Input.Keyboard.JustDown(this.qKey!) || false,
    };
  }

  private getTouchInput(): InputState {
    const threshold = 10;
    const hideJustPressed = this.hideButtonPressed;
    const interactJustPressed = this.interactButtonPressed;
    
    // Reset one-frame buttons
    if (this.hideButtonPressed) {
      this.hideButtonPressed = false;
    }
    if (this.interactButtonPressed) {
      this.interactButtonPressed = false;
    }

    return {
      up: this.joystickDY < -threshold,
      down: this.joystickDY > threshold,
      left: this.joystickDX < -threshold,
      right: this.joystickDX > threshold,
      hide: hideJustPressed,
      interact: interactJustPressed,
      glide: false, // TODO: Add touch button for glide if needed
      smoke: false, // TODO: Add touch button for smoke if needed
    };
  }

  destroy(): void {
    this.joystick?.destroy();
    this.hideButton?.destroy();
    this.interactButton?.destroy();
  }
}
