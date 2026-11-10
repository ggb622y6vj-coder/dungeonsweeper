const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

function party() {
 const g=game(null,()=>.5);
 g.run(`
  [0,1,2,1,2,3].forEach((job,i)=>{const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true)});
  enterDungeon();
 `);
 g.drain();
 g.run(`var index=name=>s.members.findIndex(m=>m.name===name);var order=()=>s.members.map(m=>m.name).join('');s.logs=[];`);
 return g;
}
function step(g){g.run('clearTimeout(logTimer);logTimer=null;pumpLog()')}
function battle(g){g.run(`s.enemy={dataVersion:1,units:[{id:'slime',uid:91,row:17,hp:999,identified:true}],initiative:'party'};s.attackRows=s.members.map(()=>17)`)}
function serialized(g,code){return JSON.parse(g.run(`JSON.stringify(${code})`))}

{
 const g=party();battle(g);
 g.run(`
  s.commands=['guard','spell','guard','spell','spell','item'];
  s.magicPlans[1]={id:'halito',target:91};s.magicPlans[3]={id:'halito',target:91};s.magicPlans[4]={id:'dios',target:1};
  s.inventory[5].push('healingPotion');s.itemPlans[5]={id:'healingPotion',slot:1,target:3};
  s.attackRows=[11,12,13,14,15,16];commandConfirmed=s.members.map(()=>true);
  log('攻撃前');s.hp[1]=0;markDeaths();log('Bは倒れた。');
  var records=JSON.stringify(partyRecords());autoReorderParty('test');
 `);
 assert.equal(g.run('order()'),'ACDBEF');
 assert.equal(g.run(`JSON.stringify(JSON.parse(records).map(r=>partyRecords().find(x=>x.members.id===r.members.id)))===records`),true,'all PARTY_FIELDS follow the same person');
 assert.deepEqual(serialized(g,'s.attackRows'),[11,13,14,12,15,16]);
 assert.equal(g.run("s.magicPlans[index('D')].target"),91,'enemy UID never remapped as an ally');
 assert.equal(g.run("s.magicPlans[index('B')].target"),91,'incapacitated member keeps reservation');
 assert.equal(g.run("s.members[s.magicPlans[index('E')].target].name"),'B');
 assert.equal(g.run("s.members[s.itemPlans[index('F')].target].name"),'D');
 assert.equal(g.run("s.commands[index('D')]"),'spell');
 assert.equal(g.run('commandConfirmed.every(Boolean)'),true);
 assert.equal(g.run("logQueue.filter(e=>e.text==='Bが後列に下がった。').length"),1);
 assert.equal(g.run("logQueue.at(-1).members.map(m=>m.name).join('')"),'ACDBEF');
 assert.equal(g.run("displayVitals.members.map(m=>m.name).join('')"),'ABCDEF','no future order leaks');
 g.run("renderStats();var statOrder=()=>[...$('#statsbody').innerHTML.matchAll(/<h3>([A-F]) /g)].map(m=>m[1]).join('');var cardOrder=()=>[...$('#party').innerHTML.matchAll(/<b>([A-F]) /g)].map(m=>m[1]).join('')");
 for(const expected of ['ABCDEF','ABCDEF','ACDBEF']){
  step(g);g.run('renderStats()');assert.equal(g.run('statOrder()'),expected);assert.equal(g.run('cardOrder()'),expected);
  assert.equal(g.run("displayVitals.members.map(m=>m.name).join('')"),expected);
 }
 g.drain();
 const saved=g.run("localStorage.getItem('ash-v1')");
 assert.equal(game(saved).run("s.members.map(m=>m.name).join('')"),'ACDBEF');
 g.run("s.ailments[index('A')].paralysis=4;autoReorderParty('test')");
 assert.equal(g.run('order()'),'CDEABF');
 assert.equal(g.run("logQueue.filter(e=>e.text==='Aが後列に下がった。').length"),1);
 assert.equal(g.run("logQueue.some(e=>e.text==='Bが後列に下がった。')"),false);
 g.drain();
 g.run("s.ailments[index('A')].paralysis=0");
 assert.equal(g.run("autoReorderParty('recovered')"),false);
 assert.equal(g.run('order()'),'CDEABF');
 // New front E is hit; the guard command must still belong to E.
 g.run("s.commands=s.members.map(m=>m.name==='E'?'guard':'fight');var beforeHP=s.hp.slice();Math.random=()=>.999;enemyTurn(s.commands)");
 assert.equal(g.run("s.hp[index('E')]<beforeHP[index('E')]"),true);
 assert.equal(g.run("s.hp.every((h,i)=>i===index('E')||h===beforeHP[i])"),true);
 // Seeded RNG: every physical swing lands only on the new front C,D,E (never A/B/F).
 g.run(`Object.assign(enemyDefinition('slime'),{swings:1,hit:99,attack:[1,1,0],flee:0,summon:0,breath:null,spell:0,statuses:[],death:0,drain:0,steal:0,rear:false});
  s.enemy.units=[{id:'slime',uid:91,row:17,hp:999,identified:true}];s.ailments[index('A')].paralysis=4;
  s.hp=s.members.map((m,i)=>s.hp[i]>0?500:0);s.commands=s.members.map(()=> 'fight');var seed=12345;Math.random=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
  var hitNames=new Set();for(let n=0;n<60;n++){const before=s.hp.slice();enemyTurn(s.commands);s.hp.forEach((h,i)=>{if(h<before[i])hitNames.add(s.members[i].name)})}`);
 assert.equal(g.run('order()'),'CDEABF');
 assert.equal(g.run('[...hitNames].sort().join(\'\')'),'CDE','enemy swings target only the promoted front line');
 console.log('PASS stable front fill, all party fields and reservations by ID, snapshots/names, repeat no-op, cure stays rear, new-front targeting and reload');
}

