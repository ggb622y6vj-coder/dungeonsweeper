// 121: exercise the real inventory, confirmation, combat and roster paths.
const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const read=(g,expr)=>JSON.parse(g.run('JSON.stringify('+expr+')'));
const saved=g=>g.run("localStorage.getItem('ash-v1')");
function party(){
 const g=game(null,()=>.5);
 g.run(`for(const [i,job] of [1,0,3].entries()){
  const r=generateRecruit('冒険者'+i,job);registerRecruit(r);changeRecruitParty(r.members.id,true);
 }
 s.members[0].job=7;s.mp[0]=0;s.gold=500;s.ailments[0].silence=3;render();
 `);
 return g;
}
function rolls(g,values){
 g.run(`var draws=${JSON.stringify(values)};Math.random=()=>{if(!draws.length)throw Error('unexpected random draw');return draws.shift()}`);
}
function bishop(g,slot=1){
 g.run(`openItemService('bishop',0);openItemChoice('bishop',itemTarget(0,${slot}));confirmItemChoice();confirmItemChoice()`);
 assert.equal(g.run('draws.length'),0);
}
for(const [level,p,q] of [[1,.15,.32],[11,.65,.02],[12,.7,0],[17,.95,0],[18,1,0],[30,1,0]]){
 for(const [a,b] of [[p-.00001,q],[p,q],[p-.00001,Math.max(0,q-.00001)],[p,Math.max(0,q-.00001)]]){
  const g=party();g.run(`s.inventory[0].push('unid:cursedStaff');s.members[0].level=${level}`);
  rolls(g,[a,b]);bishop(g);
  const success=a<p,contact=b<q;
  const token=(success?(contact?'bound:':''):(contact?'unid-bound:':'unid:'))+'cursedStaff';
  assert.deepEqual(read(g,'s.inventory[0]'),['staff',token]);
  assert.equal(g.run('s.equipped[0]'),contact?1:0);
  assert.equal(g.run('s.library.items.cursedStaff===true'),success);
  assert.equal(g.run('s.logs[0].includes("呪われた杖")'),success);
  assert.doesNotMatch(g.run('s.logs[0]'),/%|1d2|cursedStaff/);
  assert.equal(g.run('s.gold'),500);assert.equal(g.run('s.mp[0]'),0);
  const reloaded=game(saved(g),()=>{throw Error('re-rolled on load')});
  assert.deepEqual(read(reloaded,'s.inventory[0]'),['staff',token]);
  assert.equal(reloaded.run('s.logs[0]'),g.run('s.logs[0]'));
 }
}
{
 const g=party();
 g.run("s.inventory[0].push('unid:cursedStaff','unid:cursedStaff','unid:cursedArmor','unid:oakstaff');s.area='dungeon';s.floor=4;s.pos=s.cells.findIndex((_,i)=>inMapBlindZone(i%size(),Math.floor(i/size()),size()))");
 assert.equal(g.run('isAntimagicZone()'),true);
 rolls(g,[.99,0]);bishop(g);
 rolls(g,[.99,0]);bishop(g,2);
 rolls(g,[.99,0]);bishop(g,3);
 assert.equal(g.run('s.equipped[0]'),1);assert.deepEqual(read(g,'s.armor[0]'),{});
 assert.deepEqual(read(g,'s.inventory[0].slice(1,4)'),['unid-bound:cursedStaff','unid-bound:cursedStaff','unid-bound:cursedArmor']);
 rolls(g,[0]);bishop(g);assert.equal(g.run('s.inventory[0][1]'),'bound:cursedStaff');
 rolls(g,[0]);bishop(g,4);assert.equal(g.run('s.inventory[0][4]'),'oakstaff');
 rolls(g,[]);assert.equal(g.run("performItemService('bishop',itemTarget(0,1))"),false);
 assert.equal(g.run("canChangeClass(partyRecords()[0],1).reason"),g.run('CURSE_LOCK'));
}
{
 const g=party();g.run("s.members[1].job=7;s.inventory.forEach(ids=>ids.push('unid:cursedStaff'));openItemService('bishop',0)");
 assert.equal(g.run("$('#itemservicelist').children.length"),1);
 g.run("openItemChoice('bishop',itemTarget(1,1));confirmItemChoice()");
 assert.equal(g.run('s.inventory[1][1]'),'unid:cursedStaff');
 for(const mutation of ["s.enemy={units:[]}","s.cells[s.pos].chest={opened:false}","s.pendingBoss=true",
  "s.pendingStairs='up'","s.pendingElevator=true","s.done=true","logQueue.push({})",
  "s.ailments[0].paralysis=1","s.ailments[0].sleep=1","s.members[0].status='stone'","s.hp[0]=0",
  "s.members[0].job=1","changeRecruitParty(s.members[0].id,false)"]){
  const g=party();g.run("s.inventory[0].push('unid:cursedStaff');openItemService('bishop',0);openItemChoice('bishop',itemTarget(0,1))");
  g.run(mutation);rolls(g,[]);const before=g.run('JSON.stringify(s)');g.run('confirmItemChoice()');
  assert.equal(g.run('JSON.stringify(s)'),before,mutation);
 }
}
console.log('PASS 121 bishop levels, exact boundaries/RNG order, all four outcomes, repeat contact, ownership, incapacity, silence/zero MP, stale scene and immediate save');

