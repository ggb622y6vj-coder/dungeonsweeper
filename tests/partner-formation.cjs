const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

let rolls;
const g = game(null, () => {
  if (!rolls) return .5;
  assert.ok(rolls.length, 'unexpected formation roll');
  return rolls.shift();
});
const enemies = Array.from(g.run('ENEMIES'));
const monster = id => enemies.find(d => d.id === id);
const configured = [
  ['goblin', 'goblin', .4], ['mage', 'orc', .55], ['shaman', 'blackwolf', .4],
  ['darkpriest', 'zombie', .6], ['highmage', 'troll', .5], ['troll', 'ninja', .3],
  ['wight', 'wight', .5], ['vampbat', 'vampbat', .5], ['royalguard', 'archmage', .5],
  ['necromancer', 'wight', 1], ['vampire', 'vampbat', 1], ['labyrinthlord', 'royalguard', 1],
];
for (const d of enemies) {
  const entry = configured.find(([id]) => id === d.id);
  assert.deepEqual([d.partnerId, d.partnerRate], entry ? entry.slice(1) : [null, 0], d.id);
}
assert.ok(configured.every(([id]) => monster(id)));
console.log('PASS partner settings for all 108 species');

function onFloor(floor, defeated = false) {
  g.run(`s.floor=${floor};s.guardiansDefeated=${JSON.stringify(defeated ? [floor] : [])}`);
  const pool = enemies.filter(d => !d.boss && d.floors.includes(floor));
  if (defeated) pool.push(enemies.find(d => d.boss && d.floors.includes(floor)));
  return id => {
    const index = pool.findIndex(d => d.id === id);
    assert.notEqual(index, -1, id + ' must be in the pool');
    return (index + .5) / pool.length;
  };
}

function check(boss, draws, expected) {
  rolls = [...draws];
  assert.deepEqual(Array.from(g.run(`monsterFormation(${boss})`)), expected);
  assert.equal(rolls.length, 0, 'unused formation rolls for ' + expected);
  rolls = null;
}

const firstFloor = onFloor(1);
const slime = firstFloor('slime'), goblin = firstFloor('goblin');
for (const [draw, count] of [[0, 1], [1/3 - .000001, 1], [1/3, 2], [2/3 - .000001, 2], [2/3, 3], [.999999, 3]]) {
  check(false, [draw, ...Array(count).fill(slime)], Array(count).fill('slime'));
}
check(false, [.999, goblin, .399999, 0], ['goblin', 'goblin', 'goblin']);
check(false, [.5, goblin, .4, slime], ['goblin', 'slime']);
const fifthFloor = onFloor(5);
check(false, [.999, fifthFloor('highmage'), .499999, .299999], ['highmage', 'troll', 'ninja']);
check(false, [.999, fifthFloor('highmage'), .5, fifthFloor('troll'), .3, fifthFloor('wight')],
  ['highmage', 'troll', 'wight']);
console.log('PASS uniform row count boundaries, separate goblin rows and chained partners on 5F');

onFloor(1);
const source = monster('slime');
source.partnerId = 'goblin';
check(false, [.5, slime, slime], ['slime', 'slime']); // Rate zero with a valid target.
source.partnerRate = 1;
check(false, [.5, slime, .999999], ['slime', 'goblin']);
for (const id of ['wight', 'guardian', 'missing']) {
  source.partnerId = id;
  check(false, [.5, slime, goblin], ['slime', 'goblin']);
}
source.partnerId = null;
source.partnerRate = 0;
console.log('PASS guaranteed normal partner and random fallback without a partner roll for inactive or invalid targets');

for (const [id, partner] of configured.filter(([id]) => monster(id).boss)) {
  const floor = monster(id).floor;
  const normalPick = onFloor(floor);
  const third = monster(partner).partnerId;
  check(true, [.5], [id, partner]);
  check(true, [.499999, 0], [id, partner, third]);
  check(true, [0, .999, normalPick(partner)], [id, partner, partner]);

  const pick = onFloor(floor, true);
  // Row three draws the guardian again after a failed partner roll. Only that row is replaced.
  check(false, [.999, pick(id), .999, .999, pick(id), normalPick(third)], [id, partner, third]);
}
onFloor(1);
const guardian = monster('guardian');
for (const target of [null, 'wight', 'guardian', 'missing']) {
  guardian.partnerId = target;
  guardian.partnerRate = target ? 1 : 0;
  // Even when random row two is a goblin, the unconfigured guardian's third row is independent.
  check(true, [goblin, .5], ['guardian', 'goblin']);
  check(true, [goblin, .499999, slime], ['guardian', 'goblin', 'slime']);
}
guardian.partnerId = null;
guardian.partnerRate = 0;
console.log('PASS dedicated guardian escorts, third-row boundary, ordinary guardian duplicate replacement and random escorts');
