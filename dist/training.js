// UI uses textContent for player names and stable IDs for roster actions.
let recruitDraft=null, previousRecruit=null, pendingDelete=null, pendingRename=null;
function trainingNotice(text){$('#trainingnotice').textContent=text}
function resetRecruitDraft(){recruitDraft=null;previousRecruit=null;$('#registerrecruit').disabled=true;$('#recruitpreview').replaceChildren()}
function showRecruitPreview(){
 const m=recruitDraft.members, old=previousRecruit?.members;
 $('#recruitpreview').replaceChildren();
 const title=document.createElement('p');title.textContent=`${m.name} · ${CLASSES[m.job].name}　ボーナス ${m.creationBonus}点`;$('#recruitpreview').append(title);
 const grid=document.createElement('dl');grid.className='recruit-metrics';
 for(const [label,key] of [['STR','str'],['AGI','agi'],['IQ','intelligence'],['PIE','piety'],['VIT','vit'],['HP','maxHP'],['MP','maxMP'],['AC','ac']]){
  const item=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;
  const delta=old?m[key]-old[key]:0;dd.textContent=String(m[key])+(old&&key!=='ac'?` (${delta>0?'+':''}${delta})`:'');item.append(dt,dd);grid.append(item);
 }
 $('#recruitpreview').append(grid);const note=document.createElement('p');note.textContent=`Lv.1 / 経験値 0 / NEXT ${m.xpTargets[2]}。括弧内は前回生成との差。`;$('#recruitpreview').append(note);
}
function showTrainingTab(which){
 const create=which!=='edit';
 $('#trainingtab-create').setAttribute('aria-selected',String(create));
 $('#trainingtab-create').tabIndex=create?0:-1;
 $('#trainingtab-edit').setAttribute('aria-selected',String(!create));
 $('#trainingtab-edit').tabIndex=create?-1:0;
 $('#trainingpanel-create').hidden=!create;
 $('#trainingpanel-edit').hidden=create;
}
function renderTraining(){
 const list=$('#recruitlist');list.replaceChildren();const roster=trainingRoster();
 for(const corpse of s.corpses||[]){
  const p=document.createElement('p');p.textContent=`迷宮に残された遺体：地下${corpse.floor}階（${corpse.records.map(r=>r.members.name).join('、')}）`;list.append(p);
 }
 $('#trainingcount').textContent=`登録 ${roster.length}人 / パーティ ${s.members.length}/6人。加入・離脱は酒場で行います。`;
 if(!roster.length){const p=document.createElement('p');p.textContent='名前と職業を選んで、最初の冒険者を作成してください。';list.append(p)}
 for(const r of roster){
  const m=r.members,index=s.members.findIndex(x=>x.id===m.id),row=document.createElement('section');row.dataset.recruitId=m.id;
  const title=document.createElement('h4');title.textContent=`${m.name}${m.status==='stone'?'（石化）':''} · ${CLASSES[m.job].name} Lv.${m.level}`;
  const status=document.createElement('p'),ailment={dead:'死亡',ash:'灰',lost:'ロスト',stone:'石化'}[m.status];status.textContent=ailment?`${index<0?'控え':`${index+1}番・${index<3?'前衛':'後衛'}`}・${ailment}`:index<0?'控え':`${index+1}番・${index<3?'前衛':'後衛'}`;
  const stats=document.createElement('p');stats.textContent=`STR ${m.str} / IQ ${m.intelligence??10} / PIE ${m.piety??10} / AGI ${m.agi??10} / VIT ${m.vit} / AC ${recruitAC(r)} / HP ${r.hp}/${m.maxHP} / MP ${r.mp}/${m.maxMP} / 経験値 ${m.xp}`;
  row.append(title,status,stats);const actions=document.createElement('div');actions.className='recruit-actions';row.append(actions);
  const button=(text,action,disabled=false)=>{const b=document.createElement('button');b.textContent=text;b.disabled=disabled;b.onclick=action;actions.append(b);return b};
  const checks=[0,1,2,3,4,5,6,7].filter(job=>job!==m.job).map(job=>canChangeClass(r,job));
  const reason=checks.some(check=>check.ok)?'':checks[0].reason;
  const change=button('転職',()=>openClassChange(m.id),!!reason);change.setAttribute('data-class-change',m.id);change.title=reason;
  if(reason){const note=document.createElement('p');note.textContent=reason;row.append(note)}
  button('名前の変更',()=>openRename(m.id));
  button('登録抹消',()=>{pendingDelete=m.id;$('#recruitdeletename').textContent=`${m.name}を登録抹消しますか？装備・所持品も削除され、元に戻せません。`;$('#recruitdeletedialog').showModal()});list.append(row);
 }
}
$('#trainingopen').onclick=()=>{if(s.area!=='town'||!idle())return;resetRecruitDraft();trainingNotice('');showTrainingTab('create');renderTraining();$('#training').showModal()};
$('#trainingclose').onclick=()=>$('#training').close();
$('#training').addEventListener('close',()=>{if(!$('#training').open)resetRecruitDraft()});
$('#trainingtab-create').onclick=()=>showTrainingTab('create');
$('#trainingtab-edit').onclick=()=>showTrainingTab('edit');
$('#rollrecruit').onclick=()=>{const record=generateRecruit($('#recruitname').value,+$('#recruitjob').value);if(!record){trainingNotice('名前を入力してください。');return}previousRecruit=recruitDraft;recruitDraft=record;showRecruitPreview();$('#registerrecruit').disabled=false;trainingNotice('能力値を確認して登録してください。')};
for(const id of ['recruitname','recruitjob'])$('#'+id).oninput=resetRecruitDraft;
$('#registerrecruit').onclick=()=>{if(registerRecruit(recruitDraft)){resetRecruitDraft();renderTraining();trainingNotice('控えに登録しました。酒場でパーティに加えてください。')}};
$('#recruitdeletecancel').onclick=()=>$('#recruitdeletedialog').close();
$('#recruitdeleteconfirm').onclick=()=>{if(deleteRecruit(pendingDelete)){renderTraining();trainingNotice('登録を抹消しました。')}$('#recruitdeletedialog').close()};
// 'close' is dispatched asynchronously; a fast Space close→reopen must keep the new target.
$('#recruitdeletedialog').addEventListener('close',()=>{if(!$('#recruitdeletedialog').open)pendingDelete=null});
function openRename(id){
 if(s.area!=='town'||!idle()||!$('#training').open)return;
 const record=trainingRoster().find(r=>r.members.id===id);
 if(!record)return;
 pendingRename=id;
 $('#renametarget').textContent=`${record.members.name}の名前を変更します。`;
 $('#renamename').value=record.members.name;
 $('#renamenotice').textContent='';
 $('#renamedialog').showModal();
}
$('#renamecancel').onclick=()=>$('#renamedialog').close();
$('#renameconfirm').onclick=()=>{
 const result=renameRecruit(pendingRename,$('#renamename').value);
 if(!result.ok){$('#renamenotice').textContent=result.reason;return}
 renderTraining();trainingNotice('名前を変更しました。');$('#renamedialog').close();
};
$('#renamedialog').addEventListener('close',()=>{if(!$('#renamedialog').open)pendingRename=null});
$('#renamename').addEventListener('keydown',e=>{
 if(e.key!=='Enter'||e.ctrlKey||e.altKey||e.metaKey||e.isComposing||e.repeat)return;
 e.preventDefault();
 $('#renameconfirm').onclick();
});

