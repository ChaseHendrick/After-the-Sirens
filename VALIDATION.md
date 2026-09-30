# Validation

Validated September 30, 2026 for version 0.5. This is an original early playable browser game, not commercial-game parity.

## Production simulation and saves

**209 grouped game/server Node checks** passed, plus the catalogue export check and Python module/build reproducibility guard (211 passing groups in the full command). The suites use production updates, actions and validated save APIs. Controlled fixtures are labeled separately from natural generated-world play.

Coverage includes reachable towns across 20 seeds, three standard-difficulty automated rescue playthroughs, four normal sector crossings, deterministic full worlds and RNG continuation, all 3,455 items and 4,457 recipes, exact consumption/crafting/building costs, terrain destruction, windows, drivable cars, floor persistence and malformed-save rejection. The three automated rescue runs finish at approximately 195 simulation seconds with 33, 35 and 37 zombie kills and full health in this run. These are ideal automated controls, not human difficulty measurements.

The new checks cover four skills and six projects, one-time manual study, finite daily trade stock and requests, saved contacts and trust, sleep/fatigue, field repair/rain collection/scanning, seeded events and global map markers. Settlement coverage includes deterministic depleted deposits, crop moisture/growth/harvest, exact stock transfers, worker tools and deliveries, morale and validated persistence. Appearance, pets, twelve recruits, faction alliances, allied reinforcement, opposed human combat and staged battles use real state changes. Fifty-eight adversarial extension fixtures reject impossible progression, settlement, personal and warfare records.

Living-world checks exercise once-only corpse weapon and supply drops, robbery followed by death without duplicated goods, refusal, stale conversation rejection, actual E collection, full-pack retention, fleeing/defending, noise response, regular migration, larger seeded road populations and durable drop history. NPC goods remain a bounded allowance, not a full economic simulation.

## Thousand-item catalogue

Fifteen additional Node groups validate immutable identities/statistics, every recipe reference and full loot-to-craft reachability, actual multistage crafting, tool substitution and retention, atomic capacity/stack rejection, protection, carrying capacity, mining, destructive bonuses, ranged reload/fire and generated-world save restoration. Sampling 13,311 real containers across 64 seeds observes all 484 directly lootable IDs, 485 distinct items including scenario supplies, six biomes and 38 location labels. This verifies the catalogue and generated acquisition paths; it is not a human collection-time or late-game balance study.

Fourteen catalogue browser groups verify 48-item and 24-recipe page caps, later/final pages, category/family/tier and exact-ID filters, ingredient searches, obtain-to-recipe navigation, real paid crafting and reusable aliases, stable idle DOM, pack page clamping and a 390-pixel keyboard/focus layout. The searchable catalogue remains informational. A legacy regression expectation was updated to include matching recipe ingredients in search results.

## Music and independent audio controls

Thirteen actual Chrome groups measure output from isolated music, effects and environmental gain buses; separate volume sliders and master mute; all four adaptive themes; twelve music voices and forty transient effect voices; immediate pause/hidden/menu/leave cleanup; saved options and malformed/legacy preference recovery. One isolated sample recorded music peak 0.0900, effects 0.0277 and ambience 0.00394. These are browser waveform measurements using explicit scene and visibility fixtures, not a physical speaker listening test. No external audio files or services are requested. Game audio routing is separate from multiplayer microphone/voice controls.

## Generated-world keyboard and mouse playthrough

Seven browser groups use ordinary game controls with no gameplay-state writes, direct engine action calls or item/teleport cheats. A read-only preview selects calm open-world seed 12 from 13 candidates to exercise new food with actually obtained ingredients. The player loots the cabin and Ranger shed, opens two doors, builds a campfire, crafts and consumes Raspberry Camp Compote while retaining its looted pot, fights a generated zombie, walks into sector (-1,0), and restores progress through the Save/reload/Continue UI.

Combat observations show the targeted zombie at health 52, then 14 after a 38-damage machete hit with four player combat XP, then removal after the second real Space attack. The harness avoids attributing the shared NPC-inclusive kill counter solely to the player. The final local run covers 3,072 pixels in 34.32 seconds with full health, zero page errors and zero network requests. This is a guided automated playthrough of a generated world, not an unassisted human playtest or cross-device performance measurement.

## Neural controller and AI play

Eight grouped Node checks verify deterministic 65-parameter initialization/training, lower unseen synthetic teacher error, actual bounded backpropagation, finite malformed-input handling, ordinary paid supplies, door opening/looting, conversation completion, legal steering and movement feedback. AI steps produce normal commands and inputs; manual control and physics remain authoritative. Training/feedback state is session-local.

Seven real browser groups run a fresh seed-zero world without injected gameplay state: the AI collects actual generated supplies and earns insight, renders finite neural scores and feedback, keeps playing after blur, pauses behind solo menus and returns control on real keyboard and pointer input. No external AI service or asset request occurs. These checks establish the implementation, not superior survival or advanced general intelligence. Background browsers can throttle frames.

## Browser integration

**138 grouped integrated browser checks** passed in installed headless Chrome 154.0.8037.59. Singleplayer opens the actual assembled offline file; multiplayer suites run temporary real HTTP/WebSocket hosts. Tests include normal generated play and explicitly labeled fixtures.