{
 const g=party();g.run("s.inventory[1]=['sword','helm','unid:cursedHelm','cursedArmor','chain','cap','boots'];s.armor[1]={head:1,body:4,feet:6};inventoryMember=1");
 const ac=g.run('effectiveAC(1)');
 g.run("equip(1,2);$('#itemchoicecancel').onclick()");assert.equal(g.run('effectiveAC(1)'),ac);
 g.run('equip(1,2);confirmItemChoice();equip(1,3)');
 assert.deepEqual(read(g,'s.inventory[1].slice(1,4)'),['helm','unid-bound:cursedHelm','bound:cursedArmor']);
 assert.equal(g.run('effectiveAC(1)'),ac+5);
 assert.equal(g.run('snapshotVitals().ac[1]'),ac+5);
 for(const expr of ['equip(1,2)','equip(1,5)','equip(1,3)','equip(1,4)','sell(1,2)','depositItem(1,3)','transferItem(1,2,0)']){
  const before=g.run('JSON.stringify(s)');assert.equal(g.run(expr),false,expr);
  assert.equal(g.run('JSON.stringify(s)'),before);
 }
 g.run("s.area='dungeon'");assert.equal(g.run('discard(1,2)'),false);
 g.run("s.area='town';s.gold=220");
 assert.ok(g.run("performItemService('uncurse',itemTarget(1,2))"));
 assert.deepEqual(read(g,'s.armor[1]'),{body:2,feet:5});
 assert.equal(g.run('s.inventory[1][2]'),'bound:cursedArmor');
 assert.ok(g.run("performItemService('uncurse',itemTarget(1,2))"));
 assert.deepEqual(read(g,'s.armor[1]'),{feet:4});assert.equal(g.run('s.gold'),0);
 assert.deepEqual(read(g,'s.itemBox'),[]);assert.deepEqual(read(g,'s.library.items'),{});
}
{
 const g=party();g.run("s.area='dungeon';s.inventory[0]=['staff','unid-bound:cursedDagger','unid:dragonbow'];s.members[0].level=10");
 // Exclude the incompatible bound item even when no removable items remain.
 const thief=g.run("ENEMIES.find(d=>d.steal>0&&!d.statuses.length&&!d.death&&!d.drain).id");
 g.run(`Math.random=()=>0;monsterOnHit({id:'${thief}'},0);monsterOnHit({id:'${thief}'},0)`);
 assert.deepEqual(read(g,'s.inventory[0]'),['staff','unid-bound:cursedDagger']);
 assert.ok(g.run("logQueue.some(x=>x.text.includes('正体不明の武器を奪われた'))"));
 assert.equal(g.run('canChangeClass(partyRecords()[0],1).ok'),false);
 g.drain();g.run("s.area='town';s.gold=10");
 for(const expr of ['sell(0,1)','depositItem(0,1)','transferItem(0,1,1)',"openInventoryAction('sell',0,1)"]){
  assert.equal(g.run(expr),false,expr);
 }
 g.run("s.area='dungeon'");assert.equal(g.run("openInventoryAction('discard',0,1)"),false);
 g.run("s.area='town';performItemService('uncurse',itemTarget(0,1))");
 assert.deepEqual(read(g,'s.inventory[0]'),['staff']);assert.deepEqual(read(g,'s.library.items'),{});
}
{
 const g=party();g.run("s.members[0].str=10;s.inventory[0]=['staff','unid:cursedStaff'];equip(0,1);confirmItemChoice();Math.random=()=>.999");
 assert.equal(g.run("physicalAttack(0,{id:'slime',hp:10}).damage"),2);
 assert.equal(g.run("equippedWeapon(0).dice[1]"),2);
 g.run("s.inventory[1]=['sword','unid:chestsac'];s.armor[1]={body:1};s.hp[1]=1;s.area='dungeon';sacrificeAfterDamage(1)");
 assert.match(g.run('logQueue.at(-1).text'),/正体不明の胴防具/);
 assert.doesNotMatch(g.run('logQueue.at(-1).text'),/代わり身の胸当て|chestsac/);
}
console.log('PASS 121 voluntary binding, battle damage, AC snapshots, hidden sacrifice/theft logs, equipped and unequipped locks, armor index compaction');

