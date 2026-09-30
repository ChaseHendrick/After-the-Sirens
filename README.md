# After the Sirens

[![Build and browser checks](https://github.com/ChaseHendrick/after-the-sirens/actions/workflows/ci.yml/badge.svg)](https://github.com/ChaseHendrick/after-the-sirens/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An original open world zombie survival game. Leave the town of Morrow, follow roads through farms, forests, riverside settlements, suburbs, and industrial districts, loot buildings, drive cars, and travel with other survivors.

[Play in your browser](https://chasehendrick.github.io/after-the-sirens/) · [Download a release](https://github.com/ChaseHendrick/after-the-sirens/releases) · [Item catalogue](CATALOGUE.md) · [Roadmap](ROADMAP.md)

![Gameplay in Morrow](docs/gameplay.png)

**Version 0.3 is an early playable game.** It is inspired by the survival genre and built from original code, procedural visuals, world layouts, and synthesized sounds. It is not a complete recreation of Project Zomboid and does not contain that game's code, maps, assets, or item definitions. The catalogue contains 212 original items and 61 recipes, with collectible ingredients clearly identified.

## Play

Open the demo above, or download `After-the-Sirens.html` from a release and open it in a desktop browser. The entire game is bundled in one file. Playing needs no installation, account, server, external assets, or network connection.

Choose **Open world** to explore and survive freely. The optional radio mission continues into free survival after completion. Choose **Rescue mission** for the compact original town scenario: find five radio parts, repair the relay, and survive until rescue arrives.

Chrome is tested. Other modern desktop browsers may work, but have not all been validated. Keyboard and mouse are required; mobile-sized layout checks do not establish touch play support.

Local autosave and Continue are available. **Export save** keeps a portable JSON copy. Export regularly, especially when using local files, because browsers can restrict or clear local storage.

![Searchable original item catalogue](docs/catalogue.png)

## Visibility, animation and sound

The entire surrounding area and loaded minimap are visible as you travel, including unexplored terrain, interiors, supplies, cars and people. Roofs stay cut away. Night uses a gentle uniform tint. Walls still block movement, attacks and AI sight; seeing a target does not let you attack through a wall. Each floor shows its own scene.

Axes, machetes and bats swing with a visible arc; spears and knives thrust. Walking animates the feet, and guns recoil with a muzzle flash. Successful attacks animate even when they miss. Failed attacks and reloading do not create phantom swings.

Original Web Audio sounds cover footsteps, melee swings, gunfire, reloads, flesh/wood/stone/glass impacts, doors, looting, climbing, nearby zombie growls, wind, rain and a car engine whose pitch follows speed. Sound starts after a click or key press. Toggle **Procedural sound** in the pause menu to mute everything; ambience stops while paused or in a menu. All sounds are generated locally without downloads.

![Axe, machete and spear attack frames](docs/combat-animation.png)

## Seeded worlds

Enter a numeric **World seed** on the title screen. Seed `0` is valid. With the same seed and difficulty, generation reproduces the same terrain, business types, loot, cars, human spawns, and upper floors. Each sector uses a coordinate-derived RNG stream, so exploring sectors in a different order does not change their initial contents. Roads and building footprints follow authored procedural templates.

Saves store the world seed and the current simulation RNG state, along with persistent changes. Continue or import resumes the existing run instead of rolling a new world. Share a seed for the same initial world; share an exported save for your exact progress.

## Controls

| Action | Control |
| --- | --- |
| Move | WASD or arrow keys |
| Aim | Mouse |
| Attack with equipped weapon | Left click or Space |
| Fire gun | Right click |
| Sprint / sneak | Shift / C |
| Loot, door/window, radio, talk | E |
| Pack, searchable catalogue, crafting | I |
| Eat / drink / bandage / reload | 1 / 2 / 3 / 4 |
| Reload / switch weapon | R / F |
| Place barricade | B |
| Enter or exit nearby car | V |
| Refuel nearby stopped car | G, with fuel in your pack |
| Accelerate / brake and reverse | W / S while driving |
| Steer | A / D while driving |
| Climb or descend near stairs | Page Up / Page Down, or HUD buttons |
| Pause or close a menu/conversation | Escape |

## What is playable

- A seeded world streams a 3 by 3 window of 64 by 64 tile sectors. Roads connect six regional styles. Doors, loot, explored areas, structures, zombies, cars, and people persist as you travel.
- Houses and businesses contain supplies. Buildings have two or three accessible floors, stair markers, and upper-floor loot that survives revisits and saves.
- Cars support entering, exiting, acceleration, steering, reversing, fuel consumption, refueling, collision damage, and zombie impacts. Stop before getting out.
- Survivors can trade a ration for a bandage or join you for a ration. Up to three companions follow and fight nearby zombies. Raiders attack, and attacking a survivor turns them hostile.
- Melee and firearms use item-specific damage, range, attack timing, stamina costs, magazines, and ammunition. Machetes, axes, spears, and several gun types are available.
- Hunger, thirst, stamina, bleeding, infection, protective clothing, backpack capacity, day/night, crafting stations, and simple defenses shape survival.
- Chop trees, break walls with heavy tools, and bash doors with repeated melee strikes. Open or smash windows, then climb through when the opposite side is clear. Broken glass can cause cuts. Terrain changes and partial damage persist.
- Search the catalogue without receiving free items. Owned equipment can be used, equipped, and dropped; dropped supplies can be recovered.
- Import/export saves, autosave, a minimap, pause menus, keyboard menu access, procedural gameplay audio, and a performance overlay are included.

The world has explicit bounds: sector centers from -128 to 128 and a journal budget of 2,048 generated sectors per save, including the active neighbors. Upper-floor journals have a separate budget of 512 visited buildings. The active terrain stays bounded at 192 by 192 tiles. This is a large procedural sandbox, not an unlimited world. The game explains when the journal or map boundary is reached.

NPCs and cars are intentionally simple in this version. Companions remain in their current sector when they fall outside the loaded window. They do not teleport into a speeding car. Higher floors use the current building's footprint; there are no rooftop jumps or shooting between floors. Actors on other floors pause until you return, and zombies do not pursue between floors yet. See [the roadmap](ROADMAP.md) for remaining depth.

## Build and test

Playing needs only a browser. Development uses Python 3 and Node.js 22 or newer.

```sh
git clone https://github.com/ChaseHendrick/after-the-sirens.git
cd after-the-sirens
python3 build.py
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

`build.py` writes `index.html` after syntax and namespace checks. `--output path/to/After-the-Sirens.html` also writes a standalone copy. It does not need npm dependencies. Set `NODE_BIN` if Node is outside your PATH. Browser tests use Playwright's installed Chromium by default; set `CHROME_BIN` to test another compatible Chrome executable.

To run through HTTP locally:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. CI runs the build, simulation checks, save validation, and real-browser interactions. GitHub Pages deploys the built game after checks pass on `main`.

## Source layout

| Module | Responsibility |
| --- | --- |
| `src/catalog.js` | Items, recipes, loot tables |
| `src/world.js` | Deterministic sectors, streaming and journal persistence |
| `src/stories.js` | Floor transitions and upper-floor journals |
| `src/engine.js` | Survival, combat, crafting, interactions, validated saves |
| `src/vehicles.js` | Driving, collision, fuel |
| `src/destruction.js` | Terrain damage, resources and window traversal |
| `src/actors.js` | Survivors, raiders, trade, following and combat |
| `src/effects.js` | Transient attack poses, footsteps, bounded events and Web Audio |
| `src/renderer.js` | Fully visible Canvas world, animated characters and camera |
| `src/ui.js`, `src/ui.css` | Menus, inventory, dialogue and HUD |
| `src/main.js` | Input, fixed-step loop, presentation integration and browser storage |

Each module registers once under `window.Sirens`. [Architecture](ARCHITECTURE.md), [validation](VALIDATION.md), [release notes](CHANGELOG.md), and [contribution instructions](CONTRIBUTING.md) describe the implementation and its limits.

## License

[MIT](LICENSE). Contributions must be original or have a compatible license. Project Zomboid belongs to its creators; this project is independent and unaffiliated.
