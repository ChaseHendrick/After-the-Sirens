'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const ROOM_KEY = 'local-browser-fixture-key';
const output = path.join(ROOT, '.test-results');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function startHost(worldFile, port = 0) {
  const child = spawn(process.execPath, [path.join(ROOT, 'server/index.cjs'), '--host', '127.0.0.1', '--port', String(port), '--world', worldFile, '--seed', '0', '--difficulty', 'calm'], {
    cwd: ROOT, env: { ...process.env, SIRENS_ROOM_TOKEN: ROOM_KEY }, stdio: ['ignore', 'pipe', 'pipe']
  });
  let text = '', exited = false;
  child.on('exit', () => { exited = true; });
  child.stdout.on('data', chunk => { text += chunk; });
  child.stderr.on('data', chunk => { text += chunk; });
  for (let i = 0; i < 100; i++) {
    const match = /world server: (http:\/\/127\.0\.0\.1:(\d+)\/)/.exec(text);
    if (match) return { child, httpUrl: match[1], wsUrl: 'ws://127.0.0.1:' + match[2] + '/game', port: Number(match[2]) };
    if (exited) throw new Error('Temporary world host failed: ' + text);
    await pause(100);
  }
  child.kill('SIGTERM'); throw new Error('Temporary world host did not start: ' + text);
}
async function stopHost(host) {
  if (!host || host.child.exitCode !== null || host.child.signalCode !== null) return;
  const stopped = once(host.child, 'exit'); host.child.kill('SIGTERM');
  const timeout = setTimeout(() => host.child.kill('SIGKILL'), 6000);
  try { await stopped; } finally { clearTimeout(timeout); }
}
async function inspect(page) {
  return page.evaluate(() => {
    const s = Sirens.App.getState(), p = s.player;
    return { id: Sirens.App.getNetworkStatus().id, online: Sirens.App.getNetworkStatus().connected, x: p.x, y: p.y,
      inventory: p.inventory, elapsed: s.elapsed, floor: s.stories && s.stories.floor, party: (s.party || []).map(p => ({ id: p.id, name: p.name, x: p.player.x, y: p.player.y })),
      containers: s.containers.map(c => ({ id: c.id, label: c.label, x: c.x, y: c.y, items: c.items, looted: c.looted, ground: c._ground })) };
  });
}
async function prepare(page, host, name, key = ROOM_KEY) {
  await page.locator('[data-play-mode="online"]').click();
  await page.locator('[data-network="url"]').fill(host.wsUrl);
  await page.locator('[data-network="name"]').fill(name);
  await page.locator('[data-network="token"]').fill(key);
}
async function join(page, host, name) {
  await prepare(page, host, name); await page.locator('[data-network="join"]').click();
  await page.waitForFunction(() => Sirens.App.getNetworkStatus().connected && Sirens.App.getState().networked, null, { timeout: 15000 });
  await page.waitForTimeout(250);
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'sirens-browser-host-'));
  const worldFile = path.join(temporary, 'world.save.json');
  let host, browser; const contexts = [], errors = [], passed = [];
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  try {
    host = await startHost(worldFile);
    browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
    async function player(width = 1100, height = 800) {
      const context = await browser.newContext({ viewport: { width, height } }); contexts.push(context);
      const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
      page.setDefaultTimeout(15000);
      await page.addInitScript(() => {
        window.__paintedPeers = []; window.__sentActions = []; window.__networkErrors = [];
        const paint = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (text, ...args) { if (/^(Alpha|Beta)$/.test(String(text))) { window.__paintedPeers.push(String(text)); if (window.__paintedPeers.length > 100) window.__paintedPeers.shift(); } return paint.call(this, text, ...args); };
        const send = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
          try { const message = JSON.parse(data); if (message.type === 'join') { window.__worldSocket = this; this.addEventListener('message', event => { try { const reply = JSON.parse(event.data); if (reply.type === 'error') window.__networkErrors.push(reply.message); } catch (_) {} }); } if (message.type === 'action') { window.__sentActions.push(message); if (window.__sentActions.length > 40) window.__sentActions.shift(); } } catch (_) {}
          return send.call(this, data);
        };
      });
      await page.goto(host.httpUrl); await page.waitForFunction(() => !!window.Sirens?.App); return page;
    }
    const alpha = await player(), beta = await player(390, 844);
    await check('Singleplayer and Multiplayer entry forms are reachable and fit 390 pixels', async () => {
      assert(await beta.locator('[data-ui="mode"]').isVisible());
      await prepare(beta, host, 'Beta', 'wrong-browser-fixture-key');
      assert(await beta.locator('[data-network="join"]').isVisible());
      assert(await beta.locator('[data-ui="mode"]').isHidden());
      const geometry = await beta.locator('.as-network-panel').evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth })); assert(geometry.scroll <= geometry.width);
      assert.equal(await beta.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await beta.screenshot({ path: path.join(output, 'multiplayer-mobile-join.png'), fullPage: true });
      await beta.locator('[data-play-mode="solo"]').click(); assert(await beta.locator('[data-ui="mode"]').isVisible());
    });
    await check('wrong world access key is denied by the actual host', async () => {
      await prepare(beta, host, 'Beta', 'wrong-browser-fixture-key'); await beta.locator('[data-network="join"]').click();
      await beta.waitForFunction(() => window.__networkErrors.some(message => /Invalid world access key/.test(message)) && Sirens.App.getNetworkStatus().phase === 'offline');
      assert.match(await beta.locator('[data-network="status"]').textContent(), /invalid|closed|rejected|disconnected/i);
      assert(!(await inspect(beta)).online); assert.equal(await beta.evaluate(() => Sirens.App.getScreen()), 'title');
    });
    await check('two independent Chrome players join one seeded server world and paint peer names', async () => {
      await join(alpha, host, 'Alpha'); await join(beta, host, 'Beta');
      await alpha.waitForFunction(() => Sirens.App.getState().party.some(p => p.name === 'Beta'));
      await beta.waitForFunction(() => Sirens.App.getState().party.some(p => p.name === 'Alpha'));
      await alpha.waitForFunction(() => window.__paintedPeers.includes('Beta')); await beta.waitForFunction(() => window.__paintedPeers.includes('Alpha'));
      const a = await inspect(alpha), b = await inspect(beta); assert.notEqual(a.id, b.id); assert.deepEqual(a.inventory, b.inventory);
      await alpha.screenshot({ path: path.join(output, 'multiplayer-two-players.png') });
    });
    await check('simultaneous real E looting spends shared supplies once and packs stay separate', async () => {
      const a = await inspect(alpha), b = await inspect(beta);
      const supply = a.containers.filter(c => !c.looted && Math.hypot(c.x - a.x, c.y - a.y) < 70).sort((x, y) => Math.hypot(x.x - a.x, x.y - a.y) - Math.hypot(y.x - a.x, y.y - a.y))[0]; assert(supply, 'starter supplies missing');
      await Promise.all([alpha.keyboard.press('KeyE'), beta.keyboard.press('KeyE')]);
      await alpha.waitForFunction(id => Sirens.App.getState().containers.find(c => c.id === id)?.looted, supply.id);
      await beta.waitForFunction(id => Sirens.App.getState().containers.find(c => c.id === id)?.looted, supply.id);
      const afterA = await inspect(alpha), afterB = await inspect(beta); let gained = 0;
      for (const id of new Set(Object.keys(a.inventory).concat(Object.keys(b.inventory), Object.keys(afterA.inventory), Object.keys(afterB.inventory)))) {
        const delta = (afterA.inventory[id] || 0) + (afterB.inventory[id] || 0) - (a.inventory[id] || 0) - (b.inventory[id] || 0);
        assert(delta >= 0 && delta <= (supply.items[id] || 0), 'shared loot duplicated for ' + id); gained += delta;
      }
      assert(gained > 0); assert.notDeepEqual(afterA.inventory, afterB.inventory);
    });
    await check('actual keyboard movement is authoritative and reaches the other player', async () => {
      const before = await inspect(alpha); await alpha.keyboard.down('KeyD'); await alpha.waitForTimeout(250); await alpha.keyboard.up('KeyD');
      await alpha.waitForFunction(x => Sirens.App.getState().player.x > x + 3, before.x);
      await alpha.waitForTimeout(250); const after = await inspect(alpha);
      try { await beta.waitForFunction(({ id, x }) => Sirens.App.getState().party.some(p => p.id === id && Math.abs(p.player.x - x) < 8), { id: after.id, x: after.x }); }
      catch (error) { const current = await inspect(alpha), other = await inspect(beta); console.error('Movement diagnostics', JSON.stringify({ startX: before.x, sampledX: after.x, ownX: current.x, ownId: current.id, peerParty: other.party })); throw error; }
    });
    await check('Journal and survivor menus idle controls while the shared simulation continues', async () => {
      await alpha.keyboard.press('KeyJ'); await alpha.waitForTimeout(150); const before = await inspect(alpha);
      assert.match(await alpha.locator('.as-journal-strip > span:last-child').textContent(), /KEEPS MOVING/);
      await alpha.waitForTimeout(800); const after = await inspect(alpha); assert(after.elapsed > before.elapsed + .3); assert(Math.hypot(after.x - before.x, after.y - before.y) < 1);
      await alpha.keyboard.press('Escape'); await alpha.keyboard.press('Escape');
      for (const command of ['save', 'exportSave', 'restart']) for (const button of await alpha.locator('[data-command="' + command + '"]').all()) assert(await button.isDisabled());
      assert(await alpha.locator('[data-ui="import"]').isDisabled());
      assert.match(await alpha.locator('#as-pause-title').textContent(), /Survivor menu/);
      await alpha.keyboard.press('Escape'); await alpha.keyboard.press('KeyI');
      assert.match(await alpha.locator('.as-paused-note').textContent(), /KEEPS MOVING/); await alpha.keyboard.press('Escape');
    });
    await check('upstairs and downstairs commands stay on the shared ground floor', async () => {
      await alpha.keyboard.press('PageUp'); await alpha.keyboard.press('PageDown'); await alpha.waitForTimeout(250);
      assert.equal((await inspect(alpha)).floor, 0);
      assert(await alpha.locator('[data-action="stairsUp"]').isDisabled()); assert(await alpha.locator('[data-action="stairsDown"]').isDisabled());
    });
    await check('replaying an actual Pack Drop command is denied without double spending; rejoin restores identity', async () => {
      const before = await inspect(alpha), peer = await inspect(beta); assert((before.inventory.food || 0) >= 2);
      await alpha.keyboard.press('KeyI'); await alpha.locator('[data-command="owned"]').click(); await alpha.locator('[data-drop="food"]').click();
      await alpha.evaluate(() => { const action = window.__sentActions.filter(m => m.action === 'drop:food').at(-1); if (!action) throw new Error('No real Drop action was sent'); window.__worldSocket.send(JSON.stringify(action)); });
      await alpha.waitForFunction(() => !Sirens.App.getNetworkStatus().connected && Sirens.App.getScreen() === 'title');
      await join(alpha, host, 'Alpha'); const restored = await inspect(alpha);
      assert.equal(restored.id, before.id); assert.equal(restored.inventory.food, before.inventory.food - 1); assert.equal((await inspect(beta)).inventory.food, peer.inventory.food);
    });
    await check('host disk save and reconnect preserve packs, world loot, and survivor identities after restart', async () => {
      const beforeA = await inspect(alpha), beforeB = await inspect(beta), port = host.port;
      await stopHost(host); host = null;
      await alpha.waitForFunction(() => !Sirens.App.getNetworkStatus().connected); await beta.waitForFunction(() => !Sirens.App.getNetworkStatus().connected);
      assert(fs.existsSync(worldFile)); host = await startHost(worldFile, port);
      await join(alpha, host, 'Alpha'); await join(beta, host, 'Beta');
      const afterA = await inspect(alpha), afterB = await inspect(beta);
      assert.equal(afterA.id, beforeA.id); assert.equal(afterB.id, beforeB.id); assert.deepEqual(afterA.inventory, beforeA.inventory); assert.deepEqual(afterB.inventory, beforeB.inventory);
      for (const c of beforeA.containers.filter(c => c.looted)) assert(afterA.containers.some(next => next.id === c.id && next.looted), 'saved loot state lost');
      const preferences = await alpha.evaluate(() => JSON.parse(localStorage.getItem('after-the-sirens-server-preferences'))); assert.deepEqual(Object.keys(preferences).sort(), ['name', 'url']);
    });
    await check('HTTPS pages reject insecure ws addresses with a visible wss requirement', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); contexts.push(context); const secure = await context.newPage();
      await secure.route('https://sirens-browser.invalid/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') }));
      await secure.goto('https://sirens-browser.invalid/'); await prepare(secure, host, 'Secure'); await secure.locator('[data-network="join"]').click();
      await secure.waitForFunction(() => /secure wss:\/\//.test(document.querySelector('[data-network="status"]').textContent)); assert(!(await inspect(secure)).online); await secure.close();
    });
    assert.deepEqual(errors, []); console.log(passed.length + ' multiplayer browser checks passed.');
    fs.writeFileSync(path.join(output, 'multiplayer-browser-report.json'), JSON.stringify({ passed, pageErrors: errors, players: 2, hostedTransport: 'real local WebSocket', note: 'Actual host and Chrome controls; no gameplay state injection.' }, null, 2));
  } catch (error) {
    console.error(error); process.exitCode = 1;
  } finally {
    for (const context of contexts) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    await stopHost(host);
    fs.rmSync(temporary, { recursive: true, force: true });
  }
})();
