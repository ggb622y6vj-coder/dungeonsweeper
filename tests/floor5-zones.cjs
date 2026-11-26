const assert = require('node:assert/strict');
const {game} = require('../scripts/sim/harness.cjs');
const json = (g, expression) => JSON.parse(g.run(`JSON.stringify(${expression})`));

{
  const g = game(null, () => .5);
  for (const [roll, zone] of [[0, 'blind'], [.25, 'anti'], [.5, null], [.999, null]]) {
    g.run(`Math.random = () => ${roll}; fresh(5)`);
    assert.deepEqual(json(g, 's.floorZones'), Array(4).fill(zone));
    const eligible = json(g, "s.cells.flatMap((c,i) => !c.trap && c.type === '' && num(i) === 0 ? [i] : [])");
    const fountains = json(g, 's.cells.flatMap((c,i) => c.fountain ? [i] : [])');
    assert.ok(eligible.length > 0);
    assert.deepEqual(fountains, [eligible[Math.floor(roll * eligible.length)]]);
  }
  // Cycle through all four faces. The phase depends on earlier board generation.
  g.run('let rolls = 0; Math.random = () => (rolls++ % 4) / 4; fresh(5)');
  assert.deepEqual(json(g, 's.floorZones').sort(), ['anti', 'blind', null, null]);
  // With every cell adjacent to a trap there is no candidate.
  g.run('num = () => 1; fresh(5)');
  assert.equal(g.run('s.cells.some(c => c.fountain)'), false);
}
console.log('PASS 148 independent quadrant rolls and fountain placement');

{
  const g = game(null, () => .5);
  g.run("fresh(5); s.floorZones = ['blind', 'anti', null, 'blind']");
  for (const [pos, blind, anti] of [[65,true,false],[66,false,true],[77,false,false],[78,true,false]]) {
    g.run(`setPlayerPosition(${pos})`);
    assert.deepEqual(json(g, '[isMapBlind(),isAntimagicZone()]'), [blind,anti]);
  }
  g.run("s.floorZones = ['blind','anti','blind',null]; setPlayerPosition(65); s.light = true; render()");
  // Both sides of a blind/anti boundary get their own style. Like zones share no edge.
  let board = g.run("$('#board').innerHTML");
  const classes = i => board.match(new RegExp(`class="([^"]+)" data-i="${i}"`))[1].split(' ');
  assert.deepEqual(classes(65), ['cell','blind','zoneframe','zoneframe-right']);
  assert.deepEqual(classes(66), ['cell','blind','antiframe','antiframe-bottom','antiframe-left']);
  assert.deepEqual(classes(77), ['cell','blind','zoneframe','zoneframe-right']);
  for (const i of [0,11,78,132,143]) assert.deepEqual(classes(i), ['cell','blind']);
  g.run('setPlayerPosition(66); render()');
  assert.deepEqual(json(g, '[s.light,isAntimagicZone(),isMapBlind()]'), [false,true,false]);
  assert.doesNotMatch(g.run("$('#board').innerHTML"), /zoneframe|antiframe|cell blind/);
  for (const floor of [3,4]) {
    g.run(`fresh(${floor}); setPlayerPosition(65)`);
    assert.deepEqual(json(g, '[isMapBlind(),isAntimagicZone()]'), [floor===3,floor===4]);
    g.run('setPlayerPosition(0)');
    assert.deepEqual(json(g, '[isMapBlind(),isAntimagicZone()]'), [false,false]);
  }
}
console.log('PASS 148 quadrant boundaries, light frames and unchanged 3F/4F zone checks');

function fountainParty() {
  const g = game(null, () => .5);
  g.run(`
    for (const [i,job] of [1,2,1,2].entries()) {
      const recruit = generateRecruit('冒険者'+i,job);
      registerRecruit(recruit);
      changeRecruitParty(recruit.members.id,true);
    }
    fresh(5);
    s.members.forEach((m,i) => Object.assign(m,{maxHP:20+i,maxMP:10+i}));
    s.members[2].status='dead'; s.members[3].status='stone';
    s.hp=[4,5,0,6]; s.mp=[1,2,3,4]; s.ailments[0].silence=2;
    const spring=s.cells.findIndex(c=>c.fountain);
    const origin=around(spring).find(i=>adjacent(i,spring));
    Object.assign(s.cells[origin],{type:'',open:true,trap:false});
    setPlayerPosition(spring); render();
  `);
  assert.equal(g.run('s.pendingFountain'), false, 'position changes alone never activate the spring');
  g.run('setPlayerPosition(origin); Math.random=()=>0; cell(spring)');
  g.drain();
  assert.deepEqual(json(g, "[s.pendingFountain,$('#fountaindialog').open,idle(),s.enemy]"), [true,true,false,null]);
  return g;
}

