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

---

# Milestone 4 — The Hollow Depths (appended proof)

## Delivered

- **Cave entrance** in the northern rocks at (30, −85): rocky arch of dodecahedron pillars + lintel with a dark portal disc, 7 glowing rune stones (emissive blue), scatter boulders, blue point light (full builds/capture runs), and a floating "The Hollow Depths [E]" HUD label within 14m. Trees/rocks carved out of the clearing. `E` at <5m enters; gated by **quest ≥ 6 (Q5 claimed) OR level ≥ 5** — otherwise toast "Too dangerous — reach level 5". 0.5s fade-to-black transition both ways.
- **The Hollow Depths map** (~120×120m cavern, separate `cave` THREE.Group; swap = hide vale `world` + sky group, show cave group; single renderer/camera): vertex-colored stone floor with its own `caveHeight` terrain fn and a carved stream channel, enclosing rock wall + ceiling, **90 stalagmites + 90 stalactites (instanced)**, **52 emissive blue/purple crystals (instanced)** clustered around exactly **6 point lights**, underground stream reusing the water shader with a darker deep-blue tint, 14 glowing mushroom clusters, dark-blue fog (14–60), near-zero sun + dim cool hemisphere, and a **warm torch point light following the player**. Exit portal (runed arch, "Return to Emerald Vale [E]") returns to the vale entrance.
- **Cave mobs (8 + boss)**: 3× **Cave Bat** (proc body/ears/eyes/flapping wings, erratic sine wander + hover, 0.5s dive attack 8 dmg, 25 HP), 3× **Crystal Golem** (chunky crystal-emissive box golem, slow 0.9 m/s, telegraphed 1s ring smash 25 dmg, 120 HP, always drops **Crystal Shard**), 2× reused Skeletons. Map-tagged entities: AI, combat, whirlwind, war cry, labels and loot all filter by active map.
- **Boss — Deepstone Colossus** (600 HP, far chamber at (0, −42) ringed by rock pillars): **smash** (red AoE ring telegraph 6m, 30 dmg), **rock throw** (dark shadow-circle telegraph at target + arcing rock projectile, 20 dmg), **summons 2 Cave Bats at 50% HP**. Reuses the top boss bar (name swaps per boss). Drops **Colossus Core + Runic Greatsword** (epic, 16/20/28) + 5 coins, 300 XP. Victory: "The Depths are silent..." toast + happytime + END OF CONTENT modal ("You have conquered Emerald Vale and the Hollow Depths — more realms coming soon"); free play continues after closing.
- **Quests 6–8** (mentor still claims): Q6 *Into the Depths* (enter cave → 80g+120XP), Q7 *Crystal Hunter* (2 Crystal Golems → 120g+180XP), Q8 *The Colossus* (→ 300g+400XP + "Title unlocked: DEPTHBREAKER"). Q5 claim still teases the rumbling entrance.
- **Persistence**: `map` saved; reloading inside the cave restores the cave (lighting, fog, groups, boss respawned if undefeated). Knock-out inside the cave restores at the cave spawn.
- **Debug hooks**: `enterCave()`/`exitCave()`; `getState()` exposes `map` ('vale'|'cave'), per-mob `map`/`dead`, per-loot `map`, `telegraphs` count, and `caveBoss {hp,max,dead,telegraph,summoned,dist}`; plus `spawnCaveBoss()`, `setLevel(n)`.

## Required production-build verification (sequential, shared port 8701)

| Command | Exit code | Evidence |
| --- | ---: | --- |
| `npm run build` | 0 | bundled production build (665.7kb JS), dist 13M < 20MB |
| `node tests/e2e.mjs` | 0 | all M1+M2+M3 checks + M4: cave mobs pre-spawned (8), `enterCave(false)` gated below level 5, `enterCave()` switches map + mobs list, Cave Bat 25 HP + Crystal Golem 120 HP, golem debug-kill drops Crystal Shard, Q7 completes on 2 golem kills, colossus telegraphs (smash/throw) with telegraph field mesh ≥1, colossus kill drops Colossus Core + Runic Greatsword and opens the endgame modal, reload inside cave restores map='cave', `exitCave()` returns beside the vale entrance |
| `node tests/viewport.mjs` | 0 | all 10 viewport dimensions, canvas coverage ≥98% |
| `node tests/soak.mjs` | 0 | 120s accelerated simulation ≥30fps, particles ≤64, entities bounded (≤28 incl. cave roster) |

## Screenshots

- [Inside the Hollow Depths — crystals, mushrooms, torch light — 907×510](screenshots/cave-907.png)
- [Deepstone Colossus + boss bar + crystal cavern — 907×510](screenshots/cave-boss-907.png)

## M4.1 — Cave readability pass

