'use strict';
const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'effects', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const S = window.Sirens, E = S.Engine, F = S.Effects;
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function fixture() {
  const s = E.create(0, 'calm', 'rescue');
  s.tiles.fill(0); s.buildings = []; s.containers = []; s.zombies = []; s.humans = []; s.vehicles = [];
  s.player.x = 320; s.player.y = 320; s.player.cooldown = 0; s.player.stamina = 100;
  return s;
}
check('accepted misses animate; cooldown and stamina failures do not create swings', () => {
  const s = fixture(); assert(E.attack(s, 400, 320));
  assert.equal(F.pose(s).attack.weapon, 'bat'); assert.equal(F.drain(s)[0].type, 'swing');
  assert(!E.attack(s, 400, 320)); assert.equal(F.drain(s).length, 0);
  s.elapsed += .15; assert(F.pose(s).attack.progress > .2);
  s.elapsed += 1; assert.equal(F.pose(s).attack, null);
  s.player.cooldown = 0; s.player.stamina = 0;
  assert(!E.attack(s, 400, 320)); assert.equal(F.pose(s).attack, null); assert.equal(F.drain(s).length, 0);
});
check('machetes, axes and spears use their own successful attack pose', () => {
  for (const id of ['machete', 'fire_axe', 'spear']) {
    assert(S.Catalog.items[id], id); const s = fixture(); s.player.inventory[id] = 1;
    assert(E.action(s, 'equip:' + id)); assert(E.attack(s, 400, 320));
    assert.equal(F.pose(s).attack.weapon, id); assert.equal(F.pose(s).attack.kind, 'melee');
  }
});
check('gunfire, empty magazines and reload have distinct effects', () => {
  const s = fixture(); E.action(s, 'equip:pistol'); s.player.ammo = 2;
  assert(E.attack(s, 500, 320, 'pistol')); assert.equal(F.pose(s).attack.kind, 'firearm'); assert.equal(s.player.ammo, 1);
  assert.deepEqual(F.drain(s).map(e => e.type), ['shot']);
  s.player.cooldown = 0; s.player.ammo = 0; s.elapsed += 1;
  assert(!E.attack(s, 500, 320, 'pistol')); assert.equal(F.drain(s).length, 0);
  s.player.inventory.ammo = 8; assert(E.action(s, 'reload')); assert.equal(F.pose(s).attack, null);
  assert.deepEqual(F.drain(s).map(e => e.type), ['reload']);
});
check('wood, glass and masonry strikes emit material and break feedback', () => {
  for (const [tile, type] of [[6, 'wood'], [5, 'wood'], [8, 'glass'], [3, 'stone']]) {
    const s = fixture(); const i = 10 * s.width + 11; s.tiles[i] = tile; s.player.x = 336; s.player.y = 336;
    s.player.inventory.sledgehammer = 1; E.action(s, 'equip:sledgehammer');
    assert(E.attack(s, 400, 336)); const effects = F.drain(s);
    assert(effects.some(e => e.type === type)); assert(effects.some(e => e.type === 'swing'));
    if (type === 'glass') assert(effects.some(e => e.type === type && e.broken));
  }
});
check('footsteps follow actual motion and stay silent against blocked walls', () => {
  const s = fixture(); for (let i = 0; i < 30; i++) E.update(s, 1 / 60, { moveX: 1 });
  assert(F.drain(s).some(e => e.type === 'step')); assert.notEqual(F.pose(s).stride, 0);
  s.tiles.fill(3); for (let i = 0; i < 60; i++) E.update(s, 1 / 60, { moveX: 1 });
  assert(!F.drain(s).some(e => e.type === 'step')); assert.equal(F.pose(s).stride, 0);
});
check('presentation does not alter simulation RNG, saves or restore continuation', () => {
  const a = E.create(12, 'calm', 'openworld'), b = E.create(12, 'calm', 'openworld');
  for (let i = 0; i < 90; i++) {
    const input = { moveX: i < 30 ? 1 : 0, attack: i > 40, aimX: a.player.x + 70, aimY: a.player.y };
    E.update(a, 1 / 60, input); F.pose(a); F.drain(a);
    delete S.Effects; E.update(b, 1 / 60, input); S.Effects = F;
  }
  assert.deepEqual(JSON.parse(E.serialize(a)), JSON.parse(E.serialize(b)));
  const restored = E.deserialize(E.serialize(a)); assert.equal(F.pose(restored).attack, null); assert.equal(F.drain(restored).length, 0);
  for (let i = 0; i < 60; i++) { E.update(a, 1 / 60, {}); E.update(restored, 1 / 60, {}); }
  assert.deepEqual(JSON.parse(E.serialize(a)), JSON.parse(E.serialize(restored)));
});
check('presentation events are bounded, drained once and isolated between runs', () => {
  const a = fixture(), b = fixture(); for (let i = 0; i < 1000; i++) F.emit(a, 'step');
  assert.equal(F.drain(a).length, 64); assert.equal(F.drain(a).length, 0); assert.equal(F.drain(b).length, 0);
});
check('unavailable audio stays optional and muting discards queued effects', () => {
  const s = fixture(); F.audio.unlock(); F.audio.setEnabled(false); F.emit(s, 'shot'); F.audio.update(s, true);
  assert.equal(F.drain(s).length, 0); assert.equal(F.audio.metrics().context, 'locked'); assert.equal(F.audio.metrics().voices, 0);
});
console.log(passed + ' presentation checks passed.');
