'use strict';
const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine', 'commands']) require('../src/' + module + '.js');
const { Engine: E, Commands: C } = window.Sirens;
let passed = 0;
function check(name, test) { test(); passed++; console.log('PASS ' + name); }
function fresh(mode = 'openworld') { return E.create(0, 'calm', mode); }
function atomic(s, text) { const before = E.serialize(s); assert.equal(C.execute(s, text).ok, false, text); assert.equal(E.serialize(s), before, text); }

check('singleplayer help, player identity, global location and bounded catalogue search use a generated world', () => {
  const s = fresh();
  assert.match(C.execute(s, '/help').message, /\/give/);
  assert.match(C.execute(s, '/players').message, /world owner/);
  const x = s.world.originX + Math.floor(s.player.x / 32), y = s.world.originY + Math.floor(s.player.y / 32);
  assert(C.execute(s, '/where').message.includes(x + ', ' + y));
  assert.match(C.execute(s, '/items machete').message, /machete/);
  assert.match(C.execute(s, '/items').message, /refine your search/);
  assert.match(C.execute(s, '/items no_such_original_item').message, /No matching/);
});
check('time, weather and survival pressure remain valid across serialized open-world and rescue saves', () => {
  for (const mode of ['openworld', 'rescue']) {
    const s = fresh(mode);
    assert(C.execute(s, '/time 23.5').ok);
    assert(C.execute(s, '/weather rain').ok);
    assert(C.execute(s, '/difficulty hard').ok);
    const restored = E.deserialize(E.serialize(s));
    assert.equal(restored.time, 23.5); assert.equal(restored.weather, 'rain'); assert.equal(restored.difficulty, 'hard');
    assert.equal(restored.stories.difficulty, 'hard'); if (restored.world) assert.equal(restored.world.difficulty, 'hard');
  }
});
check('weather commands cancel the active rain override without its expiry undoing the command', () => {
  const s = fresh();
  // Controlled event fixture: the actual production event expiry runs afterward.
  s.weather = 'rain'; s.progression.event.kind = 'rain'; s.progression.event.previousWeather = 'overcast'; s.progression.event.until = s.elapsed + 0.1;
  assert(C.execute(s, '/weather clear').ok);
  for (let i = 0; i < 20; i++) E.update(s, 1 / 60, {});
  assert.equal(s.weather, 'clear'); assert.equal(s.progression.event.kind, 'none');
  E.deserialize(E.serialize(s));
});
check('give commands add owned items once and reject bad IDs, stack excess and weight excess atomically', () => {
  const s = fresh(), old = s.player.inventory.ammo || 0;
  assert(C.execute(s, '/give me ammo 5').ok); assert.equal(s.player.inventory.ammo, old + 5);
  assert(C.execute(s, '/give machete').ok); assert.equal(s.player.inventory.machete, 1);
  for (const text of ['/give __proto__ 1', '/give constructor 1', '/give missing 1', '/give wood 100', '/give ammo 0', '/give ammo 101', '/give ammo -1', '/give ammo 1.5', '/give ammo NaN', '/give ammo 1 extra']) atomic(s, text);
  // A controlled legal stack near its limit isolates the separate stack bound.
  s.player.inventory = { ammo: 999 }; atomic(s, '/give ammo 2');
});
check('heal restores actual needs and fatigue without bypassing fallen survivor state', () => {
  const s = fresh();
  // Controlled injury fixture, checked through production save validation.
  Object.assign(s.player, { health: 25, stamina: 6, hunger: 70, thirst: 80, bleeding: 1, infection: 50, resting: true }); s.progression.fatigue = 95; s.progression.sleeping = true;
  assert(C.execute(s, '/heal me').ok);
  assert.equal(s.player.health, 100); assert.equal(s.player.stamina, 100);
  for (const key of ['hunger', 'thirst', 'bleeding', 'infection']) assert.equal(s.player[key], 0);
  assert.equal(s.progression.fatigue, 0); assert.equal(s.progression.sleeping, false); assert.equal(s.player.resting, false);
  E.deserialize(E.serialize(s));
  atomic(s, '/heal another_survivor'); s.player.health = 0; s.ended = true; atomic(s, '/heal');
});
check('teleport uses global tile coordinates and rejects solid tiles, distant regions, vehicles and upper floors', () => {
  const s = fresh(), ox = s.world.originX, oy = s.world.originY;
  const tx = Math.floor(s.player.x / 32), ty = Math.floor(s.player.y / 32);
  assert(C.execute(s, '/tp me ' + (ox + tx) + ' ' + (oy + ty)).ok);
  assert.equal(s.player.x, (tx + 0.5) * 32); assert.equal(s.player.y, (ty + 0.5) * 32);
  let solid;
  for (let y = 1; y < s.height - 1 && !solid; y++) for (let x = 1; x < s.width - 1; x++) if (E.isSolid(s, x, y)) { solid = [x + ox, y + oy]; break; }
  assert(solid); atomic(s, '/tp ' + solid.join(' ')); atomic(s, '/tp 99999 99999'); atomic(s, '/tp NaN 0'); atomic(s, '/tp 2.5 8');
  // A generated vehicle and production upstairs action exercise transition guards.
  const car = s.vehicles[0]; assert(car); s.player.vehicleId = car.id;
  assert.equal(C.execute(s, '/tp ' + (tx + ox) + ' ' + (ty + oy)).ok, false); s.player.vehicleId = null;
  const b = s.buildings.find(b => b.floors > 1 && b.stairs); assert(b); s.player.x = (b.stairs.x + 0.5) * 32; s.player.y = (b.stairs.y + 0.5) * 32;
  assert(E.action(s, 'stairsUp')); atomic(s, '/tp ' + (tx + ox) + ' ' + (ty + oy));
});
check('the console saves only through the local save callback and never authorizes multiplayer writes', () => {
  const s = fresh(); let calls = 0, backup;
  assert(C.execute(s, '/save', { save() { calls++; backup = E.serialize(s); return true; } }).ok);
  assert.equal(calls, 1); assert.equal(E.deserialize(backup).seed, 0);
  assert.equal(C.execute(s, '/save').ok, false); assert.equal(C.execute(s, '/save', { save() { return false; } }).ok, false);
  s.networked = true;
  for (const command of ['/heal', '/time 2', '/give ammo 1', '/save']) atomic(s, command);
});
check('unknown, malformed, excessive and out-of-range commands have no world effects', () => {
  const s = fresh();
  for (const text of ['/bogus', '/kick me', '/ban me', '/help extra', '/players extra', '/time -1', '/time 24', '/time Infinity', '/time 2 extra', '/time 0x10', '/weather fog', '/weather rain extra', '/difficulty extreme', '/give "ammo', '/give ammo"', '/give ammo\n1', '/' + 'a'.repeat(281), '', 'plain chat']) atomic(s, text);
});
console.log(passed + ' singleplayer command checks passed.');
