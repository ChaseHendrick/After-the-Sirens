const assert = require('node:assert/strict');
global.window = {};
for (const f of ['catalog', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + f + '.js');
const { Engine: E, World: W, Catalog: C } = window.Sirens;
const check = (name, fn) => { fn(); console.log('PASS ' + name); };
check('full seeded worlds reproduce terrain, loot, cars, NPCs and floors', () => {
  const a = E.create(0, 'standard', 'openworld'), b = E.create(0, 'standard', 'openworld');
  assert.equal(a.seed, 0); assert.deepEqual(a, b);
  for (const field of ['tiles', 'buildings', 'containers', 'vehicles', 'humans', 'stories']) assert.deepEqual(a[field], b[field], field);
  const cabinA = a.buildings.find(b => b.name === 'Safe cabin'), cabinB = b.buildings.find(b => b.name === 'Safe cabin');
  a.player.x = (cabinA.stairs.x + 0.5) * 32; a.player.y = (cabinA.stairs.y + 0.5) * 32;
  b.player.x = (cabinB.stairs.x + 0.5) * 32; b.player.y = (cabinB.stairs.y + 0.5) * 32;
  assert(E.action(a, 'stairsUp')); assert(E.action(b, 'stairsUp'));
  assert.deepEqual(a.tiles, b.tiles); assert.deepEqual(a.containers, b.containers); assert.deepEqual(a.zombies, b.zombies);
  assert(E.action(a, 'stairsDown')); assert(E.action(b, 'stairsDown'));
  const other = E.create(1, 'standard', 'openworld');
  assert.notDeepEqual(a.tiles, other.tiles); assert.notDeepEqual(a.containers, other.containers);
  const coords = [[-4, 8], [7, -3], [0, 0], [2, 2]];
  const forward = new Map(coords.map(([x, y]) => [x + ',' + y, W.generate(0, 'standard', x, y)]));
  for (const [x, y] of coords.slice().reverse()) assert.deepEqual(W.generate(0, 'standard', x, y), forward.get(x + ',' + y));
});
check('saved seeded simulation continues with identical random outcomes and input', () => {
  const s = E.create(0, 'standard', 'openworld');
  // A clear-road position fixture isolates continuation from navigation.
  s.player.x = (31.5 - s.world.originX) * 32; s.player.y = (31.5 - s.world.originY) * 32;
  const start = { x: s.player.x, y: s.player.y };
  E.attack(s, s.player.x + 100, s.player.y, 'pistol');
  for (let i = 0; i < 100; i++) E.update(s, 0.05, { moveX: Math.sin(i / 30), moveY: Math.cos(i / 40) });
  assert(Math.hypot(s.player.x - start.x, s.player.y - start.y) > 10, 'movement input must actually move');
  const restored = E.deserialize(E.serialize(s)); assert.equal(restored._rng, s._rng);
  for (let i = 0; i < 200; i++) {
    const input = { moveX: Math.sin(i / 30), moveY: Math.cos(i / 40) };
    if (i % 20 === 0) { E.attack(s, s.player.x + 150, s.player.y, 'pistol'); E.attack(restored, restored.player.x + 150, restored.player.y, 'pistol'); }
    E.update(s, 0.05, input); E.update(restored, 0.05, input);
  }
  assert.equal(restored._rng, s._rng); assert.deepEqual(restored.player, s.player);
  assert.deepEqual(restored.zombies, s.zombies); assert.deepEqual(restored.humans, s.humans);
  assert.deepEqual(restored.particles, s.particles); assert.deepEqual(restored.noises, s.noises);
});
check('all 219 original items are reachable from actual generated loot plus crafting', () => {
  const seen = new Set(['bat', 'pistol']), regions = new Set();
  for (let y = -18; y <= 18; y++) for (let x = -18; x <= 18; x++) {
    const c = W.generate(20260929, 'standard', x, y); regions.add(c.biome);
    for (const container of c.containers) for (const [id, count] of Object.entries(container.items)) if (count > 0) seen.add(id);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of C.recipes) if ([...Object.keys(r.cost), ...(r.tools || [])].every(id => seen.has(id))) {
      for (const id of Object.keys(r.result)) if (!seen.has(id)) { seen.add(id); changed = true; }
    }
  }
  assert.equal(regions.size, 6); assert.deepEqual(Object.keys(C.items).filter(id => !seen.has(id)), []);
});
check('all sector roads and generated supplies connect across 80 sectors', () => {
  for (const seed of [0, 1, 77, 20260929]) for (let cx = -2; cx <= 2; cx++) for (const cy of [-2, -1, 1, 2]) {
    const c = W.generate(seed, 'standard', cx, cy), seen = new Set([31 * 64 + 31]), q = [...seen];
    for (let i = 0; i < q.length; i++) {
      const id = q[i], x = id % 64, y = Math.floor(id / 64);
      for (const [xx, yy] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (xx < 0 || yy < 0 || xx > 63 || yy > 63) continue;
        const n = yy * 64 + xx; if (seen.has(n) || ![0, 1, 2, 6, 7].includes(c.tiles[n])) continue;
        seen.add(n); q.push(n);
      }
    }
    for (const p of c.containers) assert(seen.has(Math.floor(p.y / 32) * 64 + Math.floor(p.x / 32)), 'unreachable ' + p.label);
    for (const id of [31, 31 * 64, 31 * 64 + 63, 63 * 64 + 31]) assert(seen.has(id), 'disconnected sector road');
    assert.deepEqual(c, W.generate(seed, 'standard', cx, cy));
  }
});
check('sparse v2 saves reject corrupted sectors, loot, humans and cars', () => {
  const s = E.create(0, 'standard', 'openworld'); E.interact(s);
  const text = E.serialize(s), original = JSON.parse(text), recordKey = Object.keys(original.world.records).find(k => original.world.records[k].zombies.length);
  const mutate = fn => { const doc = JSON.parse(text); fn(doc); assert.throws(() => E.deserialize(JSON.stringify(doc))); };
  mutate(d => d.world.centerCX = 129);
  mutate(d => d.world.records['130,0'] = d.world.records[recordKey]);
  mutate(d => d.world.records[recordKey].tiles[0] = 2);
  mutate(d => d.world.records[recordKey].zombies[0].health = -1);
  mutate(d => d.world.records[recordKey].vehicles[0].fuel = -1);
  mutate(d => d.world.records[recordKey].humans[0].faction = 'unknown');
  mutate(d => d.state.player.inventory = { unknown: 1 });
  mutate(d => d.state.seed = 2);
  mutate(d => d.world.visited.push('0,0'));
  mutate(d => delete d.state.player);
});
check('far-sector fixtures keep active arrays bounded and save coordinate edges', () => {
  const s = E.create(0, 'calm', 'openworld');
  for (const [cx, cy] of [[100, -100], [-100, 100], [128, 128], [-128, -128], [0, 0]]) {
    s.player.x = (cx * 64 + 31.5 - s.world.originX) * 32;
    s.player.y = (cy * 64 + 31.5 - s.world.originY) * 32;
    W.maybeRecenter(s);
    assert.equal(s.world.centerCX, cx); assert.equal(s.world.centerCY, cy);
    assert.equal(s.tiles.length, 192 * 192); assert(s.zombies.length <= window.Sirens.World.limits.maxActiveZombies); assert(s.humans.length <= window.Sirens.World.limits.maxActiveHumans);
    const restored = E.deserialize(E.serialize(s)); assert.equal(restored.world.centerCX, cx); assert.equal(restored.world.centerCY, cy);
  }
});
check('equipped firearms use their own rounds and retain magazines through saves', () => {
  const s = E.create(4, 'standard', 'rescue'); s.humans = []; s.vehicles = []; s.player.x = 1008; s.player.y = 1008;
  s.player.inventory.hunting_rifle = 1; s.player.inventory.rifle_round = 12;
  assert(E.action(s, 'equip:hunting_rifle')); assert.equal(s.player.ammo, 0);
  assert(E.action(s, 'reload')); const w = C.items.hunting_rifle.weapon; assert.equal(s.player.ammo, w.clipSize);
  const z = s.zombies[0]; z.x = 1110; z.y = 1008; z.health = 150; s.zombies = [z]; s.player.cooldown = 0;
  assert(E.attack(s, z.x, z.y, 'pistol')); assert.equal(z.health, 150 - w.damage); assert.equal(s.player.ammo, w.clipSize - 1);
  const loaded = E.deserialize(E.serialize(s)); assert.equal(loaded.player.ammo, s.player.ammo); assert.equal(loaded.player.magazines.hunting_rifle, s.player.ammo);
});
check('dropping the only owned weapon prevents phantom melee and pistol attacks', () => {
  const s = E.create(9, 'calm', 'rescue'); s.humans = []; s.vehicles = []; s.player.x = 1008; s.player.y = 1008;
  assert(E.action(s, 'drop:bat')); assert(!E.attack(s, 1100, 1008, 'melee'));
  s.player.cooldown = 0; assert(E.action(s, 'drop:pistol')); assert(!E.attack(s, 1100, 1008, 'pistol'));
  const loaded = E.deserialize(E.serialize(s)); loaded.player.cooldown = 0; assert(!E.attack(loaded, 1100, 1008, 'melee'));
  const legacy = E.create(10, 'calm', 'rescue'); delete legacy.player.equipment; delete legacy.player.legacyGear; delete legacy.player.inventory.bat; delete legacy.player.inventory.pistol;
  const migrated = E.deserialize(E.serialize(legacy)); migrated.player.cooldown = 0; assert(E.attack(migrated, migrated.player.x + 50, migrated.player.y, 'melee'));
});
check('tools and equipped ingredients matter to crafting', () => {
  const s = E.create(5, 'calm', 'rescue'); s.player.inventory = { cloth: 2, soap: 1, bat: 1, nails: 1, duct_tape: 1 };
  const before = JSON.stringify(s.player.inventory); assert(!E.canCraft(s, 'cloth_wraps')); assert(!E.craft(s, 'cloth_wraps')); assert.equal(JSON.stringify(s.player.inventory), before);
  s.player.inventory.needle = 1; assert(E.canCraft(s, 'cloth_wraps')); assert(E.craft(s, 'cloth_wraps')); assert.equal(s.player.inventory.needle, 1); assert.equal(s.player.inventory.bandage, 2);
  s.player.inventory.hammer = 1; assert(E.craft(s, 'spike_bat')); assert.equal(s.player.weapon, 'spiked_bat'); E.deserialize(E.serialize(s));
});
check('dropped items remain collectible after streaming and reload', () => {
  const s = E.create(6, 'calm', 'openworld'); assert(E.action(s, 'drop:food'));
  const pile = s.containers.find(c => c._ground), id = pile.id, startFood = s.player.inventory.food;
  const oldX = s.player.x + s.world.originX * 32, oldY = s.player.y + s.world.originY * 32;
  s.player.x += 128 * 32; W.maybeRecenter(s); assert(!s.containers.some(c => c.id === id));
  s.player.x = oldX - s.world.originX * 32; s.player.y = oldY - s.world.originY * 32; W.maybeRecenter(s);
  const loaded = E.deserialize(E.serialize(s)), returned = loaded.containers.find(c => c.id === id); assert(returned && returned.items.food === 1);
  loaded.player.x = returned.x; loaded.player.y = returned.y; assert(E.interact(loaded)); assert.equal(loaded.player.inventory.food, startFood + 1);
});
check('zombies see through open windows and route around the solid frame to a door', () => {
  const s = E.create(1, 'calm', 'rescue'); s.humans = []; s.vehicles = [];
  // Place one pursuer outside the cabin frame and its target inside to isolate routing.
  s.player.x = 8.5 * 32; s.player.y = 12.5 * 32;
  const window = 12 * 64 + 7, door = 14 * 64 + 11;
  s.tiles[window] = 9; s._terrainHealth[window] = 45;
  const z = s.zombies[0]; z.x = 6.5 * 32; z.y = 12.5 * 32;
  z._targetX = z.x; z._targetY = z.y; z._wanderClock = 3; z._path = []; s.zombies = [z];
  assert(E.hasLOS(s, z.x, z.y, s.player.x, s.player.y)); assert(E.isSolid(s, 7, 12));
  for (let i = 0; i < 600; i++) {
    E.update(s, 0.05, {});
    assert.notEqual(Math.floor(z.y / 32) * s.width + Math.floor(z.x / 32), window, 'zombie cannot walk through an open frame');
    assert(z._path.every(p => ![8, 9].includes(s.tiles[Math.floor(p.y / 32) * s.width + Math.floor(p.x / 32)])));
  }
  assert.equal(s.tiles[window], 9); assert.equal(s.tiles[door], 7, 'pursuer should reach and break the cabin door');
  assert(z.x > 7 * 32 && z.y < 14 * 32, 'pursuer must reach the cabin through its doorway');
});
check('crowds beyond the active zombie budget reload exactly after movement and kills', () => {
  const s = E.create(42, 'hard', 'openworld'), budget = W.limits.maxActiveZombies;
  const go = cx => { s.player.x = (cx * 64 + 31.5 - s.world.originX) * 32; s.player.y = (31.5 - s.world.originY) * 32; W.maybeRecenter(s); };
  // Ecology and sieges add wanderers through spawnWanderers until the active budget is full.
  const fill = () => { for (let i = 0; i < 200 && s.zombies.length < budget; i++) E.spawnWanderers(s, 8); };
  fill(); go(1); fill(); go(2); fill(); go(1);
  assert.equal(s.zombies.length, budget); assert(s.world.dormantZombies.length > 0, 'fixture needs a dormant remainder');
  const everyone = x => x.zombies.map(z => z.id).concat(x.world.dormantZombies.map(z => z.id)).sort();
  const roundTrip = () => {
    const loaded = E.deserialize(E.serialize(s));
    assert.deepEqual(loaded.zombies.map(z => z.id), s.zombies.map(z => z.id), 'active crowd changed');
    assert.deepEqual(everyone(loaded), everyone(s), 'zombies lost or duplicated');
    assert(Math.abs(loaded.zombies[0].x - s.zombies[0].x) < 1e-6 && Math.abs(loaded.zombies[0].y - s.zombies[0].y) < 1e-6);
    return loaded;
  };
  for (let i = 0; i < 120; i++) { s.player.invulnerable = 2; E.update(s, 1 / 60, { moveX: -1 }); }
  roundTrip();
  const z = s.zombies[0]; z.health = 1; s.player.cooldown = 0; if (!s.player.ammo) E.action(s, 'reload');
  assert(E.attack(s, z.x, z.y, 'pistol')); assert.equal(s.zombies.length, budget - 1);
  assert.equal(roundTrip().zombies.length, budget - 1);
  go(2); go(1); const ids = s.zombies.map(v => v.id); assert.equal(new Set(ids).size, ids.length);
  assert.throws(() => { const doc = JSON.parse(E.serialize(s)); doc.order.zombies[1] = doc.order.zombies[0]; E.deserialize(JSON.stringify(doc)); }, /order identity/);
  assert.throws(() => { const doc = JSON.parse(E.serialize(s)); doc.order.zombies[0] = 'z:99,99:1'; E.deserialize(JSON.stringify(doc)); }, /order identity/);
});
check('ground pile labels survive streaming and reload, legacy piles default and bad labels are rejected', () => {
  const s = E.create(7, 'calm', 'openworld'); s.zombies = []; s.humans = [];
  let tree = null;
  for (let i = 0; i < s.tiles.length && !tree; i++) if (s.tiles[i] === 5) { const x = i % 192, y = Math.floor(i / 192); if (x > 66 && x < 125 && y > 66 && y < 125 && !E.isSolid(s, x + 1, y) && !E.isSolid(s, x + 1, y - 1) && !E.isSolid(s, x + 1, y + 1)) tree = { x, y }; }
  assert(tree, 'fixture tree in the centre sector');
  s.player.x = (tree.x + 1.5) * 32; s.player.y = (tree.y + 0.5) * 32; s.player.inventory.fire_axe = 1; assert(E.action(s, 'equip:fire_axe'));
  for (let i = 0; i < 200 && s.tiles[tree.y * 192 + tree.x] === 5; i++) { s.player.stamina = 100; E.update(s, 0.05, { attack: true, aimX: (tree.x + 0.5) * 32, aimY: (tree.y + 0.5) * 32 }); }
  const pile = s.containers.find(c => c._ground); assert(pile && pile.label === 'Felled timber');
  s.player.x += 128 * 32; W.maybeRecenter(s); s.player.x -= 128 * 32; W.maybeRecenter(s);
  assert.equal(s.containers.find(c => c.id === pile.id).label, 'Felled timber', 'label lost by streaming');
  const text = E.serialize(s);
  assert.equal(E.deserialize(text).containers.find(c => c.id === pile.id).label, 'Felled timber', 'label lost by reload');
  const doc = JSON.parse(text), saved = Object.values(doc.world.records).flatMap(r => r.ground).find(c => c.id === pile.id);
  delete saved.label; assert.equal(E.deserialize(JSON.stringify(doc)).containers.find(c => c.id === pile.id).label, 'Dropped supplies');
  for (const bad of ['', 'x'.repeat(101), 7, null]) { saved.label = bad; assert.throws(() => E.deserialize(JSON.stringify(doc)), /ground label/); }
});
check('cached sector exports stay exact through edits, streaming and reload', () => {
  const s = E.create(3, 'standard', 'openworld');
  const go = (cx, cy) => { s.player.x = (cx * 64 + 31.5 - s.world.originX) * 32; s.player.y = (cy * 64 + 31.5 - s.world.originY) * 32; W.maybeRecenter(s); E.update(s, 0.05, {}); };
  // Reference: the uncached export rule, every journaled sector that differs from its generated state.
  const reference = () => {
    W.snapshot(s); const out = {};
    for (const [k, r] of Object.entries(s.world.records)) {
      const [cx, cy] = k.split(',').map(Number), base = W.generate(s.world.seed, s.world.difficulty, cx, cy);
      if (Object.keys(r.tiles).length || Object.keys(r.containers).length || Object.keys(r.doorHealth).length || Object.keys(r.terrainHealth).length || r.structures.length || r.ground.length || r.explored.length ||
        JSON.stringify(r.zombies) !== JSON.stringify(base.zombies) || JSON.stringify(r.vehicles) !== JSON.stringify(base.vehicles) || JSON.stringify(r.humans) !== JSON.stringify(base.humans)) out[k] = JSON.parse(JSON.stringify(r));
    }
    return out;
  };
  for (let i = 0; i < 6; i++) go(i, 0);
  const first = W.exportWorld(s); assert.deepEqual(JSON.parse(JSON.stringify(first.records)), reference());
  // An unchanged far sector reuses its frozen export instead of being regenerated on every autosave.
  const again = W.exportWorld(s); assert.equal(again.records['1,0'], first.records['1,0']); assert(Object.isFrozen(again.records['1,0'].zombies));
  // Edit the centre, then stream away so the edited record becomes inactive: the export must follow it.
  s.zombies.find(v => v.health > 0).x += 7; assert(E.action(s, 'drop:food'));
  go(9, 0); go(9, 3);
  assert.deepEqual(JSON.parse(JSON.stringify(W.exportWorld(s).records)), reference());
  const loaded = E.deserialize(E.serialize(s));
  assert.deepEqual(JSON.parse(E.serialize(loaded)).world, JSON.parse(E.serialize(s)).world);
});
