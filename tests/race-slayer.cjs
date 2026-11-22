// 126: exercise the complete physical damage path with real equipment and enemies.
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty } = require('../scripts/sim/combat.cjs');

function damage(weapon, target, { ambush = false, cursedFlag = false, roll = .99 } = {}) {
  const g = game(null, () => .5);
  createParty(g, [ambush ? 3 : 0]);
  g.drain();
  g.run(`s.area='dungeon';
    s.members[0].str=10;
    s.inventory[0]=[${JSON.stringify(weapon)}];s.equipped[0]=0;
    s.enemy={units:[{...makeEnemy(${JSON.stringify(target)},0),hp:100,row:7}],
      hiddenIds:${ambush ? '[s.members[0].id]' : '[]'},
      flagEffect:{counts:{},curses:${cursedFlag ? "['power']" : '[]'},bad:${cursedFlag}}};
    s.enemy.weaponEffects=snapshotWeaponEffects(s.pos);
    s.commands[0]=${ambush ? "'ambush'" : "'fight'"};s.attackRows[0]=7;
    Math.random=()=>${roll};partyAction(0);`);
  return 100 - g.run('s.enemy.units[0].hp');
}

// Strength 10 has no bonus. At .99 a single hit with either 1d6+2 weapon deals 8.
assert.equal(damage('sickle', 'takenoko'), 16);
assert.equal(damage('sickle', 'slime'), 8);
assert.equal(damage('sickle', 'takenoko', { ambush: true }), 32);
assert.equal(damage('sword', 'takenoko'), 8);
assert.equal(damage('sickle', 'takenoko', { ambush: true, roll: 0 }), 0);
// The cursed power flag rounds 8 × .65 down to 5 before both multipliers.
assert.equal(damage('sickle', 'takenoko', { ambush: true, cursedFlag: true }), 20);
console.log('PASS race slayer: plant and non-plant hits, ordinary weapon, ambush, miss and flag rounding');

// At .99 the spear rolls 8 + 8 + 4 before the race multiplier.
assert.equal(damage('dragonslayerspear', 'dragon'), 40);
assert.equal(damage('dragonslayerspear', 'slime'), 20);
console.log('PASS race slayer: dragon-slaying spear doubles damage only against dragons');
