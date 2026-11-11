// 095: elite careers, shared equipment, delayed learning and durable migration evidence.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {game}=require('../scripts/sim/harness.cjs');
const read=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
function setup(saved=null){
 const g=game(saved,()=>.5);
 g.run(`const create=document.createElement;document.createElement=tag=>Object.assign(create(tag),{dataset:{}})`);
 g.run(fs.readFileSync(path.join(__dirname,'../dist/training.js'),'utf8'));
 g.run(`
 function at(id){return trainingRoster().find(r=>r.members.id===id)}
 function recruit(job,join=true){const r=generateRecruit('冒険者'+trainingRoster().length,job);registerRecruit(r);if(join)changeRecruitParty(r.members.id,true);return r.members.id}
 function prepare(id){const r=at(id);r.members.level=10;r.inventory=['sword','staff','mace','dagger','helm','wardrobe','ninjagarb','boots'];r.equipped=r.members.job;r.armor={head:4,body:5,feet:7};const i=s.members.findIndex(m=>m.id===id);if(i>=0)for(const key of PARTY_FIELDS)s[key][i]=r[key];return r}
 function change(id,job){$('#trainingopen').onclick();openClassChange(id);classChangeJob=job;renderClassChange();$('#classchangeconfirm').onclick();return at(id)}
 function elite(job,join=true){const id=recruit(job===7?1:0,join);prepare(id);change(id,job);return id}
 function battle(){s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;s.enemy={units:[{...makeEnemy('goblin',901),row:73,hp:999}],initiative:'party'};displayCombat=undefined;resetCommandEntry();render()}
 function field(){s.enemy=null;displayCombat=undefined;s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;s.pos=27;s.dir=1;s.cells[28]={trap:false,open:false,flag:false,type:''};render()}
 `);
 return g;
}
let g=setup();
const eliteData=[
 ['samurai','侍',30,0,3,6,4,[1,6,2],1.4,[1,2,0],4,1],
 ['lord','君主',32,0,3,5,4,[1,6,2],1.5,[1,2,0],4,1],
 ['ninja','忍者',27,0,1,7,3,[1,5,2],1.45,[0,1,0],null,2],
 ['bishop','司教',24,18,0,8,1,[1,4,2],1.6,[1,3,0],null,2],
];
assert.deepEqual(read(g,'CLASSES.slice(4).map(c=>[c.id,c.name,c.hp,c.mp,c.attack,c.ac,c.hit,c.hpGrowth,c.xpFactor,c.mpGrowth,c.mpFromLevel??null,c.attackEvery])'),eliteData);
assert.equal(g.run('typeof CLASS_FEATURES'),'undefined');
g.run('var id=recruit(0);var r=prepare(id)');
const prerequisites={4:[0,1],5:[0,2],6:[0,3],7:[1,2]};
for(let from=0;from<8;from++)for(let to=0;to<8;to++){
 const ok=from!==to&&(to<4||prerequisites[to].includes(from));
 g.run(`r.members.job=${from}`);
 const before=g.run('JSON.stringify(s)');
 const check=read(g,`canChangeClass(r,${to})`);
 assert.equal(check.ok,ok,`${from} -> ${to}`);
 assert.equal(g.run('JSON.stringify(s)'),before,'eligibility is pure');
 if(!ok){assert(check.reason);if(from!==to&&to>=4)for(const j of prerequisites[to])assert(check.reason.includes(g.run(`CLASSES[${j}].name`)));}
 g.run(`$('#trainingopen').onclick();openClassChange(id)`);
 const buttons=read(g,"$('#classchangejobs').children.map(b=>({job:+b.attributes['data-class-job'],text:b.textContent,disabled:b.disabled,title:b.title||'',className:b.className||''}))");
 assert.equal(buttons.length,8);assert.equal(buttons[to].disabled,!ok);
 assert.equal(buttons[to].text,g.run(`CLASSES[${to}].name`));
 assert.equal(buttons[to].className.includes('job-ready'),ok);
 if(!ok)assert.equal(buttons[to].title,check.reason);
}
for(const job of [4,5,6,7])assert.equal(g.run(`generateRecruit('新規不可',${job})`),null);
for(const job of [-1,8,1.5,null])assert.equal(g.run(`canChangeClass(r,${JSON.stringify(job)}).ok`),false);
assert.deepEqual(read(g,'[4,5,6,7].map(job=>[strengthFor(job,1),agilityFor(job,1)])'),[[13,10],[14,9],[12,14],[9,9]]);
console.log('PASS elite jobs: exact class data, 64 career pairs, job-name buttons, pure queries, recruit restrictions and fallback stats');

