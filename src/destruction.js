(function () {
  'use strict';
  const Sirens = window.Sirens = window.Sirens || {};
  const TILE = 32;
  const limits = Object.freeze({ treeHealth: 75, wallHealth: 220, windowHealth: 45, maxHealth: 300, interactionRange: 70 });
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function log(s, text, tone) { s.logs.push({ text, tone: tone || 'info', time: s.elapsed }); if (s.logs.length > 60) s.logs.splice(0, s.logs.length - 60); }
  function noise(s, x, y, radius) { s.noises.push({ x, y, radius, life: 1.1 }); if (s.noises.length > 24) s.noises.splice(0, s.noises.length - 24); }
  function buildingAt(s, tx, ty) { return (s.buildings || []).find(b => tx >= b.x && ty >= b.y && tx < b.x + b.w && ty < b.y + b.h); }
  function supported(s, tx, ty) {
    if (tx <= 0 || ty <= 0 || tx >= s.width - 1 || ty >= s.height - 1) return false;
    return !(s.stories && s.stories.floor > 0) || !!buildingAt(s, tx, ty);
  }
  function health(s) { return s._terrainHealth || (s._terrainHealth = {}); }
  function weaponInfo(weapon) {
    const id = typeof weapon === 'string' ? weapon : weapon && weapon.id || '';
    const item = typeof weapon === 'string' ? Sirens.Catalog && Sirens.Catalog.items[id] : weapon;
    const stats = item && item.weapon || item;
    return { id, stats, item };
  }
  function surface(s, tx, ty) {
    const x = clamp(s.player.x, tx * TILE, (tx + 1) * TILE), y = clamp(s.player.y, ty * TILE, (ty + 1) * TILE);
    const dx = x - s.player.x, dy = y - s.player.y, distance = Math.hypot(dx, dy);
    return { x, y, dx, dy, distance };
  }
  function clearApproach(s, point) {
    if (point.distance < 0.001) return false;
    const gap = Math.min(2, point.distance * 0.5);
    return Sirens.Engine.hasLOS(s, s.player.x, s.player.y, point.x - point.dx / point.distance * gap, point.y - point.dy / point.distance * gap);
  }
  function fragments(s, tx, ty, color) {
    const x = (tx + 0.5) * TILE, y = (ty + 0.5) * TILE;
    for (let i = 0; i < 7; i++) {
      const angle = i * 2.399963 + tx * 0.13 + ty * 0.07, speed = 20 + i * 5;
      s.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.55, maxLife: 0.55, color });
    }
    if (s.particles.length > 220) s.particles.splice(0, s.particles.length - 220);
  }
  function timber(s, tx, ty) {
    const x = (tx + 0.5) * TILE, y = (ty + 0.5) * TILE;
    let pile = s.containers.find(c => c._ground && Math.hypot(c.x - x, c.y - y) < 30);
    if (!pile && s.containers.filter(c => c._ground).length >= 60) pile = s.containers.filter(c => c._ground)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (!pile) {
      pile = { id: 'drop:' + s.seed + ':' + s._nextGroundId++, x, y, label: 'Felled timber', items: {}, looted: false, _ground: true };
      s.containers.push(pile);
    }
    const gx = tx + (s.world ? s.world.originX : 0), gy = ty + (s.world ? s.world.originY : 0);
    const amount = 2 + ((s.seed ^ Math.imul(gx, 19349663) ^ Math.imul(gy, 83492791)) >>> 0) % 3;
    const before = pile.items.wood || 0;
    pile.items.wood = Math.min(1000, before + amount); pile.looted = false;
    return pile.items.wood - before;
  }
  function hit(s, aimX, aimY, weapon) {
    if (!s || !s.player || s.ended || !Number.isFinite(aimX) || !Number.isFinite(aimY) || s.player.vehicleId) return false;
    const resolved = weaponInfo(weapon), stats = resolved.stats;
    if (!stats || stats.kind !== 'melee' || !Number.isFinite(stats.range) || !Number.isFinite(stats.damage)) return false;
    const ax = aimX - s.player.x, ay = aimY - s.player.y, len = Math.hypot(ax, ay);
    if (len < 0.001) return false;
    const dx = ax / len, dy = ay / len, range = clamp(stats.range, 20, 160), radius = Math.ceil(range / TILE) + 1;
    const px = Math.floor(s.player.x / TILE), py = Math.floor(s.player.y / TILE), candidates = [];
    const terrain = health(s);
    for (let ty = py - radius; ty <= py + radius; ty++) for (let tx = px - radius; tx <= px + radius; tx++) {
      if (!supported(s, tx, ty)) continue;
      const index = ty * s.width + tx, tile = s.tiles[index];
      if (![3, 5, 6, 8, 9].includes(tile) || tile === 9 && terrain[index] === 0) continue;
      if (tile === 6 && s._doorHealth[index] <= 0) continue;
      const point = surface(s, tx, ty);
      const centerX = (tx + 0.5) * TILE - s.player.x, centerY = (ty + 0.5) * TILE - s.player.y;
      const along = centerX * dx + centerY * dy, side = Math.abs(centerX * dy - centerY * dx);
      if (point.distance > range || along <= 0 || side > 18 + along * 0.4 || !clearApproach(s, point)) continue;
      candidates.push({ tx, ty, index, tile, point, side });
    }
    candidates.sort((a, b) => a.point.distance - b.point.distance || a.side - b.side || a.index - b.index);
    const target = candidates[0]; if (!target) return false;
    const { tx, ty, index, tile } = target;
    let damage = clamp(stats.damage, 1, 200);
    if (tile === 5 && ['hatchet', 'fire_axe'].includes(resolved.id)) damage *= 1.5;
    else if (tile === 5 && resolved.id === 'machete') damage *= 1.3;
    if (tile === 3 && ['sledgehammer', 'pickaxe'].includes(resolved.id)) damage *= 3;
    if (tile === 6 && ['hatchet', 'fire_axe', 'crowbar'].includes(resolved.id)) damage *= 1.25;
    const work = resolved.item && resolved.item[tile === 5 ? 'treeDamage' : tile === 3 ? 'wallDamage' : tile === 6 ? 'doorDamage' : ''];
    if (Number.isFinite(work) && work > 0) damage *= clamp(work, .25, 4);
    if (tile === 6) {
      const before = Number.isFinite(s._doorHealth[index]) ? s._doorHealth[index] : 65;
      s._doorHealth[index] = Math.max(-20, before - damage);
      if (Sirens.Effects) Sirens.Effects.emit(s, 'wood', { broken: s._doorHealth[index] <= 0 });
      if (s._doorHealth[index] <= 0) { s.tiles[index] = 7; fragments(s, tx, ty, '#bba181'); log(s, 'The door gives way. The route is open.', 'good'); }
      else log(s, 'Door damaged: ' + Math.ceil(s._doorHealth[index]) + ' strength remaining.', 'info');
      noise(s, (tx + 0.5) * TILE, (ty + 0.5) * TILE, Math.max(150, stats.noise || 0));
      return true;
    }
    const maximum = tile === 5 ? limits.treeHealth : tile === 3 ? limits.wallHealth : limits.windowHealth;
    const before = Number.isFinite(terrain[index]) ? terrain[index] : maximum;
    const remaining = Math.max(0, before - damage);
    terrain[index] = remaining;
    if (Sirens.Effects) Sirens.Effects.emit(s, tile === 5 ? 'wood' : tile === 3 ? 'stone' : 'glass', { broken: remaining === 0 });
    noise(s, (tx + 0.5) * TILE, (ty + 0.5) * TILE, tile === 8 || tile === 9 ? 270 : Math.max(130, stats.noise || 0));
    if (remaining > 0) { log(s, (tile === 5 ? 'Tree' : tile === 3 ? 'Wall' : 'Window') + ' damaged: ' + Math.ceil(remaining) + ' strength remaining.', 'info'); return true; }
    if (tile === 5) {
      s.tiles[index] = 0; delete terrain[index]; const amount = timber(s, tx, ty); fragments(s, tx, ty, '#bda473'); log(s, amount ? 'Tree felled. Collect ' + amount + ' timber from the supplies pile.' : 'Tree felled. Nearby timber storage is full.', 'good');
    } else if (tile === 3) {
      s.tiles[index] = buildingAt(s, tx, ty) ? 2 : 0; delete terrain[index]; fragments(s, tx, ty, '#b9b6a8'); log(s, 'The wall collapses. This opening stays in your world journal.', 'good');
    } else {
      s.tiles[index] = 9; terrain[index] = 0; fragments(s, tx, ty, '#9bbec8'); log(s, 'Glass shattered. Climbing through can cause cuts.', 'warn');
    }
    return true;
  }
  function nearestWindow(s) {
    const px = Math.floor(s.player.x / TILE), py = Math.floor(s.player.y / TILE), options = [];
    for (let ty = py - 3; ty <= py + 3; ty++) for (let tx = px - 3; tx <= px + 3; tx++) {
      if (tx < 0 || ty < 0 || tx >= s.width || ty >= s.height) continue;
      const tile = s.tiles[ty * s.width + tx]; if (tile !== 8 && tile !== 9) continue;
      const distance = Math.hypot((tx + 0.5) * TILE - s.player.x, (ty + 0.5) * TILE - s.player.y);
      const point = surface(s, tx, ty);
      if (distance <= limits.interactionRange && clearApproach(s, point)) options.push({ tx, ty, distance });
    }
    options.sort((a, b) => a.distance - b.distance); return options[0] || null;
  }
  function nearby(s) {
    if (!s || !s.player || s.ended || s.player.vehicleId) return '';
    const window = nearestWindow(s); if (!window) return '';
    if (s.stories && s.stories.floor > 0) return 'Upper window: outside descent is not available';
    const index = window.ty * s.width + window.tx;
    return s.tiles[index] === 8 ? 'Open and climb window' : health(s)[index] === 0 ? 'Climb broken window, watch the glass' : 'Climb open window';
  }
  function random(s) {
    let x = (s._rng || s.seed || 0x6d2b79f5) >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    s._rng = x >>> 0 || 0x6d2b79f5; return s._rng / 4294967296;
  }
  function climb(s, tx, ty) {
    if (!s || !s.player || s.ended || s.player.vehicleId || s.conversation) return false;
    if (s.stories && s.stories.floor > 0) { log(s, 'There is no safe outside landing on an upper floor. Use the stairs.', 'warn'); return false; }
    if (tx === undefined && ty === undefined) { const window = nearestWindow(s); if (!window) return false; tx = window.tx; ty = window.ty; }
    if (!Number.isInteger(tx) || !Number.isInteger(ty) || tx < 1 || ty < 1 || tx >= s.width - 1 || ty >= s.height - 1) return false;
    const index = ty * s.width + tx, tile = s.tiles[index]; if (tile !== 8 && tile !== 9) return false;
    const cx = (tx + 0.5) * TILE, cy = (ty + 0.5) * TILE;
    if (Math.hypot(s.player.x - cx, s.player.y - cy) > limits.interactionRange || !clearApproach(s, surface(s, tx, ty))) return false;
    const b = buildingAt(s, tx, ty);
    let horizontal;
    if (b && (tx === b.x || tx === b.x + b.w - 1)) horizontal = true;
    else if (b && (ty === b.y || ty === b.y + b.h - 1)) horizontal = false;
    else horizontal = [3, 8, 9].includes(s.tiles[(ty - 1) * s.width + tx]) || [3, 8, 9].includes(s.tiles[(ty + 1) * s.width + tx]);
    const lateral = horizontal ? Math.abs(s.player.y - cy) : Math.abs(s.player.x - cx);
    if (lateral > 25) { log(s, 'Stand squarely beside the window before climbing.', 'info'); return false; }
    const side = Math.sign(horizontal ? s.player.x - cx : s.player.y - cy) || 1;
    const landingX = cx - (horizontal ? side * TILE : 0), landingY = cy - (horizontal ? 0 : side * TILE);
    const clear = [[-10, -10], [-10, 10], [10, -10], [10, 10]].every(p => !Sirens.Engine.isSolid(s, (landingX + p[0]) / TILE, (landingY + p[1]) / TILE));
    if (!clear) { log(s, 'The far side of the window is blocked. Clear a safe landing first.', 'warn'); return false; }
    const terrain = health(s), broken = tile === 9 && terrain[index] === 0;
    if (tile === 8) { s.tiles[index] = 9; if (terrain[index] === undefined) terrain[index] = limits.windowHealth; }
    s.player.x = landingX; s.player.y = landingY; s.player.resting = false;
    if (Sirens.Effects) Sirens.Effects.emit(s, 'climb');
    s.player.invulnerable = Math.max(s.player.invulnerable || 0, 0.3);
    noise(s, cx, cy, broken ? 85 : 55);
    const item = Sirens.Catalog && Sirens.Catalog.items[s.player.equipment && s.player.equipment.clothing];
    const armor = clamp(item && Number.isFinite(item.armor) ? item.armor : 0, 0, 0.7);
    if (broken && random(s) < clamp(0.6 - armor * 1.5, 0.04, 0.6)) {
      s.player.health = Math.max(0, s.player.health - 6 * (1 - Math.min(0.85, armor * 2)));
      s.player.bleeding = clamp(s.player.bleeding + 0.7 * (1 - Math.min(0.8, armor * 2)), 0, 3);
      log(s, 'Broken glass cut you. Protective clothing reduces the risk. Use a bandage.', 'danger');
      if (s.player.health <= 0) { s.ended = true; s.won = false; }
    } else log(s, broken ? 'You climbed through the broken frame without a cut.' : 'You opened the window and climbed through.', 'info');
    return true;
  }
  Sirens.Destruction = Object.freeze({ limits, hit, climb, nearby });
}());
