# AETHERBLADE — fantasy ARPG 3D (TPP) w przeglądarce — MILESTONE 1

Zbuduj od zera pierwszą grywalną wersję gry 3D fantasy action-RPG w przeglądarce. Katalog projektu: /home/bartek/Projects/aetherblade (npm zainicjalizowany, three@0.185 + esbuild + playwright w node_modules). Wszystko po angielsku w grze (target: CrazyGames, gracze 10-16 lat, PEGI 12 — zero krwi, pokonane moby rozpadają się w cząsteczki/dym).

## Stack (wiążący)
- Three.js (już w deps) + esbuild bundle. `npm run build` = `esbuild src/main.js --bundle --minify --outfile=dist/bundle.js && node scripts/pack.mjs` (pack.mjs kopiuje index.html i assety do dist/). `npm run dev` z --servedir.
- index.html: canvas pełnoekranowy (100% okna, resize + devicePixelRatio cap 2), `user-select:none`, favicon `data:,`, SDK CrazyGames v3 w <head> + wrapper sdk.js z timeoutem 3s i no-op fallbackami (wzorzec: /home/bartek/Projects/neon-slasher/src/sdk.js — skopiuj i dostosuj).
- Assety 3D: WOLNO użyć CC0 (public domain) paczek glTF/GLB: KayKit (kaylousberg.itch.io / github KayKit), Quaternius (quaternius.com), Kenney — pobierz tylko potrzebne pliki GLB do assets/ i wypisz źródła w ASSETS_LICENSES.md (wszystko musi być CC0). Jeśli pobieranie zawiedzie — proceduralne modele low-poly z prymitywów Three (rigowane hierarchią Object3D). CAŁY initial download <= 20MB (sprawdź du -sh dist/).
- Zero backendu. Save przez SDK data module + localStorage fallback.

## Gameplay MILESTONE 1 (wszystko wymagane)
1. POSTAĆ GRACZA (TPP):
   - rycerz/wojownik z mieczem — ładny nowoczesny low-poly (KayKit Adventurers/Skeletons ma gotowe rigowane postaci z animacjami; preferuj GLB z animacjami idle/walk/run/attack/block/jump/death)
   - kamera TPP za plecami: pointer lock po kliknięciu, mysz obraca kamerę (yaw wokół postaci + pitch z clampem), kolizja kamery z terenem (nie wchodzi pod ziemię), płynny follow z lekkim lag
2. STEROWANIE (event.code — AZERTY musi działać):
   - WASD ruch względem kamery (postać obraca się w kierunku ruchu), Shift sprint, Space skok (grawitacja + ground check)
   - LPM atak mieczem (combo 2-3 ciosów przy kolejnych klikach, hit detection przez odległość+kąt), PPM trzymany = blok (redukcja obrażeń, animacja tarczy/gardy)
   - E interakcja, I lub Tab ekwipunek, Esc NIE może być jedynym wyjściem z paneli
3. PIERWSZA MAPA — "Emerald Vale" (ładny świat, to jest priorytet wizualny):
   - teren ~200x200m: łąka z proceduralnym heightmap (łagodne wzgórza), ścieżka gruntowa do wioski, strumień/jeziorko z animowaną wodą (shader lub scrolling normal), skały, drzewa low-poly (instancing, 100+), trawa (instanced billboards/patches), kwiaty
   - wioska startowa: 3-4 chatki, ognisko z particle fire, płot, NPC-mentor (stoi przy ognisku)
   - oświetlenie: słońce kierunkowe + cienie (PCFSoft, rozsądny shadow map budget), hemisphere ambient, mgła dystansowa, skybox/sky gradient z chmurami, bloom lekki (postprocessing tylko jeśli fps pozwala)
   - granice mapy: naturalne (skały/las), niewidzialne ściany z komunikatem
4. MOBY (min. 2 typy):
   - Slime/goblin (melee, patroluje, aggro w promieniu, atakuje z windup telegraph, HP bar nad głową)
   - Wilk/szkielet (szybszy, okrąża gracza)
   - 6-10 mobów na polanie za wioską; death = particle dissolve + drop loot (moneta/mikstura/item na ziemi do podniesienia E)
   - respawn po 30s; moby NIE wchodzą do wioski