// MP inheritance, delayed starts, effective levels, retrying missed spells with school-specific stats.
for(const job of [0,1,2,3,4,5,6,7]){
 g=setup();g.run(`var id=recruit(${job===7?1:0});prepare(id);s.members[0].maxMP=50;s.members[0].known=['dumapic'];change(id,${job===0?1:job});`);
 if(job===0)g.run('s.members[0].level=10;change(id,0)');
 assert.equal(g.run('s.members[0].maxMP'),50);
 assert.deepEqual(read(g,'s.members[0].known'),['dumapic']);
 assert.equal(g.run('s.members[0].classChanged'),true);
 // Zero RNG makes growth exact and learns every eligible spell.
 g.run('Math.random=()=>0;s.members[0].intelligence=30;s.members[0].piety=30');
 for(let lv=2;lv<=6;lv++){
  const previous=g.run('s.members[0].maxMP');
  g.run(`s.members[0].xp=s.members[0].xpTargets[${lv}];levelUp()`);
  assert.equal(g.run('s.members[0].maxMP')-previous,[0,3,6].includes(job)||([4,5].includes(job)&&lv<4)?0:1,`job ${job} Lv${lv} MP`);
  const schools=job===1?[[1,lv]]:job===2?[[2,lv]]:job===4?[[1,Math.max(0,Math.floor((lv-2)/2))]]:job===5?[[2,Math.max(0,Math.floor((lv-2)/2))]]:job===7?[[1,Math.floor((lv+1)/2)],[2,Math.floor((lv+1)/2)]]:[];
  assert.deepEqual(read(g,`magicLearning(${job},${lv}).map(x=>[x.job,x.level])`),schools);
  const expected=read(g,`MAGIC.filter(x=>${JSON.stringify(schools)}.some(([job,level])=>x.job===job&&x.level<=level)).map(x=>x.id)`);
  assert.deepEqual([...new Set(read(g,'s.members[0].known'))].sort(),[...new Set(['dumapic',...expected])].sort());
 }
}
g=setup();g.run('elite(7);s.members[0].known=[];s.members[0].intelligence=0;s.members[0].piety=30');
assert.deepEqual(read(g,'magicLearning(7,1)'),[{job:1,level:1},{job:2,level:1}]);
for(const [job,school] of [[4,1],[5,2]])for(const lv of [1,2,3])assert.deepEqual(read(g,`magicLearning(${job},${lv})`),[{job:school,level:0}]);
g.run('learnMagic(0,1)');
assert.deepEqual(read(g,'s.members[0].known'),read(g,'MAGIC.filter(x=>x.level===1&&(x.guaranteed||x.job===2)).map(x=>x.id)'));
g.run('s.members[0].intelligence=30;learnMagic(0,3)');
assert.deepEqual(read(g,'s.members[0].known').sort(),read(g,'MAGIC.filter(x=>x.level<=2).map(x=>x.id)').sort());
for(const [job,school] of [[0,1],[1,1],[2,2],[3,1],[4,1],[5,2],[6,1],[7,1]]){
 g.run(`s.members[0].job=${job};s.members[0].known=['halito','dios'];openMagic(0)`);assert.equal(g.run('spellSchool'),school);
 for(const [known,onlySchool] of [['halito',1],['dios',2]]){g.run(`s.members[0].known=['${known}'];openMagic(0)`);assert.equal(g.run('spellSchool'),onlySchool);assert.equal(g.run("$('#magictabs').hidden"),true);}
}
console.log('PASS elite jobs: MP growth boundaries/inheritance, delayed dual-school learning/retries/stats and preferred spell tabs');

