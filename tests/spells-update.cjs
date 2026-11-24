const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');

function setup(floor = 1) {
  const g = game(null, seededRandom(137));
  createParty(g, [0, 2]);
  g.run(`fresh(${floor});
    s.area = 'dungeon';
    s.pos = 27;
    s.dir = 2;
    s.cells = s.cells.map(() => ({type: '', open: false, flag: false, trap: false}));
    s.cells[s.pos].open = true;
    s.members[0].maxHP = 100;
    s.hp[0] = 1;
    s.members[1].level = 13;
    s.members[1].known = ['flaghp', 'flaghp2', 'jigen'];
    s.members[1].maxMP = s.mp[1] = 40;`);
  g.drain();
  return g;
}

{
  const g = setup();
  const costs = {
    sweep: 5, calfo: 2, dalto: 6, flagkill2: 3, madalto: 7, dial: 3, mamorlis: 4,
    mahalito: 3, lomilwa: 4, matu: 3, dialko: 3, dialma: 5, morlis: 3, mamahalito: 5
  };
  for (const [id, cost] of Object.entries(costs)) {
    assert.equal(g.run(`magic('${id}').mp`), cost, id);
  }
  for (const id of ['flaghp', 'flaghp2', 'jigen']) {
    assert.equal(g.run(`ENEMY_SPELL_IDS.has('${id}')`), false, id);
  }
}

for (const [id, maxHeal, cost] of [['flaghp', 16, 1], ['flaghp2', 24, 4]]) {
  for (const context of ['field', 'battle']) {
    for (const hasTraps of [false, true]) {
      const g = setup();
      if (context === 'battle') {
        g.run("s.enemy = {units: [makeEnemy('goblin', 137)], initiative: 'party', flagEffect: flagEffect()}");
      }
      g.run("s.cells[19].flag = 'guard'; s.cells[20].trap = true");
      if (hasTraps) {
        // 18 and 36 are diagonally adjacent to cell 27. Cell 0 is out of reach.
        g.run("for (const j of [0, 18, 36]) Object.assign(s.cells[j], {flag: 'power', trap: true})");
      }
      const cells = JSON.parse(g.run('JSON.stringify(s.cells)'));
      if (hasTraps) Object.assign(cells[18], {flag: false, trap: false, disarmed: true, open: true});
      g.run('Math.random = () => .999');
      const label = `${id} / ${context} / traps=${hasTraps}`;
      assert.equal(g.run(`castMagic(1, '${id}', 0)`), true, label);
      assert.equal(g.run('s.hp[0]'), 1 + maxHeal, label);
      assert.equal(g.run('s.mp[1]'), 40 - cost, label);
      assert.deepEqual(JSON.parse(g.run('JSON.stringify(s.cells)')), cells, label);
    }
  }
}

// Cells immediately on either side of the center lines, before and after the guardian.
for (const [floor, boss, type, result] of [
  [1, 27, 'boss', '階段はこの階の北西にある。'],
  [2, 45, 'down', '階段はこの階の北東にある。'],
  [9, 77, 'boss', '階段はこの階の南西にある。'],
  [9, 78, 'down', '階段はこの階の南東にある。'],
  [10, 78, 'boss', 'この階に下り階段はない。']
]) {
  const g = setup(floor);
  g.run(`s.pos = 1; s.cells[s.pos].open = true;
    s.boss = ${boss}; s.cells[s.boss].type = '${type}'; s.dumapicUses = 3`);
  for (const remainingMP of [30, 20]) {
    assert.equal(g.run("castMagic(1, 'jigen', null)"), true);
    g.drain();
    assert.equal(g.run('s.logs[0]'), result);
    assert.equal(g.run('s.mp[1]'), remainingMP);
    assert.equal(g.run('s.dumapicUses'), 3);
  }
}
console.log('PASS 137 spell costs, field and battle flag healing, stair quadrants and final floor');
