(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const T = 32, MAX_XP = 1000000;
  const thresholds = [0, 30, 90, 190, 350, 600];
  const skills = Object.freeze({ combat: 'Combat', craft: 'Craftsmanship', care: 'Field care', mechanics: 'Mechanics' });
  const manuals = Object.freeze({ first_aid_manual: 'care', tailoring_manual: 'craft', electronics_manual: 'craft', cooking_manual: 'care', reloading_manual: 'combat', woodcraft_manual: 'craft' });
  const projects = Object.freeze([
    { id: 'salvage', name: 'Salvage practice', prerequisites: [], insight: 1, cost: { scrap: 2 }, tools: ['screwdriver'], benefit: 'Unlocks reinforced shelter and vehicle projects. Study the tools you recover.' },
    { id: 'care', name: 'Prepared field care', prerequisites: [], insight: 1, cost: { bandage: 1, cloth: 1 }, tools: ['first_aid_manual'], benefit: 'Treatment supplies restore 4 extra health, before the skill bonus.' },
    { id: 'shelter', name: 'Reinforced shelter', prerequisites: ['salvage'], insight: 2, cost: { wood: 4, scrap: 2 }, tools: ['hammer'], benefit: 'New barricades gain 40 strength. Unlocks rain collection.' },
    { id: 'mechanics', name: 'Field vehicle repairs', prerequisites: ['salvage'], insight: 2, cost: { scrap: 4, wire: 1 }, tools: ['hammer'], benefit: 'Repair a nearby stopped car for 3 scrap. Skills improve the repair.' },
    { id: 'water', name: 'Rain collection', prerequisites: ['shelter'], insight: 2, cost: { empty_bottle: 1, filter_mesh: 1 }, tools: [], benefit: 'Collect untreated water outside during rain. Filter or boil it before drinking.' },
    { id: 'radio', name: 'Supply scanner', prerequisites: ['mechanics'], insight: 3, cost: { wire: 2, scrap: 2 }, tools: ['electronics_manual'], benefit: 'Track the nearest unlooted supplies on your screen and map.' }
  ]);
  const requests = Object.freeze([
    { name: 'medical supplies', cost: { bandage: 2 }, reward: { food: 2, scrap: 2 } },
    { name: 'drinking water', cost: { water: 2 }, reward: { ammo: 6, scrap: 2 } },
    { name: 'shelter timber', cost: { wood: 4 }, reward: { bandage: 2, food: 1 } }
  ]);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function hash(text, seed) { let n = seed >>> 0; for (const c of String(text)) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; }
  function globalPoint(s, x, y) { return { x: x + (s.world ? s.world.originX * T : 0), y: y + (s.world ? s.world.originY * T : 0) }; }
  function fresh(s) { return { version: 1, xp: { combat: 0, craft: 0, care: 0, mechanics: 0 }, insight: 0, research: [], studied: [], looted: {}, contacts: {}, journal: [], fatigue: 0, sleeping: false, survivalClock: 0, drivingDistance: 0, totals: { loot: 0, craft: 0, build: 0 }, event: { kind: 'none', until: 0, next: s.elapsed + 180, serial: 0, previousWeather: s.weather }, tracking: null }; }
  function ensure(s) { return s.progression || (s.progression = fresh(s)); }
  function write(s, kind, text) {
    const p = ensure(s), last = p.journal[p.journal.length - 1];
    if (last && last.text === text) return;
    p.journal.push({ day: s.day, time: s.time, elapsed: s.elapsed, kind, text: String(text).slice(0, 500) });
    if (p.journal.length > 120) p.journal.shift();
    s.logs.push({ text: String(text).slice(0, 500), tone: kind === 'danger' ? 'danger' : 'good', time: s.elapsed });
    if (s.logs.length > 60) s.logs.shift();
  }
  function level(s, id) { const xp = ensure(s).xp[id] || 0; let n = 0; while (n < 5 && xp >= thresholds[n + 1]) n++; return n; }
  function gain(s, id, amount) {
    const p = ensure(s); if (!Object.hasOwn(skills, id) || !(amount > 0) || !Number.isFinite(amount)) return;
    const old = level(s, id); p.xp[id] = Math.min(MAX_XP, p.xp[id] + amount);
    if (level(s, id) > old) write(s, 'skill', skills[id] + ' reached level ' + level(s, id) + '. Practice changed what you can do.');
  }
  function known(s, id) { return ensure(s).research.includes(id); }
  function pay(inv, cost) { for (const [id, n] of Object.entries(cost)) { inv[id] -= n; if (!inv[id]) delete inv[id]; } }
  function has(inv, cost) { return Object.entries(cost).every(([id, n]) => (inv[id] || 0) >= n); }
  function names(cost) { return Object.entries(cost).map(([id, n]) => n + ' ' + S.Catalog.items[id].name.toLowerCase()).join(' + '); }
  function quoteResearch(s, id) {
    const node = projects.find(n => n.id === id); if (!node) return null;
    const p = ensure(s), inv = s.player.inventory, missing = [];
    if (known(s, id)) missing.push('Already learned');
    for (const prev of node.prerequisites) if (!known(s, prev)) missing.push('Learn ' + projects.find(n => n.id === prev).name);
    if (p.insight < node.insight) missing.push('Need ' + (node.insight - p.insight) + ' more insight');
    for (const [item, n] of Object.entries(node.cost)) if ((inv[item] || 0) < n) missing.push('Need ' + (n - (inv[item] || 0)) + ' ' + S.Catalog.items[item].name.toLowerCase());
    for (const item of node.tools) if (!(inv[item] > 0)) missing.push('Keep ' + S.Catalog.items[item].name.toLowerCase() + ' in your pack');
    return { node, can: !s.ended && missing.length === 0, missing, cost: node.cost, insight: node.insight };
  }
  function loot(s, container) {
    const p = ensure(s), point = globalPoint(s, container.x, container.y);
    const t = p.tracking;
    if (t && t.kind === 'supplies' && t.id === String(container.id) && t.floor === (s.stories ? s.stories.floor : 0) && Math.hypot(t.x - point.x, t.y - point.y) < 1) p.tracking = null;
    if (container._ground) return;
    const id = (s.stories ? s.stories.floor : 0) + ':' + Math.round(point.x) + ',' + Math.round(point.y) + ':' + container.id;
    if (p.looted[id] || Object.keys(p.looted).length >= 4096) return;
    p.looted[id] = true; p.totals.loot++; p.insight = Math.min(1000, p.insight + 1);
    gain(s, 'craft', 4); write(s, 'find', 'Searched ' + container.label + '. Recovered 1 insight for a project.');
  }
  function contact(s, h) {
    const p = ensure(s); let c = p.contacts[h.id];
    if (!c) {
      if (Object.keys(p.contacts).length >= 4096) return null;
      const point = globalPoint(s, h.x, h.y), n = hash(h.id, s.seed);
      c = p.contacts[h.id] = { name: h.name, alive: h.health > 0, trust: 0, stock: 3, restockDay: s.day, completedDay: 0, request: n % requests.length, trait: ['careful', 'practical', 'resolute'][n % 3], x: point.x, y: point.y, homeX: point.x, homeY: point.y, route: 0, nextRoute: s.elapsed + 6, goalX: point.x, goalY: point.y, robbed: false, deathLooted: false };
    }
    const point = globalPoint(s, h.x, h.y); c.x = point.x; c.y = point.y;
    if (s.day > c.restockDay) { if (!c.robbed) c.stock = 3; c.restockDay = s.day; }
    return c;
  }
  function quoteRequest(s, h) {
    if (!h || h.health <= 0 || h.faction !== 'survivor') return null;
    const c = contact(s, h); if (!c) return null;
    const r = requests[c.request], inv = s.player.inventory, missing = [];
    if (c.completedDay >= s.day) missing.push('Already helped today');
    if (!has(inv, r.cost)) missing.push('Bring ' + names(r.cost));
    const next = Object.assign({}, inv); if (has(inv, r.cost)) { pay(next, r.cost); for (const [id, n] of Object.entries(r.reward)) next[id] = (next[id] || 0) + n; }
    if (S.Engine.inventoryWeight(next) > S.Engine.carryCapacity(s) + .00001 || Object.values(next).some(n => n > 1000)) missing.push('Make room for the reward');
    return { contact: c, request: r, can: !s.ended && !missing.length, missing, cost: r.cost, reward: r.reward };
  }
  function help(s, h) {
    const q = quoteRequest(s, h); if (!q || !q.can) return false;
    const inv = s.player.inventory; pay(inv, q.cost); for (const [id, n] of Object.entries(q.reward)) inv[id] = (inv[id] || 0) + n;
    q.contact.completedDay = s.day; q.contact.trust = Math.min(20, q.contact.trust + 3);
    const p = ensure(s); p.insight = Math.min(1000, p.insight + 2); gain(s, 'care', 8);
    if (S.Warfare) S.Warfare.helped(s, h);
    write(s, 'people', 'Helped ' + h.name + ' with ' + q.request.name + '. They remember: +3 trust, +2 insight.'); return true;
  }
  function agenda(s, h) {
    const c = contact(s, h); if (!c) return null;
    const point = globalPoint(s, h.x, h.y);
    if (s.elapsed >= c.nextRoute || Math.hypot(point.x - c.goalX, point.y - c.goalY) < 12) {
      c.route = (c.route + 1) % 8; c.nextRoute = s.elapsed + 10;
      const dirs = [[2, 0], [0, 2], [-2, 0], [0, -2], [1, 1], [-1, 1], [-1, -1], [1, -1]];
      for (let i = 0; i < 8; i++) {
        const d = dirs[(c.route + i + hash(h.id, s.seed)) % 8], x = c.homeX + d[0] * T, y = c.homeY + d[1] * T;
        const local = { x: x - (s.world ? s.world.originX * T : 0), y: y - (s.world ? s.world.originY * T : 0) };
        if (local.x > T && local.y > T && local.x < (s.width - 1) * T && local.y < (s.height - 1) * T && !S.Engine.isSolid(s, local.x / T, local.y / T)) { c.goalX = x; c.goalY = y; break; }
      }
    }
    return { x: c.goalX - (s.world ? s.world.originX * T : 0), y: c.goalY - (s.world ? s.world.originY * T : 0) };
  }
  function nearCar(s) { return (s.vehicles || []).filter(v => Math.hypot(v.x - s.player.x, v.y - s.player.y) < 80 && S.Engine.hasLOS(s, s.player.x, s.player.y, v.x, v.y)).sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y))[0] || null; }
  function abilityQuote(s, id) {
    const p = ensure(s), inv = s.player.inventory, missing = [], cost = {}, result = { id, cost, missing, can: false, car: null };
    if (id === 'repair') {
      if (!known(s, 'mechanics')) missing.push('Learn Field vehicle repairs');
      result.car = nearCar(s); cost.scrap = 3;
      if (!result.car) missing.push('Stand beside a car');
      else if (Math.abs(result.car.speed) > 1 || result.car.condition >= 100) missing.push('Car must be stopped and damaged');
      if (!(inv.hammer > 0)) missing.push('Keep a claw hammer');
    } else if (id === 'rain') {
      if (!known(s, 'water')) missing.push('Learn Rain collection'); cost.empty_bottle = 1;
      if (s.weather !== 'rain' || s.tiles[Math.floor(s.player.y / T) * s.width + Math.floor(s.player.x / T)] === 2 || s.stories && s.stories.floor > 0) missing.push('Stand outside during rain');
      const next = Object.assign({}, inv); if (has(inv, cost)) { pay(next, cost); next.dirty_water = (next.dirty_water || 0) + 1; }
      if ((next.dirty_water || 0) > 1000 || S.Engine.inventoryWeight(next) > S.Engine.carryCapacity(s) + .00001) missing.push('Make room for water');
    } else if (id === 'sleep') {
      if (p.fatigue < 10) missing.push('You are not tired yet');
      if (s.player.vehicleId) missing.push('Leave the car first');
      const indoor = s.tiles[Math.floor(s.player.y / T) * s.width + Math.floor(s.player.x / T)] === 2;
      const fire = s.structures.some(b => b.type === 'campfire' && Math.hypot(b.x - s.player.x, b.y - s.player.y) < 100);
      if (!indoor && !fire) missing.push('Rest indoors or beside a campfire');
      if (s.zombies.some(z => z.health > 0 && Math.hypot(z.x - s.player.x, z.y - s.player.y) < 220) || (s.humans || []).some(h => h.health > 0 && h.faction === 'raider' && Math.hypot(h.x - s.player.x, h.y - s.player.y) < 300)) missing.push('Enemies are too close');
    } else if (id === 'scan') { if (!known(s, 'radio')) missing.push('Learn Supply scanner'); if (!s.containers.some(c => !c.looted && !c._ground)) missing.push('No unsearched supplies on this floor'); }
    else missing.push('Unknown action');
    if (!has(inv, cost)) missing.push('Need ' + names(cost));
    result.can = !s.ended && !missing.length; return result;
  }
  function action(s, name) {
    const p = ensure(s);
    if (name.startsWith('research:')) {
      const q = quoteResearch(s, name.slice(9)); if (!q || !q.can) return false;
      pay(s.player.inventory, q.cost); p.insight -= q.insight; p.research.push(q.node.id); gain(s, 'craft', 8);
      write(s, 'project', 'Learned ' + q.node.name + '. ' + q.node.benefit); return true;
    }
    if (name.startsWith('study:')) {
      const id = name.slice(6); if (!Object.hasOwn(manuals, id) || !(s.player.inventory[id] > 0) || p.studied.includes(id)) return false;
      p.studied.push(id); p.insight = Math.min(1000, p.insight + 1); gain(s, manuals[id], 18);
      write(s, 'skill', 'Studied ' + S.Catalog.items[id].name + ': +18 practice, +1 insight. The reference stays in your pack.'); return true;
    }
    if (name.startsWith('track:')) {
      const id = name.slice(6); if (!Object.hasOwn(p.contacts, id) || !p.contacts[id].alive) return false; p.tracking = { kind: 'person', id }; return true;
    }
    if (name === 'clearWaypoint') { p.tracking = null; return true; }
    if (name.startsWith('mark:')) {
      const match = /^mark:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),([0-2])$/.exec(name);
      if (!match || Math.abs(Number(match[1])) > 600000 || Math.abs(Number(match[2])) > 600000) return false;
      p.tracking = { kind: 'place', id: 'map', x: Number(match[1]), y: Number(match[2]), floor: Number(match[3]), label: 'Map marker' }; return true;
    }
    if (name === 'wake') { p.sleeping = false; s.player.resting = false; return true; }
    if (!name.startsWith('ability:')) return false;
    const id = name.slice(8), q = abilityQuote(s, id);
    if (!q.can) { write(s, 'info', q.missing.join('. ') + '.'); return false; }
    pay(s.player.inventory, q.cost);
    if (id === 'repair') { q.car.condition = Math.min(100, q.car.condition + 25 + level(s, 'mechanics') * 3); gain(s, 'mechanics', 8); write(s, 'project', 'Repaired ' + q.car.name + ' to ' + Math.round(q.car.condition) + '% condition.'); }
    if (id === 'rain') { s.player.inventory.dirty_water = (s.player.inventory.dirty_water || 0) + 1; gain(s, 'care', 3); write(s, 'find', 'Collected untreated rainwater. Filter or boil it before drinking.'); }
    if (id === 'sleep') { p.sleeping = true; s.player.resting = true; write(s, 'survival', 'Settled down to sleep. Moving or nearby enemies will wake you.'); }
    if (id === 'scan') {
      const c = s.containers.filter(c => !c.looted && !c._ground).sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y))[0];
      const point = globalPoint(s, c.x, c.y); p.tracking = { kind: 'supplies', id: String(c.id), x: point.x, y: point.y, floor: s.stories ? s.stories.floor : 0, label: c.label }; write(s, 'find', 'Scanner marked ' + c.label + ' on this floor.');
    }
    return true;
  }
  function waypoint(s) {
    const p = ensure(s), t = p.tracking; if (!t) return null;
    if (t.kind === 'person') { if (s.stories && s.stories.floor > 0) return null; const c = p.contacts[t.id]; if (!c || !c.alive) return null; const h = (s.humans || []).find(h => h.id === t.id); const point = h ? globalPoint(s, h.x, h.y) : c; return { x: point.x - (s.world ? s.world.originX * T : 0), y: point.y - (s.world ? s.world.originY * T : 0), label: c.name }; }
    if (t.floor !== (s.stories ? s.stories.floor : 0)) return null;
    return { x: t.x - (s.world ? s.world.originX * T : 0), y: t.y - (s.world ? s.world.originY * T : 0), label: t.label };
  }
  function worldEvent(s) {
    const p = ensure(s), e = p.event; e.serial++;
    const kinds = ['migration', 'rain', 'cache'], kind = kinds[hash(e.serial, s.seed) % 3];
    e.kind = kind; e.until = s.elapsed + 75; e.next = s.elapsed + 180;
    if (kind === 'rain') { e.previousWeather = s.weather; s.weather = 'rain'; write(s, 'world', 'A rain front arrived. Collect water if you have learned Rain collection.'); }
    else if (kind === 'migration') {
      const count = S.Engine.spawnWanderers ? S.Engine.spawnWanderers(s, s.difficulty === 'calm' ? 3 : s.difficulty === 'hard' ? 7 : 5) : 0;
      write(s, 'danger', count ? 'A distant disturbance drew ' + count + ' wandering dead into this area. Roads may be less safe.' : 'A distant disturbance passed beyond the loaded area.');
    } else {
      let placed = false;
      for (let i = 0; i < 64 && !placed; i++) {
        const n = hash(e.serial + ':' + i, s.seed), x = Math.floor(s.player.x / T) + (n % 17) - 8, y = Math.floor(s.player.y / T) + ((n >>> 8) % 17) - 8;
        if (x < 1 || y < 1 || x >= s.width - 1 || y >= s.height - 1 || S.Engine.isSolid(s, x, y) || S.Settlement && S.Settlement.occupies(s, x, y) || [6, 7, 8, 9].includes(s.tiles[y * s.width + x]) || s.buildings.some(b => b.stairs && b.stairs.x === x && b.stairs.y === y) || s.containers.some(c => Math.hypot(c.x - (x + .5) * T, c.y - (y + .5) * T) < 28) || Math.hypot((x + .5) * T - s.player.x, (y + .5) * T - s.player.y) < 65 || s.containers.filter(c => c._ground).length >= 60) continue;
        const id = 'drop:' + s.seed + ':' + s._nextGroundId++; s.containers.push({ id, x: (x + .5) * T, y: (y + .5) * T, label: 'Traveler supplies', items: { food: 1, bandage: 2 }, looted: false, _ground: true });
        const point = globalPoint(s, (x + .5) * T, (y + .5) * T); p.tracking = { kind: 'supplies', id, x: point.x, y: point.y, floor: 0, label: 'Traveler supplies' }; placed = true;
      }
      write(s, 'world', placed ? 'A traveler left a supplies cache nearby. Its location is marked.' : 'Travelers passed through the region without leaving supplies.');
    }
  }
  function update(s, dt, input, moved, driving) {
    const p = ensure(s);
    if (p.sleeping) {
      const danger = s.zombies.some(z => z.health > 0 && Math.hypot(z.x - s.player.x, z.y - s.player.y) < 220) || (s.humans || []).some(h => h.health > 0 && h.faction === 'raider' && Math.hypot(h.x - s.player.x, h.y - s.player.y) < 300);
      if (input.moveX || input.moveY || input.attack || input.shoot || danger || s.player.vehicleId || !s.player.resting) { p.sleeping = false; s.player.resting = false; write(s, danger ? 'danger' : 'survival', danger ? 'Nearby danger woke you.' : 'You woke up.'); }
      else { p.fatigue = Math.max(0, p.fatigue - dt * 4); if (p.fatigue === 0) { p.sleeping = false; s.player.resting = false; write(s, 'survival', 'You woke rested.'); } }
    } else p.fatigue = Math.min(100, p.fatigue + dt * (input.sprint && moved > 0 ? .2 : .055) * (S.Personal ? S.Personal.comfort(s) : 1));
    p.survivalClock += dt;
    if (p.survivalClock >= 60) { p.survivalClock -= 60; if (s.player.health > 30 && s.player.bleeding === 0) gain(s, 'care', 2); }
    if (driving) { p.drivingDistance += moved; if (p.drivingDistance >= 1800) { p.drivingDistance %= 1800; gain(s, 'mechanics', 4); } }
    const e = p.event;
    if (e.kind !== 'none' && s.elapsed >= e.until) { if (e.kind === 'rain') s.weather = e.previousWeather; e.kind = 'none'; }
    if (s.world && !(s.stories && s.stories.floor > 0) && s.elapsed >= e.next) worldEvent(s);
  }
  function nextTask(s) {
    const p = ensure(s), inv = s.player.inventory;
    if (p.totals.loot === 0) return 'Collect your cabin supplies with E.';
    if (inv.canvas_pack && !(s.player.equipment && s.player.equipment.backpack)) return 'Equip your canvas backpack in Pack [I].';
    if (p.insight > 0 && !known(s, 'salvage')) return 'Open Projects [J] to learn salvage practice.';
    if (p.fatigue > 70) return 'Find shelter and sleep. Your fatigue is slowing recovery.';
    return 'Scavenge, help survivors, and build a place to rest. Journal [J] keeps your progress.';
  }
  function validate(value, s) {
    if (value === undefined) return fresh(s);
    const fail = () => { throw new Error('Invalid save: survival progression.'); };
    const obj = x => { if (!x || typeof x !== 'object' || Array.isArray(x)) fail(); return x; };
    const num = (x, lo, hi, integer) => { if (typeof x !== 'number' || !Number.isFinite(x) || x < lo || x > hi || integer && !Number.isInteger(x)) fail(); return x; };
    const text = (x, max) => { if (typeof x !== 'string' || !x.length || x.length > max) fail(); return x; };
    const array = (x, max) => { if (!Array.isArray(x) || x.length > max) fail(); return x; };
    obj(value); if (value.version !== 1 || typeof value.sleeping !== 'boolean') fail();
    const p = fresh(s); p.sleeping = value.sleeping; p.fatigue = num(value.fatigue, 0, 100); p.insight = num(value.insight, 0, 1000, true);
    const xp = obj(value.xp); if (Object.keys(xp).some(k => !Object.hasOwn(skills, k))) fail(); for (const k of Object.keys(skills)) p.xp[k] = num(xp[k], 0, MAX_XP);
    const projectIds = new Set(projects.map(n => n.id));
    p.research = array(value.research, projects.length).map(k => { if (!projectIds.has(k)) fail(); return k; });
    if (new Set(p.research).size !== p.research.length || projects.some(n => p.research.includes(n.id) && n.prerequisites.some(k => !p.research.includes(k)))) fail();
    p.studied = array(value.studied, Object.keys(manuals).length).map(k => { if (!Object.hasOwn(manuals, k)) fail(); return k; }); if (new Set(p.studied).size !== p.studied.length) fail();
    const looted = obj(value.looted); if (Object.keys(looted).length > 4096) fail();
    for (const [k, v] of Object.entries(looted)) { if (!/^[\w:,.-]{1,160}$/.test(k) || ['__proto__', 'constructor', 'prototype'].includes(k) || v !== true) fail(); p.looted[k] = true; }
    const contacts = obj(value.contacts); if (Object.keys(contacts).length > 4096) fail();
    for (const [id, c] of Object.entries(contacts)) {
      if (!/^h:-?\d{1,3},-?\d{1,3}:\d{1,4}$/.test(id)) fail(); obj(c);
      if (typeof c.alive !== 'boolean') fail();
      const copy = { name: text(c.name, 80), trust: num(c.trust, 0, 20, true), stock: num(c.stock, 0, 3, true), restockDay: num(c.restockDay, 1, s.day, true), completedDay: num(c.completedDay, 0, s.day, true), request: num(c.request, 0, 2, true), trait: text(c.trait, 12), route: num(c.route, 0, 7, true), nextRoute: num(c.nextRoute, 0, s.elapsed + 12) };
      if (!['careful', 'practical', 'resolute'].includes(copy.trait)) fail();
      for (const k of ['x', 'y', 'homeX', 'homeY', 'goalX', 'goalY']) copy[k] = num(c[k], -600000, 600000);
      for (const flag of ['robbed', 'deathLooted']) { if (c[flag] !== undefined && typeof c[flag] !== 'boolean') fail(); copy[flag] = c[flag] === true; }
      copy.alive = c.alive; p.contacts[id] = copy;
    }
    p.journal = array(value.journal, 120).map(j => { obj(j); return { day: num(j.day, 1, s.day, true), time: num(j.time, 0, 24), elapsed: num(j.elapsed, 0, s.elapsed), kind: text(j.kind, 20), text: text(j.text, 500) }; });
    p.survivalClock = num(value.survivalClock, 0, 60); p.drivingDistance = num(value.drivingDistance, 0, 1800);
    obj(value.totals); for (const k of ['loot', 'craft', 'build']) p.totals[k] = num(value.totals[k], 0, 1000000, true);
    const e = obj(value.event); if (!['none', 'rain', 'migration', 'cache'].includes(e.kind) || !['clear', 'overcast', 'rain'].includes(e.previousWeather)) fail();
    p.event = { kind: e.kind, until: num(e.until, 0, s.elapsed + 90), next: num(e.next, 0, s.elapsed + 200), serial: num(e.serial, 0, 1000000, true), previousWeather: e.previousWeather };
    if (value.tracking !== null) {
      const t = obj(value.tracking); if (t.kind === 'person') { if (typeof t.id !== 'string' || !Object.hasOwn(p.contacts, t.id)) fail(); p.tracking = { kind: 'person', id: t.id }; }
      else if (['supplies', 'place'].includes(t.kind)) p.tracking = { kind: t.kind, id: text(t.id, 100), x: num(t.x, -600000, 600000), y: num(t.y, -600000, 600000), floor: num(t.floor, 0, 2, true), label: text(t.label, 100) };
      else fail();
    }
    return p;
  }
  S.Progression = Object.freeze({ ensure, skills, thresholds, manuals, projects, requests, level, gain, known, write, loot, contact, quoteResearch, quoteRequest, help, agenda, abilityQuote, action, waypoint, update, nextTask, validate, names });
})();
