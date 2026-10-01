'use strict';
// First-person view through real keyboard, mouse and Chrome touch input (DevTools Protocol touch points).
// Labeled FIXTURES are limited to placing two zombies around a wall for the occlusion check and spawning a
// crowd for the performance sample; both are removed afterwards. Other evaluations only read state, except
// document.exitPointerLock(), which stands in for the browser ending pointer lock as it does on Escape.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), output = path.join(ROOT, '.test-results');
const TAU = Math.PI * 2;
const wrap = (a) => { a %= TAU; return a > Math.PI ? a - TAU : a <= -Math.PI ? a + TAU : a; };

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
  const inspect = (page) => page.evaluate(() => {
    const s = Sirens.App.getState(), o = s.world || { originX: 0, originY: 0 }, p = s.player, v = Sirens.App.getView(), car = (s.vehicles || []).find(c => c.id === p.vehicleId);
    return { x: p.x + o.originX * 32, y: p.y + o.originY * 32, angle: p.angle, stamina: p.stamina, cooldown: p.cooldown, vehicleId: p.vehicleId, speed: car ? car.speed : 0, carAngle: car ? car.angle : null,
      screen: Sirens.App.getScreen(), mode: v.mode, yaw: v.yaw, locked: v.pointerLocked, sensitivity: v.lookSensitivity, view: document.getElementById('ui').dataset.view, touch: Sirens.App.getTouchStatus(),
      pressed: document.querySelector('[data-command="view"]').getAttribute('aria-pressed'), prompt: document.querySelector('[data-ui="interact-text"]').textContent,
      vehicles: (s.vehicles || []).map(c => ({ x: c.x + o.originX * 32, y: c.y + o.originY * 32 })) };
  });
  // Downsampled canvas pixels for comparing views; reading the canvas does not change the game.
  const picture = (page) => page.evaluate(() => {
    const source = document.getElementById('world'), small = document.createElement('canvas'); small.width = 160; small.height = 100;
    const c = small.getContext('2d'); c.drawImage(source, 0, 0, 160, 100); const data = c.getImageData(0, 0, 160, 100).data, colors = new Set();
    let sum = 0, squares = 0;
    for (let i = 0; i < data.length; i += 4) { const l = data[i] * .3 + data[i + 1] * .59 + data[i + 2] * .11; sum += l; squares += l * l; colors.add(data[i] >> 3 << 10 | data[i + 1] >> 3 << 5 | data[i + 2] >> 3); }
    const n = data.length / 4, mean = sum / n;
    return { colors: colors.size, mean, deviation: Math.sqrt(Math.max(0, squares / n - mean * mean)), data: Array.from(data) };
  });
  const difference = (a, b) => { let changed = 0; for (let i = 0; i < a.data.length; i += 4) if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 40) changed++; return changed / (a.data.length / 4); };
  async function hold(page, key, ms) { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); await page.waitForTimeout(60); }
  // Turns with the arrow keys until the view faces the bearing.
  async function faceTo(page, bearing) {
    for (let i = 0; i < 60; i++) {
      const s = await inspect(page), diff = wrap(bearing - s.yaw);
      if (Math.abs(diff) < .05) return s;
      await hold(page, diff > 0 ? 'ArrowRight' : 'ArrowLeft', Math.max(10, Math.min(250, Math.abs(diff) / 2.6 * 800)));
    }
    throw new Error('could not face ' + bearing.toFixed(2));
  }
  // Walks with W along the view, turning toward the target between short steps.
  async function walkTo(page, target, tolerance, timeout) {
    const until = Date.now() + timeout; let s = await inspect(page);
    while (Date.now() < until) {
      s = await inspect(page); const dx = target.x - s.x, dy = target.y - s.y, d = Math.hypot(dx, dy);
      if (d < tolerance) break;
      const bearing = Math.atan2(dy, dx);
      if (Math.abs(wrap(bearing - s.yaw)) > .1) await faceTo(page, bearing);
      await hold(page, 'KeyW', Math.max(30, Math.min(160, d / 98 * 700)));
    }
    return inspect(page);
  }
  const angleBetween = (dx, dy, yaw) => Math.abs(wrap(Math.atan2(dy, dx) - yaw));
  try {
    const { context, page } = await open({ width: 1440, height: 900 }, false);
    await page.locator('[data-ui="seed"]').fill('20260929'); await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-command="start"]').click(); await page.waitForTimeout(400);
    const spawn = await inspect(page), topView = await picture(page);

    await check('the HUD button, the P key and the pause-menu setting switch views', async () => {
      assert.equal(spawn.mode, 'top'); assert.equal(spawn.pressed, 'false');
      await page.locator('[data-command="view"]').click(); await page.waitForTimeout(150);
      let s = await inspect(page); assert.equal(s.mode, 'first'); assert.equal(s.pressed, 'true'); assert.equal(s.view, 'first');
      assert.equal(await page.evaluate(() => document.activeElement.tagName), 'BODY', 'the view button must not keep focus and swallow Space');
      assert(Math.abs(wrap(s.yaw - spawn.angle)) < .01, 'first person should start facing the way the survivor faces');
      assert(await page.locator('.as-hint-first-keys').isVisible()); assert.equal(await page.locator('.as-hint-keys').isVisible(), false);
      await page.keyboard.press('KeyP'); await page.waitForTimeout(100); assert.equal((await inspect(page)).mode, 'top');
      await page.keyboard.press('KeyP'); await page.waitForTimeout(100); assert.equal((await inspect(page)).mode, 'first');
      await page.keyboard.press('Escape'); await page.waitForTimeout(150); assert.equal((await inspect(page)).screen, 'paused');
      const select = page.locator('[data-setting="view"]'); assert.equal(await select.inputValue(), 'first');
      await select.selectOption('top'); await page.waitForTimeout(80); s = await inspect(page); assert.equal(s.mode, 'top'); assert.equal(s.pressed, 'false');
      await select.selectOption('first'); await page.waitForTimeout(80); assert.equal((await inspect(page)).mode, 'first');
      await page.locator('[data-setting="lookSensitivity"]').focus(); for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('[data-ui="look-value"]').textContent(), '150%');
      const prefs = await page.evaluate(() => Sirens.App.getPreferences()); assert.equal(prefs.view, 'first'); assert.equal(prefs.lookSensitivity, 1.5);
      assert.equal((await inspect(page)).screen, 'paused', 'switching views must not leave the pause menu');
    });

    await check('the view and look sensitivity persist across a reload and Continue', async () => {
      await page.reload(); await page.waitForTimeout(200);
      assert.deepEqual(await page.evaluate(() => { const p = Sirens.App.getPreferences(); return [p.view, p.lookSensitivity]; }), ['first', 1.5]);
      await page.locator('[data-command="continue"]').click(); await page.waitForFunction(() => Sirens.App.getScreen() === 'playing');
      await page.waitForTimeout(300); const s = await inspect(page);
      assert.equal(s.mode, 'first'); assert.equal(s.pressed, 'true'); assert(Math.hypot(s.x - spawn.x, s.y - spawn.y) < 2, 'the saved run did not resume in place');
    });

    await check('first person draws a detailed scene that differs from the top-down view', async () => {
      const first = await picture(page);
      assert(first.colors > 30, 'too few colors: ' + first.colors); assert(first.deviation > 6, 'flat image: ' + first.deviation.toFixed(1));
      const changed = difference(first, topView); assert(changed > .5, 'first person looks like top-down: ' + changed.toFixed(2));
      const info = await page.evaluate(() => Sirens.App.getView().firstPerson);
      assert(info.width >= 240 && info.width <= 640 && info.height > 100, 'buffer size ' + info.width + 'x' + info.height);
      evidence.picture = { colors: first.colors, deviation: Number(first.deviation.toFixed(1)), changedFromTopDown: Number(changed.toFixed(2)), buffer: [info.width, info.height], fov: info.fov };
      await page.screenshot({ path: path.join(output, 'firstperson-cabin.png') });
    });

    await check('arrow keys turn the view; W, the up arrow, A and D move relative to it', async () => {
      let before = await inspect(page);
      await hold(page, 'ArrowRight', 300); let s = await inspect(page);
      const turned = wrap(s.yaw - before.yaw); assert(turned > .35 && turned < 1.3, 'ArrowRight turned ' + turned.toFixed(2));
      assert(Math.hypot(s.x - before.x, s.y - before.y) < .5, 'turning moved the survivor');
      before = s; await hold(page, 'KeyW', 300); s = await inspect(page);
      assert(Math.hypot(s.x - before.x, s.y - before.y) > 12, 'W did not move'); assert(angleBetween(s.x - before.x, s.y - before.y, s.yaw) < .2, 'W did not follow the view');
      before = s; await hold(page, 'ArrowUp', 200); s = await inspect(page); assert(angleBetween(s.x - before.x, s.y - before.y, s.yaw) < .25, 'the up arrow did not walk forward');
      before = s; await hold(page, 'KeyA', 250); s = await inspect(page); assert(angleBetween(s.x - before.x, s.y - before.y, s.yaw - Math.PI / 2) < .25, 'A did not strafe left');
      before = s; await hold(page, 'KeyD', 250); s = await inspect(page); assert(angleBetween(s.x - before.x, s.y - before.y, s.yaw + Math.PI / 2) < .25, 'D did not strafe right');
      before = s; await hold(page, 'KeyS', 250); s = await inspect(page); assert(angleBetween(s.x - before.x, s.y - before.y, s.yaw + Math.PI) < .25, 'S did not step back');
      evidence.turnPerSecond = Number((turned / .3).toFixed(2));
    });

    await check('Space and a left click strike straight ahead; the mouse turns the view under pointer lock', async () => {
      await page.waitForTimeout(400); let before = await inspect(page);
      await hold(page, 'Space', 90); let s = await inspect(page);
      assert(s.cooldown > 0, 'Space did not attack'); assert(s.stamina < before.stamina, 'the swing cost no stamina'); assert(Math.abs(wrap(s.angle - s.yaw)) < .02, 'the attack did not face the view');
      await page.waitForTimeout(700); before = await inspect(page);
      // The click that captures the mouse only captures it; it must not swing at whoever is ahead.
      await page.mouse.move(720, 450); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up(); await page.waitForTimeout(150);
      s = await inspect(page); assert.equal(s.cooldown, 0, 'the click that captures the mouse also attacked'); assert.equal(s.stamina >= before.stamina, true, 'the capturing click spent stamina');
      await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up(); await page.waitForTimeout(120);
      s = await inspect(page); assert(s.cooldown > 0, 'a left click did not attack'); assert(Math.abs(wrap(s.angle - s.yaw)) < .02);
      evidence.pointerLock = s.locked;
      if (s.locked) {
        const yaw = s.yaw; await page.mouse.move(800, 450, { steps: 4 }); await page.waitForTimeout(120);
        const turned = wrap((await inspect(page)).yaw - yaw); assert(turned > .15 && turned < .5, 'mouse turn ' + turned.toFixed(3));
        evidence.mouseTurn = Number(turned.toFixed(3));
        await page.evaluate(() => document.exitPointerLock()); await page.waitForTimeout(150);
        assert.equal((await inspect(page)).screen, 'paused', 'losing pointer lock mid-play should pause');
        await page.waitForTimeout(400); await page.keyboard.press('Escape'); await page.waitForTimeout(150);
        assert.equal((await inspect(page)).screen, 'playing');
      }
    });

    await check('a conversation that opens without a local key press hands the mouse back', async () => {
      await page.waitForTimeout(300); await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(200);
      if (!(await inspect(page)).locked) { console.log('NOTE pointer lock is unavailable in this browser; the release check is skipped'); evidence.conversationRelease = 'skipped: no pointer lock'; return; }
      // Labeled fixture: a conversation appearing in state, as a multiplayer snapshot delivers it, with no local E press.
      await page.evaluate(() => { Sirens.App.getState().conversation = { id: 'fixture', name: 'Fixture survivor', role: 'Survivor', text: 'A snapshot opened this conversation.', trust: 0 }; });
      await page.locator('[data-ui="conversation-overlay"]').waitFor({ state: 'visible' }); await page.waitForTimeout(150);
      const s = await inspect(page); assert.equal(s.locked, false, 'the mouse stayed locked behind the conversation'); assert.equal(s.screen, 'playing', 'handing the mouse back must not pause');
      await page.evaluate(() => { Sirens.App.getState().conversation = null; }); await page.locator('[data-ui="conversation-overlay"]').waitFor({ state: 'hidden' });
      evidence.conversationRelease = 'released';
    });

    await check('a zombie straight ahead is drawn while one behind a wall is not', async () => {
      await page.keyboard.press('Escape'); await page.waitForTimeout(120); assert.equal((await inspect(page)).screen, 'paused');
      const placed = await page.evaluate(() => {
        // Labeled FIXTURE: with the run paused, two zombies stand on the view line, one before the first wall and one beyond it.
        const s = Sirens.App.getState(), p = s.player, yaw = Sirens.App.getView().yaw, ray = Sirens.FirstPerson.castRay(s, p.x, p.y, yaw, 12 * 32);
        if (!ray.hit || ray.distance < 70) return { error: 'no wall ahead', ray };
        let behind = null;
        for (let extra = 40; extra < 220 && !behind; extra += 12) { const x = p.x + Math.cos(yaw) * (ray.distance + extra), y = p.y + Math.sin(yaw) * (ray.distance + extra); if (!Sirens.Engine.isSolid(s, x / 32, y / 32)) behind = { x, y, distance: ray.distance + extra }; }
        if (!behind) return { error: 'no open tile behind the wall', ray };
        const zombie = (id, x, y) => ({ id, x, y, health: 60, state: 'wander', angle: yaw + Math.PI, windup: 0, _targetX: x, _targetY: y, _lastSeen: -100, _wanderClock: 3, _path: [], _pathClock: 0, _stun: 0, _attackCooldown: 0, _blockedTimer: 0 });
        const front = Math.max(45, ray.distance - 36);
        s.zombies.push(zombie('fixture-ahead', p.x + Math.cos(yaw) * front, p.y + Math.sin(yaw) * front), zombie('fixture-behind', behind.x, behind.y));
        return { wall: ray.distance, tile: ray.tile, front, behind: behind.distance };
      });
      assert(!placed.error, JSON.stringify(placed));
      await page.waitForTimeout(150);
      const visible = await page.evaluate(() => Sirens.App.getView().firstPerson.visible.filter(v => String(v.id).startsWith('fixture-')));
      const ahead = visible.find(v => v.id === 'fixture-ahead');
      assert(ahead && ahead.pixels > 50, 'the zombie ahead was not drawn: ' + JSON.stringify(visible));
      assert(Math.abs(ahead.column - 720) < 40, 'the zombie ahead should be centred, at ' + ahead.column);
      assert(!visible.some(v => v.id === 'fixture-behind'), 'the zombie behind the wall was drawn');
      evidence.occlusion = Object.assign(placed, { aheadPixels: ahead.pixels });
      // The pause menu covers the page, so the evidence image is read straight from the game canvas.
      const shot = await page.evaluate(() => document.getElementById('world').toDataURL('image/png'));
      fs.writeFileSync(path.join(output, 'firstperson-occlusion.png'), Buffer.from(shot.split(',')[1], 'base64'));
      await page.evaluate(() => { const s = Sirens.App.getState(); s.zombies = s.zombies.filter(z => !String(z.id).startsWith('fixture-')); });
      await page.keyboard.press('Escape'); await page.waitForTimeout(150); assert.equal((await inspect(page)).screen, 'playing');
    });

    await check('first person opens the cabin door with E, walks to a car, drives it and the camera follows the car', async () => {
      const door = { x: spawn.x, y: spawn.y + 96 };
      const doorTile = () => page.evaluate(d => { const s = Sirens.App.getState(), o = s.world || { originX: 0, originY: 0 }; return s.tiles[Math.floor(d.y / 32 - o.originY) * s.width + Math.floor(d.x / 32 - o.originX)]; }, door);
      assert.equal(await doorTile(), 6, 'cabin door should start closed');
      let s = await walkTo(page, { x: door.x, y: door.y - 30 }, 6, 8000);
      await page.waitForFunction(() => /Open door/.test(document.querySelector('[data-ui="interact-text"]').textContent), null, { timeout: 4000 });
      await page.keyboard.press('KeyE'); await page.waitForTimeout(120); assert.equal(await doorTile(), 7, 'E did not open the door');
      s = await walkTo(page, { x: door.x, y: door.y + 46 }, 12, 8000); assert(s.y > door.y + 20, 'did not leave through the door');
      await page.screenshot({ path: path.join(output, 'firstperson-street.png') });
      const car = s.vehicles.slice().sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
      assert(car, 'no generated car nearby');
      s = await walkTo(page, { x: s.x, y: car.y + 34 }, 10, 8000); s = await walkTo(page, { x: car.x, y: car.y + 34 }, 16, 12000);
      await page.waitForTimeout(120); await page.keyboard.press('KeyV'); await page.waitForTimeout(150);
      s = await inspect(page); assert(s.vehicleId, 'V did not enter the car');
      assert(Math.abs(wrap(s.yaw - s.carAngle)) < .02, 'the camera should face along the car');
      const start = s; await page.keyboard.down('KeyW'); await page.waitForTimeout(900);
      const driving = await inspect(page); await page.screenshot({ path: path.join(output, 'firstperson-driving.png') });
      await page.keyboard.down('KeyD'); await page.waitForTimeout(350); await page.keyboard.up('KeyD'); await page.keyboard.up('KeyW');
      const steered = await inspect(page);
      assert(Math.abs(driving.speed) > 5, 'car did not accelerate'); assert(Math.hypot(driving.x - start.x, driving.y - start.y) > 15, 'car did not move');
      assert(Math.abs(wrap(steered.carAngle - driving.carAngle)) > .05, 'D did not steer'); assert(Math.abs(wrap(steered.yaw - steered.carAngle)) < .02, 'the camera did not follow the car');
      await page.keyboard.down('KeyS');
      await page.waitForFunction(() => { const s = Sirens.App.getState(), v = s.vehicles.find(c => c.id === s.player.vehicleId); return !v || Math.abs(v.speed) < 18; }, null, { timeout: 8000 });
      await page.keyboard.up('KeyS'); await page.keyboard.press('KeyV'); await page.waitForTimeout(150);
      assert.equal((await inspect(page)).vehicleId, null, 'V did not leave the car');
      evidence.drive = { speed: Number(driving.speed.toFixed(1)), distance: Math.round(Math.hypot(driving.x - start.x, driving.y - start.y)), steer: Number(wrap(steered.carAngle - driving.carAngle).toFixed(3)) };
    });

    await check('first-person frame cost in the default town and beside a crowd of about 200 zombies', async () => {
      await page.waitForTimeout(2600);
      const town = await page.evaluate(() => ({ view: Sirens.App.getView().draw, frame: Sirens.App.getMetrics() }));
      // Labeled FIXTURE: a crowd of wandering dead spawned around the survivor through the engine's own spawner.
      const crowd = await page.evaluate(() => { const s = Sirens.App.getState(); for (let i = 0; i < 26; i++) Sirens.Engine.spawnWanderers(s, 8); return s.zombies.length; });
      await page.waitForTimeout(2600);
      const busy = await page.evaluate(() => ({ view: Sirens.App.getView().draw, frame: Sirens.App.getMetrics(), visible: Sirens.App.getView().firstPerson.visible.filter(v => v.kind === 'zombie').length }));
      await page.screenshot({ path: path.join(output, 'firstperson-crowd.png') });
      await page.evaluate(() => { const s = Sirens.App.getState(); s.zombies.length = 0; });
      evidence.performance = { townDraw: town.view, townFrame: { fps: town.frame.fps, p95: Number(town.frame.p95.toFixed(1)) }, crowd, crowdDraw: busy.view, crowdFrame: { fps: busy.frame.fps, p95: Number(busy.frame.p95.toFixed(1)) }, zombiesDrawn: busy.visible };
      assert(crowd >= 190, 'crowd fixture spawned ' + crowd);
      // A loose ceiling that catches regressions on slower CI machines; VALIDATION.md records measured values.
      assert(town.view.p95 < 25 && busy.view.p95 < 30, 'first-person draw is too slow: ' + JSON.stringify(evidence.performance));
    });

    await check('switching back restores the top-down view', async () => {
      await page.keyboard.press('KeyP'); await page.waitForTimeout(200);
      const s = await inspect(page), view = await page.evaluate(() => Sirens.App.getView());
      assert.equal(s.mode, 'top'); assert.equal(view.firstPerson, null); assert.equal(s.pressed, 'false'); assert.equal(s.view, 'top');
      assert(await page.locator('.as-hint-keys').isVisible()); assert.equal(await page.locator('.as-hint-first-keys').isVisible(), false);
      const back = await picture(page); assert(back.colors > 60);
      await page.screenshot({ path: path.join(output, 'firstperson-back-to-top.png') });
    });
    await context.close();

    await check('touch: the HUD button, the look pad turns, a tap strikes ahead and the left stick walks with the view', async () => {
      const { context: c, page: p } = await open({ width: 844, height: 390 }, true);
      const W = 844, H = 390, cdp = await c.newCDPSession(p), touching = new Map();
      const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...touching].map(([id, t]) => ({ x: t.x, y: t.y, id, radiusX: 3, radiusY: 3, force: 1 })) });
      const press = async (id, x, y) => { touching.set(id, { x, y }); await send('touchStart'); };
      const drag = async (id, x, y) => { touching.set(id, { x, y }); await send('touchMove'); };
      const release = async (id) => { touching.delete(id); await send('touchEnd'); };
      await p.locator('[data-ui="difficulty"]').selectOption('calm'); await p.locator('[data-command="start"]').tap(); await p.waitForTimeout(300);
      await p.locator('[data-command="view"]').tap(); await p.waitForTimeout(200);
      let s = await inspect(p); assert.equal(s.mode, 'first'); assert.equal(s.touch.enabled, true); assert.equal(s.touch.look, true);
      assert(await p.locator('.as-hint-first-touch').isVisible() || !(await p.locator('.as-controls-hint').isVisible()));
      const yaw = s.yaw, rx = W * .72, ry = H * .5;
      await press(2, rx, ry); for (let i = 1; i <= 8; i++) { await drag(2, rx + i * 12, ry); await p.waitForTimeout(16); }
      await p.waitForTimeout(80); s = await inspect(p); await release(2);
      const turned = wrap(s.yaw - yaw); assert(turned > .5 && turned < 1.1, 'look pad turned ' + turned.toFixed(2));
      assert.equal(s.cooldown, 0, 'dragging the look pad must not attack');
      await p.screenshot({ path: path.join(output, 'firstperson-touch-landscape.png') });
      await p.waitForTimeout(300); const ready = await inspect(p);
      await p.touchscreen.tap(W * .7, H * .4); await p.waitForTimeout(90); s = await inspect(p);
      assert(s.cooldown > 0 || s.stamina < ready.stamina, 'a tap did not strike'); assert(Math.abs(wrap(s.angle - s.yaw)) < .02, 'the tap should strike ahead');
      await p.waitForTimeout(700); const before = await inspect(p), base = { x: W * .2, y: H * .62 };
      await press(1, base.x, base.y); await drag(1, base.x, base.y - 50); await p.waitForTimeout(350); s = await inspect(p); await release(1);
      assert(Math.hypot(s.x - before.x, s.y - before.y) > 12, 'the left stick did not move'); assert(angleBetween(s.x - before.x, s.y - before.y, s.yaw) < .25, 'stick up should walk along the view');
      const touched = await picture(p); assert(touched.colors > 80 && touched.deviation > 10, 'blank landscape frame');
      evidence.touch = { lookTurn: Number(turned.toFixed(3)), buffer: await p.evaluate(() => { const f = Sirens.App.getView().firstPerson; return [f.width, f.height]; }) };
      await c.close();
    });

    await check('portrait phones render first person without errors', async () => {
      const { context: c, page: p } = await open({ width: 390, height: 844 }, true);
      await p.locator('[data-command="start"]').tap(); await p.waitForTimeout(300);
      await p.locator('[data-command="view"]').tap(); await p.waitForTimeout(400);
      const s = await inspect(p), frame = await picture(p); assert.equal(s.mode, 'first'); assert(frame.colors > 60 && frame.deviation > 8, 'blank portrait frame');
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'horizontal overflow');
      evidence.portrait = await p.evaluate(() => { const f = Sirens.App.getView().firstPerson; return { buffer: [f.width, f.height], fov: f.fov }; });
      await p.screenshot({ path: path.join(output, 'firstperson-portrait.png') });
      await c.close();
    });

    await check('a stored look sensitivity shows the same value on the slider and its label', async () => {
      const { context: c, page: p } = await open({ width: 1280, height: 800 }, false);
      await p.evaluate(() => localStorage.setItem('after-the-sirens-options-v1', JSON.stringify({ lookSensitivity: .35 }))); await p.reload(); await p.waitForTimeout(200);
      const shown = await p.evaluate(() => ({ slider: document.querySelector('[data-setting="lookSensitivity"]').value, label: document.querySelector('[data-ui="look-value"]').textContent }));
      assert.equal(shown.label, shown.slider + '%', 'slider ' + shown.slider + ' but label ' + shown.label); await c.close();
    });

    await check('first person runs offline without uncaught errors', async () => { assert.deepEqual(errors, []); assert.deepEqual(requests, []); });
    fs.writeFileSync(path.join(output, 'firstperson-browser-report.json'), JSON.stringify({ passed, errors, networkRequests: requests, evidence, browser: await browser.version(),
      note: 'Headless Chromium with real keyboard, mouse and CDP touch input; two labeled fixtures (occlusion pair, crowd). Draw times are renderer.draw durations on this machine, not hardware benchmarks.' }, null, 2));
    console.log(passed.length + ' first-person browser checks passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
