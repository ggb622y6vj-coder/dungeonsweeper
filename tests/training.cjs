const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function game(saved=null){
 let timers=[],els={},storage=saved;
 const el=()=>({style:{},dataset:{},children:[],setAttribute(){},addEventListener(){},append(...items){this.children.push(...items)},replaceChildren(...items){this.children=items},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});
 const ctx={crypto:require('node:crypto').webcrypto,structuredClone,document:{addEventListener(){},querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el},localStorage:{getItem:()=>storage,setItem:(k,v)=>{storage=v}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math)};
 vm.createContext(ctx);
 for(const f of ['weapons','monster-data','balance','spells','items','flags','traps','combatui','party','monsters','recruits','library','game','training'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f+'.js'),'utf8'),ctx);
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

// Wipes must preserve complete records separately from the playable roster.
function corpseParty(count=6){
 const g=game();
 g.run(`Math.random=()=>.5;[3,2,0,1,0,2,1].slice(0,${count+1}).forEach((job,i)=>{
  const r=generateRecruit('遺体'+i,job);registerRecruit(r);if(i<${count})changeRecruitParty(r.members.id,true);
 });enterDungeon();`);
 g.drain();return g;
}
g=corpseParty();
g.run(`fresh(3);s.pos=17;s.gold=321;s.cleared=true;s.light=true;s.watchful=true;s.dumapicUses=4;
 s.inventory[0].push('helm','healingPotion');s.armor[0].head=1;s.members[0].xp=123;
 s.members[0].extra={history:[1,2]};s.mp[1]=3;s.ailments[0]={poison:true,paralysis:2};
 var reserveBefore=JSON.stringify(s.reserve),liveRecords=partyRecords(),recordsBefore=structuredClone(liveRecords);
 recordsBefore.forEach(r=>{r.hp=0;r.members.status='dead'});
 log('全滅直前');hurt(999);`);
