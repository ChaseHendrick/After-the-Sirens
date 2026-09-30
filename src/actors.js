(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const T = 32;
  const behavior = new WeakMap();
  function activity(s, h) { const a = behavior.get(h); return a && a.until > s.elapsed ? a.text : h.following ? 'Following' : h.faction === 'raider' ? 'On watch' : 'Scavenging'; }
  function say(s, h, text, duration) { behavior.set(h, { text, until: s.elapsed + (duration || 4) }); }
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
    const c = S.Progression ? S.Progression.contact(s, h) : null;
    const q = S.Progression ? S.Progression.quoteRequest(s, h) : null;
    s.conversation = { id: h.id, name: h.name, role: h.following ? 'Companion' : 'Survivor', text: text ||
      (c ? 'I am ' + c.trait + '. ' + (c.trust >= 6 ? 'You have helped me. I remember it.' : 'We can help each other.') + '\nI have ' + c.stock + ' bandages to trade today. ' + (q && c.completedDay < s.day ? 'I need ' + S.Progression.names(q.cost) + '. Bring them and I can offer ' + S.Progression.names(q.reward) + '.' : 'Thank you for helping today. Come back tomorrow.') : 'I can trade one bandage for one ration. Give me one ration and I will travel with you and help fight the dead.'),
      tradeLabel: 'Trade 1 ration for 1 bandage' + (c ? ' (' + c.stock + ' left)' : ''), canTrade: !c || c.stock > 0, canRecruit: !h.following, canDismiss: h.following,
      canRob: !!(c && !c.robbed && s.player.inventory[s.player.weapon] > 0), robReason: c && c.robbed ? 'Already robbed' : !(s.player.inventory[s.player.weapon] > 0) ? 'Hold a weapon from your pack' : 'Demand their supplies. They may fight back.',
      trust: c ? c.trust : 0, canHelp: !!(q && q.can), hasRequest: !!(q && c.completedDay < s.day), requestLabel: q ? 'Deliver ' + q.request.name : '', requestReason: q && q.missing.join('. ') };
  }
  function interact(s) { const h = closest(s); if (!h || s.player.vehicleId) return false; conversation(s, h); return true; }
  function action(s, name) {
    if (name === 'closeConversation') { s.conversation = null; return true; }
    const h = (s.humans || []).find(h => s.conversation && h.id === s.conversation.id && h.health > 0 && h.faction === 'survivor');
    if (!h || !['trade', 'recruit', 'dismiss', 'helpSurvivor', 'robSurvivor'].includes(name)) return false;
    if (s.player.vehicleId || Math.hypot(h.x - s.player.x, h.y - s.player.y) >= 85 || !S.Engine.hasLOS(s, h.x, h.y, s.player.x, s.player.y)) { s.conversation = null; return false; }
    const c = S.Progression ? S.Progression.contact(s, h) : null;
    if (name === 'helpSurvivor') { const helped = !!(S.Progression && S.Progression.help(s, h)); conversation(s, h, helped ? 'You brought what I needed. I will not forget that.' : undefined); return helped; }
    const inv = s.player.inventory;
    if (name === 'robSurvivor') {
      if (!c || c.robbed || s.player.vehicleId || Math.hypot(h.x - s.player.x, h.y - s.player.y) > 85 || !S.Engine.hasLOS(s, h.x, h.y, s.player.x, s.player.y) || !(inv[s.player.weapon] > 0)) return false;
      const armed = S.Catalog.items[s.player.weapon], gun = armed && armed.weapon && armed.weapon.kind === 'firearm';
      if (!gun && c.trait === 'resolute') {
        h.faction = 'raider'; h.following = false; c.trust = 0; s.conversation = null;
        if (S.Warfare) S.Warfare.attacked(s, h); say(s, h, 'Fight back!', 8); log(s, h.name + ' refused the robbery and is fighting back.', 'warn'); alarm(s, h); return true;
      }
      const supplies = { food: 1, water: 1 }; if (c.stock > 0) supplies.bandage = c.stock;
      if (!dropBelongings(s, h, supplies, h.name + "'s surrendered bag")) return false;
      c.robbed = true; c.stock = 0; c.trust = 0; h.following = false; h.faction = 'raider'; h.cooldown = 3;
      if (S.Warfare) S.Warfare.attacked(s, h); s.conversation = null; say(s, h, 'Take it. Stay away!', 8); alarm(s, h);
      if (S.Progression) S.Progression.write(s, 'danger', 'Robbed ' + h.name + '. Their supplies are on the ground. They remember the attack.');
      log(s, h.name + ' dropped a bag. Collect it with E.', 'good'); return true;
    }
    if (name === 'dismiss') { h.following = false; conversation(s, h, 'I will stay here. Come back if you need help.'); log(s, h.name + ' stopped following.'); return true; }
    if (!(inv.food > 0)) { conversation(s, h, 'Bring a ration from your pack, then we can trade or travel together.'); return false; }
    if (name === 'trade') {
      if (c && c.stock <= 0) { conversation(s, h, 'I have no more bandages today. Check back tomorrow.'); return false; }
      const capacity = S.Engine.carryCapacity ? S.Engine.carryCapacity(s) : 24;
      const delta = S.Catalog.items.bandage.weight - S.Catalog.items.food.weight;
      if ((inv.bandage || 0) >= 1000 || S.Engine.inventoryWeight(inv) + delta > capacity + 0.00001) { conversation(s, h, 'Your pack is full. Drop some supplies before trading.'); return false; }
      inv.food--; if (!inv.food) delete inv.food; inv.bandage = (inv.bandage || 0) + 1;
      if (c) { c.stock--; c.trust = Math.min(20, c.trust + 1); }
      log(s, 'Traded one ration for a bandage with ' + h.name + '.', 'good'); conversation(s, h, 'One bandage for your ration. Stay safe.'); return true;
    }
    if (h.following || (s.humans || []).filter(n => n.following && n.health > 0).length >= 12) { conversation(s, h, 'You can travel with up to twelve companions.'); return false; }
    inv.food--; if (!inv.food) delete inv.food; h.following = true;
    if (S.Progression) S.Progression.write(s, 'people', h.name + ' joined you. Supplies and trust keep this group together.');
    log(s, h.name + ' joined you. Companions fight nearby zombies.', 'good'); conversation(s, h, 'I will follow and help keep the dead away.'); return true;
  }
  function dropBelongings(s, h, items, label) {
    const fits = c => c._ground && Object.entries(items).every(([id, n]) => (c.items[id] || 0) + n <= 1000);
    let pile = s.containers.filter(fits).sort((a, b) => (a.x - h.x) ** 2 + (a.y - h.y) ** 2 - (b.x - h.x) ** 2 - (b.y - h.y) ** 2)[0];
    if (!pile || Math.hypot(pile.x - h.x, pile.y - h.y) > 48 && s.containers.filter(c => c._ground).length < 60) {
      if (s.containers.filter(c => c._ground).length >= 60) return false;
      const x = Math.max(16, Math.min(s.width * T - 16, h.x)), y = Math.max(16, Math.min(s.height * T - 16, h.y));
      if (![0, 1, 2, 7].includes(s.tiles[Math.floor(y / T) * s.width + Math.floor(x / T)])) return false;
      pile = { id: 'drop:' + s.seed + ':' + s._nextGroundId++, x, y, label, items: {}, looted: false, _ground: true }; s.containers.push(pile);
    }
    for (const [id, n] of Object.entries(items)) pile.items[id] = (pile.items[id] || 0) + n;
    pile.looted = false; return true;
  }
  function deathLoot(s, h) {
    const c = S.Progression && S.Progression.contact(s, h); if (!c || c.deathLooted) return;
    const items = {}; items[h.weapon] = 1; if (h.weapon === 'pistol') items.ammo = 6;
    if (!c.robbed) { items.food = 1; items.water = 1; if (c.stock) items.bandage = c.stock; }
    if (dropBelongings(s, h, items, h.name + "'s belongings")) { c.deathLooted = true; c.stock = 0; say(s, h, 'Belongings dropped'); log(s, h.name + "'s belongings can be collected with E."); }
  }
  function alarm(s, h) {
    s.noises.push({ x: h.x, y: h.y, radius: 480, life: 3 }); if (s.noises.length > 24) s.noises.shift();
    for (const other of s.humans || []) if (other !== h && other.health > 0 && !other.following && Math.hypot(other.x - h.x, other.y - h.y) < 240 && S.Engine.hasLOS(s, h.x, h.y, other.x, other.y)) {
      if (other.faction === 'raider') { other._step = null; other._thinkClock = 0; say(s, other, 'Heard trouble!', 6); }
      else { say(s, other, 'Get away from the fighting!', 8); other._thinkClock = 0; }
    }
  }
  function hit(s, h, damage, byPlayer) {
    if (!h || h.health <= 0) return;
    h.health = Math.max(0, h.health - Math.max(0, Number(damage) || 0));
    if (byPlayer) { say(s, h, h.health < 35 ? 'Run!' : 'Back off!', 8); alarm(s, h); if (s.conversation && s.conversation.id === h.id) s.conversation = null; }
    if (byPlayer && S.Warfare) S.Warfare.attacked(s, h);
    if (byPlayer && h.faction === 'survivor') { h.faction = 'raider'; h.following = false; log(s, h.name + ' turned hostile after being attacked.', 'warn'); }
    if (S.Progression) {
      const c = S.Progression.contact(s, h); if (c) { if (byPlayer) c.trust = 0; c.alive = h.health > 0; }
      if (h.health <= 0) S.Progression.write(s, 'danger', h.name + ' died. Their place in your journal remains.');
    }
    if (h.health <= 0) { deathLoot(s, h); h.following = false; if (s.conversation && s.conversation.id === h.id) s.conversation = null; }
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
    if (S.Warfare) for (const h of s.humans || []) S.Warfare.align(s, h);
    for (const h of s.humans || []) {
      if (h.health <= 0) { deathLoot(s, h); continue; }
      if (Math.hypot(h.x - p.x, h.y - p.y) > 1000) continue;
      if (S.Progression && S.Progression.ensure(s).contacts[h.id]) S.Progression.contact(s, h);
      if (S.Settlement) S.Settlement.work(s, h, dt);
      h.cooldown = Math.max(0, h.cooldown - dt); h._thinkClock = (h._thinkClock || 0) - dt;
      const gun = h.weapon === 'pistol', range = gun ? 280 : 64;
      let target = null, best = Infinity;
      const consider = (entity, radius) => { const d2 = (entity.x - h.x) ** 2 + (entity.y - h.y) ** 2; if (entity.health > 0 && d2 < radius * radius && d2 < best) { best = d2; target = entity; } };
      for (const z of s.zombies) consider(z, 340);
      for (const other of s.humans || []) if (other !== h && other.faction !== h.faction) consider(other, 340);
      if (h.faction === 'raider') consider(p, 440);
      const d = target ? Math.hypot(target.x - h.x, target.y - h.y) : Infinity;
      const scared = target && ((h.health < 35 && !h.following) || h.faction === 'survivor' && !h.following && !target.faction && d < 165);
      const warned = behavior.get(h), panic = !target && !h.following && h.faction === 'survivor' && warned && warned.until > s.elapsed && warned.text === 'Get away from the fighting!';
      if (scared || panic) {
        const danger = target || p, dx = h.x - danger.x, dy = h.y - danger.y, len = Math.hypot(dx, dy) || 1;
        const escape = { x: Math.max(T, Math.min((s.width - 1) * T, h.x + dx / len * 160)), y: Math.max(T, Math.min((s.height - 1) * T, h.y + dy / len * 160)) };
        if (h._thinkClock <= 0) { h._thinkClock = .4; h._step = pathStep(s, h, escape); }
        const step = h._step; if (step) { const ex = step.x - h.x, ey = step.y - h.y, n = Math.hypot(ex, ey) || 1;
          h.angle = Math.atan2(ey, ex); if (clear(s, h.x + ex / n * 110 * dt, h.y)) h.x += ex / n * 110 * dt; if (clear(s, h.x, h.y + ey / n * 110 * dt)) h.y += ey / n * 110 * dt;
        }
        if (scared) say(s, h, 'Fleeing danger', 1); continue;
      }
      if (target && d <= range && S.Engine.hasLOS(s, h.x, h.y, target.x, target.y)) {
        h.angle = Math.atan2(target.y - h.y, target.x - h.x);
        if (h.cooldown <= 0) {
          h.cooldown = gun ? 1.4 : 0.8; say(s, h, target === p ? 'Defending against you' : 'Fighting', 1);
          if (target === p) {
            const armor = S.Catalog.items[p.equipment && p.equipment.clothing];
            p.health = Math.max(0, p.health - (gun ? 10 : 7) * (1 - Math.min(0.7, armor && armor.armor || 0)));
            if (Math.floor(s.elapsed) % 3 === 0) log(s, 'A raider is attacking you.', 'danger');
          } else { const c = S.Progression && S.Progression.ensure(s).contacts[h.id]; const damage = ((gun ? 32 : 25) + (h.following && c ? Math.min(5, Math.floor(c.trust / 3)) : 0)) * (S.Settlement ? S.Settlement.combatMultiplier(s, h) : 1); if (target.faction) hit(s, target, damage, false); else { target.health -= damage; target._stun = 0.25; if (target.health <= 0) p.kills++; } }
          s.noises.push({ x: h.x, y: h.y, radius: gun ? 400 : 100, life: 0.5 }); if (s.noises.length > 24) s.noises.shift();
        }
      } else {
        const job = h.following && S.Settlement ? S.Settlement.goal(s, h) : S.Warfare ? S.Warfare.goal(s, h) : null;
        const follow = job || (h.following && Math.hypot(p.x - h.x, p.y - h.y) > 70 ? p : null);
        const idle = !h.following && h.faction === 'survivor' && S.Progression ? S.Progression.agenda(s, h) : null;
        const chase = target && (h.faction === 'raider' || h.following || target.faction) ? target : follow || idle;
        if (chase) {
          if (h._thinkClock <= 0) { h._thinkClock = 0.3; h._step = pathStep(s, h, chase); }
          const step = h._step;
          if (step) { const dx = step.x - h.x, dy = step.y - h.y, len = Math.hypot(dx, dy) || 1, speed = h.following ? 102 : idle && !target ? 28 : 72;
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
      let victim = null, best = 32 * 32;
      for (const h of s.humans || []) { const d2 = (z.x - h.x) ** 2 + (z.y - h.y) ** 2;
        if (h.health > 0 && d2 < best && S.Engine.hasLOS(s, z.x, z.y, h.x, h.y)) { victim = h; best = d2; }
      }
      if (victim) { z._humanBite = 1.5; hit(s, victim, 12, false); }
    }
    s.zombies = s.zombies.filter(z => z.health > 0);
  }
  S.Actors = Object.freeze({ spawnForChunk, nearby, interact, action, hit, update, pathStep, activity });
})();
