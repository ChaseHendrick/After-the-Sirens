'use strict';
const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const { Engine: E, Progression: P, Settlement: B, Personal: L, Warfare: W, Catalog: C, Actors: A, World: World } = window.Sirens;
let passed = 0;
const failures = [];
function check(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (error) { failures.push({ name, error }); console.error('FAIL ' + name + ': ' + error.stack); }
}
function tick(s, frames, input = {}) { for (let i = 0; i < frames; i++) E.update(s, 1 / 60, input); }
function fixture(mode = 'rescue') {
  // Explicit isolated terrain fixtures test bounded actions and causal systems.
  // Save checks below separately use valid generated terrain and real journals.
  const s = E.create(42, 'calm', mode); s.tiles.fill(0); s._doorHealth = {}; s._terrainHealth = {};
  s.buildings = []; s.containers = []; s.structures = []; s.zombies = []; s.humans = []; s.vehicles = [];
  s.player.x = mode === 'rescue' ? 336 : 3072; s.player.y = s.player.x;
  s.player.health = 100; s.player.stamina = 100; s.player.cooldown = 0; s.player.vehicleId = null;
  s.player.inventory = { bat: 1, pistol: 1 }; B.ensure(s); L.ensure(s); W.ensure(s); return s;
}
function human(s, id = 'h:0,0:0') { return { id, x: s.player.x + 32, y: s.player.y, health: 100, faction: 'survivor', name: 'Morgan', following: true, weapon: 'bat', cooldown: 0, angle: 0 }; }
function globalPoint(s, point) { return { x: point.x + (s.world ? s.world.originX : 0) * 32, y: point.y + (s.world ? s.world.originY : 0) * 32 }; }
function claim(s) { s.structures.push({ x: s.player.x, y: s.player.y + 32, type: 'campfire', health: 100 }); assert(E.action(s, 'base:home')); return B.ensure(s); }
function failureAtomic(s, fn) {
  const before = { inv: JSON.stringify(s.player.inventory), stock: JSON.stringify(B.ensure(s).stock), plots: JSON.stringify(B.ensure(s).plots), stats: JSON.stringify(B.ensure(s).stats) };
  assert.equal(fn(), false); assert.equal(JSON.stringify(s.player.inventory), before.inv); assert.equal(JSON.stringify(B.ensure(s).stock), before.stock);
  assert.equal(JSON.stringify(B.ensure(s).plots), before.plots); assert.equal(JSON.stringify(B.ensure(s).stats), before.stats);
}
function miningSite(s, type) {
  const n = B.nodes(s).find(n => (!type || n.type === type) && n.tx > 4 && n.ty > 4 && n.tx < s.width - 4 && n.ty < s.height - 4 && !E.isSolid(s, n.tx - 1, n.ty));
  assert(n, 'seed must expose a usable ' + (type || '') + ' deposit'); s.player.x = n.x - 32; s.player.y = n.y; return n;
}
function garden(s) {
  const b = claim(s); s.player.inventory.carrot_seeds = 2; s.player.inventory.wood = 2; s.player.angle = 0;
  assert(B.quote(s, 'plant').can); assert(E.action(s, 'base:plant')); return { b, p: b.plots[0] };
}
function generatedGarden(mode) {
  const s = E.create(42, 'calm', mode); s.zombies = []; s.humans = []; s.player.inventory = { carrot_seeds: 4, wood: 5, water: 2, dirty_water: 2 };
  assert(E.action(s, 'base:home')); const home = { ...s.settlement.home };
  for (let radius = 2; radius < 14; radius++) {
    for (let dx = -radius; dx <= radius; dx++) for (const dy of [-radius, radius]) {
      const gx = Math.floor(home.x / 32) + dx, gy = Math.floor(home.y / 32) + dy;
      const tx = gx - (s.world ? s.world.originX : 0), ty = gy - (s.world ? s.world.originY : 0);
      if (tx < 1 || ty < 1 || tx >= s.width - 1 || ty >= s.height - 1 || s.tiles[ty * s.width + tx] !== 0) continue;
      s.player.x = (tx + .5) * 32; s.player.y = (ty + .5) * 32; s.player.angle = 0;
      if (B.quote(s, 'plant').can) { assert(E.action(s, 'base:plant')); return s; }
    }
  }
  assert.fail('generated cabin must have reachable nearby garden grass');
}

