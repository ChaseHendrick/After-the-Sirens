'use strict';
const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const { Engine: E, Progression: P, Actors: A, World: W, Stories: F, Vehicles: V, Catalog: C } = window.Sirens;
let passed = 0;
const failures = [];
function check(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (error) { failures.push({ name, error }); console.error('FAIL ' + name + ': ' + error.stack); }
}
function tick(s, frames, input = {}) { for (let i = 0; i < frames; i++) E.update(s, 1 / 60, input); }
function fixture() {
  // Explicit isolated terrain fixtures exercise the production actions and updates.
  // They are not claims of an unassisted playthrough of the generated world.
  const s = E.create(0, 'calm', 'rescue');
  s.tiles.fill(0); s.buildings = []; s.containers = []; s.structures = []; s.zombies = []; s.humans = []; s.vehicles = [];
  s.player.x = 336; s.player.y = 336; s.player.inventory = { bat: 1, pistol: 1 };
  s.player.health = 100; s.player.stamina = 100; s.player.cooldown = 0;
  return s;
}
function human(id = 'h:0,0:0', x = 370, y = 336) {
  return { id, x, y, faction: 'survivor', name: 'Morgan', angle: 0, health: 100, following: false, weapon: 'bat', cooldown: 0 };
}
function zombie(id = 123, x = 370, y = 336) {
  return { id, x, y, health: 100, state: 'wander', angle: 0, windup: 0, _targetX: x, _targetY: y,
    _lastSeen: -100, _wanderClock: 5, _path: [], _pathClock: 0, _stun: 0, _attackCooldown: 0, _blockedTimer: 0 };
}
function learnAll(s) { P.ensure(s).research = ['salvage', 'care', 'shelter', 'mechanics', 'water', 'radio']; }
function atStairs(s) {
  const b = F.currentBuilding(s) || s.buildings.find(b => b.floors === 3) || s.buildings[0];
  assert(b && b.stairs); s.player.x = (b.stairs.x + .5) * 32; s.player.y = (b.stairs.y + .5) * 32; return b;
}
function globalPoint(s, v) { return { x: v.x + (s.world ? s.world.originX : 0) * 32, y: v.y + (s.world ? s.world.originY : 0) * 32 }; }
function assertAtomicFailure(s, action) {
  const before = { inv: JSON.stringify(s.player.inventory), insight: P.ensure(s).insight, research: JSON.stringify(P.ensure(s).research), xp: JSON.stringify(P.ensure(s).xp) };
  assert.equal(action(), false); assert.equal(JSON.stringify(s.player.inventory), before.inv); assert.equal(P.ensure(s).insight, before.insight);
  assert.equal(JSON.stringify(P.ensure(s).research), before.research); assert.equal(JSON.stringify(P.ensure(s).xp), before.xp);
}

