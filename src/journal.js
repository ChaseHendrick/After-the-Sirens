(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const guide = Object.freeze([
    ['Start here', 'Collect the cabin supplies with E. Equip its backpack in Pack [I]. Stay near roads until you have water and treatment. The relay mission is optional in open world.'],
    ['Movement and combat', 'WASD or arrows move; Shift sprints, C sneaks. Aim with the mouse. Left click or Space uses the equipped weapon, right click fires a gun. F switches bat and pistol. Walls block hits even though you can see the whole area.'],
    ['Insight and projects', 'Search a previously unsearched supplies container to earn one insight. Deliver a survivor request for two more. Projects spend insight and materials, while listed tools and manuals stay in your pack. Prerequisites connect the projects.'],
    ['Skills', 'Combat practice comes from hitting enemies, craftsmanship from scavenging, crafting and building, field care from useful treatment and safe survival, and mechanics from driving and repairs. Each skill has five levels. Combat reduces melee stamina cost; craftsmanship strengthens new barricades; care improves treatment; mechanics improves repairs.'],
    ['Reference books', 'Study each recovered manual once in Pack to gain practice and insight. The book remains usable as a recipe or project reference. Repeated reading gives no extra reward.'],
    ['People and memory', 'Friendly survivors have three bandages to trade each day and a supplies request. Deliver its exact cost while keeping room for the reward. They remember your help through saves and world travel. Trust improves a recruited companion’s attacks. Attacking a survivor destroys trust and turns them hostile.'],
    ['Sleep and fatigue', 'Fatigue rises over time, faster while sprinting. Above 70, stamina recovers more slowly. Sleep indoors or beside a campfire when fatigue is at least 10. Enemies, movement, attacks or driving wake you. Menus pause the entire simulation.'],
    ['Cars', 'V enters or exits. W accelerates, S brakes and reverses, A/D steer while moving. G refuels a nearby stopped car using a fuel item. Stop before exiting. Learn Field vehicle repairs, keep a hammer, and spend 3 scrap to repair condition.'],
    ['Water and weather', 'Learn Rain collection, stand outside during rain, and spend an empty bottle for untreated water. Untreated water can harm you in this simplified game model. Use the filtering or campfire boiling recipes. Rain fronts, migrating dead and traveler caches happen after the opening minutes.'],
    ['Shelter and destruction', 'Build barricades and campfires from the Crafting tab. Aim toward an empty adjacent tile. Axes bash doors and fell trees, heavy tools break walls, and any melee weapon can damage glass. E opens or climbs windows when the landing is clear. Broken glass may cut you.'],
    ['Floors and supplies', 'E collects nearby supplies and operates doors. Page Up / Page Down use nearby stairs, or use their buttons. Each floor has its own scene and saved changes. Actors on other floors pause. A supply scanner tracks the closest unsearched supplies on your current floor.'],
    ['Mining and equipment', 'Surface stone, iron, and copper deposits are seeded. Equip a stone pick, iron pick, or sledgehammer and strike toward a nearby deposit. Accepted swings cost stamina. Broken deposits yield resources; a full pack leaves them in a supplies pile. Process ore at a campfire, then upgrade your pick.'],
    ['Home and gardens', 'The Base section lets you establish home while sheltered, transfer shared supplies, plant carrots on nearby clear grass, and water or harvest a nearby crop. Crops grow over 90 simulation seconds while moist; rain helps. Harvest recovers food and seed for another planting.'],
    ['Companion work and mood', 'Recruit survivors, establish home, and assign follow, guard, mining, or farming in Base. Gatherers need a mining pick in the stockpile; farmers need stored water. Stored food feeds the group. Mood changes work and combat effectiveness. Worker movement simulates in the loaded area.'],
    ['Atlas and markers', 'The Atlas shows all loaded terrain and the nearest recorded sectors. Click a tile to set a marker, or focus the map and use arrow keys then Enter. Markers appear in the world and minimap and survive saves. Supply scanner markers clear when you collect their supplies.'],
    ['Appearance', 'Choose skin, hair, coat color, and a cap or beanie in Appearance. These choices are free and stay in your save. Equipped clothing determines protection, and backpacks determine carrying capacity.'],
    ['Pets and care', 'Approach a stray dog or cat on the ground floor and use E, or Befriend in Pets, for one ration. Keep up to two pets. Feed a nearby pet one ration for 25 care; choose Follow or Stay and mark its location. At 40 care or more, a pet nearby slows fatigue by 15 percent. Cared-for dogs alert you to nearby dead. Pets move in the loaded ground floor, wait when you drive or go upstairs, and receive no combat damage in this build.'],
    ['Groups and battles', 'Forces records three groups, their reputation, alliances, and support. Aid spends two stored rations for three reputation. Alliance needs three reputation and stored food, bandages, and scrap. Allied support sends up to eight people to defend home, with a 180-second cooldown. You can deliberately stage a four-wave horde siege or a two-wave raider battle. Prepare supplies, allies, and defenses before beginning; leaving the area counts as withdrawal.'],
    ['Saves and controls', 'Escape pauses or closes the current menu. I opens Pack and Crafting; J opens this journal. Details expands the HUD. Autosave runs every 5 seconds of play and when you leave the page. Export a portable save in the pause menu to keep a copy. Sound can be muted there too.']
  ]);
  class Journal {
    constructor(root) {
      this.root = root; this.open = false; this.tab = 'overview'; this.query = ''; this.signature = '';
      const overlay = document.createElement('div'); overlay.className = 'as-overlay as-journal-overlay'; overlay.dataset.ui = 'journal-overlay'; overlay.hidden = true;
      overlay.innerHTML = `<section class="as-modal as-journal" role="dialog" aria-modal="true" aria-labelledby="as-journal-title"><header class="as-modal-header"><div><div class="as-kicker">A RECORD OF WHAT CHANGED</div><h2 id="as-journal-title">Survivor journal</h2></div><button class="as-close" data-command="journal" aria-label="Close survivor journal">×</button></header><div class="as-journal-strip"><span data-journal="summary">Survival record</span><span>SIMULATION PAUSED</span></div><nav class="as-journal-tabs" aria-label="Journal sections">${[['overview', 'Survivor'], ['projects', 'Projects'], ['base', 'Base'], ['people', 'People'], ['forces', 'Forces'], ['pets', 'Pets'], ['appearance', 'Appearance'], ['atlas', 'Atlas'], ['daybook', 'Daybook'], ['guide', 'Field guide']].map(([id, title]) => `<button data-journal-tab="${id}" aria-pressed="${id === 'overview'}">${title}</button>`).join('')}</nav><div class="as-journal-search" hidden><input type="search" data-journal="search" aria-label="Search the field guide" placeholder="Search controls, skills, people, water…"></div><div class="as-journal-content" data-journal="content"></div></section>`;
      root.append(overlay); this.overlay = overlay; this.content = overlay.querySelector('[data-journal="content"]'); this.summary = overlay.querySelector('[data-journal="summary"]'); this.search = overlay.querySelector('[data-journal="search"]');
      overlay.addEventListener('click', e => { const button = e.target.closest('[data-journal-tab]'); if (!button) return; this.tab = button.dataset.journalTab; this.signature = ''; this.render(this.state, true); });
      overlay.addEventListener('click', e => {
        const sector = e.target.closest('[data-atlas-sector]');
        if (sector) { const [x, y] = sector.dataset.atlasSector.split(',').map(Number); S.Engine.action(this.state, 'mark:' + ((x * 64 + 32) * 32) + ',' + ((y * 64 + 32) * 32) + ',0'); this.signature = ''; this.render(this.state, true); }
        const canvas = e.target.closest('[data-journal="atlas"]');
        if (canvas) {
          const rect = canvas.getBoundingClientRect(), x = (e.clientX - rect.left) / rect.width * this.state.width, y = (e.clientY - rect.top) / rect.height * this.state.height;
          this.atlasCursor = { x: (Math.floor(x) + .5) * 32, y: (Math.floor(y) + .5) * 32 }; this.markAtlas();
        }
      });
      overlay.addEventListener('keydown', e => {
        if (!e.target.matches('[data-journal="atlas"]')) return;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          if (e.key === 'Enter' || e.key === ' ') this.markAtlas();
          else { const p = this.atlasCursor || this.state.player; this.atlasCursor = { x: Math.max(16, Math.min(this.state.width * 32 - 16, p.x + (e.key === 'ArrowRight' ? 32 : e.key === 'ArrowLeft' ? -32 : 0))), y: Math.max(16, Math.min(this.state.height * 32 - 16, p.y + (e.key === 'ArrowDown' ? 32 : e.key === 'ArrowUp' ? -32 : 0))) }; this.drawAtlas(this.state); }
        }
      });
      this.search.addEventListener('input', () => { this.query = this.search.value.toLowerCase().trim(); this.signature = ''; this.render(this.state, true); });
    }
    show(s) { if (this.state !== s) this.atlasCursor = null; this.open = true; this.overlay.hidden = false; this.signature = ''; this.render(s, true); this.overlay.querySelector('.as-close').focus({ preventScroll: true }); }
    close() { this.open = false; this.overlay.hidden = true; }
    markAtlas() {
      const p = this.atlasCursor || this.state.player, w = this.state.world;
      S.Engine.action(this.state, 'mark:' + (p.x + (w ? w.originX * 32 : 0)) + ',' + (p.y + (w ? w.originY * 32 : 0)) + ',' + (this.state.stories ? this.state.stories.floor : 0));
      this.drawAtlas(this.state);
    }
    drawAtlas(s) {
      const canvas = this.content.querySelector('[data-journal="atlas"]'); if (!canvas) return;
      const c = canvas.getContext('2d'), sx = canvas.width / s.width, sy = canvas.height / s.height;
      const colors = ['#35513d', '#7b806c', '#9c9877', '#bfbea0', '#41666a', '#263e32', '#c9ac75', '#acb391', '#92b8b4', '#b1b99a'];
      c.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) { c.fillStyle = colors[s.tiles[y * s.width + x]] || colors[0]; c.fillRect(x * sx, y * sy, Math.ceil(sx), Math.ceil(sy)); }
      c.strokeStyle = '#f4e9b855'; c.lineWidth = 1;
      if (s.world) for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(canvas.width * i / 3, 0); c.lineTo(canvas.width * i / 3, canvas.height); c.moveTo(0, canvas.height * i / 3); c.lineTo(canvas.width, canvas.height * i / 3); c.stroke(); }
      const dot = (point, color, radius) => { c.fillStyle = '#13281f'; c.strokeStyle = color; c.lineWidth = 2; c.beginPath(); c.arc(point.x / 32 * sx, point.y / 32 * sy, radius, 0, Math.PI * 2); c.fill(); c.stroke(); };
      if (!(s.stories && s.stories.floor)) dot({ x: s.goal.radioX, y: s.goal.radioY }, '#e6c677', 5);
      const marker = S.Progression.waypoint(s); if (marker && marker.x >= 0 && marker.y >= 0 && marker.x < s.width * 32 && marker.y < s.height * 32) dot(marker, '#edba9b', 7);
      dot(s.player, '#f6f2d5', 6);
      const cursor = this.atlasCursor || s.player;
      if (cursor.x < s.width * 32 && cursor.y < s.height * 32) { const x = cursor.x / 32 * sx, y = cursor.y / 32 * sy; c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.strokeRect(x - 8, y - 8, 16, 16); }
      const label = this.content.querySelector('[data-journal="atlas-position"]'), w = s.world;
      if (label) label.textContent = 'Cursor: ' + Math.floor(cursor.x / 32 + (w ? w.originX : 0)) + ', ' + Math.floor(cursor.y / 32 + (w ? w.originY : 0)) + (marker ? ' · Tracking ' + marker.label : ' · No marker');
    }
    render(s, force) {
      if (!this.open || !s || !S.Progression) return; this.state = s;
      const P = S.Progression, p = P.ensure(s), inv = s.player.inventory;
      const base = s.settlement;
      const signature = this.tab + this.query + JSON.stringify((s.humans || []).map(h => [h.id, h.name, h.health > 0, h.following])) + (base ? JSON.stringify([base.stock, base.jobs, base.home, base.stats, base.plots, base.moods]) : '') + JSON.stringify(s.personal || null) + JSON.stringify(s.warfare || null) + JSON.stringify(p) + JSON.stringify(inv) + Math.floor(s.player.health) + s.player.x + ',' + s.player.y + (s.player.vehicleId || '') + s.weather;
      if (!force && signature === this.signature) return; this.signature = signature;
      const active = document.activeElement, action = active && active.dataset && active.dataset.action;
      this.overlay.querySelectorAll('[data-journal-tab]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.journalTab === this.tab)));
      this.search.parentElement.hidden = this.tab !== 'guide';
      this.summary.textContent = 'Day ' + s.day + ' · ' + p.insight + ' insight · ' + p.research.length + '/' + P.projects.length + ' projects';
      let html = '';
      if (this.tab === 'overview') {
        html = `<div class="as-journal-lead"><span class="as-kicker">NEXT STEP</span><p>${escape(P.nextTask(s))}</p></div><div class="as-skill-grid">`;
        for (const [id, name] of Object.entries(P.skills)) {
          const level = P.level(s, id), lower = P.thresholds[level], upper = P.thresholds[Math.min(5, level + 1)];
          const percentage = level === 5 ? 100 : Math.min(100, (p.xp[id] - lower) / (upper - lower) * 100);
          const benefit = { combat: Math.round(level * 4) + '% less melee stamina', craft: '+' + (level * 4) + ' strength for new barricades', care: '+' + level + ' health from useful treatment', mechanics: '+' + (level * 3) + ' condition per vehicle repair' }[id];
          html += `<article class="as-skill-card"><header><h3>${escape(name)}</h3><b>LEVEL ${level}</b></header><div class="as-progress-track" role="progressbar" aria-label="${escape(name)} practice" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(percentage)}"><span style="width:${percentage}%"></span></div><p>${escape(benefit)}</p><small>${level === 5 ? 'Fully practiced' : Math.floor(p.xp[id]) + ' / ' + upper + ' practice for the next level'}</small></article>`;
        }
        html += `</div><div class="as-survival-summary"><div><span>Fatigue</span><strong>${Math.round(p.fatigue)} / 100</strong><small>${p.sleeping ? 'Sleeping; danger will wake you.' : p.fatigue > 70 ? 'Stamina recovery is reduced.' : 'Recovery is steady.'}</small></div><div><span>Your record</span><strong>${p.totals.loot} places searched</strong><small>${p.totals.craft} crafts · ${p.totals.build} structures built</small></div></div><div class="as-journal-abilities">`;
        for (const [id, title] of [['sleep', p.sleeping ? 'Wake up' : 'Sleep in shelter'], ['repair', 'Repair vehicle'], ['rain', 'Collect rainwater'], ['scan', 'Scan for supplies']]) {
          const q = P.abilityQuote(s, id), wake = id === 'sleep' && p.sleeping;
          html += `<article><div><h3>${title}</h3><p>${escape(wake ? 'Resume movement.' : q.can ? id === 'repair' ? '3 scrap; hammer stays in your pack.' : id === 'rain' ? '1 empty bottle for 1 untreated water.' : 'Ready here.' : q.missing.join('. '))}</p></div><button data-action="${wake ? 'wake' : 'ability:' + id}" ${q.can || wake ? '' : 'disabled'}>${wake ? 'Wake' : id === 'sleep' ? 'Sleep' : 'Use'}</button></article>`;
        }
        html += '</div>';
      } else if (this.tab === 'projects') {
        html = '<p class="as-journal-explainer">Insight comes from searching new places, studying manuals, and helping survivors. Materials are spent; tools and reference books are kept.</p><div class="as-project-grid">';
        for (const node of P.projects) {
          const q = P.quoteResearch(s, node.id), learned = P.known(s, node.id);
          html += `<article class="as-project-card ${learned ? 'as-project-learned' : ''}" data-project="${node.id}"><div class="as-kicker">${learned ? 'LEARNED' : node.prerequisites.length ? 'AFTER ' + escape(node.prerequisites.map(id => P.projects.find(n => n.id === id).name).join(' + ')) : 'START HERE'}</div><h3>${escape(node.name)}</h3><p>${escape(node.benefit)}</p><small class="as-project-cost">${node.insight} insight + ${escape(P.names(node.cost))}</small>${node.tools.length ? '<small>Keep: ' + escape(node.tools.map(id => S.Catalog.items[id].name).join(', ')) + '</small>' : ''}<footer><span>${escape(learned ? 'This capability is yours.' : q.can ? 'Ready to learn' : q.missing.join('. '))}</span><button data-action="research:${node.id}" ${q.can ? '' : 'disabled'}>${learned ? 'Learned' : 'Learn'}</button></footer></article>`;
        }
        html += '</div>';
      } else if (this.tab === 'people') {
        const entries = Object.entries(p.contacts).sort((a, b) => b[1].trust - a[1].trust);
        html = '<p class="as-journal-explainer">People remember help. Talk with E to trade or deliver a request. Supplies restock at the start of a new game day.</p><div class="as-people-list">';
        if (!entries.length) html += '<div class="as-empty-state"><h3>You have not met anyone yet.</h3><p>Look for survivors along the town roads and approach with E.</p></div>';
        for (const [id, c] of entries) {
          const h = (s.humans || []).find(h => h.id === id), r = P.requests[c.request], following = h && h.following;
          html += `<article><div><span class="as-kicker">${escape(c.trait)} · ${c.alive ? following ? 'COMPANION' : 'SURVIVOR' : 'LOST'}</span><h3>${escape(c.name)}</h3><p>Trust ${c.trust}/20 · ${c.stock} bandages left today${c.trust >= 3 ? ' · Companion damage +' + Math.min(5, Math.floor(c.trust / 3)) : ''}</p><small>${escape(!c.alive ? 'Their story remains in your record.' : c.completedDay >= s.day ? 'You helped them today.' : 'Request: ' + P.names(r.cost) + '. Offers ' + P.names(r.reward) + ', +2 insight.')}</small><small>Last seen near ${Math.floor(c.x / 32)}, ${Math.floor(c.y / 32)}</small></div><button data-action="track:${id}" ${c.alive ? '' : 'disabled'}>Track</button></article>`;
        }
        html += '</div>';
      } else if (this.tab === 'base') {
        const B = S.Settlement;
        if (!B) html = '<p class="as-journal-explainer">Base systems are unavailable in this build.</p>';
        else {
          const b = B.ensure(s), stockWeight = S.Engine.inventoryWeight(b.stock), point = b.home;
          html = '<p class="as-journal-explainer">Build a base that feeds your group. Mark home from shelter, store supplies, grow carrots, and give recruited companions work. Only the loaded area simulates worker movement.</p><div class="as-base-summary"><div><span class="as-kicker">HOME</span><strong>' + (point ? Math.floor(point.x / 32) + ', ' + Math.floor(point.y / 32) : 'Not established') + '</strong></div><div><span class="as-kicker">STOCKPILE</span><strong>' + stockWeight.toFixed(1) + ' / 150 kg</strong></div><div><span class="as-kicker">GARDEN</span><strong>' + b.plots.length + ' / 24 plots</strong></div></div><div class="as-base-actions">';
          for (const [id, title] of [['home', point ? 'Home established' : 'Establish home'], ['plant', 'Plant a carrot plot'], ['water', 'Water nearby crop'], ['harvest', 'Harvest nearby crop']]) {
            const q = B.quote(s, id);
            html += '<article><div><h3>' + title + '</h3><p>' + escape(id === 'home' && point ? 'Your stockpile and garden remain anchored here.' : q.can ? id === 'plant' ? '1 carrot seed + 1 timber, on clear nearby grass.' : id === 'water' ? '1 untreated or clean water.' : 'Ready here.' : q.missing.join('. ')) + '</p></div><button data-action="base:' + id + '" ' + (q.can ? '' : 'disabled') + '>' + (id === 'home' && point ? 'Established' : 'Use') + '</button></article>';
          }
          html += '</div><h3 class="as-atlas-heading">Shared supplies</h3><p class="as-journal-explainer">Store or take one item at a time while near home. Store a mining pick for gatherers, water for farmers, and food to keep companions fed. Your equipped item stays with you.</p><div class="as-stock-grid">';
          const ids = Array.from(new Set(Object.keys(inv).concat(Object.keys(b.stock)))).sort((a, z) => S.Catalog.items[a].name.localeCompare(S.Catalog.items[z].name));
          for (const id of ids) {
            const store = B.quote(s, 'store:' + id), take = B.quote(s, 'take:' + id);
            html += '<article><div><h3>' + escape(S.Catalog.items[id].name) + '</h3><small>Pack ' + (inv[id] || 0) + ' · Stock ' + (b.stock[id] || 0) + '</small></div><div><button data-action="base:store:' + id + '" title="' + escape(store.can ? 'Store one' : store.missing.join('. ')) + '" ' + (store.can ? '' : 'disabled') + '>Store</button><button data-action="base:take:' + id + '" title="' + escape(take.can ? 'Take one' : take.missing.join('. ')) + '" ' + (take.can ? '' : 'disabled') + '>Take</button></div></article>';
          }
          if (!ids.length) html += '<p class="as-journal-explainer">Scavenge supplies to begin your stockpile.</p>';
          html += '</div><h3 class="as-atlas-heading">Companion work</h3><div class="as-base-workers">';
          const workers = (s.humans || []).filter(h => h.following && h.health > 0 && h.faction === 'survivor');
          if (!workers.length) html += '<p class="as-journal-explainer">Recruit a survivor through conversation [E], then assign work here.</p>';
          for (const h of workers) {
            const mood = b.moods[h.id] === undefined ? 60 : b.moods[h.id], current = b.jobs[h.id] && b.jobs[h.id].role || 'follow';
            html += '<article class="as-worker-card"><header><h3>' + escape(h.name) + '</h3><strong>Mood ' + Math.round(mood) + '/100</strong></header><p>Job: ' + escape(current) + ' · ' + (mood < 20 ? 'Too unhappy to work. Add food to the stockpile.' : 'Able to work and defend the group.') + '</p><div>';
            for (const [role, title] of [['follow', 'Follow'], ['guard', 'Guard home'], ['gather', 'Mine resources'], ['farm', 'Tend garden']]) {
              const q = B.quote(s, 'job:' + h.id + ':' + role);
              html += '<button data-action="base:job:' + escape(h.id) + ':' + role + '" aria-pressed="' + (current === role) + '" title="' + escape(q.can ? title : q.missing.join('. ')) + '" ' + (q.can ? '' : 'disabled') + '>' + title + '</button>';
            }
            html += '</div></article>';
          }
          html += '</div><h3 class="as-atlas-heading">Growing plots</h3><div class="as-base-plots">';
          if (!b.plots.length) html += '<p class="as-journal-explainer">Plant outside near home, then water the soil. Rain also helps crops grow.</p>';
          for (const plot of b.plots) html += '<article><h3>Carrot plot</h3><p>' + Math.floor(plot.x / 32) + ', ' + Math.floor(plot.y / 32) + ' · ' + (plot.progress >= 90 ? 'Ready to harvest' : Math.round(plot.progress / 90 * 100) + '% grown') + '</p><small>' + (plot.moisture > 0 ? 'Soil has water' : 'Needs water') + '</small></article>';
          html += '</div>';
        }
      } else if (this.tab === 'appearance') {
        const A = S.Personal;
        if (!A) html = '<p class="as-journal-explainer">Appearance options are unavailable in this build.</p>';
        else {
          const saved = A.ensure(s).look, colors = A.look(s);
          const hat = colors.hat === 'cap' ? '<path d="M21 23v-8a17 10 0 0 1 36 0v8h-36Zm31-6h13v7H52Z" fill="' + colors.hatColor + '"/>' : colors.hat === 'beanie' ? '<path d="M21 25V15a18 13 0 0 1 36 0v10H21Z" fill="' + colors.hatColor + '"/><path d="M21 21h36v6H21Z" fill="#e7d8a9" opacity=".45"/>' : '';
          html = '<div class="as-appearance-preview"><svg viewBox="0 0 80 90" aria-hidden="true"><path d="M26 76v12h10V76m8 0v12h10V76" fill="#283c32"/><path d="M22 48h36v34H22Z" fill="' + colors.coat + '"/><path d="M16 51h7v26h-7m42-26h7v26h-7" fill="' + colors.skin + '"/><rect x="23" y="13" width="34" height="35" rx="7" fill="' + colors.skin + '"/><path d="M23 29V17a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v12l-7-9H30Z" fill="' + colors.hair + '"/><path d="M32 31h3v3h-3m13-3h3v3h-3M36 41h8" stroke="#403c2d" stroke-width="2"/>' + hat + '</svg><div><h3>Make this survivor yours.</h3><p>Choose a palette and headwear. Every choice is free and saved with your run.</p><small>Protection comes from equipped clothing; carrying capacity comes from your backpack.</small></div></div><div class="as-style-options">';
          for (const [part, presets] of Object.entries(A.options)) {
            html += '<fieldset data-look-part="' + part + '"><legend>' + part.charAt(0).toUpperCase() + part.slice(1) + '</legend><div>';
            for (const preset of presets) {
              const q = A.quote(s, 'style:' + part + ':' + preset.id), selected = saved[part] === preset.id;
              html += '<button data-style="' + part + ':' + preset.id + '" data-action="personal:style:' + part + ':' + preset.id + '" aria-pressed="' + selected + '" title="' + escape(selected ? 'Selected' : q.missing.join('. ') || 'Choose ' + preset.name) + '" ' + (q.can ? '' : 'disabled') + '><span class="as-style-swatch" style="background:' + preset.color + '" aria-hidden="true"></span>' + escape(preset.name) + '</button>';
            }
            html += '</div></fieldset>';
          }
          html += '</div>';
        }
      } else if (this.tab === 'pets') {
        const A = S.Personal;
        if (!A) html = '<p class="as-journal-explainer">Pet companions are unavailable in this build.</p>';
        else {
          const owned = A.ensure(s).pets, tame = A.quote(s, 'tame');
          html = '<p class="as-journal-explainer">Dogs and cats make a place feel lived in. Keep up to two. A pet with at least 40 care beside you slows fatigue by 15%; a cared-for dog warns of nearby dead. Pets wait when you drive or go upstairs.</p><article class="as-pet-card"><header><h3>' + (tame.pet ? 'Meet ' + escape(tame.pet.name) + ' the ' + tame.pet.kind : 'Find a stray') + '</h3><strong>' + owned.length + ' / 2 pets</strong></header><p>' + escape(tame.can ? 'Offer one ration to befriend this stray.' : tame.missing.join('. ')) + '</p><div class="as-pet-actions"><button data-action="personal:tame" ' + (tame.can ? '' : 'disabled') + '>Befriend · 1 ration</button></div></article>';
          if (!owned.length) html += '<div class="as-empty-state"><h3>A companion is waiting outside.</h3><p>Approach a stray by the road. The first dog lives outside the safe cabin.</p></div>';
          for (const pet of owned) {
            html += '<article class="as-pet-card" data-pet="' + escape(pet.id) + '"><header><h3>' + escape(pet.name) + ' · ' + pet.kind + '</h3><strong>Care ' + Math.round(pet.care) + '/100</strong></header><p>' + (pet.mode === 'follow' ? 'Follows through the loaded ground floor.' : 'Stays at this spot until you return.') + '</p><small>Last seen near ' + Math.floor(pet.x / 32) + ', ' + Math.floor(pet.y / 32) + '. ' + (pet.care >= 40 ? 'Comfort is available when you are nearby.' : 'Feed your pet to restore comfort.') + '</small><div class="as-pet-actions">';
            for (const [actionName, title] of [['feed:' + pet.id, 'Feed · 1 ration'], ['mode:' + pet.id + ':follow', 'Follow'], ['mode:' + pet.id + ':stay', 'Stay']]) {
              const q = A.quote(s, actionName), selected = actionName.endsWith(':' + pet.mode) && actionName.startsWith('mode:');
              html += '<button data-action="personal:' + escape(actionName) + '" title="' + escape(q.can ? actionName.startsWith('feed:') ? 'Spend one ration to restore up to 25 care' : title : q.missing.join('. ')) + '" aria-pressed="' + selected + '" ' + (q.can ? '' : 'disabled') + '>' + title + '</button>';
            }
            html += '<button data-action="mark:' + pet.x + ',' + pet.y + ',0">Mark location</button></div></article>';
          }
        }
      } else if (this.tab === 'forces') {
        const W = S.Warfare;
        if (!W) html = '<p class="as-journal-explainer">Groups and battles are unavailable in this build.</p>';
        else {
          const w = W.ensure(s), companions = (s.humans || []).filter(h => h.following && h.health > 0).length;
          html = '<p class="as-journal-explainer">Build relationships from your home stockpile. Aid earns reputation, alliances bring peace, and allied support helps defend home. You have ' + companions + ' / 12 recruited companions.</p><div class="as-faction-grid">';
          for (const group of W.groups) {
            const allied = W.allied(s, group.id);
            html += '<article class="as-faction-card" data-group="' + group.id + '"><header><h3>' + escape(group.name) + '</h3><span class="as-kicker">' + (allied ? 'ALLIED' : 'INDEPENDENT') + '</span></header><p>' + escape(group.description) + '</p><strong>Reputation ' + w.reputation[group.id] + ' / 20</strong><div class="as-faction-actions">';
            for (const [kind, title] of [['aid', 'Offer aid'], ['ally', 'Form alliance'], ['support', 'Call allies']]) {
              const q = W.quote(s, kind + ':' + group.id);
              html += '<div><button data-action="faction:' + kind + ':' + group.id + '" title="' + escape(q.missing.join('. ') || title) + '" ' + (q.can ? '' : 'disabled') + '>' + title + '</button><small>' + escape(P.names(q.cost)) + '</small><p>' + escape(q.can ? kind === 'aid' ? '+3 reputation from stored supplies.' : kind === 'ally' ? 'Their members become friendly.' : 'Up to 8 defenders; 180-second cooldown.' : q.missing.join('. ')) + '</p></div>';
            }
            html += '</div></article>';
          }
          html += '</div><h3 class="as-atlas-heading">Prepare a battle</h3><p class="as-journal-explainer">These challenges start immediately when selected. Build defenses and arrange supplies and allies first. Leave the battle area to withdraw.</p><div class="as-base-actions as-battle-actions">';
          for (const [id, title, description] of [['undead', 'Stage a horde siege', 'Four waves of up to 60 dead, 18 seconds apart.'], ['raiders', 'Challenge armed raiders', 'Two waves of up to 24 armed opponents, 18 seconds apart.']]) {
            const q = W.quote(s, 'battle:' + id);
            html += '<article><div><h3>' + title + '</h3><p>' + description + '</p><small>' + escape(q.missing.join('. ') || 'Ready to begin here.') + '</small></div><button data-action="faction:battle:' + id + '" ' + (q.can ? '' : 'disabled') + '>Begin</button></article>';
          }
          html += '</div>';
          if (w.battle) {
            const battle = w.battle;
            html += '<article class="as-pet-card as-battle-status" data-battle="' + battle.type + '"><header><h3>' + (battle.type === 'undead' ? 'Horde siege' : 'Raider battle') + '</h3><strong>' + (battle.active ? 'Active' : battle.outcome === 'held' ? 'Area held' : 'Withdrawn') + '</strong></header><p>' + battle.defeated + ' / ' + battle.spawned + ' opponents defeated · ' + battle.pending + ' waves remaining</p><small>' + (battle.active ? 'Close the journal to resume the battle.' : 'The result remains in your save and daybook.') + '</small></article>';
          }
        }
      } else if (this.tab === 'atlas') {
        const w = s.world, point = { x: Math.floor(s.player.x / 32 + (w ? w.originX : 0)), y: Math.floor(s.player.y / 32 + (w ? w.originY : 0)) };
        html = '<p class="as-journal-explainer">Loaded terrain stays visible. Click the map to place a saved navigation marker, or focus it, move the cursor with arrow keys, and press Enter. Markers guide you; they do not move your survivor.</p><div class="as-atlas-legend"><span>You: ' + point.x + ', ' + point.y + '</span><span>Seed ' + s.seed + '</span><span>' + (s.stories && s.stories.floor ? 'Floor ' + (s.stories.floor + 1) : 'Ground level') + '</span></div><canvas class="as-atlas-canvas" width="576" height="576" data-journal="atlas" tabindex="0" role="img" aria-label="Loaded terrain map. Arrow keys choose a tile, Enter sets a marker."></canvas><div class="as-atlas-legend"><span data-journal="atlas-position"></span><button data-action="clearWaypoint">Clear marker</button></div>';
        if (w) {
          const keys = Object.keys(w.visited).sort((a, b) => { const aa = a.split(',').map(Number), bb = b.split(',').map(Number); return Math.hypot(aa[0] - w.centerCX, aa[1] - w.centerCY) - Math.hypot(bb[0] - w.centerCX, bb[1] - w.centerCY); }).slice(0, 24);
          html += '<h3 class="as-atlas-heading">Visited sectors</h3><p class="as-journal-explainer">Nearest 24 recorded sectors. Select one to mark its center. Roads connect adjacent sectors.</p><div class="as-atlas-sectors">';
          for (const key of keys) { const [x, y] = key.split(',').map(Number); html += '<button data-atlas-sector="' + escape(key) + '">' + escape(S.World.biome(s.seed, x, y)) + '<small>' + x + ', ' + y + (x === w.centerCX && y === w.centerCY ? ' · CURRENT' : '') + '</small></button>'; }
          html += '</div>';
        }
      } else if (this.tab === 'daybook') {
        html = '<p class="as-journal-explainer">What you did changed this run. The latest 120 events stay in your save.</p><div class="as-daybook">';
        if (!p.journal.length) html += '<div class="as-empty-state"><h3>The record is yours to write.</h3><p>Scavenge, study, build, meet people, and survive.</p></div>';
        for (const j of p.journal.slice().reverse()) html += `<article data-kind="${escape(j.kind)}"><time>DAY ${j.day} · ${String(Math.floor(j.time)).padStart(2, '0')}:${String(Math.floor((j.time % 1) * 60)).padStart(2, '0')}</time><p>${escape(j.text)}</p></article>`;
        html += '</div>';
      } else {
        const entries = guide.filter(([title, text]) => !this.query || (title + ' ' + text).toLowerCase().includes(this.query));
        html = `<p class="as-journal-explainer">${entries.length} / ${guide.length} field notes</p><div class="as-guide-grid">`;
        if (!entries.length) html += '<div class="as-empty-state"><h3>No field notes match.</h3><p>Try water, cars, skills, or controls.</p></div>';
        for (const [title, text] of entries) html += `<article><h3>${escape(title)}</h3><p>${escape(text)}</p></article>`;
        html += '</div>';
      }
      this.content.innerHTML = html;
      if (this.tab === 'atlas') this.drawAtlas(s);
      if (active && active.dataset && active.dataset.journal === 'atlas') this.content.querySelector('[data-journal="atlas"]').focus({ preventScroll: true });
      if (action) {
        const replacement = Array.from(this.content.querySelectorAll('[data-action]')).find(b => b.dataset.action === action && !b.disabled);
        (replacement || this.overlay.querySelector('[data-journal-tab][aria-pressed="true"]')).focus({ preventScroll: true });
      }
    }
  }
  S.Journal = Journal;
})();