check('new resources and processing recipes form a functional equipment upgrade path', () => {
  for (const id of ['stone', 'iron_ore', 'copper_ore', 'iron_ingot', 'carrot_seeds', 'stone_pick', 'iron_pick']) assert(C.items[id], id);
  const s = fixture(); s.player.inventory = { stone: 3, wood: 6, rope: 1, iron_ore: 4, charcoal: 2, hammer: 1 };
  assert(E.craft(s, 'stone_mining_pick')); assert.equal(s.player.inventory.stone_pick, 1);
  assert.equal(E.craft(s, 'smelt_iron'), false); claim(s);
  assert(E.craft(s, 'smelt_iron')); assert(E.craft(s, 'smelt_iron')); assert(E.craft(s, 'iron_mining_pick'));
  assert.equal(s.player.inventory.iron_pick, 1); assert.equal(s.player.inventory.stone_pick || 0, 0); assert.equal(s.player.inventory.hammer, 1);
});
check('surface deposits are deterministic, bounded by view, and absent upstairs', () => {
  const a = E.create(0, 'calm', 'openworld'), b = E.create(0, 'calm', 'openworld');
  const first = B.nodes(a); assert(first.length > 30); assert.deepEqual(first, B.nodes(b)); assert.equal(new Set(first.map(n => n.id)).size, first.length);
  const view = { minX: 70, minY: 70, maxX: 95, maxY: 95 }; assert(B.nodes(a, view).every(n => n.tx >= 70 && n.tx < 95 && n.ty >= 70 && n.ty < 95));
  a.stories.floor = 1; assert.deepEqual(B.nodes(a), []);
  assert.notDeepEqual(B.nodes(E.create(1, 'calm', 'openworld')).map(n => [n.id, n.type]), first.map(n => [n.id, n.type]));
});
check('actual equipped pick swings damage deposits and yield resources once at exhaustion', () => {
  for (const type of ['stone', 'iron', 'copper']) {
    const s = fixture(), n = miningSite(s, type), d = B.deposits[type]; s.player.inventory.stone_pick = 1; assert(E.action(s, 'equip:stone_pick'));
    for (let i = 0; i < Math.ceil(d.health / 24); i++) { s.player.cooldown = 0; s.player.stamina = 100; assert(E.attack(s, n.x, n.y)); }
    assert.equal(s.settlement.nodes[n.id], 0); assert.equal(s.player.inventory[d.item], d.amount); assert.equal(s.settlement.stats.mined, 1);
    assert.equal(s.progression.xp.craft, 5); assert(!B.nodes(s).some(v => v.id === n.id));
    assert.equal(B.strike(s, n.x, n.y, 'stone_pick'), false); assert.equal(s.player.inventory[d.item], d.amount);
  }
});
check('mining rejects unowned tools, misses, walls, cars and upper floors without resource damage', () => {
  const s = fixture(), n = miningSite(s, 'stone');
  assert.equal(B.strike(s, n.x, n.y, 'stone_pick'), false); s.player.inventory.stone_pick = 1;
  for (const other of B.nodes(s)) if (other.id !== n.id && Math.hypot(other.x - s.player.x, other.y - s.player.y) < 100) s.settlement.nodes[other.id] = 0;
  assert.equal(B.strike(s, s.player.x - 64, s.player.y, 'stone_pick'), false); assert.equal(B.strike(s, NaN, n.y, 'stone_pick'), false);
  s.player.x = n.x - 64; s.tiles[n.ty * s.width + n.tx - 1] = 3; assert.equal(B.strike(s, n.x, n.y, 'stone_pick'), false); s.tiles[n.ty * s.width + n.tx - 1] = 0;
  s.player.vehicleId = 'car'; assert.equal(B.strike(s, n.x, n.y, 'stone_pick'), false); s.player.vehicleId = null;
  s.stories.floor = 1; assert.equal(B.strike(s, n.x, n.y, 'stone_pick'), false); assert.equal(Object.hasOwn(s.settlement.nodes, n.id), false);
});
check('full packs leave mined resources in real ground piles without granting duplicate insight', () => {
  const s = fixture(), n = miningSite(s, 'stone'); s.player.inventory = { stone_pick: 1, wood: 28 }; assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s));
  for (let i = 0; i < 3; i++) assert(B.strike(s, n.x, n.y, 'stone_pick'));
  const pile = s.containers.find(c => c.label === 'Mined supplies'); assert(pile && pile._ground); assert.equal(pile.items.stone, 3); assert.equal(s.player.inventory.stone || 0, 0);
  s.player.inventory = {}; s.player.x = pile.x; s.player.y = pile.y; assert(E.interact(s)); assert.equal(s.player.inventory.stone, 3); assert.equal(s.progression.insight, 0);
});
check('exhausted deposits and partial damage persist in generated-world saves', () => {
  const s = E.create(42, 'calm', 'openworld'); s.zombies = []; s.humans = []; const n = miningSite(s, 'stone');
  s.player.inventory = { stone_pick: 1 }; assert(E.action(s, 'equip:stone_pick')); assert(B.strike(s, n.x, n.y, 'stone_pick'));
  let restored = E.deserialize(E.serialize(s)); assert.equal(restored.settlement.nodes[n.id], 48);
  assert(B.strike(restored, n.x, n.y, 'stone_pick')); assert(B.strike(restored, n.x, n.y, 'stone_pick')); assert.equal(restored.settlement.nodes[n.id], 0);
  restored = E.deserialize(E.serialize(restored)); assert.equal(restored.player.inventory.stone, 3); assert(!B.nodes(restored).some(v => v.id === n.id));
});
check('base claim and planting pay exact requirements and preserve a unique clear plot', () => {
  const s = fixture(); assert(B.quote(s, 'home').missing.some(v => /indoors/.test(v))); failureAtomic(s, () => E.action(s, 'base:plant'));
  const { b, p } = garden(s); assert.deepEqual(b.home, { ...globalPoint(s, s.player), floor: 0 }); assert.equal(s.player.inventory.carrot_seeds, 1); assert.equal(s.player.inventory.wood, 1);
  assert.equal(p.crop, 'carrot'); assert.equal(p.moisture, 0); assert.equal(p.progress, 0); assert(B.occupies(s, p.x / 32 - .5, p.y / 32 - .5));
  s.player.angle = 0; const tx = Math.floor(p.x / 32), ty = Math.floor(p.y / 32); assert.equal(E.buildQuote(s, 'barricade').can, false);
  assert.equal(B.quote(s, 'home').can, false); assert.equal(B.occupies(s, tx + 3, ty), false);
});
check('garden stays dry until watered, grows for actual simulation time, and harvest recovers food and seed', () => {
  const s = fixture(), { b, p } = garden(s); tick(s, 60); assert.equal(p.progress, 0);
  s.player.inventory.dirty_water = 1; assert(E.action(s, 'base:water')); assert.equal(s.player.inventory.dirty_water || 0, 0); assert.equal(p.moisture, 100);
  failureAtomic(s, () => E.action(s, 'base:harvest')); tick(s, 5399); assert(p.progress < 90); tick(s, 4); assert.equal(p.progress, 90);
  assert.match(B.nearby(s), /Harvest/); assert(E.interact(s)); assert.equal(b.plots.length, 0); assert.equal(s.player.inventory.carrot, 2); assert.equal(s.player.inventory.carrot_seeds, 2);
  assert.equal(b.stats.harvested, 1); failureAtomic(s, () => E.action(s, 'base:harvest'));
});
check('rain grows crops without supplied water and harvest capacity guard is atomic', () => {
  const s = fixture(), { p } = garden(s); s.weather = 'rain'; tick(s, 5401); assert.equal(p.progress, 90); assert.equal(p.moisture, 100);
  s.player.inventory = { wood: 29, ammo: 14 }; assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s));
  assert(B.quote(s, 'harvest').missing.includes('Make room for the harvest')); failureAtomic(s, () => E.action(s, 'base:harvest'));
  assert.equal(s.settlement.plots.length, 1);
});
check('home, growing crops and stockpile round trip through valid rescue and open-world saves', () => {
  for (const mode of ['rescue', 'openworld']) {
    const s = generatedGarden(mode); assert(E.action(s, 'base:water')); tick(s, 120);
    const saved = JSON.parse(JSON.stringify(s.settlement)), restored = E.deserialize(E.serialize(s)); assert.deepEqual(restored.settlement, saved);
    tick(s, 90); tick(restored, 90); assert.deepEqual(restored.settlement, s.settlement);
    if (mode === 'openworld') {
      const home = { ...s.settlement.home }, plot = { ...s.settlement.plots[0] }; s.player.x = (128.5 - s.world.originX) * 32; s.player.y = (31.5 - s.world.originY) * 32; World.maybeRecenter(s);
      assert.deepEqual(s.settlement.home, home); assert.deepEqual(s.settlement.plots[0], plot); assert.equal(B.quote(s, 'take:water').can, false);
    }
  }
});
check('stock transfers move one item, retain equipped tools and reject distant or full destinations', () => {
  const s = fixture(), b = claim(s); s.player.inventory.food = 2; assert(E.action(s, 'base:store:food'));
  assert.equal(s.player.inventory.food, 1); assert.equal(b.stock.food, 1); assert(E.action(s, 'base:take:food')); assert.equal(s.player.inventory.food, 2); assert.equal(b.stock.food || 0, 0);
  failureAtomic(s, () => E.action(s, 'base:store:bat')); s.player.inventory.bat = 2; assert(E.action(s, 'base:store:bat')); assert.equal(s.player.inventory.bat, 1);
  b.stock = { wood: 187 }; assert(E.inventoryWeight(b.stock) <= 150); failureAtomic(s, () => E.action(s, 'base:store:food'));
  b.stock = { food: 1 }; s.player.inventory = { wood: 29, ammo: 14 }; failureAtomic(s, () => E.action(s, 'base:take:food'));
  s.player.x += 200; assert(B.quote(s, 'store:wood').missing.some(v => /120/.test(v))); failureAtomic(s, () => E.action(s, 'base:store:wood'));
  failureAtomic(s, () => E.action(s, 'base:store:__proto__')); failureAtomic(s, () => E.action(s, 'base:take:food:extra'));
});
check('companion jobs require a living recruit, home and a stored pick, then gather real ore', () => {
  const s = fixture(), n = miningSite(s, 'stone'), h = human(s); h.x = n.x; h.y = n.y; s.humans = [h]; const b = claim(s);
  assert(B.quote(s, 'job:' + h.id + ':gather').missing.some(v => /pick/.test(v))); b.stock = { stone_pick: 1, food: 2 };
  assert(E.action(s, 'base:job:' + h.id + ':gather')); assert.deepEqual(B.goal(s, h), { x: n.x, y: n.y });
  for (let i = 0; i < 16 && !b.stats.mined; i++) B.work(s, h, 1);
  assert.equal(b.stats.mined, 1); assert.equal(b.stock.stone, 3); assert.equal(b.stock.stone_pick, 1); assert.equal(b.stats.delivered, 3);
  h.following = false; failureAtomic(s, () => E.action(s, 'base:job:' + h.id + ':guard')); assert.equal(B.work(s, h, 1), false);
});
check('farm jobs consume stored water and deliver the mature harvest into shared supplies', () => {
  const s = fixture(), { b, p } = garden(s), h = human(s); h.x = p.x; h.y = p.y; s.humans = [h]; b.stock = { dirty_water: 1, water: 1 };
  assert(E.action(s, 'base:job:' + h.id + ':farm')); for (let i = 0; i < 3; i++) B.work(s, h, 1);
  assert.equal(p.moisture, 100); assert.equal(b.stock.dirty_water || 0, 0); assert.equal(b.stock.water, 1);
  for (let i = 0; i < 90; i++) B.update(s, 1); assert.equal(p.progress, 90); for (let i = 0; i < 4; i++) B.work(s, h, 1);
  assert.equal(b.plots.length, 0); assert.equal(b.stock.carrot, 2); assert.equal(b.stock.carrot_seeds, 1); assert.equal(b.stats.delivered, 3);
});
check('stored food restores morale and actual companion damage reflects its mood', () => {
  const s = fixture(), h = human(s), b = claim(s); s.humans = [h]; b.stock.food = 1; b.moods[h.id] = 20;
  for (let i = 0; i < 60; i++) B.update(s, 1); assert.equal(b.moods[h.id], 32); assert.equal(b.stock.food || 0, 0);
  for (let i = 0; i < 60; i++) B.update(s, 1); assert.equal(b.moods[h.id], 22); assert(s.progression.journal.some(j => /low morale/.test(j.text)));
  function damage(mood) {
    const f = fixture(), friend = human(f); friend.x = f.player.x + 60; f.humans = [friend]; f.settlement.moods[friend.id] = mood;
    const z = { id: 987, x: friend.x + 25, y: friend.y, health: 100, state: 'wander', _stun: 0, _humanBite: 1 }; f.zombies = [z]; A.update(f, 1 / 60); return 100 - z.health;
  }
  assert.equal(damage(0), 17.5); assert.equal(damage(100), 30);
});
check('settlement imports reject impossible deposits, crop identities, stock and worker records', () => {
  const s = generatedGarden('openworld'), b = s.settlement, n = B.nodes(s)[0]; b.nodes[n.id] = n.health - 1; b.stock.food = 1;
  b.jobs['h:0,0:0'] = { role: 'guard', timer: 1 }; b.moods['h:0,0:0'] = 50; const saved = E.serialize(s);
  const mutations = [v => { v.version = 2; }, v => { v.extra = 1; }, v => { v.nodes[n.id] = n.health + 1; }, v => { v.nodes[n.id] = 1.2; },
    v => { v.nodes.bad = 1; }, v => { v.nodes['01,1'] = 0; }, v => { v.stock.fake = 1; }, v => { v.stock.food = -1; }, v => { v.stock.wood = 188; },
    v => { v.home = null; }, v => { v.home.floor = 1; }, v => { v.home.x = 600001; }, v => { v.plots.push({ ...v.plots[0] }); },
    v => { v.plots[0].x += 1; }, v => { v.plots[0].id = 'bad'; }, v => { v.plots[0].crop = 'fake'; }, v => { v.plots[0].moisture = 101; }, v => { v.plots[0].progress = 91; },
    v => { v.jobs.fake = { role: 'guard', timer: 0 }; }, v => { v.jobs['h:0,0:0'].role = 'fake'; }, v => { v.jobs['h:0,0:0'].timer = 5; },
    v => { v.moods['h:0,0:0'] = -1; }, v => { v.clock = 61; }, v => { v.stats.mined = -1; }];
  for (const mutate of mutations) { const doc = JSON.parse(saved); mutate(doc.state.settlement); assert.throws(() => E.deserialize(JSON.stringify(doc)), /Invalid save/, mutate.toString()); }
  const old = JSON.parse(saved); delete old.state.settlement; assert.equal(E.deserialize(JSON.stringify(old)).settlement.home, null);
});

