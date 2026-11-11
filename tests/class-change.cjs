const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {game}=require('../scripts/sim/harness.cjs');
function setup(saved=null){
 const g=game(saved,()=>.5);
 g.run(`const originalCreate=document.createElement;document.createElement=(tag)=>Object.assign(originalCreate(tag),{dataset:{}});`);
 g.run(fs.readFileSync(path.join(__dirname,'../dist/training.js'),'utf8'));
 g.run(`function recruit(job,join=true){const r=generateRecruit('冒険者'+trainingRoster().length,job);registerRecruit(r);if(join)changeRecruitParty(r.members.id,true);return r.members.id}
 function at(id){return trainingRoster().find(r=>r.members.id===id)}
 function prepare(id){const r=at(id);r.members.level=10;r.inventory.push('sword','staff','mace','dagger');return r}
 function change(id,job){$('#trainingopen').onclick();openClassChange(id);classChangeJob=job;$('#classchangeconfirm').onclick();return at(id)}
 function battle(){s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;s.enemy={units:[{...makeEnemy('goblin',901),row:73,hp:999}],initiative:'party'};displayCombat=undefined;resetCommandEntry();render()}
 `);
 return g;
}
const json=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
let g=setup();
// Boundaries, pure preview and commit-time guards (no partial writes).
g.run(`var id=recruit(1);var r=prepare(id);$('#trainingopen').onclick();`);
assert.equal(g.run("generateRecruit('不可',4)"),null);
g.run("$('#training').close()");assert.equal(g.run('changeClass(id,0).ok'),false);
g.run("$('#training').showModal();s.area='dungeon'");assert.equal(g.run('changeClass(id,0).ok'),false);
g.run("s.area='town'");
for(const status of ['dead','ash','lost','stone']){
 g.run(`r.members.status='${status}'`);assert.equal(g.run('canChangeClass(r,0).ok'),false);
}
g.run("r.members.status='ok';r.members.level=9");assert.equal(g.run('canChangeClass(r,0).ok'),false);
g.run('r.members.level=10');assert.equal(g.run('canChangeClass(r,1).ok'),false);
const before=g.run('JSON.stringify(s)');
g.run(`var randomCalls=0;Math.random=()=>{randomCalls++;return .5};openClassChange(id);classChangeJob=0;renderClassChange();canChangeClass(r,0);classChangePreview(r,0);$('#classchangecancel').onclick()`);
assert.equal(g.run('JSON.stringify(s)'),before);assert.equal(g.run('randomCalls'),0);
assert.equal(g.run("$('#classchangeconfirm').disabled"),false);
g.run('openClassChange(id)');assert.equal(g.run('classChangeJob'),null);assert.equal(g.run("$('#classchangeconfirm').disabled"),true);
for(const mutation of ["r.members.level=9","r.members.status='stone'","r.inventory=['staff']"]){
 g.run(`r=at(id);r.members.level=10;r.members.status='ok';r.inventory=['staff','sword'];s.inventory[0]=r.inventory;openClassChange(id);classChangeJob=0;renderClassChange();${mutation};s.inventory[0]=r.inventory`);
 const snapshot=g.run('JSON.stringify(s)');g.run("$('#classchangeconfirm').onclick()");assert.equal(g.run('JSON.stringify(s)'),snapshot);
}
g.run("r=at(id);r.members.status='ok';r.members.level=10;s.inventory[0]=['staff','sword'];openClassChange(id);classChangeJob=0;removeFromParty([id]);deleteRecruit(id)");
const deleted=g.run('JSON.stringify(s)');g.run("$('#classchangeconfirm').onclick()");assert.equal(g.run('JSON.stringify(s)'),deleted);
console.log('PASS class change: pure eligibility/preview, cancellation, invalid job, stale level/status/weapons/deleted ID');

