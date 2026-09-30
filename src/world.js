(function () {
  'use strict';
  const Sirens = window.Sirens = window.Sirens || {};
  const N = 64, T = 32, WINDOW = 192, CHUNK_PIXELS = N * T;
  const limits = Object.freeze({ chunkSize: N, activeChunks: 9, maxChunkCoord: 128, maxPersistentChunks: 2048, maxActiveZombies: 360, maxActiveHumans: 128 });
  let townFactory = null;
  function hash(seed, cx, cy) {
    let n = (seed ^ Math.imul(cx, 374761393) ^ Math.imul(cy, 668265263)) >>> 0;
    n = Math.imul(n ^ n >>> 13, 1274126177); return (n ^ n >>> 16) >>> 0;
  }
  function biome(seed, cx, cy) { return cx === 0 && cy === 0 ? 'town' : ['suburban', 'farm', 'industrial', 'forest', 'river'][hash(seed, cx, cy) % 5]; }
  function key(cx, cy) { return cx + ',' + cy; }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function rng(seed) { let n = seed || 0x6d2b79f5; return function () { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; n >>>= 0; return n / 4294967296; }; }
  function loot(random, archetype, region) {
    const catalog = Sirens.Catalog, entries = catalog && catalog.loot && (catalog.loot[archetype] || catalog.loot[region] || catalog.loot.house);
    const result = { food: 1, water: 1 };
    if (!entries || !entries.length) return Object.assign(result, { wood: 3, scrap: 3, bandage: 1, ammo: 6 });
    const total = entries.reduce((sum, e) => sum + e.weight, 0);
    for (let i = 0; i < 9; i++) {
      let roll = random() * total, chosen = entries[entries.length - 1];
      for (const e of entries) { roll -= e.weight; if (roll <= 0) { chosen = e; break; } }
      const count = chosen.min + Math.floor(random() * (chosen.max - chosen.min + 1));
      result[chosen.id] = Math.min(100, (result[chosen.id] || 0) + count);
    }
    return result;
  }
  function generate(seed, difficulty, cx, cy) {
    const region = biome(seed, cx, cy), random = rng(hash(seed, cx, cy));
    let chunk;
    if (cx === 0 && cy === 0 && townFactory) {
      const s = townFactory(seed, difficulty);
      chunk = { tiles: s.tiles.slice(), buildings: copy(s.buildings), containers: copy(s.containers), zombies: copy(s.zombies), doorHealth: copy(s._doorHealth) };
      // Extend only the outer seam approaches, preserving the original scenario's town interiors.
      for (let i = 29; i <= 33; i++) for (const edge of [0, 1, 62, 63]) { chunk.tiles[i * N + edge] = 1; chunk.tiles[edge * N + i] = 1; }
      const catalog = Sirens.Catalog;
      if (catalog) {
        for (const c of chunk.containers) {
          if (c.label === 'Safe cabin supplies') for (const id of ['canvas_pack', 'machete', 'hammer', 'screwdriver']) if (catalog.items[id]) c.items[id] = 1;
          if (c.label === 'Safe cabin supplies') { c.items.carrot_seeds = 2; c.items.stone = 3; c.items.rope = Math.max(1, c.items.rope || 0); }
          const table = c.label.includes('cabin') ? 'house' : c.label.includes('Clinic') ? 'clinic' : c.label.includes('Workshop') ? 'workshop' : c.label.includes('Grocer') ? 'market' : c.label.includes('Fuel') ? 'fuel' : c.label.includes('depot') ? 'depot' : 'ranger';
          const additional = loot(random, table, region);
          for (const id of Object.keys(additional)) if (!['food', 'water', 'parts', 'wood', 'scrap', 'ammo', 'bandage'].includes(id)) c.items[id] = additional[id];
        }
      }
    } else {
      chunk = { tiles: new Array(N * N).fill(0), buildings: [], containers: [], zombies: [], doorHealth: {} };
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if ((x >= 29 && x <= 33) || (y >= 29 && y <= 33)) chunk.tiles[y * N + x] = 1;
      if (region === 'river') for (let y = 3; y < 61; y++) for (let x = 44; x < 50; x++) if (chunk.tiles[y * N + x] === 0) chunk.tiles[y * N + x] = 4;
      const plans = {
        suburban: [['House', 'house', 7, 7, 11, 10], ['Corner market', 'market', 40, 7, 13, 11], ['First aid station', 'clinic', 7, 40, 11, 12], ['Garden house', 'house', 40, 40, 11, 10]],
        farm: [['Farmhouse', 'house', 7, 7, 12, 10], ['Equipment barn', 'farm', 40, 7, 15, 14], ['Harvest store', 'farm', 7, 40, 14, 12]],
        industrial: [['Machine shop', 'workshop', 7, 7, 15, 15], ['Freight warehouse', 'warehouse', 40, 7, 16, 14], ['Distribution depot', 'warehouse', 7, 40, 16, 15], ['Service office', 'house', 40, 40, 12, 10]],
        forest: [['Ranger cabin', 'ranger', 7, 7, 9, 9], ['Trail shelter', 'house', 40, 40, 10, 9]],
        river: [['River house', 'house', 7, 7, 12, 10], ['Bridge maintenance', 'workshop', 40, 40, 14, 12], ['Riverside market', 'market', 7, 40, 13, 10]]
      };
      const specializations = {
        suburban: ['house', 'grocery', 'restaurant', 'clinic', 'pharmacy', 'police', 'clothing', 'library', 'gunshop', 'hardware', 'urban', 'suburban'],
        farm: ['farm', 'house', 'garage', 'hardware', 'grocery', 'default'],
        industrial: ['warehouse', 'workshop', 'garage', 'hardware', 'radio', 'gunshop', 'industrial', 'depot'],
        forest: ['camp', 'cabin', 'ranger', 'library', 'forest'],
        river: ['river', 'grocery', 'restaurant', 'fuel', 'clinic', 'radio', 'house']
      };
      const names = { house: 'House', grocery: 'Grocery', restaurant: 'Roadside restaurant', clinic: 'First aid clinic', pharmacy: 'Pharmacy', police: 'Police outpost', clothing: 'Clothing shop', library: 'Local library',
        gunshop: 'Hunting shop', hardware: 'Hardware shop', urban: 'Town market', suburban: 'Garden house', farm: 'Equipment barn', garage: 'Repair garage', default: 'Farm store', warehouse: 'Freight warehouse', workshop: 'Machine workshop',
        radio: 'Electronics shop', industrial: 'Industrial store', depot: 'Distribution depot', camp: 'Trail camp', cabin: 'Forest cabin', ranger: 'Ranger cabin', forest: 'Trail shelter', river: 'River house', fuel: 'Fuel station' };
      for (let slot = 0; slot < plans[region].length; slot++) {
        const [, , x, y, w, h] = plans[region][slot], pool = specializations[region];
        const archetype = pool[hash(seed + slot * 19937, cx * 3 + slot, cy * 7 - slot) % pool.length], name = names[archetype];
        const doorX = x + Math.floor(w / 2), doorY = y < 29 ? y + h - 1 : y;
        // A clear apron and a two-tile road join every door to the sector's cross roads.
        for (let yy = y - 2; yy <= y + h + 1; yy++) for (let xx = x - 2; xx <= x + w + 1; xx++) if (xx > 2 && yy > 2 && xx < 61 && yy < 61 && chunk.tiles[yy * N + xx] !== 1) chunk.tiles[yy * N + xx] = 0;
        for (let yy = Math.min(doorY, 31); yy <= Math.max(doorY, 31); yy++) { chunk.tiles[yy * N + doorX] = 1; chunk.tiles[yy * N + doorX + 1] = 1; }
        for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) chunk.tiles[yy * N + xx] = xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1 ? 3 : 2;
        chunk.tiles[doorY * N + doorX] = 6; chunk.doorHealth[doorY * N + doorX] = 65;
        for (const xx of [x, x + w - 1]) chunk.tiles[(y + h - 3) * N + xx] = 8;
        chunk.buildings.push({ x, y, w, h, name: name + ' (' + cx + ',' + cy + ')' });
        chunk.containers.push({ id: 'supplies-' + chunk.containers.length, x: (x + Math.floor(w / 2) + 0.5) * T, y: (y + Math.floor(h / 2) + 0.5) * T,
          label: name + ' supplies', items: loot(random, archetype, region), looted: false });
      }
      // The regional cache exposes biome resources as well as the specialized businesses' supplies.
      chunk.containers.push({ id: 'regional-cache', x: 31.5 * T, y: 42.5 * T, label: region.charAt(0).toUpperCase() + region.slice(1) + ' roadside cache', items: loot(random, region, region), looted: false });
      const density = region === 'forest' ? 0.15 : region === 'farm' ? 0.015 : 0.04;
      for (let y = 4; y < 60; y++) for (let x = 4; x < 60; x++) {
        if (chunk.tiles[y * N + x] !== 0) continue;
        if (chunk.buildings.some(b => x >= b.x - 2 && x <= b.x + b.w + 1 && y >= b.y - 2 && y <= b.y + b.h + 1)) continue;
        if ([[-1, 0], [1, 0], [0, -1], [0, 1]].some(v => chunk.tiles[(y + v[1]) * N + x + v[0]] === 1)) continue;
        if (random() < density) chunk.tiles[y * N + x] = 5;
      }
      const count = difficulty === 'calm' ? 8 : difficulty === 'hard' ? 22 : 15, health = difficulty === 'calm' ? 52 : difficulty === 'hard' ? 74 : 64;
      for (let i = 0, attempts = 0; i < count && attempts < 1000; attempts++) {
        const x = (3.5 + Math.floor(random() * 57)) * T, y = (3.5 + Math.floor(random() * 57)) * T, tile = chunk.tiles[Math.floor(y / T) * N + Math.floor(x / T)];
        if (tile !== 0 && tile !== 1) continue;
        chunk.zombies.push({ id: i + 1, x, y, health, state: 'wander', angle: random() * Math.PI * 2, windup: 0,
          _targetX: x, _targetY: y, _lastSeen: -100, _wanderClock: 3 + random() * 5, _path: [], _pathClock: 0, _stun: 0, _attackCooldown: 0, _blockedTimer: 0 }); i++;
      }
    }
    const offsetX = cx * CHUNK_PIXELS, offsetY = cy * CHUNK_PIXELS;
    for (const c of chunk.containers) c.id = 'c:' + key(cx, cy) + ':' + c.id;
    for (const z of chunk.zombies) {
      z.id = 'z:' + key(cx, cy) + ':' + z.id;
      z.x += offsetX; z.y += offsetY; z._targetX += offsetX; z._targetY += offsetY;
      z._path = [];
    }
    chunk.vehicles = Sirens.Vehicles ? Sirens.Vehicles.spawnForChunk(seed, cx, cy, region).map(v => Object.assign({}, v, { x: v.x + offsetX, y: v.y + offsetY })) : [];
    chunk.humans = Sirens.Actors ? Sirens.Actors.spawnForChunk(seed, cx, cy, region).map(h => Object.assign({}, h, { x: h.x + offsetX, y: h.y + offsetY,
      _targetX: (h._targetX === undefined ? h.x : h._targetX) + offsetX, _targetY: (h._targetY === undefined ? h.y : h._targetY) + offsetY })) : [];
    chunk.biome = region; return chunk;
  }
  function record(world, cx, cy) {
    const k = key(cx, cy);
    if (world.records[k]) return world.records[k];
    if (Object.keys(world.records).length >= limits.maxPersistentChunks) throw new Error('World journal is full. Export your save before exploring farther. Existing sectors remain available.');
    const base = generate(world.seed, world.difficulty, cx, cy);
    return world.records[k] = { tiles: {}, containers: {}, doorHealth: {}, terrainHealth: {}, structures: [], ground: [], vehicles: copy(base.vehicles), humans: copy(base.humans), explored: [], zombies: copy(base.zombies) };
  }
  function snapshot(s) {
    const world = s.world;
    if (!world) return;
    const originPX = world.originX * T, originPY = world.originY * T;
    const active = [];
    for (let cy = world.centerCY - 1; cy <= world.centerCY + 1; cy++) for (let cx = world.centerCX - 1; cx <= world.centerCX + 1; cx++) {
      const r = record(world, cx, cy), base = generate(world.seed, world.difficulty, cx, cy), ox = cx * N - world.originX, oy = cy * N - world.originY;
      r.tiles = {}; r.doorHealth = {}; r.terrainHealth = {}; r.explored = []; r.containers = {}; r.structures = []; r.ground = []; r.zombies = []; r.vehicles = []; r.humans = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const local = y * N + x, index = (y + oy) * WINDOW + x + ox;
        if (s.tiles[index] !== base.tiles[local]) r.tiles[local] = s.tiles[index];
        if (s.discovered[index]) r.explored.push(local);
        if (s._doorHealth[index] !== undefined && s._doorHealth[index] !== (base.doorHealth[local] === undefined ? 65 : base.doorHealth[local])) r.doorHealth[local] = s._doorHealth[index];
        if (s._terrainHealth && s._terrainHealth[index] !== undefined) r.terrainHealth[local] = s._terrainHealth[index];
      }
      active.push({ cx, cy, k: key(cx, cy), r, base });
    }
    for (const c of s.containers) {
      const gx = c.x + originPX, gy = c.y + originPY, cx = Math.floor(gx / CHUNK_PIXELS), cy = Math.floor(gy / CHUNK_PIXELS), r = world.records[key(cx, cy)];
      if (!r) continue;
      if (c._ground) { r.ground.push({ id: c.id, x: gx, y: gy, label: 'Dropped supplies', items: copy(c.items), looted: c.looted, _ground: true }); continue; }
      const a = active.find(a => a.cx === cx && a.cy === cy), original = a && a.base.containers.find(b => b.id === c.id);
      if (!original || original.looted !== c.looted || JSON.stringify(original.items) !== JSON.stringify(c.items)) r.containers[c.id] = { items: copy(c.items), looted: c.looted };
    }
    for (const b of s.structures) {
      const gx = b.x + originPX, gy = b.y + originPY, r = world.records[key(Math.floor(gx / CHUNK_PIXELS), Math.floor(gy / CHUNK_PIXELS))];
      if (r) r.structures.push({ x: gx, y: gy, type: b.type, health: b.health });
    }
    for (const z of s.zombies) {
      const gx = z.x + originPX, gy = z.y + originPY, r = world.records[key(Math.floor(gx / CHUNK_PIXELS), Math.floor(gy / CHUNK_PIXELS))];
      if (!r) continue;
      const zz = copy(z); zz.x = gx; zz.y = gy; zz._targetX += originPX; zz._targetY += originPY;
      zz._path = (zz._path || []).map(p => ({ x: p.x + originPX, y: p.y + originPY }));
      r.zombies.push(zz);
    }
    for (const z of world.dormantZombies || []) {
      const r = world.records[key(Math.floor(z.x / CHUNK_PIXELS), Math.floor(z.y / CHUNK_PIXELS))];
      if (r) r.zombies.push(copy(z));
    }
    for (const v of s.vehicles || []) {
      const gx = v.x + originPX, gy = v.y + originPY, r = world.records[key(Math.floor(gx / CHUNK_PIXELS), Math.floor(gy / CHUNK_PIXELS))];
      if (r) r.vehicles.push(Object.assign({}, v, { x: gx, y: gy }));
    }
    for (const h of s.humans || []) {
      const gx = h.x + originPX, gy = h.y + originPY, r = world.records[key(Math.floor(gx / CHUNK_PIXELS), Math.floor(gy / CHUNK_PIXELS))];
      if (r) r.humans.push(Object.assign({}, h, { x: gx, y: gy, _targetX: (h._targetX === undefined ? h.x : h._targetX) + originPX, _targetY: (h._targetY === undefined ? h.y : h._targetY) + originPY,
        _step: h._step ? { x: h._step.x + originPX, y: h._step.y + originPY } : null }));
    }
    for (const h of world.dormantHumans || []) {
      const r = world.records[key(Math.floor(h.x / CHUNK_PIXELS), Math.floor(h.y / CHUNK_PIXELS))]; if (r) r.humans.push(copy(h));
    }
  }
  function rebuild(s, cx, cy) {
    const w = s.world, oldOriginX = w.originX, oldOriginY = w.originY;
    w.centerCX = cx; w.centerCY = cy; w.originX = (cx - 1) * N; w.originY = (cy - 1) * N;
    const shiftX = (w.originX - oldOriginX) * T, shiftY = (w.originY - oldOriginY) * T;
    s.player.x -= shiftX; s.player.y -= shiftY; s.goal.radioX -= shiftX; s.goal.radioY -= shiftY;
    s.width = WINDOW; s.height = WINDOW;
    s.tiles = new Array(WINDOW * WINDOW).fill(0); s.discovered = new Array(WINDOW * WINDOW).fill(false);
    s.buildings = []; s.containers = []; s.zombies = []; s.structures = []; s.vehicles = []; s.humans = []; s._doorHealth = {}; s._terrainHealth = {}; s.noises = []; s.particles = [];
    w.activeBiomes = {};
    const ids = new Set();
    for (let yy = cy - 1; yy <= cy + 1; yy++) for (let xx = cx - 1; xx <= cx + 1; xx++) {
      const r = record(w, xx, yy), base = generate(w.seed, w.difficulty, xx, yy), ox = xx * N - w.originX, oy = yy * N - w.originY;
      w.activeBiomes[key(xx, yy)] = base.biome;
      const explored = new Set(r.explored);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const local = y * N + x, i = (y + oy) * WINDOW + x + ox;
        s.tiles[i] = r.tiles[local] === undefined ? base.tiles[local] : r.tiles[local]; s.discovered[i] = explored.has(local);
        if (s.tiles[i] === 6 || s.tiles[i] === 7) s._doorHealth[i] = r.doorHealth[local] === undefined ? base.doorHealth[local] === undefined ? 65 : base.doorHealth[local] : r.doorHealth[local];
        if (r.terrainHealth && r.terrainHealth[local] !== undefined) s._terrainHealth[i] = r.terrainHealth[local];
      }
      for (const b of base.buildings) s.buildings.push(Object.assign({}, b, { x: b.x + ox, y: b.y + oy }));
      for (const c of base.containers) {
        const cc = copy(c), changed = r.containers[c.id];
        cc.x += ox * T; cc.y += oy * T; if (changed) { cc.items = copy(changed.items); cc.looted = changed.looted; } s.containers.push(cc);
      }
      for (const c of r.ground || []) s.containers.push(Object.assign({}, copy(c), { x: c.x - w.originX * T, y: c.y - w.originY * T, _ground: true }));
      for (const b of r.structures) s.structures.push(Object.assign({}, b, { x: b.x - w.originX * T, y: b.y - w.originY * T }));
      for (const v of r.vehicles || []) s.vehicles.push(Object.assign({}, v, { x: v.x - w.originX * T, y: v.y - w.originY * T }));
      for (const h of r.humans || []) s.humans.push(Object.assign({}, h, { x: h.x - w.originX * T, y: h.y - w.originY * T,
        _targetX: h._targetX - w.originX * T, _targetY: h._targetY - w.originY * T,
        _thinkClock: h._thinkClock === undefined ? 0 : h._thinkClock,
        _step: h._step ? { x: h._step.x - w.originX * T, y: h._step.y - w.originY * T } : null }));
      for (const z of r.zombies) {
        if (ids.has(z.id)) continue; ids.add(z.id);
        const zz = copy(z); zz.x -= w.originX * T; zz.y -= w.originY * T; zz._targetX -= w.originX * T; zz._targetY -= w.originY * T;
        zz._path = (zz._path || []).map(p => ({ x: p.x - w.originX * T, y: p.y - w.originY * T }));
        s.zombies.push(zz);
      }
    }
    w.visited[key(cx, cy)] = true; w.visitedCount = Object.keys(w.visited).length; w.biome = biome(w.seed, cx, cy); w.revision++;
    // Crowds outside the simulation budget remain in the journal without being discarded or duplicated.
    s.zombies.sort((a, b) => (a.x - s.player.x) ** 2 + (a.y - s.player.y) ** 2 - ((b.x - s.player.x) ** 2 + (b.y - s.player.y) ** 2));
    w.dormantZombies = s.zombies.splice(limits.maxActiveZombies).map(z => {
      const zz = copy(z); zz.x += w.originX * T; zz.y += w.originY * T; zz._targetX += w.originX * T; zz._targetY += w.originY * T;
      zz._path = (zz._path || []).map(p => ({ x: p.x + w.originX * T, y: p.y + w.originY * T })); return zz;
    });
    s.humans.sort((a, b) => (a.health <= 0 ? 1e9 : a.following ? -1e9 : 0) + (a.x - s.player.x) ** 2 + (a.y - s.player.y) ** 2 - ((b.health <= 0 ? 1e9 : b.following ? -1e9 : 0) + (b.x - s.player.x) ** 2 + (b.y - s.player.y) ** 2));
    w.dormantHumans = s.humans.splice(limits.maxActiveHumans).map(h => Object.assign({}, h, { x: h.x + w.originX * T, y: h.y + w.originY * T, _targetX: h._targetX + w.originX * T, _targetY: h._targetY + w.originY * T,
      _step: h._step ? { x: h._step.x + w.originX * T, y: h._step.y + w.originY * T } : null }));
    if (Sirens.Stories) Sirens.Stories.refresh(s);
    s._aiCursor = 0; s._exploreClock = 0;
    return { shiftX, shiftY };
  }
  function initialize(s) {
    s.mode = 'openworld';
    s.world = { seed: s.seed, difficulty: s.difficulty, originX: 0, originY: 0, centerCX: 0, centerCY: 0, records: {}, visited: {}, visitedCount: 0, biome: 'town', revision: 0, activeBiomes: {} };
    return rebuild(s, 0, 0);
  }
  function maybeRecenter(s) {
    if (!s.world) return { shiftX: 0, shiftY: 0 };
    const w = s.world, cx = Math.floor((w.originX + s.player.x / T) / N), cy = Math.floor((w.originY + s.player.y / T) / N);
    if (cx === w.centerCX && cy === w.centerCY) return { shiftX: 0, shiftY: 0 };
    if (Math.abs(cx) > limits.maxChunkCoord || Math.abs(cy) > limits.maxChunkCoord) {
      stopAtCenter(s);
      return { shiftX: 0, shiftY: 0, blocked: 'You reached the charted world boundary (sector coordinates -128 to 128).' };
    }
    let needed = 0;
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (!w.records[key(x, y)]) needed++;
    if (Object.keys(w.records).length + needed > limits.maxPersistentChunks) {
      stopAtCenter(s);
      return { shiftX: 0, shiftY: 0, blocked: 'World journal limit reached. Existing sectors stay available. Export your save to preserve your journey.' };
    }
    snapshot(s); return rebuild(s, cx, cy);
  }
  function stopAtCenter(s) {
    s.player.x = Math.max(N * T + 24, Math.min(2 * N * T - 24, s.player.x)); s.player.y = Math.max(N * T + 24, Math.min(2 * N * T - 24, s.player.y));
    const vehicle = (s.vehicles || []).find(v => v.id === s.player.vehicleId);
    if (vehicle) { vehicle.x = s.player.x; vehicle.y = s.player.y; vehicle.speed = 0; }
  }
  function exportWorld(s) {
    snapshot(s); const w = s.world, records = {};
    for (const k of Object.keys(w.records)) {
      const [cx, cy] = k.split(',').map(Number), r = w.records[k], base = generate(w.seed, w.difficulty, cx, cy);
      const meaningful = Object.keys(r.tiles).length || Object.keys(r.containers).length || Object.keys(r.doorHealth).length || Object.keys(r.terrainHealth || {}).length || r.structures.length || r.ground.length || r.explored.length || JSON.stringify(r.zombies) !== JSON.stringify(base.zombies) || JSON.stringify(r.vehicles) !== JSON.stringify(base.vehicles) || JSON.stringify(r.humans) !== JSON.stringify(base.humans);
      if (meaningful) records[k] = copy(r);
    }
    return { seed: w.seed, difficulty: w.difficulty, centerCX: w.centerCX, centerCY: w.centerCY, records, visited: Object.keys(w.visited) };
  }
  function validate(value, items) {
    const bad = message => { throw new Error('Invalid world save: ' + message + '.'); };
    const object = (o, label) => { if (!o || typeof o !== 'object' || Array.isArray(o)) bad(label); return o; };
    const number = (n, min, max, label, integer) => { if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max || integer && !Number.isInteger(n)) bad(label); return n; };
    const coords = k => { if (typeof k !== 'string' || !/^-?\d{1,3},-?\d{1,3}$/.test(k)) bad('sector coordinate'); const p = k.split(',').map(Number); p.forEach(n => number(n, -129, 129, 'sector range', true)); if (key(p[0], p[1]) !== k) bad('noncanonical sector coordinate'); return p; };
    const inventory = o => { object(o, 'items'); if (Object.keys(o).length > 500) bad('too many item types'); const result = {}; for (const id of Object.keys(o)) { if (!Object.prototype.hasOwnProperty.call(items, id)) bad('unknown item ' + id); const count = number(o[id], 0, 1000, 'item count', true); if (count) result[id] = count; } return result; };
    object(value, 'world');
    const seed = number(value.seed, 0, 4294967295, 'seed', true), difficulty = value.difficulty;
    if (!['calm', 'standard', 'hard'].includes(difficulty)) bad('difficulty');
    const centerCX = number(value.centerCX, -128, 128, 'centerX', true), centerCY = number(value.centerCY, -128, 128, 'centerY', true);
    object(value.records, 'records'); if (Object.keys(value.records).length > limits.maxPersistentChunks) bad('journal limit');
    const result = { seed, difficulty, centerCX, centerCY, originX: (centerCX - 1) * N, originY: (centerCY - 1) * N, records: {}, visited: {}, visitedCount: 0, biome: biome(seed, centerCX, centerCY), revision: 0, activeBiomes: {} };
    const ids = new Set(), vehicleIds = new Set(), humanIds = new Set(), groundIds = new Set(), extent = 130 * CHUNK_PIXELS;
    for (const k of Object.keys(value.records)) {
      const [cx, cy] = coords(k), source = object(value.records[k], 'sector record'), base = generate(seed, difficulty, cx, cy);
      const r = { tiles: {}, containers: {}, doorHealth: {}, terrainHealth: {}, structures: [], ground: [], vehicles: [], humans: [], explored: [], zombies: [] };
      object(source.tiles, 'tile changes'); object(source.containers, 'container changes'); object(source.doorHealth, 'door health');
      for (const index of Object.keys(source.tiles)) {
        if (!/^\d{1,4}$/.test(index)) bad('tile index'); const i = number(Number(index), 0, N * N - 1, 'tile index', true), tile = number(source.tiles[index], 0, 9, 'changed tile', true), before = base.tiles[i];
        const allowed = before === 6 || before === 7 ? [6, 7] : before === 3 ? [0, 2] : before === 5 ? [0] : before === 8 ? [9] : [];
        if (!allowed.includes(tile)) bad('unsupported terrain change');
        if (before === 3 && tile === 2 && !base.buildings.some(b => i % N >= b.x && i % N < b.x + b.w && Math.floor(i / N) >= b.y && Math.floor(i / N) < b.y + b.h)) bad('floor outside a building');
        r.tiles[i] = tile;
      }
      for (const index of Object.keys(source.doorHealth)) {
        if (!/^\d{1,4}$/.test(index)) bad('door index'); const i = number(Number(index), 0, N * N - 1, 'door index', true);
        if (base.tiles[i] !== 6 && base.tiles[i] !== 7) bad('missing door'); r.doorHealth[i] = number(source.doorHealth[index], -20, 65, 'door health');
      }
      object(source.terrainHealth || {}, 'terrain health');
      for (const index of Object.keys(source.terrainHealth || {})) {
        if (!/^\d{1,4}$/.test(index)) bad('terrain health index'); const i = number(Number(index), 0, N * N - 1, 'terrain health index', true);
        const current = r.tiles[i] === undefined ? base.tiles[i] : r.tiles[i];
        if (![3, 5, 8, 9].includes(current)) bad('terrain health without obstacle');
        r.terrainHealth[i] = number(source.terrainHealth[index], 0, 300, 'terrain health');
        if (r.terrainHealth[i] === 0 && current !== 9) bad('zero obstacle health without broken window');
      }
      for (const id of Object.keys(source.containers)) {
        if (!base.containers.some(c => c.id === id)) bad('missing container'); const c = object(source.containers[id], 'container');
        if (typeof c.looted !== 'boolean') bad('container flag'); const content = inventory(c.items); if (c.looted && Object.keys(content).length) bad('looted container content'); r.containers[id] = { items: content, looted: c.looted };
      }
      if (!Array.isArray(source.ground || []) || (source.ground || []).length > 60) bad('ground supplies');
      for (const c of source.ground || []) {
        object(c, 'ground container'); if (typeof c.id !== 'string' || !/^drop:\d{1,10}:\d{1,7}$/.test(c.id) || groundIds.has(c.id)) bad('ground container identity'); groundIds.add(c.id);
        const x = number(c.x, cx * CHUNK_PIXELS, (cx + 1) * CHUNK_PIXELS - 0.0001, 'ground.x'), y = number(c.y, cy * CHUNK_PIXELS, (cy + 1) * CHUNK_PIXELS - 0.0001, 'ground.y');
        const content = inventory(c.items); if (typeof c.looted !== 'boolean' || c.looted && Object.keys(content).length) bad('ground content');
        r.ground.push({ id: c.id, x, y, label: 'Dropped supplies', items: content, looted: c.looted, _ground: true });
      }
      if (!Array.isArray(source.vehicles || []) || (source.vehicles || []).length > 50) bad('vehicles');
      for (const v of source.vehicles || []) {
        object(v, 'vehicle'); if (typeof v.id !== 'string' || !/^v:-?\d{1,3},-?\d{1,3}:\d{1,4}$/.test(v.id) || vehicleIds.has(v.id)) bad('vehicle identity'); vehicleIds.add(v.id);
        if (typeof v.type !== 'string' || v.type.length > 40 || typeof v.name !== 'string' || v.name.length > 80 || typeof v.color !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(v.color)) bad('vehicle metadata');
        const tank = number(v.tank, 1, 200, 'fuel tank'), vehicle = { id: v.id, type: v.type, name: v.name, color: v.color,
          x: number(v.x, cx * CHUNK_PIXELS, (cx + 1) * CHUNK_PIXELS - 0.0001, 'vehicle.x'), y: number(v.y, cy * CHUNK_PIXELS, (cy + 1) * CHUNK_PIXELS - 0.0001, 'vehicle.y'),
          angle: number(v.angle, -100, 100, 'vehicle.angle'), speed: number(v.speed, -600, 600, 'vehicle.speed'), fuel: number(v.fuel, 0, tank, 'fuel'), condition: number(v.condition, 0, 100, 'vehicle.condition'),
          maxSpeed: number(v.maxSpeed, 1, 600, 'vehicle max speed'), tank };
        r.vehicles.push(vehicle);
      }
      if (!Array.isArray(source.humans || []) || (source.humans || []).length > 256) bad('humans');
      for (const h of source.humans || []) {
        object(h, 'human'); if (typeof h.id !== 'string' || !/^h:-?\d{1,3},-?\d{1,3}:\d{1,4}$/.test(h.id) || humanIds.has(h.id)) bad('human identity'); humanIds.add(h.id);
        if (!['survivor', 'raider'].includes(h.faction) || typeof h.following !== 'boolean' || !['bat', 'pistol'].includes(h.weapon) || typeof h.name !== 'string' || h.name.length > 80) bad('human metadata');
        const x = number(h.x, cx * CHUNK_PIXELS, (cx + 1) * CHUNK_PIXELS - 0.0001, 'human.x'), y = number(h.y, cy * CHUNK_PIXELS, (cy + 1) * CHUNK_PIXELS - 0.0001, 'human.y');
        const step = h._step === undefined || h._step === null ? null : { x: number(h._step.x, -extent, extent, 'human step.x'), y: number(h._step.y, -extent, extent, 'human step.y') };
        r.humans.push({ id: h.id, x, y, angle: number(h.angle, -100, 100, 'human.angle'), health: number(h.health, 0, 100, 'human.health'), faction: h.faction, name: h.name, following: h.following, _step: step,
          weapon: h.weapon, cooldown: number(h.cooldown, 0, 10, 'human cooldown'), _thinkClock: h._thinkClock === undefined ? 0 : number(h._thinkClock, -1e8, 10, 'human think'),
          _targetX: h._targetX === undefined ? x : number(h._targetX, -extent, extent, 'human target.x'), _targetY: h._targetY === undefined ? y : number(h._targetY, -extent, extent, 'human target.y') });
      }
      if (!Array.isArray(source.explored) || source.explored.length > N * N) bad('exploration');
      const seen = new Set(); for (const i of source.explored) { number(i, 0, N * N - 1, 'exploration tile', true); if (seen.has(i)) bad('duplicate exploration tile'); seen.add(i); r.explored.push(i); }
      if (!Array.isArray(source.structures) || source.structures.length > 60) bad('structures');
      const structures = new Set();
      for (const b of source.structures) {
        object(b, 'structure'); const x = number(b.x, cx * CHUNK_PIXELS, (cx + 1) * CHUNK_PIXELS - 0.0001, 'structure.x'), y = number(b.y, cy * CHUNK_PIXELS, (cy + 1) * CHUNK_PIXELS - 0.0001, 'structure.y');
        const i = Math.floor((y - cy * CHUNK_PIXELS) / T) * N + Math.floor((x - cx * CHUNK_PIXELS) / T);
        const tile = r.tiles[i] === undefined ? base.tiles[i] : r.tiles[i];
        if (!['barricade', 'campfire'].includes(b.type) || ![0, 1, 2].includes(tile) || structures.has(i)) bad('structure position/type'); structures.add(i);
        r.structures.push({ x, y, type: b.type, health: number(b.health, 0.0001, 200, 'structure health') });
      }
      if (!Array.isArray(source.zombies) || source.zombies.length > 4096) bad('zombies');
      for (const z of source.zombies) {
        object(z, 'zombie'); if (typeof z.id !== 'string' || !/^(?:z:-?\d{1,3},-?\d{1,3}:\d{1,6}|wave:\d{1,10}:\d{1,7})$/.test(z.id) || ids.has(z.id)) bad('zombie identity'); ids.add(z.id);
        const x = number(z.x, cx * CHUNK_PIXELS, (cx + 1) * CHUNK_PIXELS - 0.0001, 'zombie.x'), y = number(z.y, cy * CHUNK_PIXELS, (cy + 1) * CHUNK_PIXELS - 0.0001, 'zombie.y');
        if (!['wander', 'investigate', 'chase', 'attack', 'stunned'].includes(z.state)) bad('zombie state');
        if (!Array.isArray(z._path || []) || (z._path || []).length > 128) bad('zombie path');
        const zz = { id: z.id, x, y, health: number(z.health, 0.0001, 150, 'zombie health'), state: z.state, angle: number(z.angle, -100, 100, 'zombie angle'), windup: number(z.windup, 0, 0.75, 'windup'),
          _path: (z._path || []).map(p => ({ x: number(p.x, -extent, extent, 'path.x'), y: number(p.y, -extent, extent, 'path.y') })) };
        for (const [field, min, max, fallback] of [['_targetX', -extent, extent, x], ['_targetY', -extent, extent, y], ['_lastSeen', -100, 1e8, -100], ['_wanderClock', -1e8, 20, 0], ['_pathClock', -1e8, 3, 0], ['_stun', 0, 1, 0], ['_attackCooldown', 0, 2, 0], ['_blockedTimer', 0, 1.1, 0]]) zz[field] = z[field] === undefined ? fallback : number(z[field], min, max, field);
        if (z._humanBite !== undefined) zz._humanBite = number(z._humanBite, -10, 2, 'human bite cooldown');
        r.zombies.push(zz);
      }
      result.records[k] = r;
    }
    if (!Array.isArray(value.visited) || value.visited.length > limits.maxPersistentChunks) bad('visited sectors');
    for (const k of value.visited) { const [cx, cy] = coords(k); if (Math.abs(cx) > 128 || Math.abs(cy) > 128 || result.visited[k]) bad('visited sector'); result.visited[k] = true; }
    result.visitedCount = Object.keys(result.visited).length;
    return result;
  }
  function restore(s, validated) { s.mode = 'openworld'; s.world = validated; return rebuild(s, validated.centerCX, validated.centerCY); }
  Sirens.World = Object.freeze({ limits, biome, generate, initialize, maybeRecenter, snapshot, exportWorld, validate, restore, setTownFactory(fn) { townFactory = fn; } });
}());
