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
    glideSpeed: 150,
    flySpeed: 180,
    hideTime: 500, // ms to transform into rock
    fishingTime: 3000, // ms for fishing mini-game
    hungerDecayRate: 0.5, // per second
    maxHunger: 100,
    growthDaysRequired: [3, 6, 10], // Days to reach each growth stage
    smokeDistance: 150, // Distance smoke puff travels
    smokeDuration: 2000, // How long smoke lasts
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
    timeSkipForTesting: false, // Set to true to make days 30 seconds for testing
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
  { name: 'Hatchling', abilities: ['walk', 'hide'], canGlide: false, canFly: false, canSmoke: false },
  { name: 'Young Dragon', abilities: ['walk', 'hide', 'glide'], canGlide: true, canFly: false, canSmoke: false },
  { name: 'Dragon', abilities: ['walk', 'hide', 'glide', 'fly'], canGlide: true, canFly: true, canSmoke: false },
  { name: 'Elder Dragon', abilities: ['walk', 'hide', 'glide', 'fly', 'smoke'], canGlide: true, canFly: true, canSmoke: true },
] as const;