{
 const g=party();g.run("s.inventory[0]=['staff','cursedStaff','unid:cursedStaff','bound:cursedStaff','unid-bound:cursedStaff','unid:cursedStaff'];s.gold=8");
 for(const action of ['identify','uncurse']){
  g.run(`openItemService('${action}');openItemChoice('${action}',itemTarget(0,4));$('#itemchoicecancel').onclick();confirmItemChoice()`);
  assert.equal(g.run('s.gold'),8);assert.equal(g.run('s.inventory[0][4]'),'unid-bound:cursedStaff');
 }
 rolls(g,[]);g.run("openItemService('identify');openItemChoice('identify',itemTarget(0,4));s.gold=7;confirmItemChoice()");
 assert.equal(g.run('s.gold'),7);assert.deepEqual(read(g,'s.library.items'),{});
 g.run("s.gold=8;openItemChoice('identify',itemTarget(0,4));confirmItemChoice();confirmItemChoice()");
 assert.equal(g.run('s.gold'),0);assert.deepEqual(read(g,'s.library.items'),{cursedStaff:true});
 assert.deepEqual(read(g,'s.inventory[0]'),['staff','cursedStaff','unid:cursedStaff','bound:cursedStaff','bound:cursedStaff','unid:cursedStaff']);
 assert.equal(g.run('s.equipped[0]'),0);
 for(const action of ['identify','uncurse'])for(const mutation of ["removeInventorySlot(0,1)","s.inventory[0][1]='cursedStaff'","reorderParty([1,0,2])"]){
  const h=party(),token=action==='identify'?'unid:cursedStaff':'unid-bound:cursedStaff';
  h.run(`s.inventory[0].push('${token}','${token}');openItemService('${action}');openItemChoice('${action}',itemTarget(0,1));${mutation}`);
  const before=h.run('JSON.stringify(s)');h.run('confirmItemChoice()');assert.equal(h.run('JSON.stringify(s)'),before,mutation);
 }
 for(const [job,id,starter] of [[1,'cursedStaff','staff'],[7,'cursedStaff','staff'],[3,'cursedDagger','dagger'],[6,'cursedDagger','dagger']]){
  for(const hasSpare of [true,false]){
   const h=party();h.run(`s.members[0].job=${job};s.inventory[0]=['unid:staff','bound:${id}','cap',${hasSpare?"'"+starter+"'":"'unid:oakstaff'"},...Array(6).fill('robe')];s.equipped[0]=1;s.armor[0]={head:2};s.gold=weapon('${id}').sell`);
   h.run("openItemService('uncurse');openItemChoice('uncurse',itemTarget(0,1));confirmItemChoice();confirmItemChoice()");
   assert.equal(h.run('s.gold'),0);assert.equal(h.run('s.inventory[0].length'),hasSpare?9:10);
   assert.equal(h.run('s.equipped[0]'),hasSpare?2:9);assert.equal(h.run('equippedWeapon(0).id'),starter);
   assert.equal(h.run('s.armor[0].head'),1);assert.equal(h.run(`weapon('${starter}').sell<serviceFee('${id}')`),true);
   assert.equal(h.run('s.inventory[0].some(boundItem)'),false);
  }
 }
}
{
 const g=party();g.run("s.inventory[0].push('unid:cursedDagger','unid:plate','unid:dragonbow');s.gold=0");
 assert.equal(g.run('transferItem(0,1,1)'),true);assert.match(g.run("$('#transfernotice').textContent"),/正体不明の武器/);
 assert.equal(g.run('sell(1,1)'),true);assert.equal(g.run('s.gold'),1);
 g.run("s.itemBox=Array(99).fill('robe');s.inventory[0].push(...Array(10).fill('healingPotion'));depositItem(0,1)");
 assert.equal(g.run('usedSlots(s.itemBox)'),100);assert.equal(g.run('depositItem(0,1)'),false);
 assert.equal(g.run('withdrawItem(0,99)'),true);assert.equal(g.run('s.inventory[0].at(-1)'),'unid:plate');
 assert.equal(g.run('usedSlots(s.inventory[0])'),4);
 g.run("s.area='dungeon';openInventoryAction('discard',0,1)");
 assert.match(g.run("$('#inventoryactionname').textContent"),/正体不明の武器/);
 g.run('confirmInventoryAction()');assert.equal(g.run("s.inventory[0].includes('unid:dragonbow')"),false);
 assert.deepEqual(read(g,'s.library.items'),{});
}
console.log('PASS 121 smith fees, exact funds, cancellation, stale/duplicate confirmations, four states, replacement and rescue economics, boxes, stacks, sale and discard');

