'use strict';
const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const { Engine: E, Vehicles: V, Actors: A, Stories: F, World: W, Catalog: C } = window.Sirens;
let checks = 0;
const failures = [];
function check(name, fn) {
  try { fn(); checks++; console.log('PASS ' + name); }
  catch (error) { failures.push({ name, error }); console.error('FAIL ' + name + ': ' + error.message); }
}
function tick(s, frames, input) { for (let i = 0; i < frames; i++) E.update(s, 1 / 60, input || {}); }
function openFixture() {
  const s = E.create(20260929, 'calm', 'rescue');
  // Deliberately isolated terrain fixture. These checks exercise the real Engine update and actions,
  // but are not evidence of a complete unassisted playthrough in the generated town.
  s.tiles.fill(0);
  for (let i = 0; i < s.width; i++) {
    s.tiles[i] = s.tiles[(s.height - 1) * s.width + i] = 3;
    s.tiles[i * s.width] = s.tiles[i * s.width + s.width - 1] = 3;
  }
  s.buildings = []; s.containers = []; s.structures = []; s.zombies = []; s.humans = []; s.vehicles = [];
  s.player.x = 320; s.player.y = 320; s.player.health = 100; s.player.bleeding = 0;
  s.player.inventory = { bat: 1, pistol: 1, food: 3, water: 2, bandage: 2, ammo: 12, fuel: 2 };
  s.player.equipment = { weapon: 'bat', clothing: null, backpack: null };
  return s;
}
function carFixture() {
  const s = openFixture();
  const car = Object.assign({}, V.spawnForChunk(s.seed, 0, 0)[0], { x: 350, y: 320, angle: 0, speed: 0, fuel: 20, condition: 100 });
  s.vehicles = [car];
  assert.equal(E.action(s, 'vehicle'), true, 'enter car through real engine action');
  return { s, car };
}
function human(id, x, y, faction = 'survivor', extra = {}) {
  return Object.assign({ id, x, y, faction, name: 'Morgan', angle: 0, health: 100, following: false, weapon: faction === 'raider' ? 'pistol' : 'bat', cooldown: 0 }, extra);
}
function zombie(id, x, y, health = 64) {
  return { id, x, y, health, state: 'wander', angle: 0, windup: 0, _targetX: x, _targetY: y,
    _lastSeen: -100, _wanderClock: 5, _path: [], _pathClock: 0, _stun: 0, _attackCooldown: 0, _blockedTimer: 0 };
}
function atStairs(s) {
  const b = F.currentBuilding(s) || s.buildings.find(b => b.floors === 3) || s.buildings[0];
  assert(b && b.stairs, 'building must expose stairs');
  s.player.x = (b.stairs.x + 0.5) * 32; s.player.y = (b.stairs.y + 0.5) * 32;
  return b;
}
function globalPosition(s, entity) {
  return { x: entity.x + (s.world ? s.world.originX : 0) * 32, y: entity.y + (s.world ? s.world.originY : 0) * 32 };
}

check('catalogue has genuine functional records, valid references, and obtainable recipe graph', () => {
  assert(Object.keys(C.items).length >= 160); assert(C.recipes.length >= 30);
  const reachable = new Set(), recipeIds = new Set();
  for (const [id, item] of Object.entries(C.items)) {
    assert.equal(item.id, id); assert(item.name && item.description && item.category);
    assert(Number.isFinite(item.weight) && item.weight >= 0);
    if (item.weapon && item.weapon.kind === 'firearm') assert(C.items[item.weapon.ammoId]);
  }
  for (const table of Object.values(C.loot)) for (const entry of table) {
    assert(C.items[entry.id]); assert(entry.weight > 0 && Number.isFinite(entry.weight));
    assert(Number.isInteger(entry.min) && entry.min >= 1 && Number.isInteger(entry.max) && entry.max >= entry.min);
    reachable.add(entry.id);
  }
  for (const recipe of C.recipes) {
    assert(!recipeIds.has(recipe.id)); recipeIds.add(recipe.id);
    for (const inventory of [recipe.cost, recipe.result]) for (const [id, count] of Object.entries(inventory)) {
      assert(C.items[id]); assert(Number.isInteger(count) && count > 0);
    }
    for (const id of recipe.tools || []) assert(C.items[id]);
  }
  for (let i = 0; i < C.recipes.length; i++) for (const r of C.recipes) if (Object.keys(r.cost).concat(r.tools || []).every(id => reachable.has(id))) Object.keys(r.result).forEach(id => reachable.add(id));
  assert.equal(reachable.size, Object.keys(C.items).length);
});

