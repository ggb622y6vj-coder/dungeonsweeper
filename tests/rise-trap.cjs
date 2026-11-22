const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');

function setup(){
  let seed=129;
  const g=game(null,()=>{
    seed=(seed*1664525+1013904223)>>>0;
    return seed/4294967296;
  });
  g.run("const recruit=generateRecruit('冒険者',0);registerRecruit(recruit);changeRecruitParty(recruit.members.id,true);enterDungeon()");
  g.drain();
  return g;
}

function triggerRise(g){
  return g.run(`
    var fromPos=s.pos;
    s.cells[fromPos].trap=true;
    Math.random=()=>.97;
    triggerFloorTrap(s.cells[fromPos]);
  `);
}

const safeLanding=g=>g.run(`(()=>{
  const c=s.cells[s.pos];
  return !c.type&&!c.trap&&!c.flag&&!c.chest&&c.open;
})()`);

{
  const g=setup();
  assert.equal(g.run('FLOOR_TRAPS.reduce((sum,trap)=>sum+trap.weight,0)'),100);
  assert.equal(g.run("FLOOR_TRAPS.find(trap=>trap.id==='rise').weight"),5);
  assert.equal(g.run("FLOOR_TRAPS.find(trap=>trap.id==='teleport').weight"),5);
  g.run('fresh(3);s.scan=2;s.milwaSteps=12;s.pendingStairs=true;s.pendingElevator=true;s.clearNotice=true');
  assert.equal(triggerRise(g),true);
  assert.equal(g.run('s.floor'),2);
  assert.equal(g.run('s.floors[3].cells[fromPos].trap'),false);
  assert.equal(g.run('s.floors[3].cells[fromPos].spent'),true);
  assert.equal(g.run('s.floors[3].cells[fromPos].trapKind'),'rise');
  assert.equal(safeLanding(g),true);
  assert.equal(g.run('s.previousPos'),g.run('s.pos'));
  assert.equal(g.run('s.scan'),2);
  assert.equal(g.run('s.milwaSteps'),12);
  assert.equal(g.run('s.pendingStairs'),false);
  assert.equal(g.run('s.pendingElevator'),false);
  assert.equal(g.run('s.clearNotice'),false);
  assert.equal(g.run('s.cells[s.start].open'),false);
  g.drain();
  assert.equal(g.run("s.logs.includes('浮上穴の罠！ 一行の身体は浮き上がり上層へ転移した！')"),true);
}

{
  const g=setup();
  const before=g.run('JSON.stringify(s)');
  assert.equal(g.run('ascendRise()'),false);
  assert.equal(g.run('JSON.stringify(s)'),before);
  const position=g.run('s.pos');
  assert.equal(triggerRise(g),true);
  assert.equal(g.run('s.floor'),1);
  assert.equal(g.run('s.pos'),position);
  assert.equal(g.run("!s.cells[s.pos].trap&&s.cells[s.pos].spent&&s.cells[s.pos].trapKind==='rise'"),true);
  g.drain();
  assert.equal(g.run("s.logs.includes('浮上穴の罠は不発に終わった。')"),true);
}

{
  const g=setup();
  g.run(`
    fresh(2);
    const explored=s.cells.findIndex(c=>!c.type&&!c.trap);
    s.cells[explored].open=true;
    s.cells[explored].flag=true;
    s.elevatorFloors=[2,3];
    travelElevator(3);
  `);
  g.drain();
  assert.equal(g.run('s.floor'),3);
  assert.equal(triggerRise(g),true);
  assert.equal(g.run('s.floor'),2);
  assert.equal(g.run('s.cells[explored].open&&s.cells[explored].flag'),true);
  assert.equal(safeLanding(g),true);
  g.drain();
  assert.equal(g.run("s.logs.filter(t=>t==='地下2階に到着した。').length"),1);
}

{
  const g=setup();
  g.run(`
    fresh(2);
    s.cells.forEach(c=>c.flag=true);
    s.cells[s.start].open=false;
    s.elevatorFloors=[2,3];
    travelElevator(3);
  `);
  g.drain();
  assert.equal(triggerRise(g),true);
  assert.equal(g.run('s.floor'),2);
  assert.equal(g.run('s.pos'),g.run('s.start'));
  assert.equal(g.run('s.previousPos'),g.run('s.start'));
  assert.equal(g.run('s.cells[s.start].open'),true);
}

console.log('PASS 129 rise trap: weights, ascent, safe landing, first-floor fizzle, saved floor and landing fallback');