- **Cave lighting**: hemisphere raised (0.28 → 0.95, cool blue-grey `#4a5d85`/`#1a2233`), fog pushed out (18–72), background lifted to `#0a1020` — floor/walls/stalagmites now read as dark blue-grey silhouettes instead of pure black. Player torch radius widened 2.5× (20 → 50, decay 2 → 1.5, intensity 13) with gentle falloff.
- **Light budget kept at 6 cave point lights** (torch, player fill, 3 crystal cluster lights, boss-chamber moonwell); the other 3 crystal clusters + moonwell floor now use **additive-blend emissive glow discs** that fake bounce light on the floor. Campfire light disabled while in cave. Soak stayed ≥30fps.
- **Boss visibility**: large cool "moonwell" point light (intensity 14, range 48) over the boss chamber at (0,−42) + boosted emissive crystal veins on the Colossus body (emissiveIntensity 1.6). Rock-throw shadow telegraph recolored `#222833` → `#5a6f9e` and telegraph pulse floor opacity raised .25 → .45 so AoE ring/shadow read on the dark floor. Verified in e2e via **pixel luminance sample: mean luminance 108.2 in a 60×80px box around the boss's projected screen position** (asserted > 28) in `cave-boss-907.png`.
- **Lingering "Quest complete: Crystal Hunter!" text**: this was the HUD `#toast` element — `toast()` scheduled a fixed fade but repeated toasts raced older timeouts (a later `setTimeout` from an earlier toast could be pre-empted, leaving text at opacity 1). Fixed: `toast()` now clears/re-arms a single tracked timeout (fades ≤1.8s < 4s), and `setMap()` force-hides the toast so it never survives map swaps.
- **Player readability in TPP**: small cool fill point light (`#7fa0d8`, intensity 3, range 9) follows behind the player in cave so the knight reads from the camera side.
- Re-verified sequentially: `npm run build` ✓, `node tests/e2e.mjs` ✓ (incl. new boss-luminance assertion), `node tests/viewport.mjs` ✓, `node tests/soak.mjs` ✓ (≥30fps). Screenshots `cave-907.png` and `cave-boss-907.png` regenerated with `?debug=1&capture=1`.

## M6 — Marketing kit (covers, videos, submission, zip)

### Cover pipeline
- `node scripts/capture-hero.mjs` → exit 0 — real in-game renders (hero-shot.png 1800x2000, hero-wide.png 2560x1440): knight posed via new debug hooks `setCameraPose`/`posePlayer`/`rimLight` (capture=1, HUD hidden, warm rim lights).
- `node scripts/render-marketing.mjs` → exit 0 — cover.html?w=&h= composited: cover-16x9.png (1920x1080), cover-2x3.png (800x1200, vertical layout: title top / hero bottom), cover-1x1.png (800x800). Title only, no other text.
- `node scripts/check-cover-brightness.mjs` → exit 0 (gate: meanLum>=80, darkFrac<=0.35, meanSat>=0.35):
  - cover-16x9.png 1920x1080 meanLum=168.6 darkFrac=0.045 meanSat=0.582 → PASS
  - cover-2x3.png 800x1200 meanLum=173.2 darkFrac=0.015 meanSat=0.573 → PASS
  - cover-1x1.png 800x800 meanLum=174.4 darkFrac=0.023 meanSat=0.552 → PASS

### Preview videos
- `node scripts/record-videos.mjs` → exit 0 — Playwright recordVideo bot: village walk → slime/wolf combat with War Cry/Whirlwind/Dash → (landscape) Alpha Wolf boss teaser. Scripted alive gameplay 17.9s (landscape, 3 kills) / 16.8s (portrait, 5 kills); modals suppressed, HUD kept.
- `bash scripts/build-videos.sh` → exit 0 — 1-frame static cover concat + gameplay, -an, libx264 yuv420p +faststart.
- `node scripts/verify-video-frames.mjs` → exit 0 — ffprobe proof:
  - video-landscape.mp4: h264 1920x1080 yuv420p duration=16.533333
    - t=1s meanLum=144.8 blackFrac=0.007 colors=200 → GAMEPLAY OK
    - t=8s meanLum=143.4 blackFrac=0.010 colors=202 → GAMEPLAY OK
    - t=15s meanLum=142.0 blackFrac=0.021 colors=201 → GAMEPLAY OK
  - video-portrait.mp4: h264 800x1200 yuv420p duration=16.166667
    - t=1s meanLum=138.7 blackFrac=0.006 colors=186 → GAMEPLAY OK
    - t=8s meanLum=134.6 blackFrac=0.016 colors=186 → GAMEPLAY OK
    - t=15s meanLum=124.3 blackFrac=0.012 colors=174 → GAMEPLAY OK

### Submission docs + zip
- marketing/SUBMISSION.md (full/short description, controls, category Adventure, 10 tags, age 10+/PEGI 12, QA/SDK notes, save=Yes via Data Module) + marketing/TAXONOMY.md.
- `npm run build` → exit 0 (bundle.js 680.0kb); `cd dist && zip -rq ../aetherblade.zip .` → exit 0 — flat zip: index.html + bundle.js + assets/ (7 files, 4.0M).

### Regression
- `npm run build` → exit 0; `node tests/e2e.mjs` → exit 0; `node tests/viewport.mjs` → exit 0; `node tests/soak.mjs` → exit 0. (Game-logic change limited to capture-only debug hooks + camPose short-circuit in updateCamera, inert unless setCameraPose is called.)
