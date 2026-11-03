// 呪文の正本。職業: 1=魔法使い、2=僧侶。MP・効果は本作用の調整。
const MAGIC = [
 ['dumapic','デュマピック',1,1,2,true,'field','front','survey',null,'前方の未探索マスを85%の精度で調査。解除・探索はしない。使用ごとにMP倍増、帰還でリセット'],
 ['identifyfoe','識別',1,1,3,true,'battle','all','identifyfoe',null,'敵全列の正体を見破る'],
 ['halito','ハリト',1,1,2,true,'battle','enemy','damage',[1,8],'敵1体に火炎1d8'],
 ['katino','カティノ',1,1,3,true,'battle','group','sleep',null,'選択した列の敵に睡眠判定。成功率は術者と敵のレベル差で変動、2回の敵行動を停止'],
 ['dilto','ディルト',1,3,3,true,'battle','group','debuff',2,'選択した列の敵のAC＋2。戦闘終了まで'],
 ['mahalito','マハリト',1,5,7,true,'battle','group','damage',[4,6],'選択した列の敵に火炎4d6'],
 ['morlis','モーリス',1,7,5,true,'battle','group','debuff',3,'敵を怯えさせ守りを崩す。選択した列の敵のAC＋3。戦闘終了まで'],
 ['dalto','ダルト',1,7,10,false,'battle','group','damage',[6,6],'選択した列の敵に冷気6d6'],
 ['mamorlis','マモーリス',1,9,8,true,'battle','all','debuff',3,'敵を怯えさせ守りを崩す。敵全体のAC＋3。戦闘終了まで'],
 ['makanito','マカニト',1,9,12,true,'battle','all','threshold-death',7,'Lv7以下の敵全体を確実に即死させる。不死・構造体・守護者には無効'],
 ['lakanito','ラカニト',1,11,16,true,'battle','group','death',null,'選択した列の敵に即死判定（100−敵Lv×6 %、Lv17以上は無効）。不死・構造体・守護者には無効'],
 ['malor','マロール',1,13,20,true,'field','floor','warp',null,'訪問済み階の上り階段へ転移。未訪問階は選択不可'],
 ['tiltowait','ティルトウェイト',1,13,30,false,'battle','all','damage',[10,15],'敵全体に10d15'],
 ['dios','ディオス',2,1,2,true,'both','ally','heal',[1,8],'生存する味方1人のHPを1d8回復'],
 ['kalki','カルキ',2,1,3,true,'battle','party','buff',1,'味方全員のAC−1。戦闘終了まで'],
 ['montino','モンティノ',2,3,4,true,'battle','group','silence',null,'選択した列の敵に沈黙判定。成功率は術者と敵のレベル差で変動、戦闘終了まで呪文を封じる。守護者には無効'],
 ['matu','マツ',2,3,5,true,'battle','party','buff',2,'味方全員のAC−2。戦闘終了まで'],
 ['watchful','警戒結界',2,3,4,true,'field','party','watchful',null,'町へ戻るまで敵の奇襲を防ぐ。味方の先制率は変わらない'],
 ['calfo','カルフォ',2,3,3,false,'chest','chest','identify',null,'宝箱の罠を95%の精度で識別。解除はしない'],
 ['lomilwa','ロミルワ',2,5,5,true,'field','party','light',null,'町へ戻るまで左右斜め前のマスを壁越しに表示。未探索の数字は隠したまま'],
 ['dialko','ディアルコ',2,5,4,false,'both','ally','cure',null,'生存する味方1人の麻痺・睡眠・沈黙・恐怖を治す'],
 ['dial','ディアル',2,7,5,true,'both','ally','heal',[4,4],'生存する味方1人のHPを4d4回復'],
 ['latumofis','ラツモフィス',2,7,4,false,'both','ally','antidote',null,'生存する味方1人の毒を治す'],
 ['dialma','ディアルマ',2,9,8,true,'both','ally','heal',[8,3],'生存する味方1人のHPを8d3回復'],
 ['lorto','ロルト',2,11,12,true,'battle','group','damage',[6,6],'選択した列の敵に6d6'],
 ['madi','マディ',2,11,15,false,'both','ally','restore',null,'生存する味方1人のHP・状態異常を全回復。蘇生不可'],
 ['malikto','マリクト',2,13,24,true,'battle','all','damage',[12,6],'敵全体に12d6']
].map(([id,name,job,level,mp,guaranteed,where,target,effect,value,description])=>({id,name,job,level,mp,guaranteed,where,target,effect,value,description}));
function baseSpellCost(x){return x.id==='dumapic'?2**Math.min(50,(s.dumapicUses||0)+1):x.mp}
function spellCost(x){return flagSpellCost(baseSpellCost(x))}
function magic(id){return MAGIC.find(x=>x.id===id)}
function learnMagic(i,level){let m=s.members[i],learned=[];for(let x of MAGIC.filter(x=>x.job===jobOf(i)&&x.level<=level&&!m.known.includes(x.id))){if(x.guaranteed||Math.random()<(jobOf(i)===1?m.intelligence:m.piety)/30){m.known.push(x.id);learned.push(x.name)}}if(typeof recordLibrarySpells==='function')recordLibrarySpells(m.known);return learned}
function ensureMakanito(m,job){if(job===1&&m.level>=magic('makanito').level&&m.known&&!m.known.includes('makanito'))m.known.push('makanito')}
function ensureMagic(){s.magicPlans??=[];while(s.magicPlans.length<s.members.length)s.magicPlans.push(null);s.members.forEach((m,i)=>{m.intelligence??=jobOf(i)===1?15:10;m.piety??=jobOf(i)===2?15:10;if(!m.known){m.known=MAGIC.filter(x=>x.job===jobOf(i)&&x.level===1&&x.guaranteed).map(x=>x.id);for(let lv=2;lv<=m.level;lv++)learnMagic(i,lv)}if(jobOf(i)===2&&m.level>=3&&!m.known.includes('watchful'))m.known.push('watchful');if(jobOf(i)===1&&!m.known.includes('identifyfoe'))m.known.push('identifyfoe');if(jobOf(i)===1&&!m.known.includes('dumapic'))m.known.push('dumapic');ensureMakanito(m,jobOf(i))});for(const r of s.reserve||[])ensureMakanito(r.members,r.members.job);if(typeof recordLibrarySpells==='function')recordLibrarySpells();s.commands=s.commands?.map(c=>c==='heal'?'fight':c)}
function magicContext(){return s.enemy?'battle':currentChest()?'chest':'field'}
function spellReason(i,x){if(s.ailments[i].silence>0)return '沈黙している';if(!s.members[i].known.includes(x.id))return s.members[i].level<x.level?`Lv.${x.level}で解禁`:'未習得';if(s.members[i].status==='stone')return '石化';if(!activeMember(i))return '死亡';if(s.ailments[i].paralysis>0)return '麻痺';if(s.area!=='dungeon'||s.done||s.pendingBoss||s.pendingStairs)return '今は使用不可';let ctx=magicContext();if(x.where!==ctx&&!(x.where==='both'&&(ctx==='battle'||ctx==='field')))return {battle:'戦闘専用',field:'探索専用',chest:'宝箱専用'}[x.where]||'今は使用不可';if(s.mp[i]<spellCost(x))return 'MP不足';return ''}
function validAllyTarget(t){return Number.isInteger(t)&&s.hp[t]>0&&['ok','stone'].includes(s.members[t]?.status)}
function allyTargetCandidates(){return s.members.flatMap((_,i)=>validAllyTarget(i)?[i]:[])}
function validMagicTarget(x,t){if(x.target==='ally')return validAllyTarget(t);if(x.target==='enemy'||x.target==='group')return !!s.enemy?.units.some(e=>e.uid===t&&e.hp>0);if(x.target==='floor')return Number.isInteger(t)&&(t===s.floor||!!s.floors[t]);return true}
// Eligibility is shared with the simulator; only reward rolls consume randomness.
function thresholdDeathApplies(e,value){let d=enemyDefinition(e.id);return !d.boss&&!['不死','構造体'].includes(d.race)&&monsterLevel(e)<=value}
function killByMagic(e){if(e.hp<=0||e.rewarded)return;e.hp=0;log(`${enemyDisplay(e)}は息絶えた。`);killReward(e)}
function lakanitoApplies(e){let d=enemyDefinition(e.id);return !d.boss&&!['不死','構造体'].includes(d.race)}
function castMagic(i,id,t){let x=magic(id);if(!x||x.job!==jobOf(i)||spellReason(i,x)||!validMagicTarget(x,t)){log(`${NAMES[i]}は呪文を使えなかった。`);return false}if(x.target==='ally'&&s.members[t].status==='stone'&&x.effect!=='restore'){log(`${x.name}では${NAMES[t]}の石化を治せない。`);return false}flagConsumeMP(i,baseSpellCost(x));log(`${NAMES[i]}は${x.name}を唱えた。`);
 if(['damage','sleep','silence','debuff','death','threshold-death'].includes(x.effect)){let picked=s.enemy.units.find(e=>e.uid===t);let targets=s.enemy.units.filter(e=>e.hp>0&&(x.target==='all'||(x.target==='group'?rowKey(e)===rowKey(picked):e.uid===t)));for(let e of targets){let name=enemyDisplay(e);if(x.effect==='damage'){let n=dice(...x.value).value;if(['halito','mahalito'].includes(x.id)&&enemyDefinition(e.id).resistance.includes('炎半減'))n=Math.floor(n/2);e.hp=Math.max(0,e.hp-n);log(`${name}に${n}ダメージ。`)}else if(x.effect==='sleep'||x.effect==='silence'){let chance=Math.max(0,Math.min(94,49+5*(s.members[i].level-monsterLevel(e))));if(!enemyDefinition(e.id).boss&&Math.random()*100<chance){if(x.effect==='silence'){e.silence=true;log(`${name}は沈黙した。`)}else{e.sleep=Math.max(e.sleep||0,2);log(`${name}は眠った。`)}}else log(`${name}には効かなかった。`)}else if(x.effect==='debuff'){e.acPenalty=Math.max(e.acPenalty||0,x.value);log(`${name}の守りが弱まった。`)}else if(x.effect==='threshold-death'){if(thresholdDeathApplies(e,x.value))killByMagic(e);else log(`${name}には効かなかった。`)}else if(x.effect==='death'){if(!lakanitoApplies(e))log(`${name}には効かない！`);else if(Math.random()*100<Math.max(0,100-monsterLevel(e)*6))killByMagic(e);else log(`${name}は耐えた。`)}if(e.hp===0&&!e.rewarded)killReward(e)}}
 else if(x.effect==='identifyfoe'){identifyEnemies(true);log('敵の正体を見破った。')}
 else if(x.effect==='buff'){s.enemy.partyAC=Math.max(s.enemy.partyAC||0,x.value);log('一行の守りが強まった。')}
 else if(x.effect==='heal'||x.effect==='restore'){let before=s.hp[t];s.hp[t]=x.effect==='restore'?maxHP(t):Math.min(maxHP(t),s.hp[t]+dice(...x.value).value);if(x.effect==='restore'){const petrified=s.members[t].status==='stone';s.members[t].status='ok';s.ailments[t]=freshAilments();if(petrified)log(`${NAMES[t]}の石化が解けた。`);}log(`${NAMES[t]}のHPが${s.hp[t]-before}回復した。`)}
 else if(x.effect==='cure'){s.ailments[t].paralysis=0;s.ailments[t].sleep=0;s.ailments[t].silence=0;s.ailments[t].fear=0;log(`${NAMES[t]}の麻痺・睡眠・沈黙・恐怖が解けた。`)}
 else if(x.effect==='antidote'){s.ailments[t].poison=false;log(`${NAMES[t]}の毒が消えた。`)}
 else if(x.effect==='identify'){let c=currentChest();fixChestTrap(c);let names={none:'罠なし',needle:'針',poison:'毒',paralysis:'麻痺'};let result=c.trap;if(Math.random()>=.95){let other=Object.keys(names).filter(k=>k!==result);result=other[Math.random()*other.length|0]}c.reading=names[result];log(`宝箱の鑑定結果：${c.reading}。`)}
 else if(x.effect==='survey'){s.dumapicUses=(s.dumapicUses||0)+1;let j=target();if(j<0||s.cells[j].open)log('調査に失敗した。');else{let truth=!!s.cells[j].trap,correct=Math.random()<.85;log((correct?truth:!truth)?'前方は罠の可能性あり':'前方にはなにもない')}}
 else if(x.effect==='watchful'){s.watchful=true;log('警戒結界が一行を包んだ。')}
 else if(x.effect==='light'){s.light=true;log('視界が広がった。')}
 else if(x.effect==='warp'){if(t!==s.floor)travelFloor(t,true);else{s.pos=s.start;s.pendingStairs=false}log(`地下${t}階の上り階段へ転移した。`)}if(!s.enemy)autoReorderParty('spell');return true}
