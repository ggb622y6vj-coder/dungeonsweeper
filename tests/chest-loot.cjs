// 108: fixed, enemy-specific chest contents; legacy opening-time rolls remain compatible.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {game} = require('../scripts/sim/harness.cjs');
const plain = (g, code) => JSON.parse(g.run(`JSON.stringify(${code})`));
const tables = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/loot-tables.json'), 'utf8'));
const g = game(null, () => .5);
assert.deepEqual(plain(g, 'LOOT_TABLES'), tables);
const enemies = plain(g, 'ENEMIES');
const definitions = plain(g, '[...WEAPONS,...MEDICINES]');
const byId = new Map(definitions.map(w => [w.id, w]));
assert.equal(tables.version, 1);
assert.deepEqual(Object.keys(tables.monsterGroups).sort(), enemies.map(e => e.id).sort());
for (const group of Object.values(tables.monsterGroups)) assert.ok(Number.isInteger(group) && group >= 1 && group <= 10);
assert.equal(Object.keys(tables.groups).length, 10);
for (const {slots} of Object.values(tables.groups)) {
  assert.equal(slots.length, 3);
  for (const slot of slots) {
    assert.ok(Number.isFinite(slot.chance) && slot.chance >= 0 && slot.chance <= 1);
    assert.ok(tables.pools[slot.pool]);
  }
}
for (const pool of Object.values(tables.pools)) {
  assert.equal(new Set(pool).size, pool.length, 'duplicate IDs would introduce weighting');
  for (const id of pool) assert.ok(byId.has(id), id);
}
for (const id of ['missing', 'toString', '__proto__']) assert.throws(() => g.run(`rollChestItems('${id}',10)`), /Unknown chest monster ID/);
function roll(id, floor, rolls) {
  return plain(g, `(()=>{let values=${JSON.stringify(rolls)};const items=rollChestItems('${id}',${floor},()=>{if(!values.length)throw Error('extra RNG call');return values.shift()});if(values.length)throw Error('unused RNG values');return items})()`);
}
// Group 5 has three nontrivial probabilities. Hit boundary is strictly '<'.
for (let bits = 0; bits < 8; bits++) {
  const rolls = [], expected = [];
  tables.groups[5].slots.forEach((slot, i) => {
    const hit = !!(bits & (1 << i));
    rolls.push(hit ? 0 : slot.chance);
    if (hit) { rolls.push(0); expected.push(tables.pools[slot.pool][0]); }
  });
  assert.deepEqual(roll('sorcerer', 10, rolls), expected, `ABC pattern ${bits}`);
}
assert.deepEqual(roll('sorcerer', 0, [0,0,0]), [], 'empty eligible pools consume no item-selection roll');
// An empty A slot must not prevent a later nonempty slot from drawing.
g.run("var savedPool=LOOT_TABLES.pools.T3;LOOT_TABLES.pools.T3=['holysword']");
assert.deepEqual(roll('sorcerer', 1, [0,0,0,0,0]), ['healingPotion','antidote']);
g.run('LOOT_TABLES.pools.T3=savedPool');
// Walk every equal-sized selection interval, for every slot/group/floor.
// This covers floor thresholds and medicines alongside weapons and all armor parts.
for (const [group, {slots}] of Object.entries(tables.groups)) {
  const monster = Object.keys(tables.monsterGroups).find(id => tables.monsterGroups[id] === +group);
  for (let floor = 1; floor <= 10; floor++) for (let chosen = 0; chosen < 3; chosen++) {
    if (!slots[chosen].chance) continue;
    const eligible = tables.pools[slots[chosen].pool].filter(id => (byId.get(id).minFloor ?? 1) <= floor);
    eligible.forEach((id, n) => {
      const rolls = [], expected = [];
      slots.forEach((slot, i) => {
        const hit = i === chosen || slot.chance === 1;
        rolls.push(hit ? 0 : slot.chance);
        if (hit) {
          const pool = tables.pools[slot.pool].filter(id => (byId.get(id).minFloor ?? 1) <= floor);
          if (pool.length) { rolls.push(i === chosen ? (n + .5) / eligible.length : 0); expected.push(i === chosen ? id : pool[0]); }
        }
      });
      assert.deepEqual(roll(monster, floor, rolls), expected);
    });
  }
}
// Use distinct one-item pools to observe each slot separately even when B/C share T5.
// Only pool names change; the real group's three probabilities and production roller run 100k times.
g.run(`function mulberry32(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
 var slotMarkers=['sword','cap','antidote'];slotMarkers.forEach((id,i)=>LOOT_TABLES.pools['test'+i]=[id]);`);
