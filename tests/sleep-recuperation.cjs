const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');

const g = game(null, seededRandom(140));
createParty(g, [1, 0, 0]);
g.drain();
const read = expr => JSON.parse(g.run(`JSON.stringify(${expr})`));
g.run(`s.area='dungeon';
  const unit=makeEnemy('slime',0);
  s.enemy={dataVersion:1,units:[unit],flagEffect:{}};
  s.members.forEach((m,i)=>{m.level=[1,5,9][i];m.maxHP=s.hp[i]=100});
  function fixedRolls(...rolls){Math.random=()=>rolls.shift()??.99}`);

// Use attack() so that log frames also pin the timing and order of recovery.
for (const [roll, expected] of [
  [.099999, [0,0,0]], [.10, [1,0,0]], [.499999, [1,0,0]], [.50, [1,2,7]]
]) {
  g.run(`s.enemy.initiative='party';s.commands.fill('guard');
    s.ailments.forEach((a,i)=>a.sleep=[1,2,7][i]);Math.random=()=>${roll};attack()`);
  assert.deepEqual(read('s.ailments.map(a=>a.sleep)'), expected);
  const frames = read('logQueue.map(e=>[e.text,e.ailments.map(a=>a.sleep)])');
  const pending = [1,2,7];
  const wakeFrames = [];
  expected.forEach((value,i)=>{
    if (value === 0) {
      pending[i] = 0;
      wakeFrames.push([`sim${i}は目を覚ました。`, pending.slice()]);
    }
  });
  assert.deepEqual(frames.slice(frames.length-wakeFrames.length), wakeFrames);
  assert.deepEqual(frames[frames.length-wakeFrames.length-1][1], [1,2,7]);
  g.drain();
}
console.log('PASS party sleep recovery at round end, Lv1 and capped boundaries, ordered log snapshots');

g.run("s.enemy.initiative='party';fixedRolls(.99,.10,.499999,.50);flee()");
assert.deepEqual(read('s.ailments.map(a=>a.sleep)'), [1,0,7]);
assert.deepEqual(read('logQueue.map(e=>e.text)'), ['逃走に失敗！','sim1は目を覚ました。']);
g.drain();
g.run('Math.random=()=>0;flee();tickAilments()');
assert.equal(g.run('s.enemy'), null);
assert.deepEqual(read('s.ailments.map(a=>a.sleep)'), [1,0,7]);
assert.ok(!g.run("logQueue.some(e=>e.text.endsWith('目を覚ました。'))"));
g.drain();
console.log('PASS failed escape rolls per sleeper, successful escape and exploration retain sleep');

g.run("s.enemy={dataVersion:1,units:[unit],flagEffect:{}};s.ailments.forEach(a=>a.sleep=0)");
for (const [id, chance] of [['rat',.20], ['slime',.40], ['bat',.50], ['gas',.50]]) {
  g.run(`unit.id='${id}';unit.sleep=1`);
  const name = g.run('enemyDisplay(unit)');
  // Repeated failures with an old positive sleep value never exhaust it.
  for (const roll of [chance, chance, chance-.000001]) {
    g.run(`s.hp.fill(100);fixedRolls(${roll});enemyAction(unit,new Map())`);
    const woke = roll < chance;
    assert.equal(g.run('unit.sleep'), woke ? 0 : 1);
    const frames = read('logQueue.map(e=>[e.text,e.enemy.units[0].sleep,e.hp])');
    assert.deepEqual(frames[0], [name+(woke?'は目を覚ました。':'は眠っている。'), woke?0:1, [100,100,100]]);
    if (woke) {
      assert.match(frames[1][0], /ダメージ。$/);
      assert.ok(g.run('s.hp.some(hp=>hp<100)'));
    } else {
      assert.equal(frames.length, 1);
      assert.deepEqual(read('s.hp'), [100,100,100]);
    }
    g.drain();
  }
}
console.log('PASS enemy sleep persists across skipped turns, Lv1–3 and capped enemies act on waking');

g.run(`unit.id='guardian';unit.identified=true;unit.spellResistNullified=true;
  s.members[0].level=30;s.members[0].known=['katino'];s.mp[0]=10;
  Math.random=()=>0;castMagic(0,'katino',unit.uid)`);
assert.ok(g.run('enemyDefinition(unit.id).boss'));
assert.equal(g.run('unit.sleep'), 0);
assert.equal(g.run('logQueue.at(-1).text'), g.run("enemyDisplay(unit)+'には効かなかった。'"));
console.log('PASS guardian remains immune to sleep after passing spell resistance');
