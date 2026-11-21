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
function clickIdentify(g,slot){
 g.run(`$('#inventoryslots').onclick({target:{closest:()=>({dataset:{inventoryIdentify:'${slot}'}})}})`);
}
function bishop(g,slot=1){
 g.run("if(!$('#inventorydialog').open)openInventory(0)");
 clickIdentify(g,slot);
 assert.equal(g.run("$('#itemchoicedialog').open"),true);
 g.run("$('#itemchoiceconfirm').onclick();$('#itemchoiceconfirm').onclick()");
 assert.equal(g.run("$('#inventorynotice').textContent"),g.run('s.logs[0]'));
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
 const g=party();g.run("s.members[1].job=7;s.inventory.forEach(ids=>ids.push('unid:cursedStaff'));openInventory(0)");
 const rows=g.run("$('#inventoryslots').innerHTML");
 assert.deepEqual(Array.from(rows.matchAll(/data-inventory-identify="(\d+)"/g),m=>+m[1]),[1]);
 g.run("openItemChoice('bishop',itemTarget(1,1));confirmItemChoice()");
 assert.notEqual(g.run("$('#itemchoicedialog').open"),true);
 assert.equal(g.run('s.inventory[1][1]'),'unid:cursedStaff');
 for(const mutation of ["s.enemy={units:[]}","s.cells[s.pos].chest={opened:false}","s.pendingBoss=true",
  "s.pendingStairs='up'","s.pendingElevator=true","s.done=true","logQueue.push({})",
  "s.ailments[0].paralysis=1","s.ailments[0].sleep=1","s.members[0].status='stone'","s.hp[0]=0",
  "s.members[0].job=1","changeRecruitParty(s.members[0].id,false)"]){
  const g=party();g.run("s.inventory[0].push('unid:cursedStaff');openInventory(0)");
  clickIdentify(g,1);
  assert.equal(g.run("$('#itemchoicedialog').open"),true);
  g.run(mutation);rolls(g,[]);const before=g.run('JSON.stringify(s)');g.run('confirmItemChoice()');
  assert.equal(g.run('JSON.stringify(s)'),before,mutation);
 }
}
console.log('PASS 121 bishop levels, exact boundaries/RNG order, all four outcomes, repeat contact, ownership, incapacity, silence/zero MP, stale scene and immediate save');

{
 const g=party();
 g.run("s.inventory[0].push('unid-bound:cursedStaff','unid:cursedHelm');s.inventory[1].push('unid:cursedHelm');renderStats();openInventory(0)");
 assert.doesNotMatch(g.run("$('#statsbody').innerHTML"),/data-stat-identify/);
 assert.equal(g.run("$('#inventorynotice').textContent"),'');
 assert.match(g.run("$('#inventoryslots').innerHTML"),/data-inventory-identify="1">鑑定/);
 clickIdentify(g,1);
 assert.equal(g.run("$('#itemchoiceprompt').textContent"),'冒険者0の謎の武器を鑑定しますか？ 呪いに触れることがあります。');
 const before=g.run('JSON.stringify(s)');
 rolls(g,[]);
 g.run("$('#itemchoicecancel').onclick();$('#itemchoiceconfirm').onclick()");
 assert.equal(g.run('JSON.stringify(s)'),before);
 assert.equal(g.run("$('#inventorynotice').textContent"),'');
 rolls(g,[0]);bishop(g);
 assert.doesNotMatch(g.run("$('#inventoryslots').innerHTML"),/data-inventory-identify="1"/);
 g.run("$('#inventoryclose').onclick();openInventory(0)");
 assert.equal(g.run("$('#inventorynotice').textContent"),'');
 g.run("s.ailments[0].sleep=1;renderInventory()");
 assert.doesNotMatch(g.run("$('#inventoryslots').innerHTML"),/data-inventory-identify/);
 g.run("$('#inventoryclose').onclick();openInventory(1)");
 assert.equal(g.run("$('#inventorynotice').textContent"),'');
 assert.doesNotMatch(g.run("$('#inventoryslots').innerHTML"),/data-inventory-identify/);
}
console.log('PASS 122 inventory notices, bishop-only row actions, cancellation, refresh and reopen');

