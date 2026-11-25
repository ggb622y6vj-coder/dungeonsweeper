// 消耗品の正本。同じ薬はstack個まで1枠。内部形式は1個ずつのID配列。装備・MP・呪文習得は不要。
const MEDICINES=[
 {id:'healingPotion',stack:10,name:'傷薬',kind:'medicine',spell:'dios',description:'味方1人のHPを1d8回復',classes:[0,2,1,3,4,6,5,7],sell:8,weight:70},
 {id:'antidote',stack:10,name:'解毒剤',kind:'medicine',spell:'latumofis',description:'味方1人の毒を解除',classes:[0,2,1,3,6,4,5,7],sell:6,weight:30},
 {id:'paralysisCure',stack:5,name:'気付け薬',kind:'medicine',spell:'dialko',description:'味方1人の麻痺・睡眠・沈黙・恐怖を治す',classes:[0,2,1,3,4,6,5,7],sell:15,weight:20},
 {id:'greaterPotion',stack:5,name:'上傷薬',kind:'medicine',spell:'dial',description:'味方1人のHPを4d4回復',classes:[0,2,1,3,4,6,5,7],sell:30,weight:35},
 {id:'elixir',stack:3,name:'霊薬',kind:'medicine',spell:'dialma',description:'味方1人のHPを8d3回復',classes:[0,2,1,3,4,6,5,7],sell:80,weight:20}
];
// Only these prefixes are valid. Resolve one prefix, never a chain of prefixes.
function unidentified(token){return typeof token==='string'&&(token.startsWith('unid:')||token.startsWith('unid-bound:'))}
function boundItem(token){return typeof token==='string'&&(token.startsWith('bound:')||token.startsWith('unid-bound:'))}
function realItemId(token){return typeof token==='string'?token.replace(/^(?:unid|bound|unid-bound):/,''):undefined}
function weapon(token){
 const id=realItemId(token),w=WEAPONS.find(w=>w.id===id);
 if(w&&(!boundItem(token)||w.cursed))return w;
 if(id===token)return MEDICINES.find(w=>w.id===id);
}
function cursedItem(token){return !!weapon(token)?.cursed}
function equipmentToken(id,unknown,bound){
 if(unknown)return (bound?'unid-bound:':'unid:')+id;
 return bound?'bound:'+id:id;
}
// Public item data for rows, notices and quotes. The unknown view has no master ID.
function visibleItem(token){
 const w=weapon(token);
 if(!w||!unidentified(token))return w;
 return {unknown:true,part:w.part,sell:1,name:w.part?'謎の防具':'謎の武器'};
}
function itemName(token){return visibleItem(token)?.name||'−'}
const CURSE_LOCK='呪いで拘束されています。鍛冶屋で呪いを解除してください。';
let medicineMember=0;
function stackMaxOf(id){return MEDICINES.find(w=>w.id===id)?.stack||1}
function usedSlots(ids){
 const counts=new Map();for(const id of ids)counts.set(id,(counts.get(id)||0)+1);
 let slots=0;for(const [id,count] of counts)slots+=Math.ceil(count/stackMaxOf(id));return slots;
}
function canAccept(ids,id,cap){return ids.filter(x=>x===id).length%stackMaxOf(id)!==0||usedSlots(ids)<cap}
// Rows retain the first array index in each chunk; equipment always has its own row.
function itemRows(ids){
 const rows=[],last=new Map();
 ids.forEach((id,slot)=>{
  let row=last.get(id);
  if(!row||row.count===stackMaxOf(id)){row={id,slot,item:visibleItem(id),count:0};rows.push(row);last.set(id,row)}
  row.count++;
 });
 return rows;
}
function itemRowName(row){return (row.item?.name||'−')+(boundItem(row.id)?'（呪い）':'')+(row.count>1?' ×'+row.count:'')}
function lootRecipient(w,token=w.id){
 const hasRoom=(_,i)=>canAccept(s.inventory[i],token,10);
 if(!unidentified(token)){
  const i=s.members.findIndex((m,i)=>canEquipJob(w,jobOf(i))&&hasRoom(m,i));
  if(i>=0)return i;
 }
 return s.members.findIndex(hasRoom);
}
function medicineSlots(i){return itemRows(s.inventory[i]).filter(x=>x.item?.kind==='medicine').map(({slot,item,count})=>({slot,item,count}))}
function canChooseMedicine(i){return !logBusy()&&!s.done&&!s.pendingBoss&&!s.pendingStairs&&!currentChest()&&!partyIncapacitated(i)}
function dropMedicine(){
 if(Math.random()>=.30)return;
 const total=MEDICINES.reduce((sum,item)=>sum+item.weight,0);
 let roll=Math.random()*total;
 for(const item of MEDICINES){
  roll-=item.weight;
  if(roll<0){receiveLoot(item);return}
 }
}
function receiveLoot(w){
 const medicine=w.kind==='medicine';
 const token=medicine?w.id:equipmentToken(w.id,true,false);
 const i=lootRecipient(w,token),name=itemName(token);
 if(i<0){log(name+'を見つけたが、アイテムがいっぱいだ。');return}
 s.inventory[i].push(token);
 if(medicine)recordLibraryItem(w.id);
 log(name+'を入手。'+NAMES[i]+'が受け取った。');
}
// A removal can slide an indistinguishable copy into an open dialog's slot.
const inventoryRevisions=new WeakMap();
function removeInventorySlot(i,slot){
 const ids=s.inventory[i];
 inventoryRevisions.set(ids,(inventoryRevisions.get(ids)||0)+1);
 ids.splice(slot,1);
 if(s.equipped[i]>slot)s.equipped[i]--;
 for(const part in s.armor[i])if(s.armor[i][part]>slot)s.armor[i][part]--;
}
function useMedicine(i,slot,target,inTurn=false,expectedId=null){
 if(inTurn&&expectedId&&s.inventory[i]?.[slot]!==expectedId)slot=s.inventory[i]?.lastIndexOf(expectedId)??-1;
 let w=weapon(s.inventory[i]?.[slot]);
 if(!w||w.kind!=='medicine'||(expectedId&&w.id!==expectedId)||partyIncapacitated(i)||!validAllyTarget(target)||s.done||(!inTurn&&(!canChooseMedicine(i)||s.enemy)))return false;
 if(s.members[target].status==='stone'){log(`${w.name}では${NAMES[target]}の石化を治せない。`);return false}
 const heal=['dios','dial','dialma'].includes(w.spell);
 if(heal&&s.hp[target]>=maxHP(target)){log(NAMES[target]+'のHPは満タンだ。');return false}
 if(w.spell==='dialko'&&!['paralysis','sleep','silence','fear'].some(key=>s.ailments[target][key]>0)){log(NAMES[target]+'は元気そうだ。');return false}
 if(w.spell==='latumofis'&&!s.ailments[target].poison){log(NAMES[target]+'は毒に侵されていない。');return false}
 if(!displayVitals)displayVitals=snapshotVitals();
 removeInventorySlot(i,slot);log(NAMES[i]+'は'+w.name+'を使った。');
 if(heal){let before=s.hp[target];s.hp[target]=Math.min(maxHP(target),before+dice(...magic(w.spell).value).value);log(NAMES[target]+'のHPが'+(s.hp[target]-before)+'回復した。')}
 else if(w.spell==='dialko'){s.ailments[target].paralysis=0;s.ailments[target].sleep=0;s.ailments[target].silence=0;s.ailments[target].fear=0;log(NAMES[target]+'の状態異常が解けた。')}
 else{s.ailments[target].poison=false;log(NAMES[target]+'の毒が消えた。')}
 if(!inTurn)autoReorderParty('medicine');
 return true;
}
function openMedicine(i,slot){if(!canChooseMedicine(i)||!medicineSlots(i).length)return;medicineMember=i;$('#medicinetitle').textContent=NAMES[i]+'の薬';$('#medicineitem').innerHTML=medicineSlots(i).map(x=>`<option value="${x.slot}" ${x.slot===slot?'selected':''}>${itemRowName(x)}</option>`).join('');// Decide visibility once per opening: toggling it on pointerdown would shift
 // the dialog under a mouse/touch press.
 $('#medicinelist').hidden=!document.documentElement?.classList?.contains('keynav-keyboard');$('#medicinelist').innerHTML=medicineSlots(i).map((x,index)=>`<button data-medicine-choice="${x.slot}" ${index===0?'data-key-default':''}>${itemRowName(x)}</button>`).join('');renderMedicineDescription();$('#medicinepick').hidden=s.area!=='dungeon';$('#medicinedialog').showModal();if(slot!==undefined&&s.area==='dungeon')pickMedicineTarget()}
