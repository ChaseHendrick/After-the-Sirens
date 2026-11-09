(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  // No requests, identifiers or persistent analytics state. An embedded game may
  // report a small vocabulary to its own origin; standalone/offline play is silent.
  const values = Object.freeze({
    mode: ['openworld', 'rescue'], difficulty: ['calm', 'standard', 'hard'],
    view: ['top', 'first'], language: ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'id', 'es', 'pt-BR'],
    outcome: ['dead', 'rescued']
  });
  const fields = Object.freeze({
    run_started: ['mode', 'difficulty', 'view'], run_continued: ['mode', 'difficulty', 'view'],
    play_60s: ['mode', 'difficulty', 'view'], play_300s: ['mode', 'difficulty', 'view'],
    run_ended: ['mode', 'difficulty', 'outcome'], view_changed: ['view'], guide_language: ['language']
  });
  function packet(event, properties) {
    if (!Object.prototype.hasOwnProperty.call(fields, event) || !properties || typeof properties !== 'object' || Array.isArray(properties)) return null;
    const keys = fields[event];
    if (Object.keys(properties).length !== keys.length || !keys.every(function (key) { return Object.prototype.hasOwnProperty.call(properties, key) && values[key].includes(properties[key]); })) return null;
    const safe = {};
    for (const key of keys) safe[key] = properties[key];
    return { type: 'sirens:milestone', version: 1, event: event, properties: safe };
  }
  function create(host) {
    let sent = 0, playing = false, seconds = 0, sixty = false, fiveMinutes = false, context = null;
    const once = new Set();
    function emit(event, properties) {
      const message = packet(event, properties);
      if (!message || sent >= 120 || !host || !host.location || !/^https?:$/.test(host.location.protocol)) return false;
      sent++;
      try {
        // A host-owned adapter can observe direct-page play. Nothing here loads an
        // analytics service; downloaded builds remain self-contained.
        if (typeof host.dispatchEvent === 'function' && typeof host.CustomEvent === 'function') host.dispatchEvent(new host.CustomEvent('sirens:milestone', { detail: message }));
      } catch (_) {}
      try {
        if (host.parent && host.parent !== host && host.parent.location.origin === host.location.origin) host.parent.postMessage(message, host.location.origin);
      } catch (_) {}
      return true;
    }
    return {
      start: function (state, view, continued) {
        context = { mode: state.mode, difficulty: state.difficulty, view: view };
        playing = true; seconds = 0; sixty = false; fiveMinutes = false;
        emit(continued ? 'run_continued' : 'run_started', context);
      },
      advance: function (elapsed, eligible) {
        // A throttled/background frame cannot manufacture minutes of engagement.
        if (!playing || !eligible || !Number.isFinite(elapsed) || elapsed <= 0 || elapsed > .25) return;
        seconds += elapsed;
        if (!sixty && seconds >= 60) { sixty = true; emit('play_60s', context); }
        if (!fiveMinutes && seconds >= 300) { fiveMinutes = true; emit('play_300s', context); }
      },
      end: function (state) {
        if (!playing) return;
        playing = false;
        emit('run_ended', { mode: context.mode, difficulty: context.difficulty, outcome: state.won && state.player.health > 0 ? 'rescued' : 'dead' });
      },
      stop: function () { playing = false; },
      view: function (view) {
        if (!playing || !values.view.includes(view) || context.view === view) return;
        context.view = view;
        if (!once.has('view:' + view)) { once.add('view:' + view); emit('view_changed', { view: view }); }
      },
      language: function (language) {
        if (!values.language.includes(language) || once.has('language:' + language)) return;
        once.add('language:' + language); emit('guide_language', { language: language });
      }
    };
  }
  S.Signals = { packet: packet, create: create };
})();
