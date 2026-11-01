// 消耗品の正本。1個につきアイテム1枠。装備・MP・呪文習得は不要。
const MEDICINES=[
 {id:'healingPotion',name:'傷薬',kind:'medicine',spell:'dios',description:'ディオス相当：味方1人のHPを1d8回復',classes:[0,1,2,3],sell:8,weight:70},
 {id:'antidote',name:'解毒剤',kind:'medicine',spell:'latumofis',description:'ラツモフィス相当：味方1人の毒を解除',classes:[0,1,2,3],sell:6,weight:30}
];
let medicineMember=0;
function medicineSlots(i){return s.inventory[i].flatMap((id,slot)=>MEDICINES.some(w=>w.id===id)?[{slot,item:weapon(id)}]:[])}
function canChooseMedicine(i){return !logBusy()&&!s.done&&!s.pendingBoss&&!s.pendingStairs&&!currentChest()&&s.hp[i]>0&&!s.ailments[i].paralysis}
function medicineAction(i){if(!s.enemy||!medicineSlots(i).length)return '';let plan=s.itemPlans[i],w=plan&&weapon(plan.id);return `<button data-medicine="${i}" ${!canChooseMedicine(i)?'disabled':''}>${s.commands[i]==='item'&&w?w.name+' → '+NAMES[plan.target]:'薬を使う'}</button>`}
function dropMedicine(){
 if(Math.random()>=.30)return;
 const total=MEDICINES.reduce((n,w)=>n+w.weight,0);let roll=Math.random()*total,w=MEDICINES[0];for(let item of MEDICINES){roll-=item.weight;if(roll<0){w=item;break}}
 let i=s.inventory.findIndex(a=>a.length<10);if(i<0){log(w.name+'を見つけたが、アイテムがいっぱいだ。');return}
 s.inventory[i].push(w.id);log(w.name+'を入手。'+NAMES[i]+'が受け取った。');
}
function removeInventorySlot(i,slot){s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let part in s.armor[i])if(s.armor[i][part]>slot)s.armor[i][part]--}
function useMedicine(i,slot,target,inTurn=false,expectedId=null){
 let w=weapon(s.inventory[i]?.[slot]);
 if(!w||w.kind!=='medicine'||(expectedId&&w.id!==expectedId)||s.hp[i]<=0||s.ailments[i].paralysis||!Number.isInteger(target)||s.hp[target]<=0||s.done||(!inTurn&&(!canChooseMedicine(i)||s.enemy)))return false;
 if(w.spell==='dios'&&s.hp[target]>=maxHP(target)){log(NAMES[target]+'のHPは満タンだ。');return false}
 if(w.spell==='latumofis'&&!s.ailments[target].poison){log(NAMES[target]+'は毒に侵されていない。');return false}
 if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};
 removeInventorySlot(i,slot);log(NAMES[i]+'は'+w.name+'を使った。');
 if(w.spell==='dios'){let before=s.hp[target];s.hp[target]=Math.min(maxHP(target),before+dice(...magic(w.spell).value).value);log(NAMES[target]+'のHPが'+(s.hp[target]-before)+'回復した。')}
 else{s.ailments[target].poison=false;log(NAMES[target]+'の毒が消えた。')}
 return true;
}
function openMedicine(i,slot){if(!canChooseMedicine(i)||!medicineSlots(i).length)return;medicineMember=i;$('#medicinetitle').textContent=NAMES[i]+'の薬';$('#medicineitem').innerHTML=medicineSlots(i).map(x=>`<option value="${x.slot}" ${x.slot===slot?'selected':''}>${x.item.name}（枠${x.slot+1}）</option>`).join('');$('#medicinetarget').innerHTML=s.hp.flatMap((hp,j)=>hp>0?[`<option value="${j}">${NAMES[j]} ${hp}/${maxHP(j)}・${ailmentLabel(j)}</option>`]:[]).join('');$('#medicineuse').textContent=s.enemy?'この薬で行動する':'使う';renderMedicineDescription();$('#medicinedialog').showModal()}
function renderMedicineDescription(){let w=weapon(s.inventory[medicineMember][+$('#medicineitem').value]);$('#medicinedescription').textContent=w?.description||''}
function medicineUI(){
 $('#medicineclose').onclick=()=>$('#medicinedialog').close();$('#medicineitem').onchange=renderMedicineDescription;
 $('#medicineuse').onclick=()=>{let i=medicineMember,slot=+$('#medicineitem').value,target=+$('#medicinetarget').value,w=weapon(s.inventory[i][slot]);if(!canChooseMedicine(i)||w?.kind!=='medicine'||s.hp[target]<=0)return;if(s.enemy){s.itemPlans[i]={slot,target,id:w.id};s.commands[i]='item'}else useMedicine(i,slot,target);$('#medicinedialog').close();if($('#inventorydialog').open)$('#inventorydialog').close();if(!s.enemy&&$('#statsdialog').open)$('#statsdialog').close();s.enemy?confirmCommand(i):render()};
 $('#medicinedialog').addEventListener('click',e=>{let d=e.currentTarget,r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()});
}
