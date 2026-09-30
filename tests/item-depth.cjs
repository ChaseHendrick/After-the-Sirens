'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
global.window = {};
for (const module of ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const { Catalog: C, Engine: E, World: W, Settlement: B, Destruction: D, Progression: P, Actors: A } = window.Sirens;
let passed = 0;
const failures = [];
function check(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (error) { failures.push({ name, error }); console.error('FAIL ' + name + ': ' + error.stack); }
}
function fixture() {
  // Controlled terrain and supplies exercise production actions, not an unassisted playthrough.
  const s = E.create(42, 'calm', 'rescue');
  s.tiles.fill(0); s._doorHealth = {}; s._terrainHealth = {};
  s.buildings = []; s.containers = []; s.humans = []; s.zombies = []; s.vehicles = []; s.structures = [];
  s.player.x = 336; s.player.y = 336; s.player.cooldown = 0; s.player.stamina = 100;
  s.player.inventory = { bat: 1 }; s.player.weapon = 'bat'; s.player.equipment = { weapon: 'bat', clothing: null, backpack: null };
  return s;
}
function forResult(id) {
  assert(C.items[id], 'missing representative item ' + id);
  const r = C.recipes.find(r => r.result[id]); assert(r, 'missing producer for ' + id); return r;
}
function toolMatches(candidate, required) { return candidate === required || !!(C.items[candidate] && (C.items[candidate].toolTags || []).includes(required)); }
function alias(required) {
  const item = Object.values(C.items).find(i => i.id !== required && toolMatches(i.id, required));
  assert(item, 'no new substitute for ' + required); return item.id;
}
function exactCraft(s, r) {
  const before = { ...s.player.inventory }, expected = { ...before };
  for (const [id, n] of Object.entries(r.cost)) { expected[id] = (expected[id] || 0) - n; assert(expected[id] >= 0); if (!expected[id]) delete expected[id]; }
  for (const [id, n] of Object.entries(r.result)) expected[id] = (expected[id] || 0) + n;
  assert(E.craftQuote(s, r.id).can, E.craftQuote(s, r.id).missing.join('; '));
  assert(E.craft(s, r.id)); assert.deepEqual(s.player.inventory, expected, r.id + ' must pay exact inputs once');
  assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s) + .00001);
}
function provide(s, r, retained = []) {
  for (const [id, n] of Object.entries(r.cost)) if (!retained.includes(id)) s.player.inventory[id] = Math.max(s.player.inventory[id] || 0, n);
  for (const id of r.tools || []) if (!Object.keys(s.player.inventory).some(candidate => s.player.inventory[candidate] > 0 && toolMatches(candidate, id))) s.player.inventory[id] = 1;
  if (r.station === 'campfire') s.structures = [{ x: s.player.x + 32, y: s.player.y, type: 'campfire', health: 100 }];
}
function atomicFailure(s, fn) {
  const before = JSON.stringify({ inventory: s.player.inventory, equipment: s.player.equipment, weapon: s.player.weapon, magazines: s.player.magazines, xp: s.progression && s.progression.xp, totals: s.progression && s.progression.totals });
  assert.equal(fn(), false);
  assert.equal(JSON.stringify({ inventory: s.player.inventory, equipment: s.player.equipment, weapon: s.player.weapon, magazines: s.player.magazines, xp: s.progression && s.progression.xp, totals: s.progression && s.progression.totals }), before);
}
function frozenFinite(value, label) {
  if (typeof value === 'number') assert(Number.isFinite(value), label + ' contains a nonfinite number');
  if (!value || typeof value !== 'object') return;
  assert(Object.isFrozen(value), label + ' must be frozen');
  for (const [key, child] of Object.entries(value)) frozenFinite(child, label + '.' + key);
}

