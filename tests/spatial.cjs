'use strict';
const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'spatial', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const S = window.Sirens, Q = S.Spatial, E = S.Engine;
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function rng(seed) { let n = seed >>> 0; return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; }; }
function exact(entities, x, y, radius) { return entities.filter(e => e.health > 0 && (e.x - x) ** 2 + (e.y - y) ** 2 < radius * radius); }
function closest(entities, x, y, radius) {
  let found = null, distance = radius * radius;
  for (const e of entities) { const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (e.health > 0 && d < distance) { found = e; distance = d; } }
  return found;
}

check('randomized broad-phase queries retain every exact neighbor in source order', () => {
  for (const seed of [0, 7, 2026, 91]) {
    const random = rng(seed), entities = Array.from({ length: 360 }, (_, id) => ({ id, x: (random() - .5) * 6000, y: (random() - .5) * 6000, health: random() < .2 ? 0 : 64 }));
    for (const size of [32, 128, 256, 500]) {
      const index = Q.build(entities, size);
      for (let i = 0; i < 100; i++) {
        const x = (random() - .5) * 6000, y = (random() - .5) * 6000, radius = i % 2 ? 32 : 340;
        const candidates = Q.query(index, x, y, radius);
        assert.deepEqual(exact(candidates, x, y, radius), exact(entities, x, y, radius));
        assert.equal(closest(candidates, x, y, radius), closest(entities, x, y, radius));
      }
    }
  }
});

check('cell edges, negative coordinates, ties, duplicates and live deaths preserve decisions', () => {
  const entities = [
    { id: 'first', x: 256, y: 0, health: 64 }, { id: 'equal', x: -256, y: 0, health: 64 },
    { id: 'negative', x: -256.00001, y: -.00001, health: 64 }, { id: 'zero', x: 0, y: 0, health: 0 },
    { id: 'below', x: 0, y: -256, health: 64 }, { id: 'above', x: 0, y: 256, health: 64 }
  ];
  entities.push(entities[0]); const index = Q.build(entities);
  assert.equal(closest(Q.query(index, 0, 0, 340), 0, 0, 340), entities[0]);
  for (const x of [-256.00001, -256, -.00001, 0, 256]) for (const radius of [0, .00002, 32, 256, 340]) {
    assert.deepEqual(exact(Q.query(index, x, 0, radius), x, 0, radius), exact(entities, x, 0, radius));
  }
  entities[0].health = 0;
  assert.equal(closest(Q.query(index, 0, 0, 340), 0, 0, 340), entities[1]);
  entities[1].x = 1000;
  assert.equal(closest(Q.query(Q.build(entities), 0, 0, 340), 0, 0, 340), entities[4], 'rebuild reflects movement');
});

check('unusual ranges fall back to the original bounded candidate set', () => {
  const entities = [{ x: 0, y: 0, health: 1 }, { x: 10, y: 20, health: 1 }], index = Q.build(entities);
  for (const [x, y, radius] of [[NaN, 0, 10], [0, Infinity, 10], [0, 0, Infinity], [0, 0, -1], [1e300, 0, 32], [0, 0, 1e12]]) assert.deepEqual(Q.query(index, x, y, radius), entities);
  assert.deepEqual(Q.query(Q.build([{ x: Infinity, y: 0 }]), 0, 0, 32), [{ x: Infinity, y: 0 }]);
  assert.deepEqual(Q.query(Q.build([]), 0, 0, 340), []);
});

function fixture(seed, zombies = 128, humans = 32) {
  const state = E.create(seed, 'standard', 'rescue'), random = rng(seed), template = state.zombies[0];
  state.tiles.fill(0); state.buildings = []; state.containers = []; state.structures = []; state.vehicles = [];
  state.player.x = 1024; state.player.y = 1024; state.player.invulnerable = 100;
  // A wall with a gap exercises exact LOS and movement after broad-phase filtering.
  for (let y = 5; y < 58; y++) if (y < 28 || y > 35) state.tiles[y * state.width + 34] = 3;
  state.zombies = Array.from({ length: zombies }, (_, id) => ({ ...template, id: id + 1, x: 240 + random() * 1500, y: 240 + random() * 1500, _path: [], health: id % 11 ? 64 : 0 }));
  state.humans = Array.from({ length: humans }, (_, id) => ({ id: 'fixture:' + id, x: 240 + random() * 1500, y: 240 + random() * 1500, health: id % 13 ? 100 : 0, faction: id % 3 ? 'survivor' : 'raider', name: 'Survivor ' + id, following: id % 7 === 0, weapon: id % 2 ? 'bat' : 'pistol', angle: 0, cooldown: 0 }));
  state._nextZombieId = zombies + 1;
  return state;
}

check('full simulation stays byte-identical to brute force through movement, combat and deaths', () => {
  for (const seed of [0, 7, 2026]) {
    const a = fixture(seed), b = fixture(seed);
    for (let tick = 0; tick < 90; tick++) {
      const input = { moveX: tick < 30 ? .4 : 0, moveY: tick > 60 ? -.4 : 0 };
      E.update(a, 1 / 60, input);
      try { delete S.Spatial; E.update(b, 1 / 60, input); } finally { S.Spatial = Q; }
      assert.equal(E.serialize(a), E.serialize(b), 'seed ' + seed + ', tick ' + tick);
    }
  }
  const a = fixture(55, 360, 128), b = fixture(55, 360, 128);
  for (let tick = 0; tick < 12; tick++) {
    E.update(a, 1 / 60, {});
    try { delete S.Spatial; E.update(b, 1 / 60, {}); } finally { S.Spatial = Q; }
  }
  assert.equal(E.serialize(a), E.serialize(b), 'maximum crowd differs');
});

check('distributed-crowd fixture reduces exact candidate work without claiming an FPS result', () => {
  const random = rng(91), zombies = Array.from({ length: 360 }, (_, id) => ({ id, x: random() * 6144, y: random() * 6144, health: 64 }));
  const index = Q.build(zombies); let candidates = 0;
  for (let i = 0; i < 128; i++) {
    const x = random() * 6144, y = random() * 6144, selected = Q.query(index, x, y, 340);
    candidates += selected.length;
    assert.equal(closest(selected, x, y, 340), closest(zombies, x, y, 340));
  }
  const brute = 360 * 128;
  assert(candidates < brute * .1, candidates + ' candidates vs ' + brute + ' brute-force candidates');
  console.log('  distributed fixture: ' + candidates + ' candidates vs ' + brute + ' full-scan candidates');
  const dense = Array.from({ length: 360 }, (_, id) => ({ id, x: 100, y: 100, health: 64 }));
  assert.deepEqual(Q.query(Q.build(dense), 100, 100, 340), dense, 'dense crowds must not discard actors for speed');
});

console.log(passed + ' spatial-query checks passed.');