function renderMedicineDescription(){let w=visibleItem(s.inventory[medicineMember][+$('#medicineitem').value]);$('#medicinedescription').textContent=w?.kind==='medicine'?w.description:''}
function commitMedicineChoice(i,slot,target,id){
 const w=weapon(s.inventory[i]?.[slot]);
 if(!canChooseMedicine(i)||w?.kind!=='medicine'||w.id!==id||!validAllyTarget(target)){render();return}
 if(s.enemy){s.itemPlans[i]={slot,target,id:w.id};s.commands[i]='item'}else useMedicine(i,slot,target);
 for(const name of ['medicinedialog','inventorydialog','statsdialog'])if($('#'+name).open)$('#'+name).close();
 s.enemy?confirmCommand(i):render();
}
function pickMedicineTarget(){
 const i=medicineMember,slot=+$('#medicineitem').value,w=weapon(s.inventory[i]?.[slot]),battle=!!s.enemy;
 if(!canChooseMedicine(i)||w?.kind!=='medicine'||s.area!=='dungeon')return;
 beginAllyTargetPick({candidates:allyTargetCandidates,keyboardCandidates:()=>allyTargetCandidates().filter(t=>s.members[t].status!=='stone'),canWork:t=>s.members[t].status!=='stone',prompt:w.name,
  onPick:t=>commitMedicineChoice(i,slot,t,w.id),onCancel:()=>{
   if(battle)$('#commandentry [data-command-choice="item"]')?.focus();
   else{$('#medicinedialog').showModal();$('#medicinepick').focus()}
  }});
}
function medicineUI(){
 $('#medicinelist').onclick=e=>{
  const button=e.target.closest('[data-medicine-choice]');
  if(!button||!canChooseMedicine(medicineMember))return;
  $('#medicineitem').value=button.dataset.medicineChoice;renderMedicineDescription();
  if(s.area==='dungeon')pickMedicineTarget();
 };
 $('#medicineclose').onclick=()=>$('#medicinedialog').close();
 $('#medicineitem').onchange=()=>{renderMedicineDescription();pickMedicineTarget()};
 $('#medicinepick').onclick=pickMedicineTarget;
 $('#medicinedialog').addEventListener('click',e=>{let d=e.currentTarget,r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()});
}