check('appearance presets are real state changes with bounded original palettes', () => {
  const s = fixture(), before = L.look(s); assert(E.action(s, 'personal:style:coat:forest')); assert.notEqual(L.look(s).coat, before.coat);
  assert.equal(L.ensure(s).look.coat, 'forest'); assert.equal(E.action(s, 'personal:style:coat:forest'), false);
  for (const bad of ['personal:style:coat:__proto__', 'personal:style:fake:blue', 'personal:style:coat:blue:extra']) assert.equal(E.action(s, bad), false);
  assert.equal(s.personal.look.coat, 'forest');
});
check('seeded strays can be befriended once for food and stay out of the wild catalogue', () => {
  const s = fixture(), a = L.wild(s); assert(a.length >= 2); assert.deepEqual(a, L.wild(fixture()));
  const stray = a[0]; s.player.x = stray.x; s.player.y = stray.y; s.player.inventory.food = 3;
  assert(E.action(s, 'personal:tame')); assert.equal(s.player.inventory.food, 2); assert.equal(s.personal.pets.length, 1); assert(s.personal.tamed[stray.id]);
  assert(!L.wild(s).some(p => p.id === stray.id)); assert.equal(E.action(s, 'personal:tame'), false);
  const second = L.wild(s)[0]; s.player.x = second.x; s.player.y = second.y; assert(E.action(s, 'personal:tame')); assert.equal(s.personal.pets.length, 2);
  assert.equal(L.quote(s, 'tame').can, false);
});
check('pets follow through actual updates, Stay holds location, and feeding pays its exact cost', () => {
  const s = fixture(), stray = L.wild(s)[0]; s.player.x = stray.x; s.player.y = stray.y; s.player.inventory.food = 2; assert(E.action(s, 'personal:tame'));
  const pet = s.personal.pets[0]; s.player.x += 170; const start = { x: pet.x, y: pet.y }; tick(s, 120);
  assert(Math.hypot(pet.x - start.x, pet.y - start.y) > 80); assert(!E.isSolid(s, L.local(s, pet).x / 32, L.local(s, pet).y / 32));
  assert(E.action(s, 'personal:mode:' + pet.id + ':stay')); const stopped = { x: pet.x, y: pet.y }; s.player.x += 100; tick(s, 30); assert.deepEqual({ x: pet.x, y: pet.y }, stopped);
  s.player.x = pet.x; s.player.y = pet.y; const care = pet.care; assert(E.action(s, 'personal:feed:' + pet.id)); assert.equal(s.player.inventory.food || 0, 0);
  assert.equal(pet.care, Math.min(100, care + 25)); assert.equal(s.personal.totalFed, 1); assert.equal(E.action(s, 'personal:feed:missing'), false);
});
check('pet comfort affects fatigue, dogs warn of nearby enemies, and upper floors pause pets', () => {
  const s = fixture(), stray = L.wild(s).find(p => p.kind === 'dog'); s.player.x = stray.x; s.player.y = stray.y; s.player.inventory.food = 1; assert(E.action(s, 'personal:tame'));
  const pet = s.personal.pets[0]; assert.equal(L.comfort(s), .85); s.progression.fatigue = 0; tick(s, 60); assert(s.progression.fatigue < .05);
  s.elapsed = 7; s.zombies = [{ id: 555, x: s.player.x + 100, y: s.player.y, health: 100 }]; L.update(s, .05); assert(s.logs.some(v => /growls/.test(v.text)));
  const care = pet.care; s.stories.floor = 1; L.update(s, .05); assert.equal(pet.care, care); assert.equal(L.comfort(s), 1);
});
check('appearance and pets round trip across real world rebasing and portable saves', () => {
  const s = E.create(42, 'calm', 'openworld'); s.zombies = []; s.humans = []; const stray = L.wild(s)[0]; s.player.x = stray.x; s.player.y = stray.y;
  assert(E.action(s, 'personal:tame')); assert(E.action(s, 'personal:style:hat:beanie')); const pet = { ...s.personal.pets[0] }, look = { ...s.personal.look };
  const restored = E.deserialize(E.serialize(s)); assert.deepEqual(restored.personal.pets[0], pet); assert.deepEqual(restored.personal.look, look);
  s.player.x = (128.5 - s.world.originX) * 32; s.player.y = (31.5 - s.world.originY) * 32; World.maybeRecenter(s);
  assert.equal(s.personal.pets[0].x, pet.x); assert.equal(s.personal.pets[0].y, pet.y); assert.equal(L.local(s, s.personal.pets[0]).x + s.world.originX * 32, pet.x);
});
check('personal save validation rejects unknown style, duplicate pets, mismatched taming and future clocks', () => {
  const s = E.create(42, 'calm', 'openworld'); s.zombies = []; s.humans = []; const stray = L.wild(s)[0]; s.player.x = stray.x; s.player.y = stray.y; assert(E.action(s, 'personal:tame'));
  const saved = E.serialize(s), mutations = [v => { v.version = 2; }, v => { v.look.coat = 'fake'; }, v => { v.look.extra = 'fake'; },
    v => { v.pets.push({ ...v.pets[0] }); }, v => { v.pets[0].care = 101; }, v => { v.pets[0].name = '<img>'; }, v => { v.pets[0].mode = 'fake'; },
    v => { v.pets[0].x = 600001; }, v => { v.pets[0].stepX = 0; v.pets[0].stepY = null; }, v => { v.pets[0].lastBark = s.elapsed + 1; },
    v => { v.pets[0].nextThink = s.elapsed + 2; }, v => { v.tamed = {}; }, v => { v.tamed.fake = true; }, v => { v.totalFed = -1; }];
  for (const mutate of mutations) { const doc = JSON.parse(saved); mutate(doc.state.personal); assert.throws(() => E.deserialize(JSON.stringify(doc)), /Invalid save/, mutate.toString()); }
});

