import Phaser from 'phaser';
import { GameConfig, HomeTypes, GrowthStages } from '../config';
import { SaveManager } from '../utils/SaveManager';
import { InputManager } from '../utils/InputManager';
import { AudioManager } from '../utils/AudioManager';
import { MusicManager } from '../utils/MusicManager';
import { GameState } from '../types';
import { Player } from '../entities/Player';
import { Human } from '../entities/Human';
import { Hunter } from '../entities/Hunter';
import { WorldGenerator } from '../systems/WorldGenerator';
import { StealthSystem } from '../systems/StealthSystem';
import { DayNightSystem } from '../systems/DayNightSystem';
import { CollectibleManager } from '../systems/CollectibleManager';
import { QuestSystem } from '../systems/QuestSystem';
import { HidingSpotManager } from '../systems/HidingSpotManager';
import { HUD } from '../ui/HUD';
import { DialogBox } from '../ui/DialogBox';

export class GameScene extends Phaser.Scene {
  private saveManager: SaveManager;
  private inputManager!: InputManager;
  private audioManager!: AudioManager;
  private musicManager!: MusicManager;
  private worldGenerator!: WorldGenerator;
  private stealthSystem!: StealthSystem;
  private dayNightSystem!: DayNightSystem;
  private collectibleManager!: CollectibleManager;
  private questSystem!: QuestSystem;
  private hidingSpotManager!: HidingSpotManager;
  private hud!: HUD;
  private dialogBox!: DialogBox;

  private gameState!: GameState;
  private player!: Player;
  private humans: Human[] = [];
  private hunter!: Hunter;
  
  private isTutorial = false;
  private tutorialStep = 0;
  private isAtHome = false;
  private homeZone!: Phaser.GameObjects.Zone;
  private sleeping = false;
  private nearQuestGiver: string | null = null;
  
  // Quest tracking
  public fishCaught = 0;
  public campSnacksEaten = 0;
  public successfulHides = 0;
  public hasBeenOutAtNight = false;

  constructor() {
    super({ key: 'GameScene' });
    this.saveManager = SaveManager.getInstance();
  }

  init(data: { continue?: boolean; tutorial?: boolean }): void {
    if (data.continue) {
      const loaded = this.saveManager.load();
      this.gameState = loaded || this.saveManager.getDefaultState();
    } else {
      const loaded = this.saveManager.load();
      this.gameState = loaded || this.saveManager.getDefaultState();
    }

    this.isTutorial = data.tutorial || false;
  }

  create(): void {
    // Initialize managers
    this.audioManager = new AudioManager(this);
    this.musicManager = new MusicManager();
    this.inputManager = new InputManager(this);
    
    // Start background music
    this.musicManager.startBackgroundMusic();
    
    // Create world
    this.worldGenerator = new WorldGenerator(this);
    this.worldGenerator.generateWorld();

    // Create hiding spots
    this.hidingSpotManager = new HidingSpotManager(this);

    // Setup camera
    this.cameras.main.setBounds(0, 0, GameConfig.worldWidth, GameConfig.worldHeight);
    this.cameras.main.setZoom(1);

    // Create player
    this.player = new Player(
      this,
      this.gameState.currentX,
      this.gameState.currentY,
      this.audioManager
    );
    this.player.setGrowthStage(this.gameState.growthStage);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Create home zone
    const homeData = HomeTypes[this.gameState.playerHome!];
    this.homeZone = this.add.zone(homeData.x, homeData.y, 120, 120);
    this.physics.world.enable(this.homeZone);

    // Create NPCs
    this.spawnNPCs();

    // Initialize systems
    this.stealthSystem = new StealthSystem(this, this.player, [...this.humans, this.hunter]);
    this.dayNightSystem = new DayNightSystem(this, this.gameState.currentDay);
    this.collectibleManager = new CollectibleManager(this, this.player, this.audioManager);
    this.questSystem = new QuestSystem(this, this.audioManager);

    // Initialize active quest if none set
    if (!this.gameState.activeQuest) {
      const firstQuest = this.questSystem.getAvailableQuest(this.gameState);
      if (firstQuest) {
        this.gameState.activeQuest = firstQuest.id;
      }
    }

    // Setup touch controls
    this.inputManager.setupTouchControls(this.cameras.main);

    // Create UI
    this.hud = new HUD(this, this.gameState);
    this.dialogBox = new DialogBox(this);

    // Tutorial
    if (this.isTutorial) {
      this.startTutorial();
    }

    // Update loop
    this.setupUpdateLoop();
  }

  private spawnNPCs(): void {
    // Spawn humans in village/camp area (center-right)
    for (let i = 0; i < 5; i++) {
      const x = 1600 + Math.random() * 800;
      const y = 1000 + Math.random() * 400;
      this.humans.push(new Human(this, x, y, this.audioManager));
    }

    // Spawn hunter
    this.hunter = new Hunter(this, 2000, 800, this.audioManager);
  }