// 102: equipment effects use the equipped slot, never an inventory-only copy.
function equippedArmor(i,part){return weapon(s.inventory[i]?.[s.armor[i]?.[part]])}
function consumeArmor(i,part){
 const slot=s.armor[i][part],w=visibleItem(s.inventory[i][slot]);
 delete s.armor[i][part];removeInventorySlot(i,slot);
 // A queued medicine slot can shift when armor disappears during the round.
 const plan=s.itemPlans[i];if(plan){if(plan.slot===slot)s.itemPlans[i]=null;else if(plan.slot>slot)plan.slot--}
 return w;
}
function sacrificeAfterDamage(i){
 if(s.area!=='dungeon'||s.hp[i]<=0||s.hp[i]>maxHP(i)/3||equippedArmor(i,'body')?.effect?.kind!=='sacrificeHP')return false;
 const w=consumeArmor(i,'body');s.hp[i]=Math.ceil(maxHP(i)/2);
 log(`${NAMES[i]}の${w.name}が身代わりになり、HPを${s.hp[i]}まで回復して消滅した。`);return true;
}
function sacrificeBeforeAilment(i,type){
 const already=type==='stone'?s.members[i].status==='stone':!!s.ailments[i][type];
 if(already||!activeMember(i)||equippedArmor(i,'head')?.effect?.kind!=='sacrificeStatus')return false;
 const w=consumeArmor(i,'head');log(`${NAMES[i]}の${w.name}が状態異常を防いで消滅した。`);return true;
}
function revealHeadlight(){
 if(!s.members.some((m,i)=>activeMember(i)&&equippedArmor(i,'head')?.effect?.kind==='headlight'))return;
 // Arrival has already settled. Only reveal cells; never visit or trigger them.
 for(const j of around(s.pos))if(!s.cells[j].open&&!s.cells[j].trap)s.cells[j].open=true;
}