check('thousands of original items have stable identities and immutable bounded metadata', () => {
  const entries = Object.entries(C.items), names = new Set(), families = new Set();
  assert(entries.length >= 3000, 'expected at least 3000 items, found ' + entries.length);
  frozenFinite(C, 'catalogue');
  for (const [id, item] of entries) {
    assert.equal(item.id, id); assert(/^[a-z][a-z0-9_]*$/.test(id)); assert(id.length <= 100);
    assert.equal(item.name.trim(), item.name); assert(item.name.length > 2 && item.name.length <= 160);
    assert(!names.has(item.name.toLowerCase()), 'duplicate item name ' + item.name); names.add(item.name.toLowerCase());
    assert(item.description && item.description.length <= 800); assert(C.items[id].category); assert(typeof item.family === 'string' && item.family.trim()); families.add(item.family);
    assert(Number.isInteger(item.tier) && item.tier >= 0 && item.tier <= 5, id + ' tier');
    assert(typeof item.rarity === 'string' && item.rarity.length > 0);
    assert(Number.isFinite(item.weight) && item.weight > 0 && item.weight <= 50, id + ' weight');
    assert(Array.isArray(item.tags) && Array.isArray(item.sources));
    if (item.armor !== undefined) assert(item.armor >= 0 && item.armor <= .9, id + ' armor');
    if (item.capacity !== undefined) assert(item.capacity > 0 && item.capacity <= 100, id + ' carrying capacity');
    if (item.weapon) {
      const w = item.weapon; assert(['melee', 'firearm'].includes(w.kind)); assert(w.damage > 0 && w.damage <= 250);
      assert(w.range >= 20 && w.range <= 2000); assert(w.cooldown > 0 && w.cooldown <= 10); assert(w.staminaCost >= 0 && w.staminaCost <= 100); assert(w.noise >= 0 && w.noise <= 2000);
      if (w.kind === 'firearm') { assert(C.items[w.ammoId], id + ' ammo'); assert(Number.isInteger(w.clipSize) && w.clipSize > 0 && w.clipSize <= 100); }
    }
    for (const key of ['treeDamage', 'wallDamage', 'doorDamage']) if (item[key] !== undefined) assert(item[key] > 0 && item[key] <= 10, id + ' ' + key);
    if (item.miningDamage !== undefined) assert(item.miningDamage > 0 && item.miningDamage <= 200, id + ' mining damage');
    for (const tool of item.toolTags || []) assert(C.items[tool], id + ' unknown tool tag ' + tool);
    for (const source of item.sources) { assert(C.loot[source], id + ' unknown source ' + source); assert(C.loot[source].some(e => e.id === id), id + ' false loot source ' + source); }
  }
  assert(families.size >= 20, 'catalogue should contain substantial material and preparation families');
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/catalog.js'), 'utf8'), context);
  assert.equal(JSON.stringify(context.window.Sirens.Catalog), JSON.stringify(C), 'repeat loading must generate the same records and balancing');
});

check('all recipe references resolve and every item is obtainable through loot and campfire recipes', () => {
  const reachable = new Set(), availableTools = new Set(), ids = new Set();
  function reach(id) { reachable.add(id); availableTools.add(id); for (const tool of C.items[id].toolTags || []) availableTools.add(tool); }
  for (const [source, table] of Object.entries(C.loot)) {
    assert(table.length > 0);
    for (const entry of table) {
      assert(C.items[entry.id], source + ' unknown item ' + entry.id);
      assert(entry.weight > 0 && Number.isFinite(entry.weight));
      assert(Number.isInteger(entry.min) && Number.isInteger(entry.max) && entry.min >= 1 && entry.max >= entry.min && entry.max <= 1000);
      assert(C.items[entry.id].sources.includes(source), entry.id + ' lacks actual source ' + source); reach(entry.id);
    }
  }
  for (const r of C.recipes) {
    assert(!ids.has(r.id), 'duplicate recipe ' + r.id); ids.add(r.id);
    assert(r.name && r.description); assert(!r.station || r.station === 'campfire', r.id + ' requires an unavailable station');
    assert(Object.keys(r.cost).length && Object.keys(r.result).length);
    for (const inv of [r.cost, r.result]) for (const [id, count] of Object.entries(inv)) { assert(C.items[id], r.id + ' references ' + id); assert(Number.isInteger(count) && count > 0 && count <= 1000); }
    for (const id of r.tools || []) assert(C.items[id], r.id + ' missing tool ' + id);
  }
  for (let changed = true; changed;) {
    changed = false;
    for (const r of C.recipes) {
      if (!Object.keys(r.cost).every(id => reachable.has(id)) || !(r.tools || []).every(id => availableTools.has(id))) continue;
      for (const id of Object.keys(r.result)) if (!reachable.has(id)) { reach(id); changed = true; }
    }
  }
  const missing = Object.keys(C.items).filter(id => !reachable.has(id));
  assert.deepEqual(missing, [], 'unobtainable items: ' + missing.slice(0, 30).join(', '));
});

