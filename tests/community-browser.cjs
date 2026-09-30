'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  fs.mkdirSync('.test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 }); page.setDefaultTimeout(12000);
  const passed = [], errors = [], requests = []; let crowdMetrics;
  page.on('pageerror', e => errors.push(e.message)); page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
  const state = () => page.evaluate(() => Sirens.App.getState());
  const until = (fn, arg) => page.waitForFunction(fn, arg, { polling: 'raf', timeout: 12000 });
  const journal = page.locator('[data-ui="journal-overlay"]');
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  async function tab(name) { if (!(await journal.isVisible())) await page.keyboard.press('KeyJ'); await journal.waitFor({ state: 'visible' }); await page.locator('[data-journal-tab="' + name + '"]').click(); }
  async function renderPlayerPixels() {
    return page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 160;
      const renderer = new Sirens.Renderer(document.createElement('canvas')); renderer.ctx = canvas.getContext('2d');
      const s = Sirens.App.getState(); renderer.ctx.translate(80 - s.player.x, 80 - s.player.y); renderer.drawPlayer(s.player, s);
      return Array.from(renderer.ctx.getImageData(0, 0, 160, 160).data);
    });
  }
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href); await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-ui="mode"]').selectOption('openworld'); await page.locator('[data-command="start"]').click();
    await check('Base establishes home from the generated cabin through a real journal action', async () => {
      await tab('base'); assert(await page.locator('[data-action="base:home"]').isEnabled()); const before = await state();
      await page.locator('[data-action="base:home"]').click(); await until(() => !!Sirens.App.getState().settlement.home);
      const after = await state(); assert.equal(after.settlement.home.x, before.player.x + before.world.originX * 32); assert.equal(after.settlement.home.y, before.player.y + before.world.originY * 32);
      await until(() => document.querySelector('[data-action="base:home"]').disabled); assert.match(await journal.innerText(), /Home established/);
    });
    // The next checks use explicit isolated fixtures for each connected mechanic.
    // The save check separately imports only valid generated terrain.
    await page.evaluate(() => {
      const s = Sirens.App.getState(); s.tiles.fill(0); s._doorHealth = {}; s._terrainHealth = {}; s.buildings = []; s.containers = []; s.zombies = []; s.humans = []; s.vehicles = [];
      s.player.x = 3072; s.player.y = 3072; s.player.angle = 0; s.player.health = 100; s.player.vehicleId = null;
      s.player.inventory = { bat: 1, pistol: 1, wood: 4, carrot_seeds: 2, dirty_water: 1, food: 6, stone_pick: 2 };
      delete s.settlement; Sirens.Settlement.ensure(s); s.structures = [{ x: 3072, y: 3104, type: 'campfire', health: 100 }];
    });
    await check('planting and watering show exact costs, growth status and unavailable harvest reasons', async () => {
      await until(() => !document.querySelector('[data-action="base:home"]').disabled); await page.locator('[data-action="base:home"]').click();
      await until(() => !document.querySelector('[data-action="base:plant"]').disabled); const before = await state(); await page.locator('[data-action="base:plant"]').click();
      await until(() => Sirens.App.getState().settlement.plots.length === 1); let s = await state();
      assert.equal(s.player.inventory.carrot_seeds, before.player.inventory.carrot_seeds - 1); assert.equal(s.player.inventory.wood, before.player.inventory.wood - 1);
      assert(await page.locator('[data-action="base:harvest"]').isDisabled()); assert.match(await journal.innerText(), /still growing/);
      await page.locator('[data-action="base:water"]').click(); await until(() => Sirens.App.getState().settlement.plots[0].moisture === 100);
      assert.equal((await state()).player.inventory.dirty_water || 0, 0); assert.match(await journal.innerText(), /Soil has water/);
      await page.evaluate(() => { const s = Sirens.App.getState(); for (let i = 0; i < 90; i++) Sirens.Settlement.update(s, 1); });
      await until(() => !document.querySelector('[data-action="base:harvest"]').disabled); await page.locator('[data-action="base:harvest"]').click();
      await until(() => Sirens.App.getState().settlement.plots.length === 0); assert.equal((await state()).player.inventory.carrot, 2);
    });
    await check('shared supplies transfer one item and companion job controls reflect stored tool requirements', async () => {
      const before = await state(); await page.locator('[data-action="base:store:food"]').click(); await until(() => Sirens.App.getState().settlement.stock.food === 1);
      assert.equal((await state()).player.inventory.food, before.player.inventory.food - 1);
      await page.locator('[data-action="base:take:food"]').click(); await until(() => !Sirens.App.getState().settlement.stock.food); assert.equal((await state()).player.inventory.food, before.player.inventory.food);
      await page.evaluate(() => { const s = Sirens.App.getState(); s.humans = [{ ...Sirens.Actors.spawnForChunk(s.seed, 0, 0)[0], x: s.player.x + 50, y: s.player.y, following: true }]; });
      await tab('base');
      await until(() => document.querySelector('[data-action="base:job:h:0,0:0:gather"]'));
      assert(await page.locator('[data-action="base:job:h:0,0:0:gather"]').isDisabled()); assert.match(await page.locator('[data-action="base:job:h:0,0:0:gather"]').getAttribute('title'), /pick/i);
      await page.locator('[data-action="base:store:stone_pick"]').click(); await until(() => !document.querySelector('[data-action="base:job:h:0,0:0:gather"]').disabled);
      await page.locator('[data-action="base:job:h:0,0:0:gather"]').click(); await until(() => Sirens.App.getState().settlement.jobs['h:0,0:0'].role === 'gather');
      await until(() => document.querySelector('[data-ui="journal-overlay"]').innerText.includes('Job: gather')); assert.match(await journal.innerText(), /Job: gather/); assert.match(await journal.innerText(), /Mood 60\/100/);
    });
    await check('two appearance choices change actual rendered survivor pixels and save state', async () => {
      await tab('appearance'); const original = await renderPlayerPixels(); await page.locator('[data-action="personal:style:coat:blue"]').click();
      await until(() => Sirens.App.getState().personal.look.coat === 'blue'); const coat = await renderPlayerPixels(); assert.notDeepEqual(coat, original);
      await page.locator('[data-action="personal:style:hat:cap"]').click(); await until(() => Sirens.App.getState().personal.look.hat === 'cap');
      assert.notDeepEqual(await renderPlayerPixels(), coat); assert(await page.locator('[data-action="personal:style:coat:blue"]').isDisabled());
      await page.screenshot({ path: '.test-results/appearance.png' });
    });
    await check('Pets befriends, feeds and changes modes at their displayed costs with a visible sprite', async () => {
      await page.evaluate(() => { const s = Sirens.App.getState(), pet = Sirens.Personal.wild(s).find(p => p.kind === 'dog'); s.player.x = pet.x; s.player.y = pet.y; s.player.inventory.food = 4; s.humans = []; });
      await tab('pets'); await until(() => !document.querySelector('[data-action="personal:tame"]').disabled); const before = await state();
      await page.locator('[data-action="personal:tame"]').click(); await until(() => Sirens.App.getState().personal.pets.length === 1);
      const s = await state(), pet = s.personal.pets[0]; assert.equal(s.player.inventory.food, before.player.inventory.food - 1);
      assert(await page.locator('[data-pet="' + pet.id + '"]').isVisible()); await page.locator('[data-action="personal:feed:' + pet.id + '"]').click();
      await until(() => Sirens.App.getState().personal.pets[0].care === 100); assert.equal((await state()).player.inventory.food, before.player.inventory.food - 2);
      await page.locator('[data-action="personal:mode:' + pet.id + ':stay"]').click(); await until(() => Sirens.App.getState().personal.pets[0].mode === 'stay');
      const visible = await page.evaluate(() => {
        const canvas = document.createElement('canvas'); canvas.width = 100; canvas.height = 100; const r = new Sirens.Renderer(document.createElement('canvas')); r.ctx = canvas.getContext('2d');
        const s = Sirens.App.getState(), owned = s.personal.pets[0], p = { ...owned, ...Sirens.Personal.local(s, owned), owned: true }; r.ctx.translate(50 - p.x, 50 - p.y); r.drawPet(p, s);
        return Array.from(r.ctx.getImageData(0, 0, 100, 100).data).some((v, i) => i % 4 === 3 && v > 0);
      }); assert(visible); await page.screenshot({ path: '.test-results/pets.png' });
    });
    await check('Forces aid, alliance and support spend the shared stockpile and create real friendly defenders', async () => {
      await page.evaluate(() => { const s = Sirens.App.getState(); s.player.x = s.settlement.home.x - s.world.originX * 32; s.player.y = s.settlement.home.y - s.world.originY * 32; s.settlement.stock = { food: 10, bandage: 2, scrap: 3 }; });
      await tab('forces'); assert(await page.locator('[data-action="faction:ally:commune"]').isDisabled());
      await page.locator('[data-action="faction:aid:commune"]').click(); await until(() => Sirens.App.getState().warfare.reputation.commune === 3);
      assert.equal((await state()).settlement.stock.food, 8); await until(() => !document.querySelector('[data-action="faction:ally:commune"]').disabled);
      await page.locator('[data-action="faction:ally:commune"]').click(); await until(() => Sirens.App.getState().warfare.alliances.includes('commune'));
      const b = (await state()).settlement; assert.equal(b.stock.food, 5); assert.equal(b.stock.bandage || 0, 0); assert.equal(b.stock.scrap || 0, 0);
      await page.locator('[data-action="faction:support:commune"]').click(); await until(() => Sirens.App.getState().humans.length > 0);
      assert.equal((await state()).humans.length, 8); assert((await state()).humans.every(h => h.faction === 'survivor')); assert.equal((await state()).settlement.stock.food, 3);
      await until(() => document.querySelector('[data-action="faction:support:commune"]').disabled); assert.match(await journal.innerText(), /Support returns/);
      await page.screenshot({ path: '.test-results/forces.png' });
    });
    await check('beginning a real horde siege creates enemies and reports its active waves in the HUD', async () => {
      await page.locator('[data-action="faction:battle:undead"]').click(); await until(() => Sirens.App.getState().warfare.battle && Sirens.App.getState().warfare.battle.active);
      const s = await state(); assert(s.warfare.battle.spawned > 0 && s.warfare.battle.spawned <= 60); assert.equal(s.warfare.battle.pending, 3);
      assert.match(await page.locator('[data-battle="undead"]').innerText(), /waves remaining/); await page.keyboard.press('Escape');
      await until(() => document.querySelector('[data-ui="world-event"]').textContent.includes('HORDE SIEGE'));
      await page.screenshot({ path: '.test-results/siege.png' }); await tab('forces');
    });
    await check('community systems persist through a valid generated portable save and real Continue', async () => {
      const portable = await page.evaluate(() => {
        const s = Sirens.Engine.create(42, 'calm', 'openworld'); s.zombies = []; s.humans = []; Sirens.Engine.action(s, 'base:home'); s.settlement.stock = { food: 4, stone_pick: 1 };
        Sirens.Engine.action(s, 'personal:style:coat:blue'); Sirens.Engine.action(s, 'personal:style:hat:cap');
        const stray = Sirens.Personal.wild(s).find(p => p.kind === 'dog'); s.player.x = stray.x; s.player.y = stray.y; Sirens.Engine.action(s, 'personal:tame');
        Sirens.Engine.action(s, 'personal:mode:' + s.personal.pets[0].id + ':stay'); s.warfare.reputation.commune = 3; s.warfare.alliances = ['commune'];
        const save = Sirens.Engine.serialize(s); Sirens.Engine.deserialize(save); return save;
      });
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.locator('[data-ui="import"]').setInputFiles({ name: 'community-fixture.json', mimeType: 'application/json', buffer: Buffer.from(portable) });
      await until(() => Sirens.App.getScreen() === 'playing'); await page.keyboard.press('Escape'); await page.locator('[data-command="save"]').click(); const before = await state();
      await page.reload(); await page.locator('[data-command="continue"]').click(); await until(() => Sirens.App.getScreen() === 'playing'); await tab('pets'); const restored = await state();
      assert.deepEqual(restored.personal.look, before.personal.look); assert.equal(restored.personal.pets[0].id, before.personal.pets[0].id); assert.equal(restored.personal.pets[0].mode, 'stay');
      assert.deepEqual(restored.settlement.home, before.settlement.home); assert.deepEqual(restored.settlement.stock, before.settlement.stock); assert.deepEqual(restored.warfare.alliances, ['commune']);
    });
    await check('community dialogs stay keyboard accessible and fit a 390-pixel viewport', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      for (const name of ['base', 'appearance', 'pets', 'forces']) {
        await tab(name); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        await page.locator('[data-ui="journal-overlay"] .as-close').focus(); await page.keyboard.press('Shift+Tab'); assert(await page.evaluate(() => document.activeElement.closest('[data-ui="journal-overlay"]') !== null));
        await page.keyboard.press('Escape'); assert(!(await journal.isVisible()));
      }
      await page.setViewportSize({ width: 1440, height: 960 });
    });
    await check('maximum zombie and human crowds render finite frames without crashing', async () => {
      await page.evaluate(() => {
        const s = Sirens.App.getState(); s.tiles.fill(0); s.buildings = []; s.containers = []; s.structures = []; s.zombies = []; s.humans = []; s.vehicles = [];
        s.player.x = 3072; s.player.y = 3072; s.player.health = 100; s.player.vehicleId = null; s.warfare.battle = null; s.warfare.alliances = ['commune', 'wardens', 'ashen'];
        while (s.zombies.length < Sirens.World.limits.maxActiveZombies) if (!Sirens.Engine.spawnWanderers(s, 8)) break;
        s.humans = Array.from({ length: Sirens.World.limits.maxActiveHumans }, (_, i) => ({ id: 'h:0,0:' + (i + 200), x: s.player.x + Math.cos(i) * 150, y: s.player.y + Math.sin(i) * 150, health: 100, faction: 'survivor', name: 'Crowd ' + i, following: false, angle: 0, weapon: i % 3 ? 'bat' : 'pistol', cooldown: 0 }));
        window.initialCrowd = { zombies: s.zombies.length, humans: s.humans.length };
      });
      assert.deepEqual(await page.evaluate(() => window.initialCrowd), { zombies: 360, humans: 128 }); await page.waitForTimeout(2200);
      crowdMetrics = await page.evaluate(() => ({ ...Sirens.App.getMetrics(), zombies: Sirens.App.getState().zombies.length, humans: Sirens.App.getState().humans.length }));
      assert(Number.isFinite(crowdMetrics.frameMs)); assert(Number.isFinite(crowdMetrics.p95)); assert(crowdMetrics.zombies <= 360); assert(crowdMetrics.humans <= 128);
      assert(await page.evaluate(() => Sirens.App.getState().zombies.concat(Sirens.App.getState().humans).every(v => [v.x, v.y, v.health].every(Number.isFinite))));
      await page.screenshot({ path: '.test-results/crowd.png' });
    });
    await check('assembled community gameplay makes no external requests and reports no uncaught errors', async () => { assert.deepEqual(errors, []); assert.deepEqual(requests, []); });
    const report = { passed, errors, networkRequests: requests, crowd: crowdMetrics, browser: await browser.version() };
    fs.writeFileSync('.test-results/community-browser-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
