(function () {
  'use strict';
  // Twin-stick touch controls. Touch pointers are routed here by main.js, so mouse and
  // keyboard behavior is unchanged. This module only produces ordinary input snapshots
  // and the same commands as the keyboard; the simulation never sees touch events.
  const Sirens = window.Sirens = window.Sirens || {};
  const RADIUS = 54, DEAD_ZONE = .18, ATTACK_ZONE = .38, TAP_MS = 260, TAP_TRAVEL = 14, STRIKE_MS = 150, MOVE_SHARE = .45;

  function stickVector(dx, dy) {
    const length = Math.hypot(dx, dy) / RADIUS;
    if (length <= DEAD_ZONE) return { x: 0, y: 0, magnitude: 0 };
    const magnitude = Math.min(1, (length - DEAD_ZONE) / (1 - DEAD_ZONE)), scale = magnitude / (length * RADIUS);
    return { x: dx * scale, y: dy * scale, magnitude };
  }

  class Touch {
    constructor(root, callbacks) {
      this.root = root;
      this.callbacks = callbacks || {};
      this.enabled = false;
      this.toggles = { sprint: false, sneak: false };
      this.sticks = { move: null, aim: null };
      this.strike = null;
      // In first person the right side becomes a look pad: horizontal drag turns the view, a tap strikes ahead.
      this.look = false; this.lookDX = 0;
      const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      const layer = this.layer = document.createElement('div');
      layer.className = 'as-touch';
      layer.hidden = true;
      layer.innerHTML = '<div class="as-stick" data-stick="move" hidden><span></span></div><div class="as-stick as-stick-aim" data-stick="aim" hidden><span></span></div>' +
        '<div class="as-touch-actions" role="group" aria-label="Touch actions">' +
        '<button type="button" class="as-touch-drive" data-touch="vehicle" title="Drive the nearby car (V)" hidden>Drive</button>' +
        '<button type="button" data-touch="interact" title="Use what is nearby (E)">Use</button>' +
        '<button type="button" data-touch="switch" title="Switch weapon (F)">Swap</button>' +
        '<button type="button" data-touch="sprint" aria-pressed="false" title="Sprint while moving (Shift)">Run</button>' +
        '<button type="button" data-touch="sneak" aria-pressed="false" title="Move quietly (C)">Sneak</button></div>';
      root.appendChild(layer);
      this.nodes = { move: layer.querySelector('[data-stick="move"]'), aim: layer.querySelector('[data-stick="aim"]'), use: layer.querySelector('[data-touch="interact"]'), drive: layer.querySelector('[data-touch="vehicle"]') };
      this.onClick = this.click.bind(this);
      layer.addEventListener('click', this.onClick);
      root.dataset.input = 'pointer';
      if (coarse) this.enable(true);
    }

    enable(on) {
      on = !!on;
      if (on === this.enabled) return;
      this.enabled = on;
      this.root.dataset.input = on ? 'touch' : 'pointer';
      if (!on) this.reset();
      if (typeof this.callbacks.changed === 'function') this.callbacks.changed(on);
    }

    click(event) {
      const button = event.target.closest('[data-touch]');
      if (!button || button.disabled) return;
      const name = button.dataset.touch;
      if (name === 'sprint' || name === 'sneak') {
        this.toggles[name] = !this.toggles[name];
        if (this.toggles[name]) this.toggles[name === 'sprint' ? 'sneak' : 'sprint'] = false;
        this.refreshToggles();
      } else if (typeof this.callbacks.command === 'function') this.callbacks.command(name);
      button.blur();
    }

    refreshToggles() {
      for (const name of ['sprint', 'sneak']) this.layer.querySelector(`[data-touch="${name}"]`).setAttribute('aria-pressed', String(this.toggles[name]));
    }

    setLook(on) {
      this.look = !!on; this.lookDX = 0;
      if (this.sticks.aim) { this.sticks.aim = null; this.draw('aim'); }
      this.nodes.aim.classList.toggle('as-stick-look', this.look);
    }

    // Horizontal look-pad travel since the last call, in CSS pixels.
    takeLook() { const dx = this.lookDX; this.lookDX = 0; return dx; }

    // Returns true when the pointer belongs to the touch controls.
    down(event, rect) {
      if (event.pointerType !== 'touch') return false;
      this.enable(true);
      const width = rect && rect.width || window.innerWidth, left = rect && rect.left || 0;
      const kind = event.clientX - left < width * MOVE_SHARE ? 'move' : 'aim';
      if (this.sticks[kind]) return true;
      // The stick centres on the touch itself, even near an edge, so a new touch never starts pushed.
      this.sticks[kind] = { id: event.pointerId, ox: event.clientX, oy: event.clientY, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, started: performance.now(), travel: 0 };
      this.draw(kind);
      return true;
    }

    move(event) {
      if (event.pointerType !== 'touch') return false;
      for (const kind of ['move', 'aim']) {
        const stick = this.sticks[kind];
        if (!stick || stick.id !== event.pointerId) continue;
        if (kind === 'aim' && this.look) {
          this.lookDX += event.clientX - stick.x;
          // The pad's centre trails a long drag so the knob keeps showing the latest direction.
          if (Math.abs(event.clientX - stick.ox) > RADIUS) stick.ox = event.clientX - Math.sign(event.clientX - stick.ox) * RADIUS;
        }
        stick.x = event.clientX; stick.y = event.clientY;
        stick.travel = Math.max(stick.travel, Math.hypot(stick.x - stick.startX, stick.y - stick.startY));
        // The movement base follows a thumb that slides past its edge, so direction changes stay short.
        const dx = stick.x - stick.ox, dy = stick.y - stick.oy, distance = Math.hypot(dx, dy);
        if (kind === 'move' && distance > RADIUS * 1.4) { stick.ox += dx - dx / distance * RADIUS * 1.4; stick.oy += dy - dy / distance * RADIUS * 1.4; }
        this.draw(kind);
        return true;
      }
      return false;
    }

    up(event) {
      if (event.pointerType !== 'touch') return false;
      for (const kind of ['move', 'aim']) {
        const stick = this.sticks[kind];
        if (!stick || stick.id !== event.pointerId) continue;
        // A quick tap on the right side strikes toward that point in the world.
        if (kind === 'aim' && event.type === 'pointerup' && stick.travel < TAP_TRAVEL && performance.now() - stick.started < TAP_MS) this.strike = { x: stick.startX, y: stick.startY, until: performance.now() + STRIKE_MS };
        this.sticks[kind] = null;
        this.draw(kind);
        return true;
      }
      return false;
    }

    reset() {
      this.sticks.move = this.sticks.aim = null; this.strike = null; this.lookDX = 0;
      this.draw('move'); this.draw('aim');
    }

    draw(kind) {
      const node = this.nodes[kind], stick = this.sticks[kind];
      node.hidden = !stick;
      if (!stick) return;
      const vector = stickVector(stick.x - stick.ox, stick.y - stick.oy), reach = Math.min(1, Math.hypot(stick.x - stick.ox, stick.y - stick.oy) / RADIUS);
      const angle = Math.atan2(stick.y - stick.oy, stick.x - stick.ox), look = kind === 'aim' && this.look;
      node.style.left = stick.ox + 'px'; node.style.top = stick.oy + 'px';
      node.firstChild.style.transform = look ? `translate(${Math.max(-RADIUS, Math.min(RADIUS, stick.x - stick.ox))}px, 0px)` : `translate(${Math.cos(angle) * reach * RADIUS}px, ${Math.sin(angle) * reach * RADIUS}px)`;
      node.classList.toggle('as-stick-engaged', kind === 'aim' ? !look && vector.magnitude >= ATTACK_ZONE : vector.magnitude > 0);
    }

    // Movement and aim from both thumbs. Aim is either a direction or a screen point from a tap.
    snapshot(now) {
      const result = { moveX: 0, moveY: 0, sprint: false, sneak: false, attack: false, aim: null };
      if (!this.enabled) return result;
      const move = this.sticks.move, aim = this.sticks.aim;
      if (move) { const v = stickVector(move.x - move.ox, move.y - move.oy); result.moveX = v.x; result.moveY = v.y; }
      const moving = Math.hypot(result.moveX, result.moveY) > 0;
      result.sprint = this.toggles.sprint && moving; result.sneak = this.toggles.sneak;
      if (aim && !this.look) {
        const v = stickVector(aim.x - aim.ox, aim.y - aim.oy);
        if (v.magnitude > 0) { result.aim = { kind: 'direction', x: v.x / v.magnitude, y: v.y / v.magnitude }; result.attack = v.magnitude >= ATTACK_ZONE; }
      }
      if (!result.aim && this.strike) {
        if (now <= this.strike.until) { result.aim = { kind: 'screen', x: this.strike.x, y: this.strike.y }; result.attack = true; }
        else this.strike = null;
      }
      if (!result.aim && moving) { const length = Math.hypot(result.moveX, result.moveY); result.aim = { kind: 'direction', x: result.moveX / length, y: result.moveY / length }; }
      return result;
    }

    // Shows the touch layer during play, highlights Use when something is in reach and offers
    // Drive beside a car, since a nearby survivor or pet takes priority for Use (as it does for E).
    // In a car the vehicle panel's Exit and Refuel replace the on-foot buttons.
    update(playing, context) {
      const hidden = !this.enabled || !playing;
      if (this.layer.hidden !== hidden) this.layer.hidden = hidden;
      if (!playing && (this.sticks.move || this.sticks.aim || this.strike)) this.reset();
      const ready = !!(context && context.use), drive = !!(context && context.drive);
      if (this.nodes.use.classList.contains('as-touch-ready') !== ready) this.nodes.use.classList.toggle('as-touch-ready', ready);
      if (this.nodes.drive.hidden === drive) this.nodes.drive.hidden = !drive;
      const driving = !!(context && context.driving);
      if (this.layer.classList.contains('as-touch-driving') !== driving) this.layer.classList.toggle('as-touch-driving', driving);
    }

    status() {
      return { enabled: this.enabled, move: !!this.sticks.move, aim: !!this.sticks.aim, sprint: this.toggles.sprint, sneak: this.toggles.sneak, look: this.look };
    }

    destroy() { this.layer.removeEventListener('click', this.onClick); this.layer.remove(); }
  }

  Sirens.Touch = Touch;
}());