// All items use the same compatibility in basic/elite jobs, including medicines.
g=setup();
const items=read(g,'WEAPONS');
// 102: explicit snapshot classes include elite jobs and new item exceptions.
for(let job=0;job<8;job++)for(const w of items)assert.equal(g.run(`canEquipJob(weapon('${w.id}'),${job})`),w.classes.includes(job),`${job}: ${w.id}`);
assert.equal(g.run('canEquipJob(undefined,7)'),false);
for(const [job,allowed,denied,starter] of [[4,'plate','dagger','sword'],[5,'wardrobe','staff','sword'],[6,'dagger','sword','dagger'],[7,'staff','sword','mace']]){
 g=setup();g.run(`elite(${job});s.inventory[0]=[];ensureProfile()`);
 assert.deepEqual(read(g,'s.inventory[0]'),[starter]);
 g.run(`s.gold=9999;buy('${allowed}',0)`);g.drain();
 assert.equal(g.run('s.inventory[0][1]'),allowed);
 const before=read(g,'[s.gold,s.inventory[0]]');g.run(`buy('${denied}',0)`);assert.deepEqual(read(g,'[s.gold,s.inventory[0]]'),before);
 g.run(`equip(0,1)`);assert.equal(g.run(`isEquipped(0,1)`),true);
 g.run(`s.inventory[0].push('${denied}');equip(0,2)`);assert.equal(g.run('isEquipped(0,2)'),false);
 g.run(`var other=recruit(${job===6?1:3});reorderParty([1,0]);s.inventory[0]=['staff'];s.inventory[1]=['${starter}']`);
 assert.equal(g.run(`lootRecipient(weapon('${allowed}'))`),1);
 g.run("s.inventory[1]=Array(10).fill('robe')");assert.equal(g.run(`lootRecipient(weapon('${allowed}'))`),0);
}
// Current compatible weapon wins; armor is filtered independently; no free items at conversion.
for(const [from,to,equipped,armor] of [[2,5,2,{head:4,body:5,feet:7}],[1,7,1,{body:5,feet:7}],[0,4,0,{head:4,feet:7}],[0,6,3,{feet:7}]]){
 g=setup();g.run(`var id=recruit(${from});prepare(id);var inventoryBefore=JSON.stringify(s.inventory[0]);change(id,${to})`);
 assert.equal(g.run('s.equipped[0]'),equipped);assert.deepEqual(read(g,'s.armor[0]'),armor);assert.equal(g.run('JSON.stringify(s.inventory[0])'),g.run('inventoryBefore'));
}
console.log('PASS elite jobs: full equipment matrix, medicine compatibility, starter rescue, real purchase/equip/loot and conversion retention');

