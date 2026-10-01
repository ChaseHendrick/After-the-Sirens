'use strict';
const VOICE_RANGE = 640, CHAT_LIMIT = 80;
const UUID = /^[a-f0-9-]{36}$/, HASH = /^[a-f0-9]{64}$/;
const clean = (value, limit) => typeof value === 'string' && value.length <= limit && !/[\u0000-\u001f\u007f]/.test(value);
const keys = (value, allowed) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(k => allowed.includes(k));
function restoreBans(value, records) {
  if (value === undefined) return new Map();
  if (!Array.isArray(value) || value.length > 64) throw new Error('Invalid world ban list.');
  const bans = new Map();
  for (const entry of value) {
    if (!keys(entry, ['id', 'identityHash', 'name', 'reason', 'time']) || !UUID.test(entry.id) || !HASH.test(entry.identityHash) || !clean(entry.name, 24) || !entry.name.length || !clean(entry.reason, 160) || !Number.isSafeInteger(entry.time) || entry.time < 0 || bans.has(entry.identityHash)) throw new Error('Invalid world ban list.');
    const record = records.get(entry.id);
    if (!record || record.identityHash !== entry.identityHash || record.name !== entry.name) throw new Error('Ban list references an unknown survivor.');
    bans.set(entry.identityHash, { ...entry });
  }
  return bans;
}
function createSocial(api) {
  const { connections, records, send, save, changed, forget, withPlayer, localPlayer, inScene, engine: E, catalog, bans } = api;
  let serial = 0;
  const history = [];
  function response(connection, seq, ok, message) { send(connection.socket, { type: 'command-result', seq, ok, message }); }
  function allowedRate(connection, key, count, period, amount = 1) {
    const now = Date.now();
    if (!connection.socialRates) connection.socialRates = {};
    let rate = connection.socialRates[key];
    if (!rate || now - rate.at >= period) rate = connection.socialRates[key] = { at: now, count: 0 };
    rate.count += amount; return rate.count <= count;
  }
  function distance(a, b) {
    const floor = r => Number.isInteger(r.player.floor) ? r.player.floor : 0;
    return floor(a) === floor(b) ? Math.hypot(a.player.x - b.player.x, a.player.y - b.player.y) : Infinity;
  }
  function broadcast(text, sender, scope = 'world', system = false) {
    const event = { type: 'chat', id: ++serial, senderId: sender ? sender.record.id : null, name: sender ? sender.record.name : 'World', owner: sender ? !!sender.owner : true, text, scope, time: Date.now() };
    if (system) event.system = true;
    if (scope === 'world') {
      history.push(event);
      if (sender) {
        const own = history.filter(entry => entry.senderId === sender.record.id);
        while (own.length > 20) history.splice(history.indexOf(own.shift()), 1);
      }
      while (history.length > CHAT_LIMIT) history.shift();
    }
    for (const connection of connections.values()) if (scope === 'world' || sender && distance(sender.record, connection.record) <= VOICE_RANGE) send(connection.socket, event);
    return event;
  }
  function eligible(a, b) { return a !== b && !a.removed && !b.removed && !!a.voiceEnabled && !!b.voiceEnabled && distance(a.record, b.record) <= VOICE_RANGE; }
  function updatePeers() {
    for (const connection of connections.values()) {
      const peers = [...connections.values()].filter(other => eligible(connection, other)).map(other => ({ id: other.record.id, name: other.record.name, distance: Math.round(distance(connection.record, other.record)), talking: !!other.voiceTalking }));
      const value = JSON.stringify(peers);
      if (connection.lastVoicePeers !== value) { connection.lastVoicePeers = value; send(connection.socket, { type: 'voice-peers', peers }); }
    }
  }
  function findTarget(value, caller) {
    if (!value || ['me', '@me'].includes(value.toLowerCase())) return caller.record;
    const all = [...records.values()], exact = all.filter(record => record.id === value || record.name.toLowerCase() === value.toLowerCase());
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) throw new Error('That name belongs to more than one survivor. Use a survivor ID from /players.');
    const matches = value.length >= 4 ? all.filter(record => record.id.startsWith(value.toLowerCase())) : [];
    if (matches.length === 1) return matches[0];
    throw new Error('Survivor not found. Use a name, a unique ID prefix, or me. Put names containing spaces in double quotes.');
  }
  function parseCommand(text) {
    const result = [], pattern = /"([^"\r\n]*)"|(\S+)/g;
    let match, consumed = 0;
    while ((match = pattern.exec(text))) {
      if (text.slice(consumed, match.index).trim() || (match[2] && match[2].includes('"'))) throw new Error('Use complete double quotes around names containing spaces.');
      result.push(match[1] === undefined ? match[2] : match[1]); consumed = pattern.lastIndex;
    }
    if (text.slice(consumed).trim()) throw new Error('Invalid command arguments.');
    return result;
  }
  async function command(connection, message) {
    const seq = message.seq;
    if (!allowedRate(connection, 'commands', 40, 10000)) return response(connection, seq, false, 'Commands are arriving too quickly. Try again in a few seconds.');
    try {
      const args = parseCommand(message.text), name = args.shift().slice(1).toLowerCase();
      if (name === 'help') {
        if (args.length) throw new Error('Use /help.');
        const basic = '/help, /players, /where, /items [SEARCH]. Chat scope can be World or Nearby. Nearby chat and voice reach 20 tiles on the same floor.';
        response(connection, seq, true, basic + (connection.owner ? ' Owner: /where TARGET, /kick TARGET [REASON], /ban TARGET [REASON], /unban ID, /bans, /forget TARGET, /announce TEXT, /save, /time HOUR, /weather clear|overcast|rain, /difficulty calm|standard|hard, /give [TARGET] ITEM COUNT (1 to 100), /heal [TARGET], /tp [TARGET] GLOBAL_TILE_X GLOBAL_TILE_Y. TARGET may be me, an ID prefix, or a quoted name. Teleports require a clear tile in the loaded region.' : ' World controls and moderation require the owner key.')); return;
      }
      if (name === 'players') {
        if (args.length) throw new Error('Use /players.');
        response(connection, seq, true, [...connections.values()].map(c => c.record.name + ' [' + c.record.id + ']' + (c.owner ? ' (owner)' : '')).join('\n') || 'No survivors are connected.'); return;
      }
      if (name === 'where') {
        if (args.length > 1) throw new Error('Use /where [TARGET].');
        // Offline positions are not in snapshots; only owners may locate another survivor.
        if (args.length && !connection.owner && !['me', '@me', connection.record.id, connection.record.name.toLowerCase()].includes(args[0].toLowerCase())) throw new Error('Only the world owner can locate other survivors. Use /where for your own position.');
        const record = findTarget(args[0], connection);
        response(connection, seq, true, record.name + ' is at global tile ' + Math.floor(record.player.x / 32) + ', ' + Math.floor(record.player.y / 32) + ' on the ground floor.'); return;
      }
      if (name === 'items') {
        const search = args.join(' ').toLowerCase(), matches = Object.entries(catalog.items).filter(([id, item]) => !search || id.includes(search) || item.name.toLowerCase().includes(search));
        response(connection, seq, true, matches.length ? matches.slice(0, 20).map(([id, item]) => id + ': ' + item.name).join('\n') + (matches.length > 20 ? '\nShowing 20 of ' + matches.length + '. Add a search term to /items.' : '') : 'No catalogue items match that search.'); return;
      }
      if (!connection.owner) throw new Error('This command requires the world owner key.');
      let result = '';
      if (name === 'kick' || name === 'ban') {
        if (!args.length) throw new Error('Use /' + name + ' TARGET [REASON].');
        const record = findTarget(args.shift(), connection), other = connections.get(record.id), reason = args.join(' ') || (name === 'ban' ? 'Banned by the world owner.' : 'Removed by the world owner.');
        if (!clean(reason, 160)) throw new Error('Keep the reason to 160 characters.');
        if (record.id === connection.record.id || other && other.owner) throw new Error('Owner sessions cannot be kicked or banned.');
        if (name === 'kick' && !other) throw new Error('That survivor is not connected.');
        if (name === 'ban') bans.set(record.identityHash, { id: record.id, identityHash: record.identityHash, name: record.name, reason, time: Date.now() });
        if (other) { other.removed = true; other.input = {}; other.lastInput = 0; send(other.socket, { type: 'error', message: reason }); other.socket.close(1008, name === 'ban' ? 'Banned by owner.' : 'Removed by owner.'); updatePeers(); }
        await save(); result = record.name + (name === 'ban' ? ' was banned. The saved survivor identity can no longer join.' : ' was removed from this world.');
      } else if (name === 'unban') {
        if (args.length !== 1 || args[0].length < 4) throw new Error('Use /unban ID from /bans.');
        const matches = [...bans.values()].filter(ban => ban.id === args[0] || ban.id.startsWith(args[0].toLowerCase()));
        if (matches.length !== 1) throw new Error('Use one unique banned survivor ID from /bans.');
        bans.delete(matches[0].identityHash); await save(); result = matches[0].name + ' may join again.';
      } else if (name === 'forget') {
        if (args.length !== 1) throw new Error('Use /forget TARGET.');
        const record = findTarget(args[0], connection);
        if (record.id === connection.record.id || connections.has(record.id)) throw new Error('Only offline survivors can be forgotten. Kick a connected survivor first.');
        if (bans.has(record.identityHash)) throw new Error('Banned survivors stay on record. Use /unban first.');
        forget(record); await save(); result = record.name + ' was forgotten. That saved survivor, pack and identity were removed.';
      } else if (name === 'bans') {
        if (args.length) throw new Error('Use /bans.');
        result = [...bans.values()].map(ban => ban.name + ' [' + ban.id + ']: ' + ban.reason).join('\n') || 'No survivors are banned.';
      } else if (name === 'announce') {
        const text = args.join(' ');
        if (!text.length) throw new Error('Use /announce TEXT.');
        if (!allowedRate(connection, 'announcements', 6, 10000)) throw new Error('Announcements are arriving too quickly. Try again in a few seconds.');
        broadcast(text, null, 'world', true); result = 'Announcement sent.';
      } else if (name === 'save') {
        if (args.length) throw new Error('Use /save.');
        await save(); result = 'World saved on the host computer.';
      } else if (name === 'time') {
        const hour = Number(args[0]);
        if (args.length !== 1 || !Number.isFinite(hour) || hour < 0 || hour >= 24) throw new Error('Use /time HOUR, from 0 up to 24.');
        api.state().time = hour; result = 'World time set to ' + hour + '.';
      } else if (name === 'weather') {
        if (args.length !== 1 || !['clear', 'overcast', 'rain'].includes(args[0])) throw new Error('Use /weather clear, overcast, or rain.');
        const state = api.state(); state.weather = args[0];
        if (state.progression && state.progression.event.kind === 'rain') { state.progression.event.kind = 'none'; state.progression.event.previousWeather = args[0]; }
        result = 'Weather set to ' + args[0] + '.';
      } else if (name === 'difficulty') {
        if (args.length !== 1 || !['calm', 'standard', 'hard'].includes(args[0])) throw new Error('Use /difficulty calm, standard, or hard.');
        const state = api.state(); state.difficulty = args[0]; if (state.world) state.world.difficulty = args[0]; if (state.stories) state.stories.difficulty = args[0]; result = 'World difficulty set to ' + args[0] + '.';
      } else if (name === 'give') {
        if (args.length !== 2 && args.length !== 3) throw new Error('Use /give [TARGET] ITEM COUNT.');
        const record = args.length === 3 ? findTarget(args.shift(), connection) : connection.record, item = args[0], count = Number(args[1]);
        if (!Object.hasOwn(catalog.items, item) || !Number.isInteger(count) || count < 1 || count > 100) throw new Error('Use a catalogue item ID and a count from 1 to 100.');
        withPlayer(record, () => {
          const state = api.state(), inventory = { ...state.player.inventory, [item]: (state.player.inventory[item] || 0) + count };
          if (inventory[item] > 1000 || E.inventoryWeight(inventory) > E.carryCapacity(state) + .00001) throw new Error('Those supplies exceed the survivor pack capacity.');
          state.player.inventory = inventory;
        });
        result = 'Gave ' + count + ' ' + catalog.items[item].name + ' to ' + record.name + '.';
      } else if (name === 'heal') {
        if (args.length > 1) throw new Error('Use /heal [TARGET].');
        const record = findTarget(args[0], connection);
        Object.assign(record.player, { health: 100, stamina: 100, hunger: 0, thirst: 0, infection: 0, bleeding: 0, invulnerable: 1, resting: false });
        const state = api.state(); state.ended = false; if (state.progression) { state.progression.fatigue = 0; state.progression.sleeping = false; }
        result = record.name + ' was healed.';
      } else if (name === 'tp') {
        if (args.length !== 2 && args.length !== 3) throw new Error('Use /tp [TARGET] GLOBAL_TILE_X GLOBAL_TILE_Y.');
        const record = args.length === 3 ? findTarget(args.shift(), connection) : connection.record, x = Number(args[0]), y = Number(args[1]);
        if (![x, y].every(n => Number.isInteger(n) && Math.abs(n) <= 20000)) throw new Error('Teleport coordinates must be whole global tile numbers in the loaded region.');
        const next = { ...record.player, x: (x + .5) * 32, y: (y + .5) * 32 }, local = localPlayer({ player: next }), state = api.state();
        if (!inScene(local) || E.isSolid(state, local.x / 32, local.y / 32)) throw new Error('Choose a clear ground-floor tile in the loaded region.');
        const vehicle = state.vehicles.find(v => v.id === record.player.vehicleId); if (vehicle) vehicle.speed = 0;
        record.player.x = next.x; record.player.y = next.y; record.player.vehicleId = null; record.conversation = null;
        const active = connections.get(record.id); if (active) { active.input = {}; active.lastInput = 0; }
        updatePeers(); result = record.name + ' moved to global tile ' + x + ', ' + y + '.';
      } else throw new Error('Unknown command. Use /help.');
      if (!['save', 'bans', 'kick', 'ban', 'unban', 'announce', 'forget'].includes(name)) await save();
      changed(); response(connection, seq, true, result);
    } catch (error) { response(connection, seq, false, error.message || 'The command could not be completed.'); }
  }
  function validate(message) {
    if (message.type === 'chat') return keys(message, ['type', 'seq', 'text', 'scope']) && clean(message.text, 280) && message.text.trim().length > 0 && (message.scope === undefined || ['world', 'local'].includes(message.scope));
    if (message.type === 'voice-state') return keys(message, ['type', 'seq', 'enabled', 'talking']) && typeof message.enabled === 'boolean' && typeof message.talking === 'boolean' && (!message.talking || message.enabled);
    if (message.type !== 'voice-signal' || !keys(message, ['type', 'seq', 'to', 'data']) || !UUID.test(message.to)) return false;
    const data = message.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
    if (['offer', 'answer'].includes(data.type)) return keys(data, ['type', 'sdp']) && typeof data.sdp === 'string' && data.sdp.length > 0 && Buffer.byteLength(data.sdp) <= 8192 && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data.sdp);
    return data.type === 'candidate' && keys(data, ['type', 'candidate', 'sdpMid', 'sdpMLineIndex']) && typeof data.candidate === 'string' && Buffer.byteLength(data.candidate) <= 2048 && clean(data.candidate, 2048) && (data.sdpMid === null || clean(data.sdpMid, 64)) && (data.sdpMLineIndex === null || Number.isInteger(data.sdpMLineIndex) && data.sdpMLineIndex >= 0 && data.sdpMLineIndex <= 64);
  }
  function handle(connection, message) {
    if (message.type === 'chat') {
      message.text = message.text.trim();
      if (message.text.startsWith('/')) { command(connection, message); return; }
      if (!allowedRate(connection, 'chat', 6, 10000)) { response(connection, message.seq, false, 'Chat is arriving too quickly. Try again in a few seconds.'); return; }
      broadcast(message.text, connection, message.scope || 'world'); return;
    }
    if (message.type === 'voice-state') {
      if (!allowedRate(connection, 'voiceState', 20, 1000)) { response(connection, message.seq, false, 'Voice state updates are arriving too quickly.'); return; }
      connection.voiceEnabled = message.enabled; connection.voiceTalking = message.enabled && message.talking; updatePeers(); return;
    }
    if (!allowedRate(connection, 'voiceSignals', 120, 1000) || !allowedRate(connection, 'voiceBytes', 384000, 1000, Buffer.byteLength(JSON.stringify(message)))) { response(connection, message.seq, false, 'Voice signaling is arriving too quickly.'); return; }
    const other = connections.get(message.to);
    if (!other || !eligible(connection, other)) { response(connection, message.seq, false, 'Voice signaling needs two nearby survivors with voice enabled.'); return; }
    send(other.socket, { type: 'voice-signal', from: connection.record.id, data: message.data });
  }
  return { validate, handle, updatePeers, history: () => history.map(entry => ({ ...entry })), serializeBans: () => [...bans.values()].map(entry => ({ ...entry })) };
}
module.exports = { createSocial, restoreBans, VOICE_RANGE };
