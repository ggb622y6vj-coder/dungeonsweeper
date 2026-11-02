const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');

const g = game(null, seededRandom(42));
createParty(g, [0, 2, 1]);
g.run(`var foe=makeEnemy('stonegiant',91);
  s.area='dungeon';s.enemy={units:[foe],flagEffect:{}};`);
assert.equal(g.run('monsterLevel(foe)'), 12);
for (const [difference, expected] of [[0,0],[2,0],[3,1],[8,2],[9,3],[30,3],[-2,0],[-3,-1],[-8,-2],[-9,-3],[-30,-3]]) {
  g.run(`s.members[1].level=${12-difference}`);
  assert.equal(g.run('levelHitBonus(foe,1)'), expected, `Lv difference ${difference}`);
}
// The selected victim's current slot matters, including after a full party reorder.
g.run(`s.members.forEach((m,i)=>m.level=[3,12,21][i]);
  var records=partyRecords().reverse();
  for(const key of PARTY_FIELDS)s[key]=structuredClone(records.map(r=>r[key]));`);
assert.equal(g.run('[0,1,2].map(i=>levelHitBonus(foe,i)).join()'), '-3,0,3');
g.run(`records.reverse();for(const key of PARTY_FIELDS)s[key]=structuredClone(records.map(r=>r[key]));`);

// Natural 1/20 override even saturated AC and hit modifiers.
for (const hit of [-100, 100]) for (const ac of [-100, 100]) {
  g.run('Math.random=()=>.999999');
  assert.equal(g.run(`hits(${hit},${ac})`), true);
  g.run('Math.random=()=>0');
  assert.equal(g.run(`hits(${hit},${ac})`), false);
}

// Exercise the real enemyTurn hit call. Isolate physical swings from special
// actions and their consequences; each target keeps identical equipment/AC.
g.run(`monsterAction=()=>false;monsterOnHit=()=>{};log=()=>{};
  var landed=0;monsterHurt=()=>{landed++};
  Math.random=()=>0;var fixedRoll=1;
  dice=(n,d,b=0)=>({value:d===20?fixedRoll:n+b});
  var physicalRate=(id,level,rolls)=>{
    s.members.forEach(m=>m.level=level);
    s.enemy.units=[{...makeEnemy(id,91),row:17}];
    landed=0;
    for(const roll of rolls){fixedRoll=roll;enemyTurn(s.members.map(()=>'fight'))}
    return landed/(rolls.length*enemyDefinition(id).swings);
  };`);
const monsters = JSON.parse(g.run('JSON.stringify(ENEMIES.filter(d=>d.floor===6&&!d.boss&&d.level>=10&&d.level<=12).map(d=>({id:d.id,level:d.level})))'));
assert.equal(monsters.length, 7, 'all seven ordinary 6F monsters');
// A fixed-seed shuffle of balanced d20 samples gives exactly 5% per face,
// avoiding sampling noise at the acceptance interval's 5-point boundary.
const rng = seededRandom(42);
const rolls = Array.from({length:20000}, (_,i)=>i%20+1);
for (let i=rolls.length-1;i>0;i--) {
  const j=Math.floor(rng()*(i+1));[rolls[i],rolls[j]]=[rolls[j],rolls[i]];
}
g.run(`var samples=${JSON.stringify(rolls)}`);
for (const {id,level} of monsters) {
  const low=g.run(`physicalRate('${id}',5,samples)`);
  const matched=g.run(`physicalRate('${id}',12,samples)`);
  const delta=low-matched;
  assert(delta>=.05-1e-12&&delta<=.15+1e-12, `${id}: ${delta*100} points`);
  console.log(`PASS 6F ${id} Lv${level}: party Lv5 ${(low*100).toFixed(2)}%, Lv12 ${(matched*100).toFixed(2)}%, +${(delta*100).toFixed(2)} points`);
  assert.equal(g.run(`physicalRate('${id}',30,[20])`),1,'natural 20 in enemyTurn');
  assert.equal(g.run(`physicalRate('${id}',1,[1])`),0,'natural 1 in enemyTurn');
}
console.log('PASS monster level hit: truncation, clamp, target/reorder, natural 1/20, real enemyTurn and fixed-seed 6F rates');
