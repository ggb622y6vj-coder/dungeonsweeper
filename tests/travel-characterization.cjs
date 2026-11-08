// 089: characterization tests for the three floor-travel routes.
// These pin CURRENT behavior (main 89d85e4) before any refactoring of the
// shared save/restore skeleton in travelFloor / travelElevator / descendPitfall.
// If a future change breaks a case here, decide whether that change is intended;
// do not silently update the expectations.
// Recorded per travel: floor, position kind, start/boss open state and boss type,
// milwaSteps, pendingBoss/pendingStairs/pendingElevator, clearNotice, relic, scan,
// the log queue right after the call, the played-back s.logs order, the return
// value, and the number of render() calls.
const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
function rng(seed){let a=seed>>>0||1;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}}
function setup(seed=89){const g=game(null,rng(seed));g.run(`const r=generateRecruit('冒険者',0);registerRecruit(r);changeRecruitParty(r.members.id,true);enterDungeon()`);g.drain();return g}
const J=(g,c)=>JSON.parse(g.run(`JSON.stringify(${c})`));
const SNAP=`(()=>{const c=s.cells;return {floor:s.floor,posKind:s.pos===s.start?'start':s.pos===s.boss?'boss':(c[s.pos].type||'plain'),startOpen:c[s.start].open,bossOpen:c[s.boss].open,bossType:c[s.boss].type,milwa:s.milwaSteps,pBoss:!!s.pendingBoss,pStairs:s.pendingStairs,pElev:s.pendingElevator,notice:s.clearNotice,relic:s.relic,scan:s.scan,queue:logQueue.map(x=>x.text),renders:renderCalls}})()`;
// Wrap render() after all setup so `renders` counts only the travel under test.
function wrap(g){g.run('var renderCalls=0;var _renderOrig=render;render=function(){renderCalls++;return _renderOrig()}')}
const ARRIVAL='迷宮に到着。守護者のいる部屋を探そう。';

// rememberFloor saves exactly this field set (a missing field breaks all 3 routes at once).
{const g=setup(90);g.run('fresh(2);rememberFloor()');
 assert.deepEqual(J(g,'Object.keys(s.floors[2]).sort()'),['boss','cells','floor','guardianKilledThisRun','relic','size','start']);}

// travelFloor down to a FRESH floor: fresh() runs, so its render and log reset are part of the count.
// Note the asymmetry pinned here and in the next block: on the fresh path fresh() clears
// pendingElevator, while on the saved path travelFloor leaves it untouched.
{const g=setup(101);
 g.run("s.guardiansDefeated=[1];s.cells[s.boss].type='down';s.pos=s.boss;s.milwaSteps=7;s.pendingElevator=true;s.clearNotice=true");
 wrap(g);
 const ret=g.run('travelFloor(2)');
 assert.equal(ret,undefined,'travelFloor returns undefined on success');
 const {queue,renders,...rest}=J(g,SNAP);
 assert.deepEqual(rest,{floor:2,posKind:'start',startOpen:true,bossOpen:false,bossType:'boss',milwa:0,pBoss:false,pStairs:false,pElev:false,notice:false,relic:false,scan:5});
 assert.equal(renders,2,'fresh() render + travelFloor render');
 assert.ok(!queue.some(t=>t.includes('到着した')),'no saved-floor arrival log on a fresh floor');
 g.drain();
 assert.deepEqual(J(g,'s.logs'),[ARRIVAL],'fresh() reset the log history');}

// travelFloor up to a SAVED floor whose guardian is defeated: arrival is the boss cell,
// the arrival log is queued, milwaSteps resets (floor changed), render runs once,
// and pendingElevator is NOT cleared on the saved path.
{const g=setup(102);
 g.run("s.guardiansDefeated=[1];s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2)");g.drain();
 wrap(g);
 g.run('s.milwaSteps=5;s.pendingElevator=true');
 const ret=g.run('travelFloor(1)');
 assert.equal(ret,undefined);
 const {queue,renders,...rest}=J(g,SNAP);
 assert.deepEqual(rest,{floor:1,posKind:'boss',startOpen:true,bossOpen:false,bossType:'down',milwa:0,pBoss:false,pStairs:false,pElev:true,notice:false,relic:true,scan:5});
 assert.deepEqual(queue,['地下1階に到着した。']);
 assert.equal(renders,1,'saved path renders once');
 g.drain();
 assert.deepEqual(J(g,'s.logs'),['地下1階に到着した。',ARRIVAL],'played-back logs are newest first');}

