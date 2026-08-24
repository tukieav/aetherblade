# Assets and licenses

All third-party assets shipped with Aetherblade are CC0 1.0 Universal. Attribution
is not required, but the original creator and source are recorded for auditability.

| Runtime file | Creator / pack | Source | License | Use |
| --- | --- | --- | --- | --- |
| `assets/characters/kaykit-knight.glb` | Kay Lousberg / KayKit Character Pack: Adventurers 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | CC0 1.0 Universal | Player knight, rig and animation clips |
| `assets/characters/kaykit-mage.glb` | Kay Lousberg / KayKit Character Pack: Adventurers 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | CC0 1.0 Universal | Mentor Arlen, rig and idle clip |
| `assets/characters/kaykit-skeleton-warrior.glb` | Kay Lousberg / KayKit Character Pack: Skeletons 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0 | CC0 1.0 Universal | Skeleton enemy, rig and combat clips |
| `assets/characters/kaykit-rogue.glb` | Kay Lousberg / KayKit Character Pack: Adventurers 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | CC0 1.0 Universal | Merchant Odessa (Rogue model, texture resized 512 + quantized via gltf-transform) |
| `assets/characters/quaternius-wolf.gltf` | Quaternius / Animated Animals pack | https://quaternius.com/packs/animatedanimals.html | CC0 1.0 Universal | Wolf enemy + Alpha Wolf boss (3x scale), Idle/Walk/Gallop/Attack clips; materials recolored at runtime to the KayKit palette (flat shading) |
| `assets/props/green/building_home_A_green.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Village cabins (homes 1 and 3) |
| `assets/props/green/building_home_B_green.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Village cabins (homes 2 and 4) |
| `assets/props/green/building_market_green.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Merchant Odessa's market stall |
| `assets/props/neutral/fence_wood_straight.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Village fence line |
| `assets/props/nature/tree_single_A.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Vale forest, instanced (pine species) |
| `assets/props/nature/tree_single_B.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Vale forest, instanced (broadleaf species) |
| `assets/props/nature/rock_single_A.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Vale boulders, instanced |
| `assets/props/nature/rock_single_B.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Vale boulders, instanced |
| `assets/props/nature/rock_single_C.gltf` (+.bin/.png) | Kay Lousberg / KayKit Medieval Hexagon Pack 1.0 | https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 Universal | Vale boulders, instanced |

The sources were acquired from the public upstream repositories on 2026-08-23/24.
All runtime files above total about 15 MB. The world terrain, sky, water, grass,
cave, VFX, and audio are authored procedurally in source and have no third-party
attribution requirement. Every loaded asset has a procedural fallback: if a file
fails to load, the original procedural version stays active.
