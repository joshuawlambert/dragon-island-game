# Dragon Island 🐉

A cozy stealth adventure game for browsers, where you play as a baby dragon exploring a mysterious island.

**Play now:** [https://joshuawlambert.github.io/dragon-island-game/](https://joshuawlambert.github.io/dragon-island-game/)

## About

You're a baby dragon who washed up on a beach on an island inhabited by humans. Choose your home (mountain cave, hillside cave, or forest hollow), then explore the island while avoiding detection. Hide as a rock when humans get close, forage for berries and fish, sneak into campsites for snacks, and grow stronger over the days.

### Features

- **Cozy Exploration**: A colorful top-down island with distinct regions - beach, forest, village, mountain, and lake
- **Stealth Gameplay**: Humans and hunters have visible sight cones. Hide in plain sight by curling up like a rock
- **Day/Night Cycle**: Sneak more easily at night, sleep at home to advance days
- **Activities**: Forage berries, fish at the water, grab camp snacks, collect treasures
- **Growth System**: Grow from hatchling to elder dragon, unlocking new abilities
- **Kid-Friendly**: No violence - getting caught means being gently shooed home

### Controls

**Desktop:**
- WASD or Arrow Keys to move
- Space to hide/unhide
- E to interact

**Touch (iPad/Mobile):**
- Virtual joystick (bottom left) to move
- 🪨 button (bottom right) to hide
- 👋 button to interact

Progress auto-saves to your browser's local storage.

## Development

Built with:
- [Phaser 3](https://phaser.io/) - Game framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Vitest](https://vitest.dev/) - Unit testing
- [Playwright](https://playwright.dev/) - Browser testing

### Setup

```bash
npm install
npm run dev        # Development server
npm run build      # Production build
npm test           # Run tests
npm run typecheck  # Type checking
```

### Testing

```bash
npm test                           # Unit tests
npx playwright test               # Browser tests
npx playwright test --headed      # Watch tests run
npx playwright show-report        # View test report
```

## Credits

See [CREDITS.md](CREDITS.md) for complete credits and licenses.

## License

MIT License - See LICENSE file for details

---

Made with 💜 by Human 1 and Human 2