// travelFloor with fromTown=true to the SAME floor: travelFloor saves the current
// floor first (rememberFloor), so the same floor is then restored from that snapshot.
// No arrival log and, because the floor does not change, milwaSteps is preserved.
{const g=setup(103);
 wrap(g);
 g.run('s.milwaSteps=9;var boardBefore=JSON.stringify(s.cells)');
 const ret=g.run('travelFloor(s.floor,true)');
 assert.equal(ret,undefined);
 const snap=J(g,SNAP);
 assert.equal(snap.floor,1);assert.equal(snap.posKind,'start');assert.equal(snap.milwa,9,'same-floor travel keeps milwaSteps');
 assert.equal(snap.renders,1,'restore path renders once (no fresh())');
 assert.equal(g.run('!!s.floors[s.floor]'),true,'the current floor was saved by the call itself');
 assert.equal(g.run('JSON.stringify(s.cells)===boardBefore'),true,'the board is restored unchanged');
 g.drain();
 assert.ok(!J(g,'s.logs').some(t=>t.includes('到着した')),'fromTown suppresses the arrival log');}

// travelFloor down without defeating the guardian: refused with false, a log, one render, no state change.
{const g=setup(104);
 wrap(g);
 g.run('s.pos=s.boss');
 const ret=g.run('travelFloor(2)');
 assert.equal(ret,false);
 const snap=J(g,SNAP);
 assert.equal(snap.floor,1);assert.equal(snap.renders,1);
 g.drain();
 assert.equal(J(g,'s.logs')[0],'次の階層へ進むには守護者を倒す必要がある。');}

// travelElevator to a FRESH floor: the start cell's stairs are hidden again on arrival
// (076/087), the party lands on the elevator cell, everything pending is cleared.
{const g=setup(105);
 g.run('s.elevatorFloors=[1,2];s.milwaSteps=6;s.clearNotice=true');
 wrap(g);
 const ret=g.run('travelElevator(2)');
 assert.equal(ret,true);
 const {queue,renders,...rest}=J(g,SNAP);
 assert.deepEqual(rest,{floor:2,posKind:'elevator',startOpen:false,bossOpen:false,bossType:'boss',milwa:0,pBoss:false,pStairs:false,pElev:false,notice:false,relic:false,scan:5});
 assert.equal(renders,2,'fresh() render + travelElevator render');
 g.drain();
 assert.deepEqual(J(g,'s.logs'),[ARRIVAL]);}

// travelElevator back to a SAVED floor: the saved board is restored exactly, so stairs
// explored before leaving stay visible (087); arrival log queued; one render.
// Same-floor travel is refused with false.
{const g=setup(203);
 g.run('s.elevatorFloors=[1,2];travelElevator(2)');g.drain();
 g.run('s.cells[s.start].open=true'); // stairs explored while on 2F
 g.run('travelElevator(1)');g.drain();
 wrap(g);
 const ret=g.run('travelElevator(2)');
 assert.equal(ret,true);
 const snap=J(g,SNAP);
 assert.equal(snap.floor,2);assert.equal(snap.posKind,'elevator');assert.equal(snap.startOpen,true,'explored stairs stay visible');
 assert.deepEqual(snap.queue,['地下2階に到着した。']);
 assert.equal(snap.renders,1,'saved path renders once');
 g.drain();
 assert.equal(g.run('travelElevator(2)'),false,'same floor is not a destination');
 assert.deepEqual(J(g,'logQueue.map(x=>x.text)'),[],'refused travel queues no log');}