// Two enemies in one enemy turn: the second sees the promoted formation and
// its guard values, including multiple swings belonging to the same enemy.
{
 const g=party();battle(g);
 g.run(`
  Object.assign(enemyDefinition('slime'),{swings:1,hit:99,attack:[1,1,3],flee:0,summon:0,breath:null,spell:0,statuses:[],death:0,drain:0,steal:0,rear:false});
  s.enemy.units.push({...s.enemy.units[0],uid:92});s.hp[index('B')]=1;
  s.commands=s.members.map(m=>m.name==='D'?'guard':'fight');var dHP=s.hp[index('D')];
  var rolls=[.5,.4,.999,0, .5,.999,.999,0];Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands);
 `);
 assert.equal(g.run('order()'),'ACDBEF');
 assert.equal(g.run("s.hp[index('B')]"),0);
 assert.equal(g.run("s.hp[index('D')]"),g.run('dHP-2'),'second enemy hits promoted D and preserves guard damage reduction');
 assert.equal(g.run("logQueue.filter(e=>e.text==='Bが後列に下がった。').length"),1);
 const h=party();battle(h);
 h.run(`Object.assign(enemyDefinition('slime'),{swings:2,hit:99,attack:[1,1,3],flee:0,summon:0,breath:null,spell:0,statuses:[],death:0,drain:0,steal:0,rear:false});s.hp[1]=1;var rolls=[.5,.4,.999,0,.999,.999,0];Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands)`);
 assert.equal(h.run("logQueue.filter(e=>e.text.includes('ダメージ')).map(e=>e.members.map(m=>m.name).join('')).join(',')"),'ABCDEF,ABCDEF','reorder after one enemy, not between its swings');
 assert.equal(h.run('order()'),'ACDBEF');
 console.log('PASS subsequent enemies use current front and commands; multi-swing action stays atomic');
}

// Turn-start poison remaps a caster and its ally target before executing both
// spell and item reservations. Neither actor is skipped or acts twice.
{
 const g=party();battle(g);
 g.run(`s.hp[index('B')]=2;s.ailments[index('B')].poison=true;s.hp[index('C')]=1;
  s.commands=s.members.map(()=> 'guard');s.commands[3]='spell';s.magicPlans[3]={id:'halito',target:91};
  s.commands[4]='spell';s.magicPlans[4]={id:'dios',target:2};
  s.commands[5]='item';s.inventory[5].push('healingPotion');s.itemPlans[5]={id:'healingPotion',slot:1,target:2};
  var dMP=s.mp[3],eMP=s.mp[4];Math.random=()=>.5;attack()`);
 assert.equal(g.run('order()'),'ACDBEF');
 assert.equal(g.run("s.mp[index('D')]"),g.run('dMP-2'));
 assert.equal(g.run("s.mp[index('E')]"),g.run('eMP-2'));
 assert.equal(g.run("s.inventory[index('F')].includes('healingPotion')"),false);
 assert.equal(g.run("s.hp[index('C')]"),11);
 assert.equal(g.run('s.enemy.units[0].hp'),994);
 for(const text of ['Dは火炎を唱えた。','Eは回復を唱えた。','Fは傷薬を使った。'])assert.equal(g.run(`logQueue.filter(e=>e.text===${JSON.stringify(text)}).length`),1);
 assert.equal(g.run("s.magicPlans.every(p=>p===null)&&s.itemPlans.every(p=>p===null)"),true,'normal end-of-turn reset still happens');
 console.log('PASS poison turn-start remaps and executes real spell/item plans once on the original targets');
}

