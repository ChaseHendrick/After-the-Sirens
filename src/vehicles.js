(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const T = 32, TAU = Math.PI * 2;
  const types = [
    { type: 'sedan', name: 'Compact sedan', color: '#8aa1ae', maxSpeed: 250, tank: 60 },
    { type: 'wagon', name: 'Utility wagon', color: '#b2a378', maxSpeed: 225, tank: 70 },
    { type: 'pickup', name: 'Farm pickup', color: '#8b9d7e', maxSpeed: 240, tank: 80 }
  ];
  function spawnForChunk(seed, cx, cy) {
    const n = (seed ^ Math.imul(cx, 374761393) ^ Math.imul(cy, 668265263)) >>> 0;
    const placements = cx === 0 && cy === 0 ? [[18.5, 14.5, 0], [31.5, 38.5, Math.PI / 2]] : [[31.5, 23.5, Math.PI / 2], [37.5, 31.5, 0]];
    return placements.map((p, i) => Object.assign({ id: 'v:' + cx + ',' + cy + ':' + i, x: p[0] * T, y: p[1] * T,
      angle: p[2], speed: 0, fuel: 35 + (n + i) % 10, condition: 80 + (n + i) % 21 }, types[(n + i) % types.length]));
  }
  function log(s, text, tone) { s.logs.push({ text, tone: tone || 'info', time: s.elapsed }); if (s.logs.length > 60) s.logs.shift(); }
  function closest(s) {
    if (s.stories && s.stories.floor > 0) return null;
    if (s.player.vehicleId) return (s.vehicles || []).find(v => v.id === s.player.vehicleId) || null;
    return (s.vehicles || []).filter(v => Math.hypot(v.x - s.player.x, v.y - s.player.y) < 75 &&
      S.Engine.hasLOS(s, s.player.x, s.player.y, v.x, v.y)).sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y))[0] || null;
  }
  function nearby(s) { const v = closest(s); return v ? (s.player.vehicleId ? 'Exit ' : 'Drive ') + v.name + ' (V) | Refuel (G)' : ''; }
  function clear(s, x, y, angle) {
    const c = Math.cos(angle), q = Math.sin(angle);
    return [[-22, -11], [-22, 11], [22, -11], [22, 11], [0, -11], [0, 11], [22, 0], [-22, 0]].every(p =>
      !S.Engine.isSolid(s, (x + p[0] * c - p[1] * q) / T, (y + p[0] * q + p[1] * c) / T));
  }
  function clearFoot(s, x, y) {
    return [[-10, -10], [-10, 10], [10, -10], [10, 10]].every(p => !S.Engine.isSolid(s, (x + p[0]) / T, (y + p[1]) / T));
  }
  function toggle(s) {
    const v = closest(s), p = s.player;
    if (!v) { log(s, 'Approach a parked car to drive.', 'info'); return false; }
    if (p.vehicleId) {
      if (Math.abs(v.speed) > 18) { log(s, 'Brake before getting out.', 'warn'); return false; }
      for (const a of [v.angle + Math.PI / 2, v.angle - Math.PI / 2, v.angle + Math.PI, v.angle]) {
        const x = v.x + Math.cos(a) * 42, y = v.y + Math.sin(a) * 42;
        if (clearFoot(s, x, y)) { p.x = x; p.y = y; p.vehicleId = null; v.speed = 0; log(s, 'Left the ' + v.name + '.'); return true; }
      }
      log(s, 'No clear space beside this car. Move to an open area.', 'warn'); return false;
    }
    if (v.condition <= 0) { log(s, 'This car is wrecked.', 'warn'); return false; }
    p.vehicleId = v.id; p.x = v.x; p.y = v.y; p.resting = false;
    log(s, 'Driving: W accelerates, S brakes and reverses, A/D steer, V exits.', 'good'); return true;
  }
  function refuel(s, itemId) {
    const v = closest(s), inv = s.player.inventory, catalog = S.Catalog && S.Catalog.items;
    itemId = itemId || Object.keys(inv).find(id => inv[id] > 0 && catalog[id] && catalog[id].fuel > 0);
    const item = catalog && catalog[itemId];
    if (!v || !item || !(inv[itemId] > 0) || !(item.fuel > 0)) { log(s, 'Bring a fuel can beside a car to refuel.', 'warn'); return false; }
    if (Math.abs(v.speed) > 1 || v.fuel >= v.tank) { log(s, 'Stop the car and leave space in its fuel tank.', 'info'); return false; }
    v.fuel = Math.min(v.tank, v.fuel + item.fuel); inv[itemId]--; if (!inv[itemId]) delete inv[itemId];
    log(s, 'Refueled ' + v.name + '.', 'good'); return true;
  }
  function update(s, dt, input) {
    const p = s.player, v = (s.vehicles || []).find(v => v.id === p.vehicleId);
    if (!v) { p.vehicleId = null; return false; }
    const throttle = -Math.max(-1, Math.min(1, Number(input.moveY) || 0));
    const steer = Math.max(-1, Math.min(1, Number(input.moveX) || 0));
    if (v.condition > 0 && v.fuel > 0) {
      v.speed += throttle * (v.speed * throttle < 0 ? 240 : 115) * dt;
      v.fuel = Math.max(0, v.fuel - dt * (0.001 + Math.abs(throttle) * 0.016));
    }
    if (throttle === 0 || v.fuel <= 0 || v.condition <= 0) v.speed *= Math.max(0, 1 - dt * 1.7);
    v.speed = Math.max(-85, Math.min(v.maxSpeed, v.speed)); if (Math.abs(v.speed) < 0.3) v.speed = 0;
    const turn = steer * Math.min(1, Math.abs(v.speed) / 65) * 1.65 * dt * (v.speed < 0 ? -1 : 1);
    const nextAngle = (v.angle + turn + TAU) % TAU;
    if (clear(s, v.x, v.y, nextAngle)) v.angle = nextAngle;
    const steps = Math.max(1, Math.ceil(Math.abs(v.speed * dt) / 4));
    for (let i = 0; i < steps; i++) {
      const x = v.x + Math.cos(v.angle) * v.speed * dt / steps, y = v.y + Math.sin(v.angle) * v.speed * dt / steps;
      if (clear(s, x, y, v.angle)) { v.x = x; v.y = y; }
      else {
        if (Math.abs(v.speed) > 35) { v.condition = Math.max(0, v.condition - Math.abs(v.speed) * 0.035); log(s, 'Collision damaged the car.', 'warn'); }
        v.speed = 0; break;
      }
    }
    p.x = v.x; p.y = v.y; p.angle = v.angle;
    if (Math.abs(v.speed) > 40) {
      s._vehicleHits = s._vehicleHits || {};
      for (const z of s.zombies) if (z.health > 0 && Math.hypot(z.x - v.x, z.y - v.y) < 31 && (s._vehicleHits[z.id] || -10) < s.elapsed - 0.7) {
        s._vehicleHits[z.id] = s.elapsed; z.health -= Math.abs(v.speed) * 0.65; z._stun = 0.6; v.condition = Math.max(0, v.condition - 0.35);
        if (z.health <= 0) p.kills++;
      }
      s.zombies = s.zombies.filter(z => z.health > 0);
      if (!s.noises.some(n => n.vehicle && n.life > 0.2)) { s.noises.push({ x: v.x, y: v.y, radius: 340, life: 0.6, vehicle: true }); if (s.noises.length > 24) s.noises.shift(); }
    }
    return true;
  }
  S.Vehicles = Object.freeze({ spawnForChunk, nearby, toggle, refuel, update });
})();