// Real confirmation -> roster save -> reload -> both combat and exploration casts.
g=setup();g.run(`var id=recruit(1);prepare(id);s.gold=1234;s.members[0].known=['halito','dumapic','identifyfoe'];s.members[0].maxMP=80;s.hp[0]=1;s.mp[0]=0;s.members[0].str=16;s.members[0].agi=17;recordLibrarySpells();var original=structuredClone(at(id));var libraryBefore=JSON.stringify(s.library);change(id,0)`);
const old=json(g,'original'),changed=json(g,'at(id)');
assert.equal(changed.members.id,old.members.id);assert.equal(changed.members.name,old.members.name);
assert.deepEqual(changed.inventory,old.inventory);assert.deepEqual(changed.members.known,old.members.known);
assert.equal(changed.members.level,1);assert.equal(changed.members.xp,0);assert.equal(changed.members.maxHP,old.members.maxHP);
assert.equal(changed.hp,old.members.maxHP);assert.equal(changed.mp,80);assert.equal(changed.members.baseStr,16);assert.equal(changed.members.baseAgi,17);
assert.equal(changed.members.attack,g.run('CLASSES[0].attack'));assert.equal(changed.members.ac,g.run('CLASSES[0].ac'));
assert.equal(g.run('s.gold'),1234);assert.equal(g.run('JSON.stringify(s.library)'),g.run('libraryBefore'));
let targets=[0,0];for(let l=2;l<=30;l++)targets[l]=targets[l-1]+Math.round(115*(l-1)*.8);
assert.deepEqual(changed.members.xpTargets,targets);assert.equal(changed.members.xpCurveVersion,2);
assert.deepEqual(changed.members.careerHistory,[{from:1,fromLevel:10,to:0}]);
for(let n=0;n<3;n++){
 g.run('ensureProfile();render();save()');g=setup(g.run("localStorage.getItem('ash-v1')"));
 assert.deepEqual(json(g,'partyRecords()[0]'),changed);
}
g.run('renderStats();battle()');assert.doesNotMatch(g.run("$('#statsbody').innerHTML"),/前職/);assert.equal(g.run('s.members[0].careerHistory.length'),1);
assert.match(g.run("$('#commandentry').innerHTML"),/data-command-choice="spell"/);
g.run(`openMagic(0);chooseBattleSpell(0,magic('halito'));partyAction(0)`);g.drain();
assert(g.run('s.enemy.units[0].hp')<999);assert.equal(g.run('s.mp[0]'),80-g.run("magic('halito').mp"));
g.run(`s.enemy=null;displayCombat=undefined;resetCommandEntry();s.pos=27;s.dir=1;s.cells[target()].open=false;openMagic(0);spellSelected='dumapic';renderMagic();$('#magiccast').onclick()`);g.drain();
assert.equal(g.run('s.dumapicUses'),1);assert(g.run('s.mp[0]')<80-g.run("magic('halito').mp"));
const known=json(g,'s.members[0].known');g.run('s.members[0].xp=s.members[0].xpTargets[11];Math.random=()=>0;levelUp()');
assert.deepEqual(json(g,'s.members[0].known'),known);assert.equal(g.run('s.members[0].str'),18);assert.equal(g.run('s.members[0].agi'),18);
assert.equal(g.run('s.members[0].maxMP'),80);
console.log('PASS class change: confirmation/save/repeated reload, XP/identity/library invariants, inherited real battle/field casts and growth');

// Weapon-only fallback, current weapon precedence, independent armor slots, equip compatibility.
g=setup();g.run(`var id=recruit(0);prepare(id);s.inventory[0]=['sword','robe','healingPotion','staff','helm','boots'];s.equipped[0]=0;s.armor[0]={head:4,body:1,feet:5};var inventoryBefore=JSON.stringify(s.inventory[0]);change(id,1)`);
assert.equal(g.run('s.equipped[0]'),3);assert.deepEqual(json(g,'s.armor[0]'),{body:1,feet:5});
assert.equal(g.run('JSON.stringify(s.inventory[0])'),g.run('inventoryBefore'));assert.equal(g.run('equippedWeapon(0).id'),'staff');assert.equal(g.run('effectiveAC(0)'),7);
assert.equal(g.run('s.members[0].maxMP'),20);assert.deepEqual(json(g,'s.members[0].known'),[]);
const emptyMage=json(g,'partyRecords()[0]');g=setup(g.run("localStorage.getItem('ash-v1')"));
assert.deepEqual(json(g,'partyRecords()[0]'),emptyMage,'new mage must not acquire migration spells on reload');
g.run('renderStats();battle()');assert.doesNotMatch(g.run("$('#statsbody').innerHTML"),/data-stat-cast/);assert.doesNotMatch(g.run("$('#commandentry').innerHTML"),/data-command-choice="spell"/);
g.run(`s.enemy=null;s.area='town';equip(0,0)`);assert.equal(g.run('s.equipped[0]'),3);
g.run(`s.inventory[0]=['sword','shortbow','longbow'];s.equipped[0]=2;s.armor[0]={};s.members[0].job=0;s.members[0].level=10;change(s.members[0].id,3)`);
assert.equal(g.run('s.equipped[0]'),2,'keep compatible later weapon, not first match');
// Ten-plus transitions, new-school learning only on level-up, STR/AGI caps.
g=setup();g.run(`var id=recruit(3);prepare(id);var previousStr=s.members[0].str,previousAgi=s.members[0].agi;`);
for(let n=0;n<12;n++){
 const job=n%4;g.run(`s.members[0].level=10;var knownBefore=JSON.stringify(s.members[0].known);change(id,${job})`);
 assert.equal(g.run('JSON.stringify(s.members[0].known)'),g.run('knownBefore'));
 assert.equal(g.run('s.members[0].careerHistory.length'),n+1);
 g.run('s.members[0].xp=s.members[0].xpTargets[10];Math.random=()=>0;levelUp()');
 assert(g.run('s.members[0].str>=previousStr&&s.members[0].str<=18&&s.members[0].agi>=previousAgi&&s.members[0].agi<=18'));
 g.run('previousStr=s.members[0].str;previousAgi=s.members[0].agi');
}
assert.equal(g.run('s.members[0].str'),18);assert.equal(g.run('s.members[0].agi'),18);
assert(g.run("s.members[0].known.includes('halito')&&s.members[0].known.includes('dios')"));
g.run('s.members[0].level=10;change(id,0);s.area="dungeon";s.pos=27;s.dir=1;s.cells[target()].open=false');
assert.equal(g.run('thiefMember()'),-1);assert.equal(g.run('canThiefDisarm(0)'),false);
console.log('PASS class change: equipment fallback/retention, no instant spells, current thief abilities, 12 careers and growth caps');

