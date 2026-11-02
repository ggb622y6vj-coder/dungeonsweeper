// 043: execute the real spell, persistence and simulator paths.
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, planTurn, seededRandom } = require('../scripts/sim/combat.cjs');
const json = (g, code) => JSON.parse(g.run(`JSON.stringify(${code})`));
function battle(ids = ['thief','ogre','skeleton','stone','guardian','goblin']) {
  const g = game(null, seededRandom(43));
  // Mage in slot zero checks that jobs are independent of party position.
  createParty(g, [1,0,2]);
  g.run(`s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;
    s.members[0].level=9;learnMagic(0,9);s.mp[0]=60;
    s.cells.forEach(c=>{c.flag=false;delete c.chest});
    s.enemy={dataVersion:1,units:${JSON.stringify(ids)}.map((id,i)=>({
      ...makeEnemy(id,100+i),row:17+i*11,hp:99,identified:true
    })),initiative:'party',flagEffect:{}};
    resetPartyCommands();`);
  g.drain();
  return g;
}

{
  const g=battle();
  assert.deepEqual(json(g,"[magic('makanito').job,magic('makanito').level,magic('makanito').mp,magic('makanito').guaranteed,magic('makanito').where,magic('makanito').target,magic('makanito').effect,magic('makanito').value]"),
    [1,9,12,true,'battle','all','threshold-death',7]);
}
for (const random of [0, .999999]) {
  const g = battle();
  g.run(`Math.random=()=>${random}`);
  assert.equal(g.run("castMagic(0,'makanito',null)"), true);
  assert.deepEqual(json(g, 's.enemy.units.map(e=>e.hp)'), [0,99,99,99,99,0]);
  assert.equal(g.run('s.mp[0]'), 48);
  assert.equal(g.run('s.enemy.pendingXP'), g.run("enemyDefinition('thief').xp+enemyDefinition('goblin').xp"));
  assert.equal(g.run('s.enemy.pendingDrops'), 2);
  assert.equal(g.run('s.members[0].xp'), 0, 'XP stays pending until victory');
  const texts = json(g,'logQueue.map(e=>e.text)');
  for (const index of [0,5]) assert(texts.includes(g.run(`enemyDisplay(s.enemy.units[${index}])+'は息絶えた。'`)));
  for (const index of [1,2,3,4]) assert(texts.includes(g.run(`enemyDisplay(s.enemy.units[${index}])+'には効かなかった。'`)));
  assert.deepEqual(json(g,'logQueue[0].enemy.units.map(e=>e.hp)'), [99,99,99,99,99,99]);
  assert.deepEqual(json(g,'logQueue[1].enemy.units.map(e=>e.hp)'), [0,99,99,99,99,99], 'later deaths do not leak');
  assert.deepEqual(json(g,'visibleCombat().units.map(e=>e.hp)'), [99,99,99,99,99,99]);
  assert.deepEqual(json(g,'enemyGroups().map(g=>g.key)'), [28,39,50,61], 'remaining rows retain stable IDs');
  const xp = g.run('s.enemy.pendingXP');
  g.run("killByMagic(s.enemy.units[0]);castMagic(0,'makanito',null)");
  assert.equal(g.run('s.enemy.pendingXP'), xp, 'dead enemies never pay twice');
}
{
  const g = battle(['thief']);
  // Death itself must not roll resistance. Gold rewards may still roll dice.
  g.run(`var reward=killReward, rewardCalls=0;
    killReward=e=>{rewardCalls++;const random=Math.random;Math.random=()=>.5;
      try{return reward(e)}finally{Math.random=random}};
    Math.random=()=>{throw Error('unexpected resistance roll')};`);
  assert.equal(g.run("castMagic(0,'makanito',null)"),true);
  assert.equal(g.run('rewardCalls'),1);
}
{
  const g = battle(['ogre']);
  // Boundary must follow value, not an embedded literal threshold.
  g.run("magic('makanito').value=8");
  g.run("castMagic(0,'makanito',null)");
  assert.equal(g.run('s.enemy.units[0].hp'),0);
}
for (const restriction of ['mp','unknown','silence']) {
  const g = battle(['goblin']);
  if(restriction==='mp')g.run('s.mp[0]=11');
  if(restriction==='unknown')g.run("s.members[0].known=s.members[0].known.filter(id=>id!=='makanito')");
  if(restriction==='silence')g.run('s.ailments[0].silence=3');
  const mp = g.run('s.mp[0]');
  assert.equal(g.run("castMagic(0,'makanito',null)"), false, restriction);
  assert.equal(g.run('s.mp[0]'),mp);
  assert.equal(g.run('s.enemy.units[0].hp'),99);
}
{
  const g = battle(['goblin','slime','wolf']);
  g.run("s.commands=['spell','guard','guard'];s.magicPlans[0]={id:'makanito',target:null};attack()");
  assert.equal(g.run('s.enemy'),null,'real turn ends in victory');
  assert.equal(g.run('s.mp[0]'),48);
  assert.equal(g.run('s.members[0].xp'),g.run("Math.floor((enemyDefinition('goblin').xp+enemyDefinition('slime').xp+enemyDefinition('wolf').xp)/3)"));
  g.drain();
  assert.equal(g.run("s.library.monsters.goblin.count"),1);
}
{
  const g = battle();
  g.run("s.members[0].known=[];s.members[0].level=8;Math.random=()=>.999;learnMagic(0,8);ensureMagic()");
  assert.equal(g.run("s.members[0].known.includes('makanito')"),false);
  g.run('s.members[0].level=9;learnMagic(0,9)');
  assert.equal(g.run("s.members[0].known.includes('makanito')"),true);
}
// Saved spell lists migrate in both the active party and the reserve, without
// rerolling other spells or changing inventory, progression or member identity.
for (const legacy of [false,true]) {
  const g = battle();
  g.run(`s.area='town';s.enemy=null;
    for(const [name,job,level] of [['reserve',1,12],['low',1,8],['priest',2,12]]){
      const r=generateRecruit(name,job);r.members.level=level;registerRecruit(r);
    }
    s.members[0].known=['halito'];save();`);
  const state = legacy ? json(g,'s') : JSON.parse(g.run("localStorage.getItem('ash-v1')"));
  const loaded = game(JSON.stringify(state), seededRandom(43));
  assert.deepEqual(json(loaded,'s.members[0].known'),['halito','identifyfoe','dumapic','makanito']);
  assert.equal(loaded.run("s.reserve.find(r=>r.members.name==='reserve').members.known.includes('makanito')"),true);
  assert.equal(loaded.run("s.reserve.filter(r=>r.members.name!=='reserve').every(r=>!r.members.known.includes('makanito'))"),true);
  assert.equal(loaded.run('s.members[0].id'),g.run('s.members[0].id'));
  assert.deepEqual(json(loaded,'[s.inventory,s.members.map(m=>m.xp)]'),json(g,'[s.inventory,s.members.map(m=>m.xp)]'));
  loaded.run('ensureMagic();save()');
  const again = game(loaded.run("localStorage.getItem('ash-v1')"));
  assert.equal(again.run("s.members[0].known.filter(id=>id==='makanito').length"),1);
  again.run('openMagic(0,true)');
  assert.match(again.run("$('#magiclist').innerHTML"), /data-spell="makanito"[^]*?習得済み/);
}
// Shared death helper preserves Lakanito's probability, group scope and rewards.
{
  const g=battle(['ogre','ogre','goblin']);
  g.run("s.members[0].known.push('lakanito');s.enemy.units[1].row=s.enemy.units[0].row;Math.random=()=>0;castMagic(0,'lakanito',100)");
  assert.deepEqual(json(g,'s.enemy.units.map(e=>e.hp)'),[0,0,99]);
  assert.equal(g.run('s.enemy.pendingXP'),g.run("2*enemyDefinition('ogre').xp"));
  assert.equal(g.run('s.mp[0]'),44);
  g.drain();
  g.run("s.mp[0]=60;Math.random=()=>.999;castMagic(0,'lakanito',102)");
  assert.equal(g.run('s.enemy.units[2].hp'),99);
}
// AI counts eligible living individuals across rows, including boss escorts.
for(const [ids,mp,known,silence,fear,want] of [
  [['thief','goblin','harpy'],12,true,0,0,true],
  [['thief','goblin','harpy','guardian'],12,true,0,0,true],
  [['thief','goblin'],12,true,0,0,false],
  [['thief','goblin','ogre','skeleton','stone','guardian'],12,true,0,0,false],
  [['thief','goblin','harpy'],11,true,0,0,false],
  [['thief','goblin','harpy'],12,false,0,0,false],
  [['thief','goblin','harpy'],12,true,3,0,false],
  [['thief','goblin','harpy'],12,true,0,3,true],
  [['troll','ninja','highmage'],12,true,0,3,false],
]) {
  const g=battle(ids);
  if(ids.includes('guardian'))g.run('s.enemy.boss=true');
  g.run(`s.mp[0]=${mp};s.members[0].known=${known?"['makanito']":"[]"};s.ailments[0].silence=${silence};s.ailments[0].fear=${fear}`);
  planTurn(g);
  assert.equal(g.run("s.magicPlans[0]?.id==='makanito'"),want,JSON.stringify({ids,mp,known,silence,fear}));
  if(want)assert.equal(g.run('s.magicPlans[0].target'),null);
}
{
  const g=battle(['thief','goblin','harpy']);
  g.run('s.enemy.units[0].hp=0');planTurn(g);
  assert.equal(g.run("s.magicPlans[0]?.id==='makanito'"),false,'dead individuals do not count');
  assert.equal(g.run("ENEMIES.filter(d=>d.floor>=5).every(d=>!thresholdDeathApplies({id:d.id},7))"),true);
}
{
  const g=battle(['thief','goblin','harpy']);
  g.run("s.enemy.flagEffect={counts:{},curses:['magic'],bad:true};s.mp[0]=12");
  planTurn(g);
  assert.equal(g.run("s.magicPlans[0]?.id==='makanito'"),false,'flag-adjusted MP cost is respected');
}
{
  const g=battle();
  g.run(`s.area='town';s.enemy=null;
    const r=generateRecruit('legacy',1);r.members.level=9;delete r.members.known;registerRecruit(r);save();`);
  const loaded=game(g.run("localStorage.getItem('ash-v1')"));
  assert.equal(loaded.run('s.reserve[0].members.known'),undefined,'preserve legacy missing-list migration');
  loaded.run('changeRecruitParty(s.reserve[0].members.id,true);ensureMagic()');
  assert.equal(loaded.run("s.members[3].known.includes('makanito')&&s.members[3].known.includes('halito')"),true);
}
console.log('PASS Makanito: threshold, immunity, MP, rewards, snapshots, learning/load migration, Lakanito and simulator AI');
