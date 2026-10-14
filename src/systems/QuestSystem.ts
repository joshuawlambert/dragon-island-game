import Phaser from 'phaser';
import { QuestDefinition, GameState } from '../types';
import { AudioManager } from '../utils/AudioManager';

export class QuestSystem {
  private scene: Phaser.Scene;
  private audioManager: AudioManager;
  private quests: QuestDefinition[] = [];
  private questGivers: Map<string, { x: number; y: number; sprite: Phaser.GameObjects.Container }> = new Map();

  constructor(scene: Phaser.Scene, audioManager: AudioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.initializeQuests();
    this.spawnQuestGivers();
  }

  private initializeQuests(): void {
    this.quests = [
      {
        id: 'first_berry',
        title: 'Berry Hungry',
        description: 'The friendly rabbit is hungry! Collect a berry from the forest.',
        giver: 'Rabbit',
        checkComplete: (state: GameState) => state.completedQuests.includes('first_berry') || false,
        reward: 'Good job! Here are some extra berries.',
        hungerReward: 20,
      },
      {
        id: 'catch_fish',
        title: 'Gone Fishing',
        description: 'The wise otter wants to teach you to fish. Catch your first fish at the lake!',
        giver: 'Otter',
        checkComplete: (state: GameState, scene?: any) => {
          return scene?.fishCaught > 0 || state.completedQuests.includes('catch_fish');
        },
        reward: 'Well done! You are a natural fisher.',
        hungerReward: 25,
      },
      {
        id: 'explore_beach',
        title: 'Beach Explorer',
        description: 'The curious turtle wants you to explore the beach. Walk along the sandy shore.',
        giver: 'Turtle',
        checkComplete: (state: GameState) => {
          return state.currentY > 2100 || state.completedQuests.includes('explore_beach');
        },
        reward: 'The beach is beautiful! Here is a shiny shell.',
      },
      {
        id: 'camp_snack',
        title: 'Sneak Snack',
        description: 'The sneaky fox challenges you to sneak a snack from the camp without getting caught!',
        giver: 'Fox',
        checkComplete: (state: GameState, scene?: any) => {
          return scene?.campSnacksEaten > 0 || state.completedQuests.includes('camp_snack');
        },
        reward: 'Impressive sneaking! You are getting better.',
        hungerReward: 15,
      },
      {
        id: 'hide_from_hunter',
        title: 'Hide and Seek',
        description: 'The clever squirrel says the hunter is looking for you. Hide from them successfully 3 times!',
        giver: 'Squirrel',
        checkComplete: (state: GameState, scene?: any) => {
          return (scene?.successfulHides || 0) >= 3 || state.completedQuests.includes('hide_from_hunter');
        },
        reward: 'You are a master of stealth! Keep practicing.',
      },
      {
        id: 'find_treasure',
        title: 'Treasure Hunt',
        description: 'The old crow knows where treasure is hidden. Find and collect 3 shiny treasures!',
        giver: 'Crow',
        checkComplete: (state: GameState) => {
          return state.treasures.length >= 3 || state.completedQuests.includes('find_treasure');
        },
        reward: 'You found them all! These will look great in your home.',
      },
      {
        id: 'decorate_home',
        title: 'Cozy Cave',
        description: 'The friendly raccoon suggests decorating your home. Place 2 treasures in your cave!',
        giver: 'Raccoon',
        checkComplete: (state: GameState) => {
          return state.homeDecorations.length >= 2 || state.completedQuests.includes('decorate_home');
        },
        reward: 'Your home looks wonderful! Very cozy.',
      },
      {
        id: 'night_explorer',
        title: 'Night Owl',
        description: 'The wise owl says night is the best time to explore. Stay out until after 8 PM!',
        giver: 'Owl',
        checkComplete: (state: GameState, scene?: any) => {
          return scene?.hasBeenOutAtNight || state.completedQuests.includes('night_explorer');
        },
        reward: 'The night is peaceful and perfect for sneaking!',
      },
    ];
  }