// Schools, inherited calfo and all remaining casting restrictions.
g=setup();g.run(`var id=recruit(2);prepare(id);s.members[0].known=['dios','calfo','halito','dumapic','mahaman','malor'];s.members[0].maxMP=100;change(id,0);s.area='dungeon';openMagic(0);`);
assert.equal(g.run("$('#magictabs').hidden"),false);assert.equal(g.run('spellSchool'),1);
g.run("spellSelected='malor';renderMagic();selectSpellSchool(2)");assert.equal(g.run('spellSelected'),null);assert.equal(g.run("$('#magictargets').innerHTML"),'');
assert.match(g.run("$('#magiclist').innerHTML"),/data-spell="dios"/);assert.doesNotMatch(g.run("$('#magiclist').innerHTML"),/data-spell="halito"/);
g.run("s.hp[0]=1;commitMagicChoice(0,magic('dios'),0)");g.drain();assert(g.run('s.hp[0]')>1);
g.run('battle();openMagic(0);selectSpellSchool(1);chooseBattleSpell(0,magic("halito"));partyAction(0)');g.drain();assert(g.run('s.enemy.units[0].hp')<999);
assert.equal(g.run("spellReason(0,magic('mahaman'))"),'Lv.1では使用不可');
g.run("s.ailments[0].silence=1");assert.equal(g.run("castMagic(0,'halito',901)"),false);g.drain();
g.run('s.ailments[0].silence=0;s.mp[0]=0');assert.equal(g.run("spellReason(0,magic('halito'))"),'MP不足');
g.run('s.mp[0]=100');assert.equal(g.run("spellReason(0,magic('dumapic'))"),'探索専用');
assert.equal(g.run("castMagic(0,'halito',9999)"),false);g.drain();
g.run('s.enemy=null;displayCombat=undefined');assert.equal(g.run("spellReason(0,magic('halito'))"),'戦闘専用');
g.run("s.cells[s.pos].chest={opened:false,trap:'needle'}");assert.equal(g.run('calfoCaster()'),0);
assert.equal(g.run("castMagic(calfoCaster(),'calfo',null)"),true);g.drain();assert(g.run('!!currentChest().reading'));
g.run('openMagic(0);selectSpellSchool(2);openMagic(0)');assert.equal(g.run('spellSchool'),1);
g.run('s.members[0].job=2;openMagic(0)');assert.equal(g.run('spellSchool'),2);
g.run("s.members[0].known=['halito'];openMagic(0)");assert.equal(g.run("$('#magictabs').hidden"),true);assert.equal(g.run('spellSchool'),1);
console.log('PASS class change: both school tabs/casts/reset, inherited calfo, level/silence/MP/context/target restrictions');

