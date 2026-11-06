// Kept beside the simulator because task 010 explicitly excludes tests/ edits.
const assert = require('node:assert/strict');
const { game } = require('./harness.cjs');
const { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
const opt = args(['--jobs','0,0,2,3,1,2','--level','1','--floor','3','--n','2']);
for (const argv of [[], ['--jobs',''], ['--jobs','0,'], ['--wat','1'], ['--boss','--boss'],
  ['--jobs','0','--level','1','--floor','11','--n','1'], ['--gear','bad']]) assert.throws(() => args(argv));
const floor10 = args(['--jobs','0,0,2,3,1,2','--level','15','--floor','10','--boss','--gear','drop','--n','1']);
assert.equal(floor10.floor, 10);
assert.equal(floor10.gear, 'drop');

const g = game(null, seededRandom());
createParty(g, opt.jobs);
assert.equal(g.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
assert.equal(g.run('s.reserve.length'), 0);
assert.equal(g.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
gearParty(g, 10, 'drop');
assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
assert.equal(g.run("s.inventory[3].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear thief should receive a ranged weapon');
const equippedDrop = g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})');
prepareTrial(g, {...opt, level:9, floor:4});
assert.equal(g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})'), equippedDrop,
  'drop gear must survive per-trial party restoration');
const gBase = game(null, seededRandom());
createParty(gBase, opt.jobs);
assert.equal(gBase.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
assert.equal(gBase.run('s.reserve.length'), 0);
assert.equal(gBase.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
const noGearResult = simulate({...opt, level:9, floor:4, n:30, gear:undefined});
const dropGearResult = simulate({...opt, level:9, floor:4, n:30, gear:'drop'});
assert.notDeepEqual(dropGearResult, noGearResult, 'drop gear must affect a fixed-seed simulation');
const shopGear = game(null, seededRandom());
createParty(shopGear, opt.jobs);
gearParty(shopGear, 10, 'shop');
assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
assert.notDeepEqual(simulate({...opt, level:9, floor:4, n:30, gear:'shop'}), noGearResult,
  'shop gear must affect a fixed-seed simulation');
const formations = new Set();
for (let i = 0; i < 10; i++) {
  const total = prepareTrial(gBase, opt);
  assert.equal(total, gBase.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
  formations.add(gBase.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
  assert.equal(gBase.run('s.members.length'), 6);
  assert.equal(gBase.run('s.members.every(m => m.level === 1)'), true);
  assert.equal(gBase.run("s.members.find((m,i)=>jobOf(i)===1).known.includes('halito')"), true);
  assert.equal(gBase.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
}
assert(formations.size > 1, 'trials must not repeat one RNG sequence');

// Force an opening attack to verify that prepareTrial returns pre-ambush HP.
gBase.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
  rollInitiative=()=> 'enemy'; enemyTurn=()=>{s.hp[0]-=5};`);
const beforeAmbush = prepareTrial(gBase, opt);
assert.equal(beforeAmbush - gBase.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
gBase.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
prepareTrial(gBase, opt);
assert.equal(resolveBattle(gBase).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
gBase.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');

for (let i = 0; i < 10; i++) {
  prepareTrial(gBase, {...opt, level:6, floor:1, boss:true});
  assert.equal(gBase.run('s.members.every(m => m.level === 6)'), true);
  assert.equal(gBase.run(`s.members.every((m,i) => {
    const base = simBase[i].members, c = memberClass(i);
    return m.maxHP >= base.maxHP + 5 * (c.hpGrowth[0] + c.hpGrowth[2]) &&
      m.maxHP <= base.maxHP + 5 * (c.hpGrowth[0] * c.hpGrowth[1] + c.hpGrowth[2]);
  })`), true, 'growth must start from Lv1 every trial');
  // Mimic battle rewards, drain, gear drops and ailments before the next reset.
  gBase.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
}
prepareTrial(gBase, opt);
assert.equal(gBase.run('s.members[0].xp'), 0);
assert.equal(gBase.run('s.inventory[0].length'), 1);
assert.equal(gBase.run('s.ailments.some(a => a.poison)'), false);
assert.equal(gBase.run('s.ailments.every(a => JSON.stringify(a) === JSON.stringify({poison:false,paralysis:0,sleep:0,silence:0,fear:0}))'), true,
  'trial reset must restore the complete ailment shape');

// AI uses professions and stable row IDs; the mage gets the front living unit UID.
const gAI = game(null, seededRandom());
createParty(gAI, opt.jobs);
gAI.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
  var simTestCombat=s.enemy; simBattleFinished=false; s.hp=s.members.map(m=>m.maxHP); s.mp=s.members.map(m=>m.maxMP);`);
planTurn(gAI);
assert.equal(gAI.run('s.attackRows[0]'), 12);
assert.equal(gAI.run('s.commands[3]'), 'guard');
assert.equal(gAI.run('s.commands[4]'), 'spell');
assert.equal(gAI.run('s.magicPlans[4].target'), 8);
assert.equal(gAI.run('s.magicPlans[4].id'), 'halito', 'a single living target must not attract katino');
gAI.run(`s.enemy.units.push({...makeEnemy('slime',9),row:12});`);
planTurn(gAI);
assert.equal(gAI.run('s.magicPlans[4].id'), 'katino', 'katino remains available against two or more living enemies');
gAI.run('s.enemy.boss=true');
planTurn(gAI);
assert.equal(gAI.run('s.magicPlans[4].id'), 'halito', 'boss encounters must not use katino');
gAI.run('s.enemy.boss=false; s.enemy.units.pop()');
gAI.run('s.hp[0]=1');
planTurn(gAI);
assert.equal(gAI.run('s.magicPlans[2].id'), 'dios');
assert.equal(gAI.run('s.magicPlans[2].target'), 0);
gAI.run('s.mp[4]=5');
planTurn(gAI);
assert.equal(gAI.run('s.commands[4]'), 'guard');

// Failed fleeing spends one turn, including a party initiative, with no attack.
gAI.run('s.hp=s.hp.map(()=>1); Math.random=()=>.999; var simEnemyHP=s.enemy.units[0].hp;');
assert.throws(() => resolveBattle(gAI, 1), /未決着/);
assert.equal(gAI.run('s.enemy.initiative'), 'normal');
assert.equal(gAI.run('s.hp.every(h=>h===1)'), true);
assert.equal(gAI.run('s.enemy.units[0].hp'), gAI.run('simEnemyHP'));
gAI.run('Math.random=()=>0');
assert.equal(resolveBattle(gAI).outcome, 'escape');
gAI.run(`s.enemy=simTestCombat;
  s.ailments=s.ailments.map(()=>({poison:false,paralysis:0,sleep:0,silence:0,fear:0}));
  s.ailments.forEach(a=>a.poison=true);`);
const wipe = resolveBattle(gAI);
assert.equal(wipe.outcome, 'wipe');
assert.equal(wipe.deaths, 6);
assert.equal(wipe.alive, 0);
assert.equal(wipe.total, 0);
assert.equal(gAI.run('s.members.length'), 0, 'game defeat completion clears the party after the wipe snapshot');
gAI.run(`s.members=structuredClone(simBase.map(r=>r.members));
  for(const key of PARTY_FIELDS) s[key]=structuredClone(simBase.map(r=>r[key]));`);
gAI.run(`s.done=false; s.hp=s.members.map(m=>m.maxHP); s.ailments=s.ailments.map(()=>({poison:false,paralysis:0,sleep:0,silence:0,fear:0}));
  s.enemy={units:[{...makeEnemy('slime',0),row:0,hp:0,rewarded:true}],lootXP:0,lootGold:0};
  finishMonsterBattle();`);
gAI.drain();
assert.equal(resolveBattle(gAI).outcome, 'win');

const report = simulate(opt);
assert.deepEqual(simulate(opt), report, 'same invocation must be reproducible');
assert.deepEqual(simulate({...opt, gear: undefined}), report, 'omitted gear keeps the original deterministic result');
assert(Object.values(simulate(floor10)).every(Number.isFinite), 'floor 10 boss simulation with drop gear must run');
for (const value of Object.values(report)) assert(Number.isFinite(value));
assert(report.winRate + report.wipeRate <= 1);
assert(report.deathsPerBattle >= 0 && report.deathsPerBattle <= 6);
console.log('PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout');

// 033: stone cannot act or attract ordinary healing; Madi can cure it.
const petrifyAI = game(null, seededRandom());
createParty(petrifyAI, [0,2,1]);
petrifyAI.run(`s.area='dungeon';s.enemy={units:[{...makeEnemy('slime',0),row:0,hp:999}],boss:true};
  s.members[0].status='stone';s.hp[0]=3;s.members[2].status='stone';
  s.members[1].known=['dios'];s.mp[1]=100;`);
planTurn(petrifyAI);
assert.equal(petrifyAI.run("s.commands[0]==='guard'&&s.commands[2]==='guard'"),true);
assert.equal(petrifyAI.run('s.magicPlans[1]'),null,'ordinary healing must not target stone');
petrifyAI.run("s.members[1].known.push('madi')");
planTurn(petrifyAI);
assert.equal(petrifyAI.run('s.magicPlans[1].id'),'madi');
assert.equal(petrifyAI.run('s.magicPlans[1].target'),0);
petrifyAI.run("s.hp[1]=1;s.ailments[1].poison=true;s.hp[2]=0;s.members[2].status='dead'");
const stoneWipe = resolveBattle(petrifyAI);
assert.equal(stoneWipe.outcome,'wipe');assert.equal(stoneWipe.alive,0);
assert.equal(stoneWipe.deaths,2,'petrified survivors are not reported as deaths');
assert.equal(stoneWipe.total,3,'petrification preserves HP in the loss metric');

// Opening ambush capture persists after finishDefeat removes all party fields.
const openingStone = game(null, seededRandom());
createParty(openingStone,[0,2]);
openingStone.run(`rollInitiative=()=> 'enemy';enemyTurn=()=>{afflict(0,'stone');s.hp[1]=0;markDeaths();defeat()}`);
prepareTrial(openingStone,{...opt,jobs:[0,2]});
assert.equal(openingStone.run('s.members.length'),0);
const openingResult=resolveBattle(openingStone);
assert.equal(openingResult.outcome,'wipe');assert.equal(openingResult.deaths,1);
assert(openingResult.total>0);assert.equal(openingResult.rounds,0);
console.log('PASS simulator stone actors/targets, Madi, mixed wipe counts and HP, opening ambush snapshot');

// 036: prefer Montino for a group of at least two unsilenced casters.
const silenceAI = game(null, seededRandom(36));
createParty(silenceAI, [2,1,0]);
silenceAI.run(`s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;
  s.members[0].level=3;learnMagic(0,3);s.mp[0]=100;
  s.enemy={units:[{...makeEnemy('darkpriest',91),row:17},
    {...makeEnemy('darkpriest',92),row:17}],flagEffect:{}};`);
planTurn(silenceAI);
assert.equal(silenceAI.run('s.magicPlans[0].id'), 'montino');
assert.equal(silenceAI.run('s.magicPlans[0].target'), 91, 'target is a unit UID, not its row key');
for (const condition of ['s.enemy.units[1].hp=0', 's.enemy.units[1].silence=true',
  's.enemy.boss=true', 's.mp[0]=3']) {
  silenceAI.run(condition);
  planTurn(silenceAI);
  assert.equal(silenceAI.run('s.magicPlans[0]'), null, condition);
  silenceAI.run('s.enemy.units[1].hp=20;s.enemy.units[1].silence=false;s.enemy.boss=false;s.mp[0]=100');
}
silenceAI.run('s.hp[2]=1');
planTurn(silenceAI);
assert.equal(silenceAI.run('s.magicPlans[0].id'), 'dios', 'urgent healing takes priority');
silenceAI.run('s.ailments[0].silence=3;s.ailments[1].silence=3');
planTurn(silenceAI);
assert.equal(silenceAI.run("s.commands[0]==='fight'&&s.commands[1]==='fight'"), true,
  'silenced front-line priest and mage attack instead of casting');
assert.equal(silenceAI.run('s.magicPlans[0]===null&&s.magicPlans[1]===null'), true);
prepareTrial(silenceAI, {...opt, jobs:[2,1,0], boss:true});
assert.equal(silenceAI.run('s.ailments.every(a=>a.silence===0&&a.sleep===0&&a.fear===0)'), true,
  'a later trial must not inherit silence');
console.log('PASS simulator Montino target threshold, MP/boss restrictions, healing priority, silenced casters and reset');

// 037: fear keeps spellcasters useful, including below the normal mage MP threshold.
const fearAI = game(null, seededRandom(37));
createParty(fearAI, [1,0,2,3,0,2]);
fearAI.run(`s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;
  s.enemy={units:[{...makeEnemy('slime',91),row:17,hp:99999}],flagEffect:{}};
  s.ailments.forEach(a=>a.fear=3);
  s.members[0].known=['halito'];s.mp[0]=2;
  s.members[2].known=['dialko'];s.mp[2]=4;
  s.members[5].known=['kalki'];s.mp[5]=3;`);
planTurn(fearAI);
assert.equal(fearAI.run('s.commands.join()'), 'spell,guard,spell,guard,guard,spell');
assert.equal(fearAI.run('s.magicPlans[0].id'), 'halito');
assert.equal(fearAI.run('s.magicPlans[0].target'), 91);
assert.equal(fearAI.run('s.magicPlans[2].id'), 'dialko');
assert.equal(fearAI.run('s.magicPlans[2].target'), 2, 'frightened priest can cure self');
assert.equal(fearAI.run('s.magicPlans[5].id'), 'kalki', 'party spells remain available from rear');
fearAI.run('partyAction(0);partyAction(2);partyAction(5)');
assert(fearAI.run('s.enemy.units[0].hp') < 99999);
assert.equal(fearAI.run('s.ailments[2].fear'), 0);
assert.equal(fearAI.run('s.enemy.partyAC'), 1);
fearAI.drain();
fearAI.run('s.ailments.forEach(a=>a.fear=3);s.mp.fill(0)');
planTurn(fearAI);
assert.equal(fearAI.run("s.commands.every(c=>c==='guard')"),true,'no usable spell means guard');
fearAI.run('s.mp.fill(100);s.ailments.forEach(a=>a.silence=3)');
planTurn(fearAI);
assert.equal(fearAI.run("s.commands.every(c=>c==='guard')"),true,'fear plus silence means guard');
fearAI.run('s.ailments.forEach(a=>{a.silence=0;a.fear=0})');
planTurn(fearAI);
assert.equal(fearAI.run('s.commands[1]'), 'fight', 'fighter resumes attacking when fear ends');
fearAI.run('s.ailments.forEach(a=>a.fear=3)');
fearAI.run('s.teppeki=true;s.milwaSteps=17');
prepareTrial(fearAI, {...opt, jobs:[1,0,2,3,0,2], boss:true});
assert.equal(fearAI.run('s.ailments.every(a=>a.fear===0)'),true,'next trial cannot inherit fear');
assert.equal(fearAI.run('s.teppeki'),false,'next trial cannot inherit persistent AC');
assert.equal(fearAI.run('s.milwaSteps'),0,'next trial cannot inherit short light');
console.log('PASS simulator fear: spells including low MP/self-cure/rear buff, otherwise guard, silence overlap, recovery and trial reset');

// The simulator loads the actual cast/resistance/drain paths, including guardians.
require('../../tests/resistance-debuff.cjs');
