const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty,seededRandom}=require('../scripts/sim/combat.cjs');
function setup(){const g=game(null,seededRandom(83));createParty(g,[1,2]);g.run(`
s.area='dungeon';s.size=5;s.pos=12;s.cells=Array.from({length:25},()=>({trap:false,flag:false,open:false,type:''}));s.cells[12].open=true;
s.members.forEach((m,i)=>{m.level=15;m.known=MAGIC.filter(x=>x.job===jobOf(i)).map(x=>x.id);s.mp[i]=100});
s.enemy={units:[0,1,2].map(n=>({...makeEnemy('goblin',800+n),row:n===2?91:44,hp:999})),flagEffect:{},initiative:'party'};
resistsEnemySpell=()=>false;Math.random=()=>.5;
checkElevatorUnlock=()=>{s.unlockChecks=(s.unlockChecks||0)+1};
`);g.drain();return g}
const read=(g,e)=>JSON.parse(g.run(`JSON.stringify(${e})`));
for(const id of ['flagkill','flagkill2','flagdebuff','flagdebuff2'])for(const count of [0,1,3]){
 const g=setup();g.run(`for(const j of [6,7,8].slice(0,${count}))Object.assign(s.cells[j],{trap:true,flag:'power'});s.cells[0].trap=true;s.cells[0].flag=true;s.cells[11].flag=true;castMagic(0,'${id}',800)`);
 const n=id.endsWith('2')?count:Math.min(count,1);
 assert.equal(g.run('s.cells.filter(c=>c.disarmed).length'),n,id);
 assert.equal(g.run('s.unlockChecks||0'),n?1:0);
 assert(g.run('s.cells.filter(c=>c.disarmed).every(c=>!c.trap&&!c.flag&&c.open)'));
 assert.equal(g.run('s.cells[0].trap&&s.cells[0].flag'),true,'distant flag preserved');
 assert.equal(g.run('s.cells[11].flag'),true,'false flag preserved');
 if(n===1)assert.equal(g.run('s.cells[6].disarmed'),true,'lowest index first');
 assert.equal(g.run('s.mp[0]'),100-g.run(`magic('${id}').mp`));
 if(id.startsWith('flagkill')){assert(g.run('s.enemy.units[0].hp')<999);assert.equal(g.run('s.enemy.units[1].hp<999'),id.endsWith('2'));}
 else assert.deepEqual(read(g,'s.enemy.units.map(e=>e.acPenalty||0)'),[id==='flagdebuff'?1:count,id==='flagdebuff'?1:count,0]);
 assert.equal(g.run('s.enemy.units[2].hp'),999,'other stable row untouched');
 if(id==='flagdebuff2'&&!count)assert(g.run('logQueue.some(e=>e.text.includes("効果がなかった"))'));
}
for(const id of ['flagkill','flagkill2','flagdebuff','flagdebuff2']){
 const g=setup();g.run(`s.cells[6].trap=true;s.cells[6].flag=true;resistsEnemySpell=()=>true;castMagic(0,'${id}',800)`);
 assert.equal(g.run('s.cells[6].trap'),true,'all resist: flag retained');assert.equal(g.run('s.unlockChecks||0'),0);
 assert.deepEqual(read(g,'s.enemy.units.map(e=>[e.hp,e.acPenalty||0])'),[[999,0],[999,0],[999,0]]);
}
{
 const g=setup();g.run("for(const j of [6,7,8])Object.assign(s.cells[j],{trap:true,flag:true});resistsEnemySpell=e=>e.uid===800;castMagic(0,'flagdebuff2',800)");
 assert.deepEqual(read(g,'s.enemy.units.map(e=>e.acPenalty||0)'),[0,3,0]);assert.equal(g.run('s.unlockChecks'),1);
}
{
 const g=setup();g.run("s.enemy=null;for(const j of [0,6,24])Object.assign(s.cells[j],{trap:true,flag:true});s.cells[1].flag=true;s.cells[2].trap=true;castMagic(1,'sweep',null)");
 assert.equal(g.run('s.cells.filter(c=>c.disarmed).length'),3);assert.equal(g.run('s.cells[1].flag'),true);assert.equal(g.run('s.cells[2].trap'),true);assert.equal(g.run('s.mp[1]'),90);assert.equal(g.run('s.unlockChecks'),1);assert(g.run('logQueue.some(e=>e.text.includes("3個の罠"))'));
}
{
 const g=setup();g.run("openMagic(0)");assert(!g.run("$('#magiclist').innerHTML.includes('data-spell=\"tempt\"')"));
 assert.equal(g.run("castMagic(0,'tempt',null)"),false);g.drain();
 g.run("s.enemy=null;encounterRate=()=>{throw Error('rate must not be used')};commitMagicChoice(0,magic('tempt'),null)");
 assert(g.run('!!s.enemy.units.length'));assert.equal(g.run('s.enemy.chestBattle'),false);assert.equal(g.run('s.mp[0]'),90);assert.equal(g.run('s.dumapicUses||0'),0);
}
console.log('PASS spells flags, sweep and tempt');

{
 const g=setup();g.run("s.enemy=null;s.members[0].level=6;s.members[0].known=['mamahalito'];s.members[1].level=6;s.members[1].known=['lomilwa'];ensureMagic()");
 assert(g.run("s.members[0].known.includes('mamahalito')&&s.members[1].known.includes('lomilwa')"),'previously learned spells retained');
 assert.equal(g.run("magic('mamahalito').level"),8);assert.equal(g.run("magic('lomilwa').level"),7);
}
