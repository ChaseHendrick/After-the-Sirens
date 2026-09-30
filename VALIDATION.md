# Validation

Validated September 30, 2026 for version 0.4. This is an original early playable browser game, not commercial-game parity.

## Production simulation and saves

**165 grouped Node checks** passed, plus the Python module/build reproducibility guard. The suites use production updates, actions and validated save APIs. Controlled fixtures are labeled separately from natural generated-world play.

Coverage includes reachable towns across 20 seeds, three standard-difficulty automated rescue playthroughs, four normal sector crossings, deterministic full worlds and RNG continuation, all 219 items and 65 recipes, exact consumption/crafting/building costs, terrain destruction, windows, drivable cars, floor persistence and malformed-save rejection. The three automated rescue runs finish at approximately 195 simulation seconds with 33, 35 and 37 zombie kills and full health in this run. These are ideal automated controls, not human difficulty measurements.

The new checks cover four skills and six projects, one-time manual study, finite daily trade stock and requests, saved contacts and trust, sleep/fatigue, field repair/rain collection/scanning, seeded events and global map markers. Settlement coverage includes deterministic depleted deposits, crop moisture/growth/harvest, exact stock transfers, worker tools and deliveries, morale and validated persistence. Appearance, pets, twelve recruits, faction alliances, allied reinforcement, opposed human combat and staged battles use real state changes. Fifty-eight adversarial extension fixtures reject impossible progression, settlement, personal and warfare records.

Living-world checks exercise once-only corpse weapon and supply drops, robbery followed by death without duplicated goods, refusal, stale conversation rejection, actual E collection, full-pack retention, fleeing/defending, noise response, regular migration, larger seeded road populations and durable drop history. NPC goods remain a bounded allowance, not a full economic simulation.

## Neural controller and AI play

Eight grouped Node checks verify deterministic 65-parameter initialization/training, lower unseen synthetic teacher error, actual bounded backpropagation, finite malformed-input handling, ordinary paid supplies, door opening/looting, conversation completion, legal steering and movement feedback. AI steps produce normal commands and inputs; manual control and physics remain authoritative. Training/feedback state is session-local.

Seven real browser groups run a fresh seed-zero world without injected gameplay state: the AI collects actual generated supplies and earns insight, renders finite neural scores and feedback, keeps playing after blur, pauses behind solo menus and returns control on real keyboard and pointer input. No external AI service or asset request occurs. These checks establish the implementation, not superior survival or advanced general intelligence. Background browsers can throttle frames.

## Browser integration

**92 grouped integrated browser checks** passed in installed headless Chrome 154.0.8037.59. Singleplayer opens the actual assembled offline file; multiplayer suites run temporary real HTTP/WebSocket hosts. Tests include normal generated play and explicitly labeled fixtures.

The four original suites contribute 38 groups: real keyboard/pointer movement, loot, crafting, builds, quick-action focus, save/export/import, screens and finite input stress; driving/refueling, survivor dialogue/recruitment, upper floors and catalogue filters; door/tree/wall/glass destruction; and actual pixel differences, weapon poses and nonzero Web Audio waveforms. Mute produces silence, pause stops ambience, and sound queues/voices remain bounded. Audio quality across hardware has not been reviewed.

Seventeen progression groups exercise real insight/project costs, separate Pack panes, manuals, requests/trust, sleep, repairs, rain collection, escaped journal text, pointer/keyboard map markers, save restoration, settings, zoom-correct aiming and layouts at narrow/short sizes. Eleven community groups cover home, planting/watering, one-item stock transfers, job requirement messages and visible assigned work, changed appearance pixels, pet care, alliances/support, horde HUD, durable state and keyboard dialogs. A labeled maximum-crowd fixture starts with 360 zombies and 128 humans; after 2.2 seconds of combat it retains 334 zombies and 128 humans with finite rendering. Its local result is approximately 60 FPS and 16.7 ms p95, not a cross-device benchmark.

Ten multiplayer browser groups use two independent Chrome contexts and actual controls, with no gameplay-state injection: denial of a wrong key, separate peer names, simultaneous looting without duplication, server movement reaching a peer, moving world time behind menus, floor restrictions, rejection of a replayed real Drop command, opaque identity rejoin, disk save/host restart and HTTPS rejection of insecure ws addresses. Nine lobby groups browse and join a real public host without a key, display live player counts and 20-player capacity, exclude private listings, import actual private invites, remove secret-bearing URL fragments, omit keys from preferences and recover from malformed invites or unavailable directories at 390 pixels. The remaining seven groups are the AI checks above.

Reports record no uncaught page or host errors. Solo suites record no HTTP asset requests; multiplayer and public browsing intentionally contact their local hosts. Screenshot captures use actual movement/looting/driving or clearly labeled fixtures. The main README screenshot is a normal generated run.

## Twenty-player host and public directory

Nine Node integration groups connect **20 actual loopback WebSocket clients**, reject a twenty-first, move each separate survivor with ordinary input and advance world time once. Shared loot, inventory injection rejection, duplicate sequence rejection, stale input, floors, disk restart, private keys and hidden private listings are covered. Directory checks register an operator-authorized real host, expose no registration key, persist records and expire them after 180 seconds.

Observed fixture averages were roughly 10 to 30 ms per host tick locally, varying with other tests running. This is not an internet load test. The browser test uses two players; it does not demonstrate twenty simultaneous remote browser sessions. The curated website list starts empty until real hosts are submitted; the optional directory is a separate service and is not claimed to be permanently operated.

## Build, deployment and limitations

`build.py` requires complete source coverage, one owner per module, valid JavaScript and no embedded script terminator. Python tests reject orphaned, missing, duplicate and misplaced modules and compare fresh assembly with committed index.html. GitHub Actions repeats the complete Node/browser suite on Linux Chromium before Pages deployment. Local and CI results are separate evidence, visible in the workflow.

Multiplayer currently uses one shared loaded region and the ground floor. The anchor streams that region; guests outside it rendezvous safely. Enemy decisions focus on the anchor, with separate guest contact damage checks. Upper floors, independently distant regions, PvP, automatic NAT traversal and broad public-internet performance remain future work. Safari, Firefox, touch controls and long-term balance are not validated. The explicit world, journal and crowd limits are documented in README. AAA quality and full Project Zomboid parity are not established.
