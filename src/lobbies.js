(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  function address(value) { const u = new URL(value); if (!['ws:', 'wss:'].includes(u.protocol) || u.username || u.password || u.hash || u.search) throw new Error('Use a plain ws:// or wss:// world address.'); if (u.pathname === '/') u.pathname = '/game'; return u.href; }
  function encode(options) {
    const url = address(options.url), token = String(options.token || ''), name = String(options.name || 'Private world').slice(0, 48);
    if (token.length < 12 || token.length > 128) throw new Error('Private invites require a world access key.');
    const bytes = new TextEncoder().encode(JSON.stringify({ version: 1, url, token, name }));
    return 'SIRENS1.' + btoa(Array.from(bytes, b => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(value) {
    let code = String(value || '').trim(); if (code.includes('#lobby=')) code = new URL(code).hash.slice(7);
    if (!/^SIRENS1\.[A-Za-z0-9_-]{1,1500}$/.test(code)) throw new Error('Paste a complete SIRENS1 invite code or invite link.');
    try { const text = atob(code.slice(8).replace(/-/g, '+').replace(/_/g, '/')), data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(text, c => c.charCodeAt(0))));
      if (data.version !== 1 || typeof data.token !== 'string' || data.token.length < 12 || data.token.length > 128 || typeof data.name !== 'string') throw new Error();
      return { url: address(data.url), token: data.token, name: data.name.slice(0, 48) };
    } catch (_) { throw new Error('This private invite is invalid.'); }
  }
  function listing(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.servers) || value.servers.length > 100) throw new Error('This directory uses an unsupported format.');
    return value.servers.filter(r => r && r.public === true && typeof r.name === 'string' && r.name.length <= 60 && ['calm','standard','hard'].includes(r.difficulty) && Number.isInteger(r.players) && r.players >= 0 && r.players <= 20 && r.capacity === 20).map(r => ({ name: r.name, url: address(r.url), players: r.players, capacity: 20, difficulty: r.difficulty }));
  }
  S.Lobbies = Object.freeze({ address, encode, decode, listing });
})();
