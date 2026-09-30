(function () {
  'use strict';
  const S = window.Sirens;
  const HELP = '/help · /players · /save · /time 0-23.99 · /weather clear|overcast|rain · /difficulty calm|standard|hard · /give [me] item_id [1-100] · /heal [me] · /tp [me] global_tile_x global_tile_y · /where · /items [search]';
  function result(ok, message) { return { ok: ok, message: message }; }
  function tokenize(text) {
    if (typeof text !== 'string' || text.length > 280 || /[\u0000-\u001f\u007f]/.test(text)) return null;
    const parts = text.trim().match(/"[^"\r\n]*"|\S+/g) || [];
    if (parts.some(p => p.startsWith('"') !== p.endsWith('"') || !p.startsWith('"') && p.includes('"'))) return null;
    return parts.map(p => p.startsWith('"') ? p.slice(1, -1) : p);
  }
  function execute(state, text, callbacks) {
    callbacks = callbacks || {};
    if (!state || !state.player || state.networked) return result(false, 'Multiplayer commands must be sent to the world host.');
    const args = tokenize(text);
    if (!args || !args.length || args[0][0] !== '/') return result(false, 'Use /help to see singleplayer commands.');
    const name = args.shift().slice(1).toLowerCase(), E = S.Engine, p = state.player;
    const usage = message => result(false, 'Usage: ' + message);
    if (name === 'help') return args.length ? usage('/help') : result(true, HELP);
    if (name === 'players') return args.length ? usage('/players') : result(true, 'Singleplayer: you are the world owner.');
    if (name === 'where') {
      if (args.length) return usage('/where');
      const ox = state.world ? state.world.originX : 0, oy = state.world ? state.world.originY : 0;
      return result(true, 'Global tile ' + (ox + Math.floor(p.x / 32)) + ', ' + (oy + Math.floor(p.y / 32)) + ' · floor ' + (state.stories && state.stories.floor || 0));
    }
    if (name === 'items') {
      if (args.length > 1) return usage('/items [search]');
      const search = (args[0] || '').toLowerCase();
      const ids = Object.keys(S.Catalog.items).filter(id => id.includes(search) || S.Catalog.items[id].name.toLowerCase().includes(search));
      return result(true, ids.length ? ids.slice(0, 18).join(', ') + (ids.length > 18 ? ' · ' + (ids.length - 18) + ' more; refine your search.' : '') : 'No matching item IDs.');
    }
    if (name === 'save') {
      if (args.length) return usage('/save');
      return callbacks.save && callbacks.save() ? result(true, 'Run saved in this browser.') : result(false, 'Save unavailable. Export a backup from the pause menu.');
    }
    if (name === 'time') {
      if (args.length !== 1 || !/^\d{1,2}(?:\.\d{1,3})?$/.test(args[0]) || Number(args[0]) >= 24) return usage('/time 0-23.99');
      state.time = Number(args[0]); return result(true, 'World time set to ' + state.time.toFixed(2) + '.');
    }
    if (name === 'weather') {
      if (args.length !== 1 || !['clear', 'overcast', 'rain'].includes(args[0])) return usage('/weather clear|overcast|rain');
      state.weather = args[0];
      if (state.progression && state.progression.event.kind === 'rain') { state.progression.event.previousWeather = args[0]; state.progression.event.kind = 'none'; state.progression.event.until = state.elapsed; }
      return result(true, 'Weather set to ' + args[0] + '.');
    }
    if (name === 'difficulty') {
      if (args.length !== 1 || !['calm', 'standard', 'hard'].includes(args[0])) return usage('/difficulty calm|standard|hard');
      state.difficulty = args[0]; if (state.world) state.world.difficulty = args[0]; if (state.stories) state.stories.difficulty = args[0]; return result(true, 'Survival pressure set to ' + args[0] + '.');
    }
    if (name === 'give') {
      if (args[0] === 'me') args.shift();
      if (args.length < 1 || args.length > 2 || !Object.prototype.hasOwnProperty.call(S.Catalog.items, args[0]) || args.length === 2 && !/^\d{1,3}$/.test(args[1])) return usage('/give [me] item_id [1-100]');
      const id = args[0], count = args.length === 1 ? 1 : Number(args[1]), old = p.inventory[id] || 0;
      if (count < 1 || count > 100 || old + count > 1000) return result(false, 'Choose 1 to 100 items, within the 1,000-item stack limit.');
      const weight = E.inventoryWeight(p.inventory) + S.Catalog.items[id].weight * count;
      if (weight > E.carryCapacity(state) + 0.000001) return result(false, 'Your pack cannot carry that quantity. Nothing was added.');
      p.inventory[id] = old + count; return result(true, 'Added ' + count + ' × ' + S.Catalog.items[id].name + ' to your pack.');
    }
    if (name === 'heal') {
      if (args.length > 1 || args.length === 1 && args[0] !== 'me') return usage('/heal [me]');
      if (p.health <= 0 || state.ended) return result(false, 'Start a new run after this survivor has fallen.');
      p.health = 100; p.stamina = 100; p.hunger = 0; p.thirst = 0; p.bleeding = 0; p.infection = 0; p.resting = false;
      if (state.progression) { state.progression.fatigue = 0; state.progression.sleeping = false; }
      return result(true, 'Health and needs restored.');
    }
    if (name === 'tp' || name === 'teleport') {
      if (args[0] === 'me') args.shift();
      if (args.length !== 2 || !args.every(n => /^-?\d{1,5}$/.test(n))) return usage('/tp [me] global_tile_x global_tile_y');
      if (p.vehicleId || state.stories && state.stories.floor) return result(false, 'Leave your car and return to the ground floor first.');
      const ox = state.world ? state.world.originX : 0, oy = state.world ? state.world.originY : 0;
      const tx = Number(args[0]) - ox, ty = Number(args[1]) - oy;
      if (tx < 1 || ty < 1 || tx >= state.width - 1 || ty >= state.height - 1 || E.isSolid(state, tx, ty)) return result(false, 'Choose a clear ground tile inside the currently loaded region. Use /where for your coordinates.');
      p.x = (tx + .5) * 32; p.y = (ty + .5) * 32; p.resting = false; state.conversation = null;
      return result(true, 'Moved to global tile ' + args.join(', ') + '.');
    }
    if (['kick', 'ban', 'unban', 'bans', 'announce'].includes(name)) return result(false, 'That command manages multiplayer players. You own this singleplayer run.');
    return result(false, 'Unknown command. Use /help to see available commands.');
  }
  S.Commands = Object.freeze({ execute: execute, help: HELP });
})();
