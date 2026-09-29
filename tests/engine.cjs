const assert = require('node:assert/strict');
const fs = require('node:fs');
global.window = {};
for (const module of ['catalog', 'vehicles', 'actors', 'destruction', 'stories', 'world', 'engine']) require('../src/' + module + '.js');
const E = window.Sirens.Engine;
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }
function finiteState(value, path='state') {
  if (typeof value === 'number') assert(Number.isFinite(value), path + ' must be finite');
  else if (value && typeof value === 'object') for (const [key, val] of Object.entries(value)) finiteState(val, path + '.' + key);
}
function reachable(s) {
  const x = Math.floor(s.player.x / s.tileSize), y = Math.floor(s.player.y / s.tileSize);
  const seen = new Set([y*s.width+x]), queue=[[x,y]];
  for(let i=0;i<queue.length;i++) for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const nx=queue[i][0]+dx,ny=queue[i][1]+dy,index=ny*s.width+nx;
    if(nx<0||ny<0||nx>=s.width||ny>=s.height||seen.has(index)) continue;
    // Doors may be opened by a player, so count them as connected floor.
    if(E.isSolid(s,nx,ny) && s.tiles[index] !== 6) continue;
    seen.add(index);queue.push([nx,ny]);
  }
  return seen;
}
function accessible(s, seen, x, y) {
  const tx=Math.floor(x/s.tileSize),ty=Math.floor(y/s.tileSize);
  return [[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((ty+dy)*s.width+tx+dx));
}
check('towns and escape supplies reachable across 20 seeds',()=>{
  for(let seed=1;seed<=20;seed++) {
    const s=E.create(seed,'standard');
    assert.equal(s.tiles.length,s.width*s.height);
    assert(!E.isSolid(s,Math.floor(s.player.x/s.tileSize),Math.floor(s.player.y/s.tileSize)),'solid spawn for '+seed);
    const seen=reachable(s);
    assert(accessible(s,seen,s.goal.radioX,s.goal.radioY),'unreachable radio for '+seed);
    let parts=0;
    for(const c of s.containers) {
      assert(accessible(s,seen,c.x,c.y),'unreachable container '+c.label+' seed '+seed);
      parts+=(c.items.parts||0);
    }
    assert(parts>=s.goal.required,'insufficient radio parts for '+seed);
    finiteState(s);
  }
});
check('map generation deterministic',()=>{
  assert.deepEqual(E.create(80,'standard').tiles,E.create(80,'standard').tiles);
  assert.notDeepEqual(E.create(80,'standard').tiles,E.create(81,'standard').tiles);
});
check('movement, sprint, and diagonal speed',()=>{
  const s=E.create(5,'standard');s.zombies=[];
  let tile=null;
  for(let y=3;y<s.height-3&&!tile;y++)for(let x=3;x<s.width-3&&!tile;x++) {
    let open=true;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(E.isSolid(s,x+dx,y+dy))open=false;
    if(open) tile={x:(x+.5)*s.tileSize,y:(y+.5)*s.tileSize};
  }
  assert(tile,'no open test patch');
  const start=E.serialize(s);
  function distance(input) { const a=E.deserialize(start);a.player.x=tile.x;a.player.y=tile.y;for(let i=0;i<15;i++)E.update(a,1/60,input);return Math.hypot(a.player.x-tile.x,a.player.y-tile.y); }
  const straight=distance({moveX:1,moveY:0});
  assert(straight>5,'movement had no effect');
  const diagonal=distance({moveX:1,moveY:1});
  assert(Math.abs(straight-diagonal)<1,'diagonal movement is faster');
  assert(distance({moveX:1,moveY:0,sprint:true})>straight,'sprint should move faster');
});
check('loot transfer and exact inventory persistence',()=>{
  const s=E.create(10,'calm');s.zombies=[];s.player.inventory={};
  const c=s.containers.find(c=>Object.values(c.items).some(n=>n>0));
  assert(c);s.player.x=c.x;s.player.y=c.y;
  for(let i=0;i<4;i++)E.interact(s);
  assert(Object.values(s.player.inventory).reduce((a,b)=>a+b,0)>0,'looting gave no supplies');
  const reloaded=E.deserialize(E.serialize(s));
  assert.deepEqual(reloaded.player.inventory,s.player.inventory);
  assert.deepEqual(reloaded.containers,s.containers);
  assert.equal(reloaded.player.x,s.player.x);
});
check('food, water and treatment actually change survival state',()=>{
  const s=E.create(6,'standard');s.player.inventory.food=3;s.player.inventory.water=3;s.player.inventory.bandage=3;
  s.player.hunger=80;s.player.thirst=80;s.player.bleeding=10;
  E.action(s,'eat');assert(s.player.hunger<80);assert.equal(s.player.inventory.food,2);
  E.action(s,'drink');assert(s.player.thirst<80);assert.equal(s.player.inventory.water,2);
  E.action(s,'bandage');assert(s.player.bleeding<10);assert.equal(s.player.inventory.bandage,2);
});
check('radio repair consumes parts and escape can be completed',()=>{
  const s=E.create(12,'calm');s.zombies=[];s.humans=[];
  s.player.x=s.goal.radioX;s.player.y=s.goal.radioY;s.player.inventory.parts=s.goal.required;
  for(let i=0;i<3&&!s.goal.active;i++)E.interact(s);
  assert(s.goal.active,'radio did not repair');
  assert.equal(s.player.inventory.parts||0,0,'radio did not consume its parts');
  for(let i=0;i<20000&&!s.ended;i++) { s.zombies=[];E.update(s,1/60,{}); }
  assert(s.won&&s.ended,'escape countdown did not win');
});
check('save rejection covers invalid and partial state',()=>{
  for(const text of ['not json','null','[]','{}','{"version":1,"state":{}}'])assert.throws(()=>E.deserialize(text));
  const text=E.serialize(E.create(9,'standard'));
  const parsed=JSON.parse(text);
  const base=parsed.state||parsed;
  const mutations=[
    o=>delete o.player.inventory,
    o=>o.player.x=-9000,
    o=>o.width=999999,
    o=>o.tiles=[],
    o=>o.zombies=[{}],
    o=>o.goal=null,
    o=>o.player.inventory={food:-10},
    o=>o.player.health='bad',
    o=>o.player.inventory={unknownItem:50}
  ];
  for(const mutation of mutations){const object=JSON.parse(text);mutation(object.state||object);assert.throws(()=>E.deserialize(JSON.stringify(object)));}
  assert(base.player);
});
check('long simulation remains finite through noisy combat inputs',()=>{
  const s=E.create(2026,'hard');
  for(let i=0;i<12000&&!s.ended;i++) {
    E.update(s,1/60,{moveX:Math.sin(i*.08),moveY:Math.cos(i*.08),sprint:i%300<50,attack:i%100<10,shoot:i%900<5,aimX:s.player.x+80,aimY:s.player.y+10});
    if(i%600===0)finiteState(s);
  }
  finiteState(s);
  finiteState(E.deserialize(E.serialize(s)));
});
console.log('Completed '+checks+' meaningful engine checks.');
