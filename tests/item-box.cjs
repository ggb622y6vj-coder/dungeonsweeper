const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const J=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
function setup(){
 const g=game(null,()=>.5);
 g.run(`for(const [name,job] of [['収納A',0],['収納B',1]]){
  const r=generateRecruit(name,job);registerRecruit(r);changeRecruitParty(r.members.id,true);
 }s.inventory[0]=['sword','healingPotion','helm','leather','boots','healingPotion'];
 s.equipped[0]=0;s.armor[0]={head:2,body:3,feet:4};openInventory(0);openItemBox();`);
 return g;
}
const state=g=>g.run('JSON.stringify(s)');
function refused(g,call){const before=state(g);assert.equal(g.run(call),false,call);assert.equal(state(g),before,`${call}: no state mutation`)}

{
 const g=setup();
 assert.deepEqual(J(g,'s.itemBox'),[]);
 const gold=g.run('s.gold');
 assert.equal(g.run('depositItem(0,1)'),true);
 assert.deepEqual(J(g,'s.inventory[0]'),['sword','helm','leather','boots','healingPotion']);
 assert.deepEqual(J(g,'s.itemBox'),['healingPotion']);
 assert.deepEqual(J(g,'s.armor[0]'),{head:1,body:2,feet:3});
 assert.equal(g.run('s.equipped[0]'),0);
 assert.equal(g.run('s.gold'),gold);
 assert.match(g.run("$('#inventorytitle').textContent"),/5\/10/);
 assert.match(g.run("$('#itemboxcapacity').textContent"),/ボックス 1\/100.*収納Aの所持 5\/10/);
 assert.deepEqual(J(g,"JSON.parse(localStorage.getItem('ash-v1')).itemBox"),['healingPotion']);
 assert.equal(g.run('withdrawItem(0,0)'),true);
 assert.deepEqual(J(g,'s.itemBox'),[]);
 assert.deepEqual(J(g,'s.inventory[0]'),['sword','helm','leather','boots','healingPotion','healingPotion']);
 assert.match(g.run("$('#inventorytitle').textContent"),/5\/10/);
 assert.deepEqual(J(g,"JSON.parse(localStorage.getItem('ash-v1')).itemBox"),[]);
 for(const slot of [0,1,2,3])refused(g,`depositItem(0,${slot})`);
 // Moving an earlier item must preserve every equipped item's identity.
 g.run("s.inventory[0]=['healingPotion','sword','helm','leather','boots'];s.equipped[0]=1;s.armor[0]={head:2,body:3,feet:4}");
 assert.equal(g.run('depositItem(0,0)'),true);
 assert.equal(g.run('s.equipped[0]'),0);
 assert.deepEqual(J(g,'s.armor[0]'),{head:1,body:2,feet:3});
 assert.equal(g.run("s.inventory[0][s.equipped[0]]"),'sword');
 assert.deepEqual(J(g,'Object.values(s.armor[0]).map(slot=>s.inventory[0][slot])'),['helm','leather','boots']);
 // A different member can take the same shared item, regardless of job.
 assert.equal(g.run('withdrawItem(1,0)'),true);
 assert.deepEqual(J(g,'s.inventory[1]'),['staff','healingPotion']);
}
console.log('PASS item box deposit/withdraw, equipment rejection, weapon/armor compaction, shared storage and automatic save');

