(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const INPUTS = 6, HIDDEN = 8, LIMIT = 4;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function random(seed) { let n = seed >>> 0; return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; }; }
  function features(values) { return Array.from({ length: INPUTS }, (_, i) => clamp(Number.isFinite(values && values[i]) ? values[i] : 0, -1, 1)); }
  function create(seed) {
    const rng = random((seed >>> 0) ^ 0x7348be21);
    return { weights: Array.from({ length: INPUTS * HIDDEN + HIDDEN + HIDDEN + 1 }, () => (rng() - .5) * .6), samples: 0, feedback: 0, loss: 0, seed: seed >>> 0 };
  }
  function forward(model, values) {
    const x = features(values), w = model.weights, h = [];
    for (let j = 0; j < HIDDEN; j++) { let n = w[48 + j]; for (let i = 0; i < INPUTS; i++) n += x[i] * w[j * INPUTS + i]; h[j] = Math.tanh(n); }
    let n = w[64]; for (let j = 0; j < HIDDEN; j++) n += h[j] * w[56 + j];
    return { x, h, score: Math.tanh(n) };
  }
  function predict(model, values) { return forward(model, values).score; }
  function learn(model, values, target, rate) {
    const f = forward(model, values), w = model.weights, y = clamp(Number.isFinite(target) ? target : 0, -1, 1), error = f.score - y;
    const delta = error * (1 - f.score * f.score), step = clamp(Number.isFinite(rate) ? rate : .035, .001, .08), oldOutput = w.slice(56, 64);
    for (let j = 0; j < HIDDEN; j++) {
      w[56 + j] = clamp(w[56 + j] - step * delta * f.h[j], -LIMIT, LIMIT);
      const gradient = delta * oldOutput[j] * (1 - f.h[j] * f.h[j]);
      for (let i = 0; i < INPUTS; i++) w[j * INPUTS + i] = clamp(w[j * INPUTS + i] - step * gradient * f.x[i], -LIMIT, LIMIT);
      w[48 + j] = clamp(w[48 + j] - step * gradient, -LIMIT, LIMIT);
    }
    w[64] = clamp(w[64] - step * delta, -LIMIT, LIMIT); model.samples = Math.min(100000000, model.samples + 1); model.loss = model.samples === 1 ? error * error : model.loss * .98 + error * error * .02;
    return error * error;
  }
  function teacher(x) { return Math.tanh(x[2] * .9 + x[3] * (1.25 + .55 * x[5]) + x[1] * .55 - x[0] * 3 - .15 * (1 - x[4]) * x[5]); }
  function prepare(seed) {
    const model = create(seed), rng = random((seed >>> 0) ^ 0x173bad52);
    for (let n = 0; n < 3072; n++) { const x = [rng() < .25 ? 1 : 0, rng(), rng() * 2 - 1, rng() * 2 - 1, rng(), rng()]; learn(model, x, teacher(x), .045); }
    return model;
  }
  function summary(model) { return model ? { architecture: '6 → 8 → 1', parameters: 65, samples: model.samples, feedback: model.feedback, loss: model.loss, weights: model.weights.slice(0, 48) } : null; }
  S.Neural = Object.freeze({ create, prepare, predict, learn, teacher, summary, features });
})();
