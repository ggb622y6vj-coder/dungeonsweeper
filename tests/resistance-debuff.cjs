const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');
function setup(boss=false) {
 const g=game(null,seededRandom(79));createParty(g,[0,1,2]);
 g.run(`s.area='dungeon';var def=ENEMIES.find(d=>${boss?'d.boss':"d.id==='goblin'"});def.mageResist=.25;def.priestResist=.95;
 s.enemy={dataVersion:1,units:[0,1,2].map(n=>({...makeEnemy(def.id,800+n),row:n===2?91:44,hp:999,identified:n===1})),initiative:'party',flagEffect:{}};
 s.members[1].level=13;s.members[1].maxHP=100;s.members[1].maxMP=100;s.hp[1]=100;s.mp[1]=100;
 s.members[1].known.push('nofice','mahaman');s.members[2].known.push('lorto');s.mp[2]=100;resetPartyCommands();`);g.drain();return g;
}
const read=(g,expr)=>JSON.parse(g.run(`JSON.stringify(${expr})`));
for(const boss of [false,true]){
 const g=setup(boss);
 // These spells must not roll resistance, even against guardians.
 g.run("Math.random=()=>{throw Error('unexpected resistance roll')}");
 assert.equal(g.run("castMagic(1,'nofice',800)"),true);
 assert.deepEqual(read(g,'s.enemy.units.map(e=>[enemySpellResist(e,1),enemySpellResist(e,2)])'),[[.12,.47],[.12,.47],[.25,.95]]);
 assert.equal(g.run('s.mp[1]'),92);
 g.run("castMagic(1,'nofice',800)");
 assert.equal(g.run('enemySpellResist(s.enemy.units[0],1)'),.12,'does not stack');
 g.run('Math.random=()=>.2');
 assert.equal(g.run("resistsEnemySpell(s.enemy.units[0],magic('halito'))"),false);
 assert.equal(g.run("resistsEnemySpell(s.enemy.units[2],magic('halito'))"),true);
 g.run('Math.random=()=>.5');
 assert.equal(g.run("resistsEnemySpell(s.enemy.units[0],magic('lorto'))"),false);
 assert.equal(g.run("resistsEnemySpell(s.enemy.units[2],magic('lorto'))"),true);
 // Actual damage spells use the altered rolls for both schools.
 g.run("Math.random=()=>.5;castMagic(1,'halito',800);castMagic(2,'lorto',800)");
 assert(g.run('s.enemy.units[0].hp')<994);
 const preserved=read(g,'({stats:[s.members[1].str,s.members[1].agi,s.members[1].intelligence,s.members[1].piety,s.members[1].vit],known:s.members[1].known,inventory:s.inventory[1],equipped:s.equipped[1],armor:s.armor[1]})');
 g.run('s.mp[1]=100;Math.random=()=>{throw Error("unexpected roll")}');
 assert.equal(g.run("castMagic(1,'mahaman',800)"),true);
 assert.equal(g.run('s.members[1].level'),12);
 assert.equal(g.run('s.members[1].xp===requiredXP(12,1)'),true);
 assert.equal(g.run('s.members[1].maxHP'),g.run('100-Math.round(memberClass(1).hpGrowth[0]*(memberClass(1).hpGrowth[1]+1)/2+memberClass(1).hpGrowth[2])'));
 assert.equal(g.run('s.members[1].maxMP'),g.run('100-Math.round(memberClass(1).mpGrowth[0]*(memberClass(1).mpGrowth[1]+1)/2)'));
 assert.equal(g.run('s.hp[1]'),g.run('s.members[1].maxHP'));
 assert.equal(g.run('s.mp[1]'),80,'MP consumed before clipping');
 assert.deepEqual(read(g,'({stats:[s.members[1].str,s.members[1].agi,s.members[1].intelligence,s.members[1].piety,s.members[1].vit],known:s.members[1].known,inventory:s.inventory[1],equipped:s.equipped[1],armor:s.armor[1]})'),preserved);
 assert.equal(g.run('enemySpellResist(s.enemy.units[0],1)+enemySpellResist(s.enemy.units[0],2)'),0);
 g.run("castMagic(1,'nofice',800)");assert.equal(g.run('enemySpellResist(s.enemy.units[0],1)'),0);
 const before=g.run('s.members[1].level');
 g.run("s.mp[1]=100;castMagic(1,'mahaman',800)");assert.equal(g.run('s.members[1].level'),before-1,'zero-resistance targets still cost a level');
 const logs=read(g,'logQueue.map(e=>e.text)');
 assert(logs.some(t=>t.includes('代償として1レベル下がった')));
 assert(logs.some(t=>t.includes('呪文抵抗が下がった')));
 assert(!logs.some(t=>/抵抗.*[0-9%]/.test(t)));
 assert(logs.includes(g.run('enemyDisplay(s.enemy.units[0])')+'の呪文抵抗が下がった。'));
 assert(logs.includes(g.run('enemyDisplay(s.enemy.units[1])')+'の呪文抵抗が下がった。'));
 // Lv1 is rejected without spending MP or touching enemies.
 g.run('s.members[1].level=1;s.mp[1]=100');
 assert.equal(g.run("castMagic(1,'mahaman',802)"),false);assert.equal(g.run('s.mp[1]'),100);
 assert.equal(g.run('enemySpellResist(s.enemy.units[2],1)'),.25);
 // New individuals inherit the definition, never another individual's debuff.
 g.run('Math.random=()=>.5');assert.equal(g.run('enemySpellResist(makeEnemy(def.id,900),1)'),.25);
}
{
 const g=setup();g.run("s.members[1].level=2;s.members[1].maxHP=1;s.members[1].maxMP=20;s.hp[1]=1;s.mp[1]=100;castMagic(1,'mahaman',800)");
 assert.equal(g.run('s.members[1].level'),1);assert.equal(g.run('s.members[1].maxHP'),1);
 assert.equal(g.run('s.mp[1]===s.members[1].maxMP'),true,'current MP clips to reduced cap');
}
{
 const g=setup();
 for(const condition of ["s.mp[1]=0", "s.ailments[1].silence=3", "s.enemy.units[0].hp=0"]){
  g.run('s.mp[1]=100;s.ailments[1].silence=0;s.enemy.units[0].hp=999;'+condition);
  const before=read(g,'[s.mp[1],s.members[1].level]');
  assert.equal(g.run("castMagic(1,'mahaman',800)"),false);
  assert.deepEqual(read(g,'[s.mp[1],s.members[1].level]'),before);
 }
}

// Nullifying resistance must never remove either instant-death boss immunity.
for(const spell of ['makanito','lakanito']){
 const g=setup(true);
 g.run(`s.members[1].known.push('${spell}');s.members[1].level=30;s.mp[1]=100;def.level=1;def.race='人間';Math.random=()=>0;castMagic(1,'mahaman',800)`);
 assert.equal(g.run('enemySpellResist(s.enemy.units[0],1)'),0);
 const before=read(g,'s.enemy.units.map(e=>[e.hp,e.rewarded])');
 assert.equal(g.run(`castMagic(1,'${spell}',800)`),true);
 assert.deepEqual(read(g,'s.enemy.units.map(e=>[e.hp,e.rewarded])'),before,spell+' guardian immunity after resistance nullification');
 assert(g.run('logQueue.some(e=>e.text.includes("効かなかった")||e.text.includes("効かない"))'));
}
console.log('resistance debuffs PASS');
