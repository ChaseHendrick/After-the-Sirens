const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
  fs.mkdirSync('.test-results',{recursive:true});
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
  const errors=[],requests=[],passed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  async function check(name,fn){await fn();passed.push(name);console.log('PASS '+name);}
  const state=()=>page.evaluate(()=>Sirens.App.getState());
  const screen=()=>page.evaluate(()=>Sirens.App.getScreen());
  let exported;
  try {
    await page.goto('file://'+path.resolve(__dirname,'../index.html'));
    await page.waitForTimeout(300);
    await page.locator('[data-ui="mode"]').selectOption('rescue');
    await page.screenshot({path:'.test-results/title.png'});
    await check('offline file launches with keyboard-accessible start',async()=>{
      assert.equal(await screen(),'title');
      await page.locator('[data-command="start"]').focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      assert.equal(await screen(),'playing');
    });
    await page.screenshot({path:'.test-results/gameplay.png'});
    await check('actual WASD movement and nearby loot',async()=>{
      const before=await state();
      await page.keyboard.down('KeyD');await page.waitForTimeout(180);await page.keyboard.up('KeyD');
      const after=await state();
      assert(Math.hypot(after.player.x-before.player.x,after.player.y-before.player.y)>1,'no movement');
      await page.keyboard.press('KeyE');await page.waitForTimeout(160);
      const looted=await state();
      assert(Object.values(looted.player.inventory).reduce((a,b)=>a+b,0)>Object.values(before.player.inventory).reduce((a,b)=>a+b,0),'nearby loot did not transfer');
    });
    await check('inventory pauses time and crafting gives items at displayed cost',async()=>{
      await page.keyboard.press('KeyI');await page.waitForTimeout(150);
      assert(await page.locator('[data-ui="inventory-overlay"]').isVisible());
      await page.locator('[data-command="crafting"]').click();
      const paused=await state();await page.waitForTimeout(400);assert.equal((await state()).elapsed,paused.elapsed);
      await page.evaluate(()=>{Sirens.App.getState().player.inventory.scrap=3;});await page.waitForTimeout(220);
      const before=await state();await page.locator('[data-craft="field_wraps"]').click();await page.waitForTimeout(130);
      const after=await state();assert.equal(after.player.inventory.bandage,(before.player.inventory.bandage||0)+2);assert.equal(after.player.inventory.scrap,1);
      await page.screenshot({path:'.test-results/inventory.png'});
      await page.keyboard.press('Escape');
      assert(!(await page.locator('[data-ui="inventory-overlay"]').isVisible()));
    });
    await check('pointer quick actions keep Space available for combat',async()=>{
      await page.locator('.as-hotbar [data-action="eat"]').click();
      assert.equal(await page.evaluate(()=>document.activeElement.tagName),'BODY');
      await page.keyboard.down('Space');await page.waitForTimeout(90);await page.keyboard.up('Space');
      assert((await state()).player.cooldown>0,'Space did not attack after HUD click');
    });
    await check('building from the inventory consumes materials and places a defense',async()=>{
      await page.keyboard.press('KeyI');
      await page.locator('[data-command="crafting"]').click();
      await page.evaluate(()=>{const s=Sirens.App.getState();s.player.inventory.wood=3;s.player.inventory.scrap=1;});await page.waitForTimeout(220);
      const before=await state();await page.locator('[data-build="barricade"]').click();await page.waitForTimeout(130);
      const after=await state();assert.equal(after.structures.length,before.structures.length+1);assert.equal(after.player.inventory.wood||0,0);assert.equal(after.player.inventory.scrap||0,0);
      await page.keyboard.press('Escape');
    });
    await check('local save survives full page reload and Continue',async()=>{
      await page.keyboard.press('Escape');assert.equal(await screen(),'paused');
      await page.locator('[data-command="save"]').click();
      const before=await state();await page.reload();await page.waitForTimeout(200);
      await page.locator('[data-command="continue"]').click();await page.waitForTimeout(180);
      const after=await state();assert.equal(after.player.x,before.player.x);assert.equal(after.player.y,before.player.y);assert.deepEqual(after.player.inventory,before.player.inventory);assert.deepEqual(after.structures,before.structures);
    });
    await check('singleplayer automatically backs up a running world without a Save click',async()=>{
      const savedBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('after-the-sirens-save-v1')).state.elapsed);
      await page.waitForFunction(before=>JSON.parse(localStorage.getItem('after-the-sirens-save-v1')).state.elapsed>before+2,savedBefore,{timeout:15000});
      const backup=await page.evaluate(()=>localStorage.getItem('after-the-sirens-save-v1'));
      assert(JSON.parse(backup).state.elapsed>savedBefore+2);
    });
    await check('page exit preserves a just-issued singleplayer item command before the next periodic backup',async()=>{
      await page.keyboard.press('KeyT');
      await page.locator('[data-social="text"]').fill('/give me ammo 2');await page.keyboard.press('Enter');
      await page.waitForFunction(()=>document.querySelector('[data-social="history"]').textContent.includes('Added 2'));
      const expected=(await state()).player.inventory.ammo;
      assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('after-the-sirens-save-v1')).state.player.inventory.ammo))<expected,'fixture reached periodic save before unload');
      await page.reload();await page.locator('[data-command="continue"]').click();
      await page.waitForFunction(()=>Sirens.App.getScreen()==='playing');
      assert.equal((await state()).player.inventory.ammo,expected);
    });
    await check('export produces a valid portable save and invalid import is caught',async()=>{
      await page.keyboard.press('Escape');
      const downloadEvent=page.waitForEvent('download');await page.locator('[data-command="exportSave"]').click();
      const download=await downloadEvent;exported=fs.readFileSync(await download.path(),'utf8');
      assert(JSON.parse(exported).version===1);
      await page.locator('[data-ui="import"]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":1,"state":{}}')});
      await page.waitForTimeout(180);assert.match(await page.locator('[data-ui="toast"]').textContent(),/Could not import/);assert.equal(await screen(),'paused');
      await page.locator('[data-ui="import"]').setInputFiles({name:'run.json',mimeType:'application/json',buffer:Buffer.from(exported)});
      await page.waitForTimeout(180);assert.equal(await screen(),'playing');
    });
    await check('small and unusual viewports render without crashes',async()=>{
      for(const [width,height] of [[390,844],[700,300],[3400,700]]){
        await page.setViewportSize({width,height});await page.waitForTimeout(160);
        await page.keyboard.press('KeyI');await page.waitForTimeout(150);
        assert(await page.locator('[data-ui="inventory-overlay"]').isVisible());
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert(!overflow,'horizontal layout overflow');
        await page.keyboard.press('Escape');
      }
      await page.setViewportSize({width:1440,height:960});
    });
    await check('death, title return, restart and victory screens work',async()=>{
      await page.evaluate(()=>{Sirens.App.getState().player.health=0;});await page.waitForTimeout(180);assert.equal(await screen(),'dead');
      await page.locator('.as-overlay[data-screen="dead"] [data-command="title"]').click();assert.equal(await screen(),'title');assert(!(await page.locator('#map-shell').isVisible()));
      await page.locator('[data-ui="mode"]').selectOption('rescue');
      await page.locator('[data-command="start"]').click();
      await page.evaluate(()=>{const s=Sirens.App.getState();s.zombies=[];s.player.x=s.goal.radioX;s.player.y=s.goal.radioY;s.player.inventory.parts=s.goal.required;Sirens.Engine.interact(s);s.goal.countdown=.03;});
      await page.waitForTimeout(200);assert.equal(await screen(),'won');
      await page.locator('.as-overlay[data-screen="won"] [data-command="restart"]').click();assert.equal(await screen(),'playing');
    });
    await check('keyboard and pointer stress remain finite and error-free',async()=>{
      for(const key of ['KeyF','Digit1','Digit2','Digit3','KeyR','KeyB','Space','KeyE','KeyI','Escape','Escape','Escape'])await page.keyboard.press(key);
      if(await screen()==='paused')await page.keyboard.press('Escape');
      await page.mouse.move(900,540);await page.mouse.down();await page.waitForTimeout(200);await page.mouse.up();
      await page.waitForTimeout(2400);
      const invalid=await page.evaluate(()=>{
        let bad=[];function walk(v,p){if(typeof v==='number'&&!Number.isFinite(v))bad.push(p);else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))walk(x,p+'.'+k);}walk(Sirens.App.getState(),'state');return bad;
      });assert.deepEqual(invalid,[]);
      assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,0,'offline game made network requests');
    });
    const metrics=await page.evaluate(()=>Sirens.App.getMetrics());
    const report={passed,errors,networkRequests:requests,metrics,browser:await browser.version(),viewport:{width:1440,height:960}};
    fs.writeFileSync('.test-results/browser-report.json',JSON.stringify(report,null,2));
    await page.screenshot({path:'.test-results/final-gameplay.png'});
    console.log('Browser checks complete:',JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