The four original suites contribute 40 groups: real keyboard/pointer movement, loot, crafting, builds, quick-action focus, save/export/import, screens and finite input stress; driving/refueling, survivor dialogue/recruitment, upper floors and catalogue filters; door/tree/wall/glass destruction; and actual pixel differences, weapon poses and nonzero Web Audio waveforms. Two added persistence checks verify automatic backups and page-exit preservation of a just-issued command before the next periodic backup. Mute produces silence, pause stops ambience, and sound queues/voices remain bounded. Audio quality across hardware has not been reviewed.

Seventeen progression groups exercise real insight/project costs, separate Pack panes, manuals, requests/trust, sleep, repairs, rain collection, escaped journal text, pointer/keyboard map markers, save restoration, settings, zoom-correct aiming and layouts at narrow/short sizes. Eleven community groups cover home, planting/watering, one-item stock transfers, job requirement messages and visible assigned work, changed appearance pixels, pet care, alliances/support, horde HUD, durable state and keyboard dialogs. A labeled maximum-crowd fixture starts with 360 zombies and 128 humans; after 2.2 seconds of combat it retains 334 zombies and 128 humans with finite rendering. Its local result is approximately 60 FPS and 16.7 ms p95, not a cross-device benchmark.

Ten multiplayer browser groups use two independent Chrome contexts and actual controls, with no gameplay-state injection: denial of a wrong key, separate peer names, simultaneous looting without duplication, server movement reaching a peer, moving world time behind menus, floor restrictions, rejection of a replayed real Drop command, opaque identity rejoin, disk save/host restart and HTTPS rejection of insecure ws addresses. Nine lobby groups browse and join a real public host without a key, display live player counts and 20-player capacity, exclude private listings, import actual private invites, remove secret-bearing URL fragments, omit keys from preferences and recover from malformed invites or unavailable directories at 390 pixels. The remaining seven groups are the AI checks above.

Reports record no uncaught page or host errors. Solo suites record no HTTP asset requests; multiplayer and public browsing intentionally contact their local hosts. Screenshot captures use actual movement/looting/driving or clearly labeled fixtures. The main README screenshot is a normal generated run.

## Chat, proximity voice and owner commands

Eight Node groups exercise singleplayer command help, item lookup, global location, time/weather/difficulty round trips, exact item additions and capacity rejection, healing, collision-safe teleport bounds, local save callbacks, malformed input and the multiplayer authority guard. Twenty-one real WebSocket server groups exercise separately authenticated owner roles, host-issued chat identity, escaped literal content, spam and replay rejection, owner-only world commands, nearby routing, bilateral voice consent, bounded offer/answer/ICE payloads, kick/ban/unban, durable hashed bans and legacy save migration. Native HTTPS/WSS is tested with a temporary self-signed certificate and an explicit test-client trust exception; production certificate validation is not disabled.

Input-rate regression checks queue 100 ordinary input packets and prove that only their newest controls affect one fixed 50 ms simulation step. A 250-packet flood is denied without affecting another survivor; refill and action limits are separately exercised. This fixes a legitimate disconnect caused by the previous shared arrival-rate bucket under event-loop backlog. Browser input also avoids adding movement packets to an already congested socket.

Ten integrated browser groups use two independent real Chrome clients. They verify text-only markup, owner/guest permissions, typing without movement or attack, 390-pixel layout, no microphone request on join, native WebRTC negotiation, actual received RTP and a nonzero received audio waveform, hold-N transmission/release, microphone mute, deafen, blur stop, distance fading, removal beyond 640 pixels and reconnection on return. Leaving and delayed permission cancellation stop native microphone tracks and close audio/peer resources. The audio fixture is a generated 440 Hz WAV through Chromium's fake capture device; no physical microphone or user audio was recorded. In one recorded sample, received packets increased from 2 to 82 and received RMS from approximately 0.000014 to 0.016 while transmitting.

Voice is direct and validated on loopback, not across arbitrary public-internet routers. LAN guests need a browser-trusted secure origin for the microphone. There is no configured external STUN/TURN relay. Bans protect saved survivor identities, not accounts or IP addresses. World chat history is bounded and session-local.

## Twenty-player host and public directory

Nine Node integration groups connect **20 actual loopback WebSocket clients**, reject a twenty-first, move each separate survivor with ordinary input and advance world time once. Shared loot, inventory injection rejection, duplicate sequence rejection, stale input, floors, disk restart, private keys and hidden private listings are covered. Directory checks register an operator-authorized real host, expose no registration key, persist records and expire them after 180 seconds.

Observed fixture averages were roughly 10 to 30 ms per host tick locally, varying with other tests running. This is not an internet load test. The browser test uses two players; it does not demonstrate twenty simultaneous remote browser sessions. The curated website list starts empty until real hosts are submitted; the optional directory is a separate service and is not claimed to be permanently operated.

## Build, deployment and limitations

`build.py` requires complete source coverage, one owner per module, valid JavaScript and no embedded script terminator. Python tests reject orphaned, missing, duplicate and misplaced modules and compare fresh assembly with committed index.html. GitHub Actions repeats the complete Node/browser suite on Linux Chromium before Pages deployment. Local and CI results are separate evidence, visible in the workflow.

Multiplayer currently uses one shared loaded region and the ground floor. The anchor streams that region; guests outside it rendezvous safely. Enemy decisions focus on the anchor, with separate guest contact damage checks. Upper floors, independently distant regions, PvP, automatic NAT traversal and broad public-internet performance remain future work. Safari, Firefox, touch controls and long-term balance are not validated. The explicit world, journal and crowd limits are documented in README. AAA quality and full Project Zomboid parity are not established.
