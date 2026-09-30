'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createServer } = require('../server/index.cjs');
const ROOT = path.resolve(__dirname, '..'), output = path.join(ROOT, '.test-results');
const ROOM_KEY = 'social-browser-world-fixture-key', OWNER_KEY = 'social-browser-owner-fixture-key';

function writeTone(file) {
  const rate = 48000, samples = rate * 2, data = Buffer.alloc(44 + samples * 2);
  data.write('RIFF', 0); data.writeUInt32LE(data.length - 8, 4); data.write('WAVEfmt ', 8); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22); data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) data.writeInt16LE(Math.round(Math.sin(i * 440 * 2 * Math.PI / rate) * 7000), 44 + i * 2);
  fs.writeFileSync(file, data);
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'sirens-social-browser-')), tone = path.join(temporary, 'synthetic-tone.wav'); writeTone(tone);
  const contexts = [], errors = [], hostErrors = [], passed = []; let host, browser, voiceEvidence;
  async function check(name, fn) {
    try { await fn(); passed.push(name); console.log('PASS ' + name); }
    catch (error) {
      const diagnostics = [];
      for (const context of contexts) for (const page of context.pages()) { const detail = await page.evaluate(() => ({ screen: Sirens.App.getScreen(), network: { ...Sirens.App.getNetworkStatus(), identity: undefined }, social: Sirens.App.getSocialStatus(), health: Sirens.App.getState().player.health, connectionMessage: document.querySelector('[data-network="status"]').textContent, connectionEvents: window.__connectionEvents, history: document.querySelector('[data-social="history"]').textContent.slice(-1500) })).catch(() => 'page unavailable'); diagnostics.push(detail); console.error('Social diagnostics', detail); }
      fs.writeFileSync(path.join(output, 'social-browser-failure.json'), JSON.stringify({ check: name, error: error.message, diagnostics }, null, 2));
      throw error;
    }
  }
  async function status(page) { return page.evaluate(() => Sirens.App.getSocialStatus()); }
  async function inspect(page) { return page.evaluate(() => { const s = Sirens.App.getState(); return { x: s.player.x, y: s.player.y, elapsed: s.elapsed, cooldown: s.player.cooldown, inventory: { ...s.player.inventory }, screen: Sirens.App.getScreen(), id: Sirens.App.getNetworkStatus().id }; }); }
  async function open(page) { if ((await inspect(page)).screen === 'paused') await page.locator('[data-command="resume"]').click(); if (!(await status(page)).open) await page.keyboard.press('KeyT'); await page.locator('[data-social="text"]').waitFor({ state: 'visible' }); }
  async function close(page) { if ((await status(page)).open) await page.keyboard.press('Escape'); }
  async function send(page, text, scope = 'world') { await open(page); await page.locator('[data-social="scope"]').selectOption(scope); await page.locator('[data-social="text"]').fill(text); await page.keyboard.press('Enter'); }
  async function command(page, text, expected) {
    await send(page, text); if (expected) await page.waitForFunction(value => document.querySelector('[data-social="history"]').textContent.includes(value), expected);
  }
  async function makePage(width = 1280, height = 900) {
    const context = await browser.newContext({ viewport: { width, height }, permissions: ['microphone'] }); contexts.push(context); const page = await context.newPage(); page.setDefaultTimeout(15000); page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__microphoneRequests = 0; window.__micTracks = [];
      window.__connectionEvents = []; window.__sentSocialPackets = []; const send = WebSocket.prototype.send;
      WebSocket.prototype.send = function (data) {
        try { const message = JSON.parse(data); window.__sentSocialPackets.push({ type: message.type, seq: message.seq, at: performance.now() }); if (window.__sentSocialPackets.length > 160) window.__sentSocialPackets.shift(); if (message.type === 'join' && !this.__observedSocialFixture) { this.__observedSocialFixture = true;
          this.addEventListener('message', event => { try { const message = JSON.parse(event.data); if (message.type === 'error') { const now = performance.now(), outgoingLastSecond = {}; for (const packet of window.__sentSocialPackets) if (now - packet.at < 1000) outgoingLastSecond[packet.type] = (outgoingLastSecond[packet.type] || 0) + 1; window.__connectionEvents.push({ message: message.message, outgoingLastSecond }); } } catch (_) {} });
          this.addEventListener('close', event => window.__connectionEvents.push({ code: event.code, reason: event.reason }));
        } } catch (_) {}
        return send.call(this, data);
      };
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const capture = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = options => { ++window.__microphoneRequests; return capture(options).then(stream => { window.__micTracks.push(...stream.getTracks()); if (window.__delayMicrophone) return new Promise(resolve => { window.__completeDelayedCapture = () => resolve(stream); }); return stream; }); };
      }
    });
    await page.goto(host.httpUrl); await page.waitForFunction(() => !!window.Sirens?.App?.getSocialStatus); return page;
  }
  async function join(page, name, owner = false) {
    await page.locator('[data-play-mode="online"]').click(); await page.locator('[data-network="url"]').fill(host.url); await page.locator('[data-network="name"]').fill(name); await page.locator('[data-network="token"]').fill(ROOM_KEY);
    if (owner) { await page.locator('.as-owner-access summary').click(); await page.locator('[data-network="ownerToken"]').fill(OWNER_KEY); }
    await page.locator('[data-network="join"]').click(); await page.waitForFunction(() => Sirens.App.getNetworkStatus().connected && Sirens.App.getState().networked); await page.waitForTimeout(200);
  }
  async function target(page, distance) {
    return page.evaluate(distance => {
      const s = Sirens.App.getState(), p = s.player, o = s.world;
      for (let y = 2; y < s.height - 2; y++) for (let x = 2; x < s.width - 2; x++) {
        const d = Math.hypot((x + .5) * 32 - p.x, (y + .5) * 32 - p.y);
        if (d >= distance && d < distance + 50 && !Sirens.Engine.isSolid(s, x, y)) return { x: x + o.originX, y: y + o.originY };
      }
      throw new Error('No clear teleport target at ' + distance + ' pixels');
    }, distance);
  }
  try {
    host = await createServer({ host: '127.0.0.1', port: 0, token: ROOM_KEY, ownerToken: OWNER_KEY, seed: 0, difficulty: 'calm', worldFile: path.join(temporary, 'world.json'), onError: error => hostErrors.push(error.message) });
    browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}), args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--use-file-for-fake-audio-capture=' + tone] });
    const solo = await makePage(), owner = await makePage(), guest = await makePage(390, 844);
    await check('singleplayer has a keyboard-accessible slash-command console and typing does not move or attack', async () => {
      await solo.locator('[data-ui="seed"]').fill('0'); await solo.locator('[data-ui="difficulty"]').selectOption('calm'); await solo.locator('[data-command="start"]').click();
      await solo.keyboard.down('KeyD'); await solo.waitForTimeout(120); await solo.keyboard.press('KeyT'); await solo.keyboard.up('KeyD');
      const before = await inspect(solo); await solo.keyboard.type('wasd e b v 1234 '); await solo.waitForTimeout(350); const after = await inspect(solo);
      assert.equal(after.x, before.x); assert.equal(after.y, before.y); assert.equal(after.elapsed, before.elapsed); assert.deepEqual(after.inventory, before.inventory); assert.equal(after.cooldown, before.cooldown);
      await solo.locator('[data-social="text"]').fill('/help'); await solo.keyboard.press('Enter'); await solo.waitForFunction(() => document.querySelector('[data-social="history"]').textContent.includes('/heal'));
      assert(await solo.locator('[data-social="voice"]').isHidden()); await close(solo); assert.equal((await inspect(solo)).screen, 'playing'); assert.equal((await status(solo)).open, false);
      assert.equal(await solo.evaluate(() => window.__microphoneRequests), 0);
    });
    await solo.close();
    await join(owner, 'Town keeper', true); await join(guest, 'Guest <svg>');
    await check('joining does not request the microphone and the owner credential is separate from the world invite', async () => {
      assert.equal((await status(owner)).owner, true); assert.equal((await status(guest)).owner, false);
      for (const page of [owner, guest]) assert.equal(await page.evaluate(() => window.__microphoneRequests), 0);
      assert(!host.invite.includes(OWNER_KEY)); const preferences = await owner.evaluate(() => localStorage.getItem('after-the-sirens-server-preferences')); assert(!preferences.includes(OWNER_KEY)); assert(!preferences.includes(ROOM_KEY));
      await open(owner); assert.match(await owner.locator('[data-social="role"]').textContent(), /WORLD OWNER/);
    });
    await check('real keyboard chat reaches both independent players and renders markup as literal text', async () => {
      const text = '<img src=x onerror="window.bad=1"> hello survivors'; await send(guest, text);
      await owner.waitForFunction(value => document.querySelector('[data-social="history"]').textContent.includes(value), text);
      await guest.waitForFunction(value => document.querySelector('[data-social="history"]').textContent.includes(value), text);
      assert.equal(await owner.locator('[data-social="history"] img,[data-social="history"] svg').count(), 0); assert.equal(await owner.evaluate(() => window.bad), undefined);
      await close(guest); const before = await inspect(guest); await guest.keyboard.down('KeyD'); await guest.waitForTimeout(120); await guest.keyboard.press('KeyT'); await guest.keyboard.up('KeyD'); await guest.waitForTimeout(150);
      const stopped = await inspect(guest); await guest.keyboard.type('wasd e b v 1234 '); await guest.waitForTimeout(300); const after = await inspect(guest);
      assert(after.elapsed > before.elapsed); assert(Math.hypot(after.x - stopped.x, after.y - stopped.y) < 1); assert.deepEqual(after.inventory, stopped.inventory); assert.equal(after.cooldown, stopped.cooldown);
      await guest.locator('[data-social="text"]').fill(''); await owner.screenshot({ path: path.join(output, 'social-world-chat.png') });
    });
    await check('guest help and owner-only commands report permissions through chat without granting guest authority', async () => {
      await command(guest, '/help', '/players'); await command(guest, '/give me food 1', 'requires the world owner key');
      const before = (await inspect(owner)).inventory.food || 0; await command(owner, '/give me food 1', 'Gave 1');
      await owner.waitForFunction(count => Sirens.App.getState().player.inventory.food === count, before + 1); await command(owner, '/players', 'Guest <svg>');
      await command(owner, '/announce Stay close to the town.', 'Announcement sent'); await guest.waitForFunction(() => document.querySelector('[data-social="history"]').textContent.includes('Stay close to the town.'));
    });
    await check('a 390-pixel chat panel contains its controls, limits text to 280 characters and closes with Escape', async () => {
      await open(guest); assert.equal(await guest.locator('[data-social="text"]').getAttribute('maxlength'), '280');
      const geometry = await guest.locator('.as-social-panel').evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right })); assert(geometry.scroll <= geometry.width + 1); assert(geometry.left >= 0 && geometry.right <= 391);
      await guest.screenshot({ path: path.join(output, 'social-mobile-console.png'), fullPage: true }); await close(guest); assert.equal((await inspect(guest)).screen, 'playing');
    });
    await check('voice is opt-in, captures only synthetic browser test audio and connects actual WebRTC peers', async () => {
      for (const page of [owner, guest]) { await open(page); await page.locator('[data-social="enable"]').click(); await page.waitForFunction(() => Sirens.App.getSocialStatus().enabled); }
      for (const page of [owner, guest]) await page.waitForFunction(() => Sirens.App.getSocialStatus().peers.some(peer => peer.connection === 'connected' && peer.remote), null, { timeout: 20000 });
      for (const page of [owner, guest]) { const value = await status(page); assert.equal(value.microphone.length, 1); assert.equal(value.microphone[0].enabled, false); assert.equal(value.transmitting, false); assert.equal(value.audioContext, 'running'); assert.equal(await page.evaluate(() => window.__microphoneRequests), 1); }
    });
    await check('holding N sends real audio RTP and releasing, muting and losing focus stop transmission', async () => {
      await close(owner); const before = await guest.evaluate(() => Sirens.App.getVoiceStats()); await owner.keyboard.down('KeyN'); await owner.waitForFunction(() => Sirens.App.getSocialStatus().transmitting);
      await guest.waitForFunction(() => Sirens.App.getSocialStatus().peers.some(peer => peer.talking)); await owner.waitForTimeout(1500);
      const during = await guest.evaluate(() => Sirens.App.getVoiceStats()); assert(during.some(peer => peer.audio.some(audio => audio.type === 'inbound-rtp' && audio.packets > 0 && audio.bytes > 0)), 'No actual audio RTP was received');
      if (!during.some(peer => peer.receivedRms > .001)) console.error('Native audio diagnostics', JSON.stringify({ before, during, sender: await owner.evaluate(() => Sirens.App.getVoiceStats()) }));
      assert(during.some(peer => peer.receivedRms > .001), 'Synthetic talk produced no received audio amplitude');
      voiceEvidence = { before, during, syntheticAudio: 'Generated 440 Hz WAV through Chromium fake audio capture. No physical microphone was recorded.' };
      await guest.screenshot({ path: path.join(output, 'social-proximity-voice.png') });
      await owner.keyboard.up('KeyN'); assert.equal((await status(owner)).microphone[0].enabled, false); await guest.waitForFunction(() => Sirens.App.getSocialStatus().peers.every(peer => !peer.talking));
      await open(owner); await owner.locator('[data-social="mute"]').click(); await close(owner); await owner.keyboard.down('KeyN'); assert.equal((await status(owner)).transmitting, false); await owner.keyboard.up('KeyN');
      await open(owner); await owner.locator('[data-social="mute"]').click(); await close(owner); await owner.keyboard.down('KeyN'); assert.equal((await status(owner)).transmitting, true);
      await owner.evaluate(() => dispatchEvent(new Event('blur'))); await owner.keyboard.up('KeyN'); assert.equal((await status(owner)).transmitting, false); assert.equal((await status(owner)).microphone[0].enabled, false);
      if ((await inspect(owner)).screen === 'paused') await owner.locator('[data-command="resume"]').click();
    });
    await check('Nearby chat and distance gain follow real owner teleports, then voice closes outside twenty tiles', async () => {
      const mid = await target(owner, 300); await command(owner, '/tp "Guest <svg>" ' + mid.x + ' ' + mid.y, 'moved to global tile');
      await owner.waitForFunction(() => Sirens.App.getSocialStatus().peers.some(peer => peer.distance >= 280 && peer.gain < .5));
      await send(owner, 'Nearby transmission at ten tiles.', 'local'); await guest.waitForFunction(() => document.querySelector('[data-social="history"]').textContent.includes('Nearby transmission at ten tiles.'));
      await guest.locator('[data-social="deafen"]').click(); assert((await status(guest)).peers.every(peer => peer.gain === 0)); await guest.locator('[data-social="deafen"]').click(); assert((await status(guest)).peers.every(peer => peer.gain > 0));
      const far = await target(owner, 900); await command(owner, '/tp "Guest <svg>" ' + far.x + ' ' + far.y, 'moved to global tile ' + far.x + ', ' + far.y);
      await owner.waitForFunction(() => Sirens.App.getSocialStatus().peers.length === 0); await guest.waitForFunction(() => Sirens.App.getSocialStatus().peers.length === 0);
      await send(owner, 'Only the nearby owner should see this.', 'local'); await owner.waitForTimeout(300); assert(!(await guest.locator('[data-social="history"]').textContent()).includes('Only the nearby owner should see this.'));
      await send(owner, 'World broadcast beyond voice range.', 'world'); await guest.waitForFunction(() => document.querySelector('[data-social="history"]').textContent.includes('World broadcast beyond voice range.'));
      const near = await target(owner, 50); await command(owner, '/tp "Guest <svg>" ' + near.x + ' ' + near.y, 'moved to global tile ' + near.x + ', ' + near.y);
      await owner.waitForFunction(() => Sirens.App.getSocialStatus().peers.some(peer => peer.connection === 'connected'), null, { timeout: 20000 });
    });
    await check('turning voice off and leaving the world stop microphone tracks and close peer transport', async () => {
      await open(guest); await guest.locator('[data-social="disable"]').click(); assert.equal((await status(guest)).enabled, false); assert.equal((await status(guest)).peers.length, 0);
      assert(await guest.evaluate(() => window.__micTracks.every(track => track.readyState === 'ended'))); await owner.waitForFunction(() => Sirens.App.getSocialStatus().peers.length === 0);
      await close(owner); if ((await inspect(owner)).screen !== 'paused') await owner.locator('[data-command="pause"]').click(); await owner.waitForFunction(() => Sirens.App.getScreen() === 'paused'); await owner.locator('.as-network-banner button').click(); await owner.waitForFunction(() => !Sirens.App.getNetworkStatus().connected);
      assert.equal((await status(owner)).enabled, false); assert.equal((await status(owner)).peers.length, 0); assert(await owner.evaluate(() => window.__micTracks.every(track => track.readyState === 'ended')));
    });
    await check('turning voice off during a pending permission result closes its audio context and stops late microphone tracks', async () => {
      await open(guest); await guest.evaluate(() => { window.__delayMicrophone = true; }); await guest.locator('[data-social="enable"]').click();
      await guest.waitForFunction(() => typeof window.__completeDelayedCapture === 'function' && Sirens.App.getSocialStatus().pending);
      assert(['running', 'suspended'].includes((await status(guest)).pendingAudioContext)); await guest.locator('[data-social="disable"]').click();
      assert.equal((await status(guest)).pendingAudioContext, null); assert.equal((await status(guest)).pending, false);
      await guest.evaluate(() => { window.__completeDelayedCapture(); }); await guest.waitForFunction(() => window.__micTracks.every(track => track.readyState === 'ended'));
      assert.equal((await status(guest)).enabled, false); assert.equal((await status(guest)).peers.length, 0); assert.equal(await guest.evaluate(() => window.__microphoneRequests), 2);
    });
    assert.deepEqual(errors, []); assert.deepEqual(hostErrors, []);
    fs.rmSync(path.join(output, 'social-browser-failure.json'), { force: true });
    fs.writeFileSync(path.join(output, 'social-browser-report.json'), JSON.stringify({ passed, pageErrors: errors, hostErrors, voiceEvidence, note: 'Real local WebSocket host, independent browser contexts, native chat controls and WebRTC audio. Proximity changes use legitimate owner /tp commands. Synthetic microphone fixture only; no user audio capture or gameplay state injection.' }, null, 2));
    console.log(passed.length + ' social browser checks passed.');
  } finally {
    for (const context of contexts) await context.close().catch(() => {}); if (browser) await browser.close().catch(() => {}); if (host) await host.close(); fs.rmSync(temporary, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