check('actual driving accelerates, consumes fuel, synchronizes rider, and reverses', () => {
  const { s, car } = carFixture(), x = car.x, fuel = car.fuel;
  tick(s, 90, { moveY: -1 });
  assert(car.x > x + 100); assert(car.speed > 100); assert(car.fuel < fuel);
  assert.equal(s.player.x, car.x); assert.equal(s.player.y, car.y);
  car.speed = 0; const reverseStart = car.x;
  tick(s, 60, { moveY: 1 });
  assert(car.speed < -20); assert(car.x < reverseStart - 20); assert(!s.ended);
});
check('actual moving steering changes heading while a stationary steering input does not', () => {
  const { s, car } = carFixture();
  tick(s, 30, { moveX: 1 }); assert.equal(car.angle, 0);
  car.speed = 120; tick(s, 30, { moveX: 1 });
  assert(car.angle > 0.2); assert(car.y > 320);
});
check('collision stops a fast car before a solid wall and causes condition damage', () => {
  const { s, car } = carFixture();
  for (let y = 1; y < s.height - 1; y++) s.tiles[y * s.width + 20] = 3;
  car.x = 580; car.y = 320; car.speed = 160;
  tick(s, 40, { moveY: -1 });
  assert(car.x <= 640 - 22 + 0.01, 'car cannot tunnel through wall');
  assert(car.condition < 100); assert(Math.abs(car.speed) < 10);
});
check('fuel use, empty tank, and safe exit have meaningful engine effects', () => {
  const { s, car } = carFixture();
  car.fuel = 0; car.speed = 0; const start = car.x;
  tick(s, 30, { moveY: -1 }); assert.equal(car.x, start);
  const cans = s.player.inventory.fuel;
  assert(E.action(s, 'use:fuel')); assert.equal(car.fuel, 12); assert.equal(s.player.inventory.fuel, cans - 1);
  tick(s, 20, { moveY: -1 }); assert(car.x > start);
  car.speed = 100; assert.equal(E.action(s, 'vehicle'), false); assert.equal(s.player.vehicleId, car.id);
  car.speed = 0; assert(E.action(s, 'vehicle')); assert.equal(s.player.vehicleId, null);
  assert(Math.hypot(s.player.x - car.x, s.player.y - car.y) >= 40);
  assert(!E.isSolid(s, s.player.x / 32, s.player.y / 32));
});
check('driving across a real sector seam preserves identity, fuel, condition, and save state', () => {
  const s = E.create(42, 'calm', 'openworld'); s.humans = []; s.zombies = [];
  const car = s.vehicles.find(v => v.id === 'v:0,0:0'); assert(car);
  const worldOrigin = s.world.originX;
  car.x = (60.5 - worldOrigin) * 32; car.y = (31.5 - s.world.originY) * 32;
  car.angle = 0; car.speed = 0; car.fuel = 19; car.condition = 67;
  s.player.x = car.x; s.player.y = car.y; assert(E.action(s, 'vehicle'));
  let crossed = false;
  for (let i = 0; i < 600; i++) {
    E.update(s, 1 / 60, { moveY: -1 }); s.zombies = []; s.humans = [];
    if (s.world.centerCX === 1) { crossed = true; break; }
  }
  assert(crossed, 'real driving must recenter into next sector');
  const active = s.vehicles.find(v => v.id === car.id); assert(active);
  assert.equal(s.vehicles.filter(v => v.id === car.id).length, 1); assert.equal(active.condition, 67); assert(active.fuel < 19);
  const position = globalPosition(s, active), restored = E.deserialize(E.serialize(s));
  const saved = restored.vehicles.find(v => v.id === active.id); assert(saved);
  assert.equal(restored.player.vehicleId, active.id); assert.deepEqual(globalPosition(restored, saved), position);
  assert.equal(saved.fuel, active.fuel); assert.equal(saved.condition, 67);
  saved.speed = 0; assert(E.action(restored, 'vehicle'));
});

