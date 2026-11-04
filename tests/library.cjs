const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const reload = g => game(g.run("save();localStorage.getItem('ash-v1')"));
function party(){
 const g=game(null,()=>.5);
 g.run("const r=generateRecruit('冒険者',0);registerRecruit(r);changeRecruitParty(r.members.id,true);");
 return g;
}
let g=game();
assert.equal(g.run('ENEMIES.length'),95);
assert.equal(g.run('WEAPONS.length'),52);
assert.equal(g.run('JSON.stringify(s.library)'),'{"monsters":{},"items":{},"monsterIdentifyVersion":1,"spells":{}}');
g.run("$('#libraryopen').onclick()");
assert.equal(g.run("$('#librarydialog').open"),true);
assert.equal(g.run("$('#libraryprogress').textContent"),'モンスター 0/95 · アイテム 0/52');
g.run("$('#libraryclose').onclick()");
assert.equal(g.run("$('#librarydialog').open"),false);
g=party();
assert.equal(g.run('Object.keys(s.library.items).length'),0,'starter equipment is not acquired loot');
for(const format of ['rosterSaveState()','s']){
 const old=g.run(`JSON.stringify((()=>{const old=structuredClone(${format});delete old.library;return old})())`);
 const migrated=game(old);
 assert.equal(migrated.run('Object.keys(s.library.items).length'),0);
 assert.equal(migrated.run('Object.keys(s.library.monsters).length'),0);
 assert.equal(migrated.run('s.inventory[0][0]'),'sword');
}
console.log('PASS library: empty new/legacy saves, totals, starter exclusion and town open/close');

// One real turn per unit: registration happens only when the final enemy falls.
g.run(`enterDungeon()`);g.drain();
g.run(`s.enemy={units:[0,1,2].map(uid=>({id:'slime',uid,row:uid,hp:1,rewarded:false})),initiative:'party'};
 Math.random=()=>.999;s.commands=['fight'];s.attackRows=[0];attack();`);g.drain();
assert.equal(g.run('Object.keys(s.library.monsters).length'),0);
g.run('s.attackRows=[1];attack()');g.drain();
g.run('s.attackRows=[2];attack()');g.drain();
assert.equal(g.run('s.enemy'),null);
assert.equal(g.run('s.library.monsters.slime.count'),3);
assert.equal(g.run('s.library.monsters.slime.firstFloor'),1);
g=reload(g);
assert.equal(g.run('s.library.monsters.slime.count'),3);
g.run(`fresh(2);s.enemy={units:[{id:'slime',hp:0,rewarded:true},{id:'skeleton',hp:0,rewarded:true,escaped:true}]};finishMonsterBattle()`);g.drain();
assert.equal(g.run('s.library.monsters.slime.count'),4);
assert.equal(g.run('s.library.monsters.slime.firstFloor'),1);
assert.equal(g.run('s.library.monsters.skeleton'),undefined,'escaped/dispelled enemies do not count');
g.run(`s.enemy={units:[{id:'goblin',hp:0,rewarded:true},{id:'wolf',hp:10}],escapeTo:s.start};Math.random=()=>0;flee()`);g.drain();
assert.equal(g.run('s.library.monsters.goblin'),undefined,'partial kills before fleeing are not a victory');
g.run(`s.enemy={units:[{id:'goblin',hp:0,rewarded:true},{id:'wolf',hp:10}]};hurt(999)`);
const duringWipe=reload(g);g.drain();
for(const saved of [g,duringWipe]){
 saved.drain();assert.equal(saved.run('s.library.monsters.slime.count'),4);
 assert.equal(saved.run('s.library.monsters.goblin'),undefined);
}
console.log('PASS library: multi-row victory counts, first floor, reload, flee/dispel exclusion and wipe during/after logs');

