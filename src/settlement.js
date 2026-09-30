(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const T = 32, MAX_COORD = 600000, MAX_TILE = MAX_COORD / T;
  const limits = Object.freeze({ plots: 24, nodes: 8192, records: 64, stockWeight: 150, homeRange: 120, gardenRange: 500, growthTime: 90 });
  const deposits = Object.freeze({ stone: { health: 72, item: 'stone', amount: 3 }, iron: { health: 108, item: 'iron_ore', amount: 2 }, copper: { health: 96, item: 'copper_ore', amount: 2 } });
  const damage = Object.freeze({ stone_pick: 24, iron_pick: 46, sledgehammer: 18 });
  const roles = ['follow', 'guard', 'gather', 'farm'];
  const candidates = new WeakMap();
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function fresh() { return { version: 1, nodes: {}, plots: [], stock: {}, home: null, jobs: {}, moods: {}, clock: 0, stats: { mined: 0, harvested: 0, delivered: 0 } }; }
  function ensure(s) { return s.settlement || (s.settlement = fresh()); }
  function onGround(s) { return !(s.stories && s.stories.floor > 0); }
  function origin(s) { return { x: (s.world ? s.world.originX : 0) * T, y: (s.world ? s.world.originY : 0) * T }; }
  function globalPoint(s, point) { const o = origin(s); return { x: point.x + o.x, y: point.y + o.y }; }
  function localPoint(s, point) { const o = origin(s); return { x: point.x - o.x, y: point.y - o.y }; }
  function inScene(s, point) { return point.x >= T && point.y >= T && point.x < (s.width - 1) * T && point.y < (s.height - 1) * T; }
  function tileHash(seed, x, y) { let n = (seed ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ 0x5bd1e995) >>> 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return (n ^ (n >>> 16)) >>> 0; }
  function specification(seed, x, y) {
    const n = tileHash(seed, x, y); if (n % 120) return null;
    const roll = (n >>> 8) % 10, type = roll < 6 ? 'stone' : roll < 8 ? 'iron' : 'copper';
    return { type, health: deposits[type].health };
  }
  function write(s, text, kind) {
    if (S.Progression) S.Progression.write(s, kind || 'base', text);
    else { s.logs.push({ text, tone: 'info', time: s.elapsed }); if (s.logs.length > 60) s.logs.shift(); }
  }
  function gain(s, amount) { if (S.Progression) S.Progression.gain(s, 'craft', amount); }
  function increment(base, stat, amount) { base.stats[stat] = Math.min(1000000, base.stats[stat] + amount); }
  function metadata(id) { return S.Catalog && Object.hasOwn(S.Catalog.items, id) ? S.Catalog.items[id] : null; }
  function miningPower(id) {
    if (damage[id]) return damage[id];
    const item = metadata(id), power = item && item.miningDamage;
    return Number.isFinite(power) && power > 0 ? Math.round(clamp(power, 1, 72)) : 0;
  }
  function weight(inv) { return S.Engine.inventoryWeight(inv); }
  function fits(inv, result, capacity) {
    const next = Object.assign({}, inv);
    for (const [id, count] of Object.entries(result)) { if (!metadata(id)) return false; next[id] = (next[id] || 0) + count; if (next[id] > 1000) return false; }
    return weight(next) <= capacity + .00001;
  }
  function pay(inv, cost) { for (const [id, n] of Object.entries(cost)) { inv[id] -= n; if (!inv[id]) delete inv[id]; } }
  function add(inv, result) { for (const [id, n] of Object.entries(result)) inv[id] = (inv[id] || 0) + n; }
  function has(inv, cost) { return Object.entries(cost).every(([id, n]) => (inv[id] || 0) >= n); }
  function occupiedByPlot(s, tx, ty) {
    const o = origin(s); return ensure(s).plots.some(p => Math.floor((p.x - o.x) / T) === tx && Math.floor((p.y - o.y) / T) === ty);
  }
  function occupies(s, tx, ty) { return onGround(s) && Number.isFinite(tx) && Number.isFinite(ty) && occupiedByPlot(s, Math.floor(tx), Math.floor(ty)); }
  function clearGrass(s, tx, ty) {
    if (tx <= 0 || ty <= 0 || tx >= s.width - 1 || ty >= s.height - 1 || s.tiles[ty * s.width + tx] !== 0) return false;
    if ((s.buildings || []).some(b => tx >= b.x && ty >= b.y && tx < b.x + b.w && ty < b.y + b.h)) return false;
    const x = (tx + .5) * T, y = (ty + .5) * T;
    return !(s.structures || []).some(b => b.health > 0 && Math.floor(b.x / T) === tx && Math.floor(b.y / T) === ty) &&
      !(s.containers || []).some(c => Math.hypot(c.x - x, c.y - y) < 28) && !occupiedByPlot(s, tx, ty);
  }
  function allCandidates(s) {
    const o = origin(s); let cache = candidates.get(s);
    if (cache && cache.tiles === s.tiles && cache.seed === s.seed && cache.x === o.x && cache.y === o.y && cache.width === s.width && cache.height === s.height) return cache.nodes;
    const list = [];
    for (let ty = 1; ty < s.height - 1; ty++) for (let tx = 1; tx < s.width - 1; tx++) {
      const gx = tx + o.x / T, gy = ty + o.y / T, spec = specification(s.seed, gx, gy);
      if (spec) list.push({ id: gx + ',' + gy, tx, ty, x: (tx + .5) * T, y: (ty + .5) * T, type: spec.type, health: spec.health });
    }
    cache = { tiles: s.tiles, seed: s.seed, x: o.x, y: o.y, width: s.width, height: s.height, nodes: list }; candidates.set(s, cache); return list;
  }
  function nodes(s, bounds) {
    if (!s || !s.player || !onGround(s)) return [];
    const b = ensure(s), minX = bounds && Number.isFinite(bounds.minX) ? bounds.minX : 0, minY = bounds && Number.isFinite(bounds.minY) ? bounds.minY : 0;
    const maxX = bounds && Number.isFinite(bounds.maxX) ? bounds.maxX : s.width, maxY = bounds && Number.isFinite(bounds.maxY) ? bounds.maxY : s.height;
    const list = [];
    for (const n of allCandidates(s)) {
      const remaining = Object.hasOwn(b.nodes, n.id) ? b.nodes[n.id] : n.health;
      if (remaining <= 0 || n.tx < minX || n.ty < minY || n.tx >= maxX || n.ty >= maxY || !clearGrass(s, n.tx, n.ty)) continue;
      list.push(Object.assign({}, n, { health: remaining }));
    }
    return list;
  }
  function resultFor(node) { const d = deposits[node.type]; return { [d.item]: d.amount }; }
  function pileFor(s, node, result, create) {
    const pile = s.containers.find(c => c._ground && Math.hypot(c.x - node.x, c.y - node.y) < 40 && Object.entries(result).every(([id, n]) => (c.items[id] || 0) + n <= 1000));
    if (pile) return pile;
    if (s.containers.filter(c => c._ground).length >= 60) return null;
    if (!create) return true;
    const added = { id: 'drop:' + s.seed + ':' + s._nextGroundId++, x: node.x, y: node.y, label: 'Mined supplies', items: {}, looted: false, _ground: true };
    s.containers.push(added); return added;
  }
  function mine(s, node, tool, target) {
    const base = ensure(s), hit = miningPower(tool); if (!hit || !metadata(tool)) return false;
    if (!Object.hasOwn(base.nodes, node.id) && Object.keys(base.nodes).length >= limits.nodes) { write(s, 'The mining record is full. Explore other supplies instead.'); return false; }
    const remaining = Object.hasOwn(base.nodes, node.id) ? base.nodes[node.id] : deposits[node.type].health;
    if (remaining <= 0) return false;
    const result = resultFor(node), willBreak = remaining <= hit;
    if (willBreak && !fits(target, result, target === base.stock ? limits.stockWeight : S.Engine.carryCapacity(s)) && (target === base.stock || !pileFor(s, node, result, false))) {
      write(s, target === base.stock ? 'Base storage is full. Make room before gathering.' : 'Your pack and local supplies piles are full. Make room before mining.'); return false;
    }
    base.nodes[node.id] = Math.max(0, remaining - hit);
    if (S.Effects) S.Effects.emit(s, 'stone', { broken: base.nodes[node.id] === 0 });
    s.noises.push({ x: node.x, y: node.y, radius: 130, life: 1.1 }); if (s.noises.length > 24) s.noises.shift();
    if (base.nodes[node.id] > 0) return true;
    if (fits(target, result, target === base.stock ? limits.stockWeight : S.Engine.carryCapacity(s))) add(target, result);
    else { const pile = pileFor(s, node, result, true); add(pile.items, result); pile.looted = false; }
    increment(base, 'mined', 1); if (target === base.stock) increment(base, 'delivered', deposits[node.type].amount);
    gain(s, 5); write(s, 'Mined ' + deposits[node.type].amount + ' ' + metadata(deposits[node.type].item).name.toLowerCase() + (target === base.stock ? ' into the base stockpile.' : ' from a surface deposit.')); return true;
  }
  function strike(s, aimX, aimY, weaponId) {
    if (!s || s.ended || !onGround(s) || s.player.vehicleId || !miningPower(weaponId) || !(s.player.inventory[weaponId] > 0) || ![aimX, aimY].every(Number.isFinite)) return false;
    const item = metadata(weaponId), range = item && item.weapon && item.weapon.range || 60;
    const dx = aimX - s.player.x, dy = aimY - s.player.y, len = Math.hypot(dx, dy); if (len < .001) return false;
    const tx = Math.floor(s.player.x / T), ty = Math.floor(s.player.y / T);
    const nearby = nodes(s, { minX: tx - 4, minY: ty - 4, maxX: tx + 5, maxY: ty + 5 }).filter(n => {
      const x = n.x - s.player.x, y = n.y - s.player.y, distance = Math.hypot(x, y), along = (x * dx + y * dy) / len, side = Math.abs(x * dy - y * dx) / len;
      return distance <= range + 10 && along > 0 && side <= 16 + along * .25 && S.Engine.hasLOS(s, s.player.x, s.player.y, n.x, n.y);
    }).sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y) || a.id.localeCompare(b.id));
    return nearby.length ? mine(s, nearby[0], weaponId, s.player.inventory) : false;
  }
  function nearHome(s, point) {
    const b = ensure(s); if (!b.home || !onGround(s)) return false;
    const from = point || s.player, p = globalPoint(s, from), home = localPoint(s, b.home);
    return inScene(s, home) && Math.hypot(p.x - b.home.x, p.y - b.home.y) <= limits.homeRange && S.Engine.hasLOS(s, from.x, from.y, home.x, home.y);
  }
  function nearestPlot(s, point) {
    if (!onGround(s)) return null;
    const from = point || s.player;
    return ensure(s).plots.map(plot => Object.assign({ plot }, localPoint(s, plot))).filter(p => inScene(s, p) && Math.hypot(p.x - from.x, p.y - from.y) <= 70 && S.Engine.hasLOS(s, from.x, from.y, p.x, p.y)).sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0] || null;
  }
  function waterCost(inv) { return inv.dirty_water > 0 ? { dirty_water: 1 } : { water: 1 }; }
  function plantPoint(s) {
    const b = ensure(s); if (!b.home || !onGround(s)) return null;
    const angle = Number.isFinite(s.player.angle) ? s.player.angle : 0, preferred = [Math.round(Math.cos(angle)), Math.round(Math.sin(angle))];
    const options = [preferred, [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]];
    const seen = new Set(), px = Math.floor(s.player.x / T), py = Math.floor(s.player.y / T), o = origin(s);
    for (const [dx, dy] of options) {
      const tx = px + dx, ty = py + dy, id = (tx + o.x / T) + ',' + (ty + o.y / T); if (seen.has(id)) continue; seen.add(id);
      const point = { x: (tx + .5) * T, y: (ty + .5) * T };
      if (!clearGrass(s, tx, ty) || !S.Engine.hasLOS(s, s.player.x, s.player.y, point.x, point.y)) continue;
      const global = globalPoint(s, point), spec = specification(s.seed, tx + o.x / T, ty + o.y / T);
      if (Math.hypot(global.x - b.home.x, global.y - b.home.y) >= limits.gardenRange || spec && (Object.hasOwn(b.nodes, id) ? b.nodes[id] : spec.health) > 0) continue;
      return Object.assign({ id }, global);
    }
    return null;
  }
  function equipped(s, id) { const e = s.player.equipment || {}; return s.player.weapon === id || Object.values(e).some(value => value === id || Array.isArray(value) && value.includes(id)); }
  function quote(s, command) {
    const base = ensure(s), inv = s.player.inventory, missing = [], cost = {}, result = {}, q = { can: false, missing, cost, result, action: command, plot: null, point: null, human: null };
    if (s.ended || s.player.health <= 0) missing.push('The run has ended');
    if (s.player.vehicleId) missing.push('Leave the vehicle first');
    if (!onGround(s)) missing.push('Return to ground level');
    if (command === 'home') {
      if (base.home) missing.push('Your base is already claimed');
      const tile = s.tiles[Math.floor(s.player.y / T) * s.width + Math.floor(s.player.x / T)];
      if (tile !== 2 && !s.structures.some(b => b.type === 'campfire' && b.health > 0 && Math.hypot(b.x - s.player.x, b.y - s.player.y) < 100)) missing.push('Stand indoors or beside a campfire');
    } else if (command === 'plant') {
      cost.carrot_seeds = 1; cost.wood = 1;
      if (!base.home) missing.push('Claim a base first');
      if (base.plots.length >= limits.plots) missing.push('The 24 garden plots are already planted');
      q.point = plantPoint(s); if (!q.point) missing.push('Stand beside clear grass within 500 pixels of your base');
    } else if (command === 'water' || command === 'harvest') {
      const near = nearestPlot(s); q.plot = near && near.plot;
      if (!q.plot) missing.push('Stand beside a garden plot');
      if (command === 'water') {
        Object.assign(cost, waterCost(inv));
        if (q.plot && q.plot.moisture >= 80) missing.push('This plot has enough water');
        if (q.plot && q.plot.progress >= limits.growthTime) missing.push('The crop is ready to harvest');
      } else {
        Object.assign(result, { carrot: 2, carrot_seeds: 1 });
        if (q.plot && q.plot.progress < limits.growthTime) missing.push('The crop is still growing');
        if (!fits(inv, result, S.Engine.carryCapacity(s))) missing.push('Make room for the harvest');
      }
    } else if (/^(store|take):/.test(command)) {
      const [direction, id] = command.split(':'); q.item = id;
      if (!metadata(id) || command !== direction + ':' + id) missing.push('Choose a known item');
      if (!nearHome(s)) missing.push('Stand within 120 pixels of your base');
      if (metadata(id)) {
        if (direction === 'store') {
          cost[id] = 1;
          if (equipped(s, id) && (inv[id] || 0) <= 1) missing.push('Keep your last equipped item; unequip it first');
          if (!fits(base.stock, { [id]: 1 }, limits.stockWeight)) missing.push('The stockpile is full (150 kg or item limit)');
        } else {
          if (!(base.stock[id] > 0)) missing.push('None left in the stockpile');
          result[id] = 1; if (!fits(inv, result, S.Engine.carryCapacity(s))) missing.push('Make room in your pack');
        }
      }
    } else if (typeof command === 'string' && command.startsWith('job:')) {
      const match = /^job:(h:-?\d{1,3},-?\d{1,3}:\d{1,4}):(follow|guard|gather|farm)$/.exec(command);
      if (!match) missing.push('Choose a companion and a known job');
      else {
        q.role = match[2]; q.human = (s.humans || []).find(h => h.id === match[1] && h.health > 0 && h.faction === 'survivor' && h.following);
        if (!q.human) missing.push('Recruit a living companion first');
        if (!Object.hasOwn(base.jobs, match[1]) && Object.keys(base.jobs).length >= limits.records) missing.push('The companion work record is full');
        if (!Object.hasOwn(base.moods, match[1]) && Object.keys(base.moods).length >= limits.records) missing.push('The companion morale record is full');
        if (q.role !== 'follow' && !base.home) missing.push('Claim a base first');
        if (q.role === 'gather' && !stockTool(base)) missing.push('Store a mining pick at your base');
      }
    } else missing.push('Unknown base action');
    for (const [id, n] of Object.entries(cost)) if (!metadata(id) || (inv[id] || 0) < n) missing.push('Need ' + n + ' ' + (metadata(id) ? metadata(id).name.toLowerCase() : id));
    q.can = !missing.length; return q;
  }
  function action(s, command) {
    if (typeof command !== 'string') return false;
    const q = quote(s, command); if (!q.can) { if (q.missing.length) write(s, q.missing.join('. ') + '.'); return false; }
    const base = ensure(s), inv = s.player.inventory;
    pay(inv, q.cost);
    if (command === 'home') { base.home = Object.assign(globalPoint(s, s.player), { floor: 0 }); write(s, 'Claimed a base. Nearby grass can hold a garden; supplies and companions can work here.'); }
    else if (command === 'plant') { base.plots.push(Object.assign(q.point, { crop: 'carrot', moisture: 0, progress: 0 })); gain(s, 3); write(s, 'Planted carrots. Water the plot or wait for rain; moist growth takes 90 seconds.'); }
    else if (command === 'water') { q.plot.moisture = 100; gain(s, 1); write(s, 'Watered the garden plot. Growth resumes while soil is moist.'); }
    else if (command === 'harvest') { add(inv, q.result); base.plots = base.plots.filter(p => p.id !== q.plot.id); increment(base, 'harvested', 1); gain(s, 5); write(s, 'Harvested 2 carrot bundles and 1 seed. Plant again to keep the garden going.'); }
    else if (command.startsWith('store:')) { add(base.stock, { [q.item]: 1 }); increment(base, 'delivered', 1); }
    else if (command.startsWith('take:')) { pay(base.stock, { [q.item]: 1 }); add(inv, q.result); }
    else if (command.startsWith('job:')) { base.jobs[q.human.id] = { role: q.role, timer: 0 }; if (!Object.hasOwn(base.moods, q.human.id)) base.moods[q.human.id] = 60; write(s, q.human.name + ' assigned to ' + q.role + '. Food in the stockpile supports morale.'); }
    if (S.Effects) S.Effects.emit(s, 'ui'); return true;
  }
  function nearby(s) {
    if (!s || s.ended || s.player.vehicleId) return '';
    const near = nearestPlot(s); if (!near) return '';
    return near.plot.progress >= limits.growthTime ? 'Harvest carrots' : near.plot.moisture < 80 ? 'Water garden plot' : 'Garden growing: ' + Math.floor(near.plot.progress / limits.growthTime * 100) + '%';
  }
  function interact(s) { const near = nearestPlot(s); if (!near || s.ended || s.player.vehicleId) return false; return action(s, near.plot.progress >= limits.growthTime ? 'harvest' : 'water'); }
  function activeCompanion(s, h) { return h && h.health > 0 && h.faction === 'survivor' && h.following && onGround(s); }
  function combatMultiplier(s, h) { return activeCompanion(s, h) ? .7 + .5 * (Object.hasOwn(ensure(s).moods, h.id) ? ensure(s).moods[h.id] : 60) / 100 : 1; }
  function stockTool(base) {
    return Object.keys(base.stock).filter(id => base.stock[id] > 0 && (id === 'iron_pick' || id === 'stone_pick' || metadata(id) && metadata(id).miningDamage > 0))
      .sort((a, b) => miningPower(b) - miningPower(a) || a.localeCompare(b))[0] || null;
  }
  function destination(s, h) {
    const base = ensure(s), job = base.jobs[h.id]; if (!activeCompanion(s, h) || !job || job.role === 'follow' || !base.home) return null;
    const home = localPoint(s, base.home); if (!inScene(s, home)) return null;
    if (job.role === 'gather' && stockTool(base)) {
      const options = nodes(s, { minX: (home.x - limits.gardenRange) / T, minY: (home.y - limits.gardenRange) / T, maxX: (home.x + limits.gardenRange) / T, maxY: (home.y + limits.gardenRange) / T }).filter(n => Math.hypot(n.x - home.x, n.y - home.y) < limits.gardenRange && fits(base.stock, resultFor(n), limits.stockWeight));
      options.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y) || a.id.localeCompare(b.id));
      if (options.length) return { kind: 'mine', node: options[0], x: options[0].x, y: options[0].y };
    }
    if (job.role === 'farm') {
      const plots = base.plots.map(plot => Object.assign({ plot }, localPoint(s, plot))).filter(p => inScene(s, p) && (p.plot.progress >= limits.growthTime ? fits(base.stock, { carrot: 2, carrot_seeds: 1 }, limits.stockWeight) : p.plot.moisture < 35 && has(base.stock, waterCost(base.stock))));
      plots.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y) || a.plot.id.localeCompare(b.plot.id));
      if (plots.length) return { kind: plots[0].plot.progress >= limits.growthTime ? 'harvest' : 'water', plot: plots[0].plot, x: plots[0].x, y: plots[0].y };
    }
    return { kind: 'guard', x: home.x, y: home.y };
  }
  function goal(s, h) { const target = destination(s, h); return target ? { x: target.x, y: target.y } : null; }
  function work(s, h, dt) {
    if (!activeCompanion(s, h) || !Number.isFinite(dt) || dt <= 0) return false;
    const base = ensure(s), job = base.jobs[h.id], target = destination(s, h);
    const danger = (s.zombies || []).some(z => z.health > 0 && Math.hypot(z.x - h.x, z.y - h.y) < 140 && S.Engine.hasLOS(s, h.x, h.y, z.x, z.y)) ||
      (s.humans || []).some(other => other.health > 0 && other.faction === 'raider' && Math.hypot(other.x - h.x, other.y - h.y) < 140 && S.Engine.hasLOS(s, h.x, h.y, other.x, other.y));
    if (danger) { if (job) job.timer = 0; return false; }
    if (!job || !target || Math.hypot(h.x - target.x, h.y - target.y) > 48 || !S.Engine.hasLOS(s, h.x, h.y, target.x, target.y)) { if (job) job.timer = 0; return false; }
    if (target.kind === 'guard') { job.timer = 0; return false; }
    job.timer += Math.min(1, dt) * combatMultiplier(s, h); if (job.timer < 3) return false; job.timer = 0;
    if (target.kind === 'mine') return mine(s, target.node, stockTool(base), base.stock);
    if (target.kind === 'water') { const cost = waterCost(base.stock); if (!has(base.stock, cost)) return false; pay(base.stock, cost); target.plot.moisture = 100; return true; }
    if (target.kind === 'harvest') {
      const result = { carrot: 2, carrot_seeds: 1 }; if (!fits(base.stock, result, limits.stockWeight)) return false;
      add(base.stock, result); base.plots = base.plots.filter(p => p.id !== target.plot.id); increment(base, 'harvested', 1); increment(base, 'delivered', 3);
      write(s, h.name + ' harvested carrots into the stockpile. Replant with the recovered seed.'); return true;
    }
    return false;
  }
  function update(s, dt) {
    if (!s || s.ended || !Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(1, dt); const base = ensure(s);
    for (const p of base.plots) {
      if (s.weather === 'rain') p.moisture = Math.min(100, p.moisture + dt * 4);
      if (p.moisture > 0 && p.progress < limits.growthTime) p.progress = Math.min(limits.growthTime, p.progress + Math.min(dt, p.moisture / .6));
      if (s.weather !== 'rain') p.moisture = Math.max(0, p.moisture - dt * .6);
    }
    base.clock += dt;
    if (base.clock < 60) return; base.clock %= 60;
    const companions = (s.humans || []).filter(h => activeCompanion(s, h)).sort((a, b) => a.id.localeCompare(b.id));
    for (const h of companions) {
      if (!Object.hasOwn(base.moods, h.id) && Object.keys(base.moods).length >= limits.records) continue;
      const old = Object.hasOwn(base.moods, h.id) ? base.moods[h.id] : 60;
      const food = Object.keys(base.stock).filter(id => base.stock[id] > 0 && metadata(id) && metadata(id).effect && metadata(id).effect.hunger > 0).sort((a, b) => a === 'food' ? -1 : b === 'food' ? 1 : a.localeCompare(b))[0];
      if (food) { pay(base.stock, { [food]: 1 }); base.moods[h.id] = Math.min(100, old + 12); }
      else { base.moods[h.id] = Math.max(0, old - 10); if (old >= 30 && base.moods[h.id] < 30) write(s, h.name + ' has low morale. Stock food to restore work and fighting strength.', 'people'); }
    }
  }
  function validate(value, s) {
    if (value === undefined) return fresh();
    const fail = () => { throw new Error('Invalid save: settlement.'); };
    const object = v => { if (!v || typeof v !== 'object' || Array.isArray(v)) fail(); return v; };
    const number = (v, min, max, integer) => { if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || integer && !Number.isInteger(v)) fail(); return v; };
    const point = v => { object(v); return { x: number(v.x, -MAX_COORD, MAX_COORD), y: number(v.y, -MAX_COORD, MAX_COORD) }; };
    const humanId = id => typeof id === 'string' && /^h:-?\d{1,3},-?\d{1,3}:\d{1,4}$/.test(id);
    const tileId = id => {
      const match = typeof id === 'string' && /^(-?\d{1,5}),(-?\d{1,5})$/.exec(id); if (!match) fail();
      const x = number(Number(match[1]), -MAX_TILE, MAX_TILE, true), y = number(Number(match[2]), -MAX_TILE, MAX_TILE, true); if (id !== x + ',' + y) fail(); return { x, y };
    };
    object(value); if (value.version !== 1) fail();
    const base = fresh(), allowed = ['version', 'nodes', 'plots', 'stock', 'home', 'jobs', 'moods', 'clock', 'stats'];
    if (Object.keys(value).some(key => !allowed.includes(key))) fail();
    const rawNodes = object(value.nodes); if (Object.keys(rawNodes).length > limits.nodes) fail();
    for (const [id, health] of Object.entries(rawNodes)) { const p = tileId(id), spec = specification(s.seed, p.x, p.y); if (!spec) fail(); base.nodes[id] = number(health, 0, spec.health, true); }
    const stock = object(value.stock); if (Object.keys(stock).length > Object.keys(S.Catalog.items).length) fail();
    for (const [id, count] of Object.entries(stock)) { if (!metadata(id)) fail(); const n = number(count, 0, 1000, true); if (n) base.stock[id] = n; }
    if (weight(base.stock) > limits.stockWeight + .00001) fail();
    if (value.home !== null) { base.home = point(value.home); if (value.home.floor !== 0) fail(); base.home.floor = 0; }
    if (!base.home && Object.keys(base.stock).length) fail();
    if (!Array.isArray(value.plots) || value.plots.length > limits.plots || value.plots.length && !base.home) fail();
    const used = new Set();
    for (const raw of value.plots) {
      const p = point(raw), t = tileId(raw.id);
      if (used.has(raw.id) || raw.crop !== 'carrot' || p.x !== (t.x + .5) * T || p.y !== (t.y + .5) * T || Math.hypot(p.x - base.home.x, p.y - base.home.y) >= limits.gardenRange) fail();
      if (specification(s.seed, t.x, t.y) && base.nodes[raw.id] !== 0) fail();
      used.add(raw.id); base.plots.push(Object.assign(p, { id: raw.id, crop: 'carrot', moisture: number(raw.moisture, 0, 100), progress: number(raw.progress, 0, limits.growthTime) }));
    }
    const jobs = object(value.jobs), moods = object(value.moods); if (Object.keys(jobs).length > limits.records || Object.keys(moods).length > limits.records) fail();
    for (const [id, job] of Object.entries(jobs)) { if (!humanId(id)) fail(); object(job); if (!roles.includes(job.role) || job.role !== 'follow' && !base.home) fail(); base.jobs[id] = { role: job.role, timer: number(job.timer, 0, 4) }; }
    for (const [id, mood] of Object.entries(moods)) { if (!humanId(id)) fail(); base.moods[id] = number(mood, 0, 100); }
    base.clock = number(value.clock, 0, 60); object(value.stats); for (const key of ['mined', 'harvested', 'delivered']) base.stats[key] = number(value.stats[key], 0, 1000000, true);
    return base;
  }
  S.Settlement = Object.freeze({ limits, deposits, roles, ensure, validate, nodes, strike, quote, action, goal, work, combatMultiplier, update, nearby, interact, occupies });
})();
