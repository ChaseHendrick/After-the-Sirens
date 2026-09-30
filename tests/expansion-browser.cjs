const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

// Run against the assembled offline game. CHROME_BIN optionally selects installed Chrome.
// Fixtures only place existing entities and provide supplies. Every tested game action
// uses the real keyboard, buttons, download, or file input rather than Engine.action.
(async () => {
  const resultDir = path.resolve(__dirname, '../.test-results');
  fs.mkdirSync(resultDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {})
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, acceptDownloads: true });
  page.setDefaultTimeout(18000);
  const passed = [], errors = [], requests = [], fixtures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  const read = fn => page.evaluate(fn);
  const until = (fn, arg) => page.waitForFunction(fn, arg, { polling: 'raf', timeout: 18000 });
  const check = async (name, fn) => { await fn(); passed.push(name); console.log('PASS ' + name); };
  const fixture = async (name, fn) => { await page.evaluate(fn); fixtures.push(name); console.log('FIXTURE ' + name); };
  const holdUntil = async (key, fn, arg) => {
    await page.keyboard.down(key);
    try { await until(fn, arg); } finally { await page.keyboard.up(key); }
  };
  const animationFrames = count => page.evaluate(count => new Promise(resolve => {
    const next = () => --count <= 0 ? resolve() : requestAnimationFrame(next);
    requestAnimationFrame(next);
  }), count);
  const exportSave = async name => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-command="exportSave"]').click();
    const download = await downloadPromise;
    const file = path.join(resultDir, name);
    await download.saveAs(file);
    return { file, doc: JSON.parse(fs.readFileSync(file, 'utf8')) };
  };
  let exported;
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await until(() => window.Sirens && Sirens.App && Sirens.App.getScreen() === 'title');
    await check('open world starts through the actual title controls', async () => {
      assert.equal(await page.locator('[data-ui="mode"]').inputValue(), 'openworld');
      await page.locator('[data-ui="difficulty"]').selectOption('calm');
      await page.locator('[data-ui="seed"]').fill('20260929');
      await page.locator('[data-command="start"]').click();
      await until(() => Sirens.App.getScreen() === 'playing');
      const result = await read(() => {
        const s = Sirens.App.getState();
        return { mode: s.mode, width: s.width, originX: s.world.originX, vehicles: s.vehicles.length, humans: s.humans.length };
      });
      assert.equal(result.mode, 'openworld'); assert.equal(result.width, 192);
      assert(result.vehicles > 0 && result.humans > 0, 'generated vehicles or humans missing');
      assert(await page.locator('[data-ui="world-info"]').isVisible());
    });

    await fixture('safe road scene: existing town car and survivor, fuel and rations; ambient combat removed', () => {
      const s = Sirens.App.getState(), T = 32;
      const car = s.vehicles.find(v => v.id === 'v:0,0:0');
      const human = s.humans.find(h => h.id === 'h:0,0:0');
      if (!car || !human) throw new Error('Expected generated town entities are unavailable.');
      const fuelId = Object.keys(Sirens.Catalog.items).find(id => Sirens.Catalog.items[id].fuel > 0);
      if (!fuelId) throw new Error('No fuel item definition.');
      car.x = (31.5 - s.world.originX) * T; car.y = (20.5 - s.world.originY) * T;
      car.angle = Math.PI / 2; car.speed = 0; car.fuel = 10; car.condition = 88;
      s.player.x = car.x - 38; s.player.y = car.y; s.player.vehicleId = null;
      s.player.inventory[fuelId] = 2; s.player.inventory.food = 6;
      s.zombies = []; s.world.dormantZombies = []; s.world.dormantHumans = [];
      human.x = car.x; human.y = car.y - 200; human.faction = 'survivor'; human.health = 100; human.following = false;
      s.humans = [human];
      window.__expansionFixture = { carId: car.id, humanId: human.id, fuelId, startX: car.x, startY: car.y };
    });
    await check('V enters the car, W accelerates, S brakes, and V exits', async () => {
      await page.keyboard.press('KeyV');
      await until(() => Sirens.App.getState().player.vehicleId === __expansionFixture.carId);
      await until(() => !document.querySelector('[data-ui="vehicle-info"]').hidden);
      await holdUntil('KeyW', () => {
        const s = Sirens.App.getState(), v = s.vehicles.find(v => v.id === __expansionFixture.carId);
        return Math.hypot(v.x - __expansionFixture.startX, v.y - __expansionFixture.startY) > 12 && v.speed > 10;
      });
      const moving = await read(() => {
        const s = Sirens.App.getState(), v = s.vehicles.find(v => v.id === __expansionFixture.carId);
        return { speed: v.speed, separation: Math.hypot(v.x - s.player.x, v.y - s.player.y) };
      });
      assert(moving.speed > 0); assert(moving.separation < .001, 'driver left vehicle position');
      await holdUntil('KeyS', () => Math.abs(Sirens.App.getState().vehicles.find(v => v.id === __expansionFixture.carId).speed) < 12);
      await page.keyboard.press('KeyV');
      await until(() => Sirens.App.getState().player.vehicleId === null);
      const exited = await read(() => {
        const s = Sirens.App.getState(), v = s.vehicles.find(v => v.id === __expansionFixture.carId);
        return { speed: v.speed, separation: Math.hypot(v.x - s.player.x, v.y - s.player.y) };
      });
      assert.equal(exited.speed, 0); assert(exited.separation > 25, 'exit did not place the player beside the car');
    });
    await check('G refuels the nearby stopped car and consumes one real fuel item', async () => {
      const before = await read(() => {
        const s = Sirens.App.getState(); return { fuel: s.vehicles.find(v => v.id === __expansionFixture.carId).fuel, quantity: s.player.inventory[__expansionFixture.fuelId] };
      });
      await page.keyboard.press('KeyG');
      await until(before => {
        const s = Sirens.App.getState(); return s.vehicles.find(v => v.id === __expansionFixture.carId).fuel > before.fuel;
      }, before);
      const after = await read(() => {
        const s = Sirens.App.getState(); return { fuel: s.vehicles.find(v => v.id === __expansionFixture.carId).fuel, quantity: s.player.inventory[__expansionFixture.fuelId] || 0 };
      });
      assert.equal(after.quantity, before.quantity - 1);
      assert(after.fuel > before.fuel);
    });

    await fixture('place the player at a generated cabin staircase', () => {
      const s = Sirens.App.getState(); Sirens.Stories.refresh(s);
      const b = s.buildings.find(b => /Safe cabin/.test(b.name)) || s.buildings.find(b => b.stairs);
      if (!b || !b.stairs) throw new Error('No generated staircase.');
      s.player.x = (b.stairs.x + .5) * 32; s.player.y = (b.stairs.y + .5) * 32;
      __expansionFixture.buildingKey = b._storyKey;
      __expansionFixture.stairsX = s.player.x; __expansionFixture.stairsY = s.player.y;
    });
    await check('Page Up enters an upper floor and Page Down restores the ground scene', async () => {
      await page.keyboard.press('PageUp');
      await until(() => Sirens.App.getState().stories.floor === 1);
      await until(() => /FLOOR 2/i.test(document.querySelector('[data-ui="floor-label"]').textContent));
      assert.equal(await read(() => Sirens.App.getState().vehicles.length), 0, 'ground vehicles leaked upstairs');
      assert.equal(await read(() => Sirens.App.getState().humans.length), 0, 'ground humans leaked upstairs');
      await page.keyboard.press('PageDown');
      await until(() => Sirens.App.getState().stories.floor === 0);
      assert(await read(() => Sirens.App.getState().vehicles.some(v => v.id === __expansionFixture.carId)));
      assert(await read(() => Sirens.App.getState().humans.some(h => h.id === __expansionFixture.humanId)));
    });

    await fixture('place the player beside the existing friendly survivor on a clear road', () => {
      const s = Sirens.App.getState(), h = s.humans.find(h => h.id === __expansionFixture.humanId);
      h.x = (31.5 - s.world.originX) * 32; h.y = (20.5 - s.world.originY) * 32;
      h._step = null; h._thinkClock = 0;
      s.player.x = h.x - 28; s.player.y = h.y;
    });
    await check('E opens a survivor conversation and pauses simulation', async () => {
      await page.keyboard.press('KeyE');
      await until(() => Sirens.App.getState().conversation && Sirens.App.getState().conversation.id === __expansionFixture.humanId);
      await page.locator('[data-ui="conversation-overlay"]').waitFor({ state: 'visible' });
      const elapsed = await read(() => Sirens.App.getState().elapsed);
      await animationFrames(18);
      assert.equal(await read(() => Sirens.App.getState().elapsed), elapsed, 'conversation did not pause simulation');
    });
    await check('conversation buttons trade, recruit, dismiss, and recruit again', async () => {
      const before = await read(() => ({ ...Sirens.App.getState().player.inventory }));
      await page.locator('[data-ui="conversation-trade"]').click();
      await until(before => Sirens.App.getState().player.inventory.bandage === (before.bandage || 0) + 1, before);
      assert.equal(await read(() => Sirens.App.getState().player.inventory.food), before.food - 1);
      await page.locator('[data-ui="conversation-recruit"]').click();
      await until(() => Sirens.App.getState().humans.find(h => h.id === __expansionFixture.humanId).following);
      assert.equal(await read(() => Sirens.App.getState().player.inventory.food), before.food - 2);
      await page.locator('[data-ui="conversation-dismiss"]').click();
      await until(() => !Sirens.App.getState().humans.find(h => h.id === __expansionFixture.humanId).following);
      assert.equal(await read(() => Sirens.App.getState().player.inventory.food), before.food - 2);
      await page.locator('[data-ui="conversation-recruit"]').click();
      await until(() => Sirens.App.getState().humans.find(h => h.id === __expansionFixture.humanId).following);
      assert.equal(await read(() => Sirens.App.getState().player.inventory.food), before.food - 3);
      await page.keyboard.press('Escape');
      await until(() => !Sirens.App.getState().conversation);
      assert.equal(await read(() => Sirens.App.getScreen()), 'playing');
      await page.locator('[data-ui="conversation-overlay"]').waitFor({ state: 'hidden' });
    });

    await check('catalogue category and search filters show definitions without owned-item actions', async () => {
      await page.keyboard.press('KeyI');
      await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'visible' });
      await page.locator('[data-command="catalogue"]').click();
      await until(() => document.querySelector('[data-ui="items"]').children.length === Object.keys(Sirens.Catalog.items).length);
      await page.locator('[data-ui="category"]').selectOption('medical');
      await page.locator('[data-ui="item-search"]').fill('bandage');
      await until(() => {
        const rows = [...document.querySelectorAll('[data-ui="items"] [data-item]')];
        return rows.length > 0 && rows.every(row => {
          const i = Sirens.Catalog.items[row.dataset.item]; return i.category === 'medical' && (i.name + ' ' + i.description + ' ' + (i.tags || []).join(' ')).toLowerCase().includes('bandage');
        });
      });
      assert.equal(await page.locator('[data-ui="items"] [data-use], [data-ui="items"] [data-equip], [data-ui="items"] [data-drop]').count(), 0);
      await page.locator('[data-ui="item-search"]').fill('an item that cannot exist');
      await until(() => document.querySelectorAll('[data-ui="items"] [data-item]').length === 0);
      assert.match(await page.locator('[data-ui="items"]').textContent(), /No items match/);
      await page.locator('[data-ui="item-search"]').fill('');
      await page.locator('[data-ui="category"]').selectOption('all');
      await page.locator('[data-command="owned"]').click();
      await until(() => document.querySelectorAll('[data-ui="items"] [data-drop]').length > 0);
      await page.locator('[data-command="crafting"]').click();
      await page.locator('[data-ui="recipe-search"]').fill('field wraps');
      await until(() => document.querySelectorAll('[data-ui="recipes"] [data-craft]').length === 1);
      assert.equal(await page.locator('[data-ui="recipes"] [data-craft]').getAttribute('data-craft'), 'field_wraps');
      await page.locator('[data-ui="recipe-search"]').fill('');
      await page.locator('[data-ui="recipe-ready"]').check();
      assert.equal(await page.locator('[data-ui="recipes"] [data-craft]:disabled').count(), 0);
      await page.keyboard.press('Escape');
      await page.locator('[data-ui="inventory-overlay"]').waitFor({ state: 'hidden' });
    });

    await fixture('return to the same staircase for an upstairs export and import', () => {
      const s = Sirens.App.getState(); s.player.x = __expansionFixture.stairsX; s.player.y = __expansionFixture.stairsY;
    });
    await check('save and export preserve the upper floor, changed car, inventory, and companion', async () => {
      await page.keyboard.press('PageUp');
      await until(() => Sirens.App.getState().stories.floor === 1);
      await page.keyboard.press('Escape');
      await until(() => Sirens.App.getScreen() === 'paused');
      await page.locator('[data-command="save"]').click();
      assert.equal(await read(() => JSON.parse(localStorage.getItem('after-the-sirens-save-v1')).version), 2);
      await read(() => {
        const s = Sirens.App.getState(), g = Sirens.Stories.groundView(s);
        __expansionFixture.expected = {
          inventory: JSON.parse(JSON.stringify(s.player.inventory)), floor: s.stories.floor, buildingKey: s.stories.buildingKey,
          car: JSON.parse(JSON.stringify(g.vehicles.find(v => v.id === __expansionFixture.carId))),
          humanFollowing: g.humans.find(h => h.id === __expansionFixture.humanId).following
        };
      });
      exported = await exportSave('expansion-save.json');
      assert.equal(exported.doc.version, 2); assert.equal(exported.doc.stories.floor, 1);
      assert(Object.values(exported.doc.world.records).some(r => r.vehicles.some(v => v.id === 'v:0,0:0')));
      assert(Object.values(exported.doc.world.records).some(r => r.humans.some(h => h.id === 'h:0,0:0' && h.following)));
    });
    await check('import restores expanded state after a fresh run, then Page Down restores its ground actors', async () => {
      await page.locator('.as-overlay[data-screen="paused"] [data-command="restart"]').click();
      await until(() => Sirens.App.getScreen() === 'playing' && Sirens.App.getState().stories.floor === 0);
      await page.keyboard.press('Escape');
      await until(() => Sirens.App.getScreen() === 'paused');
      await page.locator('[data-ui="import"]').setInputFiles(exported.file);
      await until(() => Sirens.App.getScreen() === 'playing' && Sirens.App.getState().stories.floor === 1);
      const restored = await read(() => {
        const s = Sirens.App.getState(), g = Sirens.Stories.groundView(s), f = __expansionFixture;
        const car = g.vehicles.find(v => v.id === f.carId), human = g.humans.find(h => h.id === f.humanId);
        return { inventory: s.player.inventory, floor: s.stories.floor, buildingKey: s.stories.buildingKey, car, humanFollowing: human && human.following, expected: f.expected };
      });
      assert.deepEqual(restored.inventory, restored.expected.inventory);
      assert.equal(restored.floor, restored.expected.floor); assert.equal(restored.buildingKey, restored.expected.buildingKey);
      for (const field of ['id', 'x', 'y', 'fuel', 'condition', 'speed', 'angle']) assert.equal(restored.car[field], restored.expected.car[field], 'vehicle field ' + field);
      assert.equal(restored.humanFollowing, true);
      await page.keyboard.press('PageDown');
      await until(() => Sirens.App.getState().stories.floor === 0);
      assert(await read(() => Sirens.App.getState().humans.find(h => h.id === __expansionFixture.humanId).following));
    });
    await check('expanded UI and renderer remain offline, finite, and free of page errors', async () => {
      await animationFrames(12);
      const bad = await read(() => {
        const bad = []; const walk = (v, p) => {
          if (typeof v === 'number' && !Number.isFinite(v)) bad.push(p);
          else if (v && typeof v === 'object') for (const [key, value] of Object.entries(v)) walk(value, p + '.' + key);
        }; walk(Sirens.App.getState(), 'state'); return bad;
      });
      assert.deepEqual(bad, []); assert.deepEqual(errors, []); assert.deepEqual(requests, []);
      await page.screenshot({ path: path.join(resultDir, 'expansion-gameplay.png') });
    });
    const report = { passed, fixtures, errors, networkRequests: requests, browser: await browser.version() };
    fs.writeFileSync(path.join(resultDir, 'expansion-browser-report.json'), JSON.stringify(report, null, 2));
    console.log('Expansion browser checks complete: ' + passed.length);
  } catch (error) {
    await page.screenshot({ path: path.join(resultDir, 'expansion-failure.png') }).catch(() => {});
    fs.writeFileSync(path.join(resultDir, 'expansion-browser-report.json'), JSON.stringify({ passed, fixtures, errors, networkRequests: requests, failure: error.stack }, null, 2));
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
