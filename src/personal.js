(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const T = 32, LIMIT = 600000, MAX_PETS = 2;
  const palettes = {
    skin: [['warm', 'Warm', '#ddbc88'], ['light', 'Light', '#f1cfaa'], ['brown', 'Brown', '#b98156'], ['deep', 'Deep', '#775240']],
    hair: [['brown', 'Brown', '#382e26'], ['black', 'Black', '#202722'], ['sand', 'Sand', '#bcaa72'], ['gray', 'Gray', '#b6b7aa']],
    coat: [['earth', 'Earth', '#593f2d'], ['forest', 'Forest', '#496348'], ['rust', 'Rust', '#805142'], ['blue', 'Blue', '#435e71'], ['plum', 'Plum', '#63556d'], ['gold', 'Gold', '#b7a55c']],
    hat: [['none', 'No hat', '#382e26'], ['cap', 'Field cap', '#567451'], ['beanie', 'Wool beanie', '#b49b6b']]
  };
  const options = Object.freeze(Object.fromEntries(Object.entries(palettes).map(([part, rows]) => [part, Object.freeze(rows.map(([id, name, color]) => Object.freeze({ id, name, color })))])));
  const spawnCache = new WeakMap();
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function hash(text, seed) { let n = seed >>> 0; for (const c of String(text)) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; }
  function fresh() { return { version: 1, look: { skin: 'warm', hair: 'brown', coat: 'earth', hat: 'none' }, pets: [], tamed: {}, totalFed: 0 }; }
  function ensure(s) { return s.personal || (s.personal = fresh()); }
  function look(s) {
    const appearance = ensure(s).look, result = {};
    for (const part of ['skin', 'hair', 'coat']) result[part] = options[part].find(p => p.id === appearance[part]).color;
    result.hat = appearance.hat; result.hatColor = options.hat.find(p => p.id === appearance.hat).color;
    return result;
  }
  function offset(s) { return { x: s.world ? s.world.originX * T : 0, y: s.world ? s.world.originY * T : 0 }; }
  function local(s, pet) { const o = offset(s); return { x: pet.x - o.x, y: pet.y - o.y }; }
  function onGround(s) { return !(s.stories && s.stories.floor > 0); }
  function clear(s, x, y) {
    return [[-5, -5], [-5, 5], [5, -5], [5, 5]].every(p => !S.Engine.isSolid(s, (x + p[0]) / T, (y + p[1]) / T));
  }
  function landing(s, gx, gy, n) {
    const o = offset(s), baseX = Math.floor((gx - o.x) / T), baseY = Math.floor((gy - o.y) / T);
    const test = (tx, ty) => {
      const x = (tx + .5) * T, y = (ty + .5) * T;
      return tx >= 0 && ty >= 0 && tx < s.width && ty < s.height && s.tiles[ty * s.width + tx] === 0 && clear(s, x, y) ? { x, y } : null;
    };
    let point = test(baseX, baseY); if (point) return point;
    for (let r = 1; r <= 8; r++) {
      const ring = [];
      for (let i = -r; i <= r; i++) { ring.push([i, -r], [i, r]); if (Math.abs(i) !== r) ring.push([-r, i], [r, i]); }
      for (let i = 0; i < ring.length; i++) { const d = ring[(i + n % ring.length) % ring.length]; point = test(baseX + d[0], baseY + d[1]); if (point) return point; }
    }
    return null;
  }
  function wild(s) {
    if (!s || !s.player || !onGround(s) || !S.Engine) return [];
    const o = offset(s), owner = ensure(s), key = s.seed + ':' + o.x + ',' + o.y;
    let cache = spawnCache.get(s);
    if (!cache || cache.key !== key || cache.tiles !== s.tiles) { cache = { key, tiles: s.tiles, points: {} }; spawnCache.set(s, cache); }
    const result = [], minX = s.world ? Math.floor(s.world.originX / 64) : 0, minY = s.world ? Math.floor(s.world.originY / 64) : 0;
    const span = s.world ? 3 : 1;
    for (let cx = minX; cx < minX + span; cx++) for (let cy = minY; cy < minY + span; cy++) for (let i = 0; i < 2; i++) {
      const id = 'pet:' + cx + ',' + cy + ':' + i;
      if (Object.hasOwn(owner.tamed, id)) continue;
      const n = hash(id, s.seed), kind = cx === 0 && cy === 0 ? i ? 'cat' : 'dog' : n % 2 ? 'cat' : 'dog';
      const gx = cx === 0 && cy === 0 ? i ? 608 : 400 : (cx * 64 + 23 + n % 17 + .5) * T;
      const gy = cx === 0 && cy === 0 ? 528 : (cy * 64 + 29 + (n >>> 8) % 10 + .5) * T;
      let point = cache.points[id];
      if (!point || s.tiles[Math.floor(point.y / T) * s.width + Math.floor(point.x / T)] !== 0 || !clear(s, point.x, point.y)) point = cache.points[id] = landing(s, gx, gy, n);
      if (!point) continue;
      const names = kind === 'dog' ? ['Cedar', 'Moss', 'Ash', 'Scout'] : ['Juniper', 'Pip', 'Clover', 'Fern'];
      result.push({ id, kind, name: names[n % names.length], x: point.x, y: point.y, angle: (n % 628) / 100 - Math.PI });
    }
    return result;
  }
  function nearest(s) {
    if (s.player.vehicleId) return null;
    return wild(s).filter(p => Math.hypot(p.x - s.player.x, p.y - s.player.y) < 75 && S.Engine.hasLOS(s, s.player.x, s.player.y, p.x, p.y)).sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y))[0] || null;
  }
  function quote(s, action) {
    const missing = [], cost = {}, result = { can: false, missing, cost, pet: null };
    if (!s || !s.player || s.ended || typeof action !== 'string' || action.length > 100) { missing.push('That action is unavailable'); return result; }
    const p = ensure(s), inv = s.player.inventory;
    const style = /^style:(skin|hair|coat|hat):([a-z]{1,16})$/.exec(action);
    if (style) {
      if (!options[style[1]].some(v => v.id === style[2])) missing.push('Unknown appearance preset');
      else if (p.look[style[1]] === style[2]) missing.push('Already selected');
    } else if (action === 'tame') {
      result.pet = nearest(s); cost.food = 1;
      if (!result.pet) missing.push('Approach a stray on the ground floor');
      if (p.pets.length >= MAX_PETS) missing.push('You already have two pets');
      if (Object.keys(p.tamed).length >= 1024) missing.push('This run already has its full pet record');
    } else if (action.startsWith('feed:')) {
      result.pet = p.pets.find(pet => pet.id === action.slice(5)) || null; cost.food = 1;
      if (!result.pet) missing.push('Unknown pet');
      else {
        const pos = local(s, result.pet);
        if (!onGround(s) || s.player.vehicleId || Math.hypot(pos.x - s.player.x, pos.y - s.player.y) >= 90 || !S.Engine.hasLOS(s, s.player.x, s.player.y, pos.x, pos.y)) missing.push('Stand beside your pet on the ground floor');
        if (result.pet.care >= 100) missing.push('Your pet is already well cared for');
      }
    } else {
      const mode = /^mode:(pet:-?\d{1,3},-?\d{1,3}:[01]):(follow|stay)$/.exec(action);
      if (!mode) missing.push('Unknown personal action');
      else { result.pet = p.pets.find(pet => pet.id === mode[1]) || null; if (!result.pet) missing.push('Unknown pet'); else if (result.pet.mode === mode[2]) missing.push('Already ' + (mode[2] === 'follow' ? 'following' : 'staying')); }
    }
    for (const [id, count] of Object.entries(cost)) if ((inv[id] || 0) < count) missing.push('Bring ' + count + ' ration');
    result.can = !missing.length; return result;
  }
  function write(s, text) {
    if (S.Progression) S.Progression.write(s, 'pets', text);
    else { s.logs.push({ text, tone: 'good', time: s.elapsed }); if (s.logs.length > 60) s.logs.shift(); }
  }
  function action(s, name) {
    const q = quote(s, name); if (!q.can) return false;
    const p = ensure(s);
    const style = /^style:(skin|hair|coat|hat):([a-z]{1,16})$/.exec(name);
    if (style) { p.look[style[1]] = style[2]; return true; }
    for (const [id, n] of Object.entries(q.cost)) { s.player.inventory[id] -= n; if (!s.player.inventory[id]) delete s.player.inventory[id]; }
    if (name === 'tame') {
      const stray = q.pet, o = offset(s);
      p.pets.push({ id: stray.id, kind: stray.kind, name: stray.name, x: stray.x + o.x, y: stray.y + o.y, angle: stray.angle, mode: 'follow', care: 75, lastBark: s.elapsed, nextThink: s.elapsed, stepX: null, stepY: null, moving: false });
      p.tamed[stray.id] = true; write(s, stray.name + ' the ' + stray.kind + ' trusts you now. Feed them and choose Follow or Stay in your journal.');
      if (S.Effects) S.Effects.emit(s, stray.kind === 'dog' ? 'petDog' : 'petCat');
    } else if (name.startsWith('feed:')) {
      q.pet.care = Math.min(100, q.pet.care + 25); p.totalFed = Math.min(1000000, p.totalFed + 1);
      write(s, 'Fed ' + q.pet.name + '. Care rose to ' + Math.round(q.pet.care) + '/100.');
      if (S.Effects) S.Effects.emit(s, q.pet.kind === 'dog' ? 'petDog' : 'petCat');
    } else {
      q.pet.mode = name.slice(name.lastIndexOf(':') + 1); q.pet.stepX = null; q.pet.stepY = null; q.pet.moving = false; q.pet.nextThink = s.elapsed;
      write(s, q.pet.name + (q.pet.mode === 'follow' ? ' will follow you through the loaded ground floor.' : ' will stay here until you return.'));
    }
    return true;
  }
  function nearby(s) { const pet = nearest(s); return pet ? 'Befriend ' + pet.name + ' the ' + pet.kind + ' · 1 ration' : ''; }
  function interact(s) {
    const q = quote(s, 'tame');
    if (!q.can) { s.logs.push({ text: q.missing.join('. '), tone: 'warn', time: s.elapsed }); if (s.logs.length > 60) s.logs.shift(); return false; }
    return action(s, 'tame');
  }
  function update(s, dt) {
    if (!s || !s.player || !onGround(s) || !Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(.1, dt); const o = offset(s), player = s.player;
    for (const pet of ensure(s).pets) {
      pet.care = Math.max(0, pet.care - dt * .035); pet.moving = false;
      const pos = local(s, pet);
      if (pos.x < 0 || pos.y < 0 || pos.x >= s.width * T || pos.y >= s.height * T) continue;
      const distance = Math.hypot(pos.x - player.x, pos.y - player.y);
      if (pet.mode === 'follow' && distance > 38 && distance < 1000 && !player.vehicleId) {
        if (s.elapsed >= pet.nextThink) {
          const step = S.Actors && S.Actors.pathStep ? S.Actors.pathStep(s, pos, player) : player;
          pet.stepX = step ? step.x + o.x : null; pet.stepY = step ? step.y + o.y : null; pet.nextThink = s.elapsed + .4;
        }
        if (pet.stepX !== null) {
          const dx = pet.stepX - pet.x, dy = pet.stepY - pet.y, len = Math.hypot(dx, dy), speed = pet.kind === 'dog' ? 112 : 105;
          if (len > .1) {
            const step = Math.min(len, speed * dt), mx = dx / len * step, my = dy / len * step;
            if (clear(s, pos.x + mx, pos.y)) { pet.x += mx; pos.x += mx; pet.moving = Math.abs(mx) > .001; }
            if (clear(s, pos.x, pos.y + my)) { pet.y += my; pet.moving = pet.moving || Math.abs(my) > .001; }
            if (pet.moving) pet.angle = Math.atan2(dy, dx);
          }
        }
      }
      if (pet.kind === 'dog' && pet.care >= 40 && distance < 200 && s.elapsed - pet.lastBark >= 6 && (s.zombies || []).some(z => z.health > 0 && Math.hypot(z.x - pos.x, z.y - pos.y) < 220 && S.Engine.hasLOS(s, pos.x, pos.y, z.x, z.y))) {
        pet.lastBark = s.elapsed; if (S.Effects) S.Effects.emit(s, 'petDog');
        s.logs.push({ text: pet.name + ' growls at the dead nearby.', tone: 'warn', time: s.elapsed }); if (s.logs.length > 60) s.logs.shift();
      }
    }
  }
  function comfort(s) {
    if (!s || !s.player || !onGround(s) || s.player.vehicleId) return 1;
    return ensure(s).pets.some(pet => { const pos = local(s, pet); return pet.care >= 40 && Math.hypot(pos.x - s.player.x, pos.y - s.player.y) < 100 && S.Engine.hasLOS(s, s.player.x, s.player.y, pos.x, pos.y); }) ? .85 : 1;
  }
  function validate(value, s) {
    if (value === undefined) return fresh();
    const fail = () => { throw new Error('Invalid save: appearance or pets.'); };
    const obj = x => { if (!x || typeof x !== 'object' || Array.isArray(x)) fail(); return x; };
    const num = (x, lo, hi, integer) => { if (typeof x !== 'number' || !Number.isFinite(x) || x < lo || x > hi || integer && !Number.isInteger(x)) fail(); return x; };
    const idOkay = id => { if (typeof id !== 'string') return false; const m = /^pet:(-?\d{1,3}),(-?\d{1,3}):[01]$/.exec(id); return !!m && Math.abs(Number(m[1])) <= 129 && Math.abs(Number(m[2])) <= 129; };
    obj(value); if (value.version !== 1) fail(); const p = fresh(), appearance = obj(value.look);
    if (Object.keys(appearance).some(k => !Object.hasOwn(options, k))) fail();
    for (const part of Object.keys(options)) { if (!options[part].some(option => option.id === appearance[part])) fail(); p.look[part] = appearance[part]; }
    p.totalFed = num(value.totalFed, 0, 1000000, true);
    const tamed = obj(value.tamed); if (Object.keys(tamed).length > 1024) fail();
    for (const [id, v] of Object.entries(tamed)) { if (!idOkay(id) || v !== true) fail(); p.tamed[id] = true; }
    if (!Array.isArray(value.pets) || value.pets.length > MAX_PETS) fail();
    const seen = new Set();
    p.pets = value.pets.map(pet => {
      obj(pet); if (!idOkay(pet.id) || seen.has(pet.id) || !Object.hasOwn(p.tamed, pet.id) || !['dog', 'cat'].includes(pet.kind) || !['follow', 'stay'].includes(pet.mode) || typeof pet.name !== 'string' || !/^[A-Za-z ]{1,32}$/.test(pet.name) || typeof pet.moving !== 'boolean') fail(); seen.add(pet.id);
      const copy = { id: pet.id, kind: pet.kind, name: pet.name, mode: pet.mode, moving: pet.moving, x: num(pet.x, -LIMIT, LIMIT), y: num(pet.y, -LIMIT, LIMIT), angle: num(pet.angle, -Math.PI, Math.PI), care: num(pet.care, 0, 100), lastBark: num(pet.lastBark, 0, s.elapsed), nextThink: num(pet.nextThink, 0, s.elapsed + 1), stepX: null, stepY: null };
      if (pet.stepX !== null || pet.stepY !== null) { copy.stepX = num(pet.stepX, -LIMIT, LIMIT); copy.stepY = num(pet.stepY, -LIMIT, LIMIT); }
      return copy;
    });
    return p;
  }
  S.Personal = Object.freeze({ ensure, options, look, wild, local, nearby, interact, quote, action, update, comfort, validate });
})();