g=party();
g.run("s.gold=1000;buy('helm',0);buy('helm',0)");
assert.equal(g.run('Object.keys(s.library.items).length'),1);
g.run("buy('staff',0);buy('holysword',0);s.gold=0;buy('longsword',0)");
assert.equal(g.run('Object.keys(s.library.items).length'),1,'rejected purchases do not unlock entries');
g.run("s.inventory[0]=Array(10).fill('sword');s.gold=1000;buy('longsword',0);Math.random=()=>0;dropWeapon();dropMedicine();rewardChest({gold:0})");g.drain();
assert.equal(g.run('Object.keys(s.library.items).length'),1,'full inventory does not record unreceived loot');
g.run("s.inventory[0]=['sword'];enterDungeon()");g.drain();
// Force the loot selection, while retaining the actual acquisition paths.
g.run("var actualLoot=weightedLoot;weightedLoot=()=>weapon('longsword');Math.random=()=>0;s.inventory[0]=['sword'];dropWeapon();weightedLoot=()=>weapon('plate');rewardChest({gold:0});weightedLoot=actualLoot");g.drain();
for(const id of ['helm','longsword','plate','healingPotion'])assert.equal(g.run(`s.library.items.${id}`),true,id);
g.run("var acquired=JSON.stringify(s.library);enterTown();sell(0,1)");
assert.equal(g.run('JSON.stringify(s.library)'),g.run('acquired'),'selling keeps the record');
g=reload(g);
g.run("var acquired=JSON.stringify(s.library);trainingRoster().map(r=>r.members.id).forEach(deleteRecruit)");
assert.equal(g.run('s.members.length'),0);
assert.equal(g.run('JSON.stringify(s.library)'),g.run('acquired'));
g=reload(g);
assert.equal(g.run('s.library.items.plate'),true);
g.run("const second=generateRecruit('冒険者',0);registerRecruit(second);changeRecruitParty(second.members.id,true);enterDungeon()");g.drain();
g.run('hurt(999)');g.drain();g=reload(g);
assert.equal(g.run('s.library.items.healingPotion'),true);
g.run("$('#resetconfirm').onclick()");
assert.equal(g.run('Object.keys(s.library.items).length'),0,'explicit full reset clears the library');
console.log('PASS library: purchases, drops/chests/medicine, capacity, sale, deletion, wipe, reload and explicit reset');

g=party();
g.run('enterDungeon()');g.drain();g.run("$('#libraryopen').onclick()");
assert.notEqual(g.run("$('#librarydialog').open"),true,'library is town-only');
g.run('enterTown();log("待機中");');g.run("$('#libraryopen').onclick()");
assert.notEqual(g.run("$('#librarydialog').open"),true,'library cannot expose future log results');
g.drain();
assert.deepEqual(JSON.parse(g.run("JSON.stringify(libraryMonsterDetails(enemyDefinition('slime'),{count:2,firstFloor:1}).map(([k,v])=>[k,typeof v==='string'?v:[...v.children].map(x=>x.textContent).join(' ')]))")),[['種族','不定形'],['出現階','1F'],['HP','1d6+3'],['物理ダメージ','1d4'],['攻撃回数','1回'],['特殊能力','なし'],['使用呪文','なし'],['経験値','6'],['撃破数','2体']]);
assert.equal(g.run("libraryMonsterDetails(ENEMIES.find(d=>d.name==='邪眼'),{count:1,firstFloor:8})[5][1].children.map(x=>x.className).join(' ')").includes('ailment-paralysis'),true);
assert.match(g.run("JSON.stringify(libraryItemDetails(weapon('holysword')))"),/4d8\+5.*hitBonus \+3.*2回.*6000.*迷宮限定/);
assert.match(g.run("JSON.stringify(libraryItemDetails(weapon('plate')))"),/AC −5/);
assert.match(g.run("JSON.stringify(libraryItemDetails(weapon('healingPotion')))"),/1d8.*購入価格なし.*迷宮限定/);
console.log('PASS library: town/idle guards and source-backed monster/item details');

