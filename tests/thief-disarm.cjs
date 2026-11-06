const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
function setup(){const g=game(null,()=>.5);g.run(`for(const job of [3,0,3]){const r=generateRecruit('冒険者'+s.members.length,job);registerRecruit(r);changeRecruitParty(r.members.id,true)}s.area='dungeon';s.size=5;s.pos=12;s.dir=1;s.cells=Array.from({length:25},()=>({trap:false,open:false,flag:false,type:''}));`);return g}
let g=setup();
g.run('renderStats()');
assert.equal((g.run("$('#statsbody').innerHTML").match(/data-stat-disarm=/g)||[]).length,2);
g.run(`s.cells[13].trap=true;s.cells[13].flag='power';$('#statsdialog').showModal();$('#statsbody').onclick({target:{closest:q=>q==='[data-stat-disarm]'?{dataset:{statDisarm:'0'}}:null}})`);
assert.equal(g.run("$('#statsdialog').open"),false);
assert.equal(g.run('s.cells[13].trap'),false);
assert.equal(g.run('s.cells[13].disarmed&&s.cells[13].open&&s.members[0].disarmUsed'),true);
assert.equal(g.run('s.cells[13].flag'),false);g.drain();
assert.equal(g.run('s.logs[0]'),'冒険者0は目の前の罠を解除した。');
g.run('s.dir=2;thiefDisarm(0)');assert.equal(g.run('s.cells[17].open'),false);
assert.equal(g.run('canThiefDisarm(2)'),true);
const loaded=game(g.run("save();localStorage.getItem('ash-v1')"));assert.equal(loaded.run('s.members[0].disarmUsed'),true);
g.run('thiefDisarm(1)');assert.equal(g.run('s.cells[17].open'),false);
g.run('thiefDisarm(2)');g.drain();assert.equal(g.run('s.cells[17].open&&s.members[2].disarmUsed'),true);
assert.equal(g.run('s.logs[0]'),'冒険者2は目の前を調べた。罠はなかった。');
g.run('enterTown();reorderParty([1,2,0])');assert.equal(g.run('s.members.every(m=>!m.disarmUsed)'),true);
g.run("enterDungeon()");g.drain();g.run('s.pos=12;s.dir=1;s.cells[13].open=false;thiefDisarm(1)');g.drain();assert.equal(g.run('s.members[1].disarmUsed'),true);
for(const guard of ["s.area='town'","s.members[0].status='dead'","s.members[0].status='ash'","s.members[0].status='lost'","s.members[0].status='stone'","s.hp[0]=0","s.enemy={units:[]}","s.pendingStairs=true","s.pendingBoss=13","s.pendingElevator=true","log('待機')","s.cells[13].open=true","s.pos=14"]){const h=setup();h.run(guard);assert.equal(h.run('canThiefDisarm(0)'),false,guard);h.run('thiefDisarm(0)');assert.equal(h.run('!!s.members[0].disarmUsed'),false,guard);h.run('renderStats()');assert.match(h.run("$('#statsbody').innerHTML"),/data-stat-disarm="0" disabled/)}
for(const type of ['stairs','down','elevator','boss']){const h=setup();h.run(`s.cells[13].type='${type}';s.cells[13].chest={opened:false};s.corpses=[{floor:s.floor,cell:13,records:[]}];var before=JSON.stringify([s.pos,s.hp,s.corpses]);thiefDisarm(0)`);h.drain();assert.equal(h.run('JSON.stringify([s.pos,s.hp,s.corpses])'),h.run('before'));assert.equal(h.run('s.enemy'),null);assert.equal(h.run('!!s.pendingBoss||!!s.pendingStairs||!!s.pendingElevator||s.cells[13].chest.opened'),false)}
console.log('PASS thief disarm: guards, UI click, traps/flags, individual uses, save/reload, reorder, return reset and no movement effects');
{
 const h=setup();h.run('thiefDisarm(0)');h.drain();
 h.run("s.area='town';reorderParty([1,2,0])");
 assert.equal(h.run('s.members[2].disarmUsed'),true);
 assert.equal(h.run('!!s.members[1].disarmUsed'),false);
 h.run("s.members[2].status='dead';s.hp[2]=0;enterTown()");
 assert.equal(h.run('s.reserve.every(r=>!r.members.disarmUsed)'),true,'carried members reset too');
}
