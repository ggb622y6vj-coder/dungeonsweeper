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

// Use attack(), log playback and return end to end.
const combat = party();
combat.run(`var deadId=s.members[2].id;s.hp[2]=1;s.mp[1]=0;s.mp[2]=1;
  s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,identified:true}]};
  s.commands=s.members.map(()=> 'guard');Math.random=()=>.999;attack();`);
assert.equal(combat.run('s.hp[s.members.findIndex(m=>m.id===deadId)]'), 0);
assert.equal(combat.run('s.members.find(m=>m.id===deadId).status'), 'dead');
assert.equal(combat.run('s.members.findIndex(m=>m.id===deadId)'), 3, 'dead front member retreats');
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
combat.run(`s.ailments=s.members.map(()=>({poison:true,paralysis:4}));var beforeTownHP=s.hp.slice(),beforeTownMP=s.mp.slice();enterTown();`);
assert.equal(combat.run('s.area'), 'town');
assert.equal(combat.run('s.members.length'), 5, 'the dead member is carried out of the party');
assert.equal(combat.run('s.members.some(m=>m.id===deadId)'), false);
assert.equal(combat.run("s.reserve.find(r=>r.members.id===deadId).members.status"), 'dead');
assert.equal(combat.run("s.reserve.find(r=>r.members.id===deadId).hp"), 0);
assert.equal(combat.run("s.reserve.find(r=>r.members.id===deadId).mp"), 1, 'dead members do not refill MP');
assert.equal(combat.run("s.mp.every((mp,i)=>mp===s.members[i].maxMP)"), true, 'town return refills ok members MP');
assert.equal(combat.run("s.hp.every((h,i)=>h===s.members[i].maxHP)"), true, 'town return refills ok members HP');
assert.equal(combat.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
assert.equal(combat.run("!!(s.reserve.find(r=>r.members.id===deadId).ailments.poison||s.reserve.find(r=>r.members.id===deadId).ailments.paralysis)"), false);
assert.equal(combat.run("$('#templecarrydialog').open"), true);
assert.match(combat.run("$('#templecarrylist').textContent"), /（死亡）を寺院に運んだ/);
const town = reload(combat);
town.run(`var deadId=${JSON.stringify(combat.run('deadId'))};`);
assert.equal(town.run('s.members.length'), 5);
assert.equal(town.run('s.reserve.find(r=>r.members.id===deadId).members.status'), 'dead');
assert.equal(town.run('s.reserve.find(r=>r.members.id===deadId).hp'), 0);
assert.equal(town.run('changeRecruitParty(deadId,true)'), false, 'dead members cannot rejoin');
town.run('enterDungeon();');
town.drain();
assert.equal(town.run("$('#townnotice').textContent"), '');
assert.equal(town.run('s.area'), 'dungeon');
assert.equal(town.run('s.reserve.find(r=>r.members.id===deadId).members.status'), 'dead');
assert.equal(reload(town).run("s.reserve.find(r=>r.members.status==='dead').hp"), 0);
console.log('PASS combat death snapshot, town return carry/healing, death persistence and dungeon reentry');

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
  s.ailments=s.members.map(()=>({poison:true,paralysis:4}));s.members.forEach(m=>m.xp=650);markDeaths();enterTown();
  var carriedR=()=>['dead','ash','lost'].map(st=>s.reserve.find(r=>r.members.status===st));`);
assert.equal(states.run("carriedR().map(r=>r.members.status).join()"), 'dead,ash,lost');
assert.equal(states.run('carriedR().map(r=>r.hp).join()'), '0,0,0');
assert.equal(states.run('carriedR().map(r=>r.mp).join()'), '0,0,0');
assert.equal(states.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
assert.equal(states.run('carriedR().some(r=>r.ailments.poison||r.ailments.paralysis)'), false);
assert.equal(states.run('carriedR().map(r=>r.members.level).join()'), '1,1,1');
assert.equal(states.run('carriedR().every(r=>r.members.xp===650)'), true, 'dead/ash/lost retain XP');
assert.equal(states.run('s.members.length'), 3);
assert.equal(states.run('s.members.every(m=>m.level>1)'), true, 'ok members level on return');
assert.equal(states.run('s.members.every(m=>m.level===m.xpTargets.filter((v,j)=>j>=1&&v<=650).length)'), true, 'every ok member levels on return');
for (const i of [0,1,2]) {
  const g = reload(states);
  g.run(`var r=trainingRoster(),k=r.findIndex(x=>x.members.status===['dead','ash','lost'][${i}]);setPartyFromRoster(r,[k,0]);enterDungeon();`);
  assert.equal(g.run('s.area'), 'town', 'each non-ok state independently blocks entry');
  assert.equal(g.run("$('#townnotice').textContent"), '死亡したメンバーを外してください。');
  g.drain();
  assert.equal(g.run('ailmentLabel(0)'), ['死亡','灰','ロスト'][i]);
  g.run('reorderParty([1,0]);');
  assert.equal(g.run('ailmentLabel(1)'), ['死亡','灰','ロスト'][i], 'status follows member identity');
}
const snap = reload(states);
snap.run("var r=trainingRoster(),k=r.findIndex(x=>x.members.status==='ash');setPartyFromRoster(r,[0,k]);");
snap.drain();
snap.run("log('状態の記録');s.members[1].status='lost';");
assert.equal(snap.run('ailmentLabel(1)'), '灰', 'status display reads the snapshot member');
stepLog(snap);
assert.equal(snap.run('ailmentLabel(1)'), '灰');
snap.drain();
assert.equal(snap.run('ailmentLabel(1)'), 'ロスト');
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
