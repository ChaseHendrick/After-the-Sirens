'use strict';
// Regressions for input, focus, save-flow and minimap defects found in review. Checks use real
// keyboard and mouse input. Two use labeled fixtures: placing the survivor beside a generated
// survivor (conversation) and setting lethal health (death screen). Other evaluations only read.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), output = path.join(ROOT, '.test-results');

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage(); page.setDefaultTimeout(10000);
  const passed = [], errors = [], requests = [], evidence = {};
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  // Counts minimap uploads; this wraps a browser API and does not touch game state.
  // Counts minimap terrain paints (one-pixel fills on the tile-sized surface) and uploads. This wraps
  // browser canvas APIs and does not touch game state.
  await page.addInitScript(() => {
    const proto = CanvasRenderingContext2D.prototype, upload = proto.putImageData, fill = proto.fillRect; window.__uploads = 0; window.__tileFills = 0;
    proto.putImageData = function () { window.__uploads++; return upload.apply(this, arguments); };
    proto.fillRect = function (x, y, w, h) { if (w === 1 && h === 1 && this.canvas.width === 192 && this.canvas.height === 192) window.__tileFills++; return fill.apply(this, arguments); };
  });
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  const read = () => page.evaluate(() => { const s = Sirens.App.getState(), p = s.player; return { screen: Sirens.App.getScreen(), x: p.x, y: p.y, cooldown: p.cooldown, stamina: p.stamina, hunger: p.hunger, elapsed: s.elapsed, conversation: !!s.conversation, focus: document.activeElement && document.activeElement.textContent.trim().slice(0, 40), logs: s.logs.slice(-3).map(l => l.text) }; });
  const inside = selector => page.evaluate(sel => document.querySelector(sel).contains(document.activeElement), selector);
  try {
    await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href);
    await page.locator('[data-ui="seed"]').fill('20260929'); await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-command="start"]').click(); await page.waitForTimeout(400);
    const box = await page.locator('#world').boundingBox(), aim = { x: box.x + box.width / 2 + 80, y: box.y + box.height / 2 };

    await check('the minimap canvas matches its displayed size after leaving the title screen', async () => {
      const size = await page.evaluate(() => { const m = document.getElementById('minimap'); return { width: m.width, client: m.clientWidth, dpr: Math.min(2, devicePixelRatio) }; });
      assert.equal(size.width, Math.round(size.client * size.dpr)); evidence.minimap = size;
    });

    await check('an idle minimap is not re-uploaded every refresh', async () => {
      await page.waitForTimeout(500); const before = await page.evaluate(() => [window.__uploads, window.__tileFills]);
      await page.waitForTimeout(2000); const after = await page.evaluate(() => [window.__uploads, window.__tileFills]);
      assert(after[0] - before[0] <= 2, 'minimap uploaded ' + (after[0] - before[0]) + ' times while idle');
      assert.equal(after[1] - before[1], 0, 'minimap repainted tile by tile while idle'); evidence.idle = { uploads: after[0] - before[0], tileFills: after[1] - before[1] };
      evidence.frame = await page.evaluate(() => Sirens.App.getMetrics());
    });

    await check('a second mouse button during an attack does not leave attacks running', async () => {
      await page.mouse.move(aim.x, aim.y); await page.mouse.down(); await page.waitForTimeout(80);
      await page.mouse.down({ button: 'right' }); await page.waitForTimeout(80);
      await page.mouse.up(); await page.waitForTimeout(80); await page.mouse.up({ button: 'right' });
      await page.waitForTimeout(700); const samples = [];
      for (let i = 0; i < 8; i++) { samples.push(await read()); await page.waitForTimeout(110); }
      assert(samples.every(s => s.cooldown === 0), 'attacks continued with no button held: ' + samples.map(s => s.cooldown.toFixed(2)).join(','));
    });

    await check('the Neural activity toggle returns Space to combat after a click', async () => {
      await page.locator('.as-brain summary').click(); await page.locator('.as-brain summary').click(); await page.waitForTimeout(100);
      await page.keyboard.press('Space'); await page.waitForTimeout(60);
      const s = await read(); assert(s.cooldown > 0, 'Space did not attack'); assert.equal(await page.evaluate(() => document.querySelector('.as-brain').open), false);
    });

    await check('a movement key held while the Pack closes keeps moving', async () => {
      await page.waitForTimeout(500);
      await page.keyboard.down('KeyD'); await page.waitForTimeout(120); await page.keyboard.press('KeyI'); await page.waitForTimeout(120);
      await page.keyboard.down('KeyD'); await page.keyboard.press('KeyI'); await page.waitForTimeout(60);
      const before = await read(); for (let i = 0; i < 6; i++) { await page.keyboard.down('KeyD'); await page.waitForTimeout(60); }
      const after = await read(); await page.keyboard.up('KeyD');
      assert(after.x - before.x > 10, 'held D did not resume movement: ' + (after.x - before.x));
    });

    await check('a refused quick action explains why', async () => {
      await page.keyboard.press('Digit1'); await page.waitForTimeout(100); const fed = await read(); assert(fed.hunger < 5, 'first meal should satisfy hunger');
      await page.keyboard.press('Digit1'); await page.waitForTimeout(150);
      assert.match((await read()).logs.join(' '), /not hungry/); await page.locator('.as-live-log', { hasText: 'not hungry' }).waitFor();
    });

    await check('Tab stays inside Pack and Journal after clicking dialog text', async () => {
      // Clicking text after a dialog's last control, or a mouse-clicked Journal action, leaves focus on <body>.
      await page.keyboard.press('KeyI'); await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'visible' });
      const tip = await page.locator('.as-inventory-tip').boundingBox(); await page.mouse.click(tip.x + 20, tip.y + 8); await page.keyboard.press('Tab');
      assert(await inside('[data-ui="inventory-overlay"]'), 'focus left the Pack'); await page.keyboard.press('Escape');
      await page.keyboard.press('KeyJ'); await page.locator('[data-ui="journal-overlay"]').waitFor({ state: 'visible' });
      await page.locator('[data-journal-tab="atlas"]').click(); await page.locator('[data-action="clearWaypoint"]').click(); await page.waitForTimeout(150); await page.keyboard.press('Tab');
      assert(await inside('[data-ui="journal-overlay"]'), 'focus left the Journal'); assert.equal((await read()).screen, 'playing');
      await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    });

    await check('Space held into the pause menu does not press its focused button', async () => {
      await page.keyboard.down('Space'); await page.waitForTimeout(80); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
      const paused = await read(); assert.equal(paused.screen, 'paused'); assert.equal(await page.evaluate(() => document.activeElement.dataset.command), 'resume', 'pause menu should focus its resume button');
      for (let i = 0; i < 3; i++) { await page.keyboard.down('Space'); await page.waitForTimeout(40); }
      await page.keyboard.up('Space'); await page.waitForTimeout(120); assert.equal((await read()).screen, 'paused');
      await page.keyboard.press('Escape'); await page.waitForTimeout(100); assert.equal((await read()).screen, 'playing');
    });

    await check('New run in the pause menu asks before replacing the save', async () => {
      await page.waitForTimeout(5300); const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('after-the-sirens-save-v1')).state.elapsed);
      await page.keyboard.press('Escape'); const newRun = page.locator('.as-overlay[data-screen="paused"] [data-command="restart"]');
      await newRun.click(); await page.waitForTimeout(100);
      assert.equal((await read()).screen, 'paused'); assert.match(await newRun.textContent(), /Replace saved run/);
      await page.keyboard.press('Escape'); await page.waitForTimeout(100); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
      assert.equal(await newRun.textContent(), 'New run', 'leaving the menu should disarm New run');
      const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('after-the-sirens-save-v1')).state.elapsed);
      assert(kept >= saved, 'the save was replaced'); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    });

    await check('Escape on the pause screen resumes before closing a conversation', async () => {
      const placed = await page.evaluate(() => {
        // Labeled fixture: stand beside the nearest generated survivor so E opens a conversation.
        const s = Sirens.App.getState(), h = s.humans.filter(h => h.faction === 'survivor' && h.health > 0).sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y))[0];
        for (const [dx, dy] of [[-30, 0], [30, 0], [0, -30], [0, 30]]) if (!Sirens.Engine.isSolid(s, (h.x + dx) / 32, (h.y + dy) / 32)) { s.player.x = h.x + dx; s.player.y = h.y + dy; return h.name; }
        return null;
      });
      assert(placed, 'no clear tile beside a survivor');
      await page.waitForTimeout(150); await page.keyboard.press('KeyE'); await page.waitForTimeout(150); assert.equal((await read()).conversation, true);
      await page.evaluate(() => dispatchEvent(new Event('blur'))); await page.waitForTimeout(100); assert.equal((await read()).screen, 'paused');
      await page.keyboard.press('Escape'); await page.waitForTimeout(100);
      const resumed = await read(); assert.equal(resumed.screen, 'playing'); assert.equal(resumed.conversation, true, 'resume should return to the conversation');
      await page.keyboard.press('Escape'); await page.waitForTimeout(100); assert.equal((await read()).conversation, false);
    });

    await check('closing a dialog releases focus from its controls, so game keys keep working', async () => {
      // Records focus at the moment a dialog becomes hidden, before any browser focus fixup can run.
      const watch = selector => page.evaluate(sel => { const node = document.querySelector(sel); window.__leftInside = null;
        const observer = new MutationObserver(() => { if (node.hidden) { window.__leftInside = node.contains(document.activeElement); observer.disconnect(); } });
        observer.observe(node, { attributes: true, attributeFilter: ['hidden'] }); }, selector);
      await page.keyboard.press('KeyE'); await page.locator('[data-ui="conversation-overlay"]').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => document.querySelector('[data-ui="conversation-overlay"]').contains(document.activeElement)), true, 'the open conversation should hold focus');
      await watch('[data-ui="conversation-overlay"]'); await page.keyboard.press('Escape'); await page.locator('[data-ui="conversation-overlay"]').waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => window.__leftInside), false, 'focus stayed on a control inside the hidden conversation');
      await page.keyboard.press('KeyI'); await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'visible' });
      await page.locator('[data-command="crafting"]').click(); await page.locator('[data-ui="recipe-ready"]').check();
      await watch('[data-ui="inventory-overlay"]'); await page.keyboard.press('Escape'); await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => window.__leftInside), false, 'focus stayed on a control inside the hidden Pack');
      const before = await read(); await page.keyboard.down('KeyD'); await page.waitForTimeout(250); await page.keyboard.up('KeyD');
      assert((await read()).x - before.x > 5, 'movement keys were swallowed after closing the Pack');
    });

    await check('Space held through death does not restart the run', async () => {
      await page.keyboard.down('Space'); await page.waitForTimeout(80);
      // Labeled fixture: lethal condition while Space is held.
      await page.evaluate(() => { const p = Sirens.App.getState().player; p.health = .01; p.bleeding = 3; });
      for (let i = 0; i < 30 && (await read()).screen !== 'dead'; i++) { await page.keyboard.down('Space'); await page.waitForTimeout(50); }
      const dead = await read(); assert.equal(dead.screen, 'dead');
      for (let i = 0; i < 3; i++) { await page.keyboard.down('Space'); await page.waitForTimeout(40); }
      await page.keyboard.up('Space'); await page.waitForTimeout(200);
      const after = await read(); assert.equal(after.screen, 'dead'); assert(after.elapsed >= dead.elapsed, 'a new run started');
    });

    await check('an ended run is not offered as Continue', async () => {
      await page.locator('.as-overlay[data-screen="dead"] [data-command="title"]').click(); await page.waitForTimeout(150);
      assert.equal(await page.locator('[data-command="continue"]').isDisabled(), true);
    });

    await check('input regressions run offline without uncaught errors', async () => { assert.deepEqual(errors, []); assert.deepEqual(requests, []); });
    fs.writeFileSync(path.join(output, 'input-browser-report.json'), JSON.stringify({ passed, errors, networkRequests: requests, evidence, note: 'Headless Chrome with real keyboard and mouse input; two labeled fixtures. Frame metrics are local headless measurements, not hardware benchmarks.' }, null, 2));
    console.log(passed.length + ' input browser checks passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
