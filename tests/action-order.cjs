// 092: shared AGI action order through the real runtime and simulator harness.
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');
const json = (g, code) => JSON.parse(g.run(`JSON.stringify(${code})`));
function party(jobs = [0], enemy = 'labyrinthlord') {
  const g = game(null, seededRandom(92));
  createParty(g, jobs);
  g.drain();
  g.run(`s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;
    s.cells.forEach(c=>{c.flag=false;delete c.chest});
    s.members.forEach((m,i)=>{m.agi=3;m.maxHP=10000;s.hp[i]=10000});
    s.enemy={dataVersion:1,units:[{...makeEnemy('${enemy}',91),row:17,hp:99999,identified:true}],initiative:'normal',flagEffect:{}};
    s.commands=s.members.map(()=>'fight');s.attackRows=s.members.map(()=>17);
    Math.random=()=>.999;`);
  return g;
}
const lines = g => json(g, 'logQueue.map(e=>e.text)');
const enemyAttack = text => /はsim\dに\d+ダメージ。|は.+の攻撃をかわした。/.test(text);
const allyAttack = text => /^sim\dの攻撃/.test(text);

{
  const g = game(null, seededRandom(92));
  for (const [agi, bonus] of [[3,-2],[4,-1],[5,-1],[6,0],[8,0],[9,1],[12,1],[13,2],[15,2],[16,3],[18,3]]) {
    assert.equal(g.run(`agilityInitiativeBonus(${agi})`), bonus, `AGI ${agi} initiative bonus`);
  }
  for (const [id, level, agi] of [['rat',1,6],['troll',10,10],['labyrinthlord',25,18]]) {
    assert.equal(g.run(`monsterLevel({id:'${id}'})`), level);
    assert.equal(g.run(`enemyAgility({id:'${id}'})`), agi);
  }
  for (const [job, base] of [[0,10],[1,9],[2,9],[3,14]]) {
    for (const [level, agi] of [[0,base],[1,base],[5,base],[6,base+1],[100,18]]) {
      assert.equal(g.run(`agilityFor(${job},${level})`), agi);
    }
    for (let n=0;n<100;n++) {
      const m = json(g, `generateRecruit('AGI',${job}).members`);
      assert.equal(typeof m.agi, 'number');
      assert.equal(typeof m.baseAgi, 'number');
      assert(m.agi>=3 && m.agi<=18);
      assert.equal(m.agi, m.baseAgi);
      const bases = [[12,8,8,10],[8,12,8,9],[10,8,12,9],[10,10,8,14]][job];
      const stats = [m.str,m.intelligence,m.piety,m.agi];
      stats.forEach((value,i)=>assert(value>=bases[i] && value<=18));
      assert.equal(stats.reduce((a,b)=>a+b)-bases.reduce((a,b)=>a+b), m.creationBonus);
    }
  }
  assert.equal(g.run('agilityFor(3,1)'), 14);
}
console.log('PASS action-order: initiative boundaries, enemy levels, AGI growth bounds and four-stat recruits');

{
  const g = party([0,0,0,0,0], 'rat');
  g.run(`s.members.forEach((m,i)=>{m.id='p'+i;m.agi=[6,18,10,10,3][i]});
    s.enemy.units=[{id:'rat',uid:91,hp:1},{id:'troll',uid:92,hp:1},
      {id:'rat',uid:93,hp:1},{id:'rat',uid:94,hp:0}];
    var rolls=[.4,.7,.5,.5,0,.4,.5,.4];Math.random=()=>{if(!rolls.length)throw Error('extra initiative roll');return rolls.shift()};`);
  assert.deepEqual(json(g, 'combatActionOrder()'), [
    {side:'party',id:'p4',agi:3,key:3},
    {side:'party',id:'p1',agi:18,key:5},
    {side:'party',id:'p2',agi:10,key:5},
    {side:'party',id:'p3',agi:10,key:5},
    {side:'enemy',uid:92,agi:10,key:5},
    {side:'party',id:'p0',agi:6,key:5},
    {side:'enemy',uid:91,agi:6,key:5},
    {side:'enemy',uid:93,agi:6,key:5},
  ]);
  assert.equal(g.run('rolls.length'), 0);
  assert.deepEqual(lines(g), [], 'initiative rolls never enter logs');
}
console.log('PASS action-order: exact keys, AGI ties, party-before-enemy ties, stable sequence and dead enemy exclusion');