{
 let g=party();
 const tokens=['cursedStaff','unid:cursedStaff','bound:cursedStaff','unid-bound:cursedStaff','unid-bound:cursedHelm','healingPotion'];
 g.run(`s.inventory[0]=${JSON.stringify(tokens)};s.equipped[0]=2;s.itemBox=['unid:cap'];s.library.items.helm=true;save()`);
 function check(expr){assert.deepEqual(read(g,expr),tokens)}
 check('restoreRoster(JSON.parse(JSON.stringify(saveExportEnvelope())).data).inventory[0]');
 assert.equal(g.run("validateSaveData(saveExportEnvelope().data)"),true);
 for(const token of ['missing','unid:missing','bound:helm','unid-bound:staff','unid:healingPotion','bound:antidote','unid:bound:cursedStaff','bound:unid:cursedStaff','other:staff','unid:']){
  for(const place of ['d.roster[0].inventory','d.itemBox','d.corpses[0].records[0].inventory']){
   assert.equal(g.run(`{const d=structuredClone(saveExportEnvelope().data);d.corpses=[{records:[structuredClone(d.roster[0])]}];${place}.push('${token}');validateSaveData(d)}`),false,place+': '+token);
  }
 }
 for(const token of ['unid:cursedStaff','bound:cursedStaff','missing']){
  for(const cells of ['d.cells','d.floors[1].cells']){
   assert.equal(g.run(`{const d=structuredClone(saveExportEnvelope().data);d.floors[1]={cells:structuredClone(d.cells)};
    ${cells}[0].chest={items:['${token}']};validateSaveData(d)}`),false);
  }
 }
 g=game(saved(g),()=>.5);check('s.inventory[0]');assert.equal(g.run('s.equipped[0]'),2);
 g.run("var owner=s.members[0].id;changeRecruitParty(owner,false)");check('s.reserve[0].inventory');
 g.run('changeRecruitParty(owner,true);enterDungeon()');g.drain();
 g.run('s.guardiansDefeated=[1];s.cells[s.boss].type="down";s.pos=s.boss;travelFloor(2)');g.drain();check('s.inventory[2]');
 g.run("s.hp[2]=0;markDeaths();enterTown()");g.drain();check('s.reserve[0].inventory');
 g.run("s.gold=9999;Math.random=()=>0;templeRaise(owner);changeRecruitParty(owner,true);s.members[2].xp=500;Math.random=()=>.5;enterDungeon()");g.drain();
 g.run("enterTown()");g.drain();check('s.inventory[2]');assert.ok(g.run('s.members[2].level>1'));
 g.run("enterDungeon()");g.drain();g.run('defeat()');g.drain();check('s.corpses[0].records[2].inventory');
 g=game(saved(g),()=>.5);check('s.corpses[0].records[2].inventory');
 g.run("var r=generateRecruit('救助',0);registerRecruit(r);changeRecruitParty(r.members.id,true);enterDungeon()");g.drain();
 g.run('recoverCorpses(s.corpses[0].cell)');g.drain();check('s.reserve[2].inventory');
 assert.equal(g.run('s.reserve[2].equipped'),2);assert.deepEqual(read(g,'s.itemBox'),['unid:cap']);assert.deepEqual(read(g,'s.library.items'),{helm:true});
}
console.log('PASS 121 all states survive JSON, ash-v1, reserve, stairs, death transport, temple, level up, wipe and corpse recovery; malformed inventory/box/corpse tokens rejected');

