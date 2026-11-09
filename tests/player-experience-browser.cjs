'use strict';
// End-to-end settings and save recovery. Gameplay uses ordinary UI input.
// Storage-corruption fixtures run before the app boots, simulating damaged saved bytes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
const PRIMARY = 'after-the-sirens-save-v1', BACKUP = PRIMARY + '-backup';

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const errors = [], requests = [], passed = [], evidence = {};
  async function check(name, test) { await test(); passed.push(name); console.log('PASS ' + name); }
  async function open(options = {}, init, arg) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, ...options });
    if (init) await context.addInitScript(init, arg);
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await page.goto(url);
    return { context, page };
  }
  const frames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const serialized = page => page.evaluate(() => Sirens.Engine.serialize(Sirens.App.getState()));
  const pixels = page => page.evaluate(() => {
    const canvas = document.getElementById('world'), box = canvas.getBoundingClientRect();
    return { width: canvas.width, height: canvas.height, css: { x: box.x, y: box.y, width: box.width, height: box.height } };
  });
  async function pause(page) {
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => Sirens.App.getScreen()), 'paused');
  }
  try {
    const { context, page } = await open();
    await page.locator('[data-ui="seed"]').fill('20260929');
    await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-ui="mode"]').selectOption('rescue');
    await page.locator('[data-command="start"]').click(); await frames(page); await pause(page);
    const quality = page.locator('[data-setting="quality"]');

    await check('graphics controls resize backing pixels while paused world and CSS stay unchanged', async () => {
      await quality.selectOption('high'); await frames(page);
      const high = await pixels(page), before = await serialized(page);
      assert.equal(high.width, 2560); assert.equal(high.height, 1600);
      for (const [mode, scale] of [['balanced', .8], ['low', .6], ['high', 1]]) {
        await quality.selectOption(mode); await frames(page);
        const current = await pixels(page);
        assert.deepEqual(current.css, high.css);
        assert.equal(current.width, Math.round(high.width * scale));
        assert.equal(current.height, Math.round(high.height * scale));
        assert.equal(await serialized(page), before, 'quality changed a paused simulation');
        assert.equal(await page.evaluate(() => Sirens.App.getQuality().level), mode);
      }
      evidence.high = high;
    });

    await check('actual pointer aiming has the same bearing at high and low quality', async () => {
      const target = { x: 820, y: 464 };
      async function aimAt(mode) {
        await quality.selectOption(mode);
        await page.locator('[data-command="resume"]').click();
        await page.mouse.move(target.x, target.y); await frames(page);
        const result = await page.evaluate(() => {
          const p = Sirens.App.getState().player; return { x: p.x, y: p.y, angle: p.angle };
        });
        await pause(page); return result;
      }
      const high = await aimAt('high'), low = await aimAt('low');
      assert.equal(low.x, high.x); assert.equal(low.y, high.y);
      assert(Math.abs(low.angle - high.angle) < 1e-10, 'quality moved the pointer aim');
      assert(high.angle > .05 && high.angle < .8, 'pointer did not aim into the southeast quadrant');
      evidence.aim = { high: high.angle, low: low.angle };
    });

    await check('first-person rendering uses fewer pixels without changing field of view or paused state', async () => {
      await quality.selectOption('high');
      await page.locator('[data-setting="view"]').selectOption('first'); await frames(page);
      const before = await serialized(page), high = await page.evaluate(() => Sirens.App.getView().firstPerson);
      await quality.selectOption('low'); await frames(page);
      const low = await page.evaluate(() => Sirens.App.getView().firstPerson);
      assert(low.width < high.width && low.height < high.height);
      assert.equal(low.width, Math.round(high.width * .6)); assert.equal(low.height, Math.round(high.height * .6));
      assert.equal(low.fov, high.fov); assert(Math.abs(low.horizon - high.horizon) <= 1);
      assert.equal(await serialized(page), before);
      evidence.firstPerson = { high: { width: high.width, height: high.height, fov: high.fov }, low: { width: low.width, height: low.height, fov: low.fov } };
    });

    await check('selected quality survives a full reload and auto resumes from the chosen level', async () => {
      await page.reload(); await frames(page);
      assert.equal(await page.evaluate(() => Sirens.App.getPreferences().quality), 'low');
      assert.equal(await quality.inputValue(), 'low');
      assert.equal(await page.evaluate(() => Sirens.App.getQuality().level), 'low');
      assert.equal((await pixels(page)).width, 1536);
      await page.locator('[data-command="continue"]').click(); await pause(page);
      const before = await serialized(page);
      await quality.selectOption('auto'); await page.waitForTimeout(220);
      const status = await page.evaluate(() => Sirens.App.getQuality());
      assert.equal(status.mode, 'auto'); assert.equal(status.level, 'low'); assert.equal(status.samples, 0);
      assert.equal(await serialized(page), before, 'pause collected load by advancing simulation');
    });
    await context.close();

    const saved = await open({ deviceScaleFactor: 1 });
    await saved.page.locator('[data-ui="seed"]').fill('20260929');
    await saved.page.locator('[data-ui="difficulty"]').selectOption('calm');
    await saved.page.locator('[data-ui="mode"]').selectOption('rescue');
    await saved.page.locator('[data-command="start"]').click(); await frames(saved.page); await pause(saved.page);
    await saved.page.locator('[data-command="save"]').click();
    const original = await saved.page.evaluate(key => localStorage.getItem(key), PRIMARY);
    await saved.page.locator('[data-command="resume"]').click();
    await saved.page.keyboard.press('KeyE'); await frames(saved.page); await pause(saved.page);
    await saved.page.locator('[data-command="save"]').click();
    const generations = await saved.page.evaluate(keys => keys.map(key => localStorage.getItem(key)), [PRIMARY, BACKUP]);
    assert(generations.every(Boolean), 'two saves did not preserve a previous generation');
    assert.notEqual(generations[0], generations[1]);
    assert.deepEqual(JSON.parse(generations[1]).state.player.inventory, JSON.parse(original).state.player.inventory);
    assert.notDeepEqual(JSON.parse(generations[0]).state.player.inventory, JSON.parse(generations[1]).state.player.inventory, 'loot fixture did not create distinct saves');

    await check('Continue recovers the previous validated generation after primary save corruption', async () => {
      // Corrupt after unload has saved, before the next page reads storage.
      await saved.page.addInitScript(key => {
        if (!sessionStorage.getItem('sirens-test-corrupted')) {
          localStorage.setItem(key, '{broken-save'); sessionStorage.setItem('sirens-test-corrupted', '1');
        }
      }, PRIMARY);
      await saved.page.reload();
      assert.equal(await saved.page.locator('[data-command="continue"]').isDisabled(), false);
      await saved.page.locator('[data-command="continue"]').click();
      assert.equal(await saved.page.evaluate(() => Sirens.App.getScreen()), 'playing');
      assert.match(await saved.page.locator('[data-ui="toast"]').textContent(), /Recovered the previous valid save/);
      const result = await saved.page.evaluate(() => {
        const s = Sirens.App.getState(); return { seed: s.seed, inventory: s.player.inventory, x: s.player.x, y: s.player.y };
      });
      const previous = JSON.parse(generations[1]).state;
      assert.equal(result.seed, previous.seed); assert.deepEqual(result.inventory, previous.player.inventory);
      assert.equal(result.x, previous.player.x); assert.equal(result.y, previous.player.y);
      evidence.recovery = { seed: result.seed, recoveredPreviousInventory: true };
    });
    await saved.context.close();

    await check('a valid ended primary remains authoritative over its unfinished backup', async () => {
      const ended = JSON.parse(generations[0]); ended.state.ended = true; ended.state.won = false; ended.state.player.health = 0;
      const fixture = await open({ deviceScaleFactor: 1 }, data => {
        localStorage.setItem(data.primaryKey, data.primary); localStorage.setItem(data.backupKey, data.backup);
      }, { primaryKey: PRIMARY, backupKey: BACKUP, primary: JSON.stringify(ended), backup: generations[1] });
      assert.equal(await fixture.page.evaluate(key => Sirens.Engine.deserialize(localStorage.getItem(key)).ended, PRIMARY), true, 'fixture must be a valid ended run');
      assert.equal(await fixture.page.locator('[data-command="continue"]').isDisabled(), true);
      assert.equal(await fixture.page.evaluate(() => Sirens.App.getScreen()), 'title');
      await fixture.context.close();
    });

    await check('blocked browser storage leaves the game playable and explains export fallback', async () => {
      const blocked = await open({ deviceScaleFactor: 1 }, () => Object.defineProperty(window, 'localStorage', {
        configurable: true, get() { throw new DOMException('Storage disabled for test', 'SecurityError'); }
      }));
      assert.equal(await blocked.page.locator('[data-command="continue"]').isDisabled(), true);
      await blocked.page.locator('[data-command="start"]').click(); await pause(blocked.page);
      await blocked.page.locator('[data-setting="quality"]').selectOption('low');
      assert.equal(await blocked.page.evaluate(() => Sirens.App.getQuality().level), 'low');
      await blocked.page.locator('[data-command="save"]').click();
      assert.match(await blocked.page.locator('[data-ui="toast"]').textContent(), /Local save unavailable.*Export/);
      await blocked.page.locator('[data-command="resume"]').click();
      assert.equal(await blocked.page.evaluate(() => Sirens.App.getScreen()), 'playing');
      await blocked.context.close();
    });
    assert.deepEqual(errors, []); assert.deepEqual(requests, []);
    fs.mkdirSync('.test-results', { recursive: true });
    fs.writeFileSync('.test-results/player-experience.json', JSON.stringify({ passed, evidence }, null, 2) + '\n');
    console.log(passed.length + ' player-experience browser checks passed without remote requests.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
