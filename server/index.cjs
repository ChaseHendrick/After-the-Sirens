'use strict';
const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { WebSocketServer, WebSocket } = require('ws');
const { createSocial, restoreBans } = require('./social.cjs');
const ROOT = path.resolve(__dirname, '..');
const INPUT_RATE = 30, INPUT_BURST = 120, RECORD_LIMIT = 64, SAVE_DELAY = 2000;
// Unauthenticated sockets have their own global and per-address budgets so they cannot crowd out joins.
const SOCKET_LIMIT = 64, PENDING_LIMIT = 24, PENDING_PER_ADDRESS = 4, AUTH_TIMEOUT = 2000;
// Token buckets per remote address: any join, and creation of a new durable survivor.
const JOIN_LIMITS = { joinBurst: 30, joinRate: 1, survivorBurst: 20, survivorRate: 1 / 15 };
const NAME = /^[^\u0000-\u001f\u007f]{1,24}$/, RESERVED_NAME = /\[\s*(owner|nearby)\s*\]|^(world|host|console)$|[؜‎‏‪-‮⁦-⁩]/i;
const SIMULATION = ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine'];
const clone = value => JSON.parse(JSON.stringify(value));
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
function loadEngine() {
  const context = vm.createContext({ window: {}, console });
  for (const name of SIMULATION) vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', name + '.js'), 'utf8'), context, { filename: name + '.js' });
  return context.window.Sirens;
}
async function createServer(options = {}) {
  const host = options.host || '127.0.0.1', port = options.port === undefined ? 8787 : options.port;
  const interfaces = Object.values(os.networkInterfaces()).flat().filter(n => n && n.family === 'IPv4' && !n.internal);
  const guestHost = host === '0.0.0.0' || host === '::' ? (interfaces.find(n => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(n.address)) || interfaces[0] || { address: '127.0.0.1' }).address : host;
  const publicWorld = options.public === true, capacity = 20, worldName = String(options.name || 'After the Sirens world').slice(0, 60);
  const token = options.token || process.env.SIRENS_ROOM_TOKEN || crypto.randomBytes(24).toString('base64url');
  const ownerToken = options.ownerToken === undefined ? process.env.SIRENS_OWNER_TOKEN || crypto.randomBytes(24).toString('base64url') : options.ownerToken;
  if (typeof token !== 'string' || token.length < 12 || token.length > 128) throw new Error('Set SIRENS_ROOM_TOKEN to a private access key of 12 to 128 characters.');
  if (typeof ownerToken !== 'string' || ownerToken.length < 12 || ownerToken.length > 128 || /[\u0000-\u001f\u007f]/.test(ownerToken)) throw new Error('Set SIRENS_OWNER_TOKEN to an owner key of 12 to 128 characters.');
  const certFile = options.tlsCert || process.env.SIRENS_TLS_CERT, keyFile = options.tlsKey || process.env.SIRENS_TLS_KEY;
  if (!!certFile !== !!keyFile) throw new Error('TLS hosting requires both --tls-cert and --tls-key, or both SIRENS_TLS_CERT and SIRENS_TLS_KEY.');
  let tls = null;
  if (certFile && keyFile) {
    if (typeof certFile !== 'string' || typeof keyFile !== 'string') throw new Error('TLS certificate and key must be file paths.');
    const cert = fs.readFileSync(path.resolve(certFile)), key = fs.readFileSync(path.resolve(keyFile));
    if (cert.length > 128000 || key.length > 128000) throw new Error('TLS certificate or key exceeds its file budget.');
    tls = { cert, key };
  }
  const webScheme = tls ? 'https://' : 'http://', socketScheme = tls ? 'wss://' : 'ws://';
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid server port.');
  if (options.seed !== undefined && (!Number.isInteger(options.seed) || options.seed < 0 || options.seed > 4294967295)) throw new Error('World seed must be an integer from 0 to 4294967295.');
  if (options.difficulty && !['calm', 'standard', 'hard'].includes(options.difficulty)) throw new Error('Invalid world difficulty.');
  const limits = { ...JOIN_LIMITS, ...(options.joinLimits || {}) };
  if (!Object.keys(limits).every(key => key in JOIN_LIMITS && typeof limits[key] === 'number' && Number.isFinite(limits[key]) && limits[key] > 0)) throw new Error('Invalid join limits.');
  const S = loadEngine(), E = S.Engine, worldFile = path.resolve(options.worldFile || path.join(ROOT, 'server-data', 'world.save.json'));
  let state = E.create(options.seed === undefined ? 0 : options.seed, options.difficulty || 'standard', 'openworld');
  const template = clone(state.player), templatePersonal = clone(S.Personal.ensure(state)), records = new Map(), connections = new Map(), bites = new Map();
  const networkStats = { inputsAccepted: 0, inputsCoalesced: 0, inputRateDenials: 0 };
  let hostId = null, sequence = 0, tickCount = 0, closed = false, saving = Promise.resolve(), savedBans, dirty = false, saveTimer = null, lastSave = 0;
  const pending = new Set(), pendingByAddress = new Map(), addressBuckets = new Map();
  function allowAddress(address, key, burst, rate) {
    let entry = addressBuckets.get(address); if (!entry) { entry = {}; addressBuckets.set(address, entry); if (addressBuckets.size > 1024) addressBuckets.delete(addressBuckets.keys().next().value); }
    const now = Date.now(), bucket = entry[key] || (entry[key] = { tokens: burst, at: now });
    bucket.tokens = Math.min(burst, bucket.tokens + (now - bucket.at) / 1000 * rate); bucket.at = now;
    if (bucket.tokens < 1) return false; bucket.tokens--; return true;
  }
  const offset = () => ({ x: state.world.originX * 32, y: state.world.originY * 32 });
  function localPlayer(record) { const p = clone(record.player), o = offset(); p.x -= o.x; p.y -= o.y; return p; }
  function inScene(p) { return p.x >= 16 && p.y >= 16 && p.x < state.width * 32 - 16 && p.y < state.height * 32 - 16; }
  function connected() { return [...records.values()].filter(r => connections.has(r.id)); }
  function leader() { const active = connected(); return active.find(r => r.id === hostId && r.player.health > 0) || active.find(r => r.player.health > 0) || active[0] || records.get(hostId); }
  function withPlayer(record, operation) {
    const previous = { player: state.player, personal: state.personal, conversation: state.conversation, occupied: state._occupiedVehicles }, old = offset();
    state.player = localPlayer(record); state.personal = clone(record.personal); state.conversation = record.conversation || null;
    Object.defineProperty(state, '_occupiedVehicles', { value: new Set([...records.values()].filter(r => r.id !== record.id && r.player.vehicleId).map(r => r.player.vehicleId)), configurable: true, writable: true, enumerable: false });
    try { return operation(state.player); }
    finally {
      const o = offset(); record.player = clone(state.player); record.player.x += o.x; record.player.y += o.y;
      record.personal = clone(state.personal); record.conversation = state.conversation || null;
      previous.player.x -= o.x - old.x; previous.player.y -= o.y - old.y;
      state.player = previous.player; state.personal = previous.personal; state.conversation = previous.conversation;
      state._occupiedVehicles = previous.occupied;
    }
  }
  function alignWorld() { const r = leader(); if (r) { hostId = r.id; state.player = localPlayer(r); state.personal = clone(r.personal); state.conversation = null; } }
  function rendezvous(record) {
    const p = localPlayer(record); if (inScene(p) && !E.isSolid(state, p.x / 32, p.y / 32)) return;
    const anchor = leader(), base = anchor ? localPlayer(anchor) : state.player, o = offset();
    for (let radius = 0; radius < 6; radius++) for (let y = -radius; y <= radius; y++) for (let x = -radius; x <= radius; x++) {
      const px = (Math.floor(base.x / 32) + x + .5) * 32, py = (Math.floor(base.y / 32) + y + .5) * 32;
      if (inScene({ x: px, y: py }) && !E.isSolid(state, px / 32, py / 32)) { record.player.x = px + o.x; record.player.y = py + o.y; record.player.vehicleId = null; return; }
    }
    throw new Error('No safe meeting point is available.');
  }
  if (fs.existsSync(worldFile)) {
    const text = fs.readFileSync(worldFile, 'utf8'); if (text.length > 40000000) throw new Error('Server world exceeds the persistence budget.');
    const saved = JSON.parse(text); if (saved.version !== 1 || !Array.isArray(saved.players) || saved.players.length > RECORD_LIMIT) throw new Error('Invalid server world.'); savedBans = saved.bans;
    state = E.deserialize(saved.save); if (!state.world || state.stories && state.stories.floor) throw new Error('Multiplayer worlds must use the open-world ground floor.');
    for (const raw of saved.players) {
      if (!raw || typeof raw.id !== 'string' || !/^[a-f0-9-]{36}$/.test(raw.id) || records.has(raw.id) || typeof raw.identityHash !== 'string' || !/^[a-f0-9]{64}$/.test(raw.identityHash) || typeof raw.name !== 'string' || !NAME.test(raw.name) || raw.seen !== undefined && (!Number.isSafeInteger(raw.seen) || raw.seen < 0)) throw new Error('Invalid survivor identity.');
      const p = raw.player; if (!p || ![p.x, p.y].every(n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 600000)) throw new Error('Invalid survivor position.');
      const document = JSON.parse(saved.save), o = offset(), x = p.x, y = p.y;
      document.state.player = clone(p); document.state.player.x = state.player.x; document.state.player.y = state.player.y; document.state.player.vehicleId = null; document.state.personal = raw.personal;
      const checked = E.deserialize(JSON.stringify(document)); checked.player.x = x; checked.player.y = y;
      records.set(raw.id, { id: raw.id, identityHash: raw.identityHash, name: raw.name, seen: raw.seen || 0, player: clone(checked.player), personal: clone(checked.personal), conversation: null });
    }
    if (saved.hostId !== null && !records.has(saved.hostId)) throw new Error('Invalid room host identity.'); hostId = saved.hostId;
  }
  const bans = restoreBans(savedBans, records);
  function send(socket, message) { if (socket.readyState === WebSocket.OPEN && socket.bufferedAmount < 4000000) socket.send(JSON.stringify(message)); }
  function deny(socket, message) { send(socket, { type: 'error', message }); socket.close(1008, message.slice(0, 100)); }
  function party() {
    return connected().map(r => ({ id: r.id, name: r.name, player: localPlayer(r), look: withPlayer(r, () => clone(S.Personal.look(state))), connected: true, host: r.id === (leader() && leader().id), owner: !!connections.get(r.id).owner }));
  }
  // Actions, joins and leaves only mark the world changed; the fixed tick sends at most one snapshot per tick.
  function changed() { dirty = true; }
  function snapshot() {
    dirty = false; if (!connections.size) return;
    alignWorld(); const document = JSON.parse(E.serialize(state));
    // Clients need the loaded neighborhood. Complete journals remain on the host disk.
    for (const key of Object.keys(document.world.records)) { const [x, y] = key.split(',').map(Number); if (Math.abs(x - document.world.centerCX) > 1 || Math.abs(y - document.world.centerCY) > 1) delete document.world.records[key]; }
    const save = JSON.stringify(document), players = party(), effects = clone(S.Effects.drain(state)), currentHost = leader();
    for (const [id, connection] of connections) {
      const record = records.get(id);
      send(connection.socket, { type: 'snapshot', seq: ++sequence, save, players, player: localPlayer(record), personal: record.personal, conversation: record.conversation, effects, hostId: currentHost && currentHost.id });
    }
  }
  function save() {
    alignWorld(); const document = JSON.stringify({ version: 1, hostId, save: E.serialize(state), players: [...records.values()].map(r => ({ id: r.id, identityHash: r.identityHash, name: r.name, seen: r.seen || 0, player: r.player, personal: r.personal })), bans: social.serializeBans() });
    lastSave = Date.now();
    saving = saving.catch(() => {}).then(async () => { await fs.promises.mkdir(path.dirname(worldFile), { recursive: true }); const temporary = worldFile + '.tmp'; await fs.promises.writeFile(temporary, document, { mode: 0o600 }); await fs.promises.rename(temporary, worldFile); });
    return saving;
  }
  // Joins and leaves request a save; at most one such save starts every SAVE_DELAY milliseconds.
  function requestSave() {
    if (saveTimer || closed) return;
    saveTimer = setTimeout(() => { saveTimer = null; save().catch(error => { if (options.onError) options.onError(error); }); }, Math.max(0, lastSave + SAVE_DELAY - Date.now()));
  }
  // A new survivor may replace the durable record offline longest; banned and connected records stay.
  function evictable() { return [...records.values()].filter(r => !connections.has(r.id) && !bans.has(r.identityHash)).sort((a, b) => a.seen - b.seen)[0] || null; }
  function forget(record) { records.delete(record.id); for (const key of [...bites.keys()]) if (key.endsWith(':' + record.id)) bites.delete(key); if (hostId === record.id) hostId = null; }
  function guestDanger(record) {
    withPlayer(record, p => {
      if (p.health <= 0 || p.invulnerable > 0 || p.vehicleId) return;
      const hit = (enemy, range, amount, interval, kind) => {
        const key = enemy.id + ':' + record.id;
        if (enemy.health <= 0 || Math.hypot(enemy.x - p.x, enemy.y - p.y) > range || !E.hasLOS(state, p.x, p.y, enemy.x, enemy.y) || state.elapsed - (bites.get(key) || -10) < interval) return false;
        bites.set(key, state.elapsed); if (bites.size > 4096) bites.delete(bites.keys().next().value);
        const armor = S.Catalog.items[p.equipment && p.equipment.clothing]; p.health = Math.max(0, p.health - amount * (1 - Math.min(.7, armor && armor.armor || 0))); p.invulnerable = .85;
        if (kind === 'zombie') p.bleeding = Math.min(3, p.bleeding + .6); return true;
      };
      for (const z of state.zombies) if (hit(z, 39, state.difficulty === 'hard' ? 12 : state.difficulty === 'calm' ? 6 : 9, 1.25, 'zombie')) return;
      for (const h of state.humans) if (h.faction === 'raider' && hit(h, h.weapon === 'pistol' ? 280 : 64, h.weapon === 'pistol' ? 10 : 7, h.weapon === 'pistol' ? 1.4 : .8, 'human')) return;
    });
  }
  function usableInput(connection) {
    connection.pendingInput = false;
    if (Date.now() - connection.lastInput > 600) return {};
    const input = Object.assign({}, connection.input), o = offset();
    if (input.aimX !== undefined) input.aimX -= o.x; if (input.aimY !== undefined) input.aimY -= o.y; return input;
  }
  function tick() {
    if (closed || !connections.size) return;
    const anchor = leader(); if (!anchor) return;
    if (connected().some(r => r.player.health > 0)) state.ended = false;
    withPlayer(anchor, () => E.update(state, .05, usableInput(connections.get(anchor.id))));
    if (connected().some(r => r.player.health > 0)) state.ended = false;
    for (const r of connected()) {
      if (r.id !== anchor.id) { withPlayer(r, () => { E.stepParticipant(state, .05, usableInput(connections.get(r.id))); S.Personal.update(state, .05); }); guestDanger(r); }
      const p = localPlayer(r); if (!inScene(p)) rendezvous(r);
    }
    alignWorld(); tickCount++; if (dirty || tickCount % 2 === 0) snapshot(); if (tickCount % 10 === 0) social.updatePeers();
  }
  const social = createSocial({ connections, records, bans, send, save, changed, forget, withPlayer, localPlayer, inScene, state: () => state, engine: E, catalog: S.Catalog });
  const handler = (req, res) => {
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    if (req.url === '/health') { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify({ game: 'After the Sirens', protocol: 1, players: connections.size, capacity, public: publicWorld, name: worldName, difficulty: state.difficulty })); return; }
    if (req.url === '/servers') { res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }); const url = options.publicUrl || socketScheme + (guestHost.includes(':') ? '[' + guestHost + ']' : guestHost) + ':' + server.address().port + '/game'; res.end(JSON.stringify({ version: 1, servers: publicWorld ? [{ name: worldName, url, players: connections.size, capacity, public: true, difficulty: state.difficulty }] : [] })); return; }
    if (req.url !== '/' && req.url !== '/index.html') { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    fs.createReadStream(path.join(ROOT, 'index.html')).on('error', () => res.end('Build index.html first.')).pipe(res);
  };
  const server = tls ? https.createServer(tls, handler) : http.createServer(handler);
  const wss = new WebSocketServer({ noServer: true, maxPayload: 16384, perMessageDeflate: false, closeTimeout: 2000 });
  const addressOf = req => String(req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  server.on('upgrade', (req, socket, head) => {
    const address = addressOf(req);
    if (req.url !== '/game' || wss.clients.size >= SOCKET_LIMIT || pending.size >= PENDING_LIMIT || (pendingByAddress.get(address) || 0) >= PENDING_PER_ADDRESS) { socket.write('HTTP/1.1 403 Forbidden\r\n\r\n'); socket.destroy(); return; }
    const allowed = options.allowedOrigins || process.env.SIRENS_ALLOWED_ORIGINS;
    if (allowed && req.headers.origin && !String(allowed).split(',').map(v => v.trim()).includes(req.headers.origin)) { socket.write('HTTP/1.1 403 Forbidden\r\n\r\n'); socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
  });
  wss.on('connection', (socket, req) => {
    let id = null, alive = true, messageWindow = Date.now(), messages = 0, actions = 0, lastSeq = -1, waiting = true;
    // A socket holds an unauthenticated slot until it joins or finishes closing, including after a denial.
    const address = addressOf(req), release = () => { if (!waiting) return; waiting = false; pending.delete(socket); const n = (pendingByAddress.get(address) || 1) - 1; if (n > 0) pendingByAddress.set(address, n); else pendingByAddress.delete(address); };
    pending.add(socket); pendingByAddress.set(address, (pendingByAddress.get(address) || 0) + 1);
    const timeout = setTimeout(() => { if (!id) socket.terminate(); }, AUTH_TIMEOUT);
    socket.on('error', () => {}); socket.on('pong', () => { alive = true; });
    socket.on('message', (data, binary) => {
      try {
        if (socket.readyState !== WebSocket.OPEN) return;
        if (binary) return deny(socket, 'Only JSON commands are accepted.');
        const message = JSON.parse(data.toString()); if (!message || typeof message !== 'object' || Array.isArray(message)) return deny(socket, 'Invalid command.');
        if (data.length > (message.type === 'voice-signal' ? 12000 : 4096)) return deny(socket, 'Command exceeds its size limit.');
        if (Date.now() - messageWindow >= 1000) { messageWindow = Date.now(); messages = 0; actions = 0; }
        if (!['input', 'voice-state', 'voice-signal'].includes(message.type) && ++messages > 60) return deny(socket, 'Command rate exceeded.');
        if (!id) {
          if (Object.keys(message).some(key => !['type', 'protocol', 'token', 'name', 'identity', 'ownerToken'].includes(key)) || message.type !== 'join' || message.protocol !== 1 || typeof message.token !== 'string' || message.token.length > 128 || !publicWorld && !crypto.timingSafeEqual(Buffer.from(digest(message.token)), Buffer.from(digest(token)))) return deny(socket, 'Invalid world access key.');
          let owner = false;
          if (message.ownerToken !== undefined) {
            if (typeof message.ownerToken !== 'string' || message.ownerToken.length < 12 || message.ownerToken.length > 128 || !crypto.timingSafeEqual(Buffer.from(digest(message.ownerToken)), Buffer.from(digest(ownerToken)))) return deny(socket, 'Invalid world owner key.');
            owner = true;
          }
          if (connections.size >= capacity) return deny(socket, 'This world already has twenty survivors.');
          if (!allowAddress(address, 'join', limits.joinBurst, limits.joinRate)) return deny(socket, 'Joins from this network address are arriving too quickly. Wait a few seconds and try again.');
          let record, identity = message.identity || null;
          if (identity !== null && identity !== undefined && (typeof identity !== 'string' || !/^[A-Za-z0-9_-]{32}$/.test(identity))) return deny(socket, 'Invalid survivor identity.');
          if (identity) { record = [...records.values()].find(r => r.identityHash === digest(identity)); if (!record) return deny(socket, 'Unknown survivor identity.'); if (bans.has(record.identityHash)) return deny(socket, 'This survivor identity is banned from the world.'); if (connections.has(record.id)) return deny(socket, 'This survivor is already connected.'); }
          else {
            if (typeof message.name !== 'string' || !NAME.test(message.name.trim())) return deny(socket, 'Use a survivor name of 1 to 24 characters.');
            if (RESERVED_NAME.test(message.name.trim())) return deny(socket, 'Choose a survivor name that does not imitate World, Host, Console, [owner] or [nearby] labels.');
            const replaced = records.size >= RECORD_LIMIT ? evictable() : null;
            if (records.size >= RECORD_LIMIT && !replaced) return deny(socket, 'This world has reached its durable survivor limit.');
            if (!allowAddress(address, 'survivor', limits.survivorBurst, limits.survivorRate)) return deny(socket, 'New survivors from this network address are arriving too quickly. Rejoin later or use your saved survivor.');
            if (replaced) forget(replaced);
            identity = crypto.randomBytes(24).toString('base64url'); const o = offset();
            record = { id: crypto.randomUUID(), identityHash: digest(identity), name: message.name.trim(), seen: Date.now(), player: clone(template), personal: clone(templatePersonal), conversation: null };
            record.player.x = state.player.x + o.x; record.player.y = state.player.y + o.y; records.set(record.id, record);
          }
          rendezvous(record); id = record.id; record.seen = Date.now(); release(); if (!hostId) hostId = id;
          if (record.player.health > 0) state.ended = false;
          connections.set(id, { socket, record, owner, input: {}, lastInput: 0, pendingInput: false, inputTokens: INPUT_BURST, inputWindow: performance.now(), voiceEnabled: false, voiceTalking: false }); clearTimeout(timeout);
          send(socket, { type: 'welcome', protocol: 1, id, identity, hostId: leader().id, tickRate: 20, owner, chatHistory: social.history() }); changed(); social.updatePeers(); requestSave(); return;
        }
        if (!connections.get(id) || connections.get(id).removed) return deny(socket, 'This survivor session is no longer active.');
        if (!Number.isSafeInteger(message.seq) || message.seq < 0 || message.seq <= lastSeq) return deny(socket, 'Invalid or repeated command sequence.'); lastSeq = message.seq;
        if (['chat', 'voice-state', 'voice-signal'].includes(message.type)) {
          if (!social.validate(message)) return deny(socket, 'Invalid social command.');
          social.handle(connections.get(id), message); return;
        }
        const allowed = message.type === 'input' ? ['type', 'seq', 'moveX', 'moveY', 'sprint', 'sneak', 'attack', 'shoot', 'aimX', 'aimY'] : ['type', 'seq', 'action'];
        if (Object.keys(message).some(k => !allowed.includes(k))) return deny(socket, 'Invalid command fields.');
        if (message.type === 'input') {
          if (![message.moveX, message.moveY].every(v => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 1) || ['sprint', 'sneak', 'attack', 'shoot'].some(k => typeof message[k] !== 'boolean') || ['aimX', 'aimY'].some(k => message[k] !== undefined && (typeof message[k] !== 'number' || !Number.isFinite(message[k]) || Math.abs(message[k]) > 600000))) return deny(socket, 'Input is outside valid bounds.');
          const connection = connections.get(id), now = performance.now();
          // A stalled event loop can deliver several seconds of legitimate controls together.
          // Keep only the latest controls; received packets never advance the simulation.
          connection.inputTokens = Math.min(INPUT_BURST, connection.inputTokens + Math.max(0, now - connection.inputWindow) * INPUT_RATE / 1000); connection.inputWindow = now;
          if (connection.inputTokens < 1) { networkStats.inputRateDenials++; connection.input = {}; connection.lastInput = 0; connection.pendingInput = false; connection.removed = true; return deny(socket, 'Input rate exceeded.'); }
          connection.inputTokens--; networkStats.inputsAccepted++; if (connection.pendingInput) networkStats.inputsCoalesced++;
          connection.input = message; connection.lastInput = Date.now(); connection.pendingInput = true; return;
        }
        if (message.type !== 'action' || typeof message.action !== 'string' || message.action.length > 180 || ++actions > 12) return deny(socket, 'Invalid action or action rate exceeded.');
        const r = records.get(id), command = message.action; let reason = '', result = false, ran = false;
        if (['stairsUp', 'stairsDown'].includes(command)) reason = 'Multiplayer currently stays on the ground floor.';
        else if (r.player.health <= 0) reason = 'This survivor has fallen.';
        else withPlayer(r, () => {
          if (command === 'interact' && S.Stories.nearby(state)) { reason = 'Multiplayer currently stays on the ground floor.'; return; }
          if (command === 'vehicle') {
            const p = state.player, car = state.vehicles.filter(v => Math.hypot(v.x - p.x, v.y - p.y) < 75 && E.hasLOS(state, p.x, p.y, v.x, v.y)).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
            if (!p.vehicleId && car && [...records.values()].some(other => other.id !== id && other.player.vehicleId === car.id)) { reason = 'Another survivor is driving that car.'; return; }
          }
          ran = true;
          if (command === 'interact') result = E.interact(state);
          else if (command.startsWith('craft:')) result = E.craft(state, command.slice(6));
          else if (command.startsWith('build:')) result = E.build(state, command.slice(6));
          else result = E.action(state, command);
        });
        send(socket, { type: 'ack', seq: message.seq, ok: !!result, reason: reason || (result ? '' : 'That action is unavailable here or needs more supplies.') }); if (ran) changed();
      } catch (_) { deny(socket, 'The command could not be processed.'); }
    });
    socket.on('close', () => {
      clearTimeout(timeout); release();
      if (id && connections.get(id) && connections.get(id).socket === socket) {
        const r = records.get(id), car = state.vehicles.find(v => v.id === r.player.vehicleId); if (car) car.speed = 0; r.player.vehicleId = null; r.seen = Date.now();
        connections.delete(id); alignWorld(); requestSave(); changed(); social.updatePeers();
      }
    });
    socket._heartbeat = () => { if (!alive) return socket.terminate(); alive = false; socket.ping(); };
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
  const interval = options.autoTick === false ? null : setInterval(() => { try { tick(); } catch (error) { if (options.onError) options.onError(error); } }, 50);
  const persistence = setInterval(() => { save().catch(error => { if (options.onError) options.onError(error); }); }, 5000);
  const heartbeat = setInterval(() => { for (const socket of wss.clients) socket._heartbeat(); }, 10000);
  const actualPort = server.address().port, publicHost = host.includes(':') ? '[' + host + ']' : host;
  const publicUrl = options.publicUrl || socketScheme + (guestHost.includes(':') ? '[' + guestHost + ']' : guestHost) + ':' + actualPort + '/game';
  const invite = 'SIRENS1.' + Buffer.from(JSON.stringify({ version: 1, url: publicUrl, token, name: worldName })).toString('base64url');
  const directory = options.directoryUrl || process.env.SIRENS_DIRECTORY_URL;
  async function advertise() { if (!publicWorld || !directory) return; try { const response = await fetch(directory, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (options.directoryToken || process.env.SIRENS_DIRECTORY_TOKEN || '') }, body: JSON.stringify({ name: worldName, url: publicUrl, players: connections.size, capacity, public: true, difficulty: state.difficulty }), signal: AbortSignal.timeout(5000) }); if (!response.ok) throw new Error('Directory registration failed: ' + response.status); } catch (error) { if (options.onError) options.onError(error); } }
  const advertising = publicWorld && directory ? setInterval(advertise, 60000) : null; if (advertising) advertise();
  return { invite: publicWorld ? null : invite, ownerToken, publicUrl, url: socketScheme + publicHost + ':' + actualPort + '/game', httpUrl: webScheme + publicHost + ':' + actualPort + '/', port: actualPort, save, tick, snapshot, getState: () => state, getNetworkStats: () => ({ ...networkStats }), getPlayers: () => clone([...records.values()].map(r => ({ id: r.id, name: r.name, player: r.player, connected: connections.has(r.id) }))), async close() { if (closed) return; closed = true; if (advertising) clearInterval(advertising); if (interval) clearInterval(interval); clearInterval(persistence); clearInterval(heartbeat); clearTimeout(saveTimer); saveTimer = null; for (const socket of wss.clients) socket.terminate(); await new Promise(resolve => wss.close(resolve)); await save(); await new Promise(resolve => server.close(resolve)); } };
}
module.exports = { createServer, loadEngine };
if (require.main === module) {
  const args = process.argv.slice(2), get = (name, fallback) => { const index = args.indexOf('--' + name); return index >= 0 ? args[index + 1] : fallback; };
  createServer({ host: get('host', '127.0.0.1'), public: args.includes('--public'), name: get('name', 'After the Sirens world'), publicUrl: get('public-url', undefined), directoryUrl: get('directory', undefined), tlsCert: get('tls-cert', undefined), tlsKey: get('tls-key', undefined), port: Number(get('port', 8787)), seed: Number(get('seed', 0)), difficulty: get('difficulty', 'standard'), worldFile: get('world', path.join(ROOT, 'server-data', 'world.save.json')), onError: error => console.error('World server:', error.message) }).then(server => {
    console.log('After the Sirens world server: ' + server.httpUrl); console.log('Join address: ' + server.url); console.log('Up to 20 survivors. The world is saved on this computer.'); if (server.invite) console.log('Private invite (share with guests): ' + server.invite); else console.log('Public world: no access key required.');
    console.log('Owner key (keep private; enter separately to use owner commands): ' + server.ownerToken); console.log('Set SIRENS_OWNER_TOKEN to keep the same owner key after a restart.');
    const shutdown = () => server.close().then(() => process.exit(0)).catch(() => process.exit(1)); process.once('SIGINT', shutdown); process.once('SIGTERM', shutdown);
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