// Deterministic hit-boundary tests use a normal sword with STR bonus zero.
for(const job of [0,1,2,3,4,5,6,7])for(const lv of [1,5,6,7,8,11,12,24,30]){
 g=setup();g.run(`recruit(0);s.members[0].job=${job};s.members[0].level=${lv};s.members[0].str=12;battle()`);
 const interval=({0:5,4:6,5:6,6:8})[job],count=interval?1+Math.floor(lv/interval):1;
 const hit=[0,2,4,5].includes(job)?2+Math.floor(lv/3):Math.floor(lv/5);
 const threshold=Math.max(1,Math.min(19,21-g.run("enemyDefinition('goblin').ac")-hit));
 g.run(`Math.random=()=>${(threshold-.5)/20}`);assert.equal(g.run('physicalAttack(0,s.enemy.units[0]).hitsCount'),0);
 g.run(`Math.random=()=>${(threshold+.5)/20}`);assert.deepEqual(read(g,'[physicalAttack(0,s.enemy.units[0]).count,physicalAttack(0,s.enemy.units[0]).hitsCount]'),[count,count]);
}
for(const job of [4,5,6]){
 g=setup();g.run(`elite(${job});battle();s.inventory[0]=['holysword'];s.equipped[0]=0;Math.random=()=>.99`);
 assert.equal(g.run('physicalAttack(0,s.enemy.units[0]).count'),2);
 g.run("s.inventory[0]=['zerosword'];s.enemy.weaponEffects=snapshotWeaponEffects()");
 // Explicit snapshot isolates the attack-count contract from random floor contents.
 g.run("s.enemy.weaponEffects.number=0");
 assert.equal(g.run('physicalAttack(0,s.enemy.units[0]).count'),2);
 g.run('s.members[0].level=120');assert.equal(g.run('physicalAttack(0,s.enemy.units[0]).count'),10);
}
// Lord command click -> stable row selection -> party action; bishop never displays it.
g=setup();g.run(`elite(5);battle();s.enemy.units=[{...makeEnemy('skeleton',901),row:73},{...makeEnemy('goblin',902),row:98},{...makeEnemy('skeleton',903),row:50}];render()`);
assert.match(g.run("$('#commandentry').innerHTML"),/data-command-choice="dispel"/);
g.run(`$('#commandentry').onclick({target:{closest:q=>q==='[data-command-choice]'?{dataset:{commandChoice:'dispel'}}:null}})`);
assert.equal(g.run('choosingRow'),'dispel');
g.run(`$('#commandentry').onclick({target:{closest:q=>q==='[data-row-choice]'?{dataset:{rowChoice:'73'}}:null}});Math.random=()=>0;var mpBefore=s.mp[0];partyAction(0)`);
assert.equal(g.run('s.enemy.units[0].hp'),0);assert.equal(g.run('s.mp[0]'),g.run('mpBefore'));assert.equal(g.run('!!s.enemy.units[0].escaped'),true);g.drain();
g=setup();g.run('elite(7);battle()');assert.doesNotMatch(g.run("$('#commandentry').innerHTML"),/data-command-choice="dispel"/);
console.log('PASS elite jobs: attack counts/hit growth, weapon minimum/extra/cap and real lord dispel command');

// Ninja floor disarm through the status handler, current-job eligibility and chest boundary rolls.
g=setup();g.run(`elite(6);field();s.cells[28].trap=true;s.cells[28].flag='power';$('#statsdialog').showModal();renderStats()`);
assert.match(g.run("$('#statsbody').innerHTML"),/data-stat-disarm="0"/);
g.run(`$('#statsbody').onclick({target:{closest:q=>q==='[data-stat-disarm]'?{dataset:{statDisarm:'0'}}:null}})`);g.drain();
assert.deepEqual(read(g,'[s.cells[28].trap,s.cells[28].open,s.cells[28].disarmed,s.cells[28].flag,s.members[0].disarmUsed]'),[false,true,true,false,true]);
assert.equal(g.run("$('#statsdialog').open"),false);
assert.equal(g.run('canThiefDisarm(0)'),false);
for(const [job,cutoff] of [[3,.85],[6,.75]])for(const roll of [cutoff-.001,cutoff,.8]){
 g=setup();g.run(job===3?'recruit(3)':'elite(6)');
 g.run(`field();s.cells[s.pos].chest={opened:false,trap:'needle',gold:10};s.members[0].maxHP=999;s.hp[0]=999;render();Math.random=()=>${roll}`);
 assert.equal(g.run("$('#chestthief').textContent"),`${job===3?'盗賊':'忍者'}が調べて開ける`);
 g.run("$('#chestthief').onclick()");g.drain();
 assert.equal(g.run('s.gold'),roll<cutoff?30:0);
 assert.equal(g.run("s.logs.some(x=>x.includes('解除に失敗'))"),roll>=cutoff);
}
g=setup();g.run('elite(6);recruit(3);reorderParty([1,0]);field();render()');assert.equal(g.run('thiefMember()'),0);assert.equal(g.run("$('#chestthief').textContent"),'盗賊が調べて開ける');
g.run('s.ailments[0].paralysis=1;render()');assert.equal(g.run('thiefMember()'),1);assert.equal(g.run("$('#chestthief').textContent"),'忍者が調べて開ける');
g=setup();g.run('var id=recruit(3);prepare(id);change(id,0);field();renderStats()');assert.equal(g.run('thiefMember()'),-1);assert.equal(g.run('canThiefDisarm(0)'),false);assert.equal(g.run("$('#chestthief').hidden"),true);assert.doesNotMatch(g.run("$('#statsbody').innerHTML"),/data-stat-disarm=/);
console.log('PASS elite jobs: ninja floor/status action, first eligible chest opener, exact 75%/85% boundaries and loss of former thief abilities');

