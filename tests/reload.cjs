const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty,seededRandom}=require('../scripts/sim/combat.cjs');
const read=(g,e)=>JSON.parse(g.run(`JSON.stringify(${e})`));
for(const floor of [1,2,10])for(const killed of [false,true])for(const location of ['normal','start','elevator','down']){
 const g=game(null,seededRandom(830+floor));createParty(g,[2,1,3]);g.drain();
 g.run(`fresh(${floor});s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.area='dungeon';
 s.members[1].known.push('reload');s.mp[1]=80;s.hp[0]=7;s.ailments[0].poison=true;
 s.gold=123;s.light=true;s.milwaSteps=17;s.watchful=true;s.teppeki=true;s.dumapicUses=3;s.floodUses=2;
 s.guardiansDefeated=${killed?'[s.floor]':'[]'};s.relic=${killed};s.guardianKilledThisRun=${killed};s.elevatorFloors=[1,2,10];
 s.pos=${location==='start'?'s.start':"s.cells.findIndex((c,i)=>i!==s.start&&i!==s.boss)"};
 Object.assign(s.cells[s.pos],{type:${JSON.stringify(location==='start'?'stairs':location==='normal'?'':location)},trap:false,open:false,flag:'power',safe:true});
 for(let i=0;i<s.cells.length;i++)if(i!==s.pos){s.cells[i].open=true;s.cells[i].flag='power';s.cells[i].chest={opened:i%2===0,gold:9}}
 s.corpses=[{id:'body',floor:s.floor,cell:s.start,gold:50,records:[{test:'kept'}]},{id:'remote',floor:99,cell:3,gold:7,records:[]}];
 `);g.drain();
 const current=read(g,'s.cells[s.pos]'),before=read(g,'s');
 assert.equal(g.run("castMagic(1,'reload',null)"),true); // Real spell guards, cost and effect.
 const after=read(g,'s');
 for(const key of Object.keys(before))if(!['cells','start','boss','corpses','mp'].includes(key))assert.deepEqual(after[key],before[key],`${floor}/${location}: ${key}`);
 assert.deepEqual(after.mp,before.mp.map((mp,i)=>mp-(i===1?4:0)));
 assert.deepEqual(after.cells[after.pos],current);
 assert(after.cells.every((c,i)=>i===after.pos||(!c.open&&!c.flag&&!c.chest&&!c.disarmed)));
 assert.equal(after.cells.filter(c=>c.trap).length,g.run('trapCount(s.floor,size())'));
 assert.equal(after.cells[after.start].type,'stairs');assert.equal(after.start===after.pos,location==='start');
 assert.notEqual(after.boss,after.pos);assert.notEqual(after.boss,after.start);
 assert.equal(after.cells[after.boss].type,killed&&floor<10?'down':'boss');
 if(floor===10&&killed&&location!=='down')assert(!after.cells.some(c=>c.type==='down'),'10F: no down stairs to a nonexistent 11F');
 assert(g.run('Math.max(Math.abs(s.boss%size()-s.start%size()),Math.abs((s.boss/size()|0)-(s.start/size()|0)))>2'));
 assert.equal(after.cells.filter(c=>c.type==='elevator').length,1);
 assert(g.run('[s.pos,...around(s.pos),s.boss,s.start].every(i=>!s.cells[i].trap)'));
 assert.deepEqual(after.corpses[1],before.corpses[1]);
 assert.deepEqual({...after.corpses[0],cell:before.corpses[0].cell},before.corpses[0]);
 const body=after.corpses[0],cell=after.cells[body.cell];assert(!cell.trap&&!cell.type&&!cell.chest);
 const normal=after.cells.flatMap((c,i)=>!c.trap&&!c.type&&!c.chest?[i]:[]),width=after.size;
 const distance=i=>Math.abs(i%width-before.corpses[0].cell%width)+Math.abs((i/width|0)-(before.corpses[0].cell/width|0));
 assert.equal(distance(body.cell),Math.min(...normal.map(distance)));
 if(floor===1){
  assert(g.run(`(()=>{const reached=new Set([s.pos]);for(const p of reached){let choices=[];if(p%size()!==s.boss%size())choices.push(p+(p%size()<s.boss%size()?1:-1));if((p/size()|0)!==(s.boss/size()|0))choices.push(p+(p<s.boss?size():-size()));for(const i of choices)if(!s.cells[i].trap)reached.add(i)}return reached.has(s.boss)})()`));
  if(location!=='elevator')assert(g.run('s.cells.every((c,i)=>c.type!=="elevator"||Math.max(Math.abs(i%size()-s.start%size()),Math.abs((i/size()|0)-(s.start/size()|0)))<=2)'));
 }
 assert.equal(g.run('logQueue.filter(e=>e.text.includes("この階を再抽選した")).length'),1);
 g.drain();g.run('save()');
}
for(const reason of ['unknown','mp','battle']){
 const g=game(null,seededRandom(83));createParty(g,[1]);g.drain();
 g.run(`s.area='dungeon';s.members[0].known=${reason==='unknown'?"[]":"['reload']"};s.mp[0]=${reason==='mp'?0:20};${reason==='battle'?"s.enemy={units:[makeEnemy('goblin',1)]};":''}`);
 const before=read(g,'s.cells'),mp=g.run('s.mp[0]');assert.equal(g.run("castMagic(0,'reload',null)"),false);assert.deepEqual(read(g,'s.cells'),before);assert.equal(g.run('s.mp[0]'),mp);
}
{
 const g=game(null,seededRandom(84));createParty(g,[1]);g.drain();g.run("s.area='dungeon';s.members[0].known=['reload'];s.mp[0]=20;s.elevatorFloors=[];castMagic(0,'reload',null)");assert.equal(g.run('s.cells.some(c=>c.type==="elevator")'),false);
}
console.log('PASS reload: preservation, regeneration, traps, stairs, guardians, elevators, corpses, 1F route and spell guards');
