// Kept beside the simulator because task 010 explicitly excludes tests/ edits.
const assert = require('node:assert/strict');
const { game } = require('./harness.cjs');
const { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
const opt = args(['--jobs','0,0,2,3,1,2','--level','1','--floor','3','--n','2']);
for (const argv of [[], ['--jobs',''], ['--jobs','0,'], ['--wat','1'], ['--boss','--boss'],
  ['--jobs','0','--level','1','--floor','4','--n','1']]) assert.throws(() => args(argv));

const g = game(null, seededRandom());
createParty(g, opt.jobs);
assert.equal(g.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
assert.equal(g.run('s.reserve.length'), 0);
const formations = new Set();
for (let i = 0; i < 10; i++) {
  const total = prepareTrial(g, opt);
  assert.equal(total, g.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
  formations.add(g.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
  assert.equal(g.run('s.members.length'), 6);
  assert.equal(g.run('s.members.every(m => m.level === 1)'), true);
  assert.equal(g.run("s.members[4].known.includes('halito')"), true);
  assert.equal(g.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
}
assert(formations.size > 1, 'trials must not repeat one RNG sequence');

// Force an opening attack to verify that prepareTrial returns pre-ambush HP.
g.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
  rollInitiative=()=> 'enemy'; enemyTurn=()=>{s.hp[0]-=5};`);
const beforeAmbush = prepareTrial(g, opt);
assert.equal(beforeAmbush - g.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
g.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
prepareTrial(g, opt);
assert.equal(resolveBattle(g).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
g.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');

for (let i = 0; i < 10; i++) {
  prepareTrial(g, {...opt, level:6, floor:1, boss:true});
  assert.equal(g.run('s.members.every(m => m.level === 6)'), true);
  assert.equal(g.run(`s.members.every((m,i) => {
    const base = simBase[i].members, c = memberClass(i);
    return m.maxHP >= base.maxHP + 5 * (c.hpGrowth[0] + c.hpGrowth[2]) &&
      m.maxHP <= base.maxHP + 5 * (c.hpGrowth[0] * c.hpGrowth[1] + c.hpGrowth[2]);
  })`), true, 'growth must start from Lv1 every trial');
  // Mimic battle rewards, drain, gear drops and ailments before the next reset.
  g.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
}
prepareTrial(g, opt);
assert.equal(g.run('s.members[0].xp'), 0);
assert.equal(g.run('s.inventory[0].length'), 1);
assert.equal(g.run('s.ailments.some(a => a.poison)'), false);

// AI uses professions and stable row IDs; the mage gets the front living unit UID.
g.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
  var simTestCombat=s.enemy; simBattleFinished=false; s.hp=s.members.map(m=>m.maxHP); s.mp=s.members.map(m=>m.maxMP);`);
planTurn(g);
assert.equal(g.run('s.attackRows[0]'), 12);
assert.equal(g.run('s.commands[3]'), 'guard');
assert.equal(g.run('s.commands[4]'), 'spell');
assert.equal(g.run('s.magicPlans[4].target'), 8);
g.run('s.hp[0]=1');
planTurn(g);
assert.equal(g.run('s.magicPlans[2].id'), 'dios');
assert.equal(g.run('s.magicPlans[2].target'), 0);
g.run('s.mp[4]=5');
planTurn(g);
assert.equal(g.run('s.commands[4]'), 'guard');

// Failed fleeing spends one turn, including a party initiative, with no attack.
g.run('s.hp=s.hp.map(()=>1); Math.random=()=>.999; var simEnemyHP=s.enemy.units[0].hp;');
assert.throws(() => resolveBattle(g, 1), /未決着/);
assert.equal(g.run('s.enemy.initiative'), 'normal');
assert.equal(g.run('s.hp.every(h=>h===1)'), true);
assert.equal(g.run('s.enemy.units[0].hp'), g.run('simEnemyHP'));
g.run('Math.random=()=>0');
assert.equal(resolveBattle(g).outcome, 'escape');
g.run('s.enemy=simTestCombat; s.ailments=s.ailments.map(()=>({poison:true,paralysis:0}))');
const wipe = resolveBattle(g);
assert.equal(wipe.outcome, 'wipe');
assert.equal(wipe.deaths, 6);
g.run(`s.done=false; s.hp=s.members.map(m=>m.maxHP); s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));
  s.enemy={units:[{...makeEnemy('slime',0),row:0,hp:0,rewarded:true}],lootXP:0,lootGold:0};
  finishMonsterBattle();`);
g.drain();
assert.equal(resolveBattle(g).outcome, 'win');

const report = simulate(opt);
assert.deepEqual(simulate(opt), report, 'same invocation must be reproducible');
for (const value of Object.values(report)) assert(Number.isFinite(value));
assert(report.winRate + report.wipeRate <= 1);
assert(report.deathsPerBattle >= 0 && report.deathsPerBattle <= 6);
console.log('PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout');
