import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from './SaveManager';
import { GameConfig } from '../config';

describe('SaveManager', () => {
  let saveManager: SaveManager;

  beforeEach(() => {
    localStorage.clear();
    saveManager = SaveManager.getInstance();
  });

  it('should return default state when no save exists', () => {
    const state = saveManager.load();
    expect(state).toBeNull();
  });

  it('should save and load game state', () => {
    const state = saveManager.getDefaultState();
    state.currentDay = 5;
    state.hunger = 75;
    state.playerHome = 'MOUNTAIN_CAVE';

    saveManager.save(state);
    const loaded = saveManager.load();

    expect(loaded).not.toBeNull();
    expect(loaded?.currentDay).toBe(5);
    expect(loaded?.hunger).toBe(75);
    expect(loaded?.playerHome).toBe('MOUNTAIN_CAVE');
  });

  it('should clamp hunger to valid range', () => {
    const state = saveManager.getDefaultState();
    state.hunger = 150; // Over max

    saveManager.save(state);
    const loaded = saveManager.load();

    expect(loaded?.hunger).toBeLessThanOrEqual(GameConfig.player.maxHunger);
  });

  it('should detect existing saves', () => {
    expect(saveManager.hasSave()).toBe(false);

    const state = saveManager.getDefaultState();
    saveManager.save(state);

    expect(saveManager.hasSave()).toBe(true);
  });

  it('should clear saves', () => {
    const state = saveManager.getDefaultState();
    saveManager.save(state);

    saveManager.clearSave();
    expect(saveManager.hasSave()).toBe(false);
  });

  it('should handle corrupted save data', () => {
    localStorage.setItem(GameConfig.saveKey, 'invalid json');
    const loaded = saveManager.load();
    expect(loaded).toBeNull();
  });

  it('should validate save version', () => {
    const invalidSave = {
      version: 999,
      state: saveManager.getDefaultState()
    };
    localStorage.setItem(GameConfig.saveKey, JSON.stringify(invalidSave));
    
    const loaded = saveManager.load();
    expect(loaded).toBeNull();
  });
});
