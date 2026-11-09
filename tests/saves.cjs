const assert = require('node:assert/strict');
global.window = {};
for (const name of ['catalog', 'progression', 'settlement', 'personal', 'warfare', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine', 'saves']) require('../src/' + name + '.js');
const E = window.Sirens.Engine, Saves = window.Sirens.Saves;
const PRIMARY = Saves.PRIMARY_KEY, BACKUP = Saves.BACKUP_KEY;
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }
function memory(initial = {}) {
  const slots = new Map(Object.entries(initial));
  return { slots, fail: new Set(), getItem(key) { return slots.has(key) ? slots.get(key) : null; }, setItem(key, value) { if (this.fail.has(key)) throw new Error('Storage quota exceeded'); slots.set(key, value); } };
}
function limited(initial, limit) {
  const target = memory(initial);
  target.removed = [];
  target.setItem = function (key, value) {
    const bytes = Buffer.byteLength(value) + Array.from(this.slots).reduce((sum, [name, text]) => sum + (name === key ? 0 : Buffer.byteLength(text)), 0);
    if (bytes > limit) { const error = new Error('Storage quota exceeded'); error.name = 'QuotaExceededError'; throw error; }
    this.slots.set(key, value);
  };
  target.removeItem = function (key) { this.removed.push(key); this.slots.delete(key); };
  return target;
}
// Small, independent valid documents isolate quota accounting from engine size.
function sized(size, seed) { const prefix = JSON.stringify({ ended: false, seed, padding: '' }); return prefix.slice(0, -2) + 'x'.repeat(size - prefix.length) + prefix.slice(-2); }
function quotaDecode(text) { const state = JSON.parse(text); if (typeof state.ended !== 'boolean' || typeof state.seed !== 'number') throw new Error('Bad save'); return state; }
function snapshot(seed, mode = 'rescue') {
  const state = E.create(seed, 'calm', mode);
  return { state, data: E.serialize(state) };
}
const first = snapshot(110), second = snapshot(111), third = snapshot(112);

check('existing v1 and v2 raw saves continue without a format or key migration', () => {
  for (const original of [first, snapshot(113, 'openworld')]) {
    const storage = memory({ [PRIMARY]: original.data });
    const result = Saves.create(storage, E.deserialize).read();
    assert.equal(result.state.seed, original.state.seed);
    assert.equal(result.state.mode, original.state.mode);
    assert.equal(result.canContinue, true);
    assert.equal(result.recovered, false);
    assert.equal(storage.getItem(PRIMARY), original.data);
    assert.equal(storage.getItem(BACKUP), null);
  }
});

check('rotation preserves the previous generation and skips duplicate saves', () => {
  const storage = memory({ [PRIMARY]: first.data });
  const store = Saves.create(storage, E.deserialize);
  assert.equal(store.write(second.data).saved, true);
  assert.equal(storage.getItem(BACKUP), first.data);
  assert.equal(store.write(second.data).saved, true);
  assert.equal(storage.getItem(BACKUP), first.data, 'unchanged save replaced an older recovery point');
  assert.equal(store.write(third.data).backupSaved, true);
  assert.equal(storage.getItem(BACKUP), second.data);
  assert.equal(store.read().state.seed, third.state.seed);
});

check('semantic corruption recovers a validated backup without overwriting it', () => {
  const broken = JSON.parse(second.data);
  broken.state.player.inventory = { imaginary: 3 };
  const storage = memory({ [PRIMARY]: JSON.stringify(broken), [BACKUP]: first.data });
  const store = Saves.create(storage, E.deserialize), result = store.read();
  assert.equal(result.canContinue, true);
  assert.equal(result.recovered, true);
  assert.equal(result.state.seed, first.state.seed);
  assert(result.primaryError);
  assert.equal(result.error, null);
  assert.equal(store.write(third.data).saved, true);
  assert.equal(storage.getItem(BACKUP), first.data, 'invalid primary destroyed valid backup');
});

check('missing primary recovers a backup and empty storage has no Continue', () => {
  const recovered = Saves.create(memory({ [BACKUP]: first.data }), E.deserialize).read();
  assert.equal(recovered.canContinue, true);
  assert.equal(recovered.recovered, true);
  const empty = Saves.create(memory(), E.deserialize).read();
  assert.equal(empty.canContinue, false);
  assert.equal(empty.state, null);
  assert.equal(empty.error, null);
});

check('valid death or rescue records block resurrection from an older run', () => {
  for (const won of [false, true]) {
    const ended = E.deserialize(first.data);
    ended.ended = true; ended.won = won;
    if (!won) ended.player.health = 0;
    else { ended.goal.complete = true; ended.goal.active = true; ended.goal.parts = 5; }
    const storage = memory({ [PRIMARY]: E.serialize(ended), [BACKUP]: second.data });
    const result = Saves.create(storage, E.deserialize).read();
    assert.equal(result.canContinue, false);
    assert.equal(result.recovered, false);
    assert.equal(result.state.ended, true);
    assert.equal(result.state.won, won);
    assert.equal(result.state.seed, first.state.seed);
  }
});

check('primary quota failure preserves the current generation and completed backup', () => {
  const storage = memory({ [PRIMARY]: second.data, [BACKUP]: first.data });
  storage.fail.add(PRIMARY);
  const store = Saves.create(storage, E.deserialize), result = store.write(third.data);
  assert.equal(result.saved, false);
  assert.equal(result.backupSaved, true);
  assert(result.error);
  assert.equal(storage.getItem(PRIMARY), second.data);
  assert.equal(storage.getItem(BACKUP), second.data);
  assert.equal(store.read().state.seed, second.state.seed);
});

check('backup quota failure is distinct while a new primary can still save', () => {
  const storage = memory({ [PRIMARY]: second.data, [BACKUP]: first.data });
  storage.fail.add(BACKUP);
  const result = Saves.create(storage, E.deserialize).write(third.data);
  assert.equal(result.saved, true);
  assert.equal(result.backupSaved, false);
  assert.equal(result.error, null);
  assert(result.backupError);
  assert.equal(storage.getItem(PRIMARY), third.data);
  assert.equal(storage.getItem(BACKUP), first.data);
});

check('failed writes never evict the only good copy to free quota', () => {
  const storage = memory({ [PRIMARY]: '{broken', [BACKUP]: first.data });
  storage.fail.add(PRIMARY); storage.fail.add(BACKUP);
  const store = Saves.create(storage, E.deserialize), result = store.write(second.data);
  assert.equal(result.saved, false);
  assert.equal(storage.getItem(BACKUP), first.data);
  assert.equal(store.read().state.seed, first.state.seed);
});

check('untrusted invalid writes and two corrupt slots fail without mutations', () => {
  const storage = memory({ [PRIMARY]: first.data, [BACKUP]: second.data });
  const store = Saves.create(storage, E.deserialize);
  for (const invalid of ['', '{bad', '{"version":1,"state":{}}', 'null']) {
    assert.equal(store.write(invalid).saved, false);
    assert.equal(storage.getItem(PRIMARY), first.data);
    assert.equal(storage.getItem(BACKUP), second.data);
  }
  const corrupt = Saves.create(memory({ [PRIMARY]: '{bad', [BACKUP]: '{}' }), E.deserialize).read();
  assert.equal(corrupt.canContinue, false);
  assert.equal(corrupt.state, null);
  assert(corrupt.error);
});

check('denied storage, including a throwing localStorage getter, is reported safely', () => {
  const denied = () => { throw new Error('Storage access denied'); };
  for (const storage of [null, denied, { getItem: denied, setItem: denied }]) {
    const store = Saves.create(storage, E.deserialize);
    const read = store.read(), write = store.write(first.data);
    assert.equal(read.canContinue, false);
    assert(read.error);
    assert.equal(write.saved, false);
    assert(write.error);
  }
});

check('a primary read failure can recover a readable backup, while a valid primary ignores a bad backup', () => {
  const storage = memory({ [BACKUP]: first.data });
  const get = storage.getItem.bind(storage);
  storage.getItem = key => { if (key === PRIMARY) throw new Error('Primary slot unreadable'); return get(key); };
  const recovered = Saves.create(storage, E.deserialize).read();
  assert.equal(recovered.canContinue, true);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.state.seed, first.state.seed);
  assert(recovered.primaryError);
  const primary = Saves.create(memory({ [PRIMARY]: second.data, [BACKUP]: 'broken' }), E.deserialize).read();
  assert.equal(primary.canContinue, true);
  assert.equal(primary.recovered, false);
  assert.equal(primary.error, null);
  assert.equal(primary.state.seed, second.state.seed);
});