// Pitfall into a SAVED floor while a log is still queued: the queue is untouched by the
// restore, so the pending log, the trap logs, the arrival log and the warning play in order.
{const g=setup(106);
 g.run('fresh(4);var mark=s.cells.findIndex(c=>!c.type&&!c.trap);s.cells[mark].open=true;rememberFloor();var sf=s.floors;fresh(3);s.floors=sf;s.milwaSteps=12;s.scan=2');
 wrap(g);
 g.run("log('先行ログ')");
 const trig=g.run("s.cells[s.pos].trap=true;Math.random=()=>.87;triggerFloorTrap(s.cells[s.pos])");
 assert.equal(trig,true);
 const snap=J(g,SNAP);
 assert.equal(snap.floor,4);assert.equal(snap.posKind,'plain');assert.equal(snap.milwa,0);assert.equal(snap.scan,2,'scan is carried over');
 assert.equal(snap.pElev,false);assert.equal(snap.notice,false);
 assert.deepEqual(snap.queue.slice(0,4),['先行ログ','罠だ！','落とし穴の罠！ 一行は下の階へ落ちた。','地下4階に到着した。']);
 assert.match(snap.queue[4],/^警告：周囲に罠が\d+個。$/);
 assert.equal(snap.renders,0,'saved path: no fresh() and no render() call at all');
 assert.equal(g.run('s.previousPos===s.pos'),true);
 assert.equal(g.run('s.cells[mark].open'),true,'the saved board is restored, explored cells included');
 g.drain();
 assert.deepEqual(J(g,'s.logs').slice(0,5).reverse(),snap.queue,'playback order matches the queue');}

// Pitfall into a FRESH floor: fresh() would wipe the log queue, so descendPitfall restores
// the pending entries (088 Amendment 1). No arrival log on a fresh floor; the preserved
// logs replay above the fresh floor's arrival line.
{const g=setup(107);
 g.run('fresh(3);s.milwaSteps=12;s.scan=2;s.floors={}');
 wrap(g);
 g.run("log('先行ログ')");
 const trig=g.run("s.cells[s.pos].trap=true;Math.random=()=>.87;triggerFloorTrap(s.cells[s.pos])");
 assert.equal(trig,true);
 const snap=J(g,SNAP);
 assert.equal(snap.floor,4);assert.equal(snap.posKind,'plain');assert.equal(snap.milwa,0);assert.equal(snap.scan,2);
 assert.deepEqual(snap.queue.slice(0,3),['先行ログ','罠だ！','落とし穴の罠！ 一行は下の階へ落ちた。']);
 assert.match(snap.queue[3],/^警告：周囲に罠が\d+個。$/);
 assert.ok(!snap.queue.some(t=>t.includes('到着した')),'no arrival log on a fresh floor');
 assert.equal(snap.renders,1,'the single render comes from fresh(); descendPitfall itself does not render');
 assert.equal(g.run('s.previousPos===s.pos'),true);
 assert.equal(g.run("(()=>{const c=s.cells[s.pos];return !c.type&&!c.trap&&!c.flag&&!c.chest&&c.open})()"),true,'lands on an opened plain cell');
 g.drain();
 const logs=J(g,'s.logs');
 assert.deepEqual(logs.slice(0,4),[snap.queue[3],snap.queue[2],snap.queue[1],snap.queue[0]],'preserved logs replay newest first');
 assert.equal(logs[4],ARRIVAL,'the fresh floor arrival line sits below the preserved logs');}

// Save compatibility: an ash-v1 save holding several floors loads back to the identical
// state, and travelling after the load behaves exactly like travelling without the load.
{const g=setup(204);
 g.run('s.elevatorFloors=[1,2];resetDungeon();enterDungeon()');g.drain();
 g.run('travelElevator(2)');g.drain();
 g.run('var mark=s.cells.findIndex(c=>!c.type&&!c.trap&&c!==s.cells[s.pos]);s.cells[mark].open=true;save()');
 const saved=g.run("localStorage.getItem('ash-v1')");
 assert.ok(saved&&JSON.parse(saved).floors,'save contains the visited floors');
 const stateA=J(g,'({floors:s.floors,scan:s.scan,floor:s.floor,pos:s.pos,cells:s.cells})');
 g.run('travelElevator(1)');
 const travelA=J(g,'({floor:s.floor,pos:s.pos,cells:s.cells,queue:logQueue.map(x=>x.text)})');g.drain();
 const g2=game(saved,rng(999));g2.run('render()');
 const stateB=J(g2,'({floors:s.floors,scan:s.scan,floor:s.floor,pos:s.pos,cells:s.cells})');
 assert.deepEqual(stateB,stateA,'loaded state matches the saved state');
 g2.run('travelElevator(1)');
 const travelB=J(g2,'({floor:s.floor,pos:s.pos,cells:s.cells,queue:logQueue.map(x=>x.text)})');g2.drain();
 assert.deepEqual(travelB,travelA,'travel after load matches travel without load');}

console.log('PASS 089 characterization: floor-travel routes (stairs/elevator/pitfall x fresh/saved), from-town and refusal, pendingElevator asymmetry, log queue order, render counts, rememberFloor fields, save/load travel equivalence');