{
 const g=party();
 g.run(`s.inventory[0]=['staff','unid:robe',...Array(4).fill('cap'),...Array(10).fill('healingPotion')];
  s.inventory[1]=['unid:cap','unid:sword','unid-bound:cursedHelm','unid:plate','unid:boots','helm','chain'];
  s.inventory[2]=['dagger','unid:oakstaff','unid:dragonbow'];
  s.equipped[1]=1;s.armor[1]={feet:4,head:5,body:6};s.itemBox=['unid:galeboots'];openInventory(1)`);
 const button="$('#inventorycollect')";
 assert.equal(g.run(button+'.hidden'),true);
 g.run("$('#inventoryclose').onclick();openInventory(0)");
 assert.equal(g.run(button+'.hidden'),false);
 assert.equal(g.run(button+'.disabled'),false);
 assert.equal(g.run('usedSlots(s.inventory[0])'),7);
 for(const [block,unblock] of [
  ['s.ailments[0].sleep=1','s.ailments[0].sleep=0'],
  ['s.pendingStairs="up"','s.pendingStairs=null']
 ]){
  g.run(block+';renderInventory()');
  assert.equal(g.run(button+'.hidden'),false);
  assert.equal(g.run(button+'.disabled'),true);
  const before=g.run('JSON.stringify(s.inventory)');
  g.run(button+'.onclick()');
  assert.equal(g.run('JSON.stringify(s.inventory)'),before);
  g.run(unblock+';renderInventory()');
 }
 rolls(g,[]);
 g.run(button+'.onclick()');
 assert.equal(g.run('usedSlots(s.inventory[0])'),10);
 assert.equal(g.run("$('#inventorytitle').textContent"),'冒険者0のアイテム 10/10');
 assert.deepEqual(read(g,'s.inventory[0].slice(0,2)'),['staff','unid:robe']);
 assert.deepEqual(read(g,'s.inventory[0].slice(-3)'),['unid:cap','unid:plate','unid:oakstaff']);
 assert.deepEqual(read(g,'s.inventory[1]'),['unid:sword','unid-bound:cursedHelm','unid:boots','helm','chain']);
 assert.deepEqual(read(g,'s.inventory[2]'),['dagger','unid:dragonbow']);
 assert.deepEqual(read(g,'s.equipped'),[0,0,0]);
 assert.deepEqual(read(g,'s.armor[1]'),{feet:2,head:3,body:4});
 assert.deepEqual(read(g,'s.itemBox'),['unid:galeboots']);
 assert.deepEqual(read(g,'s.library.items'),{});
 assert.equal(g.run("$('#inventorynotice').textContent"),'謎のアイテムを3個集めた。枠が足りず1個は残った。');
 assert.equal(g.run(button+'.disabled'),true);
 const full=g.run('JSON.stringify(s.inventory)');
 g.run(button+'.onclick()');
 assert.equal(g.run('JSON.stringify(s.inventory)'),full);
 const reloaded=game(saved(g),()=>.5);
 for(const expr of ['s.inventory','s.equipped','s.armor','s.itemBox'])assert.deepEqual(read(reloaded,expr),read(g,expr));
 g.run('removeInventorySlot(0,2);renderInventory()');
 assert.equal(g.run(button+'.disabled'),false);
 g.run(button+'.onclick()');
 assert.equal(g.run("$('#inventorynotice').textContent"),'謎のアイテムを1個集めた。');
 assert.equal(g.run('s.inventory[0].at(-1)'),'unid:dragonbow');
 g.run('removeInventorySlot(0,2);renderInventory()');
 assert.equal(g.run(button+'.disabled'),true);
 assert.equal(g.run("$('#inventorynotice').textContent"),'');
}
console.log('PASS 122 collect unknown items in party and inventory order, skip equipped/bound/box, preserve indices, enforce ten slots with stacks and save');

