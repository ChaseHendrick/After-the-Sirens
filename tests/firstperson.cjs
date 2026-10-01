'use strict';
// First-person helpers: ray distances against known tiles, view-relative movement, forward aim,
// weapon view-model families and bounded outputs for hostile inputs. The view must not touch saves or the RNG.
const assert = require('node:assert/strict');
global.window = {};
for (const module of ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine', 'firstperson']) require('../src/' + module + '.js');
const S = window.Sirens, E = S.Engine, F = S.FirstPerson, T = 32;
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function near(actual, expected, tolerance, label) { assert(Math.abs(actual - expected) <= tolerance, `${label || 'value'}: ${actual} is not within ${tolerance} of ${expected}`); }
// An open field with the survivor at the centre of tile (10, 10).
function field() {
  const s = E.create(0, 'calm', 'rescue');
  s.tiles.fill(0); s.buildings = []; s.containers = []; s.zombies = []; s.humans = []; s.vehicles = []; s.structures = [];
  s.player.x = 10.5 * T; s.player.y = 10.5 * T; s.player.cooldown = 0; s.player.stamina = 100;
  return s;
}
function put(s, tx, ty, tile) { s.tiles[ty * s.width + tx] = tile; }
function finiteRay(r) { for (const key of ['distance', 'depth', 'tile', 'tx', 'ty', 'side', 'offset']) assert(Number.isFinite(r[key]), key + ' is not finite: ' + r[key]); assert(Array.isArray(r.frames)); }

check('rays measure the distance to walls in all four directions and on a diagonal', () => {
  const s = field();
  put(s, 15, 10, 3); put(s, 6, 10, 3); put(s, 10, 4, 3); put(s, 10, 13, 3); put(s, 14, 14, 3);
  const east = F.castRay(s, s.player.x, s.player.y, 0, 640);
  assert.equal(east.hit, true); assert.equal(east.tile, 3); assert.equal(east.tx, 15); assert.equal(east.ty, 10); assert.equal(east.side, 0);
  near(east.distance, 15 * T - s.player.x, 1e-9, 'east'); near(east.offset, .5, 1e-9, 'east face offset');
  near(F.castRay(s, s.player.x, s.player.y, Math.PI, 640).distance, s.player.x - 7 * T, 1e-9, 'west');
  near(F.castRay(s, s.player.x, s.player.y, -Math.PI / 2, 640).distance, s.player.y - 5 * T, 1e-9, 'north');
  const south = F.castRay(s, s.player.x, s.player.y, Math.PI / 2, 640);
  near(south.distance, 13 * T - s.player.y, 1e-9, 'south'); assert.equal(south.side, 1);
  const diagonal = F.castRay(s, s.player.x, s.player.y, Math.PI / 4, 640);
  assert.equal(diagonal.tx, 14); assert.equal(diagonal.ty, 14); near(diagonal.distance, Math.SQRT2 * 3.5 * T, 1e-6, 'diagonal');
});

check('depth is the distance projected on the view direction, which removes fisheye bowing', () => {
  const s = field();
  for (let y = 0; y < s.height; y++) put(s, 15, y, 3);
  const straight = F.castRay(s, s.player.x, s.player.y, 0, 640, 0), slanted = F.castRay(s, s.player.x, s.player.y, .5, 640, 0);
  assert(slanted.distance > straight.distance);
  near(slanted.depth, straight.depth, 1e-9, 'a flat wall has one depth across the view');
  near(slanted.depth, slanted.distance * Math.cos(.5), 1e-9, 'projected depth');
});

check('closed doors and windows stop rays; open doors and broken windows are see-through frames', () => {
  const s = field();
  put(s, 13, 10, 6); put(s, 16, 10, 3);
  const closed = F.castRay(s, s.player.x, s.player.y, 0, 640);
  assert.equal(closed.tile, 6); near(closed.distance, 13 * T - s.player.x, 1e-9, 'closed door');
  put(s, 13, 10, 7);
  const open = F.castRay(s, s.player.x, s.player.y, 0, 640);
  assert.equal(open.tile, 3); near(open.distance, 16 * T - s.player.x, 1e-9, 'through the doorway');
  assert.deepEqual(open.frames.map(f => [f.tile, f.tx]), [[7, 13]]); near(open.frames[0].distance, 13 * T - s.player.x, 1e-9, 'doorway frame');
  put(s, 13, 10, 8);
  assert.equal(F.castRay(s, s.player.x, s.player.y, 0, 640).tile, 8);
  put(s, 13, 10, 9); s._terrainHealth[10 * s.width + 13] = 0;
  const broken = F.castRay(s, s.player.x, s.player.y, 0, 640);
  assert.equal(broken.tile, 3); assert.deepEqual(broken.frames.map(f => f.tile), [9]);
});

check('trees and water are drawn as billboards and floor, so rays pass over them', () => {
  const s = field();
  put(s, 12, 10, 5); put(s, 13, 10, 4); put(s, 14, 10, 1); put(s, 15, 10, 2); put(s, 17, 10, 3);
  const r = F.castRay(s, s.player.x, s.player.y, 0, 640);
  assert.equal(r.tile, 3); assert.equal(r.tx, 17); assert.deepEqual(r.frames, []);
});

check('rays stop at their range and report the map edge as open air', () => {
  const s = field();
  const empty = F.castRay(s, s.player.x, s.player.y, 0, 5 * T);
  assert.equal(empty.hit, false); assert.equal(empty.distance, 5 * T);
  const edge = F.castRay(s, s.player.x, s.player.y, Math.PI, 64 * T);
  assert.equal(edge.hit, false); assert.equal(edge.tile, -1); near(edge.distance, s.player.x, 1e-9, 'edge distance');
});

check('hostile and missing inputs give bounded, finite results', () => {
  const s = field();
  for (const args of [[NaN, NaN, NaN, NaN], [Infinity, -Infinity, 1e308, 1e308], [-1e9, 1e9, -Infinity, -5], [s.player.x, s.player.y, 1e300, 'far'], [undefined, null, {}, []]]) finiteRay(F.castRay(s, ...args));
  for (const state of [null, undefined, {}, { tiles: [], width: 0, height: 0 }, { tiles: null, width: 'x', height: 3 }]) { const r = F.castRay(state, 1, 1, 0, 10); finiteRay(r); assert.equal(r.hit, false); }
  for (const yaw of [NaN, Infinity, -Infinity, 1e300, undefined]) for (const input of [{ forward: NaN, strafe: Infinity }, { forward: 1e9, strafe: -1e9 }, null, 'w']) {
    const move = F.viewInput(input, yaw); assert(Number.isFinite(move.moveX) && Number.isFinite(move.moveY)); assert(Math.hypot(move.moveX, move.moveY) <= 1 + 1e-12);
  }
  const point = F.aim({ x: NaN, y: Infinity }, NaN, NaN); assert(Number.isFinite(point.x) && Number.isFinite(point.y));
  for (const time of [NaN, -Infinity, 1e12, -7]) { const sky = F.sky(time, null); for (const key of ['night', 'bright', 'fogStart', 'fogEnd', 'top', 'low', 'fog']) assert(Number.isFinite(sky[key]), key); }
  for (const angle of [NaN, Infinity, 1e300, -1e300, 7, -7]) { const a = F.wrap(angle); assert(a > -Math.PI - 1e-12 && a <= Math.PI + 1e-12); }
});

check('view-relative input turns forward and strafe into world movement for any yaw', () => {
  const cases = [[0, [1, 0], [0, 1]], [Math.PI / 2, [0, 1], [-1, 0]], [Math.PI, [-1, 0], [0, -1]], [-Math.PI / 2, [0, -1], [1, 0]], [Math.PI / 4, [Math.SQRT1_2, Math.SQRT1_2], [-Math.SQRT1_2, Math.SQRT1_2]]];
  for (const [yaw, forward, right] of cases) {
    const f = F.viewInput({ forward: 1 }, yaw), r = F.viewInput({ strafe: 1 }, yaw), back = F.viewInput({ forward: -1 }, yaw);
    near(f.moveX, forward[0], 1e-12, 'forward x'); near(f.moveY, forward[1], 1e-12, 'forward y');
    near(r.moveX, right[0], 1e-12, 'strafe x'); near(r.moveY, right[1], 1e-12, 'strafe y');
    near(back.moveX, -forward[0], 1e-12, 'back x'); near(back.moveY, -forward[1], 1e-12, 'back y');
  }
  const both = F.viewInput({ forward: 1, strafe: 1 }, .3);
  near(Math.hypot(both.moveX, both.moveY), 1, 1e-12, 'diagonal input stays on the unit circle');
  near(Math.atan2(both.moveY, both.moveX), .3 + Math.PI / 4, 1e-12, 'diagonal direction');
});

check('walking forward moves the survivor along the yaw through the ordinary engine update', () => {
  const s = field(), yaw = 2.2, start = { x: s.player.x, y: s.player.y };
  for (let i = 0; i < 30; i++) E.update(s, 1 / 60, Object.assign(F.viewInput({ forward: 1 }, yaw), (({ x, y }) => ({ aimX: x, aimY: y }))(F.aim(s.player, yaw, 100))));
  const dx = s.player.x - start.x, dy = s.player.y - start.y;
  assert(Math.hypot(dx, dy) > 30, 'survivor did not move');
  near(Math.atan2(dy, dx), yaw, 1e-6, 'walk direction'); near(s.player.angle, yaw, 1e-6, 'facing');
});

check('a forward attack hits the zombie ahead and never the one behind', () => {
  const s = field();
  s.zombies.push({ id: 'ahead', x: s.player.x + 40, y: s.player.y, health: 60, state: 'wander', angle: 0, windup: 0, _path: [], _stun: 0 });
  s.zombies.push({ id: 'behind', x: s.player.x - 40, y: s.player.y, health: 60, state: 'wander', angle: 0, windup: 0, _path: [], _stun: 0 });
  const aim = F.aim(s.player, 0, 100);
  assert(E.attack(s, aim.x, aim.y, 'melee'));
  assert(s.zombies.find(z => z.id === 'ahead').health < 60, 'the zombie ahead was not hit');
  assert.equal(s.zombies.find(z => z.id === 'behind').health, 60, 'the zombie behind was hit');
  assert.equal(S.Effects.pose(s).attack.kind, 'melee');
});

check('weapon view models follow the same families as the top-down attack poses', () => {
  const items = S.Catalog.items, expected = { bat: 'club', crowbar: 'club', fire_axe: 'axe', hatchet: 'axe', pickaxe: 'pick', iron_pick: 'pick', sledgehammer: 'hammer', spear: 'spear', kitchen_knife: 'knife', machete: 'blade', pistol: 'pistol', revolver: 'pistol', hunting_rifle: 'rifle', shotgun: 'rifle', crossbow: 'rifle', hunting_bow: 'bow', not_an_item: 'club' };
  for (const [id, style] of Object.entries(expected)) assert.equal(F.weaponStyle(id, items), style, id);
  assert.equal(F.weaponStyle(undefined, items), 'club'); assert.equal(F.weaponStyle('__proto__', items), 'club');
});

check('night and rain darken and thicken the haze without making the view unreadable', () => {
  const noon = F.sky(12, 'clear'), night = F.sky(23, 'clear'), rain = F.sky(12, 'rain');
  assert(night.bright < noon.bright && night.bright >= .6, 'night should darken moderately');
  assert(rain.fogEnd < noon.fogEnd && rain.bright < noon.bright);
});

check('the view helpers leave the save and the simulation RNG untouched', () => {
  const s = field(); put(s, 15, 10, 3);
  const before = E.serialize(s), rng = s._rng;
  for (let a = 0; a < 64; a++) F.castRay(s, s.player.x, s.player.y, a / 10, 640, a / 11);
  F.viewInput({ forward: 1, strafe: -1 }, 1); F.aim(s.player, 1, 100); F.sky(s.time, s.weather);
  assert.equal(E.serialize(s), before); assert.equal(s._rng, rng);
});


// The renderer itself, on a stub canvas: these checks count work and pixels instead of timing frames.
function stubCanvas() { return { width: 0, height: 0, getContext() { return { createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} }; } }; }
global.document = global.document || { createElement: () => stubCanvas() };
function frameOptions(yaw, width, height) { return { width: width || 1440, height: height || 900, yaw, clock: 0, delta: 1 / 60, motion: false, themes: null, originX: 0, originY: 0, pose: null, look: null, items: S.Catalog.items }; }

