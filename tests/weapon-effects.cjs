const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty,seededRandom}=require('../scripts/sim/combat.cjs');
function setup(id,number=0,flags=number,unexplored=true){
 const g=game(null,seededRandom(79));createParty(g,[0,1,2,3]);g.drain();
 g.run(`s.area='dungeon';s.size=8;s.pos=27;s.cells=Array.from({length:64},()=>({trap:false,open:true,flag:false,type:''}));var near=around(s.pos);near.forEach((j,n)=>{s.cells[j].trap=n<${number};s.cells[j].flag=n<${flags}?'magic':false;s.cells[j].open=!${unexplored}});var wi=WEAPONS.find(w=>w.id==='${id}').classes[0];var actor=s.members.findIndex(m=>m.job===wi);s.inventory[actor]=['${id}'];s.equipped[actor]=0;s.members[actor].str=15;s.members[actor].level=1;encounter(s.pos);s.enemy.units=[{id:'goblin',uid:0,row:71,hp:999,rewarded:false}];s.enemy.flagEffect={counts:{},curses:[],bad:false};Math.random=()=>.99;`);g.drain();return g;
}
const val=(g,code)=>g.run(code);
function attack(g){return JSON.parse(g.run('JSON.stringify(physicalAttack(actor,s.enemy.units[0]))'))}
for(const id of ['flagaxe','mitibikinoono','eighteyespear']){
 const g=setup(id,2,3);const base=g.run('equippedWeapon(actor).dice[0]*equippedWeapon(actor).dice[1]+equippedWeapon(actor).dice[2]');
 assert.equal(attack(g).damage,base+2,'correct flags only / current number');
 g.run('s.cells.forEach(c=>{c.trap=false;c.flag=false})');assert.equal(attack(g).damage,base+2,'snapshot stays fixed');
 const z=setup(id,0,2);assert.equal(attack(z).damage,z.run('equippedWeapon(actor).dice[0]*equippedWeapon(actor).dice[1]+equippedWeapon(actor).dice[2]'),'incorrect flags add nothing');
}
for(const id of ['mumeinoken','zerosword']){const g=setup(id);assert.equal(attack(g).count,2);assert.equal(attack(g).count,2,'does not stack');assert.equal(attack(setup(id,1)).count,1)}
for(const id of ['flagsword','reversalblade']){
 const g=setup(id,1,1);g.run('var threshold=21-enemyDefinition("goblin").ac-([0,2].includes(jobOf(actor))?2:0);Math.random=()=>(threshold-1)/20');assert.equal(attack(g).hitsCount,1);
 g.run('s.enemy.weaponEffects.flags=2');assert.equal(attack(g).hitsCount,0,'mismatch does not improve accuracy');
}
for(const [id,pct] of [['hatajirusinoyumi',10],['deductiondagger',15],['makyuu',25]]){
 const g=setup(id,1,1);g.run('dice=()=>({value:19})');const base=19;
 g.run('Math.random=()=>0');assert.equal(attack(g).hitsCount,0,'miss does not consume first hit');g.run('Math.random=()=>.99');
 assert.equal(attack(g).damage,Math.floor(base*(100+pct)/100));assert.equal(attack(g).damage,base,'once per battle');
 const no=setup(id,1,0,false);no.run('dice=()=>({value:19})');assert.equal(attack(no).damage,base);
 g.run('encounter(s.pos);s.enemy.units=[{id:"goblin",uid:0,row:71,hp:999}];Math.random=()=>.99');assert.equal(attack(g).damage,Math.floor(base*(100+pct)/100),'new battle resets');
}
// Surveyor: one proc per cast, only its owner; odd costs round up.
for(const number of [0,1,2]){
 const g=setup('surveyorstaff',number);g.run('s.members[actor].known.push("mahalito");s.mp[actor]=100;enemyDefinition("goblin").mageResist=0;Math.random=()=>.09;dice=()=>({value:19})');
 g.run('castMagic(actor,"mahalito",0)');
 const cost=g.run('baseSpellCost(magic("mahalito"))');assert.equal(g.run('100-s.mp[actor]'),number===1?Math.ceil(cost/2):cost);
 const raw=19;assert.equal(g.run('999-s.enemy.units[0].hp'),number===2?Math.floor(raw*110/100):raw);
 if(number===1){g.run('s.mp[actor]=100;Math.random=()=>.9;castMagic(actor,"mahalito",0)');assert.equal(g.run('100-s.mp[actor]'),cost)}
 g.run('s.members[2].known.push("lorto");s.mp[2]=100;enemyDefinition("goblin").priestResist=0;Math.random=()=>.09;var hpBefore=s.enemy.units[0].hp;castMagic(2,"lorto",0)');assert.equal(g.run('hpBefore-s.enemy.units[0].hp'),19);
}
function win(g){g.run('s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true;finishMonsterBattle();render()')}
for(const id of ['hatajirusinosentui','sealinghammer']){
 const g=setup(id,2,3);g.run('Math.random=()=>0');win(g);
 assert.equal(g.run('near.filter(j=>s.cells[j].disarmed&&!s.cells[j].trap&&!s.cells[j].flag).length'),2);assert.equal(g.run('!!s.cells[near[2]].flag'),true,'wrong flag stays');assert.equal(g.run('s.cells[near[3]].disarmed'),undefined);
 assert(g.run('logQueue.some(e=>e.text.includes("罠を2個解除"))'));g.drain();const loaded=game(g.run('localStorage.getItem("ash-v1")'));assert.equal(loaded.run('s.cells.filter(c=>c.disarmed).length'),2);
 for(const condition of ['Math.random=()=>.5','s.hp[actor]=0','s.members[actor].status="stone"','s.enemy.units[0].escaped=true']){const no=setup(id,2,2);no.run('Math.random=()=>0;'+condition);win(no);assert.equal(no.run('s.cells.filter(c=>c.disarmed).length'),0,condition)}
}
for(const id of ['hatajirusinotanken','scoutingdagger']){
 const g=setup(id);g.run('s.cells.forEach(c=>c.open=true);s.cells[near[0]].open=false;s.cells[near[0]].safe=true;Math.random=()=>0');win(g);assert.equal(g.run('s.cells[near[0]].open'),true);assert.equal(g.run('s.elevatorFloors.includes(1)'),true,'actual elevator unlock');assert(g.run('logQueue.some(e=>e.text.includes("安全なマスを1つ開いた"))'));
 g.drain();const loaded=game(g.run('localStorage.getItem("ash-v1")'));assert.equal(loaded.run('s.cells[18].open'),true);assert.equal(loaded.run('s.elevatorFloors.includes(1)'),true);
 const no=setup(id,1,1);no.run('Math.random=()=>0;s.cells[near[0]].safe=true;s.cells[near[1]].safe=false');win(no);assert.equal(no.run('near.every(j=>!s.cells[j].open)'),true,'no unknown or trapped cells open');assert(no.run('logQueue.some(e=>e.text.includes("開ける安全なマスはなかった"))'));
 const fail=setup(id);fail.run('s.cells[near[0]].safe=true;Math.random=()=>.9;'+(id==='scoutingdagger'?'s.hp[actor]=0;':''));win(fail);assert.equal(fail.run('s.cells[near[0]].open'),false);
}
// No effect for a nonparticipant or a dead wielder; zero flags also match zero.
{const g=setup('flagsword');g.run('var threshold=21-enemyDefinition("goblin").ac-2;Math.random=()=>(threshold-1)/20');assert.equal(attack(g).hitsCount,1);}
{const g=setup('flagaxe',2,2);g.run('s.enemy.weaponEffects.members=[]');assert.equal(attack(g).damage,10);}
{const g=setup('flagaxe',2,2);g.run('s.hp[actor]=0');assert.equal(attack(g).damage,10);}
{const g=setup('scoutingdagger');g.run('s.cells[near[0]].safe=true;s.cells[near[1]].safe=true;Math.random=()=>.99');win(g);assert.equal(g.run('near.filter(j=>s.cells[j].open).length'),1);assert.equal(g.run('s.cells[near[1]].open'),true,'random safe candidate');}
// Stable ownership survives party reorder and saved in-progress battles.
{const g=setup('flagaxe',2,2);g.run('var owner=s.members[actor].id;for(const key of PARTY_FIELDS){const a=s[key][0];s[key][0]=s[key][1];s[key][1]=a}actor=s.members.findIndex(m=>m.id===owner);save()');assert.equal(attack(g).damage,12);const loaded=game(g.run('localStorage.getItem("ash-v1")'));loaded.run('Math.random=()=>.99');assert.equal(loaded.run('physicalAttack(1,s.enemy.units[0]).damage'),12);}
console.log('weapon effects PASS');