check('survivor conversation, exact trade, recruitment, dismissal, and missing-food rejection', () => {
  const s = openFixture(), h = human('h:0,0:0', 355, 320); s.humans = [h];
  assert(A.interact(s)); const food = s.player.inventory.food, bandages = s.player.inventory.bandage;
  assert(E.action(s, 'trade')); assert.equal(s.player.inventory.food, food - 1); assert.equal(s.player.inventory.bandage, bandages + 1);
  assert(E.action(s, 'recruit')); assert(h.following); assert.equal(s.player.inventory.food, food - 2);
  assert(E.action(s, 'dismiss')); assert(!h.following);
  s.player.inventory.food = 0; assert.equal(E.action(s, 'trade'), false); assert.equal(E.action(s, 'recruit'), false);
  assert(E.action(s, 'closeConversation')); assert.equal(s.conversation, null);
});
check('trade respects capacity and never grants supplies from an invalid overweight fixture', () => {
  const s = openFixture(), h = human('h:0,0:0', 355, 320); s.humans = [h];
  s.player.inventory = { wood: 29, food: 1 }; assert(E.inventoryWeight(s.player.inventory) <= 24);
  assert(A.interact(s)); assert(E.action(s, 'trade')); assert(E.inventoryWeight(s.player.inventory) <= 24);
  // Intentional invalid-inventory fixture probes the transaction guard, not a normal reachable pack.
  s.player.inventory = { wood: 31, food: 1 };
  const before = JSON.stringify(s.player.inventory); assert.equal(E.action(s, 'trade'), false); assert.equal(JSON.stringify(s.player.inventory), before);
});
check('recruited survivor follows through an obstacle opening using the real AI update', () => {
  const s = openFixture(); s.player.x = 24.5 * 32; s.player.y = 20.5 * 32;
  const h = human('h:0,0:0', 18.5 * 32, 20.5 * 32, 'survivor', { following: true }); s.humans = [h];
  for (let y = 15; y <= 24; y++) s.tiles[y * s.width + 21] = 3;
  const distance = Math.hypot(h.x - s.player.x, h.y - s.player.y);
  tick(s, 600, {});
  assert(h.x > 21 * 32); assert(Math.hypot(h.x - s.player.x, h.y - s.player.y) < distance / 2);
});
check('companions attack zombies, count kills, and can be injured by nearby zombies', () => {
  const s = openFixture(); s.player.x = 480;
  const h = human('h:0,0:0', 320, 320, 'survivor', { following: true }); s.humans = [h];
  s.zombies = [zombie(100, 340, 320, 20)]; const kills = s.player.kills;
  tick(s, 1); assert.equal(s.zombies.length, 0); assert.equal(s.player.kills, kills + 1);
  h.cooldown = 2; s.zombies = [zombie(101, h.x + 20, h.y, 150)]; tick(s, 1);
  assert(h.health < 100);
});
check('one zombie bite timer decays once per tick with three nearby humans', () => {
  const s = openFixture(); s.player.x = 700;
  // High human cooldowns isolate the shared bite timer from their independent attack actions.
  s.humans = [human('h:0,0:0', 340, 320, 'survivor', { cooldown: 100 }),
    human('h:0,0:2', 315, 340, 'survivor', { cooldown: 100 }),
    human('h:0,0:3', 300, 315, 'survivor', { cooldown: 100 })];
  const z = zombie(110, 320, 320, 150); z._humanBite = 0.75; s.zombies = [z];
  tick(s, 1); assert(Math.abs(z._humanBite - (0.75 - 1 / 60)) < 1e-9, 'three humans must not triple timer decay');
  assert.equal(s.humans.reduce((sum, h) => sum + h.health, 0), 300);
  z._humanBite = 0; tick(s, 1);
  assert.equal(s.humans.reduce((sum, h) => sum + h.health, 0), 288, 'one bite must affect one victim');
  assert.equal(z._humanBite, 1.5);
  tick(s, 20); assert.equal(s.humans.reduce((sum, h) => sum + h.health, 0), 288, 'bite cooldown prevents rapid attacks on nearby humans');
  assert(Math.abs(z._humanBite - (1.5 - 20 / 60)) < 1e-9);
});
check('raider attacks obey line of sight and equipped armor reduces damage', () => {
  function hit(armor, wall) {
    const s = openFixture(); s.player.x = 18.5 * 32; s.player.y = 20.5 * 32;
    s.humans = [human('h:0,0:1', 24.5 * 32, 20.5 * 32, 'raider')];
    if (armor) { s.player.inventory.ballistic_vest = 1; assert(E.action(s, 'equip:ballistic_vest')); }
    if (wall) for (let y = 1; y < s.height - 1; y++) s.tiles[y * s.width + 21] = 3;
    tick(s, wall ? 120 : 1, {}); return 100 - s.player.health;
  }
  const bare = hit(false, false), armored = hit(true, false);
  assert(bare > 0); assert(armored > 0 && armored < bare); assert.equal(hit(false, true), 0);
});
check('attacking a survivor causes hostility and dead humans persist through reload', () => {
  const s = openFixture(); const h = human('h:0,0:0', 365, 320, 'survivor', { following: true }); s.humans = [h];
  assert(E.attack(s, h.x, h.y, 'melee')); assert.equal(h.faction, 'raider'); assert(!h.following); assert(h.health < 100);
  const world = E.create(91, 'calm', 'openworld'), target = world.humans.find(v => v.id === 'h:0,0:0'); assert(target);
  A.hit(world, target, 100, false); const restored = E.deserialize(E.serialize(world));
  const dead = restored.humans.find(v => v.id === target.id); assert(dead); assert.equal(dead.health, 0); assert(!dead.following);
});