// The tavern shares the existing registration UI; closing it returns one layer
// and refreshes the roster so a later formation save cannot resurrect old data.
$('#tavernmanage').onclick=()=>$('#trainingopen').onclick();
$('#training').addEventListener('close',()=>{
 if(!$('#training').open&&$('#taverndialog').open){
  tavernRoster=trainingRoster();tavernOrder=Array.from({length:6},(_,i)=>i<s.members.length?i:-1);
  renderTavern();
 }
});
$('#recruitname').addEventListener('keydown',e=>{
 if(e.key!=='Enter'||e.ctrlKey||e.altKey||e.metaKey||e.isComposing||e.repeat)return;
 e.preventDefault();
 if(!recruitDraft)$('#rollrecruit').onclick();
 $('#registerrecruit').onclick();
});

let classChangeId=null,classChangeJob=null;
function openClassChange(id){
 if(s.area!=='town'||!idle()||!$('#training').open)return;
 classChangeId=id;classChangeJob=null;renderClassChange();$('#classchangedialog').showModal();
}
function renderClassChange(){
 const record=trainingRoster().find(r=>r.members.id===classChangeId);
 $('#classchangename').textContent=record?`${record.members.name}の転職（無料）`:'';
 const list=$('#classchangejobs');list.replaceChildren();
 for(const job of [0,1,2,3,4,5,6,7]){
  const check=canChangeClass(record,job),b=document.createElement('button');
  b.setAttribute('data-class-job',String(job));b.setAttribute('aria-pressed',String(job===classChangeJob));
  b.textContent=CLASSES[job].name;
  b.disabled=!check.ok;b.title=check.reason;b.className=check.ok?'job-ready':'';
  b.onclick=()=>{classChangeJob=job;renderClassChange()};list.append(b);
 }
 const preview=$('#classchangepreview');preview.replaceChildren();
 const check=canChangeClass(record,classChangeJob),next=classChangePreview(record,classChangeJob);
 $('#classchangeconfirm').disabled=!check.ok;
 $('#classchangenotice').textContent=classChangeJob===null?'転職先を選んでください。':check.reason;
 if(!next)return;
 const m=record.members,n=next.members;
 const table=document.createElement('table');table.className='class-change-comparison';
 const head=document.createElement('tr');
 for(const text of ['項目','転職前','転職後']){const th=document.createElement('th');th.textContent=text;head.append(th)}table.append(head);
 for(const [label,before,after] of [['Lv',m.level,n.level],['XP',m.xp,n.xp],['HP',`${record.hp}/${m.maxHP}`,`${next.hp}/${n.maxHP}`],['MP',`${record.mp}/${m.maxMP}`,`${next.mp}/${n.maxMP}`],['AC',recruitAC(record),recruitAC(next)]]){
  const row=document.createElement('tr');for(const text of [label,before,after]){const td=document.createElement('td');td.textContent=String(text);row.append(td)}table.append(row);
 }
 preview.append(table);
 const removed=[record.equipped,...Object.values(record.armor)].filter(slot=>!canEquipJob(weapon(record.inventory[slot]),classChangeJob));
 const equipment=document.createElement('p');equipment.textContent=`使えなくなる装備：${removed.map(slot=>weapon(record.inventory[slot]).name).join('、')||'なし'}。所持品として残ります。転職後の武器：${weapon(next.inventory[next.equipped]).name}。`;
 const warning=document.createElement('p');warning.textContent='Lv と XP がリセットされます。習得済み呪文はすべて引き継ぎます。新職の呪文はレベルアップ時に習得します。';
 preview.append(equipment,warning);
}
$('#classchangecancel').onclick=()=>$('#classchangedialog').close();
$('#classchangeconfirm').onclick=()=>{
 const result=changeClass(classChangeId,classChangeJob);
 if(!result.ok){renderClassChange();$('#classchangenotice').textContent=result.reason;return}
 renderTraining();trainingNotice('転職しました。Lv.1から新しい職業で成長します。');$('#classchangedialog').close();
};
$('#classchangedialog').addEventListener('close',()=>{if(!$('#classchangedialog').open){classChangeId=null;classChangeJob=null}});