// Quotes capture the roster identity and the physical inventory order, including stacked medicines.
function itemTarget(i,slot){
 const ids=s.inventory[i];
 if(!s.members[i]||!Number.isInteger(i)||!Number.isInteger(slot)||!ids?.[slot])return null;
 return {i,slot,owner:s.members[i].id,token:ids[slot],inventory:ids,revision:inventoryRevisions.get(ids),ids:ids.slice()};
}
function currentItemTarget(target){
 if(!target)return false;
 const {i,slot,owner,token,inventory,revision,ids}=target,now=s.inventory[i];
 return s.members[i]?.id===owner&&now===inventory&&inventoryRevisions.get(now)===revision&&
  now[slot]===token&&now.length===ids.length&&ids.every((id,n)=>id===now[n]);
}
function equippedPartSlot(i,w){return w.part?s.armor[i][w.part]:s.equipped[i]}
function lockedPart(i,w){return boundItem(s.inventory[i][equippedPartSlot(i,w)])}
function setEquipmentSlot(i,w,slot){if(w.part)s.armor[i][w.part]=slot;else s.equipped[i]=slot}
function bindEquipment(i,slot){
 const token=s.inventory[i][slot],w=weapon(token);
 if(!cursedItem(token)||boundItem(token))return;
 if(canEquipJob(w,jobOf(i))&&!lockedPart(i,w))setEquipmentSlot(i,w,slot);
 s.inventory[i][slot]=equipmentToken(w.id,unidentified(token),true);
}
function readyBishop(i,vitals=s){
 const m=(vitals.members||s.members)[i],a=(vitals.ailments||s.ailments)[i];
 return !!m&&(m.job??jobOf(i))===7&&vitals.hp[i]>0&&m.status==='ok'&&!(a.paralysis>0||a.sleep>0);
}
function canBishopIdentify(i){
 return readyBishop(i)&&['town','dungeon'].includes(s.area)&&!s.done&&idle();
}
function markIdentified(i,slot){
 const token=s.inventory[i][slot],id=realItemId(token);
 if(!unidentified(token))return;
 s.inventory[i][slot]=equipmentToken(id,false,boundItem(token));
 recordLibraryItem(id);
}
function removeCurse(i,slot){
 const token=s.inventory[i][slot];
 if(!boundItem(token))return;
 const w=weapon(token),equipped=equippedPartSlot(i,w)===slot;
 if(equipped&&w.part)delete s.armor[i][w.part];
 removeInventorySlot(i,slot);
 if(!equipped||w.part)return;
 const ids=s.inventory[i],replacement=ids.findIndex(id=>{
  const item=weapon(id);
  return !unidentified(id)&&!boundItem(id)&&!!item.dice&&canEquipJob(item,jobOf(i));
 });
 if(replacement>=0)s.equipped[i]=replacement;
 else{s.equipped[i]=ids.length;ids.push(jobOf(i)===7?'staff':starterWeapon(i))}
}
function serviceFee(token){return Math.max(1,weapon(token).sell)}
function serviceAvailable(action,i,slot){
 const token=s.inventory[i]?.[slot];
 if(!token||!idle()||s.done)return false;
 if(action==='bishop')return canBishopIdentify(i)&&unidentified(token);
 return s.area==='town'&&(action==='identify'?unidentified(token):action==='uncurse'&&boundItem(token));
}
function performItemService(action,target){
 if(!currentItemTarget(target))return false;
 const {i,slot,token}=target;
 if(!serviceAvailable(action,i,slot))return false;
 const w=weapon(token),name=itemName(token);
 let message;
 if(action==='bishop'){
  const lv=s.members[i].level;
  const success=Math.random()<Math.max(0,Math.min(100,10+5*lv))/100;
  const contact=cursedItem(token)&&!boundItem(token)&&Math.random()<Math.max(0,Math.min(100,35-3*lv))/100;
  if(success)markIdentified(i,slot);
  message=success?name+'は'+w.name+'だった！':'正体が分からなかった。';
  if(contact){bindEquipment(i,slot);message+=NAMES[i]+'は呪いに拘束された！'}
 }else{
  const fee=serviceFee(token);
  if(s.gold<fee)return false;
  s.gold-=fee;
  if(action==='identify'){markIdentified(i,slot);message=name+'は'+w.name+'だった！'}
  else{removeCurse(i,slot);message=name+'の呪いを解除した。品は消滅した。'}
 }
 // These idle actions finish immediately. Persist the result text with the charge and item.
 s.logs.unshift(message);s.logs=s.logs.slice(0,30);render({logPrepended:true});
 return message;
}

