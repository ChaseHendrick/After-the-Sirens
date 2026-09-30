'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createServer } = require('../server/index.cjs');
const ROOT = path.resolve(__dirname, '..'), output = path.join(ROOT, '.test-results');
const ROOM_KEY = 'private-lobby-browser-fixture-key';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'sirens-lobbies-browser-'));
  const hosts = [], contexts = [], passed = [], errors = [], hostErrors = [], directoryRequests = [];
  let browser;
  async function check(name, fn) { await fn(); passed.push(name); console.log('PASS ' + name); }
  async function online(page) { await page.locator('[data-play-mode="online"]').click(); }
  async function details(page) { const lobby = page.locator('.as-lobby-browser'); if (!(await lobby.evaluate(el => el.open))) await lobby.locator('summary').click(); }
  async function browse(page, host) {
    await online(page); await details(page); await page.locator('[data-lobby="directory"]').fill(host.httpUrl + 'servers');
    await page.locator('[data-lobby="refresh"]').click(); await page.waitForFunction(() => !document.querySelector('[data-lobby="refresh"]').disabled);
  }
  async function joined(page) { await page.waitForFunction(() => Sirens.App.getNetworkStatus().connected && Sirens.App.getState().networked, null, { timeout: 15000 }); }
  async function player(host, fragment = '') {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); contexts.push(context);
    const page = await context.newPage(); page.setDefaultTimeout(15000); page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.url().endsWith('/servers')) directoryRequests.push(request.url()); });
    await page.goto(host.httpUrl + fragment); await page.waitForFunction(() => !!window.Sirens?.Lobbies); return page;
  }
  try {
    const publicHost = await createServer({ host: '127.0.0.1', port: 0, public: true, name: 'Open meadow', token: ROOM_KEY, seed: 0, difficulty: 'calm', worldFile: path.join(temporary, 'public.json'), onError: error => hostErrors.push(error.message) }); hosts.push(publicHost);
    const privateHost = await createServer({ host: '127.0.0.1', port: 0, public: false, name: 'Quiet private world', token: ROOM_KEY, seed: 42, difficulty: 'calm', worldFile: path.join(temporary, 'private.json'), onError: error => hostErrors.push(error.message) }); hosts.push(privateHost);
    browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
    const publicPlayer = await player(publicHost), invitedPlayer = await player(publicHost);
    await check('actual host listings advertise public twenty-player capacity and omit private worlds and access keys', async () => {
      const listing = await (await fetch(publicHost.httpUrl + 'servers')).json(), hidden = await (await fetch(privateHost.httpUrl + 'servers')).json();
      assert.equal(listing.version, 1); assert.equal(listing.servers.length, 1); assert.equal(listing.servers[0].capacity, 20); assert.equal(listing.servers[0].public, true);
      assert.equal(listing.servers[0].players, 0); assert(!JSON.stringify(listing).includes(ROOM_KEY)); assert.deepEqual(hidden.servers, []);
      assert.equal(publicHost.invite, null); assert(privateHost.invite.startsWith('SIRENS1.'));
    });
    await check('Browse public servers fetches the real directory and selects a key-free row through the UI', async () => {
      await browse(publicPlayer, publicHost); const rows = publicPlayer.locator('[data-lobby="servers"] button'); assert.equal(await rows.count(), 1);
      assert.match(await rows.first().textContent(), /Open meadow.*0\/20.*calm/); assert(await rows.first().isEnabled()); await rows.first().click();
      assert.equal(await publicPlayer.locator('[data-network="url"]').inputValue(), publicHost.url); assert.equal(await publicPlayer.locator('[data-network="token"]').inputValue(), '');
      assert.match(await publicPlayer.locator('[data-network="status"]').textContent(), /Public world selected/);
      await publicPlayer.screenshot({ path: path.join(output, 'lobbies-public-browser.png'), fullPage: true });
    });
    await check('the selected public world joins without an access key and reports twenty-player capacity', async () => {
      await publicPlayer.locator('[data-network="name"]').fill('Public guest'); await publicPlayer.locator('[data-network="join"]').click(); await joined(publicPlayer);
      const health = await (await fetch(publicHost.httpUrl + 'health')).json(); assert.equal(health.players, 1); assert.equal(health.capacity, 20); assert.equal(health.public, true);
      assert.equal(await publicPlayer.evaluate(() => Sirens.App.getScreen()), 'playing');
      await publicPlayer.waitForFunction(() => document.querySelector('[data-ui="time"]').textContent.includes('CO-OP 1/20'));
    });
    await check('refresh shows the actual connected public-player count and private hosts stay unlisted', async () => {
      await browse(invitedPlayer, publicHost); assert.match(await invitedPlayer.locator('[data-lobby="servers"] button').textContent(), /1\/20/);
      await browse(invitedPlayer, privateHost); assert.equal(await invitedPlayer.locator('[data-lobby="servers"] button').count(), 0);
      assert.match(await invitedPlayer.locator('[data-lobby="message"]').textContent(), /No public hosts/);
    });
    await check('malformed invite codes show a readable error without changing the selected host or access key', async () => {
      const url = await invitedPlayer.locator('[data-network="url"]').inputValue(), key = await invitedPlayer.locator('[data-network="token"]').inputValue();
      await invitedPlayer.locator('[data-lobby="invite"]').fill('SIRENS1.bm90LWpzb24'); await invitedPlayer.locator('[data-lobby="use"]').click();
      assert.match(await invitedPlayer.locator('[data-lobby="message"]').textContent(), /invite is invalid/i);
      assert.equal(await invitedPlayer.locator('[data-network="url"]').inputValue(), url); assert.equal(await invitedPlayer.locator('[data-network="token"]').inputValue(), key);
    });
    await check('Use invite decodes a real private-host invite and its original encoding round-trips', async () => {
      const roundTrip = await invitedPlayer.evaluate(code => { const invite = Sirens.Lobbies.decode(code); return Sirens.Lobbies.encode(invite) === code; }, privateHost.invite); assert.equal(roundTrip, true);
      await invitedPlayer.locator('[data-lobby="invite"]').fill(privateHost.invite); await invitedPlayer.locator('[data-lobby="use"]').click();
      assert.equal(await invitedPlayer.locator('[data-network="url"]').inputValue(), privateHost.url); assert.equal(await invitedPlayer.locator('[data-network="token"]').inputValue(), ROOM_KEY);
      assert.equal(await invitedPlayer.locator('[data-lobby="invite"]').inputValue(), ''); assert.match(await invitedPlayer.locator('[data-network="status"]').textContent(), /Quiet private world/);
      assert.doesNotMatch(await invitedPlayer.locator('[data-lobby="message"]').textContent(), /invalid/i, 'the rejected invite error must clear after a valid invite is used');
      await invitedPlayer.screenshot({ path: path.join(output, 'lobbies-private-invite.png'), fullPage: true });
    });
    await check('an invited guest joins the actual private host while browser preferences omit its access key', async () => {
      await invitedPlayer.locator('[data-network="name"]').fill('Invited guest'); await invitedPlayer.locator('[data-network="join"]').click(); await joined(invitedPlayer);
      const health = await (await fetch(privateHost.httpUrl + 'health')).json(); assert.equal(health.public, false); assert.equal(health.players, 1); assert.equal(health.capacity, 20);
      const preferences = await invitedPlayer.evaluate(() => JSON.parse(localStorage.getItem('after-the-sirens-server-preferences'))); assert.deepEqual(Object.keys(preferences).sort(), ['name', 'url']); assert(!JSON.stringify(preferences).includes(ROOM_KEY));
    });
    await check('invite links choose the private host, remove the secret-bearing fragment and let a second guest join', async () => {
      const linked = await player(publicHost, '#lobby=' + privateHost.invite);
      await linked.waitForFunction(() => location.hash === '' && document.querySelector('[data-play-mode="online"]').getAttribute('aria-pressed') === 'true');
      assert.equal(await linked.locator('[data-network="url"]').inputValue(), privateHost.url); assert.equal(await linked.locator('[data-network="token"]').inputValue(), ROOM_KEY);
      await linked.locator('[data-network="name"]').fill('Linked guest'); await linked.locator('[data-network="join"]').click(); await joined(linked);
      await invitedPlayer.waitForFunction(() => Sirens.App.getState().party.some(p => p.name === 'Linked guest'));
      assert.equal((await (await fetch(privateHost.httpUrl + 'health')).json()).players, 2);
    });
    await check('public browsing and invite controls fit a 390-pixel screen and recover from an unavailable directory', async () => {
      const narrow = await player(publicHost); await browse(narrow, publicHost);
      assert.equal(await narrow.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      const geometry = await narrow.locator('.as-lobby-browser').evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth })); assert(geometry.scroll <= geometry.width);
      await narrow.screenshot({ path: path.join(output, 'lobbies-mobile-details.png'), fullPage: true });
      await narrow.locator('[data-lobby="directory"]').fill(publicHost.httpUrl + 'missing-directory'); await narrow.locator('[data-lobby="refresh"]').click();
      await narrow.waitForFunction(() => document.querySelector('[data-lobby="message"]').textContent.includes('404')); assert(await narrow.locator('[data-lobby="refresh"]').isEnabled());
      await browse(narrow, publicHost); assert.equal(await narrow.locator('[data-lobby="servers"] button').count(), 1);
    });
    assert.deepEqual(errors, []); assert.deepEqual(hostErrors, []); assert(directoryRequests.some(url => url === publicHost.httpUrl + 'servers'));
    fs.writeFileSync(path.join(output, 'lobbies-browser-report.json'), JSON.stringify({ passed, pageErrors: errors, hostErrors, publicPlayers: 1, privatePlayers: 2, capacity: 20, transport: 'actual local HTTP directories and WebSocket world hosts', note: 'Real browser controls and host invite; no gameplay state injection. Twenty simultaneous players are checked separately by the server suite.' }, null, 2));
    console.log(passed.length + ' lobby browser checks passed.');
  } finally {
    for (const context of contexts) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    for (const host of hosts) await host.close();
    fs.rmSync(temporary, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