{
 const g=setup();
 g.run("s.itemBox=Array(99).fill('dagger')");
 assert.equal(g.run('depositItem(0,5)'),true);
 assert.equal(g.run('s.itemBox.length'),100);
 g.run("s.inventory[0].push('dagger')");
 refused(g,'depositItem(0,5)');
 assert.match(g.run("$('#itemboxnotice').textContent"),/ボックス.*いっぱい/);
 g.run("s.inventory[1]=['staff',...Array(8).fill('dagger')]");
 assert.equal(g.run('withdrawItem(1,50)'),true);
 assert.equal(g.run('s.inventory[1].length'),10);
 refused(g,'withdrawItem(1,0)');
 assert.match(g.run("$('#itemboxnotice').textContent"),/所持品.*いっぱい/);
 for(const call of ['depositItem(7,0)','withdrawItem(7,0)',...[-1,99,1.5,'"1"'].flatMap(slot=>[
  `depositItem(0,${slot})`,`withdrawItem(0,${slot})`
 ])])refused(g,call);
 // Both operations reject exploration and every busy gate in idle().
 for(const busy of ["s.area='dungeon'","s.enemy={units:[]}","s.pendingBoss={}","s.pendingStairs=true",
  's.pendingElevator=true',"s.cells[s.pos].chest={opened:false}","logQueue.push({text:'待機'})"]){
  const h=setup();h.run(`s.itemBox=['healingPotion'];${busy}`);
  refused(h,'depositItem(0,1)');refused(h,'withdrawItem(0,0)');
  h.run("$('#itemboxdialog').close();openItemBox();renderInventory()");
  assert.equal(h.run("$('#itemboxdialog').open"),false);
  assert.equal(h.run("$('#itemboxopen').disabled"),true);
 }
 const h=setup();h.run("s.area='dungeon';renderInventory()");
 assert.equal(h.run("$('#itemboxopen').hidden"),true);
 h.run("s.area='town';renderInventory()");
 assert.equal(h.run("$('#itemboxopen').hidden"),false);
 assert.equal(h.run("$('#itemboxopen').disabled"),false);
}
console.log('PASS item box capacity boundaries, invalid slots/members, town/idle guards and entry visibility');

{
 const g=setup();
 g.run("s.itemBox=['healingPotion','helm','sword','leather','boots','healingPotion']");
 for(const [tab,ids,boxSlots,inventorySlots] of [
  ['weapon',['sword'],[2],[0]],['head',['helm'],[1],[2]],['body',['leather'],[3],[3]],
  ['feet',['boots'],[4],[4]],['medicine',['healingPotion'],[0],[1]]
 ]){
  for(const id of ids)assert.equal(g.run(`itemBoxCategory(weapon('${id}'))`),tab);
  g.run(`$('#itemboxtab-${tab}').onclick()`);
  assert.equal(g.run(`$('#itemboxtab-${tab}').attributes['aria-selected']`),'true');
  assert.deepEqual(J(g,"$('#itemboxbody').children[0].children.slice(1).map(row=>+row.children[1].attributes['data-itembox-withdraw'])"),boxSlots);
  assert.deepEqual(J(g,"$('#itemboxbody').children[1].children.slice(1).map(row=>+row.children[1].attributes['data-itembox-deposit'])"),inventorySlots);
  assert.deepEqual(J(g,"$('#itemboxbody').children[0].children.slice(1).map(row=>row.children[0].textContent)"),ids.map(id=>g.run(`weapon('${id}').name`)+(tab==='medicine'?' ×2':'')));
  assert.equal(g.run("$('#itemboxbody').children[1].children.slice(1).every(row=>row.children[1].disabled)"),tab!=='medicine');
  if(tab!=='medicine')assert.match(g.run("$('#itemboxbody').children[1].children[1].children[0].textContent"),/装備中/);
 }
 // A grouped medicine button consumes its first original slot, then rows rebuild.
 assert.equal(g.run("$('#itemboxbody').children[0].children[1].children[1].onclick()"),true);
 assert.deepEqual(J(g,'s.itemBox'),['helm','sword','leather','boots','healingPotion']);
 g.run("$('#itemboxtab-head').onclick()");
 assert.equal(g.run("$('#itemboxbody').children[0].children[1].children[1].onclick()"),true);
 assert.deepEqual(J(g,'s.itemBox'),['sword','leather','boots','healingPotion']);
 assert.equal(g.run('s.inventory[0].at(-1)'),'helm');
}
console.log('PASS item box five categories, equipped rows, duplicate items and filtered original-slot actions');