// Each incapacity criterion works independently, including future stone status
// with positive HP. Poison and sleep alone never cause a retreat.
for(const condition of ["s.members[1].status='dead'","s.members[1].status='ash'","s.members[1].status='lost'","s.members[1].status='stone'",'s.hp[1]=0','s.ailments[1].paralysis=4']){
 const g=party();g.run(condition);
 assert.equal(g.run("autoReorderParty('criteria')"),true,condition);
 assert.equal(g.run('order()'),'ACDBEF');
 assert.equal(g.run("commandMembers().includes(index('B'))"),false);
}
for(const condition of ["s.ailments[1].sleep=4",'s.ailments[1].poison=true',"s.hp[4]=0;s.members[4].status='dead'",'']){
 const g=party();g.run(condition||'void 0');
 g.run('var original=JSON.stringify(s),renders=0,saves=0;render=()=>renders++;save=()=>saves++');
 assert.equal(g.run("autoReorderParty('no-op')"),false,condition);
 assert.equal(g.run('JSON.stringify(s)===original&&renders===0&&saves===0&&logQueue.length===0'),true);
}
{
 const g=party();g.run("for(const k of PARTY_FIELDS)s[k]=s[k].slice(0,3);s.hp[1]=0");
 assert.equal(g.run("autoReorderParty('three')"),false,'no rear replacement, no useless shuffling');
 const h=party();h.run("s.hp=s.hp.map((_,i)=>i===4?20:0);markDeaths();autoReorderParty('one-survivor')");
 assert.equal(h.run('order()'),'EABCDF');
 assert.equal(h.run("logQueue.filter(e=>e.text.includes('後列')).length"),1);
}
console.log('PASS all incapacity criteria, sleep/poison exclusions, no-op without save/render, short and one-survivor parties');

for(const [label,action] of [
 ['floor trap',"s.hp[1]=1;var rolls=[0,.2];Math.random=()=>rolls.shift()??0;triggerFloorTrap(s.cells[s.pos])"],
 ['chest trap',"s.hp[1]=1;Math.random=()=>.2;triggerChestTrap({trap:'needle'})"],
 ['walking poison',"s.hp[1]=2;s.ailments[1].poison=true;s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;c.open=true;delete c.chest});s.pos=0;Math.random=()=>.99;cell(1)"],
 ['field spell',"s.ailments[1].paralysis=4;s.hp[0]=1;castMagic(4,'dios',0)"],
 ['medicine',"s.ailments[1].paralysis=4;s.hp[0]=1;s.inventory[5].push('healingPotion');useMedicine(5,1,0)"],
]){
 const g=party();g.run(action);assert.equal(g.run('order()'),'ACDBEF',label);
 assert.equal(g.run("logQueue.filter(e=>e.text==='Bが後列に下がった。').length"),1,label);
 g.drain();const saved=g.run("save();localStorage.getItem('ash-v1')");
 assert.equal(game(saved).run("s.members.map(m=>m.name).join('')"),'ACDBEF',label+' reload');
}
{
 const g=party();g.run("s.hp[1]=0;markDeaths();autoReorderParty('before-town')");g.drain();g.run('enterTown()');
 assert.equal(g.run('order()'),'ACDEF');assert.equal(g.run("s.reserve[0].members.name"),'B');
 assert.equal(g.run("s.reserve[0].members.status"),'dead');
 const h=party();h.run("s.area='town';s.members[1].status='dead';s.hp[1]=0;s.ailments[0].paralysis=4;save()");
 const loaded=game(h.run("localStorage.getItem('ash-v1')"));
 assert.equal(loaded.run("s.members.map(m=>m.name).join('')"),'CDEAF','load carries B before reordering A');
 assert.equal(loaded.run("s.reserve[0].members.name"),'B');
 assert.equal(loaded.run('s.templeReportFromLoad'),true);
 assert.equal(loaded.run("logQueue.filter(e=>e.text==='Aが後列に下がった。').length"),1);
 const again=game(loaded.run("localStorage.getItem('ash-v1')"));
 assert.equal(again.run("s.members.map(m=>m.name).join('')"),'CDEAF');
 assert.equal(again.run('logQueue.length'),0);
 const dungeon=party();dungeon.run('s.ailments[1].paralysis=4;save()');
 assert.equal(game(dungeon.run("localStorage.getItem('ash-v1')")).run("s.members.map(m=>m.name).join('')"),'ABCDEF','dungeon load does not reorder (spec: town load only)');
}
console.log('PASS floor/chest traps, real movement poison, field spell/medicine, town carry ordering and town/dungeon ash-v1 loads');

