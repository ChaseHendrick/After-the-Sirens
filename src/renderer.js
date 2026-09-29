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
      this.lastOriginX = 0; this.lastOriginY = 0; this.lastRevision = 0;
      this.lastFloor = 0;
      this.clock = 0; this.lastTime = 0; this.lastMini = -1000;
      this.minimapState = null; this.miniTerrain = null;
      this.darkness = surface(1, 1);
      this.darkCtx = this.darkness.getContext('2d');
      this.visibility = new Map();
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
      this.fireLight = surface(190, 190);
      const f = this.fireLight.getContext('2d');
      const halo = f.createRadialGradient(95, 95, 4, 95, 95, 95);
      halo.addColorStop(0, '#000000d0'); halo.addColorStop(1, '#00000000');
      f.fillStyle = halo; f.fillRect(0, 0, 190, 190);
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, Math.round(rect.width || window.innerWidth));
      this.height = Math.max(1, Math.round(rect.height || window.innerHeight));
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.imageSmoothingEnabled = false;
      this.darkness.width = this.width; this.darkness.height = this.height;
      const v = this.ctx.createRadialGradient(this.width / 2, this.height / 2, Math.min(this.width, this.height) * .16,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) * .66);
      v.addColorStop(0, '#07131400'); v.addColorStop(.62, '#07131410'); v.addColorStop(1, '#061517cc');
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
        x: (clientX - rect.left) * this.width / Math.max(1, rect.width) + camera.x - this.width / 2,
        y: (clientY - rect.top) * this.height / Math.max(1, rect.height) + camera.y - this.height / 2
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
        this.lastDrawState = state; this.visibility.clear(); this.lastMini = -1000;
      } else if (originX !== this.lastOriginX || originY !== this.lastOriginY) {
        this.camera.x -= (originX - this.lastOriginX) * state.tileSize;
        this.camera.y -= (originY - this.lastOriginY) * state.tileSize;
        this.visibility.clear(); this.lastMini = -1000;
      } else if (revision !== this.lastRevision) {
        this.visibility.clear(); this.lastMini = -1000;
      }
      if (floor !== this.lastFloor) { this.visibility.clear(); this.lastMini = -1000; }
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
      if (!state.discovered) return true;
      const tx = Math.floor(x / state.tileSize), ty = Math.floor(y / state.tileSize);
      return tx >= 0 && ty >= 0 && tx < state.width && ty < state.height && !!state.discovered[ty * state.width + tx];
    }

    inView(x, y, margin) {
      const m = margin || 64;
      return x > this.left - m && y > this.top - m && x < this.right + m && y < this.bottom + m;
    }

    draw(state, frameInfo) {
      if (!state || !state.player) return;
      frameInfo = frameInfo || {};
      const now = performance.now();
      const delta = Math.min(.08, Math.max(.001, this.lastTime ? (now - this.lastTime) / 1000 : 1 / 60));
      this.lastTime = now; this.clock += delta;
      const p = state.player;
      this.syncOrigin(state);
      const ease = 1 - Math.exp(-12 * delta);
      this.camera.x += (p.x - this.camera.x) * ease;
      this.camera.y += (p.y - this.camera.y) * ease;
      const worldWidth = state.width * state.tileSize, worldHeight = state.height * state.tileSize;
      this.camera.x = this.width < worldWidth ? Math.max(this.width / 2 - 24, Math.min(worldWidth - this.width / 2 + 24, this.camera.x)) : worldWidth / 2;
      this.camera.y = this.height < worldHeight ? Math.max(this.height / 2 - 24, Math.min(worldHeight - this.height / 2 + 24, this.camera.y)) : worldHeight / 2;
      this.left = Math.floor(this.camera.x - this.width / 2); this.top = Math.floor(this.camera.y - this.height / 2);
      this.right = this.left + this.width; this.bottom = this.top + this.height;
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = COLORS.fog; ctx.fillRect(0, 0, this.width, this.height);
      ctx.save(); ctx.translate(-this.left, -this.top);
      this.drawTerrain(state);
      this.drawBuildingDetails(state);
      this.drawStairs(state);
      this.drawSignals(state);
      const entities = [];
      for (const vehicle of state.vehicles || []) {
        if (this.inView(vehicle.x, vehicle.y, 50) && this.known(state, vehicle.x, vehicle.y)) entities.push({ y: vehicle.y, kind: 'vehicle', data: vehicle });
      }
      for (const human of state.humans || []) {
        if (human.health <= 0 || !this.inView(human.x, human.y, 35) || !this.known(state, human.x, human.y)) continue;
        const dx = human.x - p.x, dy = human.y - p.y;
        if (dx * dx + dy * dy > 480 * 480) continue;
        if (Sirens.Engine && typeof Sirens.Engine.hasLOS === 'function' && !Sirens.Engine.hasLOS(state, p.x, p.y, human.x, human.y)) continue;
        entities.push({ y: human.y, kind: 'human', data: human });
      }
      for (const container of state.containers || []) {
        if (this.inView(container.x, container.y) && this.known(state, container.x, container.y)) entities.push({ y: container.y, kind: 'container', data: container });
      }
      for (const structure of state.structures || []) {
        if (this.inView(structure.x, structure.y) && this.known(state, structure.x, structure.y)) entities.push({ y: structure.y, kind: 'structure', data: structure });
      }
      for (const zombie of state.zombies || []) {
        if (zombie.health <= 0 || !this.inView(zombie.x, zombie.y, 30) || !this.known(state, zombie.x, zombie.y)) continue;
        const dx = zombie.x - p.x, dy = zombie.y - p.y;
        if (dx * dx + dy * dy > 480 * 480) continue;
        const old = this.visibility.get(zombie.id);
        let visible;
        if (old && now - old.time < 90 && Math.abs(old.px - p.x) + Math.abs(old.py - p.y) < 20 && Math.abs(old.zx - zombie.x) + Math.abs(old.zy - zombie.y) < 20) visible = old.visible;
        else {
          visible = Sirens.Engine && typeof Sirens.Engine.hasLOS === 'function' ? Sirens.Engine.hasLOS(state, p.x, p.y, zombie.x, zombie.y) : true;
          this.visibility.set(zombie.id, { time: now, visible, px: p.x, py: p.y, zx: zombie.x, zy: zombie.y });
        }
        if (visible) entities.push({ y: zombie.y, kind: 'zombie', data: zombie });
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
        else if (entity.kind === 'tree') this.drawTree(entity.data, state);
        else this.drawStructure(entity.data);
      }
      this.drawRoofs(state);
      this.drawParticles(state);
      this.drawInteraction(state);
      ctx.restore();
      this.drawLighting(state);
      this.drawWeather(state);
      ctx.fillStyle = this.vignette; ctx.fillRect(0, 0, this.width, this.height);
      this.drawMinimap(state, now);
      if (this.visibility.size > (state.zombies || []).length + 64) this.visibility.clear();
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
        if (state.discovered && !state.discovered[index]) {
          ctx.fillStyle = (x + y) % 3 === 0 ? '#0b1e1e' : COLORS.fog;
          ctx.fillRect(x * s, y * s, s, s);
          if (noise(x + this.lastOriginX, y + this.lastOriginY, state.seed) > .87) { ctx.fillStyle = '#142929'; ctx.fillRect(x * s + 14, y * s + 14, 2, 2); }
          continue;
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
          ctx.drawImage(this.floorSprites[variant], xx, yy, s, s);
          if (tile === 3) { this.drawWall(state, x, y); this.drawTerrainDamage(state, index, xx + s / 2, yy + s / 2); }
          else if (tile === 6 || tile === 7) this.drawDoor(state, x, y, tile === 7);
          else if (tile === 8 || tile === 9) this.drawWindow(state, x, y, tile === 9);
        }
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
      const c = this.ctx, s = state.tileSize, x = tx * s, y = ty * s;
      c.fillStyle = '#3e473d'; c.fillRect(x + 3, y + 5, s - 1, s);
      c.fillStyle = '#9a9e83'; c.fillRect(x + 2, y + 1, s - 4, s - 2);
      c.fillStyle = COLORS.wall; c.fillRect(x + 2, y + 1, s - 4, 6);
      c.fillStyle = '#697562'; c.fillRect(x + 2, y + s - 6, s - 4, 5);
      c.fillStyle = '#b1b49a'; c.fillRect(x + 3, y + 9, s - 6, 12);
      c.strokeStyle = '#969d83'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 3, y + 20); c.lineTo(x + s - 3, y + 20); c.stroke();
      if (this.tile(state, tx - 1, ty) !== 3) { c.fillStyle = '#d2c8a7'; c.fillRect(x + 2, y + 2, 3, s - 8); }
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

    drawBuildingDetails(state) {
      const c = this.ctx, s = state.tileSize;
      for (const b of state.buildings || []) {
        const x = b.x * s, y = b.y * s, w = b.w * s, h = b.h * s;
        if (!this.inView(x + w / 2, y + h / 2, Math.max(w, h)) || !this.known(state, x + w / 2, y + h / 2)) continue;
        c.save(); this.clipExploredBuilding(state, b);
        c.fillStyle = '#374c3866'; c.fillRect(x + s + 4, y + s + 6, Math.max(8, w - s * 2 - 8), Math.max(8, h - s * 2 - 12));
        const name = String(b.name || '').toLowerCase();
        if (/warehouse|workshop|depot|barn/i.test(name)) {
          for (let yy = y + s + 6; yy < y + h - s - 20; yy += 26) {
            c.fillStyle = name.includes('barn') ? '#9b8955' : '#738176'; c.fillRect(x + s + 6, yy, 34, 17);
            c.fillStyle = name.includes('barn') ? '#c6b77a' : '#a2aea0'; c.fillRect(x + s + 6, yy, 34, 3);
            c.fillStyle = '#526c55'; c.fillRect(x + s + 12, yy + 5, 11, 9);
            c.fillStyle = '#9c966b'; c.fillRect(x + s + 25, yy + 6, 8, 7);
          }
        }
        if (name.includes('cabin') || name.includes('home') || name.includes('house')) {
          // Original furnishings use a modest top-down silhouette, with clear walkways.
          c.fillStyle = '#3c4c48'; c.fillRect(x + s + 4, y + s + 6, 27, 44);
          c.fillStyle = '#bcb591'; c.fillRect(x + s + 6, y + s + 8, 23, 10);
          c.fillStyle = '#607b71'; c.fillRect(x + s + 6, y + s + 22, 23, 25);
          c.fillStyle = '#729082'; c.fillRect(x + s + 6, y + s + 22, 23, 3);
          c.fillStyle = '#5a523b'; c.fillRect(x + w - s - 40, y + s + 7, 31, 17);
          c.fillStyle = '#998363'; c.fillRect(x + w - s - 40, y + s + 5, 31, 15);
          c.fillStyle = '#d0c29a'; c.fillRect(x + w - s - 31, y + s + 8, 9, 7);
        } else {
          c.fillStyle = '#535743'; c.fillRect(x + s + 5, y + s + 7, Math.min(w - s * 2 - 10, 66), 15);
          c.fillStyle = '#aba582'; c.fillRect(x + s + 5, y + s + 5, Math.min(w - s * 2 - 10, 66), 11);
          c.fillStyle = '#65736b'; c.fillRect(x + s + 11, y + s + 7, 12, 7);
          c.fillStyle = '#b3a670'; c.fillRect(x + s + 32, y + s + 8, 9, 6);
          if (w > 170 && h > 150) {
            c.fillStyle = '#5b5f47'; c.fillRect(x + w / 2 - 22, y + h / 2 - 15, 48, 25);
            c.fillStyle = '#ad9c73'; c.fillRect(x + w / 2 - 24, y + h / 2 - 18, 48, 25);
            c.fillStyle = '#cfbd8b'; c.fillRect(x + w / 2 - 21, y + h / 2 - 17, 42, 2);
          }
        }
        c.restore();
      }
    }

    clipExploredBuilding(state, building) {
      if (!state.discovered) return;
      const c = this.ctx, s = state.tileSize;
      c.beginPath();
      for (let yy = building.y; yy < building.y + building.h; yy++) {
        for (let xx = building.x; xx < building.x + building.w; xx++) {
          if (state.discovered[yy * state.width + xx]) c.rect(xx * s, yy * s, s, s);
        }
      }
      c.clip();
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
      const c = this.ctx, s = state.tileSize, p = state.player;
      for (const b of state.buildings || []) {
        const x = b.x * s, y = b.y * s, w = b.w * s, h = b.h * s;
        if (x > this.right + 60 || x + w < this.left - 60 || y > this.bottom + 60 || y + h < this.top - 60) continue;
        // A roof cuts away before the player reaches its door.
        const dx = Math.max(x - p.x, 0, p.x - x - w), dy = Math.max(y - p.y, 0, p.y - y - h);
        if (dx * dx + dy * dy < 90 * 90) continue;
        const discover = this.known(state, x + w / 2, y + h / 2);
        if (!discover) continue;
        c.save(); this.clipExploredBuilding(state, b);
        c.fillStyle = '#101f2266'; c.fillRect(x + 11, y + 13, w, h);
        c.fillStyle = '#28383e'; c.fillRect(x - 3, y - 3, w + 6, h + 5);
        const industrial = /warehouse|depot|workshop/i.test(b.name || ''), rural = /barn|farm/i.test(b.name || '');
        c.fillStyle = industrial ? '#67746c' : rural ? '#7a6750' : '#465759'; c.fillRect(x, y, w, h / 2);
        c.fillStyle = industrial ? '#4c615b' : rural ? '#5c5546' : '#34464a'; c.fillRect(x, y + h / 2, w, h / 2);
        c.strokeStyle = '#546363'; c.lineWidth = 1;
        for (let row = 10; row < h; row += 12) {
          c.beginPath(); c.moveTo(x + 3, y + row); c.lineTo(x + w - 3, y + row); c.stroke();
          c.strokeStyle = row < h / 2 ? '#35454a' : '#293b41';
          for (let col = (row % 24 ? 4 : 17); col < w; col += 27) { c.beginPath(); c.moveTo(x + col, y + row - 10); c.lineTo(x + col, y + row); c.stroke(); }
          c.strokeStyle = '#546363';
        }
        c.fillStyle = '#899189'; c.fillRect(x - 2, y + h / 2 - 3, w + 4, 4);
        c.fillStyle = '#c0b997'; c.fillRect(x - 2, y + h / 2 - 3, w + 4, 1);
        c.fillStyle = '#263639'; c.fillRect(x + w - 44, y + 22, 21, 25);
        c.fillStyle = '#717c73'; c.fillRect(x + w - 46, y + 18, 21, 23);
        c.fillStyle = '#454c46'; c.fillRect(x + w - 43, y + 21, 15, 15);
        c.fillStyle = '#949a83'; c.fillRect(x + w - 46, y + 18, 21, 3);
        // Small hand-painted sign labels help make the town navigable.
        if (w > 100 && b.name) {
          const label = String(b.name).toUpperCase();
          c.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
          c.textAlign = 'center'; c.textBaseline = 'middle';
          const signWidth = Math.min(w - 14, c.measureText(label).width + 16);
          c.fillStyle = '#15282de8'; c.fillRect(x + w / 2 - signWidth / 2, y + h - 19, signWidth, 17);
          c.fillStyle = '#b5bea2'; c.fillText(label, x + w / 2, y + h - 10, signWidth - 8);
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

    drawPlayer(player, state) {
      const c = this.ctx, x = Math.floor(player.x), y = Math.floor(player.y), angle = player.angle || 0;
      const items = Sirens.Engine && Sirens.Engine.items || {};
      const weapon = items[player.weapon] && items[player.weapon].weapon;
      const firearm = weapon ? weapon.kind === 'firearm' : player.weapon === 'pistol';
      const equipment = player.equipment || {};
      const clothing = items[equipment.clothing], backpack = items[equipment.backpack];
      const vehicle = (state.vehicles || []).find((car) => car.id === player.vehicleId);
      if (vehicle) {
        c.strokeStyle = '#e4d08d99'; c.lineWidth = 1; c.beginPath(); c.ellipse(vehicle.x, vehicle.y, 29, 19, vehicle.angle || 0, 0, TAU); c.stroke();
        return;
      }
      ellipse(c, x + 1, y + 6, 12, 6, '#091d2490');
      c.save(); c.translate(x, y); c.rotate(angle);
      c.strokeStyle = '#d9d39b40'; c.lineWidth = 1; c.setLineDash([3, 6]);
      c.beginPath(); c.moveTo(19, 0); c.lineTo(firearm ? 100 : 43, 0); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#1b343a'; c.fillRect(-6, -9, 9, 6); c.fillRect(-6, 4, 9, 6);
      c.fillStyle = clothing && clothing.color || '#a99b69'; c.fillRect(-8, -8, 13, 16);
      c.fillStyle = clothing ? '#d9ddac85' : '#d5bd75'; c.fillRect(-8, -8, 13, 4); c.fillRect(-5, -3, 13, 6);
      c.fillStyle = backpack && backpack.color || '#6c6e47'; c.fillRect(-10, -5, backpack ? 8 : 5, 10);
      c.fillStyle = '#d6b78a'; c.fillRect(5, -7, 9, 4); c.fillRect(5, 3, 10, 4);
      if (firearm) {
        const length = weapon && weapon.range > 300 ? 21 : 11;
        c.fillStyle = '#142b32'; c.fillRect(12, -4, length, 4); c.fillRect(14, -2, 4, 6);
        c.fillStyle = '#a4b0a2'; c.fillRect(16, -5, Math.max(6, length - 5), 1);
      } else if (weapon && weapon.range < 55) {
        c.fillStyle = '#8b744b'; c.fillRect(12, 0, 8, 4);
        c.fillStyle = '#d2dbbb'; c.fillRect(18, -1, 9, 3);
      } else {
        c.save(); c.translate(13, 2); c.rotate(-.65);
        c.fillStyle = '#766e4c'; c.fillRect(-3, -1, 24, 4);
        const length = weapon && weapon.range > 100 ? 29 : 16;
        c.fillStyle = '#d6c28c'; c.fillRect(8, -2, length, 6);
        c.fillStyle = '#e9d7a3'; c.fillRect(9, -2, 14, 1); c.restore();
      }
      c.fillStyle = '#593f2d'; c.fillRect(-6, -6, 12, 12);
      c.fillStyle = '#b99064'; c.fillRect(0, -4, 8, 8);
      c.fillStyle = '#ddbc88'; c.fillRect(6, -3, 3, 6);
      c.fillStyle = '#382e26'; c.fillRect(-5, -6, 8, 5); c.fillRect(-6, -2, 3, 6);
      c.restore();
      if (player.bleeding > 0) {
        c.fillStyle = '#b96753'; c.fillRect(x - 2, y + 14, 3, 2);
      }
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
        c.fillText(String(human.name || (hostile ? 'Raider' : 'Survivor')) + (human.following ? ' · following' : ''), x, y - 30, 125); c.restore();
      }
      if (human.health < 80) {
        c.fillStyle = '#16302a'; c.fillRect(x - 9, y + 15, 18, 3);
        c.fillStyle = hostile ? '#c28a70' : '#acc593'; c.fillRect(x - 9, y + 15, Math.max(1, Math.round(18 * human.health / 100)), 2);
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

    drawInteraction(state) {
      if (!Sirens.Engine || typeof Sirens.Engine.nearby !== 'function') return;
      const label = Sirens.Engine.nearby(state);
      if (!label) return;
      const c = this.ctx, p = state.player;
      c.save(); c.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      const text = 'E  ' + String(label), w = Math.min(270, c.measureText(text).width + 20);
      const x = Math.max(this.left + 12, Math.min(this.right - w - 12, p.x - w / 2)), y = p.y + 34;
      c.fillStyle = '#122d2de8'; roundRect(c, x, y, w, 24, 4); c.fill();
      c.strokeStyle = '#d1bd7950'; c.lineWidth = 1; c.stroke();
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#e2d1a2'; c.fillText(text, x + w / 2, y + 12, w - 12); c.restore();
    }

    drawLighting(state) {
      const hour = ((Number(state.time) || 8) % 24 + 24) % 24;
      let darkness;
      if (hour >= 8 && hour <= 17) darkness = .045;
      else if (hour > 17 && hour < 21) darkness = .045 + (hour - 17) / 4 * .63;
      else if (hour >= 5 && hour < 8) darkness = .68 - (hour - 5) / 3 * .635;
      else darkness = .68;
      const c = this.ctx, d = this.darkCtx;
      if (darkness > .06) {
        const px = state.player.x - this.left, py = state.player.y - this.top;
        d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, this.width, this.height);
        d.fillStyle = '#061521'; d.fillRect(0, 0, this.width, this.height);
        d.globalCompositeOperation = 'destination-out';
        const light = d.createRadialGradient(px, py, 36, px, py, 210);
        light.addColorStop(0, '#000000e8'); light.addColorStop(.45, '#000000ba'); light.addColorStop(1, '#00000000');
        d.fillStyle = light; d.fillRect(px - 210, py - 210, 420, 420);
        const angle = state.player.angle || 0;
        d.fillStyle = '#00000050'; d.beginPath(); d.moveTo(px, py);
        d.arc(px, py, 265, angle - .35, angle + .35); d.closePath(); d.fill();
        // Campfires share the lighting pass and are limited to the visible viewport.
        for (const structure of state.structures || []) if (structure.type === 'campfire' && this.inView(structure.x, structure.y, 80)) {
          const sx = structure.x - this.left, sy = structure.y - this.top;
          d.drawImage(this.fireLight, sx - 95, sy - 95);
        }
        d.globalCompositeOperation = 'source-over';
        c.globalAlpha = darkness; c.drawImage(this.darkness, 0, 0); c.globalAlpha = 1;
      } else {
        c.fillStyle = '#d8ba6910'; c.fillRect(0, 0, this.width, this.height);
      }
    }

    drawWeather(state) {
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
      const mapTiles = ground.tiles || state.tiles, mapDiscovered = ground.discovered || state.discovered;
      if (this.minimapState !== state || now - this.lastMini > 240) {
        if (!this.miniTerrain || this.miniTerrain.width !== state.width || this.miniTerrain.height !== state.height) this.miniTerrain = surface(state.width, state.height);
        const m = this.miniTerrain.getContext('2d');
        const tileColors = ['#35513d', '#7b806c', '#9c9877', '#bfbea0', '#41666a', '#263e32', '#c9ac75', '#acb391', '#92b8b4', '#b1b99a'];
        m.fillStyle = '#102a29'; m.fillRect(0, 0, state.width, state.height);
        for (let y = 0; y < state.height; y++) for (let x = 0; x < state.width; x++) {
          const i = y * state.width + x;
          if (mapDiscovered && !mapDiscovered[i]) continue;
          m.fillStyle = tileColors[mapTiles[i]] || '#35513d'; m.fillRect(x, y, 1, 1);
        }
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
      const vx = Math.max(ox, ox + this.left * scaleX), vy = Math.max(oy, oy + this.top * scaleY);
      const vr = Math.min(ox + mapSize, ox + this.right * scaleX), vb = Math.min(oy + mapSize, oy + this.bottom * scaleY);
      c.strokeRect(vx, vy, Math.max(0, vr - vx), Math.max(0, vb - vy));
      if (state.goal) {
        const gx = ox + state.goal.radioX * scaleX, gy = oy + state.goal.radioY * scaleY;
        c.fillStyle = '#162b2b'; c.beginPath(); c.arc(gx, gy, 5, 0, TAU); c.fill();
        c.fillStyle = state.goal.complete ? '#bfe69d' : '#e7ca7c'; c.beginPath();
        c.moveTo(gx, gy - 4); c.lineTo(gx + 4, gy); c.lineTo(gx, gy + 4); c.lineTo(gx - 4, gy); c.closePath(); c.fill();
      }
      const px = ox + state.player.x * scaleX, py = oy + state.player.y * scaleY, angle = state.player.angle || 0;
      c.save(); c.translate(px, py); c.rotate(angle);
      c.fillStyle = '#142b29'; c.beginPath(); c.moveTo(7, 0); c.lineTo(-4, -5); c.lineTo(-4, 5); c.closePath(); c.fill();
      c.fillStyle = '#f3e6b0'; c.beginPath(); c.moveTo(5, 0); c.lineTo(-2, -3); c.lineTo(-2, 3); c.closePath(); c.fill(); c.restore();
      c.font = '600 8px ui-monospace, SFMono-Regular, Menlo, monospace'; c.textBaseline = 'top'; c.textAlign = 'left';
      c.fillStyle = '#d4d4ab'; c.fillText('N', 5, 3);
      c.fillStyle = '#b0b796'; c.fillRect(w - 17, h - 7, 11, 1); c.fillRect(w - 17, h - 9, 1, 3); c.fillRect(w - 7, h - 9, 1, 3);
    }

    destroy() {
      window.removeEventListener('resize', this.resize);
      this.visibility.clear();
      this.grassSprites.length = 0; this.floorSprites.length = 0; this.treeSprites.length = 0; this.waterSprites.length = 0;
    }
  }
  Sirens.Renderer = Renderer;
})();
