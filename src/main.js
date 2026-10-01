(function () {
  'use strict';
  const S = window.Sirens;
  const canvas = document.getElementById('world');
  const minimap = document.getElementById('minimap');
  const mapShell = document.getElementById('map-shell');
  const debug = document.getElementById('debug');
  const renderer = new S.Renderer(canvas, minimap);
  const SAVE_KEY = 'after-the-sirens-save-v1';
  const OPTIONS_KEY = 'after-the-sirens-options-v1';
  const preferences = { sound: true, volume: .7, music: true, musicVolume: .35, effects: true, effectsVolume: 1, ambience: true, ambienceVolume: .7, zoom: 1, motion: !window.matchMedia('(prefers-reduced-motion: reduce)').matches, details: false };
  try {
    const saved = JSON.parse(localStorage.getItem(OPTIONS_KEY) || 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      for (const key of ['sound', 'music', 'effects', 'ambience', 'motion', 'details']) if (typeof saved[key] === 'boolean') preferences[key] = saved[key];
      for (const key of ['volume', 'musicVolume', 'effectsVolume', 'ambienceVolume']) if (typeof saved[key] === 'number' && Number.isFinite(saved[key])) preferences[key] = Math.max(0, Math.min(1, saved[key]));
      if (typeof saved.zoom === 'number' && Number.isFinite(saved.zoom)) preferences.zoom = Math.max(.7, Math.min(1.5, saved.zoom));
    }
  } catch (_) {}
  function rememberOptions() { try { localStorage.setItem(OPTIONS_KEY, JSON.stringify(preferences)); } catch (_) {} }
  renderer.zoom = preferences.zoom; renderer.ambientMotion = preferences.motion;
  S.Effects.audio.setVolume(preferences.volume); S.Effects.audio.setEnabled(preferences.sound);
  for (const channel of ['music', 'effects', 'ambience']) S.Effects.audio.setChannel(channel, preferences[channel], preferences[channel + 'Volume']);

  const pilot = S.Autoplay ? S.Autoplay.create() : null;
  let autoInput = null;
  let network = null, networkUI = null, social = null, touch = null, touchContext = { use: false, drive: false, driving: false }, networkReady = false, networkPlayers = [], networkSendTime = 0;
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

  function clearInput() { keys.clear(); pointer.down = false; pointer.shoot = false; if (touch) touch.reset(); if (networkReady && network) network.sendInput(inputSnapshot()); }

  function setScreen(name) {
    screen = name;
    if (name !== 'playing') S.Effects.audio.suspend();
    ui.showScreen(name);
    mapShell.hidden = name === 'title';
  }

  function toast(text, toneName) { ui.toast(text, toneName || 'info'); }

  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (_) { return false; }
  }

  function save(silent) {
    if (networkReady) { if (!silent) toast('The host server saves this shared world and your pack.'); return false; }
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
    stopAutoplay();
    leaveNetwork(false);
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
    stopAutoplay();
    leaveNetwork(false);
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
    stopAutoplay();
    if (!active || state.ended) return;
    if (networkReady) { network.sendAction(name); return; }
    const result = S.Engine.action(state, name);
    if (state.conversation) clearInput();
    if (result && name !== 'reload') S.Effects.emit(state, 'ui');
    ui.update(state, frameInfo);
  }

  function exportSave() {
    if (networkReady) { toast('World backups are kept by the host server.'); return; }
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
    if (!file || networkReady) return;
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
    title: function () { stopAutoplay(); leaveNetwork(false); clearInput(); active = false; setScreen('title'); },
    restart: function () { begin(state.seed, state.difficulty || 'standard', state.mode || 'openworld'); },
    save: function () { save(false); },
    exportSave: exportSave,
    importSave: importSave,
    action: applyAction,
    menuChanged: function () { clearInput(); S.Effects.audio.suspend(); },
    useItem: function (id) { applyAction('use:' + id); },
    equipItem: function (id) { applyAction('equip:' + id); },
    dropItem: function (id) { applyAction('drop:' + id); },
    craft: function (id) { stopAutoplay(); if (active && !state.ended) { if (networkReady) network.sendAction('craft:' + id); else S.Engine.craft(state, id); ui.update(state, frameInfo); } },
    build: function (type) { stopAutoplay(); if (active && !state.ended) { if (networkReady) network.sendAction('build:' + type); else S.Engine.build(state, type); ui.update(state, frameInfo); } },
    setSound: function (on) { preferences.sound = !!on; S.Effects.audio.setEnabled(on); if (on) unlockAudio(); rememberOptions(); },
    setVolume: function (value) { preferences.volume = Math.max(0, Math.min(1, Number(value) || 0)); S.Effects.audio.setVolume(preferences.volume); rememberOptions(); },
    setAudioPreference: function (field, value) {
      const channel = field.replace(/Volume$/, '');
      if (!['music', 'effects', 'ambience'].includes(channel) || field !== channel && field !== channel + 'Volume') return;
      if (field === channel) { if (typeof value !== 'boolean') return; preferences[field] = value; }
      else { if (typeof value !== 'number' || !Number.isFinite(value)) return; preferences[field] = Math.max(0, Math.min(1, value)); }
      S.Effects.audio.setChannel(channel, preferences[channel], preferences[channel + 'Volume']);
      if (preferences[channel] && preferences.sound) unlockAudio();
      rememberOptions();
    },
    setZoom: function (value) { preferences.zoom = Math.max(.7, Math.min(1.5, Number(value) || 1)); renderer.zoom = preferences.zoom; rememberOptions(); },
    setMotion: function (on) { preferences.motion = !!on; renderer.ambientMotion = preferences.motion; rememberOptions(); },
    setDetails: function (on) { preferences.details = !!on; rememberOptions(); },
    fullscreen: function () {
      try {
        const change = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        if (change && change.catch) change.catch(function () { toast('Fullscreen is unavailable in this browser.'); });
      } catch (_) { toast('Fullscreen is unavailable in this browser.'); }
    },
    setDebug: function (on) { debugOn = !!on; debug.hidden = !debugOn; }
  });
  const autoPanel = document.createElement('div'); autoPanel.className = 'as-autoplay';
  autoPanel.innerHTML = '<button type="button" aria-pressed="false" data-autoplay-toggle>AI play: Off</button><span data-autoplay-status>You are in control.</span><details class="as-brain"><summary>Neural activity</summary><div data-brain-view>Enable AI play to train its local controller.</div></details>';
  document.querySelector('.as-objective').appendChild(autoPanel);
  const autoButton = autoPanel.querySelector('button'); autoButton.disabled = !pilot;
  autoButton.addEventListener('click', function () {
    if (!pilot) return; S.Autoplay.toggle(pilot); clearInput(); autoButton.blur();
    toast(S.Autoplay.status(pilot).enabled ? 'AI play is on. Manual movement or combat returns control to you.' : 'AI play is off. You are in control.');
  });
  function renderBrain(force) {
    if (pilot && autoPanel.querySelector('details').open && (force || Math.floor(performance.now() / 250) !== autoPanel._brainFrame)) {
      autoPanel._brainFrame = Math.floor(performance.now() / 250); const info = S.Autoplay.status(pilot), brain = info.neural;
      if (brain) { const names = ['E', 'W', 'S', 'N', 'SE', 'NE', 'SW', 'NW'];
        autoPanel.querySelector('[data-brain-view]').innerHTML = '<p>Local network ' + brain.architecture + ' · ' + brain.parameters + ' parameters</p><p>' + brain.samples + ' training steps · ' + brain.feedback + ' play feedback · error ' + brain.loss.toFixed(4) + '</p><div class="as-brain-bars">' + info.choices.map(c => '<span title="' + names[c.direction] + ': ' + c.score.toFixed(3) + '">' + names[c.direction] + '<i style="width:' + Math.round((c.score + 1) * 50) + '%;opacity:' + (c.safe ? 1 : .3) + '"></i></span>').join('') + '</div><p>Seeded practice + movement feedback. Collision and manual control take priority.</p>'; }
    }
  }
  autoPanel.querySelector('details').addEventListener('toggle', function () { renderBrain(true); });
  function stopAutoplay() { if (pilot && S.Autoplay.status(pilot).enabled) S.Autoplay.toggle(pilot, false); autoInput = null; }
  function autoCommand(command) {
    if (networkReady) network.sendAction(command);
    else if (command === 'interact') S.Engine.interact(state);
    else if (command.startsWith('craft:')) S.Engine.craft(state, command.slice(6));
    else if (command.startsWith('build:')) S.Engine.build(state, command.slice(6));
    else S.Engine.action(state, command);
  }
  function leaveNetwork(showTitle) {
    const old = network; network = null; networkReady = false; networkPlayers = []; state.party = []; state.networked = false;
    if (social) social.disconnect();
    if (old) old.disconnect();
    if (networkUI) networkUI.update(false, [], state);
    if (showTitle) { stopAutoplay(); active = false; clearInput(); setScreen('title'); }
  }
  function joinNetwork(options) {
    leaveNetwork(false);
    if (!S.Multiplayer) { networkUI.status('Multiplayer is unavailable in this build.', false); return; }
    let identityKey;
    try {
      const url = new URL(options.url);
      if (!['ws:', 'wss:'].includes(url.protocol) || url.username || url.password) throw new Error('Use a ws:// or wss:// server address.');
      if (location.protocol === 'https:' && url.protocol !== 'wss:') throw new Error('This HTTPS page needs a secure wss:// host. For local play, open the game from your host server.');
      if (!options.name) throw new Error('Enter your survivor name.');
      identityKey = 'after-the-sirens-player:' + url.href;
      try { options.identity = localStorage.getItem(identityKey) || ''; } catch (_) {}
      networkUI.status('Connecting to your shared world…', true);
      network = new S.Multiplayer({
        onSnapshot: function (next, players, meId) {
          const previous = state, wasReady = networkReady; state = next; state.networked = true; networkPlayers = players;
          state.party = players.filter(p => p.id !== meId && p.connected !== false); networkReady = true; active = true;
          if (wasReady) {
            S.Effects.transfer(previous, state);
            const ox = previous.world ? previous.world.originX * 32 : 0, oy = previous.world ? previous.world.originY * 32 : 0;
            const nx = state.world ? state.world.originX * 32 : 0, ny = state.world ? state.world.originY * 32 : 0;
            S.Effects.walk(state, Math.min(80, Math.hypot(state.player.x + nx - previous.player.x - ox, state.player.y + ny - previous.player.y - oy)), false, state.player._sneaking);
            if (state.player.cooldown > previous.player.cooldown + .08 && (pointer.down || pointer.shoot || keys.has('Space'))) {
              const item = S.Catalog.items[state.player.weapon], kind = item && item.weapon && item.weapon.kind || 'melee';
              S.Effects.attack(state, state.player.weapon, kind, item && item.weapon && item.weapon.cooldown || .5, state.player.angle);
            }
            if (state.player.health < previous.player.health - .2) S.Effects.emit(state, 'hurt');
          } else { clearInput(); accumulator = 0; unlockAudio(); setScreen('playing'); S.Effects.emit(state, 'ready'); }
          ui.update(state, frameInfo); networkUI.update(true, networkPlayers, state);
          if (social) social.update(true, networkPlayers, state, network.getStatus());
        },
        onStatus: function (info) {
          if (info.connected) { networkUI.status('Connected to the shared world.', false); networkUI.nodes.ownerToken.value = ''; if (social) social.update(true, networkPlayers, state, info); }
          else if (info.phase === 'offline' && networkReady) networkUI.status('Disconnected. Rejoin to restore your survivor.', false);
          if (info.identity) { try { localStorage.setItem(identityKey, info.identity); } catch (_) {} }
          if (info.connected === false && networkReady) { leaveNetwork(true); toast('Disconnected from the host. Rejoin to restore your survivor.', 'warning'); }
        },
        onError: function (text) { networkUI.status(String(text), false); if (networkReady) toast(String(text), 'warning'); },
        onSocial: function (message) { if (social) social.receive(message); }
      });
      Promise.resolve(network.connect(options)).catch(function (error) { networkUI.status(error.message, false); });
    } catch (error) { networkUI.status(error.message, false); }
  }
  networkUI = new S.NetworkUI(document.getElementById('ui'), { join: joinNetwork, leave: function () { leaveNetwork(true); } });
  social = new S.Social(document.getElementById('ui'), {
    send: function (packet) { return networkReady && network ? network.sendSocial(packet) : false; },
    runCommand: function (text) { stopAutoplay(); const result = S.Commands.execute(state, text, { save: function () { return save(true); } }); ui.update(state, frameInfo); return result; },
    clearInput: clearInput,
    isPlaying: function () { return active && screen === 'playing' && !ui.isBlocking() && !state.ended; }
  });
  function gameAcceptsInput() { return active && screen === 'playing' && !ui.isBlocking() && !(social && social.isBlocking()) && !state.ended; }
  function interactNearby() {
    if (networkReady) network.sendAction('interact'); else S.Engine.interact(state);
    if (state.conversation) clearInput();
    ui.update(state, frameInfo);
  }
  touch = S.Touch ? new S.Touch(document.getElementById('ui'), {
    command: function (name) {
      if (!gameAcceptsInput()) return;
      stopAutoplay(); unlockAudio();
      if (name === 'interact') interactNearby();
      else if (name === 'switch') applyAction('switchWeapon');
      else if (name === 'vehicle') applyAction('vehicle');
    }
  }) : null;
  if (ui.applyPreferences) ui.applyPreferences(preferences);
  setScreen('title');
  ui.update(state, frameInfo);

  const controlledKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyC', 'KeyE', 'KeyI', 'KeyJ', 'KeyF', 'KeyR', 'KeyB', 'KeyV', 'KeyG', 'PageUp', 'PageDown', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Escape']);

  addEventListener('keydown', function (event) {
    if (event.defaultPrevented || social && social.isBlocking()) return;
    const editing = event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
    const buttonActivation = event.target && /^(BUTTON|SUMMARY)$/.test(event.target.tagName) && (event.code === 'Space' || event.code === 'Enter');
    if (buttonActivation) return;
    if (editing && event.code !== 'Escape') return;
    if (controlledKeys.has(event.code)) { event.preventDefault(); if (touch && event.code !== 'Escape') touch.enable(false); }
    if (event.repeat) return;
    if (event.code === 'Escape') {
      if (state.conversation) applyAction('closeConversation');
      else if (screen === 'paused') resume();
      else if (active && screen === 'playing') {
        if (ui.journal && ui.journal.open) ui.toggleJournal();
        else if (ui.isBlocking()) ui.toggleInventory();
        else pause();
      }
      return;
    }
    if (event.code === 'KeyI' && active && screen === 'playing' && !state.ended) {
      clearInput(); ui.toggleInventory(); ui.update(state, frameInfo); return;
    }
    if (event.code === 'KeyJ' && active && screen === 'playing' && !state.ended) { clearInput(); ui.toggleJournal(); ui.update(state, frameInfo); return; }
    if (!active || ui.isBlocking() || social && social.isBlocking() || state.ended) return;
    stopAutoplay();
    keys.add(event.code);
    unlockAudio();
    if (event.code === 'KeyE') interactNearby();
    else if (event.code === 'Digit1') applyAction('eat');
    else if (event.code === 'Digit2') applyAction('drink');
    else if (event.code === 'Digit3') applyAction('bandage');
    else if (event.code === 'Digit4' || event.code === 'KeyR') applyAction('reload');
    else if (event.code === 'KeyF') applyAction('switchWeapon');
    else if (event.code === 'KeyV') applyAction('vehicle');
    else if (event.code === 'KeyG') applyAction('refuel');
    else if (event.code === 'PageUp') applyAction('stairsUp');
    else if (event.code === 'PageDown') applyAction('stairsDown');
    else if (event.code === 'KeyB') { if (networkReady) network.sendAction('build:barricade'); else S.Engine.build(state, 'barricade'); ui.update(state, frameInfo); }
  });
  addEventListener('keyup', function (event) { keys.delete(event.code); });
  addEventListener('blur', function () { clearInput(); if (active && screen === 'playing' && !(pilot && S.Autoplay.status(pilot).enabled)) pause(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clearInput(); S.Effects.audio.suspend(); if (!(pilot && S.Autoplay.status(pilot).enabled)) pause(); } });
  addEventListener('pagehide', function () { S.Effects.audio.suspend(); if (active && !networkReady) save(true); });
  addEventListener('beforeunload', function () { if (active && !networkReady) save(true); });
  canvas.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  canvas.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') { if (touch) touch.move(event); return; }
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.used = true;
  });
  canvas.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'touch' && touch) {
      event.preventDefault();
      if (!gameAcceptsInput()) return;
      stopAutoplay(); unlockAudio();
      if (touch.down(event, canvas.getBoundingClientRect())) { try { canvas.setPointerCapture(event.pointerId); } catch (_) {} }
      return;
    }
    if (touch && event.pointerType === 'mouse') touch.enable(false);
    if (!active || ui.isBlocking() || social && social.isBlocking()) return;
    stopAutoplay();
    event.preventDefault();
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.used = true;
    if (event.button === 0) pointer.down = true;
    if (event.button === 2) pointer.shoot = true;
    unlockAudio();
    try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
  });
  addEventListener('pointerup', function (event) {
    if (event.pointerType === 'touch') { if (touch) touch.up(event); return; }
    if (event.button === 0) pointer.down = false;
    if (event.button === 2) pointer.shoot = false;
  });
  canvas.addEventListener('pointercancel', function (event) { if (event.pointerType === 'touch' && touch) touch.up(event); else clearInput(); });

  function inputSnapshot() {
    const thumbs = touch ? touch.snapshot(performance.now()) : null;
    const moveX = Math.max(-1, Math.min(1, (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + (thumbs ? thumbs.moveX : 0)));
    const moveY = Math.max(-1, Math.min(1, (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) + (thumbs ? thumbs.moveY : 0)));
    let aim;
    if (thumbs && thumbs.aim && thumbs.aim.kind === 'screen') aim = renderer.screenToWorld(thumbs.aim.x, thumbs.aim.y, state);
    else if (thumbs && thumbs.aim) aim = { x: state.player.x + thumbs.aim.x * 100, y: state.player.y + thumbs.aim.y * 100 };
    else if (pointer.used && !(touch && touch.enabled)) aim = renderer.screenToWorld(pointer.x, pointer.y, state);
    else aim = { x: state.player.x + Math.cos(state.player.angle || 0) * 100, y: state.player.y + Math.sin(state.player.angle || 0) * 100 };
    return { moveX: moveX, moveY: moveY, sprint: keys.has('ShiftLeft') || keys.has('ShiftRight') || !!(thumbs && thumbs.sprint), sneak: keys.has('KeyC') || !!(thumbs && thumbs.sneak),
      aimX: aim.x, aimY: aim.y, attack: pointer.down || keys.has('Space') || !!(thumbs && thumbs.attack), shoot: pointer.shoot };
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
    autoInput = null;
    if (pilot && S.Autoplay.status(pilot).enabled && active && !(social && social.isBlocking()) && (!ui.isBlocking() || screen === 'playing' && !!state.conversation && !ui.inventoryOpen && !(ui.journal && ui.journal.open)) && !state.ended) {
      const choice = S.Autoplay.step(pilot, state, elapsed); autoInput = choice.input;
      if (choice.command) autoCommand(choice.command);
    }
    if (pilot) { const pilotStatus = S.Autoplay.status(pilot); autoButton.textContent = 'AI play: ' + (pilotStatus.enabled ? 'On' : 'Off'); autoButton.setAttribute('aria-pressed', String(pilotStatus.enabled)); autoPanel.querySelector('span').textContent = pilotStatus.enabled ? pilotStatus.text : 'You are in control.'; }
    if (networkReady && active) {
      networkSendTime += elapsed; S.Effects.advance(state, elapsed);
      if (networkSendTime >= .05) {
        network.sendInput(ui.isBlocking() || social && social.isBlocking() || state.ended ? { moveX: 0, moveY: 0, attack: false, shoot: false, aimX: state.player.x, aimY: state.player.y } : autoInput || inputSnapshot());
        networkSendTime %= .05;
      }
      accumulator = 0;
    } else if (active && !ui.isBlocking() && !(social && social.isBlocking()) && !state.ended) {
      accumulator += elapsed;
      while (accumulator >= 1 / 60) {
        const oldHealth = state.player.health;
        S.Engine.update(state, 1 / 60, autoInput || inputSnapshot());
        accumulator -= 1 / 60;
        if (state.player.health < oldHealth - 0.2) S.Effects.emit(state, 'hurt');
        if (state.ended) break;
      }
      autoSaveTime += elapsed;
      if (autoSaveTime >= 5) { save(true); autoSaveTime = 0; }
      if (state.ended) { clearInput(); setScreen(state.player.health > 0 && state.won ? 'won' : 'dead'); save(true); }
    } else accumulator = 0;
    renderBrain(false);
    if (touch) touch.update(gameAcceptsInput(), touchContext);
    S.Effects.audio.update(state, active && screen === 'playing' && !ui.isBlocking() && !(social && social.isBlocking()) && !state.ended && !document.hidden, !document.hidden);
    renderer.draw(state, frameInfo);
    uiTime += elapsed;
    if (uiTime > 0.1 || state.ended) {
      ui.update(state, frameInfo);
      if (touch && touch.enabled) touchContext = { use: !ui.nodes.interact.hidden, drive: !state.player.vehicleId && !!(S.Vehicles && S.Vehicles.nearby(state)), driving: !!state.player.vehicleId };
      networkUI.update(networkReady, networkPlayers, state); social.update(networkReady, networkPlayers, state, network ? network.getStatus() : { connected: false }); uiTime = 0;
    }
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
    getSocialStatus: function () { return social.getStatus(); }, getVoiceStats: function () { return social.getVoiceStats(); },
    getScreen: function () { return screen; }, getAutoplayStatus: function () { return pilot ? S.Autoplay.status(pilot) : { enabled: false, text: 'Unavailable' }; }, getNetworkStatus: function () { return network ? network.getStatus() : { connected: false }; }, getPreferences: function () { return Object.assign({}, preferences); }, getView: function () { return { zoom: renderer.zoom, ambientMotion: renderer.ambientMotion }; }, getAudioMetrics: S.Effects.audio.metrics,
    getTouchStatus: function () { return touch ? touch.status() : { enabled: false }; } };
})();
