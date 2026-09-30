# ADR-001: Persistent streamed world and data-driven survival content

**Status:** Accepted for the first expansion

**Date:** September 29, 2026

**Deciders:** Implementation team, within the user's request for an original full open world and item catalogue

## Context

The first build used a 64x64 tile town and seven inventory item types. The user requested an open world with substantially more survival content and approved an original item catalogue. A larger static array alone would increase memory and save size without providing a scalable persistent world.

## Decision

Generate deterministic 64x64 tile chunks with coordinate-derived seeded RNG streams and simulate an active neighborhood around the player. Persist changes to visited chunks, including looted containers, doors, defenses, exploration, zombies, cars, and human survivors. Higher floors have a separate building journal. Keep rendering and collision data local to the active neighborhood and track a global world origin separately.

Move items, recipes, loot, and gameplay effects into a registry. Generic engine actions consume or equip a registry item, and UI reads the same costs, effects, and prerequisites that the engine applies.

## Options considered

| Option | Complexity | Memory and saves | Continuity | Decision |
| --- | --- | --- | --- | --- |
| One much larger static map | Low initially | Grows with total world area | Continuous | Does not meet long-term scaling needs |
| Separate disconnected towns | Moderate | Bounded per town | Requires explicit travel transitions | Rejected for the requested continuous open world |
| Deterministic chunks and persistent changes | Higher initially | Active simulation stays bounded; save growth follows visited changes | Continuous across chunk edges | Chosen |
| Start a new native engine project | High migration cost | Depends on implementation | Appropriate for a future production build | Deferred until this world's behavior is tested |

## Consequences

- Content can grow independently of inventory and combat code.
- Ordinary exploration no longer ends at the original map border.
- Chunk boundaries, stable entity identity, persistence, and camera coordinates need explicit tests.
- Saves need a new validated schema and compatibility with the original scenario.
- An open world and item registry are foundations. They do not establish parity with a commercial game.

## Full-game requirements

| System | Current work | Further requirements |
| --- | --- | --- |
| World | Streaming, persistent exploration and three recurring world events | Richer towns, interiors, terrain, underground areas and regional consequences |
| Items | Original registry and functional use/equipment | Condition, spoilage, fluid volumes, attachments and distinct instances |
| Survival | Needs, fatigue, shelter sleep, bleeding, infection, armor and clothing | Detailed wounds, temperature, exposure and disease |
| Combat | Noise/sight zombies, animated melee, firearm recoil and ammunition | Richer weapon handling, advanced AI and balance |
| Crafting and shelter | Recipes, tools, campfires and defenses | Full construction, destruction, workstations and materials |
| World simulation | Day/night and persistent chunks | Power, water, fire, farming, animals and ecological systems |
| Mobility | Walking, sprinting, sneaking, driving, fuel, collision damage and learned field repairs | Vehicle parts, seats, passengers, storage and richer physics |
| Progression | Four practice skills, six connected projects and one-time manual study | Professions, character traits, broader learning and long-term goals |
| Social systems | Survivors, raiders, finite daily trades, requests, saved trust, short routes and companion combat | NPC communities, deeper relationships, full inventories and richer faction economies |

This record defines the engineering direction. Completion must be assessed through working systems and playtesting, not item counts or map dimensions alone.

## Presentation update in 0.3

The renderer shows the loaded terrain and entities throughout its viewport, independent of explored tiles and player line of sight. Simulation collision, targeting and AI line of sight retain their existing rules. The minimap shows the whole active neighborhood. Ground and upper floors remain separate scenes.

`Effects` owns per-run animation poses and a bounded event queue in a WeakMap, with no saved fields or simulation RNG calls. The engine emits events for accepted actions and measures actual movement before world rebasing. The renderer reads poses; the browser loop drains events into an original Web Audio graph. Audio has a master mute gain, compressor, a 40-voice cap, and two reusable ambience/engine sources that stop while paused or in menus. A local fixed noise stream supplies sound textures independently of the world seed.

## Connected survival and menus in 0.4

`Progression` owns four bounded practice counters, six projects, studied manuals, fatigue/sleep, persistent survivor contacts, world-event timers, navigation/supply tracking and a 120-entry causal journal. Skills and projects change actual engine behavior: melee stamina cost, new barricade strength, useful treatment, field repairs and rain collection. The initial salvage project opens branches rather than providing an immediate numerical bonus. The resolute trait rejects melee robbery threats; broader personality simulation remains future work.

