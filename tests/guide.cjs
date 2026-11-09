'use strict';
const assert = require('node:assert/strict');
global.window = {};
require('../src/guide.js');
const G = window.Sirens.Guide;
let passed = 0;
function check(name, test) { test(); passed++; console.log('PASS ' + name); }

check('language matching respects Chinese script before regional variants', () => {
  for (const locale of ['zh', 'zh-CN', 'zh-SG', 'zh_Hans_CN', 'zh-Hans-TW']) assert.equal(G.resolve(locale), 'zh-Hans', locale);
  for (const locale of ['zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant', 'zh-Hant-CN']) assert.equal(G.resolve(locale), 'zh-Hant', locale);
  assert.equal(G.resolve('JA-jp'), 'ja'); assert.equal(G.resolve('ko-KR'), 'ko');
  assert.equal(G.resolve('id-ID'), 'id'); assert.equal(G.resolve('in-ID'), 'id');
  assert.equal(G.resolve('en-US'), 'en');
});

check('Spanish and Portuguese regional preferences resolve to the available guides', () => {
  for (const locale of ['es', 'es-ES', 'es-MX', 'es-419', ' ES_ar ']) assert.equal(G.resolve(locale), 'es', locale);
  for (const locale of ['pt', 'pt-BR', 'pt-PT', 'pt_AO', 'PT-br']) assert.equal(G.resolve(locale), 'pt-BR', locale);
  assert.equal(G.detect(['fr-FR', 'pt-PT', 'en-US']), 'pt-BR');
  assert.equal(G.detect(['es-ES', 'pt-BR']), 'es');
  assert.equal(G.detect(['es-ES'], 'pt-BR'), 'pt-BR');
  assert.equal(G.detect(['pt-BR'], 'es'), 'es');
  assert.equal(G.detect(['es-ES'], 'pt-PT'), 'es', 'noncanonical saved preferences must not override browser choices');
  assert.equal(G.languages.find(entry => entry[0] === 'pt-BR')[1], 'Português (Brasil)');
});

check('browser preference order is honored, with supported manual choice taking precedence', () => {
  assert.equal(G.detect(['fr-FR', 'ko-KR', 'en-US']), 'ko');
  assert.equal(G.detect(['en-US', 'ja-JP']), 'en');
  assert.equal(G.detect(['ja-JP'], 'zh-Hant'), 'zh-Hant');
  assert.equal(G.detect(['id-ID'], 'garbage'), 'id');
  assert.equal(G.detect(['ja-JP'], 'constructor'), 'ja');
  assert.equal(G.detect(['ja-JP'], '__proto__'), 'ja');
  assert.equal(G.detect(['ja-JP'], 'en-US'), 'ja', 'only canonical values stored by the guide should override preferences');
  assert.equal(G.detect(['fr-FR', 'de-DE']), 'en');
});

check('missing, malformed and hostile locale values fall back without throwing', () => {
  for (const locale of [null, undefined, 0, {}, [], 'ja<script>', 'ja-JP?x=1', 'constructor', '__proto__', 'ja--JP', '']) {
    assert.equal(G.resolve(locale), null); assert.equal(G.detect([locale]), 'en');
  }
  assert.equal(G.detect(undefined), 'en'); assert.equal(G.detect('ja-JP'), 'ja');
  assert.equal(G.mount(null), null); assert.equal(G.mount({}), null);
});

check('all eight offline guides contain complete onboarding, both control methods and save guidance', () => {
  assert.deepEqual(G.languages.map(entry => entry[0]), ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'id', 'es', 'pt-BR']);
  const keys = Object.keys(G.catalog.en).sort();
  for (const [locale] of G.languages) {
    const guide = G.catalog[locale];
    assert.deepEqual(Object.keys(guide).sort(), keys, locale);
    for (const key of keys.filter(key => key !== 'steps')) assert.equal(typeof guide[key], 'string', locale + ': ' + key);
    assert.equal(guide.steps.length, 4);
    assert(guide.steps.every(step => step.length === 2 && step.every(text => typeof text === 'string' && text.length > 0) && step[1].length > 15));
    assert.match(guide.steps[0][1], /Calm/); assert.match(guide.steps[0][1], /ENTER THE TOWN/);
    assert.match(guide.keyboard, /WASD/); assert.match(guide.touch, /Use/); assert.match(guide.touch, /Swap/);
    assert.match(guide.save, /Export save/); assert.match(guide.save, /Pack/); assert.match(guide.save, /Journal/);
    assert(Object.isFrozen(guide)); assert(Object.isFrozen(guide.steps)); assert(Object.isFrozen(guide.steps[0]));
  }
});

console.log(passed + ' quick-start guide checks passed.');
