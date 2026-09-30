(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  class NetworkUI {
    constructor(root, callbacks) {
      this.callbacks = callbacks; this.online = false;
      const title = root.querySelector('.as-title-card'), anchor = title.querySelector('.as-start-options');
      const modes = document.createElement('div'); modes.className = 'as-play-modes'; modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', 'Play mode');
      modes.innerHTML = '<button data-play-mode="solo" aria-pressed="true">Singleplayer</button><button data-play-mode="online" aria-pressed="false">Multiplayer</button>';
      title.insertBefore(modes, anchor);
      this.solo = [anchor, title.querySelector('.as-menu-actions'), title.querySelector('.as-start-note')];
      const panel = document.createElement('form'); panel.className = 'as-network-panel'; panel.hidden = true;
      panel.innerHTML = '<p>Join a shared world run by you or a friend. The host server saves the world and every survivor’s pack.</p><label>Server address<input data-network="url" type="url" placeholder="wss://your-world.example/game" value="ws://localhost:8787/game" required spellcheck="false" autocomplete="url"></label><div class="as-network-fields"><label>Survivor name<input data-network="name" value="Survivor" maxlength="24" required autocomplete="nickname"></label><label>World access key<input data-network="token" type="password" maxlength="128" autocomplete="off" placeholder="Private key, or empty for public"></label></div><button class="as-primary" type="submit" data-network="join">JOIN THE WORLD <span>→</span></button><p class="as-network-status" data-network="status" role="status" aria-live="polite">Up to 20 survivors share the host’s loaded region. Multiplayer currently stays on the ground floor.</p><a class="as-host-guide" href="https://github.com/ChaseHendrick/After-the-Sirens/blob/main/docs/MULTIPLAYER.md" target="_blank" rel="noopener noreferrer">Host your own world · setup guide ↗</a>';
      title.insertBefore(panel, anchor); this.panel = panel; this.nodes = {};
      panel.querySelectorAll('[data-network]').forEach(n => { this.nodes[n.dataset.network] = n; });
      try { const saved = JSON.parse(localStorage.getItem('after-the-sirens-server-preferences') || 'null'); if (saved && typeof saved.url === 'string') this.nodes.url.value = saved.url; if (saved && typeof saved.name === 'string') this.nodes.name.value = saved.name.slice(0, 24); } catch (_) {}
      modes.addEventListener('click', e => {
        const button = e.target.closest('[data-play-mode]'); if (!button) return;
        const multiplayer = button.dataset.playMode === 'online'; panel.hidden = !multiplayer; this.solo.forEach(n => { n.hidden = multiplayer; });
        modes.querySelectorAll('button').forEach(n => { n.setAttribute('aria-pressed', String(n === button)); });
      });
      panel.addEventListener('submit', e => { e.preventDefault(); const values = { url: this.nodes.url.value.trim(), name: this.nodes.name.value.trim(), token: this.nodes.token.value };
        try { localStorage.setItem('after-the-sirens-server-preferences', JSON.stringify({ url: values.url, name: values.name })); } catch (_) {}
        this.callbacks.join(values);
      });
      const lobby = document.createElement('details'); lobby.className = 'as-lobby-browser';
      lobby.innerHTML = '<summary>Public servers and private invites</summary><label>Directory address<input data-lobby="directory" value="https://www.hendrickresearch.com/games/after-the-sirens/servers.json" type="url" spellcheck="false"></label><button type="button" data-lobby="refresh">Browse public servers</button><div data-lobby="servers" role="list"></div><p data-lobby="message" role="status">Refresh to browse listed hosts. Public worlds require no access key.</p><label>Private invite code or link<input data-lobby="invite" autocomplete="off" spellcheck="false" placeholder="SIRENS1.…"></label><div class="as-network-fields"><button type="button" data-lobby="use">Use invite</button><button type="button" data-lobby="copy">Copy private invite</button></div><p>Invites include the private access key. Share them with your guests. The world runs on the host’s computer; guests need a reachable server address.</p>';
      panel.appendChild(lobby); const ln = {}; lobby.querySelectorAll('[data-lobby]').forEach(n => { ln[n.dataset.lobby] = n; });
      ln.refresh.addEventListener('click', async () => {
        ln.refresh.disabled = true; ln.message.textContent = 'Loading public worlds…'; ln.servers.replaceChildren();
        try { const endpoint = new URL(ln.directory.value); if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) throw new Error('Use an HTTP or HTTPS directory.');
          const response = await fetch(endpoint.href, { signal: AbortSignal.timeout(8000), credentials: 'omit' }); if (!response.ok) throw new Error('Directory unavailable (' + response.status + ').');
          const text = await response.text(); if (text.length > 100000) throw new Error('Directory response is too large.'); const servers = S.Lobbies.listing(JSON.parse(text));
          for (const server of servers) { const row = document.createElement('button'); row.type = 'button'; row.setAttribute('role', 'listitem'); row.textContent = server.name + ' · ' + server.players + '/20 · ' + server.difficulty; row.disabled = server.players >= 20; row.title = server.url;
            row.addEventListener('click', () => { this.nodes.url.value = server.url; this.nodes.token.value = ''; this.status('Public world selected. Enter your name and join.', false); }); ln.servers.appendChild(row); }
          ln.message.textContent = servers.length ? servers.length + ' public world(s). Select one to join.' : 'No public hosts are listed here yet. Use a friend’s address or invite, or add your host to this directory.';
        } catch (error) { ln.message.textContent = error.message; } finally { ln.refresh.disabled = false; }
      });
      const useInvite = value => { const invite = S.Lobbies.decode(value); this.nodes.url.value = invite.url; this.nodes.token.value = invite.token; this.status('Private lobby selected: ' + invite.name + '. Enter your name and join.', false); modes.querySelector('[data-play-mode="online"]').click(); };
      ln.use.addEventListener('click', () => { try { useInvite(ln.invite.value); ln.invite.value = ''; ln.message.textContent = 'Private invite accepted. Enter your survivor name and join.'; } catch (error) { ln.message.textContent = error.message; } });
      ln.copy.addEventListener('click', async () => { try { const code = S.Lobbies.encode({ url: this.nodes.url.value, token: this.nodes.token.value, name: 'After the Sirens private world' }); ln.invite.value = code;
          if (navigator.clipboard && location.protocol !== 'file:') { await navigator.clipboard.writeText(location.href.split('#')[0] + '#lobby=' + code); ln.message.textContent = 'Private invite link copied.'; } else { ln.invite.select(); ln.message.textContent = 'Private invite selected. Copy it and share it with your guests.'; }
        } catch (error) { ln.message.textContent = error.message; } });
      if (location.hash.startsWith('#lobby=')) { try { useInvite(location.href); history.replaceState(null, '', location.href.split('#')[0]); } catch (error) { ln.message.textContent = error.message; } }
      const banner = document.createElement('div'); banner.className = 'as-network-banner'; banner.hidden = true;
      banner.innerHTML = '<span data-party-status></span><button type="button">Leave world</button>'; root.querySelector('.as-pause').insertBefore(banner, root.querySelector('.as-pause-actions')); this.banner = banner;
      banner.querySelector('button').addEventListener('click', () => this.callbacks.leave());
      this.pauseText = root.querySelector('[data-screen="paused"] .as-muted');
      this.packStatus = root.querySelector('.as-paused-note');
      this.conversationStatus = root.querySelector('.as-conversation-note');
      this.time = root.querySelector('[data-ui="time"]');
      this.pauseTitle = root.querySelector('#as-pause-title');
      this.pauseOriginal = this.pauseText.textContent;
      this.journalStatus = root.querySelector('.as-journal-strip > span:last-child');
      this.localButtons = [...root.querySelectorAll('[data-command="save"],[data-command="exportSave"],[data-command="restart"],[data-ui="import"]')];
    }
    status(text, pending) { this.nodes.status.textContent = text; this.nodes.join.disabled = !!pending; }
    update(online, players, state) {
      this.online = online; this.banner.hidden = !online;
      if (online) this.banner.querySelector('[data-party-status]').textContent = 'MULTIPLAYER · ' + players.filter(p => p.connected !== false).length + ' / 20 survivors';
      if (this.time) this.time.textContent = this.time.textContent.split(' | ')[0] + (online ? ' | CO-OP ' + players.filter(p => p.connected !== false).length + '/20' : '');
      if (this.packStatus) this.packStatus.textContent = online ? 'SHARED WORLD KEEPS MOVING' : 'SIMULATION PAUSED';
      if (this.conversationStatus) this.conversationStatus.textContent = online ? 'The shared world keeps moving while you talk.' : 'The simulation pauses while you talk.';
      this.localButtons.forEach(n => { n.disabled = online; });
      this.pauseText.textContent = online ? 'Your controls are idle while this menu is open. The shared world keeps moving. The server saves your pack.' : this.pauseOriginal;
      this.pauseTitle.textContent = online ? 'Survivor menu' : 'Run paused';
      if (this.journalStatus) this.journalStatus.textContent = online ? 'SHARED WORLD KEEPS MOVING' : 'SIMULATION PAUSED';
      if (online) for (const n of document.querySelectorAll('[data-action="stairsUp"],[data-action="stairsDown"]')) { n.disabled = true; n.title = 'Multiplayer currently stays on the ground floor'; }
    }
  }
  S.NetworkUI = NetworkUI;
})();
