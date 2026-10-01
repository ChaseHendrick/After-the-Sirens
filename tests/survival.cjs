const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const E = window.Sirens.Engine;
const TILE = 32;
const tick = (s, seconds, input = {}) => { for (let i = 0; i < seconds * 60 && !s.ended; i++) E.update(s, 1 / 60, input); };
function solo(seed = 82) { const s = E.create(seed, 'standard'); s.zombies = []; s.humans = []; return s; }
function zombie(s, x, y) {
  const z = JSON.parse(JSON.stringify(E.create(82).zombies[0]));
  Object.assign(z, { id: s._nextZombieId++, x, y, state: 'investigate', windup: 0, _targetX: s.player.x, _targetY: s.player.y,
    _path: [], _pathClock: 0, _stun: 0, _attackCooldown: 0, _blockedTimer: 0 });
  s.zombies.push(z); return z;
}
function check(name, fn) { fn(); console.log('PASS ' + name); }
check('a bite has a 0.72 second dodge window and melee interrupts it', () => {
  const s = solo(); s.player.x = 1008; s.player.y = 1008;
  zombie(s, 1038, 1008);
  tick(s, 0.7); assert.equal(s.player.health, 100);
  tick(s, 0.05); assert(s.player.health > 90.99 && s.player.health <= 91);
  const defended = solo(); defended.player.x = 1008; defended.player.y = 1008;
  zombie(defended, 1038, 1008);
  tick(defended, 3, { attack: true, aimX: 1038, aimY: 1008 });
  assert.equal(defended.player.health, 100); assert.equal(defended.zombies.length, 0); assert.equal(defended.player.kills, 1);
});
check('closed doors block bullets and sight; opening the door permits a hit', () => {
  const s = solo(); s.player.x = 368; s.player.y = 432;
  const z = zombie(s, 368, 496);
  assert.equal(E.hasLOS(s, 368, 432, 368, 496), false);
  E.attack(s, z.x, z.y, 'pistol'); assert.equal(z.health, 64);
  assert.equal(E.nearby(s), 'Open door'); E.interact(s);
  assert.equal(E.hasLOS(s, 368, 432, 368, 496), true);
  s.player.cooldown = 0; E.attack(s, z.x, z.y, 'pistol'); assert.equal(s.zombies.length, 0);
});
check('gunfire draws a distant zombie to the last heard location', () => {
  const s = solo(); s.player.x = 1008; s.player.y = 1008;
  const z = zombie(s, 1008, 1510); z.state = 'wander'; z._targetX = z.x; z._targetY = z.y;
  E.attack(s, 1008, 600, 'pistol'); tick(s, 1);
  assert.equal(z.state, 'investigate'); assert.equal(z._targetX, s.player.x); assert.equal(z._targetY, s.player.y);
  assert(z.y < 1510); assert(s.stats.pathNodes <= s.stats.aiUpdates * 420);
});
check('a pursuing zombie routes to and breaks a closed door', () => {
  const s = solo(); s.player.x = 368; s.player.y = 432;
  const z = zombie(s, 368, 592);
  E.attack(s, 368, 250, 'pistol'); tick(s, 13);
  assert.equal(s.tiles[14 * 64 + 11], 7); assert(z.y < 480, 'zombie should enter through the broken doorway');
  assert(s.stats.pathNodes <= s.stats.aiUpdates * 420);
});
check('crafting and building pay exact costs and preserve a complete save', () => {
  const s = solo(); s.player.x = 1008; s.player.y = 1008; s.player.angle = 0;
  s.player.inventory = { wood: 10, scrap: 10 };
  assert(E.craft(s, 'field_wraps')); assert.deepEqual(s.player.inventory, { wood: 10, scrap: 8, bandage: 2 });
  assert(!E.craft(s, 'collect_water')); assert(E.build(s, 'campfire'));
  assert(E.craft(s, 'collect_water')); assert.deepEqual(s.player.inventory, { wood: 4, scrap: 5, bandage: 2, water: 2 });
  s.player.angle = Math.PI; assert(E.build(s, 'barricade'));
  assert.deepEqual(s.player.inventory, { wood: 1, scrap: 4, bandage: 2, water: 2 });
  tick(s, 20);
  const loaded = E.deserialize(E.serialize(s));
  assert.deepEqual(loaded.structures, s.structures); assert.deepEqual(loaded.player.inventory, s.player.inventory);
  assert.equal(loaded.elapsed, s.elapsed); assert.deepEqual(loaded.tiles, s.tiles);
});
check('looting heavy supplies leaves carrying space for five mission parts', () => {
  const s = solo(); E.interact(s);
  for (const c of s.containers) {
    if (!c.items.parts) continue;
    s.player.x = c.x; s.player.y = c.y; E.interact(s);
    if ((s.player.inventory.parts || 0) >= 5) break;
  }
  assert(s.player.inventory.parts >= 5); assert(E.inventoryWeight(s.player.inventory) <= 24.00001);
});

