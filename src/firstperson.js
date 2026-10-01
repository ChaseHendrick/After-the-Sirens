(function () {
  'use strict';
  // First-person view: a raycast presentation of the tiles, people and supplies the top-down renderer
  // draws. It only reads state. main.js owns the camera yaw and turns it into ordinary input snapshots,
  // so the simulation, saves, multiplayer and the simulation RNG never know which view is on screen.
  const Sirens = window.Sirens = window.Sirens || {};
  const TILE = 32, TAU = Math.PI * 2, INF = 1e9;
  // Heights in tiles. Walls stand two tiles, the eye sits just above one, and door and window openings
  // are cut into the wall at familiar proportions.
  const WALL = 2, EYE = 1.06, VIEW = 20, TREE_VIEW = 17, RAY = 26, FRAMES = 2, MIP = 9, LINES = 15, CEILING_REACH = 24;
  const HORIZON = .46, VFOV = .92, MIN_HFOV = 1.05, MAX_HFOV = 1.6;
  // How a ray treats each tile code: 1 stops at an opaque face (wall, closed door, closed window),
  // 2 passes a see-through frame (open doorway, broken or raised window). Trees and water are billboards and floor.
  const KIND = new Int8Array(16); KIND[3] = KIND[6] = KIND[8] = 1; KIND[7] = KIND[9] = 2;
  const LITTLE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
  const DEFAULT_THEME = Object.freeze({ type: 'ruin', wall: '#9a9e83', floor: '#827e61', trim: '#c4bea0', accent: '#697562', material: 'brick', variant: 0 });

  function clamp(n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; }
  function finite(n, fallback) { return typeof n === 'number' && Number.isFinite(n) ? n : fallback; }
  function wrap(angle) { let a = finite(angle, 0) % TAU; if (a > Math.PI) a -= TAU; else if (a <= -Math.PI) a += TAU; return a; }
  // The top-down renderer's tile hash, so grass, road and tree variants match between views.
  function hash(x, y, seed) {
    let n = Math.imul(x + 127, 374761393) ^ Math.imul(y + 311, 668265263) ^ (seed | 0);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function hex(value, fallback) { const text = String(value || ''); return /^#[0-9a-f]{6}/i.test(text) ? parseInt(text.slice(1, 7), 16) : fallback; }
  function tone(c, k) { return clamp(Math.round((c >> 16 & 255) * k), 0, 255) << 16 | clamp(Math.round((c >> 8 & 255) * k), 0, 255) << 8 | clamp(Math.round((c & 255) * k), 0, 255); }
  function mix(a, b, t) { const m = (s) => Math.round((a >> s & 255) + ((b >> s & 255) - (a >> s & 255)) * t); return m(16) << 16 | m(8) << 8 | m(0); }
  // Frame buffer words are always written little-endian; a big-endian platform swaps once per frame.
  function word(c) { return (0xff000000 | (c & 255) << 16 | (c & 0xff00) | (c >> 16 & 255)) >>> 0; }
  // Haze thickens gently with distance so the middle distance keeps its color.
  function haze(d, start, span) { const t = clamp((d - start) / span, 0, 1); return t * Math.sqrt(t); }
  function ease(t) { return 1 - (1 - t) * (1 - t); }
  function smooth(t) { return t * t * (3 - 2 * t); }

  function newHit() {
    return { kind: 0, depth: 0, tile: -1, tx: -1, ty: -1, side: 0, u: 0, count: 0, enter: INF, fDepth: new Float64Array(FRAMES), fTile: new Int8Array(FRAMES),
      fTx: new Int32Array(FRAMES), fTy: new Int32Array(FRAMES), fSide: new Int8Array(FRAMES), fU: new Float64Array(FRAMES) };
  }
  // Grid traversal (DDA) in tile units. With an unnormalized ray (view direction plus a camera-plane
  // offset) the distance is already perpendicular to the view, which removes fisheye distortion.
  // kind 1 is an opaque face, 3 is open air with nothing to draw (the map edge, or outside the
  // building on an upper floor). Up to FRAMES see-through frames passed on the way are recorded.
  function trace(tiles, width, height, px, py, rdx, rdy, limit, hit, room, roofs) {
    let mx = Math.floor(px), my = Math.floor(py);
    const ddx = rdx === 0 ? INF : Math.abs(1 / rdx), ddy = rdy === 0 ? INF : Math.abs(1 / rdy), sx = rdx < 0 ? -1 : 1, sy = rdy < 0 ? -1 : 1;
    let nx = (rdx < 0 ? px - mx : mx + 1 - px) * ddx, ny = (rdy < 0 ? py - my : my + 1 - py) * ddy;
    hit.kind = 0; hit.count = 0; hit.depth = limit; hit.tile = -1; hit.tx = -1; hit.ty = -1; hit.side = 0; hit.u = 0;
    // Distance at which the ray first passes over a roofed tile; ceilings can only show beyond it.
    hit.enter = roofs && mx >= 0 && my >= 0 && mx < width && my < height && roofs[my * width + mx] > 0 ? 0 : INF;
    for (let step = 0; step < 256; step++) {
      let side, dist;
      if (nx < ny) { dist = nx; nx += ddx; mx += sx; side = 0; } else { dist = ny; ny += ddy; my += sy; side = 1; }
      if (!(dist <= limit)) return hit;
      let kind, tile;
      if (mx < 0 || my < 0 || mx >= width || my >= height) { kind = 3; tile = -1; }
      else if (room && (mx < room.x0 || my < room.y0 || mx >= room.x1 || my >= room.y1)) { kind = 3; tile = -2; }
      else { const index = my * width + mx; tile = tiles[index]; kind = tile >= 0 && tile < 16 ? KIND[tile] : 0; if (roofs && dist < hit.enter && roofs[index] > 0) hit.enter = dist; }
      if (!kind) continue;
      let u = side === 0 ? py + dist * rdy : px + dist * rdx; u -= Math.floor(u);
      // Faces read left to right from the viewer's side.
      if (side === 0 ? rdx < 0 : rdy > 0) u = 1 - u;
      if (kind === 2) {
        const k = hit.count;
        if (k < FRAMES) { hit.fDepth[k] = dist; hit.fTile[k] = tile; hit.fTx[k] = mx; hit.fTy[k] = my; hit.fSide[k] = side; hit.fU[k] = u; hit.count++; }
        continue;
      }
      hit.kind = kind; hit.depth = dist; hit.tile = tile; hit.tx = mx; hit.ty = my; hit.side = side; hit.u = u;
      return hit;
    }
    return hit;
  }

  const probe = newHit();
  // Public ray query in world pixels. distance runs along the ray; depth is perpendicular to viewAngle
  // when one is given (the corrected distance the view projects with). Every output stays finite.
  function castRay(state, x, y, angle, maxDistance, viewAngle) {
    const result = { hit: false, distance: 0, depth: 0, tile: -1, tx: -1, ty: -1, side: 0, offset: 0, frames: [] };
    if (!state || !state.tiles || !(state.width > 0) || !(state.height > 0)) return result;
    const width = Math.floor(state.width), height = Math.floor(state.height), limit = clamp(finite(maxDistance, VIEW * TILE), 0, 64 * TILE) / TILE;
    const px = clamp(finite(x, 0) / TILE, 0, width - 1e-6), py = clamp(finite(y, 0) / TILE, 0, height - 1e-6), a = finite(angle, 0) % TAU;
    trace(state.tiles, width, height, px, py, Math.cos(a), Math.sin(a), limit, probe, null);
    result.hit = probe.kind === 1; result.distance = (probe.kind ? probe.depth : limit) * TILE;
    result.depth = result.distance * (viewAngle === undefined ? 1 : Math.max(0, Math.cos(a - finite(viewAngle, a))));
    result.tile = probe.tile; result.tx = probe.tx; result.ty = probe.ty; result.side = probe.side; result.offset = probe.u;
    for (let k = 0; k < probe.count; k++) result.frames.push({ tile: probe.fTile[k], tx: probe.fTx[k], ty: probe.fTy[k], distance: probe.fDepth[k] * TILE });
    return result;
  }
  // Forward/strafe relative to the view yaw, rotated into the world axes the engine moves along.
  function viewInput(input, yaw) {
    const forward = clamp(finite(input && input.forward, 0), -1, 1), strafe = clamp(finite(input && input.strafe, 0), -1, 1), a = wrap(yaw);
    const c = Math.cos(a), s = Math.sin(a);
    let moveX = forward * c - strafe * s, moveY = forward * s + strafe * c;
    const length = Math.hypot(moveX, moveY);
    if (length > 1) { moveX /= length; moveY /= length; }
    return { moveX: moveX || 0, moveY: moveY || 0 };
  }
  // The engine aims at a point; first person aims a fixed reach straight along the yaw.
  function aim(player, yaw, reach) {
    const a = wrap(yaw), r = clamp(finite(reach, 100), 1, 1000), x = finite(player && player.x, 0), y = finite(player && player.y, 0);
    return { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r };
  }
  // View-model family for a weapon id, matching the top-down attack poses (spears, knives and daggers thrust).
  function weaponStyle(id, items) {
    const key = String(id || 'bat').toLowerCase(), item = items && Object.prototype.hasOwnProperty.call(items, key) ? items[key] : null, weapon = item && item.weapon;
    if (weapon ? weapon.kind === 'firearm' : /pistol|revolver|rifle|carbine|shotgun|smg|bow/.test(key)) return /crossbow/.test(key) ? 'rifle' : /bow/.test(key) ? 'bow' : /pistol|revolver/.test(key) ? 'pistol' : 'rifle';
    if (/spear/.test(key)) return 'spear';
    if (/knife|dagger/.test(key)) return 'knife';
    if (/pick/.test(key)) return 'pick';
    if (/axe|hatchet|halberd/.test(key)) return 'axe';
    if (/hammer|maul|mace|morningstar|sledge/.test(key)) return 'hammer';
    if (/machete|katana|sword|sabre|cutlass|kukri|cleaver|sickle|glaive|blade|scythe/.test(key)) return 'blade';
    return 'club';
  }
  // Sky, haze and light for the hour and weather. Night darkens, but the view stays readable.
  function sky(time, weather) {
    const hour = ((finite(time, 8) % 24) + 24) % 24, text = String(weather || '');
    const night = hour < 6 || hour >= 20 ? 1 : hour >= 17 ? (hour - 17) / 3 : hour < 8 ? (8 - hour) / 2 : 0;
    const warm = clamp(Math.max(1 - Math.abs(hour - 18.6) / 1.9, 1 - Math.abs(hour - 6.6) / 1.6), 0, 1);
    const wet = /rain|storm/i.test(text) ? 1 : 0, grey = wet ? 1 : /overcast|cloud|fog/i.test(text) ? .6 : 0;
    let top = mix(0x6b97a0, 0x7a8985, grey), low = mix(0xc9d2bb, 0xadb5a6, grey);
    if (wet) { top = mix(top, 0x56625f, .6); low = mix(low, 0x8a948c, .6); }
    top = mix(top, 0x4a5170, warm * .7); low = mix(low, 0xd4a070, warm * (1 - grey * .6) * .8);
    top = mix(top, 0x0b1626, night); low = mix(low, 0x26384a, night);
    return { hour, night, warm, wet, grey, top, low, fog: mix(low, 0x101c22, .08 + night * .25), bright: 1 - night * .34 - wet * .07,
      fogStart: 4, fogEnd: (wet ? 15 : 22 - grey * 3) - night * 3.5 };
  }

  // Procedural pixel art, painted straight into packed 0xRRGGBB arrays (-1 is transparent).
  function sheet(w, h, fill) { return { w, h, data: new Int32Array(w * h).fill(fill === undefined ? -1 : fill), avg: 0 }; }
  function copy(t) { return { w: t.w, h: t.h, data: t.data.slice(), avg: t.avg }; }
  function rect(t, x, y, w, h, c) {
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y)), x1 = Math.min(t.w, Math.round(x + w)), y1 = Math.min(t.h, Math.round(y + h));
    if (x1 > x0) for (let yy = y0; yy < y1; yy++) t.data.fill(c, yy * t.w + x0, yy * t.w + x1);
  }
  function dot(t, x, y, c) { if (x >= 0 && y >= 0 && x < t.w && y < t.h) t.data[(y | 0) * t.w + (x | 0)] = c; }
  function oval(t, cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) dot(t, x, y, c);
    }
  }
  function tri(t, ax, ay, bx, by, cx, cy, c) {
    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); if (!area) return;
    for (let y = Math.floor(Math.min(ay, by, cy)); y <= Math.ceil(Math.max(ay, by, cy)); y++) for (let x = Math.floor(Math.min(ax, bx, cx)); x <= Math.ceil(Math.max(ax, bx, cx)); x++) {
      const px = x + .5, py = y + .5, w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area, w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area;
      if (w0 >= 0 && w1 >= 0 && w0 + w1 <= 1) dot(t, x, y, c);
    }
  }
  function shade(t, c, amount) { for (let i = 0; i < t.data.length; i++) if (t.data[i] >= 0) t.data[i] = mix(t.data[i], c, amount); }
  function average(t) {
    let r = 0, g = 0, b = 0, n = 0;
    for (const c of t.data) if (c >= 0) { r += c >> 16 & 255; g += c >> 8 & 255; b += c & 255; n++; }
    t.avg = n ? Math.round(r / n) << 16 | Math.round(g / n) << 8 | Math.round(b / n) : 0;
    return t;
  }
  // Wall-like textures are stored column by column, the order the ray columns read them.
  function columns(t) {
    const data = new Int32Array(t.w * t.h);
    for (let y = 0; y < t.h; y++) for (let x = 0; x < t.w; x++) data[x * t.h + y] = t.data[y * t.w + x];
    return { w: t.w, h: t.h, data, avg: t.avg };
  }

  // Walls, doors, windows and floors in each building theme's colors, as the top-down renderer paints them.
  function themeArt(theme) {
    const wallC = hex(theme.wall, 0x9a9e83), trim = hex(theme.trim, 0xc4bea0), accent = hex(theme.accent, 0x697562), floorC = hex(theme.floor, 0x827e61), material = theme.material, seed = wallC ^ floorC;
    const wall = sheet(32, 64, wallC);
    if (material === 'plank') {
      // Lap siding: each board catches light on its lower edge and shades the next one down.
      for (let y = 5; y < 51; y += 6) {
        const board = tone(wallC, .93 + hash(y, seed, 3) * .12);
        rect(wall, 0, y, 32, 6, board); rect(wall, 0, y, 32, 1, tone(wallC, .66)); rect(wall, 0, y + 4, 32, 1, tone(board, 1.08));
        for (let k = 0; k < 3; k++) rect(wall, (hash(k, y, seed) * 26) | 0, y + 2, 4 + ((hash(y, k, seed) * 6) | 0), 1, tone(board, .94));
      }
    } else if (material === 'brick') {
      const mortar = tone(wallC, 1.18);
      for (let y = 5, row = 0; y < 50; y += 5, row++) {
        rect(wall, 0, y, 32, 1, mortar);
        for (let x = row % 2 ? -4 : 0; x < 32; x += 8) { rect(wall, x, y + 1, 1, 4, mortar); rect(wall, x + 1, y + 1, 7, 4, tone(wallC, .88 + hash(x + 8, y, seed) * .18)); }
      }
      rect(wall, 0, 50, 32, 1, mortar);
    } else if (material === 'metal') {
      for (let x = 0; x < 32; x += 4) { rect(wall, x, 5, 1, 46, tone(wallC, .76)); rect(wall, x + 1, 5, 1, 46, tone(wallC, 1.12)); }
      rect(wall, 0, 27, 32, 1, tone(wallC, .66));
      for (let x = 2; x < 32; x += 8) { dot(wall, x, 8, tone(wallC, 1.3)); dot(wall, x, 30, tone(wallC, 1.3)); }
    } else {
      for (let i = 0; i < 46; i++) dot(wall, (hash(i, seed, 2) * 32) | 0, 5 + ((hash(seed, i, 4) * 46) | 0), tone(wallC, hash(i, i, seed) > .5 ? 1.06 : .93));
      rect(wall, 0, 29, 32, 2, tone(wallC, .9)); rect(wall, 0, 29, 32, 1, tone(wallC, 1.08));
    }
    rect(wall, 0, 0, 32, 4, trim); rect(wall, 0, 3, 32, 1, tone(trim, .82)); rect(wall, 0, 4, 32, 1, tone(wallC, .55));
    rect(wall, 0, 51, 32, 1, tone(accent, 1.22)); rect(wall, 0, 52, 32, 6, accent); rect(wall, 0, 57, 32, 1, tone(accent, .75));
    rect(wall, 0, 58, 32, 6, 0x4b4d41); rect(wall, 0, 58, 32, 1, 0x5d5f51); rect(wall, 0, 63, 32, 1, 0x2a2e27);
    average(wall);
    const frame = mix(trim, 0xb2b79a, .5), mullion = 0xc5bc9b, post = mix(trim, 0xc0b69a, .5);
    const glass = copy(wall);
    rect(glass, 4, 14, 24, 2, 0xd2c7a1); rect(glass, 4, 16, 24, 26, frame); rect(glass, 4, 16, 1, 26, tone(frame, 1.1));
    for (let y = 17; y < 41; y++) rect(glass, 6, y, 20, 1, mix(0x77a3a2, 0x2b4f55, (y - 17) / 24));
    for (let i = 0; i < 8; i++) { dot(glass, 8 + i, 33 - i, 0xa5c8bb); dot(glass, 9 + i, 33 - i, 0x86afa6); dot(glass, 18 + i, 39 - i, 0x8db5aa); }
    const broken = copy(glass), raised = copy(glass);
    rect(glass, 15, 17, 2, 24, mullion); rect(glass, 6, 28, 20, 1, mullion);
    rect(glass, 3, 41, 26, 2, 0x777f68); rect(glass, 3, 41, 26, 1, 0x9aa088);
    // Smashed glass leaves jagged shards in the frame; a raised window keeps its sash at the top.
    rect(broken, 6, 17, 20, 24, -1);
    tri(broken, 6, 17, 14, 17, 6, 26, 0x9dc7be); tri(broken, 26, 17, 19, 17, 26, 23, 0x8fbcb2); tri(broken, 6, 41, 12, 41, 6, 34, 0x86b2a8); tri(broken, 26, 41, 20, 41, 26, 36, 0x9dc7be);
    rect(broken, 3, 41, 26, 2, 0x777f68); rect(broken, 3, 41, 26, 1, 0x9aa088);
    rect(raised, 6, 26, 20, 15, -1); rect(raised, 6, 24, 20, 2, mullion); rect(raised, 15, 17, 2, 7, mullion);
    rect(raised, 3, 41, 26, 2, 0x777f68); rect(raised, 3, 41, 26, 1, 0x9aa088);
    const doorway = copy(wall), door = copy(wall);
    for (const t of [doorway, door]) { rect(t, 2, 9, 28, 3, post); rect(t, 2, 9, 28, 1, tone(post, 1.15)); rect(t, 2, 12, 3, 52, post); rect(t, 27, 12, 3, 52, tone(post, .85)); }
    // An open door shows its edge swung against the jamb.
    rect(doorway, 5, 12, 22, 52, -1); rect(doorway, 5, 12, 3, 52, 0x5d4e3a); rect(doorway, 5, 12, 1, 52, 0x8a7352);
    rect(door, 5, 12, 22, 52, 0x78644a); rect(door, 5, 12, 22, 1, 0xa38a5d); rect(door, 5, 12, 1, 52, 0x8d7655);
    for (const [x, y, h] of [[8, 16, 18], [17, 16, 18], [8, 38, 21], [17, 38, 21]]) { rect(door, x, y, 7, h, 0x6a573f); rect(door, x, y, 7, 1, 0x56462f); rect(door, x, y + h - 1, 7, 1, 0x8d7655); }
    rect(door, 23, 35, 2, 3, 0xcfbe82); rect(door, 5, 63, 22, 1, 0x454a37);
    const cracked = copy(wall);
    for (const [x0, y0, steps] of [[12, 9, 30], [21, 30, 14]]) { let x = x0, y = y0; for (let i = 0; i < steps; i++) { dot(cracked, x, y, 0x3f3429); dot(cracked, x + 1, y, tone(wallC, .66)); y++; x += [0, 1, -1, 1, 1, 0, -1][i % 7]; if (i === 12) { for (let j = 0; j < 6; j++) dot(cracked, x + j, y - (j >> 1), 0x3f3429); } } }
    const floor = sheet(32, 32, floorC);
    if (material === 'plank') {
      for (let y = 0; y < 32; y += 8) { rect(floor, 0, y, 32, 8, tone(floorC, .94 + hash(y, seed, 9) * .1)); rect(floor, 0, y + 7, 32, 1, tone(floorC, .76)); rect(floor, 2 + ((hash(y, seed, 1) * 27) | 0), y, 1, 7, tone(floorC, .78)); }
      for (let i = 0; i < 10; i++) rect(floor, (hash(i, seed, 11) * 28) | 0, (hash(seed, i, 12) * 31) | 0, 3, 1, tone(floorC, 1.08));
    } else if (material === 'tile') {
      for (let y = 0; y < 32; y += 16) for (let x = 0; x < 32; x += 16) rect(floor, x, y, 16, 16, tone(floorC, ((x + y) >> 4) % 2 ? 1.06 : .95));
      for (const v of [0, 16]) { rect(floor, 0, v, 32, 1, tone(floorC, 1.2)); rect(floor, v, 0, 1, 32, tone(floorC, 1.2)); }
    } else {
      for (let i = 0; i < 30; i++) dot(floor, (hash(i, seed, 13) * 32) | 0, (hash(seed, i, 14) * 32) | 0, tone(floorC, hash(i, 3, seed) > .5 ? 1.1 : .9));
      if (material === 'metal') rect(floor, 0, 29, 32, 1, mix(floorC, 0xd4cc86, .45));
    }
    average(floor);
    return { wall: columns(wall), window: columns(glass), broken: columns(broken), raised: columns(raised), doorway: columns(doorway), door: columns(door), cracked: columns(cracked), floor };
  }

  function zombieArt(variant, frame) {
    const t = sheet(20, 36), shirt = [0x5b655c, 0x695d4e, 0x516972, 0x6e7356][variant], pants = [0x33433b, 0x3d3a32, 0x2f3b3e, 0x47483a][variant];
    const skin = 0xa5ae83, shadow = 0x8a9872, hair = 0x374b3d, blood = 0x93624c, dark = 0x1b2420;
    const left = frame === 0 ? 1 : 0, right = frame === 1 ? 1 : 0;
    rect(t, 6, 22, 4, 12 - left, pants); rect(t, 10, 22, 4, 12 - right, tone(pants, .82));
    rect(t, 5, 33 - left, 5, 3, 0x262b27); rect(t, 10, 33 - right, 5, 3, 0x22261f); rect(t, 7, 27, 2, 2, tone(pants, .7));
    rect(t, 5, 10, 10, 12, shirt); rect(t, 13, 10, 2, 12, tone(shirt, .76)); rect(t, 5, 10, 10, 1, tone(shirt, 1.16));
    rect(t, 7, 14, 2, 3, blood); dot(t, 11, 18, blood); dot(t, 12, 19, blood); rect(t, 10, 12, 1, 3, tone(shirt, .7));
    dot(t, 6, 21, -1); dot(t, 9, 21, -1); dot(t, 13, 21, -1);
    if (frame === 2) {
      // Arms thrown up to grab.
      rect(t, 2, 4, 3, 8, shirt); rect(t, 15, 4, 3, 8, tone(shirt, .78)); rect(t, 1, 1, 4, 4, skin); rect(t, 15, 1, 4, 4, shadow);
      dot(t, 1, 0, skin); dot(t, 3, 0, skin); dot(t, 16, 0, shadow); dot(t, 18, 0, shadow);
    } else {
      // Arms reaching toward the viewer, foreshortened.
      const a = frame === 0 ? 0 : 1;
      rect(t, 3, 10, 3, 4, shirt); rect(t, 14, 10, 3, 4, tone(shirt, .78));
      rect(t, 1, 13 + a, 5, 3, shadow); rect(t, 14, 14 - a, 5, 3, shadow); rect(t, 1, 13 + a, 5, 1, skin); rect(t, 14, 14 - a, 5, 1, skin);
      dot(t, 1, 16 + a, shadow); dot(t, 3, 16 + a, shadow); dot(t, 15, 17 - a, shadow); dot(t, 17, 17 - a, shadow);
    }
    rect(t, 7, 1, 6, 8, skin); rect(t, 12, 2, 1, 6, shadow); rect(t, 7, 8, 6, 1, shadow);
    rect(t, 7, 0, 6, 2, hair); dot(t, 7, 2, hair); dot(t, 12, 2, hair); dot(t, 10, 2, hair);
    dot(t, 8, 4, dark); dot(t, 11, 4, dark); dot(t, 8, 5, 0x6f3b2e); dot(t, 11, 5, 0x6f3b2e);
    rect(t, 9, 7, 2, 1, 0x4a2a22); dot(t, 9, 8, blood); rect(t, 9, 9, 2, 1, shadow);
    return t;
  }
  function humanArt(coat, trim, skin, hair, hat, hatColor, mask, held) {
    const t = sheet(20, 36), pants = 0x2c3938, boots = 0x1c2422;
    rect(t, 6, 22, 4, 11, pants); rect(t, 10, 22, 4, 11, tone(pants, .84)); rect(t, 5, 33, 5, 3, boots); rect(t, 10, 33, 5, 3, boots);
    rect(t, 5, 10, 10, 12, coat); rect(t, 13, 10, 2, 12, tone(coat, .8)); rect(t, 5, 10, 10, 2, trim); rect(t, 9, 12, 2, 9, tone(coat, .84)); rect(t, 5, 20, 10, 2, tone(coat, .68));
    rect(t, 3, 10, 2, 10, coat); rect(t, 15, 10, 2, 10, tone(coat, .8)); rect(t, 3, 20, 2, 2, skin); rect(t, 15, 20, 2, 2, tone(skin, .9));
    rect(t, 7, 2, 6, 7, skin); rect(t, 12, 3, 1, 5, tone(skin, .86)); rect(t, 7, 1, 6, 2, hair); dot(t, 7, 3, hair); dot(t, 12, 3, hair);
    dot(t, 8, 5, 0x2a2420); dot(t, 11, 5, 0x2a2420); rect(t, 9, 9, 2, 1, tone(skin, .85));
    if (mask >= 0) { rect(t, 7, 6, 6, 3, mask); rect(t, 7, 6, 6, 1, tone(mask, 1.2)); }
    if (hat === 'cap') { rect(t, 6, 0, 8, 3, hatColor); rect(t, 6, 3, 9, 1, tone(hatColor, .78)); }
    else if (hat === 'beanie') { rect(t, 6, 0, 8, 3, hatColor); rect(t, 6, 2, 8, 1, tone(hatColor, 1.2)); }
    if (held === 1) { rect(t, 17, 12, 2, 11, 0xc6b67e); rect(t, 17, 12, 2, 2, 0xe1cf9c); rect(t, 16, 20, 2, 2, tone(skin, .9)); }
    else if (held === 2) { rect(t, 15, 16, 5, 2, 0x25373a); rect(t, 16, 18, 2, 2, 0x25373a); }
    return t;
  }
  function dogArt(fur) {
    const t = sheet(24, 14), dark = tone(fur, .7);
    rect(t, 4, 5, 13, 5, fur); rect(t, 6, 9, 9, 1, 0xdfceb0); rect(t, 4, 5, 13, 1, tone(fur, 1.12));
    rect(t, 5, 10, 2, 4, dark); rect(t, 8, 10, 2, 4, fur); rect(t, 13, 10, 2, 4, dark); rect(t, 15, 10, 2, 4, fur);
    rect(t, 16, 2, 6, 5, fur); rect(t, 21, 4, 3, 3, 0xd5c39b); dot(t, 23, 4, 0x1c2722); rect(t, 16, 1, 3, 4, 0x69533a); dot(t, 19, 3, 0x1c2722);
    rect(t, 1, 3, 3, 2, fur); dot(t, 0, 2, fur);
    return t;
  }
  function catArt(fur) {
    const t = sheet(16, 12), dark = tone(fur, .72);
    rect(t, 3, 5, 9, 4, fur); rect(t, 3, 5, 9, 1, tone(fur, 1.12)); rect(t, 4, 9, 2, 3, dark); rect(t, 9, 9, 2, 3, dark); rect(t, 6, 9, 1, 3, fur);
    rect(t, 11, 2, 5, 4, fur); dot(t, 11, 1, fur); dot(t, 14, 1, fur); dot(t, 13, 3, 0x1c2722); dot(t, 15, 4, 0xc8a999);
    rect(t, 1, 1, 2, 5, fur); dot(t, 0, 0, fur);
    return t;
  }
  function carSide(color) {
    const t = sheet(48, 22), dark = tone(color, .7), light = tone(color, 1.16), glass = 0x5f878d;
    rect(t, 1, 10, 46, 8, color); rect(t, 1, 17, 46, 1, dark); rect(t, 10, 3, 24, 8, color);
    rect(t, 12, 4, 9, 6, glass); rect(t, 23, 4, 9, 6, glass); rect(t, 12, 4, 9, 1, 0x9dc1b5); rect(t, 23, 4, 9, 1, 0x9dc1b5); rect(t, 21, 4, 2, 6, dark);
    rect(t, 10, 3, 24, 1, light); rect(t, 1, 10, 46, 1, light); rect(t, 22, 12, 1, 5, dark); rect(t, 34, 6, 1, 4, dark);
    rect(t, 45, 11, 2, 3, 0xd4cc8c); rect(t, 1, 11, 2, 3, 0xb36c52);
    for (const x of [10, 38]) { oval(t, x, 18, 4, 4, 0x142a2e); oval(t, x, 18, 1.7, 1.7, 0x67766b); }
    return t;
  }
  function carEnd(color, front) {
    const t = sheet(28, 22), dark = tone(color, .68);
    rect(t, 2, 9, 24, 8, color); rect(t, 5, 2, 18, 8, color); rect(t, 6, 3, 16, 6, front ? 0x5f878d : 0x3f6468); rect(t, 6, 3, 16, 1, 0x9dc1b5);
    rect(t, 2, 9, 24, 1, tone(color, 1.16)); rect(t, 1, 8, 2, 2, dark); rect(t, 25, 8, 2, 2, dark);
    if (front) { rect(t, 3, 11, 5, 3, 0xd4cc8c); rect(t, 20, 11, 5, 3, 0xd4cc8c); rect(t, 10, 12, 8, 3, dark); }
    else { rect(t, 3, 11, 4, 3, 0xb36c52); rect(t, 21, 11, 4, 3, 0xb36c52); rect(t, 11, 13, 6, 2, 0xc8c3a8); }
    rect(t, 2, 16, 24, 2, tone(color, .58)); rect(t, 3, 17, 5, 5, 0x142a2e); rect(t, 20, 17, 5, 5, 0x142a2e);
    return t;
  }
  function crateArt(clinic, looted) {
    const t = sheet(16, 14), body = clinic ? 0x7e9684 : 0x796446, lid = clinic ? 0xbec3a4 : 0xa8905e, edge = clinic ? 0xa1b09c : 0xbfaa77, strap = clinic ? 0x546d60 : 0x514d36;
    if (looted) {
      rect(t, 1, 5, 14, 9, tone(body, .82)); rect(t, 2, 6, 12, 3, 0x2e2a22); rect(t, 1, 0, 14, 3, tone(lid, .8)); rect(t, 1, 3, 14, 1, tone(edge, .8)); rect(t, 1, 13, 14, 1, tone(body, .6));
      return t;
    }
    rect(t, 1, 3, 14, 11, body); rect(t, 0, 1, 16, 4, lid); rect(t, 0, 1, 16, 1, edge); rect(t, 1, 13, 14, 1, tone(body, .66)); rect(t, 1, 5, 1, 8, tone(body, 1.12));
    if (clinic) { rect(t, 7, 6, 2, 6, 0xd5e0b6); rect(t, 5, 8, 6, 2, 0xd5e0b6); }
    else for (let i = 0; i < 8; i++) { dot(t, 3 + i * 1.4, 6 + i, strap); dot(t, 12 - i * 1.4, 6 + i, strap); }
    return t;
  }
  function sackArt(looted) {
    const t = sheet(14, 10), cloth = 0x8d7d5a;
    if (looted) { oval(t, 7, 8, 6.5, 2, tone(cloth, .72)); return t; }
    oval(t, 7, 6, 6.5, 4, cloth); oval(t, 6, 5, 4, 2.4, tone(cloth, 1.12)); rect(t, 6, 0, 2, 3, 0x6d6046); rect(t, 5, 2, 4, 1, 0x5a4f3a);
    return t;
  }
  function fireArt(frame) {
    const t = sheet(18, 16), lick = [0, 2, 1][frame];
    for (let i = 0; i < 6; i++) rect(t, 1 + i * 3, 13 + (i % 2), 3, 3 - (i % 2), i % 2 ? 0x8c8c73 : 0x617163);
    rect(t, 3, 11, 12, 2, 0x9b7050); rect(t, 4, 12, 10, 1, 0x6e4f39);
    tri(t, 3, 12, 9, 1 + lick, 15, 12, 0xdc873e); tri(t, 5, 12, 9 - (lick & 1), 5 + lick, 12, 12, 0xf2b25a); tri(t, 7, 12, 9, 7 + lick, 11, 12, 0xf7d47b);
    dot(t, 4 + lick * 3, 3 + lick, 0xf7d47b);
    return t;
  }
  function treeArt(variant) {
    const t = sheet(40, 72);
    rect(t, 18, 38, 4, 32, 0x6d6346); rect(t, 18, 38, 1, 32, 0x99815b); rect(t, 15, 69, 10, 3, 0x3d4732);
    if (variant % 3 === 0) {
      const shades = [0x1d3930, 0x274637, 0x2c4c3a, 0x35533e];
      for (let layer = 0; layer < 4; layer++) {
        const top = 1 + layer * 11, half = 6 + layer * 3.6;
        tri(t, 20, top, 20 - half, top + 17, 20 + half, top + 17, shades[layer]); tri(t, 20, top + 2, 20 - half * .45, top + 15, 20, top + 15, tone(shades[layer], 1.18));
        rect(t, 20 - half * .7, top + 15, half * .6, 1, 0x4b6342);
      }
    } else {
      oval(t, 20, 24, 18, 20, 0x18372c); oval(t, 15, 26, 13, 15, variant % 2 ? 0x2e4d35 : 0x294933); oval(t, 25, 17, 12, 13, 0x35583c);
      oval(t, 14, 13, 9, 9, 0x456345); oval(t, 27, 31, 9, 10, 0x244633);
      for (let i = 0; i < 18; i++) rect(t, 6 + ((hash(i, variant, 32) * 27) | 0), 5 + ((hash(i, variant, 66) * 34) | 0), 3, 1, i % 3 === 0 ? 0x66805a : 0x4f6d48);
    }
    return t;
  }
  function radioArt(parts, required, complete) {
    const t = sheet(28, 104);
    rect(t, 18, 6, 2, 76, 0x91a395); rect(t, 18, 6, 1, 76, 0xb4c2b2);
    for (const [y, w] of [[14, 14], [24, 10], [40, 6]]) rect(t, 19 - w / 2, y, w, 1, 0xc7c9a8);
    for (let i = 0; i < 40; i++) { dot(t, 18 - i * .3, 40 + i, 0x5d6b62); dot(t, 20 + i * .2, 40 + i, 0x5d6b62); }
    rect(t, 17, 2, 4, 4, complete ? 0xc9e8a6 : 0xe6a17a);
    rect(t, 2, 80, 24, 24, 0x697562); rect(t, 2, 80, 24, 3, 0xb0b18b); rect(t, 2, 100, 24, 4, 0x4a5547);
    rect(t, 5, 86, 10, 6, 0x263d3a); rect(t, 6, 87, 8, 2, 0x7caa81); rect(t, 18, 86, 3, 3, 0xd3c78d); rect(t, 22, 86, 3, 3, 0xd3c78d);
    for (let i = 0; i < Math.min(8, required); i++) rect(t, 5 + i * 4, 95, 3, 2, i < parts ? 0xb7cf8b : 0x384e42);
    return t;
  }
  function staticArt() {
    const art = {};
    art.grass = [];
    const bases = [0x35513e, 0x314c3b, 0x2e4838, 0x33503d];
    for (let biome = 0; biome < 5; biome++) for (let v = 0; v < 4; v++) {
      const t = sheet(32, 32, bases[v]);
      for (let i = 0; i < 24; i++) { const x = (hash(i, v, 6) * 30) | 0, y = 1 + ((hash(v, i, 91) * 30) | 0); rect(t, x, y, 2 + i % 3, 1, [0x46604a, 0x283f34, 0x3c5a45][i % 3]); if (i % 4 === 0) dot(t, x + 1, y - 1, 0x4f6c4e); }
      if (v === 1) { dot(t, 9, 13, 0xa49d66); dot(t, 22, 25, 0xa49d66); }
      if (biome === 1 || biome === 2) shade(t, 0x826f44, .26); else if (biome === 3) shade(t, 0x756d4c, .16); else if (biome === 4) shade(t, 0x173529, .2);
      if (biome === 2) for (let row = 5; row < 32; row += 8) { for (let y = row; y < row + 2; y++) for (let x = 0; x < 32; x++) t.data[y * 32 + x] = mix(t.data[y * 32 + x], 0x5a5039, .5); rect(t, 5 + v, row - 3, 2, 2, 0x749258); rect(t, 20 - v, row - 3, 2, 2, 0x749258); }
      art.grass.push(average(t));
    }
    art.road = [0x424b49, 0x454d4a, 0x424b49].map((base, i) => {
      const t = sheet(32, 32, base);
      for (let k = 0; k < 18; k++) dot(t, (hash(k, i, 17) * 32) | 0, (hash(i, k, 19) * 32) | 0, k % 2 ? 0x515852 : 0x3a4240);
      if (i === 2) { let x = 11; for (let y = 3; y < 30; y++) { dot(t, x, y, 0x323c38); if (y % 5 === 0) x += y % 10 ? 1 : -1; } }
      return average(t);
    });
    art.water = [0x284a54, 0x2b5056].map((base, i) => {
      const t = sheet(32, 32, base);
      rect(t, 4, 6 + i * 3, 13, 1, 0x3b6466); rect(t, 18, 22 - i * 4, 10, 1, 0x3b6466); rect(t, 11, 15, 13, 2, 0x203f47); rect(t, 2, 27, 8, 1, 0x4a7474);
      return average(t);
    });
    const sill = sheet(32, 32, 0x5f5340); for (let y = 0; y < 32; y += 6) rect(sill, 0, y, 32, 1, 0x4a4132); rect(sill, 0, 0, 32, 2, 0x7d6c50); art.threshold = average(sill);
    const ceiling = sheet(32, 32, 0x3d3930); for (let y = 0; y < 32; y += 8) { rect(ceiling, 0, y, 32, 1, 0x2f2c26); rect(ceiling, 0, y + 1, 32, 1, 0x48443a); } rect(ceiling, 0, 15, 32, 2, 0x34302a); art.ceiling = average(ceiling);
    art.zombies = [0, 1, 2, 3].map(v => [0, 1, 2].map(f => zombieArt(v, f)));
    art.humans = [[0x648d91, 0xa6bbb0, -1], [0x956754, 0xc39872, 0x6b3a2c]].map(([coat, trim, mask]) => [0, 1, 2].map(held => humanArt(coat, trim, 0xc4a27b, 0x58462e, 'none', 0, mask, held)));
    art.dogs = [0xaa895b, 0xc1aa80, 0x797969].map(dogArt); art.cats = [0xa59478, 0xbac1b0, 0x787b76].map(catArt);
    art.crate = crateArt(false, false); art.crateOpen = crateArt(false, true); art.clinic = crateArt(true, false); art.clinicOpen = crateArt(true, true);
    art.sack = sackArt(false); art.sackOpen = sackArt(true); art.fire = [0, 1, 2].map(fireArt);
    const barricade = sheet(26, 18); rect(barricade, 3, 0, 3, 18, 0x756e4d); rect(barricade, 20, 0, 3, 18, 0x6a6345);
    for (const y of [3, 10]) { rect(barricade, 0, y, 26, 4, 0xb19a67); rect(barricade, 0, y, 26, 1, 0xd0b785); rect(barricade, 0, y + 3, 26, 1, 0x8e7a52); dot(barricade, 4, y + 1, 0x615b42); dot(barricade, 21, y + 2, 0x615b42); }
    for (let i = 0; i < 14; i++) rect(barricade, 6 + i, 15 - i, 2, 1, 0x9c8659);
    art.barricade = barricade;
    art.trees = [0, 1, 2, 3, 4, 5, 6, 7].map(treeArt);
    const stairs = sheet(16, 12); rect(stairs, 1, 3, 14, 9, 0x34463e); for (let s = 0; s < 4; s++) rect(stairs, 2, 4 + s * 2, 12, 1, s % 2 ? 0xaaad8d : 0xc2bd96); tri(stairs, 8, 0, 4, 3, 12, 3, 0xdfcc89); art.stairs = stairs;
    art.rocks = [0x85977e, 0xa8b3b5, 0xcd9869].map(ore => { const t = sheet(18, 12); oval(t, 9, 7, 8.5, 5, 0x53685b); oval(t, 8, 5, 6, 3, 0x667a6c); for (let i = 0; i < 5; i++) dot(t, 5 + i * 2, 4 - (i % 2), 0x9ca795); rect(t, 6, 7, 2, 2, ore); rect(t, 11, 8, 2, 2, ore); dot(t, 9, 5, ore); return t; });
    art.plot = sheet(16, 8); rect(art.plot, 0, 5, 16, 3, 0x534b33); for (const x of [3, 8, 12]) { rect(art.plot, x, 3, 1, 2, 0x8aaa68); dot(art.plot, x - 1, 2, 0x8aaa68); }
    art.ripe = copy(art.plot); for (const x of [3, 8, 12]) { rect(art.ripe, x - 1, 0, 3, 3, 0xa6bd73); rect(art.ripe, x, 4, 1, 2, 0xd39750); }
    art.flag = sheet(10, 26); rect(art.flag, 1, 0, 1, 26, 0xd5c486); tri(art.flag, 2, 1, 10, 3.5, 2, 7, 0xc9c180);
    art.loot = sheet(4, 4, 0x172d2b); rect(art.loot, 1, 1, 2, 2, 0xebcd7e);
    // Distant hills and treeline around the horizon, as elevation angles by compass bucket.
    art.ridge = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const a = i / 1024 * TAU, crown = hash(i >> 3, 5, 9), next = hash(((i >> 3) + 1) & 127, 5, 9), t = (i & 7) / 8;
      art.ridge[i] = Math.max(0, .006 + .008 * Math.sin(a * 3 + 1) + .004 * Math.sin(a * 11 + 2) + .01 * (crown + (next - crown) * t) + .006 * hash(i, 6, 9) * (hash(i >> 1, 7, 9) > .55 ? 1 : 0));
    }
    // Fixed stars as (bearing, elevation, brightness); presentation only, never the simulation RNG.
    art.starList = new Float32Array(900);
    for (let i = 0; i < 300; i++) { art.starList[i * 3] = hash(i, 1, 5) * TAU; art.starList[i * 3 + 1] = .05 + Math.pow(hash(i, 2, 5), .7) * .9; art.starList[i * 3 + 2] = hash(i, 3, 5) > .85 ? 2 : hash(i, 4, 5) > .5 ? 1 : 0; }
    return art;
  }
  let shared = null;
  const themeCache = new Map();
  function themeKey(theme) { return [theme.wall, theme.floor, theme.trim, theme.accent, theme.material].join('|'); }
  function idHash(id) { const text = String(id === undefined || id === null ? 0 : id); let sum = 0; for (let i = 0; i < text.length; i++) sum += text.charCodeAt(i); return sum; }
  function byDepth(a, b) { return a.depth - b.depth; }

  class View {
    constructor() {
      shared = shared || staticArt();
      this.art = shared;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.w = 0; this.h = 0; this.hit = newHit(); this.pts = new Float64Array(32);
      this.themeIdx = new Int16Array(0); this.themeList = [DEFAULT_THEME]; this.themeSets = [null]; this.themeSource = null; this.themeBuildings = null;
      this.variant = new Uint8Array(0); this.biome = new Uint8Array(0); this.road = new Uint8Array(0); this.tileSource = null;
      this.pool = []; this.order = []; this.count = 0; this.seen = []; this.seenCount = 0;
      this.cars = new Map(); this.looks = new Map(); this.radios = new Map(); this.colors = new Map(); this.variants = new Map();
      this.steer = 0; this.lastYaw = 0; this.driving = false; this.attacking = false; this.mark = { active: false, sx: 0, sy: 0, label: '', distance: 0, side: 0, hidden: false };
      this.room = null; this.roomBox = { x0: 0, y0: 0, x1: 0, y1: 0 };
    }

    ensureSize(cssWidth, cssHeight) {
      const width = Math.max(1, finite(cssWidth, 640)), height = Math.max(1, finite(cssHeight, 400));
      // About one buffer pixel per 2.5 CSS pixels keeps the chunky look and a bounded per-frame cost.
      const w = clamp(Math.round(width / 2.5), 240, 640), h = clamp(Math.round(w * height / width), 120, 720);
      if (w === this.w && h === this.h) return;
      this.w = w; this.h = h; this.canvas.width = w; this.canvas.height = h;
      this.image = this.ctx.createImageData(w, h); this.out = new Uint32Array(this.image.data.buffer);
      this.zpix = new Float32Array(w * h); this.zcol = new Float32Array(w); this.topRow = new Int16Array(w); this.bottomRow = new Int16Array(w);
      this.frameCount = new Uint8Array(w); this.frameDepth = new Float32Array(w * FRAMES); this.frameTile = new Int8Array(w * FRAMES); this.frameSide = new Int8Array(w * FRAMES); this.frameU = new Float32Array(w * FRAMES); this.frameIndex = new Int32Array(w * FRAMES); this.ridgeRows = new Float32Array(w);
      this.rowDist = new Float32Array(h); this.rowMul = new Int32Array(h); this.rowR = new Int32Array(h); this.rowG = new Int32Array(h); this.rowB = new Int32Array(h);
      this.skyRow = new Uint32Array(h);
    }

    // Per-tile variant and biome depend only on the sector origin and seed; road markings also follow the
    // tiles, which a multiplayer snapshot replaces many times a second, so they rebuild separately.
    prepareTiles(state, ox, oy) {
      const width = state.width, height = state.height, n = width * height, tiles = state.tiles;
      if (this.tileOX !== ox || this.tileOY !== oy || this.tileSeed !== state.seed || this.variant.length !== n) {
        this.tileOX = ox; this.tileOY = oy; this.tileSeed = state.seed; this.tileSource = null;
        if (this.variant.length !== n) { this.variant = new Uint8Array(n); this.biome = new Uint8Array(n); this.road = new Uint8Array(n); }
        const world = state.world, names = world && world.activeBiomes || {}, codes = { farm: 1, industrial: 3, forest: 4 };
        let lastCx = NaN, lastCy = NaN, code = 0;
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
          const i = y * width + x, gx = x + ox, gy = y + oy, cx = Math.floor(gx / 64), cy = Math.floor(gy / 64);
          this.variant[i] = Math.floor(hash(gx, gy, state.seed) * 12);
          if (cx !== lastCx || cy !== lastCy) {
            lastCx = cx; lastCy = cy;
            const name = !world ? 'town' : names[cx + ',' + cy] || (Sirens.World && typeof Sirens.World.biome === 'function' ? Sirens.World.biome(state.seed, cx, cy) : world.biome || 'town');
            code = codes[name] || 0;
          }
          this.biome[i] = code === 1 && (gx % 13 + 13) % 13 > 2 && (gy % 17 + 17) % 17 > 2 ? 2 : code;
        }
      }
      if (this.tileSource === tiles) return;
      this.tileSource = tiles;
      const at = (x, y) => x < 0 || y < 0 || x >= width || y >= height ? -1 : tiles[y * width + x], road = this.road;
      road.fill(0);
      for (let i = 0; i < n; i++) {
        if (tiles[i] !== 1) continue;
        const x = i % width, y = (i - x) / width, up = at(x, y - 1) === 1, down = at(x, y + 1) === 1, left = at(x - 1, y) === 1, right = at(x + 1, y) === 1;
        let flags = (up ? 0 : 1) | (down ? 0 : 2) | (left ? 0 : 4) | (right ? 0 : 8);
        // The same lane stripe rule as the top-down road painter.
        if (up && down && (!left || at(x - 2, y) !== 1) && (y + oy) % 3 !== 0) flags |= 16;
        if (left && right && (!up || at(x, y - 2) !== 1) && (x + ox) % 3 !== 0) flags |= 32;
        road[i] = flags;
      }
    }

    prepareThemes(state, themes) {
      const n = state.width * state.height;
      if (this.themeSource === themes && this.themeBuildings === state.buildings && this.themeIdx.length === n) return;
      this.themeSource = themes; this.themeBuildings = state.buildings;
      if (this.themeIdx.length !== n) this.themeIdx = new Int16Array(n); else this.themeIdx.fill(0);
      this.themeList = [DEFAULT_THEME]; this.themeSets = [null];
      const slots = new Map();
      for (const b of state.buildings || []) {
        const theme = themes && themes.get(b); if (!theme) continue;
        const key = themeKey(theme); let slot = slots.get(key);
        if (slot === undefined) { slot = this.themeList.length; slots.set(key, slot); this.themeList.push(theme); this.themeSets.push(null); }
        for (let y = Math.max(0, b.y); y < Math.min(state.height, b.y + b.h); y++) this.themeIdx.fill(slot, y * state.width + Math.max(0, b.x), y * state.width + Math.min(state.width, b.x + b.w));
      }
    }

    themeSet(slot) {
      let set = this.themeSets[slot];
      if (!set) {
        const theme = this.themeList[slot] || DEFAULT_THEME, key = themeKey(theme);
        set = themeCache.get(key);
        if (!set) { set = themeArt(theme); themeCache.set(key, set); }
        this.themeSets[slot] = set;
      }
      return set;
    }

    // Renders one frame into the low-resolution buffer canvas. o: { width, height, yaw, clock, delta, motion, themes, originX, originY, pose, look, items }.
    render(state, o) {
      this.ensureSize(o.width, o.height);
      const W = this.w, H = this.h, out = this.out, zpix = this.zpix, zcol = this.zcol, topRow = this.topRow, art = this.art;
      const tiles = state.tiles, tw = state.width | 0, th = state.height | 0, p = state.player;
      const px = clamp(finite(p.x, 0) / TILE, .01, tw - .01), py = clamp(finite(p.y, 0) / TILE, .01, th - .01), yaw = wrap(o.yaw);
      const dirX = Math.cos(yaw), dirY = Math.sin(yaw), aspect = Math.max(.2, finite(o.width, W) / Math.max(1, finite(o.height, H)));
      const plane = Math.tan(clamp(2 * Math.atan(Math.tan(VFOV / 2) * aspect), MIN_HFOV, MAX_HFOV) / 2), planeX = -dirY * plane, planeY = dirX * plane, proj = W / 2 / plane;
      const pose = o.pose || { stride: 0, attack: null }, motion = !!o.motion;
      const horizon = Math.round(H * HORIZON + (motion && pose.stride ? Math.sin(pose.stride * 2) * H * .004 : 0));
      const upstairs = !!(state.stories && Number(state.stories.floor) > 0 && state.buildings && state.buildings[0]);
      if (upstairs) { const b = state.buildings[0]; this.roomBox.x0 = b.x; this.roomBox.y0 = b.y; this.roomBox.x1 = b.x + b.w; this.roomBox.y1 = b.y + b.h; this.room = this.roomBox; } else this.room = null;
      this.px = px; this.py = py; this.yaw = yaw; this.dirX = dirX; this.dirY = dirY; this.planeX = planeX; this.planeY = planeY; this.plane = plane; this.proj = proj; this.horizon = horizon; this.invDet = 1 / (planeX * dirY - dirX * planeY);
      this.prepareTiles(state, o.originX | 0, o.originY | 0); this.prepareThemes(state, o.themes);
      const weather = typeof state.weather === 'string' ? state.weather : state.weather && state.weather.type, env = sky(state.time, weather);
      this.env = env; this.bright = env.bright; this.fogStart = env.fogStart; this.fogSpan = Math.max(1, env.fogEnd - env.fogStart);
      const fogR = env.fog >> 16 & 255, fogG = env.fog >> 8 & 255, fogB = env.fog & 255, fogEnd = env.fogEnd, fogWord = word(env.fog);
      this.fogR = fogR; this.fogG = fogG; this.fogB = fogB;
      const rowDist = this.rowDist, rowMul = this.rowMul, rowR = this.rowR, rowG = this.rowG, rowB = this.rowB, skyRow = this.skyRow;
      for (let y = 0; y < H; y++) {
        const below = y >= horizon, d = below ? EYE * proj / (y + .5 - horizon) : (WALL - EYE) * proj / (horizon - y - .5);
        const f = haze(d, env.fogStart, this.fogSpan), k = env.bright * (below ? 1 : .8) * (1 - f);
        rowDist[y] = d; rowMul[y] = (k * 256) | 0; rowR[y] = (fogR * f) | 0; rowG[y] = (fogG * f) | 0; rowB[y] = (fogB * f) | 0;
        if (!below) { const e = Math.atan((horizon - y - .5) / proj); skyRow[y] = word(mix(env.low, env.top, Math.pow(clamp(e / .75, 0, 1), .8))); }
      }
      const ridgeRows = this.ridgeRows;
      for (let x = 0; x < W; x++) { const a = yaw + Math.atan((2 * (x + .5) / W - 1) * plane), bucket = ((Math.floor(a / TAU * 1024) % 1024) + 1024) % 1024; ridgeRows[x] = Math.round(art.ridge[bucket] * proj); }
      const ridgeWord = word(mix(env.fog, mix(0x2a4434, 0x0e1a1e, env.night), .2 + env.night * .14)), glow = clamp((env.night - .5) * 2, 0, 1);
      const starWords = [word(mix(env.top, 0xd8dccb, .3 * glow)), word(mix(env.top, 0xe9eadb, .55 * glow)), word(mix(env.top, 0xfff8e0, .85 * glow))];
      const hit = this.hit, room = this.room, themeIdx = this.themeIdx, variant = this.variant, biome = this.biome, road = this.road, sets = this.themeSets;
      const bottomRow = this.bottomRow, frameCount = this.frameCount, frameDepth = this.frameDepth, frameTile = this.frameTile, frameSide = this.frameSide, frameU = this.frameU, frameIndex = this.frameIndex;
      // Depth per pixel only matters where something nearer than a sprite can cover it: ceilings, frames and other
      // sprites. Walls clip sprites per column, and the floor in front of a sprite lies below its feet.
      zpix.fill(INF);
      const terrain = state._terrainHealth || null, grass = art.grass, roads = art.road, water = art.water, sill = art.threshold, ceiling = art.ceiling.data;
      const shift = motion ? (finite(o.clock, 0) * 4) | 0 : 0, edge = mix(env.fog, 0x14231d, .5), voidColor = 0x0c1c20, curb = 0x7d7f6c, stripe = 0xb9a76b;
      for (let x = 0; x < W; x++) {
        const cam = 2 * (x + .5) / W - 1, rdx = dirX + planeX * cam, rdy = dirY + planeY * cam;
        trace(tiles, tw, th, px, py, rdx, rdy, RAY, hit, room, themeIdx);
        let y0 = horizon, y1 = horizon, depth = INF, top = 0, span = 1;
        if (hit.kind === 1) {
          depth = Math.max(.04, hit.depth); const scale = proj / depth;
          top = horizon - (WALL - EYE) * scale; span = WALL * scale;
          y0 = clamp(Math.ceil(top - .5), 0, H); y1 = clamp(Math.ceil(top + span - .5), 0, H);
        }
        zcol[x] = depth; topRow[x] = y0;
        // Sky above, or the ceiling where the overhead point lies over a roofed tile. The overhead point
        // follows the ray's own ground track, so rows nearer than its first roofed tile are always sky.
        const ridge = ridgeRows[x], enter = Math.min(hit.enter, CEILING_REACH);
        for (let y = 0, i = x; y < y0; y++, i += W) {
          const d = rowDist[y];
          if (d >= enter && d < CEILING_REACH) {
            const wx = px + rdx * d, wy = py + rdy * d, tx = Math.floor(wx), ty = Math.floor(wy);
            if (tx >= 0 && ty >= 0 && tx < tw && ty < th && themeIdx[ty * tw + tx] > 0) {
              const c = ceiling[((wy - ty) * 32 | 0) << 5 | ((wx - tx) * 32 | 0)], m = rowMul[y];
              out[i] = 0xff000000 | (((c & 255) * m >> 8) + rowB[y]) << 16 | (((c >> 8 & 255) * m >> 8) + rowG[y]) << 8 | (((c >> 16 & 255) * m >> 8) + rowR[y]);
              zpix[i] = d; continue;
            }
          }
          out[i] = horizon - y - .5 < ridge ? ridgeWord : skyRow[y];
        }
        if (hit.kind === 1) {
          const index = hit.ty * tw + hit.tx, slot = themeIdx[index], set = sets[slot] || this.themeSet(slot), tile = hit.tile;
          const tex = tile === 6 ? set.door : tile === 8 ? set.window : terrain !== null && terrain[index] > 0 ? set.cracked : set.wall;
          const f = haze(depth, env.fogStart, this.fogSpan), m = (env.bright * (hit.side ? .84 : 1) * (1 - f) * 256) | 0, ar = (fogR * f) | 0, ag = (fogG * f) | 0, ab = (fogB * f) | 0;
          const data = tex.data, base = Math.min(31, (hit.u * 32) | 0) * 64, dv = 64 / span;
          let v = (y0 + .5 - top) * dv;
          for (let y = y0, i = y0 * W + x; y < y1; y++, i += W, v += dv) {
            const c = data[base + (v < 63 ? v | 0 : 63)];
            out[i] = 0xff000000 | (((c & 255) * m >> 8) + ab) << 16 | (((c >> 8 & 255) * m >> 8) + ag) << 8 | (((c >> 16 & 255) * m >> 8) + ar);
          }
        }
        // See-through frames wait until the floor is down; keep what the ray passed.
        bottomRow[x] = y1; frameCount[x] = hit.count;
        for (let k = 0; k < hit.count; k++) { const j = x * FRAMES + k; frameDepth[j] = hit.fDepth[k]; frameTile[j] = hit.fTile[k]; frameSide[j] = hit.fSide[k]; frameU[j] = hit.fU[k]; frameIndex[j] = hit.fTy[k] * tw + hit.fTx[k]; }
      }
      // Floor, row by row: grass, roads with curbs and lanes, water, doorway thresholds and building floors.
      // Each row is one distance, so the ground position steps linearly across it.
      for (let y = Math.max(0, horizon), row = y * W; y < H; y++, row += W) {
        const d = rowDist[y], m = rowMul[y], ar = rowR[y], ag = rowG[y], ab = rowB[y], far = d > MIP, lines = d < LINES;
        if (d >= fogEnd) { for (let x = 0; x < W; x++) if (y >= bottomRow[x]) out[row + x] = fogWord; continue; }
        const stepX = d * planeX * 2 / W, stepY = d * planeY * 2 / W;
        let wx = px + d * (dirX - planeX) + stepX / 2, wy = py + d * (dirY - planeY) + stepY / 2;
        for (let x = 0, i = row; x < W; x++, i++, wx += stepX, wy += stepY) {
          if (y < bottomRow[x]) continue;
          const tx = wx | 0, ty = wy | 0;
          let c;
          if (wx < 0 || wy < 0 || tx >= tw || ty >= th) c = edge;
          else if (room !== null && (tx < room.x0 || ty < room.y0 || tx >= room.x1 || ty >= room.y1)) c = voidColor;
          else {
            const ti = ty * tw + tx, t = tiles[ti], u = (wx - tx) * 32 | 0, v = (wy - ty) * 32 | 0;
            if (t === 0 || t === 5) { const g = grass[biome[ti] << 2 | variant[ti] & 3]; c = far ? g.avg : g.data[v << 5 | u]; }
            else if (t === 1) {
              const r = roads[variant[ti] === 8 ? 2 : variant[ti] % 3 ? 0 : 1], flags = road[ti]; c = far ? r.avg : r.data[v << 5 | u];
              if (flags && lines) {
                if (flags & 1 && v >= 1 && v < 3 || flags & 2 && v >= 29 && v < 31 || flags & 4 && u >= 1 && u < 3 || flags & 8 && u >= 29 && u < 31) c = curb;
                else if (flags & 16 && u >= 29 && u < 31 && v >= 4 && v < 28 || flags & 32 && v >= 29 && v < 31 && u >= 4 && u < 28) c = stripe;
              }
            }
            else if (t === 4) { const w = water[variant[ti] & 1]; c = far ? w.avg : w.data[((v + shift) & 31) << 5 | ((u + (shift >> 1)) & 31)]; }
            else if (t === 7) c = far ? sill.avg : sill.data[v << 5 | u];
            else { const slot = themeIdx[ti], set = sets[slot] || this.themeSet(slot), fl = set.floor; c = far ? fl.avg : fl.data[v << 5 | u]; }
          }
          out[i] = 0xff000000 | (((c & 255) * m >> 8) + ab) << 16 | (((c >> 8 & 255) * m >> 8) + ag) << 8 | (((c >> 16 & 255) * m >> 8) + ar);
        }
      }
      // See-through frames, far to near: only their solid texels are drawn.
      for (let x = 0; x < W; x++) for (let k = frameCount[x] - 1; k >= 0; k--) {
        const j = x * FRAMES + k, d = Math.max(.04, frameDepth[j]), scale = proj / d, ftop = horizon - (WALL - EYE) * scale, fspan = WALL * scale;
        const fy0 = clamp(Math.ceil(ftop - .5), 0, H), fy1 = clamp(Math.ceil(ftop + fspan - .5), 0, H);
        const index = frameIndex[j], slot = themeIdx[index], set = sets[slot] || this.themeSet(slot);
        const tex = frameTile[j] === 7 ? set.doorway : terrain !== null && terrain[index] === 0 ? set.broken : set.raised;
        const f = haze(d, env.fogStart, this.fogSpan), m = (env.bright * (frameSide[j] ? .84 : 1) * (1 - f) * 256) | 0, ar = (fogR * f) | 0, ag = (fogG * f) | 0, ab = (fogB * f) | 0;
        const data = tex.data, base = Math.min(31, (frameU[j] * 32) | 0) * 64, dv = 64 / fspan;
        let v = (fy0 + .5 - ftop) * dv;
        for (let y = fy0, i = fy0 * W + x; y < fy1; y++, i += W, v += dv) {
          const c = data[base + (v < 63 ? v | 0 : 63)];
          if (c < 0 || d >= zpix[i]) continue;
          out[i] = 0xff000000 | (((c & 255) * m >> 8) + ab) << 16 | (((c >> 8 & 255) * m >> 8) + ag) << 8 | (((c >> 16 & 255) * m >> 8) + ar);
          zpix[i] = d;
        }
      }
      // Stars are points at fixed compass bearings, drawn only on open sky.
      if (env.night > .5 && !env.grey) {
        const list = art.starList;
        for (let k = 0; k < list.length; k += 3) {
          const rel = wrap(list[k] - yaw);
          if (Math.abs(rel) > 1.2) continue;
          const x = Math.floor(W / 2 * (1 + Math.tan(rel) / plane)), y = Math.floor(horizon - Math.tan(list[k + 1]) * proj);
          if (x < 0 || x >= W || y < 0 || y >= horizon || y >= topRow[x] || horizon - y - .5 < ridgeRows[x] || zpix[y * W + x] < INF) continue;
          out[y * W + x] = starWords[list[k + 2]];
        }
      }
      this.gather(state, o);
      const order = this.order; order.length = this.count;
      for (let i = 0; i < this.count; i++) order[i] = this.pool[i];
      order.sort(byDepth);
      this.seenCount = 0;
      for (let i = 0; i < order.length; i++) { const s = order[i]; this.drawSprite(s); if (s.drawn) this.remember(s); }
      this.waypoint(state);
      this.viewModel(state, o);
      if (!LITTLE) for (let i = 0; i < out.length; i++) { const c = out[i]; out[i] = ((c & 255) << 24 | (c >> 8 & 255) << 16 | (c >> 16 & 255) << 8 | c >>> 24) >>> 0; }
      this.ctx.putImageData(this.image, 0, 0);
    }

    // Projects a world point (local pixels) into a pooled sprite record, or skips it when out of view.
    add(kind, id, x, y, tex, ww, wh, z, reach) {
      const dx = finite(x, -1e6) / TILE - this.px, dy = finite(y, -1e6) / TILE - this.py, limit = reach || VIEW;
      if (dx * dx + dy * dy > limit * limit) return null;
      const depth = this.invDet * (-this.planeY * dx + this.planeX * dy);
      if (depth < .2) return null;
      const sx = this.w / 2 * (1 + this.invDet * (this.dirY * dx - this.dirX * dy) / depth), half = ww / 2 * this.proj / depth;
      if (sx + half < 0 || sx - half > this.w) return null;
      let s = this.pool[this.count];
      if (!s) s = this.pool[this.count] = { kind: '', id: null, x: 0, y: 0, depth: 0, sx: 0, tex: null, ww: 0, wh: 0, z: 0, mirror: false, flash: 0, glow: 0, bar: -1, barColor: 0, mark: -1, loot: 0, drawn: 0, top: 0, label: null };
      this.count++;
      s.kind = kind; s.id = id; s.x = x; s.y = y; s.depth = depth; s.sx = sx; s.tex = tex; s.ww = ww; s.wh = wh; s.z = z;
      s.mirror = false; s.flash = 0; s.glow = 0; s.bar = -1; s.barColor = 0; s.mark = -1; s.loot = 0; s.drawn = 0; s.top = 0; s.label = null;
      return s;
    }

    facing(angle) { return Math.cos(finite(angle, 0)) * -this.dirY + Math.sin(finite(angle, 0)) * this.dirX; }

    gather(state, o) {
      this.count = 0;
      const art = this.art, p = state.player, clock = finite(o.clock, 0), motion = !!o.motion, upstairs = !!this.room, items = o.items || {};
      if (this.variants.size > 4096) this.variants.clear();
      for (const z of state.zombies || []) {
        if (!(z.health > 0)) continue;
        let v = this.variants.get(z.id); if (v === undefined) { v = idHash(z.id) % 4; this.variants.set(z.id, v); }
        const windup = z.windup > 0, frame = windup ? 2 : motion ? ((clock * 3.2 + v * .37) | 0) & 1 : 0;
        const s = this.add('zombie', z.id, z.x, z.y, art.zombies[v][frame], .83, 1.5, motion ? Math.abs(Math.sin(clock * 6.4 + v)) * .035 : 0);
        if (!s) continue;
        if (z._stun > 0 && (!motion || ((clock * 14) | 0) % 2 === 0)) s.flash = 1;
        if (z.health < 70) { s.bar = clamp(z.health / 100, .03, 1); s.barColor = 0xbf8770; }
      }
      for (const h of state.humans || []) {
        if (!(h.health > 0)) continue;
        const hostile = /raider|hostile/i.test(h.faction || ''), item = items[h.weapon];
        const held = hostile || h.weapon && h.weapon !== 'none' ? item && item.weapon && item.weapon.kind === 'melee' ? 1 : 2 : 0;
        const s = this.add('human', h.id, h.x, h.y, art.humans[hostile ? 1 : 0][held], .83, 1.5, 0);
        if (!s) continue;
        s.mark = hostile ? 0xe3a07e : h.following ? 0xb4d595 : 0xaad0c9;
        if (h.health < 80) { s.bar = clamp(h.health / 100, .03, 1); s.barColor = hostile ? 0xc28a70 : 0xacc593; }
        if (s.depth < 5.5) s.label = String(h.name || (hostile ? 'Raider' : 'Survivor'));
      }
      for (const peer of state.party || []) {
        const other = peer && peer.player;
        if (!other || !(other.health > 0) || other.vehicleId) continue;
        const s = this.add('partner', peer.id, other.x, other.y, this.lookArt(peer.look), .83, 1.5, 0);
        if (!s) continue;
        s.label = String(peer.name || 'Survivor').slice(0, 24); s.bar = clamp(other.health / 100, 0, 1); s.barColor = 0xa9d794; s.mark = 0x9ce5dc;
      }
      if (!upstairs && Sirens.Personal) {
        const P = Sirens.Personal;
        for (const pet of P.wild(state)) this.addPet(pet, pet.x, pet.y, false, clock, motion);
        for (const pet of P.ensure(state).pets) { const at = P.local(state, pet); this.addPet(pet, at.x, at.y, true, clock, motion); }
      }
      for (const v of state.vehicles || []) {
        if (v.id === p.vehicleId) continue;
        const dx = v.x - p.x, dy = v.y - p.y, length = Math.hypot(dx, dy) || 1, angle = finite(v.angle, 0), along = (Math.cos(angle) * dx + Math.sin(angle) * dy) / length;
        const side = Math.sqrt(Math.max(0, 1 - along * along)), view = side > .62 ? 'side' : along > 0 ? 'rear' : 'front';
        const s = this.add('vehicle', v.id, v.x, v.y, this.carArt(v.color, view), 1.05 + .8 * side, .82, 0);
        if (s && view === 'side') s.mirror = this.facing(angle) < 0;
      }
      for (const c of state.containers || []) {
        const s = this.add('container', c.id, c.x, c.y, art.crate, c._ground ? .5 : .62, c._ground ? .36 : .54, 0);
        if (!s) continue;
        let loaded = false;
        if (!c.looted) for (const key in c.items || {}) if (c.items[key] > 0) { loaded = true; break; }
        if (c._ground) { s.tex = loaded ? art.sack : art.sackOpen; s.ww = .5; s.wh = .36; }
        else if (/med|aid|clinic|pharmacy/i.test(String(c.label || ''))) s.tex = c.looted ? art.clinicOpen : art.clinic;
        else s.tex = c.looted ? art.crateOpen : art.crate;
        if (loaded) { const marker = this.add('loot', c.id, c.x, c.y, art.loot, .1, .1, .8 + (motion ? Math.sin(clock * 2.5 + (Number(c.id) || 0)) * .05 : 0)); if (marker) marker.glow = 1; }
      }
      for (const b of state.structures || []) {
        if (b.health !== undefined && !(b.health > 0)) continue;
        if (b.type === 'campfire') { const s = this.add('campfire', b.id, b.x, b.y, art.fire[motion ? ((clock * 9) | 0) % 3 : 0], .72, .64, 0); if (s) s.glow = 1; }
        else this.add('barricade', b.id, b.x, b.y, art.barricade, 1.2, .83, 0);
      }
      const goal = state.goal;
      if (goal && !upstairs && Number.isFinite(goal.radioX) && Number.isFinite(goal.radioY)) this.add('radio', 'radio', goal.radioX, goal.radioY, this.radioArt(goal), 1.2, 4.46, 0, 40);
      for (const b of state.buildings || []) if (b.stairs) this.add('stairs', b.name || null, (b.stairs.x + .5) * TILE, (b.stairs.y + .5) * TILE, art.stairs, .7, .52, 0);
      if (!upstairs && Sirens.Settlement) {
        const B = Sirens.Settlement, base = B.ensure(state), ox = state.world ? state.world.originX * TILE : 0, oy = state.world ? state.world.originY * TILE : 0;
        const bounds = { minX: Math.max(0, Math.floor(this.px - 14)), minY: Math.max(0, Math.floor(this.py - 14)), maxX: Math.min(state.width, Math.ceil(this.px + 14)), maxY: Math.min(state.height, Math.ceil(this.py + 14)) };
        for (const node of B.nodes(state, bounds)) this.add('deposit', node.id, node.x, node.y, art.rocks[node.type === 'iron' ? 1 : node.type === 'copper' ? 2 : 0], .75, .5, 0);
        for (const plot of base.plots || []) this.add('plot', plot.id, plot.x - ox, plot.y - oy, plot.progress >= 90 ? art.ripe : art.plot, .6, .3, 0);
        if (base.home) this.add('home', 'home', base.home.x - ox, base.home.y - oy, art.flag, .35, .91, 0);
      }
      const tiles = state.tiles, tw = state.width, variant = this.variant;
      const x0 = Math.max(0, Math.floor(this.px - TREE_VIEW)), x1 = Math.min(state.width - 1, Math.ceil(this.px + TREE_VIEW)), y0 = Math.max(0, Math.floor(this.py - TREE_VIEW)), y1 = Math.min(state.height - 1, Math.ceil(this.py + TREE_VIEW));
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
        const i = ty * tw + tx;
        if (tiles[i] === 5) this.add('tree', i, (tx + .5) * TILE, (ty + .5) * TILE, art.trees[variant[i] % 8], 2.5, 4.5, -.06, TREE_VIEW);
      }
      // Hit sparks and dust as small specks; those right in front of the eye would only blot out the view.
      let shown = 0;
      for (const particle of state.particles || []) {
        if (shown > 160) break;
        const life = particle.life / (particle.maxLife || 1);
        if (!(life > .12)) continue;
        const speck = this.add('particle', null, particle.x, particle.y, this.colorArt(particle.color), .05, .05, .55 + (1 - Math.min(1, life)) * .4, 12);
        if (speck && speck.depth < 1.6) this.count--; else if (speck) shown++;
      }
    }

    addPet(pet, x, y, owned, clock, motion) {
      const dog = pet.kind === 'dog', v = idHash(pet.id) % 3;
      const s = this.add('pet', pet.id, x, y, dog ? this.art.dogs[v] : this.art.cats[v], dog ? .75 : .5, dog ? .44 : .375, pet.moving && motion ? Math.abs(Math.sin(clock * 12)) * .03 : 0);
      if (!s) return;
      s.mirror = this.facing(pet.angle) < 0;
      if (s.depth < (owned ? 5 : 3)) s.label = owned ? String(pet.name || 'Pet') : 'Stray ' + pet.kind;
    }
    carArt(color, view) {
      const key = String(color || '#648275') + view;
      let tex = this.cars.get(key);
      if (!tex) { const c = hex(color, 0x648275); tex = view === 'side' ? carSide(c) : carEnd(c, view === 'front'); this.cars.set(key, tex); }
      return tex;
    }
    lookArt(look) {
      const l = look || {}, key = [l.coat, l.skin, l.hair, l.hat, l.hatColor].join('|');
      let tex = this.looks.get(key);
      if (!tex) { if (this.looks.size > 64) this.looks.clear(); const coat = hex(l.coat, 0xa99b69); tex = humanArt(coat, tone(coat, 1.25), hex(l.skin, 0xddbc88), hex(l.hair, 0x382e26), l.hat, hex(l.hatColor, 0x6b7a5a), -1, 0); this.looks.set(key, tex); }
      return tex;
    }
    radioArt(goal) {
      const parts = clamp(Math.floor(finite(goal.parts, 0)), 0, 8), required = clamp(Math.floor(finite(goal.required, 5)), 1, 8), key = parts + ':' + required + ':' + !!goal.complete;
      let tex = this.radios.get(key); if (!tex) { tex = radioArt(parts, required, !!goal.complete); this.radios.set(key, tex); }
      return tex;
    }
    colorArt(color) {
      let tex = this.colors.get(color);
      if (!tex) { if (this.colors.size > 64) this.colors.clear(); tex = sheet(1, 1, hex(color, 0xd5c58d)); this.colors.set(color, tex); }
      return tex;
    }

    drawSprite(s) {
      const W = this.w, H = this.h, out = this.out, zpix = this.zpix, zcol = this.zcol, topRow = this.topRow, tex = s.tex, depth = s.depth, scale = this.proj / depth;
      const sw = s.ww * scale, sh = s.wh * scale, bottom = this.horizon + (EYE - s.z) * scale, top = bottom - sh, left = s.sx - sw / 2;
      s.top = top;
      const x0 = Math.max(0, Math.ceil(left - .5)), x1 = Math.min(W, Math.ceil(left + sw - .5)), y0 = Math.max(0, Math.ceil(top - .5)), y1 = Math.min(H, Math.ceil(bottom - .5));
      if (x0 >= x1 || y0 >= y1) return;
      const f = haze(depth, this.fogStart, this.fogSpan), m = ((s.glow ? 1 : this.bright) * (1 - f) * 256) | 0, ar = (this.fogR * f) | 0, ag = (this.fogG * f) | 0, ab = (this.fogB * f) | 0;
      const tw = tex.w, th = tex.h, data = tex.data, du = tw / sw, dv = th / sh, flash = s.flash, mirror = s.mirror;
      let drawn = 0;
      for (let x = x0; x < x1; x++) {
        // Behind the column's wall only the part above the wall top can show (a tree over a roofline).
        let hi = y1; if (depth >= zcol[x]) { hi = Math.min(hi, topRow[x]); if (hi <= y0) continue; }
        let u = ((x + .5 - left) * du) | 0; if (u >= tw) u = tw - 1; if (mirror) u = tw - 1 - u;
        let v = (y0 + .5 - top) * dv;
        for (let y = y0, i = y0 * W + x; y < hi; y++, i += W, v += dv) {
          if (depth >= zpix[i]) continue;
          const vi = v | 0; if (vi >= th) break;
          const c = data[vi * tw + u]; if (c < 0) continue;
          let r = ((c >> 16 & 255) * m >> 8) + ar, g = ((c >> 8 & 255) * m >> 8) + ag, b = ((c & 255) * m >> 8) + ab;
          if (flash) { r = (r + 238) >> 1; g = (g + 228) >> 1; b = (b + 200) >> 1; }
          out[i] = 0xff000000 | b << 16 | g << 8 | r; zpix[i] = depth; drawn++;
        }
      }
      s.drawn = drawn;
      if (!drawn) return;
      // Bars and markers stay small near the eye so they never hide what they label.
      const lift = clamp(scale * .08, 2, 6);
      if (s.bar >= 0 && depth < 12) {
        const bw = clamp(sw * .7, 6, this.h * .16), bh = clamp(Math.round(scale * .035), 2, 4), bx = s.sx - bw / 2, by = top - lift - bh;
        this.patch(bx, by, bw, bh, 0x152622, depth - .01, m, ar, ag, ab); this.patch(bx, by, Math.max(1, bw * s.bar), bh, s.barColor, depth - .02, m, ar, ag, ab);
      }
      if (s.mark >= 0 && depth < 14) {
        const r = clamp(scale * .07, 2, this.h * .018), cy = top - lift * (s.bar >= 0 ? 2.6 : 1.4) - r, cx = s.sx;
        for (let y = Math.max(0, Math.ceil(cy - r - .5)); y < Math.min(H, Math.ceil(cy + r - .5)); y++) {
          const half = r - Math.abs(y + .5 - cy);
          for (let x = Math.max(0, Math.ceil(cx - half - .5)); x < Math.min(W, Math.ceil(cx + half - .5)); x++) this.plot(y * W + x, s.mark, depth - .02, m, ar, ag, ab);
        }
      }
    }
    patch(x, y, w, h, color, depth, m, ar, ag, ab) {
      const W = this.w, x0 = Math.max(0, Math.ceil(x - .5)), x1 = Math.min(W, Math.ceil(x + w - .5)), y0 = Math.max(0, Math.ceil(y - .5)), y1 = Math.min(this.h, Math.ceil(y + h - .5));
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) this.plot(yy * W + xx, color, depth, m, ar, ag, ab);
    }
    plot(i, c, depth, m, ar, ag, ab) {
      if (depth >= this.zpix[i]) return;
      this.out[i] = 0xff000000 | (((c & 255) * m >> 8) + ab) << 16 | (((c >> 8 & 255) * m >> 8) + ag) << 8 | (((c >> 16 & 255) * m >> 8) + ar);
      this.zpix[i] = depth;
    }
    remember(s) {
      let e = this.seen[this.seenCount];
      if (!e) e = this.seen[this.seenCount] = { kind: '', id: null, x: 0, y: 0, depth: 0, column: 0, top: 0, label: null, pixels: 0 };
      this.seenCount++;
      e.kind = s.kind; e.id = s.id; e.x = s.x; e.y = s.y; e.depth = s.depth; e.column = s.sx; e.top = s.top; e.label = s.label; e.pixels = s.drawn;
    }

    // The journal waypoint floats as a diamond above its spot; behind a wall it dims rather than vanishing.
    waypoint(state) {
      const mark = this.mark, point = Sirens.Progression && typeof Sirens.Progression.waypoint === 'function' ? Sirens.Progression.waypoint(state) : null;
      mark.active = !!point;
      if (!point) return;
      const dx = finite(point.x, 0) / TILE - this.px, dy = finite(point.y, 0) / TILE - this.py, depth = this.invDet * (-this.planeY * dx + this.planeX * dy);
      const across = this.invDet * (this.dirY * dx - this.dirX * dy);
      mark.label = String(point.label || 'Marker'); mark.distance = Math.round(Math.hypot(dx, dy));
      mark.side = across >= 0 ? 1 : -1; mark.onScreen = false;
      if (depth < .3) return;
      const sx = this.w / 2 * (1 + across / depth);
      if (sx < 0 || sx >= this.w) return;
      const scale = this.proj / Math.max(depth, 1), r = Math.max(3, Math.min(this.h * .05, .28 * scale)), sy = clamp(this.horizon + (EYE - 2.3) * this.proj / depth, r + 2, this.h * .8);
      const hidden = depth >= this.zcol[clamp(sx | 0, 0, this.w - 1)];
      mark.onScreen = true; mark.sx = sx; mark.sy = sy; mark.hidden = hidden;
      const rim = hidden ? 0x9c8a62 : 0xeac78b, core = hidden ? 0x14211d : 0x172c27;
      for (let y = Math.max(0, Math.ceil(sy - r - .5)); y < Math.min(this.h, Math.ceil(sy + r - .5)); y++) {
        const half = r - Math.abs(y + .5 - sy);
        for (let x = Math.max(0, Math.ceil(sx - half - .5)); x < Math.min(this.w, Math.ceil(sx + half - .5)); x++) {
          const inner = Math.abs(x + .5 - sx) + Math.abs(y + .5 - sy) < r - 1.6;
          this.out[y * this.w + x] = word(inner ? (Math.abs(x + .5 - sx) + Math.abs(y + .5 - sy) < r * .3 ? rim : core) : rim);
        }
      }
    }

    // Convex polygon fill straight into the frame buffer, so the hands share the world's pixels.
    poly(n, color, alpha) {
      const pts = this.pts, W = this.w, out = this.out, light = this.light;
      const r0 = clamp(Math.round((color >> 16 & 255) * light), 0, 255), g0 = clamp(Math.round((color >> 8 & 255) * light), 0, 255), b0 = clamp(Math.round((color & 255) * light), 0, 255);
      const a = alpha === undefined ? 1 : clamp(alpha, 0, 1), solid = 0xff000000 | b0 << 16 | g0 << 8 | r0;
      let minY = Infinity, maxY = -Infinity;
      for (let k = 0; k < n; k++) { const y = pts[k * 2 + 1]; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      for (let y = Math.max(0, Math.ceil(minY - .5)), end = Math.min(this.h, Math.ceil(maxY - .5)); y < end; y++) {
        const cy = y + .5; let left = Infinity, right = -Infinity;
        for (let k = 0; k < n; k++) {
          const ax = pts[k * 2], ay = pts[k * 2 + 1], j = (k + 1) % n, bx = pts[j * 2], by = pts[j * 2 + 1];
          if (ay <= cy && by > cy || by <= cy && ay > cy) { const x = ax + (cy - ay) / (by - ay) * (bx - ax); if (x < left) left = x; if (x > right) right = x; }
        }
        if (!(left < right)) continue;
        for (let x = Math.max(0, Math.ceil(left - .5)), xEnd = Math.min(W, Math.ceil(right - .5)), i = y * W + x; x < xEnd; x++, i++) {
          if (a >= 1) { out[i] = solid; continue; }
          const c = out[i], r = c & 255, g = c >> 8 & 255, b = c >> 16 & 255;
          out[i] = 0xff000000 | (b + (b0 - b) * a | 0) << 16 | (g + (g0 - g) * a | 0) << 8 | (r + (r0 - r) * a | 0);
        }
      }
    }
    quad(ax, ay, bx, by, cx, cy, dx, dy, color, alpha) { const p = this.pts; p[0] = ax; p[1] = ay; p[2] = bx; p[3] = by; p[4] = cx; p[5] = cy; p[6] = dx; p[7] = dy; this.poly(4, color, alpha); }
    triangle(ax, ay, bx, by, cx, cy, color, alpha) { const p = this.pts; p[0] = ax; p[1] = ay; p[2] = bx; p[3] = by; p[4] = cx; p[5] = cy; this.poly(3, color, alpha); }
    // A tapered bar from (ax, ay) to (bx, by) with half-widths wa and wb.
    beam(ax, ay, bx, by, wa, wb, color, alpha) {
      const dx = bx - ax, dy = by - ay, length = Math.hypot(dx, dy) || 1, nx = -dy / length, ny = dx / length;
      this.quad(ax + nx * wa, ay + ny * wa, bx + nx * wb, by + ny * wb, bx - nx * wb, by - ny * wb, ax - nx * wa, ay - ny * wa, color, alpha);
    }
    disc(cx, cy, r, color, alpha) {
      const p = this.pts, n = r > 7 ? 16 : 8;
      for (let k = 0; k < n; k++) { const a = (k + .5) / n * TAU; p[k * 2] = cx + Math.cos(a) * r; p[k * 2 + 1] = cy + Math.sin(a) * r; }
      this.poly(n, color, alpha);
    }

    viewModel(state, o) {
      const p = state.player, W = this.w, H = this.h, U = H / 180, env = this.env;
      this.light = .74 + .26 * env.bright;
      const car = p.vehicleId ? (state.vehicles || []).find(v => v.id === p.vehicleId) : null, delta = clamp(finite(o.delta, 1 / 60), .001, .1);
      const turn = car ? clamp(wrap(this.yaw - this.lastYaw) / delta / 1.65, -1, 1) : 0;
      this.steer += (turn - this.steer) * Math.min(1, delta * 9); this.lastYaw = this.yaw; this.driving = !!car;
      if (car) { this.dashboard(car, o); this.attacking = false; return; }
      const pose = o.pose || {}, attack = pose.attack, look = o.look || {}, skin = hex(look.skin, 0xddbc88), coat = hex(look.coat, 0xa99b69);
      const style = weaponStyle(attack ? attack.weapon : p.weapon, o.items), prog = attack ? clamp(finite(attack.progress, 1), 0, 1) : -1;
      this.attacking = prog >= 0;
      const walking = o.motion && pose.stride, bx = walking ? Math.sin(pose.stride) * W * .012 : 0, by = (walking ? Math.abs(Math.cos(pose.stride)) * H * .022 : 0) + (o.motion ? Math.sin(finite(o.clock, 0) * 1.7) * H * .004 : 0);
      if (style === 'pistol' || style === 'rifle' || style === 'bow') this.gun(style, prog, skin, coat, bx, by, U);
      else if (style === 'spear' || style === 'knife') this.thrust(style, prog, skin, coat, bx, by, U);
      else this.swing(style, prog, skin, coat, bx, by, U);
    }
    fist(gx, gy, nx, ny, dx, dy, skin, U) {
      this.disc(gx, gy, 6.2 * U, skin); this.beam(gx - nx * 4.5 * U + dx * 2 * U, gy - ny * 4.5 * U + dy * 2 * U, gx + nx * 4.5 * U + dx * 2 * U, gy + ny * 4.5 * U + dy * 2 * U, 1.1 * U, 1.1 * U, tone(skin, .8));
    }
    swing(style, prog, skin, coat, bx, by, U) {
      const W = this.w, H = this.h;
      let gx = W * .75 + bx, gy = H * .9 + by, angle = -.42, strike = -1;
      if (prog >= 0) {
        if (prog < .16) { const k = ease(prog / .16); angle = -.42 + .77 * k; gx += W * .03 * k; gy -= H * .03 * k; }
        else if (prog < .55) { const k = smooth((prog - .16) / .39); angle = .35 - 2.5 * k; gx = W * (.77 - .43 * k) + bx; gy = H * (.87 - Math.sin(k * Math.PI) * .1) + by; strike = k; }
        else { const k = smooth((prog - .55) / .45); angle = -2.15 + 1.73 * k; gx = W * (.34 + .41 * k) + bx; gy = H * (.9 + Math.sin(k * Math.PI) * .06) + by; }
      }
      const length = H * (style === 'blade' ? .5 : style === 'hammer' || style === 'axe' || style === 'pick' ? .46 : .5);
      if (strike > 0) {
        // A pale streak traces the head of the swing.
        let lx = 0, ly = 0;
        for (let i = 0; i <= 6; i++) {
          const k = Math.max(0, strike - i * .055), a = .35 - 2.5 * k, hx = W * (.77 - .43 * k) + bx, hy = H * (.87 - Math.sin(k * Math.PI) * .1) + by;
          const tx = hx + Math.sin(a) * length, ty = hy - Math.cos(a) * length;
          if (i) this.beam(lx, ly, tx, ty, (4 - i * .45) * U, (4 - i * .5) * U, 0xf3e6b0, .3 - i * .04);
          lx = tx; ly = ty;
        }
      }
      const dx = Math.sin(angle), dy = -Math.cos(angle), nx = Math.cos(angle), ny = Math.sin(angle);
      this.beam(gx + W * .13, gy + H * .28, gx + dx * 2 * U, gy + dy * 2 * U, 13 * U, 9 * U, coat); this.beam(gx + W * .13 + 4 * U, gy + H * .28, gx + dx * 2 * U + 5 * U, gy + dy * 2 * U, 4 * U, 3 * U, tone(coat, .78));
      const at = (t, side) => [gx + dx * length * t + nx * side * U, gy + dy * length * t + ny * side * U];
      if (style === 'blade') {
        const [hx, hy] = at(-.08, 0), [gx2, gy2] = at(.16, 0), [tx, ty] = at(1, 0);
        this.beam(hx, hy, gx2, gy2, 2.2 * U, 2.2 * U, 0x2f2a24); this.beam(gx2 - nx * 6 * U, gy2 - ny * 6 * U, gx2 + nx * 6 * U, gy2 + ny * 6 * U, 1.6 * U, 1.6 * U, 0x8d8a74);
        this.beam(gx2, gy2, tx - dx * 6 * U, ty - dy * 6 * U, 3.4 * U, 2.8 * U, 0xc9d2bb); this.triangle(tx - dx * 6 * U + nx * 2.8 * U, ty - dy * 6 * U + ny * 2.8 * U, tx - dx * 6 * U - nx * 2.8 * U, ty - dy * 6 * U - ny * 2.8 * U, tx, ty, 0xc9d2bb);
        this.beam(gx2 - nx * 2 * U, gy2 - ny * 2 * U, tx - dx * 7 * U - nx * 1.6 * U, ty - dy * 7 * U - ny * 1.6 * U, .9 * U, .7 * U, 0xf3f2d3);
      } else {
        const [hx, hy] = at(-.08, 0), [ex, ey] = at(style === 'club' ? .36 : 1, 0);
        this.beam(hx, hy, ex, ey, 2.3 * U, 2.6 * U, style === 'club' ? 0x766e4c : 0x8a6f4a);
        if (style === 'club') {
          const [tx, ty] = at(1, 0);
          this.beam(ex, ey, tx, ty, 3.2 * U, 5.4 * U, 0xd6c28c); this.disc(tx, ty, 5.4 * U, 0xc4b07a);
          this.beam(ex - nx * 1.8 * U, ey - ny * 1.8 * U, tx - nx * 3.6 * U - dx * 2 * U, ty - ny * 3.6 * U - dy * 2 * U, .8 * U, 1.2 * U, 0xece0b0);
          this.beam(ex + nx * 1.8 * U, ey + ny * 1.8 * U, tx + nx * 3.8 * U - dx * 2 * U, ty + ny * 3.8 * U - dy * 2 * U, .8 * U, 1.1 * U, 0xae9b68);
        } else if (style === 'axe') {
          const [a1, a2] = at(.84, 2), [b1, b2] = at(.98, 2), [c1, c2] = at(1.02, -14), [d1, d2] = at(.78, -14);
          this.quad(a1, a2, b1, b2, c1, c2, d1, d2, 0xa8b2a0); this.beam(c1, c2, d1, d2, 1.2 * U, 1.2 * U, 0xeef1d3);
          const [e1, e2] = at(.86, 4), [f1, f2] = at(.96, 4); this.beam(e1, e2, f1, f2, 2 * U, 2 * U, 0x6d7468);
        } else if (style === 'hammer') {
          const [a1, a2] = at(.9, 0); this.beam(a1 - nx * 9 * U, a2 - ny * 9 * U, a1 + nx * 9 * U, a2 + ny * 9 * U, 5 * U, 5 * U, 0x8f9a93); this.beam(a1 - nx * 9 * U - dx * 3 * U, a2 - ny * 9 * U - dy * 3 * U, a1 + nx * 9 * U - dx * 3 * U, a2 + ny * 9 * U - dy * 3 * U, 1 * U, 1 * U, 0xc9d3cc);
        } else {
          const [a1, a2] = at(.92, 0), [l1, l2] = at(.8, -15), [r1, r2] = at(.84, 12);
          this.beam(a1, a2, l1, l2, 2.6 * U, 1 * U, 0x93a58e); this.beam(a1, a2, r1, r2, 2.6 * U, 1.2 * U, 0x93a58e); this.disc(a1, a2, 3 * U, 0x7c8c78);
        }
      }
      this.fist(gx, gy, nx, ny, dx, dy, skin, U);
    }
    thrust(style, prog, skin, coat, bx, by, U) {
      const W = this.w, H = this.h, ext = prog < 0 ? 0 : prog < .3 ? ease(prog / .3) : 1 - smooth((prog - .3) / .7);
      if (style === 'spear') {
        const gx = W * (.7 - .08 * ext) + bx, gy = H * (.93 - .1 * ext) + by, tx = W * .5 + bx * .3, ty = this.horizon + H * (.07 - .02 * ext);
        const dx = tx - gx, dy = ty - gy, length = Math.hypot(dx, dy) || 1, ux = dx / length, uy = dy / length, reach = length * (1.02 + .14 * ext);
        const ex = gx + ux * reach, ey = gy + uy * reach, nx = -uy, ny = ux;
        this.beam(gx + W * .12, gy + H * .3, gx, gy, 13 * U, 9 * U, coat);
        this.beam(gx - ux * H * .12, gy - uy * H * .12, ex, ey, 2.8 * U, 1.3 * U, 0x7d6a48); this.beam(gx - ux * H * .12 + nx * U, gy - uy * H * .12 + ny * U, ex + nx * .4 * U, ey + ny * .4 * U, .7 * U, .3 * U, 0xa08a62);
        this.triangle(ex + nx * 3.2 * U, ey + ny * 3.2 * U, ex - nx * 3.2 * U, ey - ny * 3.2 * U, ex + ux * 10 * U, ey + uy * 10 * U, 0xd5dec4);
        this.beam(ex - ux * 2 * U, ey - uy * 2 * U, ex + ux * 1.5 * U, ey + uy * 1.5 * U, 2.2 * U, 2 * U, 0x5d4c37);
        this.fist(gx, gy, nx, ny, ux, uy, skin, U);
        const sx = gx + ux * length * .42, sy = gy + uy * length * .42;
        this.beam(W * .12 + bx, H * 1.05, sx - nx * 2 * U, sy - ny * 2 * U, 12 * U, 8 * U, tone(coat, .86)); this.disc(sx, sy, 5.4 * U, tone(skin, .92));
        return;
      }
      const gx = W * (.7 - .13 * ext) + bx, gy = H * (.9 - .15 * ext) + by, angle = -.4 - .3 * ext, dx = Math.sin(angle), dy = -Math.cos(angle), nx = Math.cos(angle), ny = Math.sin(angle), length = H * .2;
      this.beam(gx + W * .13, gy + H * .28, gx, gy, 13 * U, 9 * U, coat);
      this.beam(gx - dx * 4 * U, gy - dy * 4 * U, gx + dx * 6 * U, gy + dy * 6 * U, 2.4 * U, 2.4 * U, 0x2f2a24); this.beam(gx + dx * 6 * U - nx * 4 * U, gy + dy * 6 * U - ny * 4 * U, gx + dx * 6 * U + nx * 4 * U, gy + dy * 6 * U + ny * 4 * U, 1.2 * U, 1.2 * U, 0x8d8a74);
      this.beam(gx + dx * 7 * U, gy + dy * 7 * U, gx + dx * length, gy + dy * length, 3 * U, .6 * U, 0xd5dec4); this.beam(gx + dx * 7 * U - nx * 1.5 * U, gy + dy * 7 * U - ny * 1.5 * U, gx + dx * length * .95, gy + dy * length * .95, .7 * U, .3 * U, 0xf3f2d3);
      this.fist(gx, gy, nx, ny, dx, dy, skin, U);
    }
    gun(style, prog, skin, coat, bx, by, U) {
      const W = this.w, H = this.h, kick = prog >= 0 && prog < .3 ? 1 - prog / .3 : 0, flash = prog >= 0 && prog < .32;
      const burst = (x, y, r) => {
        this.triangle(x - r, y, x + r, y, x, y - r * 1.6, 0xffe19b, .9); this.triangle(x - r, y, x + r, y, x, y + r * .9, 0xffe19b, .9);
        this.triangle(x, y - r * .7, x, y + r * .7, x - r * 1.7, y, 0xffd27a, .85); this.triangle(x, y - r * .7, x, y + r * .7, x + r * 1.7, y, 0xffd27a, .85); this.disc(x, y, r * .5, 0xfff3c8);
      };
      if (style === 'pistol') {
        const cx = W * .6 + bx, cy = H * .76 + by - kick * H * .05;
        this.beam(cx + W * .2, H * 1.1, cx + 6 * U, cy + 15 * U, 14 * U, 9 * U, coat); this.beam(cx - W * .22, H * 1.12, cx - 7 * U, cy + 17 * U, 14 * U, 9 * U, tone(coat, .86));
        this.quad(cx - 3.6 * U, cy + 2 * U, cx + 3.6 * U, cy + 2 * U, cx + 4.6 * U, cy + 17 * U, cx - 2.6 * U, cy + 17 * U, 0x1b2a2e);
        this.disc(cx + 5 * U, cy + 13 * U, 7 * U, tone(skin, .92)); this.disc(cx - 5 * U, cy + 11 * U, 7 * U, skin); this.beam(cx - 9 * U, cy + 8 * U, cx - 1 * U, cy + 7 * U, 1.1 * U, 1.1 * U, tone(skin, .8));
        this.quad(cx - 5 * U, cy - 9 * U, cx + 5 * U, cy - 9 * U, cx + 5 * U, cy + 3 * U, cx - 5 * U, cy + 3 * U, 0x142b32);
        this.quad(cx - 5 * U, cy - 9 * U, cx + 5 * U, cy - 9 * U, cx + 5 * U, cy - 8 * U, cx - 5 * U, cy - 8 * U, 0xa4b0a2);
        this.quad(cx - 3.5 * U, cy - 11 * U, cx - 1.5 * U, cy - 11 * U, cx - 1.5 * U, cy - 9 * U, cx - 3.5 * U, cy - 9 * U, 0x0c1416); this.quad(cx + 1.5 * U, cy - 11 * U, cx + 3.5 * U, cy - 11 * U, cx + 3.5 * U, cy - 9 * U, cx + 1.5 * U, cy - 9 * U, 0x0c1416);
        if (flash) burst(cx, cy - 15 * U - kick * 4 * U, 7 * U);
        return;
      }
      if (style === 'bow') {
        const cx = W * .4 + bx, cy = H * .64 + by, r = H * .34, drawn = prog < 0 || prog > .5;
        let lx = 0, ly = 0;
        for (let k = 0; k <= 8; k++) { const a = -1.05 + k / 8 * 2.1, x = cx - Math.cos(a) * r * .28 + Math.cos(a) * r * .2, y = cy + Math.sin(a) * r; if (k) this.beam(lx, ly, x, y, 2.6 * U, 2.6 * U, 0x7b5a3a); lx = x; ly = y; }
        const topX = cx - Math.cos(-1.05) * r * .08, topY = cy + Math.sin(-1.05) * r, bottomX = topX, bottomY = cy + Math.sin(1.05) * r, nock = drawn ? cx + W * .1 : cx + W * .02;
        this.beam(topX, topY, nock, cy, .5 * U, .5 * U, 0xe0d8b8); this.beam(nock, cy, bottomX, bottomY, .5 * U, .5 * U, 0xe0d8b8);
        if (drawn) { this.beam(nock, cy, W * .5, this.horizon + H * .03, .9 * U, .9 * U, 0xb59a6a); this.triangle(W * .5 - 2 * U, this.horizon + H * .03 + 2 * U, W * .5 + 2 * U, this.horizon + H * .03 + 2 * U, W * .5 - 1 * U, this.horizon + H * .03 - 4 * U, 0xc7d0c0); }
        this.beam(W * .1, H * 1.1, cx + 2 * U, cy + 4 * U, 13 * U, 8 * U, tone(coat, .86)); this.disc(cx + 3 * U, cy, 6.5 * U, skin);
        this.beam(W * .88, H * 1.1, nock + 4 * U, cy + 6 * U, 14 * U, 9 * U, coat); this.disc(nock + 3 * U, cy + 3 * U, 6.5 * U, tone(skin, .92));
        return;
      }
      const gx = W * (.68 + .02 * kick) + bx, gy = H * (.9 + .03 * kick) + by, mx = W * .53 + bx * .5, my = this.horizon + H * (.09 + .01 * kick) + by * .4;
      const lerp = (t) => [gx + (mx - gx) * t, gy + (my - gy) * t], [r1, r2] = lerp(.32), [h1, h2] = lerp(.36), [h3, h4] = lerp(.72), [s1, s2] = lerp(.56);
      this.beam(gx + W * .1, gy + H * .12, gx, gy, 9 * U, 7 * U, 0x5d4a35);
      this.beam(gx, gy, r1, r2, 5.2 * U, 4.2 * U, 0x2a3436); this.beam(gx, gy - 4 * U, r1, r2 - 3.6 * U, .9 * U, .8 * U, 0x6f7d79);
      this.beam(r1, r2, mx, my, 1.8 * U, 1.3 * U, 0x1d2628); this.beam(h1, h2, h3, h4, 3.6 * U, 2.6 * U, 0x6b553b);
      this.quad(mx - 1.2 * U, my - 3.2 * U, mx + 1.2 * U, my - 3.2 * U, mx + 1.2 * U, my, mx - 1.2 * U, my, 0x0f1517);
      this.beam(W * .16, H * 1.12, s1 - 3 * U, s2 + 2 * U, 13 * U, 8 * U, tone(coat, .86)); this.disc(s1, s2 + 1 * U, 6 * U, skin);
      this.beam(gx + W * .16, gy + H * .3, gx - 2 * U, gy + 3 * U, 14 * U, 9 * U, coat); this.disc(gx - 2 * U, gy + 2 * U, 6.5 * U, tone(skin, .92));
      if (flash) burst(mx, my - 3 * U, 7 * U);
    }
    // In a car the view shows the hood, pillars and a dashboard whose wheel follows the steering.
    dashboard(car, o) {
      const W = this.w, H = this.h, U = H / 180, color = hex(car.color, 0x648275), look = o.look || {}, skin = hex(look.skin, 0xddbc88), coat = hex(look.coat, 0xa99b69);
      const speed = clamp(Math.abs(finite(car.speed, 0)) / Math.max(1, finite(car.maxSpeed, 250)), 0, 1), fuel = clamp(finite(car.fuel, 0) / Math.max(1, finite(car.tank, 100)), 0, 1);
      this.quad(W * .06, H * .82, W * .94, H * .82, W * .8, H * .69, W * .2, H * .69, tone(color, .92));
      this.beam(W * .21, H * .695, W * .79, H * .695, .9 * U, .9 * U, tone(color, 1.28)); this.beam(W * .5, H * .7, W * .5, H * .8, .8 * U, 1.4 * U, tone(color, .72));
      this.quad(0, 0, W * .09, 0, W * .2, H * .79, 0, H * .87, 0x18211f); this.quad(W, 0, W * .91, 0, W * .8, H * .79, W, H * .87, 0x18211f);
      this.quad(0, 0, W, 0, W, H * .05, 0, H * .05, 0x121a19); this.quad(W * .44, H * .05, W * .56, H * .05, W * .56, H * .1, W * .44, H * .1, 0x1a2422); this.quad(W * .45, H * .055, W * .55, H * .055, W * .55, H * .092, W * .45, H * .092, 0x6d8a88);
      this.quad(0, H * .78, W, H * .78, W, H, 0, H, 0x1d2725); this.beam(0, H * .78, W, H * .78, U, U, 0x3b4a46);
      const gx = W * .62, gy = H * .88, gr = H * .065, needle = -2.3 + 4.6 * speed;
      this.disc(gx, gy, gr, 0x5f6f68); this.disc(gx, gy, gr - 1.2 * U, 0x0f1716); this.beam(gx, gy, gx + Math.sin(needle) * gr * .85, gy - Math.cos(needle) * gr * .85, .9 * U, .5 * U, 0xe6a17a);
      this.quad(W * .7, H * .93, W * .8, H * .93, W * .8, H * .93 + 2 * U, W * .7, H * .93 + 2 * U, 0x0f1716); this.quad(W * .7, H * .93, W * (.7 + .1 * fuel), H * .93, W * (.7 + .1 * fuel), H * .93 + 2 * U, W * .7, H * .93 + 2 * U, 0xb7cf8b);
      const cx = W * .36, cy = H * 1.03, r = H * .2, s = this.steer * .9;
      let lx = 0, ly = 0;
      for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (k) this.beam(lx, ly, x, y, 3.4 * U, 3.4 * U, 0x141c1a); lx = x; ly = y; }
      for (const a of [s, s + Math.PI, s + Math.PI / 2]) this.beam(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.4 * U, 2 * U, 0x1b2422);
      this.disc(cx, cy, H * .045, 0x26302d);
      for (const a of [Math.PI + .6 + s, -.6 + s]) { const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; this.beam(x + (a > 0 ? -1 : 1) * W * .06, H * 1.1, x, y + 3 * U, 12 * U, 8 * U, coat); this.disc(x, y, 6 * U, skin); }
    }

    // Crisp HUD marks drawn over the scaled frame on the main canvas: crosshair, waypoint label and names.
    overlay(ctx, cssWidth, cssHeight) {
      const k = cssWidth / Math.max(1, this.w), mark = this.mark;
      ctx.save(); ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < this.seenCount; i++) {
        const s = this.seen[i]; if (!s.label) continue;
        const x = s.column * k, y = Math.max(14, s.top * k - 18), width = Math.min(170, ctx.measureText(s.label).width + 12);
        ctx.fillStyle = '#14271dd0'; ctx.fillRect(x - width / 2, y - 8, width, 16); ctx.fillStyle = s.kind === 'partner' ? '#9ce5dc' : '#d6e2c4'; ctx.fillText(s.label, x, y + .5, width - 8);
      }
      if (mark.active) {
        const label = mark.label + ' · ' + mark.distance + ' tiles', width = Math.min(cssWidth - 32, ctx.measureText(label).width + 18);
        let x, y;
        if (mark.onScreen) { x = mark.sx * k; y = mark.sy * k - 26; }
        else {
          // Off to one side: an edge arrow shows which way to turn.
          x = mark.side > 0 ? cssWidth - 40 : 40; y = this.horizon * k;
          ctx.fillStyle = '#eac78b'; ctx.beginPath(); ctx.moveTo(x + mark.side * 14, y); ctx.lineTo(x - mark.side * 2, y - 10); ctx.lineTo(x - mark.side * 2, y + 10); ctx.closePath(); ctx.fill();
          x = mark.side > 0 ? cssWidth - 40 - width / 2 : 40 + width / 2; y -= 26;
        }
        x = clamp(x, 16 + width / 2, cssWidth - 16 - width / 2); y = clamp(y, 14, cssHeight - 14);
        ctx.fillStyle = '#13251fe0'; ctx.fillRect(x - width / 2, y - 10, width, 20); ctx.fillStyle = mark.hidden && mark.onScreen ? '#c9b98f' : '#ead9ad'; ctx.fillText(label, x, y + .5, width - 10);
      }
      if (!this.driving) {
        const cx = Math.round(cssWidth / 2) + .5, cy = Math.round(this.horizon * k) + .5, gap = this.attacking ? 8 : 5, len = 6;
        const lines = () => { ctx.beginPath(); ctx.moveTo(cx - gap - len, cy); ctx.lineTo(cx - gap, cy); ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + gap + len, cy); ctx.moveTo(cx, cy - gap - len); ctx.lineTo(cx, cy - gap); ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + gap + len); ctx.stroke(); };
        ctx.lineCap = 'square'; ctx.strokeStyle = '#0b1714b8'; ctx.lineWidth = 3; lines(); ctx.strokeStyle = '#efe6c4'; ctx.lineWidth = 1; lines();
        ctx.fillStyle = '#efe6c4'; ctx.fillRect(cx - 1, cy - 1, 2, 2);
      }
      ctx.restore();
    }

    // Read-only diagnostics: buffer size and what the last frame actually drew (in CSS pixels).
    describe(cssWidth) {
      const k = finite(cssWidth, this.w) / Math.max(1, this.w), visible = [];
      for (let i = 0; i < this.seenCount; i++) { const s = this.seen[i]; visible.push({ kind: s.kind, id: s.id, x: s.x, y: s.y, depth: Math.round(s.depth * TILE * 10) / 10, column: Math.round(s.column * k), pixels: s.pixels }); }
      return { width: this.w, height: this.h, fov: Math.round(2 * Math.atan(this.plane || 1) * 1000) / 1000, horizon: Math.round(this.horizon * k), visible };
    }
  }

  Sirens.FirstPerson = Object.freeze({ castRay, viewInput, aim, weaponStyle, sky, wrap, View, constants: Object.freeze({ TILE, WALL, EYE, VIEW, RAY }) });
})();