{
  const g = party();
  g.run('attack()');
  const logs = lines(g), enemy = logs.findIndex(enemyAttack), ally = logs.findIndex(allyAttack);
  assert(enemy>=0 && ally>enemy, `fast enemy precedes slow member: ${logs}`);
  assert.equal(g.run('s.enemy.initiative'), 'normal');
  // The initial UI snapshot cannot expose the damage computed later in this turn.
  assert.equal(g.run('displayVitals.hp[0]'), 10000);
  assert(g.run('s.hp[0]')<10000);
  assert.equal(g.run('logQueue[0].hp[0]'), 10000);
}
{
  const g = party([0], 'rat');
  g.run(`s.members[0].agi=18;s.enemy.units[0].hp=1;
    var finishes=0,baseFinish=finishMonsterBattle;
    finishMonsterBattle=()=>{finishes++;baseFinish()};attack();`);
  assert(lines(g).some(allyAttack), 'fast member attacks');
  assert(!lines(g).some(enemyAttack), 'killed enemy never acts');
  assert.equal(g.run('s.enemy'), null);
  assert.equal(g.run('finishes'), 1, 'victory is handled exactly once');
  assert.equal(g.run('s.commands[0]'), 'fight', 'victory tail resets commands');
}
{
  const g = party();
  g.run("s.enemy.initiative='party';s.ailments[0].silence=3;s.ailments[0].fear=3;s.commands[0]='guard';attack()");
  assert(!lines(g).some(enemyAttack), 'surprise skips all enemy entries');
  assert.equal(g.run('s.enemy.initiative'), 'normal');
  assert.deepEqual(json(g, '[s.ailments[0].silence,s.ailments[0].fear]'), [2,2]);
  assert.equal(g.run('s.commands[0]'), 'fight');
  g.drain();
  g.run("s.commands[0]='guard';attack()");
  assert(lines(g).some(enemyAttack), 'enemy acts on the second turn');
  assert.deepEqual(json(g, '[s.ailments[0].silence,s.ailments[0].fear]'), [1,1]);
}
{
  const g = party();
  g.run(`s.hp[0]=1;var defeats=0,finishes=0,baseDefeat=defeat,baseFinish=finishMonsterBattle;
    defeat=()=>{defeats++;baseDefeat()};finishMonsterBattle=()=>{finishes++;baseFinish()};
    s.commands[0]='guard';attack();`);
  assert.equal(g.run('defeats'), 1);
  assert.equal(g.run('finishes'), 0);
  assert.equal(g.run('s.enemy'), null);
  assert.equal(g.run('s.defeatPending'), true);
  assert.equal(g.run('s.commands[0]'), 'fight', 'defeat tail still resets commands');
  assert(!lines(g).some(allyAttack), 'wiped party cannot act');
  g.drain();
  assert.equal(g.run('s.area'), 'town');
}
{
  const g = party([0,0,0,0], 'rat');
  g.run(`enemyDefinition('rat').level=25;enemyDefinition('rat').swings=1;
    s.hp[2]=1;attack();`);
  assert.equal(g.run("s.members.map(m=>m.name).join(',')"), 'sim0,sim1,sim3,sim2');
  assert.deepEqual(lines(g).filter(allyAttack).map(t=>t.match(/^sim\d/)[0]), ['sim0','sim1','sim3'],
    'stable IDs let the promoted member act once and skip the killed member');
}
console.log('PASS action-order: real attack interleaving, lethal first strike, surprise, defeat/victory tails, snapshots and reordered actor IDs');

