const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

const g = game(null, () => .5);
const read = code => JSON.parse(g.run(`JSON.stringify(${code})`));

g.run('fresh(4);s.pos=4*size()+3');
assert.deepEqual(read('activeSpellEffects()'), [{
  name: '反呪文の結界', description: '全ての呪文が打ち消された！', remaining: '',
}]);
console.log('PASS antimagic zone active effect text and empty duration');

function formation(boss, rolls) {
  g.run(`var formationRolls=${JSON.stringify(rolls)};
    Math.random=()=>{
      if(!formationRolls.length)throw Error('extra formation roll');
      return formationRolls.shift();
    };`);
  const result = read(`monsterFormation(${boss})`);
  assert.equal(g.run('formationRolls.length'), 0);
  return result;
}

const maxFloor = g.run('MAX_FLOOR');
for (let floor = 1; floor <= maxFloor; floor++) {
  const [guardian, ...pool] = read(`[
    ENEMIES.find(d=>d.floors.includes(${floor})&&d.boss).id,
    ...ENEMIES.filter(d=>d.floors.includes(${floor})&&!d.boss).map(d=>d.id)
  ]`);
  g.run(`s.floor=${floor};s.guardiansDefeated=[];s.guardianKilledThisRun=false`);
  for (const [index, id] of pool.entries()) {
    assert.deepEqual(formation(false, [0, (index + .5) / pool.length]), [id], `undefeated ${floor}F pool`);
  }
  g.run(`s.guardiansDefeated=[${floor === 1 ? 2 : floor - 1}];s.guardianKilledThisRun=true`);
  assert.deepEqual(formation(false, [.999, .999, .999, .999]), Array(3).fill(pool.at(-1)),
    `another floor's defeat and a stale run flag cannot unlock the ${floor}F guardian`);

  g.run('s.guardiansDefeated=[s.floor];s.guardianKilledThisRun=false');
  assert.deepEqual(formation(false, [0, .999]), [guardian]);
  assert.deepEqual(formation(false, [.999, 0, .999, .999, .999]), [pool[0], guardian, pool.at(-1)],
    'replace only later guardian groups with normal enemies');
  assert.deepEqual(formation(false, [.999, .999, .999, .999, 0, .999]), [guardian, pool[0], pool.at(-1)]);
  assert.deepEqual(formation(true, [.999, .999]), [guardian, pool.at(-1)]);
  assert.deepEqual(formation(true, [.999, .25, 0]), [guardian, pool.at(-1), pool[0]]);
}
console.log('PASS guardian formation on every floor, separate defeat records, duplicate replacement and unchanged boss escorts');

g.run(`Math.random=()=>.5;fresh(1);s.area='town';
  const recruit=generateRecruit('冒険者',0);
  registerRecruit(recruit);changeRecruitParty(recruit.members.id,true);
  s.guardiansDefeated=[1];fresh(1);
  s.pos=s.cells.findIndex(c=>c.type===''&&!c.trap&&!c.open);
  s.cells[s.pos].open=true;
  // Select one group and the guardian, then roll party initiative after unit generation.
  var rolls=0;Math.random=()=>++rolls===2?.999:.15;
  encounter(s.pos,true);`);
assert.equal(g.run('s.enemy.boss'), false);
assert.equal(g.run('s.enemy.initiative'), 'party');
assert.ok(g.run('escapeChance()') > 0);
assert.deepEqual(read('s.enemy.units.map(e=>e.id)'), ['guardian']);
assert.equal(g.run('s.enemy.lootMonsterId'), 'guardian');
g.drain();

const progress = '[s.relic,s.guardianKilledThisRun,s.guardiansDefeated,s.cells.map(c=>c.type),s.pendingStairs,s.cleared,s.clearNotice]';
const before = read(progress);
const xp = g.run('s.members[0].xp');
g.run('const foe=s.enemy.units[0];foe.hp=0;killReward(foe);finishMonsterBattle()');
assert.equal(g.run('s.enemy'), null);
assert.deepEqual(read(progress), before, 'ordinary victory preserves relic, stairs, defeat and clear state');
assert.equal(g.run('s.members[0].xp'), xp + g.run("enemyDefinition('guardian').xp"));
assert.ok(g.run('currentChest().gold') > 0);
assert.equal(g.run('currentChest().lootGroup'), g.run('LOOT_TABLES.monsterGroups.guardian'));
console.log('PASS ordinary guardian encounter, initiative, escape chance, ordinary victory rewards and unchanged progression');
