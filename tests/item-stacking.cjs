// 107: capacities count stacks; mutations still operate on single array entries.
const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const J=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
function setup(){
 const g=game(null,()=>.5);
 g.run(`for(const [name,job] of [['運搬A',0],['運搬B',1]]){
  const r=generateRecruit(name,job);registerRecruit(r);changeRecruitParty(r.members.id,true);
 }inventoryMember=0;`);
 return g;
}
function refused(g,call){const before=g.run('JSON.stringify(s)');assert.equal(g.run(call),false,call);assert.equal(g.run('JSON.stringify(s)'),before,call+' leaves state unchanged')}
{
 const g=setup();
 assert.deepEqual(J(g,'MEDICINES.map(w=>[w.id,stackMaxOf(w.id)])'),[
  ['healingPotion',10],['antidote',10],['paralysisCure',5],['greaterPotion',5],['elixir',3]
 ]);
 assert.equal(g.run("WEAPONS.every(w=>stackMaxOf(w.id)===1)"),true);
 for(const [ids,slots] of [[[],0],[Array(10).fill('healingPotion'),1],[Array(11).fill('healingPotion'),2],
  [['sword','helm','sword',...Array(11).fill('healingPotion'),...Array(4).fill('elixir'),'antidote'],8]]){
  assert.equal(g.run(`usedSlots(${JSON.stringify(ids)})`),slots);
 }
 for(const id of ['healingPotion','antidote','paralysisCure','greaterPotion','elixir']){
  g.run(`var id='${id}',limit=stackMaxOf(id),bag=[...Array(9).fill('sword'),...Array(limit-1).fill(id)]`);
  assert.equal(g.run('usedSlots(bag)'),10);
  assert.equal(g.run('canAccept(bag,id,10)'),true);
  assert.equal(g.run("canAccept(bag,'helm',10)"),false);
  g.run('bag.push(id)');assert.equal(g.run('canAccept(bag,id,10)'),false);
  g.run('bag.shift()');assert.equal(g.run('canAccept(bag,id,10)'),true);
 }
 // Chunk order follows first occurrences, even with interleaved equipment/medicines.
 g.run("s.inventory[0]=['healingPotion','sword','antidote',...Array(10).fill('healingPotion'),'helm','antidote','sword'];s.equipped[0]=1;s.armor[0]={head:13};renderInventory()");
 assert.deepEqual(J(g,'itemRows(s.inventory[0]).map(({id,slot,count})=>[id,slot,count])'),[
  ['healingPotion',0,10],['sword',1,1],['antidote',2,2],['healingPotion',12,1],['helm',13,1],['sword',15,1]
 ]);
 assert.deepEqual(J(g,'medicineSlots(0).map(({slot,item,count})=>[slot,item.id,count])'),[[0,'healingPotion',10],[2,'antidote',2],[12,'healingPotion',1]]);
 const html=g.run("$('#inventoryslots').innerHTML");
 assert.equal((html.match(/class="slot"/g)||[]).length,10);
 assert.equal((html.match(/<span>—<\/span>/g)||[]).length,4);
 assert.match(html,/<b>傷薬 ×10<\/b>/);assert.match(html,/data-use-medicine="12"/);
 assert.match(g.run("$('#transferitem').innerHTML"),/6\. 剣/);
 assert.match(html,/data-equip="13"/);assert.doesNotMatch(html,/×1<\/b>/);
 assert.match(g.run("$('#inventorytitle').textContent"),/6\/10/);
 g.run('openMedicine(0)');
 for(const selector of ['#medicineitem','#medicinelist']){
  assert.match(g.run(`$('${selector}').innerHTML`),/傷薬 ×10/);
  assert.doesNotMatch(g.run(`$('${selector}').innerHTML`),/（枠|×1</);
 }
 // Selling a chunk is one item; equipment identity survives index compaction.
 const gold=g.run('s.gold');g.run('sell(0,0)');
 assert.equal(g.run('s.gold'),gold+8);assert.equal(g.run("s.inventory[0].filter(id=>id==='healingPotion').length"),10);
 assert.equal(g.run('s.equipped[0]'),0);assert.equal(g.run('s.armor[0].head'),12);
}
console.log('PASS item stacking: per-item limits, slot arithmetic, stable chunk rows, representative actions and counts');
{
 const g=setup();
 g.run("s.inventory[0]=[...Array(9).fill('sword'),...Array(9).fill('healingPotion')];s.inventory[1]=Array(10).fill('staff')");
 assert.equal(g.run("lootRecipient(weapon('healingPotion'))"),0);
 g.run('Math.random=()=>0;dropMedicine()');g.drain();
 assert.equal(g.run('s.inventory[0].length'),19);assert.equal(g.run('usedSlots(s.inventory[0])'),10);
 assert.equal(g.run("lootRecipient(weapon('healingPotion'))"),-1);
 g.run('dropMedicine()');g.drain();assert.equal(g.run('s.inventory[0].length'),19);
 // Preserve the equipment job preference and fallback when the matching job is full.
 g.run("s.inventory[0].shift();s.inventory[1].pop()");assert.equal(g.run("lootRecipient(weapon('staff'))"),1);
 g.run("s.inventory[1].push('staff')");assert.equal(g.run("lootRecipient(weapon('staff'))"),0);
 // Shop capacity uses slots even though the underlying array already exceeds ten.
 g.run("s.inventory[0]=['sword',...Array(15).fill('healingPotion')];s.gold=1000;renderShop()");
 assert.doesNotMatch(g.run("$('#shopitems').innerHTML"),/data-buy="sword" disabled/);
 g.run("buy('sword',0)");assert.equal(g.run('s.inventory[0].length'),17);g.drain();
 g.run("s.inventory[0]=[...Array(9).fill('sword'),...Array(9).fill('healingPotion')];renderShop()");
 assert.match(g.run("$('#shopitems').innerHTML"),/data-buy="sword" disabled/);
 const before=g.run('JSON.stringify([s.inventory,s.gold])');g.run("buy('sword',0)");
 assert.equal(g.run('JSON.stringify([s.inventory,s.gold])'),before);
}
console.log('PASS item stacking: loot receipt/full rejection, class preference/fallback and shop capacity');
{
 const g=setup();g.run("s.inventory[0]=['sword',...Array(11).fill('healingPotion')];s.hp[1]=1");
 assert.equal(g.run('useMedicine(0,medicineSlots(0)[1].slot,1)'),true);g.drain();
 assert.equal(g.run('usedSlots(s.inventory[0])'),2);
 g.run('s.hp[1]=1');assert.equal(g.run('useMedicine(0,medicineSlots(0)[0].slot,1)'),true);g.drain();
 assert.equal(g.run('usedSlots(s.inventory[0])'),2);
 g.run("s.inventory[0]=['sword','healingPotion'];s.hp[1]=1");
 assert.equal(g.run('useMedicine(0,1,1)'),true);g.drain();assert.equal(g.run('usedSlots(s.inventory[0])'),1);
 // Resolve a real item command after its slot shifted: consume the LAST matching ID.
 g.run("s.enemy={units:[]};s.commands[0]='item';s.inventory[0]=['sword','healingPotion','antidote','healingPotion','helm'];s.hp[1]=1;s.itemPlans[0]={slot:4,target:1,id:'healingPotion'};partyAction(0)");
 assert.deepEqual(J(g,'s.inventory[0]'),['sword','healingPotion','antidote','helm']);g.drain();
 // An unchanged slot wins over the fallback, even with another matching item later.
 g.run("s.inventory[0]=['sword','healingPotion','antidote','healingPotion'];s.hp[1]=1;s.itemPlans[0]={slot:1,target:1,id:'healingPotion'};partyAction(0)");
 assert.deepEqual(J(g,'s.inventory[0]'),['sword','antidote','healingPotion']);g.drain();
 g.run("s.inventory[0]=['sword','antidote'];s.hp[1]=1;s.itemPlans[0]={slot:99,target:1,id:'healingPotion'}");
 const before=g.run('JSON.stringify([s.inventory,s.hp])');g.run('partyAction(0)');
 assert.equal(g.run('JSON.stringify([s.inventory,s.hp])'),before);
 // Existing consumeArmor adjustment and new fallback must not double-shift reservations.
 g.run("s.inventory[0]=['sword','cap','healingPotion','antidote'];s.armor[0]={head:1};s.itemPlans[0]={slot:2,target:1,id:'healingPotion'};consumeArmor(0,'head');partyAction(0)");
 assert.deepEqual(J(g,'s.inventory[0]'),['sword','antidote']);
}
console.log('PASS item stacking: single consumption, empty chunk capacity, battle reservation fallback and armor compaction');
{
 const g=setup();g.run("s.inventory[0]=['sword','healingPotion','healingPotion','antidote'];s.inventory[1]=[...Array(9).fill('staff'),...Array(9).fill('healingPotion')];$('#transferitem').value='1';renderInventory()");
 assert.match(g.run("$('#transferitem').innerHTML"),/傷薬 ×2/);
 assert.doesNotMatch(g.run("$('#transfermember').innerHTML"),/disabled/);
 assert.match(g.run("$('#transfermember').innerHTML"),/10\/10/);
 assert.equal(g.run("$('#transfergive').disabled"),false);
 g.run("$('#transferitem').value='3';$('#transferitem').onchange()");
 assert.match(g.run("$('#transfermember').innerHTML"),/disabled/);assert.equal(g.run("$('#transfergive').disabled"),true);
 g.run("$('#transferitem').value='1';$('#transferitem').onchange()");assert.equal(g.run("$('#transfergive').disabled"),false);
 assert.equal(g.run('transferItem(0,1,1)'),true);
 assert.equal(g.run('s.inventory[1].length'),19);assert.equal(g.run('s.inventory[0].length'),3);
 refused(g,'transferItem(0,1,1)');
 g.run('s.inventory[1].pop()');assert.equal(g.run('transferItem(0,1,1)'),true);
 assert.deepEqual(J(g,'s.inventory[0]'),['sword','antidote']);
}
console.log('PASS item stacking: one-item transfer into a full inventory, rejection at stack limit and selected-item recipient UI');
{
 const g=setup();g.run("s.inventory[0]=['sword','healingPotion','healingPotion'];s.itemBox=[...Array(99).fill('dagger'),...Array(9).fill('healingPotion')]");
 assert.equal(g.run('depositItem(0,1)'),true);assert.equal(g.run('s.itemBox.length'),109);
 assert.equal(g.run('usedSlots(s.itemBox)'),100);refused(g,'depositItem(0,1)');
 g.run("s.inventory[0]=[...Array(9).fill('sword'),...Array(9).fill('healingPotion')]");
 assert.equal(g.run('withdrawItem(0,99)'),true);assert.equal(g.run('s.inventory[0].length'),19);
 refused(g,'withdrawItem(0,99)');refused(g,'withdrawItem(0,0)');
 g.run('s.inventory[0].pop()');assert.equal(g.run('withdrawItem(0,99)'),true);
 g.run("s.inventory[0]=['sword',...Array(11).fill('healingPotion')];s.itemBox=['antidote',...Array(12).fill('healingPotion')];itemBoxTab='medicine';renderItemBox()");
 assert.deepEqual(J(g,"$('#itemboxbody').children[0].children.slice(1).map(row=>[row.children[0].textContent,row.children[1].attributes['data-itembox-withdraw']])"),[['解毒剤','0'],['傷薬 ×10','1'],['傷薬 ×2','11']]);
 assert.deepEqual(J(g,"$('#itemboxbody').children[1].children.slice(1).map(row=>[row.children[0].textContent,row.children[1].attributes['data-itembox-deposit']])"),[['傷薬 ×10','1'],['傷薬','11']]);
 assert.match(g.run("$('#itemboxcapacity').textContent"),/ボックス 3\/100.*所持 3\/10/);
}
console.log('PASS item stacking: box capacity, partial-stack deposit/withdraw and chunk representatives in both groups');
{
 const g=setup();g.run("s.inventory[0]=[...Array(15).fill('healingPotion'),'sword'];s.equipped[0]=15;s.itemBox=Array(105).fill('healingPotion');save()");
 const loaded=game(g.run("localStorage.getItem('ash-v1')"),()=>.5);
 assert.deepEqual(J(loaded,'s.inventory[0]'),[...Array(15).fill('healingPotion'),'sword']);
 assert.equal(loaded.run('usedSlots(s.inventory[0])'),3);assert.equal(loaded.run('s.equipped[0]'),15);
 assert.equal(loaded.run('s.itemBox.length'),105);
 // JSON import cap follows slot counting: 100 slots x max stack 10 = 1000 entries.
 assert.equal(loaded.run('validateSaveData(saveExportEnvelope().data)'),true);
 loaded.run('s.itemBox=Array(1001).fill(\'healingPotion\')');
 assert.equal(loaded.run('validateSaveData(saveExportEnvelope().data)'),false);
 g.run("s.inventory[0]=['sword',...Array(8).fill('dagger'),...Array(11).fill('healingPotion'),'helm','sword'];s.equipped[0]=21;s.armor[0]={head:20};save()");
 const trimmed=game(g.run("localStorage.getItem('ash-v1')"),()=>.5);
 assert.deepEqual(J(trimmed,'s.inventory[0]'),['sword',...Array(8).fill('dagger'),...Array(10).fill('healingPotion')]);
 assert.equal(trimmed.run('usedSlots(s.inventory[0])'),10);assert.equal(trimmed.run('s.equipped[0]'),0);
 assert.deepEqual(J(trimmed,'s.armor[0]'),{});
 trimmed.run('save()');const again=game(trimmed.run("localStorage.getItem('ash-v1')"),()=>.5);
 assert.deepEqual(J(again,'s.inventory'),J(trimmed,'s.inventory'));
}
console.log('PASS item stacking: legacy/repeated reload, stack-preserving tail trimming, equipment repair and large box auto-save');
