'use strict';
const assert = require('node:assert/strict');
global.window = { devicePixelRatio: 2 };
for (const module of ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine', 'performance', 'firstperson', 'renderer']) require('../src/' + module + '.js');
const S = window.Sirens, P = S.Performance;
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function feed(controller, ms, seconds) { for (let i = 0; i < Math.ceil(seconds * 1000 / ms); i++) P.sample(controller, ms, true); }

check('auto needs sustained slow play and lowers one level at a time', () => {
  const c = P.create();
  feed(c, 16, 2); P.sample(c, 100, true); feed(c, 16, 2);
  assert.equal(c.level, 'high', 'one slow frame must not lower quality');
  feed(c, 34, 2.2); assert.equal(c.level, 'balanced');
  feed(c, 34, 2); assert.equal(c.level, 'balanced', 'cooldown must prevent back-to-back changes');
  feed(c, 34, 3.2); assert.equal(c.level, 'low');
  feed(c, 50, 60); assert.equal(c.level, 'low');
  assert(c.frames.length <= 240);
  const overloaded = P.create(); feed(overloaded, 400, 12);
  assert.notEqual(overloaded.level, 'high', 'very slow active devices still need a downgrade');
});

check('recovery requires a long stable interval and avoids oscillation', () => {
  const c = P.create('low'); P.setMode(c, 'auto');
  feed(c, 16, 9); assert.equal(c.level, 'low');
  feed(c, 16, 2.2); assert.equal(c.level, 'balanced');
  feed(c, 16, 5); assert.equal(c.level, 'balanced');
  feed(c, 16, 8.4); assert.equal(c.level, 'high');
  for (let n = 0; n < 5; n++) { feed(c, 16, 1.1); feed(c, 30, .8); }
  assert.equal(c.level, 'high', 'mixed marginal work must not repeatedly change quality');
});

check('hidden, paused, invalid and resumed frames do not become load samples', () => {
  const c = P.create(); feed(c, 34, 2.1);
  P.sample(c, 34, false); feed(c, 34, .8); assert.equal(c.level, 'high');
  for (const value of [NaN, Infinity, -2, 0, '30', 1000]) {
    P.sample(c, value, true); assert.equal(P.status(c).samples, 0); assert.equal(c.frames.length, 0);
  }
  feed(c, 34, .9); assert.equal(c.level, 'high');
  feed(c, 16, 5); assert.equal(c.level, 'high');
});

check('manual settings stay fixed and returning to auto preserves the chosen level', () => {
  for (const level of ['high', 'balanced', 'low']) {
    const c = P.create(level); feed(c, 50, 30); feed(c, 10, 30);
    assert.equal(c.level, level); assert.equal(P.status(c).mode, level);
    P.setMode(c, 'auto'); assert.equal(c.level, level);
  }
  const c = P.create('__proto__'); assert.equal(c.mode, 'auto');
  assert.equal(P.profile('__proto__').scale, 1);
  const snapshot = P.status(c); snapshot.level = 'low'; assert.equal(c.level, 'high');
  feed(c, 1, 2.5); assert(c.frames.length <= 240);
});

function stubCanvas(width = 800, height = 450) {
  const ctx = { createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData() {}, createRadialGradient: () => ({ addColorStop() {} }) };
  return { width: 0, height: 0, getContext: () => ctx, getBoundingClientRect: () => ({ left: 24, top: 12, width, height }) };
}
global.document = { createElement: () => stubCanvas() };

check('quality changes backing pixels without moving the camera, input or CSS dimensions', () => {
  const r = Object.create(S.Renderer.prototype), canvas = stubCanvas();
  Object.assign(r, { canvas, ctx: canvas.getContext('2d'), minimap: null, quality: 'high', qualityScale: 1, camera: { x: 600, y: 700, ready: true }, zoom: 1.3 });
  const state = Object.freeze({ player: Object.freeze({ x: 600, y: 700 }), tileSize: 32 });
  r.resize(); const before = r.screenToWorld(220, 120, state), fullPixels = canvas.width * canvas.height;
  for (const level of ['balanced', 'low', 'high']) {
    r.setQuality(level);
    assert.deepEqual(r.screenToWorld(220, 120, state), before);
    assert.equal(r.width, 800); assert.equal(r.height, 450); assert.equal(r.zoom, 1.3);
    assert(canvas.width * canvas.height <= fullPixels);
    if (level === 'low') assert(canvas.width * canvas.height < fullPixels * .37);
  }
  window.devicePixelRatio = 1; r.setQuality('low'); assert.equal(r.dpr, .6);
  window.devicePixelRatio = Infinity; r.resize(); assert(Number.isFinite(r.dpr));
  window.devicePixelRatio = 2;
});

check('first-person quality preserves the field of view, walls and serialized world', () => {
  const state = S.Engine.create(0, 'calm', 'rescue');
  state.tiles.fill(0); state.buildings = []; state.zombies = []; state.humans = []; state.containers = []; state.vehicles = []; state.structures = [];
  state.player.x = 336; state.player.y = 336;
  for (let y = 0; y < state.height; y++) state.tiles[y * state.width + 15] = 3;
  const before = S.Engine.serialize(state), view = new S.FirstPerson.View();
  const options = { width: 1000, height: 600, yaw: 0, clock: 0, delta: 1 / 60, motion: false, themes: new Map(), originX: 0, originY: 0, items: S.Engine.items };
  let plane, highPixels;
  for (const level of ['high', 'balanced', 'low']) {
    view.render(state, { ...options, qualityScale: P.profile(level).scale });
    const center = Math.floor(view.w / 2);
    assert(Math.abs(view.zcol[center] - 4.5) < .00001, 'wall depth changed');
    if (level === 'high') { plane = view.plane; highPixels = view.w * view.h; }
    else { assert.equal(view.plane, plane); assert(view.w * view.h < highPixels); }
    if (level === 'low') assert(view.w * view.h <= highPixels * .37);
    assert.equal(S.Engine.serialize(state), before, 'presentation mutated the save or RNG');
  }
  for (const [width, height] of [[390, 844], [844, 390], [1440, 300], [3840, 2160]]) {
    view.ensureSize(width, height, .6);
    assert(Math.abs(view.w / view.h - width / height) / (width / height) < .03);
    assert(view.w <= 768 && view.h <= 432 && view.w > 0 && view.h > 0);
  }
});

console.log(passed + ' adaptive presentation checks passed.');
