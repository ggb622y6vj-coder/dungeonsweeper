const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty } = require('../scripts/sim/combat.cjs');
const g = game(null, () => .99);
createParty(g, [0, 0, 1]);
g.drain();
function setup() {
  g.run(`s.area='dungeon';s.done=false;s.logs=[];
    s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>freshAilments());
    s.inventory[0]=['sword'];s.inventory[1]=['sword'];s.equipped[0]=s.equipped[1]=0;
    s.commands=['fight','fight','guard'];s.attackRows=[71,71,71];
    s.enemy={initiative:'party',flagEffect:{},target:10,units:[
      {id:'slime',uid:10,row:71,hp:1,rewarded:false},
      {id:'wolf',uid:20,row:23,hp:1000,rewarded:false},
      {id:'slime',uid:30,row:9,hp:1000,rewarded:false},
      {id:'wolf',uid:40,row:4,hp:1000,rewarded:false}]};`);
}
setup();
g.run('attack()');
assert.equal(g.run('s.enemy.units[0].hp'), 0);
assert(g.run('s.enemy.units[1].hp<1000'), 'second fighter attacks next living row');
assert.equal(g.run('s.enemy.units[2].hp'), 1000);
assert.equal(g.run('s.enemy.units[3].hp'), 1000);
// Snapshots expose each result only at its own attack log.
assert(g.run('logQueue.find(e=>e.text.startsWith(NAMES[0]+"の攻撃。")).enemy.units[1].hp===1000'));
assert(g.run('logQueue.find(e=>e.text.startsWith(NAMES[1]+"の攻撃。")).enemy.units[1].hp<1000'));
g.drain();
assert.equal(g.run('JSON.stringify(s.logs.slice().reverse().map(t=>t.replace(/に\\d+ダメージ。/,"にNダメージ。")))'),
  JSON.stringify(['── ターン開始 ──','sim2は身を守る。', 'sim0の攻撃。不定形にNダメージ。','敵を倒した。','sim1の攻撃。素早い牙にNダメージ。']));

// A surviving selected row keeps its stable key when earlier rows disappear.
setup();
g.run('s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true;s.attackRows[0]=9;partyAction(0)');
assert(g.run('s.enemy.units[2].hp<1000 && s.enemy.units[1].hp===1000'));
g.drain();

// Melee never follows an invalid/out-of-range reservation into current row 3.
setup();
g.run('s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true;s.attackRows[0]=4;partyAction(0)');
assert(g.run('s.enemy.units[1].hp<1000 && s.enemy.units[3].hp===1000'));
assert.equal(g.run('reachableEnemyGroups(0).map(g=>g.key).join()'), '23,9');
g.drain();

// Ranged weapons can retain a target anywhere; fallback still chooses the front.
setup();
g.run("s.inventory[0]=['shortbow'];s.attackRows[0]=4;partyAction(0)");
assert(g.run('s.enemy.units[3].hp<1000 && s.enemy.units[0].hp===1'));
assert.equal(g.run('reachableEnemyGroups(0).length'), 4);
g.drain();
g.run('s.attackRows[0]=999;partyAction(0)');
assert.equal(g.run('s.enemy.units[0].hp'), 0);
g.drain();

setup();
g.run('s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true});partyAction(0)');
assert.equal(g.run('logQueue.map(e=>e.text).join()'), 'sim0の攻撃対象の列は全滅している。');
g.drain();

// Existing spell retargeting remains silent and ignores weapon reach.
setup();
g.run(`s.commands[2]='spell';s.members[2].known=['halito'];s.mp[2]=100;
  s.magicPlans[2]={id:'halito',target:10};
  s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true;partyAction(2);`);
assert(g.run('s.enemy.units[1].hp<1000 && s.mp[2]===98'));
assert.equal(g.run('logQueue.length'), 2, 'only existing spell and damage logs');
g.drain();
console.log('PASS attack retarget: two fighters, silent fallback, snapshots, stable row IDs, melee/ranged reach, empty battlefield and spells');
