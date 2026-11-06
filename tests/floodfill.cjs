const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const g=game(null,()=>0);
g.run(`
const r=generateRecruit('巫女',2);registerRecruit(r);changeRecruitParty(r.members.id,true);
s.area='dungeon';s.size=5;s.cells=Array.from({length:25},()=>({trap:false,open:false,flag:false,type:''}));
s.pos=12;s.cells[12].open=true;s.cells[0].trap=true;s.cells[2].trap=true;s.cells[22].trap=true;
s.cells[8].flag='power';s.cells[16].type='stairs';s.cells[18].type='boss';s.relic=false;
s.corpses=[{floor:s.floor,cell:6,records:[{id:s.members[0].id,name:s.members[0].name,status:'dead',hp:0,mp:0,level:1,xp:0,inventory:[],equipped:0,ailments:{poison:false,paralysis:0}}]}];
s.members[0].level=5;s.members[0].known=[];s.members[0].maxMP=100;s.mp[0]=100;ensureMagic();
`);
// Configure a trap basin whose expected expansion is the safe connected 0-region + border.
g.run(`
const traps=[0,2,22];s.cells.forEach((c,i)=>c.trap=traps.includes(i));
`);
assert.equal(g.run("magic('floodfill').name"),'開放');
assert.equal(g.run("spellReason(0,magic('floodfill'))"),'');
g.run("Math.random=()=>0;castMagic(0,'floodfill',null)");g.drain();
assert.equal(g.run('s.enemy'),null,'no encounter');
assert.deepEqual(JSON.parse(g.run('JSON.stringify(s.cells.map((c,i)=>c.open?i:-1).filter(i=>i>=0).sort((a,b)=>a-b))')),
 [3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24]);
assert.equal(g.run('s.cells.some(c=>c.open&&c.trap)'),false);
assert.equal(g.run('s.cells[8].open'),false,'flag skipped');
assert.equal(g.run('s.corpses[0].records.length'),1,'no corpse recovery');
assert.equal(g.run("s.cells[16].open"),true,'stairs revealed only');
assert.equal(g.run("s.pendingStairs"),false);
assert.equal(g.run("s.cells[18].open"),true,'guardian room revealed');
assert.equal(g.run('s.pendingBoss'),null);
assert.match(g.run('s.logs[0]'),/マスを探索済みにした/);
assert.equal(g.run('s.mp[0]'),96);
assert.equal(g.run('spellCost(magic(\'floodfill\'))'),8);
assert.equal(g.run('spellCost(magic(\'dumapic\'))'),2);
g.run("s.pos=11;s.cells.forEach(c=>c.open=true);s.cells[12].open=false;s.cells[12].trap=true;s.cells[11].open=true;s.mp[0]=100;castMagic(0,'floodfill',null)");g.drain();
assert.equal(g.run('s.cells[12].open'),false);
assert.match(g.run('s.logs[0]'),/周囲に罠の気配/);
assert.equal(g.run('s.mp[0]'),92);
assert.equal(g.run('spellCost(magic(\'floodfill\'))'),16);
assert.equal(g.run('spellCost(magic(\'dumapic\'))'),2);
g.run("s.enemy={units:[]};s.mp[0]=100");
assert.equal(g.run("spellReason(0,magic('floodfill'))"),'探索専用');
g.run("s.enemy=null;s.floodUses=2;enterTown()");
assert.equal(g.run('s.floodUses'),0);
assert.equal(g.run('spellCost(magic(\'floodfill\'))'),4);
g.run(`s.area='dungeon';s.members[0].level=5;s.members[0].known=[];ensureMagic();renderLibrary('spells',2);var es=$('#librarybody').children.filter(e=>e.className==='library-entry');`);
assert.equal(g.run("es.find(e=>e.children[0].textContent==='開放').children[0].textContent"),'開放');
assert.match(g.run("es.find(e=>e.children[0].textContent==='開放').children[1].children.find((x,i)=>i%2===1&&es.find(e=>e.children[0].textContent==='開放').children[1].children[i-1].textContent==='消費MP').textContent"),/4（使用ごとに倍増）/);
const legacy=g.run("JSON.stringify((()=>{const o=structuredClone(rosterSaveState());o.roster.find(r=>r.members.job===2).members.level=6;o.roster.find(r=>r.members.job===2).members.known=['dios'];return o})())");
const loaded=game(legacy);
assert.equal(loaded.run("s.members.find((m,i)=>jobOf(i)===2).known.includes('floodfill')"),true,'existing Lv5+ priest learns on load');
console.log('PASS floodfill: bounded BFS, traps/flags, side effects, blocked cast, cost resets and spell metadata');
// Fill passes through already-explored 0-cells (minesweeper style); library hides the spell until learned.
{const h=game(null,()=>0);h.run(`
const r=generateRecruit('巫女',2);registerRecruit(r);changeRecruitParty(r.members.id,true);
s.area='dungeon';s.size=5;s.cells=Array.from({length:25},()=>({trap:false,open:false,flag:false,type:''}));
s.cells[4].trap=true;s.pos=20;s.cells.forEach((c,i)=>c.open=![3,4,9].includes(i));
s.members[0].level=5;s.members[0].known=['floodfill'];s.mp[0]=100;s.library.spells={};`);
h.run("const keep=s.members[0].known;s.members[0].known=[];s.members[0].level=1;s.library.spells={};renderLibrary('spells',2);s.members[0].known=keep;s.members[0].level=5");
const names=JSON.parse(h.run("JSON.stringify($('#librarybody').children.filter(e=>e.className==='library-entry').map(e=>e.children[0].textContent))"));
assert.equal(names.length,h.run('MAGIC.filter(x=>x.job===2).length'));assert.ok(!names.includes('開放'),'？？？ before learning');assert.equal(names[h.run("MAGIC.filter(x=>x.job===2).findIndex(x=>x.id==='floodfill')")],'？？？');
h.run("castMagic(0,'floodfill',null)");h.drain();
assert.equal(h.run('s.cells.filter(c=>!c.open).length'),1,'only the trap stays closed');
assert.equal(h.run('s.cells[4].open'),false);
assert.match(h.run('s.logs[0]'),/^2マスを探索済みにした/);
console.log('PASS floodfill: expands through explored quiet cells; library ？？？ before learning');}
