# Changelog

## 0.6.0

- Add a first-person view beside the top-down one: press P, use the eye button next to Pause, or pick it under Game feel. A raycast pixel-art scene draws the same themed walls, doors, windows, trees, survivors, zombies, cars and supplies, with ceilings indoors, a sky that follows the hour and weather, walls that hide what is behind them, a weapon or dashboard in view and a view cone on the minimap. W/S walk along the view, A/D strafe, the arrows or a captured mouse turn (with a Look sensitivity setting), and touch players drag the right side to look and tap to strike; the engine still receives ordinary aim points, so saves, combat and multiplayer are unchanged.
- Add touch controls for phones and tablets. Drag the left side to move or drive; drag the right side to aim and attack, or tap to strike toward a point. Use, Swap, Run and Sneak buttons cover the remaining on-foot actions, and Drive appears beside a car because a nearby survivor or pet otherwise takes Use, as it takes E. Touch feeds the ordinary input snapshot, so singleplayer and multiplayer receive the same commands as keyboard play.
- Fit short landscape screens: a compact HUD and a two-column title keep Start, the hotbar and the vehicle panel visible at phone sizes.
- Fix attacks that kept running after pressing and releasing both mouse buttons, Space held into a death or pause screen activating its focused button, focus escaping Pack and Journal after clicking dialog text, an unfocused pause menu, Escape closing a hidden conversation instead of resuming, the Neural activity toggle capturing Space, held movement keys ignored after closing a menu, and silent refusals for Eat, Drink and Bandage.
- Ask before New run in the pause menu replaces the only local save. Do not offer a finished run as Continue. Correct the field guide's autosave interval.
- Repaint the minimap from a reused pixel buffer only when tiles change, removing about 37,000 canvas calls every quarter second, and size it after it becomes visible.
- Stop writing saves the game then refuses to load. Autosave keeps one slot, so each of these could end a run: a barricade built over the survivor, a car stopped against a wall corner, a door closed onto a ground pile, a looted stack above 1,000, more than 360 zombies in the active area, and leaving town while the radio transmits. A survivor saved inside a wall now loads at the nearest clear tile, and emptied ground piles from older saves are dropped instead of rejected.
- Barricades and doors check collision boxes, so they can no longer seal in the survivor, a companion or a pet. Emptied ground piles are removed and stop counting toward the area's 60-pile limit. Reload needs the firearm itself. Companion work and morale records drop departed recruits, so job assignment keeps working past 64 companions. Ground piles keep their labels through travel and saves.
- AI play no longer retries a container it cannot empty forever, and treats injuries with the supplies it carries instead of repeating a refused bandage.
- Cache each journaled sector's export while it is unchanged: an autosave with 1,800 recorded sectors drops from about 560 ms to about 50 ms.
- Multiplayer hosts resist lockout and overload: a full roster of 64 survivors admits a newcomer by replacing the one offline longest, unauthenticated sockets have their own per-address budget and a 2-second deadline, actions mark the world for the next tick instead of each sending a full snapshot, join and leave saves are coalesced, and joins are rate limited per address. Owner and nearby roles are badges a name cannot imitate, guests can only locate themselves, and owners can `/forget` an offline survivor.

## 0.5.0

- Expand the original catalogue to 3,455 items and 4,457 crafting and salvage recipes across 38 families. Add ingredient preparations, metal/timber/textile processing, material weapons and field tools, protective garments, carrying designs and ranged assemblies. Retain existing IDs and saved runs.
- Give extension loot a bounded share of location-specific tables. Connect new tools to existing crafting and project prerequisites, mining, companion gathering and terrain destruction; retain kept tools after payment.
- Page the catalogue and pack at 48 rows and crafting at 24. Add family/tier filters, exact-ID and material searches, acquiring instructions and recipe navigation, with cached indexes and stable idle rendering.
- Add an original adaptive four-theme music score and independent music, effects and ambience switches/sliders, alongside master sound/volume. Persist settings and stop continuous audio immediately on menus, pause, hiding and leaving the game.
- Add real generated-world item sampling, transaction/equipment regression checks, desktop/mobile catalogue testing, independent Web Audio waveform checks and a keyboard/mouse playthrough before publication.

## 0.4.0

- Add World and Nearby text chat, an input-safe command console in singleplayer and multiplayer, and separate owner-key authorization for moderation and world controls. Persist survivor identity bans on the host.
- Add opt-in direct proximity voice with hold-N transmission, distance attenuation, mute/deafen controls and microphone/peer cleanup on leave. Add optional local HTTPS/WSS hosting with operator-provided certificates for secure voice access.
- Add locally hosted multiplayer worlds for up to 20 connected players, separate survivor packs, validated commands, shared loot and persistent host saves. Include public server browsing, private invite codes and an optional expiring directory service.
- Add AI play with immediate manual handoff and a visible local neural steering network trained on seeded practice and actual movement feedback.
- Add robbery, survivor resistance, corpse weapon/ammunition/supply drops, saved drop depletion, danger fleeing and fighting that attracts bounded undead migrations. Increase new road-sector zombie populations.
- Give building types distinct materials, signs and procedural furniture; add birds, insects, night ambience, water detail and claimed-home smoke without consuming gameplay RNG.

- Connect scavenging, manual study and survivor requests to insight and six projects: salvage, field care, reinforced shelter, vehicle repairs, rain collection and supply scanning.
- Add four practice skills with five earned levels and actual combat, barricade, treatment and repair bonuses. Study each of six manuals once while retaining its reference uses.
- Give survivors finite daily bandage stock, daily supplies requests, saved trust and short local routes. Helping earns supplies and insight and strengthens trusted companions' attacks; hostile actions erase trust.
- Add fatigue and safe shelter sleep, plus seeded rain fronts, migrating dead and traveler caches after the opening minutes of open-world play.
- Add Journal [J] with skills, projects, people, a 120-event daybook, searchable field guide and Atlas with saved pointer/keyboard navigation markers. Remember progress, contacts, routes, event timers and tracked supplies through validated saves; migrate older saves with fresh progression.
- Simplify the default HUD, separate Pack/Crafting/Catalogue panes, explain missing requirements, preserve keyboard dialog focus and clear held input across menus. Keep one immediate interaction prompt and brief notices.
- Add persistent sound volume, 70% to 150% camera zoom, ambient motion and HUD detail preferences, plus fullscreen. Ambient motion respects the initial reduced-motion preference without removing attack feedback.
- Add seven original resources/tools/seeds and four recipes, bringing the catalogue to 219 items and 65 recipes. Mine deterministic surface stone, iron and copper deposits; retain partial damage and exhaustion.
- Establish a fixed home with a 150 kg stockpile, plant up to 24 carrot plots, grow crops through moist simulation time, and assign companions to follow, guard, gather or farm. Stored food supports saved morale that affects work and combat.
- Recruit up to twelve companions. Build reputation and alliances with three factions, request reinforcements using stored rations, and trigger staged horde or raider battles within bounded crowds of 360 zombies and 128 humans.
- Save original appearance presets and up to two dogs/cats. Befriend and feed pets, choose Follow/Stay, receive nearby comfort and dog warnings, and retain positions through saves and travel.
- Require every JavaScript source to be assembled once with one explicit namespace owner. Reject orphaned, duplicated, missing and misplaced modules before publishing.
- Document the Fins influences and original implementations. No Fins source or art is copied into the MIT game.

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
