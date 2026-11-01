const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

function party() {
  const g = game(null, () => .5);
  g.run(`[0,1,2,3,1,2,0].forEach((job,i)=>{
    const r=generateRecruit('冒険者'+i,job);registerRecruit(r);
    if(i<6)changeRecruitParty(r.members.id,true);
  });enterDungeon();`);
  g.drain();
  return g;
}
function reload(g) {
  return game(g.run("save();localStorage.getItem('ash-v1')"));
}
function stepLog(g) {
  g.run('clearTimeout(logTimer);logTimer=null;pumpLog();');
}

// Use attack(), log playback, return and the actual tavern handlers end to end.
const combat = party();
combat.run(`s.hp[2]=1;s.mp[1]=0;s.mp[2]=1;
  s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,identified:true}]};
  s.commands=s.members.map(()=> 'guard');Math.random=()=>.999;attack();`);
assert.equal(combat.run('s.hp[2]'), 0);
assert.equal(combat.run('s.members[2].status'), 'dead');
assert.equal(combat.run('ailmentLabel(2)'), '正常', 'death must not leak ahead of the damage log');
assert.equal(combat.run("logQueue.find(e=>e.text.includes('ダメージ')).members[2].status"), 'dead');
while (combat.run("logQueue.length && !logQueue[0].text.includes('ダメージ')")) {
  stepLog(combat);
  assert.equal(combat.run('ailmentLabel(2)'), '正常');
}
stepLog(combat);
assert.equal(combat.run('ailmentLabel(2)'), '死亡');
assert.equal(combat.run('displayVitals.hp[2]'), 0);
combat.drain();
combat.run('s.enemy.units[0].hp=1;s.commands[0]="fight";attack();');
combat.drain();
assert.equal(combat.run('s.enemy'), null);
combat.run(`s.ailments=s.members.map(()=>({poison:true,paralysis:4}));enterTown();`);
assert.equal(combat.run('s.area'), 'town');
assert.equal(combat.run('s.hp[2]'), 0);
assert.equal(combat.run('s.mp[2]'), 1, 'dead members do not refill MP');
assert.equal(combat.run('s.mp[1]===s.members[1].maxMP'), true);
assert.equal(combat.run("s.hp.every((h,i)=>i===2?h===0:h===s.members[i].maxHP)"), true);
assert.equal(combat.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
assert.match(combat.run("$('#party').innerHTML"), /ailment-dead.*死亡/);
const town = reload(combat);
assert.equal(town.run('s.members[2].status'), 'dead');
assert.equal(town.run('s.hp[2]'), 0);
town.run('enterDungeon();');
assert.equal(town.run('s.area'), 'town');
assert.equal(town.run('logQueue.at(-1).text'), '死亡したメンバーを外してください。');
town.drain();
town.run(`var deadId=s.members[2].id;
  $('#tavernopen').onclick();
  $('#tavernslots').onchange({target:{dataset:{tavernSlot:'2'},value:'-1'}});
  $('#tavernsave').onclick();enterDungeon();`);
town.drain();
assert.equal(town.run('s.area'), 'dungeon');
assert.equal(town.run('s.reserve.find(r=>r.members.id===deadId).members.status'), 'dead');
assert.equal(reload(town).run("s.reserve.find(r=>r.members.status==='dead').hp"), 0);
console.log('PASS combat death snapshot, town HP/MP policy, death persistence, tavern removal and dungeon reentry');

// Cover every HP-zero path, including both floor-damage branches and party-wide attacks.
for (const [name, action, count] of [
  ['physical damage', "monsterHurt(0,999,s.commands,'敵')", 1],
  ['instant death', "Math.random=()=>0;monsterOnHit({id:'rabbit'},0)", 1],
  ['floor needle', 'Math.random=()=>0;triggerFloorTrap(s.cells[s.pos])', 1],
  ['floor blast', 'Math.random=()=>.3;triggerFloorTrap(s.cells[s.pos])', 6],
  ['chest needle', "Math.random=()=>0;triggerChestTrap({trap:'needle'})", 1],
  ['exploration poison', 's.ailments[0].poison=true;tickAilments(false)', 1],
  ['battle poison', 's.ailments[0].poison=true;tickAilments()', 1],
  ['generic damage', 'hurt(999)', 6],
  ['breath', "Math.random=()=>.2;monsterAction({id:'dragon'},s.commands)", 6],
  ['spell', "Math.random=()=>.2;monsterAction({id:'sorcerer'},s.commands)", 6],
]) {
  const g = party();
  g.run(`s.hp=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');${action};`);
  assert.equal(g.run("s.members.filter(m=>m.status==='dead').length"), count, name);
  assert.equal(g.run("s.hp.every((h,i)=>h>0?s.members[i].status==='ok':s.members[i].status==='dead')"), true, name);
  // Damage and defeat entries must already contain the updated status, not just the final state.
  assert.equal(g.run("logQueue.every(e=>e.hp.every((h,i)=>h>0||e.members[i].status==='dead'))"), true, name);
  g.drain();
  assert.equal(g.run("s.members.every((m,i)=>m.status!=='dead'||ailmentLabel(i)==='死亡')"), true, name);
  if (count === 6 && g.run('s.done')) {
    g.run('enterTown();');
    assert.equal(g.run('s.hp.every(h=>h===0)'), true, 'wipe return cannot resurrect anyone');
    assert.equal(g.run('s.area'), 'town');
  }
}
console.log('PASS HP-zero paths: physical, instant death, floor/chest traps, field/battle poison, hurt, breath and spell');

// Already recorded states never downgrade to dead/ok, including on return or reload.
const states = party();
states.run(`['dead','ash','lost'].forEach((status,i)=>{s.members[i].status=status;s.hp[i]=0;s.mp[i]=0});
  s.ailments=s.members.map(()=>({poison:true,paralysis:4}));markDeaths();enterTown();`);
assert.equal(states.run("s.members.slice(0,3).map(m=>m.status).join()"), 'dead,ash,lost');
assert.equal(states.run('s.hp.slice(0,3).join()'), '0,0,0');
assert.equal(states.run('s.mp.slice(0,3).join()'), '0,0,0');
assert.equal(states.run('[0,1,2].map(ailmentLabel).join()'), '死亡,灰,ロスト');
assert.equal(states.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
for (const i of [0,1,2]) {
  const g = reload(states);
  g.run(`setPartyFromRoster(trainingRoster(),[${i},3]);enterDungeon();`);
  assert.equal(g.run('s.area'), 'town', 'each non-ok state independently blocks entry');
  g.drain();
  g.run('reorderParty([1,0]);');
  assert.equal(g.run('ailmentLabel(1)'), ['死亡','灰','ロスト'][i], 'status follows member identity');
}
states.run("log('状態の記録');s.members[1].status='lost';");
assert.equal(states.run('ailmentLabel(1)'), '灰', 'status display reads the snapshot member');
stepLog(states);
assert.equal(states.run('ailmentLabel(1)'), '灰');
states.drain();
assert.equal(states.run('ailmentLabel(1)'), 'ロスト');
console.log('PASS dead/ash/lost preservation, labels, independent entry blocks, reorder and snapshot display');

// Load actual old ash-v1 payloads, both roster-based and parallel-array formats.
const legacySource = party();
for (const format of ['roster','parallel','three-member']) {
  for (const area of ['town','dungeon']) {
    const legacy = JSON.parse(legacySource.run(format==='roster'
      ? 'JSON.stringify(rosterSaveState())' : 'JSON.stringify(s)'));
    legacy.area = area;
    if (format === 'roster') {
      legacy.roster.forEach(r=>{delete r.members.status;r.hp=0});
    } else {
      legacy.members.forEach(m=>delete m.status);
      legacy.hp.fill(0);
      legacy.reserve.forEach(r=>{delete r.members.status;r.hp=0});
      if (format === 'three-member') {
        delete legacy.partyVersion;
        for (const key of ['members','hp','mp','inventory','equipped','armor','ailments']) legacy[key]=legacy[key].slice(0,3);
      }
    }
    const g = game(JSON.stringify(legacy));
    assert.equal(g.run("s.members.every((m,i)=>m.status===(s.area==='town'||s.hp[i]>0?'ok':'dead'))"), true, `${format} ${area}`);
    assert.equal(g.run("s.reserve.every(r=>r.members.status==='ok')"), true, 'legacy reserve defaults to ok even at HP0');
    const before = g.run('s.members.map(m=>m.status).join()');
    g.run('ensureProfile();');
    assert.equal(g.run('s.members.map(m=>m.status).join()'), before, 'migration is idempotent');
    assert.equal(reload(g).run('s.members.map(m=>m.status).join()'), before);
  }
}
assert.equal(legacySource.run("s.members.every(m=>m.status==='ok')&&s.reserve.every(r=>r.members.status==='ok')"), true);
console.log('PASS new members, old town/dungeon/reserve saves, roster/parallel/three-member migration and reload');
