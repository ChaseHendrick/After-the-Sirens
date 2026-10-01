(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const T = 32, COMMAND_INTERVAL = .34, PATH_INTERVAL = .25;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [.707, .707], [.707, -.707], [-.707, .707], [-.707, -.707]];
  const finite = (n, fallback = 0) => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const floor = s => s.stories ? s.stories.floor : 0;
  const offset = s => ({ x: s.world ? s.world.originX * T : 0, y: s.world ? s.world.originY * T : 0 });
  function create() {
    return { enabled: false, text: 'Watch mode is off.', clock: 0, nextCommand: 0, nextPath: 0, nextPlan: 0,
      target: null, path: [], pathKey: '', blocked: {}, visited: {}, lastPoint: null, stuck: 0,
      commands: 0, decisions: 0, pendingLoot: null, lastCommand: '' };
  }
  function toggle(pilot, on) {
    if (!pilot) return false;
    pilot.enabled = on === undefined ? !pilot.enabled : !!on;
    pilot.text = pilot.enabled ? 'Planning a safe scavenging route.' : 'Watch mode is off.';
    pilot.path = []; pilot.target = null; pilot.previousDecision = null; pilot.nextPath = pilot.clock; pilot.stuck = 0; pilot.lastPoint = null;
    return pilot.enabled;
  }
  function status(pilot) { return { enabled: !!(pilot && pilot.enabled), text: pilot ? pilot.text : 'Watch mode is off.', neural: pilot && S.Neural ? S.Neural.summary(pilot.brain) : null, choices: pilot && pilot.choices || [] }; }
  function neutral(s) {
    const p = s && s.player;
    return { moveX: 0, moveY: 0, aimX: p ? finite(p.x) + Math.cos(finite(p.angle)) * 80 : 0,
      aimY: p ? finite(p.y) + Math.sin(finite(p.angle)) * 80 : 0, attack: false, shoot: false, sprint: false, sneak: false };
  }
  function emit(pilot, output, command, text) {
    pilot.text = text;
    if (pilot.clock + .000001 >= pilot.nextCommand) {
      output.command = command; pilot.nextCommand = pilot.clock + COMMAND_INTERVAL;
      pilot.lastCommand = command; pilot.commands++;
    }
    return output;
  }
  function clear(s, x, y) {
    return [[-10, -10], [10, -10], [-10, 10], [10, 10]].every(d => !S.Engine.isSolid(s, (x + d[0]) / T, (y + d[1]) / T));
  }
  function key(s, item) {
    const o = offset(s); return floor(s) + ':' + Math.round(item.x + o.x) + ',' + Math.round(item.y + o.y) + ':' + String(item.id || 'route');
  }
  function trim(map, now) {
    for (const [k, v] of Object.entries(map)) if (v <= now) delete map[k];
    const keys = Object.keys(map); for (let i = 0; i < keys.length - 128; i++) delete map[keys[i]];
  }
  function owned(s, predicate) {
    return Object.keys(s.player.inventory).filter(id => s.player.inventory[id] > 0 && Object.hasOwn(S.Catalog.items, id) && predicate(S.Catalog.items[id], id));
  }
  function bestMelee(s) {
    return owned(s, i => i.weapon && i.weapon.kind === 'melee').sort((a, b) => score(b) - score(a) || a.localeCompare(b))[0];
    function score(id) { const w = S.Catalog.items[id].weapon; return w.damage / w.cooldown + w.range * .2 - w.staminaCost * .6; }
  }
  function supplies(s, field) { return owned(s, i => i.effect && i.effect[field] > 0 && !(i.effect.infection < 0)); }
  // Matches the engine's bandage command, which only uses dressings that stop bleeding.
  function hasDressing(s) { return owned(s, i => i.effect && i.effect.bleeding > 0).length > 0; }
  function remedy(s) { return owned(s, i => i.effect && i.effect.health > 0 && !(i.effect.infection < 0)).sort((a, b) => S.Catalog.items[b].effect.health - S.Catalog.items[a].effect.health || a.localeCompare(b))[0]; }
  function danger(s) {
    return s.zombies.concat((s.humans || []).filter(h => h.faction === 'raider')).filter(h => h.health > 0 && distance(h, s.player) < 390)
      .map(h => ({ actor: h, d: distance(h, s.player), visible: S.Engine.hasLOS(s, s.player.x, s.player.y, h.x, h.y) }))
      .filter(h => h.visible).sort((a, b) => a.d - b.d || String(a.actor.id).localeCompare(String(b.actor.id)));
  }
  function safeAttack(s, enemy, gun, range) {
    const p = s.player, dx = enemy.x - p.x, dy = enemy.y - p.y, length = Math.hypot(dx, dy) || 1;
    return !(s.humans || []).some(h => {
      if (h.faction !== 'survivor' || h.health <= 0) return false;
      const x = h.x - p.x, y = h.y - p.y, d = Math.hypot(x, y), along = (x * dx + y * dy) / length;
      return gun ? along >= 0 && along < length && Math.abs(x * dy - y * dx) / length < 20 : d <= range && d > 0 && along / d > .12;
    });
  }
  function evade(s, enemies, input) {
    const p = s.player; let best = null, bestScore = -Infinity;
    for (const [x, y] of directions) {
      if (!clear(s, p.x + x * 23, p.y + y * 23)) continue;
      const score = enemies.slice(0, 8).reduce((n, e) => n + Math.min(180, Math.hypot(p.x + x * 65 - e.actor.x, p.y + y * 65 - e.actor.y)) / Math.max(25, e.d), 0);
      if (score > bestScore) { best = [x, y]; bestScore = score; }
    }
    if (best) { input.moveX = best[0]; input.moveY = best[1]; }
  }
  // Use the production actor path helper first. Closed doors need a small bounded
  // A* fallback because actor paths correctly treat them as solid until opened.
  function route(s, target) {
    const p = s.player, step = S.Actors && S.Actors.pathStep(s, p, target);
    if (step) return [step];
    const sx = Math.floor(p.x / T), sy = Math.floor(p.y / T), tx = Math.floor(target.x / T), ty = Math.floor(target.y / T);
    if (tx < 1 || ty < 1 || tx >= s.width - 1 || ty >= s.height - 1) return [];
    const start = sy * s.width + sx, goal = ty * s.width + tx, cost = new Map([[start, 0]]), previous = new Map(), heap = [];
    const heuristic = id => Math.abs(id % s.width - tx) + Math.abs(Math.floor(id / s.width) - ty);
    function push(id, score) { let i = heap.length; heap.push({ id, score }); while (i > 0) { const j = (i - 1) >> 1; if (heap[j].score <= score) break; heap[i] = heap[j]; i = j; } heap[i] = { id, score }; }
    function pop() { const result = heap[0], last = heap.pop(); if (heap.length) { let i = 0; while (i * 2 + 1 < heap.length) { let j = i * 2 + 1; if (j + 1 < heap.length && heap[j + 1].score < heap[j].score) j++; if (heap[j].score >= last.score) break; heap[i] = heap[j]; i = j; } heap[i] = last; } return result.id; }
    push(start, heuristic(start));
    for (let n = 0; heap.length && n < 4096; n++) {
      const id = pop();
      if (id === goal) {
        const path = []; let cell = goal;
        while (cell !== start && path.length < 512) { path.push({ x: (cell % s.width + .5) * T, y: (Math.floor(cell / s.width) + .5) * T }); cell = previous.get(cell); if (cell === undefined) return []; }
        return path.reverse();
      }
      const x = id % s.width, y = Math.floor(id / s.width);
      for (const [dx, dy] of directions.slice(0, 4)) {
        const xx = x + dx, yy = y + dy, next = yy * s.width + xx;
        if (xx < 1 || yy < 1 || xx >= s.width - 1 || yy >= s.height - 1) continue;
        const tile = s.tiles[next], door = tile === 6;
        if (!door && S.Engine.isSolid(s, xx, yy)) continue;
        const nextCost = cost.get(id) + (door ? 2 : 1);
        if (cost.has(next) && cost.get(next) <= nextCost) continue;
        cost.set(next, nextCost); previous.set(next, id); push(next, nextCost + heuristic(next));
      }
    }
    return [];
  }
  function localTarget(s, target) { const o = offset(s); return { x: target.x - o.x, y: target.y - o.y }; }
  function setTarget(pilot, s, item, kind) {
    const o = offset(s); pilot.target = { x: item.x + o.x, y: item.y + o.y, floor: floor(s), id: item.id, key: key(s, item), kind, label: item.label || kind };
    pilot.path = []; pilot.pathKey = ''; pilot.nextPath = 0; pilot.stuck = 0;
  }
  function walk(pilot, s, output) {
    const p = s.player, goal = localTarget(s, pilot.target), o = offset(s), identity = o.x + ',' + o.y + ':' + floor(s) + ':' + Math.floor(goal.x / T) + ',' + Math.floor(goal.y / T);
    if (pilot.clock >= pilot.nextPath || identity !== pilot.pathKey || !pilot.path.length) {
      pilot.path = route(s, goal); pilot.pathKey = identity; pilot.nextPath = pilot.clock + PATH_INTERVAL;
      if (!pilot.path.length) { pilot.blocked[pilot.target.key] = pilot.clock + 20; pilot.target = null; pilot.text = 'Looking for a reachable route.'; return output; }
    }
    while (pilot.path.length > 1 && distance(p, pilot.path[0]) < 9) pilot.path.shift();
    const next = pilot.path[0], d = distance(p, next), tile = s.tiles[Math.floor(next.y / T) * s.width + Math.floor(next.x / T)];
    output.input.aimX = next.x; output.input.aimY = next.y;
    if (tile === 6 && d < 64 && S.Engine.nearby(s) === 'Open door') {
      pilot.nextPath = 0; return emit(pilot, output, 'interact', 'Opening a door along the route.');
    }
    if (d > 4) { output.input.moveX = (next.x - p.x) / d; output.input.moveY = (next.y - p.y) / d; }
    pilot.text = pilot.target.kind === 'radio' ? 'Returning recovered parts to the emergency radio.' : pilot.target.kind === 'person' ? 'Approaching a survivor with supplies.' : pilot.target.kind === 'shelter' ? 'Finding shelter to recover.' : 'Scavenging ' + pilot.target.label + '.';
    return output;
  }
  function selectTarget(pilot, s) {
    const p = s.player, partsNeeded = !s.goal.active && !s.goal.complete && (p.inventory.parts || 0) + s.goal.parts >= s.goal.required;
    if (s.mode === 'rescue' && partsNeeded) { setTarget(pilot, s, { x: s.goal.radioX, y: s.goal.radioY, id: 'radio' }, 'radio'); return; }
    if (s.progression && s.progression.fatigue > 76) {
      const shelter = s.structures.filter(b => b.type === 'campfire').map(b => ({ ...b, id: 'fire', label: 'campfire' }));
      for (const b of s.buildings) shelter.push({ x: (b.x + b.w / 2) * T, y: (b.y + b.h / 2) * T, id: 'shelter:' + b.x + ',' + b.y, label: b.name });
      const candidate = shelter.filter(b => !pilot.blocked[key(s, b)]).sort((a, b) => distance(p, a) - distance(p, b))[0];
      if (candidate) { setTarget(pilot, s, candidate, 'shelter'); return; }
    }
    const containers = s.containers.filter(c => !c.looted && !c._ground && !pilot.blocked[key(s, c)] && Object.values(c.items).some(n => n > 0));
    containers.sort((a, b) => value(b) - value(a) || key(s, a).localeCompare(key(s, b)));
    if (containers.length) { setTarget(pilot, s, containers[0], 'loot'); return; }
    const survivor = (s.humans || []).filter(h => h.health > 0 && h.faction === 'survivor' && !h.following && (p.inventory.food || 0) > 3 && !pilot.blocked[key(s, h)])
      .sort((a, b) => distance(p, a) - distance(p, b))[0];
    if (survivor) { setTarget(pilot, s, survivor, 'person'); return; }
    // Loaded roads give a deterministic exploration route and continue across
    // sector rebases. Old visited cells age out instead of growing without bound.
    let best = null, score = Infinity;
    for (let y = 3; y < s.height - 3; y += 3) for (let x = 3; x < s.width - 3; x += 3) {
      if (s.tiles[y * s.width + x] !== 1) continue;
      const point = { x: (x + .5) * T, y: (y + .5) * T, id: 'road' }, k = key(s, point), d = distance(p, point);
      if (d < 180 || pilot.visited[k] || pilot.blocked[k]) continue;
      const n = d + (x + y) * .001; if (n < score) { best = point; score = n; }
    }
    if (best) setTarget(pilot, s, best, 'explore');
    else pilot.text = 'Waiting for a safe, reachable route.';
    function value(c) {
      let bonus = 0;
      if (s.mode === 'rescue' && !s.goal.active && !s.goal.complete) bonus += (c.items.parts || 0) * 160;
      if (p.thirst > 50 || supplies(s, 'thirst').length < 2) bonus += Object.keys(c.items).filter(id => S.Catalog.items[id].effect && S.Catalog.items[id].effect.thirst > 0).length * 90;
      if (p.hunger > 50 || supplies(s, 'hunger').length < 2) bonus += Object.keys(c.items).filter(id => S.Catalog.items[id].effect && S.Catalog.items[id].effect.hunger > 0).length * 65;
      return bonus - distance(p, c);
    }
  }
  function plan(pilot, s, dt) {
    const output = { input: neutral(s) };
    if (!pilot || !pilot.enabled || !s || !s.player || !S.Engine || !S.Catalog) return output;
    if (s.ended || s.player.health <= 0) { pilot.enabled = false; pilot.text = s.won ? 'The rescue is complete.' : 'This survivor has fallen.'; return output; }
    const elapsed = Math.min(.1, Math.max(0, finite(dt)));
    if (!elapsed) return output;
    pilot.clock += elapsed; pilot.decisions++; trim(pilot.blocked, pilot.clock); trim(pilot.visited, pilot.clock);
    const p = s.player, input = output.input, inv = p.inventory, enemies = danger(s), closest = enemies[0], safe = !closest || closest.d > 110;
    const o = offset(s), point = { x: p.x + o.x, y: p.y + o.y, floor: floor(s) };
    if (pilot.lastPoint && pilot.target && pilot.lastPoint.floor === point.floor) pilot.stuck = distance(pilot.lastPoint, point) < .15 ? pilot.stuck + elapsed : 0;
    pilot.lastPoint = point;
    if (pilot.pendingLoot && pilot.clock >= pilot.pendingLoot.at) {
      const c = s.containers.find(c => key(s, c) === pilot.pendingLoot.key);
      if (c && !c.looted) pilot.blocked[pilot.pendingLoot.key] = pilot.clock + 45;
      pilot.pendingLoot = null;
    }
    if (pilot.target && (pilot.target.floor !== floor(s) || pilot.stuck > 2.5)) {
      pilot.blocked[pilot.target.key] = pilot.clock + 20; pilot.target = null; pilot.path = []; pilot.stuck = 0;
    }
    if (p.vehicleId) return emit(pilot, output, 'vehicle', 'Stopping and leaving the vehicle to scavenge.');
    // Medical and basic needs are paid through the normal action dispatcher.
    if ((p.bleeding > .1 || p.health < 62) && hasDressing(s)) return emit(pilot, output, 'bandage', 'Treating injuries with carried supplies.');
    if (p.health < 62 && remedy(s)) return emit(pilot, output, 'use:' + remedy(s), 'Treating injuries with carried supplies.');
    if (p.infection >= 3) {
      const treatment = owned(s, i => i.effect && i.effect.infection > 0)[0];
      if (treatment) return emit(pilot, output, 'use:' + treatment, 'Using carried treatment for infection.');
    }
    if (p.thirst > 48 && supplies(s, 'thirst').length) return emit(pilot, output, 'drink', 'Drinking from carried supplies.');
    if (p.hunger > 55 && supplies(s, 'hunger').length) return emit(pilot, output, 'eat', 'Eating carried food.');
    if (s.conversation) {
      const h = (s.humans || []).find(h => h.id === s.conversation.id), c = s.progression && s.progression.contacts[s.conversation.id];
      if (safe && h && c && S.Progression.quoteRequest(s, h) && S.Progression.quoteRequest(s, h).can) return emit(pilot, output, 'helpSurvivor', 'Delivering the survivor request.');
      if (safe && h && !h.following && (inv.food || 0) > 3 && (s.humans || []).filter(h => h.following && h.health > 0).length < 12)
        return emit(pilot, output, 'recruit', 'Sharing a ration and recruiting a companion.');
      if (h) pilot.blocked[key(s, h)] = pilot.clock + 90;
      return emit(pilot, output, 'closeConversation', 'Returning to the route.');
    }
    if (closest && closest.d < 290) {
      const gunId = owned(s, i => i.weapon && i.weapon.kind === 'firearm' && (inv[i.weapon.ammoId] > 0 || (p.magazines || {})[Object.keys(S.Catalog.items).find(id => S.Catalog.items[id] === i)] > 0))
        .sort((a, b) => S.Catalog.items[b].weapon.damage - S.Catalog.items[a].weapon.damage)[0];
      const desired = closest.actor.faction === 'raider' && gunId && closest.d > 80 ? gunId : bestMelee(s);
      if (desired && p.weapon !== desired) return emit(pilot, output, 'equip:' + desired, 'Equipping an owned weapon for nearby danger.');
      const w = S.Catalog.items[p.weapon] && S.Catalog.items[p.weapon].weapon;
      if (w) {
        const gun = w.kind === 'firearm'; input.aimX = closest.actor.x; input.aimY = closest.actor.y;
        if (gun && p.ammo <= 0 && inv[w.ammoId] > 0) return emit(pilot, output, 'reload', 'Reloading from carried ammunition.');
        const pressured = enemies.filter(e => e.d < 100).length > 2;
        if (closest.d < (gun ? 145 : Math.max(43, w.range - 16)) || p.stamina < w.staminaCost + 10 || pressured) {
          evade(s, enemies, input); input.sprint = closest.d < 46 && p.health < 45 && p.stamina > 30;
        } else if (closest.d > (gun ? 210 : w.range - 5)) {
          const d = closest.d; input.moveX = (closest.actor.x - p.x) / d; input.moveY = (closest.actor.y - p.y) / d;
          if (!clear(s, p.x + input.moveX * 20, p.y + input.moveY * 20)) { input.moveX = 0; input.moveY = 0; }
        }
        input.attack = closest.d <= w.range && p.cooldown <= 0 && p.stamina >= w.staminaCost + 1 && (!gun || p.ammo > 0) && safeAttack(s, closest.actor, gun, w.range);
        pilot.text = input.attack ? 'Fighting nearby danger while keeping room to move.' : 'Keeping distance from nearby danger.';
        pilot.nextPath = 0; return output;
      }
      evade(s, enemies, input); pilot.text = 'Retreating until a weapon is available.'; return output;
    }
    if (!safe) { evade(s, enemies, input); pilot.text = 'Moving away from danger.'; return output; }
    const pack = owned(s, i => i.capacity > 0).sort((a, b) => S.Catalog.items[b].capacity - S.Catalog.items[a].capacity)[0];
    if (pack && p.equipment.backpack !== pack) return emit(pilot, output, 'equip:' + pack, 'Equipping the best carried backpack.');
    const armor = owned(s, i => i.armor > 0).sort((a, b) => S.Catalog.items[b].armor - S.Catalog.items[a].armor)[0];
    if (armor && p.equipment.clothing !== armor) return emit(pilot, output, 'equip:' + armor, 'Equipping carried protection.');
    const melee = bestMelee(s); if (melee && p.weapon !== melee) return emit(pilot, output, 'equip:' + melee, 'Equipping a dependable carried melee weapon.');
    if (s.progression && s.progression.sleeping) { pilot.text = 'Sleeping safely until rested.'; return output; }
    if (s.progression && s.progression.fatigue > 76 && S.Progression.abilityQuote(s, 'sleep').can)
      return emit(pilot, output, 'ability:sleep', 'Sleeping in shelter to restore stamina recovery.');
    if (p.resting) return emit(pilot, output, 'rest', 'Leaving rest to continue scavenging.');
    if (s.progression) {
      for (const id of Object.keys(S.Progression.manuals)) if (inv[id] > 0 && !s.progression.studied.includes(id)) return emit(pilot, output, 'study:' + id, 'Studying a carried reference book.');
      for (const project of S.Progression.projects) if (S.Progression.quoteResearch(s, project.id).can) return emit(pilot, output, 'research:' + project.id, 'Learning ' + project.name.toLowerCase() + '.');
    }
    for (const id of ['filter_water', 'boil_water', 'field_wraps', 'assemble_radio_parts', 'salvage_radio']) {
      const worthwhile = id.includes('water') ? supplies(s, 'thirst').length < 2 : id === 'field_wraps' ? !hasDressing(s) : s.mode === 'rescue' && !s.goal.active && !s.goal.complete && (inv.parts || 0) + s.goal.parts < s.goal.required;
      if (worthwhile && S.Engine.craftQuote(s, id).can) return emit(pilot, output, 'craft:' + id, 'Preparing useful supplies from owned materials.');
    }
    if (!pilot.target) selectTarget(pilot, s);
    if (!pilot.target) return output;
    const target = localTarget(s, pilot.target), d = distance(p, target), kind = pilot.target.kind;
    if (kind === 'loot') {
      const c = s.containers.find(c => key(s, c) === pilot.target.key);
      if (!c || c.looted) { pilot.target = null; return output; }
      const near = S.Engine.nearby(s);
      if (d < 67 && S.Engine.hasLOS(s, p.x, p.y, c.x, c.y) && near === 'Collect ' + c.label) {
        const result = emit(pilot, output, 'interact', 'Collecting ' + c.label + '.');
        // A repeat attempt keeps the first deadline, so a container that cannot be emptied is set aside.
        if (result.command) { if (!pilot.pendingLoot || pilot.pendingLoot.key !== pilot.target.key) pilot.pendingLoot = { key: pilot.target.key, at: pilot.clock + .5 }; pilot.target = null; pilot.path = []; }
        return result;
      }
    }
    if (kind === 'radio' && d < 65 && S.Engine.nearby(s).startsWith('Repair emergency radio')) {
      const result = emit(pilot, output, 'interact', 'Installing recovered radio parts.'); if (result.command) pilot.target = null; return result;
    }
    if (kind === 'person' && d < 75 && S.Engine.nearby(s).startsWith('Talk to ')) {
      const result = emit(pilot, output, 'interact', 'Meeting a survivor along the route.'); if (result.command) pilot.target = null; return result;
    }
    if (kind === 'explore' && d < 24 || kind === 'shelter' && d < 24) {
      pilot.visited[pilot.target.key] = pilot.clock + 120; pilot.target = null; return output;
    }
    return walk(pilot, s, output);
  }
  function step(pilot, s, dt) {
    const output = plan(pilot, s, dt), p = s && s.player;
    if (!pilot || !pilot.enabled || !p || !S.Neural || !(dt > 0)) return output;
    if (!pilot.brain || pilot.brain.seed !== (s.seed >>> 0)) { pilot.brain = S.Neural.prepare(s.seed); pilot.neuralNext = 0; pilot.previousDecision = null; }
    const previous = pilot.previousDecision, global = offset(s), point = { x: p.x + global.x, y: p.y + global.y };
    if (previous && pilot.clock >= previous.at + .2) {
      const moved = Math.hypot(point.x - previous.x, point.y - previous.y), hurt = Math.max(0, previous.health - p.health);
      const reward = moved < 1 || hurt > 0 ? -.9 : S.Neural.teacher(previous.features);
      S.Neural.learn(pilot.brain, previous.features, reward, .015); pilot.brain.feedback++; pilot.previousDecision = null;
    }
    const input = output.input, length = Math.hypot(input.moveX, input.moveY); if (length < .001 || p.vehicleId) return output;
    const enemies = danger(s), desired = { x: input.moveX / length, y: input.moveY / length }, choices = [];
    for (let i = 0; i < directions.length; i++) {
      const [x, y] = directions[i], near = clear(s, p.x + x * 22, p.y + y * 22), far = clear(s, p.x + x * 58, p.y + y * 58);
      const threat = enemies.slice(0, 8).reduce((n, e) => n + (Math.hypot(p.x + x * 58 - e.actor.x, p.y + y * 58 - e.actor.y) - e.d) / 58 / Math.max(1, e.d / 90), 0);
      const f = [near ? 0 : 1, far ? 1 : 0, x * desired.x + y * desired.y, Math.max(-1, Math.min(1, threat)), p.stamina / 100, Math.min(1, enemies.length / 8)];
      choices.push({ direction: i, score: S.Neural.predict(pilot.brain, f), safe: near, features: f });
    }
    pilot.choices = choices.map(c => ({ direction: c.direction, score: c.score, safe: c.safe }));
    // Physical collision checks remain authoritative. Preserve exact path heading
    // away from danger so a learned turn cannot skip a door or a narrow passage.
    const pressured = enemies.some(e => e.d < 160), requestedClear = clear(s, p.x + desired.x * 22, p.y + desired.y * 22);
    const best = choices.filter(c => c.safe).sort((a, b) => b.score - a.score || a.direction - b.direction)[0];
    if (best && (pressured || !requestedClear)) { input.moveX = directions[best.direction][0]; input.moveY = directions[best.direction][1]; }
    else if (!best) { input.moveX = 0; input.moveY = 0; }
    if (best && !pilot.previousDecision && pilot.clock >= pilot.neuralNext) {
      const features = pressured || !requestedClear ? best.features.slice() : [0, clear(s, p.x + desired.x * 58, p.y + desired.y * 58) ? 1 : 0, 1, Math.max(-1, Math.min(1, enemies.slice(0, 8).reduce((n, e) => n + (Math.hypot(p.x + desired.x * 58 - e.actor.x, p.y + desired.y * 58 - e.actor.y) - e.d) / 58 / Math.max(1, e.d / 90), 0))), p.stamina / 100, Math.min(1, enemies.length / 8)];
      pilot.previousDecision = { features, x: point.x, y: point.y, health: p.health, at: pilot.clock }; pilot.neuralNext = pilot.clock + .4;
    }
    return output;
  }
  S.Autoplay = Object.freeze({ create, toggle, step, status });
})();