Insight comes from distinct supplies containers, one-time manual study and daily survivor requests. Container identities include global coordinates, floor and the generated container ID. Ground drops and traveler caches grant no exploration insight. Contact identities reuse stable world human IDs; their positions and routes use global coordinates so world recentering cannot move remembered destinations. Trade stock is three bandages per contact per day, independent of request rewards. Requests are deterministic templates selected from the human ID and seed. Up to 4,096 contact records and 4,096 container insight records fit in a save.

Project, request, ability and crafting quotes supply availability and missing-requirement messages to both menus and actions. Costs are checked before mutation; kept tools and books are distinct from consumed materials. Request rewards and crafted results must fit carrying and per-item limits. No catalogue entry grants supplies. Practice is earned from useful actions, and repeated study or recovering one's own drops cannot produce extra insight.

Open-world events are chosen from a seed-and-serial hash after the opening 180 seconds of simulation, then approximately every 180 seconds while on the ground floor. Rain lasts 75 seconds and restores the previous weather. Migration adds a bounded number of zombies using the saved simulation RNG. A traveler cache creates an ordinary persistent ground container and a tracked location. Upstairs scenes and blocking menus defer events. The event schedule and its state survive saving, so reload does not reset the countdown.

The optional `progression` field extends the existing game save schema with its own version 1 record. Older saves receive a fresh progression record when the field is absent. Imported records validate finite ranges, project prerequisites, duplicate studies, bounded record counts, contact IDs, timestamps and tracked targets. A field's presence does not bypass validation. Transient animation and audio remain outside saves.

`Journal` renders skills, projects, people, the daybook, field guide and Atlas from simulation state. The Atlas displays loaded terrain and the nearest 24 recorded sectors, with pointer and keyboard marker placement. Marker coordinates are global and floor-aware; rendering converts them back to the current scene. Imported names and journal text are escaped before rendering. `UI` controls dialog focus, compact/detailed HUD state and separate pack panes. `App` clears held inputs on menu transitions and stops simulation updates while any blocking menu is open. Sleep therefore proceeds after the player closes the menu, with movement and danger evaluated by the simulation rather than wall-clock timers.

Sound, volume, camera zoom, ambient motion and HUD detail settings persist separately from game saves in browser storage. Input aiming accounts for the camera's zoom transform. Ambient motion can stop weather and decorative animation without changing gameplay or attack feedback, and defaults to the browser's reduced-motion preference. Fullscreen uses the browser API and reports unavailable support rather than changing simulation state.

## Complete module wiring

The offline build lists its JavaScript modules in dependency order and maps each file to one namespace owner. Before assembling, it compares that list with every JavaScript file beneath `src`, rejects duplicate entries, missing files, orphaned files and invalid paths, and checks that each source registers only its assigned `window.Sirens` system. The syntax check runs before `index.html` is written. Regression checks plant disconnected and misplaced code and reproduce the committed HTML from source.

All runtime JavaScript and CSS are inline in one HTML document. There are no separately cached runtime bundles to synchronize. The wiring and persistent-consequence ideas draw on Fins, with original code and no copied source or assets; see [Fins integration notes](FINS-INTEGRATION.md).

## Adaptive control, local multiplayer and lobby discovery

`Neural` implements a 6-8-1 tanh multilayer perceptron and bounded backpropagation. `Autoplay` owns its own pilot state, seeded synthetic training, recent movement/damage feedback, constrained steering scores, route cache and command budget. It emits normal input and action strings; `App` applies them through production dispatch. Manual input revokes control. Neural parameters are session-local and do not consume the world's simulation RNG. Synthetic teacher error is not evidence of general intelligence or superior survival.

The Node world host loads production simulation modules in an isolated VM. Its fixed-step world advances once for up to 20 connected survivors; extra players use the engine's participant step rather than updating world time and AI again. Commands have validated fields, monotonic sequence numbers, per-connection rate limits, a bounded payload and stale-input timeout. Packs and opaque identity hashes persist atomically on the host. The browser consumes authoritative snapshots and retains presentation continuity between them.

`Lobbies` validates directory metadata and private invite encodings; `NetworkUI` exposes explicit public selection and private joins. A curated website catalogue is separate from the optional Node directory, whose operator-authorized heartbeat records expire after three minutes. Hosts simulate their worlds locally. Discovery does not provide NAT traversal or relay transport. The current world window follows one anchor and is ground-floor only; guest contact danger is separately checked. These constraints precede independent region simulation and richer multiplayer authority.

Human robbery/death records extend validated contact memory with optional booleans for migration. Ground containers hold actual belongings; transfers and death drops cannot duplicate surrendered stock. Open-world ecology clocks are bounded saved fields. Extra seeded road populations are generated after terrain and loot, preserving map templates. Distinct building materials, drawn furnishings and wildlife decoration use presentation hashes and clocks without changing terrain collision or gameplay RNG.