check('expanded records have an actual use or participate in a working ingredient or kept-tool path', () => {
  const ingredients = new Set(C.recipes.flatMap(r => Object.keys(r.cost))), required = new Set(C.recipes.flatMap(r => r.tools || []));
  const ammunition = new Set(Object.values(C.items).filter(i => i.weapon && i.weapon.ammoId).map(i => i.weapon.ammoId));
  // These pre-expansion collectibles retain their explicitly limited utility status.
  const legacyCollectibles = new Set(['clay', 'pliers', 'lighter', 'headlamp', 'route_atlas', 'compass', 'binoculars', 'whistle', 'flare', 'lantern']);
  const specialActions = new Set(['parts', 'carrot_seeds']);
  const unusable = Object.values(C.items).filter(item => {
    const effect = item.effect && Object.values(item.effect).some(n => typeof n === 'number' && n !== 0);
    const tool = required.has(item.id) || (item.toolTags || []).some(id => required.has(id));
    return !(effect || item.weapon || item.armor > 0 || item.capacity > 0 || item.fuel > 0 || item.miningDamage > 0 || ingredients.has(item.id) || tool || ammunition.has(item.id) || legacyCollectibles.has(item.id) || specialActions.has(item.id));
  });
  assert.deepEqual(unusable.map(i => i.id), [], 'unusable expansion entries');
  const profiles = new Set(Object.values(C.items).map(i => JSON.stringify({ effect: i.effect, weapon: i.weapon, armor: i.armor, capacity: i.capacity, mining: i.miningDamage, tree: i.treeDamage, wall: i.wallDamage, door: i.doorDamage })).filter(s => s !== '{}'));
  assert(profiles.size >= 150, 'the expansion must contain functional balancing differences');
});

check('real seeded sectors sample broad new loot across every supported location family and retain essentials', () => {
  const observed = new Set(), labels = new Set(), biomes = new Set(), roots = new Set(Object.values(C.loot).flat().map(e => e.id));
  let containers = 0;
  for (let seed = 0; seed < 64; seed++) for (let cy = -3; cy <= 3; cy++) for (let cx = -3; cx <= 3; cx++) {
    const chunk = W.generate(seed, 'calm', cx, cy); biomes.add(chunk.biome);
    if (seed < 2 && cx === 1 && cy === 1) assert.deepEqual(chunk.containers, W.generate(seed, 'calm', cx, cy).containers, 'seeded loot must repeat');
    for (const c of chunk.containers) {
      containers++; labels.add(c.label.replace(/ supplies$/, ''));
      if (cx !== 0 || cy !== 0) assert(c.items.food > 0 && c.items.water > 0, c.label + ' lost baseline emergency food or water');
      if (c.label === 'Safe cabin supplies') { assert(c.items.food >= 3 && c.items.water >= 3); assert(c.items.hammer && c.items.screwdriver && c.items.canvas_pack && c.items.machete); }
      for (const [id, n] of Object.entries(c.items)) { assert(C.items[id]); assert(Number.isInteger(n) && n > 0 && n <= 100); observed.add(id); }
    }
  }
  assert.equal(biomes.size, 6); assert(labels.size >= 25, 'sample must cover business and biome location families');
  const coverage = [...roots].filter(id => observed.has(id)).length / roots.size;
  assert(coverage >= .9, 'sampled only ' + (coverage * 100).toFixed(1) + '% of direct-loot roots');
  assert(observed.size >= 400, 'seeded businesses should expose substantial new ingredients and equipment');
  for (const id of ['wood', 'scrap', 'bandage', 'ammo', 'hammer', 'screwdriver', 'rope', 'stone', 'carrot_seeds']) assert(observed.has(id), 'essential supply missing from sampled world: ' + id);
  console.log('LOOT ' + containers + ' real containers; ' + observed.size + ' distinct items; ' + (coverage * 100).toFixed(1) + '% of ' + roots.size + ' loot roots; ' + labels.size + ' location labels');
});

