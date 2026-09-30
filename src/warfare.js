(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {}, T = 32;
  const groups = Object.freeze([
    Object.freeze({ id: 'commune', name: 'Morrow Commune', description: 'Neighbors rebuilding shelter and gardens.' }),
    Object.freeze({ id: 'wardens', name: 'Road Wardens', description: 'Travelers who guard routes between settlements.' }),
    Object.freeze({ id: 'ashen', name: 'Ashen Company', description: 'Armed crews who demand supplies for safe passage.' })
  ]);
  const groupIds = new Set(groups.map(g => g.id));
  const hash = (text, seed) => { let n = seed >>> 0; for (const c of String(text)) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; };
  function fresh() { return { version: 1, reputation: { commune: 0, wardens: 0, ashen: 0 }, alliances: [], support: { commune: 0, wardens: 0, ashen: 0 }, members: {}, nextHumanId: 100, serial: 0, battle: null, clock: 0 }; }
  function ensure(s) { return s.warfare || (s.warfare = fresh()); }
  function group(s, h) { const w = ensure(s); return w.members[h.id] || (String(h.id).endsWith(':1') ? 'ashen' : hash(h.id, s.seed) % 2 ? 'wardens' : 'commune'); }
  function allied(s, id) { return ensure(s).alliances.includes(id); }
  function write(s, text, danger) { if (S.Progression) S.Progression.write(s, danger ? 'danger' : 'faction', text); }
  function helped(s, h) { const w = ensure(s), id = group(s, h); w.reputation[id] = Math.min(20, w.reputation[id] + 1); }
  function attacked(s, h) {
    const w = ensure(s), id = group(s, h); w.reputation[id] = Math.max(-20, w.reputation[id] - 5);
    if (allied(s, id)) { w.alliances = w.alliances.filter(x => x !== id); write(s, 'Your attack broke the alliance with ' + groups.find(g => g.id === id).name + '.', true); }
  }
  function align(s, h) { const id = group(s, h); if (allied(s, id)) h.faction = 'survivor'; else if (ensure(s).members[h.id] || id === 'ashen') { h.faction = 'raider'; h.following = false; } }
  function goal(s, h) {
    const w = ensure(s), home = s.settlement && s.settlement.home;
    if (!w.members[h.id] || !allied(s, group(s, h)) || !home) return null;
    return { x: home.x - (s.world ? s.world.originX * T : 0), y: home.y - (s.world ? s.world.originY * T : 0) };
  }
  function quote(s, action) {
    const w = ensure(s), b = S.Settlement && S.Settlement.ensure(s), missing = [], cost = {}, [kind, id] = String(action).split(':');
    if (String(action) !== kind + ':' + id) missing.push('Choose a known faction action');
    if (s.player.health <= 0) missing.push('The run has ended');
    if (kind === 'aid' || kind === 'ally' || kind === 'support') {
      if (!groupIds.has(id)) missing.push('Unknown faction');
      if (!b || !b.home) missing.push('Establish a home first');
      if (s.stories && s.stories.floor > 0 || s.player.vehicleId) missing.push('Stand on ground level outside your car');
      if (b && b.home && Math.hypot(b.home.x - (s.player.x + (s.world ? s.world.originX * T : 0)), b.home.y - (s.player.y + (s.world ? s.world.originY * T : 0))) > 120) missing.push('Return within 120 pixels of your home stockpile');
      if (b && b.home && !S.Engine.hasLOS(s, s.player.x, s.player.y, b.home.x - (s.world ? s.world.originX * T : 0), b.home.y - (s.world ? s.world.originY * T : 0))) missing.push('Reach your home stockpile without a wall in the way');
      if (kind === 'aid') cost.food = 2;
      if (kind === 'ally') { cost.food = 3; cost.bandage = 2; cost.scrap = 3; if ((w.reputation[id] || 0) < 3) missing.push('Offer aid or help members to reach 3 reputation'); if (allied(s, id)) missing.push('Already allied'); }
      if (kind === 'support') { cost.food = 2; if (!allied(s, id)) missing.push('Form this alliance first'); if ((w.support[id] || 0) > s.elapsed) missing.push('Support returns in ' + Math.ceil(w.support[id] - s.elapsed) + ' seconds'); if ((s.humans || []).filter(h => h.health > 0).length >= 128) missing.push('Human crowd limit reached'); if (!s.world) missing.push('Reinforcements are available in open world'); if (w.nextHumanId > 9990 || Object.keys(w.members).length > 4088) missing.push('Campaign reinforcements are exhausted'); }
      for (const [item, n] of Object.entries(cost)) if (!b || (b.stock[item] || 0) < n) missing.push('Stockpile needs ' + n + ' ' + S.Catalog.items[item].name.toLowerCase());
    } else if (kind === 'battle') {
      if (!['undead', 'raiders'].includes(id)) missing.push('Unknown battle');
      if (!s.world) missing.push('Battles are available in open world');
      if (s.stories && s.stories.floor > 0 || s.player.vehicleId) missing.push('Stand on the ground outside your car');
      if (w.battle && w.battle.active) missing.push('A battle is already active');
      if (id === 'raiders' && allied(s, 'ashen')) missing.push('Break with Ashen Company before challenging its crews');
      if (id === 'undead' && s.zombies.length >= 360 || id === 'raiders' && (s.humans || []).filter(h => h.health > 0).length >= 128) missing.push('Crowd limit reached');
      if (w.nextHumanId > 9930 || Object.keys(w.members).length > 4048 || w.serial >= 9999) missing.push('Campaign battle budget reached');
    } else missing.push('Unknown faction action');
    return { can: !s.ended && !missing.length, missing, cost, kind, id };
  }
  function pay(stock, cost) { for (const [id, n] of Object.entries(cost)) { stock[id] -= n; if (!stock[id]) delete stock[id]; } }
  function archiveCorpses(s) {
    if (!s.world) return;
    const ox = s.world.originX * T, oy = s.world.originY * T, dormant = s.world.dormantHumans || [];
    for (const h of s.humans) if (h.health <= 0) dormant.push(Object.assign({}, h, { x: h.x + ox, y: h.y + oy,
      _targetX: (h._targetX === undefined ? h.x : h._targetX) + ox, _targetY: (h._targetY === undefined ? h.y : h._targetY) + oy,
      _step: h._step ? { x: h._step.x + ox, y: h._step.y + oy } : null }));
    s.humans = s.humans.filter(h => h.health > 0);
    // Retain at most 96 bodies per sector. Missing original residents remain absent in its journal.
    const counts = {};
    s.world.dormantHumans = dormant.slice().reverse().filter(h => {
      if (h.health > 0) return true;
      const k = Math.floor(h.x / 2048) + ',' + Math.floor(h.y / 2048); counts[k] = (counts[k] || 0) + 1; return counts[k] <= 96;
    }).reverse();
  }
  function spawnHumans(s, count, team, center) {
    const w = ensure(s); archiveCorpses(s); let added = 0;
    for (let i = 0; i < 300 && added < count && s.humans.length < 128 && w.nextHumanId <= 9999 && Object.keys(w.members).length < 4096; i++) {
      const n = hash(w.nextHumanId + ':' + i, s.seed), angle = n / 4294967296 * Math.PI * 2, radius = 420 + (n >>> 10) % 220;
      const x = center.x + Math.cos(angle) * radius, y = center.y + Math.sin(angle) * radius;
      if (x < T || y < T || x >= (s.width - 1) * T || y >= (s.height - 1) * T || [[-10, -10], [10, -10], [-10, 10], [10, 10]].some(d => S.Engine.isSolid(s, (x + d[0]) / T, (y + d[1]) / T)) || s.tiles[Math.floor(y / T) * s.width + Math.floor(x / T)] === 2) continue;
      const gx = x + (s.world ? s.world.originX * T : 0), gy = y + (s.world ? s.world.originY * T : 0), id = 'h:' + Math.floor(gx / 2048) + ',' + Math.floor(gy / 2048) + ':' + w.nextHumanId++;
      const h = { id, x, y, health: 100, angle: angle + Math.PI, faction: allied(s, team) ? 'survivor' : 'raider', name: groups.find(g => g.id === team).name + ' ' + (added + 1), following: false, weapon: added % 3 ? 'bat' : 'pistol', cooldown: 0 };
      s.humans.push(h); w.members[id] = team; added++;
    }
    return added;
  }
  function wave(s) {
    const b = ensure(s).battle; if (!b || !b.active || b.pending <= 0) return;
    const center = { x: b.x - s.world.originX * T, y: b.y - s.world.originY * T };
    if (b.type === 'undead') {
      const before = new Set(s.zombies.map(z => z.id)); let added = 0;
      for (let i = 0; i < 8 && added < 60; i++) added += S.Engine.spawnWanderers(s, Math.min(8, 60 - added));
      for (const z of s.zombies) if (!before.has(z.id)) b.enemies.push(z.id);
      b.spawned += added; b.pending--; b.nextWave = s.elapsed + 18;
      write(s, 'Siege wave ' + (4 - b.pending) + ': ' + added + ' dead entered the area.');
    } else {
      const before = new Set(s.humans.map(h => h.id)), added = spawnHumans(s, 24, 'ashen', center);
      for (const h of s.humans) if (!before.has(h.id)) b.enemies.push(h.id);
      b.spawned += added; b.pending--; b.nextWave = s.elapsed + 18;
      write(s, 'Raider wave ' + (2 - b.pending) + ': ' + added + ' armed opponents entered the area.', true);
    }
  }
  function action(s, actionName) {
    const q = quote(s, actionName); if (!q.can) return false;
    const w = ensure(s), b = S.Settlement && S.Settlement.ensure(s);
    if (q.kind !== 'battle' && q.kind !== 'support') pay(b.stock, q.cost);
    if (q.kind === 'aid') { w.reputation[q.id] = Math.min(20, w.reputation[q.id] + 3); write(s, 'Shared two rations with ' + groups.find(g => g.id === q.id).name + '. Reputation +3.'); }
    if (q.kind === 'ally') { w.alliances.push(q.id); for (const h of s.humans) align(s, h); write(s, 'Formed an alliance with ' + groups.find(g => g.id === q.id).name + '. Its members will leave you in peace and can reinforce your home.'); }
    if (q.kind === 'support') { const home = b.home, count = spawnHumans(s, 8, q.id, { x: home.x - s.world.originX * T, y: home.y - s.world.originY * T }); if (!count) return false; pay(b.stock, q.cost); w.support[q.id] = s.elapsed + 180; write(s, count + ' allies arrived to defend your home. Reinforcements use stored rations.'); }
    if (q.kind === 'battle') {
      w.serial++; w.battle = { active: true, type: q.id, serial: w.serial, x: s.player.x + s.world.originX * T, y: s.player.y + s.world.originY * T, started: s.elapsed, ended: 0, pending: q.id === 'undead' ? 4 : 2, nextWave: s.elapsed, spawned: 0, defeated: 0, enemies: [], outcome: 'active' };
      write(s, q.id === 'undead' ? 'The horde siege began. Four waves approach; your allies and defenses matter.' : 'You challenged Ashen Company. Two armed waves approach.', true); wave(s);
    }
    return true;
  }
  function update(s, dt) {
    const w = ensure(s), b = w.battle; if (!b || !b.active || !s.world) return;
    w.clock += dt; if (w.clock < .5) return; w.clock %= .5;
    const gx = s.player.x + s.world.originX * T, gy = s.player.y + s.world.originY * T;
    if (Math.hypot(gx - b.x, gy - b.y) > 1400) { b.active = false; b.outcome = 'withdrawn'; b.ended = s.elapsed; write(s, 'You withdrew from the battle area. Surviving opponents remain in the world.'); return; }
    if (s.stories && s.stories.floor > 0) return;
    if (b.pending > 0 && s.elapsed >= b.nextWave) wave(s);
    const live = new Set(s.zombies.filter(z => z.health > 0).map(z => z.id).concat(s.humans.filter(h => h.health > 0).map(h => h.id)));
    b.defeated = b.enemies.filter(id => !live.has(id)).length;
    if (b.pending === 0 && b.spawned === b.defeated) { b.active = false; b.outcome = 'held'; b.ended = s.elapsed; write(s, 'Your group held the area. ' + b.defeated + ' battle opponents were defeated.'); }
  }
  function validate(value, s) {
    if (value === undefined) return fresh();
    const fail = () => { throw new Error('Invalid save: factions and battles.'); };
    const obj = v => { if (!v || typeof v !== 'object' || Array.isArray(v)) fail(); return v; };
    const num = (v, lo, hi, integer) => { if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi || integer && !Number.isInteger(v)) fail(); return v; };
    const humanId = /^h:-?\d{1,3},-?\d{1,3}:\d{1,4}$/;
    obj(value); if (value.version !== 1) fail(); const w = fresh();
    for (const key of ['reputation', 'support']) { obj(value[key]); if (Object.keys(value[key]).some(id => !groupIds.has(id))) fail(); for (const g of groups) w[key][g.id] = num(value[key][g.id], key === 'reputation' ? -20 : 0, key === 'reputation' ? 20 : s.elapsed + 180, key === 'reputation'); }
    if (!Array.isArray(value.alliances) || value.alliances.length > 3 || new Set(value.alliances).size !== value.alliances.length || value.alliances.some(id => !groupIds.has(id))) fail(); w.alliances = value.alliances.slice();
    obj(value.members); if (Object.keys(value.members).length > 4096) fail(); for (const [id, g] of Object.entries(value.members)) { if (!humanId.test(id) || !groupIds.has(g)) fail(); w.members[id] = g; }
    w.nextHumanId = num(value.nextHumanId, 100, 10000, true); w.serial = num(value.serial, 0, 9999, true); w.clock = num(value.clock, 0, .5);
    if (value.battle !== null) {
      const b = obj(value.battle); if (typeof b.active !== 'boolean' || !['undead', 'raiders'].includes(b.type) || !['active', 'held', 'withdrawn'].includes(b.outcome) || b.active !== (b.outcome === 'active')) fail();
      if (!Array.isArray(b.enemies) || b.enemies.length > 240 || new Set(b.enemies).size !== b.enemies.length || b.enemies.some(id => typeof id !== 'string' || !/^(?:wave:\d{1,10}:\d{1,7}|h:-?\d{1,3},-?\d{1,3}:\d{1,4})$/.test(id))) fail();
      w.battle = { active: b.active, type: b.type, outcome: b.outcome, serial: num(b.serial, 1, w.serial, true), x: num(b.x, -600000, 600000), y: num(b.y, -600000, 600000), started: num(b.started, 0, s.elapsed), ended: num(b.ended, 0, s.elapsed), pending: num(b.pending, 0, b.type === 'undead' ? 4 : 2, true), nextWave: num(b.nextWave, 0, s.elapsed + 18), spawned: num(b.spawned, 0, 240, true), defeated: num(b.defeated, 0, b.spawned, true), enemies: b.enemies.slice() };
      if (b.spawned !== b.enemies.length || b.type === 'raiders' && b.spawned > 48 || b.active && !s.world) fail();
    }
    return w;
  }
  S.Warfare = Object.freeze({ groups, ensure, group, allied, quote, action, helped, attacked, align, goal, update, validate });
})();