  private spawnQuestGivers(): void {
    const givers = [
      { name: 'Rabbit', x: 600, y: 1600, emoji: '🐰' },
      { name: 'Otter', x: 1650, y: 700, emoji: '🦦' },
      { name: 'Turtle', x: 1200, y: 2100, emoji: '🐢' },
      { name: 'Fox', x: 1800, y: 1400, emoji: '🦊' },
      { name: 'Squirrel', x: 400, y: 1200, emoji: '🐿️' },
      { name: 'Crow', x: 2600, y: 600, emoji: '🐦‍⬛' },
      { name: 'Raccoon', x: 800, y: 1000, emoji: '🦝' },
      { name: 'Owl', x: 1000, y: 600, emoji: '🦉' },
    ];

    givers.forEach(giver => {
      const container = this.scene.add.container(giver.x, giver.y);

      // Background circle
      const bg = this.scene.add.graphics();
      bg.fillStyle(0xffffff, 0.9);
      bg.fillCircle(0, 0, 25);

      // Animal emoji
      const emoji = this.scene.add.text(0, 0, giver.emoji, {
        fontSize: '32px',
      }).setOrigin(0.5);

      container.add([bg, emoji]);
      container.setDepth(5);

      this.questGivers.set(giver.name, {
        x: giver.x,
        y: giver.y,
        sprite: container,
      });
    });
  }

  getAvailableQuest(state: GameState): QuestDefinition | null {
    if (state.activeQuest) {
      return this.quests.find(q => q.id === state.activeQuest) || null;
    }

    // Find next uncompleted quest
    for (const quest of this.quests) {
      if (!state.completedQuests.includes(quest.id)) {
        return quest;
      }
    }

    return null;
  }

  checkNearQuestGiver(playerX: number, playerY: number): { giver: string; distance: number } | null {
    let nearest: { giver: string; distance: number } | null = null;
    let minDistance = 80;

    this.questGivers.forEach((data, name) => {
      const distance = Phaser.Math.Distance.Between(playerX, playerY, data.x, data.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { giver: name, distance };
      }
    });

    return nearest;
  }

  showQuestIndicators(state: GameState): void {
    const activeQuest = this.getAvailableQuest(state);
    
    this.questGivers.forEach((data, name) => {
      const hasQuestForThisGiver = activeQuest && activeQuest.giver === name;
      
      // Clear old indicator
      data.sprite.list.forEach((child: Phaser.GameObjects.GameObject) => {
        if ((child as any).name === 'indicator') {
          child.destroy();
        }
      });

      // Add indicator if this giver has the active quest
      if (hasQuestForThisGiver) {
        const indicator = this.scene.add.text(0, -40, '!', {
          fontSize: '28px',
          color: '#ffeb3b',
          fontStyle: 'bold',
        }).setOrigin(0.5);
        (indicator as any).name = 'indicator';
        data.sprite.add(indicator);

        // Bounce animation
        this.scene.tweens.add({
          targets: indicator,
          y: -45,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    });
  }

  completeQuest(questId: string, state: GameState): void {
    if (!state.completedQuests.includes(questId)) {
      state.completedQuests.push(questId);
      const quest = this.quests.find(q => q.id === questId);
      if (quest && quest.hungerReward) {
        const gameScene = this.scene as any;
        if (gameScene.feedPlayer) {
          gameScene.feedPlayer(quest.hungerReward);
        }
      }
      this.audioManager.playSuccess();
    }
    
    // Clear active quest
    state.activeQuest = null;
    
    // Set next quest
    const nextQuest = this.getAvailableQuest(state);
    if (nextQuest) {
      state.activeQuest = nextQuest.id;
    }
  }

  assignQuest(questId: string, state: GameState): void {
    state.activeQuest = questId;
  }

  destroy(): void {
    this.questGivers.forEach(data => data.sprite.destroy());
    this.questGivers.clear();
  }
}
