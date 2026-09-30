'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { WebSocket } = require('ws');
const https = require('node:https'), { execFileSync } = require('node:child_process');
const { createServer } = require('../server/index.cjs');
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
let passed = 0;
async function check(name, test) { await test(); passed++; console.log('PASS ' + name); }
async function connect(host, name, options = {}, socketOptions = {}) {
  const socket = new WebSocket(host.url, socketOptions), messages = [];
  socket.on('error', () => {});
  const client = { socket, messages, seq: 0, snapshot: null, send(message) { const seq = ++this.seq; socket.send(JSON.stringify({ ...message, seq })); return seq; }, async wait(type, predicate = () => true) {
    for (let i = 0; i < 300; i++) { const message = messages.find(m => m.type === type && predicate(m)); if (message) return message; await delay(10); }
    throw new Error('No ' + type + ': ' + JSON.stringify(messages));
  }, async command(text) { const seq = this.send({ type: 'chat', text }); return this.wait('command-result', m => m.seq === seq); }, async close() { if (socket.readyState === WebSocket.CLOSED) return; socket.close(); await new Promise(resolve => socket.once('close', resolve)); } };
  socket.on('message', data => { const message = JSON.parse(data); if (message.type === 'snapshot') client.snapshot = message; else { messages.push(message); while (messages.length > 300) messages.shift(); } });
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  socket.send(JSON.stringify({ type: 'join', protocol: 1, token: '', name, ...options }));
  return client;
}
function clearTile(state, x, y) {
  const tile = state.tiles[y * state.width + x];
  return x > 0 && y > 0 && x < state.width - 1 && y < state.height - 1 && ![3, 4, 5, 6, 8, 9].includes(tile) && !state.structures.some(s => s.type === 'barricade' && s.health > 0 && Math.floor(s.x / 32) === x && Math.floor(s.y / 32) === y);
}
function tileAtDistance(host, player, minimum, maximum = Infinity) {
  const state = host.getState(), ox = state.world.originX, oy = state.world.originY;
  for (let y = 1; y < state.height - 1; y++) for (let x = 1; x < state.width - 1; x++) {
    const gx = x + ox, gy = y + oy, distance = Math.hypot((gx + .5) * 32 - player.x, (gy + .5) * 32 - player.y);
    if (distance >= minimum && distance <= maximum && clearTile(state, x, y)) return [gx, gy];
  }
  throw new Error('No suitable clear world tile.');
}
(async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sirens-social-')), worldFile = path.join(directory, 'world.json'), ownerToken = 'only-the-test-world-owner-key';
  let host, owner, near, far, bannedIdentity, bannedId;
  const clients = [];
  const add = async (name, options = {}) => { const c = await connect(host, name, options); clients.push(c); return c; };
  try {
    host = await createServer({ port: 0, public: true, autoTick: false, seed: 0, difficulty: 'calm', worldFile, ownerToken });
    await check('owner sessions authenticate separately from ordinary public guests and reject guessed or malformed keys', async () => {
      near = await add('Nearby Survivor'); near.welcome = await near.wait('welcome');
      assert.equal(near.welcome.owner, false, 'first player / simulation anchor has no moderation privileges');
      owner = await add('World Owner', { ownerToken }); owner.welcome = await owner.wait('welcome'); assert.equal(owner.welcome.owner, true);
      const wrong = await add('Guessed Owner', { ownerToken: 'incorrect-owner-key' }); assert.match((await wrong.wait('error')).message, /owner key/);
      const short = await add('Short Owner', { ownerToken: 'short' }); assert.match((await short.wait('error')).message, /owner key/);
      far = await add('Far Survivor'); far.welcome = await far.wait('welcome');
      const health = await (await fetch(host.httpUrl + 'health')).text(), listing = await (await fetch(host.httpUrl + 'servers')).text();
      assert(!health.includes(ownerToken) && !listing.includes(ownerToken));
      assert(!JSON.stringify(owner.welcome).includes(ownerToken));
    });
    await check('world chat carries host-issued names, identities, timestamps and owner badges, including literal markup', async () => {
      const text = '<img src=x onerror=alert(1)> hello survivors';
      near.send({ type: 'chat', text, scope: 'world' });
      const event = await owner.wait('chat', m => m.text === text);
      assert.equal(event.senderId, near.welcome.id); assert.equal(event.name, 'Nearby Survivor'); assert.equal(event.owner, false); assert.equal(event.scope, 'world'); assert(Number.isSafeInteger(event.time));
      assert.equal((await far.wait('chat', m => m.id === event.id)).text, text);
      owner.send({ type: 'chat', text: 'Owner here.' }); assert.equal((await near.wait('chat', m => m.text === 'Owner here.')).owner, true);
      assert(!JSON.stringify(owner.snapshot).includes(ownerToken));
    });
    await check('chat identity injection, oversized text and replayed sequences are rejected before broadcast', async () => {
      const impostor = await add('Impostor'); await impostor.wait('welcome');
      impostor.send({ type: 'chat', text: 'Forged owner broadcast.', senderId: owner.welcome.id, owner: true });
      assert.match((await impostor.wait('error')).message, /Invalid social/); await delay(30); assert(!owner.messages.some(m => m.text === 'Forged owner broadcast.'));
      const long = await add('Long text'); await long.wait('welcome'); long.send({ type: 'chat', text: 'x'.repeat(281) }); await long.wait('error');
      const replay = await add('Replay'); await replay.wait('welcome'); const seq = replay.send({ type: 'chat', text: 'Only once.' }); await owner.wait('chat', m => m.text === 'Only once.');
      replay.socket.send(JSON.stringify({ type: 'chat', seq, text: 'Only once.' })); assert.match((await replay.wait('error')).message, /repeated/); await delay(30); assert.equal(owner.messages.filter(m => m.text === 'Only once.').length, 1);
    });
    await check('chat spam is bounded without dropping the survivor or its later valid gameplay commands', async () => {
      const spammer = await add('Spammer'); await spammer.wait('welcome');
      for (let i = 0; i < 7; i++) spammer.send({ type: 'chat', text: 'Rate test ' + i });
      assert.match((await spammer.wait('command-result', m => m.ok === false)).message, /quickly/);
      await delay(30); assert.equal(owner.messages.filter(m => m.text && m.text.startsWith('Rate test ')).length, 6);
      const seq = spammer.send({ type: 'action', action: 'stairsUp' }); assert.equal((await spammer.wait('ack', m => m.seq === seq)).ok, false); await spammer.close();
    });
    await check('a legitimate queued input burst coalesces to its newest controls and advances movement only on a fixed host tick', async () => {
      const burst = await add('Queued controls'), welcome = await burst.wait('welcome'), before = host.getPlayers().find(r => r.id === welcome.id).player, elapsed = host.getState().elapsed, counts = host.getNetworkStats();
      for (let i = 0; i < 100; i++) burst.send({ type: 'input', moveX: i === 99 ? -1 : 1, moveY: 0, sprint: false, sneak: false, attack: false, shoot: false });
      assert((await burst.command('/where')).ok); const received = host.getPlayers().find(r => r.id === welcome.id).player;
      assert.equal(received.x, before.x, 'receiving one hundred packets does not move the player'); assert.equal(host.getState().elapsed, elapsed);
      const countsAfter = host.getNetworkStats(); assert.equal(countsAfter.inputsAccepted - counts.inputsAccepted, 100); assert.equal(countsAfter.inputsCoalesced - counts.inputsCoalesced, 99); assert.equal(countsAfter.inputRateDenials, counts.inputRateDenials);
      host.tick(); const moved = host.getPlayers().find(r => r.id === welcome.id).player;
      assert(moved.x < before.x && moved.x >= before.x - 10, 'one fixed tick follows the latest left control rather than earlier right controls'); assert(Math.abs(host.getState().elapsed - elapsed - .05) < .000001);
      burst.send({ type: 'input', moveX: 0, moveY: 0, sprint: false, sneak: false, attack: false, shoot: false }); assert((await burst.command('/where')).ok); host.tick(); assert.equal(host.getPlayers().find(r => r.id === welcome.id).player.x, moved.x);
      assert.equal(burst.socket.readyState, WebSocket.OPEN); await burst.close();
    });
    await check('input flood limits disable only the offending survivor and clear held movement without relaxing chat or action limits', async () => {
      const flood = await add('Input flood'), welcome = await flood.wait('welcome'), before = host.getPlayers().find(r => r.id === welcome.id).player, counts = host.getNetworkStats();
      for (let i = 0; i < 250; i++) flood.send({ type: 'input', moveX: 1, moveY: 0, sprint: false, sneak: false, attack: false, shoot: false });
      assert.match((await flood.wait('error')).message, /Input rate exceeded/); await flood.close();
      assert.equal(host.getPlayers().find(r => r.id === welcome.id).connected, false); assert.equal(host.getNetworkStats().inputRateDenials - counts.inputRateDenials, 1);
      host.tick(); assert.equal(host.getPlayers().find(r => r.id === welcome.id).player.x, before.x); assert((await near.command('/players')).ok);
      const excessiveActions = await add('Action flood'); await excessiveActions.wait('welcome');
      for (let i = 0; i < 13; i++) excessiveActions.send({ type: 'action', action: 'stairsUp' }); assert.match((await excessiveActions.wait('error')).message, /action rate/); await excessiveActions.close();
    });
    await check('the input burst allowance refills over elapsed wall time and later gameplay remains available', async () => {
      const refill = await add('Refilled controls'); await refill.wait('welcome');
      const input = { type: 'input', moveX: 0, moveY: 0, sprint: false, sneak: false, attack: false, shoot: false };
      for (let i = 0; i < 120; i++) refill.send(input); assert((await refill.command('/where')).ok);
      await delay(350); const counts = host.getNetworkStats(); for (let i = 0; i < 8; i++) refill.send(input); assert((await refill.command('/where')).ok);
      assert.equal(host.getNetworkStats().inputsAccepted - counts.inputsAccepted, 8); assert.equal(refill.socket.readyState, WebSocket.OPEN);
      const seq = refill.send({ type: 'action', action: 'stairsUp' }); assert.equal((await refill.wait('ack', m => m.seq === seq)).ok, false); await refill.close();
    });
    await check('guest commands expose help and player IDs while world mutations and moderation require owner authority', async () => {
      assert((await near.command('/help')).ok); const roster = await near.command('/players'); assert(roster.ok); assert(roster.message.includes(owner.welcome.id));
      assert((await near.command('/where')).message.includes('global tile')); assert((await near.command('/items machete')).message.includes('machete:'));
      const time = host.getState().time;
      for (const text of ['/time 3', '/kick "World Owner"', '/give me food 1', '/bans']) { const result = await near.command(text); assert.equal(result.ok, false); assert.match(result.message, /owner key/); }
      assert.equal(host.getState().time, time);
    });
    await check('owners control time, weather, difficulty, announcements and atomic host saves without exposing their key', async () => {
      for (const text of ['/time 14.5', '/weather overcast', '/weather rain', '/difficulty hard']) assert((await owner.command(text)).ok, text);
      assert.equal(host.getState().time, 14.5); assert.equal(host.getState().weather, 'rain'); assert.equal(host.getState().difficulty, 'hard');
      assert((await owner.command('/announce Gather at the safehouse.')).ok); const event = await near.wait('chat', m => m.system && m.text === 'Gather at the safehouse.'); assert.equal(event.senderId, null);
      assert((await owner.command('/save')).ok); const saved = fs.readFileSync(worldFile, 'utf8'); assert(!saved.includes(ownerToken)); assert.equal(JSON.parse(saved).version, 1);
      for (const text of ['/time 24', '/weather tornado', '/difficulty invincible', '/eval process.exit()']) assert.equal((await owner.command(text)).ok, false, text);
    });
    await check('owner supplies obey catalogue, count and pack capacity and teleports obey clear loaded global tiles', async () => {
      const before = host.getPlayers().find(r => r.id === near.welcome.id).player.inventory.food;
      assert((await owner.command('/give "Nearby Survivor" food 1')).ok);
      assert.equal(host.getPlayers().find(r => r.id === near.welcome.id).player.inventory.food, before + 1);
      for (const text of ['/give me fake_item 1', '/give me food 101', '/give me food 100', '/give me __proto__ 1', '/tp me 99999 99999']) assert.equal((await owner.command(text)).ok, false, text);
      const state = host.getState(), solid = state.tiles.findIndex((t, i) => [3, 4, 5, 6, 8, 9].includes(t) && i % state.width > 0 && Math.floor(i / state.width) > 0);
      assert.equal((await owner.command('/tp me ' + (solid % state.width + state.world.originX) + ' ' + (Math.floor(solid / state.width) + state.world.originY))).ok, false);
      const p = host.getPlayers().find(r => r.id === owner.welcome.id).player, tile = tileAtDistance(host, p, 80, 160);
      assert((await owner.command('/tp "Nearby Survivor" ' + tile.join(' '))).ok);
      const after = host.getPlayers().find(r => r.id === near.welcome.id).player; assert.equal(after.x, (tile[0] + .5) * 32); assert.equal(after.y, (tile[1] + .5) * 32);
    });
    await check('nearby chat reaches only survivors within twenty tiles and leaves distant recipients and later joins out', async () => {
      const p = host.getPlayers().find(r => r.id === owner.welcome.id).player, tile = tileAtDistance(host, p, 800, 1000);
      assert((await owner.command('/tp "Far Survivor" ' + tile.join(' '))).ok);
      near.send({ type: 'chat', text: 'Nearby secret conversation.', scope: 'local' }); await owner.wait('chat', m => m.text === 'Nearby secret conversation.'); await delay(50);
      assert(!far.messages.some(m => m.text === 'Nearby secret conversation.'));
      const later = await add('Later Guest'); const welcome = await later.wait('welcome'); assert(!welcome.chatHistory.some(m => m.text === 'Nearby secret conversation.')); await later.close();
    });
    await check('the host gates WebRTC offer, answer and ICE exchange on bilateral voice opt-in and real proximity', async () => {
      let marker = owner.messages.length;
      owner.send({ type: 'voice-state', enabled: true, talking: false }); near.send({ type: 'voice-state', enabled: true, talking: true }); far.send({ type: 'voice-state', enabled: true, talking: false });
      const roster = await owner.wait('voice-peers', m => owner.messages.indexOf(m) >= marker && m.peers.some(p => p.id === near.welcome.id && p.talking)); assert(roster.peers.find(p => p.id === near.welcome.id).distance <= 640); assert(!roster.peers.some(p => p.id === far.welcome.id));
      const offer = { type: 'offer', sdp: 'v=0\r\ns=local-test-offer\r\n' }, answer = { type: 'answer', sdp: 'v=0\r\ns=local-test-answer\r\n' }, candidate = { type: 'candidate', candidate: 'candidate:1 1 UDP 1 127.0.0.1 12345 typ host', sdpMid: '0', sdpMLineIndex: 0 };
      owner.send({ type: 'voice-signal', to: near.welcome.id, data: offer }); assert.deepEqual((await near.wait('voice-signal', m => m.data.type === 'offer')).data, offer);
      near.send({ type: 'voice-signal', to: owner.welcome.id, data: answer }); assert.equal((await owner.wait('voice-signal', m => m.data.type === 'answer')).from, near.welcome.id);
      owner.send({ type: 'voice-signal', to: near.welcome.id, data: candidate }); assert.deepEqual((await near.wait('voice-signal', m => m.data.type === 'candidate')).data, candidate);
      const seq = owner.send({ type: 'voice-signal', to: far.welcome.id, data: offer }); assert.match((await owner.wait('command-result', m => m.seq === seq)).message, /nearby/); assert(!far.messages.some(m => m.type === 'voice-signal'));
      marker = owner.messages.length; near.send({ type: 'voice-state', enabled: false, talking: false }); await owner.wait('voice-peers', m => owner.messages.indexOf(m) >= marker && m.peers.length === 0); const seq2 = owner.send({ type: 'voice-signal', to: near.welcome.id, data: offer }); assert.equal((await owner.wait('command-result', m => m.seq === seq2)).ok, false);
    });
    await check('candidate bursts use their own rate budget while excessive signaling is bounded and ordinary play continues', async () => {
      const burst = await add('Voice burst'); const welcome = await burst.wait('welcome');
      burst.send({ type: 'voice-state', enabled: true, talking: false }); await owner.wait('voice-peers', m => m.peers.some(p => p.id === welcome.id));
      for (let i = 0; i < 125; i++) burst.send({ type: 'voice-signal', to: owner.welcome.id, data: { type: 'candidate', candidate: 'candidate:burst' + i, sdpMid: '0', sdpMLineIndex: 0 } });
      await owner.wait('voice-signal', m => m.data.candidate === 'candidate:burst119');
      assert.match((await burst.wait('command-result', m => !m.ok)).message, /too quickly/); await delay(30);
      assert.equal(owner.messages.filter(m => m.type === 'voice-signal' && m.from === welcome.id).length, 120);
      const seq = burst.send({ type: 'action', action: 'stairsUp' }); assert.equal((await burst.wait('ack', m => m.seq === seq)).ok, false); await burst.close();
    });
    await check('voice rosters remove a peer after a legal teleport outside earshot, with no client position trust', async () => {
      const marker = owner.messages.length; near.send({ type: 'voice-state', enabled: true, talking: false }); await owner.wait('voice-peers', m => owner.messages.indexOf(m) >= marker && m.peers.some(p => p.id === near.welcome.id));
      const prior = owner.messages.length, p = host.getPlayers().find(r => r.id === owner.welcome.id).player, tile = tileAtDistance(host, p, 1200, 1400);
      assert((await owner.command('/tp "Nearby Survivor" ' + tile.join(' '))).ok); await delay(30); assert(owner.messages.slice(prior).some(m => m.type === 'voice-peers' && !m.peers.some(p => p.id === near.welcome.id)));
      const injected = await add('Voice injection'); await injected.wait('welcome'); injected.send({ type: 'voice-state', enabled: true, talking: false, x: p.x, y: p.y }); assert.match((await injected.wait('error')).message, /Invalid social/);
    });
    await check('SDP, candidate size and payload shape are bounded before signaling can reach another survivor', async () => {
      const malformed = [{ type: 'offer', sdp: 'x'.repeat(8193) }, { type: 'candidate', candidate: 'x'.repeat(2049), sdpMid: '0', sdpMLineIndex: 0 }, { type: 'candidate', candidate: 'ok', sdpMid: '0', sdpMLineIndex: 999 }, { type: 'offer', sdp: 'v=0\r\n', from: owner.welcome.id }];
      for (let i = 0; i < malformed.length; i++) { const c = await add('Malformed Voice ' + i); await c.wait('welcome'); c.send({ type: 'voice-signal', to: owner.welcome.id, data: malformed[i] }); assert.match((await c.wait('error')).message, /Invalid social/); }
      const bytes = await add('Oversized bytes'); await bytes.wait('welcome'); bytes.send({ type: 'voice-signal', to: owner.welcome.id, data: { type: 'offer', sdp: '\\'.repeat(8000) } }); assert.match((await bytes.wait('error')).message, /size limit/);
    });
    await check('kick disconnects an ordinary guest, bans persist only hashed saved identities, and owner sessions are protected', async () => {
      const target = await add('Moderation Target'); const welcome = await target.wait('welcome');
      assert((await owner.command('/kick "Moderation Target" Please rejoin politely.')).ok); assert.equal((await target.wait('error')).message, 'Please rejoin politely.'); await target.close();
      const rejoined = await add('Moderation Target', { identity: welcome.identity }); await rejoined.wait('welcome');
      assert((await owner.command('/ban ' + welcome.id + ' Repeated griefing.')).ok); await rejoined.wait('error'); await rejoined.close();
      bannedIdentity = welcome.identity; bannedId = welcome.id;
      const banned = await add('Moderation Target', { identity: bannedIdentity }); assert.match((await banned.wait('error')).message, /banned/);
      assert.equal((await owner.command('/ban me')).ok, false); assert.equal((await owner.command('/kick me')).ok, false);
      const list = await owner.command('/bans'); assert(list.ok && list.message.includes(bannedId));
      const saved = fs.readFileSync(worldFile, 'utf8'), document = JSON.parse(saved); assert.equal(document.bans.length, 1); assert.equal(document.bans[0].id, bannedId); assert(!saved.includes(bannedIdentity)); assert(!saved.includes(ownerToken));
    });
    await check('a restart retains bans and world controls, resets owner roles, and permits an owner to unban the saved survivor', async () => {
      const identity = owner.welcome.identity, ownerId = owner.welcome.id; await host.close();
      host = await createServer({ port: 0, public: true, autoTick: false, worldFile, ownerToken });
      assert.equal(host.getState().time, 14.5); assert.equal(host.getState().difficulty, 'hard'); assert.equal(host.getState().weather, 'rain');
      const denied = await add('Moderation Target', { identity: bannedIdentity }); assert.match((await denied.wait('error')).message, /banned/);
      const formerOwner = await add('World Owner', { identity }); const welcome = await formerOwner.wait('welcome'); assert.equal(welcome.id, ownerId); assert.equal(welcome.owner, false); assert.equal((await formerOwner.command('/save')).ok, false); await formerOwner.close();
      owner = await add('World Owner', { identity, ownerToken }); owner.welcome = await owner.wait('welcome'); assert(owner.welcome.owner); assert((await owner.command('/unban ' + bannedId)).ok);
      const permitted = await add('Moderation Target', { identity: bannedIdentity }); assert.equal((await permitted.wait('welcome')).id, bannedId); await permitted.close(); assert.equal(JSON.parse(fs.readFileSync(worldFile, 'utf8')).bans.length, 0);
    });
    await check('healing restores a survivor actually wounded by the shared simulation and works with the default self target', async () => {
      const survivor = await add('Moderation Target', { identity: bannedIdentity }); await survivor.wait('welcome');
      const state = host.getState(), zombie = state.zombies.find(z => z.health > 0 && clearTile(state, Math.floor(z.x / 32), Math.floor(z.y / 32)));
      assert(zombie, 'the seeded world contains a living zombie on a clear tile');
      const x = Math.floor(zombie.x / 32) + state.world.originX, y = Math.floor(zombie.y / 32) + state.world.originY;
      assert((await owner.command('/tp ' + bannedId + ' ' + x + ' ' + y)).ok); host.tick();
      assert(host.getPlayers().find(r => r.id === bannedId).player.health < 100, 'real zombie contact damages the teleported survivor');
      assert((await owner.command('/heal ' + bannedId)).ok); const restored = host.getPlayers().find(r => r.id === bannedId).player;
      assert.equal(restored.health, 100); assert.equal(restored.stamina, 100); assert.equal(restored.bleeding, 0); assert.equal(restored.infection, 0);
      assert.equal(restored.hunger, 0); assert.equal(restored.thirst, 0);
      assert((await owner.command('/heal')).ok); await survivor.close();
    });
    await check('join history remains bounded during real multi-user chat and starts empty after a world restart', async () => {
      assert.equal(owner.welcome.chatHistory.length, 0);
      const writers = [];
      for (let i = 0; i < 15; i++) { const c = await add('History ' + i); await c.wait('welcome'); writers.push(c); for (let j = 0; j < 6; j++) c.send({ type: 'chat', text: 'History ' + i + ':' + j }); await owner.wait('chat', m => m.text === 'History ' + i + ':5'); }
      const late = await add('History Reader'); const welcome = await late.wait('welcome'); assert.equal(welcome.chatHistory.length, 80); assert.equal(welcome.chatHistory.at(-1).text, 'History 14:5'); assert(!JSON.stringify(welcome).includes(ownerToken));
      for (const c of writers) await c.close(); await late.close();
    });
    await check('older host saves with no ban field migrate and invalid persistent bans are rejected', async () => {
      await host.save(); const document = JSON.parse(fs.readFileSync(worldFile, 'utf8')); delete document.bans;
      const oldFile = path.join(directory, 'legacy.json'); fs.writeFileSync(oldFile, JSON.stringify(document)); const legacy = await createServer({ port: 0, public: true, autoTick: false, worldFile: oldFile, ownerToken }); await legacy.close(); assert.deepEqual(JSON.parse(fs.readFileSync(oldFile, 'utf8')).bans, []);
      document.bans = [{ id: bannedId, identityHash: 'a'.repeat(64), name: 'Moderation Target', reason: 'Invalid hash.', time: Date.now() }]; const invalidFile = path.join(directory, 'invalid.json'); fs.writeFileSync(invalidFile, JSON.stringify(document));
      await assert.rejects(createServer({ port: 0, public: true, autoTick: false, worldFile: invalidFile, ownerToken }), /Ban list references/);
      await assert.rejects(createServer({ port: 0, ownerToken: 'short', worldFile: path.join(directory, 'unused.json') }), /owner key/);
    });
    await check('optional native HTTPS and WSS protect local hosting, publish secure addresses and require a certificate-key pair', async () => {
      const certFile = path.join(directory, 'fixture-cert.pem'), keyFile = path.join(directory, 'fixture-key.pem');
      execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyFile, '-out', certFile, '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
      await assert.rejects(createServer({ port: 0, tlsCert: certFile, worldFile: path.join(directory, 'tls-unused.json') }), /both/);
      const read = url => new Promise((resolve, reject) => {
        // This exception applies only to our ephemeral self-signed test certificate.
        https.get(url, { rejectUnauthorized: false }, res => { let body = ''; res.on('data', chunk => { body += chunk; }); res.on('end', () => resolve(JSON.parse(body))); }).on('error', reject);
      });
      let secureHost;
      try {
        secureHost = await createServer({ port: 0, tlsCert: certFile, tlsKey: keyFile, ownerToken, autoTick: false, worldFile: path.join(directory, 'tls-private.json') });
        assert(secureHost.url.startsWith('wss://')); assert(secureHost.httpUrl.startsWith('https://'));
        const invite = JSON.parse(Buffer.from(secureHost.invite.slice(8), 'base64url').toString()); assert(invite.url.startsWith('wss://'));
        const secure = await connect(secureHost, 'Secure Guest', { token: invite.token, ownerToken }, { rejectUnauthorized: false }); clients.push(secure); assert((await secure.wait('welcome')).owner);
        secure.send({ type: 'chat', text: 'Encrypted local world.' }); assert.equal((await secure.wait('chat', m => m.text === 'Encrypted local world.')).name, 'Secure Guest');
        assert.equal((await read(secureHost.httpUrl + 'health')).protocol, 1); assert.deepEqual((await read(secureHost.httpUrl + 'servers')).servers, []);
        await secureHost.close(); secureHost = await createServer({ port: 0, public: true, tlsCert: certFile, tlsKey: keyFile, ownerToken, autoTick: false, worldFile: path.join(directory, 'tls-public.json') });
        const listing = await read(secureHost.httpUrl + 'servers'); assert(listing.servers[0].url.startsWith('wss://')); assert(!JSON.stringify(listing).includes(ownerToken));
      } finally { if (secureHost) await secureHost.close(); }
    });
    console.log(passed + ' multiplayer social and owner checks passed.');
  } finally {
    for (const c of clients) if (c.socket.readyState !== WebSocket.CLOSED) c.socket.terminate();
    if (host) await host.close(); fs.rmSync(directory, { recursive: true, force: true });
  }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
