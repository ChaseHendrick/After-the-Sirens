(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  class Multiplayer {
    constructor(callbacks) { this.callbacks = callbacks || {}; this.socket = null; this.phase = 'offline'; this.id = null; this.identity = null; this.url = ''; this.hostId = null; this.owner = false; this.sequence = 0; this.lastSnapshot = -1; this.lastInput = 0; this.state = null; this.players = []; }
    getStatus() { return { phase: this.phase, connected: this.phase === 'online', id: this.id, identity: this.identity, url: this.url, hostId: this.hostId, owner: this.owner }; }
    status() { if (this.callbacks.onStatus) this.callbacks.onStatus(this.getStatus()); }
    error(text) { if (this.callbacks.onError) this.callbacks.onError(String(text).slice(0, 500)); }
    connect(options) {
      this.disconnect();
      let url;
      try { url = new URL(options.url); if (!['ws:', 'wss:'].includes(url.protocol) || url.username || url.password || url.hash || url.search) throw new Error(); }
      catch (_) { const error = new Error('Use a ws:// or wss:// server address without credentials or query parameters.'); this.error(error.message); return Promise.reject(error); }
      if (url.pathname === '/') url.pathname = '/game';
      if (typeof options.token !== 'string' || options.token.length > 0 && options.token.length < 12 || options.token.length > 128) { const error = new Error('Enter the host’s world access key (12 to 128 characters).'); this.error(error.message); return Promise.reject(error); }
      const ownerToken = options.ownerToken || '';
      if (typeof ownerToken !== 'string' || ownerToken.length > 0 && ownerToken.length < 12 || ownerToken.length > 128) { const error = new Error('An owner key must have 12 to 128 characters. Leave it empty to join as a player.'); this.error(error.message); return Promise.reject(error); }
      this.url = url.href; this.identity = typeof options.identity === 'string' && options.identity ? options.identity : null; this.id = null; this.owner = false; this.sequence = 0; this.lastSnapshot = -1; this.lastInput = 0; this.phase = 'connecting'; this.status();
      return new Promise((resolve, reject) => {
        let welcomed = false;
        const socket = this.socket = new WebSocket(this.url);
        const timeout = setTimeout(() => { if (!welcomed) { socket.close(); reject(new Error('The world server did not answer.')); } }, 10000);
        socket.onopen = () => {
          const join = { type: 'join', protocol: 1, token: options.token, name: String(options.name || 'Survivor').slice(0, 24), identity: this.identity };
          if (ownerToken) join.ownerToken = ownerToken;
          socket.send(JSON.stringify(join));
        };
        socket.onmessage = event => {
          try {
            if (typeof event.data !== 'string' || event.data.length > 40000000) throw new Error('Invalid world message.');
            const message = JSON.parse(event.data);
            if (message.type === 'welcome') {
              if (message.protocol !== 1 || typeof message.id !== 'string' || typeof message.identity !== 'string') throw new Error('The server uses an unsupported protocol.');
              welcomed = true; clearTimeout(timeout); this.id = message.id; this.identity = message.identity; this.hostId = message.hostId; this.owner = message.owner === true; this.phase = 'online'; this.status();
              if (this.callbacks.onSocial && Array.isArray(message.chatHistory)) message.chatHistory.slice(-100).forEach(entry => { if (entry && entry.type === 'chat') this.callbacks.onSocial(entry); });
              resolve(this.getStatus());
            } else if (message.type === 'snapshot' && welcomed) {
              if (!Number.isSafeInteger(message.seq) || message.seq <= this.lastSnapshot || typeof message.save !== 'string' || !Array.isArray(message.players) || message.players.length > 20 || !message.player) return;
              const save = JSON.parse(message.save); save.state.player = message.player; save.state.personal = message.personal;
              if (message.player.health <= 0) { save.state.ended = true; save.state.won = false; }
              const state = S.Engine.deserialize(JSON.stringify(save));
              state.conversation = message.conversation || null;
              const players = message.players.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string' && p.player && [p.player.x, p.player.y, p.player.health, p.player.angle].every(Number.isFinite));
              if (S.Effects && this.state && S.Effects.transfer) S.Effects.transfer(this.state, state);
              for (const e of message.effects || []) if (e && typeof e.type === 'string' && S.Effects) S.Effects.emit(state, e.type, e);
              this.state = state; this.players = players; this.hostId = message.hostId; this.lastSnapshot = message.seq;
              if (this.callbacks.onSnapshot) this.callbacks.onSnapshot(state, players, this.id);
            } else if (['chat', 'command-result', 'voice-peers', 'voice-signal'].includes(message.type) && welcomed) { if (this.callbacks.onSocial) this.callbacks.onSocial(message); }
            else if (message.type === 'ack') { this.lastAck = message; if (!message.ok && message.reason) this.error(message.reason); if (this.callbacks.onAction) this.callbacks.onAction(message); }
            else if (message.type === 'error') { this.error(message.message || 'The server rejected this request.'); if (!welcomed) reject(new Error(message.message || 'Unable to join.')); }
          } catch (error) { this.error(error.message || 'Invalid world snapshot.'); }
        };
        socket.onerror = () => { if (!welcomed) reject(new Error('Unable to reach the world server.')); this.error('Unable to reach the world server.'); };
        socket.onclose = () => { clearTimeout(timeout); if (this.socket !== socket) return; this.phase = 'offline'; this.socket = null; this.status(); if (!welcomed) reject(new Error('The server closed the connection.')); };
      });
    }
    sendInput(input) {
      if (!this.socket || this.phase !== 'online' || this.socket.readyState !== WebSocket.OPEN) return false;
      // Keep only the next current input when the socket is congested; old movement need not queue.
      if (this.socket.bufferedAmount > 8192) return false;
      const now = typeof performance === 'object' ? performance.now() : Date.now(); if (now - this.lastInput < 45) return false; this.lastInput = now;
      const i = input || {}, world = this.state && this.state.world, x = world ? world.originX * 32 : 0, y = world ? world.originY * 32 : 0;
      const command = { type: 'input', seq: ++this.sequence, moveX: Number(i.moveX) || 0, moveY: Number(i.moveY) || 0, sprint: !!i.sprint, sneak: !!i.sneak, attack: !!i.attack, shoot: !!i.shoot };
      if (Number.isFinite(i.aimX)) command.aimX = i.aimX + x;
      if (Number.isFinite(i.aimY)) command.aimY = i.aimY + y;
      this.socket.send(JSON.stringify(command)); return true;
    }
    sendAction(action) {
      if (!this.socket || this.phase !== 'online' || this.socket.readyState !== WebSocket.OPEN || typeof action !== 'string' || action.length > 180) return false;
      this.socket.send(JSON.stringify({ type: 'action', seq: ++this.sequence, action })); return true;
    }
    sendSocial(packet) {
      if (!this.socket || this.phase !== 'online' || this.socket.readyState !== WebSocket.OPEN || !packet || !['chat', 'voice-state', 'voice-signal'].includes(packet.type)) return false;
      this.socket.send(JSON.stringify(Object.assign({}, packet, { seq: ++this.sequence }))); return true;
    }
    disconnect() { const socket = this.socket; this.socket = null; this.phase = 'offline'; this.owner = false; this.state = null; this.players = []; if (socket) socket.close(); this.status(); }
  }
  S.Multiplayer = Multiplayer;
})();