check('upper floors use engine actions, loot, construction, and exact upstairs save restoration', () => {
  for (const mode of ['rescue', 'openworld']) {
    const s = E.create(20260929, 'calm', mode); s.humans = []; s.zombies = [];
    const groundTiles = s.tiles.slice(), b = atStairs(s), key = b._storyKey;
    assert(E.action(s, 'stairsUp')); assert.equal(s.stories.floor, 1); s.zombies = [];
    const c = s.containers[0]; c.items = { scrap: 3 }; c.looted = false;
    s.player.inventory = { bat: 1, pistol: 1, food: 2, wood: 5, scrap: 1 };
    s.player.x = c.x; s.player.y = c.y;
    assert(E.interact(s)); assert(c.looted); assert.equal(s.player.inventory.scrap, 4);
    assert(E.action(s, 'drop:food')); const pile = s.containers.find(v => v._ground); assert(pile && pile.items.food === 1);
    atStairs(s); s.player.angle = 0; assert(E.build(s, 'campfire'));
    const doorIndex = Object.keys(s._doorHealth)[0];
    assert(doorIndex !== undefined); const doorX = Number(doorIndex) % s.width, doorY = Math.floor(Number(doorIndex) / s.width);
    s.player.x = (doorX + 0.5) * 32; s.player.y = (doorY - 0.5) * 32;
    assert(E.interact(s)); assert.equal(s.tiles[doorIndex], 7);
    const position = { x: s.player.x, y: s.player.y }, restored = E.deserialize(E.serialize(s));
    assert.equal(restored.stories.floor, 1); assert.equal(restored.stories.buildingKey, key);
    assert.equal(restored.player.x, position.x); assert.equal(restored.player.y, position.y);
    assert(restored.containers.find(v => v.id === c.id).looted); assert.equal(restored.containers.find(v => v.id === pile.id).items.food, 1);
    assert.equal(restored.tiles[doorIndex], 7); assert.equal(restored.structures[0].type, 'campfire');
    atStairs(restored); assert(E.action(restored, 'stairsDown')); assert.equal(restored.stories.floor, 0);
    assert.deepEqual(restored.tiles, groundTiles); assert(E.action(restored, 'stairsUp'));
    assert(restored.containers.find(v => v.id === c.id).looted); assert.equal(restored.containers.find(v => v.id === pile.id).items.food, 1);
    assert.equal(restored.tiles[doorIndex], 7); assert.equal(restored.structures[0].type, 'campfire');
  }
});
check('upper-floor journal survives sector departure and return without leaking upstairs arrays to ground', () => {
  const s = E.create(42, 'calm', 'openworld'); s.humans = []; s.zombies = [];
  const b = atStairs(s), position = globalPosition(s, s.player), key = b._storyKey;
  assert(E.action(s, 'stairsUp')); s.zombies = []; s.containers[0].items = {}; s.containers[0].looted = true;
  const id = s.containers[0].id;
  atStairs(s); assert(E.action(s, 'stairsDown'));
  // Explicit sector-position fixture, followed by the production recenter operation.
  s.player.x = (128.5 - s.world.originX) * 32; s.player.y = (31.5 - s.world.originY) * 32;
  W.maybeRecenter(s); F.refresh(s);
  s.player.x = position.x - s.world.originX * 32; s.player.y = position.y - s.world.originY * 32;
  W.maybeRecenter(s); F.refresh(s);
  assert(E.action(s, 'stairsUp')); assert.equal(s.stories.buildingKey, key); assert(s.containers.find(v => v.id === id).looted);
  const exported = JSON.parse(E.serialize(s));
  for (const sector of Object.values(exported.world.records)) assert(!Object.keys(sector.containers).some(id => id.startsWith('floor:')));
});
check('stairs reject driving and conversations, and construction cannot block the landing', () => {
  const s = E.create(4, 'calm', 'rescue'); const b = atStairs(s);
  s.player.vehicleId = 'v:0,0:0'; assert.equal(E.action(s, 'stairsUp'), false); s.player.vehicleId = null;
  s.conversation = { id: 'h:0,0:0' }; assert.equal(E.action(s, 'stairsUp'), false); s.conversation = null;
  s.player.x = (b.stairs.x - 0.5) * 32; s.player.y = (b.stairs.y + 0.5) * 32; s.player.angle = 0;
  s.player.inventory.wood = 5; s.player.inventory.scrap = 2;
  assert.equal(E.build(s, 'barricade'), false);
});
check('corrupt vehicle, human, and floor saves are rejected before restoration', () => {
  const s = E.create(22, 'calm', 'openworld'); const groundSave = E.serialize(s);
  const worldMutations = [
    doc => { const sector = Object.values(doc.world.records).find(r => r.vehicles.length); assert(sector); sector.vehicles[0].fuel = -1; },
    doc => { const sector = Object.values(doc.world.records).find(r => r.vehicles.length); assert(sector); sector.vehicles[0].x = 1e20; },
    doc => { const sector = Object.values(doc.world.records).find(r => r.humans.length); assert(sector); sector.humans[0].health = -1; },
    doc => { const sector = Object.values(doc.world.records).find(r => r.humans.length); assert(sector); sector.humans[0].faction = 'unknown'; },
    doc => { const sector = Object.values(doc.world.records).find(r => r.humans.length > 1); assert(sector); sector.humans[1].id = sector.humans[0].id; }
  ];
  for (const mutate of worldMutations) { const doc = JSON.parse(groundSave); mutate(doc); assert.throws(() => E.deserialize(JSON.stringify(doc))); }
  atStairs(s); assert(E.action(s, 'stairsUp')); const floorSave = E.serialize(s);
  const floorMutations = [
    doc => doc.stories.floor = 9,
    doc => doc.stories.records[doc.stories.buildingKey].gx = 1e20,
    doc => doc.stories.records[doc.stories.buildingKey].levels[1].containers[0].items = { invented: 1 },
    doc => doc.stories.records[doc.stories.buildingKey].levels[1].containers[0].x = 1e20,
    doc => doc.stories.records[doc.stories.buildingKey].levels[1].doors = { 999999: 7 },
    doc => doc.stories.records[doc.stories.buildingKey].levels[1].structures = [{ x: 1e20, y: 1e20, type: 'campfire', health: 100 }]
  ];
  for (const mutate of floorMutations) { const doc = JSON.parse(floorSave); mutate(doc); assert.throws(() => E.deserialize(JSON.stringify(doc))); }
});

console.log('Completed ' + checks + ' expansion checks using documented fixtures and production update/action/save APIs.');
if (failures.length) { console.error(failures.map(v => v.name + ': ' + v.error.stack).join('\n\n')); process.exitCode = 1; }
