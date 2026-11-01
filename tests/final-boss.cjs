const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

const g = game(null, () => .5);
assert.equal(g.run('s.cleared'), false);
assert.equal(g.run("$('#clearedmark').hidden"), true);
g.run(`const recruit=generateRecruit('冒険者',0);
registerRecruit(recruit);changeRecruitParty(recruit.members.id,true);
s.members[0].level=18;s.members[0].maxHP=9999;
Math.random=()=>.999;`);

function startBoss(floor) {
  g.run(`fresh(${floor});s.hp[0]=9999;s.pos=s.boss;encounter(s.pos,true);`);
  g.drain();
  // Real formations and attack/reward paths, with deterministic kills.
  g.run('s.enemy.units.forEach(e=>{e.hp=1;e.sleep=99});');
}
function defeatBoss() {
  let turns = 0;
  const wasCleared = g.run('s.cleared');
  while (g.run('!!s.enemy')) {
    assert.ok(++turns < 30, 'boss battle terminates');
    g.run('attack();');
    if (g.run('!!s.enemy')) {
      assert.equal(g.run('s.clearNotice'), false, 'escorts must also be defeated');
      assert.equal(g.run('s.cleared'), wasCleared, 'boss death alone cannot clear the battle');
      g.drain();
    }
  }
}

g.run(`fresh(10);s.enemy={boss:false,chestBattle:false,units:[{id:'goblin',uid:0,row:0,hp:1}]};attack();`);
g.drain();
assert.equal(g.run('s.cleared'), false, 'ordinary 10F encounters do not clear the game');
startBoss(10);defeatBoss();
assert.equal(g.run('s.cleared'), true);
assert.equal(g.run("s.cells[s.boss].type"), '');
assert.equal(g.run('s.pendingStairs'), false);
assert.equal(g.run('s.done'), false, 'clear permits continued exploration');
assert.equal(g.run("logQueue.at(-1).text"), '迷宮の主は倒れた。迷宮に静寂が戻った……');
assert.equal(g.run("$('#clearresult').hidden"), true, 'clear cannot leak before log playback');
assert.equal(g.run('travelFloor(11)'), false);
assert.equal(g.run('s.floor'), 10);
g.run('enterTown();');
assert.equal(g.run('s.area'), 'dungeon', 'return waits for battle logs');

// Reload the actual ash-v1 payload, including roster migration and startup code.
const saved = g.run("save();localStorage.getItem('ash-v1')");
const restored = game(saved);
assert.equal(restored.run('s.cleared'), true);
assert.equal(restored.run("s.cells[s.boss].type"), '');
assert.equal(restored.run("$('#clearresult').hidden"), false);
g.drain();
assert.equal(g.run("$('#clearresult').hidden"), false);
assert.equal(g.run("$('#cleartown').disabled"), true, 'resolve treasure before returning');
assert.equal(g.run('!!currentChest()'), true, 'boss treasure remains available');
g.run('abandonChest();');g.drain();
assert.equal(g.run("$('#cleartown').disabled"), false);
g.run("$('#cleartown').onclick();");
assert.equal(g.run('s.area'), 'town');
assert.equal(g.run('s.cleared'), true);
assert.equal(g.run('s.clearNotice'), false);
assert.equal(g.run("$('#clearedmark').hidden"), false);
assert.equal(g.run("$('#clearresult').hidden"), true);
const townReload = game(g.run("localStorage.getItem('ash-v1')"));
assert.equal(townReload.run('s.cleared'), true);
assert.equal(townReload.run("$('#clearedmark').hidden"), false);
g.run('enterDungeon();');g.drain();
assert.equal(g.run('s.area'), 'dungeon');
assert.equal(g.run('s.cleared'), true);

startBoss(9);defeatBoss();g.drain();
assert.equal(g.run("s.cells[s.boss].type"), 'down');
assert.equal(g.run('s.pendingStairs'), 'down');
assert.equal(g.run('s.clearNotice'), false);
g.run('answerStairs(true);');
assert.equal(g.run('s.floor'), 10);
assert.equal(g.run('s.cleared'), true, 'new floor preserves global clear flag');
startBoss(10);defeatBoss();g.drain();
assert.equal(g.run('s.clearNotice'), true);
assert.equal(g.run("s.cells[s.boss].type"), '');
g.run('travelFloor(9);');
assert.equal(g.run('s.clearNotice'), false);
assert.equal(g.run('s.cleared'), true, 'cached floor preserves global clear flag');

// Old saves may already contain a down stair or cached floors beyond 10F.
const legacy = JSON.parse(saved);
delete legacy.cleared;delete legacy.clearNotice;
legacy.cells[legacy.boss].type='down';legacy.pendingStairs='down';
legacy.floors[10]={floor:10,cells:structuredClone(legacy.cells)};
legacy.floors[11]={floor:11,cells:structuredClone(legacy.cells)};
const old = game(JSON.stringify(legacy));
assert.equal(old.run('s.cleared'), false);
assert.equal(old.run('s.pendingStairs'), false);
assert.equal(old.run("s.cells[s.boss].type"), '');
assert.equal(old.run("s.floors[10].cells.some(c=>c.type==='down')"), false);
const before = old.run('JSON.stringify(s)');
for (const target of [11,12,0,-1,1.5,NaN,Infinity]) {
  assert.equal(old.run(`travelFloor(${target},true)`), false);
  assert.equal(old.run('JSON.stringify(s)'), before, 'invalid travel leaves state intact');
}
old.run("s.cells[s.boss].type='down';s.relic=true;s.pos=s.boss;s.pendingStairs='down';answerStairs(true);");
assert.equal(old.run('s.floor'), 10, 'even an obsolete stair cannot reach 11F');
legacy.relic=true;legacy.done=true;
const oldDone = game(JSON.stringify(legacy));
assert.equal(oldDone.run("s.cells[s.boss].type"), '', 'legacy relic migration cannot recreate final stairs');
console.log('PASS final boss clear, escort completion, log timing, town/replay, 9F stairs, ash-v1 reload, legacy saves and 11F travel rejection');
