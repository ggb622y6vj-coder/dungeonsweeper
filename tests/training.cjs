const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function game(saved=null){
 let timers=[],els={},storage=saved;
 const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});
 const ctx={crypto:require('node:crypto').webcrypto,structuredClone,document:{addEventListener(){},querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el},localStorage:{getItem:()=>storage,setItem:(k,v)=>{storage=v}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math)};
 vm.createContext(ctx);
 for(const f of ['weapons','monster-data','balance','spells','items','flags','traps','combatui','party','monsters','recruits','game'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f+'.js'),'utf8'),ctx);
 return {run:code=>vm.runInContext(code,ctx),saved:()=>storage,drain:()=>{for(let n=0;timers.length;n++){if(n>300)throw Error('timer loop');timers.shift()()}}};
}
let g=game();
assert.equal(g.run('s.members.length'),0);assert.equal(g.run('s.reserve.length'),0);
g.run('enterDungeon()');assert.equal(g.run('s.area'),'town');
console.log('PASS new game starts empty; dungeon blocked');
assert.equal(g.run("generateRecruit('',0)"),null);assert.equal(g.run("generateRecruit('x',4)"),null);
const ids=new Set();
for(let job=0;job<4;job++){
 const values=new Set();
 for(let n=0;n<100;n++){
  const r=g.run(`generateRecruit('冒険者',${job})`),m=r.members;
  assert(!ids.has(m.id));ids.add(m.id);assert.equal(m.level,1);assert.equal(m.xp,0);
  const base=[[12,8,8],[8,12,8],[10,8,12],[10,10,8]][job],stats=[m.str,m.intelligence,m.piety];
  stats.forEach((v,i)=>assert(v>=base[i]&&v<=18));assert.equal(stats.reduce((a,b)=>a+b)-base.reduce((a,b)=>a+b),m.creationBonus);
  assert(m.creationBonus>=3&&m.creationBonus<=9);assert(m.maxHP>=[29,21,23,22][job]&&m.maxHP<=[35,27,29,28][job]);
  assert(m.maxMP>=[0,18,13,0][job]&&m.maxMP<=[0,22,17,0][job]);assert.equal(m.ac,[6,9,7,8][job]);
  assert(m.xpTargets[2]>=Math.round(115*[.8,1.2,1,.85][job]*.9));assert(m.xpTargets[2]<=Math.round(115*[.8,1.2,1,.85][job]*1.1));
  values.add(JSON.stringify(stats)+m.maxHP+','+m.maxMP);
 }
 assert(values.size>1);
}
assert.equal(g.run('trainingRoster().length'),0);
console.log('PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation');
g.run("var recruits=[0,0,0,2,1,3,1].map((job,i)=>generateRecruit('登録'+i,job));recruits.forEach(registerRecruit)");
assert.equal(g.run('s.reserve.length'),7);assert.equal(g.run('registerRecruit(recruits[0])'),false);
g.run('recruits.slice(0,6).forEach(r=>changeRecruitParty(r.members.id,true))');
assert.equal(g.run('s.members.length'),6);assert.equal(g.run('changeRecruitParty(recruits[6].members.id,true)'),false);
assert.equal(g.run('setPartyFromRoster(trainingRoster(),[0,0])'),false);
g.run("s.gold=1000;buy('helm',0);equip(0,1);s.members[0].xp=50;s.hp[0]-=2;s.inventory[0].push('healingPotion');save();var retained=JSON.stringify(partyRecords()[0]);");
assert.equal(g.run('effectiveAC(0)'),4);
g.run('changeRecruitParty(recruits[0].members.id,false)');assert.equal(g.run('JSON.stringify(s.reserve.find(r=>r.members.id===recruits[0].members.id))'),g.run('retained'));
g.run('changeRecruitParty(recruits[0].members.id,true);reorderParty([5,0,1,2,3,4])');assert.equal(g.run('JSON.stringify(partyRecords()[0])'),g.run('retained'));
let saved=g.saved(),decoded=JSON.parse(saved);assert.equal(decoded.roster.length,7);assert.equal(decoded.partyIds.length,6);assert(!('members'in decoded));
g=game(saved);assert.equal(g.run('s.members.length'),6);assert.equal(g.run('s.inventory[0][1]'), 'helm');assert.equal(g.run('effectiveAC(0)'),4);assert.equal(g.run('s.members[0].xp'),50);
console.log('PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload');
g.run('var strength=s.members[0].baseStr;s.members[0].xp=s.members[0].xpTargets[6];levelUp()');assert.equal(g.run('s.members[0].str'),Math.min(18,g.run('strength')+1));
g.run("Math.random=()=>0;monsterOnHit({id:'terror'},0)");assert.equal(g.run('s.members[0].level'),5);assert.equal(g.run('s.members[0].str'),g.run('strength'));
g.drain();g.run('s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));enterDungeon()');g.drain();
assert.equal(g.run('s.area'),'dungeon');assert.equal(g.run('deleteRecruit(s.members[0].id)'),false);
g.run("s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,rewarded:false}],initiative:'party'};s.commands=s.members.map(()=> 'guard');s.commands[0]='fight';s.attackRows=s.members.map(()=>0);Math.random=()=>.999;attack()");g.drain();assert(g.run('s.enemy.units[0].hp')<999);
g.run("var mage=s.members.findIndex(m=>m.job===1),priest=s.members.findIndex(m=>m.job===2);var oldMP=s.mp[mage];castMagic(mage,'halito',0)");g.drain();assert(g.run('s.mp[mage]')<g.run('oldMP'));
g.run("s.hp[0]=1;castMagic(priest,'dios',0)");g.drain();assert(g.run('s.hp[0]')>1);
g.run('s.enemy=null;var oldCells=s.cells;enterTown()');g.drain();assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.cells===oldCells'),false);assert.equal(g.run('trainingRoster().length'),7);
console.log('PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration');
g.run('trainingRoster().map(r=>r.members.id).forEach(deleteRecruit)');assert.equal(g.run('trainingRoster().length'),0);assert.equal(g.run('s.members.length'),0);
g=game(g.saved());assert.equal(g.run('trainingRoster().length'),0);g.run('enterDungeon()');assert.equal(g.run('s.area'),'town');
console.log('PASS deletion including last active member and empty save reload');
g=game();g.run("s.area='town';s.pos=0;var st=[0,1,2].map(i=>generateRecruit('状態'+i,0));st.forEach(registerRecruit);s.reserve[0].members.status='lost';s.reserve[1].members.status='dead';s.reserve[2].members.status='ash'");
assert.equal(g.run('changeRecruitParty(st[0].members.id,true)'),false);assert.equal(g.run('changeRecruitParty(st[1].members.id,true)'),true);assert.equal(g.run('changeRecruitParty(st[2].members.id,true)'),true);
assert.equal(g.run('deleteRecruit(st[0].members.id)'),true);assert.equal(g.run('trainingRoster().some(r=>r.members.id===st[0].members.id)'),false);
console.log('PASS lost recruits cannot join but can be deleted; dead/ash can join');