let pendingItemChoice=null;
function renderShopServiceList(action,list){
 list.replaceChildren();
 for(const i of s.members.keys()){
  s.inventory[i].forEach((token,slot)=>{
   if(!serviceAvailable(action,i,slot))return;
   const target=itemTarget(i,slot),button=document.createElement('button');
   const fee=serviceFee(token);
   button.textContent=NAMES[i]+' · '+itemName(token)+(action==='uncurse'?'（呪い）':'')+' · '+fee+' G';
   button.disabled=s.gold<fee;
   if(button.disabled)button.title='金貨が足りません。';
   button.onclick=()=>openItemChoice(action,target);
   list.append(button);
  });
 }
 if(!list.children.length){
  const empty=document.createElement('p');
  empty.textContent='対象の品がありません。';
  list.append(empty);
 }
}
function openItemChoice(action,target){
 if(!currentItemTarget(target))return;
 const {i,slot,token}=target;
 if(action!=='equip'&&(!itemServiceInView(action,target)||!serviceAvailable(action,i,slot)))return;
 const name=itemName(token),owner=NAMES[i];
 const prompt=action==='equip'?name+'を装備しますか？ 呪いがあれば外せなくなります。':
  action==='bishop'?name+'を鑑定しますか？ 呪いに触れることがあります。':
  name+'を'+serviceFee(token)+' Gで'+(action==='identify'?'鑑定しますか？':'呪い解除しますか？ 品は消滅します。');
 pendingItemChoice={action,target};
 $('#itemchoiceprompt').textContent=owner+'の'+prompt;
 $('#itemchoiceconfirm').disabled=action!=='bishop'&&action!=='equip'&&s.gold<serviceFee(token);
 $('#itemchoicedialog').showModal();
}
function itemServiceInView(action,target){
 if(action==='bishop')return $('#inventorydialog').open&&inventoryMember===target.i;
 return $('#shopdialog').open&&shopPanel==='identify';
}
function confirmItemChoice(){
 const choice=pendingItemChoice;
 if(!choice)return;
 pendingItemChoice=null;$('#itemchoicedialog').close();
 const {action,target}=choice;
 if(action==='equip'){
  if(currentItemTarget(target))applyEquip(target.i,target.slot,true);
  return;
 }
 if(!itemServiceInView(action,target))return;
 const message=performItemService(action,target)||'所持品・所持金・状態を確認してください。';
 if(action==='bishop'){
  if(s.members[inventoryMember])renderInventory();
  $('#inventorynotice').textContent=message;
 }else{
  renderShop();
  $('#shopservicenotice').textContent=message;
 }
}