function fixChestTrap(c){if(c.trap!==undefined)return;let r=Math.random();c.trap=r>=.4?'none':r<.2?'needle':r<.32?'poison':'paralysis'}
function magicActions(i){if(!hasSpells(i))return ''; let plan=s.magicPlans[i],x=magic(plan?.id);return `<button data-magic="${i}" ${logBusy()||s.done?'disabled':''}>${s.enemy&&s.commands[i]==='spell'&&x?x.name+' · 変更':'呪文を選ぶ'}</button>${s.enemy&&s.commands[i]==='spell'&&x?`<small class="spellplan">MP ${spellCost(x)} · ${spellTargetLabel(x,plan.target)}</small>`:''}`}
function spellTargetLabel(x,t){if(x.target==='ally')return NAMES[t];if(x.target==='group'||x.target==='enemy'){let e=s.enemy.units.find(e=>e.uid===t),g=e&&enemyGroups().find(g=>g.key===rowKey(e));return g?`${g.index+1}列：${enemyDisplay(g.units[0])}`:'対象なし'}if(x.target==='enemy')return enemyDefinition(s.enemy.units.find(e=>e.uid===t)?.id||s.enemy.units[0].id).name+(x.target==='group'?'の組':'');return {party:'味方全員',all:'敵全体',chest:'宝箱',floor:`地下${t}階`}[x.target]}
function spellStats(i){let m=s.members[i];return `<dt>IQ</dt><dd>${m.intelligence}</dd><dt>PIE</dt><dd>${m.piety}</dd>`}
let spellMember=1,spellBrowse=false,spellSelected=null;
function openMagic(i,browse=false){spellMember=i;spellBrowse=browse;spellSelected=null;renderMagic();$('#magicdialog').showModal()}
function renderMagic(){let i=spellMember,m=s.members[i];$('#magictitle').textContent=`${NAMES[i]}の呪文 · MP ${s.mp[i]}/${m.maxMP}`;$('#magiclist').innerHTML=MAGIC.filter(x=>x.job===jobOf(i)).map((x,index)=>{let known=m.known.includes(x.id),reason=spellReason(i,x);return `<button ${index===0?'data-key-default':''} title="${!spellBrowse?reason:''}" class="spellrow ${known?'learned':''}" data-spell="${x.id}" ${s.enemy&&!spellBrowse&&reason?'disabled':''} aria-pressed="${spellSelected===x.id}"><b>${x.name} <span>MP ${spellCost(x)}</span></b><small>${known?'習得済み':m.level<x.level?'未解禁':'未習得'} · Lv.${x.level} · ${x.guaranteed?'確定習得':'習得率50%'}${!spellBrowse&&known&&reason?' · '+reason:''}</small><p>${x.description}</p></button>`}).join('');renderMagicChoice()}
function renderMagicChoice(){let x=magic(spellSelected),i=spellMember;let box=$('#magictargets');box.innerHTML='';$('#magicpick').hidden=spellBrowse||!x||x.target!=='ally'||!!s.enemy;$('#magicpick').disabled=!x||!!spellReason(i,x)||logBusy();$('#magiccast').hidden=spellBrowse||!x||x.target==='ally';$('#magicnotice').textContent='';if(!x)return;if(s.enemy&&!spellBrowse){$('#magiccast').hidden=true;return}let options=[];if(x.target==='group'||x.target==='enemy')options=s.enemy?enemyGroups().filter(g=>g.units.some(e=>e.hp>0)).map(g=>[g.units.find(e=>e.hp>0).uid,`${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>e.hp>0).length}`]):[];else if(x.target==='floor')options=[...new Set([s.floor,...Object.keys(s.floors).map(Number)])].sort((a,b)=>a-b).map(f=>[f,`地下${f}階の上り階段`]);if(!spellBrowse&&options.length)box.innerHTML=`<label>対象 <select id="magictarget">${options.map(([v,label])=>`<option value="${v}">${label}</option>`).join('')}</select></label>`;let reason=spellReason(i,x);$('#magicnotice').textContent=spellBrowse?x.description:reason;$('#magiccast').disabled=!!reason||logBusy();$('#magiccast').textContent=s.enemy?'この呪文で行動する':'発動する'}
function commitMagicChoice(i,x,t){
 if(logBusy()||spellReason(i,x)||!validMagicTarget(x,t)){render();return}
 if(s.enemy){s.magicPlans[i]={id:x.id,target:t};s.commands[i]='spell'}
 else{displayVitals=snapshotVitals();castMagic(i,x.id,t)}
 $('#magicdialog').close();s.enemy?confirmCommand(i):render();
}
function pickFieldSpell(){
 const i=spellMember,x=magic(spellSelected);
 if(!x||spellBrowse||s.enemy||x.target!=='ally'||spellReason(i,x)||logBusy())return;
 beginAllyTargetPick({candidates:allyTargetCandidates,keyboardCandidates:()=>allyTargetCandidates().filter(t=>s.members[t].status!=='stone'||x.effect==='restore'),prompt:x.name,
  onPick:t=>commitMagicChoice(i,x,t),onCancel:()=>{renderMagic();$('#magicdialog').showModal();$('#magicpick').focus()}});
}
function magicUI(){
 $('#magicclose').onclick=()=>$('#magicdialog').close();
 $('#magicpick').onclick=pickFieldSpell;
 $('#magiclist').onclick=e=>{
  let b=e.target.closest('[data-spell]');if(!b)return;
  if(s.enemy&&!spellBrowse){let x=magic(b.dataset.spell);if(x&&!spellReason(spellMember,x))chooseBattleSpell(spellMember,x);return}
  let top=$('#magiclist').scrollTop;spellSelected=b.dataset.spell;renderMagic();$('#magiclist').scrollTop=top;pickFieldSpell();
 };
 $('#magiccast').onclick=()=>{
  let x=magic(spellSelected);if(!x)return;
  let t=['enemy','group','floor'].includes(x.target)?Number($('#magictarget').value):null;
  commitMagicChoice(spellMember,x,t);
 };
 $('#magicdialog').addEventListener('click',e=>{let d=e.currentTarget,r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()});
}
function calfoCaster(){return currentChest()?s.members.findIndex((m,i)=>magic('calfo').job===jobOf(i)&&!spellReason(i,magic('calfo'))):-1}
function diagonalSight(){if(!s.light)return [];let dx=[0,1,0,-1][s.dir],dy=[-1,0,1,0][s.dir];return [-1,1].map(side=>{let x=s.pos%size()+dx-dy*side,y=(s.pos/size()|0)+dy+dx*side;return x<0||x>=size()||y<0||y>=size()?-1:y*size()+x})}
function distantSight(){let cells=diagonalSight();if(!cells.some(i=>i>=0))return '';return `<g fill="none" stroke="#c6b5ef" stroke-opacity=".3" stroke-width="1.5"><path d="M200 100L260 150H380L440 100M200 300L260 250H380L440 300M260 150V250M380 150V250"/></g>`+cells.map((i,k)=>{if(i<0)return '';let v=face(i),x=k?411:229;return `<g class="透視" aria-label="${k?'右':'左'}前方：${v.label} ${v.symbol}"><path d="${k?'M440 100L380 150V250L440 300Z':'M200 100L260 150V250L200 300Z'}" fill="${v.fill}" fill-opacity=".35" stroke="#c6b5ef" stroke-opacity=".3" stroke-width="1.5"/><text x="${x}" y="210" text-anchor="middle" fill="${v.color||'#e8d2a2'}" font-family="system-ui,sans-serif" font-size="30" font-weight="700">${v.symbol}</text></g>`}).join('')}
