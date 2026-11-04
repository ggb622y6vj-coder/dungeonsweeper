const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty}=require('../scripts/sim/combat.cjs');
const g=game(null,()=>.5);
createParty(g,[0,1,2]);
g.run(`s.area='dungeon';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(()=>20);let mage=s.members.findIndex((m,i)=>jobOf(i)===1);s.members[mage].intelligence=10;s.members[mage].level=1;s.enemy={dataVersion:1,units:[{...makeEnemy('slime',0),row:17,hp:99},{...makeEnemy('slime',1),row:17,hp:99},{...makeEnemy('wolf',2),row:28,hp:99}],initiative:'party'};s.enemy.units.forEach(e=>e.identified=false);`);
const mage=g.run("s.members.findIndex((m,i)=>jobOf(i)===1)");
assert.equal(g.run("magic('identifyfoe').target"),'all');
// Probability is 49+5*(1-2)=44%; 0 succeeds for every living enemy across all rows.
g.run("Math.random=()=>0;castMagic("+mage+",'identifyfoe',0)");g.drain();
assert.equal(g.run('s.mp['+mage+']'),17);
assert.deepEqual(JSON.parse(g.run('JSON.stringify(s.enemy.units.map(e=>[e.identified,e.identifiedBySpell||false]))')),[[true,true],[true,true],[true,true]]);
assert.match(g.run('s.logs.find(x=>x.includes("不定形の正体を見破った"))'),/不定形の正体を見破った。（→スライム）/);
const saved=g.run("save();localStorage.getItem('ash-v1')");
const resumed=game(saved);
assert.deepEqual(JSON.parse(resumed.run('JSON.stringify(s.enemy.units.map(e=>[e.identified,e.identifiedBySpell||false]))')),[[true,true],[true,true],[true,true]],'battle save/reload preserves identification');
// Failure spends MP, leaves identification fields untouched, and uses the unknown name.
g.run("s.enemy.units.forEach(e=>{e.identified=false;delete e.identifiedBySpell});s.mp["+mage+"]=20;Math.random=()=>.99;castMagic("+mage+",'identifyfoe',2)");g.drain();
assert.equal(g.run('s.mp['+mage+']'),17);
assert.match(g.run('s.logs[0]'),/素早い牙の正体は見破れなかった。/);
assert.deepEqual(JSON.parse(g.run('JSON.stringify(s.enemy.units.map(e=>[e.identified,e.identifiedBySpell||false]))')),[[false,false],[false,false],[false,false]]);
// Already known consumes MP but does not roll or change spell provenance.
g.run("s.enemy.units.forEach(e=>{e.identified=true;s.library.monsters[e.id]={identified:true}});Math.random=()=>{throw Error('should not roll')};castMagic("+mage+",'identifyfoe',2)");g.drain();
assert.equal(g.run('s.mp['+mage+']'),14);assert.equal(g.run('s.logs[0]'),'すでに正体は判明している。');
// Boundary of 49+5*(casterLv-enemyLv), clamped to 5..95 (caster Lv1 vs Lv2 => 44%).
g.run("s.enemy.units.forEach(e=>{e.identified=false;delete e.identifiedBySpell});s.mp["+mage+"]=20;Math.random=()=>.439;castMagic("+mage+",'identifyfoe',2)");g.drain();
assert.equal(g.run('s.enemy.units[2].identified'),true,'43.9 < 44 succeeds');
g.run("s.enemy.units.forEach(e=>{e.identified=false;delete e.identifiedBySpell});Math.random=()=>.441;castMagic("+mage+",'identifyfoe',2)");g.drain();
assert.equal(g.run('s.enemy.units[2].identified'),false,'44.1 >= 44 fails');
g.run("s.members["+mage+"].level=99;Math.random=()=>.951;castMagic("+mage+",'identifyfoe',2)");g.drain();
assert.equal(g.run('s.enemy.units[2].identified'),false,'capped at 95%');
g.run("s.members["+mage+"].level=1;s.members["+mage+"].level=-99;Math.random=()=>.049;castMagic("+mage+",'identifyfoe',2)");g.drain();
assert.equal(g.run('s.enemy.units[2].identified'),true,'floor of 5%');
g.run("s.enemy.units[2].identified=false;Math.random=()=>.051;castMagic("+mage+",'identifyfoe',2)");g.drain();
assert.equal(g.run('s.enemy.units[2].identified'),false,'5.1 >= 5 fails');
g.run("s.members["+mage+"].level=1");
// Automatic IQ x 3% remains independent of spell provenance.
g.run("s.enemy.units.forEach(e=>{e.identified=false;delete e.identifiedBySpell});s.members.forEach(m=>m.intelligence=10);Math.random=()=>0;identifyEnemies()");
assert.deepEqual(JSON.parse(g.run('JSON.stringify(s.enemy.units.map(e=>[e.identified,e.identifiedBySpell||false]))')),[[true,false],[true,false],[true,false]]);
// Library registration has its own log, including when automatic identification
// already revealed the name. Keep the cases isolated by using the wolf row.
function wolfCast(identified, registered, roll){
  g.run(`s.enemy.units[0].hp=s.enemy.units[1].hp=0;s.enemy.units[2].identified=${identified};delete s.enemy.units[2].identifiedBySpell;s.library.monsters.wolf=${registered?'{count:0,identified:true}':'{count:0,seen:true}'};s.logs=[];s.mp[${mage}]=20;Math.random=()=>${roll};castMagic(${mage},'identifyfoe',2)`);g.drain();
  return JSON.parse(g.run('JSON.stringify({logs:s.logs,identified:s.enemy.units[2].identified,bySpell:!!s.enemy.units[2].identifiedBySpell,library:!!s.library.monsters.wolf.identified,mp:s.mp['+mage+']})'));
}
const wolfName=g.run("enemyDefinition('wolf').name"),wolfUnknown=g.run("enemyDefinition('wolf').unknown");
const casterName=g.run(`NAMES[${mage}]`);
let result=wolfCast(false,false,0); // case 1
assert.deepEqual(result.logs.slice(0,3),[`${wolfName}の情報を図書館に記録した。`,`${wolfUnknown}の正体を見破った。（→${wolfName}）`,`${casterName}は識別を唱えた。`]);
assert.equal(result.library,true);assert.equal(result.identified,true);assert.equal(result.mp,17);
result=wolfCast(false,true,0); // case 2
assert.deepEqual(result.logs.slice(0,2),[`${wolfUnknown}の正体を見破った。（→${wolfName}）`,`${casterName}は識別を唱えた。`]);assert.equal(result.library,true);
result=wolfCast(false,false,.99); // case 3
assert.deepEqual(result.logs.slice(0,2),[`${wolfUnknown}の正体は見破れなかった。`,`${casterName}は識別を唱えた。`]);assert.equal(result.library,false);assert.equal(result.identified,false);
result=wolfCast(true,false,0); // case 4
assert.deepEqual(result.logs.slice(0,2),[`${wolfName}の情報を図書館に記録した。`,`${casterName}は識別を唱えた。`]);assert.equal(result.library,true);assert.equal(result.bySpell,true);
result=wolfCast(true,false,.99); // case 5
assert.deepEqual(result.logs.slice(0,2),[`${wolfName}のことは詳しくわからなかった。`,`${casterName}は識別を唱えた。`]);assert.equal(result.library,false);assert.equal(result.identified,true);
result=wolfCast(true,true,0); // case 6
assert.deepEqual(result.logs.slice(0,2),['すでに正体は判明している。',`${casterName}は識別を唱えた。`]);assert.equal(result.library,true);assert.equal(result.mp,17);
console.log('PASS identifyfoe all-row chance, logs, MP, provenance, known-enemy handling and automatic identification');