for (const choice of ['hp','mp']) {
  const g = fountainParty();
  g.run(`
    const facing=s.dir;
    const closed=s.cells.findIndex(c=>!c.open&&!c.flag);
    cell(origin); move('left'); flag(closed);
  `);
  assert.equal(g.run("s.pos===spring && s.dir===facing && !s.cells[closed].flag && $('#frontflag').disabled"), true);
  const saved = g.run("localStorage.getItem('ash-v1')");
  const resumed = game(saved, () => .5);
  assert.equal(resumed.run("s.pendingFountain && $('#fountaindialog').open"), true);
  resumed.run(`$('#fountain${choice}').onclick()`);
  resumed.drain();
  assert.deepEqual(json(resumed, 's.hp'), choice==='hp' ? [20,21,0,6] : [4,5,0,6]);
  assert.deepEqual(json(resumed, 's.mp'), choice==='mp' ? [10,11,3,4] : [1,2,3,4]);
  assert.deepEqual(json(resumed, 's.members.map(m=>m.status)'), ['ok','ok','dead','stone']);
  assert.equal(resumed.run('s.ailments[0].silence'), 2);
  assert.equal(resumed.run('s.logs[0]'), `命の泉の力で、全員の${choice.toUpperCase()}が全回復した！`);
  assert.deepEqual(json(resumed, "[s.pendingFountain,$('#fountaindialog').open,s.cells[s.pos].fountain,idle()]"), [false,false,false,true]);
  resumed.run('const visited=s.pos; enterFloor(4); enterFloor(5)');
  assert.equal(resumed.run('s.cells[visited].fountain'), false);
}
{
  const g = fountainParty();
  const before = json(g, '[s.hp,s.mp,s.logs]');
  g.run("$('#fountainskip').onclick()");
  assert.deepEqual(json(g, '[s.hp,s.mp,s.logs]'), before);
  assert.deepEqual(json(g, '[s.pendingFountain,s.cells[spring].fountain]'), [false,true]);
  g.run('Math.random=()=>.99; cell(origin); cell(spring)');
  assert.equal(g.run("s.pendingFountain && $('#fountaindialog').open"), true);
}
console.log('PASS 148 fountain walking, pending controls, save/reload, HP/MP and skip/revisit');

{
  const g = game(null, () => .5);
  g.run("fresh(5); s.floorZones=['blind','anti',null,null]; const spring=s.cells.findIndex(c=>c.fountain); enterFloor(4)");
  assert.equal(g.run('s.floorZones'), null);
  g.run('enterFloor(5)');
  assert.deepEqual(json(g, 's.floorZones'), ['blind','anti',null,null]);
  assert.equal(g.run('s.cells[spring].fountain'), true);
  g.run("s.floorZones[1]=null; s.cells[spring].fountain=false");
  assert.equal(g.run('s.floors[5].floorZones[1]'), 'anti');
  assert.equal(g.run('s.floors[5].cells[spring].fountain'), true);
  g.run('enterFloor(4); delete s.floors[5].floorZones; delete s.floors[5].cells[spring].fountain; enterFloor(5)');
  const oldSave = JSON.parse(g.run('JSON.stringify(rosterSaveState())'));
  delete oldSave.floorZones;
  delete oldSave.pendingFountain;
  for (const old of [g, game(JSON.stringify(oldSave), () => 0)]) {
    for (const pos of [65,66,77,78]) {
      old.run(`setPlayerPosition(${pos})`);
      assert.deepEqual(json(old, '[isMapBlind(),isAntimagicZone()]'), [false,false]);
    }
    assert.equal(old.run('s.cells.some(c=>c.fountain) || s.pendingFountain'), false);
  }
}
// An actual pitfall/rise landing on the unspent spring does not prompt for it.
for (const [from,route] of [[4,'descendPitfall'],[6,'ascendRise']]) {
  const g = game(null, () => .5);
  g.run(`
    fresh(5);
    const spring = s.cells.findIndex(c => c.fountain);
    s.cells.forEach((c,i) => { if (i !== spring) c.flag = true });
    enterFloor(${from});
    ${route}();
    render();
  `);
  assert.deepEqual(json(g, "[s.floor,s.pos===spring,s.cells[spring].fountain,s.pendingFountain,Boolean($('#fountaindialog').open)]"),
                   [5,true,true,false,false]);
}
console.log('PASS 148 floor snapshot round trip and legacy 5F without zones or fountain');
