# Host a world on your own computer

The website and offline file are game clients. The included Node.js server runs and saves the world on the host's computer. Capacity is 20 connected survivors, with at most 64 durable survivor records per world file.

## Private world

Install Node.js 22 or newer, clone this repository, then run:

```sh
npm ci
npm run host
```

You can also open `scripts/start-world.command` on macOS or `scripts/start-world.cmd` on Windows after installing Node. These launchers bind the LAN interface.

Open `http://localhost:8787`. The terminal prints the join address and a private SIRENS1 invite code. Paste the code into Multiplayer's private-invite field. Share it only with your guests. The default server binds `127.0.0.1`; add `--host 0.0.0.0` for LAN guests and share an address they can reach.

For a stable access key across restarts:

```sh
SIRENS_ROOM_TOKEN='replace-with-a-long-private-key' npm run host -- --host 0.0.0.0 --seed 42 --name "Our private world"
```

Without that environment variable, each launch generates a new random key and invite. Progress still restores from disk; guests use the new invite. Set `--public-url wss://your-host.example/game` when the host should print invites for an external secure endpoint instead of its bind address. Binding to `0.0.0.0` does not make that string a guest's destination.

The client remembers an opaque survivor identity per server address. Rejoining that address restores your pack and position. Clearing browser storage loses that identity. Keys are not saved in client preferences, sent in URL queries or returned by `/health`. Invite links place their key in a URL fragment and remove it after import. The terminal prints an invite because it is the host's sharing interface; keep terminal logs private.

## Public world and browsing

```sh
npm run host -- --public --host 0.0.0.0 --name "Morrow Public" --seed 42
```

Public worlds require an empty access-key field. A public host exposes `http://HOST:8787/servers` with its name, join URL, difficulty, player count and 20-player capacity. Set `--public-url` to the address guests should actually use. Private worlds return an empty public listing.

In Multiplayer, expand **Public servers and private invites**, enter a directory address and choose **Browse public servers**. Select a listed world, enter your survivor name and join. Full servers are disabled. Errors and empty lists are shown explicitly. Browser selection does not silently join a host.

The default website catalogue is `https://www.hendrickresearch.com/games/after-the-sirens/servers.json`. It starts with no real hosts. Submit a public endpoint through a pull request to the website's catalogue to request inclusion. Listings in a static catalogue are operator-maintained and may be offline; joining checks the actual world host.

## Optional directory service

A directory advertises worlds; it does not simulate them. Run it on a reachable machine with a registration key:

```sh
SIRENS_DIRECTORY_TOKEN='replace-with-a-private-registration-key' npm run directory -- --host 0.0.0.0 --port 8788
```

Public reads use `/servers`. Registration uses an operator-approved bearer key. Keep the registration key out of game clients and the catalogue. Registration metadata is stored atomically in `server-data/directory.json`. A listing expires after 180 seconds without a heartbeat; at most 100 active listings are supported. POST sizes, URL formats, counts and per-address update rates are bounded. The service does not fetch supplied URLs or probe internal networks.

A public local host can advertise itself every 60 seconds:

```sh
SIRENS_DIRECTORY_TOKEN='the-directory-registration-key' npm run host -- --public --host 0.0.0.0 --public-url wss://your-world.example/game --directory https://your-directory.example/servers --name "Morrow Public"
```

Browse that directory's address in the game. A host remains local even when its directory is on another computer. The default curated website list and a dynamic directory are distinct; this release does not claim a permanently operated matchmaking service.

## LAN and internet access

LAN guests connect to the host's LAN IP. Internet guests need port forwarding, a secure reverse proxy or a secure tunnel to the host. The server uses WebSockets and serves the game itself at `/`. The HTTPS website requires a `wss://` world endpoint; an HTTPS directory also avoids browser mixed-content blocking. Private invite codes do not punch through routers or provide a relay.

Use a secure proxy for internet play, keep the host running, and share its reachable endpoint. No NAT traversal, TURN relay, automatic router setup or commercial dedicated hosting is included. `SIRENS_ALLOWED_ORIGINS` optionally restricts browser origins as a comma-separated list.

## Saves and gameplay scope

World files default to `server-data/world.save.json`; `--world path` selects a separate campaign. World changes and separate survivor packs are atomically saved every five seconds and on relevant joins, disconnects and shutdown. The shared simulation runs at 20 Hz, snapshots at 10 Hz, and stops without connected players. The host validates movement and actions; clients cannot send inventory edits. Stale input stops after 600 ms, duplicate command sequences are rejected and a car admits only one driver.

Players share a ground-floor loaded region. The anchor player's travel streams the region; a player outside it returns to a safe meeting point. Upper-floor transitions are blocked. NPC/zombie decisions primarily target the anchor; guest damage has separate host checks. Shared research, settlement supplies and factions are common campaign systems. Per-player inventory, health, equipment, positions, pets and appearance are separate. Player-versus-player attacks are not implemented yet.

Twenty loopback protocol clients and two independent Chrome players are validated. This does not establish 20 remote clients performing well over the public internet. Public discovery and private invite joins are tested against actual temporary hosts, rather than mocked connection success.