for(const action of [
 's.hp=s.hp.map(()=>1);s.ailments.forEach(a=>a.poison=true);tickAilments()',
 's.hp=s.hp.map(()=>1);Math.random=()=>.3;triggerFloorTrap(s.cells[s.pos])',
 'defeat()',
]){
 const g=party();g.run(`var beforeIds=s.members.map(m=>m.id).join();${action}`);
 assert.equal(g.run("autoReorderParty('wipe')"),false);
 assert.equal(g.run('s.corpses[0].records.map(r=>r.members.id).join()===beforeIds'),true,'wipe corpse order preserved');
 assert.equal(g.run("logQueue.some(e=>e.text.includes('後列に下がった'))"),false);
 g.drain();assert.equal(g.run('s.members.length'),0);assert.equal(g.run('s.reserve.length'),0);assert.equal(g.run('s.corpses.length'),1);
}
console.log('PASS wipe skips all reordering and preserves corpse records, reserve and deferred finish');

// Force an incapacity during a resolved ally action to exercise the round's
// stable actor IDs (including the actor that just moved out of index 0).
{
 const g=party();battle(g);
 g.run(`var acted=[],originalAction=partyAction;partyAction=i=>{acted.push(s.members[i].name);originalAction(i);if(s.members[i].name==='A')afflict(i,'paralysis')};s.commands=s.members.map(()=> 'guard');attack()`);
 assert.equal(g.run('acted.slice().sort().join(\'\')'),'ABCDEF');assert.equal(g.run('acted.length'),6);
 assert.equal(g.run('order()'),'BCDAEF');
 assert.equal(g.run("logQueue.filter(e=>e.text==='Aが後列に下がった。').length"),1);
}
{
 const g=party();g.run("s.members[1].status='stone';enterTown()");
 assert.equal(g.run('order()'),'ACDEF','stone is now carried before the town hook (033)');
 assert.equal(g.run("s.reserve.find(r=>r.members.name==='B').members.status"),'stone');
 const h=party();battle(h);h.run("s.ailments[1].paralysis=4;s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true;finishMonsterBattle()");
 assert.equal(h.run('order()'),'ACDBEF');assert.equal(h.run('s.enemy'),null);
 const f=party();battle(f);f.run("s.ailments[1].paralysis=4;Math.random=()=>0;flee()");
 assert.equal(f.run('order()'),'ACDBEF');assert.equal(f.run('s.enemy'),null);
 assert.equal(f.run("logQueue.filter(e=>e.text==='Bが後列に下がった。').length"),1);
 const cure=party();cure.run("s.ailments[1].paralysis=1;autoReorderParty('paralysed')");cure.drain();cure.run('tickAilments()');
 assert.equal(cure.run('order()'),'ACDBEF');assert.equal(cure.run("s.ailments[index('B')].paralysis"),1,'tick never cures paralysis, including legacy value 1');
 assert.equal(cure.run("logQueue.some(e=>e.text==='Bの麻痺が解けた。')"),false);
 cure.run("s.members[index('E')].known.push('dialko')");
 assert.equal(cure.run("castMagic(index('E'),'dialko',index('B'))"),true);
 assert.equal(cure.run("s.ailments[index('B')].paralysis"),0);
 assert.equal(cure.run('order()'),'ACDBEF','field cure keeps recovered member in rear');
 assert.equal(cure.run("logQueue.filter(e=>e.text.includes('後列に下がった')).length"),0);
}
console.log('PASS mid-action actor IDs prevent skips/repeats; town and battle-end hooks, flee, persistent paralysis and field cure stays rear');

{
 const source=party();
 const legacy=source.run("s.hp[1]=0;s.members[1].status='dead';s.magicPlans[4]={id:'dios',target:1};s.members.forEach(m=>delete m.id);JSON.stringify(s)");
 const loaded=game(legacy);loaded.run("autoReorderParty('legacy')");
 assert.equal(loaded.run("s.members.map(m=>m.name).join('')"),'ACDBEF');
 assert.equal(loaded.run('new Set(s.members.map(m=>m.id)).size'),6);
 assert.equal(loaded.run('s.members.every(m=>!!m.id)'),true);
 assert.equal(loaded.run('s.members[s.magicPlans[4].target].name'),'B');
}
console.log('PASS legacy parallel-array load establishes unique member IDs before remapping');
