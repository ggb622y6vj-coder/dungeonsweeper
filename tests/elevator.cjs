// 068: elevator unlock, hidden E placement, travel, revisit and legacy saves.
const assert=require('node:assert/strict');const {game}=require('../scripts/sim/harness.cjs');
const J=(g,c)=>JSON.parse(g.run(`JSON.stringify(${c})`));
function rng(seed){let a=seed>>>0||1;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}}
function setup(seed=1){const g=game(null,rng(seed));g.run("const r=generateRecruit('冒険者',0);registerRecruit(r);changeRecruitParty(r.members.id,true);enterDungeon()");g.drain();return g}
const CHEB="(a,b)=>Math.max(Math.abs(a%s.size-b%s.size),Math.abs((a/s.size|0)-(b/s.size|0)))";
const CHECK=`(()=>{const d=${CHEB},es=s.cells.map((c,i)=>c.type==='elevator'?i:-1).filter(i=>i>=0);if(es.length!==1)return 'count '+es.length;const i=es[0],c=s.cells[i];if(c.trap||c.chest||c.open||i===s.start||i===s.boss||i===s.pos||s.corpses.some(x=>x.floor===s.floor&&x.cell===i))return 'bad cell';return d(i,s.start)})()`;
// 1. Opening the last non-trap cell on 1F unlocks floor 1 once, logs, opens the dialog after logs, and places one hidden E near the stairs.
{const g=setup(7);
 assert.deepEqual(J(g,'s.elevatorFloors'),[]);
 g.run(`var last=[s.pos-s.size,s.pos+s.size,s.pos-1,s.pos+1].find(i=>s.cells[i]&&adjacent(s.pos,i)&&!s.cells[i].trap&&s.cells[i].type==='');
  s.cells.forEach((c,i)=>{if(!c.trap&&i!==last)c.open=true});s.cells[last].open=false;
  var shown=0;const el=$('#elevatordialog'),sm=el.showModal;el.showModal=function(){shown++;sm.call(this)};Math.random=()=>.99;cell(last)`);
 assert.deepEqual(J(g,'s.elevatorFloors'),[1]);
 assert.equal(g.run("s.logs.concat(logQueue.map(x=>x.text)).filter(t=>t==='昇降機が使えるようになった！ 昇降機（E）から解放した階へ移動できます。').length"),1);
 const d=g.run(CHECK);assert.equal(typeof d,'number',d);assert.ok(d<=2,'1F E within Chebyshev 2 of stairs');
 assert.equal(g.run('shown'),0,'dialog waits for log playback');
 g.drain();g.run('render();render()');
 assert.equal(g.run('shown'),1);assert.equal(g.run("$('#elevatordialog').open"),true);
 assert.equal(g.run("$('#elevatormessage').textContent"),'昇降機が使えるようになった！ 昇降機（E）から解放した階へ移動できます。');
 assert.equal(g.run("s.logs.filter(t=>t.startsWith('昇降機が使えるようになった')).length"),1);
 // Hidden E: map symbol is not E until opened.
 assert.notEqual(g.run("face(s.cells.findIndex(c=>c.type==='elevator')).symbol"),'E');
 g.run("s.cells.find(c=>c.type==='elevator').open=true");assert.equal(g.run("face(s.cells.findIndex(c=>c.type==='elevator')).symbol"),'E');
 g.run("s.cells.find(c=>c.type==='elevator').open=false;$('#elevatorok').onclick();cell(s.pos)");g.drain();
 assert.equal(g.run('shown'),1,'no second unlock dialog');assert.deepEqual(J(g,'s.elevatorFloors'),[1]);}
// 2. Regenerated 1F: exactly one hidden E within distance 2, never on trap/chest/corpse/start/boss/party.
for(let n=1;n<=200;n++){const g=setup(n);g.run("s.elevatorFloors=[1];s.corpses=[{floor:1,cell:(s.start+1)%(s.size*s.size),members:[]}];resetDungeon();enterDungeon()");g.drain();
 const d=g.run(CHECK);assert.equal(typeof d,'number',`seed ${n}: ${d}`);assert.ok(d<=2,`seed ${n} distance ${d}`)}
// 3. Deeper floors: anywhere on the board (some at distance >= 3), same constraints.
{let far=0;for(let n=1;n<=200;n++){const g=setup(1000+n);g.run("s.elevatorFloors=[1,3];fresh(3)");const d=g.run(CHECK);assert.equal(typeof d,'number',`seed ${n}: ${d}`);if(d>=3)far++}
 assert.ok(far>0,'2F+ E is not limited to the stairs area');}
// 2F+ unlock: short dialog, E placed hidden even though the floor is fully explored.
{const g=setup(9);g.run(`s.elevatorFloors=[1];fresh(2);s.pos=s.start;var last=[s.pos-s.size,s.pos+s.size,s.pos-1,s.pos+1].find(i=>s.cells[i]&&adjacent(s.pos,i)&&!s.cells[i].trap&&s.cells[i].type==='');s.cells.forEach((c,i)=>{if(!c.trap&&i!==last)c.open=true});s.cells[last].open=false;Math.random=()=>.99;cell(last)`);g.drain();g.run('render()');
 assert.deepEqual(J(g,'s.elevatorFloors'),[1,2]);assert.equal(g.run("$('#elevatormessage').textContent"),'地下2階に昇降機が止まるようになった。');assert.equal(g.run("$('#elevatordialog').open"),true);
 const d=g.run(CHECK);assert.equal(typeof d,'number',d);}
