const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const read=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
function setup(area='dungeon'){
 const g=game(null,()=>.5);
 g.run(`const recruit=generateRecruit('探索者',0);registerRecruit(recruit);changeRecruitParty(recruit.members.id,true);
  s.area='${area}';inventoryMember=0;s.gold=100;
  s.inventory[0]=['healingPotion','sword','healingPotion','helm','healingPotion','antidote'];
  s.equipped[0]=1;s.armor[0]={head:3};render();renderInventory();`);
 return g;
}
function unchanged(g,call){
 const before=g.run('JSON.stringify(s)');
 assert.equal(g.run(call),false,call);
 assert.equal(g.run('JSON.stringify(s)'),before,call+' must not mutate state');
}
function clickRow(g,action,slot){
 g.run(`$('#inventoryslots').onclick({target:{closest:()=>({dataset:{${action}:'${slot}'}})}})`);
}
{
 const g=setup(),gold=g.run('s.gold'),box=read(g,'s.itemBox');
 const html=g.run("$('#inventoryslots').innerHTML");
 assert.equal((html.match(/class="slot"/g)||[]).length,10);
 assert.match(html,/<div class="slotmain"><b>傷薬 ×3<\/b><p>味方1人のHPを1d8回復<\/p><\/div>/);
 assert.match(html,/data-discard="1" disabled/);
 assert.match(html,/data-discard="3" disabled/);
 assert.doesNotMatch(html,/data-sell=/);
 clickRow(g,'discard',0);
 assert.equal(g.run("$('#inventoryactiondialog').open"),true);
 assert.equal(g.run("$('#inventoryquantitylabel').hidden"),false);
 assert.equal(g.run("$('#inventoryactiontotal').hidden"),true);
 assert.equal(g.run("$('#inventoryquantity').innerHTML"),'<option value="1">1</option><option value="2">2</option><option value="3">3</option>');
 const before=g.run('JSON.stringify(s)');
 g.run("$('#inventoryactioncancel').onclick()");
 assert.equal(g.run('JSON.stringify(s)'),before,'cancel is a no-op');
 assert.equal(g.run('inventoryAction'),null);
 clickRow(g,'discard',0);
 g.run("$('#inventoryquantity').value='2';$('#inventoryactionconfirm').onclick()");
 assert.deepEqual(read(g,'s.inventory[0]'),['sword','helm','healingPotion','antidote']);
 assert.equal(g.run('s.equipped[0]'),0);assert.deepEqual(read(g,'s.armor[0]'),{head:1});
 assert.equal(g.run('s.gold'),gold);assert.deepEqual(read(g,'s.itemBox'),box);
 assert.equal(g.run("$('#inventoryactiondialog').open"),false);
 assert.match(g.run("$('#inventoryslots').innerHTML"),/<b>傷薬<\/b>/);
 // A single copy still requires confirmation, with no quantity selector.
 clickRow(g,'discard',2);
 assert.equal(g.run("$('#inventoryactionname').textContent"),'傷薬を捨てますか？');
 assert.equal(g.run("$('#inventoryquantitylabel').hidden"),true);
 assert.equal(g.run('s.inventory[0].length'),4);
 g.run("$('#inventoryactionconfirm').onclick();$('#inventoryactionconfirm').onclick()");
 assert.deepEqual(read(g,'s.inventory[0]'),['sword','helm','antidote'],'double confirm cannot remove another item');
 const loaded=game(g.run("localStorage.getItem('ash-v1')"));
 assert.deepEqual(read(loaded,'s.inventory[0]'),['sword','helm','antidote'],'discard persists');
}
console.log('PASS inventory UI: 10 rows, vertical item details, dungeon discard quantity/confirmation/cancel, no reward, saved removal');
{
 const g=setup('town');
 assert.doesNotMatch(g.run("$('#inventoryslots').innerHTML"),/data-discard=/);
 unchanged(g,'discard(0,0,2)');unchanged(g,"openInventoryAction('discard',0,0)");
 g.run("s.area='dungeon'");
 for(const slot of [1,3]){
  unchanged(g,`discard(0,${slot})`);unchanged(g,`openInventoryAction('discard',0,${slot})`);
 }
 for(const [start,end] of [
  ["s.enemy={units:[makeEnemy('goblin',111)]}",'s.enemy=null'],
  ['s.cells[s.pos].chest={opened:false}','delete s.cells[s.pos].chest'],['s.pendingBoss=true','s.pendingBoss=null'],
  ['s.pendingStairs=true','s.pendingStairs=false'],['s.pendingElevator=true','s.pendingElevator=false'],
  ["logQueue=[{text:'待機'}]",'logQueue=[]']
 ]){
  g.run(start+';renderInventory()');
  assert.match(g.run("$('#inventoryslots').innerHTML"),/data-discard="0" disabled/);
  unchanged(g,'discard(0,0,2)');unchanged(g,"openInventoryAction('discard',0,0)");
  g.run(end);
 }
 for(const n of ['0','-1','4','1.5','NaN','Infinity'])unchanged(g,`discard(0,0,${n})`);
 unchanged(g,'discard(0,2,1)');unchanged(g,'discard(9,0,1)');
 // Confirmation rechecks the context and target, including equipment changed while open.
 for(const change of ["s.area='town'","s.enemy={units:[]}","s.inventory[0][0]='antidote'","s.equipped[0]=0","s.members[0].id='changed'"]){
  const h=setup();clickRow(h,'discard',0);h.run(change);
  const before=h.run('JSON.stringify(s)');h.run("$('#inventoryactionconfirm').onclick()");
  assert.equal(h.run('JSON.stringify(s)'),before,change);
 }
}
console.log('PASS inventory UI: equipped/town/battle/chest/prompts/log guards, invalid counts and confirmation revalidation');
{
 const g=setup('town');
 clickRow(g,'sell',0);
 assert.equal(g.run('s.gold'),100,'opening does not sell');
 assert.equal(g.run("$('#inventoryactiondialog').open"),true);
 assert.equal(g.run("$('#inventoryactiontotal').textContent"),'合計 8 G（単価 8 G × 1）');
 g.run("$('#inventoryquantity').value='2';$('#inventoryquantity').onchange()");
 assert.equal(g.run("$('#inventoryactiontotal').textContent"),'合計 16 G（単価 8 G × 2）');
 g.run("$('#inventoryactionconfirm').onclick()");
 assert.equal(g.run('s.gold'),116);
 assert.deepEqual(read(g,'s.inventory[0]'),['sword','helm','healingPotion','antidote']);
 assert.equal(g.run('s.equipped[0]'),0);assert.deepEqual(read(g,'s.armor[0]'),{head:1});
 assert.equal(g.run("$('#shopgold').textContent"),'金貨 116 G');
 clickRow(g,'sell',2);
 assert.equal(g.run('s.gold'),124,'single item sells immediately');
 assert.equal(g.run("$('#inventoryactiondialog').open"),false);
 for(const slot of [0,1])unchanged(g,`sell(0,${slot})`);
 // Two identical weapons are separate rows: selling the spare must not remove the equipped copy.
 g.run("s.inventory[0]=['sword','healingPotion','sword','helm'];s.equipped[0]=2;s.armor[0]={head:3}");
 unchanged(g,'sell(0,0,2)');assert.equal(g.run('sell(0,0)'),true);
 assert.deepEqual(read(g,'s.inventory[0]'),['healingPotion','sword','helm']);
 assert.equal(g.run('s.equipped[0]'),1);assert.equal(g.run('s.armor[0].head'),2);
 // A later chunk must not remove earlier copies or exceed its own quantity.
 g.run("s.inventory[0]=[...Array(10).fill('healingPotion'),'sword','healingPotion','helm','healingPotion'];s.equipped[0]=10;s.armor[0]={head:12}");
 unchanged(g,'sell(0,11,3)');assert.equal(g.run('sell(0,11,2)'),true);
 assert.deepEqual(read(g,'s.inventory[0]'),[...Array(10).fill('healingPotion'),'sword','helm']);
 assert.equal(g.run('s.equipped[0]'),10);assert.equal(g.run('s.armor[0].head'),11);
 g.run("s.area='dungeon'");unchanged(g,'sell(0,0,2)');
 g.run("s.area='town';s.enemy={units:[]}");unchanged(g,'sell(0,0,2)');
}
console.log('PASS inventory UI: multi-sell total gold, immediate single sale, partial/chunk removal and weapon/armor index preservation');
