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
