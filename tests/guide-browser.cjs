'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
  const errors = [], requests = [], passed = [];
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP', hasTouch: true, isMobile: true });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  async function check(name, test) { await test(); passed.push(name); console.log('PASS ' + name); }
  const guide = page.locator('[data-guide="title"]');
  const titleSelect = page.locator('[data-guide-language="title"]');
  try {
    await page.goto(url);
    await check('browser language selects the local guide while the game remains correctly marked English', async () => {
      assert.equal(await titleSelect.inputValue(), 'ja');
      assert.equal(await guide.getAttribute('lang'), 'ja');
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      await guide.locator('summary').tap();
      assert(await titleSelect.isVisible());
      assert.match(await guide.locator('.as-guide-scope').textContent(), /英語/);
    });
    await check('native language selection preserves run setup and synchronizes title and pause guides', async () => {
      await page.locator('[data-ui="seed"]').fill('4242');
      await page.locator('[data-ui="difficulty"]').selectOption('calm');
      await page.locator('[data-ui="mode"]').selectOption('rescue');
      const before = await page.evaluate(() => Sirens.Engine.serialize(Sirens.App.getState()));
      for (const locale of ['zh-Hans', 'zh-Hant', 'en', 'id', 'es', 'pt-BR', 'ja', 'ko']) {
        await titleSelect.selectOption(locale);
        assert.equal(await guide.getAttribute('lang'), locale);
        assert.equal(await page.locator('[data-guide-language="pause"]').inputValue(), locale);
        assert.equal(await page.evaluate(() => Sirens.Engine.serialize(Sirens.App.getState())), before);
      }
      assert.equal(await page.locator('[data-ui="seed"]').inputValue(), '4242');
      assert.equal(await page.locator('[data-ui="difficulty"]').inputValue(), 'calm');
      assert.equal(await page.locator('[data-ui="mode"]').inputValue(), 'rescue');
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    });
    await check('manual preference survives reload and guide content fits a 320-pixel phone', async () => {
      await page.reload();
      assert.equal(await titleSelect.inputValue(), 'ko');
      await page.setViewportSize({ width: 320, height: 740 });
      await guide.locator('summary').tap();
      for (const locale of ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'id', 'es', 'pt-BR']) {
        await titleSelect.selectOption(locale);
        assert(await guide.evaluate(el => el.scrollWidth <= el.clientWidth + 1), locale + ' guide overflow');
        const box = await titleSelect.boundingBox(); assert(box.x >= 0 && box.x + box.width <= 321, locale + ' select outside viewport');
      }
      fs.mkdirSync('.test-results', { recursive: true });
      await titleSelect.selectOption('ja');
      await guide.evaluate(el => el.scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: '.test-results/guide-mobile.png', fullPage: true });
    });
    await check('guide changes do not advance a paused run, and keyboard can reopen it', async () => {
      await page.locator('[data-command="start"]').tap();
      await page.locator('[data-command="pause"]').tap();
      assert.equal(await page.evaluate(() => Sirens.App.getScreen()), 'paused');
      const pause = page.locator('[data-guide="pause"]');
      await pause.locator('summary').focus(); await page.keyboard.press('Enter');
      assert(await page.locator('[data-guide-language="pause"]').isVisible());
      const before = await page.evaluate(() => Sirens.Engine.serialize(Sirens.App.getState()));
      await page.locator('[data-guide-language="pause"]').selectOption('zh-Hant');
      await page.waitForTimeout(200);
      assert.equal(await page.evaluate(() => Sirens.Engine.serialize(Sirens.App.getState())), before);
      assert.equal(await titleSelect.inputValue(), 'zh-Hant');
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => Sirens.App.getScreen()), 'playing');
    });
    await check('denied browser storage still allows language selection and starting a game', async () => {
      const denied = await browser.newContext({ locale: 'id-ID', viewport: { width: 900, height: 700 } });
      await denied.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Storage is blocked', 'SecurityError'); } }));
      const tab = await denied.newPage(); tab.on('pageerror', error => errors.push(error.message));
      await tab.goto(url);
      assert.equal(await tab.locator('[data-guide-language="title"]').inputValue(), 'id');
      await tab.locator('[data-guide="title"] summary').click();
      await tab.locator('[data-guide-language="title"]').selectOption('ko');
      assert.equal(await tab.locator('[data-guide="title"]').getAttribute('lang'), 'ko');
      await tab.locator('[data-command="start"]').click();
      assert.equal(await tab.evaluate(() => Sirens.App.getScreen()), 'playing');
      await denied.close();
    });
    assert.deepEqual(errors, []); assert.deepEqual(requests, []);
    console.log(passed.length + ' guide browser checks passed without remote requests.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