  private setupUpdateLoop(): void {
    // Hunger decay
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.sleeping) {
          this.gameState.hunger = Math.max(0, this.gameState.hunger - GameConfig.player.hungerDecayRate);
          this.hud.updateHunger(this.gameState.hunger);
          
          if (this.gameState.hunger <= 0) {
            this.handleStarving();
          }
        }
      },
      loop: true
    });

    // Check if at home
    this.time.addEvent({
      delay: 100,
      callback: () => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.homeZone.x,
          this.homeZone.y
        );
        this.isAtHome = distance < 60;
      },
      loop: true
    });

    // Auto-save
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (!this.sleeping) {
          this.autoSave();
        }
      },
      loop: true
    });
  }

  update(_time: number, delta: number): void {
    if (this.sleeping) return;

    // Get input
    const input = this.inputManager.getInputState();

    // Update player
    this.player.update(input, delta);

    // Check hiding spots
    const hidingSpot = this.hidingSpotManager.checkPlayerInHidingSpot(this.player);
    if (hidingSpot && input.hide) {
      this.player.setHidingInSpot(true);
      // Track successful hides when NPCs are nearby
      const nearbyNPC = [...this.humans, this.hunter].some(npc => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
        return dist < 150 && npc.getAlertState() !== 'idle';
      });
      if (nearbyNPC) {
        this.successfulHides++;
      }
    } else if (!hidingSpot) {
      this.player.setHidingInSpot(false);
    }

    // Update NPCs
    this.humans.forEach(human => human.update(delta));
    this.hunter.update(delta, this.player);

    // Update systems
    this.stealthSystem.update();
    this.dayNightSystem.update(delta);
    this.collectibleManager.update(delta);

    // Check for night time
    if (!this.hasBeenOutAtNight && !this.dayNightSystem.isDaytime()) {
      this.hasBeenOutAtNight = true;
    }

    // Update quest system
    this.questSystem.showQuestIndicators(this.gameState);
    const activeQuest = this.questSystem.getAvailableQuest(this.gameState);
    if (activeQuest) {
      this.hud.updateQuest(activeQuest.title);
    } else {
      this.hud.updateQuest('');
    }
    
    // Check quest giver proximity
    const nearGiver = this.questSystem.checkNearQuestGiver(this.player.x, this.player.y);
    this.nearQuestGiver = nearGiver ? nearGiver.giver : null;

    // Quest giver interaction
    if (this.nearQuestGiver && input.interact) {
      this.showQuestDialog();
    }

    // Check home interaction
    if (this.isAtHome && input.interact && !this.nearQuestGiver) {
      this.showHomeDialog();
    }

    // Update HUD with time
    this.hud.updateTime(this.dayNightSystem.getTimeString());

    // Tutorial updates
    if (this.isTutorial) {
      this.updateTutorial(input);
    }
  }

  createSmokePuff(x: number, y: number): void {
    const smoke = this.add.graphics();
    smoke.fillStyle(0xcccccc, 0.6);
    smoke.fillCircle(0, 0, 30);
    smoke.fillStyle(0xffffff, 0.4);
    smoke.fillCircle(-10, -10, 20);
    smoke.fillCircle(10, 10, 20);
    smoke.setPosition(x, y);
    smoke.setDepth(100);

    // Fade and expand
    this.tweens.add({
      targets: smoke,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: GameConfig.player.smokeDuration,
      onComplete: () => smoke.destroy()
    });

    // NPCs will be distracted by this position
    this.humans.forEach(human => {
      const dist = Phaser.Math.Distance.Between(human.x, human.y, x, y);
      if (dist < 200) {
        human.setAlertState('suspicious');
      }
    });
  }

  private showQuestDialog(): void {
    const activeQuest = this.questSystem.getAvailableQuest(this.gameState);
    if (!activeQuest) {
      this.dialogBox.show(`${this.nearQuestGiver}: You've completed all my quests! Great job!`, () => {});
      return;
    }

    const isComplete = activeQuest.checkComplete(this.gameState, this);

    if (isComplete && !this.gameState.completedQuests.includes(activeQuest.id)) {
      // Complete the quest
      this.questSystem.completeQuest(activeQuest.id, this.gameState);
      this.dialogBox.show(
        `${activeQuest.giver}: ${activeQuest.reward}`,
        () => {
          const nextQuest = this.questSystem.getAvailableQuest(this.gameState);
          if (nextQuest) {
            this.dialogBox.show(
              `${nextQuest.giver}: ${nextQuest.title}\n\n${nextQuest.description}`,
              () => {}
            );
          }
        }
      );
    } else if (activeQuest.giver === this.nearQuestGiver) {
      // Show current quest
      this.dialogBox.show(
        `${activeQuest.giver}: ${activeQuest.title}\n\n${activeQuest.description}`,
        () => {}
      );
    }
  }

  private startTutorial(): void {
    this.dialogBox.show(
      `Welcome to Dragon Island! 🐉\n\nYou're a baby dragon who washed up on this island.\nUse WASD or the joystick to move around.`,
      () => {
        this.tutorialStep = 1;
        this.time.delayedCall(1000, () => {
          this.dialogBox.show(
            `Press SPACE or the 🪨 button to hide as a rock.\nHumans won't recognize you when you're hiding!`,
            () => {
              this.tutorialStep = 2;
            }
          );
        });
      }
    );
  }

  private updateTutorial(input: any): void {
    if (this.tutorialStep === 2 && input.hide) {
      this.tutorialStep = 3;
      this.time.delayedCall(1000, () => {
        this.dialogBox.show(
          `Great! Watch out for humans and the hunter.\nThey have sight cones - stay out of them!\n\nWhen you get hungry, find berries or fish.\nReturn home to rest and end the day.`,
          () => {
            this.isTutorial = false;
          }
        );
      });
    }
  }

  private showHomeDialog(): void {
    if (this.sleeping) return;

    const currentStage = GrowthStages[this.gameState.growthStage];
    const nextStage = GrowthStages[this.gameState.growthStage + 1];
    const daysToGrow = GameConfig.player.growthDaysRequired[this.gameState.growthStage];
    
    let message = `🏠 Home Sweet Home\n\nYou are a ${currentStage.name}.\n`;
    
    if (nextStage && this.gameState.totalDaysPlayed < daysToGrow) {
      message += `Grow into a ${nextStage.name} in ${daysToGrow - this.gameState.totalDaysPlayed} more days.\n`;
    } else if (nextStage && this.gameState.totalDaysPlayed >= daysToGrow) {
      message += `✨ You've grown into a ${nextStage.name}!\n`;
      this.gameState.growthStage++;
      this.player.setGrowthStage(this.gameState.growthStage);
      this.hud.updateGrowthStage(this.gameState.growthStage);
      this.audioManager.playSuccess();
    }
    
    // Show decoration option if treasures available
    if (this.gameState.treasures.length > this.gameState.homeDecorations.length) {
      message += `\n✨ You have ${this.gameState.treasures.length - this.gameState.homeDecorations.length} treasures to place in your home!`;
    }
    
    message += `\n\nPress Continue to sleep and start a new day.`;

    this.dialogBox.showWithButton(
      message,
      'Continue',
      () => {
        this.endDay();
      }
    );
  }

  private endDay(): void {
    this.sleeping = true;
    this.audioManager.playDayEnd();

    // Fade out
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.time.delayedCall(1000, () => {
      // Advance day
      this.gameState.currentDay++;
      this.gameState.totalDaysPlayed++;
      
      // Restore some hunger
      this.gameState.hunger = Math.min(GameConfig.player.maxHunger, this.gameState.hunger + 30);
      
      // Save
      this.autoSave();

      // Reset NPCs
      this.resetNPCsForNewDay();

      // Respawn collectibles
      this.collectibleManager.respawnAll();

      // Update day/night system
      this.dayNightSystem.setDay(this.gameState.currentDay);
      
      // Fade in
      this.cameras.main.fadeIn(1000, 0, 0, 0);

      this.time.delayedCall(1000, () => {
        this.sleeping = false;
        this.hud.updateDay(this.gameState.currentDay);
        this.hud.updateHunger(this.gameState.hunger);
        
        this.dialogBox.show(
          `☀️ Day ${this.gameState.currentDay}\n\nA new day begins!`,
          () => {}
        );
      });
    });
  }

  private resetNPCsForNewDay(): void {
    this.humans.forEach(human => human.reset());
    this.hunter.reset();
    this.stealthSystem.reset();
  }

  handleCaught(): void {
    if (this.sleeping) return;

    this.audioManager.playCaught();
    this.sleeping = true;

    this.dialogBox.show(
      `Oh no! You were caught!\n\nThe ${this.hunter.isCatching() ? 'hunter' : 'humans'} shoo you back home.`,
      () => {
        // Teleport home
        const homeData = HomeTypes[this.gameState.playerHome!];
        this.player.setPosition(homeData.x, homeData.y);
        this.cameras.main.centerOn(homeData.x, homeData.y);
        
        // Reset NPCs
        this.resetNPCsForNewDay();
        
        this.time.delayedCall(500, () => {
          this.sleeping = false;
        });
      }
    );
  }

  private handleStarving(): void {
    if (this.sleeping) return;

    this.sleeping = true;
    this.dialogBox.show(
      `You're too hungry to continue!\n\nYou stumble back home to rest.`,
      () => {
        const homeData = HomeTypes[this.gameState.playerHome!];
        this.player.setPosition(homeData.x, homeData.y);
        this.cameras.main.centerOn(homeData.x, homeData.y);
        this.gameState.hunger = 50;
        this.hud.updateHunger(this.gameState.hunger);
        
        this.time.delayedCall(500, () => {
          this.sleeping = false;
        });
      }
    );
  }

  feedPlayer(amount: number): void {
    this.gameState.hunger = Math.min(GameConfig.player.maxHunger, this.gameState.hunger + amount);
    this.hud.updateHunger(this.gameState.hunger);
    this.audioManager.playEat();
  }

  private autoSave(): void {
    this.gameState.currentX = this.player.x;
    this.gameState.currentY = this.player.y;
    this.saveManager.save(this.gameState);
  }

  getGameState(): GameState {
    return this.gameState;
  }

  isDaytime(): boolean {
    return this.dayNightSystem.isDaytime();
  }
}
