# Aetherblade — Milestone 1 proof

## Delivered

- A full-screen Three.js third-person browser ARPG: smooth follow camera, pointer lock, yaw/pitch input, terrain-safe camera height, WASD plus AZERTY `Z` compatibility, sprint, jumping, sword combo, blocking, and procedural walk/attack animation.
- Emerald Vale: a 200m procedural-heightmap meadow, dirt road, pond, instanced low-poly forest/grass/flowers, natural rock-and-forest edge, four village cabins, fence, fire particles, mentor, training dummy, fog, golden-hour lighting, and soft shadows in normal gameplay.
- Eight enemies (Slimes and Wolves) patrol and chase, telegraph attacks, use overhead health bars, dissolve into bounded particles, drop loot, award XP/levels, and respawn after 30 seconds.
- Inventory UI (5x4), equipment slots, visible sword/shield, potion hotbar, HUD, persistent save/load using the CrazyGames SDK data module with localStorage fallback, procedural WebAudio, skippable in-world tutorial, and the required `window.__astro` debug hook.

## Asset / licence record

No external 3D, image, or audio assets were downloaded. Everything is procedural game source; see [ASSETS_LICENSES.md](../ASSETS_LICENSES.md). `dist` is **556K**, below the 20MB limit.

## Required production-build verification

All tests ran against `dist` on the isolated local port `8701`, using `/usr/bin/google-chrome` in Playwright.

| Command | Exit code | Evidence |
| --- | ---: | --- |
| `npm run build` | 0 | bundled production build (540.1kb JS) |
| `node tests/e2e.mjs` | 0 | boot/no console errors, non-empty WebGL image, pointer lock, AZERTY movement, jump, combat, loot, inventory, tutorial and save/load |
| `node tests/viewport.mjs` | 0 | all 10 CrazyGames viewport dimensions; canvas coverage >=98% |
| `node tests/soak.mjs` | 0 | 120-second accelerated simulation; >=30fps and bounded entities/particles |

## Screenshots

- [Tutorial — 907×510](screenshots/tutorial-907.png)
- [Inventory — 907×510](screenshots/inventory-907.png)
- [Combat — 907×510](screenshots/combat-907.png)
- [Emerald Vale — 1920×1080](screenshots/world-1920.png)
