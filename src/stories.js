(function () {
  'use strict';
  const Sirens = window.Sirens = window.Sirens || {};
  const TILE = 32;
  const LIMITS = Object.freeze({ buildings: 512, upperFloors: 2, containersPerFloor: 100, zombiesPerFloor: 30, structuresPerFloor: 60, coordinate: 8320 });
  const GROUND_FIELDS = ['tiles', 'buildings', 'containers', 'zombies', 'structures', 'discovered', '_doorHealth', '_terrainHealth', 'noises', 'particles', 'vehicles', 'humans', 'npcs'];
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const origin = (s) => ({ x: s.world ? s.world.originX : 0, y: s.world ? s.world.originY : 0 });
  function hash(seed, x, y, floor) {
    let n = (seed ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(floor || 0, 1640531513)) >>> 0;
    n = Math.imul(n ^ n >>> 13, 1274126177);
    return (n ^ n >>> 16) >>> 0;
  }
  function random(seed) { let n = seed || 0x6d2b79f5; return function () { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; n >>>= 0; return n / 4294967296; }; }
  function log(s, text, tone) {
    if (!Array.isArray(s.logs)) s.logs = [];
    s.logs.push({ text, tone: tone || 'info', time: s.elapsed || 0 });
    if (s.logs.length > 60) s.logs.splice(0, s.logs.length - 60);
  }
  function ensure(s) {
    if (!s.stories) s.stories = { version: 1, seed: s.seed, difficulty: s.difficulty, floor: 0, buildingKey: null, revision: 0, records: {} };
    return s.stories;
  }
  function refresh(s) {
    const journal = ensure(s), o = origin(s);
    if (journal.floor > 0) return;
    for (const b of s.buildings || []) {
      const gx = o.x + b.x, gy = o.y + b.y;
      b._storyKey = gx + ',' + gy;
      b.floors = 2 + (hash(s.seed, gx, gy) % 3 === 0 ? 1 : 0);
      b.stairs = { x: b.x + 2, y: b.y + 2 };
    }
  }
  function currentBuilding(s) {
    refresh(s);
    if (s.stories.floor > 0) return (s.buildings || [])[0] || null;
    let nearest = null, distance = 70;
    for (const b of s.buildings || []) {
      if (!b.stairs) continue;
      const d = Math.hypot(s.player.x - (b.stairs.x + 0.5) * TILE, s.player.y - (b.stairs.y + 0.5) * TILE);
      if (d <= distance) { nearest = b; distance = d; }
    }
    return nearest;
  }
  function nearStairs(s, b) { return b && Math.hypot(s.player.x - (b.stairs.x + 0.5) * TILE, s.player.y - (b.stairs.y + 0.5) * TILE) <= 70; }
  function nearby(s) {
    const b = currentBuilding(s);
    if (!nearStairs(s, b)) return '';
    const floor = s.stories.floor;
    return floor === 0 ? 'Stairs: Page Up to level 2' : floor + 1 < b.floors ? 'Stairs: Page Up / Page Down' : 'Stairs: Page Down to descend';
  }
  function footprint(s, b) {
    const o = origin(s);
    return { gx: o.x + b.x, gy: o.y + b.y, w: b.w, h: b.h, name: b.name, floors: b.floors };
  }
  function partition(record) { return record.w >= 7 && record.h >= 7 ? { x: Math.floor(record.w / 2), y: Math.floor(record.h / 2) } : null; }
  function baseTile(record, x, y) {
    if ((x === 0 || x === record.w - 1) && y === record.h - 3) return 8;
    if (x < 0 || y < 0 || x >= record.w || y >= record.h || x === 0 || y === 0 || x === record.w - 1 || y === record.h - 1) return 3;
    const p = partition(record);
    if (p && y === p.y) return x === p.x ? 6 : 3;
    return 2;
  }
  function tableFor(record, floor) {
    const name = record.name.toLowerCase();
    if (/clinic|aid|pharmacy/.test(name)) return 'clinic';
    if (/workshop|machine|warehouse|depot|maintenance/.test(name)) return floor > 1 ? 'radio' : 'workshop';
    if (/grocer|market|restaurant/.test(name)) return 'house';
    if (/ranger|cabin|shelter/.test(name)) return 'camp';
    return floor > 1 ? 'library' : 'house';
  }
  function drawLoot(rng, tableName) {
    const catalog = Sirens.Catalog;
    const table = catalog && (catalog.loot[tableName] || catalog.loot.house);
    const result = { water: 1, food: 1 };
    if (!table) return Object.assign(result, { bandage: 1, scrap: 2 });
    const total = table.reduce((sum, e) => sum + e.weight, 0);
    for (let n = 0; n < 5; n++) {
      let roll = rng() * total, chosen = table[table.length - 1];
      for (const e of table) { roll -= e.weight; if (roll <= 0) { chosen = e; break; } }
      result[chosen.id] = Math.min(100, (result[chosen.id] || 0) + chosen.min + Math.floor(rng() * (chosen.max - chosen.min + 1)));
    }
    return result;
  }
  function generate(s, record, floor) {
    const rng = random(hash(s.seed, record.gx, record.gy, floor));
    const locations = [{ x: record.w - 3, y: 2 }, { x: record.w - 3, y: record.h - 3 }];
    const containers = locations.map((point, i) => ({ id: 'floor:' + record.gx + ',' + record.gy + ':' + floor + ':supplies:' + i,
      x: (record.gx + point.x + 0.5) * TILE, y: (record.gy + point.y + 0.5) * TILE,
      label: record.name + ' level ' + (floor + 1) + ' supplies', items: drawLoot(rng, tableFor(record, floor)), looted: false }));
    const zombies = [];
    const x = (record.gx + record.w - 2.5) * TILE, y = (record.gy + record.h - 2.5) * TILE;
    const stairsX = (record.gx + 2.5) * TILE, stairsY = (record.gy + 2.5) * TILE;
    if (Math.hypot(x - stairsX, y - stairsY) > 140 && rng() < (s.difficulty === 'calm' ? 0.22 : s.difficulty === 'hard' ? 0.8 : 0.5)) {
      zombies.push({ id: 'floor:' + record.gx + ',' + record.gy + ':' + floor + ':z:1', x, y,
        health: s.difficulty === 'calm' ? 52 : s.difficulty === 'hard' ? 74 : 64, state: 'wander', angle: rng() * Math.PI * 2, windup: 0,
        _targetX: x, _targetY: y, _lastSeen: -100, _wanderClock: 3, _path: [], _pathClock: 0, _stun: 0, _attackCooldown: 0, _blockedTimer: 0 });
    }
    return { containers, zombies, structures: [], explored: [], tiles: {}, doors: {}, doorHealth: {}, terrainHealth: {} };
  }
  function rememberGround(s) {
    const ground = {};
    GROUND_FIELDS.forEach((key) => { ground[key] = s[key]; });
    Object.defineProperty(s, '_storyGround', { value: ground, configurable: true, writable: true, enumerable: false });
  }
  function globalEntity(s, value) {
    const o = origin(s), entity = copy(value);
    entity.x += o.x * TILE; entity.y += o.y * TILE;
    if (entity._targetX !== undefined) entity._targetX += o.x * TILE;
    if (entity._targetY !== undefined) entity._targetY += o.y * TILE;
    if (entity._path) entity._path = [];
    return entity;
  }
  function localEntity(s, value) {
    const o = origin(s), entity = copy(value);
    entity.x -= o.x * TILE; entity.y -= o.y * TILE;
    if (entity._targetX !== undefined) entity._targetX -= o.x * TILE;
    if (entity._targetY !== undefined) entity._targetY -= o.y * TILE;
    if (entity._path) entity._path = [];
    return entity;
  }
  function capture(s) {
    const journal = ensure(s);
    if (!journal.floor) return;
    const record = journal.records[journal.buildingKey];
    if (!record) throw new Error('The current floor is missing from the building journal.');
    const saved = record.levels[journal.floor], o = origin(s), localX = record.gx - o.x, localY = record.gy - o.y;
    saved.containers = (s.containers || []).map(c => globalEntity(s, c));
    saved.zombies = (s.zombies || []).map(z => globalEntity(s, z));
    saved.structures = (s.structures || []).filter(b => b.health > 0).map(b => globalEntity(s, b));
    saved.explored = []; saved.tiles = {}; saved.doors = {}; saved.doorHealth = {}; saved.terrainHealth = {};
    for (let y = 0; y < record.h; y++) for (let x = 0; x < record.w; x++) {
      const local = y * record.w + x, index = (localY + y) * s.width + localX + x;
      if (s.discovered[index]) saved.explored.push(local);
      if (s.tiles[index] !== baseTile(record, x, y)) saved.tiles[local] = s.tiles[index];
      if (s._terrainHealth && s._terrainHealth[index] !== undefined) saved.terrainHealth[local] = s._terrainHealth[index];
      if (baseTile(record, x, y) === 6) {
        saved.doors[local] = s.tiles[index];
        saved.doorHealth[local] = s._doorHealth[index] === undefined ? 65 : s._doorHealth[index];
      }
    }
  }
  function activate(s, record, floor) {
    const journal = ensure(s), o = origin(s), bx = record.gx - o.x, by = record.gy - o.y;
    if (!record.levels[floor]) record.levels[floor] = generate(s, record, floor);
    const saved = record.levels[floor];
    s.tiles = new Array(s.width * s.height).fill(3);
    s.discovered = new Array(s.width * s.height).fill(false);
    s._doorHealth = {}; s._terrainHealth = {};
    const explored = new Set(saved.explored);
    for (let y = 0; y < record.h; y++) for (let x = 0; x < record.w; x++) {
      const local = y * record.w + x, index = (by + y) * s.width + bx + x, original = baseTile(record, x, y);
      s.tiles[index] = saved.tiles && saved.tiles[local] !== undefined ? saved.tiles[local] : original === 6 && saved.doors[local] !== undefined ? saved.doors[local] : original;
      s.discovered[index] = explored.has(local);
      if (original === 6) s._doorHealth[index] = saved.doorHealth[local] === undefined ? 65 : saved.doorHealth[local];
      if (saved.terrainHealth && saved.terrainHealth[local] !== undefined) s._terrainHealth[index] = saved.terrainHealth[local];
    }
    s.buildings = [{ x: bx, y: by, w: record.w, h: record.h, name: record.name, floors: record.floors, floor,
      stairs: { x: bx + 2, y: by + 2 }, _storyKey: record.gx + ',' + record.gy }];
    s.containers = saved.containers.map(c => localEntity(s, c));
    s.zombies = saved.zombies.map(z => localEntity(s, z));
    s.structures = saved.structures.map(b => localEntity(s, b));
    s.vehicles = []; s.humans = []; s.npcs = []; s.noises = []; s.particles = [];
    s._aiCursor = 0; s._aiClock = 0; s._exploreClock = 0;
    journal.floor = floor; journal.revision++;
  }
  function safeLanding(s, b) {
    const sx = b.stairs.x, sy = b.stairs.y;
    const points = [[sx, sy], [sx + 1, sy], [sx, sy + 1], [sx - 1, sy], [sx, sy - 1]];
    for (const [x, y] of points) {
      const index = y * s.width + x;
      if (![0, 1, 2, 7].includes(s.tiles[index])) continue;
      if ((s.structures || []).some(v => v.type === 'barricade' && Math.floor(v.x / TILE) === x && Math.floor(v.y / TILE) === y)) continue;
      s.player.x = (x + 0.5) * TILE; s.player.y = (y + 0.5) * TILE;
      s.player.invulnerable = Math.max(s.player.invulnerable || 0, 0.65);
      s.player.resting = false;
      return true;
    }
    return false;
  }
  function go(s, delta) {
    if (!s || !s.player || s.ended || ![1, -1].includes(delta)) return false;
    if (s.player.vehicleId || s.player.vehicle || s.player.driving) { log(s, 'Leave the vehicle before using stairs.', 'warn'); return false; }
    if (s.conversation) { log(s, 'Finish the conversation before using stairs.', 'warn'); return false; }
    const b = currentBuilding(s), journal = ensure(s);
    if (!nearStairs(s, b)) { log(s, 'Stand beside a stair marker to change levels.', 'warn'); return false; }
    const next = journal.floor + delta;
    if (next < 0 || next >= b.floors) { log(s, next < 0 ? 'You are already on the ground level.' : 'This is the highest level of the building.', 'info'); return false; }
    if (journal.floor === 0) {
      if (!journal.records[b._storyKey]) {
        if (Object.keys(journal.records).length >= LIMITS.buildings) { log(s, 'The upper-floor journal is full. Export your save before exploring more buildings.', 'warn'); return false; }
        journal.records[b._storyKey] = Object.assign(footprint(s, b), { levels: {} });
      }
      journal.buildingKey = b._storyKey;
      rememberGround(s);
    } else capture(s);
    const record = journal.records[journal.buildingKey];
    if (next === 0) {
      if (!s._storyGround) throw new Error('Cannot descend without the ground snapshot.');
      GROUND_FIELDS.forEach(key => { if (s._storyGround[key] === undefined) delete s[key]; else s[key] = s._storyGround[key]; });
      delete s._storyGround;
      journal.floor = 0; journal.buildingKey = null; journal.revision++;
      refresh(s);
    } else activate(s, record, next);
    const landing = next === 0 ? (s.buildings || []).find(v => v._storyKey === record.gx + ',' + record.gy) : s.buildings[0];
    if (!landing || !safeLanding(s, landing)) throw new Error('The stairs do not have a safe landing.');
    log(s, 'Entered ' + record.name + ', level ' + (next + 1) + ' of ' + record.floors + '.', 'info');
    return true;
  }
  function groundView(s) {
    if (!s.stories || !s.stories.floor || !s._storyGround) return s;
    return Object.assign({}, s, s._storyGround);
  }
  function serialize(s) { ensure(s); capture(s); return copy(s.stories); }

  function validate(data, width, height) {
    const fail = (message) => { throw new Error('Invalid upper-floor save: ' + message + '.'); };
    const object = (v, name) => { if (!v || typeof v !== 'object' || Array.isArray(v)) fail(name); return v; };
    const num = (v, min, max, name, integer) => { if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || integer && !Number.isInteger(v)) fail(name); return v; };
    const text = (v, max, name) => { if (typeof v !== 'string' || !v.length || v.length > max) fail(name); return v; };
    const array = (v, max, name) => { if (!Array.isArray(v) || v.length > max) fail(name); return v; };
    const catalog = Sirens.Catalog && Sirens.Catalog.items || Sirens.Engine && Sirens.Engine.items || {};
    if (![64, 192].includes(width) || height !== width) fail('world dimensions');
    object(data, 'journal');
    if (data.version !== 1) fail('schema version');
    const result = { version: 1, seed: num(data.seed, 0, 4294967295, 'seed', true), difficulty: data.difficulty,
      floor: num(data.floor, 0, 2, 'current level', true), buildingKey: data.buildingKey,
      revision: num(data.revision === undefined ? 0 : data.revision, 0, 1e9, 'revision', true), records: {} };
    if (!['calm', 'standard', 'hard'].includes(result.difficulty)) fail('difficulty');
    object(data.records, 'building records');
    if (Object.keys(data.records).length > LIMITS.buildings) fail('building journal limit');
    const identities = new Set();
    for (const [key, value] of Object.entries(data.records)) {
      const source = object(value, 'building');
      const record = { gx: num(source.gx, -LIMITS.coordinate, LIMITS.coordinate, 'building x', true), gy: num(source.gy, -LIMITS.coordinate, LIMITS.coordinate, 'building y', true),
        w: num(source.w, 4, 40, 'building width', true), h: num(source.h, 4, 40, 'building height', true), name: text(source.name, 100, 'building name'),
        floors: num(source.floors, 2, 3, 'floor count', true), levels: {} };
      if (key !== record.gx + ',' + record.gy) fail('building identity');
      if (record.floors !== 2 + (hash(result.seed, record.gx, record.gy) % 3 === 0 ? 1 : 0)) fail('generated floor count');
      object(source.levels, 'levels');
      if (Object.keys(source.levels).length > record.floors - 1) fail('level count');
      function position(entity, name) {
        object(entity, name);
        const x = num(entity.x, record.gx * TILE, (record.gx + record.w) * TILE - 0.001, name + '.x');
        const y = num(entity.y, record.gy * TILE, (record.gy + record.h) * TILE - 0.001, name + '.y');
        return { x, y };
      }
      function inventory(value) {
        object(value, 'container items'); const result = {};
        if (Object.keys(value).length > 500) fail('item types');
        for (const [id, quantity] of Object.entries(value)) {
          if (!Object.prototype.hasOwnProperty.call(catalog, id)) fail('unknown item ' + id);
          const count = num(quantity, 0, 1000, 'item count', true); if (count) result[id] = count;
        }
        return result;
      }
      for (const [levelKey, raw] of Object.entries(source.levels)) {
        const floor = Number(levelKey);
        if (!/^[12]$/.test(levelKey) || floor >= record.floors) fail('level identity');
        object(raw, 'level');
        const saved = { containers: [], zombies: [], structures: [], explored: [], tiles: {}, doors: {}, doorHealth: {}, terrainHealth: {} };
        for (const [field, max] of [['containers', LIMITS.containersPerFloor], ['zombies', LIMITS.zombiesPerFloor], ['structures', LIMITS.structuresPerFloor]]) array(raw[field], max, field);
        for (const [index, tile] of Object.entries(object(raw.tiles || {}, 'tile changes'))) {
          if (!/^\d{1,4}$/.test(index)) fail('tile change index'); const i = num(Number(index), 0, record.w * record.h - 1, 'tile change index', true);
          const baseline = baseTile(record, i % record.w, Math.floor(i / record.w));
          if (!(baseline === 3 && tile === 2 || baseline === 6 && tile === 7 || baseline === 8 && tile === 9)) fail('invalid terrain change');
          saved.tiles[i] = tile;
        }
        for (const [index, tile] of Object.entries(object(raw.doors, 'doors'))) {
          if (!/^\d{1,4}$/.test(index)) fail('door index'); const i = num(Number(index), 0, record.w * record.h - 1, 'door index', true);
          if (baseTile(record, i % record.w, Math.floor(i / record.w)) !== 6) fail('missing door'); saved.doors[i] = num(tile, 6, 7, 'door tile', true);
        }
        for (const [index, health] of Object.entries(object(raw.doorHealth, 'door health'))) {
          if (!/^\d{1,4}$/.test(index)) fail('door index'); const i = num(Number(index), 0, record.w * record.h - 1, 'door index', true);
          if (baseTile(record, i % record.w, Math.floor(i / record.w)) !== 6) fail('missing door'); saved.doorHealth[i] = num(health, -20, 65, 'door health');
        }
        for (const [index, health] of Object.entries(object(raw.terrainHealth || {}, 'terrain health'))) {
          if (!/^\d{1,4}$/.test(index)) fail('terrain health index'); const i = num(Number(index), 0, record.w * record.h - 1, 'terrain health index', true);
          const baseline = baseTile(record, i % record.w, Math.floor(i / record.w));
          const tile = saved.tiles[i] === undefined ? baseline : saved.tiles[i];
          const value = num(health, 0, 300, 'terrain health');
          if (![3, 8, 9].includes(tile) || value === 0 && tile !== 9) fail('terrain health references missing or destroyed terrain');
          saved.terrainHealth[i] = value;
        }
        const seen = new Set();
        for (const i of array(raw.explored, record.w * record.h, 'exploration')) { num(i, 0, record.w * record.h - 1, 'explored tile', true); if (seen.has(i)) fail('duplicate explored tile'); seen.add(i); saved.explored.push(i); }
        const walkable = (p) => {
          const x = Math.floor(p.x / TILE) - record.gx, y = Math.floor(p.y / TILE) - record.gy, i = y * record.w + x;
          const tile = saved.tiles[i] === undefined ? saved.doors[i] === undefined ? baseTile(record, x, y) : saved.doors[i] : saved.tiles[i];
          return [2, 7].includes(tile);
        };
        for (const c of raw.containers) {
          const p = position(c, 'container'), id = text(c.id, 100, 'container identity');
          if (identities.has(id)) fail('duplicate entity'); identities.add(id);
          const content = inventory(c.items);
          if (typeof c.looted !== 'boolean' || c.looted && Object.keys(content).length) fail('looted container content');
          if (c._ground && c.looted) continue; // emptied piles from older saves hold nothing
          if (!walkable(p)) fail('inaccessible container');
          const container = Object.assign({ id, label: text(c.label, 150, 'container label'), items: content, looted: c.looted }, p);
          if (c._ground) container._ground = true;
          saved.containers.push(container);
        }
        const occupied = new Set();
        for (const b of raw.structures) {
          const p = position(b, 'structure'), i = Math.floor(p.y / TILE) * 100000 + Math.floor(p.x / TILE);
          if (!walkable(p) || !['barricade', 'campfire'].includes(b.type) || occupied.has(i)) fail('structure position'); occupied.add(i);
          saved.structures.push(Object.assign({ type: b.type, health: num(b.health, 0.0001, 200, 'structure health') }, p));
        }
        for (const z of raw.zombies) {
          const p = position(z, 'zombie'), id = text(z.id, 100, 'zombie identity');
          if (identities.has(id)) fail('duplicate entity'); identities.add(id);
          if (!walkable(p)) fail('zombie inside wall');
          if (!['wander', 'investigate', 'chase', 'attack', 'stunned'].includes(z.state)) fail('zombie state');
          const zombie = Object.assign({ id, health: num(z.health, 0.0001, 150, 'zombie health'), state: z.state, angle: num(z.angle, -100, 100, 'zombie angle'), windup: num(z.windup, 0, 0.75, 'windup'), _path: [] }, p);
          for (const [field, min, max, fallback] of [['_targetX', -LIMITS.coordinate * TILE, LIMITS.coordinate * TILE, p.x], ['_targetY', -LIMITS.coordinate * TILE, LIMITS.coordinate * TILE, p.y], ['_lastSeen', -100, 1e8, -100], ['_wanderClock', -1e8, 20, 0], ['_pathClock', -1e8, 3, 0], ['_stun', 0, 1, 0], ['_attackCooldown', 0, 2, 0], ['_blockedTimer', 0, 1.1, 0]]) zombie[field] = z[field] === undefined ? fallback : num(z[field], min, max, field);
          saved.zombies.push(zombie);
        }
        record.levels[floor] = saved;
      }
      result.records[key] = record;
    }
    if (result.floor === 0 && result.buildingKey !== null) fail('ground building key');
    if (result.floor > 0 && (typeof result.buildingKey !== 'string' || !result.records[result.buildingKey] || !result.records[result.buildingKey].levels[result.floor])) fail('active floor record');
    return result;
  }
  function restore(s, data) {
    if (!data) { refresh(s); return; }
    const validated = validate(data, s.width, s.height);
    if (validated.seed !== s.seed || validated.difficulty !== s.difficulty) throw new Error('Upper-floor journal does not match this world.');
    const floor = validated.floor, buildingKey = validated.buildingKey;
    s.stories = validated; s.stories.floor = 0; s.stories.buildingKey = null;
    refresh(s);
    if (floor) {
      const record = s.stories.records[buildingKey];
      const b = (s.buildings || []).find(b => b._storyKey === buildingKey);
      if (!b || b.w !== record.w || b.h !== record.h || b.floors !== record.floors) throw new Error('The active upper floor does not match a ground building.');
      rememberGround(s); s.stories.buildingKey = buildingKey; activate(s, record, floor);
      const tx = Math.floor(s.player.x / TILE), ty = Math.floor(s.player.y / TILE);
      if (![2, 7].includes(s.tiles[ty * s.width + tx]) || (s.structures || []).some(v => v.type === 'barricade' && Math.floor(v.x / TILE) === tx && Math.floor(v.y / TILE) === ty)) throw new Error('The saved survivor is inside a solid upper-floor tile.');
    }
  }
  Sirens.Stories = Object.freeze({ limits: LIMITS, refresh, currentBuilding, nearby, go, groundView, serialize, validate, restore });
}());