// Repair each history entry, persist evidence even if every entry later breaks.
g=setup();g.run('var id=elite(7);var reserve=elite(5,false)');
const good=[{from:1,to:7,fromLevel:10},{from:7,to:1,fromLevel:30}];
g.run(`for(const r of trainingRoster()){r.members.careerHistory=[null,${JSON.stringify(good[0])},{from:4,to:4,fromLevel:10},${JSON.stringify(good[1])},{from:0,to:8,fromLevel:10},{from:0,to:1,fromLevel:9},{from:0,to:1,fromLevel:31},{from:0,to:1,fromLevel:10.5}];delete r.members.classChanged}ensureProfile()`);
for(const record of read(g,'trainingRoster()')){assert.deepEqual(record.members.careerHistory,good);assert.equal(record.members.classChanged,true);}
for(const bad of [null,{},'broken',[null,{from:99,to:0,fromLevel:10}]]){
 g.run(`for(const r of trainingRoster()){r.members.careerHistory=${JSON.stringify(bad)};r.members.job=1;r.members.level=10;r.members.known=[]}ensureProfile();save()`);
 g=setup(g.run("localStorage.getItem('ash-v1')"));
 for(const record of read(g,'trainingRoster()')){assert.deepEqual(record.members.careerHistory,[]);assert.equal(record.members.classChanged,true);assert.deepEqual(record.members.known,[]);}
}
g.run('delete s.members[0].known;ensureMagic()');assert.deepEqual(read(g,'s.members[0].known'),[]);
// Both independent pieces of evidence block supplementing even before profile repair.
g.run("s.members[0].classChanged=false;s.members[0].careerHistory=[{from:0,to:1,fromLevel:10}];ensureMagic();ensureMakanito(s.members[0],1)");assert.deepEqual(read(g,'s.members[0].known'),[]);
console.log('PASS elite jobs: partial history repair, valid-history backfill, monotonic classChanged and no renewed spell supplementation');

// Elite jobs cannot receive legacy spells even when all career evidence is missing.
for(const job of [4,5,6,7])for(const flag of ['missing','false']){
 g=setup();
 g.run(`recruit(0);s.members[0].job=${job};s.members[0].level=10;s.members[0].careerHistory=[];delete s.members[0].known;${flag==='missing'?'delete s.members[0].classChanged':'s.members[0].classChanged=false'}`);
 const check=()=>{
  assert.equal(g.run('s.members[0].job'),job);
  assert.deepEqual(read(g,'s.members[0].careerHistory'),[]);
  assert.equal(g.run('s.members[0].classChanged'),flag==='missing'?undefined:false);
  assert.deepEqual(read(g,'s.members[0].known'),[],`job ${job}, classChanged ${flag}: no legacy spells`);
 };
 for(let n=0;n<3;n++){
  g.run('ensureProfile();ensureProfile()');check();
  g.run('save()');g=setup(g.run("localStorage.getItem('ash-v1')"));check();
 }
}
console.log('PASS elite jobs: missing known stays empty without career history or classChanged evidence across profile repair and repeated save/load');

