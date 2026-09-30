'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// This suite exercises the assembled offline interface with real clicks and keys.
// Inventory fixtures provide exact crafting materials and a bounded pack sample;
// they are not evidence of acquiring rare equipment through an unassisted run.
(async () => {
  const resultDir = path.resolve(__dirname, '../.test-results');
  fs.mkdirSync(resultDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(15000);
  const passed = [], errors = [], requests = [], fixtures = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  const check = async (name, fn) => { await fn(); passed.push(name); console.log('PASS ' + name); };
  const until = (fn, arg) => page.waitForFunction(fn, arg, { polling: 'raf', timeout: 15000 });
  const inventory = () => page.evaluate(() => ({ ...Sirens.App.getState().player.inventory }));
  const rowIds = (kind = 'items') => page.locator(`[data-ui="${kind}"] [data-${kind === 'items' ? 'item' : 'recipe'}]`).evaluateAll((rows) => rows.map((row) => row.dataset.item || row.dataset.recipe));
  const clearItems = () => page.locator('[data-clear-filters="items"]').click();
  const clearRecipes = () => page.locator('[data-clear-filters="recipes"]').click();
  let counts, rareId, craftFixture;
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await until(() => window.Sirens && Sirens.App && Sirens.App.getScreen() === 'title');
    counts = await page.evaluate(() => ({ items: Object.keys(Sirens.Catalog.items).length, recipes: Sirens.Catalog.recipes.length }));
    await check('title reports the complete expanded catalogue and recipe counts', async () => {
      assert(counts.items >= 3000); assert(counts.recipes >= 3000);
      assert.equal(Number(await page.locator('[data-ui="catalogue-count"]').innerText()), counts.items);
      assert.equal(Number(await page.locator('[data-ui="recipe-count"]').innerText()), counts.recipes);
    });
    await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-command="start"]').click();
    await page.keyboard.press('KeyI');
    await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'visible' });
    await page.locator('[data-command="catalogue"]').click();
    await check('catalogue renders 48 definitions and never grants owned supplies', async () => {
      const before = await inventory();
      assert.equal((await rowIds()).length, 48);
      assert.equal(Number(await page.locator('[data-ui="items-count"]').getAttribute('data-total')), counts.items);
      assert.equal(Number(await page.locator('[data-ui="items-count"]').getAttribute('data-matched')), counts.items);
      assert.equal(Number(await page.locator('[data-ui="items-pages"]').getAttribute('data-pages')), Math.ceil(counts.items / 48));
      assert.equal(await page.locator('[data-ui="items"] [data-use], [data-ui="items"] [data-equip], [data-ui="items"] [data-drop]').count(), 0);
      await page.locator('[data-page="items"][data-step="1"]').click();
      await page.locator('[data-page="items"][data-edge="first"]').click();
      assert.deepEqual(await inventory(), before);
    });
    await check('keyboard pagination reaches distinct later rows and clamps the last page', async () => {
      const first = await rowIds(), next = page.locator('[data-page="items"][data-step="1"]');
      await next.focus(); await page.keyboard.press('Space');
      assert.equal(await page.locator('[data-ui="items-pages"]').getAttribute('data-current'), '2');
      const second = await rowIds(); assert.equal(second.length, 48); assert(second.every((id) => !first.includes(id)));
      await page.locator('[data-page="items"][data-edge="last"]').click();
      const last = await rowIds(); assert.equal(last.length, counts.items % 48 || 48);
      assert(await page.locator('[data-page="items"][data-step="1"]').isDisabled());
      assert(await page.locator('[data-page="items"][data-edge="last"]').isDisabled());
      assert.match(await page.locator('[data-ui="items-page-status"]').innerText(), new RegExp('to ' + counts.items + ' of ' + counts.items));
    });
    await check('family and tier filters show matching definitions and reset the page', async () => {
      const filter = await page.evaluate(() => {
        const groups = new Map();
        for (const item of Object.values(Sirens.Catalog.items)) { const key = JSON.stringify([item.family, item.tier]); groups.set(key, (groups.get(key) || 0) + 1); }
        const [key, count] = [...groups].sort((a, b) => b[1] - a[1])[0];
        const [family, tier] = JSON.parse(key); return { family, tier, count };
      });
      await page.locator('[data-ui="item-family"]').selectOption(filter.family);
      await page.locator('[data-ui="item-tier"]').selectOption(String(filter.tier));
      assert.equal(await page.locator('[data-ui="items-pages"]').getAttribute('data-current'), '1');
      assert.equal(Number(await page.locator('[data-ui="items-count"]').getAttribute('data-matched')), filter.count);
      const rows = await page.locator('[data-ui="items"] [data-item]').evaluateAll((rows) => rows.map((row) => ({ family: Sirens.Catalog.items[row.dataset.item].family, tier: Sirens.Catalog.items[row.dataset.item].tier })));
      assert(rows.length > 0 && rows.length <= 48); assert(rows.every((item) => item.family === filter.family && item.tier === filter.tier));
      await clearItems();
    });
    await check('ID search finds rare equipment and zero matches have a clear recovery', async () => {
      await page.locator('[data-ui="item-search"]').fill('machete'); assert.equal((await rowIds())[0], 'machete');
      rareId = await page.evaluate(() => Object.keys(Sirens.Catalog.items).find((id) => id.includes('_') && Sirens.Catalog.items[id].tier >= 4 && Sirens.Catalog.recipes.some((recipe) => recipe.result[id] > 0)));
      assert(rareId, 'an obtainable rare equipment definition is required');
      await page.locator('[data-ui="item-search"]').fill(rareId);
      assert.deepEqual(await rowIds(), [rareId]);
      assert.match(await page.locator('[data-item="' + rareId + '"] .as-item-lineage').innerText(), /Tier [45]/);
      await page.locator('[data-ui="item-search"]').fill('no such item in any world 4928');
      assert.equal((await rowIds()).length, 0); assert.match(await page.locator('[data-ui="items"]').innerText(), /No items match.*Clear filters/);
      assert(await page.locator('[data-page="items"][data-step="1"]').isDisabled());
      await clearItems(); assert.equal((await rowIds()).length, 48);
      assert.equal(await page.locator('[data-ui="item-search"]').inputValue(), '');
      assert.equal(await page.locator('[data-ui="items-pages"]').getAttribute('data-current'), '1');
    });
    await check('material and family searches expose useful equipment and ingredient paths', async () => {
      await page.locator('[data-ui="item-search"]').fill('copper ore');
      assert((await rowIds()).includes('wire'), 'searching a crafting material should find wire made from copper ore');
      await page.locator('[data-ui="item-search"]').fill('Material field tools');
      const rows = await page.locator('[data-ui="items"] [data-item]').evaluateAll((rows) => rows.map((row) => Sirens.Catalog.items[row.dataset.item].family));
      assert(rows.length > 0 && rows.length <= 48); assert(rows.some((family) => family === 'Material field tools'));
      await clearItems();
    });
    await check('obtaining details expose real loot locations and actual recipe requirements', async () => {
      const lootItem = await page.evaluate(() => Object.values(Sirens.Catalog.items).find((item) => item.id.includes('_') && item.family === 'Metal stock' && item.sources.length));
      assert(lootItem); await page.locator('[data-ui="item-search"]').fill(lootItem.id);
      await page.locator('[data-item="' + lootItem.id + '"] summary').click();
      const text = await page.locator('[data-item="' + lootItem.id + '"] .as-item-origin').innerText();
      assert.match(text, /Loot locations:/); assert(lootItem.sources.some((source) => text.toLowerCase().includes(source.replace(/_/g, ' '))));
      await page.locator('[data-ui="item-search"]').fill(rareId);
      await page.locator('[data-item="' + rareId + '"] summary').click();
      const row = page.locator('[data-item="' + rareId + '"]');
      assert.match(await row.innerText(), /Make with .*:/); assert(await row.locator('[data-show-recipe]').count() > 0);
      const recipeId = await row.locator('[data-show-recipe]').first().getAttribute('data-show-recipe');
      const before = await inventory(); await row.locator('[data-show-recipe]').first().click();
      assert(await page.locator('[data-ui="crafting-pane"]').isVisible()); assert.deepEqual(await rowIds('recipes'), [recipeId]);
      assert.equal(await page.locator('[data-ui="recipe-search"]').inputValue(), recipeId); assert.deepEqual(await inventory(), before);
      await page.locator('[data-command="catalogue"]').click(); assert.equal(await page.locator('[data-ui="item-search"]').inputValue(), rareId);
      assert.deepEqual(await rowIds(), [rareId]);
    });
    await check('idle catalogue and changing needs preserve its existing DOM rows', async () => {
      await clearItems();
      await page.evaluate(() => { window.__catalogueRow = document.querySelector('[data-ui="items"] [data-item]'); Sirens.App.getState().player.health = 79; Sirens.App.getState().player.hunger = 42; });
      fixtures.push('Change health and hunger while paused to isolate catalogue invalidation');
      await page.waitForTimeout(500);
      assert(await page.evaluate(() => __catalogueRow === document.querySelector('[data-ui="items"] [data-item]')));
      assert.equal((await rowIds()).length, 48);
    });
    await page.locator('[data-command="crafting"]').click();
    await clearRecipes();
    await check('recipe pages stay bounded and search resets a later page', async () => {
      assert.equal((await rowIds('recipes')).length, 24);
      assert.equal(Number(await page.locator('[data-ui="recipes-count"]').getAttribute('data-total')), counts.recipes);
      const first = await rowIds('recipes'); await page.locator('[data-page="recipes"][data-step="1"]').click();
      const second = await rowIds('recipes'); assert.equal(second.length, 24); assert(second.every((id) => !first.includes(id)));
      await page.locator('[data-page="recipes"][data-edge="last"]').click();
      assert.equal((await rowIds('recipes')).length, counts.recipes % 24 || 24);
      await page.locator('[data-ui="recipe-search"]').fill('field_wraps');
      assert.deepEqual(await rowIds('recipes'), ['field_wraps']);
      assert.equal(await page.locator('[data-ui="recipes-pages"]').getAttribute('data-current'), '1');
      await clearRecipes();
    });
    await check('new equipment crafting explains shortages and pays exact displayed costs', async () => {
      craftFixture = await page.evaluate(() => {
        const items = Sirens.Catalog.items;
        const recipe = Sirens.Catalog.recipes.find((recipe) => !recipe.station && Object.keys(recipe.result).some((id) => items[id].family === 'Material field tools' && items[id].miningDamage > 0 && items[id].tier >= 1));
        if (!recipe) throw new Error('No material mining-tool assembly found');
        const alternatives = {};
        for (const tool of recipe.tools || []) alternatives[tool] = Object.keys(items).filter((id) => id !== tool && !recipe.cost[id] && (items[id].toolTags || []).includes(tool)).sort((a, b) => items[a].weight - items[b].weight)[0] || tool;
        const s = Sirens.App.getState(); s.player.inventory = {}; s.player.equipment = { weapon: 'bat', clothing: null, backpack: null }; s.player.weapon = 'bat';
        return { recipe, alternatives, output: items[Object.keys(recipe.result)[0]] };
      });
      fixtures.push('Empty pack followed by exact new mining-tool recipe costs and reusable compatible tools');
      await page.locator('[data-ui="recipe-search"]').fill(craftFixture.recipe.id);
      await until((id) => document.querySelector('[data-craft="' + id + '"]').disabled, craftFixture.recipe.id);
      const button = page.locator('[data-craft="' + craftFixture.recipe.id + '"]');
      assert.match(await button.locator('..').innerText(), /Need .*Keep /); assert(await button.isDisabled());
      await page.evaluate(({ recipe, alternatives }) => {
        const s = Sirens.App.getState(); s.player.inventory = { ...recipe.cost };
        for (const tool of Object.values(alternatives)) s.player.inventory[tool] = (s.player.inventory[tool] || 0) + 1;
      }, craftFixture);
      await until((id) => !document.querySelector('[data-craft="' + id + '"]').disabled, craftFixture.recipe.id);
      await page.locator('[data-ui="recipe-family"]').selectOption(craftFixture.output.family);
      await page.locator('[data-ui="recipe-tier"]').selectOption(String(craftFixture.output.tier));
      const before = await inventory(); await button.click();
      await until(({ result }) => Object.entries(result).every(([id, n]) => Sirens.App.getState().player.inventory[id] >= n), craftFixture.recipe);
      const after = await inventory();
      for (const [id, n] of Object.entries(craftFixture.recipe.cost)) assert.equal(after[id] || 0, (before[id] || 0) - n + (craftFixture.recipe.result[id] || 0));
      for (const [id, n] of Object.entries(craftFixture.recipe.result)) assert.equal(after[id], (before[id] || 0) + n - (craftFixture.recipe.cost[id] || 0));
      for (const tool of Object.values(craftFixture.alternatives)) assert.equal(after[tool], before[tool]);
      assert.equal(await page.locator('[data-ui="recipe-search"]').inputValue(), craftFixture.recipe.id);
      assert.equal(await page.locator('[data-ui="recipe-family"]').inputValue(), craftFixture.output.family);
      assert.equal(await page.locator('[data-ui="recipe-tier"]').inputValue(), String(craftFixture.output.tier));
      assert(await button.isDisabled());
    });
    await check('ready-only and empty recipe results recover through visible filters', async () => {
      await clearRecipes(); await page.locator('[data-ui="recipe-ready"]').check();
      assert.equal(await page.locator('[data-ui="recipes"] [data-craft]:disabled').count(), 0);
      assert((await rowIds('recipes')).length <= 24);
      await page.locator('[data-ui="recipe-search"]').fill('unreachable recipe 8542');
      assert.equal((await rowIds('recipes')).length, 0); assert.match(await page.locator('[data-ui="recipes"]').innerText(), /No recipes match.*Clear filters/);
      await clearRecipes(); assert(!(await page.locator('[data-ui="recipe-ready"]').isChecked())); assert.equal((await rowIds('recipes')).length, 24);
    });
    await check('owned pack pagination clamps when quantity changes remove later pages', async () => {
      await page.evaluate(() => { const s = Sirens.App.getState(); const ids = Object.keys(Sirens.Catalog.items).filter((id) => Sirens.Catalog.items[id].weight <= .15).slice(0, 100); s.player.inventory = Object.fromEntries(ids.map((id) => [id, 1])); });
      fixtures.push('One hundred light item types, then one type, isolate owned-pack page clamping');
      await page.locator('[data-command="owned"]').click(); await clearItems();
      assert.equal(Number(await page.locator('[data-ui="items-count"]').getAttribute('data-total')), 100);
      await page.locator('[data-page="items"][data-edge="last"]').click(); assert.equal((await rowIds()).length, 4);
      const keep = (await rowIds())[0];
      await page.evaluate((id) => { Sirens.App.getState().player.inventory = { [id]: 1 }; }, keep);
      await until((id) => document.querySelectorAll('[data-ui="items"] [data-item]').length === 1 && document.querySelector('[data-ui="items"] [data-item]').dataset.item === id, keep);
      assert.equal(await page.locator('[data-ui="items-pages"]').getAttribute('data-current'), '1');
      assert(await page.locator('[data-page="items"][data-step="1"]').isDisabled());
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-command="catalogue"]').click(); await clearItems();
    await check('390-pixel catalogue and crafting fit without horizontal overflow', async () => {
      for (const pane of ['catalogue', 'crafting']) {
        await page.locator('[data-command="' + pane + '"]').click();
        const overflow = await page.evaluate(() => {
          const panel = document.querySelector('.as-inventory');
          return { document: document.documentElement.scrollWidth > innerWidth + 1, panel: panel.scrollWidth > panel.clientWidth + 1, controls: [...panel.querySelectorAll('input, select, button')].filter((node) => node.getClientRects().length).filter((node) => { const rect = node.getBoundingClientRect(); return rect.left < -1 || rect.right > innerWidth + 1; }).map((node) => node.dataset.ui || node.getAttribute('aria-label') || node.textContent) };
        });
        assert.equal(overflow.document, false); assert.equal(overflow.panel, false); assert.deepEqual(overflow.controls, []);
      }
      await page.locator('[data-command="catalogue"]').click();
      await page.screenshot({ path: path.join(resultDir, 'catalogue-mobile.png') });
      const close = page.locator('[data-ui="inventory-overlay"] .as-close'); await close.focus(); await page.keyboard.press('Shift+Tab');
      assert(await page.evaluate(() => !!document.activeElement.closest('[data-ui="inventory-overlay"]')));
    });
    await check('expanded menus stay offline and have no uncaught browser errors', async () => { assert.deepEqual(errors, []); assert.deepEqual(requests, []); });
    fs.writeFileSync(path.join(resultDir, 'catalogue-browser-report.json'), JSON.stringify({ passed, errors, requests, fixtures, counts, rareId, crafted: craftFixture && craftFixture.recipe.id, viewport: [390, 844] }, null, 2));
    console.log('PASS all ' + passed.length + ' expanded catalogue browser checks');
  } catch (error) {
    fs.writeFileSync(path.join(resultDir, 'catalogue-browser-report.json'), JSON.stringify({ passed, errors, requests, fixtures, counts, failure: error.stack }, null, 2));
    await page.screenshot({ path: path.join(resultDir, 'catalogue-failure.png') }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