{
 const g=party();
 const cursed=['cursedStaff','cursedDagger','cursedArmor','cursedHelm'];
 // The rank distribution itself is sampled in chest-loot.cjs. Select each cursed candidate
 // by its midpoint within its rank, then inspect every direct-drop candidate at each floor.
 for(const id of cursed){
  const result=read(g,`(()=>{
   const w=weapon('${id}'),items=WEAPONS.filter(item=>item.lootRank===w.lootRank);
   const rolls=[0,.99,w.lootRank===1?0:.99,(items.indexOf(w)+.5)/items.length,1,1];
   return rollChestItems('rat',1,()=>rolls.shift());
  })()`);
  assert.deepEqual(result,[id]);
 }
 for(let floor=1;floor<=10;floor++){
  g.run(`s.floor=${floor};s.inventory[0]=['staff'];Math.random=()=>0;
   var candidates;weightedLoot=pool=>{candidates=pool.map(x=>x.item.id);return pool[0].item};dropWeapon()`);g.drain();
  assert.ok(g.run('candidates.length>0'));
  for(const id of cursed)assert.equal(g.run(`candidates.includes('${id}')`),false);
  assert.equal(g.run("s.inventory[0][1]==='unid:'+candidates[0]"),true);
 }
}
{
 const g=party();
 g.run("s.inventory[0]=['staff','unid:dragonbow','unid:cursedHelm','unid:cursedArmor','unid:galeboots'];s.members[0].job=1;s.members[0].level=10;renderInventory();renderEquipmentSummary(0);renderTransfer(0)");
 for(const name of ['武器','兜','胴防具','足防具'])assert.match(g.run("$('#inventoryslots').innerHTML"),new RegExp('正体不明の'+name));
 for(const id of ['dragonbow','cursedHelm','cursedArmor','galeboots']){
  const w=read(g,`weapon('${id}')`),html=g.run("$('#inventoryslots').innerHTML+$('#transferitem').innerHTML");
  for(const secret of [id,w.name,w.sell+' G'])assert.ok(!html.includes(secret),secret);
 }
 assert.equal(g.run("$('#inventoryslots').innerHTML.match(/売却 1 G/g).length"),4);
 g.run("s.itemBox=['unid-bound:cursedArmor'];itemBoxTab='body';renderItemBox()");
 assert.equal(g.run("$('#itemboxbody').children[0].children[1].children[1].disabled"),true);
 assert.equal(g.run('withdrawItem(0,0)'),false);
 // Hidden weapon compatibility cannot be probed by browsing the training menu.
 for(const token of ['unid:cursedDagger','unid:cursedStaff']){
  g.run(`s.inventory[0]=['sword','${token}'];s.members[0].job=0`);
  assert.equal(g.run('canChangeClass(partyRecords()[0],1,true).ok'),true);
 }
 g.run("$('#training').showModal();changeClass(s.members[0].id,1)");
 // Automatic class reassignment is neither a voluntary equip action nor bishop contact.
 assert.equal(g.run('s.inventory[0][s.equipped[0]]'),'unid:cursedStaff');
 assert.deepEqual(read(g,'s.library.items'),{});
}
console.log('PASS 121 all four chest candidates, direct pools on every floor, concealed slots/prices and transfer choices, bound box and training guards');

{
 const g=party();g.run("s.inventory[0].push('unid:cap','unid:boots');equip(0,1)");
 assert.equal(g.run("$('#itemchoicedialog').open"),true);
 g.run("$('#itemchoicecancel').onclick();equip(0,1);confirmItemChoice()");
 assert.equal(g.run("s.inventory[0][s.armor[0].head]"),'unid:cap');
 const h=game(saved(g));h.run('equip(0,2)');
 assert.equal(h.run("s.inventory[0][s.armor[0].feet]"),'unid:boots');
 assert.deepEqual(read(h,'s.library.items'),{});
}
{
 const g=party();g.run("s.inventory[0]=['unid-bound:cursedStaff','bound:cursedDagger','healingPotion'];s.equipped[0]=0;s.hp[0]=1;s.area='dungeon';s.ailments[0].silence=0;s.members[0].known.push('dios');s.mp[0]=10");
 assert.equal(g.run('useMedicine(0,2,0)'),true);g.drain();
 g.run("s.hp[0]=1;castMagic(0,'dios',0)");g.drain();assert.ok(g.run('s.hp[0]>1'));
 assert.deepEqual(read(g,'s.inventory[0]'),['unid-bound:cursedStaff','bound:cursedDagger']);
 g.run("s.area='town';s.gold=10;openItemService('uncurse');openItemChoice('uncurse',itemTarget(0,1));s.gold=9;confirmItemChoice()");
 assert.equal(g.run('s.gold'),9);assert.deepEqual(read(g,'s.inventory[0]'),['unid-bound:cursedStaff','bound:cursedDagger']);
 assert.equal(g.run("performItemService('uncurse',itemTarget(1,0))"),false);
}
console.log('PASS 121 first equip warning, healing medicine/spell preserve binding, removal funds rechecked at confirmation');
