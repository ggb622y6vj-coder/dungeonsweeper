// 072: exercise spells through the runtime, including movement, saves and log snapshots.
const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty,seededRandom}=require('../scripts/sim/combat.cjs');
const J=(g,x)=>JSON.parse(g.run(`JSON.stringify(${x})`));
function party(){
 const g=game(null,seededRandom(72));createParty(g,[2,1,0]);g.drain();
 g.run(`s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;s.done=false;
  s.cells.forEach(c=>{c.flag=false;c.type='';c.trap=false;delete c.chest});
  s.members.forEach((m,i)=>{m.level=20;m.maxHP=1000;m.maxMP=1000;m.known=MAGIC.filter(x=>x.job===jobOf(i)).map(x=>x.id)});
  s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);s.pos=27;s.dir=1;`);
 return g;
}
function battle(g,ids=['slime']){
 g.drain();g.run(`s.enemy={units:${JSON.stringify(ids)}.map((id,i)=>({...makeEnemy(id,100+i),row:7+i*16,hp:1000,identified:true})),initiative:'party',flagEffect:{}};resetPartyCommands()`);
}
// Deterministically select each new monster through encounter(), on every listed floor.
for(const [id,floors] of [['takenoko',[1,2]],['kinoko',[1,2]],['sirakaba',[2,3]]]){
 const g=party();assert.deepEqual(J(g,`enemyDefinition('${id}').floors`),floors);
 for(const floor of floors){
  g.drain();g.run(`s.enemy=null;fresh(${floor});s.cells[s.pos].type='';
   var pool=ENEMIES.filter(d=>d.floors.includes(${floor})&&!d.boss),pick=(pool.findIndex(d=>d.id==='${id}')+.5)/pool.length;
   var rolls=[0,pick];Math.random=()=>rolls.shift()??.99;encounter(s.pos)`);
  assert.equal(g.run('s.enemy.units.every(e=>e.id==='+JSON.stringify(id)+')'),true,`${id} spawns on ${floor}F`);
  assert.equal(g.run('s.enemy.units.length>=enemyDefinition('+JSON.stringify(id)+').groupSize[0]'),true);
 }
}
// Use identical dice against resistant and unresistant enemies; spell resistance itself is disabled.
for(const [id,resist,expected] of [['mamahalito','炎半減',36],['madalto','氷半減',56]]){
 const g=party();battle(g,['slime','slime']);
 g.run(`s.enemy.units[1].id='goblin';s.enemy.units[1].row=7;
  enemyDefinition('slime').resistance='なし';enemyDefinition('goblin').resistance='${resist}';
  enemyDefinition('slime').mageResist=enemyDefinition('goblin').mageResist=0;Math.random=()=>.999`);
 assert.equal(g.run(`spellResistance(magic('${id}'))`),resist);
 assert.equal(g.run(`castMagic(1,'${id}',100)`),true);
 assert.deepEqual(J(g,'s.enemy.units.map(e=>1000-e.hp)'),[expected,expected/2]);
}
// Persistent AC shares the strongest-effect rule with battle AC and survives victory/reload/floor travel.
{
 const g=party(),base=J(g,'s.members.map((_,i)=>effectiveAC(i))');
 assert.equal(g.run("castMagic(0,'teppeki',null)"),true);
 const protectedAC=base.map(n=>n-2);assert.deepEqual(J(g,'logQueue[0].ac'),base,'AC does not leak before the casting log');assert.deepEqual(J(g,'logQueue[1].ac'),protectedAC);assert.deepEqual(J(g,'snapshotVitals().ac'),protectedAC);
 assert.equal(g.run('s.mp[0]'),993);
 battle(g);g.run("castMagic(0,'teppeki',null);castMagic(0,'kalki',null)");
 assert.deepEqual(J(g,'s.members.map((_,i)=>effectiveAC(i))'),protectedAC,'recasting does not stack');
 g.run('s.enemy.units.forEach(e=>{e.hp=0;killReward(e)});finishMonsterBattle()');g.drain();
 assert.equal(g.run('s.enemy'),null);assert.deepEqual(J(g,'snapshotVitals().ac'),protectedAC);
 battle(g);assert.deepEqual(J(g,'snapshotVitals().ac'),protectedAC,'next battle keeps AC-2');
 g.run('s.enemy=null');g.drain();g.run("s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2)");
 assert.equal(g.run('s.floor'),2);assert.deepEqual(J(g,'snapshotVitals().ac'),protectedAC);
 const resumed=game(g.run("save();localStorage.getItem('ash-v1')"));
 assert.deepEqual(J(resumed,'snapshotVitals().ac'),protectedAC,'save/reload keeps AC-2');
 resumed.drain();resumed.run('enterTown()');resumed.drain();
 assert.equal(resumed.run('s.teppeki'),false);assert.deepEqual(J(resumed,'snapshotVitals().ac'),base);
}
// Rotation, blocked movement and combat do not consume steps; the 30th actual step expires light.
{
 let g=party();assert.equal(g.run("castMagic(0,'milwa',null)"),true);g.drain();
 assert.equal(g.run('s.milwaSteps'),30);assert.equal(g.run('diagonalSight().length'),2);
 g.run("move('left');move('right')");assert.equal(g.run('s.milwaSteps'),30);
 g.run("s.cells[28].flag='power';move('forward')");g.drain();assert.equal(g.run('s.milwaSteps'),30);
 g.run("s.cells[28].flag=false;s.cells.forEach(c=>c.open=true);Math.random=()=>.99");
 for(let step=1;step<=29;step++){
  g.run(`move('${step%2?'forward':'back'}')`);g.drain();assert.equal(g.run('s.milwaSteps'),30-step);
  assert.equal(g.run('diagonalSight().length'),2,`light at step ${step}`);
 }
 const saved=g.run("save();localStorage.getItem('ash-v1')");g=game(saved,()=>.99);g.drain();
 assert.equal(g.run('s.milwaSteps'),1,'remaining steps survive reload');
 g.run("move('back')");g.drain();assert.equal(g.run('s.milwaSteps'),0);assert.deepEqual(J(g,'diagonalSight()'),[]);
 g.run("castMagic(0,'milwa',null)");g.drain();g.run("s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2)");
 assert.equal(g.run('s.floor'),2);assert.equal(g.run('s.milwaSteps'),0);assert.deepEqual(J(g,'diagonalSight()'),[]);
 g.run("s.mp[0]=100;castMagic(0,'milwa',null)");g.drain();g.run('travelFloor(1)');
 assert.equal(g.run('s.milwaSteps'),0,'revisiting a saved floor also expires milwa');
 g.run("s.pendingStairs=false;castMagic(0,'lomilwa',null);castMagic(0,'milwa',null)");g.drain();
 g.run('s.milwaSteps=1;s.cells.forEach(c=>{c.open=true;c.type=\'\';c.trap=false});s.pos=27;s.dir=1;Math.random=()=>.99;move(\'forward\')');g.drain();
 assert.equal(g.run('s.milwaSteps'),0);assert.equal(g.run('diagonalSight().length'),2,'long light survives milwa expiry');
 g.run("castMagic(0,'milwa',null)");g.drain();g.run('enterTown()');g.drain();
 assert.equal(g.run('s.milwaSteps'),0);assert.deepEqual(J(g,'diagonalSight()'),[]);
}
// All floor-change routes expire short light; failed travel and same-floor warp preserve it.
{
 const g=party();g.run("castMagic(0,'milwa',null)");g.drain();
 g.run('travelFloor(2)');g.drain();assert.equal(g.run('s.floor'),1);assert.equal(g.run('s.milwaSteps'),30);
 g.run("castMagic(1,'malor',1)");g.drain();assert.equal(g.run('s.milwaSteps'),30,'same floor is not a floor change');
 g.run("s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2)");
 assert.equal(g.run('s.floor'),2);assert.equal(g.run('s.milwaSteps'),0);
 g.run("castMagic(0,'milwa',null)");g.drain();g.run("castMagic(1,'malor',1)");g.drain();
 assert.equal(g.run('s.floor'),1);assert.equal(g.run('s.milwaSteps'),0,'warp expires light');
 g.run("s.elevatorFloors=[1,2];s.cells[s.pos].type='elevator';castMagic(0,'milwa',null)");g.drain();
 assert.equal(g.run('travelElevator(2)'),true);assert.equal(g.run('s.milwaSteps'),0,'elevator expires light');
 assert.deepEqual(J(g,'diagonalSight()'),[]);
}
// Mixed rolls in the same row and a later row prove that each living enemy gets its own roll.
{
 const g=party();battle(g,['slime','slime','wolf']);
 g.run(`s.members[1].level=1;s.enemy.units.forEach(e=>e.identified=false);s.enemy.units[1].row=7;
  s.enemy.units.push({id:'rat',uid:200,row:81,hp:0,rewarded:true});
  var rolls=[0,.99,0],rollCount=0;Math.random=()=>{rollCount++;return rolls.shift()};
  castMagic(1,'identifyfoe',null)`);
 assert.equal(g.run('rollCount'),3);
 assert.deepEqual(J(g,'s.enemy.units.map(e=>!!e.identifiedBySpell)'),[true,false,true,false]);
 assert.equal(g.run('s.library.monsters.slime.identified&&s.library.monsters.wolf.identified'),true);
 assert.equal(g.run('s.mp[1]'),997);
}
{
 const g=party();battle(g,['lesserdemon']);g.run("enemyDefinition('lesserdemon').mageResist=0;Math.random=()=>0");
 assert.equal(g.run("castMagic(1,'lakanito',100)"),true);assert.equal(g.run('s.enemy.units[0].hp'),1000);
 assert.equal(J(g,'logQueue.map(e=>e.text)').some(t=>t.endsWith('には効かない！')),true,'demon immunity has its own log');
 assert.equal(g.run('s.enemy.pendingXP||0'),0);
}
// All nine switched spells must fail learning with high random values, including after ensureMagic/reload.
{
 const g=party(),switched=['mahalito','morlis','mamorlis','lakanito','malor','matu','lomilwa','dialma','malikto'];
 g.run(`s.members.forEach(m=>{m.known=[];m.intelligence=15;m.piety=15;m.level=13});Math.random=()=>.999;
  s.members.forEach((_,i)=>learnMagic(i,13));ensureMagic()`);
 for(const id of switched){
  assert.equal(g.run(`magic('${id}').guaranteed`),false);
  assert.equal(g.run(`s.members.some(m=>m.known.includes('${id}'))`),false,`${id} fails its learning roll`);
 }
 const resumed=game(g.run("save();localStorage.getItem('ash-v1')"),()=>.999);
 for(const id of switched)assert.equal(resumed.run(`s.members.some(m=>m.known.includes('${id}'))`),false,`${id} is not granted on load`);
 g.run("s.members[0].known=[];s.members[0].level=5;Math.random=()=>0;learnMagic(0,5)");
 assert.equal(g.run("s.members[0].known.includes('lomilwa')"),false);
 g.run('s.members[0].level=6;learnMagic(0,6)');assert.equal(g.run("s.members[0].known.includes('lomilwa')"),false);
 g.run('s.members[0].level=7;learnMagic(0,7)');assert.equal(g.run("s.members[0].known.includes('lomilwa')"),true);
}
// Enemy spell IDs and old data keys remain stable; the battle log reads the display name.
for(const [monster,id,oldName,name] of [
 ['mage','halito','ハリト','火炎'],['sorcerer','mahalito','マハリト','大火炎'],
 ['deathmage','dalto','ダルト','吹雪'],['greaterdemon','madalto','マダルト','大吹雪'],
 ['archmage','tiltowait','ティルトウェイト','魔弾'],['darkpriest','montino','沈黙','沈黙']]){
 const g=party();battle(g,[monster]);
 assert.deepEqual(J(g,`[enemyDefinition('${monster}').spellInfo.id,enemyDefinition('${monster}').spellInfo.name]`),[id,oldName]);
 g.run(`Object.assign(enemyDefinition('${monster}'),{flee:0,summon:0,breath:null,spell:1});
  Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands)`);
 const logs=J(g,'logQueue.map(e=>e.text)');assert(logs.some(t=>t.includes(`は${name}を唱えた。`)));
 if(name!==oldName)assert(!logs.some(t=>t.includes(oldName)));
 if(id==='madalto')assert.deepEqual(J(g,`enemyDefinition('${monster}').spellInfo.dice`),[6,8,0],'enemy dice stay 6d8');
}
console.log('PASS spell-sync logic: spawns, elemental damage, persistent AC, 30-step light, all-row per-enemy identification, demon immunity, learning, enemy spell names');

// 079: renamed spells keep their IDs and receive complete log-name coloring.
{
 const g=party();
 for(const [id,name] of [['floodfill','開放'],['lakanito','大窒息'],['makanito','窒息'],['montino','沈黙']]){
  assert.equal(g.run(`magic('${id}').name`),name);
  assert.ok(g.run(`coloredLog('術者は${name}を唱えた。')`).includes(`<span class="log-spell">${name}</span>`));
 }
}
