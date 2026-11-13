// 110: rank-based chest selection; fixed contents and legacy opening remain compatible.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {game} = require('../scripts/sim/harness.cjs');
const plain = (g, code) => JSON.parse(g.run(`JSON.stringify(${code})`));
const tables = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/loot-tables.json'), 'utf8'));
const g = game(null, () => .5);
assert.deepEqual(plain(g, 'LOOT_TABLES'), tables);
const enemies = plain(g, 'ENEMIES');
const equipment = plain(g, 'WEAPONS'), medicines = plain(g, 'MEDICINES');
const byId = new Map([...equipment, ...medicines].map(w => [w.id, w]));
assert.equal(equipment.length, 76);
for (const w of equipment) assert.ok(Number.isInteger(w.lootRank) && w.lootRank >= 1 && w.lootRank <= 5, w.id);
for (const w of medicines) assert.equal(Object.hasOwn(w, 'lootRank'), false, w.id);
assert.equal(tables.version, 1);
assert.equal(enemies.length, 100);
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
assert.deepEqual(Object.keys(tables.pools), ['T1','T2','T3','T4','T5']);
for (const pool of Object.values(tables.pools)) assert.equal(new Set(pool.medicineIds).size, pool.medicineIds.length);
g.run('validateLootTables()');
// Exercise validation at script load, not only when a bad tier happens to win.
const lootSource = fs.readFileSync(path.join(__dirname, '../dist/loot.js'), 'utf8');
for (const [label, change, error, weapons = equipment] of [
  ['negative weight', p => p.rankWeights[1] = -1, /Invalid rank weight/],
  ['fractional weight', p => p.rankWeights[1] = .5, /Invalid rank weight/],
  ['nonfinite weight', p => p.rankWeights[1] = Infinity, /Invalid rank weight/],
  ['invalid rank', p => p.rankWeights[6] = 1, /Invalid rank weight/],
  ['negative medicine share', p => p.medicineShare = -.1, /Invalid medicineShare/],
  ['medicine share one', p => p.medicineShare = 1, /Invalid medicineShare/],
  ['medicine share above one', p => p.medicineShare = 1.1, /Invalid medicineShare/],
  ['nonfinite medicine share', p => p.medicineShare = NaN, /Invalid medicineShare/],
  ['unknown medicine', p => p.medicineIds.push('missing'), /Invalid medicine ID/],
  ['equipment as medicine', p => p.medicineIds.push('sword'), /Invalid medicine ID/],
  ['empty medicines', p => p.medicineIds = [], /Missing medicine candidates/],
  ['missing medicines', p => delete p.medicineIds, /Missing medicine candidates/],
  ['empty positive rank', () => {}, /Missing rank equipment/, equipment.filter(w => w.lootRank !== 1)],
]) {
  const invalid = structuredClone(tables);change(invalid.pools.T1);
  const source = lootSource.replace(/const LOOT_TABLES = [\s\S]*?\n};/, `const LOOT_TABLES = ${JSON.stringify(invalid)};`);
  assert.throws(() => vm.runInNewContext(source, {WEAPONS: weapons, MEDICINES: medicines}), error, label);
}
for (const id of ['missing', 'toString', '__proto__']) assert.throws(() => g.run(`rollChestItems('${id}',10)`), /Unknown chest monster ID/);
function roll(id, floor, rolls) {
  return plain(g, `(()=>{let values=${JSON.stringify(rolls)};const items=rollChestItems('${id}',${floor},()=>{if(!values.length)throw Error('extra RNG call');return values.shift()});if(values.length)throw Error('unused RNG values');return items})()`);
}
// Construct independent midpoints for every medicine and every item in each weighted rank.
function selections(pool) {
  const cases = pool.medicineIds.map((id, i) => ({id, rolls: [pool.medicineShare / 2, (i + .5) / pool.medicineIds.length]}));
  const total = Object.values(pool.rankWeights).reduce((a, b) => a + b, 0);
  let start = 0;
  for (const [rank, weight] of Object.entries(pool.rankWeights)) {
    if (weight > 0) {
      const items = equipment.filter(w => w.lootRank === +rank);
      items.forEach((w, i) => cases.push({id: w.id, rolls: [pool.medicineShare, (start + weight / 2) / total, (i + .5) / items.length]}));
    }
    start += weight;
  }
  return cases;
}
function selection(pool, id) {
  const chosen = selections(pool).find(c => c.id === id);
  assert.ok(chosen, `${id} must be reachable`);
  return chosen.rolls;
}
// Group 5 has three nontrivial probabilities. Hit boundary is strictly '<'.
for (let bits = 0; bits < 8; bits++) {
  const rolls = [], expected = [];
  tables.groups[5].slots.forEach((slot, i) => {
    const hit = !!(bits & (1 << i));
    rolls.push(hit ? 0 : slot.chance);
    if (hit) { rolls.push(0, 0); expected.push(tables.pools[slot.pool].medicineIds[0]); }
  });
  assert.deepEqual(roll('sorcerer', 10, rolls), expected, `ABC pattern ${bits}`);
}
// All 100 mappings must use their group's tiers, including zero-chance slots.
for (const [monster, group] of Object.entries(tables.monsterGroups)) {
  const rolls = [], expected = [];
  for (const slot of tables.groups[group].slots) {
    rolls.push(0);
    if (slot.chance) { rolls.push(0, 0); expected.push(tables.pools[slot.pool].medicineIds[0]); }
  }
  assert.deepEqual(roll(monster, 1, rolls), expected, monster);
}
// A zero-total, zero-medicine tier is valid and consumes only its slot's win draw.
g.run(`var savedPools=structuredClone(LOOT_TABLES.pools);
 var emptyTier={medicineShare:0,rankWeights:{1:0,2:0,3:0,4:0,5:0},medicineIds:[]};
 for(const tier of ['T3','T4','T5'])LOOT_TABLES.pools[tier]=structuredClone(emptyTier);
 validateLootTables()`);