check('a multistage metal preparation chain pays inputs and produces usable equipment', () => {
  const s = fixture(), stages = ['spring_steel_billet', 'spring_steel_bar', 'spring_steel_edge', 'spring_steel_camp_axe'], crafted = new Set();
  function produce(id, count) {
    if (!stages.includes(id)) { s.player.inventory[id] = Math.max(s.player.inventory[id] || 0, count); return; }
    const r = forResult(id);
    while ((s.player.inventory[id] || 0) < count) {
      // An intermediate can be required directly and also consumed by another prerequisite.
      // Recheck the complete transaction after each recursive preparation pass.
      let attempts = 0;
      do { for (const [input, n] of Object.entries(r.cost)) if ((s.player.inventory[input] || 0) < n) produce(input, n); assert(attempts++ < 30, 'processing chain must terminate'); }
      while (!Object.entries(r.cost).every(([input, n]) => (s.player.inventory[input] || 0) >= n));
      provide(s, r, Object.keys(r.cost)); exactCraft(s, r); crafted.add(id);
    }
  }
  produce('spring_steel_camp_axe', 1); assert.equal(crafted.size, stages.length);
  assert(E.action(s, 'equip:spring_steel_camp_axe')); assert.equal(s.player.weapon, 'spring_steel_camp_axe');
  const z = { id: 918, x: s.player.x + 35, y: s.player.y, health: 200, state: 'wander', _stun: 0 }; s.zombies = [z];
  const stamina = s.player.stamina; assert(E.attack(s, z.x, z.y)); assert(z.health < 200); assert(s.player.stamina < stamina); assert(s.player.cooldown > 0);
});

check('new prepared food, drinks and field remedies have their stated effects and consume exactly one unit', () => {
  for (const id of ['apricot_compote', 'meadow_mint_infusion', 'meadow_mint_field_dressing']) {
    const s = fixture(), r = forResult(id); provide(s, r); exactCraft(s, r);
    const item = C.items[id], beforeCount = s.player.inventory[id];
    Object.assign(s.player, { health: 40, hunger: 80, thirst: 80, stamina: 30, infection: 60, bleeding: 2 });
    const before = { ...s.player }; assert(E.action(s, 'use:' + id)); assert.equal(s.player.inventory[id] || 0, beforeCount - 1);
    for (const key of ['hunger', 'thirst', 'infection']) assert.equal(s.player[key], Math.max(0, Math.min(100, before[key] - (item.effect[key] || 0))));
    assert.equal(s.player.stamina, Math.max(0, Math.min(100, before.stamina + (item.effect.stamina || 0))));
    assert(s.player.health >= before.health + (item.effect.health || 0));
    assert.equal(s.player.bleeding, Math.max(0, Math.min(3, before.bleeding - (item.effect.bleeding || 0) * .03)));
  }
});

