'use strict';
const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const { Engine: E, World: W, Stories: F, Destruction: D, Catalog: C } = window.Sirens;
let checks = 0;
const failures = [];
function check(name, fn) {
  try { fn(); checks++; console.log('PASS ' + name); }
  catch (error) { failures.push({ name, error }); console.error('FAIL ' + name + ': ' + error.stack); }
}
const index = (s, x, y) => y * s.width + x;
const center = n => (n + 0.5) * 32;
function clearThreats(s) { s.zombies = []; s.humans = []; s.vehicles = []; }
function fixture() {
  // Isolated geometry and inventory fixtures exercise production actions and save code.
  // They are not a claim of a complete unassisted survival playthrough.
  const s = E.create(20260929, 'calm', 'rescue');
  clearThreats(s); s.tiles.fill(0); s.buildings = []; s.containers = []; s.structures = [];
  s._doorHealth = {}; s._terrainHealth = {}; s.noises = []; s.particles = [];
  for (let i = 0; i < s.width; i++) s.tiles[i] = s.tiles[(s.height - 1) * s.width + i] = s.tiles[i * s.width] = s.tiles[i * s.width + s.width - 1] = 3;
  s.player.x = center(10); s.player.y = center(10); s.player.inventory = { bat: 1 }; s.player.legacyGear = false;
  s.player.equipment = { weapon: 'bat', clothing: null, backpack: null }; s.player.weapon = 'bat';
  s.player.health = 100; s.player.bleeding = 0; s.player.stamina = 100; s.player.cooldown = 0;
  return s;
}
function equip(s, id) { s.player.inventory[id] = 1; assert(E.action(s, 'equip:' + id)); }
function swing(s, tx, ty) {
  s.player.cooldown = 0; s.player.stamina = 100;
  assert(E.attack(s, center(tx), center(ty), 'melee'));
}
function room(s) {
  const b = { x: 9, y: 7, w: 8, h: 8, name: 'Window geometry fixture' }; s.buildings = [b];
  for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) s.tiles[index(s, x, y)] = x === b.x || x === b.x + b.w - 1 || y === b.y || y === b.y + b.h - 1 ? 3 : 2;
  for (const x of [b.x, b.x + b.w - 1]) s.tiles[index(s, x, b.y + b.h - 3)] = 8;
  F.refresh(s); return b;
}
function windowFixture(broken = false) {
  const s = fixture(), b = room(s), tx = b.x, ty = b.y + b.h - 3;
  s.player.x = center(tx - 1); s.player.y = center(ty);
  if (broken) { s.tiles[index(s, tx, ty)] = 9; s._terrainHealth[index(s, tx, ty)] = 0; }
  return { s, b, tx, ty, id: index(s, tx, ty) };
}
function stairs(s) {
  F.refresh(s); const b = F.currentBuilding(s) || s.buildings[0];
  assert(b && b.stairs); s.player.x = center(b.stairs.x); s.player.y = center(b.stairs.y); return b;
}
function globalTile(s, tx, ty) { return { x: tx + (s.world ? s.world.originX : 0), y: ty + (s.world ? s.world.originY : 0) }; }
function localIndex(s, g) { return index(s, g.x - (s.world ? s.world.originX : 0), g.y - (s.world ? s.world.originY : 0)); }
function departAndReturn(s) {
  const gx = s.player.x + s.world.originX * 32, gy = s.player.y + s.world.originY * 32;
  s.player.x += 128 * 32; W.maybeRecenter(s);
  s.player.x = gx - s.world.originX * 32; s.player.y = gy - s.world.originY * 32; W.maybeRecenter(s);
}
function generatedTree(s) {
  for (let ty = 2; ty < s.height - 2; ty++) for (let tx = 2; tx < s.width - 2; tx++) {
    if (s.tiles[index(s, tx, ty)] !== 5) continue;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) if (!E.isSolid(s, tx + dx, ty + dy)) {
      s.player.x = center(tx + dx); s.player.y = center(ty + dy); return { tx, ty, id: index(s, tx, ty), global: globalTile(s, tx, ty) };
    }
  }
  throw new Error('No approachable generated tree');
}
function corrupt(text, mutate) { const doc = JSON.parse(text); mutate(doc); assert.throws(() => E.deserialize(JSON.stringify(doc))); }