5. EKWIPUNEK I ITEMY:
   - panel Inventory (I/Tab): siatka 5x4, ikony itemów (renderowane z modeli 3D do canvas thumbnail lub proste ikony 2D), tooltips ze statami
   - sloty wyposażenia: broń, tarcza, zbroja (min. te 3) — zmiana broni widoczna na modelu postaci
   - itemy startowe + dropy z mobów: 2 miecze (zwykły/lepszy), tarcza, mikstura HP (użycie z paska), monety
   - hotbar 1-4 na mikstury/skille (na razie mikstura)
   - HUD: HP bar gracza, staminy (sprint/atak zużywa), poziom+XP bar, minimapa NIE jest wymagana
6. TUTORIAL PORUSZANIA (w gameplayu, wizualny, skippable):
   - sekwencja kroków z podświetlanymi podpowiedziami: WASD → mysz (rozejrzyj się) → Space (przeskocz płotek) → sprint → LPM (uderz manekin treningowy) → PPM blok → E (podnieś miecz z ziemi) → I (otwórz ekwipunek, załóż miecz) → "porozmawiaj z mentorem" → mentor wysyła na polanę zabić 3 slimy → nagroda + KONIEC M1 ("More adventures coming soon" + wolna eksploracja)
   - każdy krok znika po wykonaniu, licznik postępu, przycisk Skip tutorial
7. XP/LEVEL: zabicie moba daje XP, level up = +HP +dmg, efekt wizualny + dźwięk
8. AUDIO: WebAudio syntezowane (kroki, świst miecza, hit, blok, level up, ambient wiatr/ptaki) — zero plików audio; master gain + mute przez SDK settings
9. WYDAJNOŚĆ: 60fps na średnim sprzęcie — instancing dla roślinności, frustum culling (three robi sam), LOD lub ograniczony draw distance mobów, cap devicePixelRatio 2, particle pools. Test: 120s soak bez spadku poniżej 30fps w headless.

## Debug hook (obowiązkowy, ?debug=1)
window.__astro = { getState: () => ({state, pos, hp, stamina, level, xp, mobs:[{type,hp,dist}], inventory, equipped, tutorialStep, fps}), teleport(x,z), giveItem(id), killMob(i), setHp(n), completeTutorialStep(), forceGameOver() } — bez tego testy są ślepe.

## Testy (Playwright + /usr/bin/google-chrome, serwer własny na porcie 0 albo 8701)
- tests/e2e.mjs: boot bez błędów konsoli, canvas renderuje niepuste piksele (WebGL: screenshot + jasne piksele), pointer lock po kliku, WASD zmienia pozycję (event.code z key='z' AZERTY test!), Space podnosi Y, atak zabija moba (przez debug teleport do moba), loot pickup, inventory otwiera się na I i przyciskiem, tutorial kroki przechodzą, save/load level
- tests/viewport.mjs: 10 oficjalnych rozmiarów CG (907x510, 1216x684, 1077x606, 821x462, 1366x768, 1920x1080, 1536x864, 1280x720, 800x450, 1080x607) — canvas wypełnia >=98% okna, brak błędów
- tests/soak.mjs: 120s przyspieszonej gry, fps>=30, bounded particles/entities
- package.json scripts: test:e2e, test:viewport, test:soak

## Proof
qa/M1_PROOF.md: co zbudowane, źródła assetów CC0, komendy+exit codes, screenshoty 907x510 i 1920x1080 (wioska, walka, ekwipunek, tutorial), rozmiar dist. Commity logiczne (scaffold/world/character/combat/inventory/tutorial/tests). NIE rób git push, NIE twórz repo GitHub.

## Jakość wizualna — GATE
Świat ma wyglądać jak nowoczesna gra 3D z 2024+, nie tech-demo: spójna paleta (soczysta zieleń/ciepłe światło "golden hour"), miękkie cienie, mgła, gęsta roślinność, zero pustych płaskich połaci, postaci z animacjami (nie ślizgające się kapsuły). Jeśli KayKit/Quaternius się nie pobierze — zbuduj postaci ręcznie z prymitywów, ale z pełną animacją proceduralną (chód z wahadłem rąk/nóg, atak z zamachem).