assert.deepEqual(roll('sorcerer', 1, [0,0,0]), []);
g.run('LOOT_TABLES.pools=structuredClone(savedPools);LOOT_TABLES.pools.T3=emptyTier');
assert.deepEqual(roll('sorcerer', 1, [0,0,0,0,0,0,0]), [tables.pools.T4.medicineIds[0],tables.pools.T5.medicineIds[0]]);
g.run('LOOT_TABLES.pools=structuredClone(savedPools)');
// Walk all medicines and every item of every positive rank in every active slot/group/floor.
const t1Reached = new Set();
for (const [group, {slots}] of Object.entries(tables.groups)) {
  const monster = Object.keys(tables.monsterGroups).find(id => tables.monsterGroups[id] === +group);
  for (let floor = 1; floor <= 10; floor++) for (let chosen = 0; chosen < 3; chosen++) {
    if (!slots[chosen].chance) continue;
    for (const candidate of selections(tables.pools[slots[chosen].pool])) {
      const rolls = [], expected = [];
      slots.forEach((slot, i) => {
        const hit = i === chosen || slot.chance === 1;
        rolls.push(hit ? 0 : slot.chance);
        if (hit) {
          rolls.push(...(i === chosen ? candidate.rolls : [0,0]));
          expected.push(i === chosen ? candidate.id : tables.pools[slot.pool].medicineIds[0]);
        }
      });
      const actual = roll(monster, floor, rolls);
      assert.deepEqual(actual, expected, `${monster}/${slots[chosen].pool}/${floor}/${candidate.id}`);
      if (slots[chosen].pool === 'T1') actual.forEach(id => t1Reached.add(id));
    }
  }
}
assert.ok(t1Reached.size > 0);
for (const id of t1Reached) assert.notEqual(byId.get(id).lootRank, 3, `T1 cannot produce rank 3: ${id}`);
assert.ok(equipment.some(w => w.lootRank === 5 && w.minFloor > 1)); // the walk includes these on floor 1
// Explicit medicine/rank boundaries and zero weights, including at RNG=0.
g.run('LOOT_TABLES.pools.T1={medicineShare:.25,medicineIds:["antidote"],rankWeights:{1:0,2:1,3:0,4:3,5:0}};validateLootTables()');
assert.deepEqual(roll('rat', 1, [0,.25-Number.EPSILON,0,0,0]), ['antidote']);
for (const [value, rank] of [[0,2],[.25-Number.EPSILON,2],[.25,4],[1-Number.EPSILON,4]]) {
  const items = equipment.filter(w => w.lootRank === rank);
  assert.deepEqual(roll('rat', 1, [0,.25,value,0,0,0]), [items[0].id]);
  assert.deepEqual(roll('rat', 1, [0,.25,value,1-Number.EPSILON,0,0]), [items.at(-1).id]);
}
g.run('LOOT_TABLES.pools=structuredClone(savedPools)');
g.run('function mulberry32(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}');
// Each tier: 100k won slots through the production roller, measuring both branches and every item.
for (const [tier, pool] of Object.entries(tables.pools)) {
  const counts = plain(g, `(()=>{const old=LOOT_TABLES.groups[1].slots,counts={},rng=mulberry32(110+${+tier.slice(1)});try{
    LOOT_TABLES.groups[1].slots=[{chance:1,pool:'${tier}'},...old.slice(1)];
    for(let n=0;n<100000;n++){const items=rollChestItems('rat',1,rng);if(items.length!==1)throw Error('expected one item');const id=items[0];counts[id]=(counts[id]||0)+1}
    return counts;
  }finally{LOOT_TABLES.groups[1].slots=old}})()`);
  const near = (actual, expected, label, tolerance=.006) => assert.ok(Math.abs(actual/100000-expected) < tolerance, `${tier}/${label}: ${actual/100000} vs ${expected}`);
  near(pool.medicineIds.reduce((sum,id)=>sum+(counts[id]||0),0), pool.medicineShare, 'medicineShare');
  const total = Object.values(pool.rankWeights).reduce((a,b)=>a+b,0);
  for (let rank=1;rank<=5;rank++) {
    const items = equipment.filter(w=>w.lootRank===rank);
    const expected = (1-pool.medicineShare)*(pool.rankWeights[rank]||0)/total;
    near(items.reduce((sum,w)=>sum+(counts[w.id]||0),0),expected,`rank ${rank}`);
    for (const w of items) near(counts[w.id]||0,expected/items.length,w.id,.003);
  }
  for (const id of pool.medicineIds) near(counts[id]||0,pool.medicineShare/pool.medicineIds.length,id,.003);
  const reachable = new Set(selections(pool).map(c=>c.id));
  for (const id of Object.keys(counts)) {
    assert.ok(reachable.has(id), `${tier}: unexpected ${id}`);
    if (tier==='T1') assert.notEqual(byId.get(id).lootRank,3,id);
  }
}
// Distinct single-rank tiers let us observe each slot even when B/C share T5.
g.run(`for(let i=0;i<3;i++)LOOT_TABLES.pools['test'+i]={medicineShare:0,medicineIds:[],rankWeights:{[i+1]:1}};validateLootTables()`);
for (const [group, {slots}] of Object.entries(tables.groups)) {
  const monster = Object.keys(tables.monsterGroups).find(id => tables.monsterGroups[id] === +group);
  const counts = plain(g, `(()=>{const slots=LOOT_TABLES.groups[${group}].slots,old=slots.map(s=>s.pool),counts=[0,0,0],rng=mulberry32(108+${group});try{
    slots.forEach((s,i)=>s.pool='test'+i);
    for(let n=0;n<100000;n++)for(const id of rollChestItems('${monster}',10,rng))counts[WEAPONS.find(w=>w.id===id).lootRank-1]++;
    return counts;
  }finally{slots.forEach((s,i)=>s.pool=old[i])}})()`);
  counts.forEach((count, i) => assert.ok(Math.abs(count/100000 - slots[i].chance) < .006, `group ${group}, slot ${i}: ${count}`));
}
g.run('LOOT_TABLES.pools=structuredClone(savedPools)');
assert.deepEqual(plain(g, 'LOOT_TABLES'), tables);
console.log('PASS chest loot: data validation/parity, 100 mappings, ABC 8 patterns, empty tiers, all rank/medicine candidates on every floor, T1 excludes R3, 100k/tier and group rates');

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
const generationRolls = tables.groups[5].slots.flatMap((slot, i) => [0,...selection(tables.pools[slot.pool],wanted[i])]);
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
console.log('PASS chest loot: rank rewards fixed at generation, encounter ID, save/archive/reload/no reroll, both opening paths, fixed/empty/unknown items, stacking/full/library, old saves and no double awards');