check('new tool aliases satisfy legacy crafts and progression without consuming the retained tool', () => {
  const s = fixture(), file = alias('file'); s.player.inventory = { [file]: 1, metal_tube: 1, duct_tape: 1 };
  assert(E.ownedTool(s, 'file')); exactCraft(s, C.recipes.find(r => r.id === 'assemble_baton')); assert.equal(s.player.inventory[file], 1);
  const knife = alias('kitchen_knife'); s.player.inventory = { [knife]: 1, wood: 2, rope: 1 };
  assert(E.action(s, 'equip:' + knife)); exactCraft(s, C.recipes.find(r => r.id === 'carve_spear'));
  assert.equal(s.player.inventory[knife], 1); assert.equal(s.player.weapon, knife, 'equipped kept knife remains after carving');
  const screwdriver = alias('screwdriver'); s.player.inventory = { [screwdriver]: 1, scrap: 2 }; P.ensure(s).insight = 1;
  assert(E.action(s, 'research:salvage')); assert.equal(s.player.inventory[screwdriver], 1); assert.equal(s.player.inventory.scrap || 0, 0);
  assert(P.known(s, 'salvage'));
});

check('a kept tool must survive recipe payment, with spare copies or another alias resolving the conflict', () => {
  const s = fixture(), hammer = alias('hammer'), r = { id: 'kept-tool-payment-fixture', name: 'Tool payment fixture', cost: { [hammer]: 1 }, result: { scrap: 1 }, tools: ['hammer'] };
  s.player.inventory = { [hammer]: 1 }; if (C.items[hammer].weapon) assert(E.action(s, 'equip:' + hammer));
  const before = JSON.stringify(s.player.inventory); assert.equal(E.craftQuote(s, r).can, false); assert.equal(JSON.stringify(s.player.inventory), before);
  s.player.inventory[hammer] = 2; assert(E.craftQuote(s, r).can, 'a spare retained copy satisfies the tool prerequisite');
  s.player.inventory[hammer] = 1; s.player.inventory.hammer = 1; assert(E.craftQuote(s, r).can, 'another matching tool remains after paying costs');
  const actual = fixture(), wrench = alias('wrench'), salvage = C.recipes.find(r => r.id === 'recover_' + wrench); assert(salvage && salvage.tools.includes('wrench'));
  actual.player.inventory = { [wrench]: 1 }; assert(E.action(actual, 'equip:' + wrench));
  atomicFailure(actual, () => E.craft(actual, salvage.id));
  actual.player.inventory[wrench] = 2; exactCraft(actual, salvage); assert.equal(actual.player.inventory[wrench], 1); assert.equal(actual.player.weapon, wrench);
});

check('full packs and stack ceilings reject expansion crafts atomically', () => {
  const s = fixture(), r = C.recipes.find(r => Object.keys(r.result).some(id => C.items[id].tier > 0) && E.inventoryWeight(r.result) - E.inventoryWeight(r.cost) >= .1 && E.inventoryWeight(r.cost) + (r.tools || []).reduce((sum, id) => sum + C.items[id].weight, 0) < 12);
  assert(r, 'need a genuine expansion recipe that increases carried weight'); provide(s, r);
  const remaining = E.carryCapacity(s) - E.inventoryWeight(s.player.inventory); s.player.inventory.ammo = Math.floor(remaining / C.items.ammo.weight);
  assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s) + .00001); atomicFailure(s, () => E.craft(s, r.id));
  const stack = fixture(), pack = Object.values(C.items).filter(i => i.capacity).sort((a, b) => b.capacity - a.capacity)[0];
  stack.player.inventory = { scrap: 4, ammo: 995, [pack.id]: 1 }; assert(E.action(stack, 'equip:' + pack.id));
  assert(E.inventoryWeight(stack.player.inventory) <= E.carryCapacity(stack)); atomicFailure(stack, () => E.craft(stack, 'recover_rounds'));
});

