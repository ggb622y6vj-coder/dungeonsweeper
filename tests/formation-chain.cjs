const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

let rolls;
const g = game(null, () => {
  if (!rolls) return .5;
  assert.ok(rolls.length, 'unexpected extra roll');
  return rolls.shift();
});
const enemies = Array.from(g.run('ENEMIES'));

// Species names stand for uniform pool draws. Numbers are the partner or 50% rolls.
function check(floor, draws, expected, { boss = false, defeated = false } = {}) {
  g.run(`s.floor=${floor};s.guardiansDefeated=${defeated ? '[' + floor + ']' : '[]'}`);
  const pool = enemies.filter(d => !d.boss && d.floors.includes(floor));
  if (defeated && !boss) pool.push(enemies.find(d => d.boss && d.floors.includes(floor)));
  rolls = draws.map(draw => {
    if (typeof draw === 'number') return draw;
    const index = pool.findIndex(d => d.id === draw);
    assert.notEqual(index, -1, draw);
    return (index + .5) / pool.length;
  });
  assert.deepEqual(Array.from(g.run(`monsterFormation(${boss})`)), expected);
  assert.equal(rolls.length, 0);
  rolls = undefined;
}

// Restrict the pool to unconfigured species for the cap checks.
const unconfigured = enemies.filter(d => !d.partnerId);
const roster = g.run('ENEMIES');
roster.splice(0, roster.length, ...unconfigured);
for (const [floor, limit] of [[1, 2], [2, 3], [3, 4], [10, 4]]) {
  check(floor, Array(limit).fill(0), Array(limit).fill(unconfigured.find(d => !d.boss && d.floors.includes(floor)).id));
}
roster.splice(0, roster.length, ...enemies);
console.log('PASS formation chain caps on 1F, 2F, 3F and 10F with only unconfigured species');

check(1, ['goblin', .399999], ['goblin', 'goblin']);
check(1, ['goblin', .4], ['goblin']);
console.log('PASS successful partner starts a separate group and failed partner ends the formation');

check(5, ['ninja', 'highmage', .49, .29], ['ninja', 'highmage', 'troll', 'ninja']);
check(5, ['ninja', 'highmage', .5], ['ninja', 'highmage']);
console.log('PASS random continuation picks a species whose own settings determine subsequent rows');

const archer = enemies.find(d => d.id === 'archer');
const { partnerId, partnerRate } = archer;
Object.assign(archer, { partnerId: 'zombie', partnerRate: 1 }); // Zombie is on 4F, absent on 3F.
check(3, ['archer', 'shaman', .39, .79], ['archer', 'shaman', 'blackwolf', 'rabbit']);
check(4, ['archer', .999, .59, .999], ['archer', 'zombie', 'archer', 'zombie']);
Object.assign(archer, { partnerId, partnerRate });
console.log('PASS out-of-floor partner falls back to the pool and the chain resumes');

// On these floors the configured partner is absent. The next roll selects a
// normal species, and its own partner roll can end the chain.
for (const [floor, source, next] of [
  [3, 'sirakaba', 'archer'], [4, 'insectivore', 'namakubi'],
  [5, 'zombie', 'wight'], [6, 'zombie', 'vampbat'], [5, 'rafflesia', 'wight'],
]) {
  check(floor, [source, next, .999], [source, next]);
}
check(2, ['sirakaba', .79, .99], ['sirakaba', 'poisonslime']);
check(3, ['insectivore', .59, 'archer', .99], ['insectivore', 'venomspider', 'archer']);
check(4, ['zombie', .59, .99], ['zombie', 'archer']);
check(4, ['rafflesia', .29, .999, .99], ['rafflesia', 'dynamotuboro', 'dendenko']);
console.log('PASS all four partially overlapping partners on shared and unshared floors');

const necromancer = enemies.find(d => d.id === 'necromancer');
const necromancerRate = necromancer.partnerRate;
necromancer.partnerRate = .01;
check(5, [.5], ['necromancer', 'wight'], { boss: true });
check(5, [.49, .49], ['necromancer', 'wight', 'wight', 'wight'], { boss: true });
necromancer.partnerRate = necromancerRate;
check(1, ['goblin', .5], ['guardian', 'goblin'], { boss: true });
check(1, ['goblin', .499999, 'slime'], ['guardian', 'goblin', 'slime'], { boss: true });
console.log('PASS guaranteed guardian escort chains from row two and independent random escorts keep their 50% third row');

check(3, ['gas', 'watcher', 'watcher', 'watcher', 0, .999], ['gas', 'watcher', 'gas', 'cathuman'], { defeated: true });
console.log('PASS defeated guardians are deduplicated after the full chain');

g.run("fresh(3);s.cells[s.pos].type='';Math.random=()=>.999;encounter(s.pos,true)");
assert.deepEqual(Array.from(g.run('enemyGroups().map(g=>g.key)')), [0, 1, 2, 3]);
assert.equal(g.run('s.enemy.lootMonsterId'), g.run('s.enemy.units[0].id'));
console.log('PASS encounter creates all four stable groups and snapshots the first loot species');
