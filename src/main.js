(function () {
  'use strict';
  const S = window.Sirens;
  const canvas = document.getElementById('world');
  const minimap = document.getElementById('minimap');
  const mapShell = document.getElementById('map-shell');
  const debug = document.getElementById('debug');
  const renderer = new S.Renderer(canvas, minimap);
  const SAVE_KEY = 'after-the-sirens-save-v1';
  let state = S.Engine.create(20260929, 'standard', 'openworld');
  let active = false;
  let debugOn = false;
  let screen = 'title';
  let hasWarnedStorage = false;
  let lastFrame = performance.now();
  let accumulator = 0;
  let autoSaveTime = 0;
  let uiTime = 0;
  let frameDurations = [];
  let frameInfo = { fps: 60, frameMs: 16.7, p95: 16.7, showDebug: false, mouseX: 0, mouseY: 0 };
  const keys = new Set();
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, down: false, shoot: false, used: false };

  function unlockAudio() { S.Effects.audio.unlock(); }

  function clearInput() { keys.clear(); pointer.down = false; pointer.shoot = false; }

  function setScreen(name) {
    screen = name;
    ui.showScreen(name);
    mapShell.hidden = name === 'title';
  }

  function toast(text, toneName) { ui.toast(text, toneName || 'info'); }

  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (_) { return false; }
  }

  function save(silent) {
    if (!active && screen === 'title') return false;
    try {
      localStorage.setItem(SAVE_KEY, S.Engine.serialize(state));
      if (!silent) toast('Run saved on this browser.', 'success');
      return true;
    } catch (_) {
      if (!silent || !hasWarnedStorage) toast('Local save unavailable. Export your save from the pause menu.', 'warning');
      hasWarnedStorage = true;
      return false;
    }
  }

  function begin(seed, difficulty, mode) {
    let parsed = Number(seed);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) parsed = Date.now() % 2147483647;
    state = S.Engine.create(parsed, difficulty || 'standard', mode === 'rescue' ? 'rescue' : 'openworld');
    active = true;
    accumulator = 0;
    autoSaveTime = 0;
    clearInput();
    unlockAudio();
    setScreen('playing');
    ui.update(state, frameInfo);
    S.Effects.emit(state, 'ready');
  }

  function continueRun() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) { toast('No local save found. Start a new run.', 'warning'); return; }
      state = S.Engine.deserialize(data);
      active = true;
      accumulator = 0;
      clearInput();
      unlockAudio();
      setScreen(state.ended ? (state.player.health > 0 && state.won ? 'won' : 'dead') : 'playing');
      ui.update(state, frameInfo);
      toast('Run restored.', 'success');
    } catch (error) { toast('Could not load that save: ' + error.message, 'warning'); }
  }

  function pause() {
    if (!active || state.ended || screen !== 'playing') return;
    clearInput();
    save(true);
    setScreen('paused');
  }

  function resume() {
    if (!active || state.ended) return;
    clearInput();
    accumulator = 0;
    setScreen('playing');
    unlockAudio();
  }

  function applyAction(name) {
    if (!active || state.ended) return;
    const result = S.Engine.action(state, name);
    if (state.conversation) clearInput();
    if (result && name !== 'reload') S.Effects.emit(state, 'ui');
    ui.update(state, frameInfo);
  }

  function exportSave() {
    if (!active) { toast('Start a run first.', 'warning'); return; }
    const blob = new Blob([S.Engine.serialize(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'after-the-sirens-day-' + state.day + '.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast('Save exported.', 'success');
  }

  async function importSave(file) {
    if (!file) return;
    try {
      if (file.size > 32 * 1024 * 1024) throw new Error('Save file is too large.');
      const loaded = S.Engine.deserialize(await file.text());
      state = loaded;
      active = true;
      accumulator = 0;
      clearInput();
      setScreen(state.ended ? (state.player.health > 0 && state.won ? 'won' : 'dead') : 'playing');
      ui.update(state, frameInfo);
      save(true);
      unlockAudio();
      toast('Save imported.', 'success');
    } catch (error) { toast('Could not import that save: ' + error.message, 'warning'); }
  }

  const ui = new S.UI(document.getElementById('ui'), {
    start: begin,
    continue: continueRun,
    hasSave: hasSave,
    pause: pause,
    resume: resume,
    title: function () { clearInput(); active = false; setScreen('title'); },
    restart: function () { begin(state.seed, state.difficulty || 'standard', state.mode || 'openworld'); },
    save: function () { save(false); },
    exportSave: exportSave,
    importSave: importSave,
    action: applyAction,
    useItem: function (id) { applyAction('use:' + id); },
    equipItem: function (id) { applyAction('equip:' + id); },
    dropItem: function (id) { applyAction('drop:' + id); },
    craft: function (id) { if (active && !state.ended) { S.Engine.craft(state, id); ui.update(state, frameInfo); } },
    build: function (type) { if (active && !state.ended) { S.Engine.build(state, type); ui.update(state, frameInfo); } },
    setSound: function (on) { S.Effects.audio.setEnabled(on); if (on) unlockAudio(); },
    setDebug: function (on) { debugOn = !!on; debug.hidden = !debugOn; }
  });
  setScreen('title');
  ui.update(state, frameInfo);

  const controlledKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyC', 'KeyE', 'KeyI', 'KeyF', 'KeyR', 'KeyB', 'KeyV', 'KeyG', 'PageUp', 'PageDown', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Escape']);

  addEventListener('keydown', function (event) {
    const editing = event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
    const buttonActivation = event.target && /^(BUTTON|SUMMARY)$/.test(event.target.tagName) && (event.code === 'Space' || event.code === 'Enter');
    if (buttonActivation) return;
    if (editing && event.code !== 'Escape') return;
    if (controlledKeys.has(event.code)) event.preventDefault();
    if (event.repeat) return;
    if (event.code === 'Escape') {
      if (state.conversation) applyAction('closeConversation');
      else if (screen === 'paused') resume();
      else if (active && screen === 'playing') {
        if (ui.isBlocking()) ui.toggleInventory();
        else pause();
      }
      return;
    }
    if (event.code === 'KeyI' && active && screen === 'playing' && !state.ended) {
      clearInput(); ui.toggleInventory(); ui.update(state, frameInfo); return;
    }
    if (!active || ui.isBlocking() || state.ended) return;
    keys.add(event.code);
    unlockAudio();
    if (event.code === 'KeyE') {
      S.Engine.interact(state);
      if (state.conversation) clearInput();
      ui.update(state, frameInfo);
    } else if (event.code === 'Digit1') applyAction('eat');
    else if (event.code === 'Digit2') applyAction('drink');
    else if (event.code === 'Digit3') applyAction('bandage');
    else if (event.code === 'Digit4' || event.code === 'KeyR') applyAction('reload');
    else if (event.code === 'KeyF') applyAction('switchWeapon');
    else if (event.code === 'KeyV') applyAction('vehicle');
    else if (event.code === 'KeyG') applyAction('refuel');
    else if (event.code === 'PageUp') applyAction('stairsUp');
    else if (event.code === 'PageDown') applyAction('stairsDown');
    else if (event.code === 'KeyB') { S.Engine.build(state, 'barricade'); ui.update(state, frameInfo); }
  });
  addEventListener('keyup', function (event) { keys.delete(event.code); });
  addEventListener('blur', function () { clearInput(); if (active && screen === 'playing') pause(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clearInput(); pause(); } });
  canvas.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  canvas.addEventListener('pointermove', function (event) { pointer.x = event.clientX; pointer.y = event.clientY; pointer.used = true; });
  canvas.addEventListener('pointerdown', function (event) {
    if (!active || ui.isBlocking()) return;
    event.preventDefault();
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.used = true;
    if (event.button === 0) pointer.down = true;
    if (event.button === 2) pointer.shoot = true;
    unlockAudio();
    try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
  });
  addEventListener('pointerup', function (event) {
    if (event.button === 0) pointer.down = false;
    if (event.button === 2) pointer.shoot = false;
  });
  canvas.addEventListener('pointercancel', clearInput);

  function inputSnapshot() {
    const moveX = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
    const moveY = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
    const aim = pointer.used ? renderer.screenToWorld(pointer.x, pointer.y, state) : {
      x: state.player.x + Math.cos(state.player.angle || 0) * 100,
      y: state.player.y + Math.sin(state.player.angle || 0) * 100
    };
    return { moveX: moveX, moveY: moveY, sprint: keys.has('ShiftLeft') || keys.has('ShiftRight'), sneak: keys.has('KeyC'),
      aimX: aim.x, aimY: aim.y, attack: pointer.down || keys.has('Space'), shoot: pointer.shoot };
  }

  let lastMetrics = performance.now();
  function frame(now) {
    const duration = Math.max(0, now - lastFrame);
    lastFrame = now;
    if (duration > 0 && duration < 1000) {
      frameDurations.push(duration);
      if (frameDurations.length > 180) frameDurations.shift();
    }
    if (now - lastMetrics > 600 && frameDurations.length) {
      const sorted = frameDurations.slice().sort(function (a, b) { return a - b; });
      const mean = frameDurations.reduce(function (a, b) { return a + b; }, 0) / frameDurations.length;
      frameInfo = { fps: Math.round(1000 / Math.max(1, mean)), frameMs: mean, p95: sorted[Math.floor((sorted.length - 1) * 0.95)],
        showDebug: debugOn, mouseX: pointer.x, mouseY: pointer.y };
      lastMetrics = now;
    }
    const elapsed = Math.min(0.1, duration / 1000);
    if (active && state.ended && screen === 'playing') {
      clearInput(); setScreen(state.player.health > 0 && state.won ? 'won' : 'dead'); save(true);
    }
    if (active && !ui.isBlocking() && !state.ended) {
      accumulator += elapsed;
      while (accumulator >= 1 / 60) {
        const oldHealth = state.player.health;
        S.Engine.update(state, 1 / 60, inputSnapshot());
        accumulator -= 1 / 60;
        if (state.player.health < oldHealth - 0.2) S.Effects.emit(state, 'hurt');
        if (state.ended) break;
      }
      autoSaveTime += elapsed;
      if (autoSaveTime >= 30) { save(true); autoSaveTime = 0; }
      if (state.ended) { clearInput(); setScreen(state.player.health > 0 && state.won ? 'won' : 'dead'); save(true); }
    } else accumulator = 0;
    S.Effects.audio.update(state, active && screen === 'playing' && !ui.isBlocking() && !state.ended && !document.hidden);
    renderer.draw(state, frameInfo);
    uiTime += elapsed;
    if (uiTime > 0.1 || state.ended) { ui.update(state, frameInfo); uiTime = 0; }
    debug.hidden = !debugOn || screen === 'title';
    if (!debug.hidden) debug.textContent = frameInfo.fps + ' FPS  |  ' + frameInfo.frameMs.toFixed(1) + ' ms avg  |  ' + frameInfo.p95.toFixed(1) + ' ms p95\n' +
      state.zombies.length + ' active zombies  |  ' + state.stats.aiUpdates + ' AI decisions  |  seed ' + state.seed +
      (state.world ? '\nSector ' + state.world.centerCX + ', ' + state.world.centerCY + '  |  ' + Object.keys(state.world.records).length + ' journaled sectors' : '');
    requestAnimationFrame(frame);
  }
  renderer.resize();
  requestAnimationFrame(frame);

  // Diagnostics surface for reproducible local playtesting.
  S.App = { getState: function () { return state; }, getMetrics: function () { return Object.assign({}, frameInfo); },
    getScreen: function () { return screen; }, getAudioMetrics: S.Effects.audio.metrics };
})();
