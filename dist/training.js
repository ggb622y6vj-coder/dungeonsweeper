// UI uses textContent for player names and stable IDs for roster actions.
let recruitDraft=null, previousRecruit=null, pendingDelete=null;
function trainingNotice(text){$('#trainingnotice').textContent=text}
function resetRecruitDraft(){recruitDraft=null;previousRecruit=null;$('#registerrecruit').disabled=true;$('#recruitpreview').replaceChildren()}
function showRecruitPreview(){
 const m=recruitDraft.members, old=previousRecruit?.members;
 $('#recruitpreview').replaceChildren();
 const title=document.createElement('p');title.textContent=`${m.name} · ${CLASSES[m.job].name}　ボーナス ${m.creationBonus}点`;$('#recruitpreview').append(title);
 const grid=document.createElement('dl');grid.className='recruit-metrics';
 for(const [label,key] of [['STR','str'],['IQ','intelligence'],['PIE','piety'],['HP','maxHP'],['MP','maxMP'],['AC','ac']]){
  const item=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;
  const delta=old?m[key]-old[key]:0;dd.textContent=String(m[key])+(old&&key!=='ac'?` (${delta>0?'+':''}${delta})`:'');item.append(dt,dd);grid.append(item);
 }
 $('#recruitpreview').append(grid);const note=document.createElement('p');note.textContent=`Lv.1 / 経験値 0 / NEXT ${m.xpTargets[2]}。括弧内は前回生成との差。`;$('#recruitpreview').append(note);
}
function renderTraining(){
 const list=$('#recruitlist');list.replaceChildren();const roster=trainingRoster();
 for(const corpse of s.corpses||[]){
  const p=document.createElement('p');p.textContent=`迷宮に残された遺体：地下${corpse.floor}階（${corpse.records.map(r=>r.members.name).join('、')}）`;list.append(p);
 }
 $('#trainingcount').textContent=`登録 ${roster.length}人 / パーティ ${s.members.length}/6人。先頭3人が前衛です。`;
 if(!roster.length){const p=document.createElement('p');p.textContent='名前と職業を選んで、最初の冒険者を作成してください。';list.append(p)}
 for(const r of roster){
  const m=r.members,index=s.members.findIndex(x=>x.id===m.id),row=document.createElement('section');row.dataset.recruitId=m.id;
  const title=document.createElement('h4');title.textContent=`${m.name} · ${CLASSES[m.job].name} Lv.${m.level}`;
  const status=document.createElement('p'),ailment={dead:'死亡',ash:'灰',lost:'ロスト'}[m.status];status.textContent=ailment?`${index<0?'控え':`${index+1}番・${index<3?'前衛':'後衛'}`}・${ailment}`:index<0?'控え':`${index+1}番・${index<3?'前衛':'後衛'}`;
  const stats=document.createElement('p');stats.textContent=`STR ${m.str} / IQ ${m.intelligence??10} / PIE ${m.piety??10} / AC ${recruitAC(r)} / HP ${r.hp}/${m.maxHP} / MP ${r.mp}/${m.maxMP} / 経験値 ${m.xp}`;
  row.append(title,status,stats);const actions=document.createElement('div');actions.className='recruit-actions';row.append(actions);
  const button=(text,action,disabled=false)=>{const b=document.createElement('button');b.textContent=text;b.disabled=disabled;b.onclick=action;actions.append(b)};
  button(index<0?'加入':'離脱',()=>{if(changeRecruitParty(m.id,index<0)){trainingNotice(index<0?'パーティに加入しました。':'控えに移しました。');renderTraining()}},index<0&&(s.members.length>=6||m.status!=='ok'));
  if(index>=0)for(const [text,offset] of [['前へ',-1],['後ろへ',1]])button(text,()=>{const order=s.members.map((_,i)=>i);[order[index],order[index+offset]]=[order[index+offset],order[index]];reorderParty(order);renderTraining()},index+offset<0||index+offset>=s.members.length);
  button('登録抹消',()=>{pendingDelete=m.id;$('#recruitdeletename').textContent=`${m.name}を登録抹消しますか？装備・所持品も削除され、元に戻せません。`;$('#recruitdeletedialog').showModal()});list.append(row);
 }
}
$('#trainingopen').onclick=()=>{if(s.area!=='town'||!idle())return;resetRecruitDraft();trainingNotice('');renderTraining();$('#training').showModal()};
$('#trainingclose').onclick=()=>$('#training').close();
$('#training').addEventListener('close',resetRecruitDraft);
$('#rollrecruit').onclick=()=>{const record=generateRecruit($('#recruitname').value,+$('#recruitjob').value);if(!record){trainingNotice('名前を入力してください。');return}previousRecruit=recruitDraft;recruitDraft=record;showRecruitPreview();$('#registerrecruit').disabled=false;trainingNotice('能力値を確認して登録してください。')};
for(const id of ['recruitname','recruitjob'])$('#'+id).oninput=resetRecruitDraft;
$('#registerrecruit').onclick=()=>{if(registerRecruit(recruitDraft)){resetRecruitDraft();renderTraining();trainingNotice('控えに登録しました。「加入」でパーティに加えてください。')}};
$('#recruitdeletecancel').onclick=()=>$('#recruitdeletedialog').close();
$('#recruitdeleteconfirm').onclick=()=>{if(deleteRecruit(pendingDelete)){renderTraining();trainingNotice('登録を抹消しました。')}$('#recruitdeletedialog').close()};
$('#recruitdeletedialog').addEventListener('close',()=>{pendingDelete=null});
