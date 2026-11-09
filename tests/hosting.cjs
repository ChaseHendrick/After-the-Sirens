'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { WebSocket } = require('ws');
const { createServer, environmentOptions } = require('../server/index.cjs');
let checks = 0;
async function check(name, fn) { await fn(); checks++; console.log('PASS ' + name); }
function connect(url, origin) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, origin === undefined ? {} : { origin });
    socket.on('error', () => {});
    socket.once('open', () => resolve({ status: 101, socket }));
    socket.once('unexpected-response', (request, response) => { const status = response.statusCode; response.destroy(); request.destroy(); resolve({ status, socket }); });
    socket.once('error', reject);
  });
}
function message(socket, type) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.removeListener('message', receive); reject(new Error('Missing ' + type)); }, 3000);
    function receive(data) { const parsed = JSON.parse(data); if (parsed.type === type) { clearTimeout(timer); socket.removeListener('message', receive); resolve(parsed); } }
    socket.on('message', receive);
  });
}
(async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sirens-hosting-'));
  const ownerToken = 'private-owner-key-for-test', roomToken = 'private-room-key-for-test';
  let server, restored;
  try {
    await check('portable runtime configuration uses explicit values and safe HF defaults', async () => {
      assert.deepEqual(environmentOptions({}), {});
      const options = environmentOptions({ PORT: '7860', SIRENS_HOST: '0.0.0.0', SIRENS_PUBLIC: 'true', SIRENS_NAME: 'Preview', SIRENS_WORLD_FILE: '/data/world.save.json', SPACE_HOST: 'sharpmeow-sirens.hf.space' });
      assert.equal(options.port, 7860); assert.equal(options.public, true);
      assert.equal(options.publicUrl, 'wss://sharpmeow-sirens.hf.space/game');
      assert(options.allowedOrigins.includes('https://www.hendrickresearch.com'));
      assert(options.allowedOrigins.includes('https://sharpmeow-sirens.hf.space'));
      assert.equal(environmentOptions({ SIRENS_PUBLIC: 'false' }).public, false);
      assert.throws(() => environmentOptions({ SIRENS_PUBLIC: 'yes' }), /true or false/);
      assert.equal(environmentOptions({ SPACE_HOST: 'bad.example/path' }).publicUrl, undefined);
      assert.equal(environmentOptions({ SPACE_HOST: 'sharpmeow-sirens.hf.space', SIRENS_PUBLIC_URL: 'wss://own.example/game', SIRENS_ALLOWED_ORIGINS: 'https://own.example' }).publicUrl, 'wss://own.example/game');
      await assert.rejects(createServer({ allowedOrigins: 'https://site.example/path' }), /exact/);
      await assert.rejects(createServer({ publicUrl: 'wss://user:secret@site.example/game' }), /without credentials/);
    });

    await check('readiness requires a writable save and public endpoints expose no keys', async () => {
      const worldFile = path.join(directory, 'world.save.json');
      server = await createServer({ port: 0, public: true, autoTick: false, ownerToken, token: roomToken, worldFile, publicUrl: 'wss://preview.example/game', allowedOrigins: 'https://www.hendrickresearch.com,https://preview.example' });
      assert(fs.existsSync(worldFile), 'host accepted traffic before its first durable write');
      const ready = await fetch(server.httpUrl + 'ready'); assert.equal(ready.status, 200); assert.equal((await ready.json()).ready, true);
      for (const endpoint of ['health', 'ready', 'servers']) {
        const response = await fetch(server.httpUrl + endpoint), body = await response.text();
        assert.equal(response.headers.get('cache-control'), 'no-store');
        for (const secret of [ownerToken, roomToken, worldFile]) assert(!body.includes(secret));
      }
      assert.equal((await (await fetch(server.httpUrl + 'servers')).json()).servers[0].url, 'wss://preview.example/game');
    });

    await check('WebSockets accept exact permitted browser origins and reject lookalikes', async () => {
      for (const origin of ['https://www.hendrickresearch.com', 'https://preview.example', undefined]) {
        const attempt = await connect(server.url, origin); assert.equal(attempt.status, 101); attempt.socket.terminate();
        await new Promise(resolve => attempt.socket.once('close', resolve));
      }
      for (const origin of ['https://www.hendrickresearch.com.attacker.example', 'https://preview.example/path', 'null']) {
        const attempt = await connect(server.url, origin); assert.equal(attempt.status, 403); attempt.socket.terminate();
      }
    });

    await check('owner-only backup excludes credentials/chat and can restore a survivor', async () => {
      for (const headers of [{}, { Authorization: 'Bearer wrong-owner-token' }, { Authorization: 'Bearer ' + roomToken }]) assert.equal((await fetch(server.httpUrl + 'admin/backup', { headers })).status, 403);
      assert.equal((await fetch(server.httpUrl + 'admin/backup?token=' + ownerToken)).status, 404);
      assert.equal((await fetch(server.httpUrl + 'admin/backup', { method: 'POST', headers: { Authorization: 'Bearer ' + ownerToken } })).status, 405);
      const { socket } = await connect(server.url, 'https://preview.example');
      const greeting = message(socket, 'welcome');
      socket.send(JSON.stringify({ type: 'join', protocol: 1, token: '', name: 'Backup survivor' }));
      const welcome = await greeting;
      const chat = message(socket, 'chat');
      socket.send(JSON.stringify({ type: 'chat', seq: 1, text: 'Private session chat must not enter backups.', scope: 'world' }));
      await chat;
      const response = await fetch(server.httpUrl + 'admin/backup', { headers: { Authorization: 'Bearer ' + ownerToken } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('access-control-allow-origin'), null);
      assert.match(response.headers.get('content-disposition'), /attachment/);
      const text = await response.text(), backup = JSON.parse(text);
      for (const secret of [ownerToken, roomToken, welcome.identity, 'Private session chat must not enter backups.']) assert(!text.includes(secret), 'backup exposed a credential or session chat');
      assert.equal(backup.players[0].id, welcome.id);
      assert(/^[0-9a-f]{64}$/.test(backup.players[0].identityHash));
      assert.equal((await fetch(server.httpUrl + 'admin/backup', { headers: { Authorization: 'Bearer ' + ownerToken } })).status, 429);
      const recoveredFile = path.join(directory, 'restored.save.json'); fs.writeFileSync(recoveredFile, text);
      restored = await createServer({ port: 0, public: true, autoTick: false, ownerToken, worldFile: recoveredFile });
      const resumed = await connect(restored.url), resumedWelcome = message(resumed.socket, 'welcome');
      resumed.socket.send(JSON.stringify({ type: 'join', protocol: 1, token: '', name: '', identity: welcome.identity }));
      assert.equal((await resumedWelcome).id, welcome.id);
      socket.terminate(); resumed.socket.terminate();
    });

    await check('disk failure marks readiness unhealthy while an owner can still export memory', async () => {
      const rename = fs.promises.rename;
      fs.promises.rename = async (from, to) => { if (to === path.join(directory, 'restored.save.json')) throw new Error('Disk full fixture'); return rename(from, to); };
      try {
        await assert.rejects(restored.save(), /Disk full/);
        assert.equal((await fetch(restored.httpUrl + 'ready')).status, 503);
        assert.equal((await fetch(restored.httpUrl + 'admin/backup', { headers: { Authorization: 'Bearer ' + ownerToken } })).status, 200);
      } finally { fs.promises.rename = rename; }
      await restored.save(); assert.equal((await fetch(restored.httpUrl + 'ready')).status, 200);
      const blocked = path.join(directory, 'not-a-directory'); fs.writeFileSync(blocked, 'x');
      await assert.rejects(createServer({ port: 0, worldFile: path.join(blocked, 'world.save.json') }));
    });

    await check('hosted CLI startup hides configured owner and private room keys from logs', async () => {
      const child = spawn(process.execPath, ['server/index.cjs'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, PORT: '0', SIRENS_HOST: '127.0.0.1', SIRENS_WORLD_FILE: path.join(directory, 'cli.save.json'), SIRENS_OWNER_TOKEN: ownerToken, SIRENS_ROOM_TOKEN: roomToken, SIRENS_PUBLIC: 'false', SIRENS_PRINT_SECRETS: 'false' }, stdio: ['ignore', 'pipe', 'pipe'] });
      let output = '';
      try {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('CLI did not start: ' + output)), 5000);
          child.stdout.on('data', chunk => { output += chunk; if (output.includes('Secret logging is disabled')) { clearTimeout(timer); resolve(); } });
          child.stderr.on('data', chunk => { output += chunk; });
          child.once('error', error => { clearTimeout(timer); reject(error); });
        });
        assert(!output.includes(ownerToken)); assert(!output.includes(roomToken)); assert(!output.includes('SIRENS1.'));
        assert.match(output, /Secret logging is disabled/);
      } finally { child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve)); }
    });
    console.log(checks + ' online hosting checks passed.');
  } finally {
    if (restored) await restored.close(); if (server) await server.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