check('very short and very tall views keep the screen aspect instead of stretching the buffer', () => {
  const v = new F.View();
  for (const [w, h] of [[568, 212], [1024, 260], [320, 240], [1440, 900], [390, 1600], [3840, 2160]]) {
    v.ensureSize(w, h); const ratio = v.w / v.h, want = w / h;
    assert(Math.abs(ratio - want) / want < .03, `${w}x${h} buffer ${v.w}x${v.h} has aspect ${ratio.toFixed(3)}, screen ${want.toFixed(3)}`);
    assert(v.w <= 1280 && v.h <= 720 && v.h >= 120 || v.w === 1280, `${w}x${h} buffer ${v.w}x${v.h} is out of bounds`);
  }
});

check('a swarm pressed against the eye costs a bounded number of sprite pixel visits', () => {
  const s = field(), v = new F.View(), template = { health: 64, state: 'chase', angle: Math.PI, windup: 0, _stun: 0, _path: [] };
  // Eighty dead within about a tile, spread across the view straight ahead (yaw 0 looks along +x).
  for (let i = 0; i < 80; i++) { const d = .65 + (i % 10) * .06, a = ((i * .618) % 1 - .5) * 1.2; s.zombies.push(Object.assign({ id: 'swarm-' + i, x: s.player.x + Math.cos(a) * d * T, y: s.player.y + Math.sin(a) * d * T }, template)); }
  v.render(s, frameOptions(0)); const info = v.describe(1440), pixels = info.width * info.height;
  assert(info.visible.some(e => e.kind === 'zombie'), 'no zombie was drawn');
  console.log('  swarm visits ' + info.visits + ' = ' + (info.visits / pixels).toFixed(2) + ' buffers');
  assert(info.visits < 6 * pixels, 'sprite pixel visits ' + info.visits + ' exceed six buffers of ' + pixels);
});

check('health bars and markers never paint over a nearer wall below its top', () => {
  const v = new F.View(); v.ensureSize(1440, 900); const W = v.w;
  v.out.fill(0); v.zpix.fill(Infinity); v.zcol.fill(Infinity); v.topRow.fill(0);
  v.zcol[100] = 2; v.topRow[100] = 150;
  v.plot(200 * W + 100, 0xff0000, 5, 256, 0, 0, 0); assert.equal(v.out[200 * W + 100], 0, 'a bar behind the wall painted over it');
  v.plot(100 * W + 100, 0xff0000, 5, 256, 0, 0, 0); assert.notEqual(v.out[100 * W + 100], 0, 'a bar above the wall top was clipped');
  v.plot(200 * W + 101, 0xff0000, 5, 256, 0, 0, 0); assert.notEqual(v.out[200 * W + 101], 0, 'a bar in an open column was clipped');
  v.plot(200 * W + 100, 0xff0000, 1.5, 256, 0, 0, 0); assert.notEqual(v.out[200 * W + 100], 0, 'a bar nearer than the wall was clipped');
});

console.log(passed + ' first-person checks passed.');