assert.equal(g.run('s.corpses.length'),1);
assert.equal(g.run('s.gold'),0);
assert.equal(g.run('s.corpses[0].floor'),3);
assert.equal(g.run('s.corpses[0].cell'),17);
assert.equal(g.run('s.corpses[0].gold'),321);
assert.match(g.run('s.corpses[0].id'),/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
assert.equal(g.run('JSON.stringify(s.corpses[0].records)===JSON.stringify(recordsBefore)'),true);
assert.equal(g.run("displayVitals.hp.every(h=>h>0)&&displayVitals.members.every(m=>m.status==='ok')"),true,'death must not leak before its log');
assert.equal(g.run("logQueue.at(-1).hp.every(h=>h===0)&&logQueue.at(-1).members.every(m=>m.status==='dead')"),true);
g.run('defeat();');assert.equal(g.run('s.corpses.length'),1,'repeated defeat must not duplicate corpses');
const duringWipe=g.saved();
assert.equal(JSON.parse(duringWipe).partyIds.length,0);
assert.equal(JSON.parse(duringWipe).roster.length,1,'pending wipe save contains only the existing reserve');
g.drain();
function assertWipeTown(g){
 assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.done'),false);
 assert.equal(g.run('s.members.length'),0);assert.equal(g.run('s.gold'),0);
 assert.equal(g.run('PARTY_FIELDS.every(key=>s[key].length===0)'),true);
 assert.equal(g.run('s.enemy'),null);assert.equal(g.run('s.pendingStairs'),false);
 assert.equal(g.run('s.pendingBoss'),null);assert.equal(g.run('idle()'),true);
 assert.equal(g.run('Object.keys(s.floors).length'),0);
 assert.equal(g.run('s.cells.some(c=>c.open)'),false);
 assert.equal(g.run('s.light||s.watchful||s.dumapicUses>0'),false);
 assert.equal(g.run("$('#entrance').disabled"),true);
}
assertWipeTown(g);
assert.equal(g.run('JSON.stringify(s.reserve)===reserveBefore'),true);
assert.equal(g.run('s.cleared'),true);
g.run("s.corpses[0].records[0].members.name='遺体(<印>)';renderTraining();");
assert.equal(g.run("$('#recruitlist').children[0].textContent"),'迷宮に残された遺体：地下3階（遺体(<印>)、遺体1、遺体2、遺体3、遺体4、遺体5）');
assert.equal(g.run("$('#recruitlist').children[0].innerHTML"),undefined,'names must be rendered as text');
const corpses=g.run('JSON.stringify(s.corpses)');
g.run("liveRecords[0].members.extra.history.push(9);liveRecords[0].inventory.push('sword');save();");
assert.equal(g.run('JSON.stringify(s.corpses)'),corpses,'corpse records must be independent copies');
let restored=game(g.saved());assertWipeTown(restored);
assert.equal(restored.run('JSON.stringify(s.corpses)'),corpses);
restored=game(duringWipe);assertWipeTown(restored);
assert.equal(restored.run('s.corpses.length'),1);
assert.equal(restored.run('s.reserve.length'),1);
assert.equal(restored.run("s.corpses[0].records.every(r=>r.members.status==='dead'&&r.hp===0)"),true);
restored=game(restored.saved());assertWipeTown(restored);
assert.equal(restored.run('s.corpses.length'),1,'reloading completed wipe must not create another corpse');
console.log('PASS wipe snapshots, UUID/location/gold, complete corpse records, empty party, reserve isolation, training text and reload during/after logs');

// Corpses survive new labyrinths and additional wipes without entering the reserve.
g.run('var firstCorpse=JSON.stringify(s.corpses[0]);changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
g.run('fresh(2);s.pos=10;s.gold=45;hurt(999);');g.drain();
assertWipeTown(g);assert.equal(g.run('s.corpses.length'),2);
assert.equal(g.run('JSON.stringify(s.corpses[0])===firstCorpse'),true);
assert.equal(g.run('s.corpses[1].floor'),2);assert.equal(g.run('s.corpses[1].cell'),10);
assert.equal(g.run('s.corpses[1].gold'),45);assert.equal(g.run('s.corpses[1].records.length'),1);
assert.equal(g.run('s.corpses[0].id!==s.corpses[1].id'),true);
assert.equal(g.run('trainingRoster().length'),0);
g.run('defeat();');assert.equal(g.run('s.corpses.length'),2,'empty party cannot leave another corpse');
assert.equal(game(g.saved()).run('s.corpses.length'),2);
console.log('PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls');

for(const [name,action,count] of [
 ['exploration poison','s.ailments.forEach(a=>a.poison=true);cell(1)',6],
 ['battle poison',"s.ailments.forEach(a=>a.poison=true);s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}]};attack()",6],
 ['floor blast','s.cells[1].trap=true;Math.random=()=>.3;cell(1)',6],
 ['floor needle','s.cells[1].trap=true;Math.random=()=>0;cell(1)',1],
 ['chest needle',"s.cells[0].chest={trap:'needle',gold:999};Math.random=()=>0;openChest()",1],
 ['enemy attack',"s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}],initiative:'normal'};s.commands=['guard'];Math.random=()=>.999;attack()",1],
]){
 const g=corpseParty(count);
 g.run(`s.pos=0;s.hp=s.members.map(()=>1);s.gold=17;
 s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;c.open=false;delete c.chest});${action};`);
 assert.equal(g.run('s.corpses.length'),1,name);
 assert.equal(g.run('s.corpses[0].records.length'),count,name);
 assert.equal(g.run('s.corpses[0].cell'),name.startsWith('floor')?1:0,name);
 assert.equal(g.run('s.corpses[0].gold'),17,name);
 g.drain();assertWipeTown(g);
 assert.equal(g.run('s.corpses.length'),1,name);
 assert.equal(g.run('s.gold'),0,name+' cannot gain a chest reward after death');
}
console.log('PASS end-to-end wipes from movement/battle poison, floor traps, chest trap and enemy attack');

const legacySource=corpseParty();
for(const format of ['roster','parallel','three-member']){
 const legacy=JSON.parse(legacySource.run(format==='roster'?'JSON.stringify(rosterSaveState())':'JSON.stringify(s)'));
 delete legacy.corpses;
 if(format==='three-member'){
  delete legacy.partyVersion;
  for(const key of ['members','hp','mp','inventory','equipped','armor','ailments'])legacy[key]=legacy[key].slice(0,3);
 }
 const g=game(JSON.stringify(legacy));
 assert.equal(g.run('s.corpses.length'),0,format);
 assert.equal(g.run('s.members.length'),6,format);
 g.run('renderTraining();save();');assert.equal(game(g.saved()).run('s.corpses.length'),0,format);
}
assert.equal(game().run('s.corpses.length'),0);
console.log('PASS missing corpses defaults to [] for new and old roster/parallel/three-member saves');

// 031: regenerate each floor from the same seed with corpses on stairs, boss and traps.
g=game();
g.run(`
 var rescueSeed=1;
 Math.random=()=>{rescueSeed=(Math.imul(rescueSeed,1664525)+1013904223)>>>0;return rescueSeed/4294967296};
 for(let floor=1;floor<=3;floor++)for(let n=1;n<=1000;n++){
  const seed=floor*10000+n;
  s.corpses=[];rescueSeed=seed;fresh(floor);
  const start=s.start,boss=s.boss,traps=s.cells.flatMap((c,i)=>c.trap?[i]:[]);
  const locations=[start,boss,traps[0],traps[1],traps[0]];
  s.corpses=locations.map((cell,i)=>({id:'corpse-'+i,floor,cell,records:[],gold:i}));
  s.corpses.push({id:'other-floor',floor:floor+1,cell:start,records:[],gold:99});
  rescueSeed=seed;fresh(floor);
  if(s.start!==start||s.boss!==boss)throw Error('generation seed changed');
  if(s.cells.filter(c=>c.trap).length!==traps.length)throw Error('corpse relocation changed trap count');
  if(s.cells[start].type!=='stairs'||s.cells[boss].type!=='boss')throw Error('special cell overwritten');
  for(const [i,corpse] of s.corpses.slice(0,5).entries()){
   if(corpse.cell===start||corpse.cell===boss||s.cells[corpse.cell].trap||s.cells[corpse.cell].type!=='')throw Error('unsafe corpse');
   if(i<2){
    const from=locations[i],to=corpse.cell;
    if(Math.abs(from%size()-to%size())+Math.abs((from/size()|0)-(to/size()|0))!==1)throw Error('not nearest normal cell');
   }else if(corpse.cell!==locations[i])throw Error('ordinary corpse moved');
  }
  if(s.corpses[5].cell!==start)throw Error('other floor corpse moved');
  if([start,...around(start)].some(i=>s.cells[i].trap))throw Error('unsafe entrance');
  const reached=new Set([start]),pending=[start];
  while(pending.length){const p=pending.shift();for(let i=0;i<s.cells.length;i++)if(adjacent(p,i)&&!s.cells[i].trap&&!reached.has(i)){reached.add(i);pending.push(i)}}
  if(!reached.has(boss))throw Error('guardian safe route broken');
  if(JSON.stringify(JSON.parse(localStorage.getItem('ash-v1')).corpses)!==JSON.stringify(s.corpses))throw Error('relocation not saved');
 }
`);
console.log('PASS rescue generation: 1000 maps per floor (1–3F), nearest relocation, trap counts, safe entrance/route, other floors and persistence');

// Wipe -> reserve rescue party -> visible bones -> recover -> reload -> temple.
g=corpseParty(2);
g.run(`s.gold=321;s.inventory[0].push('helm','healingPotion');s.armor[0].head=1;
 s.members[0].xp=42;s.mp[1]=2;hurt(999);`);g.drain();
const rescuedRecords=g.run('JSON.stringify(s.corpses[0].records)');
const rescuedIds=g.run('s.corpses[0].records.map(r=>r.members.id).join()');
g.run('changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
assert.equal(g.run('s.members.length'),1);
assert.equal(g.run('s.reserve.length'),0);
g.run('var rescueCell=s.corpses[0].cell;');
assert.equal(g.run('s.cells[rescueCell].open'),false);
function corpseMarkup(g){return g.run("$('#board').innerHTML.match(new RegExp('<button[^>]*data-i=\"'+rescueCell+'\"[^>]*>[\\\\s\\\\S]*?</button>'))[0]");}
assert.match(corpseMarkup(g),/🦴/);
assert.match(corpseMarkup(g),/遺体/);
g.run('s.cells[rescueCell].flag="power";render()');assert.match(corpseMarkup(g),/🦴/);
g.run('mode="move";cell(rescueCell)');g.drain();
assert.equal(g.run('s.corpses.length'),1,'a flagged corpse cell must still block movement');
g.run('s.cells[rescueCell].flag=false;save()');
g=game(g.saved());
g.run('var rescueCell=s.corpses[0].cell;Math.random=()=>.99;');
assert.match(corpseMarkup(g),/🦴/);
assert.equal(g.run('adjacent(s.pos,rescueCell)'),true);
g.run('cell(rescueCell);');g.drain();
assert.equal(g.run('s.corpses.length'),0);
assert.equal(g.run('s.gold'),321);
assert.equal(g.run('s.members.length'),1);
assert.equal(g.run('JSON.stringify(s.reserve)'),rescuedRecords,'recover every field without reviving or altering equipment');
assert.equal(g.run("s.reserve.every(r=>r.hp===0&&r.members.status==='dead')"),true);
assert.equal(g.run("s.logs.filter(t=>t==='遺体を回収した。').length"),1);
assert.doesNotMatch(corpseMarkup(g),/🦴/);
g.run('cell(s.start)');g.drain();g.run('answerStairs(false)');g.drain();g.run('cell(rescueCell)');g.drain();
assert.equal(g.run('s.gold'),321,'revisiting must not duplicate rewards');
assert.equal(g.run('s.reserve.length'),2);
g=game(g.saved());
assert.equal(g.run('s.corpses.length'),0);
assert.equal(g.run('s.reserve.map(r=>r.members.id).join()'),rescuedIds);
assert.equal(g.run('s.gold'),321);
g.run('enterTown();Math.random=()=>0;var rescuedId=s.reserve[0].members.id;var raised=templeRaise(rescuedId);');
assert.equal(g.run('raised.success'),true);
assert.equal(g.run('s.reserve[0].members.status'),'ok');
assert.equal(g.run('s.reserve[0].hp'),g.run('s.reserve[0].members.maxHP'));
assert.equal(g.run('s.reserve[0].mp'),g.run('s.reserve[0].members.maxMP'));
assert.equal(g.run('s.gold'),221);
assert.equal(g.run('changeRecruitParty(rescuedId,true)'),true);
console.log('PASS rescue: real wipe, replacement party, hidden/flagged/reloaded bone icon, full dead records/gold recovered once, temple and rejoining');

// Several wipes may share a cell; collect all before rolling the normal encounter.
g=corpseParty(1);
g.run('s.gold=123;hurt(999)');g.drain();
g.run(`changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();`);g.drain();
g.run(`var rescueCell=s.corpses[0].cell;
 var extra=generateRecruit('追加遺体',2);extra.members.status='dead';extra.hp=0;
 s.corpses.push({id:'same-cell',floor:1,cell:rescueCell,records:[extra],gold:45},
  {id:'other-cell',floor:1,cell:s.boss,records:[],gold:99},
  {id:'other-floor',floor:2,cell:rescueCell,records:[],gold:88});
 var realEncounter=encounter, encounterSawRecovery=false;
 encounter=(...args)=>{encounterSawRecovery=s.reserve.length===2&&s.gold===168&&s.corpses.length===2;return realEncounter(...args)};
 Math.random=()=>0;cell(rescueCell);`);
assert.equal(g.run('encounterSawRecovery'),true);
assert.equal(g.run('s.corpses.map(c=>c.id).join()'),'other-cell,other-floor');
assert.equal(g.run("logQueue.findIndex(e=>e.text==='遺体を回収した。')<logQueue.findIndex(e=>e.encounter)"),true);
assert.equal(g.run("logQueue.find(e=>e.text==='遺体を回収した。').enemy"),null);
g.drain();
assert.equal(g.run('s.reserve.length'),2);
assert.equal(g.run('s.gold'),168);
console.log('PASS rescue: overlapping corpses collected together, other cells/floors retained, normal encounter and snapshot order preserved');