// Render all source records to check ordering, concealed details and safe text.
g.run("renderLibrary();var entries=$('#librarybody').children.filter(e=>e.className==='library-entry')");
assert.equal(g.run('entries.length'),95);
assert.equal(g.run("entries.every(e=>e.children.length===1 && e.children[0].textContent==='？？？')"),true);
g.run(`s.library.monsters=Object.fromEntries(ENEMIES.map(d=>[d.id,{identified:true,count:1,firstFloor:d.floor}]));
 s.library.items=Object.fromEntries([...WEAPONS,...MEDICINES].map(w=>[w.id,true]));
 renderLibrary();var entries=$('#librarybody').children.filter(e=>e.className==='library-entry');`);
assert.equal(g.run("$('#libraryprogress').textContent"),'モンスター 95/95 · アイテム 52/52');
assert.equal(g.run("entries.every((e,i)=>e.children[0].textContent.startsWith([...ENEMIES].sort((a,b)=>a.floor-b.floor)[i].name))"),true);
assert.equal(g.run("entries.filter(e=>e.children[0].textContent.includes('◆ 守護者')).length"),9);
assert.equal(g.run("entries.filter(e=>e.children[0].textContent.includes('★ 迷宮の主')).length"),1);
assert.equal(g.run("$('#librarybody').children[0].textContent"),'1F');
assert.equal(g.run("entries.find(e=>e.children[0].textContent.startsWith('スライム')).children[2].children.length"),18);
assert.equal(g.run("entries.find(e=>e.children[0].textContent.startsWith('スライム')).children[2].children.some(e=>e.textContent==='初撃破階')"),false);
assert.equal(g.run('ENEMIES.length'),95);
assert.deepEqual(JSON.parse(g.run("JSON.stringify(ENEMIES.filter(d=>/\\d+%/.test(JSON.stringify(libraryMonsterDetails(d,{count:1,firstFloor:1}).map(([k,v])=>typeof v==='string'?v:v.textContent)))).map(d=>d.id))")),[],'no monster details contain numeric percentages');
const oldRecordSave=reload(g);
oldRecordSave.run("renderLibrary();var oldEntry=$('#librarybody').children.find(e=>e.className==='library-entry'&&e.children[0].textContent.startsWith('スライム'))");
assert.equal(oldRecordSave.run("oldEntry.children[2].children.some(e=>e.textContent==='初撃破階')"),false);
g.run("renderLibrary('items');var entries=$('#librarybody').children.filter(e=>e.className==='library-entry')");
assert.equal(g.run('entries.length'),57);
assert.equal(g.run('entries.every(e=>e.children.length===2)'),true);
g.run(`ENEMIES[0].name='<img src=x onerror=alert(1)>';WEAPONS[0].name='<script>bad()</script>';
 renderLibrary();var first=$('#librarybody').children[1].children[0];`);
assert.equal(g.run('first.textContent'),'<img src=x onerror=alert(1)>');
assert.equal(g.run('first.innerHTML'),undefined);
g.run("renderLibrary('items');var first=$('#librarybody').children[1].children[0]");
assert.equal(g.run('first.textContent'),'<script>bad()</script>');
assert.equal(g.run('first.innerHTML'),undefined);
console.log('PASS library: complete catalog rendering, floor order, guardian/lord marks, hidden details and textContent names');

g=party();g.run('enterDungeon()');g.drain();
g.run(`var summoner=ENEMIES.find(d=>d.summon>0);
 s.enemy={units:[{...makeEnemy(summoner.id,0),row:7}]};
 Math.random=()=>summoner.flee+.00001;monsterAction(s.enemy.units[0],['guard']);
 s.enemy.units.forEach(e=>{e.hp=0;killReward(e)});var completed=s.enemy;finishMonsterBattle();`);
assert.equal(g.run('completed.units.length'),2);
assert.equal(g.run('s.library.monsters[summoner.id].count'),2);
g.run('recordLibraryVictory(completed)');
assert.equal(g.run('s.library.monsters[summoner.id].count'),2,'same battle cannot be recorded twice');
const victoryReload=reload(g);
assert.equal(victoryReload.run('Object.values(s.library.monsters)[0].count'),2,'reload during victory logs keeps final records');
console.log('PASS library: summoned units counted individually, idempotence and reload during victory logs');

