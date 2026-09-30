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
| World | Streaming and persistent exploration | Richer towns, interiors, terrain, underground areas and world events |
| Items | Original registry and functional use/equipment | Condition, spoilage, fluid volumes, attachments and distinct instances |
| Survival | Needs, bleeding, infection, armor and clothing | Detailed wounds, treatment, temperature, sleep and disease |
| Combat | Noise/sight zombies, animated melee, firearm recoil and ammunition | Richer weapon handling, advanced AI and balance |
| Crafting and shelter | Recipes, tools, campfires and defenses | Full construction, destruction, workstations and materials |
| World simulation | Day/night and persistent chunks | Power, water, fire, farming, animals and ecological systems |
| Mobility | Walking, sprinting, sneaking, driving, fuel and collision damage | Vehicle maintenance, seats, passengers, storage and richer physics |
| Progression | Item-driven capabilities | Professions, traits, skills, learning and long-term goals |
| Social systems | Survivors, raiders, trading, recruitment and companion combat | NPC communities, deeper relationships, inventories and multiplayer |

This record defines the engineering direction. Completion must be assessed through working systems and playtesting, not item counts or map dimensions alone.

## Presentation update in 0.3

The renderer shows the loaded terrain and entities throughout its viewport, independent of explored tiles and player line of sight. Simulation collision, targeting and AI line of sight retain their existing rules. The minimap shows the whole active neighborhood. Ground and upper floors remain separate scenes.

`Effects` owns per-run animation poses and a bounded event queue in a WeakMap, with no saved fields or simulation RNG calls. The engine emits events for accepted actions and measures actual movement before world rebasing. The renderer reads poses; the browser loop drains events into an original Web Audio graph. Audio has a master mute gain, compressor, a 40-voice cap, and two reusable ambience/engine sources that stop while paused or in menus. A local fixed noise stream supplies sound textures independently of the world seed.
