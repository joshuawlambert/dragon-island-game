export interface GameState {
  playerHome: keyof typeof import('./config').HomeTypes | null;
  currentDay: number;
  hunger: number;
  treasures: string[];
  completedQuests: string[];
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
  checkComplete: (state: GameState) => boolean;
  reward?: string;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  hide: boolean;
  interact: boolean;
}
