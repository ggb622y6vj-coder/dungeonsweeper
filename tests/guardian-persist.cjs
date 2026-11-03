const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const g=game(null,()=>.999);
g.run(`fresh(1);s.guardiansDefeated=[];s.members=[{id:'a',name:'A',job:0,status:'ok',level:18,maxHP:9999,maxMP:0,xp:0,attack:999,known:[]}];s.hp=[9999];s.mp=[0];s.inventory=[['sword']];s.equipped=[0];s.armor=[{}];s.ailments=[freshAilments()];s.partyVersion=1;ensureProfile();s.members[0].attack=999;s.hp[0]=9999;s.pos=s.boss;encounter(s.boss,true);s.enemy.units.forEach(e=>{e.hp=1;e.sleep=99});`);g.drain();g.run(`for(const e of s.enemy.units){e.rewarded=true;e.escaped=false}finishMonsterBattle()`);assert.deepEqual(Array.from(g.run('s.guardiansDefeated')),[1]);
g.run(`s.area='town';resetDungeon();s.area='town';s.logs=[];enterDungeon();`);assert.equal(g.run("s.cells[s.boss].type"),'down');assert.equal(g.run("s.cells.filter(c=>c.type==='boss').length"),0);g.run(`s.pos=s.boss;s.relic=true;s.pendingStairs='down';s.logs=[];travelFloor(2);`);assert.equal(g.run('s.floor'),2);assert.equal(g.run("s.cells[s.boss].type"),'boss');
g.run(`s.guardiansDefeated=[1];s.area='dungeon';`);const saved=JSON.parse(g.run('JSON.stringify(rosterSaveState())'));
function restore(state){const h=game(JSON.stringify(state),()=>.999);h.run(`s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')));ensureProfile();s.guardiansDefeated??=[];`);return h}
assert.deepEqual(Array.from(restore(saved).run('s.guardiansDefeated')),[1]);const old=structuredClone(saved);delete old.guardiansDefeated;assert.deepEqual(Array.from(restore(old).run('s.guardiansDefeated')),[]);
const noBonus=game(null,()=>.999);noBonus.run(`fresh(1);s.guardiansDefeated=[1];s.relic=true;s.guardianKilledThisRun=false;s.logs=[];finish();`);assert.equal(noBonus.run('s.guardianKilledThisRun'),false);assert.equal(noBonus.run('s.guardiansDefeated.includes(s.floor)'),true);
console.log('PASS guardian defeat persistence, stairs, next-floor guardian, roster save/load, legacy default, and no repeated relic return bonus');
// A real kill marks the relic for this floor; a regenerated guardian-less floor does not.
{const k=game(null,()=>.999);k.run(`fresh(1);s.guardiansDefeated=[];s.enemy={boss:true,units:[{id:'guardian',uid:0,row:0,hp:0,rewarded:true,escaped:false}]};finishMonsterBattle();`);
assert.equal(k.run('s.guardianKilledThisRun'),true);assert.equal(k.run('s.relic'),true);
k.run(`s.logs=[];finish();`);k.drain();assert.ok(k.run('s.logs.join()').includes('秘宝を持ち帰った'));
const n=game(null,()=>.999);n.run(`fresh(1);s.guardiansDefeated=[1];s.logs=[];fresh(1);render();`);
assert.equal(n.run('s.relic&&s.guardianKilledThisRun'),false);assert.ok(!n.run("$('#status').textContent").includes('秘宝'));
n.run(`s.logs=[];finish();`);n.drain();assert.ok(!n.run('s.logs.join()').includes('秘宝'));
console.log('PASS relic message/status only after an actual guardian kill');}
