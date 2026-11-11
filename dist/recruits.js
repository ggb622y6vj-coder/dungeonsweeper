// 本作用の配分。Wizardryの能力値範囲を参考にし、原作の生成式とは区別する。
const RECRUIT_BASES = [[12,8,8,10],[8,12,8,9],[10,8,12,9],[10,10,8,14]];
const RECRUIT_WEIGHTS = [[0,0,0,1,2,3],[0,1,1,1,2,3],[0,1,2,2,2,3],[0,0,1,1,2,3,3]];
function generateRecruit(name, job) {
 name = String(name).trim().replace(/[<>&"'\u0000-\u001f]/g, '').slice(0,20);
 if (!name || !Number.isInteger(job) || job<0 || job>3 || !CLASSES[job]) return null;
 const c = CLASSES[job], stats = RECRUIT_BASES[job].slice();
 const bonus = 3 + Math.floor(Math.random()*7);
 for (let n=0;n<bonus;n++) {
  const choices = RECRUIT_WEIGHTS[job].filter(i=>stats[i]<18);
  stats[choices[Math.floor(Math.random()*choices.length)]]++;
 }
 const hp=c.hp-3+Math.floor(Math.random()*7), mp=c.mp?c.mp-2+Math.floor(Math.random()*5):0;
 const m={id:crypto.randomUUID(),name,job,level:1,xp:0,maxHP:hp,maxMP:mp,attack:c.attack,ac:c.ac,str:stats[0],baseStr:stats[0],intelligence:stats[1],piety:stats[2],agi:stats[3],baseAgi:stats[3],creationBonus:bonus,xpTargets:[0,0],xpCurveVersion:2,
  careerHistory:[],known:MAGIC.filter(x=>x.job===job&&x.level===1&&x.guaranteed).map(x=>x.id)};
 m.xpTargets=generateClassXP(job);
 m.vit=10+Math.floor(Math.random()*4);
 return {members:m,hp,mp,inventory:[['sword','staff','mace','dagger'][job]],equipped:0,armor:{},ailments:freshAilments()};
}
function trainingRoster(){return [...partyRecords(),...(s.reserve||[])]}
// Combat retains its parallel arrays. Save files keep a single roster plus ordered IDs.
function rosterSaveState() {
 const records=s.defeatPending?(s.reserve||[]):trainingRoster(), seen=new Set();
 for(const r of records){if(!r.members.id||seen.has(r.members.id))r.members.id=crypto.randomUUID();seen.add(r.members.id)}
 const snapshot={...s,rosterVersion:1,roster:records,partyIds:s.defeatPending?[]:s.members.map(m=>m.id),corpses:structuredClone(s.corpses||[])};
 for(const key of PARTY_FIELDS)delete snapshot[key];
 delete snapshot.reserve;
 return snapshot;
}
function restoreRoster(state) {
 if(state)state.corpses??=[];
 if(state?.rosterVersion!==1)return state;
 const records=new Map(state.roster.map(r=>[r.members.id,r]));
 const ids=[...new Set(state.partyIds)].filter(id=>records.has(id)).slice(0,6);
 for(const key of PARTY_FIELDS)state[key]=ids.map(id=>records.get(id)[key]);
 state.reserve=state.roster.filter(r=>!ids.includes(r.members.id));
 state.partyVersion=1;
 delete state.roster;delete state.partyIds;delete state.rosterVersion;
 return state;
}
function registerRecruit(record) {
 if(s.area!=='town'||!idle()||!record||trainingRoster().some(r=>r.members.id===record.members.id))return false;
 (s.reserve??=[]).push(structuredClone(record));if(typeof recordLibrarySpells==='function')recordLibrarySpells(record.members.known||[]);render();return true;
}
function changeRecruitParty(id, join) {
 const roster=trainingRoster(), index=roster.findIndex(r=>r.members.id===id);
 if(index<0)return false;
 if(join&&roster[index].members.status!=='ok')return false;
 let order=s.members.map((_,i)=>i);
 if(join){if(index<order.length||order.length>=6)return false;order.push(index)}
 else {if(index>=order.length)return false;order=order.filter(i=>i!==index)}
 return setPartyFromRoster(roster,order);
}
function removeFromParty(ids){
 const removed=new Set(ids),records=partyRecords(),order=records.map((r,i)=>removed.has(r.members.id)?-1:i).filter(i=>i>=0);
 if(!records.some(r=>removed.has(r.members.id)))return [];
 const kept=order.map(i=>records[i]),moved=records.filter(r=>removed.has(r.members.id)).map(r=>Object.fromEntries(PARTY_FIELDS.map(key=>[key,r[key]])));
 for(const key of PARTY_FIELDS)s[key]=kept.map(r=>r[key]);
 s.reserve=[...(s.reserve||[]),...moved];
 s.commands=s.members.map((_,i)=>i<3?'fight':'guard');
 s.magicPlans=s.members.map(()=>null);s.itemPlans=s.members.map(()=>null);s.attackRows=s.members.map(()=>null);
 displayVitals=null;refreshNames();
 return moved;
}
function deleteRecruit(id) {
 if(s.area!=='town'||!idle())return false;
 const roster=trainingRoster().filter(r=>r.members.id!==id);
 if(roster.length===trainingRoster().length)return false;
 const ids=s.members.map(m=>m.id).filter(i=>i!==id);
 return setPartyFromRoster(roster,ids.map(i=>roster.findIndex(r=>r.members.id===i)));
}
// Reject, do not strip. The character class matches validateSaveData in game.js.
function recruitNameError(name){
 if(typeof name!=='string')return '名前を入力してください。';
 const trimmed=name.trim();
 if(trimmed.length<1||trimmed.length>20)return '名前は1〜20文字にしてください。';
 if(/[<>&"'\u0000-\u001f]/.test(trimmed))return '名前に使えない文字が含まれています。';
 return '';
}
function renameRecruit(id,name){
 if(s.area!=='town'||!idle())return {ok:false,reason:'町で名前を変更してください。'};
 const record=trainingRoster().find(r=>r.members.id===id);
 if(!record)return {ok:false,reason:'冒険者が見つかりません。'};
 const reason=recruitNameError(name);
 if(reason)return {ok:false,reason};
 record.members.name=name.trim();
 refreshNames();render();save();
 return {ok:true,reason:''};
}
function recruitAC(record){return record.members.ac-Object.values(record.armor).reduce((sum,slot)=>sum+(weapon(record.inventory[slot])?.ac||0),0)}

function generateClassXP(job){
 const targets=[0,0];
 for(let l=2;l<=LEVEL_CAP;l++)targets[l]=targets[l-1]+Math.round(115*(l-1)*CLASSES[job].xpFactor*(.9+Math.random()*.2));
 return targets;
}
function ensureCareerHistory(m){
 if(!m)return;
 m.careerHistory=Array.isArray(m.careerHistory)?m.careerHistory.filter(h=>h&&
  Number.isInteger(h.from)&&!!CLASSES[h.from]&&Number.isInteger(h.to)&&!!CLASSES[h.to]&&h.from!==h.to&&
  Number.isInteger(h.fromLevel)&&h.fromLevel>=10&&h.fromLevel<=LEVEL_CAP):[];
 if(m.careerHistory.length)m.classChanged=true;
}
// Pure queries over a complete roster record, shared by preview and commit.
function classWeaponSlot(record,toJob){
 const usable=slot=>{const w=weapon(record.inventory[slot]);return !!w&&!w.part&&w.kind!=='medicine'&&canEquipJob(w,toJob)};
 return usable(record.equipped)?record.equipped:record.inventory.findIndex((_,slot)=>usable(slot));
}
function canChangeClass(record,toJob){
 const m=record?.members,previousJobs=({4:[0,1],5:[0,2],6:[0,3],7:[1,2]})[toJob];
 const reason=!m?'冒険者が見つかりません。':m.status!=='ok'?'正常な冒険者だけ転職できます。':
  m.level<10?'転職にはLv.10以上が必要です。':
  !Number.isInteger(toJob)||toJob<0||toJob>7?'転職先を選んでください。':
  m.job===toJob?'現在と同じ職業には転職できません。':
  previousJobs&&!previousJobs.includes(m.job)?`前職が${previousJobs.map(job=>CLASSES[job].name).join('または')}である必要があります。`:
  classWeaponSlot(record,toJob)<0?'転職先で装備できる武器を所持していません。':'';
 return {ok:!reason,reason};
}
function classChangePreview(record,toJob){
 if(!canChangeClass(record,toJob).ok)return null;
 const next=structuredClone(record),m=next.members,c=CLASSES[toJob];
 m.careerHistory=[...(m.careerHistory||[]),{from:m.job,fromLevel:m.level,to:toJob}];
 Object.assign(m,{job:toJob,level:1,xp:0,attack:c.attack,ac:c.ac,maxMP:Math.max(m.maxMP-Math.floor(m.maxMP/10),c.mp),baseStr:m.str,baseAgi:m.agi});
 next.hp=m.maxHP;next.mp=m.maxMP;next.equipped=classWeaponSlot(record,toJob);
 for(const [part,slot] of Object.entries(next.armor))if(!canEquipJob(weapon(next.inventory[slot]),toJob))delete next.armor[part];
 return next;
}
function changeClass(id,toJob){
 if(s.area!=='town'||!idle()||!$('#training').open)return {ok:false,reason:'町の訓練所で転職してください。'};
 const index=s.members.findIndex(m=>m.id===id),reserveIndex=(s.reserve||[]).findIndex(r=>r.members.id===id);
 const record=index>=0?partyRecords()[index]:s.reserve?.[reserveIndex],check=canChangeClass(record,toJob);
 if(!check.ok)return check;
 const next=classChangePreview(record,toJob);
 next.members.classChanged=true;
 next.members.xpTargets=generateClassXP(toJob);next.members.xpCurveVersion=2;
 if(index>=0){for(const key of PARTY_FIELDS)s[key][index]=next[key]}
 else s.reserve[reserveIndex]=next;
 displayVitals=null;refreshNames();render();
 return {ok:true,reason:''};
}