const Personal = window.Sirens.Personal;
const boxClear = (s, x, y, r) => [[-r, -r], [r, -r], [-r, r], [r, r]].every(d => !E.isSolid(s, (x + d[0]) / TILE, (y + d[1]) / TILE));
check('barricades never close over the survivor, a companion or a pet, so no one is sealed in and the save reloads', () => {
  const s = solo(); s.player.inventory = { wood: 6, scrap: 2 }; s.player.angle = 0;
  // 25 px from the target centre, the survivor's 10 px box still reaches into the east road tile.
  s.player.x = 31 * TILE + 25; s.player.y = 31 * TILE + 6;
  assert(E.buildQuote(s, 'barricade').missing.includes('Aim toward a clear adjacent tile')); assert.equal(E.build(s, 'barricade'), false);
  s.player.x = 1008; s.player.y = 1008;
  const friend = { id: 'h:0,0:0', x: 1040 + 19, y: 1008 + 19, health: 100, angle: 0, faction: 'survivor', following: true, name: 'Morgan', weapon: 'bat', cooldown: 0 };
  s.humans = [friend]; assert.equal(E.build(s, 'barricade'), false, 'a diagonal companion box overlaps the tile'); s.humans = [];
  const pets = Personal.ensure(s); pets.tamed['pet:0,0:0'] = true;
  pets.pets.push({ id: 'pet:0,0:0', kind: 'dog', name: 'Cedar', x: 1040, y: 1008, angle: 0, mode: 'stay', care: 75, lastBark: 0, nextThink: 0, stepX: null, stepY: null, moving: false });
  assert.equal(E.build(s, 'barricade'), false, 'a pet in the tile blocks the barricade'); pets.pets[0].y = 1008 + 64;
  assert(E.build(s, 'barricade')); assert.deepEqual(s.player.inventory, { wood: 3, scrap: 1 });
  assert(boxClear(s, s.player.x, s.player.y, 10));
  const start = s.player.y; tick(s, 0.5, { moveY: -1 }); assert(s.player.y < start - 20, 'the builder can still walk away');
  assert.deepEqual(E.deserialize(E.serialize(s)).structures, s.structures);
});
check('doors refuse to close over people, pets or supplies, and emptied doorway piles cannot break a save', () => {
  const s = solo(), door = 14 * 64 + 11, cx = 368, cy = 464;
  s.player.x = cx; s.player.y = 432; assert(E.interact(s)); assert.equal(s.tiles[door], 7);
  s.player.x = cx - 5; s.player.y = cy; assert(E.action(s, 'drop:bandage'));
  assert(E.interact(s)); assert(!s.containers.some(c => c._ground), 'collecting the whole pile removes it');
  assert(E.action(s, 'drop:bandage')); s.player.x = cx + 5; s.player.y = cy + 34;
  assert.equal(E.interact(s), false); assert.equal(s.tiles[door], 7); assert(/Supplies are lying in the doorway/.test(s.logs[s.logs.length - 1].text));
  s.player.x = cx - 5; s.player.y = cy; assert(E.interact(s)); assert(!s.containers.some(c => c._ground));
  // With the east wall broken, a survivor 27 px away diagonally still overlaps the doorway.
  s.tiles[14 * 64 + 12] = 2; s.player.x = cx + 24.5; s.player.y = cy + 12;
  assert.equal(E.interact(s), false); assert.equal(s.tiles[door], 7); assert(/doorway is occupied/.test(s.logs[s.logs.length - 1].text));
  s.player.x = cx; s.player.y = cy + 40; zombie(s, cx, cy - 20);
  assert.equal(E.interact(s), false, 'a zombie in the doorway'); s.zombies = [];
  const pets = Personal.ensure(s); pets.tamed['pet:0,0:1'] = true;
  pets.pets.push({ id: 'pet:0,0:1', kind: 'cat', name: 'Pip', x: cx, y: cy, angle: 0, mode: 'stay', care: 75, lastBark: 0, nextThink: 0, stepX: null, stepY: null, moving: false });
  assert.equal(E.interact(s), false, 'a pet in the doorway'); pets.pets[0].y = cy + 96;
  assert(E.interact(s)); assert.equal(s.tiles[door], 6); assert(boxClear(s, s.player.x, s.player.y, 9));
  // Saves from older builds could keep an emptied pile on that closed door; it now loads and is discarded.
  const doc = JSON.parse(E.serialize(s));
  doc.state.containers.push({ id: 'drop:82:999', x: cx, y: cy, label: 'Dropped supplies', items: {}, looted: true, _ground: true });
  const loaded = E.deserialize(JSON.stringify(doc)); assert(!loaded.containers.some(c => c.id === 'drop:82:999')); assert.equal(loaded.tiles[door], 6);
});
check('looting stops at the 1000-item stack ceiling that crafting, trades and saves share', () => {
  const s = solo(); s.player.inventory = { bat: 1, needle: 995 }; const c = s.containers[0];
  c.items = { needle: 12 }; c.looted = false; s.player.x = c.x; s.player.y = c.y;
  assert(E.interact(s)); assert.equal(s.player.inventory.needle, 1000); assert.deepEqual(c.items, { needle: 7 }); assert.equal(c.looted, false);
  assert(s.logs.some(l => /already carry 1000/.test(l.text)));
  assert.equal(E.interact(s), false); assert.equal(s.player.inventory.needle, 1000);
  assert.equal(E.deserialize(E.serialize(s)).player.inventory.needle, 1000);
});
check('reloading needs the firearm itself, while legacy rescue gear keeps its pistol', () => {
  const s = solo(); s.player.inventory = { bat: 1, ammo: 12 }; s.player.ammo = 0; s.player.magazines = { pistol: 0 };
  assert.equal(E.action(s, 'reload'), false); assert.equal(s.player.inventory.ammo, 12); assert.equal(s.player.magazines.pistol, 0);
  s.player.inventory.pistol = 1; assert(E.action(s, 'reload')); assert.equal(s.player.ammo, 8); assert.equal(s.player.inventory.ammo, 4);
  const legacy = solo(); legacy.player.legacyGear = true; legacy.player.inventory = { ammo: 12 }; legacy.player.ammo = 0; legacy.player.magazines = { pistol: 0 };
  assert(E.action(legacy, 'reload')); assert.equal(legacy.player.ammo, 8);
});
check('a save with the survivor wedged into a wall loads at the nearest clear tile, while a sealed position is still rejected', () => {
  const s = solo(), doc = JSON.parse(E.serialize(s));
  doc.state.player.x = 7.5 * TILE; doc.state.player.y = 10.5 * TILE; // inside the cabin's west wall
  const loaded = E.deserialize(JSON.stringify(doc));
  assert(boxClear(loaded, loaded.player.x, loaded.player.y, 10)); assert.equal(Math.hypot(loaded.player.x - 7.5 * TILE, loaded.player.y - 10.5 * TILE), TILE);
  assert.doesNotThrow(() => E.deserialize(E.serialize(loaded)));
  for (let y = 28; y <= 34; y++) for (let x = 28; x <= 34; x++) doc.state.tiles[y * 64 + x] = 3;
  doc.state.player.x = 31.5 * TILE; doc.state.player.y = 31.5 * TILE;
  assert.throws(() => E.deserialize(JSON.stringify(doc)), /player is inside a solid tile/);
});
function path(s, x, y) {
  const start = Math.floor(s.player.y / TILE) * 64 + Math.floor(s.player.x / TILE);
  const goal = Math.floor(y / TILE) * 64 + Math.floor(x / TILE);
  const q = [start], seen = new Set(q), prev = new Map();
  for (let i = 0; i < q.length; i++) {
    const id = q[i]; if (id === goal) break;
    const xx = id % 64, yy = Math.floor(id / 64);
    for (const [nx, ny] of [[xx + 1, yy], [xx - 1, yy], [xx, yy + 1], [xx, yy - 1]]) {
      if (nx < 1 || ny < 1 || nx > 62 || ny > 62) continue;
      const n = ny * 64 + nx;
      if (seen.has(n) || (E.isSolid(s, nx, ny) && s.tiles[n] !== 6)) continue;
      seen.add(n); prev.set(n, id); q.push(n);
    }
  }
  if (!seen.has(goal)) throw Error('Bot cannot route to destination');
  const result = [];
  for (let id = goal; id !== start; id = prev.get(id)) result.push({ x: (id % 64 + 0.5) * TILE, y: (Math.floor(id / 64) + 0.5) * TILE });
  return result.reverse();
}
function botTick(s, mx, my, sprint = false) {
  let nearest = null, distance = Infinity;
  for (const z of s.zombies) { const d = Math.hypot(z.x - s.player.x, z.y - s.player.y); if (d < distance) { nearest = z; distance = d; } }
  if (s.player.thirst > 30) E.action(s, 'drink'); if (s.player.hunger > 30) E.action(s, 'eat');
  if (s.player.bleeding > 0) E.action(s, 'bandage');
  const raider=(s.humans||[]).filter(h=>h.health>0&&h.faction==='raider'&&Math.hypot(h.x-s.player.x,h.y-s.player.y)<430&&E.hasLOS(s,s.player.x,s.player.y,h.x,h.y)).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];
  if(raider){if((s.player.magazines.pistol||0)===0)E.action(s,'reload');E.attack(s,raider.x,raider.y,'pistol');}

  E.update(s, 1 / 60, { moveX: mx, moveY: my, sprint, attack: distance < 76,
    aimX: nearest ? nearest.x : s.player.x + mx * 100, aimY: nearest ? nearest.y : s.player.y + my * 100 });
}
function walk(s, x, y) {
  const waypoints = path(s, x, y);
  let frames = 0;
  for (const w of waypoints) {
    while (Math.hypot(w.x - s.player.x, w.y - s.player.y) > 2 && !s.ended) {
      const distance = Math.hypot(w.x - s.player.x, w.y - s.player.y);
      const id = Math.floor(w.y / TILE) * 64 + Math.floor(w.x / TILE);
      if (s.tiles[id] === 6 && distance < 66) E.interact(s);
      botTick(s, (w.x - s.player.x) / distance, (w.y - s.player.y) / distance);
      if (++frames > 40000) throw Error('Bot stuck toward ' + JSON.stringify(w) + ' from ' + s.player.x + ',' + s.player.y);
    }
    if (s.ended) break;
  }
}
for (const seed of [20260929, 82, 123456]) {
  const s = E.create(seed, 'standard'); E.interact(s);
  for (const label of ['Ranger shed supplies', 'Workshop supplies', 'Clinic supplies', 'Fuel stop supplies']) {
    const c = s.containers.find(c => c.label === label); walk(s, c.x, c.y); if (s.ended) break; E.interact(s);
  }
  if (!s.ended) { walk(s, s.goal.radioX, s.goal.radioY); E.interact(s); }
  // Stay mobile around the open central road loop while defending with the bat.
  const laps = [[1040, 1008], [944, 1008], [944, 816], [1040, 816]];
  for (let i = 0; !s.ended && i < 120; i++) walk(s, ...laps[i % 4]);
  assert(s.won, 'Natural combat/loot/door playthrough should win seed ' + seed + ': health=' + s.player.health + ', active=' + s.goal.active + ', elapsed=' + s.elapsed + ', countdown=' + s.goal.countdown);
  E.deserialize(E.serialize(s));
  console.log('PASS natural standard-difficulty playthrough seed ' + seed + ' at ' + Math.round(s.elapsed) + 's, ' + s.player.kills + ' kills, ' + Math.round(s.player.health) + ' health');
}
