// 本作用の配分。Wizardryの能力値範囲を参考にし、原作の生成式とは区別する。
const RECRUIT_BASES = [[12,8,8],[8,12,8],[10,8,12],[10,10,8]];
const RECRUIT_WEIGHTS = [[0,0,0,1,2],[0,1,1,1,2],[0,1,2,2,2],[0,0,1,1,2]];
function generateRecruit(name, job) {
 name = String(name).trim().replace(/[<>&"'\u0000-\u001f]/g, '').slice(0,20);
 if (!name || !Number.isInteger(job) || !CLASSES[job]) return null;
 const c = CLASSES[job], stats = RECRUIT_BASES[job].slice();
 const bonus = 3 + Math.floor(Math.random()*7);
 for (let n=0;n<bonus;n++) {
  const choices = RECRUIT_WEIGHTS[job].filter(i=>stats[i]<18);
  stats[choices[Math.floor(Math.random()*choices.length)]]++;
 }
 const hp=c.hp-3+Math.floor(Math.random()*7), mp=c.mp?c.mp-2+Math.floor(Math.random()*5):0;
 const m={id:crypto.randomUUID(),name,job,level:1,xp:0,maxHP:hp,maxMP:mp,attack:c.attack,ac:c.ac,str:stats[0],baseStr:stats[0],intelligence:stats[1],piety:stats[2],creationBonus:bonus,xpTargets:[0,0],xpCurveVersion:2,
  known:MAGIC.filter(x=>x.job===job&&x.level===1&&x.guaranteed).map(x=>x.id)};
 for(let l=2;l<=LEVEL_CAP;l++)m.xpTargets[l]=m.xpTargets[l-1]+Math.round(115*(l-1)*c.xpFactor*(.9+Math.random()*.2));
 return {members:m,hp,mp,inventory:[['sword','staff','mace','dagger'][job]],equipped:0,armor:{},ailments:{poison:false,paralysis:0}};
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
 (s.reserve??=[]).push(structuredClone(record));render();return true;
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
function recruitAC(record){return record.members.ac-Object.values(record.armor).reduce((sum,slot)=>sum+(weapon(record.inventory[slot])?.ac||0),0)}
