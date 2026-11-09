# Free online preview and persistent hosting

The Node.js host accepts internet players over WebSockets. A website deployment
alone does not keep a world running. The easiest no-token setup is a **Hugging
Face Docker Space on CPU Basic (free)** with two uploaded files. No paid hardware,
storage upgrade, automatic dataset upload, or Hugging Face API token is required.

Hugging Face currently requires a paid account plan to create a Docker Space;
an existing Pro account meets that requirement. CPU Basic itself has no hourly
compute charge. Keep **CPU Basic** selected; this setup does not request an
upgrade or spend a credit balance. See the current [Spaces hardware guidance](https://huggingface.co/docs/hub/spaces-overview#hardware-resources).

Free Spaces may sleep while idle and their local disk is ephemeral. Rebuilds,
restarts and infrastructure changes can reset the world. Describe this deployment
as an **online preview**, not an always-on persistent world. The server saves
locally every five seconds; that does not make free Space storage durable.

## Upload two files

1. Build and test the game, commit the complete source, and push that commit to
   this public GitHub repository. Keep the public commit's full 40-character SHA.
2. Generate the upload bundle from a checkout containing that commit:

   ```sh
   python3 scripts/prepare-hf-space.py --commit FULL_40_CHARACTER_SHA --output /tmp/after-the-sirens-space
   ```

3. On Hugging Face, create a **Space**, choose **Docker / Blank**, and select
   **CPU Basic (free)**. Upload the generated `README.md` and `Dockerfile` into
   the Space root and commit them. If using the ZIP, extract it first; uploading
   the ZIP itself does not configure a Space.
4. In Space settings, add a **secret** named `SIRENS_OWNER_TOKEN` containing a
   random 12–128-character value. Keep it in a password manager. The game host
   needs this owner key for moderation and private backup downloads; it does not
   need an HF token. Generate a key locally with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

5. Wait for the Space to finish building. Open its application URL, then select
   **Multiplayer**. Its `https://SPACE_HOST/servers` endpoint lists the matching
   `wss://SPACE_HOST/game` join address. Enter a survivor name and leave the room
   key empty for this public preview. Test a second browser before advertising it.

The generated Dockerfile downloads game code from an exact public commit and
installs production dependencies from its lockfile. The bundle contains only two
public text files: no `.env`, local saves, player identities, keys or private
repository content. Updating the Space is an explicit new source-commit bundle.

## Runtime configuration

| Setting | Meaning |
| --- | --- |
| `PORT` | Listening port; container default `7860`, ordinary CLI default `8787`. |
| `SIRENS_HOST` | Bind address; container uses `0.0.0.0`. |
| `SIRENS_PUBLIC` | Exactly `true` or `false`; the HF preview template sets `true`. |
| `SIRENS_NAME` | Public world name, bounded to 60 characters. |
| `SIRENS_WORLD_FILE` | Local save path; container default `/data/world.save.json`. |
| `SIRENS_PUBLIC_URL` | External `wss://HOST/game` address; HF `SPACE_HOST` supplies it automatically when available. |
| `SIRENS_ALLOWED_ORIGINS` | Exact comma-separated browser origins, with no paths or trailing slash. |
| `SIRENS_OWNER_TOKEN` | Secret owner/moderation/backup key, stable across restarts. |
| `SIRENS_ROOM_TOKEN` | Secret admission key for private worlds only. |
| `SIRENS_PRINT_SECRETS` | Container default `false`; avoids writing owner and private invite keys to logs. |

When `SPACE_HOST` is present and no origin list is set, the host allows its own
HTTPS origin, `https://www.hendrickresearch.com`, `https://hendrickresearch.com`
and the `https://chasehendrick.github.io` mirror. Add an exact additional origin
only when needed. The optional literal `null` allows downloaded-file and other
opaque-origin clients. Origin checks constrain browsers; they are not login or
admission controls. Native clients may omit `Origin`, and public worlds remain
public. The server never trusts client-supplied forwarded-IP headers. Behind an
HF edge or other proxy, users may share that proxy's connection/join budgets.

`GET /health` reports public world metadata. `GET /ready` returns `200` only after
a successful disk save and becomes `503` if subsequent persistence fails. Neither
endpoint exposes keys, player names, packs or paths. A startup write failure
prevents the host from accepting players.

## Private backup and restoration

`GET /admin/backup` requires `Authorization: Bearer OWNER_KEY`. It returns a
bounded JSON download, with `Cache-Control: no-store`, no CORS permission and a
ten-second export cooldown. Never place the key in a query string or URL. The
download contains world state, names, survivor identity **hashes** and moderation
records; keep it private. Raw bearer identities, owner/room keys and chat history
are excluded. The download works even when local persistence is failing.

One way to save a backup without placing the key in shell history is:

```sh
read -rsp 'World owner key: ' sirens_owner_key
printf '\n'
printf 'Authorization: Bearer %s\n' "$sirens_owner_key" | curl --fail --header @- https://YOUR-SPACE.hf.space/admin/backup --output world.save.json
unset sirens_owner_key
```

Restore by stopping a host, placing the backup at its configured
`SIRENS_WORLD_FILE`, and starting it again. The server validates it on startup.
Survivors must keep their original browser identity to recover their own pack;
changing the WebSocket address changes the browser's identity-storage key.
Do not commit the backup to a public Space or repository. Free Spaces do not
provide a durable volume through this template, so retain a private backup on
your own computer before restarting or rebuilding them.

## Container on storage you already operate

The repository's root Dockerfile stays private by default. This example makes a
public host and keeps its disk in a named volume; it does not provision or charge
for a machine:

```sh
docker build -t after-the-sirens .
docker volume create sirens-data
docker run -d --name sirens --restart unless-stopped --init \
  --memory=768m --memory-swap=768m --cpus=2 --pids-limit=128 \
  -p 127.0.0.1:7860:7860 -v sirens-data:/data \
  -e SIRENS_PUBLIC=true -e SIRENS_OWNER_TOKEN \
  -e SIRENS_PUBLIC_URL=wss://world.example.com/game \
  -e SIRENS_ALLOWED_ORIGINS=https://www.hendrickresearch.com,https://world.example.com \
  after-the-sirens
```

Supply the owner key through the machine's secret configuration before running
the command. A named volume survives container replacement, but is not a backup
of the machine. For a bind mount, ensure UID 1000 can write its directory. The
runtime runs as UID 1000 and caps the Node heap at 512 MiB; use a container memory
limit as above to bound total resident memory.

Terminate HTTPS at a reverse proxy you operate and allow WebSocket upgrades.
For example, Caddy on the same machine can use:

```caddyfile
world.example.com {
    reverse_proxy 127.0.0.1:7860
}
```

Only expose HTTPS publicly; the example binds the game port to loopback. The
HTTPS website needs `wss://`, not `ws://`. Reverse-proxy connections share existing
per-address admission budgets; this deployment does not weaken those controls.

## Supported play and limits

Up to 20 clients share a single loaded ground-floor region. Leaving that region
returns a survivor to the anchor. Durable survivor records are capped at 64;
the oldest offline, unbanned record may be replaced when a new survivor joins.
Upper floors, independently streamed distant regions and PvP are not supported.
Twenty local protocol clients and two browser players are tested; public internet
capacity and latency depend on the actual host and have not been established by
those tests. Proximity voice has no configured STUN/TURN relay and can fail across
networks even when game traffic and text chat work.

See [the multiplayer guide](MULTIPLAYER.md) for commands, private invites and
the complete simulation and identity model.