check('trusted engine autosaves avoid repeated hydration and never retain live state', () => {
  let hydrations = 0;
  const storage = memory({ [PRIMARY]: first.data });
  const store = Saves.create(storage, text => { hydrations++; return E.deserialize(text); });
  assert.equal(store.write(second.data, second.state).saved, true);
  assert.equal(hydrations, 1, 'existing legacy primary should be validated once');
  const live = E.deserialize(third.data);
  assert.equal(store.write(third.data, live).saved, true);
  assert.equal(hydrations, 1, 'each trusted save should not hydrate the world again');
  live.ended = true; live.player.health = 0;
  const restored = store.read();
  assert.equal(restored.state.ended, false);
  assert(restored.state.player.health > 0);
  restored.state.player.health = 1;
  assert(Saves.create(storage, E.deserialize).read().state.player.health > 1);
});

check('growing worlds can save when duplicate rotation consumes the remaining quota', () => {
  const old = sized(2500, 1), next = sized(2600, 2);
  const storage = limited({ [PRIMARY]: old }, 5000);
  const store = Saves.create(storage, quotaDecode), result = store.write(next);
  assert.equal(result.saved, true, 'a duplicate of the current primary must not lock future saves');
  assert.equal(result.backupSaved, false);
  assert(result.backupError, 'losing the duplicate recovery copy must be reported');
  assert.equal(result.error, null);
  assert.deepEqual(storage.removed, [BACKUP]);
  assert.equal(storage.getItem(PRIMARY), next);
  assert.equal(store.read().state.seed, 2);
});