// 040: spell tab hides spells no registered adventurer has learned, like other tabs.
{
 const g=game(null,()=>.5);
 g.run("for(const job of [1,2]){const r=generateRecruit('術者'+job,job);registerRecruit(r);changeRecruitParty(r.members.id,true);}");
 g.run("renderLibrary('spells');var entries=$('#librarybody').children.filter(e=>e.className==='library-entry');var learned=new Set(trainingRoster().flatMap(r=>r.members.known));");
 assert.equal(g.run('entries.length'),g.run('MAGIC.length'));
 assert.ok(g.run('learned.size')>0&&g.run('learned.size')<g.run('MAGIC.length'));
 assert.equal(g.run("entries.every((e,i)=>learned.has(MAGIC[i].id)?(e.children[0].textContent===MAGIC[i].name&&e.children.length===2):(e.children[0].textContent==='？？？'&&e.children.length===1))"),true);
 g.run("s.members[0].known.push(MAGIC.find(x=>x.job===1&&!learned.has(x.id)).id);renderLibrary('spells');var entries=$('#librarybody').children.filter(e=>e.className==='library-entry');");
 assert.equal(g.run("entries.filter(e=>e.children[0].textContent!=='？？？').length"),g.run('learned.size')+1);
 console.log('PASS library: spell tab shows unlearned spells as ？？？');
}

// 040b: the spell record is permanent and stored in the save like other discoveries.
{
 const g=game(null,()=>.5);
 g.run("var mage=generateRecruit('術者',1);registerRecruit(mage);changeRecruitParty(mage.members.id,true);var only=mage.members.known.slice();");
 assert.ok(g.run('only.length')>0);
 assert.equal(g.run('only.every(id=>s.library.spells[id]===true)'),true,'creation records spells');
 g.run("var extra=MAGIC.find(x=>x.job===1&&x.level===3);Math.random=()=>0;learnMagic(0,3);");
 assert.equal(g.run('s.members[0].known.includes(extra.id)&&s.library.spells[extra.id]'),true,'level-up learning records spells');
 let r=reload(g);
 assert.equal(r.run('JSON.parse(localStorage.getItem("ash-v1")).library.spells.dilto'),true,'saved in ash-v1 library');
 const ids=r.run("JSON.stringify(s.members[0].known)");
 r.run("trainingRoster().map(x=>x.members.id).forEach(deleteRecruit);");
 assert.equal(r.run('trainingRoster().length'),0);
 r=reload(r);
 r.run(`var ids=${ids};renderLibrary('spells');`);r.run("var entries=$('#librarybody').children.filter(e=>e.className==='library-entry');");
 assert.equal(r.run("entries.every((e,i)=>ids.includes(MAGIC[i].id)?(e.children[0].textContent===MAGIC[i].name&&e.children.length===2):(e.children[0].textContent==='？？？'&&e.children.length===1))"),true,'learned spells stay after deleting the only learner');
 // Legacy save without spells: seed from party + reserve.
 const h=game(null,()=>.5);
 h.run("var a=generateRecruit('僧侶',2);registerRecruit(a);changeRecruitParty(a.members.id,true);var b=generateRecruit('術者',1);registerRecruit(b);b=trainingRoster()[1];b.members.known.push(MAGIC.find(x=>x.job===1&&x.level===5).id);");
 assert.equal(h.run('trainingRoster().length'),2);assert.equal(h.run('s.members.length'),1);
 const old=h.run("JSON.stringify((()=>{const o=structuredClone(rosterSaveState());delete o.library.spells;return o})())");
 const m=game(old);
 const want=h.run("JSON.stringify([...new Set(trainingRoster().flatMap(r=>r.members.known))].sort())");
 assert.equal(m.run("JSON.stringify(Object.keys(s.library.spells).sort())"),want,'old save migrates from party + reserve');
 console.log('PASS library: permanent spell record (creation, level up, deletion, reload, legacy migration)');
}
