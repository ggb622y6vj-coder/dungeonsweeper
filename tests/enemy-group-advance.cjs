const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty } = require('../scripts/sim/combat.cjs');

const g = game(null, () => .64);
createParty(g, [0, 0]);
g.drain();
const read = expr => JSON.parse(g.run(`JSON.stringify(${expr})`));

g.run(`s.area='dungeon';
  s.enemy={units:[],spellLevels:{'row/7':{mage:0,priest:0}}};
  function strength(id, units){
    s.enemy.units=units.map(e=>({id,row:7,...e}));
    return groupAdvanceStrength(enemyGroups()[0]);
  }`);
assert.equal(g.run(`strength('sorcerer', [
  {hp:45,poison:true,silence:true},{hp:5},{hp:0},
  {hp:100,sleep:1},{hp:100,paralysis:1},{hp:100,stone:true},{hp:100,fear:1}])`), 20);
assert.equal(g.run("strength('darkpriest',[{hp:30}])"), 21);
assert.equal(g.run("strength('sorcerer',[{hp:1},{hp:2}])"), 0);
assert.equal(g.run("strength('slime',[{hp:5,fear:1}])"), 0);
console.log('PASS advance strength uses current HP, both master spell schools, actionable units and a group-level floor');

// Exercise the actual comparison on both sides of each probability boundary.
for (const [rear, front, chance] of [[10,0,.95], [0,0,.51], [100,1,.95], [10,20,.41], [0,20,.31]]) {
  for (const [roll, expected] of [[chance - .000001, [8,3]], [chance + .000001, [3,8]]]) {
    g.run(`s.enemy.units=[{id:'slime',uid:1,row:3,hp:${front || 1},sleep:${!front}},
                          {id:'wolf',uid:2,row:8,hp:${rear || 1},sleep:${!rear}}];
      Math.random=()=>${roll};advanceEnemyGroups()`);
    assert.deepEqual(read('enemyGroups().map(g=>g.key)'), expected);
    assert.deepEqual(read('logQueue.map(e=>e.text)'), expected[0] === 8 ? ['素早い牙が前に出た。'] : []);
    g.drain();
  }
}
g.run(`s.enemy.units=[{id:'slime',uid:1,row:8,hp:8}];
  Math.random=()=>{throw Error('one group consumed a roll')};advanceEnemyGroups()`);
assert.deepEqual(read('enemyGroups().map(g=>g.key)'), [8]);
assert.equal(g.run('logQueue.length'), 0);
console.log('PASS advance chance boundaries, unknown display name and single-group no-op');

// The first unit of row 3 was defeated before row 3's next member entered view.
// Tail summons belong to existing groups, including the group that advances twice.
g.run(`s.enemy.units=[
    {id:'wolf',uid:0,row:3,hp:0,rewarded:true},
    {id:'rat',uid:1,row:55,hp:0,rewarded:true,escaped:true},
    {id:'slime',uid:2,row:71,hp:90},
    {id:'wolf',uid:3,row:3,hp:1},
    {id:'goblin',uid:4,row:19,hp:120,identified:true},
    {id:'slime',uid:5,row:71,hp:10},
    {id:'goblin',uid:6,row:19,hp:80,identified:true}];
  initEnemySpellState();s.enemy.spellLevels['row/3'].mage=2;s.attackRows=[3,19];
  var advanceRolls=[.64,.64];
  Math.random=()=>{if(!advanceRolls.length)throw Error('extra pair');return advanceRolls.shift()};`);
const membership = 's.enemy.units.slice().sort((a,b)=>a.uid-b.uid)';
const units = read(membership), levels = read('s.enemy.spellLevels');
g.run('advanceEnemyGroups()');
assert.equal(g.run('advanceRolls.length'), 0);
assert.deepEqual(read('enemyGroups().map(g=>[g.key,g.units.map(e=>e.uid)])'), [[19,[4,6]],[71,[2,5]],[3,[0,3]]]);
assert.deepEqual(read(membership), units);
assert.deepEqual(read('s.enemy.spellLevels'), levels);
assert.deepEqual(read('s.attackRows'), [3,19]);
assert.deepEqual(read('reachableEnemyGroups(0).map(g=>g.key)'), [19,71]);
assert.equal(g.run('selectedEnemy(1).uid'), 4);
assert.deepEqual(read('logQueue.map(e=>e.text)'), ['ゴブリンが前に出た。','ゴブリンが前に出た。']);
g.drain();
console.log('PASS advance compares updated adjacent rows from the rear and preserves units, summons, spell levels and target IDs');

for (const boss of [false, true]) {
  g.run(`Math.random=()=>0;s.watchful=true;s.cells[s.pos].type=${boss ? "'boss'" : "''"};
    monsterFormation=boss=>[boss?'guardian':'sorcerer','wolf','goblin'];
    encounter(s.pos,true)`);
  assert.deepEqual(read('enemyGroups().map(g=>g.key)'), [0,1,2]);
  assert.equal(g.run("logQueue.filter(e=>e.text.endsWith('が前に出た。')).length"), 0);
  g.drain();

  g.run(`s.commands.fill('guard');s.enemy.initiative='party';s.ailments[0].fear=1;
    s.enemy.units.forEach(e=>{e.hp=100;e.identified=true});
    Math.random=()=>0;
    var frames=[],baseRender=render;
    render=function(options){
      baseRender(options);
      if(options?.logPrepended)frames.push({
        text:s.logs[0],rows:enemyGroups(visibleCombat()).map(g=>g.key),
        scene:document.querySelector('#scene').innerHTML
      });
    };
    attack()`);
  assert.deepEqual(read('enemyGroups().map(g=>g.key)'), [2,0,1]);
  assert.deepEqual(read('enemyGroups(visibleCombat()).map(g=>g.key)'), [0,1,2]);
  g.drain();
  const rows = [[0,1,2], [0,2,1], [2,0,1]];
  const icons = read('Object.fromEntries(enemyGroups().map(g=>[g.key,g.units[0].uid]))');
  const frames = read('frames');
  assert.deepEqual(frames.slice(-3).map(f=>f.text), ['sim0は落ち着きを取り戻した。','ゴブリンが前に出た。','ゴブリンが前に出た。']);
  let advances = 0;
  for (const frame of frames) {
    if (frame.text === 'ゴブリンが前に出た。') advances++;
    assert.deepEqual(frame.rows, rows[advances]);
    assert.ok(frame.scene.includes(`${frame.rows.indexOf(2)+1}：ゴブリン ×`));
    assert.deepEqual(Array.from(frame.scene.matchAll(/data-enemy-uid="(\d+)"/g), m=>Number(m[1])), frame.rows.slice(0,2).map(row=>icons[row]));
  }
  assert.equal(advances, 2);
  g.run('render=baseRender');
}
console.log('PASS ordinary and guardian rounds advance only at round end, with synchronized visibleCombat, scene list and icons');

// Pre-108 battles have no lootMonsterId. Their original first monster keeps its uid.
g.run('delete s.enemy.lootMonsterId;save()');
const loaded = game(g.run("localStorage.getItem('ash-v1')"), () => .99);
assert.deepEqual(Array.from(loaded.run('enemyGroups().map(g=>g.key)')), [2,0,1]);
loaded.run('s.enemy.units.forEach(e=>{e.hp=0;killReward(e)});finishMonsterBattle()');
assert.equal(loaded.run('currentChest().lootGroup'), loaded.run('LOOT_TABLES.monsterGroups.guardian'));
console.log('PASS save restores advanced order and legacy chest keeps the encounter leader’s loot group');