check('fresh rescue and open worlds start with bounded, empty survival progress', () => {
  for (const mode of ['rescue', 'openworld']) {
    const s = E.create(0, 'calm', mode), p = P.ensure(s);
    assert.equal(p.insight, 0); assert.deepEqual(p.research, []); assert.equal(p.event.next, 180); assert.equal(p.sleeping, false);
    assert.deepEqual(p.xp, { combat: 0, craft: 0, care: 0, mechanics: 0 }); assert.equal(P.nextTask(s), 'Collect your cabin supplies with E.');
  }
});
check('real loot earns insight only when something transfers, once per place', () => {
  const s = fixture(), c = { id: 'supplies-0', x: 336, y: 336, label: 'Cabin supplies', items: { scrap: 3, wood: 100 }, looted: false };
  s.containers = [c]; s.player.inventory = { wood: 30 }; assert.equal(E.interact(s), false); assert.equal(s.progression.insight, 0);
  s.player.inventory = {}; assert(E.interact(s)); assert.equal(s.progression.insight, 1); assert.equal(s.progression.xp.craft, 4);
  assert(c.items.wood > 0, 'remaining heavy supplies preserve partial container');
  s.player.inventory = {}; assert(E.interact(s)); assert.equal(s.progression.insight, 1); assert.equal(s.progression.totals.loot, 1);
});
check('dropping and recollecting supplies cannot farm insight or craftsmanship', () => {
  const s = fixture(); s.player.inventory.food = 1;
  assert(E.action(s, 'drop:food')); assert(s.containers[0]._ground); assert(E.interact(s));
  assert.equal(s.player.inventory.food, 1); assert.equal(s.progression.insight, 0); assert.equal(s.progression.xp.craft, 0);
});
check('loot identity distinguishes floors and sectors but remains stable after rebasing', () => {
  const s = fixture(), c = { id: 'same-local-id', x: 336, y: 336, label: 'Floor supplies' };
  P.loot(s, c); P.loot(s, c); assert.equal(s.progression.insight, 1);
  s.stories.floor = 1; P.loot(s, c); assert.equal(s.progression.insight, 2); s.stories.floor = 0;
  s.world = { originX: 64, originY: 0 }; P.loot(s, c); assert.equal(s.progression.insight, 3);
  s.world.originX = 0; c.x += 64 * 32; P.loot(s, c); assert.equal(s.progression.insight, 3);
});
check('each manual studies once, keeps its reference, and survives save restoration', () => {
  const s = E.create(5, 'calm', 'rescue'); s.player.inventory = { first_aid_manual: 1 };
  assert(E.action(s, 'study:first_aid_manual')); assert.equal(s.player.inventory.first_aid_manual, 1);
  assert.equal(s.progression.xp.care, 18); assert.equal(s.progression.insight, 1);
  assertAtomicFailure(s, () => E.action(s, 'study:first_aid_manual'));
  assertAtomicFailure(s, () => E.action(s, 'study:electronics_manual'));
  const restored = E.deserialize(E.serialize(s)); assert.deepEqual(restored.progression.studied, ['first_aid_manual']);
  assertAtomicFailure(restored, () => E.action(restored, 'study:first_aid_manual'));
});
check('research quotes reject missing insight, materials, tools, and prerequisites atomically', () => {
  const s = fixture();
  assert(P.quoteResearch(s, 'salvage').missing.some(v => /insight/.test(v)));
  s.progression.insight = 10; s.player.inventory.scrap = 20; s.player.inventory.wire = 4; s.player.inventory.hammer = 1;
  assert(P.quoteResearch(s, 'salvage').missing.some(v => /screwdriver/.test(v)));
  assertAtomicFailure(s, () => E.action(s, 'research:salvage'));
  assert(P.quoteResearch(s, 'mechanics').missing.some(v => /Learn Salvage practice/.test(v)));
  assertAtomicFailure(s, () => E.action(s, 'research:mechanics'));
  assert.equal(P.quoteResearch(s, 'made-up'), null); assertAtomicFailure(s, () => E.action(s, 'research:made-up'));
});
check('connected projects spend exactly the quoted supplies and insight, retaining tools', () => {
  const s = fixture(); s.progression.insight = 20;
  s.player.inventory = { scrap: 20, wood: 4, wire: 4, bandage: 1, cloth: 1, screwdriver: 1, hammer: 1, first_aid_manual: 1, empty_bottle: 1, filter_mesh: 1, electronics_manual: 1 };
  for (const node of P.projects) {
    const q = P.quoteResearch(s, node.id), inv = { ...s.player.inventory }, insight = s.progression.insight;
    assert(q.can, node.id + ': ' + q.missing); assert(E.action(s, 'research:' + node.id));
    assert.equal(s.progression.insight, insight - q.insight);
    for (const [id, count] of Object.entries(q.cost)) assert.equal(s.player.inventory[id] || 0, (inv[id] || 0) - count);
    for (const id of node.tools) assert.equal(s.player.inventory[id], inv[id]);
    assert.equal(P.known(s, node.id), true); assert.equal(P.quoteResearch(s, node.id).can, false);
    assertAtomicFailure(s, () => E.action(s, 'research:' + node.id));
  }
  assert.equal(s.progression.xp.craft, P.projects.length * 8);
});
check('combat practice comes from landed hits and reduces actual melee stamina cost', () => {
  const novice = fixture(), trained = fixture(); P.gain(trained, 'combat', 600);
  assert(E.attack(novice, 420, 336)); assert.equal(novice.progression.xp.combat, 0, 'misses give no practice');
  const noviceCost = 100 - novice.player.stamina; assert(E.attack(trained, 420, 336));
  assert(Math.abs((100 - trained.player.stamina) - noviceCost * .8) < 1e-9);
  novice.player.cooldown = 0; novice.zombies = [zombie()]; assert(E.attack(novice, 420, 336)); assert.equal(novice.progression.xp.combat, 4);
  novice.player.cooldown = 0; novice.player.ammo = 2; novice.zombies[0].x = 470;
  assert(E.attack(novice, 600, 336, 'pistol')); assert.equal(novice.progression.xp.combat, 8);
});
check('useful care earns practice and project plus skill bonuses increase treatment', () => {
  const novice = fixture(), trained = fixture();
  for (const s of [novice, trained]) { s.player.inventory.bandage = 2; s.player.health = 50; s.player.bleeding = 1; }
  P.gain(trained, 'care', 600); trained.progression.research = ['care'];
  assert(E.action(novice, 'use:bandage')); assert(E.action(trained, 'use:bandage'));
  assert.equal(trained.player.health - novice.player.health, 9); assert.equal(novice.progression.xp.care, 4);
  novice.player.health = 100; novice.player.bleeding = 0; const xp = novice.progression.xp.care;
  assert(E.action(novice, 'use:bandage')); assert.equal(novice.progression.xp.care, xp, 'unnecessary use cannot farm care');
});
check('successful crafts and builds earn practice and strengthen new barricades', () => {
  const s = fixture(); s.player.inventory.scrap = 5; s.player.inventory.wood = 3;
  assert(E.craft(s, 'field_wraps')); assert.equal(s.progression.xp.craft, 5); assert.equal(s.progression.totals.craft, 1);
  s.progression.xp.craft = 600; s.progression.research = ['salvage', 'shelter']; s.player.angle = 0;
  assert(E.build(s, 'barricade')); assert.equal(s.structures[0].health, 200); assert.equal(s.progression.totals.build, 1);
  const xp = s.progression.xp.craft; assert.equal(E.build(s, 'barricade'), false); assert.equal(s.progression.xp.craft, xp);
});
check('shared crafting quotes match ingredient, station, tool and output capacity failures', () => {
  const s = fixture(); s.player.inventory = {};
  assert(E.craftQuote(s, 'field_wraps').missing.some(v => /metal scrap/.test(v)));
  s.player.inventory = { dirty_water: 2, wood: 1 };
  const q = E.craftQuote(s, 'boil_water'); assert(q.missing.some(v => /campfire/.test(v))); assert(q.missing.some(v => /cooking pot/.test(v)));
  assertAtomicFailure(s, () => E.craft(s, 'boil_water'));
  s.player.inventory = { wood: 26, scrap: 2, water: 2 }; s.structures = [{ x: s.player.x + 32, y: s.player.y, type: 'campfire', health: 100 }];
  assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s));
  const ready = E.craftQuote(s, 'collect_water'); assert(ready.can); assert(E.craft(s, 'collect_water')); assert.equal(s.player.inventory.water, 4);
  // Condenser consumes heavier wood and salvage, so a lighter recipe is the proper
  // capacity fixture: filtering adds 0.3 kg without consuming the retained filter.
  s.player.inventory = { dirty_water: 1, water_filter: 1, wood: 27, ammo: 35 };
  assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s));
  assert(E.craftQuote(s, 'filter_water').missing.some(v => /room/.test(v)));
  assert.equal(E.canCraft(s, 'filter_water'), false); assertAtomicFailure(s, () => E.craft(s, 'filter_water'));
});
check('survivor trade has finite stock, remembers trust, and restocks next day', () => {
  const s = fixture(), h = human(); s.humans = [h]; s.player.inventory.food = 5;
  assert(A.interact(s)); for (let i = 0; i < 3; i++) assert(E.action(s, 'trade'));
  const c = P.contact(s, h); assert.equal(c.stock, 0); assert.equal(c.trust, 3);
  assertAtomicFailure(s, () => E.action(s, 'trade')); assert.equal(s.conversation.canTrade, false);
  s.day++; assert(E.action(s, 'trade')); assert.equal(c.stock, 2); assert.equal(c.trust, 4);
});
check('survivor requests use exact costs and rewards and can only be delivered once per day', () => {
  for (let i = 0; i < P.requests.length; i++) {
    const s = fixture(), h = human(); s.humans = [h]; const c = P.contact(s, h); c.request = i;
    const r = P.requests[i]; s.player.inventory = { ...r.cost }; assert(A.interact(s));
    const q = P.quoteRequest(s, h); assert(q.can); assert(E.action(s, 'helpSurvivor'));
    assert.deepEqual(s.player.inventory, r.reward); assert.equal(c.trust, 3); assert.equal(c.completedDay, s.day);
    assert.equal(s.progression.insight, 2); assert.equal(s.progression.xp.care, 8);
    assertAtomicFailure(s, () => E.action(s, 'helpSurvivor')); assert.equal(s.conversation.hasRequest, false);
    s.day++; s.player.inventory = { ...r.cost }; assert(P.quoteRequest(s, h).can);
  }
});
check('request rewards cannot overflow the pack and failure spends no supplies or progress', () => {
  const s = fixture(), h = human(); s.humans = [h]; P.contact(s, h).request = 0;
  s.player.inventory = { wood: 29, bandage: 2 }; assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s));
  assert(A.interact(s)); assert(P.quoteRequest(s, h).missing.includes('Make room for the reward'));
  assertAtomicFailure(s, () => E.action(s, 'helpSurvivor')); assert.equal(P.contact(s, h).trust, 0);
  s.player.inventory = {}; assert(P.quoteRequest(s, h).missing.some(v => /Bring/.test(v))); assertAtomicFailure(s, () => E.action(s, 'helpSurvivor'));
});
check('trusted companions deal greater real damage and betrayal removes trust', () => {
  const damage = trust => { const s = fixture(), h = human('h:0,0:0', 370); h.following = true; s.humans = [h]; s.zombies = [zombie(123, 405)]; P.contact(s, h).trust = trust; A.update(s, 1 / 60); return 100 - s.zombies[0].health; };
  assert.equal(damage(0), 25); assert.equal(damage(20), 30);
  const s = fixture(), h = human(); h.following = true; s.humans = [h]; P.contact(s, h).trust = 9;
  assert(E.attack(s, 420, 336)); assert.equal(h.faction, 'raider'); assert.equal(h.following, false); assert.equal(P.contact(s, h).trust, 0);
  A.hit(s, h, 100, false); assert.equal(P.contact(s, h).alive, false); assert(s.progression.journal.some(j => /Morgan died/.test(j.text)));
});
check('survivor agendas move safely using AI and retain global homes across rebasing', () => {
  const s = fixture(), h = human('h:0,0:0', 480, 480); s.humans = [h];
  const c = P.contact(s, h), before = { x: h.x, y: h.y }; tick(s, 120);
  assert(Math.hypot(h.x - before.x, h.y - before.y) > 20); assert(!E.isSolid(s, h.x / 32, h.y / 32));
  const home = { x: c.homeX, y: c.homeY }, point = { x: c.x, y: c.y };
  s.world = { originX: 64, originY: 0 }; h.x -= 64 * 32; P.contact(s, h);
  assert.deepEqual({ x: c.homeX, y: c.homeY }, home); assert.deepEqual({ x: c.x, y: c.y }, globalPoint(s, h));
  assert(Math.abs(c.x - point.x) < 1, 'contact updates may lag movement by one tick');
});
check('named contacts, trust, finite stock and tracking survive real world saves and travel', () => {
  const s = E.create(42, 'calm', 'openworld'), h = s.humans.find(h => h.id === 'h:0,0:0'); assert(h);
  const c = P.contact(s, h); c.trust = 9; c.stock = 1; c.completedDay = 1; assert(E.action(s, 'track:' + h.id));
  const original = globalPoint(s, h), restored = E.deserialize(E.serialize(s));
  assert.deepEqual(restored.progression.contacts[h.id], c); assert.deepEqual(restored.progression.tracking, { kind: 'person', id: h.id });
  const marker = P.waypoint(restored); assert.deepEqual(globalPoint(restored, marker), original);
  s.player.x = (128.5 - s.world.originX) * 32; s.player.y = (31.5 - s.world.originY) * 32; W.maybeRecenter(s); F.refresh(s);
  assert.equal(s.progression.contacts[h.id].trust, 9); assert.equal(s.progression.contacts[h.id].stock, 1);
  const offscreen = P.waypoint(s); assert.deepEqual(globalPoint(s, offscreen), original);
  s.player.x = (31.5 - s.world.originX) * 32; s.player.y = (31.5 - s.world.originY) * 32; W.maybeRecenter(s); F.refresh(s);
  assert(s.humans.some(v => v.id === h.id)); assert.equal(P.contact(s, s.humans.find(v => v.id === h.id)).trust, 9);
});
check('rain collection requires learned knowledge, outside rain, bottle, and free capacity', () => {
  const s = fixture(); s.player.inventory = { empty_bottle: 2 }; s.weather = 'rain';
  assertAtomicFailure(s, () => E.action(s, 'ability:rain')); learnAll(s);
  s.tiles[10 * s.width + 10] = 2; assert(P.abilityQuote(s, 'rain').missing.includes('Stand outside during rain'));
  s.tiles[10 * s.width + 10] = 0; assert(E.action(s, 'ability:rain'));
  assert.equal(s.player.inventory.empty_bottle, 1); assert.equal(s.player.inventory.dirty_water, 1); assert.equal(s.progression.xp.care, 3);
  s.stories.floor = 1; assertAtomicFailure(s, () => E.action(s, 'ability:rain')); s.stories.floor = 0;
  s.player.inventory = { empty_bottle: 1, wood: 29, ammo: 11 }; assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s));
  assert(P.abilityQuote(s, 'rain').missing.includes('Make room for water')); assertAtomicFailure(s, () => E.action(s, 'ability:rain'));
});
check('vehicle repair requires a stopped damaged visible nearby car and consumes only scrap', () => {
  const s = fixture(), car = { ...V.spawnForChunk(0, 0, 0)[0], x: 375, y: 336, speed: 0, condition: 40 };
  s.vehicles = [car]; s.player.inventory = { hammer: 1, scrap: 6 }; learnAll(s); P.gain(s, 'mechanics', 600);
  assert(P.abilityQuote(s, 'repair').can); assert(E.action(s, 'ability:repair'));
  assert.equal(car.condition, 80); assert.equal(s.player.inventory.scrap, 3); assert.equal(s.player.inventory.hammer, 1);
  assert.equal(s.progression.xp.mechanics, 608); car.speed = 10;
  assertAtomicFailure(s, () => E.action(s, 'ability:repair')); assert.equal(car.condition, 80);
  car.speed = 0; car.x += 150; assert(P.abilityQuote(s, 'repair').missing.includes('Stand beside a car'));
  car.x = 410; s.tiles[10 * s.width + 11] = 3; assert(P.abilityQuote(s, 'repair').missing.includes('Stand beside a car'));
});
check('sleep recovers fatigue in shelter and movement or danger wakes the survivor', () => {
  const s = fixture(); s.progression.fatigue = 40;
  assertAtomicFailure(s, () => E.action(s, 'ability:sleep')); s.tiles[10 * s.width + 10] = 2;
  assert(E.action(s, 'ability:sleep')); tick(s, 60); assert(s.progression.fatigue < 36.01); assert(s.player.resting);
  tick(s, 1, { moveX: 1 }); assert.equal(s.progression.sleeping, false); assert.equal(s.player.resting, false);
  assert(E.action(s, 'ability:sleep')); s.zombies = [zombie(123, 500)]; tick(s, 1);
  assert.equal(s.progression.sleeping, false); assert(s.progression.journal.some(j => /danger woke/.test(j.text)));
  assert(P.abilityQuote(s, 'sleep').missing.includes('Enemies are too close'));
  s.zombies = []; s.player.vehicleId = 'car'; assert(P.abilityQuote(s, 'sleep').missing.includes('Leave the car first'));
  s.player.vehicleId = null; s.progression.fatigue = 10; assert(E.action(s, 'ability:sleep')); tick(s, 170);
  assert.equal(s.progression.sleeping, false); assert(s.progression.fatigue < .2);
});
check('fatigue penalizes actual stamina recovery while sprinting builds fatigue faster', () => {
  const a = fixture(), b = fixture(); a.player.stamina = b.player.stamina = 20; b.progression.fatigue = 80;
  tick(a, 60); tick(b, 60); assert(Math.abs((b.player.stamina - 20) / (a.player.stamina - 20) - .8) < 1e-8);
  const walking = fixture(), sprinting = fixture(); tick(walking, 60, { moveX: 1 }); tick(sprinting, 60, { moveX: 1, sprint: true });
  assert(sprinting.progression.fatigue > walking.progression.fatigue * 3);
});
check('supply scanning chooses unsearched supplies, ignores drops, and stays on its floor', () => {
  const s = fixture(); learnAll(s); s.containers = [
    { id: 'drop:0:1', x: 336, y: 336, label: 'Dropped supplies', looted: false, _ground: true },
    { id: 'old', x: 350, y: 336, label: 'Empty supplies', looted: true },
    { id: 'near', x: 410, y: 336, label: 'Clinic supplies', looted: false },
    { id: 'far', x: 600, y: 336, label: 'Workshop supplies', looted: false }
  ];
  assert(E.action(s, 'ability:scan')); assert.equal(s.progression.tracking.id, 'near');
  assert.deepEqual(P.waypoint(s), { x: 410, y: 336, label: 'Clinic supplies' });
  s.stories.floor = 1; assert.equal(P.waypoint(s), null); s.stories.floor = 0;
  s.world = { originX: 64, originY: 0 }; assert.equal(P.waypoint(s).x, 410 - 64 * 32);
});
check('driving and safe survival award practice through actual simulation distance and time', () => {
  const s = fixture(); s.player.x = 96; const car = { ...V.spawnForChunk(0, 0, 0)[0], x: s.player.x, y: s.player.y, angle: 0, speed: 0, fuel: 60, condition: 100 };
  s.vehicles = [car]; assert(E.action(s, 'vehicle'));
  for (let i = 0; i < 660 && s.progression.xp.mechanics === 0; i++) E.update(s, 1 / 60, { moveY: -1 });
  assert(s.progression.xp.mechanics >= 4); assert(s.progression.drivingDistance < 1800);
  const rested = fixture(); tick(rested, 3601); assert.equal(rested.progression.xp.care, 2);
  const wounded = fixture(); wounded.player.bleeding = 1; tick(wounded, 3601); assert.equal(wounded.progression.xp.care, 0);
});
check('seeded events wait through opening minutes, cover rain, migration, and actual supply caches', () => {
  const observed = new Set();
  for (let seed = 0; seed < 12; seed++) {
    const s = E.create(seed, 'calm', 'openworld'); s.zombies = []; s.humans = [];
    s.elapsed = 179; tick(s, 30); assert.equal(s.progression.event.kind, 'none');
    s.elapsed = 180; const before = s.containers.filter(c => c._ground).length; tick(s, 1);
    const kind = s.progression.event.kind; observed.add(kind); assert.equal(s.progression.event.serial, 1);
    assert(s.progression.event.until > s.elapsed); assert(s.progression.event.next > s.progression.event.until);
    if (kind === 'rain') assert.equal(s.weather, 'rain');
    if (kind === 'migration') { assert(s.zombies.length > 0 && s.zombies.length <= 3); assert(s.zombies.every(z => z.id.startsWith('wave:') && z.state === 'investigate')); }
    if (kind === 'cache') { assert.equal(s.containers.filter(c => c._ground).length, before + 1); const cache = s.containers.find(c => c.label === 'Traveler supplies'); assert(cache); assert.deepEqual(cache.items, { food: 1, bandage: 2 }); assert(P.waypoint(s)); }
  }
  assert.deepEqual([...observed].sort(), ['cache', 'migration', 'rain']);
});
check('event outcomes are deterministic and continue identically across a mid-event save', () => {
  for (const seed of [0, 1, 2]) {
    const a = E.create(seed, 'calm', 'openworld'), b = E.create(seed, 'calm', 'openworld');
    for (const s of [a, b]) { s.zombies = []; s.humans = []; s.elapsed = 180; tick(s, 1); }
    assert.deepEqual(JSON.parse(E.serialize(a)), JSON.parse(E.serialize(b)));
    const restored = E.deserialize(E.serialize(a));
    tick(a, 90); tick(restored, 90); assert.deepEqual(JSON.parse(E.serialize(a)), JSON.parse(E.serialize(restored)));
    const previous = a.progression.event.previousWeather; a.elapsed = a.progression.event.until; P.update(a, 0, {}, 0, false);
    if (b.progression.event.kind === 'rain') assert.equal(a.weather, previous); assert.equal(a.progression.event.kind, 'none');
  }
});
check('world events defer upstairs and never add wanderers to rescue mode or beyond the cap', () => {
  const s = E.create(0, 'calm', 'openworld'); atStairs(s); assert(E.action(s, 'stairsUp')); s.zombies = []; s.elapsed = 180; tick(s, 1);
  assert.equal(s.progression.event.serial, 0); assert.equal(E.spawnWanderers(s, 5), 0);
  atStairs(s); assert(E.action(s, 'stairsDown')); s.zombies = []; tick(s, 1); assert.equal(s.progression.event.serial, 1);
  const rescue = fixture(); rescue.elapsed = 180; tick(rescue, 1); assert.equal(rescue.progression.event.serial, 0); assert.equal(E.spawnWanderers(rescue, 5), 0);
  const capped = E.create(1, 'calm', 'openworld'), limit = W.limits.maxActiveZombies;
  capped.zombies = Array.from({ length: limit }, (_, i) => zombie('wave:1:' + i, capped.player.x + 600, capped.player.y));
  assert.equal(E.spawnWanderers(capped, 5), 0); assert.equal(capped.zombies.length, limit);
});
check('old saves migrate with fresh progress while current progress round trips on all floors', () => {
  for (const mode of ['rescue', 'openworld']) {
    const s = E.create(7, 'calm', mode); const old = JSON.parse(E.serialize(s)); delete old.state.progression;
    const migrated = E.deserialize(JSON.stringify(old)); assert.equal(migrated.progression.insight, 0); assert.equal(migrated.progression.event.next, migrated.elapsed + 180);
    s.player.inventory.first_aid_manual = 1; assert(E.action(s, 'study:first_aid_manual')); s.progression.fatigue = 33;
    atStairs(s); assert(E.action(s, 'stairsUp')); const before = JSON.parse(JSON.stringify(s.progression));
    const restored = E.deserialize(E.serialize(s)); assert.equal(restored.stories.floor, 1); assert.deepEqual(restored.progression, before);
  }
});
check('shared building quotes keep people, cars, stairs and the survivor landing clear', () => {
  const s = fixture(); s.player.inventory = { wood: 5, scrap: 2 }; s.player.angle = 0;
  const q = E.buildQuote(s, 'barricade'); assert(q.can); assert.deepEqual(q.cost, { wood: 3, scrap: 1 });
  s.humans = [human('h:0,0:0', q.x, q.y)]; assert.equal(E.buildQuote(s, 'barricade').can, false); assertAtomicFailure(s, () => E.build(s, 'barricade'));
  s.humans = []; s.vehicles = [{ ...V.spawnForChunk(0, 0, 0)[0], x: q.x, y: q.y }]; assert.equal(E.buildQuote(s, 'barricade').can, false);
  s.vehicles = []; s.buildings = [{ stairs: { x: q.x / 32 - .5, y: q.y / 32 - .5 } }]; assert.equal(E.buildQuote(s, 'barricade').can, false);
  s.buildings = []; s.player.vehicleId = 'car'; assert.equal(E.buildQuote(s, 'barricade').can, false);
  s.player.vehicleId = null; assert(E.buildQuote(s, 'barricade').can); assert(E.build(s, 'barricade'));
  assert.deepEqual({ x: s.structures[0].x, y: s.structures[0].y }, { x: q.x, y: q.y });
});
check('saved map markers use global positions, floor guards, and bounded action input', () => {
  const s = E.create(42, 'calm', 'openworld'); assert(E.action(s, 'mark:1500,-225.5,0'));
  assert.deepEqual(s.progression.tracking, { kind: 'place', id: 'map', x: 1500, y: -225.5, floor: 0, label: 'Map marker' });
  const restored = E.deserialize(E.serialize(s)); assert.deepEqual(restored.progression.tracking, s.progression.tracking);
  assert.deepEqual(globalPoint(restored, P.waypoint(restored)), { x: 1500, y: -225.5 });
  restored.stories.floor = 1; assert.equal(P.waypoint(restored), null); restored.stories.floor = 0;
  const before = JSON.stringify(restored.progression.tracking);
  for (const action of ['mark:600001,0,0', 'mark:Infinity,0,0', 'mark:0,0,3', 'mark:0,0,0junk', 'track:__proto__', 'track:constructor', 'study:__proto__']) {
    assert.equal(E.action(restored, action), false, action); assert.equal(JSON.stringify(restored.progression.tracking), before);
  }
  assert(E.action(restored, 'clearWaypoint')); assert.equal(P.waypoint(restored), null);
});
check('rain fronts remain active across a day rollover and restore the new weather baseline', () => {
  let s;
  for (let seed = 0; seed < 12; seed++) {
    const candidate = E.create(seed, 'calm', 'openworld'); candidate.zombies = []; candidate.humans = []; candidate.elapsed = 180; tick(candidate, 1);
    if (candidate.progression.event.kind === 'rain') { s = candidate; break; }
  }
  assert(s); s.time = 23.9999; const day = s.day; tick(s, 1); assert.equal(s.day, day + 1); assert.equal(s.weather, 'rain');
  const baseline = s.progression.event.previousWeather; assert(['clear', 'overcast', 'rain'].includes(baseline));
  const restored = E.deserialize(E.serialize(s)); restored.elapsed = restored.progression.event.until; P.update(restored, 0, {}, 0, false);
  assert.equal(restored.weather, baseline); assert.equal(restored.progression.event.kind, 'none');
});
check('malformed progression saves reject adversarial skills, projects, people, events and tracking', () => {
  const s = E.create(42, 'calm', 'openworld'), h = s.humans.find(h => h.id === 'h:0,0:0'); P.contact(s, h);
  s.player.inventory.first_aid_manual = 1; E.action(s, 'study:first_aid_manual'); const save = E.serialize(s);
  const mutations = [
    p => { p.version = 2; }, p => { p.sleeping = 'yes'; }, p => { p.fatigue = 101; }, p => { p.insight = -1; }, p => { p.insight = 1.2; },
    p => { p.xp.combat = Infinity; }, p => { p.xp.combat = -1; }, p => { p.xp.extra = 1; }, p => { delete p.xp.care; },
    p => { p.research = ['salvage', 'salvage']; }, p => { p.research = ['mechanics']; }, p => { p.research = ['fake']; },
    p => { p.studied = ['first_aid_manual', 'first_aid_manual']; }, p => { p.studied = ['fake']; },
    p => { p.looted.bad = false; }, p => { Object.defineProperty(p.looted, '__proto__', { value: true, enumerable: true }); },
    p => { p.contacts.fake = p.contacts[h.id]; }, p => { p.contacts[h.id].trust = 21; }, p => { p.contacts[h.id].stock = 4; },
    p => { p.contacts[h.id].completedDay = s.day + 1; }, p => { p.contacts[h.id].trait = 'fake'; }, p => { p.contacts[h.id].alive = 1; },
    p => { p.contacts[h.id].homeX = 1e20; }, p => { p.contacts[h.id].route = 8; }, p => { p.contacts[h.id].nextRoute = s.elapsed + 13; },
    p => { p.journal[0].elapsed = s.elapsed + 1; }, p => { p.journal[0].text = 'x'.repeat(501); }, p => { p.journal = Array(121).fill(p.journal[0]); },
    p => { p.event.kind = 'fake'; }, p => { p.event.previousWeather = 'fake'; }, p => { p.event.next = s.elapsed + 201; }, p => { p.event.serial = -1; },
    p => { p.tracking = { kind: 'person', id: 'missing' }; }, p => { p.tracking = { kind: 'person', id: '__proto__' }; }, p => { p.tracking = { kind: 'person', id: 'constructor' }; },
    p => { p.tracking = { kind: 'supplies', id: 'c', x: 0, y: 0, floor: 3, label: 'Supplies' }; }, p => { p.tracking = { kind: 'place', id: 'map', x: 600001, y: 0, floor: 0, label: 'Map marker' }; },
    p => { p.survivalClock = 61; }, p => { p.drivingDistance = 1801; }, p => { p.totals.loot = -1; }
  ];
  for (const mutate of mutations) { const doc = JSON.parse(save); mutate(doc.state.progression); assert.throws(() => E.deserialize(JSON.stringify(doc)), /Invalid save/, mutate.toString()); }
  assert.equal({}.polluted, undefined);
});
check('journal and XP bounds remain finite and capped during long runs', () => {
  const s = fixture(); P.gain(s, 'combat', Infinity); P.gain(s, '__proto__', 3); P.gain(s, 'combat', -1); assert.equal(s.progression.xp.combat, 0);
  P.gain(s, 'combat', 1e20); assert.equal(s.progression.xp.combat, 1000000); assert.equal(P.level(s, 'combat'), 5);
  for (let i = 0; i < 150; i++) P.write(s, 'find', 'Event ' + i);
  assert.equal(s.progression.journal.length, 120); assert.equal(s.logs.length, 60); assert.equal(s.progression.journal[0].text, 'Event 30');
  P.write(s, 'find', 'Event 149'); assert.equal(s.progression.journal.length, 120);
});
check('participant steps move and update needs without advancing shared time, AI or world events twice', () => {
  const s = E.create(42, 'calm', 'openworld'); s.humans = []; s.zombies = [];
  E.update(s, 1 / 60, {}); const shared = { elapsed: s.elapsed, day: s.day, time: s.time, ticks: s.stats.ticks, ai: s.stats.aiUpdates, fatigue: s.progression.fatigue, event: JSON.stringify(s.progression.event), origin: s.world.originX, rng: s._rng };
  const x = s.player.x, thirst = s.player.thirst; assert(E.stepParticipant(s, .05, { moveX: 1 })); assert(E.stepParticipant(s, .05, { moveX: 1 }));
  assert(s.player.x > x + 5); assert(s.player.thirst > thirst);
  assert.deepEqual({ elapsed: s.elapsed, day: s.day, time: s.time, ticks: s.stats.ticks, ai: s.stats.aiUpdates, fatigue: s.progression.fatigue, event: JSON.stringify(s.progression.event), origin: s.world.originX, rng: s._rng }, shared);
  const save = E.serialize(s); assert.equal(E.stepParticipant(s, Infinity, {}), false); assert.equal(E.stepParticipant(s, -1, {}), false); assert.equal(E.serialize(s), save);
  s.player.health = 0; assert.equal(E.stepParticipant(s, .05, {}), false);
});
check('participant movement uses real wall collision, cooldowns and survival effects with clamped time', () => {
  const s = fixture(); s.tiles[10 * s.width + 11] = 3; s.player.cooldown = .5; s.player.invulnerable = .5; s.player.bleeding = 1;
  const health = s.player.health; for (let i = 0; i < 20; i++) assert(E.stepParticipant(s, .05, { moveX: 1 }));
  assert(s.player.x > 336 && s.player.x <= 342.01); assert.equal(s.player.cooldown, 0); assert.equal(s.player.invulnerable, 0); assert(s.player.health < health);
  assert.equal(s.elapsed, 0); const thirst = s.player.thirst; assert(E.stepParticipant(s, 100, {}));
  assert(s.player.thirst - thirst < .01, 'large participant dt is clamped to a single safe movement step');
});
check('participant attack and driving reuse the production combat and vehicle simulation', () => {
  const s = fixture(); s.zombies = [zombie()]; const ammo = s.player.ammo;
  assert(E.stepParticipant(s, .05, { shoot: true, aimX: 500, aimY: 336 })); assert.equal(s.player.ammo, ammo - 1); assert(s.zombies[0].health < 100); assert(s.player.cooldown > 0);
  const carState = fixture(), car = { ...V.spawnForChunk(0, 0, 0)[0], x: 365, y: 336, fuel: 20, condition: 100, angle: 0, speed: 0 };
  carState.vehicles = [car]; assert(E.action(carState, 'vehicle')); const start = car.x;
  for (let i = 0; i < 60; i++) assert(E.stepParticipant(carState, 1 / 60, { moveY: -1 }));
  assert(car.x > start + 50); assert(car.fuel < 20); assert.equal(carState.player.x, car.x); assert.equal(carState.elapsed, 0); assert.equal(carState.stats.ticks, 0);
});

console.log(passed + ' progression checks passed' + (failures.length ? ', ' + failures.length + ' failed.' : '.'));
if (failures.length) process.exitCode = 1;
