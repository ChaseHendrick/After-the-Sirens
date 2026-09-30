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
  const channels = {
    effects: { enabled: true, volume: 1 },
    ambience: { enabled: true, volume: .7 },
    music: { enabled: true, volume: .35 }
  };
  const musicVoices = new Set();
  let musicNext = 0, musicStep = 0, musicTheme = '', musicNotes = 0;
  const musicThemes = Object.freeze({
    dawn: { name: 'Morrow at Dawn', beat: .9, chords: [[50, 57, 65], [46, 53, 62], [48, 55, 64], [45, 52, 60]], melody: [74, 77, 76, 69, 72, 74, 77, 81] },
    night: { name: 'Empty Streets', beat: 1.05, chords: [[45, 52, 60], [43, 50, 59], [41, 48, 57], [40, 47, 55]], melody: [69, 72, 71, 67, 64, 69, 67, 64] },
    danger: { name: 'Under the Sirens', beat: .68, chords: [[38, 45, 53], [39, 46, 54], [38, 45, 53], [41, 48, 56]], melody: [74, 75, 69, 70, 74, 77, 75, 69] },
    road: { name: 'The Road Beyond', beat: .82, chords: [[48, 55, 64], [50, 57, 65], [45, 52, 60], [43, 50, 59]], melody: [72, 76, 79, 77, 74, 72, 69, 67] }
  });
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
        for (const layer of Object.values(channels)) {
          layer.gain = context.createGain(); layer.gain.gain.value = layer.enabled ? layer.volume : 0;
          layer.analyser = context.createAnalyser(); layer.analyser.fftSize = 256;
          layer.samples = new Float32Array(256);
          layer.gain.connect(layer.analyser); layer.analyser.connect(master);
        }
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
    if (!enabled) { stopLoops(); stopMusic(); }
  }
  function setVolume(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    volume = Math.max(0, Math.min(1, value)); setEnabled(enabled);
  }
  function setChannel(name, on, value) {
    const layer = Object.prototype.hasOwnProperty.call(channels, name) && channels[name];
    if (!layer) return;
    if (typeof on === 'boolean') layer.enabled = on;
    if (typeof value === 'number' && Number.isFinite(value)) layer.volume = Math.max(0, Math.min(1, value));
    if (layer.gain) {
      layer.gain.gain.cancelScheduledValues(context.currentTime);
      layer.gain.gain.setTargetAtTime(layer.enabled ? layer.volume : 0, context.currentTime, .01);
    }
    if (name === 'music' && (!layer.enabled || !layer.volume)) stopMusic();
    if (!channels.effects.enabled && !channels.ambience.enabled) stopLoops();
  }
  function stopMusic() {
    for (const source of musicVoices) { try { source.stop(); } catch (_) {} }
    musicVoices.clear(); musicNext = 0;
  }
  function musicVoice(note, duration, strength) {
    if (musicVoices.size >= 12) return;
    const now = context.currentTime + .01, source = context.createOscillator(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.type = 'triangle'; source.frequency.value = 440 * 2 ** ((note - 69) / 12);
    filter.type = 'lowpass'; filter.frequency.value = note < 65 ? 800 : 1600;
    gain.gain.setValueAtTime(.0001, now); gain.gain.linearRampToValueAtTime(strength, now + .12);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    source.connect(filter); filter.connect(gain); gain.connect(channels.music.gain); musicVoices.add(source);
    source.onended = function () { musicVoices.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now); source.stop(now + duration + .02); musicNotes++;
  }
  function updateMusic(s) {
    if (!channels.music.enabled || !channels.music.volume) { stopMusic(); return; }
    const now = context.currentTime;
    if (musicNext && now < musicNext) return;
    // Schedule only the current beat. Background throttling never queues missed music.
    const danger = (s.zombies || []).some(z => z.health > 0 && Math.hypot(z.x - s.player.x, z.y - s.player.y) < 210);
    const key = danger ? 'danger' : s.player.vehicleId ? 'road' : s.time < 6 || s.time >= 19 ? 'night' : 'dawn';
    const theme = musicThemes[key];
    if (musicTheme !== key) { stopMusic(); musicTheme = key; musicStep = 0; }
    if (musicStep % 4 === 0) {
      const chord = theme.chords[Math.floor(musicStep / 4) % theme.chords.length];
      for (const note of chord) musicVoice(note, theme.beat * 3.8, .07);
    }
    if (musicStep % 2 === 0) musicVoice(theme.melody[Math.floor(musicStep / 2) % theme.melody.length], theme.beat * 1.8, .095);
    musicStep = (musicStep + 1) % 32; musicNext = now + theme.beat;
  }
  function stopLoops() {
    if (!loops) return;
    for (const v of loops) { try { v.source.stop(); } catch (_) {} v.source.disconnect(); v.filter.disconnect(); v.gain.disconnect(); }
    loops = null;
  }
  function suspendAudio() {
    active = false; stopLoops(); stopMusic();
    for (const source of voices) { try { source.stop(); } catch (_) {} }
    voices.clear();
    if (lastState) drain(lastState);
  }
  function voice(options) {
    const layer = channels[options.channel || 'effects'];
    if (!enabled || !layer || !layer.enabled || !layer.volume || !context || context.state !== 'running' || voices.size >= MAX_VOICES) return;
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
    source.connect(filter); filter.connect(gain); gain.connect(layer.gain); voices.add(source);
    source.onended = function () { voices.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now); source.stop(now + duration + .02);
  }
  function play(event) {
    const channel = ['bird', 'nightLife'].includes(event.type) ? 'ambience' : 'effects';
    if (!enabled || !channels[channel].enabled || !channels[channel].volume || !context || context.state !== 'running') return;
    const sound = options => voice(Object.assign({ channel }, options));
    played[event.type] = (played[event.type] || 0) + 1;
    switch (event.type) {
      case 'swing':
        sound({ noise: true, filter: 'bandpass', cutoff: /knife|dagger/.test(event.weapon) ? 2300 : 1100, duration: .18, gain: .13 }); break;
      case 'shot':
        sound({ noise: true, cutoff: 5200, duration: /shotgun/.test(event.weapon) ? .34 : .21, gain: .5 });
        sound({ frequency: 110, end: 28, duration: .2, gain: .3, wave: 'triangle' }); break;
      case 'impact':
        sound({ frequency: 150, end: 42, duration: .14, gain: .2, wave: 'triangle', delay: .045 });
        sound({ noise: true, cutoff: 1200, duration: .1, gain: .12, delay: .045 }); break;
      case 'wood': case 'stone':
        sound({ noise: true, cutoff: event.type === 'wood' ? 1500 : 3500, duration: event.broken ? .3 : .12, gain: .25, delay: .04 });
        sound({ frequency: event.type === 'wood' ? 210 : 75, end: 40, duration: .14, gain: .17, delay: .04 }); break;
      case 'glass':
        sound({ noise: true, filter: 'highpass', cutoff: 3300, duration: event.broken ? .55 : .12, gain: .22, delay: .04 });
        [2100, 3300, 4700].forEach((frequency, i) => sound({ frequency, end: frequency * .85, duration: .24, gain: .025, delay: .05 + i * .028 })); break;
      case 'step':
        sound({ noise: true, cutoff: [1, 2, 7].includes(event.surface) ? 700 : 1600, duration: .075, gain: event.quiet ? .025 : .085 });
        sound({ frequency: 95, end: 50, duration: .07, gain: event.quiet ? .015 : .055 }); break;
      case 'door': case 'vehicle':
        sound({ noise: true, cutoff: 750, duration: .15, gain: .15 });
        sound({ wave: 'triangle', frequency: 220, end: 65, duration: .18, gain: .1 }); break;
      case 'reload':
        sound({ noise: true, filter: 'highpass', cutoff: 1700, duration: .055, gain: .18 });
        sound({ noise: true, cutoff: 1900, duration: .09, gain: .19, delay: .25 }); break;
      case 'loot': case 'climb':
        sound({ noise: true, filter: 'bandpass', cutoff: 1700, duration: .28, gain: .12 }); break;
      case 'hurt':
        sound({ frequency: 100, end: 35, wave: 'sawtooth', cutoff: 450, duration: .22, gain: .12 }); break;
      case 'growl':
        sound({ frequency: 62, end: 43, wave: 'sawtooth', cutoff: 330, duration: .65, gain: .09 });
        sound({ noise: true, filter: 'bandpass', cutoff: 260, duration: .7, gain: .06 }); break;
      case 'bird':
        sound({ frequency: 1850, end: 2900, wave: 'sine', duration: .09, gain: .025 });
        sound({ frequency: 2500, end: 1650, wave: 'sine', duration: .13, gain: .021, delay: .15 }); break;
      case 'nightLife':
        for (let i = 0; i < 3; i++) sound({ frequency: 3700, end: 3450, wave: 'triangle', duration: .055, gain: .012, delay: i * .11 }); break;
      case 'petDog':
        sound({ frequency: 220, end: 108, wave: 'sawtooth', cutoff: 900, duration: .13, gain: .12 });
        sound({ frequency: 170, end: 92, wave: 'sawtooth', cutoff: 750, duration: .11, gain: .09, delay: .17 });
        sound({ noise: true, filter: 'bandpass', cutoff: 450, duration: .1, gain: .035 }); break;
      case 'petCat':
        sound({ frequency: 720, end: 1050, wave: 'triangle', cutoff: 2100, duration: .14, gain: .065 });
        sound({ frequency: 1050, end: 540, wave: 'triangle', cutoff: 1700, duration: .23, gain: .06, delay: .12 }); break;
      default: sound({ frequency: 440, end: 260, duration: .08, gain: .035 });
    }
  }
  function startLoops() {
    if (loops || !context || context.state !== 'running' || !channels.effects.enabled && !channels.ambience.enabled) return;
    loops = [false, true].map(engine => {
      const source = engine ? context.createOscillator() : context.createBufferSource();
      if (engine) { source.type = 'sawtooth'; source.frequency.value = 35; } else { source.buffer = noiseBuffer; source.loop = true; }
      const filter = context.createBiquadFilter(), gain = context.createGain();
      filter.type = 'lowpass'; filter.frequency.value = engine ? 500 : 750; gain.gain.value = 0;
      source.connect(filter); filter.connect(gain); gain.connect(channels[engine ? 'effects' : 'ambience'].gain); source.start();
      return { source, filter, gain };
    });
  }
  function updateAudio(s, playing, visible) {
    const events = drain(s);
    active = !!playing && visible !== false;
    if (lastState !== s) { stopLoops(); stopMusic(); musicTheme = ''; lastState = s; lastGrowl = s.elapsed; lastWildlife = s.elapsed; }
    if (visible !== false) events.forEach(play);
    if (!active || !enabled || !context || context.state !== 'running') { stopLoops(); stopMusic(); return; }
    updateMusic(s);
    startLoops();
    const rain = /rain|storm/.test(typeof s.weather === 'string' ? s.weather : (s.weather || {}).type);
    const now = context.currentTime, car = (s.vehicles || []).find(v => v.id === s.player.vehicleId);
    if (loops) {
      loops[0].gain.gain.setTargetAtTime(rain ? .055 : .012, now, .2);
      loops[0].filter.frequency.setTargetAtTime(rain ? 2600 : 650, now, .2);
    }
    const outdoors = s.tiles[Math.floor(s.player.y / s.tileSize) * s.width + Math.floor(s.player.x / s.tileSize)] !== 2;
    if (outdoors && !car && !rain && s.elapsed - lastWildlife > 16 && !(s.zombies || []).some(z => z.health > 0 && Math.hypot(z.x - s.player.x, z.y - s.player.y) < 180)) {
      play({ type: s.time >= 6 && s.time < 19 ? 'bird' : 'nightLife' }); lastWildlife = s.elapsed;
    }
    const running = car && car.fuel > 0 && car.condition > 0;
    if (loops) {
      loops[1].gain.gain.setTargetAtTime(running ? .04 + Math.abs(car.speed) / 4000 : 0, now, .06);
      if (running) loops[1].source.frequency.setTargetAtTime(35 + Math.abs(car.speed) * .48, now, .06);
    }
    if (s.elapsed - lastGrowl > 4.5 && (s.zombies || []).some(z => z.health > 0 && Math.hypot(z.x - s.player.x, z.y - s.player.y) < 240)) {
      play({ type: 'growl' }); lastGrowl = s.elapsed;
    }
  }
  function metrics() {
    let peak = 0;
    if (analyser) { const data = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data); for (const v of data) peak = Math.max(peak, Math.abs(v)); }
    const layers = {};
    for (const [name, layer] of Object.entries(channels)) {
      let channelPeak = 0;
      if (layer.analyser) { layer.analyser.getFloatTimeDomainData(layer.samples); for (const value of layer.samples) channelPeak = Math.max(channelPeak, Math.abs(value)); }
      layers[name] = { enabled: layer.enabled, volume: layer.volume, peak: channelPeak };
    }
    return { enabled, volume, active, context: context ? context.state : 'locked', voices: voices.size, loops: loops ? loops.length : 0, peak, played: Object.assign({}, played), channels: layers,
      music: { theme: musicThemes[musicTheme] && musicThemes[musicTheme].name || '', voices: musicVoices.size, notes: musicNotes } };
  }
  Sirens.Effects = Object.freeze({ emit, drain, attack, walk, pose, transfer, advance, audio: Object.freeze({ unlock, setEnabled, setVolume, setChannel, suspend: suspendAudio, update: updateAudio, metrics }) });
})();
