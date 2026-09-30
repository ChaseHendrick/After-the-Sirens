# Fins integration notes

After the Sirens 0.4 draws on the creator's [Fins](https://github.com/ChaseHendrick/Fins) to make actions connect and their consequences visible. The reference reviewed for this release is the published `main` commit [`14c9c54ff8267c9a646343914464ae25e2b50576`](https://github.com/ChaseHendrick/Fins/tree/14c9c54ff8267c9a646343914464ae25e2b50576), rather than another working checkout's unfinished changes.

The transfer is a set of design and engineering patterns, implemented with original code for this game's existing simulation. Fins source, art, audio files, map data and game bundles are not included. Fins uses [PolyForm Small Business 1.0.0](https://github.com/ChaseHendrick/Fins/blob/14c9c54ff8267c9a646343914464ae25e2b50576/LICENSE), and its README explicitly says not to relicense its code as MIT or publish its art as a starter kit. This repository retains its own MIT license.

| Fins reference | Pattern brought into this game | Implementation here |
| --- | --- | --- |
| [`going.js`](https://github.com/ChaseHendrick/Fins/blob/14c9c54ff8267c9a646343914464ae25e2b50576/src/layers/going.js) | Named people make requests and remember help | Stable contact records, deterministic supplies requests, daily limits and persistent trust in `src/progression.js` and `src/actors.js` |
| [`life.js`](https://github.com/ChaseHendrick/Fins/blob/14c9c54ff8267c9a646343914464ae25e2b50576/src/layers/life.js) | People act in the world and the daybook explains what happened | Short local survivor routes, a bounded event journal and readable People/Daybook tabs in `src/journal.js` |
| [`weave.js`](https://github.com/ChaseHendrick/Fins/blob/14c9c54ff8267c9a646343914464ae25e2b50576/src/layers/weave.js) | A useful action should affect related systems | Scavenging and help earn insight; projects change care, defenses, repairs, water and tracking; skill practice changes real action costs or results |
| [`blood.js`](https://github.com/ChaseHendrick/Fins/blob/14c9c54ff8267c9a646343914464ae25e2b50576/src/layers/blood.js) | Named history persists beyond an immediate encounter | Stable survivor IDs, remembered trust and last locations, recruitment/death records, and saved causal history |
| [`tools/check-wiring.mjs`](https://github.com/ChaseHendrick/Fins/blob/14c9c54ff8267c9a646343914464ae25e2b50576/tools/check-wiring.mjs) | Source that is never connected should block a release | A Python build guard compares every `src` JavaScript file with the assembly list and rejects orphaned, missing or duplicate files and incorrect namespace ownership |

The implementation remains smaller than Fins. It has four practice skills, six projects, three survivor request templates, descriptive trait labels, local routes and three world-event types. It does not import Fins's family simulation, broader social economy, shop content, physics stack, geographic map, choir, water rendering or lineage systems. These notes describe what is implemented, not parity with either Fins or Project Zomboid.

The single-file build already embeds its runtime sources, so it does not need Fins's separate-bundle cache hashes. Reproducible build checks instead verify that committed `index.html` matches the current sources. Existing procedural sounds and animation continue to use this game's original presentation module.
