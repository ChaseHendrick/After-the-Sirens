'use strict';
// Touch controls through real Chrome touch input (DevTools Protocol touch points, which
// the browser turns into touch pointer events). Browser evaluations only read state;
// there are no gameplay-state writes, console commands or direct engine actions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), output = path.join(ROOT, '.test-results');

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const passed = [], errors = [], requests = [], evidence = {};
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  async function open(viewport, touch) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href);
    return { context, page };
  }
  try {
    const { context, page } = await open({ width: 844, height: 390 }, true);
    const W = 844, H = 390, cdp = await context.newCDPSession(page), touching = new Map();
    async function send(type) { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...touching].map(([id, p]) => ({ x: p.x, y: p.y, id, radiusX: 3, radiusY: 3, force: 1 })) }); }
    async function press(id, x, y) { touching.set(id, { x, y }); await send('touchStart'); }
    async function drag(id, x, y) { touching.set(id, { x, y }); await send('touchMove'); }
    async function release(id) { touching.delete(id); await send('touchEnd'); }
    const inspect = () => page.evaluate(() => {
      const s = Sirens.App.getState(), o = s.world || { originX: 0, originY: 0 }, p = s.player, car = (s.vehicles || []).find(v => v.id === p.vehicleId);
      return { x: p.x + o.originX * 32, y: p.y + o.originY * 32, angle: p.angle, stamina: p.stamina, cooldown: p.cooldown, weapon: p.weapon, sneaking: !!p._sneaking, elapsed: s.elapsed, vehicleId: p.vehicleId, speed: car ? car.speed : 0,
        items: Object.values(p.inventory).reduce((a, b) => a + b, 0), screen: Sirens.App.getScreen(), touch: Sirens.App.getTouchStatus(), input: document.getElementById('ui').dataset.input,
        layer: !document.querySelector('.as-touch').hidden, prompt: !document.querySelector('[data-ui="interact"]').hidden, ready: document.querySelector('[data-touch="interact"]').classList.contains('as-touch-ready'),
        vehicles: (s.vehicles || []).map(v => ({ x: v.x + o.originX * 32, y: v.y + o.originY * 32 })) };
    });
    const moveBase = { x: W * .2, y: H * .62 };
    async function walkTo(target, tolerance, timeout) {
      await press(1, moveBase.x, moveBase.y);
      const until = Date.now() + timeout; let s = await inspect();
      while (Date.now() < until) {
        s = await inspect(); const dx = target.x - s.x, dy = target.y - s.y, d = Math.hypot(dx, dy);
        if (d < tolerance) break;
        await drag(1, moveBase.x + dx / d * 50, moveBase.y + dy / d * 50); await page.waitForTimeout(50);
      }
      await release(1); await page.waitForTimeout(120);
      return inspect();
    }

    await page.locator('[data-ui="seed"]').fill('12'); await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-command="start"]').tap(); await page.waitForTimeout(400);
    const spawn = await inspect();

    await check('a coarse-pointer phone starts in touch mode with action buttons and no idle sticks', async () => {
      const s = await inspect();
      assert.equal(s.screen, 'playing'); assert.equal(s.input, 'touch'); assert.equal(s.layer, true); assert.equal(s.touch.move, false); assert.equal(s.touch.aim, false);
      assert(await page.locator('.as-hint-touch').isVisible() || !(await page.locator('.as-controls-hint').isVisible()), 'touch hint should replace keyboard hint');
      assert.equal(await page.locator('.as-hint-keys').isVisible(), false);
      assert.equal(await page.locator('[data-stick="move"]').isVisible(), false);
      assert.match(await page.locator('[data-ui="ammo"]').textContent(), /Swap/);
    });

    await check('the Use button lights up beside supplies and collects them like E', async () => {
      const before = await inspect(); assert(before.prompt && before.ready, 'cabin supplies prompt should highlight Use');
      await page.locator('[data-touch="interact"]').tap(); await page.waitForTimeout(150);
      const after = await inspect(); assert(after.items > before.items, 'Use did not collect cabin supplies');
      evidence.collected = after.items - before.items;
    });

    await check('dragging the left side moves the survivor and releasing stops', async () => {
      const before = await inspect();
      await press(1, moveBase.x, moveBase.y); for (let i = 1; i <= 5; i++) { await drag(1, moveBase.x + i * 10, moveBase.y); await page.waitForTimeout(16); }
      await page.waitForTimeout(350); const moving = await inspect(); assert(moving.touch.move, 'move stick not engaged');
      assert(await page.locator('[data-stick="move"]').isVisible());
      await release(1); await page.waitForTimeout(150); const stopped = await inspect(); await page.waitForTimeout(250); const still = await inspect();
      assert(moving.x - before.x > 20, 'no rightward movement: ' + (moving.x - before.x)); assert(Math.abs(still.x - stopped.x) < 1, 'movement continued after release');
      assert.equal(still.touch.move, false); assert.equal(await page.locator('[data-stick="move"]').isVisible(), false);
      evidence.stickMove = Math.round(moving.x - before.x);
    });

    await check('dragging the right side aims and swings; a quick tap strikes toward the touched point', async () => {
      await page.waitForTimeout(500);
      const before = await inspect(), rx = W * .75, ry = H * .55;
      await press(2, rx, ry); for (let i = 1; i <= 5; i++) { await drag(2, rx - i * 12, ry); await page.waitForTimeout(16); }
      await page.waitForTimeout(200); const swung = await inspect(); await release(2);
      assert(Math.abs(Math.abs(swung.angle) - Math.PI) < .3, 'aim did not follow the stick: ' + swung.angle);
      assert(swung.stamina < before.stamina || swung.cooldown > 0, 'aim stick did not attack');
      await page.waitForTimeout(700); const ready = await inspect();
      await page.touchscreen.tap(W * .56, H * .5 - 150 < 10 ? 10 : H * .5 - 150); await page.waitForTimeout(90);
      const tapped = await inspect();
      assert(Math.abs(tapped.angle + Math.PI / 2) < .5, 'tap did not aim upward: ' + tapped.angle); assert(tapped.cooldown > 0 || tapped.stamina < ready.stamina, 'tap did not strike');
      evidence.aimAngle = Number(swung.angle.toFixed(3)); evidence.tapAngle = Number(tapped.angle.toFixed(3));
    });

    await check('both thumbs work at the same time', async () => {
      await page.waitForTimeout(600); const before = await inspect(), rx = W * .78, ry = H * .5;
      await press(1, moveBase.x, moveBase.y); await drag(1, moveBase.x, moveBase.y + 50);
      await press(2, rx, ry); for (let i = 1; i <= 5; i++) { await drag(2, rx + i * 10, ry); await page.waitForTimeout(16); }
      await page.waitForTimeout(300); const during = await inspect(); await release(2); await release(1);
      assert(during.touch.move && during.touch.aim, 'both sticks should be held'); assert(during.y - before.y > 12, 'did not move down while aiming');
      assert(Math.abs(during.angle) < .35, 'did not aim right while moving: ' + during.angle);
    });

    await check('Run and Sneak toggles drive sprint and quiet movement', async () => {
      await page.waitForTimeout(1200);
      await page.locator('[data-touch="sprint"]').tap(); assert.equal(await page.locator('[data-touch="sprint"]').getAttribute('aria-pressed'), 'true');
      const before = await inspect(); await press(1, moveBase.x, moveBase.y); await drag(1, moveBase.x, moveBase.y - 54); await page.waitForTimeout(450);
      const running = await inspect(); await release(1);
      assert(running.stamina < before.stamina - 2, 'running did not use stamina');
      await page.locator('[data-touch="sneak"]').tap(); const toggles = await inspect();
      assert.equal(toggles.touch.sneak, true); assert.equal(toggles.touch.sprint, false, 'Sneak should turn Run off');
      await page.waitForTimeout(80); assert.equal((await inspect()).sneaking, true);
      await page.locator('[data-touch="sneak"]').tap(); await page.waitForTimeout(80); assert.equal((await inspect()).sneaking, false);
    });

    await check('Swap switches weapons through the normal action', async () => {
      const before = await inspect(); await page.locator('[data-touch="switch"]').tap(); await page.waitForTimeout(80);
      const after = await inspect(); assert.notEqual(after.weapon, before.weapon);
      await page.locator('[data-touch="switch"]').tap(); await page.waitForTimeout(80); assert.equal((await inspect()).weapon, before.weapon);
    });

    await check('a still thumb resting at the screen edge does not move the survivor', async () => {
      const before = await inspect(); await press(1, 6, H * .6); await page.waitForTimeout(300);
      const held = await inspect(); await release(1);
      assert(held.touch.move, 'edge touch should hold the move stick'); assert(Math.hypot(held.x - before.x, held.y - before.y) < .5, 'an unmoved edge touch pushed the stick');
    });

    await check('Pack pauses the run and ignores thumbs until it closes', async () => {
      await page.locator('.as-pack-button').tap(); await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'visible' });
      const before = await inspect(); assert.equal(before.layer, false, 'touch controls should hide behind menus');
      await press(1, 40, H - 70); await drag(1, 90, H - 70); await page.waitForTimeout(300); await release(1);
      const after = await inspect(); assert.equal(after.elapsed, before.elapsed); assert.equal(after.x, before.x); assert.equal(after.touch.move, false);
      await page.locator('[data-ui="inventory-overlay"] .as-close').tap(); await page.waitForTimeout(150); assert.equal((await inspect()).layer, true);
    });

    await check('a held stick is released when the window loses focus', async () => {
      await press(1, moveBase.x, moveBase.y); await drag(1, moveBase.x + 40, moveBase.y); await page.waitForTimeout(100);
      assert.equal((await inspect()).touch.move, true);
      await page.evaluate(() => dispatchEvent(new Event('blur'))); await page.waitForTimeout(100);
      const s = await inspect(); assert.equal(s.screen, 'paused'); assert.equal(s.touch.move, false); await release(1);
      await page.locator('[data-command="resume"]').tap(); await page.waitForTimeout(150); assert.equal((await inspect()).screen, 'playing');
    });

    await check('touch play opens a door, walks to a car, enters with Drive, steers with the left stick and exits', async () => {
      let s = await inspect();
      // The cabin door is three tiles south of the spawn point. Use opens it from inside.
      const door = { x: spawn.x, y: spawn.y + 96 };
      const doorTile = () => page.evaluate(d => { const s = Sirens.App.getState(), o = s.world || { originX: 0, originY: 0 }; return s.tiles[Math.floor(d.y / 32 - o.originY) * s.width + Math.floor(d.x / 32 - o.originX)]; }, door);
      assert.equal(await doorTile(), 6, 'cabin door should start closed');
      s = await walkTo({ x: door.x, y: door.y - 30 }, 6, 6000);
      await page.waitForFunction(() => /Open door/.test(document.querySelector('[data-ui="interact-text"]').textContent), null, { timeout: 4000 });
      await page.locator('[data-touch="interact"]').tap(); await page.waitForTimeout(120);
      assert.equal(await doorTile(), 7, 'Use did not open the door');
      s = await walkTo({ x: door.x, y: door.y + 46 }, 14, 6000); assert(s.y > door.y + 20, 'did not leave through the door');
      const car = s.vehicles.slice().sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
      assert(car, 'no generated car nearby');
      s = await walkTo({ x: s.x, y: car.y + 34 }, 10, 6000); s = await walkTo({ x: car.x, y: car.y + 34 }, 18, 9000);
      await page.waitForTimeout(150); assert(await page.locator('[data-touch="vehicle"]').isVisible(), 'Drive should appear beside a car');
      evidence.useBesideCar = await page.locator('[data-ui="interact-text"]').textContent();
      await page.locator('[data-touch="vehicle"]').tap(); await page.waitForTimeout(150);
      s = await inspect(); assert(s.vehicleId, 'Drive did not enter the car'); assert.equal(await page.locator('[data-touch="vehicle"]').isVisible(), false);
      const start = s; await press(1, moveBase.x, moveBase.y); await drag(1, moveBase.x, moveBase.y - 54); await page.waitForTimeout(900);
      const driving = await inspect(); await release(1);
      assert(Math.abs(driving.speed) > 5, 'car did not accelerate'); assert(Math.hypot(driving.x - start.x, driving.y - start.y) > 15, 'car did not move');
      await page.screenshot({ path: path.join(output, 'touch-driving.png') });
      await page.waitForFunction(() => { const s = Sirens.App.getState(), v = s.vehicles.find(c => c.id === s.player.vehicleId); return !v || Math.abs(v.speed) < 18; }, null, { timeout: 8000 });
      await page.locator('.as-vehicle-actions [data-action="vehicle"]').tap(); await page.waitForTimeout(120);
      assert.equal((await inspect()).vehicleId, null, 'Exit button did not leave the car');
      evidence.drive = { speed: Number(driving.speed.toFixed(1)), distance: Math.round(Math.hypot(driving.x - start.x, driving.y - start.y)) };
    });

    await check('a physical keyboard switches back to keyboard mode and touch switches again', async () => {
      await page.keyboard.press('KeyW'); await page.waitForTimeout(80); let s = await inspect();
      assert.equal(s.input, 'pointer'); assert.equal(s.layer, false);
      await page.touchscreen.tap(W * .6, H * .45); await page.waitForTimeout(80); s = await inspect(); assert.equal(s.input, 'touch'); assert.equal(s.layer, true);
    });
    await page.screenshot({ path: path.join(output, 'touch-phone-landscape.png') });
    await context.close();

    await check('touch buttons stay clear of the HUD at phone, tablet and portrait sizes', async () => {
      const layouts = {};
      for (const viewport of [{ width: 844, height: 390 }, { width: 390, height: 844 }, { width: 1024, height: 768 }, { width: 1366, height: 1024 }]) {
        const { context: c, page: p } = await open(viewport, true);
        await p.locator('[data-command="start"]').tap(); await p.waitForTimeout(300);
        const boxes = await p.evaluate(() => {
          const rect = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, r: r.right, b: r.bottom }; };
          const visible = el => el && !el.closest('[hidden]') && el.getClientRects().length > 0;
          const pick = selector => [...document.querySelectorAll(selector)].filter(visible).map(el => ({ selector, ...rect(el) }));
          return { touch: pick('.as-touch-actions button'), hud: [].concat(pick('.as-hotbar button'), pick('.as-status'), pick('#map-shell'), pick('.as-time'), pick('.as-world-info'), pick('.as-floor-info'), pick('.as-interact'), pick('.as-weapon')) };
        });
        assert.equal(boxes.touch.length, 4);
        for (const b of boxes.touch) {
          assert(b.x >= 0 && b.y >= 0 && b.r <= viewport.width && b.b <= viewport.height, 'touch button outside viewport ' + JSON.stringify(viewport));
          for (const h of boxes.hud) assert(b.r <= h.x || h.r <= b.x || b.b <= h.y || h.b <= b.y, `touch button overlaps ${h.selector} at ${viewport.width}x${viewport.height}`);
        }
        layouts[viewport.width + 'x' + viewport.height] = boxes.touch.map(b => [Math.round(b.x), Math.round(b.y)]);
        await p.screenshot({ path: path.join(output, `touch-${viewport.width}x${viewport.height}.png`) });
        await c.close();
      }
      evidence.layouts = layouts;
    });

    await check('a desktop mouse and keyboard session shows no touch controls', async () => {
      const { context: c, page: p } = await open({ width: 1440, height: 900 }, false);
      await p.locator('[data-command="start"]').click(); await p.waitForTimeout(200);
      const s = await p.evaluate(() => ({ input: document.getElementById('ui').dataset.input, layer: !document.querySelector('.as-touch').hidden, touch: Sirens.App.getTouchStatus() }));
      assert.equal(s.input, 'pointer'); assert.equal(s.layer, false); assert.equal(s.touch.enabled, false);
      assert(await p.locator('.as-hint-keys').isVisible()); assert.equal(await p.locator('.as-hint-touch').isVisible(), false);
      await c.close();
    });

    await check('touch play runs offline without uncaught errors', async () => { assert.deepEqual(errors, []); assert.deepEqual(requests, []); });
    fs.writeFileSync(path.join(output, 'touch-browser-report.json'), JSON.stringify({ passed, errors, networkRequests: requests, evidence, note: 'Headless Chrome with emulated touch hardware and CDP touch points. This verifies the input path and layout, not comfort on physical phones or tablets.' }, null, 2));
    console.log(passed.length + ' touch browser checks passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