for (const [group, {slots}] of Object.entries(tables.groups)) {
  const monster = Object.keys(tables.monsterGroups).find(id => tables.monsterGroups[id] === +group);
  const counts = plain(g, `(()=>{const slots=LOOT_TABLES.groups[${group}].slots,old=slots.map(s=>s.pool),counts=[0,0,0],rng=mulberry32(108+${group});try{
    slots.forEach((s,i)=>s.pool='test'+i);
    for(let n=0;n<100000;n++)for(const id of rollChestItems('${monster}',10,rng))counts[slotMarkers.indexOf(id)]++;
    return counts;
  }finally{slots.forEach((s,i)=>s.pool=old[i])}})()`);
  counts.forEach((count, i) => assert.ok(Math.abs(count/100000 - slots[i].chance) < .006, `group ${group}, slot ${i}: ${count}`));
}
g.run("slotMarkers.forEach((_,i)=>delete LOOT_TABLES.pools['test'+i])");
assert.deepEqual(plain(g, 'LOOT_TABLES'), tables);
console.log('PASS chest loot: data parity, all enemies/items, ABC 8 patterns, empty pools, uniform floor filtering, 100k/group slot rates');

function party(job=3) {
  const t = game(null, () => .5);
  t.run(`for(const [i,job] of [0,1,${job}].entries()){const r=generateRecruit('冒険者'+i,job===6?3:job);registerRecruit(r);changeRecruitParty(r.members.id,true)}s.members[2].job=${job};enterDungeon()`);
  t.drain();
  return t;
}
function fixedChest(t, items, extra={}) {
  t.run(`s.cells[s.pos].chest=${JSON.stringify({gold:7,opened:false,trap:'none',rewardVersion:1,lootGroup:5,items,...extra})};s.logs=[];render()`);
}
// Encounter snapshots formation[0], including when that group escapes and summoned units remain.
let t = party();
t.run("fresh(10);s.area='dungeon';s.cells[s.pos].type='';s.cells[s.pos].open=false;var formation=monsterFormation;monsterFormation=()=>['sorcerer','slime'];encounter(s.pos,true);monsterFormation=formation");
t.drain();
assert.equal(t.run('s.enemy.lootMonsterId'), 'sorcerer');
t = game(t.run("save();localStorage.getItem('ash-v1')"), () => .5);t.drain();
assert.equal(t.run('s.enemy.lootMonsterId'), 'sorcerer');
t.run(`s.enemy.units.push({...makeEnemy('slime',999),row:1});
 for(const e of s.enemy.units){e.hp=0;if(e.row===0){e.rewarded=true;e.escaped=true}else killReward(e)}
 s.enemy.units.reverse();var expectedGold=s.enemy.pendingGold;`);
