const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Placement and supplies are explicit fixtures. Terrain changes are produced only
// through real keyboard or mouse attacks and E interactions in the integrated game.
(async () => {
  const resultDir = path.resolve(__dirname, '../.test-results');
  fs.mkdirSync(resultDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, acceptDownloads: true });
  page.setDefaultTimeout(24000);
  const passed = [], fixtures = [], errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  const until = (fn, arg) => page.waitForFunction(fn, arg, { polling: 'raf', timeout: 24000 });
  const check = async (name, fn) => { await fn(); passed.push(name); console.log('PASS ' + name); };
  const fixture = async (name, fn, arg) => { await page.evaluate(fn, arg); fixtures.push(name); console.log('FIXTURE ' + name); };
  const frames = count => page.evaluate(count => new Promise(resolve => {
    const next = () => --count <= 0 ? resolve() : requestAnimationFrame(next); requestAnimationFrame(next);
  }), count);
  const aim = async targetName => {
    await frames(36);
    const point = await page.evaluate(targetName => {
      const s = Sirens.App.getState(), t = __destructionFixture[targetName], r = document.querySelector('#world').getBoundingClientRect();
      return { x: r.left + r.width / 2 + (t.x + .5) * 32 - s.player.x, y: r.top + r.height / 2 + (t.y + .5) * 32 - s.player.y };
    }, targetName);
    await page.mouse.move(point.x, point.y);
  };
  const strikeUntil = async (targetName, kind, resultTile) => {
    await aim(targetName);
    if (kind === 'keyboard') await page.keyboard.down('Space'); else await page.mouse.down();
    try {
      await until(({ targetName, resultTile }) => {
        const s = Sirens.App.getState(), t = __destructionFixture[targetName]; return s.tiles[t.y * s.width + t.x] === resultTile;
      }, { targetName, resultTile });
    } finally { if (kind === 'keyboard') await page.keyboard.up('Space'); else await page.mouse.up(); }
  };
  const equip = async id => {
    await page.keyboard.press('KeyI');
    await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'visible' });
    await page.locator('[data-equip="' + id + '"]').click();
    await until(id => Sirens.App.getState().player.weapon === id, id);
    await page.keyboard.press('Escape');
    await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'hidden' });
  };
  const place = async targetName => fixture('place player beside generated ' + targetName, targetName => {
    const s = Sirens.App.getState(), t = __destructionFixture[targetName];
    s.player.x = t.standX; s.player.y = t.standY; s.player.resting = false;
  }, targetName);
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await until(() => window.Sirens && Sirens.App && Sirens.Destruction);
    await page.locator('[data-ui="difficulty"]').selectOption('calm');
    await page.locator('[data-command="start"]').click();
    await until(() => Sirens.App.getScreen() === 'playing');
    await fixture('supply owned fire axe and sledgehammer; select original generated terrain; remove ambient combat', () => {
      const s = Sirens.App.getState(), b = s.buildings.find(b => b.name === 'Safe cabin');
      if (!b) throw new Error('No generated safe cabin.');
      const target = (x, y, standX, standY) => ({ x, y, standX, standY });
      let door;
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) {
        if (s.tiles[y * s.width + x] === 6) door = target(x, y, (x + .5) * 32, (y - .5) * 32);
      }
      const windowLeft = target(b.x, b.y + b.h - 3, (b.x + 1.5) * 32, (b.y + b.h - 2.5) * 32);
      const windowRight = target(b.x + b.w - 1, b.y + b.h - 3, (b.x + b.w - 1.5) * 32, (b.y + b.h - 2.5) * 32);
      if (!door || s.tiles[windowLeft.y * s.width + windowLeft.x] !== 8 || s.tiles[windowRight.y * s.width + windowRight.x] !== 8) throw new Error('Expected generated door/windows missing.');
      let tree;
      for (let y = b.y + b.h + 2; y < Math.min(s.height - 2, b.y + b.h + 24) && !tree; y++) for (let x = b.x; x < Math.min(s.width - 2, b.x + 30) && !tree; x++) {
        if (s.tiles[y * s.width + x] !== 5) continue;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          if (s.tiles[(y + dy) * s.width + x + dx] === 0) { tree = target(x, y, (x + dx + .5) * 32, (y + dy + .5) * 32); break; }
        }
      }
      if (!tree) throw new Error('No generated accessible tree.');
      const wall = target(b.x + 3, b.y, (b.x + 3.5) * 32, (b.y + 1.5) * 32);
      if (s.tiles[wall.y * s.width + wall.x] !== 3) throw new Error('Expected generated wall missing.');
      window.__destructionFixture = { door, windowLeft, windowRight, tree, wall };
      s.player.inventory.fire_axe = 1; s.player.inventory.sledgehammer = 1;
      s.zombies = []; s.humans = []; s.world.dormantZombies = []; s.world.dormantHumans = [];
      s.player.vehicleId = null;
    });
    await equip('fire_axe');
    await place('door');
    await check('aimed Space axe strikes bash a closed generated door open', async () => {
      await strikeUntil('door', 'keyboard', 7);
    });
    await place('windowLeft');
    await check('E opens and climbs an intact window, and E returns through the opening', async () => {
      await until(() => /window/i.test(document.querySelector('[data-ui="interact-text"]').textContent));
      const before = await page.evaluate(() => ({ x: Sirens.App.getState().player.x, y: Sirens.App.getState().player.y }));
      await page.keyboard.press('KeyE');
      await until(() => { const s = Sirens.App.getState(), t = __destructionFixture.windowLeft; return s.tiles[t.y * s.width + t.x] === 9; });
      assert.notEqual(await page.evaluate(() => { const s = Sirens.App.getState(), t = __destructionFixture.windowLeft; return s._terrainHealth[t.y * s.width + t.x]; }), 0, 'normal opening smashed the glass');
      await until(() => Sirens.App.getState().player.x < (__destructionFixture.windowLeft.x + .5) * 32 - 16);
      const after = await page.evaluate(() => ({ x: Sirens.App.getState().player.x, y: Sirens.App.getState().player.y }));
      assert(after.x < before.x - 32); assert(Math.abs(after.y - before.y) < 1);
      await page.keyboard.press('KeyE');
      await until(() => Sirens.App.getState().player.x > (__destructionFixture.windowLeft.x + .5) * 32 + 16);
    });
    await place('windowRight');
    await check('left mouse axe strikes smash glass and E climbs through the broken opening', async () => {
      await strikeUntil('windowRight', 'mouse', 9);
      assert.equal(await page.evaluate(() => { const s = Sirens.App.getState(), t = __destructionFixture.windowRight; return s._terrainHealth[t.y * s.width + t.x]; }), 0);
      await page.keyboard.press('KeyE');
      await until(() => Sirens.App.getState().player.x > (__destructionFixture.windowRight.x + .5) * 32 + 16);
    });
    await place('tree');
    await check('axe chopping removes a generated tree and produces wood', async () => {
      const before = await page.evaluate(() => Sirens.App.getState().player.inventory.wood || 0);
      await strikeUntil('tree', 'keyboard', 0);
      const after = await page.evaluate(() => {
        const s = Sirens.App.getState(); return (s.player.inventory.wood || 0) + s.containers.filter(c => c._ground).reduce((n, c) => n + (c.items.wood || 0), 0);
      });
      assert(after > before, 'chopped wood did not enter inventory or ground supplies');
    });
    await equip('sledgehammer');
    await place('wall');
    await check('sledgehammer strikes destroy a generated wall', async () => {
      await aim('wall');
      await page.mouse.down();
      try {
        await until(() => {
          const s = Sirens.App.getState(), t = __destructionFixture.wall, index = t.y * s.width + t.x;
          return s.tiles[index] === 3 && s._terrainHealth[index] > 0;
        });
      } finally { await page.mouse.up(); }
      await page.screenshot({ path: path.join(resultDir, 'destruction-damaged-wall.png') });
      await strikeUntil('wall', 'mouse', 2);
      await page.screenshot({ path: path.join(resultDir, 'destruction-gameplay.png') });
    });
    await check('local save, full reload, and Continue retain destroyed terrain and intact/broken window states', async () => {
      await page.keyboard.press('Escape');
      await until(() => Sirens.App.getScreen() === 'paused');
      await page.locator('[data-command="save"]').click();
      const before = await page.evaluate(() => {
        const s = Sirens.App.getState(), targets = __destructionFixture;
        return Object.fromEntries(Object.entries(targets).map(([name, t]) => [name, { x: t.x, y: t.y, tile: s.tiles[t.y * s.width + t.x], health: s._terrainHealth[t.y * s.width + t.x] ?? null }]));
      });
      fs.writeFileSync(path.join(resultDir, 'destruction-targets.json'), JSON.stringify(before, null, 2));
      await page.reload();
      await until(() => Sirens.App.getScreen() === 'title');
      await page.locator('[data-command="continue"]').click();
      await until(() => Sirens.App.getScreen() === 'playing');
      const after = await page.evaluate(targets => {
        const s = Sirens.App.getState(); return Object.fromEntries(Object.entries(targets).map(([name, t]) => [name, { x: t.x, y: t.y, tile: s.tiles[t.y * s.width + t.x], health: s._terrainHealth[t.y * s.width + t.x] ?? null }]));
      }, before);
      assert.deepEqual(after, before);
      assert.equal(after.door.tile, 7); assert.equal(after.windowLeft.tile, 9); assert.equal(after.windowRight.health, 0); assert.equal(after.tree.tile, 0); assert.equal(after.wall.tile, 2);
      await page.keyboard.press('Escape');
      await until(() => Sirens.App.getScreen() === 'paused');
      assert.match(await page.locator('.as-controls').textContent(), /Axes chop trees and bash doors/);
      assert.match(await page.locator('.as-controls').textContent(), /Open or climb a window/);
    });
    await page.keyboard.press('Escape');
    await until(() => Sirens.App.getScreen() === 'playing');
    await fixture('controlled lethal glass case: three health, no armor, RNG seed 1, beside saved broken window', targets => {
      const s = Sirens.App.getState(), t = targets.windowRight;
      s.player.x = (t.x - .5) * 32; s.player.y = (t.y + .5) * 32;
      s.player.health = 3; s.player.bleeding = 0; s.player.equipment.clothing = null; s._rng = 1;
    }, JSON.parse(fs.readFileSync(path.join(resultDir, 'destruction-targets.json'), 'utf8')));
    await check('a lethal glass climb reaches the death screen and its restart button creates a fresh run', async () => {
      await page.keyboard.press('KeyE');
      await until(() => Sirens.App.getScreen() === 'dead');
      assert.equal(await page.evaluate(() => Sirens.App.getState().player.health), 0);
      await page.locator('.as-overlay[data-screen="dead"] [data-command="restart"]').click();
      await until(() => Sirens.App.getScreen() === 'playing' && Sirens.App.getState().player.health > 0 && !Sirens.App.getState().ended);
      assert.equal(await page.evaluate(() => Sirens.App.getState().mode), 'openworld');
    });
    await check('destruction integration stays offline and free of page errors', async () => {
      assert.deepEqual(errors, []); assert.deepEqual(requests, []);
    });
    fs.writeFileSync(path.join(resultDir, 'destruction-browser-report.json'), JSON.stringify({ passed, fixtures, errors, networkRequests: requests, browser: await browser.version() }, null, 2));
    console.log('Destruction browser checks complete: ' + passed.length);
  } catch (error) {
    await page.screenshot({ path: path.join(resultDir, 'destruction-failure.png') }).catch(() => {});
    fs.writeFileSync(path.join(resultDir, 'destruction-browser-report.json'), JSON.stringify({ passed, fixtures, errors, networkRequests: requests, failure: error.stack }, null, 2));
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
