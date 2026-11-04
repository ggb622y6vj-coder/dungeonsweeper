// 069: 呪いを解く targets one chosen row; each undead rolls separately; only undead rows selectable.
const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty}=require('../scripts/sim/combat.cjs');
const g=game(null,()=>.99);createParty(g,[0,2,2]);g.drain();
const P=g.run('s.members.findIndex((m,i)=>jobOf(i)===2)');
const J=c=>JSON.parse(g.run(`JSON.stringify(${c})`));
function setup(units){g.drain();g.run(`s.area='dungeon';s.done=false;s.logs=[];logQueue=[];s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>freshAilments());s.members.forEach(m=>m.level=12);
 s.enemy={initiative:'party',units:${JSON.stringify(units)}};s.commands=s.members.map(()=>'guard');s.dispelRows=s.members.map(()=>null)`)}
const u=(uid,id,row)=>({id,uid,row,hp:20});
const MIX=[u(1,'skeleton',7),u(2,'skeleton',7),u(3,'wolf',23),u(4,'skeleton',39)];
const hp=()=>J('s.enemy.units.map(e=>e.hp)');
const logs=()=>J('s.logs.concat(logQueue.map(x=>x.text))');
// Only rows with living undead are choices (wolf row 23 is not).
setup(MIX);assert.deepEqual(J('livingUndeadGroups().map(g=>g.key)').map(String),['7','39']);
g.run("choosingRow='dispel'");assert.deepEqual(J(`rowChoiceGroups(${P}).map(g=>String(g.key))`),['7','39']);g.run("choosingRow=true");
assert.ok(J(`rowChoiceGroups(${P}).map(g=>String(g.key))`).includes('23'),'fight row choice still includes non-undead rows');g.run('choosingRow=false');
// Chosen row only: row 7 dies, row 39 and the wolf are untouched.
setup(MIX);g.run(`s.dispelRows[${P}]=7;Math.random=()=>0;dispelUndead(${P})`);assert.deepEqual(hp(),[0,0,20,20]);
assert.equal(logs().filter(t=>t.endsWith('は消え去った。')).length,2);
// Choosing the rear undead row leaves the front row alone.
setup(MIX);g.run(`s.dispelRows[${P}]=39;Math.random=()=>0;dispelUndead(${P})`);assert.deepEqual(hp(),[20,20,20,0]);
// Per-undead rolls in one row of three: [0,.99,0] removes the 1st and 3rd only.
setup([u(1,'skeleton',7),u(2,'skeleton',7),u(3,'skeleton',7),u(4,'skeleton',39)]);
g.run(`s.dispelRows[${P}]=7;var seq=[0,.99,0];Math.random=()=>{if(!seq.length)throw Error('extra roll');return seq.shift()};dispelUndead(${P})`);
assert.deepEqual(hp(),[0,20,0,20]);assert.equal(logs().filter(t=>t.endsWith('には効かなかった。')).length,1);
// No XP / kill count: dispelled undead are escaped+rewarded.
assert.deepEqual(J('s.enemy.units.filter(e=>e.hp===0).map(e=>[!!e.rewarded,!!e.escaped])'),[[true,true],[true,true]]);
// Chosen row's undead gone by execution time: frontmost row that still has undead.
setup(MIX);g.run(`s.dispelRows[${P}]=39;s.enemy.units[3].hp=0;Math.random=()=>0;dispelUndead(${P})`);assert.deepEqual(hp(),[0,0,20,0]);
setup(MIX);g.run(`s.dispelRows[${P}]=7;s.enemy.units[0].hp=0;s.enemy.units[1].hp=0;Math.random=()=>0;dispelUndead(${P})`);assert.deepEqual(hp(),[0,0,20,0]);
// No undead anywhere: nothing to choose, and execution logs 効果はなかった。 without touching others.
setup([u(3,'wolf',23)]);assert.deepEqual(J('livingUndeadGroups()'),[]);
g.run(`s.dispelRows[${P}]=23;Math.random=()=>0;dispelUndead(${P})`);assert.deepEqual(hp(),[20]);assert.ok(logs().includes('効果はなかった。'));
// Command summary shows the chosen row number.
setup(MIX);g.run(`s.commands[${P}]='dispel';s.dispelRows[${P}]=39`);assert.equal(g.run(`commandSummary(${P})`),'呪いを解く → 3列');
// MP is not spent.
setup(MIX);const mp=g.run(`s.mp[${P}]`);g.run(`s.dispelRows[${P}]=7;Math.random=()=>0;dispelUndead(${P})`);assert.equal(g.run(`s.mp[${P}]`),mp);
g.drain();
console.log('PASS dispel row: undead-only choices, chosen row only, per-undead rolls, no XP, frontmost-undead fallback, no-undead no effect, summary, no MP');
