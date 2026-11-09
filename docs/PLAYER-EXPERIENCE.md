# Player experience, performance and measurement

Version 0.7 improves the first session and returning to a saved run. It keeps the
single-file, offline game, existing save version and original survival systems.

## Research transferred into the game

- The public [Scrolls adaptive-resolution work](https://github.com/ChaseHendrick/Scrolls/blob/main/docs/logs/2026-10-07-adaptive-resolution.md)
  motivates spending a bounded visual budget while keeping correctness checks.
  Here the approximation affects pixels only: simulation and targeting never
  change with graphics quality.
- The broad-phase/exact-check pattern in public [Scrolls UV gating](https://github.com/ChaseHendrick/Scrolls/blob/main/kit/uvgate.py)
  motivates nearby-actor spatial queries. Candidates retain their original
  array order, preserving ties; exact distance, health and sight checks remain.
- Public [TinyLaps](https://github.com/ChaseHendrick/TinyLaps) provides a useful
  precedent for fixed simulation scenarios and validated content packs. Seeded
  outcome evaluation and scenario packs remain roadmap work, not shipped claims.

These are original JavaScript implementations. No private research code,
competition data, model weights or unpublished findings are included.

## Presentation budget

High retains the previous resolution. Balanced and Low scale backing dimensions
to 80% and 60%; Low therefore uses about 64% fewer backing pixels at a fixed
viewport. First-person buffers use the same scale with minimum size bounds.
CSS coordinates and the field of view stay fixed.

Auto warms up for one second, then evaluates one-second windows. Two slow windows
(mean above 24 ms or p95 above 40 ms) reduce one level. Ten fast windows
(mean below 18 ms and p95 below 23 ms) restore one level. Changes have a three-second
cooldown. Pauses, hidden tabs and invalid timing observations reset sampling.
These are conservative heuristics, not a hardware benchmark or an FPS promise.

NPC indices are built only when the relevant crowd is large enough. Zombies are
indexed while humans take turns; humans are indexed after moving, for bites.
Human-to-human decisions retain their live scan. The deterministic fixture
examines 1,077 candidates instead of 46,080 in a distributed crowd; dense crowds
still require the full candidate set. This measures candidate reduction only.

## Save recovery

The legacy primary key and raw version-1 format remain unchanged. A second slot
holds the previous validated generation when capacity permits. Invalid primaries
cannot replace a valid backup. Continue validates through the engine and tells
the player when an older generation was used. A valid ended primary takes
precedence over an unfinished backup. Storage failures never justify silently
deleting the only good run. Export remains necessary for durable copies.

## Optional host milestones

`Sirens.Signals` has no HTTP client, analytics SDK, persistent analytics identifier
or storage. On HTTP(S), it emits `sirens:milestone` as a local `CustomEvent`.
Same-origin embedded players also use `postMessage` to their parent with the exact
origin as the target. File downloads emit nothing. The bridge is capped at 120
messages per page session. This is not an anti-cheat protocol or an identity system.

Every packet has `{type: 'sirens:milestone', version: 1, event, properties}`.

| Event | Exact property keys | Meaning |
| --- | --- | --- |
| `run_started` | `mode`, `difficulty`, `view` | New singleplayer run |
| `run_continued` | `mode`, `difficulty`, `view` | Continued or imported unfinished singleplayer save |
| `play_60s`, `play_300s` | `mode`, `difficulty`, `view` | Visible, unblocked manual play since start/continue |
| `run_ended` | `mode`, `difficulty`, `outcome` | Death or rescue ending |
| `view_changed` | `view` | First use of each camera during a run, per page |
| `guide_language` | `language` | First explicit choice of each guide language, per page |

Values are closed enums: modes `openworld/rescue`, difficulty
`calm/standard/hard`, views `top/first`, outcomes `dead/rescued`, guide languages
`en/zh-Hans/zh-Hant/ja/ko/id/es/pt-BR`. No arbitrary text is accepted. Engagement excludes
menus, conversations, hidden tabs, AI play and long scheduling gaps; it does not
mean a user continuously moved. Multiplayer sessions are not measured by these
singleplayer milestones.

Hosts must verify `event.origin`, `event.source === iframe.contentWindow`,
packet version, exact property keys and enum values. Deduplicate milestones per
run and rate limit the receiver as well. Never forward arbitrary event objects,
save files, player names, seed values, server addresses, invite fragments or
chat. Direct-page and iframe adapters must not both count the same event.
The Hendrick Research website owns the Vercel adapter and player-facing notice;
neither is included in this offline artifact. Analytics plan support and browser
blocking can affect collection.

Page visitors, run sessions and unique players are different measurements.
Continued saves indicate returning to progress, not unique-person retention.
Milestones begin after deployment and cannot reconstruct historical gameplay.
Country data does not establish language or preferred mechanics. Compare
starts and meaningful play by landing page, referral and device; combine those
with voluntary feature requests before deciding the next expansion.

## Validation

`tests/performance.cjs` verifies hysteresis, timing exclusions, unchanged aiming,
world serialization and first-person field of view. `tests/spatial.cjs` compares
randomized queries and complete seeded simulation against brute force, including
maximum crowds. `tests/saves.cjs` exercises corruption, ended runs and quota
failures. `tests/signals.cjs` verifies event boundaries and timing. Guide and
player-experience browser suites cover language selection, narrow touch layouts,
quality settings and recovery through real controls. Existing game, multiplayer
and browser suites remain required.