check('new armor reduces actual raider damage and a textile pack increases usable carry capacity', () => {
  const armor = Object.values(C.items).find(i => i.armor > 0 && i.family !== 'clothing' && i.tier > 0); assert(armor, 'need expansion protective clothing');
  function raiderHit(protectedPlayer) {
    const s = fixture(); s.player.x = 336; s.player.y = 336;
    if (protectedPlayer) { s.player.inventory[armor.id] = 1; assert(E.action(s, 'equip:' + armor.id)); }
    s.humans = [{ id: 'h:0,0:1', x: s.player.x + 80, y: s.player.y, health: 100, faction: 'raider', name: 'River', following: false, weapon: 'pistol', cooldown: 0, angle: Math.PI }];
    A.update(s, 1 / 60); return 100 - s.player.health;
  }
  const plain = raiderHit(false), reduced = raiderHit(true); assert(plain > 0); assert(reduced > 0 && reduced < plain);
  const s = fixture(), id = 'ripstop_expedition_pack', r = forResult(id); provide(s, r); exactCraft(s, r);
  assert(E.action(s, 'equip:' + id)); assert.equal(E.carryCapacity(s), E.capacity + C.items[id].capacity);
  s.player.inventory = { [id]: 1, wood: Math.floor((E.carryCapacity(s) - C.items[id].weight) / C.items.wood.weight) };
  assert(E.inventoryWeight(s.player.inventory) > E.capacity); assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s));
  atomicFailure(s, () => E.action(s, 'drop:' + id));
  s.player.inventory.canvas_pack = 1;
  if (E.inventoryWeight(s.player.inventory) > E.capacity + C.items.canvas_pack.capacity) atomicFailure(s, () => E.action(s, 'equip:canvas_pack'));
});

check('new mining picks damage real deposits and preserve the equipped tool through extraction', () => {
  const s = fixture(), id = 'tool_steel_chipping_pick', item = C.items[id]; assert(item && item.miningDamage > 0);
  const node = B.nodes(s).find(n => n.tx > 6 && n.ty > 6 && n.tx < s.width - 6 && n.ty < s.height - 6); assert(node);
  s.player.x = node.x - 32; s.player.y = node.y; s.player.inventory = { [id]: 1 }; assert(E.action(s, 'equip:' + id));
  assert(E.attack(s, node.x, node.y)); assert.equal(B.ensure(s).nodes[node.id], Math.max(0, node.health - item.miningDamage));
  for (let i = 1; i < Math.ceil(node.health / item.miningDamage); i++) { s.player.cooldown = 0; s.player.stamina = 100; assert(E.attack(s, node.x, node.y)); }
  assert.equal(s.settlement.nodes[node.id], 0); assert.equal(s.player.inventory[id], 1); assert.equal(s.player.weapon, id);
  assert.equal(s.player.inventory[B.deposits[node.type].item], B.deposits[node.type].amount);
});

check('ranged assemblies use their compatible ammunition, magazine size and real attack damage', () => {
  const s = fixture(), id = 'harbor_patrol_rifle', r = forResult(id), gun = C.items[id].weapon; provide(s, r); exactCraft(s, r);
  assert(E.action(s, 'equip:' + id)); s.player.inventory.ammo = 4; assert.equal(E.action(s, 'reload'), false, 'pistol rounds cannot feed a rifle');
  s.player.inventory[gun.ammoId] = 3; assert(E.action(s, 'reload')); assert.equal(s.player.ammo, 3); assert.equal(s.player.inventory[gun.ammoId] || 0, 0);
  s.player.cooldown = 0; const z = { id: 919, x: s.player.x + 160, y: s.player.y, health: 200, state: 'wander', _stun: 0 }; s.zombies = [z];
  assert(E.attack(s, z.x, z.y, 'shoot')); assert.equal(z.health, 200 - gun.damage); assert.equal(s.player.ammo, 2); assert.equal(s.player.magazines[id], 2); assert.equal(s.player.cooldown, gun.cooldown);
  s.player.cooldown = 0; s.player.inventory[gun.ammoId] = gun.clipSize + 4; assert(E.action(s, 'reload')); assert.equal(s.player.ammo, gun.clipSize); assert.equal(s.player.inventory[gun.ammoId], 6);
});