{
  const g = party([3,1,2,0]);
  g.run(`s.members.forEach((m,i)=>{delete m.agi;delete m.baseAgi;m.level=6+i*5});
    s.reserve=[generateRecruit('reserve',3)];
    delete s.reserve[0].members.agi;delete s.reserve[0].members.baseAgi;s.reserve[0].members.level=11;
    save();`);
  const loaded = game(g.run("localStorage.getItem('ash-v1')"), seededRandom(92));
  for (let i=0;i<4;i++) {
    const expected = loaded.run(`agilityFor(jobOf(${i}),s.members[${i}].level)`);
    assert.equal(loaded.run(`s.members[${i}].agi`), expected, 'load migrates active member');
    assert.equal(loaded.run(`memberAgility(${i})`), expected);
    loaded.run(`delete s.members[${i}].agi`);
    assert.equal(loaded.run(`memberAgility(${i})`), expected, 'hand-built members use fallback');
  }
  assert.equal(loaded.run('s.reserve[0].members.agi'), 16, 'load migrates reserve with its job');
  loaded.run('s.members[0].agi=7;s.reserve[0].members.agi=8;ensureProfile()');
  assert.equal(loaded.run('s.members[0].agi'), 7, 'existing AGI is preserved');
  assert.equal(loaded.run('s.reserve[0].members.agi'), 8);
}
for (const base of [null,14,18]) {
  const g = party([3]);
  g.run(`s.members[0].level=5;s.members[0].baseAgi=${base};
    s.members[0].agi=${base??14};s.members[0].xp=s.members[0].xpTargets[6];levelUp();`);
  assert.equal(g.run('s.members[0].agi'), base===18?18:15);
  assert.match(g.run('s.levelReport.at(-1)'), new RegExp(` / AGI \\+${base===18?0:1}$`));
  assert.equal(g.run('lowerMemberLevel(0)'), true);
  assert.equal(g.run('s.members[0].agi'), base??14);
}
{
  const g = party([3]);
  g.run('s.members[0].level=5;delete s.members[0].agi;delete s.members[0].baseAgi;s.members[0].xp=s.members[0].xpTargets[6];levelUp()');
  assert.match(g.run('s.levelReport.at(-1)'), / \/ AGI \+1$/);
  g.run('displayVitals=snapshotVitals();s.members[0].agi=18;renderStats()');
  assert.match(g.run("$('#statsbody').innerHTML"), /<dt>STR<\/dt><dd>\d+<\/dd><\/div><div><dt>AGI<\/dt><dd>15<\/dd>/,
    'stats display AGI from the visible snapshot');
}
console.log('PASS action-order: party/reserve load migration, fallback, retained AGI, level-up/drain, cap, report and stat snapshot');

// Amendment 1 (ChatGPT review): an enemy action that ends the battle by itself
// (the last enemy flees in monsterAction) must stop the loop immediately, so
// later party members do not spend MP or act after the battle is decided.
{
  const g = party([2,0], 'rat');
  g.run(`enemyDefinition('rat').flee=1;
    s.members[0].known.push('dios');s.mp=[10,0];
    s.commands=['spell','fight'];s.magicPlans=[{id:'dios',target:0},null];attack()`);
  assert.equal(g.run('s.enemy'), null, 'battle ends after the last enemy flees');
  assert.equal(g.run('s.mp[0]'), 10, 'priest never casts after the battle ended');
  assert.deepEqual(json(g, 's.members.map(m=>m.xp)'), [0,0], 'escaped enemy pays no XP');
  const texts = lines(g);
  assert.equal(texts.filter(t=>t.includes('逃げ出した')).length, 1, 'flee logged once');
  assert(!texts.some(t=>t.includes('を唱えた')), 'no spell is cast after the flee');
  assert(!texts.some(t=>allyAttack(t)), 'no party attack after the flee');
}
console.log('PASS action-order: last enemy fleeing ends the turn loop at once');

// Each living enemy acts exactly once per turn, tracked by uid; an enemy that
// is already dead when the order is built never acts.
{
  const g = party([0], 'slime');
  g.run(`s.enemy.units.push({...makeEnemy('slime',92),row:17,hp:99999,identified:true},{...makeEnemy('slime',93),row:17,hp:99999,identified:true});
    s.enemy.units[1].hp=0;
    var acts={};var originalEnemyAction=enemyAction;enemyAction=(e,c)=>{acts[e.uid]=(acts[e.uid]||0)+1;originalEnemyAction(e,c)};
    attack()`);
  assert.deepEqual(json(g, 'acts'), {91:1, 93:1}, 'living enemies act once each; dead uid is skipped');
}
console.log('PASS action-order: enemy actions are once per living uid');
