# Aetherblade — CrazyGames Submission Kit

Live demo: https://tukieav.github.io/aetherblade/

## Full description (EN)

Grab your sword and step into **Aetherblade**, a full-3D third-person action
RPG that runs right in your browser — no download, no install.

Explore the sun-drenched **Emerald Vale**, a fantasy meadow of low-poly
forests, rivers and a cozy village, then descend into **The Hollow Depths**, a
glittering crystal cave hiding the realm's oldest secret. Fight your way
through 5 enemy types — slimes, wolves, skeletons, bats and crystal golems —
and face two epic bosses: the ferocious **Alpha Wolf** and the towering
**Deepstone Colossus**.

**Features**
- Real 3D third-person combat: sword combos, shield block, dash, whirlwind
  spin and a rallying War Cry
- 8-quest story chain guided by Mentor Arlen — from first slime to final boss
- Shop, inventory and equipment: buy better swords, shields, armor and potions
  from Merchant Odessa
- XP and levels with growing power, boss loot and rare gear drops
- Two handcrafted maps: the Emerald Vale meadow and the Hollow Depths crystal
  cave
- Automatic save — close the tab and pick up right where you left off
- Full keyboard + mouse AND touch controls: play on desktop or mobile

**How to play**
Walk into the glowing quest markers and talk to Mentor Arlen to start your
adventure. Defeat enemies to earn XP, gold and loot. Level up, buy stronger
gear at the shop, complete all 8 quests, and take down both bosses to free the
Vale. Block or dash out of the red telegraph zones — bosses hit hard!

## Short description (~140 chars)

3D action RPG in your browser: sword combos, skills, quests, loot and two epic
bosses across a sunny meadow and a crystal cave. (131 chars)

## Controls

**Keyboard + mouse**
- WASD / ZQSD — move (Shift — sprint)
- Mouse — look around / turn camera; mouse wheel — zoom
- Left click — sword attack (combo)
- Right click (hold) — block with shield
- Space — jump
- 1 — drink potion, 2 — dash, 3 — whirlwind, 4 — war cry
- E — interact (talk, enter cave, pick up), I — inventory, J — quest log

**Touch (mobile)**
- Virtual joystick (left) — move; drag right side — camera
- On-screen buttons: attack ⚔, jump ▲, dash ⚡, potion ✚, interact E,
  inventory 🎒; tap an enemy — targeted attack; pinch — zoom

## Category

**Adventure** (primary suggestion; Action is the close second — see
TAXONOMY.md for rationale).

## Tags (8-10)

3D, RPG, Adventure, Action, Fantasy, Sword, Monster, Quest, Loot, Mobile

## Age rating

Suitable for ages 10+ (PEGI 12 aligned): mild fantasy combat, **no blood** —
defeated enemies dissolve into colored particles. No gambling, no chat, no
user-generated content.

## Does your game save progress?

**Yes** — via the CrazyGames **Data Module** (`window.CrazyGames.SDK.data`),
with a localStorage fallback outside the platform. Progress (level, XP, gold,
inventory, equipment, quest chain, map position) persists across sessions and
devices.

## QA notes — SDK integrations

- **SDK v3** loaded in `<head>`; `init()` awaited before gameplay.
- **Midgame ads**: requested on player defeat/respawn ("wake up at campfire")
  and on session restarts.
- **Rewarded ads**: (1) "Second Breath" revive with 50% HP after being knocked
  out, (2) +25 gold at Merchant Odessa's shop (2-minute cooldown).
- **Ad pause handling**: on `adStarted` all audio is muted and the game loop
  pauses; restored on `adFinished`/`adError`.
- **happytime()**: fired on level-ups, quest claims and boss kills.
- **Data Module save**: full game state via `sdk.data`, localStorage fallback.
- **Mute settings**: respects `sdk.game.settings.muteAudio` at startup and via
  `addSettingsChangeListener` at runtime.
- **gameplayStart/gameplayStop**: wired to pointer-lock/touch focus, panel
  opens and ad breaks.
- **Loading events**: `loadingStart`/`loadingStop` around asset boot.
- Live demo for review: https://tukieav.github.io/aetherblade/
