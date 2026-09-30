'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  fs.mkdirSync('.test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(12000);
  const passed = [], errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
  const state = () => page.evaluate(() => Sirens.App.getState());
  const until = (fn, arg) => page.waitForFunction(fn, arg, { polling: 'raf', timeout: 12000 });
  const journal = page.locator('[data-ui="journal-overlay"]');
  const pack = page.locator('[data-ui="inventory-overlay"]');
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  async function closeMenus() {
    const conversation = page.locator('[data-ui="conversation-overlay"]');
    if (await conversation.isVisible()) {
      if (await page.evaluate(() => !!Sirens.App.getState().conversation)) await page.keyboard.press('Escape');
      await conversation.waitFor({ state: 'hidden' });
    }
    if (await journal.isVisible() || await pack.isVisible()) await page.keyboard.press('Escape');
  }
  async function openJournal(tab = 'overview') {
    if (!(await journal.isVisible())) { await closeMenus(); await page.keyboard.press('KeyJ'); }
    await journal.waitFor({ state: 'visible' }); await page.locator('[data-journal-tab="' + tab + '"]').click();
  }
  async function isolated() {
    // Explicit fixtures isolate the new connected systems. The first check uses
    // normal generated-world input; fixtures below are not unassisted playthroughs.
    await page.evaluate(() => {
      const s = Sirens.App.getState(); s.tiles.fill(0); s.buildings = []; s.containers = []; s.structures = []; s.zombies = []; s.humans = []; s.vehicles = []; s._doorHealth = {}; s._terrainHealth = {};
      s.player.x = 3072; s.player.y = 3072; s.player.health = 100; s.player.stamina = 100; s.player.cooldown = 0; s.player.vehicleId = null; s.player.resting = false;
    });
  }
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-ui="mode"]').selectOption('openworld');
    await page.locator('[data-command="start"]').click();
    await check('normal generated cabin loot earns insight through the E shortcut', async () => {
      const before = await state(); await page.keyboard.press('KeyE');
      await until(n => Sirens.App.getState().progression.insight === n + 1, before.progression.insight);
      assert.equal((await state()).progression.totals.loot, 1);
    });
    await check('keyboard journal pauses simulation and traps focus inside its dialog', async () => {
      await page.keyboard.press('KeyJ'); await journal.waitFor({ state: 'visible' });
      const before = await state(); await page.keyboard.down('KeyD'); await page.waitForTimeout(300); await page.keyboard.up('KeyD');
      assert.equal((await state()).elapsed, before.elapsed); assert.equal((await state()).player.x, before.player.x);
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Close survivor journal');
      await page.keyboard.press('Shift+Tab'); assert(await page.evaluate(() => document.activeElement.closest('[data-ui="journal-overlay"]') !== null));
      await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Close survivor journal');
      await page.keyboard.press('Escape'); assert(!(await journal.isVisible())); assert.equal(await page.evaluate(() => Sirens.App.getScreen()), 'playing');
    });
    await openJournal('projects'); await isolated();
    await check('unavailable projects explain costs and remain disabled through idle UI refreshes', async () => {
      await page.evaluate(() => { const s = Sirens.App.getState(); s.player.inventory = {}; s.progression.insight = 0; s.progression.research = []; });
      await until(() => document.querySelector('[data-action="research:salvage"]').disabled);
      assert.match(await page.locator('[data-project="salvage"]').innerText(), /insight/); assert.match(await page.locator('[data-project="salvage"]').innerText(), /screwdriver/i);
      await page.waitForTimeout(350); assert(await page.locator('[data-action="research:salvage"]').isDisabled());
      assert(await page.locator('[data-action="research:mechanics"]').isDisabled());
    });
    await check('learning through Projects pays its displayed costs, keeps tools and unlocks successors', async () => {
      await page.evaluate(() => { const s = Sirens.App.getState(); s.player.inventory = { scrap: 8, screwdriver: 1, hammer: 1, wire: 1 }; s.progression.insight = 5; });
      await until(() => !document.querySelector('[data-action="research:salvage"]').disabled);
      await page.locator('[data-action="research:salvage"]').click();
      await until(() => Sirens.App.getState().progression.research.includes('salvage'));
      let s = await state(); assert.equal(s.player.inventory.scrap, 6); assert.equal(s.player.inventory.screwdriver, 1); assert.equal(s.progression.insight, 4);
      await until(() => !document.querySelector('[data-action="research:mechanics"]').disabled); await page.locator('[data-action="research:mechanics"]').click();
      await until(() => Sirens.App.getState().progression.research.includes('mechanics'));
      s = await state(); assert.equal(s.player.inventory.scrap, 2); assert.equal(s.player.inventory.hammer, 1); assert.equal(s.player.inventory.wire || 0, 0); assert.equal(s.progression.insight, 2);
      await page.waitForTimeout(300); assert(await page.locator('[data-action="research:mechanics"]').isDisabled());
      await page.screenshot({ path: '.test-results/projects.png' });
    });
    await check('Pack separates owned items, crafting and the original catalogue without granting supplies', async () => {
      await page.keyboard.press('KeyI'); await pack.waitFor({ state: 'visible' }); assert(!(await journal.isVisible()));
      assert(await page.locator('[data-ui="items-pane"]').isVisible()); assert(!(await page.locator('[data-ui="crafting-pane"]').isVisible()));
      await page.locator('[data-command="crafting"]').click(); assert(await page.locator('[data-ui="crafting-pane"]').isVisible()); assert(!(await page.locator('[data-ui="items-pane"]').isVisible()));
      const before = JSON.stringify((await state()).player.inventory); await page.locator('[data-command="catalogue"]').click();
      await page.locator('[data-ui="item-search"]').fill('machete'); assert.equal(await page.locator('[data-item="machete"]').count(), 1);
      assert.equal(await page.locator('[data-item="machete"] button').count(), 0); assert.equal(JSON.stringify((await state()).player.inventory), before);
      await page.locator('[data-ui="item-search"]').fill(''); await page.locator('[data-command="owned"]').click();
    });
    await check('studying from Pack grants one reward, keeps the manual, and stays disabled afterward', async () => {
      await page.evaluate(() => { Sirens.App.getState().player.inventory.first_aid_manual = 1; });
      await until(() => document.querySelector('[data-action="study:first_aid_manual"]'));
      const before = await state(); await page.locator('[data-action="study:first_aid_manual"]').click();
      await until(() => Sirens.App.getState().progression.studied.includes('first_aid_manual'));
      const after = await state(); assert.equal(after.player.inventory.first_aid_manual, 1); assert.equal(after.progression.xp.care, before.progression.xp.care + 18); assert.equal(after.progression.insight, before.progression.insight + 1);
      await page.waitForTimeout(350); assert(await page.locator('[data-action="study:first_aid_manual"]').isDisabled());
    });
    await check('Crafting presents actual missing requirements and only pays a successful recipe', async () => {
      await page.evaluate(() => { Sirens.App.getState().player.inventory = { dirty_water: 2, wood: 1, scrap: 2 }; });
      await page.locator('[data-command="crafting"]').click();
      assert(await page.locator('[data-craft="boil_water"]').isDisabled());
      assert.match(await page.locator('[data-craft="boil_water"]').locator('..').innerText(), /campfire/i);
      const before = await state(); await page.locator('[data-craft="field_wraps"]').click();
      await until(() => Sirens.App.getState().progression.totals.craft > 0);
      const after = await state(); assert.equal(after.player.inventory.bandage, 2); assert.equal(after.player.inventory.scrap || 0, 0); assert.equal(after.progression.xp.craft, before.progression.xp.craft + 5);
      await page.keyboard.press('Escape');
    });
    await check('survivor dialogue delivers requests, remembers trust and exposes finite daily stock', async () => {
      await isolated();
      await page.evaluate(() => {
        const s = Sirens.App.getState(), h = { ...Sirens.Actors.spawnForChunk(s.seed, 0, 0)[0], x: s.player.x + 38, y: s.player.y };
        s.humans = [h]; const c = Sirens.Progression.contact(s, h); c.request = 0; s.player.inventory = { bandage: 2, food: 3 };
      });
      await page.keyboard.press('KeyE'); await page.locator('[data-ui="conversation-overlay"]').waitFor({ state: 'visible' });
      const paused = await state(); await page.waitForTimeout(220); assert.equal((await state()).elapsed, paused.elapsed);
      assert.match(await page.locator('[data-ui="conversation-help"]').innerText(), /medical/i); await page.locator('[data-ui="conversation-help"]').click();
      await until(() => Sirens.App.getState().progression.contacts['h:0,0:0'].trust === 3);
      let s = await state(); assert.equal(s.player.inventory.bandage || 0, 0); assert.equal(s.player.inventory.food, 5); assert.equal(s.player.inventory.scrap, 2);
      assert(!(await page.locator('[data-ui="conversation-help"]').isVisible()));
      for (let i = 0; i < 3; i++) { await page.locator('[data-ui="conversation-trade"]').click(); await until(n => Sirens.App.getState().progression.contacts['h:0,0:0'].stock === n, 2 - i); }
      await until(() => document.querySelector('[data-ui="conversation-trade"]').hidden); assert(!(await page.locator('[data-ui="conversation-trade"]').isVisible()));
      s = await state(); assert.equal(s.progression.contacts['h:0,0:0'].trust, 6);
      await page.keyboard.press('Escape'); await openJournal('people'); assert.match(await journal.innerText(), /Trust 6\/20/); assert.match(await journal.innerText(), /helped them today/i);
    });
    await check('journal abilities repair a real car and collect untreated rainwater at exact costs', async () => {
      await page.evaluate(() => {
        const s = Sirens.App.getState(); s.humans = []; s.progression.research = ['salvage', 'shelter', 'mechanics', 'water']; s.player.inventory = { hammer: 1, scrap: 3, empty_bottle: 1 }; s.weather = 'rain';
        s.vehicles = [{ ...Sirens.Vehicles.spawnForChunk(s.seed, 0, 0)[0], x: s.player.x + 40, y: s.player.y, condition: 40, speed: 0 }];
      });
      await openJournal('overview'); await until(() => !document.querySelector('[data-action="ability:repair"]').disabled);
      await page.locator('[data-action="ability:repair"]').click(); await until(() => Sirens.App.getState().vehicles[0].condition === 65);
      assert.equal((await state()).player.inventory.scrap || 0, 0); assert.equal((await state()).player.inventory.hammer, 1);
      await until(() => !document.querySelector('[data-action="ability:rain"]').disabled); await page.locator('[data-action="ability:rain"]').click();
      await until(() => Sirens.App.getState().player.inventory.dirty_water === 1); assert.equal((await state()).player.inventory.empty_bottle || 0, 0);
    });
    await check('sleep begins through the journal, stays paused there and wakes on actual movement', async () => {
      await page.evaluate(() => { const s = Sirens.App.getState(); s.progression.fatigue = 30; s.tiles[Math.floor(s.player.y / 32) * s.width + Math.floor(s.player.x / 32)] = 2; s.vehicles = []; });
      await until(() => !document.querySelector('[data-action="ability:sleep"]').disabled); await page.locator('[data-action="ability:sleep"]').click();
      await until(() => Sirens.App.getState().progression.sleeping); const before = await state(); await page.waitForTimeout(250); assert.equal((await state()).progression.fatigue, before.progression.fatigue);
      await page.keyboard.press('Escape'); await until(n => Sirens.App.getState().progression.fatigue < n - .5, before.progression.fatigue);
      await page.keyboard.down('KeyD'); try { await until(() => !Sirens.App.getState().progression.sleeping); } finally { await page.keyboard.up('KeyD'); }
    });
    await check('field guide searches connected mechanics and journal text renders as text', async () => {
      await openJournal('guide'); await page.locator('[data-journal="search"]').fill('rain collection');
      assert.match(await page.locator('[data-journal="content"]').innerText(), /untreated water/i);
      await page.evaluate(() => { const s = Sirens.App.getState(); Sirens.Progression.write(s, 'find', '<img src=x onerror="window.badJournal=true">'); });
      await page.locator('[data-journal-tab="daybook"]').click(); assert.equal(await page.locator('[data-journal="content"] img').count(), 0);
      assert.match(await page.locator('[data-journal="content"]').innerText(), /<img src=x/); assert.equal(await page.evaluate(() => window.badJournal), undefined);
    });
    await check('Atlas pointer and keyboard create saved global markers without moving the survivor', async () => {
      await openJournal('atlas'); const before = await state(), map = page.locator('[data-journal="atlas"]'), box = await map.boundingBox();
      assert(box); await map.evaluate(canvas => canvas.addEventListener('click', e => { const rect = canvas.getBoundingClientRect(); window.atlasClickPosition = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }; }, { once: true }));
      await map.click({ position: { x: box.width * .6, y: box.height * .4 } });
      await until(() => Sirens.App.getState().progression.tracking && Sirens.App.getState().progression.tracking.kind === 'place');
      const pointer = await state(); assert.equal(pointer.player.x, before.player.x); assert.equal(pointer.player.y, before.player.y);
      const click = await page.evaluate(() => window.atlasClickPosition);
      const expected = { x: (Math.floor(click.x * before.width) + .5 + before.world.originX) * 32, y: (Math.floor(click.y * before.height) + .5 + before.world.originY) * 32 };
      assert.equal(pointer.progression.tracking.x, expected.x); assert.equal(pointer.progression.tracking.y, expected.y);
      await map.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
      const marked = await state(); assert.equal(marked.progression.tracking.x, expected.x + 32); assert.equal(marked.progression.tracking.y, expected.y + 32);
      assert.equal(await page.evaluate(() => document.activeElement.dataset.journal), 'atlas');
      assert.equal(marked.player.x, before.player.x); await page.screenshot({ path: '.test-results/atlas.png' });
    });
    await check('progress, contacts and navigation survive page reload and real Continue', async () => {
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await until(() => Sirens.App.getScreen() === 'paused');
      // The isolated terrain above deliberately flattens generated buildings and
      // is not a legal world journal. Import its earned progression into fresh
      // generated terrain before testing the actual save / reload / Continue flow.
      const portable = await page.evaluate(() => {
        const previous = Sirens.App.getState(), fresh = Sirens.Engine.create(previous.seed, 'calm', 'openworld');
        fresh.elapsed = previous.elapsed; fresh.day = previous.day; fresh.time = previous.time;
        fresh.progression = JSON.parse(JSON.stringify(previous.progression));
        const save = Sirens.Engine.serialize(fresh); Sirens.Engine.deserialize(save); return save;
      });
      await page.locator('[data-ui="import"]').setInputFiles({ name: 'progression-fixture.json', mimeType: 'application/json', buffer: Buffer.from(portable) });
      await until(() => Sirens.App.getScreen() === 'playing'); await page.keyboard.press('Escape'); await until(() => Sirens.App.getScreen() === 'paused');
      await page.locator('[data-command="save"]').click(); const before = await state(); await page.reload();
      await page.locator('[data-command="continue"]').click(); await until(() => Sirens.App.getScreen() === 'playing'); await page.keyboard.press('KeyJ');
      const after = await state(); assert.deepEqual(after.progression.research, before.progression.research); assert.deepEqual(after.progression.studied, before.progression.studied);
      for (const [id, contact] of Object.entries(before.progression.contacts)) for (const field of ['name', 'alive', 'trust', 'stock', 'completedDay', 'request', 'trait', 'homeX', 'homeY']) assert.equal(after.progression.contacts[id][field], contact[field]);
      assert.deepEqual(after.progression.tracking, before.progression.tracking);
    });
    await check('sound volume, camera zoom, motion and HUD preferences persist across reload', async () => {
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await until(() => Sirens.App.getScreen() === 'paused');
      await page.locator('[data-setting="volume"]').focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
      await page.locator('[data-setting="zoom"]').focus(); await page.keyboard.press('Home'); await page.locator('[data-setting="motion"]').uncheck();
      const prefs = await page.evaluate(() => Sirens.App.getPreferences()); assert.equal(prefs.volume, .1); assert.equal(prefs.zoom, .7); assert.equal(prefs.motion, false);
      assert.equal(await page.evaluate(() => Sirens.App.getAudioMetrics().volume), .1);
      await page.keyboard.press('Escape'); await page.locator('[data-command="details"]').click(); const expected = await page.evaluate(() => Sirens.App.getPreferences());
      assert(expected.details); await page.reload(); assert.deepEqual(await page.evaluate(() => Sirens.App.getPreferences()), expected);
      assert.deepEqual(await page.evaluate(() => Sirens.App.getView()), { zoom: .7, ambientMotion: false });
      await page.locator('[data-command="continue"]').click();
    });
    await check('camera zoom preserves pointer coordinates and actual attacks remain playable', async () => {
      const result = await page.evaluate(() => {
        const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 800; document.body.append(canvas);
        Object.assign(canvas.style, { position: 'fixed', left: '0px', top: '0px', width: '1000px', height: '800px' });
        const r = new Sirens.Renderer(canvas); r.width = 1000; r.height = 800; const s = Sirens.Engine.create(0, 'calm', 'rescue'); s.player.x = 1000; s.player.y = 900;
        r.syncOrigin(s); r.zoom = .7; const wide = r.screenToWorld(570, 470, s); r.zoom = 1.5; const close = r.screenToWorld(650, 550, s); canvas.remove(); return { wide, close };
      });
      assert.deepEqual(result.wide, { x: 1100, y: 1000 }); assert.deepEqual(result.close, { x: 1100, y: 1000 });
      await isolated(); await page.evaluate(() => { const s = Sirens.App.getState(); s.player.inventory.bat = 1; Sirens.Engine.action(s, 'equip:bat'); });
      await page.mouse.move(820, 530); await page.mouse.down(); try { await until(() => Sirens.Effects.pose(Sirens.App.getState()).attack); } finally { await page.mouse.up(); }
    });
    await check('compact HUD expands on demand and menus fit narrow and short viewports', async () => {
      if (await page.locator('[data-command="details"]').getAttribute('aria-pressed') === 'true') await page.locator('[data-command="details"]').click();
      assert.equal(await page.locator('#ui').getAttribute('data-details'), 'compact');
      for (const [width, height] of [[390, 844], [700, 300], [1440, 960]]) {
        await page.setViewportSize({ width, height }); await openJournal('projects');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        const close = await page.locator('[data-ui="journal-overlay"] .as-close').boundingBox(); assert(close && close.x >= 0 && close.x + close.width <= width + 1 && close.y >= 0 && close.y < height);
        await page.keyboard.press('Escape'); await page.keyboard.press('KeyI'); await pack.waitFor({ state: 'visible' });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false); await page.keyboard.press('Escape');
      }
    });
    await check('assembled progression UI works offline without uncaught errors or asset requests', async () => {
      assert.deepEqual(errors, []); assert.deepEqual(requests, []); const audio = await page.evaluate(() => Sirens.App.getAudioMetrics()); assert(Number.isFinite(audio.peak));
      assert(await page.evaluate(() => Object.values(Sirens.App.getState().progression.xp).every(Number.isFinite)));
    });
    const report = { passed, errors, networkRequests: requests, browser: await browser.version() };
    fs.writeFileSync('.test-results/progression-browser-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