{
 const g=party();
 g.run("s.inventory[0].push('unid:cursedStaff');s.inventory[1].push('unid-bound:cursedHelm');s.gold=8;$('#blacksmith').onclick()");
 assert.equal(g.run("$('#shoptab-trade').attributes['aria-selected']"),'true');
 assert.equal(g.run("$('#shoppanel-identify').hidden"),true);
 g.run("$('#shoptab-identify').onclick()");
 assert.equal(g.run("$('#shoptab-identify').attributes['aria-selected']"),'true');
 assert.equal(g.run("$('#shoptab-identify').tabIndex"),0);
 assert.equal(g.run("$('#shoppanel-identify').hidden"),false);
 assert.equal(g.run("$('#shoppanel-trade').hidden"),true);
 assert.deepEqual(read(g,"$('#shopidentifylist').children.map(b=>[b.textContent,b.disabled])"),[
  ['冒険者0 · 謎の武器 · 8 G',false],['冒険者1 · 謎の防具 · 120 G',true]
 ]);
 assert.deepEqual(read(g,"$('#shopuncurselist').children.map(b=>[b.textContent,b.disabled])"),[
  ['冒険者1 · 謎の防具（呪い） · 120 G',true]
 ]);
 g.run("$('#shopidentifylist').children[0].onclick()");
 assert.equal(g.run("$('#itemchoicedialog').open"),true);
 assert.equal(g.run("$('#itemchoiceprompt').textContent"),'冒険者0の謎の武器を8 Gで鑑定しますか？');
 g.run("$('#itemchoiceconfirm').onclick()");
 assert.equal(g.run("$('#shopdialog').open"),true);
 assert.equal(g.run("$('#shopservicenotice').textContent"),'謎の武器は呪われた杖だった！');
 assert.equal(g.run("$('#shopgold').textContent"),'金貨 0 G');
 assert.equal(g.run("$('#shopidentifylist').children.length"),1);
 assert.equal(g.run("$('#shopuncurselist').children.length"),1);
 g.run("s.gold=120;renderShop();$('#shopuncurselist').children[0].onclick()");
 assert.match(g.run("$('#itemchoiceprompt').textContent"),/謎の防具を120 Gで呪い解除しますか？ 品は消滅します。/);
 g.run("$('#itemchoiceconfirm').onclick()");
 for(const id of ['shopidentifylist','shopuncurselist']){
  assert.equal(g.run(`$('#${id}').children[0].textContent`),'対象の品がありません。');
 }
 assert.equal(g.run("$('#shopservicenotice').textContent"),'謎の防具の呪いを解除した。品は消滅した。');
 assert.equal(g.run("s.library.items.cursedHelm"),undefined);
 g.run("$('#shopclose').onclick();$('#blacksmith').onclick()");
 assert.equal(g.run("$('#shoptab-trade').attributes['aria-selected']"),'true');
 assert.equal(g.run("$('#shopservicenotice').textContent"),'');
}
console.log('PASS 122 inline smith lists, tab state, quotes, affordability, refresh and notices');

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
 assert.ok(g.run("logQueue.some(x=>x.text.includes('謎の武器を奪われた'))"));
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
 assert.match(g.run('logQueue.at(-1).text'),/謎の防具/);
 assert.doesNotMatch(g.run('logQueue.at(-1).text'),/代わり身の胸当て|chestsac/);
}
console.log('PASS 121 voluntary binding, battle damage, AC snapshots, hidden sacrifice/theft logs, equipped and unequipped locks, armor index compaction');

