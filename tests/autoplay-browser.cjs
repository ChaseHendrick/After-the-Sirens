'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), output = path.join(ROOT, '.test-results');
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } }); page.setDefaultTimeout(12000);
  const passed = [], errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  async function inspect() { return page.evaluate(() => {
    const s = Sirens.App.getState(), o = s.world || { originX: 0, originY: 0 };
    return { x: s.player.x + o.originX * 32, y: s.player.y + o.originY * 32, elapsed: s.elapsed, health: s.player.health, cooldown: s.player.cooldown,
      insight: s.progression.insight, loot: s.progression.totals.loot, screen: Sirens.App.getScreen(), status: Sirens.App.getAutoplayStatus() };
  }); }
  async function enable() {
    if (!(await inspect()).status.enabled) await page.locator('[data-autoplay-toggle]').click();
    await page.waitForFunction(() => Sirens.App.getAutoplayStatus().enabled);
  }
  let demonstration;
  try {
    await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href);
    await page.locator('[data-ui="seed"]').fill('0'); await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-ui="mode"]').selectOption('openworld'); await page.locator('[data-command="start"]').click();
    await check('AI play button scavenges a fresh generated world and earns insight through normal game actions', async () => {
      const before = await inspect(); assert.equal(before.status.enabled, false);
      await page.evaluate(() => { window.__earnedInsight = 0; const until = performance.now() + 5500; function sample() { window.__earnedInsight = Math.max(window.__earnedInsight, Sirens.App.getState().progression.insight); if (performance.now() < until) requestAnimationFrame(sample); } requestAnimationFrame(sample); });
      await enable();
      await page.waitForTimeout(5000); const after = await inspect();
      const peakInsight = await page.evaluate(() => window.__earnedInsight);
      assert(after.loot > before.loot, 'AI did not collect generated supplies'); assert(peakInsight > before.insight, 'AI collected no insight');
      assert(Math.hypot(after.x - before.x, after.y - before.y) > 3, 'AI did not move'); assert.equal(after.screen, 'playing');
      assert.equal(await page.locator('[data-autoplay-toggle]').getAttribute('aria-pressed'), 'true');
      demonstration = { ...after, peakInsight }; await page.screenshot({ path: path.join(output, 'autoplay-scavenging.png') });
    });
    await check('the brain view reports real finite learned parameters and movement feedback', async () => {
      const state = await inspect(), neural = state.status.neural;
      assert(neural); assert.equal(neural.parameters, 65); assert(neural.samples > 3072); assert(neural.feedback > 0); assert(Number.isFinite(neural.loss));
      assert(neural.weights.length === 48 && neural.weights.every(Number.isFinite));
      assert(state.status.choices.length > 0 && state.status.choices.every(c => Number.isFinite(c.score)));
      await page.locator('.as-brain summary').click(); assert(await page.locator('.as-brain[open]').isVisible());
      await page.waitForFunction(() => /65|6.*8.*1/.test(document.querySelector('.as-brain').innerText)); assert.match(await page.locator('.as-brain').innerText(), /65|6.*8.*1/); await page.screenshot({ path: path.join(output, 'autoplay-brain.png') });
      await page.locator('.as-brain summary').click();
    });
    await check('AI watch mode survives window blur and keeps the solo simulation running', async () => {
      const before = await inspect(); await page.evaluate(() => dispatchEvent(new Event('blur'))); await page.waitForTimeout(650);
      const after = await inspect(); assert.equal(after.screen, 'playing'); assert.equal(after.status.enabled, true); assert(after.elapsed > before.elapsed + .2);
    });
    await check('Journal and Pack freeze autonomous play and the solo clock until closed', async () => {
      for (const [key, overlay] of [['KeyJ', 'journal-overlay'], ['KeyI', 'inventory-overlay']]) {
        await page.keyboard.press(key); await page.locator('[data-ui="' + overlay + '"]').waitFor({ state: 'visible' }); await page.waitForTimeout(100);
        const before = await inspect(); await page.waitForTimeout(400); const after = await inspect();
        assert.equal(after.elapsed, before.elapsed); assert.equal(after.x, before.x); assert.equal(after.y, before.y);
        await page.keyboard.press('Escape'); await page.waitForTimeout(250); assert((await inspect()).elapsed > after.elapsed);
      }
    });
    await check('Escape pauses autonomous play and Resume returns to the generated world', async () => {
      await page.keyboard.press('Escape'); await page.waitForTimeout(100); const before = await inspect(); assert.equal(before.screen, 'paused');
      await page.waitForTimeout(400); assert.equal((await inspect()).elapsed, before.elapsed);
      await page.locator('[data-command="resume"]').click(); await page.waitForTimeout(250); const after = await inspect(); assert.equal(after.screen, 'playing'); assert(after.elapsed > before.elapsed);
    });
    await check('real keyboard movement and pointer combat each return control to the player', async () => {
      await enable(); await page.keyboard.down('KeyD'); await page.waitForTimeout(90); await page.keyboard.up('KeyD');
      assert.equal((await inspect()).status.enabled, false); await page.waitForFunction(() => document.querySelector('[data-autoplay-toggle]').getAttribute('aria-pressed') === 'false');
      await enable(); await page.mouse.move(380, 550); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
      const handoff = await inspect(); assert.equal(handoff.status.enabled, false); assert(handoff.cooldown > 0, 'manual pointer did not attack');
      assert.match(await page.locator('[data-autoplay-status]').textContent(), /You are in control/);
    });
    await check('AI and its brain operate offline without external requests or uncaught errors', async () => { assert.deepEqual(errors, []); assert.deepEqual(requests, []); });
    fs.writeFileSync(path.join(output, 'autoplay-browser-report.json'), JSON.stringify({ passed, errors, networkRequests: requests, demonstration, note: 'Fresh seed 0 calm world, real UI controls, no gameplay state injection. This is a short functional check, not evidence of winning or long-run survival.' }, null, 2));
    console.log(passed.length + ' autoplay browser checks passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
