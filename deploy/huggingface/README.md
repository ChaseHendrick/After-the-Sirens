---
title: After the Sirens
emoji: 📻
colorFrom: gray
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# After the Sirens — online preview

An original browser survival game with a shared world for up to 20 connected
survivors. Open **Multiplayer**, enter your name and this Space's `wss://` address
ending in `/game`, then join with an empty room key. The Space exposes the same
address and population at `/servers`.

This preview uses **CPU Basic (free)**. It may sleep when idle. Its local world
file is **ephemeral**: a restart, rebuild or infrastructure replacement may reset
the world and survivor records. It is not an always-on persistent service.

Players share one loaded ground-floor region. Independent distant regions,
upper-floor multiplayer, PvP and public-internet 20-player performance are not
claimed. Proximity voice has no TURN relay and may not connect across networks.

The maintainer should set `SIRENS_OWNER_TOKEN` as a Space **secret** to a randomly
generated value of 12–128 characters before hosting a group. This gives owner
commands and authenticated `/admin/backup` access. Do not commit or publish it.
Secret printing is disabled. The host does not need a Hugging Face API token.

Source: [ChaseHendrick/After-the-Sirens](https://github.com/ChaseHendrick/After-the-Sirens)
at commit `__SIRENS_SOURCE_COMMIT__`.

See the source repository's `docs/ONLINE-HOSTING.md` for backups, restoration,
origin configuration, limitations and hosting on persistent storage.
