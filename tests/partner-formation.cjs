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
assert.equal(monster('blob').summonCap, 6, 'blob summon cap');
const configured = [
  ['goblin', 'goblin', .4], ['mage', 'orc', .55], ['shaman', 'blackwolf', .4],
  ['darkpriest', 'zombie', .6], ['highmage', 'troll', .5], ['troll', 'ninja', .3],
  ['wight', 'wight', .5], ['vampbat', 'vampbat', .5], ['royalguard', 'archmage', .5],
  ['necromancer', 'wight', 1], ['vampire', 'vampbat', 1], ['labyrinthlord', 'royalguard', 1],
  ['slime', 'ameba', .4], ['rat', 'wolf', .4], ['wolf', 'spider', .5],
  ['apprentice', 'skeleton', .4], ['bat', 'skeleton', .4], ['skeleton', 'goblin', .5],
  ['scout', 'apprentice', .6], ['takenoko', 'takenoko', .4], ['kinoko', 'takenoko', .6],
  ['poisonslime', 'ameba', .6], ['bandit', 'bandit', .5], ['stone', 'stone', .8],
  ['ghoul', 'ghoul', .8], ['ghostknight', 'ghoul', 1], ['bigspider', 'spider', .8],
  ['dendenko', 'dendenko', .7], ['sirakaba', 'poisonslime', .8], ['blackwolf', 'rabbit', .8],
  ['terror', 'terror', .7], ['dragon', 'archer', .7], ['archer', 'archer', .5],
  ['insectivore', 'venomspider', .6], ['dynamotuboro', 'dendenko', 1], ['harpy', 'virusbat', .7],
  ['gargoyle', 'zombie', .6], ['zombie', 'archer', .6], ['sorcerer', 'poltergeist', .5],
  ['viper', 'armorant', 1], ['armorant', 'dynamotuboro', .3], ['salamander', 'werewolf', .7],
  ['werewolf', 'namakubi', .6], ['darkelf', 'zombie', .8], ['rafflesia', 'dynamotuboro', .3],
  ['poltergeist', 'poltergeist', .6], ['namakubi', 'namakubi', .7], ['kashadokuro', 'venomspider', .6],
];
assert.equal(new Set(configured.map(([id]) => id)).size, 48);
assert.equal(enemies.filter(d => !d.partnerId).length, 60);
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
check(false, [slime, .399999], ['slime', 'ameba']);
check(false, [slime, .4], ['slime']);
check(false, [goblin, .399999], ['goblin', 'goblin']);
check(false, [goblin, .4], ['goblin']);
const fifthFloor = onFloor(5);
check(false, [fifthFloor('highmage'), .499999, .299999, fifthFloor('wight')],
  ['highmage', 'troll', 'ninja', 'wight']);
check(false, [fifthFloor('highmage'), .5], ['highmage']);
check(false, [fifthFloor('highmage'), .499999, .3], ['highmage', 'troll']);
console.log('PASS separate goblin rows and exact success/termination boundaries for chained partners on 5F');

onFloor(1);
const source = monster('slime');
const { partnerId, partnerRate } = source;
source.partnerId = 'goblin';
source.partnerRate = 0;
check(false, [slime, slime], ['slime', 'slime']); // Rate zero with a valid target.
source.partnerRate = 1;
check(false, [slime, .999999], ['slime', 'goblin']);
for (const id of ['wight', 'guardian', 'missing']) {
  source.partnerId = id;
  check(false, [slime, goblin], ['slime', 'goblin']);
}
Object.assign(source, { partnerId, partnerRate });
console.log('PASS guaranteed normal partner and random fallback without a partner roll for inactive or invalid targets');

for (const [id, partner] of configured.filter(([id]) => monster(id).boss)) {
  const floor = monster(id).floor;
  const normalPick = onFloor(floor);
  const third = monster(partner).partnerId;
  check(true, [.5], [id, partner]);
  check(true, [.499999, monster(third).partnerId ? .5 : normalPick(partner)],
    monster(third).partnerId ? [id, partner, third] : [id, partner, third, partner]);

  const pick = onFloor(floor, true);
  check(false, [pick(id), .999, .5], [id, partner]);
  // Two independent draws of the guardian, separated by its guaranteed escort.
  // Use an unconfigured escort to allow the second draw. Its own escort must
  // still be chosen before the duplicate guardian is replaced.
  const escort = monster(partner), rate = escort.partnerRate;
  escort.partnerRate = 0;
  check(false, [pick(id), .999, pick(id), .999, normalPick(third)], [id, partner, third, partner]);
  escort.partnerRate = rate;
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
