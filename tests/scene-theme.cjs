// 079: environment changes with render's band; green and semantic colors stay intact.
const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const g=game();
g.run("const r=generateRecruit('冒険者',0);registerRecruit(r);changeRecruitParty(r.members.id,true);enterDungeon()");g.drain();
g.run("s.pos=size()*3+3;s.dir=0;s.pendingBoss=true;for(const i of [target(),target(-1),target(1)])Object.assign(s.cells[i],{open:false,safe:false,flag:false,type:'',chest:null});s.cells[target()].open=true;s.cells[target(-1)].safe=true");
const bands=[
 [1,'green','#121914 #2d382d #3b493c #34413a #151f1b #231b18 #b58663'],
 [2,'blue','#101623 #232c42 #2e3c5c #2a3852 #141b29 #1d1a24 #7d86b5'],
 [4,'yellow','#171408 #38331e #4a422a #443d27 #1d1a10 #241d12 #b59a5e'],
 [6,'orange','#1a120b #3a2c1e #54402a #4d3b27 #201810 #26180f #c08d54'],
 [8,'red','#1a0f10 #3a2326 #542e33 #4d2a2f #201214 #261214 #bd7268'],
 [10,'purple','#140f1d #2c2340 #41335c #3b2f52 #191325 #201226 #9a7fc0']
];
for(const [floor,band,colors] of bands){
 g.run(`s.floor=${floor};render()`);
 const svg=g.run("$('#scene').innerHTML");
 assert.equal(g.run('currentFloorTheme'),band);
 for(const c of colors.split(' '))assert.ok(svg.includes(c),`${band}: ${c}`);
 if(band!=='green')for(const c of bands[0][2].split(' '))assert.ok(!svg.includes(c),`${band}: leaked ${c}`);
 assert.ok(svg.includes('#ffdf9e'));
 assert.equal(g.run('face(target()).color'),'#e8d2a2','existing face number color');
 assert.equal(g.run('face(target(1)).color'),'#e8d2a2','existing question mark color');
 g.run("s.cells[target(1)].flag='power'");
 assert.equal(g.run('face(target(1)).color'),g.run('FLAG_COLORS.power'));
 g.run('s.cells[target(1)].flag=false');
}
g.run("s.area='town';render()");assert.equal(g.run('currentFloorTheme'),'green');
assert.equal(g.run('face(-1).fill'),'#202722');
assert.equal(g.run('face(target()).color'),'#e8d2a2');
console.log('PASS scene palettes, green compatibility, semantic number and flag colors');