check('actual equipped axe strikes damage then fell a tree, consume stamina, and create collectible timber', () => {
  const s = fixture(), id = index(s, 11, 10); s.tiles[id] = 5; equip(s, 'fire_axe');
  const stamina = s.player.stamina; assert(E.attack(s, center(11), center(10), 'melee'));
  assert.equal(s.tiles[id], 5); assert.equal(s._terrainHealth[id], 75 - C.items.fire_axe.weapon.damage * 1.5);
  assert.equal(s.player.stamina, stamina - C.items.fire_axe.weapon.staminaCost); assert(s.player.cooldown > 0);
  assert.equal(E.attack(s, center(11), center(10), 'melee'), false, 'cooldown rejects immediate repeated hits');
  swing(s, 11, 10); assert.equal(s.tiles[id], 0); assert.equal(s._terrainHealth[id], undefined);
  const pile = s.containers.find(c => c._ground); assert(pile && pile.items.wood >= 2 && pile.items.wood <= 4);
  const quantity = pile.items.wood, count = s.containers.length;
  swing(s, 11, 10); assert.equal(s.containers.length, count); assert.equal(pile.items.wood, quantity);
  s.player.x = pile.x; s.player.y = pile.y; assert(E.interact(s)); assert.equal(s.player.inventory.wood, quantity); assert(pile.looted);
});
check('tool identity gives axes a tree bonus, sledgehammers a wall bonus, and axes repeated door strikes', () => {
  const s = fixture(); s.tiles[index(s, 11, 10)] = 5; swing(s, 11, 10);
  assert.equal(s._terrainHealth[index(s, 11, 10)], 75 - C.items.bat.weapon.damage);
  const a = fixture(); a.tiles[index(a, 11, 10)] = 5; equip(a, 'hatchet'); swing(a, 11, 10);
  assert.equal(a._terrainHealth[index(a, 11, 10)], 75 - C.items.hatchet.weapon.damage * 1.5);
  const wall = fixture(); room(wall); wall.player.x = center(10); wall.player.y = center(8); equip(wall, 'sledgehammer');
  swing(wall, 10, 7); assert.equal(wall._terrainHealth[index(wall, 10, 7)], 220 - C.items.sledgehammer.weapon.damage * 3);
  swing(wall, 10, 7); assert.equal(wall.tiles[index(wall, 10, 7)], 2);
  const door = fixture(), id = index(door, 11, 10); door.tiles[id] = 6; door._doorHealth[id] = 65; equip(door, 'fire_axe');
  swing(door, 11, 10); assert.equal(door.tiles[id], 6); assert.equal(door._doorHealth[id], 5);
  swing(door, 11, 10); assert.equal(door.tiles[id], 7); assert(door._doorHealth[id] <= 0); assert(!E.isSolid(door, 11, 10));
  const restored = E.deserialize(E.serialize(door)); assert.equal(restored.tiles[id], 7); assert.equal(restored._doorHealth[id], door._doorHealth[id]);
});
check('nearest surface targeting respects swing direction, range, approach visibility, and immutable borders', () => {
  const s = fixture(); s.tiles[index(s, 11, 10)] = 3; s.tiles[index(s, 12, 10)] = 5; s.tiles[index(s, 9, 10)] = 5;
  assert(D.hit(s, center(12), center(10), 'bat')); assert.equal(s._terrainHealth[index(s, 11, 10)], 184);
  assert.equal(s._terrainHealth[index(s, 12, 10)], undefined); assert.equal(s._terrainHealth[index(s, 9, 10)], undefined);
  s.tiles[index(s, 11, 10)] = 4; delete s._terrainHealth[index(s, 11, 10)];
  assert.equal(D.hit(s, center(12), center(10), 'bat'), false, 'water blocks the approach to farther terrain');
  s.tiles[index(s, 11, 10)] = 0; s.tiles[index(s, 12, 10)] = 0; s.tiles[index(s, 14, 10)] = 5;
  assert.equal(D.hit(s, center(14), center(10), 'bat'), false, 'surface exceeds weapon reach');
  s.player.x = center(1); s.player.y = center(10); assert.equal(D.hit(s, center(0), center(10), 'sledgehammer'), false);
  assert.equal(D.hit(s, NaN, 100, 'bat'), false); assert.equal(D.hit(s, 200, Infinity, 'bat'), false);
  assert.equal(D.hit(s, 200, 100, 'pistol'), false); assert.equal(D.climb(s, -1, 10), false);
});
check('timber quantity is stable under world rebasing and ground piles stay bounded', () => {
  function fell(originX) {
    const s = fixture(); s.world = { originX, originY: 0 }; const tx = 20 - originX; s.player.x = center(tx - 1);
    s.tiles[index(s, tx, 10)] = 5; assert(D.hit(s, center(tx), center(10), 'sledgehammer')); assert(D.hit(s, center(tx), center(10), 'sledgehammer'));
    return s.containers[0].items.wood;
  }
  assert.equal(fell(0), fell(7), 'same seed and global tree must yield the same timber');
  const s = fixture(); s.containers = Array.from({ length: 60 }, (_, i) => ({ id: 'drop:' + s.seed + ':' + (i + 1), x: center(20 + i % 20), y: center(20 + Math.floor(i / 20)), label: 'Full fixture', items: { wood: 1000 }, looted: false, _ground: true }));
  s._nextGroundId = 61; s.tiles[index(s, 11, 10)] = 5; equip(s, 'fire_axe'); swing(s, 11, 10); swing(s, 11, 10);
  assert.equal(s.containers.length, 60); assert(s.containers.every(c => c.items.wood <= 1000)); assert(s.logs.at(-1).text.includes('full'));
});
check('one real E interaction opens and crosses a closed window, keeps its frame solid, and allows return', () => {
  const { s, tx, ty, id } = windowFixture(); assert(E.isSolid(s, tx, ty));
  assert.equal(E.hasLOS(s, center(tx - 1), center(ty), center(tx + 1), center(ty)), false);
  assert(D.nearby(s).includes('Open and climb')); assert(E.interact(s));
  assert.equal(s.tiles[id], 9); assert.equal(s._terrainHealth[id], 45); assert.equal(s.player.x, center(tx + 1));
  assert(E.isSolid(s, tx, ty)); assert(E.hasLOS(s, center(tx - 1), center(ty), center(tx + 1), center(ty)));
  assert(E.action(s, 'climb')); assert.equal(s.player.x, center(tx - 1)); assert.equal(s.player.health, 100); assert.equal(s.player.bleeding, 0);
  for (let i = 0; i < 90; i++) E.update(s, 1 / 60, { moveX: 1 });
  assert(s.player.x < tx * 32, 'ordinary walking cannot pass the opened frame');
  const loaded = E.deserialize(E.serialize(s)); assert.equal(loaded.tiles[id], 9); assert.equal(loaded._terrainHealth[id], 45);
});
check('blocked, misaligned, vehicle, conversation, and unsafe landings reject climbing without opening glass', () => {
  let f = windowFixture(); f.s.tiles[index(f.s, f.tx + 1, f.ty)] = 3; const x = f.s.player.x;
  assert.equal(D.climb(f.s, f.tx, f.ty), false); assert.equal(f.s.tiles[f.id], 8); assert.equal(f.s.player.x, x);
  f = windowFixture(); f.s.player.y += 27; assert.equal(D.climb(f.s, f.tx, f.ty), false); assert.equal(f.s.tiles[f.id], 8);
  f = windowFixture(); f.s.player.vehicleId = 'fixture'; assert.equal(E.action(f.s, 'climb'), false); assert.equal(f.s.tiles[f.id], 8);
  f.s.player.vehicleId = null; f.s.conversation = 'fixture'; assert.equal(E.action(f.s, 'climb'), false);
  f = windowFixture(); f.s.structures.push({ type: 'barricade', x: center(f.tx + 1), y: center(f.ty), health: 140 });
  assert.equal(D.climb(f.s), false); assert.equal(f.s.tiles[f.id], 8);
});
check('breaking glass is permanent and actual climbing causes deterministic cuts reduced by protective clothing', () => {
  const intact = windowFixture(); swing(intact.s, intact.tx, intact.ty); assert.equal(intact.s._terrainHealth[intact.id], 9);
  swing(intact.s, intact.tx, intact.ty); assert.equal(intact.s.tiles[intact.id], 9); assert.equal(intact.s._terrainHealth[intact.id], 0);
  const naked = windowFixture(true); naked.s._rng = 1; assert(E.interact(naked.s)); assert.equal(naked.s.player.health, 94); assert.equal(naked.s.player.bleeding, 0.7);
  const clothed = windowFixture(true), clothing = Object.values(C.items).find(item => item.armor >= 0.3);
  assert(clothing); equip(clothed.s, clothing.id); clothed.s._rng = 1; assert(E.action(clothed.s, 'climb'));
  assert(clothed.s.player.health > naked.s.player.health); assert(clothed.s.player.bleeding < naked.s.player.bleeding);
  const restored = E.deserialize(E.serialize(naked.s)); assert.equal(restored.tiles[naked.id], 9); assert.equal(restored._terrainHealth[naked.id], 0); assert.equal(restored.player.bleeding, 0.7);
});
check('deterministic generated buildings have exactly two opposite side windows on ground and upper floors', () => {
  for (const mode of ['rescue', 'openworld']) for (const seed of [0, 1, 20260929]) {
    const s = E.create(seed, 'calm', mode); clearThreats(s);
    for (const b of s.buildings) {
      const ids = [];
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (s.tiles[index(s, x, y)] === 8) ids.push(index(s, x, y));
      assert.deepEqual(ids.sort((a, b) => a - b), [index(s, b.x, b.y + b.h - 3), index(s, b.x + b.w - 1, b.y + b.h - 3)]);
    }
    const b = stairs(s); assert(E.action(s, 'stairsUp')); const upper = s.buildings[0];
    assert.equal(s.tiles[index(s, upper.x, upper.y + upper.h - 3)], 8); assert.equal(s.tiles[index(s, upper.x + upper.w - 1, upper.y + upper.h - 3)], 8);
    assert.equal(upper.w, b.w); assert.equal(upper.h, b.h);
  }
});
check('generated terrain damage, timber, and wall openings survive sector streaming and v2 reload without duplication', () => {
  const s = E.create(19, 'calm', 'openworld'); clearThreats(s); s.player.inventory = { bat: 1, fire_axe: 1, sledgehammer: 1 };
  equip(s, 'fire_axe'); const tree = generatedTree(s); swing(s, tree.tx, tree.ty);
  const partial = s._terrainHealth[tree.id], first = E.deserialize(E.serialize(s)); assert.equal(first._terrainHealth[localIndex(first, tree.global)], partial);
  departAndReturn(s); assert.equal(s._terrainHealth[localIndex(s, tree.global)], partial);
  swing(s, tree.global.x - s.world.originX, tree.global.y - s.world.originY); assert.equal(s.tiles[localIndex(s, tree.global)], 0);
  const pile = s.containers.find(c => c._ground), pileId = pile.id, timber = pile.items.wood; departAndReturn(s);
  assert.equal(s.tiles[localIndex(s, tree.global)], 0); assert.equal(s.containers.filter(c => c.id === pileId).length, 1); assert.equal(s.containers.find(c => c.id === pileId).items.wood, timber);
  const b = s.buildings.find(b => b.name.includes('Safe') || b.name.includes('cabin')) || s.buildings[0];
  const wx = b.x + 2, wy = b.y, wallGlobal = globalTile(s, wx, wy); s.player.x = center(wx); s.player.y = center(wy + 1); equip(s, 'sledgehammer');
  swing(s, wx, wy); const damage = s._terrainHealth[index(s, wx, wy)]; assert(damage > 0 && damage < 220);
  let saved = E.deserialize(E.serialize(s)); assert.equal(saved._terrainHealth[localIndex(saved, wallGlobal)], damage);
  swing(s, wx, wy); assert.equal(s.tiles[index(s, wx, wy)], 2); departAndReturn(s); assert.equal(s.tiles[localIndex(s, wallGlobal)], 2);
  saved = E.deserialize(E.serialize(s)); assert.equal(saved.tiles[localIndex(saved, wallGlobal)], 2); assert.equal(saved.containers.filter(c => c.id === pileId).length, 1);
});
check('generated opened and smashed windows persist across sector journals and reload', () => {
  const s = E.create(12, 'calm', 'openworld'); clearThreats(s); const b = s.buildings.find(b => /cabin/i.test(b.name)); assert(b);
  const tx = b.x, ty = b.y + b.h - 3, g = globalTile(s, tx, ty); s.player.x = center(tx + 1); s.player.y = center(ty);
  assert(E.action(s, 'climb')); assert.equal(s.tiles[index(s, tx, ty)], 9); assert.equal(s._terrainHealth[index(s, tx, ty)], 45);
  departAndReturn(s); assert.equal(s.tiles[localIndex(s, g)], 9); assert.equal(s._terrainHealth[localIndex(s, g)], 45);
  let loaded = E.deserialize(E.serialize(s)); assert.equal(loaded._terrainHealth[localIndex(loaded, g)], 45);
  equip(s, 'fire_axe'); swing(s, g.x - s.world.originX, g.y - s.world.originY); assert.equal(s._terrainHealth[localIndex(s, g)], 0);
  departAndReturn(s); loaded = E.deserialize(E.serialize(s)); assert.equal(loaded.tiles[localIndex(loaded, g)], 9); assert.equal(loaded._terrainHealth[localIndex(loaded, g)], 0);
});
check('a cleared felled-tree tile accepts actual construction and preserves the structure through streaming and save', () => {
  const s = E.create(21, 'calm', 'openworld'); clearThreats(s); s.player.inventory = { fire_axe: 1, wood: 4, scrap: 1 };
  equip(s, 'fire_axe'); const tree = generatedTree(s), stand = { x: s.player.x, y: s.player.y };
  swing(s, tree.tx, tree.ty); swing(s, tree.tx, tree.ty); const pile = s.containers.find(c => c._ground); assert(pile);
  s.player.x = pile.x; s.player.y = pile.y; assert(E.interact(s)); assert(pile.looted);
  s.player.x = stand.x; s.player.y = stand.y; s.player.angle = Math.atan2(center(tree.ty) - stand.y, center(tree.tx) - stand.x);
  assert(E.build(s, 'campfire')); assert.equal(s.structures.length, 1); assert.equal(s.structures[0].x, center(tree.tx)); assert.equal(s.structures[0].y, center(tree.ty));
  departAndReturn(s); const loaded = E.deserialize(E.serialize(s)), at = localIndex(loaded, tree.global);
  assert.equal(loaded.tiles[at], 0); assert(loaded.structures.some(b => Math.floor(b.x / 32) + loaded.world.originX === tree.global.x && Math.floor(b.y / 32) + loaded.world.originY === tree.global.y && b.type === 'campfire'));
});
check('upper-floor walls and glass persist after upstairs save, descent, and revisit while void and jumps stay blocked', () => {
  for (const mode of ['rescue', 'openworld']) {
    let s = E.create(16, 'calm', mode); clearThreats(s); s.player.inventory = { bat: 1, sledgehammer: 1, fire_axe: 1, food: 2 };
    const ground = stairs(s), groundTiles = s.tiles, groundTerrain = s._terrainHealth; assert(E.action(s, 'stairsUp')); clearThreats(s);
    let b = s.buildings[0], wx = b.x + 2, wy = b.y, wall = index(s, wx, wy);
    s.player.x = center(wx); s.player.y = center(wy + 1); equip(s, 'sledgehammer'); swing(s, wx, wy);
    const partial = s._terrainHealth[wall]; assert(partial > 0); s = E.deserialize(E.serialize(s)); b = s.buildings[0];
    assert.equal(s._terrainHealth[wall], partial); swing(s, wx, wy); assert.equal(s.tiles[wall], 2);
    s.player.x = center(wx); s.player.y = center(wy); assert(E.action(s, 'drop:food'));
    const dropped = s.containers.find(c => c._ground), dropId = dropped.id; assert.equal(dropped.items.food, 1);
    s = E.deserialize(E.serialize(s)); assert.equal(s.stories.floor, 1); assert.equal(s.tiles[wall], 2); assert.equal(s.containers.find(c => c.id === dropId).items.food, 1);
    assert.equal(D.hit(s, center(wx), center(wy - 1), 'sledgehammer'), false); assert.equal(s.tiles[index(s, wx, wy - 1)], 3, 'outside footprint void cannot be destroyed');
    b = s.buildings[0]; const tx = b.x, ty = b.y + b.h - 3, glass = index(s, tx, ty); s.player.x = center(tx + 1); s.player.y = center(ty); equip(s, 'fire_axe');
    swing(s, tx, ty); assert.equal(s.tiles[glass], 9); assert.equal(s._terrainHealth[glass], 0);
    const before = { x: s.player.x, y: s.player.y }; assert.equal(E.action(s, 'climb'), false); assert.deepEqual({ x: s.player.x, y: s.player.y }, before);
    stairs(s); assert(E.action(s, 'stairsDown')); assert.equal(s.tiles[wall], 3); assert.equal(s.tiles[glass], 8); assert.equal(s._terrainHealth[glass], undefined);
    stairs(s); assert(E.action(s, 'stairsUp')); assert.equal(s.tiles[wall], 2); assert.equal(s.tiles[glass], 9); assert.equal(s._terrainHealth[glass], 0); assert.equal(s.containers.find(c => c.id === dropId).items.food, 1);
    assert.notEqual(s.tiles, groundTiles); assert.notEqual(s._terrainHealth, groundTerrain); assert.equal(s.buildings[0].name, ground.name);
  }
});
check('malformed terrain and floor journals reject invalid health, obstacle references, and unsupported tile changes', () => {
  const s = fixture(); s.tiles[index(s, 11, 10)] = 5; swing(s, 11, 10); const text = E.serialize(s), id = index(s, 11, 10);
  for (const value of [-1, 301, null, 0]) corrupt(text, d => d.state._terrainHealth[id] = value);
  corrupt(text, d => d.state._terrainHealth[index(s, 12, 10)] = 20); corrupt(text, d => d.state._terrainHealth[-1] = 20);
  const open = E.create(7, 'calm', 'openworld'); clearThreats(open); const tree = generatedTree(open); swing(open, tree.tx, tree.ty);
  const worldText = E.serialize(open), g = tree.global, key = Math.floor(g.x / 64) + ',' + Math.floor(g.y / 64), local = (g.y % 64 + 64) % 64 * 64 + (g.x % 64 + 64) % 64;
  for (const value of [-1, 301, null, 0]) corrupt(worldText, d => d.world.records[key].terrainHealth[local] = value);
  corrupt(worldText, d => d.world.records[key].tiles[local] = 2);
  const floor = E.create(4, 'calm', 'rescue'); clearThreats(floor); stairs(floor); assert(E.action(floor, 'stairsUp')); clearThreats(floor);
  const b = floor.buildings[0], wx = b.x + 2, wy = b.y; floor.player.x = center(wx); floor.player.y = center(wy + 1); swing(floor, wx, wy);
  const floorText = E.serialize(floor), floorKey = floor.stories.buildingKey, wallLocal = 2, windowLocal = (b.h - 3) * b.w;
  for (const value of [-1, 301, null, 0]) corrupt(floorText, d => d.stories.records[floorKey].levels[1].terrainHealth[wallLocal] = value);
  corrupt(floorText, d => d.stories.records[floorKey].levels[1].tiles[wallLocal] = 0);
  corrupt(floorText, d => { const level = d.stories.records[floorKey].levels[1]; level.tiles[windowLocal] = 9; level.terrainHealth[windowLocal] = -1; });
  corrupt(floorText, d => d.stories.records[floorKey].levels[1].tiles[2 * b.w + 2] = 2);
});
check('destruction effects bound transient logs, noises, and particles under repeated strikes', () => {
  const s = fixture(); s.tiles[index(s, 11, 10)] = 3;
  for (let i = 0; i < 100; i++) { s.tiles[index(s, 11, 10)] = 3; s._terrainHealth[index(s, 11, 10)] = 1; assert(D.hit(s, center(11), center(10), 'bat')); }
  assert(s.logs.length <= 60); assert(s.noises.length <= 24); assert(s.particles.length <= 220);
});

if (failures.length) { console.error(failures.length + ' destruction checks failed.'); process.exitCode = 1; }
else console.log(checks + ' destruction checks passed.');