check('quota fallback preserves an earlier distinct backup when it still fits', () => {
  const older = sized(2000, 0), old = sized(2500, 1), next = sized(2600, 2);
  const storage = limited({ [PRIMARY]: old, [BACKUP]: older }, 5000);
  const result = Saves.create(storage, quotaDecode).write(next);
  assert.equal(result.saved, true);
  assert.equal(result.backupSaved, true);
  assert(result.backupError, 'older fallback is available, but newest recovery generation was not retained');
  assert.equal(storage.getItem(PRIMARY), next);
  assert.equal(storage.getItem(BACKUP), older);
});

check('a world exceeding total quota retains its old primary and restores a valid backup', () => {
  const older = sized(2000, 0), old = sized(2500, 1), tooBig = sized(5100, 2);
  const storage = limited({ [PRIMARY]: old, [BACKUP]: older }, 5000);
  const result = Saves.create(storage, quotaDecode).write(tooBig);
  assert.equal(result.saved, false);
  assert(result.error);
  assert.equal(storage.getItem(PRIMARY), old);
  assert.equal(storage.getItem(BACKUP), older);
  assert.equal(Saves.create(storage, quotaDecode).read().state.seed, 1);
});

check('quota fallback never deletes the sole valid backup of a corrupt primary', () => {
  const backup = sized(2500, 1), next = sized(2600, 2);
  const storage = limited({ [PRIMARY]: 'corrupt', [BACKUP]: backup }, 5000);
  const result = Saves.create(storage, quotaDecode).write(next);
  assert.equal(result.saved, false);
  assert.deepEqual(storage.removed, []);
  assert.equal(storage.getItem(BACKUP), backup);
  assert.equal(Saves.create(storage, quotaDecode).read().state.seed, 1);
});

check('quota fallback refuses to remove a generation changed by another writer', () => {
  const old = sized(2500, 1), other = sized(2500, 3), next = sized(2600, 2);
  for (const changed of [PRIMARY, BACKUP]) {
    const storage = limited({ [PRIMARY]: old }, 5000), set = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
      try { set(key, value); }
      catch (error) { if (key === PRIMARY) storage.slots.set(changed, other); throw error; }
    };
    const result = Saves.create(storage, quotaDecode).write(next);
    assert.equal(result.saved, false);
    assert.deepEqual(storage.removed, [], changed + ' changed; removing the backup could destroy a unique generation');
    assert.equal(storage.getItem(changed), other);
  }
});

check('missing or denied removeItem retains the old primary on quota failure', () => {
  const old = sized(2500, 1), next = sized(2600, 2);
  for (const denied of [false, true]) {
    const storage = limited({ [PRIMARY]: old }, 5000);
    if (denied) storage.removeItem = () => { throw new Error('Removal blocked'); };
    else delete storage.removeItem;
    const result = Saves.create(storage, quotaDecode).write(next);
    assert.equal(result.saved, false);
    assert.equal(storage.getItem(PRIMARY), old);
    assert.equal(storage.getItem(BACKUP), old);
  }
});

console.log('Completed ' + checks + ' save recovery checks.');
