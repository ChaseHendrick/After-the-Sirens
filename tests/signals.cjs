'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
let checks = 0, networkAttempts = 0, storageAttempts = 0;
const network = () => { networkAttempts++; throw new Error('Telemetry must not open a network connection'); };
const storage = new Proxy({}, { get() { storageAttempts++; throw new Error('Telemetry must not use persistent storage'); } });
const sandbox = { window: {}, fetch: network, XMLHttpRequest: network, WebSocket: network, navigator: { sendBeacon: network }, localStorage: storage, sessionStorage: storage };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/signals.js'), 'utf8'), sandbox);
const Signals = sandbox.window.Sirens.Signals;
const state = { mode: 'openworld', difficulty: 'standard', won: false, player: { health: 100 }, seed: 987, name: 'Never send this', accessKey: 'private-world-key' };
const clone = value => JSON.parse(JSON.stringify(value));
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }
function host(protocol = 'https:', parentMode = 'same-origin') {
  const events = [], messages = [];
  const result = { location: { protocol, origin: protocol === 'file:' ? 'null' : protocol + '//game.example' }, events, messages,
    fetch: network, XMLHttpRequest: network, WebSocket: network, navigator: { sendBeacon: network }, localStorage: storage, sessionStorage: storage,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    dispatchEvent(event) { events.push(clone(event.detail)); return true; }
  };
  if (parentMode === 'top') result.parent = result;
  else if (parentMode === 'cross-origin') result.parent = { location: { get origin() { throw new Error('SecurityError: cross-origin frame'); } }, postMessage: () => { throw new Error('Cross-origin parent must not receive events'); } };
  else result.parent = { location: { origin: parentMode === 'other-origin' ? 'https://other.example' : result.location.origin }, postMessage(message, target) { messages.push({ packet: clone(message), target }); } };
  return result;
}
function advance(signals, seconds, eligible = true) { for (let step = 0; step < seconds * 4; step++) signals.advance(.25, eligible); }
function eventNames(target) { return target.events.map(event => event.event); }

check('packets contain only exact finite-vocabulary properties and no player data', () => {
  const properties = { mode: 'openworld', difficulty: 'standard', view: 'top' };
  const message = Signals.packet('run_started', properties);
  assert.deepEqual(clone(message), { type: 'sirens:milestone', version: 1, event: 'run_started', properties });
  properties.mode = 'rescue';
  assert.equal(message.properties.mode, 'openworld', 'packet must not retain caller properties by reference');
  for (const invalid of [null, [], {}, { mode: 'openworld', difficulty: 'standard' }, { mode: 'openworld', difficulty: 'standard', view: 'top', seed: 1 }, { mode: 'openworld', difficulty: 'standard', view: 'first', accessKey: 'secret' }, { mode: 'openworld', difficulty: 'standard', view: 'TOP' }, { mode: 'openworld', difficulty: NaN, view: 'top' }]) assert.equal(Signals.packet('run_started', invalid), null);
  assert.equal(Signals.packet('__proto__', properties), null);
  assert.equal(Signals.packet('chat', { message: 'private text' }), null);
  const inherited = Object.assign(Object.create({ mode: 'openworld' }), { difficulty: 'standard', view: 'top', accessKey: 'secret' });
  assert.equal(Signals.packet('run_started', inherited), null, 'inherited expected fields must not disguise unexpected own fields');
  const h = host(), signals = Signals.create(h);
  signals.start(state, 'top', false);
  const encoded = JSON.stringify(h.events);
  for (const secret of ['seed', '987', 'Never send this', 'private-world-key', 'accessKey', 'name']) assert(!encoded.includes(secret), secret + ' escaped the allowlist');
});

check('offline and opaque-origin games emit nothing and never request network or storage', () => {
  for (const protocol of ['file:', 'data:', 'about:']) {
    const h = host(protocol), signals = Signals.create(h);
    signals.start(state, 'top', false); signals.language('ja'); signals.view('first'); advance(signals, 301); signals.end(state);
    assert.deepEqual(h.events, []); assert.deepEqual(h.messages, []);
  }
  assert.equal(networkAttempts, 0);
  assert.equal(storageAttempts, 0);
});