const expectedGold = t.run('expectedGold');
const wanted = ['powerstaff','healingPotion','antidote'];
const generationRolls = tables.groups[5].slots.flatMap((slot, i) => [0,(tables.pools[slot.pool].indexOf(wanted[i])+.5)/tables.pools[slot.pool].length]);
t.run(`var rolls=${JSON.stringify([...generationRolls,.99])};Math.random=()=>{if(!rolls.length)throw Error('extra generation roll');return rolls.shift()};finishMonsterBattle()`);
assert.equal(t.run('rolls.length'),0);
assert.equal(t.run('s.enemy'),null);
assert.deepEqual(plain(t,'currentChest().items'),wanted);
assert.equal(t.run('currentChest().lootGroup'),5);
assert.equal(t.run('currentChest().gold'),expectedGold);
t.drain();
// Rendering, archive cloning/restoration, full state clone, and actual roster reload keep contents.
t.run("Math.random=()=>{throw Error('reroll after generation')};render();rememberFloor();s.cells=structuredClone(s.floors[s.floor].cells);s=structuredClone(s);render()");
const saved = t.run("save();localStorage.getItem('ash-v1')");
for (const opener of ['openChest','thiefOpenChest']) {
  const u = game(saved, () => .99);u.drain();
  assert.deepEqual(plain(u,'currentChest().items'),wanted);
  const gold = u.run('s.gold');
  const before = plain(u,'s.inventory');
  u.run(`var calls=0;Math.random=()=>{calls++;${opener==='thiefOpenChest' ? "if(calls===1)return 0;" : ''}throw Error('opening rerolled contents')};${opener}()`);
  u.drain();
  const after = plain(u,'s.inventory');
  assert.deepEqual(after[0],before[0].concat(wanted.slice(1)));
  assert.deepEqual(after[1],before[1].concat(wanted[0]));
  assert.deepEqual(after[2],before[2]);
  assert.equal(u.run('s.gold'),gold+expectedGold*3);
  for(const id of wanted) assert.equal(u.run(`s.library.items['${id}']`),true);
  assert.equal(u.run('currentChest()'),null);
  u.run(`${opener}();openChest();thiefOpenChest();rewardChest(s.cells[s.pos].chest)`);u.drain();
  assert.deepEqual(plain(u,'s.inventory'),after);
  assert.equal(u.run('s.gold'),gold+expectedGold*3);
  const reloaded = game(u.run("save();localStorage.getItem('ash-v1')"), () => .99);reloaded.drain();
  reloaded.run('openChest();thiefOpenChest()');reloaded.drain();
  assert.deepEqual(plain(reloaded,'s.inventory'),after);
  assert.equal(reloaded.run('s.gold'),gold+expectedGold*3);
}
// Empty/new contents never run either legacy loot function or a medicine roll.
t = party();fixedChest(t,[]);
const before = plain(t,'s.inventory');
t.run("chestItemPool=weightedLoot=dropMedicine=()=>{throw Error('legacy loot used')};Math.random=()=>{throw Error('opening RNG')};openChest()");t.drain();
assert.deepEqual(plain(t,'s.inventory'),before);
assert.equal(t.run('s.gold'),21);
fixedChest(t,['unknown','healingPotion','not-an-item','staff']);
t.run('openChest()');t.drain();
assert.equal(t.run('s.inventory[0].at(-1)'),'healingPotion');
assert.equal(t.run('s.inventory[1].at(-1)'),'staff');
assert.equal(t.run("Object.hasOwn(s.library.items,'unknown')"),false);
// Ordered distribution: a partial stack accepts its last item at 10 slots, then fallback,
// and full inventories never register an unreceived item in the library.
t = party();
t.run("s.inventory=[Array(9).fill('sword').concat(Array(9).fill('healingPotion')),Array(10).fill('staff'),Array(9).fill('dagger')];s.library.items={}");
fixedChest(t,['healingPotion','healingPotion','elixir']);
t.run('openChest()');t.drain();
assert.equal(t.run("s.inventory[0].filter(id=>id==='healingPotion').length"),10);
assert.equal(t.run('s.inventory[2].at(-1)'),'healingPotion');
assert.equal(t.run('s.library.items.healingPotion'),true);
assert.equal(t.run('s.library.items.elixir'),undefined);
assert.equal(t.run("s.logs.filter(l=>l==='霊薬を見つけたが、アイテムがいっぱいだ。').length"),1);
// Same ID in multiple slots remains multiple rewards, respecting stack capacity.
t = party();fixedChest(t,['antidote','antidote','antidote']);t.run('openChest()');t.drain();
assert.equal(t.run("s.inventory[0].filter(id=>id==='antidote').length"),3);
// Ninja uses the same fixed reward path; failure and abandonment still lose all rewards.
for(const [job,action,random,success] of [[6,'thiefOpenChest',.749,true],[6,'thiefOpenChest',.75,false],[3,'thiefOpenChest',.849,true],[3,'thiefOpenChest',.85,false],[3,'abandonChest',0,false]]) {
  t = party(job);fixedChest(t,['antidote']);
  t.run(`Math.random=()=>${random};${action}()`);t.drain();
  assert.equal(t.run('s.gold'),success?21:0);
  assert.equal(t.run('s.library.items.antidote')===true,success);
  assert.equal(t.run('currentChest()'),null);
}
// Old unfinished battles (pre-108) can still finish using their first original unit.
t=party();t.run("s.enemy={chestBattle:true,units:[{id:'slime',row:0,hp:0,rewarded:true}],pendingGold:7};finishMonsterBattle()");t.drain();
assert.equal(t.run('currentChest().rewardVersion'),1);
assert.equal(t.run('currentChest().lootGroup'),1);
// Legacy chest: real weighted table + independent medicine draw, once only.
t=party();
t.run("s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};var legacyItem=chestItemPool(1)[0].item.id;var rolls=[0,0,0,0];Math.random=()=>{if(!rolls.length)throw Error('extra legacy roll');return rolls.shift()};openChest()");t.drain();
assert.equal(t.run('rolls.length'),0);
assert.equal(t.run('s.gold'),21);
assert.equal(t.run('s.inventory.flat().filter(id=>id===legacyItem).length'),t.run("['sword','staff','dagger'].includes(legacyItem)?2:1"));
assert.equal(t.run('s.library.items.healingPotion'),true);
const legacyInv=plain(t,'s.inventory');t.run('openChest();thiefOpenChest();rewardChest(s.cells[s.pos].chest)');t.drain();
assert.deepEqual(plain(t,'s.inventory'),legacyInv);
assert.equal(t.run('s.gold'),21);
console.log('PASS chest loot: encounter ID, generation/save/archive/reload, both opening paths, fixed/empty/unknown items, stacking/full/library, old saves and no double awards');