// Six party members, reserve conversion -> join, reorder, return, wipe, corpse save/recovery.
g=setup();g.run(`var ids=[0,1,2,3,0,1].map(job=>recruit(job));var reserveId=recruit(2,false);for(const id of [...ids,reserveId])prepare(id);change(reserveId,1);$('#trainingopen').onclick();openClassChange(ids[1]);classChangeJob=0;reorderParty([5,4,3,2,1,0]);$('#classchangeconfirm').onclick();var reserveConverted=structuredClone(at(reserveId));var converted=structuredClone(at(ids[1]));enterDungeon()`);g.drain();
g.run('enterTown()');g.drain();assert.deepEqual(json(g,'at(ids[1])'),json(g,'converted'));
g.run("$('#leveldialog').close();changeRecruitParty(ids[0],false);changeRecruitParty(reserveId,true);save()");
const reserveId=g.run('reserveId'),convertedId=g.run('ids[1]');const reserveConverted=json(g,'reserveConverted');
g=setup(g.run("localStorage.getItem('ash-v1')"));assert.deepEqual(json(g,`at('${reserveId}')`),reserveConverted);assert.equal(g.run('s.members.length'),6);
g.run('enterDungeon()');g.drain();g.run('hurt(99999)');g.drain();
assert(g.run('s.corpses[0].records.some(r=>r.members.careerHistory.length===1)'));
const corpseBefore=json(g,'s.corpses[0].records');g=setup(g.run("localStorage.getItem('ash-v1')"));assert.deepEqual(json(g,'s.corpses[0].records'),corpseBefore);
g.run('changeRecruitParty(s.reserve[0].members.id,true);enterDungeon()');g.drain();
g.run('recoverCorpses(s.corpses[0].cell)');g.drain();assert.equal(g.run('s.corpses.length'),0);
assert.deepEqual(json(g,`at('${convertedId}').members.careerHistory`),[{from:1,fromLevel:10,to:0}]);
assert.deepEqual(json(g,`at('${reserveId}').members.known`),reserveConverted.members.known);
console.log('PASS class change: six-member formation/reserve/join/reorder/town/wipe/corpse/reload/recovery');

// Existing four-class migration is unchanged; malformed histories safely normalize.
g=setup();g.run(`var ids=[0,1,2,3].map(job=>recruit(job));var reserves=[0,1,2,3].map(job=>recruit(job,false));for(const r of trainingRoster()){delete r.members.careerHistory;r.members.known=[];r.members.level=9}ensureProfile()`);
assert.deepEqual(json(g,'s.members.map(m=>m.known)'),[[],['identifyfoe','dumapic','makanito'],['watchful','floodfill'],[]]);
assert.deepEqual(json(g,'s.reserve.map(r=>r.members.known)'),[[],['makanito'],[],[]],'preserve existing reserve migration behavior');
g.run("s.members[1].level=1;s.members[1].known=[];ensureProfile()");assert.deepEqual(json(g,'s.members[1].known'),['identifyfoe','dumapic']);
for(const [level,priest] of [[2,[]],[3,['watchful']],[4,['watchful']],[5,['watchful','floodfill']]]){
 g.run(`s.members[2].level=${level};s.members[2].known=[];ensureProfile()`);
 assert.deepEqual(json(g,'s.members[2].known'),priest);
}
g.run('s.members[1].level=8;s.members[1].known=[];ensureProfile()');assert.deepEqual(json(g,'s.members[1].known'),['identifyfoe','dumapic']);
for(const bad of [null,{},'bad',[null],[{from:9,fromLevel:10,to:0}],[{from:0,fromLevel:1,to:1}]]){
 g.run(`s.members[0].careerHistory=${JSON.stringify(bad)};s.reserve[0].members.careerHistory=${JSON.stringify(bad)};ensureProfile()`);
 assert.deepEqual(json(g,'s.members[0].careerHistory'),[]);assert.deepEqual(json(g,'s.reserve[0].members.careerHistory'),[]);
}
g.run('save()');const legacy=json(g,'trainingRoster()');g=setup(g.run("localStorage.getItem('ash-v1')"));assert.deepEqual(json(g,'trainingRoster()'),legacy);
console.log('PASS class change: legacy four-job spell repairs, malformed history normalization and unchanged old-save reload');

// The future multi-school learning hook must use each spell's school stat,
// including retrying unlearned spells below the effective learning level.
g.run(`var originalLearning=magicLearning;magicLearning=()=>[{job:1,level:3},{job:2,level:3}];
 s.members[0].known=[];s.members[0].intelligence=0;s.members[0].piety=30;Math.random=()=>.5;learnMagic(0,3)`);
const expected=g.run('MAGIC.filter(x=>x.level<=3&&(x.guaranteed||x.job===2)).map(x=>x.id).join()');
assert.equal(g.run('s.members[0].known.join()'),expected);
g.run('s.members[0].intelligence=30;learnMagic(0,3)');
assert(g.run('MAGIC.filter(x=>x.level<=3).every(x=>s.members[0].known.includes(x.id))'));
g.run('magicLearning=originalLearning');
console.log('PASS class change: learning follows school IQ/PIE and retries earlier unlearned spells');
