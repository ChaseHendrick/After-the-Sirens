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
  const passed = [], errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
  const until = (fn, arg) => page.waitForFunction(fn, arg, { polling: 'raf', timeout: 20000 });
  const audio = () => page.evaluate(() => Sirens.App.getAudioMetrics());
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-command="start"]').click();
    await until(() => Sirens.App.getAudioMetrics().context === 'running');
    // Explicit empty-terrain fixtures isolate presentation; ordinary keyboard/mouse
    // inputs below exercise the assembled game's actual update and Web Audio graph.
    await page.evaluate(() => {
      const s = Sirens.App.getState(); s.tiles.fill(0); s.zombies = []; s.humans = []; s.buildings = []; s.containers = []; s.vehicles = [];
      s.player.health = 100; s.player.stamina = 100; s.player.vehicleId = null;
    });
    await check('rendered world and minimap are independent of exploration masks', async () => {
      const result = await page.evaluate(() => {
        const s = Sirens.Engine.create(17, 'calm', 'rescue'); s.weather = 'clear'; s.time = 8;
        const canvas = document.createElement('canvas'), mini = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;left:-2000px;width:1440px;height:960px';
        mini.style.cssText = 'position:fixed;left:-2000px;width:170px;height:170px'; document.body.append(canvas, mini);
        const r = new Sirens.Renderer(canvas, mini);
        const hash = ctx => { const a = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data; let h = 2166136261; for (const v of a) h = Math.imul(h ^ v, 16777619); return h; };
        s.discovered.fill(0); r.draw(s); const hidden = [hash(r.ctx), hash(r.miniCtx)];
        s.discovered.fill(1); r.lastMini = -1000; r.draw(s); const revealed = [hash(r.ctx), hash(r.miniCtx)];
        const visible = r.known(s, s.player.x + 520, s.player.y); canvas.remove(); mini.remove();
        return { hidden, revealed, visible };
      });
      assert.deepEqual(result.hidden, result.revealed); assert(result.visible);
    });
    await check('zombies and humans render beyond walls and former sight distance', async () => {
      const result = await page.evaluate(() => {
        const s = Sirens.Engine.create(17, 'calm', 'rescue'); s.tiles.fill(0); s.buildings = []; s.containers = []; s.vehicles = []; s.weather = 'clear';
        s.player.x = 1024; s.player.y = 1024; s.discovered.fill(0);
        const z = Object.assign({}, s.zombies[0], { x: 1574, y: 1024, health: 52 });
        const h = Object.assign({}, s.humans[0] || {}, { id: 'fixture', name: 'Alex', x: 1544, y: 1080, faction: 'survivor', health: 100 });
        s.zombies = [z]; s.humans = [h];
        for (let y = 15; y < 50; y++) s.tiles[y * s.width + 40] = 3;
        const canvas = document.createElement('canvas'); canvas.style.cssText = 'position:fixed;left:-2000px;width:1440px;height:960px'; document.body.append(canvas);
        const r = new Sirens.Renderer(canvas); let zombies = 0, humans = 0;
        const dz = r.drawZombie.bind(r), dh = r.drawHuman.bind(r);
        r.drawZombie = z => { zombies++; dz(z); }; r.drawHuman = h => { humans++; dh(h, s); }; r.draw(s);
        const los = Sirens.Engine.hasLOS(s, s.player.x, s.player.y, z.x, z.y); canvas.remove(); return { zombies, humans, los };
      });
      assert.equal(result.los, false); assert.equal(result.zombies, 1); assert.equal(result.humans, 1);
    });
    await check('actual weapon pixels change across axe, machete and spear attacks', async () => {
      const result = await page.evaluate(() => {
        const s = Sirens.Engine.create(0, 'calm', 'rescue'); s.tiles.fill(0); s.zombies = []; s.humans = []; s.vehicles = [];
        const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 160;
        const r = new Sirens.Renderer(document.createElement('canvas')); r.ctx = canvas.getContext('2d');
        const images = [], sheet = document.createElement('canvas'); sheet.width = 600; sheet.height = 480; const c = sheet.getContext('2d');
        for (const [row, id] of ['fire_axe', 'machete', 'spear'].entries()) {
          s.player.inventory[id] = 1; Sirens.Engine.action(s, 'equip:' + id); s.player.cooldown = 0; s.player.stamina = 100;
          Sirens.Engine.attack(s, s.player.x + 100, s.player.y); const start = s.elapsed, duration = Sirens.Effects.pose(s).attack.duration;
          const frames = [];
          for (const [col, progress] of [.05, .5, .9].entries()) {
            s.elapsed = start + duration * progress; r.ctx.fillStyle = '#294238'; r.ctx.fillRect(0, 0, 600, 160);
            r.ctx.save(); r.ctx.translate(100 - s.player.x, 85 - s.player.y); r.drawPlayer(s.player, s); r.ctx.restore();
            const crop = r.ctx.getImageData(35, 25, 130, 120); frames.push(Array.from(crop.data).join(','));
            c.drawImage(canvas, 0, 0, 200, 160, col * 200, row * 160, 200, 160);
            c.font = '14px monospace'; c.fillStyle = '#f3e6b0'; c.fillText(id + ' ' + progress, col * 200 + 15, row * 160 + 20);
          }
          images.push(new Set(frames).size); s.elapsed += 1;
        }
        return { differences: images, png: sheet.toDataURL('image/png').split(',')[1] };
      });
      assert.deepEqual(result.differences, [3, 3, 3]); fs.writeFileSync('.test-results/combat-animation.png', Buffer.from(result.png, 'base64'));
    });
    await check('real mouse swings produce an animated pose and audible waveform', async () => {
      const before = (await audio()).played.swing || 0;
      await page.mouse.move(850, 470); await page.mouse.down();
      try { await until(before => { const a = Sirens.App.getAudioMetrics(); return a.played.swing > before && a.peak > .001 && Sirens.Effects.pose(Sirens.App.getState()).attack; }, before); }
      finally { await page.mouse.up(); }
      await page.screenshot({ path: '.test-results/visible-world.png' });
    });
    await check('footsteps use keyboard movement and real audio output', async () => {
      const before = (await audio()).played.step || 0; await page.keyboard.down('KeyD');
      try { await until(before => { const a = Sirens.App.getAudioMetrics(); return a.played.step > before && a.peak > .001; }, before); }
      finally { await page.keyboard.up('KeyD'); }
    });
    await check('gunfire and reloading have audio without a melee animation', async () => {
      await page.keyboard.press('KeyF');
      const before = (await audio()).played.shot || 0; await page.mouse.down({ button: 'right' });
      try { await until(before => { const a = Sirens.App.getAudioMetrics(), p = Sirens.Effects.pose(Sirens.App.getState()); return a.played.shot > before && a.peak > .001 && p.attack && p.attack.kind === 'firearm'; }, before); }
      finally { await page.mouse.up({ button: 'right' }); }
      await until(() => !Sirens.Effects.pose(Sirens.App.getState()).attack);
      const reload = (await audio()).played.reload || 0; await page.keyboard.press('KeyR');
      await until(before => (Sirens.App.getAudioMetrics().played.reload || 0) > before, reload);
      assert.equal(await page.evaluate(() => Sirens.Effects.pose(Sirens.App.getState()).attack), null);
    });
    await check('pause stops ambience; mute silences attacks and resumes cleanly', async () => {
      await page.keyboard.press('Escape'); await until(() => Sirens.App.getAudioMetrics().loops === 0);
      await page.locator('[data-setting="sound"]').uncheck();
      await page.keyboard.press('Escape'); const before = (await audio()).played.shot || 0;
      await page.mouse.down({ button: 'right' }); await page.waitForTimeout(250); await page.mouse.up({ button: 'right' });
      assert.equal((await audio()).played.shot || 0, before); assert.equal((await audio()).loops, 0);
      await page.waitForTimeout(150); assert((await audio()).peak < .0001);
      await page.keyboard.press('Escape'); await page.locator('[data-setting="sound"]').check(); await page.keyboard.press('Escape');
      await until(() => Sirens.App.getAudioMetrics().loops === 2 && Sirens.App.getAudioMetrics().enabled);
    });
    await check('car engine, rain and crowded effects stay bounded and finite', async () => {
      await page.evaluate(() => {
        const s = Sirens.App.getState(); s.weather = 'rain';
        const car = Object.assign({}, Sirens.Vehicles.spawnForChunk(0, 0, 0)[0], { id: 'audio-car', x: s.player.x, y: s.player.y, speed: 0, fuel: 20, condition: 100 });
        s.vehicles = [car]; s.player.vehicleId = car.id;
        for (let i = 0; i < 1000; i++) Sirens.Effects.emit(s, 'glass', { broken: true });
      });
      await until(() => Sirens.App.getAudioMetrics().peak > .002);
      assert((await audio()).voices <= 40); assert.equal((await audio()).loops, 2);
      await page.keyboard.down('KeyW'); await page.waitForTimeout(350); await page.keyboard.up('KeyW');
      assert(await page.evaluate(() => Sirens.App.getState().vehicles[0].speed > 0));
      await page.waitForTimeout(850); assert.equal((await audio()).voices, 0);
    });
    await check('night uses a readable tint across the whole viewport', async () => {
      const ratio = await page.evaluate(() => {
        const canvas = document.createElement('canvas'); canvas.width = 500; canvas.height = 500;
        const r = new Sirens.Renderer(document.createElement('canvas')); r.ctx = canvas.getContext('2d'); r.width = 500; r.height = 500;
        r.ctx.fillStyle = '#ffffff'; r.ctx.fillRect(0, 0, 500, 500); r.drawLighting({ time: 0 });
        const a = r.ctx.getImageData(0, 0, 1, 1).data, b = r.ctx.getImageData(250, 250, 1, 1).data;
        return { edge: Array.from(a), center: Array.from(b) };
      });
      assert.deepEqual(ratio.edge, ratio.center); assert(ratio.edge[0] > 210);
    });
    await check('offline audio and rendering cause no page errors or asset requests', async () => {
      assert.deepEqual(errors, []); assert.deepEqual(requests, []);
      const a = await audio(); assert(Number.isFinite(a.peak)); assert(a.peak <= 1);
    });
    const report = { passed, errors, networkRequests: requests, audio: await audio(), browser: await browser.version() };
    fs.writeFileSync('.test-results/effects-browser-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
