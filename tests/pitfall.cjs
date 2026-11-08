// 088: shared pitfall descent, saved floors, chest loss and thief failure.
const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
function rng(seed){let a=seed>>>0||1;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}}
function setup(seed=88,job=0){const g=game(null,rng(seed));g.run(`const r=generateRecruit('冒険者',${job});registerRecruit(r);changeRecruitParty(r.members.id,true);enterDungeon()`);g.drain();return g}
function floorTrap(g){return g.run("var fromPos=s.pos;s.cells[fromPos].trap=true;Math.random=()=>.87;triggerFloorTrap(s.cells[fromPos])")}
function chest(g,floor){g.run(`fresh(${floor});s.cells[s.pos].chest={gold:50,opened:false,trap:'pitfall'};var fromPos=s.pos,oldGold=s.gold`);g.drain()}
const plain="(()=>{const c=s.cells[s.pos];return !c.type&&!c.trap&&!c.flag&&!c.chest&&c.open})()";
{const g=setup();
 assert.equal(g.run('FLOOR_TRAPS.reduce((n,t)=>n+t.weight,0)'),100);
 assert.equal(g.run("FLOOR_TRAPS.find(t=>t.id==='pitfall').weight"),5);
 g.run('fresh(3);s.guardiansDefeated=[];s.scan=2;s.milwaSteps=12;s.pendingElevator=true;s.clearNotice=true');
 assert.equal(floorTrap(g),true);
 assert.equal(g.run('s.floor'),4);
 assert.equal(g.run("!s.floors[3].cells[fromPos].trap&&s.floors[3].cells[fromPos].spent&&s.floors[3].cells[fromPos].trapKind==='pitfall'"),true);
 assert.equal(g.run(plain),true);
 assert.equal(g.run('s.previousPos===s.pos&&s.scan===2&&s.milwaSteps===0&&!s.pendingStairs&&!s.pendingElevator&&!s.clearNotice'),true);
 assert.equal(g.run("s.logs.concat(logQueue.map(x=>x.text)).some(t=>t.includes('落とし穴の罠！'))"),true);
}
{const g=setup();g.run('fresh(10)');assert.equal(floorTrap(g),true);
 assert.equal(g.run('s.floor'),10);
 assert.equal(g.run("s.logs.concat(logQueue.map(x=>x.text)).some(t=>t.includes('不発'))"),true);
 assert.equal(g.run('descendPitfall()'),false);
}
{const g=setup();
 g.run("fresh(4);var distinctive=s.cells.findIndex(c=>!c.type&&!c.trap);s.cells[distinctive].open=true;s.elevatorFloors=[3,4];travelElevator(3)");g.drain();
 assert.equal(floorTrap(g),true);assert.equal(g.run('s.floor'),4);
 assert.equal(g.run('s.cells[distinctive].open'),true);
 assert.equal(g.run(plain),true);
 assert.equal(g.run("s.logs.concat(logQueue.map(x=>x.text)).filter(t=>t==='地下4階に到着した。').length"),1);
}
{const g=setup();chest(g,5);g.run('openChest()');
 assert.equal(g.run('s.floor'),6);assert.equal(g.run('s.gold===oldGold'),true);
 assert.equal(g.run('s.floors[5].cells[fromPos].chest===undefined'),true);
 assert.equal(g.run(plain),true);
}
{const g=setup();chest(g,10);g.run('openChest()');
 assert.equal(g.run('s.floor'),10);assert.equal(g.run('s.gold>oldGold'),true);
 assert.equal(g.run("s.logs.concat(logQueue.map(x=>x.text)).some(t=>t.includes('不発'))"),true);
}
{const g=setup();for(const [r,trap] of [[0,'needle'],[.17,'needle'],[.18,'poison'],[.25,'poison'],[.29,'paralysis'],[.33,'paralysis'],[.36,'pitfall'],[.38,'pitfall'],[.4,'none'],[.5,'none']]){
 assert.equal(g.run(`Math.random=()=>${r};var c={};fixChestTrap(c);c.trap`),trap);
}}
{const g=setup(89,3);
 // A saved destination with a chest at the arrival index exposes accidental deletion after falling.
 g.run("fresh(6);s.cells[0]={type:'',trap:false,flag:false,open:false,chest:{gold:77,opened:false,trap:'none'}};s.cells[1]={type:'',trap:false,flag:false,open:false};s.cells.forEach((c,i)=>{if(i>1)c.flag=true});rememberFloor();var savedFloors=s.floors;fresh(5);s.floors=savedFloors;s.pos=0;s.cells[0].chest={gold:50,opened:false,trap:'pitfall'};var oldGold=s.gold");g.drain();
 assert.ok(g.run('thiefMember()')>=0);
 assert.doesNotThrow(()=>g.run('var calls=0;Math.random=()=>calls++===0?.99:.5;thiefOpenChest()'));
 assert.equal(g.run('s.floor'),6);
 assert.equal(g.run('s.floors[5].cells[0].chest===undefined'),true);
 assert.equal(g.run('s.cells[0].chest.gold'),77);
 assert.equal(g.run('s.gold===oldGold'),true);
 assert.equal(g.run(plain),true);
}
// With no eligible landing cells, descent opens the saved start as a fallback.
{const g=setup();g.run('fresh(4);s.cells.forEach(c=>c.flag=true);rememberFloor();var savedFloors=s.floors;fresh(3);s.floors=savedFloors');
 assert.equal(g.run('descendPitfall()'),true);
 assert.equal(g.run('s.floor===4&&s.pos===s.start&&s.previousPos===s.pos&&s.cells[s.pos].open'),true);
}
console.log('PASS 088 pitfall: weights, floor descent/fizzle, saved floor restore, chest loss/reward, trap boundaries, thief destination safety and landing fallback');
