(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const T = 32;
  const names = ['Alex', 'Morgan', 'Sam', 'Riley', 'Casey', 'Jules', 'Robin', 'Taylor', 'Jordan', 'Avery', 'Drew', 'Quinn'];
  function spawnForChunk(seed, cx, cy) {
    const n = (seed ^ Math.imul(cx, 83492791) ^ Math.imul(cy, 19349663)) >>> 0;
    return [[cx === 0 && cy === 0 ? 17.5 : 31.5, cx === 0 && cy === 0 ? 14.5 : 36.5, 'survivor'], [43.5, 31.5, 'raider']].map((p, i) => ({
      id: 'h:' + cx + ',' + cy + ':' + i, x: p[0] * T, y: p[1] * T, angle: 0, health: 100, faction: p[2],
      name: names[(n + i * 3) % names.length], following: false, weapon: i ? 'pistol' : 'bat', cooldown: 0
    }));
  }
  function log(s, text, tone) { s.logs.push({ text, tone: tone || 'info', time: s.elapsed }); if (s.logs.length > 60) s.logs.shift(); }
  function closest(s) {
    if (s.player.vehicleId) return null;
    return (s.humans || []).filter(h => h.health > 0 && h.faction === 'survivor' && Math.hypot(h.x - s.player.x, h.y - s.player.y) < 85 &&
      S.Engine.hasLOS(s, s.player.x, s.player.y, h.x, h.y)).sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y))[0] || null;
  }
  function nearby(s) { const h = closest(s); return h ? 'Talk to ' + h.name : ''; }
  function conversation(s, h, text) {
    s.conversation = { id: h.id, name: h.name, role: h.following ? 'Companion' : 'Survivor', text: text ||
      'I can trade one bandage for one ration. Give me one ration and I will travel with you and help fight the dead.',
      tradeLabel: 'Trade 1 ration for 1 bandage', canTrade: true, canRecruit: !h.following, canDismiss: h.following };
  }
  function interact(s) { const h = closest(s); if (!h || s.player.vehicleId) return false; conversation(s, h); return true; }
  function action(s, name) {
    if (name === 'closeConversation') { s.conversation = null; return true; }
    const h = (s.humans || []).find(h => s.conversation && h.id === s.conversation.id && h.health > 0 && h.faction === 'survivor');
    if (!h || !['trade', 'recruit', 'dismiss'].includes(name)) return false;
    const inv = s.player.inventory;
    if (name === 'dismiss') { h.following = false; conversation(s, h, 'I will stay here. Come back if you need help.'); log(s, h.name + ' stopped following.'); return true; }
    if (!(inv.food > 0)) { conversation(s, h, 'Bring a ration from your pack, then we can trade or travel together.'); return false; }
    if (name === 'trade') {
      const capacity = S.Engine.carryCapacity ? S.Engine.carryCapacity(s) : 24;
      const delta = S.Catalog.items.bandage.weight - S.Catalog.items.food.weight;
      if (S.Engine.inventoryWeight(inv) + delta > capacity + 0.00001) { conversation(s, h, 'Your pack is full. Drop some supplies before trading.'); return false; }
      inv.food--; if (!inv.food) delete inv.food; inv.bandage = (inv.bandage || 0) + 1;
      log(s, 'Traded one ration for a bandage with ' + h.name + '.', 'good'); conversation(s, h, 'One bandage for your ration. Stay safe.'); return true;
    }
    if (h.following || (s.humans || []).filter(n => n.following && n.health > 0).length >= 3) { conversation(s, h, 'You can travel with up to three companions.'); return false; }
    inv.food--; if (!inv.food) delete inv.food; h.following = true;
    log(s, h.name + ' joined you. Companions fight nearby zombies.', 'good'); conversation(s, h, 'I will follow and help keep the dead away.'); return true;
  }
  function hit(s, h, damage, byPlayer) {
    if (!h || h.health <= 0) return;
    h.health = Math.max(0, h.health - damage);
    if (byPlayer && h.faction === 'survivor') { h.faction = 'raider'; h.following = false; log(s, h.name + ' turned hostile after being attacked.', 'warn'); }
    if (h.health <= 0) { h.following = false; if (s.conversation && s.conversation.id === h.id) s.conversation = null; }
  }
  function clear(s, x, y) { return [[-9, -9], [-9, 9], [9, -9], [9, 9]].every(p => !S.Engine.isSolid(s, (x + p[0]) / T, (y + p[1]) / T)); }
  function walkingRoute(s, x1, y1, x2, y2) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 10));
    for (let i = 1; i <= steps; i++) { const f = i / steps; if (!clear(s, x1 + (x2 - x1) * f, y1 + (y2 - y1) * f)) return false; }
    return true;
  }
  function pathStep(s, h, target) {
    const sx = Math.floor(h.x / T), sy = Math.floor(h.y / T), tx = Math.floor(target.x / T), ty = Math.floor(target.y / T);
    if (sx === tx && sy === ty || walkingRoute(s, h.x, h.y, target.x, target.y)) return target;
    const start = sy * s.width + sx, goal = ty * s.width + tx, queue = [start], prev = new Map([[start, -1]]);
    for (let cursor = 0; cursor < queue.length && cursor < 1200; cursor++) {
      const id = queue[cursor], x = id % s.width, y = Math.floor(id / s.width);
      if (id === goal) {
        let next = id;
        while (prev.get(next) !== start && prev.get(next) !== -1) next = prev.get(next);
        return { x: (next % s.width + 0.5) * T, y: (Math.floor(next / s.width) + 0.5) * T };
      }
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort((a, b) => Math.abs(x + a[0] - tx) + Math.abs(y + a[1] - ty) - Math.abs(x + b[0] - tx) - Math.abs(y + b[1] - ty));
      for (const d of dirs) { const xx = x + d[0], yy = y + d[1], k = yy * s.width + xx;
        if (xx >= 0 && yy >= 0 && xx < s.width && yy < s.height && !prev.has(k) && !S.Engine.isSolid(s, xx, yy)) { prev.set(k, id); queue.push(k); }
      }
    }
    return null;
  }
  function update(s, dt) {
    if (s.stories && s.stories.floor > 0) return;
    const p = s.player;
    for (const h of s.humans || []) {
      if (h.health <= 0 || Math.hypot(h.x - p.x, h.y - p.y) > 1000) continue;
      h.cooldown = Math.max(0, h.cooldown - dt); h._thinkClock = (h._thinkClock || 0) - dt;
      const gun = h.weapon === 'pistol', range = gun ? 280 : 64;
      const candidates = s.zombies.filter(z => z.health > 0 && Math.hypot(z.x - h.x, z.y - h.y) < 340);
      if (h.faction === 'raider' && p.health > 0 && Math.hypot(p.x - h.x, p.y - h.y) < 440) candidates.push(p);
      const target = candidates.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
      const d = target ? Math.hypot(target.x - h.x, target.y - h.y) : Infinity;
      if (target && d <= range && S.Engine.hasLOS(s, h.x, h.y, target.x, target.y)) {
        h.angle = Math.atan2(target.y - h.y, target.x - h.x);
        if (h.cooldown <= 0) {
          h.cooldown = gun ? 1.4 : 0.8;
          if (target === p) {
            const armor = S.Catalog.items[p.equipment && p.equipment.clothing];
            p.health = Math.max(0, p.health - (gun ? 10 : 7) * (1 - Math.min(0.7, armor && armor.armor || 0)));
            if (Math.floor(s.elapsed) % 3 === 0) log(s, 'A raider is attacking you.', 'danger');
          } else { target.health -= gun ? 32 : 25; target._stun = 0.25; if (target.health <= 0) p.kills++; }
          s.noises.push({ x: h.x, y: h.y, radius: gun ? 400 : 100, life: 0.5 }); if (s.noises.length > 24) s.noises.shift();
        }
      } else {
        const follow = h.following && Math.hypot(p.x - h.x, p.y - h.y) > 70 ? p : null;
        const chase = target && (h.faction === 'raider' || h.following) ? target : follow;
        if (chase) {
          if (h._thinkClock <= 0) { h._thinkClock = 0.3; h._step = pathStep(s, h, chase); }
          const step = h._step;
          if (step) { const dx = step.x - h.x, dy = step.y - h.y, len = Math.hypot(dx, dy) || 1, speed = h.following ? 102 : 72;
            h.angle = Math.atan2(dy, dx);
            if (clear(s, h.x + dx / len * speed * dt, h.y)) h.x += dx / len * speed * dt;
            if (clear(s, h.x, h.y + dy / len * speed * dt)) h.y += dy / len * speed * dt;
          }
        }
      }
    }
    for (const z of s.zombies) if (z.health > 0 && Math.hypot(z.x - p.x, z.y - p.y) < 1000) {
      z._humanBite = Math.max(0, (z._humanBite || 0) - dt);
      if (z._humanBite > 0) continue;
      const victim = (s.humans || []).filter(h => h.health > 0 && Math.hypot(z.x - h.x, z.y - h.y) < 32 && S.Engine.hasLOS(s, z.x, z.y, h.x, h.y))
        .sort((a, b) => Math.hypot(z.x - a.x, z.y - a.y) - Math.hypot(z.x - b.x, z.y - b.y))[0];
      if (victim) { z._humanBite = 1.5; hit(s, victim, 12, false); }
    }
    s.zombies = s.zombies.filter(z => z.health > 0);
  }
  S.Actors = Object.freeze({ spawnForChunk, nearby, interact, action, hit, update });
})();