{
 const g=party();g.run("s.inventory[0]=['staff','cursedStaff','unid:cursedStaff','bound:cursedStaff','unid-bound:cursedStaff','unid:cursedStaff'];s.gold=8");
 for(const action of ['identify','uncurse']){
  g.run(`$('#blacksmith').onclick();$('#shoptab-identify').onclick();openItemChoice('${action}',itemTarget(0,4));$('#itemchoicecancel').onclick();confirmItemChoice()`);
  assert.equal(g.run('s.gold'),8);assert.equal(g.run('s.inventory[0][4]'),'unid-bound:cursedStaff');
 }
 rolls(g,[]);g.run("$('#blacksmith').onclick();$('#shoptab-identify').onclick();openItemChoice('identify',itemTarget(0,4));s.gold=7;confirmItemChoice()");
 assert.equal(g.run('s.gold'),7);assert.deepEqual(read(g,'s.library.items'),{});
 g.run("s.gold=8;openItemChoice('identify',itemTarget(0,4));confirmItemChoice();confirmItemChoice()");
 assert.equal(g.run('s.gold'),0);assert.deepEqual(read(g,'s.library.items'),{cursedStaff:true});
 assert.deepEqual(read(g,'s.inventory[0]'),['staff','cursedStaff','unid:cursedStaff','bound:cursedStaff','bound:cursedStaff','unid:cursedStaff']);
 assert.equal(g.run('s.equipped[0]'),0);
 for(const action of ['identify','uncurse'])for(const mutation of ["removeInventorySlot(0,1)","s.inventory[0][1]='cursedStaff'","reorderParty([1,0,2])"]){
  const h=party(),token=action==='identify'?'unid:cursedStaff':'unid-bound:cursedStaff';
  h.run(`s.inventory[0].push('${token}','${token}');$('#blacksmith').onclick();$('#shoptab-identify').onclick();openItemChoice('${action}',itemTarget(0,1));${mutation}`);
  const before=h.run('JSON.stringify(s)');h.run('confirmItemChoice()');assert.equal(h.run('JSON.stringify(s)'),before,mutation);
 }
 for(const [job,id,starter] of [[1,'cursedStaff','staff'],[7,'cursedStaff','staff'],[3,'cursedDagger','dagger'],[6,'cursedDagger','dagger']]){
  for(const hasSpare of [true,false]){
   const h=party();h.run(`s.members[0].job=${job};s.inventory[0]=['unid:staff','bound:${id}','cap',${hasSpare?"'"+starter+"'":"'unid:oakstaff'"},...Array(6).fill('robe')];s.equipped[0]=1;s.armor[0]={head:2};s.gold=weapon('${id}').sell`);
   h.run("$('#blacksmith').onclick();$('#shoptab-identify').onclick();openItemChoice('uncurse',itemTarget(0,1));confirmItemChoice();confirmItemChoice()");
   assert.equal(h.run('s.gold'),0);assert.equal(h.run('s.inventory[0].length'),hasSpare?9:10);
   assert.equal(h.run('s.equipped[0]'),hasSpare?2:9);assert.equal(h.run('equippedWeapon(0).id'),starter);
   assert.equal(h.run('s.armor[0].head'),1);assert.equal(h.run(`weapon('${starter}').sell<serviceFee('${id}')`),true);
   assert.equal(h.run('s.inventory[0].some(boundItem)'),false);
  }
 }
}
{
 const g=party();g.run("s.inventory[0].push('unid:cursedDagger','unid:plate','unid:dragonbow');s.gold=0");
 assert.equal(g.run('transferItem(0,1,1)'),true);assert.match(g.run("$('#transfernotice').textContent"),/謎の武器/);
 assert.equal(g.run('sell(1,1)'),true);assert.equal(g.run('s.gold'),1);
 g.run("s.itemBox=Array(99).fill('robe');s.inventory[0].push(...Array(10).fill('healingPotion'));depositItem(0,1)");
 assert.equal(g.run('usedSlots(s.itemBox)'),100);assert.equal(g.run('depositItem(0,1)'),false);
 assert.equal(g.run('withdrawItem(0,99)'),true);assert.equal(g.run('s.inventory[0].at(-1)'),'unid:plate');
 assert.equal(g.run('usedSlots(s.inventory[0])'),4);
 g.run("s.area='dungeon';openInventoryAction('discard',0,1)");
 assert.match(g.run("$('#inventoryactionname').textContent"),/謎の武器/);
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
 assert.deepEqual(read(g,'s.inventory[0].slice(1).map(itemName)'),['謎の武器','謎の防具','謎の防具','謎の防具']);
 const slots=g.run("$('#inventoryslots').innerHTML");
 assert.equal((slots.match(/<b>謎の武器<\/b>/g)||[]).length,1);
 assert.equal((slots.match(/<b>謎の防具<\/b>/g)||[]).length,3);
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
 g.run("s.area='town';s.gold=10;$('#blacksmith').onclick();$('#shoptab-identify').onclick();openItemChoice('uncurse',itemTarget(0,1));s.gold=9;confirmItemChoice()");
 assert.equal(g.run('s.gold'),9);assert.deepEqual(read(g,'s.inventory[0]'),['unid-bound:cursedStaff','bound:cursedDagger']);
 assert.equal(g.run("performItemService('uncurse',itemTarget(1,0))"),false);
}
console.log('PASS 121 first equip warning, healing medicine/spell preserve binding, removal funds rechecked at confirmation');