check('dismantling an equipped pack cannot leave an overweight inventory and pays only after capacity is safe', () => {
  const s = fixture(), id = 'ripstop_expedition_pack', r = C.recipes.find(r => r.id === 'recover_' + id); assert(r);
  s.player.inventory = { [id]: 1, kitchen_knife: 1, wood: 45 }; assert(E.action(s, 'equip:' + id));
  assert(E.inventoryWeight(s.player.inventory) <= E.carryCapacity(s)); assert(E.inventoryWeight(s.player.inventory) > E.capacity);
  atomicFailure(s, () => E.craft(s, r.id)); assert.equal(s.player.equipment.backpack, id);
  s.player.inventory.wood = 20; exactCraft(s, r); assert.equal(s.player.equipment.backpack, null); assert.equal(E.carryCapacity(s), E.capacity); assert.equal(s.player.inventory[id] || 0, 0);
});

check('material tool multipliers affect real tree, wall and door destruction', () => {
  for (const [tile, field, baseline] of [[5, 'treeDamage', D.limits.treeHealth], [3, 'wallDamage', D.limits.wallHealth], [6, 'doorDamage', 65]]) {
    const item = Object.values(C.items).find(i => i.weapon && i.weapon.kind === 'melee' && i[field] > 1 && i.weapon.damage * i[field] < baseline); assert(item, 'need a measurable expansion ' + field + ' tool');
    const s = fixture(); s.player.inventory = { [item.id]: 1 }; assert(E.action(s, 'equip:' + item.id));
    const tx = Math.floor(s.player.x / 32) + 1, ty = Math.floor(s.player.y / 32), index = ty * s.width + tx;
    s.tiles[index] = tile; if (tile === 6) s._doorHealth[index] = baseline;
    assert(D.hit(s, (tx + .5) * 32, (ty + .5) * 32, item.id));
    const remaining = tile === 6 ? s._doorHealth[index] : s._terrainHealth[index];
    assert(Math.abs(remaining - (baseline - item.weapon.damage * item[field])) < 1e-9, item.id + ' must use its actual material multiplier');
  }
});

check('new inventory, equipment, magazines and looted supplies survive generated-world save and reload', () => {
  const s = E.create(917, 'calm', 'openworld'); s.zombies = []; s.humans = [];
  const pack = C.items.ripstop_expedition_pack, armor = Object.values(C.items).find(i => i.armor > 0 && i.family !== 'clothing' && i.tier > 0);
  const gun = Object.values(C.items).find(i => i.weapon && i.weapon.kind === 'firearm' && i.tier > 0 && i.family !== 'firearms'); assert(pack && armor && gun);
  s.player.inventory = { [pack.id]: 1, [armor.id]: 1, [gun.id]: 1, [gun.weapon.ammoId]: 3, apricot_compote: 1, spring_steel_edge: 1 };
  assert(E.action(s, 'equip:' + pack.id)); assert(E.action(s, 'equip:' + armor.id)); assert(E.action(s, 'equip:' + gun.id)); assert(E.action(s, 'reload'));
  assert(E.action(s, 'drop:apricot_compote'));
  const restored = E.deserialize(E.serialize(s)); assert.deepEqual(restored.player.inventory, s.player.inventory); assert.deepEqual(restored.player.equipment, s.player.equipment);
  assert.equal(restored.player.weapon, gun.id); assert.equal(restored.player.magazines[gun.id], s.player.magazines[gun.id]);
  const pile = restored.containers.find(c => c._ground && c.items.apricot_compote === 1); assert(pile, 'new dropped item must persist in the generated world journal');
  restored.player.x = pile.x; restored.player.y = pile.y; assert(E.interact(restored)); assert.equal(restored.player.inventory.apricot_compote, 1);
  const invalid = JSON.parse(E.serialize(restored)); (invalid.state || invalid).player.inventory = { invented_item_id: 1 }; assert.throws(() => E.deserialize(JSON.stringify(invalid)));
});

if (failures.length) { console.error('\n' + failures.length + ' item-depth checks failed.'); process.exitCode = 1; }
else console.log('\n' + passed + ' item-depth checks passed.');
