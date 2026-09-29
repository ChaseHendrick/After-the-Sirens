# Validation

Validated September 29, 2026. These results describe version 0.2 of this original browser game. They do not measure improvements to another game.

## Simulation and saves

The Node suites cover the original rescue game, the streamed world, and expansion systems. All use production update, action, and save APIs.

- Twenty original town seeds have walkable spawns, reachable supplies and sufficient radio parts. Generation and movement are deterministic and finite.
- Three standard-difficulty automated rescue playthroughs use ordinary movement, doors, scavenging, combat and waves. They finish in approximately 195 simulation seconds with 34 to 39 zombie kills and 100 health in the final run. This is an ideal automated player's result, not human difficulty or session-length evidence.
- Four normal world-seam crossings preserve global coordinates, doors, loot, built defenses and exploration. Returning and reloading do not duplicate active zombies.
- Generic consumption, original melee weapons, armor, backpacks, recipe costs, tools and crafting stations produce actual effects.
- Seed checks compare full generated worlds, sector generation in different discovery orders, seed zero, and simulation continuation after save/restore. Generated loot plus crafting reaches the full original catalogue.
- Destruction checks cover door bashing, tree resources, heavy-tool wall damage, window traversal, blocked landings, glass injuries, and damage/destroyed terrain surviving world and floor saves.
- Vehicle fixtures test acceleration, reverse, moving steering, fuel consumption, empty tanks, collision damage, safe exit, refueling and a real procedural sector crossing with saved car identity and fields.
- Human fixtures test exact trade and recruitment costs, weight limits, following around obstacles, companion combat, raider line of sight, armor, injury, hostility, dead-human persistence, and one zombie bite timer with three nearby humans.
- Floor fixtures test climbing, upper-floor looting, doors, construction, dropped items, upstairs saves, return to ground, building revisits, and journals surviving sector departure. They verify that upper-floor arrays do not leak into ground persistence.
- Invalid items, coordinates, entities, world journals, vehicles, humans and floor data are rejected. Legacy version 1 rescue saves and expanded version 2 saves are supported.

Fixture tests deliberately isolate behavior or supply entities. They are separate from the three natural automated rescue playthroughs and the normal seam-travel check. They do not establish long-term balance or survival difficulty.

## Integrated browser checks

Twenty-eight integrated checks passed in installed Chrome 154.0.8037.58, headless, opening the actual assembled game through `file://`.

The original suite covers keyboard start, WASD and looting, inventory pause, crafting, construction, quick-action focus, local saves after a full reload, export/import and invalid imports, death/title/restart/victory, and finite keyboard/pointer stress. Inventory layouts were exercised at 390x844, 700x300 and 3400x700 without horizontal document overflow.

The expansion suite uses explicitly labeled safe road, survivor and staircase fixtures, then actual V/W/S/G inputs, Page Up/Down, E, dialogue buttons, Escape, catalogue filters, downloads and file import. Exporting upstairs and importing into a fresh run restores the floor, changed car, inventory and recruited companion on returning downstairs.

The dedicated destruction suite adds eight actual keyboard/mouse checks: axe door bashing, intact and broken window climbing, glass smashing, tree resources, sledgehammer wall destruction, terrain after full reload, and a controlled lethal-glass death/restart. Controlled placements and RNG fixtures are labeled in the test.

All three suites reported no page errors or HTTP network requests. A short local observation at 1440x960 was about 60 FPS, 16.7 ms average frame interval and 16.8 ms p95. This is not a cross-device benchmark. Safari, Firefox, touch play and multiplayer have not been validated. Mobile-sized layout tests establish layout behavior only.

The README gameplay screenshot was captured after actual keyboard movement, looting and entering an original generated car. It is a real render of the shipped game. The catalogue screenshot displays the real registry through its UI.

## Build and CI

`build.py` checks JavaScript syntax and exactly one registration per system. Tests reject deliberately duplicated exports and HTML script terminators, then compare a fresh build with committed `index.html` to catch stale artifacts.

Run `python3 build.py`, `npm test`, and `npm run test:browser`. GitHub Actions runs these on Linux with Playwright Chromium, then deploys GitHub Pages after success. Local Chrome results and the actual CI run are distinct evidence; the workflow's status is visible on GitHub.

## Scope

A bounded procedural open world, 212 original catalogue items, 61 recipes, simple vehicles, accessible building floors and simple NPC survivors/raiders are implemented. The [README](README.md) lists world and journal budgets. [ROADMAP.md](ROADMAP.md) describes further depth, including farming, power, richer NPC communities and multiplayer. Full commercial-game parity is not established.