// 4/7. Riding from 1F E to 3F (guardian not defeated); no encounter on E; movement blocked while choosing.
const g=setup(42);
g.run("s.elevatorFloors=[1,3];s.guardiansDefeated=[];resetDungeon();enterDungeon()");g.drain();
g.run(`var e=s.cells.findIndex(c=>c.type==='elevator');var from=[e-s.size,e+s.size,e-1,e+1].find(i=>s.cells[i]&&adjacent(e,i)&&!s.cells[i].trap&&i!==s.boss);s.pos=from;s.cells[from].open=true;Math.random=()=>0;cell(e)`);
assert.equal(g.run('s.pos===e'),true);assert.equal(g.run('s.pendingElevator'),true);assert.equal(g.run('!!s.enemy'),false,'no encounter on E');
assert.equal(g.run("$('#elevatorpick').open"),true);assert.equal(g.run('s.cells[e].open'),true);
assert.deepEqual(J(g,"$('#elevatorchoices').children.map(b=>b.textContent)"),['地下3階']);
g.run('move(0);move(1);cell(from)');assert.equal(g.run('s.pos===e'),true,'cannot move while choosing');
g.run('s.cells.forEach(c=>c.open=true);var before1=JSON.stringify(s.cells)');
g.run("$('#elevatorchoices').children[0].onclick()");
assert.equal(g.run('s.floor'),3);assert.equal(g.run("s.cells[s.pos].type"),'elevator');assert.equal(g.run('s.cells[s.pos].open'),true);assert.equal(g.run('s.pendingElevator'),false);
assert.equal(g.run('(s.guardiansDefeated||[]).includes(3)'),false);
// 076: a fresh elevator destination reveals only the arrival E, not the stairs.
assert.equal(g.run('s.cells[s.start].open'),false,'076: elevator arrival hides fresh stairs');
assert.deepEqual(J(g,'s.cells.flatMap((c,i)=>c.open?[i]:[])'),[g.run('s.pos')]);
// 5. Same run: returning restores the saved boards and E cells.
g.run('var e3=s.pos,before3=JSON.stringify(s.cells);travelElevator(1)');
assert.equal(g.run('s.floor'),1);assert.equal(g.run('s.cells[s.start].open'),false);
// 076 closes only the stairs on arrival; normalize that field to retain full equality for every other cell/field.
assert.equal(g.run('(()=>{const before=JSON.parse(before1);before[s.start].open=false;return JSON.stringify(s.cells)===JSON.stringify(before)})()'),true);assert.equal(g.run('s.pos===e'),true);
g.run('travelElevator(3)');assert.equal(g.run('s.pos===e3&&JSON.stringify(s.cells)===before3'),true);
assert.equal(g.run('travelElevator(2)'),false,'locked floors are not destinations');
// 076: stepping onto the hidden stairs still opens them and asks to travel.
g.run('s.pos=[s.start-s.size,s.start+s.size,s.start-1,s.start+1].find(i=>s.cells[i]&&adjacent(i,s.start));cell(s.start)');
assert.equal(g.run('s.cells[s.start].open'),true);assert.equal(g.run('s.pendingStairs'),true);g.drain();
// Normal stair travel to a fresh floor keeps its starting stairs open.
{const stairs=setup(76);stairs.run("s.guardiansDefeated=[1];s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2)");
 assert.equal(stairs.run('s.floor'),2);assert.equal(stairs.run('s.pos===s.start&&s.cells[s.start].open'),true);}
// 076 Amendment 1: stair arrival reopens a saved start hidden by elevator travel.
{const stairs=setup(78);stairs.run('s.elevatorFloors=[1,2];travelElevator(2)');
 assert.equal(stairs.run('s.cells[s.start].open'),false);
 stairs.run("var explored=s.cells.findIndex((c,i)=>i!==s.start&&i!==s.pos&&!c.trap&&c.type==='');s.cells[explored].open=true;var beforeStairs=JSON.stringify(s.cells);travelElevator(1)");
 assert.equal(stairs.run('s.floors[2].cells[s.floors[2].start].open'),false,'saved stairs remain hidden');
 stairs.run("s.guardiansDefeated=[1];s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2)");
 assert.equal(stairs.run('s.floor'),2);assert.equal(stairs.run('s.pos===s.start'),true);
 assert.equal(stairs.run('s.cells[s.start].open'),true,'076 Amendment 1: stair arrival opens the saved start');
 assert.equal(stairs.run('s.cells[explored].open'),true,'other explored cells remain open');
 assert.equal(stairs.run('(()=>{const before=JSON.parse(beforeStairs);before[s.start].open=true;return JSON.stringify(s.cells)===JSON.stringify(before)})()'),true,'all other cell state is preserved');}
// Defensive guard: a saved arrival cell that is also the start stays open.
{const same=setup(77);same.run("s.elevatorFloors=[1,3];fresh(3);s.start=s.cells.findIndex(c=>c.type==='elevator');rememberFloor();var savedFloors=s.floors;fresh(1);s.floors=savedFloors;travelElevator(3)");
 assert.equal(same.run('s.pos===s.start&&s.cells[s.pos].open'),true);}
// Save mid-choice reopens the picker after reload instead of locking the party.
g.run("s.pendingStairs=false;s.pendingElevator=true;save()");const re=game(g.run("localStorage.getItem('ash-v1')"));re.run('render()');
assert.equal(re.run("$('#elevatorpick').open"),true);re.run("$('#elevatorcancel').onclick();s.pendingElevator=false;render()");assert.equal(re.run('s.pendingElevator'),false);
// 6. Legacy save without elevatorFloors loads as [].
const legacy=J(g,'rosterSaveState()');delete legacy.elevatorFloors;const old=game(JSON.stringify(legacy));old.run('render()');assert.deepEqual(J(old,'s.elevatorFloors'),[]);
console.log('PASS elevator: unlock dialog once after logs, hidden E placement (1F<=2, deeper anywhere), ride without guardian/encounter, movement lock, revisit, save/reload, legacy');
