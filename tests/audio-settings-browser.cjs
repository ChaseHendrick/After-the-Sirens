'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  fs.mkdirSync('.test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [], requests = [], passed = [], evidence = {};
  function observe(target) {
    target.on('pageerror', error => errors.push(error.message));
    target.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  }
  observe(page);
  const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
  const until = (fn, arg) => page.waitForFunction(fn, arg, { polling: 'raf', timeout: 15000 });
  const audio = () => page.evaluate(() => Sirens.App.getAudioMetrics());
  const preferences = () => page.evaluate(() => Sirens.App.getPreferences());
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  async function pause() {
    if (await page.evaluate(() => Sirens.App.getScreen()) === 'playing') await page.keyboard.press('Escape');
    await until(() => Sirens.App.getScreen() === 'paused');
  }
  async function resume() {
    await page.keyboard.press('Escape');
    await until(() => Sirens.App.getScreen() === 'playing' && Sirens.App.getAudioMetrics().active);
  }
  async function range(field, value) {
    const input = page.locator('[data-setting="' + field + '"]');
    await input.focus(); await page.keyboard.press('Home');
    for (let i = 0; i < value / 5; i++) await page.keyboard.press('ArrowRight');
    assert.equal(Number(await input.inputValue()), value);
  }
  async function configure(values) {
    await pause();
    for (const [field, value] of Object.entries(values)) {
      if (typeof value === 'boolean') await page.locator('[data-setting="' + field + '"]').setChecked(value);
      else await range(field, value);
    }
    await resume();
    await until(() => {
      const metrics = Sirens.App.getAudioMetrics();
      return Object.values(metrics.channels).every(channel => channel.enabled && channel.volume > 0 || channel.peak < .00005);
    });
  }
  async function sample(duration) {
    return page.evaluate(async duration => {
      const peaks = { master: 0, music: 0, effects: 0, ambience: 0 }, sums = { music: 0, effects: 0, ambience: 0 };
      let reads = 0, maxMusicVoices = 0, maxEffectVoices = 0;
      const start = performance.now();
      do {
        const metrics = Sirens.App.getAudioMetrics();
        peaks.master = Math.max(peaks.master, metrics.peak);
        for (const channel of ['music', 'effects', 'ambience']) { peaks[channel] = Math.max(peaks[channel], metrics.channels[channel].peak); sums[channel] += metrics.channels[channel].peak; }
        maxMusicVoices = Math.max(maxMusicVoices, metrics.music.voices); maxEffectVoices = Math.max(maxEffectVoices, metrics.voices); reads++;
        await new Promise(resolve => setTimeout(resolve, 25));
      } while (performance.now() - start < duration);
      return { peaks, averages: Object.fromEntries(Object.entries(sums).map(([channel, value]) => [channel, value / reads])), maxMusicVoices, maxEffectVoices, metrics: Sirens.App.getAudioMetrics() };
    }, duration);
  }
  async function swingSample(duration) {
    const before = (await audio()).played.swing || 0;
    await page.keyboard.down('Space');
    try {
      const value = await sample(duration || 850);
      assert(value.metrics.played.swing > before, 'Real attacks did not generate an effect');
      return value;
    } finally { await page.keyboard.up('Space'); }
  }
  async function freshPreferences(raw, fn) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.addInitScript(raw => localStorage.setItem('after-the-sirens-options-v1', raw), raw);
    const target = await context.newPage(); observe(target);
    try { await target.goto(url); await fn(target); } finally { await context.close(); }
  }

  try {
    await page.goto(url);
    await page.locator('[data-ui="mode"]').selectOption('rescue');
    await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-command="start"]').click();
    await until(() => Sirens.App.getAudioMetrics().context === 'running');
    // This declared empty-terrain fixture isolates audio routing and adaptive themes.
    // All channel changes, attacks, saves and movement use the assembled game UI.
    await page.evaluate(() => {
      const s = Sirens.App.getState(); s.tiles.fill(0); s.zombies = []; s.humans = []; s.buildings = []; s.containers = []; s.vehicles = [];
      s.player.vehicleId = null; s.player.health = 100; s.player.stamina = 100; s.time = 8; s.weather = 'clear';
    });

    await check('music-only options produce an actual score waveform while effects and ambience stay silent', async () => {
      await configure({ sound: true, music: true, effects: false, ambience: false, musicVolume: 100 });
      await until(() => Sirens.App.getAudioMetrics().music.theme === 'Morrow at Dawn');
      evidence.musicOnly = await sample(1300);
      assert(evidence.musicOnly.peaks.music > .003); assert(evidence.musicOnly.peaks.master > .001);
      assert(evidence.musicOnly.peaks.effects < .0001); assert(evidence.musicOnly.peaks.ambience < .0001);
      assert(evidence.musicOnly.maxMusicVoices > 0); assert(evidence.musicOnly.maxMusicVoices <= 12);
      assert.equal(evidence.musicOnly.metrics.voices, 0); assert(evidence.musicOnly.metrics.music.notes > 0);
      const before = (await audio()).played.swing || 0;
      await page.keyboard.down('Space');
      try { await until(() => Sirens.App.getState().player.cooldown > 0); } finally { await page.keyboard.up('Space'); }
      assert.equal((await audio()).played.swing || 0, before, 'Effects toggle allowed an attack sound');
    });

    await check('effects-only options route real melee inputs to their own audible bus', async () => {
      await configure({ music: false, effects: true, ambience: false, effectsVolume: 100 });
      await until(() => Sirens.App.getAudioMetrics().music.voices === 0);
      evidence.effectsOnly = await swingSample(1100);
      assert(evidence.effectsOnly.peaks.effects > .001); assert(evidence.effectsOnly.peaks.master > .0005);
      assert(evidence.effectsOnly.peaks.music < .0001); assert(evidence.effectsOnly.peaks.ambience < .0001);
      assert.equal(evidence.effectsOnly.maxMusicVoices, 0); assert(evidence.effectsOnly.maxEffectVoices <= 40);
    });

    await check('ambience-only options produce a real environmental waveform with no music or strikes', async () => {
      await configure({ music: false, effects: false, ambience: true, ambienceVolume: 100 });
      await until(() => Sirens.App.getAudioMetrics().voices === 0);
      evidence.ambienceOnly = await sample(900);
      assert(evidence.ambienceOnly.peaks.ambience > .0003); assert(evidence.ambienceOnly.peaks.master > .0001);
      assert(evidence.ambienceOnly.peaks.effects < .0001); assert(evidence.ambienceOnly.peaks.music < .0001);
      assert.equal(evidence.ambienceOnly.metrics.music.voices, 0);
    });

    await check('effect and environmental volume controls reduce their real output independently', async () => {
      await configure({ music: false, effects: true, ambience: false, effectsVolume: 100 });
      const loudEffects = await swingSample(1000);
      await configure({ effectsVolume: 25 });
      const quietEffects = await swingSample(1000);
      assert(quietEffects.peaks.effects > .0001);
      assert(quietEffects.peaks.effects < loudEffects.peaks.effects * .45, 'Effects slider did not reduce waveform amplitude');
      assert.equal(quietEffects.metrics.channels.music.volume, 1); assert.equal(quietEffects.metrics.channels.ambience.volume, 1);
      await configure({ effects: false, ambience: true, ambienceVolume: 100 });
      await until(() => Sirens.App.getAudioMetrics().voices === 0);
      const loudAmbience = await sample(800);
      await configure({ ambienceVolume: 25 });
      const quietAmbience = await sample(800);
      assert(quietAmbience.peaks.ambience > 0);
      assert(quietAmbience.peaks.ambience < loudAmbience.peaks.ambience * .5, 'Ambience slider did not reduce waveform amplitude');
      evidence.sliderEffects = { loudEffects, quietEffects, loudAmbience, quietAmbience };
    });

    await check('music volume reduces score amplitude and zero stops score voices without muting other buses', async () => {
      await configure({ music: true, effects: false, ambience: false, musicVolume: 100 });
      const loud = await sample(1900);
      await configure({ musicVolume: 25 });
      const quiet = await sample(1900);
      assert(quiet.peaks.music > .0001); assert(quiet.peaks.music < loud.peaks.music * .55);
      await configure({ musicVolume: 0, ambience: true, ambienceVolume: 70 });
      await until(() => Sirens.App.getAudioMetrics().music.voices === 0);
      const zero = await sample(450);
      assert(zero.peaks.music < .0001); assert(zero.peaks.ambience > .0002);
      assert.equal(zero.metrics.channels.music.enabled, true);
      assert.equal(zero.metrics.channels.music.volume, 0);
      evidence.sliderMusic = { loud, quiet, zero };
    });

    await check('master mute dominates enabled channels and overall zero volume silences final output', async () => {
      await configure({ sound: true, music: true, effects: true, ambience: true, musicVolume: 60, effectsVolume: 100, ambienceVolume: 70, volume: 70 });
      await until(() => Sirens.App.getAudioMetrics().peak > .001);
      await configure({ sound: false });
      await page.keyboard.down('Space');
      let muted;
      try { muted = await sample(550); } finally { await page.keyboard.up('Space'); }
      assert(muted.peaks.master < .0001); assert.equal(muted.metrics.music.voices, 0); assert.equal(muted.metrics.loops, 0);
      assert.equal(muted.metrics.channels.music.enabled, true); assert.equal(muted.metrics.channels.effects.enabled, true);
      await configure({ sound: true, volume: 0 });
      await until(() => Sirens.App.getAudioMetrics().music.voices > 0);
      const zero = await sample(700);
      assert(zero.peaks.master < .0001); assert(zero.peaks.music > .001, 'Overall zero unexpectedly disabled the independent music bus');
      await configure({ volume: 70 });
      await until(() => Sirens.App.getAudioMetrics().peak > .001);
      evidence.masterMute = { muted, zero };
    });

    await check('pause, blur and an explicit hidden-document fixture stop score voices and scheduling', async () => {
      await until(() => Sirens.App.getAudioMetrics().music.voices > 0);
      await pause(); await until(() => Sirens.App.getAudioMetrics().music.voices === 0);
      const paused = (await audio()).music.notes; await sample(300); assert.equal((await audio()).music.notes, paused);
      await resume(); await until(() => Sirens.App.getAudioMetrics().music.voices > 0);
      await page.evaluate(() => dispatchEvent(new Event('blur')));
      await until(() => Sirens.App.getScreen() === 'paused' && Sirens.App.getAudioMetrics().music.voices === 0);
      await resume(); await until(() => Sirens.App.getAudioMetrics().music.voices > 0);
      // A declared visibility fixture invokes the real document event. Headless
      // browser tab activation alone does not reliably report document.hidden.
      await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
      await until(() => Sirens.App.getAudioMetrics().music.voices === 0);
      const hiddenNotes = (await audio()).music.notes; await sample(300); assert.equal((await audio()).music.notes, hiddenNotes);
      await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
      await resume(); await until(() => Sirens.App.getAudioMetrics().music.voices > 0);
    });

    await check('day, night, danger and driving fixtures produce distinct adaptive score themes', async () => {
      await configure({ music: true, effects: false, ambience: false, musicVolume: 70 });
      await page.evaluate(() => { const s = Sirens.App.getState(); s.time = 23; s.zombies = []; });
      await until(() => Sirens.App.getAudioMetrics().music.theme === 'Empty Streets');
      const night = await sample(350); assert(night.peaks.music > .0001);
      await page.evaluate(() => {
        const s = Sirens.App.getState(), seed = Sirens.Engine.create(17, 'calm', 'rescue');
        s.zombies = [Object.assign({}, seed.zombies[0], { x: s.player.x + 130, y: s.player.y, health: 52 })];
      });
      await until(() => Sirens.App.getAudioMetrics().music.theme === 'Under the Sirens');
      const danger = await sample(350); assert(danger.peaks.music > .0001);
      await page.evaluate(() => {
        const s = Sirens.App.getState(); s.zombies = []; s.time = 8;
        const car = Object.assign({}, Sirens.Vehicles.spawnForChunk(0, 0, 0)[0], { id: 'audio-car', x: s.player.x + 16, y: s.player.y, speed: 0, fuel: 20, condition: 100 });
        s.vehicles = [car];
      });
      await page.keyboard.press('KeyV');
      await until(() => !!Sirens.App.getState().player.vehicleId && Sirens.App.getAudioMetrics().music.theme === 'The Road Beyond');
      const road = await sample(400); assert(road.peaks.music > .0001);
      await page.keyboard.press('KeyV');
      await until(() => !Sirens.App.getState().player.vehicleId && Sirens.App.getAudioMetrics().music.theme === 'Morrow at Dawn');
      evidence.themes = { night, danger, road, dawn: await sample(350) };
    });

    await check('a crowded transient-effects fixture respects separate music and sound voice limits', async () => {
      await configure({ music: true, effects: true, ambience: true, effectsVolume: 100 });
      await until(() => Sirens.App.getAudioMetrics().music.voices > 0 && Sirens.App.getAudioMetrics().channels.music.peak > .0001);
      await page.evaluate(() => { const s = Sirens.App.getState(); for (let i = 0; i < 1000; i++) Sirens.Effects.emit(s, 'glass', { broken: true }); });
      evidence.bounds = await sample(900);
      assert(evidence.bounds.maxMusicVoices > 0 && evidence.bounds.maxMusicVoices <= 12);
      assert(evidence.bounds.maxEffectVoices > 0 && evidence.bounds.maxEffectVoices <= 40);
      assert(Number.isFinite(evidence.bounds.peaks.master)); assert(evidence.bounds.peaks.master <= 1);
    });

    await check('leaving a completed-run fixture stops music and does not schedule notes on the title screen', async () => {
      await page.evaluate(() => { const s = Sirens.App.getState(); s.ended = true; s.won = false; s.player.health = 0; });
      await until(() => Sirens.App.getScreen() === 'dead' && Sirens.App.getAudioMetrics().music.voices === 0);
      await page.locator('.as-overlay[data-screen="dead"] [data-command="title"]').click();
      await until(() => Sirens.App.getScreen() === 'title');
      const before = (await audio()).music.notes; const title = await sample(400);
      assert.equal(title.metrics.music.voices, 0); assert.equal(title.metrics.music.notes, before); assert(title.peaks.master < .0001);
      // Restart a natural world before testing persistence. No altered terrain or
      // fabricated car is used for the saved-run round trip below.
      await page.locator('[data-command="start"]').click(); await until(() => Sirens.App.getScreen() === 'playing');
    });

    await check('independent options survive full reload and Continue with matching visible controls', async () => {
      await configure({ sound: true, volume: 55, music: true, musicVolume: 60, effects: false, effectsVolume: 25, ambience: true, ambienceVolume: 40 });
      await pause(); await page.locator('[data-command="save"]').click();
      const before = await preferences(); const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('after-the-sirens-options-v1')));
      assert.deepEqual(saved, before); await page.reload();
      await page.locator('[data-command="continue"]').click();
      await until(() => Sirens.App.getScreen() === 'playing' && Sirens.App.getAudioMetrics().context === 'running');
      assert.deepEqual(await preferences(), before);
      await pause();
      for (const channel of ['music', 'effects', 'ambience']) {
        assert.equal(await page.locator('[data-setting="' + channel + '"]').isChecked(), before[channel]);
        assert.equal(Number(await page.locator('[data-setting="' + channel + 'Volume"]').inputValue()), before[channel + 'Volume'] * 100);
        assert.equal(await page.locator('[data-ui="' + channel + '-volume-value"]').textContent(), before[channel + 'Volume'] * 100 + '%');
      }
      await resume(); await until(() => Sirens.App.getAudioMetrics().channels.music.peak > .0001);
      const social = await page.evaluate(() => Sirens.App.getSocialStatus());
      assert.equal(social.enabled, false); assert.deepEqual(social.microphone, []);
      evidence.persisted = { preferences: before, audio: await audio(), voice: social };
    });

    await check('legacy preferences gain safe new defaults and corrupt preference values cannot poison audio', async () => {
      await freshPreferences(JSON.stringify({ sound: true, volume: .55, zoom: 1.2, motion: false }), async target => {
        const p = await target.evaluate(() => Sirens.App.getPreferences());
        assert.equal(p.volume, .55); assert.equal(p.zoom, 1.2); assert.equal(p.motion, false);
        for (const [channel, volume] of [['music', .35], ['effects', 1], ['ambience', .7]]) { assert.equal(p[channel], true); assert.equal(p[channel + 'Volume'], volume); }
        await target.locator('[data-command="start"]').click();
        await target.waitForFunction(() => Sirens.App.getAudioMetrics().channels.music.peak > .0001);
      });
      await freshPreferences(JSON.stringify({ music: false, musicVolume: -9, effects: 'no', effectsVolume: 20, ambience: [], ambienceVolume: '0.1', volume: 'bad' }), async target => {
        const p = await target.evaluate(() => Sirens.App.getPreferences());
        assert.equal(p.music, false); assert.equal(p.musicVolume, 0); assert.equal(p.effects, true); assert.equal(p.effectsVolume, 1);
        assert.equal(p.ambience, true); assert.equal(p.ambienceVolume, .7); assert.equal(p.volume, .7);
        await target.locator('[data-command="start"]').click();
        await target.waitForFunction(() => Sirens.App.getAudioMetrics().channels.ambience.peak > .0001);
        assert.equal((await target.evaluate(() => Sirens.App.getAudioMetrics())).music.voices, 0);
      });
      await freshPreferences('{ invalid JSON', async target => {
        const p = await target.evaluate(() => Sirens.App.getPreferences()); assert.equal(p.music, true); assert.equal(p.musicVolume, .35);
        const metrics = await target.evaluate(() => Sirens.App.getAudioMetrics()); assert(Number.isFinite(metrics.volume));
      });
    });

    await check('offline procedural score and settings cause no external requests or page errors', async () => {
      assert.deepEqual(errors, []); assert.deepEqual(requests, []);
      const value = await audio(); assert(Number.isFinite(value.peak)); assert(value.peak <= 1);
      for (const channel of Object.values(value.channels)) assert(Number.isFinite(channel.peak) && Number.isFinite(channel.volume));
    });
    const report = { passed, evidence, pageErrors: errors, externalRequests: requests, browser: await browser.version(), note: 'Actual Chrome Web Audio channel analyser waveforms with ordinary options controls, keyboard attacks, reload and Continue. Declared fixtures isolate terrain, adaptive score themes, event crowding, hidden-document state and end-of-run cleanup. No recorded music, physical microphone capture or external audio service.' };
    fs.writeFileSync('.test-results/audio-settings-browser-report.json', JSON.stringify(report, null, 2));
    console.log(passed.length + ' audio settings browser checks passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