check('faction aid and alliances spend shared supplies and require reputation near home', () => {
  const s = fixture('openworld'), b = claim(s); b.stock = { food: 10, bandage: 2, scrap: 3 };
  assert.equal(W.quote(s, 'ally:commune').can, false); assert(E.action(s, 'faction:aid:commune')); assert.equal(s.warfare.reputation.commune, 3); assert.equal(b.stock.food, 8);
  assert(E.action(s, 'faction:ally:commune')); assert.deepEqual(s.warfare.alliances, ['commune']); assert.equal(b.stock.food, 5); assert.equal(b.stock.bandage || 0, 0); assert.equal(b.stock.scrap || 0, 0);
  assert.equal(E.action(s, 'faction:ally:commune'), false); const food = b.stock.food; assert.equal(E.action(s, 'faction:aid:commune:extra'), false); assert.equal(b.stock.food, food);
  s.player.x += 450; assert.equal(W.quote(s, 'aid:commune').can, false);
});
check('allied reinforcements are bounded, arrive as friends and respect their cooldown', () => {
  const s = fixture('openworld'), b = claim(s); b.stock.food = 8; s.warfare.alliances = ['wardens'];
  assert(E.action(s, 'faction:support:wardens')); assert(s.humans.length > 0 && s.humans.length <= 8); assert(s.humans.every(h => h.faction === 'survivor' && W.group(s, h) === 'wardens'));
  assert.equal(b.stock.food, 6); assert.equal(s.warfare.support.wardens, s.elapsed + 180); assert.equal(E.action(s, 'faction:support:wardens'), false);
  const h = s.humans[0]; W.attacked(s, h); W.align(s, h); assert.equal(s.warfare.alliances.includes('wardens'), false); assert.equal(h.faction, 'raider'); assert.equal(s.warfare.reputation.wardens, -5);
  const rescue = fixture(), base = claim(rescue); base.stock.food = 2; rescue.warfare.alliances = ['wardens'];
  assert.doesNotThrow(() => W.action(rescue, 'support:wardens'));
});
check('opposing humans fight each other through real AI, while walls and alliances prevent hits', () => {
  function encounter(wall, alliance) {
    const s = fixture(); s.player.x = 800;
    const friend = human(s); friend.x = 336; friend.y = 336; friend.following = false;
    const enemy = { ...human(s, 'h:0,0:1'), x: 400, y: 336, faction: 'raider', following: false };
    s.humans = [friend, enemy]; if (wall) s.tiles[10 * s.width + 11] = 3; if (alliance) s.warfare.alliances = ['ashen'];
    A.update(s, 1 / 60); return { s, friend, enemy };
  }
  const fight = encounter(false, false); assert.equal(fight.friend.health, 75); assert.equal(fight.enemy.health, 75); assert.equal(fight.s.player.health, 100);
  const blocked = encounter(true, false); assert.equal(blocked.friend.health, 100); assert.equal(blocked.enemy.health, 100);
  const peaceful = encounter(false, true); assert.equal(peaceful.enemy.faction, 'survivor'); assert.equal(peaceful.friend.health, 100); assert.equal(peaceful.enemy.health, 100);
});
check('reinforcements archive dead humans without reviving them or corrupting active save order', () => {
  const s = E.create(42, 'calm', 'openworld'); s.zombies = []; assert(E.action(s, 'base:home')); s.settlement.stock.food = 2; s.warfare.alliances = ['wardens'];
  const deadIds = s.humans.map(h => h.id); for (const h of s.humans) { h.health = 0; h.following = false; }
  assert(E.action(s, 'faction:support:wardens')); assert(s.humans.length > 0); assert(s.humans.every(h => h.health > 0));
  assert(deadIds.every(id => s.world.dormantHumans.some(h => h.id === id && h.health === 0)));
  const save = E.serialize(s), doc = JSON.parse(save), restored = E.deserialize(save);
  assert.deepEqual(restored.humans.map(h => h.id), s.humans.map(h => h.id)); assert(restored.humans.every(h => h.health > 0));
  const all = restored.humans.concat(restored.world.dormantHumans); assert(deadIds.every(id => all.some(h => h.id === id && h.health === 0)));
  assert.equal(new Set(all.map(h => h.id)).size, all.length);
  for (const mutate of [v => { v.order.humans[0] = 'h:0,0:9999'; }, v => { v.order.humans[1] = v.order.humans[0]; }, v => { v.order.humans.pop(); }, v => { v.order.humans[0] = 'h:00,0:100'; }]) {
    const invalid = JSON.parse(save); mutate(invalid); assert.throws(() => E.deserialize(JSON.stringify(invalid)), /Invalid save/, mutate.toString());
  }
  const reversed = JSON.parse(save); reversed.order.humans.reverse(); assert.deepEqual(E.deserialize(JSON.stringify(reversed)).humans.map(h => h.id), reversed.order.humans);
  assert.equal(doc.order.humans.some(id => deadIds.includes(id)), false);
});
check('a twelve-person recruited squad consumes rations and rejects a thirteenth companion', () => {
  const s = fixture(); s.player.inventory.food = 13;
  for (let i = 0; i < 13; i++) {
    const h = human(s, 'h:0,0:' + (i + 2)); h.following = false; s.humans.push(h); s.conversation = { id: h.id };
    assert.equal(E.action(s, 'recruit'), i < 12);
  }
  assert.equal(s.humans.filter(h => h.following).length, 12); assert.equal(s.player.inventory.food, 1); assert.match(s.conversation.text, /twelve/i);
});
check('large undead battles create tracked waves and continue deterministically through saves', () => {
  const s = E.create(42, 'calm', 'openworld'); s.zombies = []; s.humans = []; assert(E.action(s, 'faction:battle:undead'));
  const battle = s.warfare.battle; assert(battle.active); assert.equal(battle.pending, 3); assert(battle.spawned > 0 && battle.spawned <= 60); assert.equal(battle.enemies.length, battle.spawned);
  assert.equal(E.action(s, 'faction:battle:undead'), false); const restored = E.deserialize(E.serialize(s)); assert.deepEqual(restored.warfare, s.warfare);
  tick(s, 90); tick(restored, 90); assert.deepEqual(JSON.parse(E.serialize(restored)), JSON.parse(E.serialize(s)));
});
check('raider battles, completed defenses and withdrawals have tangible tracked outcomes', () => {
  const s = fixture('openworld'); assert(E.action(s, 'faction:battle:raiders')); assert(s.humans.length > 0 && s.humans.length <= 24); assert(s.humans.every(h => h.faction === 'raider'));
  const battle = s.warfare.battle; s.elapsed = battle.nextWave; W.update(s, .5); assert.equal(battle.pending, 0); assert(battle.spawned > 24 && battle.spawned <= 48);
  s.humans = []; W.update(s, .5); assert.equal(battle.active, false); assert.equal(battle.outcome, 'held'); assert.equal(battle.defeated, battle.spawned);
  assert(E.action(s, 'faction:battle:undead')); s.player.x += 1500; W.update(s, .5); assert.equal(s.warfare.battle.active, false); assert.equal(s.warfare.battle.outcome, 'withdrawn');
  assert.equal(W.quote(fixture(), 'battle:undead').can, false);
});
check('faction and battle saves reject invalid reputation, members, alliances and enemy accounting', () => {
  const s = E.create(42, 'calm', 'openworld'); s.zombies = []; s.humans = []; assert(E.action(s, 'faction:battle:undead')); const saved = E.serialize(s);
  const mutations = [v => { v.version = 2; }, v => { v.reputation.commune = 21; }, v => { v.reputation.extra = 1; }, v => { v.alliances = ['wardens', 'wardens']; },
    v => { v.alliances = ['fake']; }, v => { v.members.fake = 'wardens'; }, v => { v.members['h:0,0:100'] = 'fake'; }, v => { v.support.wardens = s.elapsed + 181; },
    v => { v.nextHumanId = 99; }, v => { v.battle.spawned++; }, v => { v.battle.defeated = v.battle.spawned + 1; }, v => { v.battle.enemies.push(v.battle.enemies[0]); },
    v => { v.battle.outcome = 'held'; }, v => { v.battle.x = 600001; }, v => { v.battle.pending = 5; }, v => { v.battle.started = s.elapsed + 1; }];
  for (const mutate of mutations) { const doc = JSON.parse(saved); mutate(doc.state.warfare); assert.throws(() => E.deserialize(JSON.stringify(doc)), /Invalid save/, mutate.toString()); }
});

console.log(passed + ' settlement, personal and warfare checks passed' + (failures.length ? ', ' + failures.length + ' failed.' : '.'));
if (failures.length) process.exitCode = 1;