check('embedded events target only the exact same origin and top-level play uses local events', () => {
  const h = host(), signals = Signals.create(h);
  signals.start(state, 'first', false);
  assert.equal(h.events.length, 1); assert.equal(h.messages.length, 1);
  assert.equal(h.messages[0].target, 'https://game.example');
  assert.deepEqual(h.messages[0].packet, h.events[0]);
  for (const mode of ['top', 'other-origin', 'cross-origin']) {
    const foreign = host('https:', mode);
    assert.doesNotThrow(() => Signals.create(foreign).start(state, 'top', false));
    assert.equal(foreign.events.length, 1);
    assert.equal(foreign.messages.length, 0, mode + ' must not receive postMessage');
  }
});

check('engagement counts eligible foreground manual time and milestones occur once per run', () => {
  const h = host(), signals = Signals.create(h);
  signals.start(state, 'top', false);
  advance(signals, 600, false); // hidden, paused, menu, or AI-controlled time
  for (const elapsed of [-1, 0, NaN, Infinity, '0.25', .251, 1, 60, 300]) signals.advance(elapsed, true);
  assert.deepEqual(eventNames(h), ['run_started']);
  advance(signals, 59); assert.deepEqual(eventNames(h), ['run_started']);
  advance(signals, 1); assert.deepEqual(eventNames(h), ['run_started', 'play_60s']);
  advance(signals, 239); assert.deepEqual(eventNames(h), ['run_started', 'play_60s']);
  signals.view('first'); advance(signals, 1);
  const fiveMinutes = h.events.find(event => event.event === 'play_300s');
  assert(fiveMinutes); assert.equal(fiveMinutes.properties.view, 'first');
  advance(signals, 1000);
  assert.equal(eventNames(h).filter(event => event === 'play_60s').length, 1);
  assert.equal(eventNames(h).filter(event => event === 'play_300s').length, 1);
});

check('continue resets engagement, stopping cannot report an ending, and endings emit once', () => {
  const h = host(), signals = Signals.create(h);
  signals.start(state, 'top', false); advance(signals, 59); signals.stop(); advance(signals, 400); signals.end(state);
  assert.deepEqual(eventNames(h), ['run_started']);
  signals.start(state, 'first', true); advance(signals, 1);
  assert.deepEqual(eventNames(h), ['run_started', 'run_continued']);
  advance(signals, 59);
  signals.end({ won: false, player: { health: 0 } });
  signals.end({ won: true, player: { health: 100 } });
  advance(signals, 400);
  assert.deepEqual(eventNames(h), ['run_started', 'run_continued', 'play_60s', 'run_ended']);
  assert.equal(h.events.at(-1).properties.outcome, 'dead');
  signals.start({ ...state, mode: 'rescue' }, 'top', false);
  signals.end({ won: true, player: { health: 100 } });
  assert.equal(h.events.at(-1).properties.outcome, 'rescued');
  assert.equal(h.events.at(-1).properties.mode, 'rescue');
});

check('view and language changes have bounded once-per-value sampling', () => {
  const h = host(), signals = Signals.create(h);
  signals.view('first'); assert.equal(h.events.length, 0);
  signals.start(state, 'top', false);
  for (let n = 0; n < 200; n++) { signals.view('first'); signals.view('top'); signals.language('ja'); signals.language('zh-Hant'); signals.view('secret'); signals.language('ja<script>'); }
  assert.equal(eventNames(h).filter(event => event === 'view_changed').length, 2);
  assert.equal(eventNames(h).filter(event => event === 'guide_language').length, 2);
  assert.equal(h.events.length, 5);
  assert.equal(networkAttempts, 0); assert.equal(storageAttempts, 0);
});

check('the 120-event page cap also holds with a blocked cross-origin parent', () => {
  for (const mode of ['same-origin', 'top', 'cross-origin']) {
    const h = host('https:', mode), signals = Signals.create(h);
    for (let n = 0; n < 200; n++) { signals.start(state, 'top', false); signals.end(state); }
    assert.equal(h.events.length, 120, mode + ' bypassed the page cap');
    assert(h.messages.length <= 120);
  }
});

console.log('Completed ' + checks + ' bounded gameplay signal checks.');
