(function () {
  'use strict';
  const Sirens = window.Sirens = window.Sirens || {};
  const TAU = Math.PI * 2;
  const COLORS = {
    grass: '#294238', grassLight: '#334d3d', grassDark: '#24392f', road: '#424b49',
    floor: '#827e61', wall: '#c4bea0', water: '#284a54', fog: '#091b1c',
    gold: '#ebcd7e', ink: '#132326', zombie: '#87a47b', roof: '#33454a'
  };

  function noise(x, y, seed) {
    let n = Math.imul(x + 127, 374761393) ^ Math.imul(y + 311, 668265263) ^ (seed | 0);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function buildingTheme(b, state) {
    const name = String(b.name || '').toLowerCase();
    const type = /clinic|pharmacy|aid/.test(name) ? 'medical' : /grocer|market|store|restaurant|clothing/.test(name) ? 'shop' : /warehouse|depot|distribution/.test(name) ? 'warehouse' : /workshop|machine|garage|maintenance|hardware|ranger shed|tool shed/.test(name) ? 'workshop' : /fuel/.test(name) ? 'fuel' : /barn|farm/.test(name) ? 'barn' : /library|office|police|electronics/.test(name) ? 'office' : /cabin|shed|shelter|camp|ranger/.test(name) ? 'cabin' : 'home';
    const palettes = {
      medical: ['#bcc8bc', '#a2b4ae', '#d7dcd0', '#497b72', 'tile'],
      shop: ['#b49478', '#827969', '#dac3a0', '#a56a4a', 'tile'],
      warehouse: ['#82918c', '#647878', '#aab7b0', '#a29c63', 'metal'],
      workshop: ['#82786c', '#72796a', '#b5ad91', '#9caa84', 'brick'],
      fuel: ['#c0b399', '#777e75', '#ddd1ac', '#a55c48', 'tile'],
      barn: ['#a3765b', '#807049', '#c5a87b', '#a88b4d', 'plank'],
      office: ['#a6aea3', '#85938b', '#c7d0ba', '#546e80', 'brick'],
      cabin: ['#998363', '#7b7155', '#c3b38b', '#657c5b', 'plank'],
      home: ['#baaa94', '#8d8272', '#dfc7a8', '#8c6969', 'plank']
    };
    const gx = b.x + (state.world ? state.world.originX : 0), gy = b.y + (state.world ? state.world.originY : 0), variant = Math.floor(noise(gx, gy, state.seed) * 4), row = palettes[type];
    const tint = (hex, amount) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, parseInt(hex.slice(i, i + 2), 16) + amount)).toString(16).padStart(2, '0')).join('');
    return { type, wall: tint(row[0], (variant - 1) * 6), floor: tint(row[1], (variant - 1) * 4), trim: row[2], accent: row[3], material: row[4], variant };
  }
  // Minimap tile colors as packed RGBA words in the platform's byte order.
  const MINI_WORDS = (function () {
    const bytes = new Uint8ClampedArray(4), word = new Uint32Array(bytes.buffer);
    return ['#35513d', '#7b806c', '#9c9877', '#bfbea0', '#41666a', '#263e32', '#c9ac75', '#acb391', '#92b8b4', '#b1b99a'].map(hex => {
      bytes[0] = parseInt(hex.slice(1, 3), 16); bytes[1] = parseInt(hex.slice(3, 5), 16); bytes[2] = parseInt(hex.slice(5, 7), 16); bytes[3] = 255;
      return word[0];
    });
  }());
  function surface(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    return canvas;
  }
  function roundRect(ctx, x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  }

  class Renderer {
    constructor(canvas, minimapCanvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.minimap = minimapCanvas || null;
      this.miniCtx = this.minimap ? this.minimap.getContext('2d', { alpha: false }) : null;
      this.width = 1; this.height = 1; this.dpr = 1;
      this.camera = { x: 0, y: 0, ready: false };
      this.zoom = 1; this.ambientMotion = true;
      // 'top' is the original camera; 'first' delegates to the raycast view. main.js owns the yaw.
      this.viewMode = 'top'; this.viewYaw = 0; this.firstPerson = null;
      this.drawTimes = new Float32Array(120); this.drawCount = 0;
      this.lastOriginX = 0; this.lastOriginY = 0; this.lastRevision = 0;
      this.lastFloor = 0;
      this.clock = 0; this.lastTime = 0; this.lastMini = -1000;
      this.minimapState = null; this.miniTerrain = null;
      this.grassSprites = []; this.floorSprites = []; this.waterSprites = []; this.treeSprites = [];
      this.createArt();
      this.resize = this.resize.bind(this);
      window.addEventListener('resize', this.resize);
      this.resize();
    }

    createArt() {
      for (let variant = 0; variant < 12; variant++) {
        const tile = surface(32, 32); const c = tile.getContext('2d');
        c.fillStyle = variant % 3 === 0 ? COLORS.grassLight : variant % 3 === 1 ? COLORS.grass : COLORS.grassDark;
        c.fillRect(0, 0, 32, 32);
        for (let i = 0; i < 15; i++) {
          const x = Math.floor(noise(i, variant, 6) * 30), y = Math.floor(noise(variant, i, 91) * 30);
          c.fillStyle = i % 3 === 0 ? '#405342' : i % 3 === 1 ? '#243a31' : '#385341';
          c.fillRect(x, y, 2 + i % 3, 1);
          if (i % 4 === 0) c.fillRect(x + 1, y - 1, 1, 1);
        }
        if (variant === 5 || variant === 10) {
          c.fillStyle = '#a49d66'; c.fillRect(9, 13, 2, 2); c.fillRect(22, 25, 2, 1);
        }
        this.grassSprites.push(tile);
        const floor = surface(32, 32); const f = floor.getContext('2d');
        f.fillStyle = variant % 2 ? '#7c795d' : '#858164'; f.fillRect(0, 0, 32, 32);
        f.fillStyle = '#716d54'; f.fillRect(0, 15, 32, 1); f.fillRect(0, 31, 32, 1);
        f.fillRect((variant % 3) * 9 + 4, 0, 1, 15); f.fillRect(22 - (variant % 3) * 5, 16, 1, 15);
        f.fillStyle = '#918b6c'; f.fillRect(2, 2, 19, 1); f.fillRect(9, 19, 17, 1);
        this.floorSprites.push(floor);
        const water = surface(32, 32); const w = water.getContext('2d');
        w.fillStyle = variant % 2 ? '#2b5056' : '#27474f'; w.fillRect(0, 0, 32, 32);
        w.fillStyle = '#3b6466'; w.fillRect(4, 6 + variant % 7, 13, 1); w.fillRect(18, 24 - variant % 8, 10, 1);
        w.fillStyle = '#203f47'; w.fillRect(11, 18, 13, 2);
        this.waterSprites.push(water);
      }
      for (let variant = 0; variant < 8; variant++) {
        const tree = surface(80, 96); const t = tree.getContext('2d');
        ellipse(t, 43, 78, 27, 10, '#142c2570');
        t.fillStyle = '#6d6346'; t.fillRect(36, 55, 7, 25);
        t.fillStyle = '#99815b'; t.fillRect(36, 57, 2, 20);
        t.fillStyle = '#3d4732'; t.fillRect(30, 75, 18, 3);
        const pine = variant % 3 === 0;
        if (pine) {
          const shades = ['#172f2a', '#1d3930', '#274637', '#35533e'];
          for (let layer = 0; layer < 4; layer++) {
            const yy = 14 + layer * 14, half = 10 + layer * 7;
            t.fillStyle = shades[layer]; t.beginPath(); t.moveTo(39, yy - 13);
            t.lineTo(39 - half, yy + 22); t.lineTo(39 + half, yy + 22); t.closePath(); t.fill();
            t.fillStyle = '#4b6342'; t.fillRect(37 - half / 2, yy + 15, half / 2, 2);
          }
        } else {
          ellipse(t, 39, 45, 30, 30, '#18372c');
          ellipse(t, 30, 44, 25, 24, variant % 2 ? '#2e4d35' : '#294933');
          ellipse(t, 45, 33, 23, 23, '#35583c');
          ellipse(t, 28, 29, 17, 18, '#456345');
          ellipse(t, 53, 49, 17, 19, '#244633');
          for (let i = 0; i < 13; i++) {
            const xx = 20 + noise(i, variant, 32) * 35, yy = 15 + noise(i, variant, 66) * 44;
            t.fillStyle = i % 3 === 0 ? '#66805a' : '#4f6d48'; t.fillRect(Math.floor(xx), Math.floor(yy), 5, 2);
          }
        }
        this.treeSprites.push(tree);
      }

    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, Math.round(rect.width || window.innerWidth));
      this.height = Math.max(1, Math.round(rect.height || window.innerHeight));
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.imageSmoothingEnabled = false;
      const v = this.ctx.createRadialGradient(this.width / 2, this.height / 2, Math.min(this.width, this.height) * .16,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) * .66);
      v.addColorStop(0, '#07131400'); v.addColorStop(.62, '#07131405'); v.addColorStop(1, '#06151718');
      this.vignette = v;
      if (this.minimap) {
        const miniRect = this.minimap.getBoundingClientRect();
        this.miniWidth = Math.max(1, Math.round(miniRect.width || 170));
        this.miniHeight = Math.max(1, Math.round(miniRect.height || 170));
        this.minimap.width = Math.round(this.miniWidth * this.dpr);
        this.minimap.height = Math.round(this.miniHeight * this.dpr);
        this.miniCtx.imageSmoothingEnabled = false;
      }
      this.lastMini = -1000;
    }

    screenToWorld(clientX, clientY, state) {
      this.syncOrigin(state);
      const rect = this.canvas.getBoundingClientRect();
      const camera = this.camera.ready ? this.camera : state.player;
      return {
        x: ((clientX - rect.left) * this.width / Math.max(1, rect.width) - this.width / 2) / this.zoom + camera.x,
        y: ((clientY - rect.top) * this.height / Math.max(1, rect.height) - this.height / 2) / this.zoom + camera.y
      };
    }

    syncOrigin(state) {
      if (!state || !state.player) return;
      const originX = state.world && Number(state.world.originX) || 0;
      const originY = state.world && Number(state.world.originY) || 0;
      const revision = state.world && Number(state.world.revision) || 0;
      const floor = state.stories && Number(state.stories.floor) || 0;
      if (this.lastDrawState !== state || !this.camera.ready) {
        this.camera.x = state.player.x; this.camera.y = state.player.y; this.camera.ready = true;
        this.lastDrawState = state; this.lastMini = -1000;
      } else if (originX !== this.lastOriginX || originY !== this.lastOriginY) {
        this.camera.x -= (originX - this.lastOriginX) * state.tileSize;
        this.camera.y -= (originY - this.lastOriginY) * state.tileSize;
        this.lastMini = -1000;
      } else if (revision !== this.lastRevision) {
        this.lastMini = -1000;
      }
      if (floor !== this.lastFloor) { this.lastMini = -1000; }
      this.lastOriginX = originX; this.lastOriginY = originY; this.lastRevision = revision;
      this.lastFloor = floor;
    }

    biomeAt(state, tx, ty) {
      if (!state.world) return 'town';
      const gx = tx + (Number(state.world.originX) || 0), gy = ty + (Number(state.world.originY) || 0);
      const cx = Math.floor(gx / 64), cy = Math.floor(gy / 64);
      const biomes = state.world.activeBiomes || {};
      return biomes[cx + ',' + cy] || (Sirens.World && typeof Sirens.World.biome === 'function' ? Sirens.World.biome(state.seed, cx, cy) : state.world.biome || 'town');
    }

    tile(state, x, y) {
      if (x < 0 || y < 0 || x >= state.width || y >= state.height) return -1;
      return state.tiles[y * state.width + x];
    }

    known(state, x, y) {
      const tx = Math.floor(x / state.tileSize), ty = Math.floor(y / state.tileSize);
      return tx >= 0 && ty >= 0 && tx < state.width && ty < state.height;
    }

    inView(x, y, margin) {
      const m = margin || 64;
      return x > this.left - m && y > this.top - m && x < this.right + m && y < this.bottom + m;
    }

    setView(mode) {
      const next = mode === 'first' && Sirens.FirstPerson ? 'first' : 'top';
      if (next !== this.viewMode) { this.viewMode = next; this.drawCount = 0; this.camera.ready = false; }
      return this.viewMode;
    }

    // Read-only view diagnostics: draw-time statistics for the current mode and, in first person,
    // the buffer size and the sprites the last frame actually drew.
    viewInfo() {
      const times = Array.from(this.drawTimes.subarray(0, Math.min(this.drawCount, this.drawTimes.length))).sort((a, b) => a - b);
      const mean = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0, round = (n) => Math.round(n * 100) / 100;
      return { mode: this.viewMode, draw: { mean: round(mean), p95: round(times.length ? times[Math.floor((times.length - 1) * .95)] : 0), max: round(times.length ? times[times.length - 1] : 0), samples: times.length },
        firstPerson: this.viewMode === 'first' && this.firstPerson ? this.firstPerson.describe(this.width) : null };
    }

    draw(state, frameInfo) {
      if (!state || !state.player) return;
      frameInfo = frameInfo || {};
      const now = performance.now();
      const delta = Math.min(.08, Math.max(.001, this.lastTime ? (now - this.lastTime) / 1000 : 1 / 60));
      this.lastTime = now; if (this.ambientMotion) this.clock += delta;
      const p = state.player;
      this.syncOrigin(state);
      if (this.viewMode === 'first' && Sirens.FirstPerson) { this.drawFirstPerson(state, now, delta); this.drawTimes[this.drawCount++ % this.drawTimes.length] = performance.now() - now; return; }
      const ease = 1 - Math.exp(-12 * delta);
      this.camera.x += (p.x - this.camera.x) * ease;
      this.camera.y += (p.y - this.camera.y) * ease;
      const worldWidth = state.width * state.tileSize, worldHeight = state.height * state.tileSize;
      const viewWidth = this.width / this.zoom, viewHeight = this.height / this.zoom;
      this.camera.x = viewWidth < worldWidth ? Math.max(viewWidth / 2 - 24, Math.min(worldWidth - viewWidth / 2 + 24, this.camera.x)) : worldWidth / 2;
      this.camera.y = viewHeight < worldHeight ? Math.max(viewHeight / 2 - 24, Math.min(worldHeight - viewHeight / 2 + 24, this.camera.y)) : worldHeight / 2;
      this.left = Math.floor(this.camera.x - viewWidth / 2); this.top = Math.floor(this.camera.y - viewHeight / 2);
      this.right = this.left + viewWidth; this.bottom = this.top + viewHeight;
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = COLORS.fog; ctx.fillRect(0, 0, this.width, this.height);
      ctx.save(); ctx.scale(this.zoom, this.zoom); ctx.translate(-this.left, -this.top);
      this.prepareBuildings(state);
      this.drawTerrain(state);
      this.drawBuildingDetails(state);
      this.drawStairs(state);
      this.drawSettlement(state);
      this.drawSignals(state);
      this.drawLivingDetails(state);
      const entities = [];
      for (const vehicle of state.vehicles || []) {
        if (this.inView(vehicle.x, vehicle.y, 50) && this.known(state, vehicle.x, vehicle.y)) entities.push({ y: vehicle.y, kind: 'vehicle', data: vehicle });
      }
      for (const human of state.humans || []) {
        if (human.health <= 0 || !this.inView(human.x, human.y, 35) || !this.known(state, human.x, human.y)) continue;
        entities.push({ y: human.y, kind: 'human', data: human });
      }
      if (Sirens.Personal && !(state.stories && state.stories.floor > 0)) {
        for (const pet of Sirens.Personal.wild(state)) {
          if (this.inView(pet.x, pet.y, 30) && this.known(state, pet.x, pet.y)) entities.push({ y: pet.y + 3, kind: 'pet', data: pet });
        }
        for (const owned of Sirens.Personal.ensure(state).pets) {
          const pet = Object.assign({}, owned, Sirens.Personal.local(state, owned), { owned: true });
          if (this.inView(pet.x, pet.y, 30) && this.known(state, pet.x, pet.y)) entities.push({ y: pet.y + 3, kind: 'pet', data: pet });
        }
      }
      for (const container of state.containers || []) {
        if (this.inView(container.x, container.y) && this.known(state, container.x, container.y)) entities.push({ y: container.y, kind: 'container', data: container });
      }
      for (const structure of state.structures || []) {
        if (this.inView(structure.x, structure.y) && this.known(state, structure.x, structure.y)) entities.push({ y: structure.y, kind: 'structure', data: structure });
      }
      for (const zombie of state.zombies || []) {
        if (zombie.health <= 0 || !this.inView(zombie.x, zombie.y, 30) || !this.known(state, zombie.x, zombie.y)) continue;
        entities.push({ y: zombie.y, kind: 'zombie', data: zombie });
      }
      for (const peer of state.party || []) {
        const other = peer.player;
        if (other && other.health > 0 && this.inView(other.x, other.y, 40)) entities.push({ y: other.y, kind: 'partner', data: peer });
      }
      entities.push({ y: p.y, kind: 'player', data: p });
      for (const tree of this.visibleTrees) entities.push({ y: tree.y + 14, kind: 'tree', data: tree });
      entities.sort((a, b) => a.y - b.y);
      for (const entity of entities) {
        if (entity.kind === 'player') this.drawPlayer(entity.data, state);
        else if (entity.kind === 'zombie') this.drawZombie(entity.data);
        else if (entity.kind === 'container') this.drawContainer(entity.data, state);
        else if (entity.kind === 'vehicle') this.drawVehicle(entity.data, state);
        else if (entity.kind === 'human') this.drawHuman(entity.data, state);
        else if (entity.kind === 'partner') this.drawPartner(entity.data, state);
        else if (entity.kind === 'pet') this.drawPet(entity.data, state);
        else if (entity.kind === 'tree') this.drawTree(entity.data, state);
        else this.drawStructure(entity.data);
      }
      this.drawRoofs(state);
      this.drawParticles(state);
      ctx.restore();
      this.drawLighting(state);
      this.drawWeather(state);
      ctx.fillStyle = this.vignette; ctx.fillRect(0, 0, this.width, this.height);
      this.drawWaypoint(state);
      this.drawMinimap(state, now);
      this.drawTimes[this.drawCount++ % this.drawTimes.length] = performance.now() - now;
    }

    drawFirstPerson(state, now, delta) {
      const p = state.player, ctx = this.ctx, viewWidth = this.width / this.zoom, viewHeight = this.height / this.zoom;
      // The top-down camera stays on the survivor so screenToWorld and a switch back remain stable.
      this.camera.x = p.x; this.camera.y = p.y;
      this.left = Math.floor(p.x - viewWidth / 2); this.top = Math.floor(p.y - viewHeight / 2); this.right = this.left + viewWidth; this.bottom = this.top + viewHeight;
      this.prepareBuildings(state);
      const fp = this.firstPerson || (this.firstPerson = new Sirens.FirstPerson.View());
      fp.render(state, { width: this.width, height: this.height, yaw: this.viewYaw, clock: this.clock, delta, motion: this.ambientMotion, themes: this.themes,
        originX: this.lastOriginX, originY: this.lastOriginY, pose: Sirens.Effects ? Sirens.Effects.pose(state) : null, look: Sirens.Personal ? Sirens.Personal.look(state) : null, items: Sirens.Engine && Sirens.Engine.items || {} });
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = false;
      ctx.drawImage(fp.canvas, 0, 0, this.width, this.height);
      this.drawLighting(state);
      this.drawWeather(state);
      ctx.fillStyle = this.vignette; ctx.fillRect(0, 0, this.width, this.height);
      fp.overlay(ctx, this.width, this.height);
      this.drawMinimap(state, now);
    }

    prepareBuildings(state) {
      if (this.buildingSource === state.buildings) return;
      this.buildingSource = state.buildings; this.buildingTiles = new Map(); this.themes = new Map();
      for (const b of state.buildings || []) {
        const theme = buildingTheme(b, state); this.themes.set(b, theme);
        for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) this.buildingTiles.set(y * state.width + x, theme);
      }
    }

    drawInterior(state, tx, ty, theme) {
      const c = this.ctx, s = state.tileSize, x = tx * s, y = ty * s;
      c.fillStyle = theme.floor; c.fillRect(x, y, s, s);
      if (theme.material === 'plank') {
        c.strokeStyle = '#423b3340'; c.lineWidth = 1;
        for (let yy = 0; yy < s; yy += 8) { c.beginPath(); c.moveTo(x, y + yy + .5); c.lineTo(x + s, y + yy + .5); c.stroke(); }
        c.fillStyle = '#d9c39822'; c.fillRect(x + (ty % 2 ? 14 : 4), y + 1, 1, 31);
      } else if (theme.material === 'tile') {
        c.fillStyle = (tx + ty + theme.variant) % 2 ? '#f6f0da14' : '#14291f14'; c.fillRect(x + 1, y + 1, s - 2, s - 2);
        c.strokeStyle = '#dddec02c'; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, s - 1, s - 1);
      } else {
        c.fillStyle = '#dedaca12'; c.fillRect(x + 5, y + 7, 2, 1); c.fillRect(x + 21, y + 25, 3, 1);
        if (theme.material === 'metal') { c.fillStyle = '#d4cc8644'; c.fillRect(x + 1, y + s - 3, s - 2, 1); }
      }
    }

    drawTerrain(state) {
      const ctx = this.ctx, s = state.tileSize;
      const x0 = Math.max(0, Math.floor(this.left / s) - 2), y0 = Math.max(0, Math.floor(this.top / s) - 3);
      const x1 = Math.min(state.width - 1, Math.ceil(this.right / s) + 2), y1 = Math.min(state.height - 1, Math.ceil(this.bottom / s) + 2);
      this.visibleTrees = [];
      const upstairs = state.stories && Number(state.stories.floor) > 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const index = y * state.width + x;
        if (upstairs && !(state.buildings || []).some((building) => x >= building.x && y >= building.y && x < building.x + building.w && y < building.y + building.h)) {
          ctx.fillStyle = '#0c1c20'; ctx.fillRect(x * s, y * s, s, s); continue;
        }
        const gx = x + this.lastOriginX, gy = y + this.lastOriginY;
        const tile = state.tiles[index], variant = Math.floor(noise(gx, gy, state.seed) * 12);
        const xx = x * s, yy = y * s;
        if (tile === 0 || tile === 5) {
          ctx.drawImage(this.grassSprites[variant], xx, yy, s, s);
          const biome = this.biomeAt(state, x, y);
          if (biome === 'farm' && tile === 0) {
            ctx.fillStyle = '#826f443c'; ctx.fillRect(xx, yy, s, s);
            if ((gx % 13 + 13) % 13 > 2 && (gy % 17 + 17) % 17 > 2) {
              ctx.fillStyle = '#5a503946';
              for (let row = 5; row < s; row += 8) ctx.fillRect(xx, yy + row, s, 2);
              ctx.fillStyle = '#749258'; ctx.fillRect(xx + 5 + variant, yy + 5, 3, 2); ctx.fillRect(xx + 20 - variant, yy + 21, 3, 2);
            }
          } else if (biome === 'industrial') {
            ctx.fillStyle = '#756d4c26'; ctx.fillRect(xx, yy, s, s);
            if (variant % 4 === 0) { ctx.fillStyle = '#7c80634a'; ctx.fillRect(xx + 8, yy + 11, 3, 2); ctx.fillRect(xx + 23, yy + 23, 2, 2); }
          } else if (biome === 'forest') {
            ctx.fillStyle = '#17352921'; ctx.fillRect(xx, yy, s, s);
          }
          if (tile === 5) this.visibleTrees.push({ x: xx + s / 2, y: yy + s / 2, variant: variant % 8, index });
          else if (variant === 0) { ctx.fillStyle = '#77816b'; ctx.fillRect(xx + 23, yy + 8, 4, 2); ctx.fillStyle = '#485844'; ctx.fillRect(xx + 24, yy + 10, 4, 1); }
        } else if (tile === 1) this.drawRoad(state, x, y, variant);
        else if (tile === 4) {
          ctx.drawImage(this.waterSprites[variant], xx, yy, s, s);
          if (this.tile(state, x, y - 1) !== 4) { ctx.fillStyle = '#66745a'; ctx.fillRect(xx, yy, s, 3); }
          if (this.tile(state, x - 1, y) !== 4) { ctx.fillStyle = '#4b6855'; ctx.fillRect(xx, yy, 3, s); }
        } else {
          const theme = this.buildingTiles.get(index);
          if (theme) this.drawInterior(state, x, y, theme); else ctx.drawImage(this.floorSprites[variant], xx, yy, s, s);
          if (tile === 3) { this.drawWall(state, x, y); this.drawTerrainDamage(state, index, xx + s / 2, yy + s / 2); }
          else if (tile === 6 || tile === 7) this.drawDoor(state, x, y, tile === 7);
          else if (tile === 8 || tile === 9) this.drawWindow(state, x, y, tile === 9);
        }
      }
    }

    drawLivingDetails(state) {
      if (state.stories && state.stories.floor > 0) return;
      const c = this.ctx, t = this.clock, s = state.tileSize;
      // This scenery uses the presentation clock and a fixed hash, never simulation random draws.
      if (state.time >= 6 && state.time < 19) {
        const travel = (t * 38) % 900;
        for (let i = 0; i < 3; i++) {
          const x = this.left + travel - 60 + i * 21, y = this.top + 170 + Math.sin(t * .3) * 70 + i * 8;
          c.strokeStyle = '#152c28b0'; c.lineWidth = 2; c.beginPath(); const flap = Math.sin(t * 9 + i) * 4;
          c.moveTo(x - 5, y + flap); c.lineTo(x, y); c.lineTo(x + 5, y + flap); c.stroke();
        }
      }
      const minX = Math.max(0, Math.floor(this.left / s)), maxX = Math.min(state.width, Math.ceil(this.right / s)), minY = Math.max(0, Math.floor(this.top / s)), maxY = Math.min(state.height, Math.ceil(this.bottom / s));
      for (let ty = minY; ty < maxY; ty++) for (let tx = minX; tx < maxX; tx++) {
        const tile = this.tile(state, tx, ty), n = noise(tx + this.lastOriginX, ty + this.lastOriginY, state.seed);
        if (tile === 4 && n < .15) { c.strokeStyle = '#90b2a441'; c.lineWidth = 1; c.beginPath(); c.ellipse((tx + .5) * s, (ty + .5) * s, 4 + (t + n * 9) % 8, 2 + (t + n * 9) % 4, 0, 0, TAU); c.stroke(); }
        if (tile === 0 && n < .045) {
          const x = (tx + .5) * s, y = (ty + .5) * s;
          if (state.time >= 19 || state.time < 6) { c.fillStyle = '#dce790' + (Math.sin(t * 2 + n * 600) > .1 ? 'b0' : '25'); c.fillRect(x + Math.sin(t + n * 900) * 7, y + Math.cos(t * .7 + n * 800) * 5, 2, 2); }
          else { c.fillStyle = n < .02 ? '#bea776' : '#819d77'; c.fillRect(x + Math.sin(t * 1.1 + n * 400) * 8, y + Math.cos(t + n * 100) * 6, 2, 2); }
        }
      }
      for (const b of state.buildings || []) {
        const theme = this.themes.get(b), home = state.settlement && state.settlement.home;
        if (!theme || !['home', 'cabin'].includes(theme.type) || !home) continue;
        const hx = home.x - (state.world ? state.world.originX * s : 0), hy = home.y - (state.world ? state.world.originY * s : 0);
        if (hx < b.x * s || hx >= (b.x + b.w) * s || hy < b.y * s || hy >= (b.y + b.h) * s) continue;
        const x = (b.x + b.w - 1) * s - 14, y = b.y * s + 12;
        for (let i = 0; i < 4; i++) { const age = (t * .6 + i * .7) % 3; c.globalAlpha = (3 - age) * .085; ellipse(c, x + Math.sin(t + i) * age * 4, y - age * 18, 3 + age * 2, 2 + age, '#e3dfcc'); }
        c.globalAlpha = 1;
      }
    }

    drawRoad(state, tx, ty, variant) {
      const c = this.ctx, s = state.tileSize, x = tx * s, y = ty * s;
      c.fillStyle = variant % 3 ? COLORS.road : '#454d4a'; c.fillRect(x, y, s, s);
      c.fillStyle = '#515852'; c.fillRect(x + 4 + variant, y + 6, 2, 1); c.fillRect(x + 17, y + 21 - variant, 3, 1);
      const up = this.tile(state, tx, ty - 1) === 1, down = this.tile(state, tx, ty + 1) === 1;
      const left = this.tile(state, tx - 1, ty) === 1, right = this.tile(state, tx + 1, ty) === 1;
      c.fillStyle = '#7d7f6c';
      if (!up) c.fillRect(x, y + 1, s, 2);
      if (!down) c.fillRect(x, y + s - 3, s, 2);
      if (!left) c.fillRect(x + 1, y, 2, s);
      if (!right) c.fillRect(x + s - 3, y, 2, s);
      c.fillStyle = '#b9a76b';
      // The centre stripes form continuous lanes on the generated six-tile roads.
      if (up && down && (!left || this.tile(state, tx - 2, ty) !== 1) && (ty + this.lastOriginY) % 3 !== 0) c.fillRect(x + s - 3, y + 4, 2, s - 8);
      if (left && right && (!up || this.tile(state, tx, ty - 2) !== 1) && (tx + this.lastOriginX) % 3 !== 0) c.fillRect(x + 4, y + s - 3, s - 8, 2);
      if (variant === 8) {
        c.strokeStyle = '#323c38'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 11, y + 3); c.lineTo(x + 16, y + 12); c.lineTo(x + 13, y + 19); c.lineTo(x + 20, y + 30); c.stroke();
      }
    }

    drawWall(state, tx, ty) {
      const c = this.ctx, s = state.tileSize, x = tx * s, y = ty * s, theme = this.buildingTiles.get(ty * state.width + tx) || { wall: '#9a9e83', trim: COLORS.wall, material: 'brick', accent: '#697562' };
      c.fillStyle = '#253229'; c.fillRect(x + 3, y + 5, s - 1, s);
      c.fillStyle = theme.wall; c.fillRect(x + 2, y + 1, s - 4, s - 2);
      c.fillStyle = theme.trim; c.fillRect(x + 2, y + 1, s - 4, 5);
      c.fillStyle = theme.accent; c.fillRect(x + 2, y + s - 6, s - 4, 4);
      c.strokeStyle = '#243a3045'; c.lineWidth = 1;
      if (theme.material === 'plank' || theme.material === 'metal') {
        for (let i = 7; i < s - 4; i += theme.material === 'metal' ? 4 : 7) { c.beginPath(); c.moveTo(x + i, y + 7); c.lineTo(x + i, y + s - 7); c.stroke(); }
      } else if (theme.material === 'brick') {
        for (let i = 10; i < s - 5; i += 7) { c.beginPath(); c.moveTo(x + 3, y + i); c.lineTo(x + s - 3, y + i); c.moveTo(x + (i % 2 ? 11 : 21), y + i); c.lineTo(x + (i % 2 ? 11 : 21), y + i + 6); c.stroke(); }
      } else { c.fillStyle = '#edf0d21a'; c.fillRect(x + 4, y + 8, s - 8, 8); }
      if (this.tile(state, tx - 1, ty) !== 3) { c.fillStyle = theme.trim; c.fillRect(x + 2, y + 2, 3, s - 8); }
    }

    drawDoor(state, tx, ty, open) {
      const c = this.ctx, s = state.tileSize, x = tx * s, y = ty * s;
      const vertical = this.tile(state, tx, ty - 1) === 3 || this.tile(state, tx, ty + 1) === 3;
      c.save(); c.translate(x + s / 2, y + s / 2);
      if (vertical) c.rotate(Math.PI / 2);
      c.fillStyle = '#454a37'; c.fillRect(-16, -7, 32, 14);
      c.fillStyle = '#c0b69a'; c.fillRect(-16, -6, 3, 12); c.fillRect(13, -6, 3, 12);
      if (open) { c.translate(-13, -4); c.rotate(-1.15); }
      c.fillStyle = '#78644a'; c.fillRect(open ? 0 : -13, -4, 26, 8);
      c.fillStyle = '#a38a5d'; c.fillRect(open ? 0 : -13, -4, 26, 2);
      c.fillStyle = '#cfbe82'; c.fillRect(open ? 22 : 9, -1, 2, 2);
      c.restore();
    }

    drawWindow(state, tx, ty, open) {
      const c = this.ctx, s = state.tileSize, x = tx * s, y = ty * s;
      const edge = tile => tile === 3 || tile >= 6 && tile <= 9;
      const vertical = edge(this.tile(state, tx, ty - 1)) || edge(this.tile(state, tx, ty + 1));
      const health = state._terrainHealth && state._terrainHealth[ty * state.width + tx];
      c.save(); c.translate(x + s / 2, y + s / 2);
      if (vertical) c.rotate(Math.PI / 2);
      c.fillStyle = '#293f3a'; c.fillRect(-s / 2, -7, s, 14);
      c.fillStyle = '#b2b79a'; c.fillRect(-s / 2, -7, 4, 14); c.fillRect(s / 2 - 4, -7, 4, 14);
      c.fillStyle = '#d2c7a1'; c.fillRect(-s / 2, -8, s, 2);
      c.fillStyle = '#777f68'; c.fillRect(-s / 2, 6, s, 3);
      if (!open) {
        c.fillStyle = '#436d74'; c.fillRect(-s / 2 + 4, -5, s - 8, 10);
        c.fillStyle = '#9dc1b5'; c.fillRect(-s / 2 + 5, -5, s - 10, 2);
        c.strokeStyle = '#b1d0c480'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-10, 4); c.lineTo(-4, -3); c.moveTo(2, 4); c.lineTo(8, -3); c.stroke();
        c.fillStyle = '#c5bc9b'; c.fillRect(-1, -6, 2, 12);
      } else if (health === 0) {
        // Jagged remnants distinguish smashed glass from a raised, intact window.
        c.fillStyle = '#9dc7be'; c.beginPath();
        c.moveTo(-12, -5); c.lineTo(-8, 1); c.lineTo(-7, -5);
        c.moveTo(7, -5); c.lineTo(11, -1); c.lineTo(12, -5);
        c.moveTo(-8, 5); c.lineTo(-3, 2); c.lineTo(-2, 5);
        c.closePath(); c.fill();
        c.fillStyle = '#a5c8bb'; c.fillRect(-7, 11, 2, 2); c.fillRect(5, 12, 3, 1);
      } else {
        c.fillStyle = '#668d82'; c.fillRect(-11, -10, 22, 2);
        c.fillStyle = '#b8c5a3'; c.fillRect(-11, -12, 22, 2);
      }
      c.restore();
      if (health > 0 && health < 45) this.drawTerrainDamage(state, ty * state.width + tx, x + s / 2, y + s / 2);
    }

    drawTerrainDamage(state, index, x, y) {
      const health = state._terrainHealth && state._terrainHealth[index];
      if (!(health > 0)) return;
      const c = this.ctx;
      c.strokeStyle = '#3f3429'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x - 7, y - 8); c.lineTo(x - 2, y - 1);
      c.lineTo(x - 6, y + 5); c.lineTo(x + 1, y + 9);
      c.moveTo(x - 2, y - 1); c.lineTo(x + 7, y - 4); c.stroke();
      if (Math.hypot(x - state.player.x, y - state.player.y) < 105) {
        c.fillStyle = '#182c2bd9'; c.fillRect(x - 18, y - 29, 36, 11);
        c.font = '600 8px ui-monospace, SFMono-Regular, Menlo, monospace';
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#edc18a';
        c.fillText(Math.ceil(health) + ' HP', x, y - 23);
      }
    }

    drawSettlement(state) {
      const B = Sirens.Settlement;
      if (!B || state.stories && state.stories.floor > 0) return;
      const c = this.ctx, b = B.ensure(state), ox = state.world ? state.world.originX * 32 : 0, oy = state.world ? state.world.originY * 32 : 0;
      const deposits = B.nodes(state, { minX: Math.max(0, Math.floor(this.left / 32)), minY: Math.max(0, Math.floor(this.top / 32)), maxX: Math.min(state.width, Math.ceil(this.right / 32)), maxY: Math.min(state.height, Math.ceil(this.bottom / 32)) });
      for (const node of deposits) {
        const x = node.x, y = node.y;
        ellipse(c, x + 2, y + 7, 14, 7, '#14291d80');
        c.fillStyle = '#53685b'; c.beginPath(); c.moveTo(x - 13, y + 4); c.lineTo(x - 9, y - 8); c.lineTo(x + 1, y - 14); c.lineTo(x + 11, y - 6); c.lineTo(x + 14, y + 5); c.lineTo(x + 4, y + 10); c.closePath(); c.fill();
        c.strokeStyle = '#9ca795'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 8, y - 7); c.lineTo(x + 1, y - 11); c.lineTo(x + 9, y - 5); c.stroke();
        c.fillStyle = node.type === 'iron' ? '#a8b3b5' : node.type === 'copper' ? '#cd9869' : '#85977e';
        c.fillRect(x - 4, y - 5, 5, 4); c.fillRect(x + 3, y + 1, 5, 4); c.fillRect(x - 7, y + 3, 3, 3);
        if (Math.hypot(x - state.player.x, y - state.player.y) < 100) {
          c.fillStyle = '#172a20ed'; c.fillRect(x - 42, y - 33, 84, 15); c.fillStyle = '#ded3ae'; c.font = '600 8px ui-monospace, monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(node.type.toUpperCase() + ' · ' + Math.ceil(node.health) + ' HP', x, y - 25);
        }
      }
      for (const plot of b.plots) {
        const x = plot.x - ox, y = plot.y - oy;
        if (!this.inView(x, y, 40)) continue;
        c.fillStyle = plot.moisture > 0 ? '#534b33' : '#6a5a3c'; roundRect(c, x - 14, y - 14, 28, 28, 3); c.fill();
        c.strokeStyle = '#938459'; c.lineWidth = 1; for (const yy of [-8, 0, 8]) { c.beginPath(); c.moveTo(x - 11, y + yy); c.lineTo(x + 11, y + yy); c.stroke(); }
        const mature = plot.progress >= 90, size = Math.max(3, Math.min(8, 3 + plot.progress / 18));
        for (const xx of [-6, 6]) for (const yy of [-6, 6]) { if (mature) { c.fillStyle = '#d39750'; c.fillRect(x + xx - 2, y + yy, 4, 5); } c.strokeStyle = mature ? '#a6bd73' : '#8aaa68'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + xx, y + yy + 1); c.lineTo(x + xx - size / 2, y + yy - size); c.moveTo(x + xx, y + yy + 1); c.lineTo(x + xx + size / 2, y + yy - size + 1); c.stroke(); }
        c.fillStyle = '#17271f'; c.fillRect(x - 12, y + 17, 24, 3); c.fillStyle = mature ? '#edc888' : '#a0bb78'; c.fillRect(x - 12, y + 17, 24 * Math.min(1, plot.progress / 90), 3);
      }
      if (b.home) {
        const x = b.home.x - ox, y = b.home.y - oy;
        if (this.inView(x, y, 40)) { c.strokeStyle = '#d5c486'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x, y - 23); c.stroke(); c.fillStyle = '#c9c180'; c.beginPath(); c.moveTo(x, y - 23); c.lineTo(x + 15, y - 18); c.lineTo(x, y - 12); c.closePath(); c.fill(); }
      }
    }

    drawBuildingDetails(state) {
      const c = this.ctx, s = state.tileSize;
      const box = (x, y, w, h, color) => { c.fillStyle = '#15271c55'; c.fillRect(x + 2, y + 3, w, h); c.fillStyle = color; c.fillRect(x, y, w, h); c.fillStyle = '#f1e5b532'; c.fillRect(x + 1, y + 1, w - 2, 2); };
      const shelf = (x, y, w, color, seed) => { box(x, y, w, 14, color); for (let i = 4; i < w - 4; i += 8) { c.fillStyle = ['#c6a66e', '#7a9982', '#a77e6f', '#a9b4a0'][(i + seed) % 4]; c.fillRect(x + i, y + 4, 5, 7); } };
      for (const b of state.buildings || []) {
        const x = b.x * s, y = b.y * s, w = b.w * s, h = b.h * s, t = this.themes.get(b);
        if (!this.inView(x + w / 2, y + h / 2, Math.max(w, h)) || !t) continue;
        const left = x + s + 5, right = x + w - s - 5, top = y + s + 5, bottom = y + h - s - 5;
        c.save();
        // Furnishings are original visual details, kept against walls to leave clear routes.
        if (t.type === 'home' || t.type === 'cabin') {
          const bedX = t.variant % 2 ? right - 30 : left;
          box(bedX, top, 28, 47, '#535f52'); box(bedX + 2, top + 3, 24, 10, '#d8c7a5'); box(bedX + 2, top + 18, 24, 27, t.accent);
          shelf(t.variant % 2 ? left : right - 64, top, 60, '#9a8769', t.variant);
          box(right - 62, bottom - 36, 52, 24, t.accent); box(right - 60, bottom - 38, 48, 6, '#b5aa80');
          c.fillStyle = '#b48b6450'; c.fillRect(x + w / 2 - 35, y + h / 2 + 15, 70, 35); c.strokeStyle = '#dcc09d55'; c.strokeRect(x + w / 2 - 32, y + h / 2 + 18, 64, 29);
          if (t.type === 'home') { box(left, bottom - 22, 32, 18, '#b8bba5'); c.fillStyle = '#547d7c'; c.fillRect(left + 5, bottom - 17, 12, 8); }
        } else if (t.type === 'medical') {
          for (let i = 0; i < 2; i++) { box(left + i * 44, top + 25, 27, 49, '#bcc8bc'); c.fillStyle = '#d5dbce'; c.fillRect(left + 3 + i * 44, top + 28, 21, 11); c.fillStyle = '#6c978e'; c.fillRect(left + 3 + i * 44, top + 45, 21, 25); }
          shelf(right - 74, top, 70, '#afbeb4', 2); box(right - 38, bottom - 25, 34, 18, '#a6b8b1');
          c.fillStyle = '#efe1b5'; c.fillRect(x + w / 2 - 3, y + 7, 6, 16); c.fillRect(x + w / 2 - 8, y + 12, 16, 6);
        } else if (t.type === 'shop') {
          shelf(left, top, Math.min(110, right - left), '#8d8767', 3); shelf(right - 68, top + 45, 64, '#a89771', 1);
          shelf(left, bottom - 19, Math.min(85, right - left), '#a99574', 0); box(right - 42, bottom - 32, 36, 23, '#897e65'); box(right - 38, bottom - 29, 13, 10, '#424e48');
          c.fillStyle = t.accent; for (let i = 0; i < w - 12; i += 18) c.fillRect(x + 6 + i, y + h - 7, Math.min(9, w - 12 - i), 7);
        } else if (t.type === 'warehouse' || t.type === 'barn') {
          for (let yy = top; yy < bottom - 28; yy += 43) { shelf(left, yy, 66, '#9b896b', 2); box(right - 48, yy + 5, 40, 25, '#9a825d'); c.strokeStyle = '#d2b988'; c.strokeRect(right - 45, yy + 8, 34, 19); }
          c.strokeStyle = '#d0bd7550'; c.setLineDash([7, 4]); c.strokeRect(x + w / 2 - 32, top + 20, 64, h - s * 2 - 45); c.setLineDash([]);
          if (t.type === 'barn') { c.fillStyle = '#dac787'; for (let i = 0; i < 5; i++) c.fillRect(right - 44 + i * 7, bottom - 12, 4, 8); }
        } else if (t.type === 'workshop') {
          shelf(left, top, Math.min(120, right - left), '#818b7b', 3); box(right - 40, top + 34, 35, 32, '#889892'); c.fillStyle = '#263e39'; c.fillRect(right - 31, top + 42, 19, 14);
          box(left, bottom - 26, 70, 20, '#917f5c'); c.fillStyle = '#b6bba4'; c.fillRect(left + 10, bottom - 21, 20, 4); c.fillRect(left + 32, bottom - 18, 4, 10);
        } else if (t.type === 'fuel') {
          shelf(left, top, 80, '#a69875', 0); box(right - 43, top + 35, 35, 40, '#98a8a4'); c.fillStyle = '#527571'; c.fillRect(right - 40, top + 40, 29, 30);
          box(right - 70, bottom - 28, 64, 20, '#a29a7b'); box(right - 65, bottom - 25, 15, 11, '#3c524d');
        } else {
          shelf(left, top, Math.min(100, right - left), '#8d917b', 1); box(right - 55, top + 30, 48, 30, '#a29170'); box(right - 48, top + 34, 18, 12, '#486e73'); box(left, bottom - 30, 38, 23, '#657b7a');
        }
        // Small fixtures and weathering make each facade distinct without hiding its interior.
        const ventX = x + w - 24; box(ventX, y + 8, 16, 14, '#7c8b7e'); c.strokeStyle = '#3d514a'; for (let i = 3; i < 13; i += 3) { c.beginPath(); c.moveTo(ventX + 3, y + 8 + i); c.lineTo(ventX + 13, y + 8 + i); c.stroke(); }
        if (t.variant === 0 || t.type === 'cabin') { c.fillStyle = '#344f37'; c.fillRect(x + 5, y + h - 25, 14, 14); c.fillStyle = '#8eac6e'; c.fillRect(x + 7, y + h - 24, 10, 8); }
        c.restore();
      }
    }

    drawStairs(state) {
      const c = this.ctx, s = state.tileSize;
      for (const building of state.buildings || []) {
        if (!building.stairs) continue;
        const x = building.stairs.x * s, y = building.stairs.y * s;
        if (!this.inView(x, y, 35) || !this.known(state, x + s / 2, y + s / 2)) continue;
        c.fillStyle = '#34463e'; c.fillRect(x + 3, y + 3, s - 6, s - 6);
        for (let step = 0; step < 5; step++) {
          c.fillStyle = step % 2 ? '#aaad8d' : '#c2bd96'; c.fillRect(x + 5, y + 5 + step * 4, s - 10, 3);
        }
        c.fillStyle = '#dfcc89'; c.beginPath(); c.moveTo(x + s / 2, y + 1); c.lineTo(x + s / 2 + 4, y + 6); c.lineTo(x + s / 2 - 4, y + 6); c.closePath(); c.fill();
        c.strokeStyle = '#d5cd9b66'; c.lineWidth = 1; c.strokeRect(x + 2.5, y + 2.5, s - 5, s - 5);
      }
    }

    drawRoofs(state) {
      const c = this.ctx, s = state.tileSize;
      for (const b of state.buildings || []) {
        const x = b.x * s, y = b.y * s, w = b.w * s, h = b.h * s;
        if (x > this.right + 60 || x + w < this.left - 60 || y > this.bottom + 60 || y + h < this.top - 60) continue;
        // Always cut away roofs so nearby interiors and actors remain visible.
        c.save();
        // Small hand-painted sign labels help make the town navigable.
        if (w > 100 && b.name) {
          const label = String(b.name).toUpperCase();
          c.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
          c.textAlign = 'center'; c.textBaseline = 'middle';
          const signWidth = Math.min(w - 14, c.measureText(label).width + 16);
          c.fillStyle = this.themes.get(b).accent; c.fillRect(x + w / 2 - signWidth / 2, y + h - 19, signWidth, 17);
          c.fillStyle = '#f2ebcd'; c.fillText(label, x + w / 2, y + h - 10, signWidth - 8);
        }
        c.restore();
      }
    }

    drawTree(tree, state) {
      const c = this.ctx, p = state.player;
      const dx = tree.x - p.x, dy = tree.y - p.y;
      // Nearby canopy fades so characters never disappear underneath it.
      if (dx * dx + dy * dy < 55 * 55) c.globalAlpha = .46;
      c.drawImage(this.treeSprites[tree.variant], Math.floor(tree.x) - 40, Math.floor(tree.y) - 73);
      c.globalAlpha = 1;
      this.drawTerrainDamage(state, tree.index, tree.x, tree.y);
    }

    drawContainer(container, state) {
      const c = this.ctx, x = Math.floor(container.x), y = Math.floor(container.y);
      const clinic = /med|aid|clinic|pharmacy/i.test(String(container.label || ''));
      ellipse(c, x + 2, y + 7, 12, 5, '#18291f65');
      c.fillStyle = clinic ? '#7e9684' : '#796446'; c.fillRect(x - 11, y - 9, 22, 17);
      c.fillStyle = clinic ? '#bec3a4' : '#a8905e'; c.fillRect(x - 11, y - 11, 22, 8);
      c.fillStyle = clinic ? '#a1b09c' : '#bfaa77'; c.fillRect(x - 11, y - 11, 22, 2);
      c.strokeStyle = clinic ? '#546d60' : '#514d36'; c.lineWidth = 2;
      c.strokeRect(x - 10, y - 10, 20, 17);
      if (clinic) { c.fillStyle = '#d5e0b6'; c.fillRect(x - 1, y - 7, 3, 8); c.fillRect(x - 4, y - 4, 9, 3); }
      else { c.beginPath(); c.moveTo(x - 8, y - 2); c.lineTo(x + 8, y + 5); c.moveTo(x + 8, y - 2); c.lineTo(x - 8, y + 5); c.stroke(); }
      if (!container.looted && Object.values(container.items || {}).some(count => count > 0)) {
        const bob = Math.round(Math.sin(this.clock * 2.5 + (Number(container.id) || 0)) * 2);
        c.fillStyle = '#172d2b'; c.fillRect(x - 4, y - 25 + bob, 8, 8);
        c.fillStyle = COLORS.gold; c.fillRect(x - 2, y - 23 + bob, 4, 4);
      }
    }

    drawStructure(structure) {
      const c = this.ctx, x = Math.floor(structure.x), y = Math.floor(structure.y);
      if (structure.type === 'campfire') {
        ellipse(c, x, y + 3, 14, 9, '#1c2724');
        for (let i = 0; i < 8; i++) {
          const a = i * TAU / 8; c.fillStyle = i % 2 ? '#8c8c73' : '#617163';
          c.fillRect(Math.floor(x + Math.cos(a) * 11 - 3), Math.floor(y + Math.sin(a) * 7 - 2), 6, 5);
        }
        c.strokeStyle = '#9b7050'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 7, y + 5); c.lineTo(x + 7, y - 4); c.moveTo(x - 7, y - 4); c.lineTo(x + 7, y + 5); c.stroke();
        const flicker = Math.sin(this.clock * 13) * 2;
        c.fillStyle = '#dc873e'; c.beginPath(); c.moveTo(x - 7, y + 3); c.lineTo(x - 4, y - 8); c.lineTo(x, y - 16 - flicker); c.lineTo(x + 7, y + 2); c.closePath(); c.fill();
        c.fillStyle = '#f7d47b'; c.beginPath(); c.moveTo(x - 3, y + 3); c.lineTo(x, y - 9 - flicker); c.lineTo(x + 4, y + 3); c.closePath(); c.fill();
      } else {
        c.fillStyle = '#17271f70'; c.fillRect(x - 18, y + 8, 40, 5);
        c.fillStyle = '#756e4d'; c.fillRect(x - 15, y - 14, 5, 27); c.fillRect(x + 11, y - 14, 5, 27);
        c.save(); c.translate(x, y); c.rotate(-.09);
        c.fillStyle = '#b19a67'; c.fillRect(-19, -10, 38, 7); c.fillRect(-19, 3, 38, 7);
        c.fillStyle = '#d0b785'; c.fillRect(-19, -10, 38, 1); c.fillRect(-19, 3, 38, 1);
        c.fillStyle = '#615b42'; c.fillRect(-11, -7, 2, 2); c.fillRect(12, 6, 2, 2); c.restore();
      }
    }

    drawSignals(state) {
      const c = this.ctx, goal = state.goal;
      if (!goal || !this.inView(goal.radioX, goal.radioY, 80) || !this.known(state, goal.radioX, goal.radioY)) return;
      const x = goal.radioX, y = goal.radioY;
      c.strokeStyle = goal.complete ? '#97c29370' : '#d8c37b44'; c.lineWidth = 1;
      c.beginPath(); c.ellipse(x, y + 6, 38, 23, 0, 0, TAU); c.stroke();
      c.fillStyle = '#263a37'; c.fillRect(x - 23, y - 13, 46, 30);
      c.fillStyle = '#697562'; c.fillRect(x - 23, y - 16, 46, 26);
      c.fillStyle = '#b0b18b'; c.fillRect(x - 23, y - 16, 46, 3);
      c.fillStyle = '#263d3a'; c.fillRect(x - 16, y - 9, 17, 11);
      c.fillStyle = '#7caa81'; c.fillRect(x - 14, y - 7, 13, 3);
      c.fillStyle = '#d3c78d'; c.fillRect(x + 6, y - 7, 5, 5); c.fillRect(x + 14, y - 7, 5, 5);
      const parts = Math.min(goal.required || 5, goal.parts || 0);
      for (let i = 0; i < (goal.required || 5); i++) {
        c.fillStyle = i < parts ? '#b7cf8b' : '#384e42'; c.fillRect(x - 16 + i * 7, y + 5, 5, 3);
      }
      c.strokeStyle = '#91a395'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 16, y + 8); c.lineTo(x + 16, y - 58); c.stroke();
      c.strokeStyle = '#c7c9a8'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 2, y - 47); c.lineTo(x + 30, y - 47); c.moveTo(x + 7, y - 55); c.lineTo(x + 25, y - 55); c.stroke();
      c.fillStyle = goal.complete ? '#c9e8a6' : '#e6a17a'; c.fillRect(x + 14, y - 61, 4, 4);
      if (goal.complete) {
        const r = 25 + (this.clock * 20) % 42;
        c.globalAlpha = 1 - (r - 25) / 42; c.strokeStyle = '#d4de9b'; c.lineWidth = 1;
        c.beginPath(); c.arc(x + 16, y - 59, r, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.globalAlpha = 1;
      }
    }

    drawPlayer(player, state, partner) {
      const c = this.ctx, x = Math.floor(player.x), y = Math.floor(player.y), angle = player.angle || 0;
      const pose = !partner && Sirens.Effects ? Sirens.Effects.pose(state) : { stride: 0, attack: null };
      const attack = pose.attack;
      const id = attack ? attack.weapon : player.weapon;
      const items = Sirens.Engine && Sirens.Engine.items || {};
      const weapon = items[id] && items[id].weapon;
      const firearm = weapon ? weapon.kind === 'firearm' : id === 'pistol';
      const equipment = player.equipment || {};
      const clothing = items[equipment.clothing], backpack = items[equipment.backpack];
      const appearance = partner && partner.look || (Sirens.Personal ? Sirens.Personal.look(state) : { skin: '#ddbc88', hair: '#382e26', coat: '#a99b69', hat: 'none' });
      const vehicle = (state.vehicles || []).find((car) => car.id === player.vehicleId);
      if (vehicle) {
        c.strokeStyle = '#e4d08d99'; c.lineWidth = 1; c.beginPath(); c.ellipse(vehicle.x, vehicle.y, 29, 19, vehicle.angle || 0, 0, TAU); c.stroke();
        return;
      }
      const phase = attack ? attack.progress : 0;
      const stroke = Math.sin(phase * Math.PI), stride = Math.sin(pose.stride) * 3;
      const relativeAim = attack ? attack.angle - angle : 0;
      const sweep = attack && !firearm ? -1.5 + phase * 3 : -.65;
      const thrust = /spear|knife|dagger/.test(id);
      const recoil = attack && firearm ? Math.max(0, 1 - phase * 3) * 5 : 0;
      ellipse(c, x + 1, y + 6, 12, 6, '#091d2490');
      c.save(); c.translate(x, y); c.rotate(angle);
      c.strokeStyle = '#d9d39b40'; c.lineWidth = 1; c.setLineDash([3, 6]);
      c.beginPath(); c.moveTo(19, 0); c.lineTo(firearm ? 100 : 43, 0); c.stroke(); c.setLineDash([]);
      if (attack && !firearm && !thrust) {
        c.save(); c.rotate(relativeAim); c.strokeStyle = '#f3e6b0'; c.globalAlpha = stroke * .45; c.lineWidth = 4;
        c.beginPath(); c.arc(10, 2, Math.min(54, (weapon && weapon.range || 70) * .55), sweep - .65, sweep); c.stroke(); c.restore();
      }
      c.fillStyle = '#1b343a'; c.fillRect(-6 + stride, -9, 9, 6); c.fillRect(-6 - stride, 4, 9, 6);
      c.fillStyle = appearance.coat; c.fillRect(-8, -8, 13, 16);
      c.fillStyle = clothing && clothing.color || '#d5bd75'; c.fillRect(-8, -8, 13, 3); c.fillRect(-5, -3, 13, 6);
      c.fillStyle = backpack && backpack.color || '#6c6e47'; c.fillRect(-10, -5, backpack ? 8 : 5, 10);
      c.fillStyle = appearance.skin; c.fillRect(5 - recoil, -7, 9, 4);
      c.save(); c.translate(10 - recoil + (thrust ? stroke * 12 : 0), 3); c.rotate(relativeAim + (firearm || thrust ? 0 : sweep));
      c.fillStyle = appearance.skin; c.fillRect(-4, -2, 11, 4);
      if (firearm) {
        const length = weapon && weapon.range > 300 ? 21 : 11;
        c.fillStyle = '#142b32'; c.fillRect(3, -4, length, 4); c.fillRect(5, -2, 4, 6);
        c.fillStyle = '#a4b0a2'; c.fillRect(7, -5, Math.max(6, length - 5), 1);
        if (attack && phase < .32) {
          c.fillStyle = '#ffe19b'; c.beginPath(); c.moveTo(length + 3, -2); c.lineTo(length + 15, -7); c.lineTo(length + 10, -2); c.lineTo(length + 15, 3); c.closePath(); c.fill();
        }
      } else {
        const length = weapon && weapon.range > 100 ? 37 : weapon && weapon.range < 55 ? 16 : 27;
        c.fillStyle = '#766e4c'; c.fillRect(2, -1, length, 4);
        if (/axe|hatchet/.test(id)) { c.fillStyle = '#d1d9bf'; c.fillRect(length - 5, -8, 9, 14); c.fillStyle = '#eef1d3'; c.fillRect(length + 2, -7, 2, 12); }
        else if (/pick/.test(id)) { c.strokeStyle = id === 'iron_pick' ? '#c4d1c4' : '#93a58e'; c.lineWidth = 4; c.beginPath(); c.moveTo(length - 2, -10); c.quadraticCurveTo(length + 7, -3, length - 2, 10); c.stroke(); }
        else if (/hammer/.test(id)) { c.fillStyle = '#a9b5ae'; c.fillRect(length - 4, -7, 10, 13); }
        else if (/machete|katana|knife|dagger/.test(id)) { c.fillStyle = '#d5dec4'; c.fillRect(9, -3, length - 6, 6); c.fillStyle = '#f3f2d3'; c.fillRect(10, -3, length - 8, 1); }
        else if (thrust) { c.fillStyle = '#d5dec4'; c.beginPath(); c.moveTo(length + 8, 1); c.lineTo(length - 2, -3); c.lineTo(length - 2, 5); c.closePath(); c.fill(); }
        else { c.fillStyle = '#d6c28c'; c.fillRect(10, -2, length - 5, 6); c.fillStyle = '#e9d7a3'; c.fillRect(11, -2, length - 7, 1); }
      }
      c.restore();
      c.fillStyle = appearance.hair; c.fillRect(-6, -6, 12, 12);
      c.fillStyle = appearance.skin; c.fillRect(0, -4, 8, 8); c.fillRect(6, -3, 3, 6);
      c.fillStyle = appearance.hair; c.fillRect(-5, -6, 8, 5); c.fillRect(-6, -2, 3, 6);
      if (appearance.hat === 'cap') { c.fillStyle = appearance.hatColor; c.fillRect(-7, -7, 11, 14); c.fillRect(4, -5, 6, 10); c.fillStyle = '#d3d69f66'; c.fillRect(-6, -6, 8, 2); }
      else if (appearance.hat === 'beanie') { c.fillStyle = appearance.hatColor; c.fillRect(-7, -7, 12, 14); c.fillStyle = '#e7d8a988'; c.fillRect(2, -7, 3, 14); c.fillRect(-8, -2, 2, 4); }
      c.restore();
      if (player.bleeding > 0) { c.fillStyle = '#b96753'; c.fillRect(x - 2, y + 14, 3, 2); }
      c.strokeStyle = '#e4d08d'; c.lineWidth = 1; c.beginPath();
      c.arc(x, y, 17, angle + .7, angle + 2.4); c.arc(x, y, 17, angle + 3.85, angle + 5.55); c.stroke();
    }

    drawVehicle(vehicle, state) {
      const c = this.ctx, x = Math.floor(vehicle.x), y = Math.floor(vehicle.y), angle = Number(vehicle.angle) || 0;
      const long = /van|truck/i.test(vehicle.type || '') ? 5 : 0;
      c.save(); c.translate(x, y); c.rotate(angle);
      c.fillStyle = '#0a1d2178'; roundRect(c, -24 - long / 2, -9, 50 + long, 24, 5); c.fill();
      c.fillStyle = '#142a2e'; c.fillRect(-16, -14, 9, 6); c.fillRect(9, -14, 9, 6); c.fillRect(-16, 8, 9, 6); c.fillRect(9, 8, 9, 6);
      c.fillStyle = '#67766b'; c.fillRect(-14, -13, 5, 2); c.fillRect(11, -13, 5, 2); c.fillRect(-14, 11, 5, 2); c.fillRect(11, 11, 5, 2);
      c.fillStyle = vehicle.color || '#648275'; roundRect(c, -22 - long / 2, -11, 44 + long, 22, 4); c.fill();
      c.fillStyle = '#b9c4a234'; c.fillRect(-17 - long / 2, -10, 32 + long, 2);
      c.fillStyle = '#1d363b'; c.fillRect(-14, -8, 9, 16); c.fillRect(5, -8, 8, 16);
      c.fillStyle = '#72959a'; c.fillRect(6, -7, 6, 5); c.fillRect(-13, -7, 7, 4);
      c.fillStyle = vehicle.color || '#648275'; c.fillRect(-4, -9, 8, 18);
      c.fillStyle = '#d4cc8c'; c.fillRect(20 + long / 2, -8, 3, 4); c.fillRect(20 + long / 2, 4, 3, 4);
      c.fillStyle = '#b36c52'; c.fillRect(-23 - long / 2, -8, 2, 4); c.fillRect(-23 - long / 2, 4, 2, 4);
      c.fillStyle = '#c5bca155'; c.fillRect(16 + long / 2, -9, 2, 18);
      if (vehicle.id === state.player.vehicleId) { c.fillStyle = '#d9c185'; c.fillRect(5, -5, 4, 4); }
      if (vehicle.condition < 40) {
        c.strokeStyle = '#35372f'; c.lineWidth = 1; c.beginPath(); c.moveTo(12, -6); c.lineTo(18, 0); c.lineTo(13, 6); c.stroke();
      }
      c.restore();
      if (!state.player.vehicleId && Math.hypot(x - state.player.x, y - state.player.y) < 70) {
        c.save(); c.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace'; c.textAlign = 'center'; c.fillStyle = '#ddcf99';
        c.fillText('V  ' + String(vehicle.name || vehicle.type || 'Vehicle'), x, y - 24, 130); c.restore();
      }
    }

    drawPartner(peer, state) {
      const p = peer.player; this.drawPlayer(p, state, peer);
      const c = this.ctx; c.save(); c.font = 'bold 10px monospace'; c.textAlign = 'center';
      c.fillStyle = '#9ce5dc'; c.fillText(String(peer.name || 'Survivor').slice(0, 24), p.x, p.y - 30, 140);
      c.fillStyle = '#152d26'; c.fillRect(p.x - 16, p.y - 25, 32, 3); c.fillStyle = '#a9d794'; c.fillRect(p.x - 16, p.y - 25, 32 * Math.max(0, Math.min(1, p.health / 100)), 3); c.restore();
    }

    drawHuman(human, state) {
      const c = this.ctx, x = Math.floor(human.x), y = Math.floor(human.y), angle = Number(human.angle) || 0;
      const hostile = /raider|hostile/i.test(human.faction || '');
      ellipse(c, x + 1, y + 7, 11, 5, '#13212785');
      c.save(); c.translate(x, y); c.rotate(angle);
      c.fillStyle = '#2c3938'; c.fillRect(-7, -8, 10, 4); c.fillRect(-7, 5, 10, 4);
      c.fillStyle = hostile ? '#956754' : '#648d91'; c.fillRect(-8, -7, 14, 15);
      c.fillStyle = hostile ? '#c39872' : '#a6bbb0'; c.fillRect(-8, -7, 13, 3);
      c.fillStyle = '#d4b18b'; c.fillRect(3, -8, 10, 4); c.fillRect(4, 5, 9, 4);
      c.fillStyle = '#58462e'; c.fillRect(-6, -5, 11, 11);
      c.fillStyle = '#c4a27b'; c.fillRect(1, -4, 7, 8); c.fillStyle = '#dcc598'; c.fillRect(6, -2, 3, 5);
      if (hostile || human.weapon && human.weapon !== 'none') {
        const held = Sirens.Engine && Sirens.Engine.items && Sirens.Engine.items[human.weapon];
        if (held && held.weapon && held.weapon.kind === 'melee') {
          c.fillStyle = '#c6b67e'; c.fillRect(10, 0, 17, 4); c.fillStyle = '#e1cf9c'; c.fillRect(18, 0, 9, 1);
        } else {
          c.fillStyle = '#25373a'; c.fillRect(10, -4, 12, 3); c.fillRect(11, -2, 3, 6);
        }
      }
      c.restore();
      const distance = Math.hypot(human.x - state.player.x, human.y - state.player.y);
      c.fillStyle = hostile ? '#e3a07e' : human.following ? '#b4d595' : '#aad0c9';
      c.beginPath(); c.moveTo(x, y - 24); c.lineTo(x + 3, y - 20); c.lineTo(x, y - 16); c.lineTo(x - 3, y - 20); c.closePath(); c.fill();
      if (distance < 160) {
        c.save(); c.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace'; c.textAlign = 'center';
        c.fillStyle = hostile ? '#f2b797' : '#cadfc2';
        c.fillText(String(human.name || (hostile ? 'Raider' : 'Survivor')) + (human.following ? ' · ' + ((state.settlement && state.settlement.jobs[human.id] && state.settlement.jobs[human.id].role) || 'following') : ''), x, y - 30, 125);
        if (Sirens.Actors && Sirens.Actors.activity) { c.font = '8px monospace'; c.fillStyle = '#e1d2a5'; c.fillText(Sirens.Actors.activity(state, human), x, y - 40, 145); } c.restore();
      }
      if (human.health < 80) {
        c.fillStyle = '#16302a'; c.fillRect(x - 9, y + 15, 18, 3);
        c.fillStyle = hostile ? '#c28a70' : '#acc593'; c.fillRect(x - 9, y + 15, Math.max(1, Math.round(18 * human.health / 100)), 2);
      }
    }

    drawPet(pet, state) {
      const c = this.ctx, x = Math.floor(pet.x), y = Math.floor(pet.y), dog = pet.kind === 'dog';
      const variant = String(pet.id).split('').reduce((n, letter) => n + letter.charCodeAt(0), 0) % 3;
      const fur = dog ? ['#aa895b', '#c1aa80', '#797969'][variant] : ['#a59478', '#bac1b0', '#787b76'][variant];
      const stride = pet.moving ? Math.sin(state.elapsed * 16) * 2 : 0, wag = Math.sin(this.clock * (dog ? 7 : 2)) * (pet.owned ? 3 : 1.4);
      ellipse(c, x, y + 5, dog ? 13 : 10, 4, '#0d211d85');
      c.save(); c.translate(x, y); c.rotate(pet.angle || 0);
      c.strokeStyle = fur; c.lineWidth = dog ? 3 : 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-15, -3 + wag, -18, dog ? -5 + wag : -9 + wag); c.stroke();
      c.fillStyle = '#514d3d'; c.fillRect(-8 + stride, -7, 4, 4); c.fillRect(3 - stride, -7, 4, 4); c.fillRect(-8 - stride, 4, 4, 4); c.fillRect(3 + stride, 4, 4, 4);
      c.fillStyle = fur; roundRect(c, -10, -5, dog ? 19 : 17, 10, 3); c.fill();
      c.fillStyle = '#dfceb0'; c.fillRect(-7, -3, 8, 3); c.fillRect(-3, 2, 7, 2);
      c.fillStyle = fur; c.fillRect(dog ? 6 : 5, -5, dog ? 9 : 8, 10);
      if (dog) { c.fillStyle = '#69533a'; c.fillRect(6, -8, 5, 4); c.fillRect(6, 4, 5, 4); c.fillStyle = '#d5c39b'; c.fillRect(12, -3, 6, 6); }
      else { c.fillStyle = fur; c.beginPath(); c.moveTo(5, -4); c.lineTo(8, -9); c.lineTo(11, -4); c.moveTo(5, 4); c.lineTo(8, 9); c.lineTo(11, 4); c.fill(); c.fillStyle = '#c8a999'; c.fillRect(8, -6, 2, 2); c.fillRect(8, 4, 2, 2); }
      c.fillStyle = '#1c2722'; c.fillRect(11, -3, 2, 2); c.fillRect(11, 2, 2, 2); c.fillRect(dog ? 17 : 13, -1, 2, 2);
      if (pet.owned) { c.fillStyle = '#9fc5a5'; c.fillRect(5, -5, 2, 10); c.fillStyle = '#e0cf8a'; c.fillRect(6, 4, 2, 2); }
      c.restore();
      if (Math.hypot(pet.x - state.player.x, pet.y - state.player.y) < (pet.owned ? 150 : 85)) {
        c.save(); c.textAlign = 'center'; c.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
        const text = pet.owned ? pet.name : 'Stray ' + pet.kind;
        const width = c.measureText(text).width + 10; c.fillStyle = '#14271dd9'; c.fillRect(x - width / 2, y - 28, width, 13); c.fillStyle = pet.owned ? '#d3dfb8' : '#ded0a0'; c.fillText(text, x, y - 18); c.restore();
      }
    }

    drawZombie(zombie) {
      const c = this.ctx, x = Math.floor(zombie.x), y = Math.floor(zombie.y), angle = zombie.angle || 0;
      const attacking = (zombie.windup || 0) > 0;
      if (attacking) {
        c.fillStyle = '#bc765437'; c.beginPath(); c.moveTo(x, y);
        c.arc(x, y, 41, angle - .55, angle + .55); c.closePath(); c.fill();
        c.strokeStyle = '#e4a07b'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 38, angle - .55, angle + .55); c.stroke();
      }
      ellipse(c, x + 1, y + 6, 11, 5, '#10242299');
      c.save(); c.translate(x, y); c.rotate(angle);
      const variant = String(zombie.id || 0).split('').reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 4;
      c.fillStyle = variant === 0 ? '#5b655c' : variant === 1 ? '#695d4e' : variant === 2 ? '#516972' : '#6e7356';
      c.fillRect(-8, -7, 13, 15); c.fillRect(-6, -9, 8, 3);
      c.fillStyle = '#344d43'; c.fillRect(-7, -7, 5, 3); c.fillRect(-7, 5, 5, 4);
      c.fillStyle = '#90a07b'; c.fillRect(2, -8, 13, 4); c.fillRect(4, 5, 13, 4);
      c.fillStyle = '#b2b68e'; c.fillRect(12, -9, 5, 4); c.fillRect(14, 5, 4, 4);
      c.fillStyle = '#587357'; c.fillRect(-5, -5, 11, 11);
      c.fillStyle = '#a5ae83'; c.fillRect(0, -4, 9, 8);
      c.fillStyle = '#374b3d'; c.fillRect(5, -3, 3, 2); c.fillRect(5, 2, 3, 2);
      c.fillStyle = '#93624c'; c.fillRect(3, 5, 5, 2); c.fillRect(-5, 3, 5, 3);
      c.restore();
      if (zombie.health < 70) {
        const pct = Math.max(.03, Math.min(1, zombie.health / 100));
        c.fillStyle = '#152622'; c.fillRect(x - 11, y - 22, 22, 3);
        c.fillStyle = '#bf8770'; c.fillRect(x - 11, y - 22, Math.ceil(22 * pct), 2);
      }
    }

    drawParticles(state) {
      const c = this.ctx;
      for (const particle of state.particles || []) {
        if (!this.inView(particle.x, particle.y, 5) || !this.known(state, particle.x, particle.y)) continue;
        c.globalAlpha = Math.max(0, Math.min(1, particle.life / (particle.maxLife || 1)));
        c.fillStyle = particle.color || '#d5c58d'; c.fillRect(Math.floor(particle.x), Math.floor(particle.y), 3, 3);
      }
      c.globalAlpha = 1;
      for (const n of state.noises || []) {
        if (n.life <= 0 || !this.inView(n.x, n.y, 50) || n.radius < 180) continue;
        c.strokeStyle = '#cab17630'; c.lineWidth = 1;
        c.beginPath(); c.arc(n.x, n.y, Math.min(70, 15 + (1 - Math.min(1, n.life)) * 45), 0, TAU); c.stroke();
      }
    }

    drawWaypoint(state) {
      const point = Sirens.Progression && Sirens.Progression.waypoint(state);
      if (!point) return;
      const c = this.ctx, sx = (point.x - this.left) * this.zoom, sy = (point.y - this.top) * this.zoom;
      const top = Math.min(250, this.height * .32), bottom = Math.max(top, this.height - 180);
      const x = Math.max(38, Math.min(this.width - 38, sx)), y = Math.max(top, Math.min(bottom, sy));
      const outside = Math.abs(x - sx) > 1 || Math.abs(y - sy) > 1;
      const distance = Math.round(Math.hypot(point.x - state.player.x, point.y - state.player.y) / state.tileSize);
      c.save(); c.translate(x, y); c.lineWidth = 2; c.strokeStyle = '#eac78b'; c.fillStyle = '#172c27';
      c.beginPath(); c.moveTo(0, -10); c.lineTo(10, 0); c.lineTo(0, 10); c.lineTo(-10, 0); c.closePath(); c.fill(); c.stroke();
      if (outside) {
        c.save(); c.rotate(Math.atan2(sy - y, sx - x)); c.fillStyle = '#eac78b';
        c.beginPath(); c.moveTo(5, 0); c.lineTo(-3, -4); c.lineTo(-3, 4); c.closePath(); c.fill(); c.restore();
      } else { c.beginPath(); c.arc(0, 0, 2, 0, TAU); c.fillStyle = '#eac78b'; c.fill(); }
      const label = point.label + ' · ' + distance + ' tiles';
      c.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
      const width = Math.min(this.width - 32, c.measureText(label).width + 18);
      const labelX = Math.max(16 - x, Math.min(this.width - 16 - x - width, -width / 2));
      c.fillStyle = '#13251fed'; roundRect(c, labelX, 17, width, 25, 4); c.fill();
      c.fillStyle = '#ead9ad'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, labelX + width / 2, 30, width - 12); c.restore();
    }

    drawLighting(state) {
      const hour = ((Number(state.time) || 8) % 24 + 24) % 24;
      const night = hour < 6 || hour >= 20 ? 1 : hour >= 17 ? (hour - 17) / 3 : hour < 8 ? (8 - hour) / 2 : 0;
      // A gentle uniform night tint keeps the entire viewport readable.
      const c = this.ctx;
      c.fillStyle = night > 0 ? 'rgba(17, 30, 54, ' + (night * .14) + ')' : '#d8ba6908';
      c.fillRect(0, 0, this.width, this.height);
    }

    drawWeather(state) {
      if (!this.ambientMotion) return;
      const weather = typeof state.weather === 'string' ? state.weather : state.weather && state.weather.type;
      if (!/rain|storm/i.test(weather || '')) return;
      const c = this.ctx; c.strokeStyle = '#c6d8cc38'; c.lineWidth = 1;
      c.beginPath();
      const count = Math.min(110, Math.floor(this.width * this.height / 9000));
      for (let i = 0; i < count; i++) {
        const x = (noise(i, 8, 17) * this.width + this.clock * 55) % this.width;
        const y = (noise(i, 19, 31) * this.height + this.clock * 420) % this.height;
        c.moveTo(x, y); c.lineTo(x - 3, y + 12);
      }
      c.stroke();
    }

    drawMinimap(state, now) {
      if (!this.miniCtx) return;
      const c = this.miniCtx, w = this.miniWidth, h = this.miniHeight;
      const ground = this.lastFloor > 0 && Sirens.Stories && typeof Sirens.Stories.groundView === 'function' ? Sirens.Stories.groundView(state) || state : state;
      const mapTiles = ground.tiles || state.tiles;
      if (this.minimapState !== state || now - this.lastMini > 240) {
        // One pixel per tile, written into a reused buffer. Only changed tiles are rewritten,
        // and an unchanged map skips the upload entirely.
        if (!this.miniTerrain || this.miniTerrain.width !== state.width || this.miniTerrain.height !== state.height) { this.miniTerrain = surface(state.width, state.height); this.miniPixels = null; }
        const m = this.miniTerrain.getContext('2d'), count = state.width * state.height;
        if (!this.miniPixels) { this.miniPixels = m.createImageData(state.width, state.height); this.miniWords = new Uint32Array(this.miniPixels.data.buffer); this.miniTiles = new Int16Array(count).fill(-1); }
        let changed = false;
        for (let i = 0; i < count; i++) {
          const t = mapTiles[i], key = t >= 0 && t < MINI_WORDS.length ? t : MINI_WORDS.length;
          if (this.miniTiles[i] !== key) { this.miniTiles[i] = key; this.miniWords[i] = key < MINI_WORDS.length ? MINI_WORDS[key] : MINI_WORDS[0]; changed = true; }
        }
        if (changed) m.putImageData(this.miniPixels, 0, 0);
        this.minimapState = state; this.lastMini = now;
      }
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.fillStyle = '#132b29'; c.fillRect(0, 0, w, h);
      const padding = 9, mapSize = Math.min(w, h) - padding * 2;
      const ox = Math.floor((w - mapSize) / 2), oy = Math.floor((h - mapSize) / 2);
      c.drawImage(this.miniTerrain, ox, oy, mapSize, mapSize);
      c.strokeStyle = '#bcbf9030'; c.lineWidth = 1; c.strokeRect(ox + .5, oy + .5, mapSize - 1, mapSize - 1);
      const scaleX = mapSize / (state.width * state.tileSize), scaleY = mapSize / (state.height * state.tileSize);
      c.strokeStyle = '#d4ddad55'; c.lineWidth = 1;
      const first = this.viewMode === 'first';
      if (first) {
        // In first person a view cone replaces the top-down viewport outline.
        const cx = ox + state.player.x * scaleX, cy = oy + state.player.y * scaleY, half = Math.atan(this.firstPerson && this.firstPerson.plane || .8), reach = Math.max(8, 14 * state.tileSize * scaleX);
        c.fillStyle = '#e8d9a424'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, reach, this.viewYaw - half, this.viewYaw + half); c.closePath(); c.fill(); c.stroke();
      } else {
        const vx = Math.max(ox, ox + this.left * scaleX), vy = Math.max(oy, oy + this.top * scaleY);
        const vr = Math.min(ox + mapSize, ox + this.right * scaleX), vb = Math.min(oy + mapSize, oy + this.bottom * scaleY);
        c.strokeRect(vx, vy, Math.max(0, vr - vx), Math.max(0, vb - vy));
      }
      if (state.goal) {
        const gx = ox + state.goal.radioX * scaleX, gy = oy + state.goal.radioY * scaleY;
        c.fillStyle = '#162b2b'; c.beginPath(); c.arc(gx, gy, 5, 0, TAU); c.fill();
        c.fillStyle = state.goal.complete ? '#bfe69d' : '#e7ca7c'; c.beginPath();
        c.moveTo(gx, gy - 4); c.lineTo(gx + 4, gy); c.lineTo(gx, gy + 4); c.lineTo(gx - 4, gy); c.closePath(); c.fill();
      }
      const waypoint = Sirens.Progression && Sirens.Progression.waypoint(state);
      if (waypoint) {
        const wx = Math.max(ox + 4, Math.min(ox + mapSize - 4, ox + waypoint.x * scaleX)), wy = Math.max(oy + 4, Math.min(oy + mapSize - 4, oy + waypoint.y * scaleY));
        c.fillStyle = '#19332c'; c.strokeStyle = '#eac78b'; c.lineWidth = 1.5; c.beginPath();
        c.moveTo(wx, wy - 4); c.lineTo(wx + 4, wy); c.lineTo(wx, wy + 4); c.lineTo(wx - 4, wy); c.closePath(); c.fill(); c.stroke();
      }
      const px = ox + state.player.x * scaleX, py = oy + state.player.y * scaleY, angle = first ? this.viewYaw : state.player.angle || 0;
      c.save(); c.translate(px, py); c.rotate(angle);
      c.fillStyle = '#142b29'; c.beginPath(); c.moveTo(7, 0); c.lineTo(-4, -5); c.lineTo(-4, 5); c.closePath(); c.fill();
      c.fillStyle = '#f3e6b0'; c.beginPath(); c.moveTo(5, 0); c.lineTo(-2, -3); c.lineTo(-2, 3); c.closePath(); c.fill(); c.restore();
      c.font = '600 8px ui-monospace, SFMono-Regular, Menlo, monospace'; c.textBaseline = 'top'; c.textAlign = 'left';
      c.fillStyle = '#d4d4ab'; c.fillText('N', 5, 3);
      c.fillStyle = '#b0b796'; c.fillRect(w - 17, h - 7, 11, 1); c.fillRect(w - 17, h - 9, 1, 3); c.fillRect(w - 7, h - 9, 1, 3);
    }

    destroy() {
      window.removeEventListener('resize', this.resize);

      this.grassSprites.length = 0; this.floorSprites.length = 0; this.treeSprites.length = 0; this.waterSprites.length = 0;
    }
  }
  Sirens.Renderer = Renderer;
})();
