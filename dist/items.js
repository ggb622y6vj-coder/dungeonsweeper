// 消耗品の正本。同じ薬はstack個まで1枠。内部形式は1個ずつのID配列。装備・MP・呪文習得は不要。
const MEDICINES=[
 {id:'healingPotion',stack:10,name:'傷薬',kind:'medicine',spell:'dios',description:'味方1人のHPを1d8回復',classes:[0,2,1,3,4,6,5,7],sell:8,weight:70,minFloor:1},
 {id:'antidote',stack:10,name:'解毒剤',kind:'medicine',spell:'latumofis',description:'味方1人の毒を解除',classes:[0,2,1,3,6,4,5,7],sell:6,weight:30,minFloor:1},
 {id:'paralysisCure',stack:5,name:'気付け薬',kind:'medicine',spell:'dialko',description:'味方1人の麻痺・睡眠・沈黙・恐怖を治す',classes:[0,2,1,3,4,6,5,7],sell:15,weight:20,minFloor:3},
 {id:'greaterPotion',stack:5,name:'上傷薬',kind:'medicine',spell:'dial',description:'味方1人のHPを4d4回復',classes:[0,2,1,3,4,6,5,7],sell:30,weight:35,minFloor:4},
 {id:'elixir',stack:3,name:'霊薬',kind:'medicine',spell:'dialma',description:'味方1人のHPを8d3回復',classes:[0,2,1,3,4,6,5,7],sell:80,weight:20,minFloor:7}
];
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
  if(!row||row.count===stackMaxOf(id)){row={id,slot,item:weapon(id),count:0};rows.push(row);last.set(id,row)}
  row.count++;
 });
 return rows;
}
function itemRowName(row){return (row.item?.name||row.id)+(row.count>1?' ×'+row.count:'')}
function lootRecipient(w){let i=s.members.findIndex((m,i)=>canEquipJob(w,jobOf(i))&&canAccept(s.inventory[i],w.id,10));return i>=0?i:s.members.findIndex((m,i)=>canAccept(s.inventory[i],w.id,10))}
function medicineSlots(i){return itemRows(s.inventory[i]).filter(x=>x.item?.kind==='medicine').map(({slot,item,count})=>({slot,item,count}))}
function canChooseMedicine(i){return !logBusy()&&!s.done&&!s.pendingBoss&&!s.pendingStairs&&!currentChest()&&!partyIncapacitated(i)}
function medicineAction(i){if(!s.enemy||!medicineSlots(i).length)return '';let plan=s.itemPlans[i],w=plan&&weapon(plan.id);return `<button data-medicine="${i}" ${!canChooseMedicine(i)?'disabled':''}>${s.commands[i]==='item'&&w?w.name+' → '+NAMES[plan.target]:'薬を使う'}</button>`}
function dropMedicine(){
 if(Math.random()>=.30)return;
 const pool=MEDICINES.filter(w=>(w.minFloor||1)<=(s.floor||1)),total=pool.reduce((n,w)=>n+w.weight,0);let roll=Math.random()*total,w=pool[0];for(let item of pool){roll-=item.weight;if(roll<0){w=item;break}}
 let i=lootRecipient(w);if(i<0){log(w.name+'を見つけたが、アイテムがいっぱいだ。');return}
 s.inventory[i].push(w.id);recordLibraryItem(w.id);log(w.name+'を入手。'+NAMES[i]+'が受け取った。');
}
function removeInventorySlot(i,slot){s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let part in s.armor[i])if(s.armor[i][part]>slot)s.armor[i][part]--}
function useMedicine(i,slot,target,inTurn=false,expectedId=null){
 if(inTurn&&expectedId&&s.inventory[i]?.[slot]!==expectedId)slot=s.inventory[i]?.lastIndexOf(expectedId)??-1;
 let w=weapon(s.inventory[i]?.[slot]);
 if(!w||w.kind!=='medicine'||(expectedId&&w.id!==expectedId)||partyIncapacitated(i)||!validAllyTarget(target)||s.done||(!inTurn&&(!canChooseMedicine(i)||s.enemy)))return false;
 if(s.members[target].status==='stone'){log(`${w.name}では${NAMES[target]}の石化を治せない。`);return false}
 const heal=['dios','dial','dialma'].includes(w.spell);
 if(heal&&s.hp[target]>=maxHP(target)){log(NAMES[target]+'のHPは満タンだ。');return false}
 if(w.spell==='dialko'&&!['paralysis','sleep','silence','fear'].some(key=>s.ailments[target][key]>0)){log(NAMES[target]+'は麻痺・睡眠・沈黙・恐怖していない。');return false}
 if(w.spell==='latumofis'&&!s.ailments[target].poison){log(NAMES[target]+'は毒に侵されていない。');return false}
 if(!displayVitals)displayVitals=snapshotVitals();
 removeInventorySlot(i,slot);log(NAMES[i]+'は'+w.name+'を使った。');
 if(heal){let before=s.hp[target];s.hp[target]=Math.min(maxHP(target),before+dice(...magic(w.spell).value).value);log(NAMES[target]+'のHPが'+(s.hp[target]-before)+'回復した。')}
 else if(w.spell==='dialko'){s.ailments[target].paralysis=0;s.ailments[target].sleep=0;s.ailments[target].silence=0;s.ailments[target].fear=0;log(NAMES[target]+'の麻痺・睡眠・沈黙・恐怖が解けた。')}
 else{s.ailments[target].poison=false;log(NAMES[target]+'の毒が消えた。')}
 if(!inTurn)autoReorderParty('medicine');
 return true;
}
function openMedicine(i,slot){if(!canChooseMedicine(i)||!medicineSlots(i).length)return;medicineMember=i;$('#medicinetitle').textContent=NAMES[i]+'の薬';$('#medicineitem').innerHTML=medicineSlots(i).map(x=>`<option value="${x.slot}" ${x.slot===slot?'selected':''}>${itemRowName(x)}</option>`).join('');// Decide visibility once per opening: toggling it on pointerdown would shift
 // the dialog under a mouse/touch press.
 $('#medicinelist').hidden=!document.documentElement?.classList?.contains('keynav-keyboard');$('#medicinelist').innerHTML=medicineSlots(i).map((x,index)=>`<button data-medicine-choice="${x.slot}" ${index===0?'data-key-default':''}>${itemRowName(x)}</button>`).join('');renderMedicineDescription();$('#medicinepick').hidden=s.area!=='dungeon';$('#medicinedialog').showModal();if(slot!==undefined&&s.area==='dungeon')pickMedicineTarget()}
function renderMedicineDescription(){let w=weapon(s.inventory[medicineMember][+$('#medicineitem').value]);$('#medicinedescription').textContent=w?.description||''}
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
 const slot=s.armor[i][part],w=weapon(s.inventory[i][slot]);
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
