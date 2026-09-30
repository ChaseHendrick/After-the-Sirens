(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const MAX_HISTORY = 100, VOICE_RANGE = 640;
  class Social {
    constructor(root, callbacks) {
      this.root = root; this.callbacks = callbacks || {}; this.online = false; this.id = null; this.owner = false; this.opened = false; this.history = []; this.seen = new Set(); this.unread = 0;
      this.enabled = false; this.pending = false; this.held = false; this.muted = false; this.deafened = false; this.stream = null; this.context = null; this.pendingContext = null; this.epoch = 0; this.peers = new Map(); this.failed = new Map(); this.voiceMessage = 'Voice is off. Microphone access is requested only when you enable it.'; this.voiceProblem = ''; this.destroyed = false;
      const toolbar = document.createElement('div'); toolbar.className = 'as-social-toolbar'; toolbar.hidden = true;
      toolbar.innerHTML = '<button type="button" data-social="open" aria-controls="as-social-panel" aria-expanded="false">T Commands</button><button type="button" data-social="quick-talk" hidden aria-pressed="false">Hold N to talk</button><span data-social="unread" hidden></span>';
      root.querySelector('.as-status').appendChild(toolbar); this.toolbar = toolbar;
      const panel = document.createElement('section'); panel.id = 'as-social-panel'; panel.className = 'as-social-panel'; panel.hidden = true; panel.setAttribute('aria-label', 'Chat and game commands');
      panel.innerHTML = '<header><div><span class="as-kicker" data-social="role">SINGLEPLAYER CONSOLE</span><h2>Chat &amp; commands</h2></div><button type="button" data-social="close" aria-label="Close chat">Esc Close</button></header><div class="as-social-history" data-social="history" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div><form class="as-social-compose"><label class="as-social-scope">Channel<select data-social="scope" aria-label="Chat channel"><option value="world">World</option><option value="local">Nearby</option></select></label><label class="as-social-message">Message or command<input data-social="text" type="text" maxlength="280" autocomplete="off" spellcheck="false" placeholder="Type /help for commands"></label><button type="submit" data-social="send">Send</button></form><p class="as-social-note" data-social="hint">Type /help to see singleplayer commands. Your controls stop while the console is open.</p><section class="as-social-voice" data-social="voice"><h3>Proximity voice</h3><p>People within 20 tiles can hear you. Hold N or the talk button. Voice connects directly between players on the local network.</p><div class="as-social-voice-actions"><button type="button" data-social="enable">Enable proximity voice</button><button type="button" data-social="talk" disabled aria-pressed="false">Hold N to talk</button><button type="button" data-social="mute" disabled aria-pressed="false">Mute microphone</button><button type="button" data-social="deafen" disabled aria-pressed="false">Deafen</button><button type="button" data-social="disable" hidden>Turn voice off</button></div><p data-social="voice-status" role="status"></p><ul data-social="peers" aria-label="Nearby voice participants"></ul><small>Microphone access needs localhost or HTTPS. Use the host’s localhost address or a secure guest URL. Direct voice across different networks may need a VPN; no relay service is configured.</small></section>';
      root.appendChild(panel); this.panel = panel; this.nodes = {};
      for (const node of root.querySelectorAll('[data-social]')) this.nodes[node.dataset.social] = node;
      this.nodes.open.addEventListener('click', () => this.open()); this.nodes.close.addEventListener('click', () => this.close());
      panel.querySelector('form').addEventListener('submit', event => { event.preventDefault(); this.submit(); });
      panel.addEventListener('keydown', event => {
        if (event.code === 'Tab') {
          const focusable = [...panel.querySelectorAll('button,input,select,[tabindex="0"]')].filter(node => !node.disabled && !node.closest('[hidden]'));
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        event.stopPropagation();
      });
      panel.addEventListener('keyup', event => event.stopPropagation());
      this.nodes.enable.addEventListener('click', () => this.enableVoice()); this.nodes.disable.addEventListener('click', () => this.disableVoice());
      this.nodes.mute.addEventListener('click', () => { this.muted = !this.muted; this.setHeld(false); this.renderVoice(); });
      this.nodes.deafen.addEventListener('click', () => { this.deafened = !this.deafened; for (const peer of this.peers.values()) this.setGain(peer); this.renderVoice(); });
      for (const button of [this.nodes.talk, this.nodes['quick-talk']]) {
        button.addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); this.setHeld(true); try { button.setPointerCapture(event.pointerId); } catch (_) {} });
        button.addEventListener('pointerup', () => this.setHeld(false)); button.addEventListener('pointercancel', () => this.setHeld(false)); button.addEventListener('lostpointercapture', () => this.setHeld(false));
        button.addEventListener('keydown', event => { if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); event.stopPropagation(); this.setHeld(true); } });
        button.addEventListener('keyup', event => { if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); event.stopPropagation(); this.setHeld(false); } });
      }
      this.keydown = event => this.handleKey(event); this.keyup = event => { if (event.code === 'KeyN' && this.held) { this.setHeld(false); event.preventDefault(); event.stopPropagation(); } };
      this.release = () => this.setHeld(false); this.visibility = () => { if (document.hidden) this.release(); }; this.pagehide = () => this.disableVoice();
      window.addEventListener('keydown', this.keydown, true); window.addEventListener('keyup', this.keyup, true); window.addEventListener('blur', this.release); window.addEventListener('pointerup', this.release); document.addEventListener('visibilitychange', this.visibility); window.addEventListener('pagehide', this.pagehide);
      this.renderVoice(); this.append({ name: 'Console', text: 'Type /help for commands. Multiplayer owners can manage their hosted world.', system: true });
    }
    isPlaying() { return !this.destroyed && (!this.callbacks.isPlaying || this.callbacks.isPlaying()); }
    isBlocking() { return this.opened; }
    clearInput() { if (this.callbacks.clearInput) this.callbacks.clearInput(); }
    open() {
      if (!this.isPlaying()) return;
      this.clearInput(); this.release(); this.opened = true; this.panel.hidden = false; this.unread = 0; this.nodes.unread.hidden = true; this.nodes.open.setAttribute('aria-expanded', 'true');
      this.nodes.text.focus(); this.nodes.history.scrollTop = this.nodes.history.scrollHeight;
    }
    close() {
      this.opened = false; this.panel.hidden = true; this.nodes.open.setAttribute('aria-expanded', 'false'); this.clearInput(); this.release();
      if (this.nodes.text === document.activeElement || this.panel.contains(document.activeElement)) { document.activeElement.blur(); const canvas = document.querySelector('canvas'); if (canvas && !canvas.closest('.as-journal')) canvas.focus({ preventScroll: true }); }
    }
    handleKey(event) {
      const target = event.target, editing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (this.opened) {
        if (event.code === 'Escape') { event.preventDefault(); event.stopPropagation(); this.close(); return; }
        // Let forms receive typing and activation, but never let chat keys reach gameplay.
        if (this.panel.contains(target)) return;
        event.preventDefault(); event.stopPropagation(); this.nodes.text.focus(); return;
      }
      if (editing || !this.isPlaying()) return;
      if (event.code === 'KeyT' || event.code === 'Enter' && !(target && /^(BUTTON|SUMMARY|A)$/.test(target.tagName))) { event.preventDefault(); event.stopPropagation(); if (!event.repeat) this.open(); }
      else if (event.code === 'KeyN' && this.online) { event.preventDefault(); event.stopPropagation(); if (!event.repeat) this.setHeld(true); }
    }
    send(packet) { return !!(this.online && this.callbacks.send && this.callbacks.send(packet)); }
    submit() {
      const text = this.nodes.text.value.trim().slice(0, 280); if (!text) return; this.clearInput();
      if (this.online) {
        if (this.send({ type: 'chat', text, scope: this.nodes.scope.value === 'local' ? 'local' : 'world' })) this.nodes.text.value = '';
        else this.append({ name: 'World', text: 'The connection is unavailable. Rejoin before sending.', system: true });
      } else if (text.startsWith('/')) {
        this.nodes.text.value = ''; this.append({ name: 'You', text });
        try {
          const result = this.callbacks.runCommand ? this.callbacks.runCommand(text) : { ok: false, message: 'Commands are unavailable in this build.' };
          Promise.resolve(result).then(reply => { if (reply) this.append({ name: 'Console', text: typeof reply === 'string' ? reply : reply.message || 'Command completed.', system: true, error: reply.ok === false }); }).catch(error => this.append({ name: 'Console', text: error.message || 'Command failed.', system: true, error: true }));
        } catch (error) { this.append({ name: 'Console', text: error.message || 'Command failed.', system: true, error: true }); }
      } else this.append({ name: 'Console', text: 'Singleplayer uses slash commands. Type /help to see them.', system: true });
      this.nodes.text.focus();
    }
    append(message) {
      if (!message || typeof message.text !== 'string' || typeof message.name !== 'string') return;
      const key = typeof message.id === 'string' || Number.isSafeInteger(message.id) ? String(message.id) : null; if (key && this.seen.has(key)) return;
      const row = document.createElement('article'); row.className = 'as-social-line' + (message.system ? ' as-social-system' : '') + (message.error ? ' as-social-error' : '');
      const name = document.createElement('strong'); name.textContent = message.name.slice(0, 24) + (message.owner ? ' [owner]' : '') + (message.scope === 'local' ? ' [nearby]' : '');
      const text = document.createElement('span'); text.textContent = message.text.slice(0, 2000); row.append(name, text); this.nodes.history.appendChild(row);
      this.history.push({ key, row }); if (key) this.seen.add(key);
      if (this.history.length > MAX_HISTORY) { const old = this.history.shift(); old.row.remove(); if (old.key) this.seen.delete(old.key); }
      this.nodes.history.scrollTop = this.nodes.history.scrollHeight;
      if (!this.opened && !message.system) { this.unread = Math.min(MAX_HISTORY, this.unread + 1); this.nodes.unread.textContent = this.unread + ' unread'; this.nodes.unread.hidden = false; }
    }
    receive(message) {
      if (!message || this.destroyed) return;
      if (message.type === 'chat') this.append(message);
      else if (message.type === 'command-result') this.append({ name: 'Console', text: String(message.message || (message.ok ? 'Command completed.' : 'Command refused.')), system: true, error: !message.ok });
      else if (message.type === 'voice-peers') this.reconcile(message.peers);
      else if (message.type === 'voice-signal') this.signal(message.from, message.data);
    }
    update(online, players, state, status) {
      const nextId = status && typeof status.id === 'string' ? status.id : null;
      if ((!online && (this.online || this.enabled || this.pending)) || this.id && nextId && this.id !== nextId) this.disableVoice();
      if (online && status && status.url && (!this.online || this.room !== status.url)) { this.room = status.url; this.history = []; this.seen.clear(); this.nodes.history.replaceChildren(); this.unread = 0; this.nodes.unread.hidden = true; }
      this.online = !!online; this.id = nextId; this.owner = !!(online && status && status.owner);
      const visible = !!state && this.isPlaying(); this.toolbar.hidden = !visible;
      if (this.opened && !visible) this.close();
      this.nodes.open.textContent = online ? 'T Chat / Commands' : 'T Commands'; this.nodes.scope.disabled = !online; this.nodes.voice.hidden = !online;
      this.nodes.role.textContent = online ? this.owner ? 'MULTIPLAYER · WORLD OWNER' : 'MULTIPLAYER · SURVIVOR' : 'SINGLEPLAYER CONSOLE';
      this.nodes.text.placeholder = online ? 'Message your world, or type /help' : 'Type /help for commands';
      this.nodes.hint.textContent = online ? 'World chat reaches everyone. Nearby chat and voice reach people within 20 tiles. /help lists your commands. Your controls stop while chat is open.' : 'Type /help to see singleplayer commands. Your controls stop while the console is open.';
      if (!visible) this.release(); this.renderVoice();
    }
    async enableVoice() {
      if (!this.online || this.enabled || this.pending || this.destroyed) return;
      if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof RTCPeerConnection !== 'function') { this.voiceMessage = 'Microphone access needs localhost or HTTPS and a browser with WebRTC. Open a secure guest URL or the host’s localhost page.'; this.renderVoice(); return; }
      this.pending = true; const epoch = ++this.epoch; this.voiceMessage = 'Waiting for your microphone permission…'; this.renderVoice();
      let context;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext; if (Audio) { context = new Audio(); this.pendingContext = context; context.resume().catch(() => {}); }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }, video: false });
        if (this.destroyed || epoch !== this.epoch || !this.online) { stream.getTracks().forEach(track => track.stop()); if (context) context.close().catch(() => {}); return; }
        this.pendingContext = null; this.stream = stream; this.context = context || null; this.enabled = true; this.pending = false; this.muted = false; this.deafened = false; this.held = false; this.voiceProblem = '';
        for (const track of stream.getAudioTracks()) { track.enabled = false; track.addEventListener('ended', () => { if (this.stream === stream) this.disableVoice('Microphone disconnected. Enable voice to try again.'); }); }
        if (!this.send({ type: 'voice-state', enabled: true, talking: false })) { this.disableVoice('Voice could not connect. Rejoin the world and enable it again.'); return; }
        this.voiceMessage = 'Voice ready. Hold N or the talk button to transmit. You are silent until you hold it.'; this.renderVoice();
      } catch (error) {
        if (context) context.close().catch(() => {});
        if (epoch === this.epoch) { this.pendingContext = null; this.pending = false; this.voiceMessage = error && error.name === 'NotAllowedError' ? 'Microphone permission was declined. Enable it in your browser and try again.' : 'Microphone unavailable. Check your input device and try again.'; this.renderVoice(); }
      }
    }
    setHeld(held) {
      const next = !!(held && this.enabled && this.online && !this.muted && !document.hidden && this.isPlaying()); if (next === this.held) return;
      this.held = next; if (this.stream) for (const track of this.stream.getAudioTracks()) track.enabled = next;
      this.send({ type: 'voice-state', enabled: this.enabled, talking: next }); this.renderVoice();
    }
    disableVoice(message) {
      ++this.epoch; this.pending = false; this.held = false; const active = this.enabled; this.enabled = false;
      if (this.stream) { const stream = this.stream; this.stream = null; stream.getTracks().forEach(track => track.stop()); }
      for (const peer of [...this.peers.values()]) this.removePeer(peer); this.failed.clear();
      if (this.pendingContext) { this.pendingContext.close().catch(() => {}); this.pendingContext = null; }
      if (this.context) { this.context.close().catch(() => {}); this.context = null; }
      if (active) this.send({ type: 'voice-state', enabled: false, talking: false });
      this.voiceProblem = ''; this.voiceMessage = message || 'Voice is off. Microphone access is requested only when you enable it.'; this.renderVoice();
    }
    disconnect() { this.disableVoice(); this.online = false; this.id = null; this.owner = false; this.close(); }
    reconcile(roster) {
      if (!this.enabled || !this.online || !Array.isArray(roster)) return;
      const eligible = new Map();
      for (const info of roster.slice(0, 19)) if (info && typeof info.id === 'string' && info.id.length <= 80 && info.id !== this.id && typeof info.name === 'string' && Number.isFinite(info.distance) && info.distance >= 0 && info.distance <= VOICE_RANGE) eligible.set(info.id, { id: info.id, name: info.name.slice(0, 24), distance: info.distance, talking: !!info.talking });
      for (const peer of [...this.peers.values()]) if (!eligible.has(peer.id)) this.removePeer(peer);
      for (const info of eligible.values()) {
        let peer = this.peers.get(info.id);
        if (!peer && (this.failed.get(info.id) || 0) <= Date.now()) peer = this.createPeer(info);
        if (peer) { peer.name = info.name; peer.distance = info.distance; peer.talking = info.talking; this.setGain(peer); }
      }
      for (const id of this.failed.keys()) if (!eligible.has(id)) this.failed.delete(id);
      this.renderVoice();
    }
    createPeer(info) {
      if (!this.stream || !this.enabled) return null;
      const connection = new RTCPeerConnection({ iceServers: [] });
      const peer = { ...info, connection, candidates: [], chain: Promise.resolve(), remote: null, source: null, gain: null, analyser: null, audio: null, makingOffer: false, ignoredOffer: false };
      this.peers.set(info.id, peer);
      connection.onicecandidate = event => {
        if (!event.candidate || this.peers.get(peer.id) !== peer || !this.enabled) return;
        const candidate = event.candidate.toJSON(); this.send({ type: 'voice-signal', to: peer.id, data: { type: 'candidate', candidate: candidate.candidate, sdpMid: candidate.sdpMid === undefined ? null : candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex === undefined ? null : candidate.sdpMLineIndex } });
      };
      connection.ontrack = event => {
        if (this.peers.get(peer.id) !== peer || !this.enabled) { event.track.stop(); return; }
        if (peer.remote) return;
        peer.remote = event.streams[0] || new MediaStream([event.track]);
        // Attach a native media sink as well as Web Audio so remote RTP is decoded.
        peer.audio = document.createElement('audio'); peer.audio.autoplay = true; peer.audio.srcObject = peer.remote; peer.audio.hidden = true; peer.audio.muted = !!this.context; this.panel.appendChild(peer.audio);
        if (this.context) { peer.source = this.context.createMediaStreamSource(peer.remote); peer.gain = this.context.createGain(); peer.analyser = this.context.createAnalyser(); peer.analyser.fftSize = 256; peer.source.connect(peer.analyser); peer.analyser.connect(peer.gain); peer.gain.connect(this.context.destination); }
        peer.audio.play().catch(() => { if (this.peers.get(peer.id) !== peer || !this.enabled) return; this.voiceProblem = 'Your browser blocked audio playback; re-enable voice using the button.'; this.renderVoice(); });
        this.setGain(peer); this.renderVoice();
      };
      connection.onconnectionstatechange = () => {
        if (this.peers.get(peer.id) !== peer) return;
        if (connection.connectionState === 'failed') { this.failed.set(peer.id, Date.now() + 5000); this.removePeer(peer); this.voiceProblem = 'A direct voice connection failed. On different networks, use a shared VPN.'; }
        else if (connection.connectionState === 'connected') this.voiceProblem = '';
        this.renderVoice();
      };
      for (const track of this.stream.getAudioTracks()) connection.addTrack(track, this.stream);
      // One deterministic initiator per pair avoids simultaneous offers.
      if (this.id < peer.id) peer.chain = peer.chain.then(async () => {
        if (this.peers.get(peer.id) !== peer || !this.enabled) return;
        peer.makingOffer = true;
        try { await connection.setLocalDescription(await connection.createOffer()); if (this.peers.get(peer.id) === peer && this.enabled) this.send({ type: 'voice-signal', to: peer.id, data: { type: connection.localDescription.type, sdp: connection.localDescription.sdp } }); }
        finally { peer.makingOffer = false; }
      }).catch(() => { if (this.peers.get(peer.id) === peer) { this.voiceProblem = 'Voice setup failed. Turn voice off and enable it again.'; this.renderVoice(); } });
      return peer;
    }
    signal(from, data) {
      const peer = this.peers.get(from); if (!this.enabled || !this.online || !peer || !data || !['offer', 'answer', 'candidate'].includes(data.type)) return;
      peer.chain = peer.chain.then(async () => {
        if (this.peers.get(peer.id) !== peer || !this.enabled) return;
        const connection = peer.connection;
        if (data.type === 'candidate') {
          if (typeof data.candidate !== 'string' || data.candidate.length > 2000) return;
          const candidate = { candidate: data.candidate, sdpMid: data.sdpMid, sdpMLineIndex: data.sdpMLineIndex };
          if (connection.remoteDescription) { if (!peer.ignoredOffer) await connection.addIceCandidate(candidate); }
          else if (peer.candidates.length < 32) peer.candidates.push(candidate);
          return;
        }
        if (typeof data.sdp !== 'string' || data.sdp.length > 8192) return;
        const collision = data.type === 'offer' && (peer.makingOffer || connection.signalingState !== 'stable'); peer.ignoredOffer = collision && this.id < peer.id; if (peer.ignoredOffer) return;
        if (collision) await connection.setLocalDescription({ type: 'rollback' });
        await connection.setRemoteDescription({ type: data.type, sdp: data.sdp });
        for (const candidate of peer.candidates.splice(0)) await connection.addIceCandidate(candidate);
        if (data.type === 'offer') { await connection.setLocalDescription(await connection.createAnswer()); if (this.peers.get(peer.id) === peer && this.enabled) this.send({ type: 'voice-signal', to: peer.id, data: { type: connection.localDescription.type, sdp: connection.localDescription.sdp } }); }
      }).catch(() => { if (this.peers.get(peer.id) === peer && this.enabled) { this.voiceProblem = 'Voice could not negotiate a direct connection. Re-enable voice to retry.'; this.renderVoice(); } });
    }
    setGain(peer) {
      const gain = this.deafened ? 0 : Math.pow(Math.max(0, 1 - peer.distance / VOICE_RANGE), 1.5);
      if (peer.gain && this.context && this.context.state !== 'closed') peer.gain.gain.setTargetAtTime(gain, this.context.currentTime, .04);
      if (peer.audio) peer.audio.volume = gain;
    }
    removePeer(peer) {
      this.peers.delete(peer.id); peer.connection.ontrack = null; peer.connection.onicecandidate = null; peer.connection.onconnectionstatechange = null; peer.connection.close();
      if (peer.remote) peer.remote.getTracks().forEach(track => track.stop()); if (peer.source) peer.source.disconnect(); if (peer.gain) peer.gain.disconnect(); if (peer.analyser) peer.analyser.disconnect();
      if (peer.audio) { peer.audio.pause(); peer.audio.srcObject = null; peer.audio.remove(); }
    }
    renderVoice() {
      if (!this.nodes) return;
      this.nodes.enable.hidden = this.enabled; this.nodes.enable.disabled = this.pending || !this.online; this.nodes.enable.textContent = this.pending ? 'Waiting for permission…' : 'Enable proximity voice'; this.nodes.disable.hidden = !this.enabled && !this.pending;
      this.nodes['quick-talk'].hidden = !this.enabled || !this.online;
      for (const node of [this.nodes.talk, this.nodes['quick-talk']]) { node.disabled = !this.enabled || this.muted; node.setAttribute('aria-pressed', String(this.held)); node.textContent = this.held ? 'TRANSMITTING · release to stop' : 'Hold N to talk'; }
      this.nodes.mute.disabled = !this.enabled; this.nodes.mute.setAttribute('aria-pressed', String(this.muted)); this.nodes.mute.textContent = this.muted ? 'Unmute microphone' : 'Mute microphone';
      this.nodes.deafen.disabled = !this.enabled; this.nodes.deafen.setAttribute('aria-pressed', String(this.deafened)); this.nodes.deafen.textContent = this.deafened ? 'Undeafen' : 'Deafen';
      const voiceStatus = this.enabled ? (this.held ? 'Transmitting to nearby players. ' : this.muted ? 'Microphone muted. ' : 'Microphone silent. Hold N to talk. ') + (this.deafened ? 'Incoming voice is muted. ' : '') + this.peers.size + ' nearby voice participant(s).' + (this.voiceProblem ? ' ' + this.voiceProblem : '') : this.voiceMessage;
      if (this.nodes['voice-status'].textContent !== voiceStatus) this.nodes['voice-status'].textContent = voiceStatus;
      const roster = [...this.peers.values()].map(peer => ({ id: peer.id, name: peer.name, talking: peer.talking, state: peer.connection.connectionState, distance: Math.round(peer.distance / 32) }));
      const key = JSON.stringify(roster); if (key !== this.rosterKey) { this.rosterKey = key; this.nodes.peers.replaceChildren(); for (const peer of roster) { const node = document.createElement('li'); node.dataset.voicePeer = peer.id; node.dataset.talking = String(peer.talking); node.textContent = peer.name + ' · ' + peer.distance + ' tiles · ' + (peer.talking ? 'speaking' : peer.state === 'connected' ? 'connected' : 'connecting'); this.nodes.peers.appendChild(node); } }
    }
    getStatus() { return { online: this.online, owner: this.owner, open: this.opened, enabled: this.enabled, pending: this.pending, transmitting: this.held, muted: this.muted, deafened: this.deafened, history: this.history.length, audioContext: this.context ? this.context.state : null, pendingAudioContext: this.pendingContext ? this.pendingContext.state : null, microphone: this.stream ? this.stream.getAudioTracks().map(track => ({ enabled: track.enabled, state: track.readyState })) : [], peers: [...this.peers.values()].map(peer => ({ id: peer.id, name: peer.name, distance: peer.distance, talking: peer.talking, connection: peer.connection.connectionState, gain: this.deafened ? 0 : Math.pow(Math.max(0, 1 - peer.distance / VOICE_RANGE), 1.5), remote: !!peer.remote })) }; }
    async getVoiceStats() {
      const peers = [];
      for (const peer of this.peers.values()) {
        const stats = await peer.connection.getStats().catch(() => new Map()), audio = [];
        stats.forEach(item => { if ((item.kind === 'audio' || item.mediaType === 'audio') && ['inbound-rtp', 'outbound-rtp', 'media-source'].includes(item.type)) audio.push({ type: item.type, packets: item.packetsSent || item.packetsReceived || 0, bytes: item.bytesSent || item.bytesReceived || 0, totalAudioEnergy: item.totalAudioEnergy || 0, audioLevel: item.audioLevel || 0 }); });
        let receivedRms = 0; if (peer.analyser) { const waveform = new Float32Array(peer.analyser.fftSize); peer.analyser.getFloatTimeDomainData(waveform); receivedRms = Math.sqrt(waveform.reduce((sum, value) => sum + value * value, 0) / waveform.length); }
        peers.push({ id: peer.id, connection: peer.connection.connectionState, receivedRms, audio });
      }
      return peers;
    }
    destroy() {
      this.destroyed = true; this.disconnect(); window.removeEventListener('keydown', this.keydown, true); window.removeEventListener('keyup', this.keyup, true); window.removeEventListener('blur', this.release); window.removeEventListener('pointerup', this.release); document.removeEventListener('visibilitychange', this.visibility); window.removeEventListener('pagehide', this.pagehide); this.panel.remove(); this.toolbar.remove();
    }
  }
  S.Social = Social;
})();
