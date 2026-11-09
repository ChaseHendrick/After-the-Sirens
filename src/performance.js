(function () {
  'use strict';
  // Presentation only. Timing never changes world simulation, input or random streams.
  const S = window.Sirens = window.Sirens || {};
  const LEVELS = ['low', 'balanced', 'high'];
  const PROFILES = Object.freeze({ low: Object.freeze({ scale: .6 }), balanced: Object.freeze({ scale: .8 }), high: Object.freeze({ scale: 1 }) });
  const MODES = ['auto', 'high', 'balanced', 'low'];
  const WINDOW_MS = 1000, WARMUP_MS = 1000, COOLDOWN_MS = 3000;
  function mode(value) { return MODES.includes(value) ? value : 'auto'; }
  function profile(level) { return Object.hasOwn(PROFILES, level) ? PROFILES[level] : PROFILES.high; }
  function reset(controller) {
    controller.frames = []; controller.windowMs = 0; controller.warmupMs = WARMUP_MS;
    controller.slow = 0; controller.fast = 0; controller.mean = 0; controller.p95 = 0; controller.samples = 0;
    return controller.level;
  }
  function create(value) {
    const selected = mode(value), controller = { mode: selected, level: selected === 'auto' ? 'high' : selected };
    reset(controller); return controller;
  }
  function setMode(controller, value) {
    const selected = mode(value);
    if (selected === controller.mode) return controller.level;
    controller.mode = selected;
    // Auto keeps the current level and earns its way upward using fresh samples.
    if (selected !== 'auto') controller.level = selected;
    return reset(controller);
  }
  function sample(controller, frameMs, eligible) {
    if (eligible === false) return reset(controller);
    // A resumed tab or a stopped debugger is not evidence of sustained rendering load.
    if (!Number.isFinite(frameMs) || frameMs <= 0 || frameMs >= 1000) return reset(controller);
    // Very slow active frames still count, without letting one stall dominate a window.
    frameMs = Math.min(frameMs, 250);
    if (controller.mode !== 'auto') return controller.level;
    if (controller.warmupMs > 0) { controller.warmupMs = Math.max(0, controller.warmupMs - frameMs); return controller.level; }
    controller.windowMs += frameMs;
    controller.frames.push(frameMs);
    // Keep observations bounded even on displays faster than 240 Hz.
    if (controller.frames.length > 240) controller.frames.shift();
    if (controller.windowMs < WINDOW_MS || controller.frames.length < 8) return controller.level;
    const sorted = controller.frames.slice().sort((a, b) => a - b);
    controller.samples = sorted.length;
    controller.mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    controller.p95 = sorted[Math.floor((sorted.length - 1) * .95)];
    const slow = controller.mean > 24 || controller.p95 > 40;
    const fast = controller.mean < 18 && controller.p95 < 23;
    controller.slow = slow ? controller.slow + 1 : 0;
    controller.fast = fast ? controller.fast + 1 : 0;
    controller.frames = []; controller.windowMs = 0;
    let index = LEVELS.indexOf(controller.level);
    if (controller.slow >= 2 && index > 0) index--;
    else if (controller.fast >= 10 && index < LEVELS.length - 1) index++;
    if (LEVELS[index] !== controller.level) {
      controller.level = LEVELS[index]; controller.slow = 0; controller.fast = 0;
      controller.warmupMs = COOLDOWN_MS;
    }
    // At either bound no further history is needed; a later reversal starts fresh.
    controller.slow = Math.min(controller.slow, 2); controller.fast = Math.min(controller.fast, 10);
    return controller.level;
  }
  function status(controller) {
    return { mode: controller.mode, level: controller.level, samples: controller.samples, mean: controller.mean, p95: controller.p95 };
  }
  S.Performance = Object.freeze({ create, setMode, sample, reset, status, profile });
})();
