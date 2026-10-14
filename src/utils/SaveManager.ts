import { GameConfig, HomeTypes } from '../config';
import { GameState, SaveData } from '../types';

export class SaveManager {
  private static instance: SaveManager;
  
  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  getDefaultState(): GameState {
    return {
      playerHome: null,
      currentDay: 1,
      hunger: GameConfig.player.maxHunger,
      treasures: [],
      completedQuests: [],
      growthStage: 0,
      totalDaysPlayed: 0,
      currentX: 400,
      currentY: 400,
      lastSaveTimestamp: Date.now(),
    };
  }

  save(state: GameState): void {
    try {
      const saveData: SaveData = {
        version: 1,
        state: { ...state, lastSaveTimestamp: Date.now() },
      };
      localStorage.setItem(GameConfig.saveKey, JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  load(): GameState | null {
    try {
      const saved = localStorage.getItem(GameConfig.saveKey);
      if (!saved) return null;

      const data: SaveData = JSON.parse(saved);
      
      // Validate save data
      if (data.version !== 1) {
        console.warn('Save version mismatch, using default state');
        return null;
      }

      // Validate required fields
      const state = data.state;
      if (typeof state.currentDay !== 'number' || state.currentDay < 1) {
        console.warn('Invalid save data, using default state');
        return null;
      }

      // Validate home selection if present
      if (state.playerHome && !(state.playerHome in HomeTypes)) {
        console.warn('Invalid home type in save data');
        state.playerHome = null;
      }

      // Ensure arrays exist
      state.treasures = Array.isArray(state.treasures) ? state.treasures : [];
      state.completedQuests = Array.isArray(state.completedQuests) ? state.completedQuests : [];

      // Clamp values to valid ranges
      state.hunger = Math.max(0, Math.min(GameConfig.player.maxHunger, state.hunger || 0));
      state.growthStage = Math.max(0, Math.min(3, state.growthStage || 0));

      return state;
    } catch (error) {
      console.error('Failed to load save:', error);
      return null;
    }
  }

  hasSave(): boolean {
    return localStorage.getItem(GameConfig.saveKey) !== null;
  }

  clearSave(): void {
    localStorage.removeItem(GameConfig.saveKey);
  }
}
