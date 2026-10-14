export const GameConfig = {
  // Display
  width: 1024,
  height: 768,
  backgroundColor: '#2d5f6f',
  
  // World
  worldWidth: 3200,
  worldHeight: 2400,
  
  // Player
  player: {
    speed: 100,
    hideTime: 500, // ms to transform into rock
    fishingTime: 2000, // ms for fishing mini-game
    hungerDecayRate: 0.5, // per second
    maxHunger: 100,
    growthDaysRequired: [3, 6, 10], // Days to reach each growth stage
  },
  
  // NPCs
  hunter: {
    speed: 60,
    patrolPauseTime: 2000,
    chaseSpeed: 90,
    sightRange: 200,
    sightAngle: 60, // degrees
    catchDistance: 40,
  },
  
  human: {
    speed: 40,
    wanderRadius: 200,
    sightRange: 150,
    sightAngle: 90,
    pauseTime: 3000,
  },
  
  // Day/night
  dayNight: {
    dayLengthSeconds: 180, // 3 minutes per day
    nightStartHour: 20,
    nightEndHour: 6,
    nightStealthBonus: 1.5, // Harder to be seen at night
  },
  
  // Items
  berry: {
    hungerRestore: 15,
    respawnTime: 30000, // 30 seconds
  },
  
  fish: {
    hungerRestore: 30,
    catchChance: 0.7,
  },
  
  snack: {
    hungerRestore: 25,
  },
  
  // Storage
  saveKey: 'dragonIsland_save_v1',
};

export const HomeTypes = {
  MOUNTAIN_CAVE: { name: 'Mountain Cave', x: 2800, y: 400 },
  HILLSIDE_CAVE: { name: 'Hillside Cave', x: 1600, y: 800 },
  FOREST_HOLLOW: { name: 'Forest Hollow', x: 800, y: 1800 },
} as const;

export const GrowthStages = [
  { name: 'Hatchling', abilities: ['walk', 'hide'] },
  { name: 'Young Dragon', abilities: ['walk', 'hide', 'glide'] },
  { name: 'Dragon', abilities: ['walk', 'hide', 'glide', 'fly'] },
  { name: 'Elder Dragon', abilities: ['walk', 'hide', 'glide', 'fly', 'smoke'] },
] as const;
