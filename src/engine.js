(function () {
  'use strict';

  const Sirens = window.Sirens = window.Sirens || {};
  const SIZE = 64, TILE = 32, CAPACITY = 24, CLIP = 8, SIGNAL_TIME = 150;
  const structureCache = new WeakMap();
  const DIFFICULTIES = {
    calm: { zombies: 20, speed: 25, health: 52, damage: 6, drain: 0.75, wave: 2 },
    standard: { zombies: 32, speed: 30, health: 64, damage: 9, drain: 1, wave: 3 },
    hard: { zombies: 44, speed: 35, health: 74, damage: 12, drain: 1.25, wave: 4 }
  };
  const items = Sirens.Catalog ? Sirens.Catalog.items : Object.freeze({
    wood: { name: 'Wood', weight: 0.8, color: '#b88c57', description: 'Boards for barricades and campfires.' },
    scrap: { name: 'Salvage', weight: 0.45, color: '#91a5ad', description: 'Recovered metal, cloth, and useful components.' },
    parts: { name: 'Radio parts', weight: 0.35, color: '#e9c567', description: 'Five parts repair the emergency radio.' },
    food: { name: 'Rations', weight: 0.6, color: '#cbb475', description: 'Eat to reduce hunger by 38.' },
    water: { name: 'Water', weight: 0.8, color: '#73becf', description: 'Drink to reduce thirst by 45.' },
    bandage: { name: 'Bandage', weight: 0.15, color: '#e2dfce', description: 'Stops bleeding and restores a little health.' },
    ammo: { name: 'Pistol rounds', weight: 0.04, color: '#d5ac55', description: 'Reserve rounds. Reload fills an eight-round magazine.' }
  });
  const recipes = Sirens.Catalog ? Sirens.Catalog.recipes : Object.freeze([
    { id: 'field_wraps', name: 'Field wraps', cost: { scrap: 2 }, result: { bandage: 2 }, description: 'Turn clean salvaged cloth into two bandages.' },
    { id: 'recover_rounds', name: 'Recover ammunition', cost: { scrap: 4 }, result: { ammo: 8 }, description: 'Sort eight usable rounds from salvaged components.' },
    { id: 'collect_water', name: 'Collect clean water', cost: { wood: 2, scrap: 2 }, result: { water: 2 }, description: 'Build a small condenser beside a campfire. Requires a campfire within 100 pixels.' }
  ]);

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function finite(n, fallback) { return typeof n === 'number' && Number.isFinite(n) ? n : fallback; }
  function dist2(x, y, xx, yy) { return (x - xx) * (x - xx) + (y - yy) * (y - yy); }
  function random(s) {
    let x = s._rng >>> 0;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    s._rng = x >>> 0 || 0x6d2b79f5;
    return s._rng / 4294967296;
  }
  function tileIndex(s, tx, ty) { return ty * s.width + tx; }
  function structureAt(s, tx, ty) {
    let cache = structureCache.get(s);
    if (!cache || cache.array !== s.structures || cache.count !== s.structures.length) {
      cache = { array: s.structures, count: s.structures.length, cells: new Map() };
      for (const b of s.structures) if (b.health > 0) cache.cells.set(Math.floor(b.y / TILE) * s.width + Math.floor(b.x / TILE), b);
      structureCache.set(s, cache);
    }
    const b = cache.cells.get(ty * s.width + tx); return b && b.health > 0 ? b : null;
  }
  function isSolid(s, tx, ty) {
    if (!Number.isFinite(tx) || !Number.isFinite(ty)) return true;
    tx = Math.floor(tx); ty = Math.floor(ty);
    if (tx < 0 || ty < 0 || tx >= s.width || ty >= s.height) return true;
    const t = s.tiles[tileIndex(s, tx, ty)];
    if (t === 3 || t === 4 || t === 5 || t === 6 || t === 8 || t === 9) return true;
    const structure = structureAt(s, tx, ty);
    return !!structure && structure.type === 'barricade';
  }
  function clearCircle(s, x, y, r) {
    return !isSolid(s, (x - r) / TILE, (y - r) / TILE) &&
      !isSolid(s, (x + r) / TILE, (y - r) / TILE) &&
      !isSolid(s, (x - r) / TILE, (y + r) / TILE) &&
      !isSolid(s, (x + r) / TILE, (y + r) / TILE);
  }
  function hasLOS(s, x1, y1, x2, y2) {
    if (![x1, y1, x2, y2].every(Number.isFinite)) return false;
    const distance = Math.hypot(x2 - x1, y2 - y1);
    if (distance > s.width * TILE * 1.5) return false;
    const steps = Math.max(1, Math.ceil(distance / 8));
    for (let i = 1; i <= steps; i++) {
      const f = i / steps;
      const tx = Math.floor((x1 + (x2 - x1) * f) / TILE), ty = Math.floor((y1 + (y2 - y1) * f) / TILE);
      if (s.tiles[ty * s.width + tx] !== 9 && isSolid(s, tx, ty)) return false;
    }
    return true;
  }
  function walkRay(s, x1, y1, x2, y2) {
    const distance = Math.hypot(x2 - x1, y2 - y1), steps = Math.max(1, Math.ceil(distance / 8));
    for (let i = 1; i <= steps; i++) {
      const f = i / steps;
      if (!clearCircle(s, x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, 10)) return false;
    }
    return true;
  }
  function move(s, entity, dx, dy, radius) {
    let changed = false;
    if (clearCircle(s, entity.x + dx, entity.y, radius)) { entity.x += dx; changed = changed || Math.abs(dx) > 0.001; }
    if (clearCircle(s, entity.x, entity.y + dy, radius)) { entity.y += dy; changed = changed || Math.abs(dy) > 0.001; }
    return changed;
  }
  function weight(inventory) {
    let total = 0;
    Object.keys(items).forEach(id => { total += (inventory[id] || 0) * items[id].weight; });
    return total;
  }
  function carryCapacity(s) {
    const id = s.player.equipment && s.player.equipment.backpack;
    return CAPACITY + clamp(finite(items[id] && items[id].capacity, 0), 0, 100);
  }
  function weaponInfo(id) {
    if (items[id] && items[id].weapon) return items[id].weapon;
    return id === 'pistol' ? { kind: 'firearm', damage: 85, range: 670, cooldown: 0.24, staminaCost: 0, clipSize: 8, ammoId: 'ammo', noise: 690 } :
      { kind: 'melee', damage: 36, range: 78, cooldown: 0.47, staminaCost: 8, noise: 150 };
  }
  function setWeapon(s, id) {
    const p = s.player;
    p.equipment = p.equipment || { weapon: p.weapon, clothing: null, backpack: null };
    p.magazines = p.magazines || { pistol: p.ammo };
    if (weaponInfo(p.weapon).kind === 'firearm') p.magazines[p.weapon] = p.ammo;
    p.weapon = id; p.equipment.weapon = id;
    p.ammo = weaponInfo(id).kind === 'firearm' ? p.magazines[id] || 0 : p.magazines.pistol || 0;
  }
  function log(s, text, tone) {
    text = String(text).slice(0, 580);
    const last = s.logs[s.logs.length - 1];
    if (last && last.text === text && s.elapsed - last.time < 2) return;
    s.logs.push({ text, tone: tone || 'info', time: s.elapsed });
    if (s.logs.length > 60) s.logs.splice(0, s.logs.length - 60);
  }
  function noise(s, x, y, radius, life) {
    s.noises.push({ x, y, radius, life: life || 1.6 });
    if (s.noises.length > 24) s.noises.splice(0, s.noises.length - 24);
  }
  function particles(s, x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = random(s) * Math.PI * 2, speed = 14 + random(s) * 56;
      const life = 0.25 + random(s) * 0.35;
      s.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, color });
    }
    if (s.particles.length > 220) s.particles.splice(0, s.particles.length - 220);
  }

  function road(s, x, y, w, h) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      if (xx > 0 && yy > 0 && xx < SIZE - 1 && yy < SIZE - 1) s.tiles[yy * SIZE + xx] = 1;
    }
  }
  function building(s, x, y, w, h, name, doorX, doorY, supplies) {
    s.buildings.push({ x, y, w, h, name });
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      s.tiles[yy * SIZE + xx] = xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1 ? 3 : 2;
    }
    s.tiles[doorY * SIZE + doorX] = 6;
    s._doorHealth[doorY * SIZE + doorX] = 65;
    for (const xx of [x, x + w - 1]) if (xx !== doorX || y + h - 3 !== doorY) s.tiles[(y + h - 3) * SIZE + xx] = 8;
    const cx = x + Math.floor(w / 2), cy = y + Math.floor(h / 2);
    s.containers.push({ id: 'supplies-' + s.containers.length, x: (cx + 0.5) * TILE, y: (cy + 0.5) * TILE, label: name + ' supplies', items: supplies, looted: false });
  }
  function newZombie(s, x, y) {
    const d = DIFFICULTIES[s.difficulty];
    return {
      id: s.world ? 'wave:' + s.seed + ':' + s._nextZombieId++ : s._nextZombieId++, x, y, health: d.health, state: 'wander', angle: random(s) * Math.PI * 2,
      windup: 0, _targetX: x, _targetY: y, _lastSeen: -100, _wanderClock: random(s) * 3,
      _path: [], _pathClock: 0, _stun: 0, _attackCooldown: 0, _blockedTimer: 0
    };
  }
  function reveal(s) {
    const p = s.player, radius = s.time >= 19 || s.time < 6 ? 230 : 300;
    const tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE), cells = Math.ceil(radius / TILE);
    for (let y = Math.max(0, ty - cells); y <= Math.min(s.height - 1, ty + cells); y++) {
      for (let x = Math.max(0, tx - cells); x <= Math.min(s.width - 1, tx + cells); x++) {
        const xx = (x + 0.5) * TILE, yy = (y + 0.5) * TILE;
        if (dist2(xx, yy, p.x, p.y) > radius * radius) continue;
        // Reveal the first wall or tree itself while keeping the space behind it hidden.
        const d = Math.hypot(xx - p.x, yy - p.y), shorten = Math.min(18, d);
        const f = d > 0 ? (d - shorten) / d : 0;
        if (hasLOS(s, p.x, p.y, p.x + (xx - p.x) * f, p.y + (yy - p.y) * f)) s.discovered[y * s.width + x] = true;
      }
    }
  }
  function create(seed, difficulty, mode) {
    seed = finite(seed, 20260929);
    seed = Math.trunc(clamp(seed, 0, 4294967295)) >>> 0;
    difficulty = Object.prototype.hasOwnProperty.call(DIFFICULTIES, difficulty) ? difficulty : 'standard';
    const s = {
      width: SIZE, height: SIZE, tileSize: TILE, seed, difficulty, mode: 'rescue',
      tiles: new Array(SIZE * SIZE).fill(0), buildings: [], containers: [], zombies: [], structures: [], particles: [],
      player: { x: 11.5 * TILE, y: 11.5 * TILE, angle: Math.PI / 2, health: 100, stamina: 100, hunger: 10,
        thirst: 10, infection: 0, bleeding: 0, inventory: { food: 2, water: 2, bandage: 2, ammo: 12 }, kills: 0,
        weapon: 'bat', ammo: 6, cooldown: 0, invulnerable: 0, resting: false,
        equipment: { weapon: 'bat', clothing: null, backpack: null }, magazines: { pistol: 6 }, vehicleId: null, legacyGear: false },
      day: 1, time: 8, elapsed: 0, weather: 'overcast', noises: [], logs: [],
      goal: { parts: 0, required: 5, radioX: 31.5 * TILE, radioY: 25.5 * TILE, complete: false, active: false, countdown: SIGNAL_TIME },
      ended: false, won: false, stats: { ticks: 0, aiUpdates: 0, pathNodes: 0 }, discovered: new Array(SIZE * SIZE).fill(false),
      _rng: seed || 0x6d2b79f5, _doorHealth: {}, _terrainHealth: {}, _nextZombieId: 1, _aiClock: 0, _aiCursor: 0,
      _exploreClock: 0, _noiseClock: 0, _waveClock: 0, _radioNoiseClock: 0, _nextGroundId: 1, vehicles: [], humans: []
    };
    if (Sirens.Catalog) { if (items.bat) s.player.inventory.bat = 1; if (items.pistol) s.player.inventory.pistol = 1; }
    if (Sirens.Vehicles) s.vehicles = Sirens.Vehicles.spawnForChunk(seed, 0, 0, 'town');
    if (Sirens.Actors) s.humans = Sirens.Actors.spawnForChunk(seed, 0, 0, 'town');
    road(s, 29, 2, 5, 60); road(s, 2, 29, 60, 5);
    road(s, 11, 14, 20, 2); road(s, 21, 12, 2, 4); road(s, 32, 17, 12, 2);
    road(s, 32, 25, 20, 2); road(s, 19, 30, 12, 2);
    road(s, 33, 37, 11, 2); road(s, 42, 32, 2, 7);
    road(s, 20, 45, 12, 2); road(s, 29, 32, 3, 15);
    building(s, 7, 7, 9, 8, 'Safe cabin', 11, 14, { food: 3, water: 3, bandage: 2, wood: 6, scrap: 3 });
    building(s, 18, 7, 8, 7, 'Ranger shed', 21, 13, { parts: 1, wood: 5, scrap: 3, ammo: 8 });
    building(s, 38, 7, 9, 10, 'Clinic', 42, 16, { parts: 1, bandage: 5, water: 3, scrap: 2 });
    building(s, 49, 21, 9, 9, 'Fuel stop', 49, 25, { parts: 1, food: 3, water: 2, ammo: 12, scrap: 4 });
    building(s, 8, 25, 12, 10, 'Workshop', 19, 30, { parts: 2, wood: 8, scrap: 7, ammo: 12 });
    building(s, 37, 37, 12, 10, 'Grocer', 42, 37, { parts: 1, food: 6, water: 5, bandage: 1 });
    building(s, 15, 46, 10, 9, 'Maintenance depot', 20, 46, { parts: 1, wood: 8, scrap: 6, ammo: 18 });
    // A clear, walkable radio apron and a pond that cannot sever the town roads.
    road(s, 29, 23, 5, 5);
    for (let y = 5; y < 15; y++) for (let x = 53; x < 61; x++) {
      if (((x - 56.5) / 4) ** 2 + ((y - 9.5) / 5) ** 2 < 1) s.tiles[y * SIZE + x] = 4;
    }
    for (let y = 1; y < SIZE - 1; y++) for (let x = 1; x < SIZE - 1; x++) {
      if (s.tiles[y * SIZE + x] !== 0 || dist2((x + 0.5) * TILE, (y + 0.5) * TILE, s.player.x, s.player.y) < 160 ** 2) continue;
      // Keep the tiles immediately beside a road clear so every doorway has an approach.
      if ([[-1, 0], [1, 0], [0, -1], [0, 1]].some(v => s.tiles[(y + v[1]) * SIZE + x + v[0]] === 1)) continue;
      if (random(s) < 0.035) s.tiles[y * SIZE + x] = 5;
    }
    const count = DIFFICULTIES[difficulty].zombies;
    for (let i = 0, attempts = 0; i < count && attempts < 3000; attempts++) {
      const x = (3.5 + Math.floor(random(s) * 57)) * TILE, y = (3.5 + Math.floor(random(s) * 57)) * TILE;
      const t = s.tiles[Math.floor(y / TILE) * SIZE + Math.floor(x / TILE)];
      if ((t !== 0 && t !== 1) || dist2(x, y, s.player.x, s.player.y) < 350 ** 2 || dist2(x, y, s.goal.radioX, s.goal.radioY) < 100 ** 2) continue;
      if (!clearCircle(s, x, y, 11) || s.zombies.some(z => dist2(z.x, z.y, x, y) < 35 ** 2)) continue;
      s.zombies.push(newZombie(s, x, y)); i++;
    }
    reveal(s);
    log(s, 'Your cabin is safe. Take its supplies, then search the named buildings for five radio parts.', 'info');
    log(s, 'The emergency radio is at the gold tower on your map. E opens doors and collects supplies.', 'info');
    if (mode === 'openworld' && Sirens.World) {
      Sirens.World.initialize(s); reveal(s);
      log(s, 'Open world: roads connect every sector. Explore, collect original gear, and build a shelter. The radio mission is optional.', 'good');
    }
    if (Sirens.Stories) Sirens.Stories.refresh(s);
    return s;
  }

  // Each route search has a hard 420-node budget. Doors and barricades can be broken by a pursuing zombie.
  function route(s, z, targetX, targetY) {
    const W = s.width, H = s.height;
    const sx = Math.floor(z.x / TILE), sy = Math.floor(z.y / TILE);
    const gx = clamp(Math.floor(targetX / TILE), 1, W - 2), gy = clamp(Math.floor(targetY / TILE), 1, H - 2);
    const start = sy * W + sx, goal = gy * W + gx, heap = [], scores = new Map(), parents = new Map();
    const closed = new Set();
    function h(id) { return Math.abs(id % W - gx) + Math.abs(Math.floor(id / W) - gy); }
    function push(id, g) {
      const node = { id, g, f: g + h(id) }, a = heap;
      a.push(node); let i = a.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (a[p].f <= node.f) break; a[i] = a[p]; i = p; }
      a[i] = node;
    }
    function pop() {
      const first = heap[0], last = heap.pop();
      if (heap.length) {
        let i = 0;
        while (i * 2 + 1 < heap.length) {
          let j = i * 2 + 1; if (j + 1 < heap.length && heap[j + 1].f < heap[j].f) j++;
          if (heap[j].f >= last.f) break; heap[i] = heap[j]; i = j;
        }
        heap[i] = last;
      }
      return first;
    }
    scores.set(start, 0); push(start, 0);
    let best = start, visited = 0;
    while (heap.length && visited < 420) {
      const n = pop();
      if (closed.has(n.id)) continue;
      closed.add(n.id); visited++;
      if (h(n.id) < h(best)) best = n.id;
      if (n.id === goal) { best = goal; break; }
      const x = n.id % W, y = Math.floor(n.id / W);
      const neighbours = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
      for (const [nx, ny] of neighbours) {
        if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) continue;
        const id = ny * W + nx, t = s.tiles[id];
        if (t === 3 || t === 4 || t === 5 || t === 8 || t === 9 || closed.has(id)) continue;
        const b = structureAt(s, nx, ny), cost = t === 6 ? 2.8 : b && b.type === 'barricade' ? 4 : 1;
        const score = n.g + cost;
        if (score >= (scores.get(id) === undefined ? Infinity : scores.get(id))) continue;
        parents.set(id, n.id); scores.set(id, score); push(id, score);
      }
    }
    s.stats.pathNodes += visited;
    const path = [];
    for (let id = best, limit = 0; id !== start && parents.has(id) && limit < 128; id = parents.get(id), limit++) {
      path.push({ x: (id % W + 0.5) * TILE, y: (Math.floor(id / W) + 0.5) * TILE });
    }
    path.reverse();
    return path;
  }
  function think(s, z) {
    s.stats.aiUpdates++;
    const p = s.player, distance = dist2(z.x, z.y, p.x, p.y);
    const vision = p.resting ? 190 : (s.time >= 19 || s.time < 6 ? 225 : 260);
    const sneakFactor = p._sneaking ? 0.62 : 1;
    const sees = distance < (vision * sneakFactor) ** 2 && hasLOS(s, z.x, z.y, p.x, p.y);
    if (sees) {
      z.state = 'chase'; z._targetX = p.x; z._targetY = p.y; z._lastSeen = s.elapsed;
      if (walkRay(s, z.x, z.y, p.x, p.y)) { z._path.length = 0; return; }
    }
    let heard = null, strongest = 0;
    for (const n of s.noises) {
      const distanceToNoise = Math.sqrt(dist2(z.x, z.y, n.x, n.y));
      const strength = n.radius - distanceToNoise;
      if (strength > strongest) { strongest = strength; heard = n; }
    }
    if (heard && (z.state !== 'chase' || s.elapsed - z._lastSeen > 2)) {
      z.state = 'investigate'; z._targetX = heard.x; z._targetY = heard.y; z._wanderClock = 4;
    } else if (z.state === 'chase' && s.elapsed - z._lastSeen > 4) {
      z.state = 'investigate'; z._wanderClock = 3;
    }
    if (z.state === 'attack') z.state = 'investigate';
    if (z.state === 'investigate' && dist2(z.x, z.y, z._targetX, z._targetY) < 30 ** 2) {
      z._wanderClock -= 0.5;
      if (z._wanderClock <= 0) { z.state = 'wander'; z._wanderClock = 0; }
    }
    if (z.state === 'wander' && z._wanderClock <= 0) {
      for (let i = 0; i < 8; i++) {
        const x = clamp(z.x + (random(s) - 0.5) * 250, 48, s.width * TILE - 48);
        const y = clamp(z.y + (random(s) - 0.5) * 250, 48, s.height * TILE - 48);
        if (clearCircle(s, x, y, 11)) { z._targetX = x; z._targetY = y; break; }
      }
      z._wanderClock = 3 + random(s) * 6;
      z._pathClock = 0;
    }
    if (z._pathClock <= 0 && dist2(z.x, z.y, z._targetX, z._targetY) > 18 ** 2) {
      z._path = route(s, z, z._targetX, z._targetY); z._pathClock = 1.2 + random(s) * 0.6;
    }
  }
  function damageObstacle(s, z, aheadX, aheadY, dt) {
    const tx = Math.floor(aheadX / TILE), ty = Math.floor(aheadY / TILE), id = tileIndex(s, tx, ty);
    const b = structureAt(s, tx, ty);
    if (s.tiles[id] !== 6 && (!b || b.type !== 'barricade')) { z._blockedTimer = 0; return; }
    z._blockedTimer += dt;
    if (z._blockedTimer < 1.1) return;
    z._blockedTimer = 0;
    particles(s, (tx + 0.5) * TILE, (ty + 0.5) * TILE, 3, '#b99560');
    if (b && b.type === 'barricade') {
      b.health = Math.max(0, b.health - 20);
      if (b.health <= 0) { s.structures.splice(s.structures.indexOf(b), 1); log(s, 'A barricade has broken.', 'warn'); }
    } else {
      s._doorHealth[id] = (s._doorHealth[id] || 65) - 20;
      if (s._doorHealth[id] <= 0) { s.tiles[id] = 7; s._doorHealth[id] = 0; noise(s, z.x, z.y, 100, 1); }
    }
  }
  function hitPlayer(s, z) {
    const p = s.player;
    if (p.invulnerable > 0) return;
    if (p.vehicleId) {
      const vehicle = (s.vehicles || []).find(v => v.id === p.vehicleId);
      if (vehicle && vehicle.condition > 0) { vehicle.condition = Math.max(0, vehicle.condition - 2.5); p.invulnerable = 0.8; log(s, 'A zombie is battering the vehicle. Drive clear or get out when safe.', 'warn'); return; }
    }
    const armorId = p.equipment && p.equipment.clothing, armor = clamp(finite(items[armorId] && items[armorId].armor, 0), 0, 0.75);
    p.health = Math.max(0, p.health - DIFFICULTIES[s.difficulty].damage * (1 - armor));
    p.invulnerable = 0.85; p.bleeding = Math.min(3, p.bleeding + 0.6); p.resting = false;
    if (random(s) < 0.17 * (1 - armor)) p.infection = Math.max(p.infection, 0.5);
    particles(s, p.x, p.y, 7, '#ce8976'); noise(s, p.x, p.y, 80, 0.8);
    log(s, p.bleeding > 0 ? 'You were bitten. Use a bandage to stop bleeding.' : 'You were bitten.', 'danger');
  }
  function updateZombie(s, z, dt) {
    z._stun = Math.max(0, z._stun - dt); z._attackCooldown = Math.max(0, z._attackCooldown - dt);
    z._pathClock -= dt; z._wanderClock -= dt;
    if (z._stun > 0) { z.windup = 0; return; }
    const p = s.player, d = Math.sqrt(dist2(z.x, z.y, p.x, p.y));
    if (d < 37 && hasLOS(s, z.x, z.y, p.x, p.y) && z._attackCooldown <= 0) {
      z.state = 'attack'; z.angle = Math.atan2(p.y - z.y, p.x - z.x); z.windup += dt;
      if (z.windup >= 0.72) {
        if (d < 40) hitPlayer(s, z);
        z.windup = 0; z._attackCooldown = 1.25;
      }
      return;
    }
    z.windup = 0;
    let tx = z._targetX, ty = z._targetY;
    while (z._path.length && dist2(z.x, z.y, z._path[0].x, z._path[0].y) < 9 ** 2) z._path.shift();
    if (z._path.length) { tx = z._path[0].x; ty = z._path[0].y; }
    const dx = tx - z.x, dy = ty - z.y, length = Math.hypot(dx, dy);
    if (length < 8) return;
    z.angle = Math.atan2(dy, dx);
    const speed = DIFFICULTIES[s.difficulty].speed * (z.state === 'wander' ? 0.55 : 1) * (s.time >= 19 || s.time < 6 ? 1.08 : 1);
    const step = Math.min(length, speed * dt), mx = dx / length * step, my = dy / length * step;
    const moved = move(s, z, mx, my, 10);
    if (!moved || !clearCircle(s, z.x + dx / length * 17, z.y + dy / length * 17, 10)) {
      damageObstacle(s, z, z.x + dx / length * 22, z.y + dy / length * 22, dt);
      if (z._blockedTimer === 0) z._pathClock = Math.min(z._pathClock, 0.1);
    } else z._blockedTimer = 0;
  }
  function spawnWave(s) {
    const count = DIFFICULTIES[s.difficulty].wave;
    for (let i = 0, attempts = 0; i < count && attempts < 120; attempts++) {
      const angle = random(s) * Math.PI * 2, r = 390 + random(s) * 150;
      const x = s.goal.radioX + Math.cos(angle) * r, y = s.goal.radioY + Math.sin(angle) * r;
      const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
      if (tx < 2 || ty < 2 || tx >= s.width - 2 || ty >= s.height - 2) continue;
      if (!clearCircle(s, x, y, 12) || s.tiles[ty * s.width + tx] === 2 || dist2(x, y, s.player.x, s.player.y) < 280 ** 2) continue;
      const z = newZombie(s, x, y); z.state = 'investigate'; z._targetX = s.goal.radioX; z._targetY = s.goal.radioY;
      z._wanderClock = 8; s.zombies.push(z); i++;
    }
    log(s, 'The radio is drawing another group toward the tower.', 'warn');
  }
  function update(s, dt, input) {
    if (!s || s.ended) return;
    dt = clamp(finite(dt, 0), 0, 0.05);
    if (dt === 0) return;
    input = input && typeof input === 'object' ? input : {};
    const p = s.player, d = DIFFICULTIES[s.difficulty];
    s.stats.ticks++; s.elapsed += dt; s.time += dt / 45;
    if (s.time >= 24) { s.time -= 24; s.day++; s.weather = ['clear', 'overcast', 'rain'][Math.floor(random(s) * 3)]; }
    p.cooldown = Math.max(0, p.cooldown - dt); p.invulnerable = Math.max(0, p.invulnerable - dt);
    let mx = clamp(finite(input.moveX, 0), -1, 1), my = clamp(finite(input.moveY, 0), -1, 1);
    const length = Math.hypot(mx, my);
    if (length > 1) { mx /= length; my /= length; }
    const moving = length > 0.01;
    p._sneaking = !!input.sneak;
    const sprint = !!input.sprint && moving && !p._sneaking && p.stamina > 2;
    if (moving || input.attack || input.shoot) p.resting = false;
    let speed = 98 * (sprint ? 1.57 : p._sneaking ? 0.59 : 1);
    if (p.health < 30) speed *= 0.87;
    if (p.resting) speed = 0;
    const driving = !!(Sirens.Vehicles && Sirens.Vehicles.update(s, dt, input));
    if (!driving) move(s, p, mx * speed * dt, my * speed * dt, 10);
    const shift = s.world && !(s.stories && s.stories.floor > 0) ? Sirens.World.maybeRecenter(s) : { shiftX: 0, shiftY: 0 };
    if (shift.blocked) log(s, shift.blocked, 'warn');
    const ax = clamp(finite(input.aimX, p.x + Math.cos(p.angle) * 80 + shift.shiftX) - shift.shiftX, 0, s.width * TILE);
    const ay = clamp(finite(input.aimY, p.y + Math.sin(p.angle) * 80 + shift.shiftY) - shift.shiftY, 0, s.height * TILE);
    if (dist2(p.x, p.y, ax, ay) > 1) p.angle = Math.atan2(ay - p.y, ax - p.x);
    if (sprint) p.stamina = Math.max(0, p.stamina - 12.5 * dt);
    else p.stamina = Math.min(100, p.stamina + (p.resting ? 21 : moving ? 7 : 13) * dt);
    s._noiseClock = Math.max(0, s._noiseClock - dt);
    if (sprint && s._noiseClock <= 0) { noise(s, p.x, p.y, 170, 1.2); s._noiseClock = 0.55; }
    if (input.attack && !driving) attack(s, ax, ay, weaponInfo(p.weapon).kind === 'firearm' ? 'pistol' : 'melee');
    if (input.shoot && !driving) attack(s, ax, ay, 'pistol');
    p.hunger = Math.min(100, p.hunger + dt * 0.065 * d.drain * (sprint ? 1.25 : 1));
    p.thirst = Math.min(100, p.thirst + dt * 0.115 * d.drain * (sprint ? 1.35 : 1));
    if (p.infection > 0) p.infection = Math.min(100, p.infection + dt * 0.018 * d.drain);
    p.health = Math.max(0, p.health - dt * (p.bleeding * 0.045 + (p.hunger >= 95 ? 0.12 : 0) + (p.thirst >= 95 ? 0.2 : 0) + (p.infection >= 65 ? 0.08 : 0)));
    if (p.resting && p.bleeding === 0 && p.hunger < 80 && p.thirst < 80) {
      const byFire = s.structures.some(b => b.type === 'campfire' && dist2(b.x, b.y, p.x, p.y) < 100 ** 2);
      p.health = Math.min(100, p.health + dt * (byFire ? 0.8 : 0.28));
    }
    for (let i = s.noises.length - 1; i >= 0; i--) { s.noises[i].life -= dt; if (s.noises[i].life <= 0) s.noises.splice(i, 1); }
    s._aiClock += dt;
    if (s._aiClock >= 0.12) {
      s._aiClock -= 0.12;
      const count = Math.min(8, s.zombies.length);
      for (let i = 0; i < count; i++) {
        s._aiCursor %= s.zombies.length;
        const z = s.zombies[s._aiCursor++];
        if (z.health > 0 && (!s.world || dist2(z.x, z.y, p.x, p.y) < 1100 ** 2)) think(s, z);
      }
    }
    for (const z of s.zombies) if (z.health > 0 && (!s.world || dist2(z.x, z.y, p.x, p.y) < 1100 ** 2)) updateZombie(s, z, dt);
    if (Sirens.Actors) Sirens.Actors.update(s, dt, input);
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const pt = s.particles[i]; pt.life -= dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vx *= 0.97; pt.vy *= 0.97;
      if (pt.life <= 0) s.particles.splice(i, 1);
    }
    s._exploreClock += dt;
    if (s._exploreClock >= 0.2) { s._exploreClock = 0; reveal(s); }
    if (p.health <= 0 || p.infection >= 100) {
      s.ended = true; s.won = false; log(s, 'Your signal fell silent. A fresh start awaits.', 'danger'); return;
    }
    if (s.goal.active && !s.goal.complete) {
      s.goal.countdown = Math.max(0, s.goal.countdown - dt); s._waveClock = Math.min(35, s._waveClock + dt); s._radioNoiseClock += dt;
      const upstairs = s.stories && s.stories.floor > 0;
      if (s._radioNoiseClock >= 4) { s._radioNoiseClock = 0; if (!upstairs) noise(s, s.goal.radioX, s.goal.radioY, 720, 3); }
      if (s._waveClock >= 35 && s.zombies.length < (s.world ? 168 : 76)) { s._waveClock = 0; if (!upstairs) spawnWave(s); }
      if (s.goal.countdown <= 0) {
        s.goal.complete = true; s.goal.active = false; s.ended = !s.world; s.won = !s.world;
        log(s, s.world ? 'Signal received. The radio mission is complete. Free survival continues: explore and build your shelter.' : 'Signal received. The rescue convoy is on its way. You survived!', 'good');
      }
    }
  }

  function nearestInteraction(s) {
    if (s.ended) return null;
    const p = s.player, range2 = 70 ** 2, candidates = [];
    const rd = dist2(p.x, p.y, s.goal.radioX, s.goal.radioY);
    if (!(s.stories && s.stories.floor > 0) && rd <= range2 && hasLOS(s, p.x, p.y, s.goal.radioX, s.goal.radioY)) candidates.push({ type: 'radio', d: rd, label: s.goal.complete ? 'Radio mission complete' : s.goal.active ? 'Radio transmitting: ' + Math.ceil(s.goal.countdown) + 's' : 'Repair emergency radio (' + s.goal.parts + '/5 parts)' });
    for (const c of s.containers) {
      const d = dist2(p.x, p.y, c.x, c.y);
      if (d <= range2 && !c.looted && hasLOS(s, p.x, p.y, c.x, c.y)) candidates.push({ type: 'container', value: c, d, label: 'Collect ' + c.label });
    }
    const tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE);
    for (let y = Math.max(0, ty - 3); y <= Math.min(s.height - 1, ty + 3); y++) for (let x = Math.max(0, tx - 3); x <= Math.min(s.width - 1, tx + 3); x++) {
      const id = tileIndex(s, x, y), t = s.tiles[id];
      if (t !== 6 && t !== 7 && t !== 8 && t !== 9) continue;
      const xx = (x + 0.5) * TILE, yy = (y + 0.5) * TILE, distance = Math.sqrt(dist2(p.x, p.y, xx, yy));
      if (distance > 70) continue;
      const f = distance > 0 ? Math.max(0, distance - 22) / distance : 0;
      if (!hasLOS(s, p.x, p.y, p.x + (xx - p.x) * f, p.y + (yy - p.y) * f)) continue;
      if ((t === 8 || t === 9) && Sirens.Destruction) {
        candidates.push({ type: 'window', value: id, tx: x, ty: y, d: distance * distance, label: s.stories && s.stories.floor > 0 ? 'Upper window: use stairs to descend' : t === 8 ? 'Open and climb window' : s._terrainHealth[id] === 0 ? 'Climb broken window, watch the glass' : 'Climb open window' });
      } else if (!(s._doorHealth[id] <= 0)) candidates.push({ type: 'door', value: id, x: xx, y: yy, d: distance * distance, label: t === 6 ? 'Open door' : 'Close door' });
    }
    candidates.sort((a, b) => a.d - b.d || (a.value && a.value._ground ? -1 : 0) - (b.value && b.value._ground ? -1 : 0));
    return candidates[0] || null;
  }
  function nearby(s) {
    const n = nearestInteraction(s), stairs = Sirens.Stories && Sirens.Stories.nearby(s);
    if (stairs) {
      const b = Sirens.Stories.currentBuilding(s), d = dist2(s.player.x, s.player.y, (b.stairs.x + 0.5) * TILE, (b.stairs.y + 0.5) * TILE);
      if (!n || n.type !== 'window' || n.d >= d) return stairs;
    }
    const human = Sirens.Actors && Sirens.Actors.nearby(s), car = Sirens.Vehicles && Sirens.Vehicles.nearby(s);
    if (human && (!n || n.d > 45 ** 2)) return human;
    return car && (!n || n.d > 45 ** 2) ? car : n ? n.label : '';
  }
  function interact(s) {
    const n = nearestInteraction(s);
    const stairs = Sirens.Stories && Sirens.Stories.nearby(s);
    if (stairs) {
      const b = Sirens.Stories.currentBuilding(s), d = dist2(s.player.x, s.player.y, (b.stairs.x + 0.5) * TILE, (b.stairs.y + 0.5) * TILE);
      if (!n || n.type !== 'window' || n.d >= d) return Sirens.Stories.go(s, s.stories.floor + 1 < b.floors ? 1 : -1);
    }
    if (Sirens.Actors && Sirens.Actors.nearby(s) && (!n || n.d > 45 ** 2)) return Sirens.Actors.interact(s);
    if (Sirens.Vehicles && Sirens.Vehicles.nearby(s) && (!n || n.d > 45 ** 2)) return Sirens.Vehicles.toggle(s);
    if (!n) return false;
    const p = s.player;
    if (n.type === 'window') return !!(Sirens.Destruction && Sirens.Destruction.climb(s, n.tx, n.ty));
    if (n.type === 'door') {
      if (s.tiles[n.value] === 7 && (dist2(p.x, p.y, n.x, n.y) < 27 ** 2 || s.zombies.some(z => dist2(z.x, z.y, n.x, n.y) < 26 ** 2))) {
        log(s, 'The doorway is occupied. Step clear before closing it.', 'warn'); return false;
      }
      s.tiles[n.value] = s.tiles[n.value] === 6 ? 7 : 6; noise(s, n.x, n.y, 55, 0.5); return true;
    }
    if (n.type === 'radio') {
      if (s.goal.complete) { log(s, 'The radio mission is complete. Free survival continues.', 'info'); return true; }
      if (s.goal.active) { log(s, 'Signal transmitting. Survive ' + Math.ceil(s.goal.countdown) + ' more seconds.', 'info'); return true; }
      const count = Math.min(5 - s.goal.parts, p.inventory.parts || 0);
      if (!count) { log(s, 'You need radio parts. Search the workshop, shed, clinic, and other named buildings.', 'warn'); return false; }
      p.inventory.parts -= count; s.goal.parts += count;
      if (!p.inventory.parts) delete p.inventory.parts;
      if (s.goal.parts >= 5) {
        s.goal.active = true; s.goal.countdown = SIGNAL_TIME; s._waveClock = 10; s._radioNoiseClock = 0;
        noise(s, s.goal.radioX, s.goal.radioY, 850, 4);
        log(s, 'Radio repaired! Survive 2 minutes 30 seconds while the rescue signal transmits. Stay mobile.', 'good');
      } else log(s, 'Installed ' + count + ' radio part' + (count === 1 ? '' : 's') + '. ' + s.goal.parts + '/5 ready.', 'good');
      return true;
    }
    const c = n.value, took = [], skipped = [];
    // Parts and essential supplies take priority over heavy construction material.
    const priority = id => id === 'parts' ? -100 : ['bandage', 'water', 'food', 'ammo'].includes(id) ? ['bandage', 'water', 'food', 'ammo'].indexOf(id) : id === 'wood' ? 20 : id === 'scrap' ? 15 : 10;
    const ids = Object.keys(c.items).sort((a, b) => priority(a) - priority(b));
    for (const id of ids) {
      const available = c.items[id] || 0;
      if (!available) continue;
      // Reserve a little space for the remaining mission parts, so heavy loot cannot block the objective.
      const reserved = id === 'parts' ? 0 : Math.max(0, 5 - s.goal.parts - (p.inventory.parts || 0)) * items.parts.weight;
      const room = carryCapacity(s) - weight(p.inventory) - reserved;
      const count = Math.min(available, Math.max(0, items[id].weight === 0 ? available : Math.floor((room + 0.00001) / items[id].weight)));
      if (count) { p.inventory[id] = (p.inventory[id] || 0) + count; c.items[id] -= count; took.push(count + ' ' + items[id].name.toLowerCase()); }
      if (!c.items[id]) delete c.items[id]; else skipped.push(items[id].name.toLowerCase());
    }
    c.looted = Object.keys(c.items).length === 0;
    if (took.length) log(s, 'Collected ' + took.join(', ') + '.', 'good');
    if (skipped.length) log(s, 'Pack is nearly full (' + weight(p.inventory).toFixed(1) + '/' + carryCapacity(s) + '). Left ' + skipped.join(', ') + ' here. Room for mission parts stays reserved. Use, drop, craft, or build to make space.', 'warn');
    return took.length > 0;
  }
  function attack(s, aimX, aimY, mode) {
    if (!s || s.ended) return false;
    const p = s.player;
    if (p.cooldown > 0) return false;
    mode = mode || 'melee';
    if (mode !== 'melee' && mode !== 'pistol' && mode !== 'shoot') return false;
    const actualWeapon = mode === 'melee' ? weaponInfo(p.weapon).kind === 'melee' ? p.weapon : 'bat' : weaponInfo(p.weapon).kind === 'firearm' ? p.weapon : 'pistol';
    if (Sirens.Catalog && !(p.inventory[actualWeapon] > 0) && !(p.legacyGear && ['bat', 'pistol'].includes(actualWeapon))) {
      p.cooldown = 0.35; log(s, 'Equip an owned weapon from your pack before attacking.', 'warn'); return false;
    }
    aimX = clamp(finite(aimX, p.x + Math.cos(p.angle) * 80), 0, s.width * TILE);
    aimY = clamp(finite(aimY, p.y + Math.sin(p.angle) * 80), 0, s.height * TILE);
    let dx = aimX - p.x, dy = aimY - p.y, length = Math.hypot(dx, dy);
    if (length < 1) { dx = Math.cos(p.angle); dy = Math.sin(p.angle); length = 1; }
    dx /= length; dy /= length; p.angle = Math.atan2(dy, dx); p.resting = false;
    if (mode === 'melee') {
      const weapon = weaponInfo(p.weapon), w = weapon.kind === 'melee' ? weapon : weaponInfo('bat');
      if (p.stamina < w.staminaCost) { p.cooldown = 0.35; log(s, 'Catch your breath before swinging again.', 'warn'); return false; }
      p.stamina = Math.max(0, p.stamina - w.staminaCost); p.cooldown = w.cooldown;
      noise(s, p.x, p.y, w.noise, 1); particles(s, p.x + dx * 40, p.y + dy * 40, 5, '#dedab2');
      const targets = s.zombies.concat(Sirens.Actors ? (s.humans || []).filter(h => h.health > 0) : []).filter(z => {
        const zd = Math.hypot(z.x - p.x, z.y - p.y);
        return zd <= w.range && zd > 0 && ((z.x - p.x) * dx + (z.y - p.y) * dy) / zd > 0.15 && hasLOS(s, p.x, p.y, z.x, z.y);
      }).sort((a, b) => dist2(p.x, p.y, a.x, a.y) - dist2(p.x, p.y, b.x, b.y)).slice(0, 3);
      for (const z of targets) {
        if (z.faction && Sirens.Actors) Sirens.Actors.hit(s, z, w.damage, true);
        else { z.health -= w.damage; z._stun = 0.38; z.windup = 0; }
        const zd = Math.hypot(z.x - p.x, z.y - p.y) || 1;
        move(s, z, (z.x - p.x) / zd * 16, (z.y - p.y) / zd * 16, 10);
        particles(s, z.x, z.y, 5, '#8da487');
      }
      if (Sirens.Destruction) Sirens.Destruction.hit(s, aimX, aimY, actualWeapon);
    } else {
      const id = weaponInfo(p.weapon).kind === 'firearm' ? p.weapon : 'pistol', w = weaponInfo(id);
      p.magazines = p.magazines || { pistol: p.ammo };
      const loaded = p.ammo;
      if (loaded <= 0) { p.cooldown = 0.35; log(s, 'Empty magazine. Press R to reload from reserve rounds.', 'warn'); return false; }
      p.magazines[id] = loaded - 1; p.ammo = loaded - 1; p.stamina = Math.max(0, p.stamina - finite(w.staminaCost, 0)); p.cooldown = w.cooldown; noise(s, p.x, p.y, w.noise, 2.4);
      particles(s, p.x + dx * 18, p.y + dy * 18, 5, '#f6cb70');
      let target = null, nearest = w.range;
      for (const z of s.zombies.concat(Sirens.Actors ? (s.humans || []).filter(h => h.health > 0) : [])) {
        const rx = z.x - p.x, ry = z.y - p.y, along = rx * dx + ry * dy, side = Math.abs(rx * dy - ry * dx);
        if (along >= 0 && along < nearest && side < 18 && hasLOS(s, p.x, p.y, z.x, z.y)) { target = z; nearest = along; }
      }
      if (target) {
        if (target.faction && Sirens.Actors) Sirens.Actors.hit(s, target, w.damage, true);
        else { target.health -= w.damage; target._stun = 0.7; target.windup = 0; }
        particles(s, target.x, target.y, 9, '#a5b496');
      }
    }
    for (let i = s.zombies.length - 1; i >= 0; i--) {
      if (s.zombies[i].health <= 0) { particles(s, s.zombies[i].x, s.zombies[i].y, 10, '#729177'); s.zombies.splice(i, 1); p.kills++; }
    }
    return true;
  }
  function action(s, name) {
    if (!s || s.ended) return false;
    const p = s.player, inv = p.inventory;
    function consume(id) {
      if (!(inv[id] > 0)) { log(s, 'No ' + items[id].name.toLowerCase() + ' in your pack.', 'warn'); return false; }
      inv[id]--; if (!inv[id]) delete inv[id]; return true;
    }
    if (typeof name !== 'string' || name.length > 120) return false;
    if (name === 'climb' || name === 'window') return !!(Sirens.Destruction && Sirens.Destruction.climb(s));
    if (name === 'stairsUp' || name === 'stairsDown') return !!(Sirens.Stories && Sirens.Stories.go(s, name === 'stairsUp' ? 1 : -1));
    if (Sirens.Actors && ['trade', 'recruit', 'dismiss', 'closeConversation'].includes(name)) return Sirens.Actors.action(s, name);
    if (name === 'vehicle') return !!(Sirens.Vehicles && Sirens.Vehicles.toggle(s));
    if (name === 'refuel') return !!(Sirens.Vehicles && Sirens.Vehicles.refuel(s));
    if (name.startsWith('equip:')) {
      const id = name.slice(6), item = items[id];
      if (!item || !(inv[id] > 0)) return false;
      p.equipment = p.equipment || { weapon: p.weapon, clothing: null, backpack: null };
      if (item.weapon) setWeapon(s, id);
      else if (item.capacity > 0) {
        if (weight(inv) > CAPACITY + item.capacity + 0.00001) { log(s, 'Drop some weight before switching to a smaller pack.', 'warn'); return false; }
        p.equipment.backpack = id;
      } else if (item.category === 'clothing' || item.armor > 0) p.equipment.clothing = id;
      else { log(s, item.name + ' is a supply or crafting tool, not wearable equipment.', 'info'); return false; }
      log(s, 'Equipped ' + item.name + '.', 'good'); return true;
    }
    if (name.startsWith('drop:')) {
      const id = name.slice(5), item = items[id];
      if (!item || !(inv[id] > 0) || p.vehicleId) return false;
      if (s.buildings.some(b => b.stairs && dist2(p.x, p.y, (b.stairs.x + 0.5) * TILE, (b.stairs.y + 0.5) * TILE) < 35 ** 2)) {
        log(s, 'Step away from the stairs before dropping supplies.', 'info'); return false;
      }
      if (p.equipment && p.equipment.backpack === id && inv[id] === 1 && weight(inv) - item.weight > CAPACITY + 0.00001) {
        log(s, 'Drop heavy supplies before dropping your equipped pack.', 'warn'); return false;
      }
      let pile = s.containers.find(c => c._ground && dist2(c.x, c.y, p.x, p.y) < 28 ** 2);
      if (!pile) {
        if (s.containers.filter(c => c._ground).length >= 60) { log(s, 'Drop beside an existing supplies pile; this sector window has many piles already.', 'warn'); return false; }
        pile = { id: 'drop:' + s.seed + ':' + s._nextGroundId++, x: p.x, y: p.y, label: 'Dropped supplies', items: {}, looted: false, _ground: true };
        s.containers.push(pile);
      }
      if ((pile.items[id] || 0) >= 1000) return false;
      inv[id]--; if (!inv[id]) delete inv[id]; pile.items[id] = (pile.items[id] || 0) + 1; pile.looted = false;
      if (p.equipment && !inv[id]) {
        if (p.equipment.weapon === id) setWeapon(s, inv.bat ? 'bat' : 'bat');
        if (p.equipment.clothing === id) p.equipment.clothing = null;
        if (p.equipment.backpack === id) p.equipment.backpack = null;
      }
      log(s, 'Dropped ' + item.name + '. You can collect it again here.', 'info'); return true;
    }
    if (name.startsWith('use:')) {
      const id = name.slice(4), item = items[id];
      if (!item || !(inv[id] > 0)) return false;
      const fuel = finite(item.fuel, finite(item.effect && item.effect.fuel, 0));
      if (fuel > 0 && Sirens.Vehicles) return Sirens.Vehicles.refuel(s, id);
      if (!item.effect) { log(s, item.name + ' is equipment or a crafting ingredient.', 'info'); return false; }
      const effect = item.effect;
      for (const field of ['hunger', 'thirst', 'infection']) p[field] = clamp(p[field] - finite(effect[field], 0), 0, 100);
      p.health = clamp(p.health + finite(effect.health, 0), 0, 100); p.stamina = clamp(p.stamina + finite(effect.stamina, 0), 0, 100);
      p.bleeding = clamp(p.bleeding - finite(effect.bleeding, 0) * 0.03, 0, 3);
      if (item.consume !== false) consume(id);
      log(s, 'Used ' + item.name + '.', 'good'); return true;
    }
    if (['eat', 'drink', 'bandage'].includes(name) && Sirens.Catalog) {
      const field = name === 'eat' ? 'hunger' : name === 'drink' ? 'thirst' : 'bleeding';
      if (field !== 'bleeding' && p[field] < 5 || field === 'bleeding' && p.bleeding === 0 && p.health >= 98) return false;
      const preferred = name === 'eat' ? 'food' : name === 'drink' ? 'water' : 'bandage';
      const candidates = Object.keys(inv).filter(id => inv[id] > 0 && items[id] && items[id].effect && items[id].effect[field] > 0);
      candidates.sort((a, b) => a === preferred ? -1 : b === preferred ? 1 : items[b].effect[field] - items[a].effect[field]);
      if (!candidates.length) { log(s, 'No suitable ' + (name === 'eat' ? 'food' : name === 'drink' ? 'drink' : 'dressing') + ' in your pack.', 'warn'); return false; }
      return action(s, 'use:' + candidates[0]);
    }
    if (name === 'eat') {
      if (p.hunger < 5) { log(s, 'You are already well fed.', 'info'); return false; }
      if (!consume('food')) return false;
      p.hunger = Math.max(0, p.hunger - 38); log(s, 'A ration eases your hunger.', 'good'); return true;
    }
    if (name === 'drink') {
      if (p.thirst < 5) { log(s, 'You are already hydrated.', 'info'); return false; }
      if (!consume('water')) return false;
      p.thirst = Math.max(0, p.thirst - 45); log(s, 'You drink clean water.', 'good'); return true;
    }
    if (name === 'bandage') {
      if (!p.bleeding && p.health >= 98) { log(s, 'You do not need a bandage right now.', 'info'); return false; }
      if (!consume('bandage')) return false;
      p.bleeding = 0; p.health = Math.min(100, p.health + 8); log(s, 'Bleeding stopped. Rest to recover more health.', 'good'); return true;
    }
    if (name === 'reload') {
      const id = weaponInfo(p.weapon).kind === 'firearm' ? p.weapon : 'pistol', w = weaponInfo(id), ammoId = w.ammoId || 'ammo';
      p.magazines = p.magazines || { pistol: p.ammo };
      const loaded = p.ammo;
      if (loaded >= w.clipSize) { log(s, 'Magazine is full.', 'info'); return false; }
      const rounds = Math.min(w.clipSize - loaded, inv[ammoId] || 0);
      if (!rounds) { log(s, 'No reserve rounds. Search for ammunition or recover rounds from salvage.', 'warn'); return false; }
      p.ammo = loaded + rounds; p.magazines[id] = p.ammo; inv[ammoId] -= rounds; if (!inv[ammoId]) delete inv[ammoId];
      p.cooldown = Math.max(p.cooldown, 0.85); log(s, 'Reloaded ' + rounds + ' rounds.', 'good'); return true;
    }
    if (name === 'rest') {
      p.resting = !p.resting;
      log(s, p.resting ? 'Resting. Stamina and health recover while you stay still. A nearby campfire heals faster.' : 'You stand ready.', 'info'); return true;
    }
    if (name === 'switchWeapon') {
      const id = weaponInfo(p.weapon).kind === 'melee' ? 'pistol' : 'bat';
      if (Sirens.Catalog && !inv[id] && !p.legacyGear) { log(s, 'The ' + id + ' is no longer in your pack. Equip another owned weapon in Inventory.', 'warn'); return false; }
      setWeapon(s, id); log(s, id === 'bat' ? 'Bat ready. Quiet swings save ammunition.' : 'Pistol ready. Shots draw attention.', 'info'); return true;
    }
    return false;
  }
  function canAfford(inv, cost) { return Object.keys(cost).every(id => (inv[id] || 0) >= cost[id]); }
  function pay(inv, cost) { Object.keys(cost).forEach(id => { inv[id] -= cost[id]; if (!inv[id]) delete inv[id]; }); }
  function canCraft(s, recipeId) {
    const r = typeof recipeId === 'object' ? recipeId : recipes.find(r => r.id === recipeId);
    if (!r || !s || s.ended || !canAfford(s.player.inventory, r.cost)) return false;
    if (r.tools && !r.tools.every(id => (s.player.inventory[id] || 0) > 0)) return false;
    if ((r.station === 'campfire' || r.id === 'collect_water') && !s.structures.some(b => b.type === 'campfire' && dist2(b.x, b.y, s.player.x, s.player.y) <= 100 ** 2)) return false;
    return true;
  }
  function craft(s, recipeId) {
    if (!s || s.ended) return false;
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return false;
    const inv = s.player.inventory;
    if (!canAfford(inv, recipe.cost)) { log(s, 'You do not have the supplies for ' + recipe.name.toLowerCase() + '.', 'warn'); return false; }
    if (recipe.tools && !recipe.tools.every(id => inv[id] > 0)) { log(s, 'Keep the required tools or reference books in your pack to craft this recipe.', 'warn'); return false; }
    if ((recipe.station === 'campfire' || recipeId === 'collect_water') && !s.structures.some(b => b.type === 'campfire' && dist2(b.x, b.y, s.player.x, s.player.y) <= 100 ** 2)) {
      log(s, 'Collect clean water beside a campfire. Build one with four wood and one salvage.', 'warn'); return false;
    }
    const next = Object.assign({}, inv);
    pay(next, recipe.cost);
    Object.keys(recipe.result).forEach(id => { next[id] = (next[id] || 0) + recipe.result[id]; });
    const equipment = s.player.equipment;
    const resultingCapacity = equipment && equipment.backpack && !next[equipment.backpack] ? CAPACITY : carryCapacity(s);
    if (weight(next) > resultingCapacity + 0.00001) { log(s, 'Make room in your pack before crafting.', 'warn'); return false; }
    s.player.inventory = next;
    if (equipment) {
      if (equipment.weapon && inv[equipment.weapon] && !next[equipment.weapon]) setWeapon(s, Object.keys(recipe.result).find(id => items[id].weapon) || 'bat');
      if (equipment.clothing && !next[equipment.clothing]) equipment.clothing = null;
      if (equipment.backpack && !next[equipment.backpack]) equipment.backpack = null;
    }
    log(s, 'Crafted ' + recipe.name.toLowerCase() + '.', 'good'); return true;
  }
  function build(s, type) {
    if (!s || s.ended || (type !== 'barricade' && type !== 'campfire')) return false;
    if (s.structures.length >= 60) { log(s, 'There are already enough structures in town.', 'warn'); return false; }
    const p = s.player, cost = type === 'barricade' ? { wood: 3, scrap: 1 } : { wood: 4, scrap: 1 };
    if (!canAfford(p.inventory, cost)) { log(s, 'A ' + type + ' needs ' + cost.wood + ' wood and 1 salvage.', 'warn'); return false; }
    let dx = Math.cos(p.angle), dy = Math.sin(p.angle);
    if (Math.abs(dx) >= Math.abs(dy)) { dx = Math.sign(dx); dy = 0; } else { dx = 0; dy = Math.sign(dy); }
    const tx = Math.floor(p.x / TILE) + dx, ty = Math.floor(p.y / TILE) + dy;
    const x = (tx + 0.5) * TILE, y = (ty + 0.5) * TILE, tile = s.tiles[ty * s.width + tx];
    if (s.buildings.some(b => b.stairs && b.stairs.x === tx && b.stairs.y === ty)) { log(s, 'Keep the staircase clear so every level stays accessible.', 'warn'); return false; }
    if (isSolid(s, tx, ty) || tile === 7 || structureAt(s, tx, ty) || dist2(p.x, p.y, x, y) < 25 ** 2 ||
      s.containers.some(c => !(c._ground && c.looted && !Object.values(c.items).some(n => n > 0)) && dist2(c.x, c.y, x, y) < 24 ** 2) || dist2(s.goal.radioX, s.goal.radioY, x, y) < 45 ** 2 ||
      s.zombies.some(z => dist2(z.x, z.y, x, y) < 26 ** 2)) {
      log(s, 'Aim toward a clear tile beside you to build. Keep doors, supplies, and the radio clear.', 'warn'); return false;
    }
    pay(p.inventory, cost); s.structures.push({ x, y, type, health: type === 'barricade' ? 140 : 100 });
    noise(s, x, y, type === 'barricade' ? 150 : 80, 1);
    log(s, type === 'barricade' ? 'Barricade built. It slows a group but can be broken.' : 'Campfire built. Rest nearby to heal faster and collect water.', 'good'); return true;
  }

  const coreKeys = ['seed', 'difficulty', 'player', 'day', 'time', 'elapsed', 'weather', 'logs', 'goal', 'ended', 'won', 'stats', '_rng', '_nextZombieId', '_nextGroundId', '_aiClock', '_aiCursor', '_exploreClock', '_noiseClock', '_waveClock', '_radioNoiseClock', 'noises', 'particles'];
  function serialize(s) {
    const ground = Sirens.Stories && Sirens.Stories.groundView ? Sirens.Stories.groundView(s) || s : s;
    if (!s.world) {
      const document = { version: 1, state: ground };
      if (Sirens.Stories && Sirens.Stories.serialize) document.stories = Sirens.Stories.serialize(s);
      return JSON.stringify(document);
    }
    const core = {}; coreKeys.forEach(k => { core[k] = s[k]; });
    const document = { version: 2, state: core, world: Sirens.World.exportWorld(ground) };
    document.order = { zombies: ground.zombies.map(z => z.id), humans: (ground.humans || []).map(h => h.id) };
    if (s._vehicleHits) document.vehicleHits = Object.fromEntries(Object.entries(s._vehicleHits).filter(e => e[1] > s.elapsed - 1));
    if (Sirens.Stories && Sirens.Stories.serialize) document.stories = Sirens.Stories.serialize(s);
    return JSON.stringify(document);
  }
  function deserialize(text) {
    if (typeof text !== 'string' || text.length > 32000000) throw new Error('Save must be a JSON text file smaller than 32 MB.');
    let document;
    try { document = JSON.parse(text); } catch (_) { throw new Error('This save is not valid JSON.'); }
    const fail = name => { throw new Error('Invalid save: ' + name + '.'); };
    function obj(value, name) { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(name + ' must be an object'); return value; }
    function num(value, lo, hi, name, integer) { if (typeof value !== 'number' || !Number.isFinite(value) || value < lo || value > hi || (integer && !Number.isInteger(value))) fail(name + ' is out of range'); return value; }
    function bool(value, name) { if (typeof value !== 'boolean') fail(name + ' must be true or false'); return value; }
    function str(value, max, name) { if (typeof value !== 'string' || value.length > max || value.length < 1) fail(name + ' is invalid'); return value; }
    function arr(value, max, name) { if (!Array.isArray(value) || value.length > max) fail(name + ' is too large or not an array'); return value; }
    function optionalNumber(o, key, lo, hi, fallback, integer) { return o[key] === undefined ? fallback : num(o[key], lo, hi, key, integer); }
    function inventory(value, name) {
      obj(value, name); const result = {};
      if (Object.keys(value).length > Object.keys(items).length) fail(name + ' has unknown items');
      for (const id of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(items, id)) fail(name + ' contains an unknown item');
        const count = num(value[id], 0, 1000, name + '.' + id, true); if (count) result[id] = count;
      }
      return result;
    }
    obj(document, 'save'); if (document.version !== 1 && document.version !== 2) fail('unsupported schema version');
    const openworld = document.version === 2, W = openworld ? 192 : SIZE, H = W;
    function point(o, name) { obj(o, name); return { x: num(o.x, 0, W * TILE, name + '.x'), y: num(o.y, 0, H * TILE, name + '.y') }; }
    let source = obj(document.state, 'state'), validatedWorld = null;
    if (openworld) {
      if (!Sirens.World) fail('world module is unavailable');
      validatedWorld = Sirens.World.validate(document.world, items);
      for (const field of coreKeys.slice(0, 12)) if (source[field] === undefined) fail('missing ' + field);
      if (source.seed !== validatedWorld.seed || source.difficulty !== validatedWorld.difficulty) fail('world seed or difficulty is inconsistent');
      const hydrated = create(validatedWorld.seed, validatedWorld.difficulty, 'rescue');
      const savedPosition = point(source.player, 'saved player'); hydrated.player.x = savedPosition.x; hydrated.player.y = savedPosition.y;
      Sirens.World.restore(hydrated, validatedWorld);
      coreKeys.forEach(k => { if (source[k] !== undefined) hydrated[k] = source[k]; });
      source = hydrated;
    }
    if (source.width !== W || source.height !== H || source.tileSize !== TILE) fail('world dimensions do not match this game');
    if (!Object.prototype.hasOwnProperty.call(DIFFICULTIES, source.difficulty)) fail('unknown difficulty');
    const s = {
      width: W, height: H, tileSize: TILE, seed: num(source.seed, 0, 4294967295, 'seed', true), difficulty: source.difficulty, mode: openworld ? 'openworld' : 'rescue',
      tiles: arr(source.tiles, W * H, 'tiles').map(t => num(t, 0, 9, 'tile', true)),
      buildings: [], containers: [], zombies: [], structures: [], particles: [], vehicles: [], humans: [], player: null,
      day: num(source.day, 1, 1000000, 'day', true), time: num(source.time, 0, 24, 'time'), elapsed: num(source.elapsed, 0, 100000000, 'elapsed'),
      weather: source.weather, noises: [], logs: [], goal: null,
      ended: bool(source.ended, 'ended'), won: bool(source.won, 'won'), stats: {},
      discovered: arr(source.discovered, W * H, 'discovered').map(t => bool(t, 'discovered tile')),
      _rng: optionalNumber(source, '_rng', 0, 4294967295, source.seed || 0x6d2b79f5, true), _doorHealth: {}, _terrainHealth: {},
      _nextZombieId: optionalNumber(source, '_nextZombieId', 1, 1000000, 1, true),
      _nextGroundId: optionalNumber(source, '_nextGroundId', 1, 10000000, 1, true),
      _aiClock: optionalNumber(source, '_aiClock', 0, 1, 0), _aiCursor: optionalNumber(source, '_aiCursor', 0, 1000000, 0, true),
      _exploreClock: optionalNumber(source, '_exploreClock', 0, 1, 0), _noiseClock: optionalNumber(source, '_noiseClock', -10, 2, 0),
      _waveClock: optionalNumber(source, '_waveClock', 0, 35, 0), _radioNoiseClock: optionalNumber(source, '_radioNoiseClock', 0, 4, 0)
    };
    if (openworld) s.world = validatedWorld;
    if (s.tiles.length !== W * H || s.discovered.length !== W * H) fail('world arrays must match the active window');
    if (!['clear', 'overcast', 'rain'].includes(s.weather)) fail('unknown weather');
    for (const b of arr(source.buildings, openworld ? 450 : 50, 'buildings')) {
      obj(b, 'building');
      const x = num(b.x, 1, W - 4, 'building.x', true), y = num(b.y, 1, H - 4, 'building.y', true);
      const w = num(b.w, 4, 40, 'building.w', true), h = num(b.h, 4, 40, 'building.h', true);
      if (x + w >= W || y + h >= H) fail('building extends outside the world');
      s.buildings.push({ x, y, w, h, name: str(b.name, 80, 'building.name') });
    }
    const containerIds = new Set();
    for (const c of arr(source.containers, openworld ? 1000 : 160, 'containers')) {
      const p = point(c, 'container'), id = str(c.id, 60, 'container.id');
      if (containerIds.has(id)) fail('duplicate container'); containerIds.add(id);
      const t = s.tiles[Math.floor(p.y / TILE) * W + Math.floor(p.x / TILE)];
      if (![0, 1, 2, 7].includes(t)) fail('container is on an inaccessible tile');
      const content = inventory(c.items, 'container.items'), looted = bool(c.looted, 'container.looted');
      if (looted && Object.keys(content).length) fail('looted container still has items');
      const cc = { id, x: p.x, y: p.y, label: str(c.label, 100, 'container.label'), items: content, looted };
      if (c._ground === true) cc._ground = true; s.containers.push(cc);
    }
    const zombieIds = new Set();
    for (const z of arr(source.zombies, openworld ? 180 : 90, 'zombies')) {
      const p = point(z, 'zombie'), id = openworld ? str(z.id, 60, 'zombie.id') : num(z.id, 1, 1000000, 'zombie.id', true);
      if (zombieIds.has(id)) fail('duplicate zombie'); zombieIds.add(id);
      if (!['wander', 'investigate', 'chase', 'attack', 'stunned'].includes(z.state)) fail('unknown zombie state');
      const path = arr(z._path === undefined ? [] : z._path, 128, 'zombie path').map(p => {
        obj(p, 'path point'); return openworld ? { x: num(p.x, -600000, 600000, 'path.x'), y: num(p.y, -600000, 600000, 'path.y') } : point(p, 'path point');
      });
      s.zombies.push({ id, x: p.x, y: p.y, health: num(z.health, 0.0001, 150, 'zombie.health'), state: z.state,
        angle: num(z.angle, -100, 100, 'zombie.angle'), windup: num(z.windup, 0, 0.75, 'zombie.windup'),
        _targetX: optionalNumber(z, '_targetX', openworld ? -600000 : 0, openworld ? 600000 : W * TILE, p.x), _targetY: optionalNumber(z, '_targetY', openworld ? -600000 : 0, openworld ? 600000 : H * TILE, p.y),
        _lastSeen: optionalNumber(z, '_lastSeen', -100, 100000000, -100), _wanderClock: optionalNumber(z, '_wanderClock', -100000000, 20, 0),
        _path: path, _pathClock: optionalNumber(z, '_pathClock', -100000000, 3, 0),
        _stun: optionalNumber(z, '_stun', 0, 1, 0), _attackCooldown: optionalNumber(z, '_attackCooldown', 0, 2, 0),
        _blockedTimer: optionalNumber(z, '_blockedTimer', 0, 1.1, 0)
      });
      if (z._humanBite !== undefined) s.zombies[s.zombies.length - 1]._humanBite = num(z._humanBite, -10, 2, 'human bite cooldown');
    }
    if (!openworld) s._nextZombieId = Math.max(s._nextZombieId, ...s.zombies.map(z => z.id + 1));
    const occupied = new Set();
    for (const b of arr(source.structures, openworld ? 540 : 60, 'structures')) {
      const p = point(b, 'structure'); if (!['barricade', 'campfire'].includes(b.type)) fail('unknown structure type');
      const id = Math.floor(p.y / TILE) * W + Math.floor(p.x / TILE);
      if (occupied.has(id) || ![0, 1, 2].includes(s.tiles[id])) fail('structure position is invalid'); occupied.add(id);
      s.structures.push({ x: p.x, y: p.y, type: b.type, health: num(b.health, 0.0001, 200, 'structure.health') });
    }
    for (const pt of arr(source.particles, 220, 'particles')) {
      obj(pt, 'particle'); const color = str(pt.color, 9, 'particle.color');
      if (!/^#[0-9a-f]{3,8}$/i.test(color)) fail('particle color');
      s.particles.push({ x: num(pt.x, -300, W * TILE + 300, 'particle.x'), y: num(pt.y, -300, H * TILE + 300, 'particle.y'),
        vx: num(pt.vx, -300, 300, 'particle.vx'), vy: num(pt.vy, -300, 300, 'particle.vy'),
        life: num(pt.life, 0, 2, 'particle.life'), maxLife: num(pt.maxLife, 0.0001, 2, 'particle.maxLife'), color });
    }
    const p = obj(source.player, 'player'), pos = point(p, 'player');
    if (openworld && (p.equipment === undefined || p.magazines === undefined)) fail('missing equipment or magazines');
    if (!['bat', 'pistol'].includes(p.weapon) && !(items[p.weapon] && items[p.weapon].weapon)) fail('unknown weapon');
    const equipment = p.equipment === undefined ? { weapon: p.weapon, clothing: null, backpack: null } : obj(p.equipment, 'equipment');
    const inv = inventory(p.inventory, 'inventory'), magazines = {};
    if (equipment.weapon !== p.weapon) fail('equipped weapon mismatch');
    for (const slot of ['clothing', 'backpack']) {
      const id = equipment[slot];
      if (id !== null && id !== undefined && (!(inv[id] > 0) || !items[id] || (slot === 'clothing' ? items[id].category !== 'clothing' && !items[id].armor : !(items[id].capacity > 0)))) fail('invalid equipped ' + slot);
    }
    if (p.magazines !== undefined) {
      obj(p.magazines, 'magazines');
      if (Object.keys(p.magazines).length > 100) fail('too many magazines');
      for (const id of Object.keys(p.magazines)) {
        if (id !== 'pistol' && !(items[id] && items[id].weapon && items[id].weapon.kind === 'firearm')) fail('unknown magazine');
        magazines[id] = num(p.magazines[id], 0, weaponInfo(id).clipSize, 'loaded rounds', true);
      }
    } else magazines.pistol = p.ammo;
    s.player = { x: pos.x, y: pos.y, angle: num(p.angle, -100, 100, 'player.angle'),
      health: num(p.health, 0, 100, 'health'), stamina: num(p.stamina, 0, 100, 'stamina'), hunger: num(p.hunger, 0, 100, 'hunger'),
      thirst: num(p.thirst, 0, 100, 'thirst'), infection: num(p.infection, 0, 100, 'infection'), bleeding: num(p.bleeding, 0, 3, 'bleeding'),
      inventory: inv, kills: num(p.kills, 0, 1000000, 'kills', true), weapon: p.weapon,
      equipment: { weapon: p.weapon, clothing: equipment.clothing || null, backpack: equipment.backpack || null }, magazines,
      vehicleId: p.vehicleId === undefined || p.vehicleId === null ? null : str(p.vehicleId, 60, 'vehicle id'),
      legacyGear: p.legacyGear === undefined ? !openworld && p.equipment === undefined : bool(p.legacyGear, 'legacy starter gear'),
      ammo: num(p.ammo, 0, weaponInfo(weaponInfo(p.weapon).kind === 'firearm' ? p.weapon : 'pistol').clipSize, 'magazine rounds', true), cooldown: optionalNumber(p, 'cooldown', 0, 10, 0),
      invulnerable: optionalNumber(p, 'invulnerable', 0, 2, 0), resting: p.resting === undefined ? false : bool(p.resting, 'resting'),
      _sneaking: p._sneaking === undefined ? false : bool(p._sneaking, 'sneaking') };
    if (weight(s.player.inventory) > carryCapacity(s) + 0.0001) fail('inventory exceeds carrying capacity');
    if (!(document.stories && document.stories.floor > 0) && !clearCircle(s, s.player.x, s.player.y, 9)) fail('player is inside a solid tile');
    for (const n of arr(source.noises, 24, 'noises')) { const p = point(n, 'noise'); const noise = { x: p.x, y: p.y, radius: num(n.radius, 0, 1500, 'noise radius'), life: num(n.life, 0, 6, 'noise life') }; if (n.vehicle) noise.vehicle = true; s.noises.push(noise); }
    for (const entry of arr(source.logs, 60, 'logs')) {
      obj(entry, 'log'); if (!['info', 'good', 'warn', 'danger'].includes(entry.tone)) fail('log tone');
      s.logs.push({ text: str(entry.text, 600, 'log text'), tone: entry.tone, time: num(entry.time, 0, 100000000, 'log time') });
    }
    const carIds = new Set();
    for (const v of arr(source.vehicles || [], 450, 'vehicles')) {
      const pos = point(v, 'vehicle'), id = str(v.id, 60, 'vehicle.id'), color = str(v.color, 9, 'vehicle.color');
      if (carIds.has(id) || !/^v:-?\d{1,3},-?\d{1,3}:\d{1,4}$/.test(id) || !/^#[0-9a-f]{3,8}$/i.test(color)) fail('vehicle identity or color'); carIds.add(id);
      const tank = num(v.tank, 1, 200, 'fuel tank');
      s.vehicles.push({ id, x: pos.x, y: pos.y, angle: num(v.angle, -100, 100, 'vehicle angle'), speed: num(v.speed, -600, 600, 'vehicle speed'),
        fuel: num(v.fuel, 0, tank, 'fuel'), condition: num(v.condition, 0, 100, 'vehicle condition'), type: str(v.type, 40, 'vehicle type'), name: str(v.name, 80, 'vehicle name'), color,
        maxSpeed: num(v.maxSpeed, 1, 600, 'vehicle max speed'), tank });
    }
    if (s.player.vehicleId && !carIds.has(s.player.vehicleId)) fail('driver vehicle is missing');
    const humanIds = new Set();
    for (const h of arr(source.humans || [], 40, 'humans')) {
      const pos = point(h, 'human'), id = str(h.id, 60, 'human.id');
      if (humanIds.has(id) || !/^h:-?\d{1,3},-?\d{1,3}:\d{1,4}$/.test(id) || !['survivor', 'raider'].includes(h.faction) || !['bat', 'pistol'].includes(h.weapon)) fail('human identity or metadata'); humanIds.add(id);
      s.humans.push({ id, x: pos.x, y: pos.y, angle: num(h.angle, -100, 100, 'human.angle'), health: num(h.health, 0, 100, 'human.health'),
        faction: h.faction, name: str(h.name, 80, 'human.name'), following: bool(h.following, 'human following'), weapon: h.weapon, cooldown: num(h.cooldown, 0, 10, 'human cooldown'),
        _thinkClock: optionalNumber(h, '_thinkClock', -100000000, 10, 0), _targetX: optionalNumber(h, '_targetX', -600000, 600000, pos.x), _targetY: optionalNumber(h, '_targetY', -600000, 600000, pos.y) });
      if (h._step) { obj(h._step, 'human step'); s.humans[s.humans.length - 1]._step = { x: num(h._step.x, -600000, 600000, 'human step.x'), y: num(h._step.y, -600000, 600000, 'human step.y') }; }
      else s.humans[s.humans.length - 1]._step = null;
    }
    const g = obj(source.goal, 'goal');
    if (g.required !== 5) fail('radio requires five parts');
    s.goal = { parts: num(g.parts, 0, 5, 'installed parts', true), required: 5,
      radioX: num(g.radioX, openworld ? -600000 : 32, openworld ? 600000 : W * TILE - 32, 'radio.x'), radioY: num(g.radioY, openworld ? -600000 : 32, openworld ? 600000 : H * TILE - 32, 'radio.y'),
      complete: bool(g.complete, 'goal.complete'), active: g.active === undefined ? g.parts === 5 : bool(g.active, 'goal.active'),
      countdown: optionalNumber(g, 'countdown', 0, SIGNAL_TIME, SIGNAL_TIME) };
    if ((!openworld || s.goal.radioX >= 0 && s.goal.radioY >= 0 && s.goal.radioX < W * TILE && s.goal.radioY < H * TILE) && isSolid(s, s.goal.radioX / TILE, s.goal.radioY / TILE)) fail('radio is blocked');
    if ((s.goal.active && s.goal.parts !== 5) || (!openworld && s.goal.complete && (!s.won || !s.ended)) || (s.won && (!s.ended || !s.goal.complete)) || (openworld && s.won)) fail('game outcome is inconsistent');
    const statistics = obj(source.stats, 'stats');
    s.stats = { ticks: num(statistics.ticks, 0, 10000000000, 'ticks', true), aiUpdates: num(statistics.aiUpdates, 0, 10000000000, 'AI updates', true), pathNodes: optionalNumber(statistics, 'pathNodes', 0, 1000000000000, 0, true) };
    const doors = source._doorHealth === undefined ? {} : obj(source._doorHealth, 'door health');
    if (Object.keys(doors).length > W * H) fail('too many door health entries');
    for (const key of Object.keys(doors)) {
      if (!/^\d{1,5}$/.test(key)) fail('door health key');
      const id = Number(key); if (id >= W * H || (s.tiles[id] !== 6 && s.tiles[id] !== 7)) fail('door health references a missing door');
      s._doorHealth[id] = num(doors[key], -20, 65, 'door health');
    }
    for (let i = 0; i < s.tiles.length; i++) if ((s.tiles[i] === 6 || s.tiles[i] === 7) && s._doorHealth[i] === undefined) s._doorHealth[i] = 65;
    const terrain = source._terrainHealth === undefined ? {} : obj(source._terrainHealth, 'terrain health');
    if (Object.keys(terrain).length > W * H) fail('too many terrain health entries');
    for (const key of Object.keys(terrain)) {
      if (!/^\d{1,5}$/.test(key)) fail('terrain health key');
      const id = Number(key); if (id >= W * H || ![3, 5, 8, 9].includes(s.tiles[id])) fail('terrain health references a missing obstacle');
      s._terrainHealth[id] = num(terrain[key], 0, 300, 'terrain health');
      if (s._terrainHealth[id] === 0 && s.tiles[id] !== 9) fail('zero obstacle health without a broken window');
    }
    if (openworld && document.order !== undefined) {
      const order = obj(document.order, 'entity order');
      for (const [name, max] of [['zombies', 180], ['humans', 40]]) {
        const ids = arr(order[name], max, name + ' order'), byId = new Map(s[name].map(e => [e.id, e])), seen = new Set();
        if (ids.length !== s[name].length) fail(name + ' order length');
        s[name] = ids.map(id => { if (typeof id !== 'string' || !byId.has(id) || seen.has(id)) fail(name + ' order identity'); seen.add(id); return byId.get(id); });
      }
    }
    if (document.vehicleHits !== undefined) {
      const hits = obj(document.vehicleHits, 'vehicle impacts'); if (Object.keys(hits).length > 2000) fail('too many recent impacts'); s._vehicleHits = {};
      for (const id of Object.keys(hits)) { if (!/^(?:z:-?\d{1,3},-?\d{1,3}:\d{1,6}|wave:\d{1,10}:\d{1,7})$/.test(id)) fail('impact identity'); s._vehicleHits[id] = num(hits[id], 0, s.elapsed, 'impact time'); }
    }
    if (document.stories !== undefined && Sirens.Stories) {
      const stories = Sirens.Stories.validate(document.stories, W, H);
      Sirens.Stories.restore(s, stories);
    } else if (Sirens.Stories) Sirens.Stories.refresh(s);
    return s;
  }

  if (Sirens.World) Sirens.World.setTownFactory((seed, difficulty) => create(seed, difficulty, 'rescue'));
  Sirens.Engine = Object.freeze({ create, update, interact, attack, action, craft, canCraft, build, serialize, deserialize, isSolid, hasLOS, nearby, recipes, items, capacity: CAPACITY, inventoryWeight: weight, carryCapacity });
}());
