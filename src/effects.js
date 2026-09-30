(function () {
  'use strict';
  const Sirens = window.Sirens = window.Sirens || {};
  // Presentation is transient, separate from saves and the simulation RNG.
  const runs = new WeakMap();
  function record(s) {
    let r = runs.get(s);
    if (!r) { r = { events: [], attack: null, stride: 0, step: 0 }; runs.set(s, r); }
    return r;
  }
  function emit(s, type, detail) {
    const events = record(s).events;
    events.push(Object.assign({ type }, detail || {}));
    if (events.length > 64) events.shift();
  }
  function drain(s) { return record(s).events.splice(0); }
  function attack(s, weapon, kind, duration, angle) {
    record(s).attack = { weapon, kind, duration: Math.min(.42, duration * .85), start: record(s).clock === undefined ? s.elapsed : record(s).clock, angle };
    emit(s, kind === 'melee' ? 'swing' : 'shot', { weapon });
  }
  function walk(s, distance, sprint, sneak) {
    if (!(distance > 0)) return;
    const r = record(s); r.stride += distance / 26 * Math.PI; r.step += distance; r.lastWalk = r.clock === undefined ? s.elapsed : r.clock;
    if (r.step >= (sprint ? 31 : 26)) {
      r.step %= sprint ? 31 : 26;
      const tx = Math.floor(s.player.x / s.tileSize), ty = Math.floor(s.player.y / s.tileSize);
      emit(s, 'step', { surface: s.tiles[ty * s.width + tx], quiet: !!sneak });
    }
  }
  function pose(s) {
    const r = record(s), a = r.attack, now = r.clock === undefined ? s.elapsed : r.clock;
    const progress = a ? Math.max(0, (now - a.start) / a.duration) : 1;
    return { stride: now - r.lastWalk < .06 ? r.stride : 0, attack: a && progress < 1 ? Object.assign({ progress }, a) : null };
  }

  function transfer(from, to) {
    const r = record(from); r.clock = to.elapsed; runs.set(to, r);
    if (lastState === from) lastState = to;
  }
  function advance(s, dt) { const r = record(s); r.clock = (r.clock === undefined ? s.elapsed : r.clock) + Math.max(0, Math.min(.1, dt)); }

  let context = null, master = null, compressor = null, analyser = null, noiseBuffer = null;
  let enabled = true, volume = .7, active = false, loops = null, lastState = null, lastGrowl = -10, lastWildlife = -20;
  const voices = new Set(), played = {}, MAX_VOICES = 40;
  function unlock() {
    if (!enabled) return;
    try {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        context = new Audio(); master = context.createGain(); master.gain.value = .48 * volume;
        compressor = context.createDynamicsCompressor(); analyser = context.createAnalyser(); analyser.fftSize = 256;
        master.connect(compressor); compressor.connect(analyser); analyser.connect(context.destination);
        noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
        const samples = noiseBuffer.getChannelData(0); let n = 0x5a17c9;
        for (let i = 0; i < samples.length; i++) { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; samples[i] = (n >>> 0) / 2147483648 - 1; }
      }
      if (context.state === 'suspended') context.resume().catch(function () {});
    } catch (_) { /* Audio is optional; unavailable devices never stop play. */ }
  }
  function setEnabled(on) {
    enabled = !!on;
    if (master) { master.gain.cancelScheduledValues(context.currentTime); master.gain.setTargetAtTime(enabled ? .48 * volume : 0, context.currentTime, .01); }
    if (!enabled) stopLoops();
  }
  function setVolume(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    volume = Math.max(0, Math.min(1, value)); setEnabled(enabled);
  }
  function stopLoops() {
    if (!loops) return;
    for (const v of loops) { try { v.source.stop(); } catch (_) {} v.source.disconnect(); v.filter.disconnect(); v.gain.disconnect(); }
    loops = null;
  }
  function voice(options) {
    if (!enabled || !context || context.state !== 'running' || voices.size >= MAX_VOICES) return;
    const now = context.currentTime + (options.delay || 0), duration = options.duration || .12;
    const source = options.noise ? context.createBufferSource() : context.createOscillator();
    const filter = context.createBiquadFilter(), gain = context.createGain();
    if (options.noise) source.buffer = noiseBuffer;
    else {
      source.type = options.wave || 'sine'; source.frequency.setValueAtTime(options.frequency || 130, now);
      source.frequency.exponentialRampToValueAtTime(Math.max(12, options.end || options.frequency || 130), now + duration);
    }
    filter.type = options.filter || 'lowpass'; filter.frequency.value = options.cutoff || 2500; filter.Q.value = options.q || .7;
    gain.gain.setValueAtTime(.0001, now); gain.gain.linearRampToValueAtTime(options.gain || .1, now + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    source.connect(filter); filter.connect(gain); gain.connect(master); voices.add(source);
    source.onended = function () { voices.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now); source.stop(now + duration + .02);
  }
  function play(event) {
    if (!enabled || !context || context.state !== 'running') return;
    played[event.type] = (played[event.type] || 0) + 1;
    switch (event.type) {
      case 'swing':
        voice({ noise: true, filter: 'bandpass', cutoff: /knife|dagger/.test(event.weapon) ? 2300 : 1100, duration: .18, gain: .13 }); break;
      case 'shot':
        voice({ noise: true, cutoff: 5200, duration: /shotgun/.test(event.weapon) ? .34 : .21, gain: .5 });
        voice({ frequency: 110, end: 28, duration: .2, gain: .3, wave: 'triangle' }); break;
      case 'impact':
        voice({ frequency: 150, end: 42, duration: .14, gain: .2, wave: 'triangle', delay: .045 });
        voice({ noise: true, cutoff: 1200, duration: .1, gain: .12, delay: .045 }); break;
      case 'wood': case 'stone':
        voice({ noise: true, cutoff: event.type === 'wood' ? 1500 : 3500, duration: event.broken ? .3 : .12, gain: .25, delay: .04 });
        voice({ frequency: event.type === 'wood' ? 210 : 75, end: 40, duration: .14, gain: .17, delay: .04 }); break;
      case 'glass':
        voice({ noise: true, filter: 'highpass', cutoff: 3300, duration: event.broken ? .55 : .12, gain: .22, delay: .04 });
        [2100, 3300, 4700].forEach((frequency, i) => voice({ frequency, end: frequency * .85, duration: .24, gain: .025, delay: .05 + i * .028 })); break;
      case 'step':
        voice({ noise: true, cutoff: [1, 2, 7].includes(event.surface) ? 700 : 1600, duration: .075, gain: event.quiet ? .025 : .085 });
        voice({ frequency: 95, end: 50, duration: .07, gain: event.quiet ? .015 : .055 }); break;
      case 'door': case 'vehicle':
        voice({ noise: true, cutoff: 750, duration: .15, gain: .15 });
        voice({ wave: 'triangle', frequency: 220, end: 65, duration: .18, gain: .1 }); break;
      case 'reload':
        voice({ noise: true, filter: 'highpass', cutoff: 1700, duration: .055, gain: .18 });
        voice({ noise: true, cutoff: 1900, duration: .09, gain: .19, delay: .25 }); break;
      case 'loot': case 'climb':
        voice({ noise: true, filter: 'bandpass', cutoff: 1700, duration: .28, gain: .12 }); break;
      case 'hurt':
        voice({ frequency: 100, end: 35, wave: 'sawtooth', cutoff: 450, duration: .22, gain: .12 }); break;
      case 'growl':
        voice({ frequency: 62, end: 43, wave: 'sawtooth', cutoff: 330, duration: .65, gain: .09 });
        voice({ noise: true, filter: 'bandpass', cutoff: 260, duration: .7, gain: .06 }); break;
      case 'bird':
        voice({ frequency: 1850, end: 2900, wave: 'sine', duration: .09, gain: .025 });
        voice({ frequency: 2500, end: 1650, wave: 'sine', duration: .13, gain: .021, delay: .15 }); break;
      case 'nightLife':
        for (let i = 0; i < 3; i++) voice({ frequency: 3700, end: 3450, wave: 'triangle', duration: .055, gain: .012, delay: i * .11 }); break;
      case 'petDog':
        voice({ frequency: 220, end: 108, wave: 'sawtooth', cutoff: 900, duration: .13, gain: .12 });
        voice({ frequency: 170, end: 92, wave: 'sawtooth', cutoff: 750, duration: .11, gain: .09, delay: .17 });
        voice({ noise: true, filter: 'bandpass', cutoff: 450, duration: .1, gain: .035 }); break;
      case 'petCat':
        voice({ frequency: 720, end: 1050, wave: 'triangle', cutoff: 2100, duration: .14, gain: .065 });
        voice({ frequency: 1050, end: 540, wave: 'triangle', cutoff: 1700, duration: .23, gain: .06, delay: .12 }); break;
      default: voice({ frequency: 440, end: 260, duration: .08, gain: .035 });
    }
  }
  function startLoops() {
    if (loops || !context || context.state !== 'running') return;
    loops = [false, true].map(engine => {
      const source = engine ? context.createOscillator() : context.createBufferSource();
      if (engine) { source.type = 'sawtooth'; source.frequency.value = 35; } else { source.buffer = noiseBuffer; source.loop = true; }
      const filter = context.createBiquadFilter(), gain = context.createGain();
      filter.type = 'lowpass'; filter.frequency.value = engine ? 500 : 750; gain.gain.value = 0;
      source.connect(filter); filter.connect(gain); gain.connect(master); source.start();
      return { source, filter, gain };
    });
  }
  function updateAudio(s, playing) {
    const events = drain(s);
    active = !!playing;
    if (lastState !== s) { stopLoops(); lastState = s; lastGrowl = s.elapsed; lastWildlife = s.elapsed; }
    events.forEach(play);
    if (!active || !enabled || !context || context.state !== 'running') { stopLoops(); return; }
    startLoops();
    const rain = /rain|storm/.test(typeof s.weather === 'string' ? s.weather : (s.weather || {}).type);
    const now = context.currentTime, car = (s.vehicles || []).find(v => v.id === s.player.vehicleId);
    loops[0].gain.gain.setTargetAtTime(rain ? .055 : .012, now, .2);
    loops[0].filter.frequency.setTargetAtTime(rain ? 2600 : 650, now, .2);
    const outdoors = s.tiles[Math.floor(s.player.y / s.tileSize) * s.width + Math.floor(s.player.x / s.tileSize)] !== 2;
    if (outdoors && !car && !rain && s.elapsed - lastWildlife > 16 && !(s.zombies || []).some(z => z.health > 0 && Math.hypot(z.x - s.player.x, z.y - s.player.y) < 180)) {
      play({ type: s.time >= 6 && s.time < 19 ? 'bird' : 'nightLife' }); lastWildlife = s.elapsed;
    }
    const running = car && car.fuel > 0 && car.condition > 0;
    loops[1].gain.gain.setTargetAtTime(running ? .04 + Math.abs(car.speed) / 4000 : 0, now, .06);
    if (running) loops[1].source.frequency.setTargetAtTime(35 + Math.abs(car.speed) * .48, now, .06);
    if (s.elapsed - lastGrowl > 4.5 && (s.zombies || []).some(z => z.health > 0 && Math.hypot(z.x - s.player.x, z.y - s.player.y) < 240)) {
      play({ type: 'growl' }); lastGrowl = s.elapsed;
    }
  }
  function metrics() {
    let peak = 0;
    if (analyser) { const data = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data); for (const v of data) peak = Math.max(peak, Math.abs(v)); }
    return { enabled, volume, active, context: context ? context.state : 'locked', voices: voices.size, loops: loops ? loops.length : 0, peak, played: Object.assign({}, played) };
  }
  Sirens.Effects = Object.freeze({ emit, drain, attack, walk, pose, transfer, advance, audio: Object.freeze({ unlock, setEnabled, setVolume, update: updateAudio, metrics }) });
})();
