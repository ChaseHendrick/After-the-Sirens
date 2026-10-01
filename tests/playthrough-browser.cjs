'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// This suite controls the game through its ordinary UI. Browser evaluations are
// read-only observations and terrain/line-of-sight queries. There are no state
// edits, console commands, direct simulation actions or injected inputs.
global.window = {};
for (const module of ['catalog', 'effects', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const preview = window.Sirens;
function selectSeed() {
  const candidates = preview.Catalog.recipes.filter(r => r.station === 'campfire' && (r.tools || []).length === 1 && r.tools[0] === 'cooking_pot' && Object.keys(r.result).some(id => preview.Catalog.items[id].category === 'food' && preview.Catalog.items[id].family.startsWith('Prepared ')));
  for (let seed = 0; seed < 2048; seed++) {
    const s = preview.Engine.create(seed, 'calm', 'openworld'), cabin = s.containers.find(c => c.label === 'Safe cabin supplies');
    const available = { ...s.player.inventory };
    for (const [id, n] of Object.entries(cabin.items)) available[id] = (available[id] || 0) + n;
    const recipe = candidates.find(r => available.cooking_pot > 0 && Object.entries(r.cost).every(([id, n]) => available[id] >= n) && available.wood >= (r.cost.wood || 0) + 4 && available.scrap >= 1);
    if (!recipe || preview.Engine.inventoryWeight(available) > preview.Engine.capacity + preview.Catalog.items.canvas_pack.capacity) continue;
    return { seed, candidatesExamined: seed + 1, difficulty: 'calm', mode: 'openworld', method: 'Read-only ascending seed preview selected real cabin ingredients and a retained cooking pot for a new campfire meal.', recipe: JSON.parse(JSON.stringify(recipe)), product: Object.keys(recipe.result)[0] };
  }
  throw new Error('No suitable generated cabin meal route found in 2048 read-only seed previews.');
}

(async () => {
  const selection = selectSeed(), started = Date.now(), deadline = started + 110000;
  const report = { selection, scope: 'Guided natural generated-world keyboard and mouse playtest, with read-only navigation observations. This is a selected deterministic scenario, not a random unassisted human session.', checks: [], events: [], combatEvidence: [], pageErrors: [], networkRequests: [], controls: { keyDowns: 0, keyPresses: 0, pointerMoves: 0, uiClicks: 0 }, success: false };
  fs.mkdirSync(path.join(__dirname, '../.test-results'), { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(7000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) report.networkRequests.push(request.url()); });
  const held = new Set(), opened = new Map();
  let canvasBox = null, distanceWalked = 0, lastPosition = null, mealMade = null;
  function budget() { assert(Date.now() < deadline, 'natural playthrough exceeded its 110-second wall-clock budget'); }
  async function press(code) { budget(); report.controls.keyPresses++; await page.keyboard.press(code); }
  async function click(locator) { budget(); report.controls.uiClicks++; await locator.click(); }
  async function keys(desired) {
    for (const code of [...held]) if (!desired.includes(code)) { await page.keyboard.up(code); held.delete(code); }
    for (const code of desired) if (!held.has(code)) { report.controls.keyDowns++; await page.keyboard.down(code); held.add(code); }
  }
  async function observe() {
    budget();
    const observation = await page.evaluate(() => {
      const s = Sirens.App.getState(); if (!s) return null;
      const ox = s.world ? s.world.originX * 32 : 0, oy = s.world ? s.world.originY * 32 : 0, p = s.player;
      return { elapsed: s.elapsed, screen: Sirens.App.getScreen(), floor: s.stories ? s.stories.floor : 0, player: JSON.parse(JSON.stringify(p)), weaponDamage: Sirens.Catalog.items[p.weapon].weapon.damage, global: { x: p.x + ox, y: p.y + oy }, origin: { x: ox, y: oy }, sector: s.world && [s.world.centerCX, s.world.centerCY], visited: s.world && s.world.visitedCount,
        progression: { insight: s.progression.insight, totals: { ...s.progression.totals }, xp: { ...s.progression.xp } }, logs: s.logs.slice(-5), zoom: Sirens.App.getView().zoom,
        enemies: s.zombies.map(z => ({ id: z.id, x: z.x, y: z.y, gx: z.x + ox, gy: z.y + oy, health: z.health, distance: Math.hypot(z.x - p.x, z.y - p.y), visible: Sirens.Engine.hasLOS(s, p.x, p.y, z.x, z.y) })).filter(z => z.distance < 900).sort((a, b) => a.distance - b.distance),
        structures: s.structures.map(b => ({ type: b.type, x: b.x + ox, y: b.y + oy, health: b.health })), metrics: Sirens.App.getMetrics() };
    });
    assert(observation && observation.player.health > 0 && observation.screen !== 'dead', 'survivor died during the natural route');
    if (lastPosition) distanceWalked += Math.hypot(observation.global.x - lastPosition.x, observation.global.y - lastPosition.y);
    lastPosition = observation.global; return observation;
  }
  function event(kind, detail) { report.events.push({ wallSeconds: Number(((Date.now() - started) / 1000).toFixed(2)), kind, ...detail }); }
  function attackEvidence(before, after, target) {
    const practice = after.progression.xp.combat - before.progression.xp.combat;
    if (!target || practice <= 0) return;
    const survivor = after.enemies.find(z => z.id === target.id);
    const removed = !survivor;
    report.combatEvidence.push({ elapsed: after.elapsed, target: target.id, healthBefore: target.health, healthAfter: survivor ? survivor.health : 0, ownCombatXP: practice, weapon: before.player.weapon, weaponDamage: before.weaponDamage, removed, confirmedFinishingHit: removed && target.health <= before.weaponDamage });
  }
  async function check(name, fn) { budget(); await fn(); report.checks.push(name); console.log('PASS ' + name); }
  async function aim(point, o) {
    canvasBox = canvasBox || await page.locator('#world').boundingBox(); assert(canvasBox);
    // At ordinary stationary or short-step positions the camera follows the player.
    // Wide melee arcs and continuously updated aiming tolerate camera easing.
    const x = canvasBox.x + canvasBox.width / 2 + (point.x - o.player.x) * o.zoom;
    const y = canvasBox.y + canvasBox.height / 2 + (point.y - o.player.y) * o.zoom;
    report.controls.pointerMoves++; await page.mouse.move(Math.max(canvasBox.x + 2, Math.min(canvasBox.x + canvasBox.width - 2, x)), Math.max(canvasBox.y + 2, Math.min(canvasBox.y + canvasBox.height - 2, y)));
  }
  async function openPack() { await keys([]); if (!(await page.locator('[data-ui="inventory-overlay"]').isVisible())) await press('KeyI'); await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'visible' }); }
  async function closePack() { if (await page.locator('[data-ui="inventory-overlay"]').isVisible()) await press('Escape'); await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'hidden' }); }
  async function equip(id) {
    assert((await observe()).player.inventory[id] > 0, 'naturally obtained ' + id + ' must be carried');
    await openPack(); await click(page.locator('[data-command="owned"]')); await page.locator('[data-ui="item-search"]').fill(id);
    await click(page.locator('[data-item="' + id + '"] [data-equip="' + id + '"]')); await closePack();
    event('equip', { id });
  }
  async function route(gx, gy) {
    return page.evaluate(({ gx, gy }) => {
      const s = Sirens.App.getState(), ox = s.world.originX, oy = s.world.originY, width = s.width;
      const start = Math.floor(s.player.y / 32) * width + Math.floor(s.player.x / 32), tx = Math.floor(gx / 32) - ox, ty = Math.floor(gy / 32) - oy;
      if (tx < 1 || ty < 1 || tx >= s.width - 1 || ty >= s.height - 1) throw new Error('Destination is outside the current loaded window');
      const goal = ty * width + tx, queue = [start], previous = new Map([[start, null]]);
      for (let cursor = 0; cursor < queue.length; cursor++) {
        const id = queue[cursor]; if (id === goal) break; const x = id % width, y = Math.floor(id / width);
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
          if (nx < 1 || ny < 1 || nx >= s.width - 1 || ny >= s.height - 1) continue;
          const next = ny * width + nx; if (previous.has(next) || Sirens.Engine.isSolid(s, nx, ny) && s.tiles[next] !== 6) continue;
          previous.set(next, id); queue.push(next);
        }
      }
      if (!previous.has(goal)) throw new Error('No walkable door route to ' + gx + ',' + gy);
      const points = [];
      for (let id = goal; id !== start; id = previous.get(id)) points.push({ x: ((id % width) + ox + .5) * 32, y: (Math.floor(id / width) + oy + .5) * 32 });
      return points.reverse();
    }, { gx, gy });
  }
  async function doorAt(point) {
    return page.evaluate(point => { const s = Sirens.App.getState(), x = Math.floor(point.x / 32) - s.world.originX, y = Math.floor(point.y / 32) - s.world.originY; return s.tiles[y * s.width + x]; }, point);
  }
  async function walkTo(gx, gy) {
    const points = await route(gx, gy); event('route', { destination: [gx, gy], waypoints: points.length });
    for (const point of points) {
      if (await doorAt(point) === 6) {
        await keys([]); await press('KeyE');
        await page.waitForFunction(point => { const s = Sirens.App.getState(), x = Math.floor(point.x / 32) - s.world.originX, y = Math.floor(point.y / 32) - s.world.originY; return s.tiles[y * s.width + x] === 7; }, point, { timeout: 2000 });
        opened.set(point.x + ',' + point.y, point); event('door', { position: [point.x, point.y] });
      }
      const stepStart = Date.now();
      while (true) {
        const o = await observe(), dx = point.x - o.global.x, dy = point.y - o.global.y;
        if (Math.hypot(dx, dy) <= 5) break;
        assert(Date.now() - stepStart < 4500, 'walking stuck at ' + JSON.stringify(point) + ': ' + JSON.stringify(o.global));
        const desired = []; if (Math.abs(dx) > 3) desired.push(dx > 0 ? 'KeyD' : 'KeyA'); if (Math.abs(dy) > 3) desired.push(dy > 0 ? 'KeyS' : 'KeyW');
        const enemy = o.enemies.find(z => z.visible && z.distance < 74);
        if (enemy) { await aim(enemy, o); desired.push('Space'); }
        await keys(desired); await page.waitForTimeout(55);
        if (enemy) attackEvidence(o, await observe(), enemy);
      }
    }
    await keys([]);
  }
  async function container(label) {
    return page.evaluate(label => { const s = Sirens.App.getState(), c = s.containers.find(c => c.label === label); if (!c) return null; return { id: c.id, x: c.x + s.world.originX * 32, y: c.y + s.world.originY * 32, items: { ...c.items }, looted: c.looted }; }, label);
  }
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('[data-ui="difficulty"]').selectOption(selection.difficulty); await page.locator('[data-ui="mode"]').selectOption(selection.mode); await page.locator('[data-ui="seed"]').fill(String(selection.seed));
    await click(page.locator('[data-command="start"]')); await page.waitForFunction(() => Sirens.App.getScreen() === 'playing');
    const initial = await observe(); report.initial = { player: initial.player, global: initial.global, sector: initial.sector, elapsed: initial.elapsed };
    assert.equal(await page.evaluate(() => Sirens.App.getAutoplayStatus().enabled), false, 'AI play must remain disabled');
    await check('normal cabin loot equips naturally obtained carrying gear and a melee weapon', async () => {
      await press('KeyE'); await equip('canvas_pack'); await press('KeyE'); await equip('machete');
      if ((await observe()).player.inventory.work_jacket) await equip('work_jacket');
      const o = await observe(); assert(o.progression.totals.loot >= 1); assert.equal(o.player.weapon, 'machete'); assert.equal(o.player.equipment.backpack, 'canvas_pack');
      for (const [id, n] of Object.entries(selection.recipe.cost)) assert(o.player.inventory[id] >= n, 'naturally looted recipe input ' + id);
      assert(o.player.inventory.cooking_pot > 0);
      event('cabin-loot', { inventory: o.player.inventory, insight: o.progression.insight });
    });
    await check('normal build and craft UI makes a new meal from actual loot while retaining the cooking pot', async () => {
      const target = await page.evaluate(() => {
        const s = Sirens.App.getState(), px = Math.floor(s.player.x / 32), py = Math.floor(s.player.y / 32);
        for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          const tx = px + dx, ty = py + dy, x = (tx + .5) * 32, y = (ty + .5) * 32;
          if (Sirens.Engine.isSolid(s, tx, ty) || s.tiles[ty * s.width + tx] === 7 || s.containers.some(c => Math.hypot(c.x - x, c.y - y) < 24) || s.buildings.some(b => b.stairs && b.stairs.x === tx && b.stairs.y === ty)) continue;
          return { x, y };
        }
        return null;
      }); assert(target, 'generated cabin has a clear adjacent campfire tile');
      await aim(target, await observe()); await page.waitForTimeout(160); await openPack(); await click(page.locator('[data-command="crafting"]'));
      const beforeBuild = await observe(); await click(page.locator('[data-build="campfire"]'));
      let o = await observe(); assert.equal(o.structures.length, beforeBuild.structures.length + 1); assert.equal(o.player.inventory.wood, beforeBuild.player.inventory.wood - 4); assert.equal(o.player.inventory.scrap || 0, (beforeBuild.player.inventory.scrap || 0) - 1);
      await page.locator('[data-ui="recipe-search"]').fill(selection.recipe.id);
      const recipeButton = page.locator('[data-craft="' + selection.recipe.id + '"]'); assert(await recipeButton.isEnabled(), await recipeButton.locator('..').innerText());
      const before = await observe(); await click(recipeButton); o = await observe();
      for (const [id, n] of Object.entries(selection.recipe.cost)) assert.equal(o.player.inventory[id] || 0, (before.player.inventory[id] || 0) - n);
      assert.equal(o.player.inventory[selection.product], selection.recipe.result[selection.product]); assert.equal(o.player.inventory.cooking_pot, before.player.inventory.cooking_pot);
      assert.equal(o.progression.totals.craft, before.progression.totals.craft + 1); mealMade = selection.product;
      event('meal-crafted', { recipe: selection.recipe.id, cost: selection.recipe.cost, retainedTool: 'cooking_pot', campfire: o.structures.find(b => b.type === 'campfire') });
      await click(page.locator('[data-command="owned"]')); await page.locator('[data-ui="item-search"]').fill(selection.product);
      const beforeEat = await observe(); await click(page.locator('[data-item="' + selection.product + '"] [data-use="' + selection.product + '"]')); o = await observe();
      assert.equal(o.player.inventory[selection.product] || 0, beforeEat.player.inventory[selection.product] - 1); assert(o.player.hunger < beforeEat.player.hunger || o.player.thirst < beforeEat.player.thirst);
      event('meal-consumed', { id: selection.product, hunger: [beforeEat.player.hunger, o.player.hunger], thirst: [beforeEat.player.thirst, o.player.thirst] }); await closePack();
    });
    await check('ordinary movement opens the cabin and business doors and loots a second generated location', async () => {
      const business = await container('Ranger shed supplies'); assert(business);
      const before = await observe(); await walkTo(business.x, business.y);
      // Act on the visible prompt, as a player would: a wandering survivor or pet nearby takes E first.
      const prompt = () => page.locator('[data-ui="interact-text"]').textContent();
      await page.waitForFunction(() => /Ranger shed supplies/.test(document.querySelector('[data-ui="interact-text"]').textContent), null, { timeout: 6000 }).catch(() => {});
      assert.match(await prompt(), /Ranger shed supplies/, 'the shed prompt never appeared'); await press('KeyE'); const after = await observe();
      assert(after.progression.totals.loot >= before.progression.totals.loot + 1); assert(after.progression.insight > before.progression.insight); assert(opened.size >= 2);
      const remaining = await container('Ranger shed supplies'); assert(Object.keys(remaining.items).length < Object.keys(business.items).length || Object.entries(business.items).some(([id, n]) => (remaining.items[id] || 0) < n));
      event('business-loot', { label: business.label || 'Ranger shed supplies', insight: after.progression.insight, inventory: after.player.inventory, leftovers: remaining.items });
    });
    await check('mouse aiming and Space melee kill a naturally generated zombie', async () => {
      const baseline = (await observe()).player.kills, fightStart = Date.now();
      while (!report.combatEvidence.some(hit => hit.confirmedFinishingHit)) {
        assert(Date.now() - fightStart < 22000, 'no natural zombie defeated within the combat budget');
        const o = await observe(), enemy = o.enemies.find(z => z.visible) || o.enemies[0]; assert(enemy, 'generated town must expose a nearby zombie');
        if (enemy.distance > 65) { await walkTo(enemy.gx, enemy.gy); continue; }
        await aim(enemy, o); await keys(['Space']); await page.waitForTimeout(90); attackEvidence(o, await observe(), enemy);
      }
      await keys([]); const o = await observe(); assert(o.progression.xp.combat > 0); event('natural-combat', { sharedKillCounterChange: o.player.kills - baseline, confirmedControlFinishingHits: report.combatEvidence.filter(hit => hit.confirmedFinishingHit).length, health: o.player.health, combatXP: o.progression.xp.combat, note: 'The game kill counter also includes autonomous NPC kills. Per-target own-combat-XP observations separately record controlled melee hits.' });
    });
    await check('a walking road expedition streams a new seeded sector', async () => {
      await walkTo(16, 1008); await walkTo(-48, 1008); const o = await observe();
      assert.equal(o.sector[0], -1); assert(o.visited >= 2); assert(o.floor === 0); event('sector-transition', { sector: o.sector, visited: o.visited, transport: 'walking' });
    });
    await check('Save, page reload and Continue retain the natural expedition and its world changes', async () => {
      await keys([]); await press('Escape'); await page.waitForFunction(() => Sirens.App.getScreen() === 'paused'); await click(page.locator('[data-command="save"]'));
      const before = await observe(); await page.reload(); await click(page.locator('[data-command="continue"]')); await page.waitForFunction(() => Sirens.App.getScreen() === 'playing'); const after = await observe();
      assert.deepEqual(after.global, before.global); assert.deepEqual(after.player.inventory, before.player.inventory); assert.deepEqual(after.player.equipment, before.player.equipment); assert.deepEqual(after.sector, before.sector); assert.equal(after.player.kills, before.player.kills); assert.deepEqual(after.structures, before.structures);
      for (const point of opened.values()) assert.equal(await doorAt(point), 7, 'opened route door persists');
      assert.equal(after.progression.totals.craft, before.progression.totals.craft); assert.equal(after.progression.totals.loot, before.progression.totals.loot); event('save-continue', { sector: after.sector, inventoryTypes: Object.keys(after.player.inventory).length });
    });
    await check('the natural session remains finite, offline and free of browser errors', async () => {
      await keys([]); const bad = await page.evaluate(() => { const result = []; function walk(value, p) { if (typeof value === 'number' && !Number.isFinite(value)) result.push(p); else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) walk(child, p + '.' + key); } walk(Sirens.App.getState(), 'state'); return result; });
      assert.deepEqual(bad, []); assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.networkRequests, []); assert(mealMade);
      assert.equal(await page.evaluate(() => Sirens.App.getAutoplayStatus().enabled), false);
    });
    report.success = true;
  } catch (error) { report.failure = error.stack; throw error; }
  finally {
    try { await keys([]); report.final = await observe(); } catch (error) { report.finalObservationError = error.message; }
    report.openedDoors = [...opened.values()]; report.distanceWalked = Math.round(distanceWalked); report.wallSeconds = Number(((Date.now() - started) / 1000).toFixed(2)); report.browser = await browser.version();
    fs.writeFileSync(path.join(__dirname, '../.test-results/playthrough-report.json'), JSON.stringify(report, null, 2)); await browser.close();
    console.log('Natural playthrough report:', JSON.stringify({ success: report.success, seed: selection.seed, checks: report.checks.length, wallSeconds: report.wallSeconds, distanceWalked: report.distanceWalked, openedDoors: report.openedDoors.length, controls: report.controls }));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
