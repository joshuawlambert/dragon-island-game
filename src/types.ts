export interface GameState {
  playerHome: keyof typeof import('./config').HomeTypes | null;
  currentDay: number;
  hunger: number;
  treasures: string[];
  homeDecorations: string[];
  completedQuests: string[];
  activeQuest: string | null;
  growthStage: number;
  totalDaysPlayed: number;
  currentX: number;
  currentY: number;
  lastSaveTimestamp: number;
}

export interface SaveData {
  version: number;
  state: GameState;
}

export type HomeType = keyof typeof import('./config').HomeTypes;

export type AlertState = 'idle' | 'alert' | 'suspicious' | 'chasing';

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  giver: string; // Animal that gives the quest
  checkComplete: (state: GameState, scene?: any) => boolean;
  reward: string;
  hungerReward?: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  hide: boolean;
  interact: boolean;
  glide: boolean;
  smoke: boolean;
}

export interface HidingSpot {
  x: number;
  y: number;
  radius: number;
  type: 'bush' | 'grass';
  graphics: Phaser.GameObjects.Graphics;
}