// All four elite jobs survive reserve/join, six-slot reorder, repeated saves, wipe and recovery.
g=setup();g.run('var ids=[4,5,6,7].map(job=>elite(job));var helper=recruit(0);var reserveId=elite(7,false);changeRecruitParty(reserveId,true);reorderParty([5,3,2,1,0,4]);changeRecruitParty(ids[2],false);changeRecruitParty(ids[2],true);save()');
let records=read(g,'trainingRoster()');
for(let n=0;n<3;n++){
 const save=JSON.parse(g.run("localStorage.getItem('ash-v1')"));assert.equal(save.rosterVersion,1);
 g=setup(JSON.stringify(save));assert.deepEqual(read(g,'trainingRoster()'),records);g.run('save()');
}
const identity=r=>[r.members.id,r.members.job,r.members.careerHistory,r.members.classChanged,r.members.known,r.members.xpTargets,r.inventory,r.equipped,r.armor];
const persistent=new Map(records.map(r=>[r.members.id,identity(r)]));
g.run('var rescuer=recruit(0,false);enterDungeon()');g.drain();g.run('hurt(99999)');g.drain();
const corpses=read(g,'s.corpses[0].records');assert.equal(corpses.length,6);
for(const r of corpses)assert.deepEqual(identity(r),persistent.get(r.members.id));
g=setup(g.run("localStorage.getItem('ash-v1')"));assert.deepEqual(read(g,'s.corpses[0].records'),corpses);
g.run('changeRecruitParty(s.reserve[0].members.id,true);enterDungeon()');g.drain();g.run('recoverCorpses(s.corpses[0].cell)');g.drain();
assert.equal(g.run('s.corpses.length'),0);
for(const r of read(g,'s.reserve'))assert.deepEqual(identity(r),persistent.get(r.members.id));
g.run('save()');records=read(g,'trainingRoster()');g=setup(g.run("localStorage.getItem('ash-v1')"));assert.deepEqual(read(g,'trainingRoster()'),records);
// Legacy parallel-array saves, without history, keep four basic jobs and known data.
g=setup();g.run('for(const job of [0,1,2,3])recruit(job);for(const m of s.members){delete m.careerHistory;delete m.classChanged}ensureProfile()');
records=read(g,'partyRecords()');g=setup(g.run('JSON.stringify(s)'));assert.deepEqual(read(g,'partyRecords()'),records);assert.deepEqual(read(g,'s.members.map(m=>m.job)'),[0,1,2,3]);
console.log('PASS elite jobs: six-member/reserve/reorder/repeated load/wipe/corpse/recovery identity and legacy save compatibility');

// Mage Lv10 -> bishop -> save/load -> inherited field spell -> priest learning -> both battle schools.
g=setup();g.run("var id=recruit(1);prepare(id);s.members[0].maxMP=100;s.members[0].known=['halito','dumapic'];change(id,7);save()");
g=setup(g.run("localStorage.getItem('ash-v1')"));assert.deepEqual(read(g,'s.members[0].known'),['halito','dumapic']);
g.run("field();openMagic(0);spellSelected='dumapic';renderMagic();$('#magiccast').onclick()");g.drain();assert.equal(g.run('s.dumapicUses'),1);
g.run('Math.random=()=>0;s.members[0].xp=s.members[0].xpTargets[2];levelUp();s.hp[0]=1;commitMagicChoice(0,magic("dios"),0)');g.drain();assert(g.run('s.hp[0]')>1);
g.run('battle();Math.random=()=>.5;openMagic(0);chooseBattleSpell(0,magic("halito"));partyAction(0)');g.drain();assert(g.run('s.enemy.units[0].hp')<999);
g.run('s.hp[0]=1;openMagic(0);selectSpellSchool(2);chooseBattleSpell(0,magic("dios"));commitMagicChoice(0,magic("dios"),0);partyAction(0)');g.drain();assert(g.run('s.hp[0]')>1);
assert.equal(g.run('s.members[0].job'),7);assert.equal(g.run('s.members[0].classChanged'),true);
console.log('PASS elite jobs: real mage-to-bishop confirmation/reload/exploration/learning and both-school combat casts');
