// 048: chest and enemy-drop loot go to the first member who can use the item and has room,
// else the first member with room; all full keeps the "full" log.
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty } = require('../scripts/sim/combat.cjs');
const g = game(null, () => .99);
createParty(g, [0, 0, 1, 2]); // fighter, fighter, mage, priest
g.drain();
g.run(`s.area='dungeon';s.floor=1;s.inventory=s.members.map(()=>['sword']);var realRandom=Math.random;`);
function loot(kind, id, inv) {
  return JSON.parse(g.run(`(()=>{${inv ? `s.inventory=${JSON.stringify(inv)};` : ''}let before=logQueue.length;
    let w=weapon('${id}');weightedLoot=()=>w;
    let rolls=${kind === 'chest' ? '[0,.99]' : '[0,.99]'};Math.random=()=>rolls.shift()??.99;
    ${kind === 'chest' ? 'rewardChest({gold:0})' : 'dropWeapon()'};Math.random=realRandom;
    return JSON.stringify({inv:s.inventory.map(a=>a.length),last:s.inventory.map(a=>a.at(-1)),logs:logQueue.slice(before).map(x=>x.text)})})()`));
}
const full = Array(10).fill('sword');
for (const kind of ['chest', 'drop']) {
  const names = JSON.parse(g.run('JSON.stringify(NAMES)'));
  // Mage-only staff goes to the mage (index 2), not the front fighter.
  let r = loot(kind, 'staff', [['sword'], ['sword'], ['sword'], ['sword']]);
  assert.deepEqual(r.inv, [1, 1, 2, 1], kind);
  assert.equal(r.last[2], 'staff');
  assert.ok(r.logs.includes(`杖を入手。${names[2]}が受け取った。`), kind + JSON.stringify(r.logs));
  // Mage full -> first member with room receives (drop is not discarded).
  r = loot(kind, 'staff', [full, ['sword'], full, ['sword']]);
  assert.deepEqual(r.inv, [10, 2, 10, 1], kind);
  assert.ok(r.logs.includes(`杖を入手。${names[1]}が受け取った。`), kind);
  // Usable-class priority uses party order among capable members (two fighters).
  r = loot(kind, 'longsword', [full, ['sword'], ['sword'], ['sword']]);
  assert.deepEqual(r.inv, [10, 2, 1, 1], kind);
  // All full -> full log, nothing added.
  r = loot(kind, 'staff', [full, full, full, full]);
  assert.deepEqual(r.inv, [10, 10, 10, 10], kind);
  assert.ok(r.logs.includes(kind === 'chest' ? 'アイテムがいっぱいで装備品を持ち帰れなかった。' : '杖を見つけたが、アイテムがいっぱいだ。'), kind + JSON.stringify(r.logs));
}
// Medicine (all classes) still goes to the front member with room.
{
  const r = JSON.parse(g.run(`(()=>{s.inventory=[['sword'],['sword'],['sword'],['sword']];let rolls=[0,0];Math.random=()=>rolls.shift()??0;dropMedicine();Math.random=realRandom;return JSON.stringify(s.inventory.map(a=>a.length))})()`));
  assert.deepEqual(r, [2, 1, 1, 1]);
}
console.log('PASS loot recipient: class priority, fallback to any member with room (chest and drop), all-full log, medicine front-first');
