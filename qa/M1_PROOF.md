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

---

# Milestone 2 — combat depth (appended proof)

## Delivered

- **Hotbar skills** (event.code keys): `Digit2` Dash — 6m/0.25s burst with i-frames, 25 stamina, 3s CD, motion-streak particles + whoosh; `Digit3` Whirlwind — 360° spin (fast player rotation + expanding slash ring), 1.5× weapon damage to all mobs within 3m, 6s CD; `Digit4` War Cry — +30% damage for 8s, staggers mobs within 8m for 1.2s, golden pulse ring, 20s CD. Hotbar slots show conic-gradient darkened cooldown overlay with countdown number and a greyed disabled state when stamina is insufficient.
- **Combat feel**: 60ms hit-stop on every melee hit, camera shake when the player is hit, 0.8m mob knockback, per-weapon combo damage (Iron Sword 8/10/14; bigger 3rd swing), blocking caps hits at 3 damage with shield-spark particles.
- **Stagger**: 3rd combo hit and War Cry stop mob AI for 1.2s with ✶✶✶ dizzy stars above the nameplate.
- **Alpha Wolf boss** in a cleared far grove at (-40,-70): 3× wolf scale, 400 HP, telegraphed lunge (0.8s crouch → 8m dash) and howl summon (head-up + ring, spawns 2 wolves, ≤4 summons alive), top-screen boss HP bar within 25m, drops 5 coins + legendary **Fang Blade** (12/15/21), 200 XP, victory toast + `happytime()`, 120s respawn.
- **Debug hooks extended**: `castSkill(n)`, `spawnBoss()`, `spawnMobAt(type,x,z)`, and `getState()` now exposes `cooldowns`, `buffs`, `iframes`, `loot`, and `boss {hp, dead, telegraph, dist}`.

## Required production-build verification (sequential, shared port 8701)

| Command | Exit code | Evidence |
| --- | ---: | --- |
| `npm run build` | 0 | bundled production build (644.2kb JS), dist 13M < 20MB |
| `node tests/e2e.mjs` | 0 | all M1 checks + M2: dash ≥4m with i-frames & cooldown, whirlwind damages 2 mobs at once, War Cry buff raises whirlwind damage to ≤13 HP remaining (−23 vs −18 unbuffed), boss exists at 400 HP, telegraphs lunge/howl, drops Fang Blade + ≥5 coins, Fang Blade picked up into inventory |
| `node tests/viewport.mjs` | 0 | all 10 viewport dimensions, canvas coverage ≥98% |
| `node tests/soak.mjs` | 0 | 120s accelerated simulation ≥30fps, particles ≤64, entities bounded |

## Screenshots

- [Combat with War Cry + Whirlwind, cooldown UI, stagger stars — 907×510](screenshots/combat-907.png)

---

# Milestone 3 — progression & economy (appended proof)

## Delivered

- **Merchant shop**: new NPC *Merchant Odessa* at a hand-built market stall (counter, four posts, tilted red awning, wares) beside the west cabin (−15.5, 9). `E` within 3.4m opens a shop panel in the inventory visual style. **Buy**: Red Potion 15g, Sunsteel Sword 120g, Tower Shield 80g (blocked hits deal 2 dmg instead of 3), Vale Armor Mk II 100g (+25 max HP, auto-equips). **Sell**: any inventory item at 40% of value (potion 6g, Iron Sword 16g, Sunsteel 48g…); equipped last-copy weapon is protected. Fully mouse-driven; closes via button, `I`/`Tab`, `Esc`, or `Backspace`.
- **Quest system** (post-tutorial loop): 5 chained quests auto-started after the tutorial — Q1 *Pest Control* (5 Slimes → 30g+40XP), Q2 *Wolf Pack* (3 Wolves → 50g+80XP), Q3 *Bone Collector* (2 Skeletons → 60g+100XP; 2 new skeleton spawns added on the east side at (34,−26)/(39,−20)), Q4 *The Alpha* (Alpha Wolf → 150g+200XP + "Title unlocked: WOLFSBANE" toast), Q5 *Ready for the Depths* (reach level 5 → 100g + "The cave entrance rumbles..." M4 teaser). Kills auto-tracked; live progress in the top HUD bar ("Pest Control 3/5"); completed quest → return to Mentor Arlen and press `E` to claim, next quest starts. Quest log panel on `J` / HUD "Quest Log" button with complete/active/locked states. Quest state, gold, shield and armor persist in the save.
- **Economy**: all mobs drop 1–3 coins (boss 5); coins convert to gold on pickup; gold shown in a dedicated HUD chip, inventory header and shop header; potions heal 40; every item tooltip shows its sell value.
- **Level curve**: XP need = level×100; each level +15 max HP (recomputed via `calcMaxHp`, armor bonus stacks) and +1 base damage on all attacks incl. whirlwind; capped at level 10.
- **Debug hooks extended**: `openShop()`, `grantGold(n)`, `setQuest(id)`, `claimQuest()`; `getState()` now exposes `gold`, `maxHp`, `quest {id, progress, target, done, name}`, `merchant {x,z}` and `mentor {x,z}`.

## Required production-build verification (sequential, shared port 8701)

| Command | Exit code | Evidence |
| --- | ---: | --- |
| `npm run build` | 0 | bundled production build (650.8kb JS), dist 13M < 20MB |
| `node tests/e2e.mjs` | 0 | all M1+M2 checks + M3: buying potion −15g and +1 item, selling potion +6g (40%) and −1 item, Backspace closes shop, `setQuest(1)` then debug slime kill → progress 1, 5 kills → done, `E` at mentor claims +30g and chain advances to Wolf Pack, quest id + gold survive reload |
| `node tests/viewport.mjs` | 0 | all 10 viewport dimensions, canvas coverage ≥98% |
| `node tests/soak.mjs` | 0 | 120s accelerated simulation ≥30fps, particles ≤64, entities bounded (≤16 incl. 2 new skeletons) |

## Screenshots

- [Shop panel open at Merchant Odessa — 907×510](screenshots/shop-907.png)
- [Quest HUD "Wolf Pack 0/3" + gold chip in world — 907×510](screenshots/quest-hud-907.png)
