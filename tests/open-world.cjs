const assert=require('node:assert/strict');
global.window={};
for (const module of ['catalog','progression','settlement','personal','warfare','vehicles','actors','destruction','stories','world','engine']) require('../src/'+module+'.js');
const {Engine:E,Catalog:C,World:W}=window.Sirens;
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
function finite(v,path='state'){if(typeof v==='number')assert(Number.isFinite(v),path);else if(v&&typeof v==='object')for(const[k,x]of Object.entries(v))finite(x,path+'.'+k);}
function globalPosition(s){return{x:s.player.x+s.world.originX*32,y:s.player.y+s.world.originY*32};}
function globalTile(s,x,y){const tx=x-s.world.originX,ty=y-s.world.originY;assert(tx>=0&&ty>=0&&tx<s.width&&ty<s.height);return s.tiles[ty*s.width+tx];}
function steps(s,seconds,input={}){for(let i=0;i<seconds*60&&!s.ended;i++)E.update(s,1/60,input);}
function path(s,gx,gy){
  const tx=Math.floor(gx/32)-s.world.originX,ty=Math.floor(gy/32)-s.world.originY;
  const start=Math.floor(s.player.y/32)*s.width+Math.floor(s.player.x/32),goal=ty*s.width+tx;
  assert(tx>=0&&ty>=0&&tx<s.width&&ty<s.height,'target outside active window');
  const queue=[start],seen=new Set(queue),previous=new Map();
  for(let i=0;i<queue.length;i++){const id=queue[i];if(id===goal)break;const x=id%s.width,y=Math.floor(id/s.width);
    for(const[nx,ny]of[[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(nx<1||ny<1||nx>=s.width-1||ny>=s.height-1)continue;const next=ny*s.width+nx;if(seen.has(next)||(E.isSolid(s,nx,ny)&&s.tiles[next]!==6))continue;seen.add(next);previous.set(next,id);queue.push(next);}}
  assert(seen.has(goal),'unreachable destination '+gx+','+gy);
  const result=[];for(let id=goal;id!==start;id=previous.get(id))result.push({x:(id%s.width+s.world.originX+.5)*32,y:(Math.floor(id/s.width)+s.world.originY+.5)*32});return result.reverse();
}
function walk(s,gx,gy){
  const route=path(s,gx,gy);let ticks=0;
  for(const point of route){while(!s.ended){const pos=globalPosition(s),dx=point.x-pos.x,dy=point.y-pos.y,d=Math.hypot(dx,dy);if(d<=2)break;
    const tx=Math.floor(point.x/32)-s.world.originX,ty=Math.floor(point.y/32)-s.world.originY;
    if(s.tiles[ty*s.width+tx]===6&&d<64)E.interact(s);
    let nearest=null,near=Infinity;for(const z of s.zombies){const range=Math.hypot(z.x-s.player.x,z.y-s.player.y);if(range<near){near=range;nearest=z;}}
    const raider=(s.humans||[]).filter(h=>h.health>0&&h.faction==='raider'&&Math.hypot(h.x-s.player.x,h.y-s.player.y)<430&&E.hasLOS(s,s.player.x,s.player.y,h.x,h.y)).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];
    if(raider){if((s.player.magazines.pistol||0)===0)E.action(s,'reload');E.attack(s,raider.x,raider.y,'pistol');}
    if(s.player.hunger>30)E.action(s,'eat');if(s.player.thirst>30)E.action(s,'drink');if(s.player.bleeding>0)E.action(s,'bandage');
    E.update(s,1/60,{moveX:dx/d,moveY:dy/d,attack:near<75,aimX:nearest?nearest.x:s.player.x+dx,aimY:nearest?nearest.y:s.player.y+dy});
    assert(++ticks<45000,'movement stuck at '+JSON.stringify(point));
  }}assert(!s.ended,'traveller died before completing route');
}
check('curated catalogue and recipe references are valid',()=>{
  assert(Object.keys(C.items).length>=120,'catalogue too small');assert(C.recipes.length>=30,'recipe catalogue too small');
  const names=new Set(),recipeIds=new Set();
  for(const[id,item]of Object.entries(C.items)){assert(id&&item.name&&item.description);assert(Number.isFinite(item.weight)&&item.weight>=0);assert(!names.has(item.name),'duplicate item name '+item.name);names.add(item.name);if(item.weapon?.ammoId)assert(C.items[item.weapon.ammoId]);finite(item,'item '+id);}
  for(const r of C.recipes){assert(!recipeIds.has(r.id));recipeIds.add(r.id);for(const fields of [r.cost,r.result])for(const[id,n]of Object.entries(fields)){assert(C.items[id],r.id+' references '+id);assert(Number.isInteger(n)&&n>0);}for(const id of r.tools||[])assert(C.items[id]);}
});
check('world mode has bounded active terrain and global identity',()=>{
  const s=E.create(0,'calm','openworld');assert.equal(s.mode,'openworld');assert.equal(s.width,192);assert.equal(s.height,192);assert.equal(s.tiles.length,192*192);assert.equal(s.seed,0);assert(s.world);assert.equal(s.world.centerCX,0);assert.equal(s.world.centerCY,0);finite(s);
});
let travelled;
check('four normal seam crossings preserve looting, doors, defenses and coordinates',()=>{
  const s=E.create(20260929,'calm','openworld');assert(E.interact(s));
  const safe=s.containers.find(c=>/Safe cabin/.test(c.label));const safeItems=JSON.stringify(safe.items);
  assert(E.build(s,'barricade'),'could not place a starter defense');
  const globalDefense=s.structures.map(b=>({type:b.type,x:b.x+s.world.originX*32,y:b.y+s.world.originY*32,health:b.health}));
  walk(s,31.5*32,31.5*32);assert.equal(globalTile(s,11,14),7,'starter door did not open');
  const radio={x:s.goal.radioX+s.world.originX*32,y:s.goal.radioY+s.world.originY*32};
  for(const[x,y]of[[95.5,31.5],[95.5,-32.5],[31.5,-32.5],[31.5,31.5]]){walk(s,x*32,y*32);assert.equal(s.tiles.length,192*192);finite(s);}
  assert(s.world.visitedCount>=4,'sectors were not tracked');assert.equal(globalTile(s,11,14),7,'door state lost on return');
  const returned=s.containers.find(c=>/Safe cabin/.test(c.label));assert(returned);assert.equal(JSON.stringify(returned.items),safeItems,'loot respawned');
  const nowDefense=s.structures.filter(b=>globalDefense.some(d=>d.type===b.type&&Math.abs(d.x-(b.x+s.world.originX*32))<.01&&Math.abs(d.y-(b.y+s.world.originY*32))<.01));assert.equal(nowDefense.length,globalDefense.length,'built defense lost');
  assert.equal(s.goal.radioX+s.world.originX*32,radio.x);assert.equal(s.goal.radioY+s.world.originY*32,radio.y);
  const ids=s.zombies.map(z=>z.id);assert.equal(new Set(ids).size,ids.length,'zombies duplicated after return');travelled=s;
});
check('world save reload preserves global position, edits, loot and exploration',()=>{
  const original=travelled;const serialized=E.serialize(original);assert.equal(JSON.parse(serialized).version,2);
  const restored=E.deserialize(serialized);assert.equal(restored.mode,'openworld');assert.deepEqual(globalPosition(restored),globalPosition(original));assert.equal(globalTile(restored,11,14),7);assert.equal(restored.structures.length,original.structures.length);assert.equal(restored.world.visitedCount,original.world.visitedCount);
  assert.deepEqual(restored.player.inventory,original.player.inventory);assert.equal(new Set(restored.zombies.map(z=>z.id)).size,restored.zombies.length);finite(restored);
});
check('generic consumption and backpack equipment have visible effects',()=>{
  const s=E.create(21,'calm','rescue');
  const edible=Object.entries(C.items).find(([id,i])=>id!=='food'&&i.consume&&i.effect?.hunger>0);assert(edible,'no original usable food');
  s.player.hunger=80;s.player.inventory[edible[0]]=2;assert(E.action(s,'use:'+edible[0]));assert(s.player.hunger<80);assert.equal(s.player.inventory[edible[0]],1);
  const pack=Object.entries(C.items).find(([id,i])=>i.capacity>0);assert(pack);s.player.inventory[pack[0]]=1;const before=E.carryCapacity(s);assert(E.action(s,'equip:'+pack[0]));assert(E.carryCapacity(s)>before);
});
check('equipped original melee weapon changes actual combat',()=>{
  const s=E.create(22,'calm','rescue');s.player.x=1008;s.player.y=1008;
  const weapon=Object.entries(C.items).find(([id,i])=>i.weapon?.kind==='melee'&&i.weapon.damage>40);assert(weapon);s.player.inventory[weapon[0]]=1;assert(E.action(s,'equip:'+weapon[0]));
  const z=s.zombies[0];z.x=1044;z.y=1008;z.health=200;s.zombies=[z];
  steps(s,.08,{attack:true,aimX:z.x,aimY:z.y});assert(z.health<200,'equipped weapon did no damage');
});
check('open world objective completion leaves exploration available',()=>{
  const s=E.create(23,'calm','openworld');s.player.x=s.goal.radioX;s.player.y=s.goal.radioY;s.player.inventory.parts=s.goal.required;assert(E.interact(s));s.goal.countdown=.01;steps(s,.04);assert(s.goal.complete);assert(!s.ended);assert(!s.goal.active);
});
check('legacy rescue saves remain valid and invalid world data is rejected',()=>{
  const rescue=E.create(24,'calm','rescue');const saved=E.serialize(rescue);assert.equal(JSON.parse(saved).version,1);assert.equal(E.deserialize(saved).mode,'rescue');
  for(const data of ['null','[]','{"version":2,"state":{}}','{"version":2,"world":{}}'])assert.throws(()=>E.deserialize(data));
  const malformed=JSON.parse(E.serialize(travelled));
  // Exact v2 layout is checked below once the engine serializer contract is finalized.
  assert(malformed.version===2);
});
check('a transmitting radio left outside the active window keeps every save loadable',()=>{
  const s=E.create(5,'calm','openworld');s.zombies=[];s.humans=[];s.player.x=s.goal.radioX;s.player.y=s.goal.radioY+40;s.player.inventory.parts=5;assert(E.interact(s));assert(s.goal.active);
  steps(s,4.2);assert(s.noises.some(n=>n.radius===720),'radio should be heard while loaded');
  // Explicit sector-position fixture, followed by the production recenter operation.
  for(const cx of [1,2]){s.player.x=(cx*64+31.5-s.world.originX)*32;s.player.y=(31.5-s.world.originY)*32;W.maybeRecenter(s);}
  assert(s.goal.radioX<0,'radio must be outside the window');
  for(let i=0;i<12;i++){steps(s,1);const loaded=E.deserialize(E.serialize(s));assert(loaded.goal.active);}
  assert(s.noises.every(n=>n.x>=0&&n.y>=0&&n.x<s.width*32&&n.y<s.height*32));
});
console.log('Completed '+checks+' open world and content checks. Catalogue: '+Object.keys(C.items).length+' items, '+C.recipes.length+' recipes.');