{
 const g=setup();g.run("s.itemBox=['healingPotion','helm','sword','healingPotion'];save();var snapshot=rosterSaveState()");
 const expected=J(g,'s.itemBox');
 assert.deepEqual(J(g,'restoreRoster(structuredClone(snapshot)).itemBox'),expected);
 assert.deepEqual(J(g,'restoreRoster(JSON.parse(JSON.stringify(saveExportEnvelope())).data).itemBox'),expected);
 assert.equal(g.run('validateSaveData(saveExportEnvelope().data)'),true);
 const loaded=game(g.run("localStorage.getItem('ash-v1')"),()=>.5);
 assert.deepEqual(J(loaded,'s.itemBox'),expected);
 const old=g.run('JSON.stringify((({itemBox,...rest})=>rest)(snapshot))');
 assert.equal(g.run(`validateSaveData(JSON.parse(${JSON.stringify(old)}))`),true);
 assert.deepEqual(J(g,`restoreRoster(JSON.parse(${JSON.stringify(old)})).itemBox`),[]);
 const legacy=game(old,()=>.5);
 assert.deepEqual(J(legacy,'s.itemBox'),[]);
 assert.deepEqual(J(legacy,"JSON.parse(localStorage.getItem('ash-v1')).itemBox"),[]);
 // The pre-roster save path gets the same optional-field default.
 const preRoster=g.run('JSON.stringify((({itemBox,...rest})=>rest)(s))');
 assert.deepEqual(J(game(preRoster,()=>.5),'s.itemBox'),[]);
 for(const value of [[],['sword'],Array(100).fill('healingPotion'),Array(1000).fill('healingPotion')]){
  assert.equal(g.run(`{const data=structuredClone(snapshot);data.itemBox=${JSON.stringify(value)};const before=JSON.stringify(data);validateSaveData(data)&&JSON.stringify(data)===before}`),true);
 }
 for(const value of [Array(1001).fill('healingPotion'),[1],['sword',null],['sword',{}],['sword',false],null,{},'sword']){
  assert.equal(g.run(`{const data=structuredClone(snapshot);data.itemBox=${JSON.stringify(value)};const before=JSON.stringify(data);!validateSaveData(data)&&JSON.stringify(data)===before}`),true);
 }
 g.run("$('#resetconfirm').onclick()");
 assert.deepEqual(J(g,'s.itemBox'),[]);
 assert.deepEqual(J(g,"JSON.parse(localStorage.getItem('ash-v1')).itemBox"),[]);
}
console.log('PASS item box roster/JSON/startup round trips, legacy saves, pure optional validation and full reset');

{
 // fresh() rebuilds state on travel and return: shared storage must survive all routes.
 for(const route of ['stairs','elevator','pitfall']){
  const g=setup();g.run("s.itemBox=['helm','healingPotion'];enterDungeon()");g.drain();
  if(route==='stairs')g.run("s.guardiansDefeated=[1];s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2)");
  if(route==='elevator')g.run('s.elevatorFloors=[1,2];travelElevator(2)');
  if(route==='pitfall')g.run('descendPitfall()');
  g.drain();assert.equal(g.run('s.floor'),2);
  assert.deepEqual(J(g,'s.itemBox'),['helm','healingPotion']);
  g.run('rememberFloor();travelFloor(1)');g.drain();
  assert.deepEqual(J(g,'s.itemBox'),['helm','healingPotion']);
  assert.equal(g.run("'itemBox' in s.floors[2]"),false,'box belongs to party, not floor archives');
  g.run('enterTown()');g.drain();
  assert.deepEqual(J(g,'s.itemBox'),['helm','healingPotion']);
 }
}
console.log('PASS item box preserved across generated/saved floors and dungeon regeneration');
