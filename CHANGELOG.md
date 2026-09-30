# Changelog

## 0.3.0

- Show all surrounding terrain, interiors, loot and actors without exploration or line-of-sight render masks. Reveal the full loaded minimap and keep roofs cut away.
- Replace the small night light pool and heavy vignette with a gentle tint across the viewport.
- Animate melee swings, weapon-specific silhouettes, spear/knife thrusts, walking strides, gun recoil and muzzle flashes.
- Add original procedural audio for gameplay, material impacts, footsteps, weather, nearby zombies and speed-responsive car engines.
- Respect mute and pause/menu states; bound audio voices and transient event queues. Presentation uses separate state and does not consume simulation RNG or change save schemas.
- Add eight presentation/simulation checks and ten integrated pixel, input and Web Audio checks. Retain the previous gameplay suites.

## 0.2.0

- Added a persistent streamed procedural world and an open world mode.
- Added 212 original catalogue items, 61 recipes, regional loot tables, inventory searches and metadata-driven equipment effects.
- Added drivable cars with fuel, damage, refueling and saved positions.
- Added accessible upper floors, stairs and persistent floor loot.
- Added survivors, raiders, trading, recruitment and companion combat.
- Added persistent terrain destruction, door bashing, window opening/smashing and climbing.
- Verified seeded worlds and simulation RNG continuation through saves.
- Preserved the original rescue mission and legacy version 1 saves.
- Added public source documentation, portable tests, CI, Pages deployment and MIT licensing.

## 0.1.0

- Original compact Morrow town with zombie survival, a radio rescue objective, looting, crafting, defenses, day/night, local saves and original Canvas art.
