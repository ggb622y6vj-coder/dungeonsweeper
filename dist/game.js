const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function freshAilments(){return {poison:false,paralysis:0,sleep:0,silence:0,fear:0}}
function normalizeAilments(a){const fresh=freshAilments();if(a&&typeof a==='object')for(const key of Object.keys(fresh))if(a[key]===undefined)a[key]=fresh[key];return a&&typeof a==='object'?a:fresh}
function fresh(floor=1){let profile=s?{elevatorFloors:s.elevatorFloors||[],gold:s.gold,library:s.library,templeReport:s.templeReport,guardiansDefeated:s.guardiansDefeated||[],cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,milwaSteps:floor===s.floor?(s.milwaSteps||0):0,teppeki:!!s.teppeki,partyVersion:s.partyVersion,reserve:s.reserve,corpses:s.corpses,dumapicUses:s.dumapicUses,floodUses:s.floodUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',corpses:[],cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,guardianKilledThisRun:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type=(floor<MAX_FLOOR&&(s.guardiansDefeated||[]).includes(floor))?'down':'boss';if(floor<MAX_FLOOR&&(s.guardiansDefeated||[]).includes(floor))s.relic=true;s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();if(floor<MAX_FLOOR&&(s.guardiansDefeated||[]).includes(floor)){s.cells[s.boss].type='down';s.relic=true;}placeCorpses(safe);placeElevator();render()}
// Keep corpse locations across regenerated floors; protect the generated safe route.
function placeCorpses(safe){
 const corpses=s.corpses.filter(c=>c.floor===s.floor);
 const distance=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0));
 for(const corpse of corpses){
  if(corpse.cell===s.start||corpse.cell===s.boss){
   const normal=s.cells.map((c,i)=>c.type===''?i:-1).filter(i=>i>=0);
   corpse.cell=normal.reduce((best,i)=>distance(i,corpse.cell)<distance(best,corpse.cell)?i:best);
  }
 }
 const occupied=new Set(corpses.map(c=>c.cell));let displaced=0;
 for(const i of occupied){if(s.cells[i].trap)displaced++;s.cells[i].trap=false;s.cells[i].type=''}
 const pool=s.cells.flatMap((c,i)=>!c.trap&&c.type===''&&!safe.has(i)&&!occupied.has(i)?[i]:[]);
 for(let n=0;n<displaced&&pool.length;n++)s.cells[pool.splice(Math.random()*pool.length|0,1)[0]].trap=true;
}
function recoverCorpses(i){
 const corpses=s.corpses.filter(c=>c.floor===s.floor&&c.cell===i);
 if(!corpses.length)return;
 for(const corpse of corpses){s.reserve.push(...corpse.records);s.gold+=corpse.gold}
 s.corpses=s.corpses.filter(c=>!corpses.includes(c));
 log('遺体を回収した。');
}
function enemyDefinition(id){return ENEMIES.find(e=>e.id===id)||ENEMIES[0]}
const UNKNOWN_NAMES=Object.fromEntries(ENEMIES.map(e=>[e.id,e.unknown]));
function enemyDisplay(e){return e?.identified?enemyDefinition(e.id).name:(UNKNOWN_NAMES[e?.id]||'正体不明')}
function identifyEnemies(force=false){if(!s.enemy)return;let chance=Math.min(1,Math.max(0,...s.members.map((m,i)=>activeMember(i)?(m.intelligence||0)*.03:0)));for(const g of enemyGroups(s.enemy)){if(!g.units.some(e=>e.hp>0)||g.units.some(e=>e.identified))continue;if(force||Math.random()<chance){for(const e of g.units)e.identified=true}}}
function makeEnemy(id,index){let d=enemyDefinition(id);return {id,uid:index,hp:dice(...d.hp).value,rewarded:false}}
function visibleCombat(){return displayCombat===undefined?s.enemy:displayCombat}
function rowKey(e){return e.row??e.id}
function enemyGroups(combat=s.enemy){return [...new Set(combat.units.filter(e=>!e.rewarded).map(rowKey))].map((key,index)=>{let units=combat.units.filter(e=>rowKey(e)===key);return {key,index,id:units[0].id,units}})}
function attackRowUI(i){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat).filter(g=>g.units.some(e=>!e.rewarded)),chosen=s.attackRows[i];if(!groups.some(g=>String(g.key)===String(chosen)))chosen=groups[0]?.key;return `<label class="attackrow"><span class="sr-only">${NAMES[i]}の攻撃対象の列</span><select data-attack-row="${i}" ${logBusy()||s.commands[i]!=='fight'||s.hp[i]<=0?'disabled':''}>${groups.map(g=>`<option value="${g.key}" ${String(chosen)===String(g.key)?'selected':''}>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</option>`).join('')}</select></label>`}
function encounterRate(i,wasOpen,action='forward'){return (wasOpen ? .10+num(i)*.005 : .16)+(['strafeLeft','strafeRight'].includes(action) ? .01 : 0)}
function rollInitiative(action='forward',boss=false){if(boss)return 'normal';let r=Math.random(),enemyChance=action==='back' ? .12 : .10;if(r<enemyChance)return s.watchful?'normal':'enemy';return r<enemyChance+.10?'party':'normal'}
function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.dispelRows=s.members.map(()=>null);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};recordLibraryEncounter(s.enemy);identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
function answerBoss(yes){if(logBusy()||!s.pendingBoss)return;let pending=s.pendingBoss;s.pendingBoss=null;if(yes)encounter(s.pos);else{s.pos=pending.previous;log('戦闘を避け、一歩前のマスへ戻った。')}render()}
function snapshotVitals(){return {hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members),ac:s.members.map((m,i)=>CLASSES[m.job??i].ac-Object.values(s.armor[i]||{}).reduce((n,k)=>n+(weapon(s.inventory[i]?.[k])?.ac||0),0)-Math.max(s.teppeki?2:0,s.enemy?.partyAC||0))}}
function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals=snapshotVitals();logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,...snapshotVitals()});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;if(s.defeatPending){finishDefeat();return}render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members,ac:entry.ac};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{if(typeof recordLibrarySpells==='function')recordLibrarySpells();localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
function hurt(n){s.hp=s.hp.map((h,i)=>activeMember(i)?Math.max(0,h-n):h);markDeaths();if(!activeMembers().length){defeat()}}
function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||s.pendingElevator||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(s.milwaSteps>0)s.milwaSteps--;if(c.type==='elevator'){c.open=true;s.pendingElevator=true;renderElevatorPick();$('#elevatorpick').showModal();render();return}if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('階段の上に長い手足の男が覆いかぶさっている。');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(!wasOpen)checkElevatorUnlock();recoverCorpses(i);if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
function finish(){s.done=true;log(s.relic&&s.guardianKilledThisRun?`秘宝を持ち帰った！ 探索成功。金貨 ${s.gold}枚。`:`無事に帰還。金貨 ${s.gold}枚を持ち帰った。`)}const MAX_HP=[32,24,26],NAMES=['戦士','魔法使い','僧侶'];
function dice(n,d,add=0){let rolls=Array.from({length:n},()=>1+(Math.random()*d|0));return {value:rolls.reduce((a,b)=>a+b,add),text:`${n}d${d}${add?'+'+add:''} [${rolls.join(', ')}]${add?' + '+add:''}`}}
function strengthFor(job,level){return Math.min(18,([15,9,12,12][job]??10)+Math.floor((Math.max(1,level)-1)/5))}
function strengthBonus(str){return str<=5?str-6:str>=16?str-15:0}
function migrateStrength(m,job){if(m.str==null)m.str=strengthFor(job,m.level);}
function physicalAttack(i,e){let m=s.members[i],w=equippedWeapon(i),bonus=strengthBonus(m.str),count=Math.min(10,Math.max(w.minAttacks??1,jobOf(i)===0?1+Math.floor(m.level/5):1)),classHit=[0,2].includes(jobOf(i))?2+Math.floor(m.level/3):Math.floor(m.level/5),threshold=Math.max(1,Math.min(19,21-(enemyDefinition(e.id).ac+(e.acPenalty||0))-classHit-(w.hitBonus||0)-bonus+3*(s.enemy?enemyGroups().findIndex(g=>g.key===rowKey(e)):(e.row||0)))),damage=0,hitsCount=0;for(let n=0;n<count;n++)if((Math.random()*20|0)>=threshold){hitsCount++;damage+=Math.max(1,dice(...w.dice).value+bonus)}return {damage,hitsCount,count}}
function hits(hit,ac){let roll=dice(1,20).value;return roll===20||(roll!==1&&roll+hit+ac>=20)}
function reachableEnemyGroups(i,combat=s.enemy){let groups=enemyGroups(combat).filter(g=>g.units.some(e=>e.hp>0));return equippedWeapon(i)?.range==='ranged'?groups:groups.slice(0,2)}
function selectedEnemy(i){let key=s.attackRows?.[i];if(key==null){let legacy=s.enemy.units.find(e=>e.uid===s.enemy.target);key=legacy?rowKey(legacy):rowKey(s.enemy.units[0])}if(!reachableEnemyGroups(i).some(g=>String(g.key)===String(key)))return undefined;return s.enemy.units.find(e=>String(rowKey(e))===String(key)&&e.hp>0)}
function killReward(e){if(e.rewarded)return;e.rewarded=true;let d=enemyDefinition(e.id);s.enemy.pendingXP=(s.enemy.pendingXP||0)+d.xp;s.enemy.pendingGold=(s.enemy.pendingGold||0)+Math.floor(dice(...d.gold).value/3);s.enemy.pendingDrops=(s.enemy.pendingDrops||0)+1;log('敵を倒した。')}
function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=activeMembers().length,share=xp>0&&survivors>0?Math.max(1,Math.floor(xp/survivors)):0;for(let i=0;i<s.members.length;i++)if(activeMember(i))s.members[i].xp+=share;if(share)log(`生存者は経験値${share}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}

// Resolve each action completely before moving party slots. The round's actor
// IDs stay fixed so a retreat cannot skip someone or make them act twice.
function partyAction(i){
 if(s.hp[i]<=0||['dead','ash','lost','stone'].includes(s.members[i].status))return;
 if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);return}
 if(s.commands[i]==='guard')return;
 if(s.commands[i]==='dispel'){dispelUndead(i);return}
 if(s.commands[i]==='item'){
  const plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);return;
 }
 if(s.commands[i]==='spell'){
  const plan=s.magicPlans[i];
  if(plan){
   const x=magic(plan.id);let t=plan.target;
   if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){
    const original=s.enemy.units.find(e=>e.uid===t);
    t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid;
   }
   castMagic(i,plan.id,t);
  }else log(`${NAMES[i]}の呪文が選ばれていない。`);
  return;
 }
 if(s.ailments[i].fear>0){log(`${NAMES[i]}は恐怖で攻撃できない。`);return}
 if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);return}
 const e=selectedEnemy(i)||reachableEnemyGroups(i)[0]?.units.find(e=>e.hp>0);
 if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);return}
 const result=physicalAttack(i,e);
 if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);return}
 const damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);
 log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);
 if(e.hp===0)killReward(e);
}
function attack(){
 if(logBusy()||!s.enemy||s.done)return;
 displayVitals=snapshotVitals();tickAilments();
 if(s.done){render();return}
 identifyEnemies();log('── ターン開始 ──');
 for(let i=0;i<s.members.length;i++)if(!partyIncapacitated(i)&&s.commands[i]==='guard')log(`${NAMES[i]}は身を守る。`);
 for(const id of s.members.map(m=>m.id)){
  partyAction(s.members.findIndex(m=>m.id===id));
  autoReorderParty('ally-action');
  if(!s.enemy.units.some(e=>e.hp>0))break;
 }
 if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle();
 else if(s.enemy.initiative==='party')s.enemy.initiative='normal';
 else enemyTurn(s.commands);
 tickBattleSilence();tickBattleFear();
 resetCommandEntry();resetPartyCommands();
 if(s.enemy){const next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}
 render();
}
function quickAttack(){if(logBusy()||!s.enemy||s.done)return;const members=commandMembers(),groups=enemyGroups().filter(g=>g.units.some(e=>e.hp>0)),front=groups[0];if(!front||!members.some(canWeaponAttack))return;for(const i of members){if(canWeaponAttack(i)){s.commands[i]='fight';s.attackRows[i]=front.key}else s.commands[i]='guard'}attack()}
function ensureStats(){if(!s.members){s.members=CLASSES.slice(0,3).map(c=>({level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac}));s.mp=CLASSES.slice(0,3).map((c,i)=>i===1?Math.min(c.mp,(s.spell===undefined?c.mp:s.spell*SPELLS.blast.cost)):i===2?Math.min(c.mp,(s.heal===undefined?c.mp:s.heal*SPELLS.heal.cost)):0);if(s.area==='town')s.mp=s.members.map(m=>m.maxMP);delete s.spell;delete s.heal}s.mp??=s.members.map(m=>m.maxMP);if(s.enemy&&!s.enemy.units){let old=s.enemy,id=old.boss?'guardian':'skeleton';s.enemy={boss:old.boss,target:0,units:[{id,uid:0,hp:old.hp,rewarded:false}]}}}
function shownMember(i){return displayVitals?.members?.[i]||s.members[i]}
function maxHP(i){return s.members[i].maxHP}
function levelUp(indices=s.members.map((_,i)=>i)){let reports=[];indices.forEach(i=>{let m=s.members[i];if(!m)return;let old={...m};while(m.level<LEVEL_CAP&&m.xp>=requiredXP(m.level+1,i)){m.level++;m.maxHP+=dice(...memberClass(i).hpGrowth).value;m.maxMP+=dice(...memberClass(i).mpGrowth).value;m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));let learned=learnMagic(i,m.level);if(learned.length)reports.push(`${NAMES[i]}は${learned.join("・")}を習得した。`);}if(m.level!==old.level)reports.push(`${NAMES[i]} Lv.${old.level} → ${m.level}　HP +${m.maxHP-old.maxHP} / MP +${m.maxMP-old.maxMP} / STR +${m.str-(old.str??strengthFor(jobOf(i),old.level))}`)});s.levelReport=reports}
function renderStats(){ $('#partyreorder').disabled=!idle()||s.done; $('#statsbody').innerHTML=s.members.map((_,i)=>{let m=shownMember(i);let values=[['HP',`${(displayVitals?.hp||s.hp)[i]}/${m.maxHP}`],['MP',`${(displayVitals?.mp||s.mp)[i]}/${m.maxMP}`],['STR',m.str],['AC',displayVitals?.ac?.[i]??effectiveAC(i)],['IQ',m.intelligence],['PIE',m.piety],['経験値',m.xp],['NEXT',m.level>=LEVEL_CAP?'上限':Math.max(0,m.xpTargets[m.level+1]-m.xp)]];return `<article class="statcard" tabindex="0" data-stat-member="${i}"><h3>${m.name||CLASSES[m.job??i].name} <small>Lv.${m.level} · ${i<3?'前衛':'後衛'}</small>${ailmentTags(i)}</h3><dl class="stat-metrics">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="stat-actions"><button data-stat-inventory="${i}" ${!idle()?'disabled':''}>アイテム</button>${[1,2].includes(m.job??i)?`<button data-stat-cast="${i}" ${s.enemy||logBusy()?'disabled':''}>呪文</button>`:''}</div></article>`}).join('')}
function showLevelReport(){if(!s.levelReport?.length)return;$('#levelreport').textContent=s.levelReport.join('\n');if(!$('#leveldialog').open)$('#leveldialog').showModal()}
function showTempleCarryReport(){if(!s.templeReport?.length){showLevelReport();return}const lines=[],normal=s.templeReport.filter(r=>r.status==='dead'||r.status==='ash'),lost=s.templeReport.filter(r=>r.status==='lost'),stone=s.templeReport.filter(r=>r.status==='stone');if(normal.length)lines.push(`${normal.map(r=>`${r.name}（${r.status==='dead'?'死亡':'灰'}）`).join('、')}を寺院に運んだ。寺院で蘇生できます。`);if(stone.length)lines.push(`${stone.map(r=>`${r.name}（石化）`).join('、')}を寺院に運んだ。寺院で石化を解除できます。`);for(const r of lost)lines.push(`${r.name}（ロスト）はパーティーから外れた。ロストは蘇生できません。`);$('#templecarrylist').textContent=lines.join('\n');$('#templecarrydialog').showModal()}
function canWeaponAttack(i){return !(s.ailments[i].fear>0)&&(i<3||equippedWeapon(i)?.range==='ranged')}
function itemDescription(w){return diceLabel(w)+(w.dice?' · '+(w.range==='ranged'?'遠距離':'近距離'):'')}
function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
function drawEnemies(){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat),height=Math.min(130,260/groups.length);return groups.map((g,row)=>{let y=62+row*height;let visible=g.units.filter(e=>!e.rewarded);return visible.map((e,col)=>{if(e.rewarded)return '';let width=Math.min(108,560/visible.length-8),x=320+(col-(visible.length-1)/2)*(width+8);return `<g data-enemy-uid="${e.uid}"><rect x="${x-width/2}" y="${y}" width="${width}" height="${height-9}" rx="6" fill="#20271f" stroke="#66725d"/><text x="${x}" y="${y+height*.65}" text-anchor="middle" fill="#dac595" font-size="52">${enemyDefinition(e.id).icon}</text><text x="${x}" y="${y+height-18}" text-anchor="middle" fill="#dac595" font-size="16">${e.sleep>0?'Zzz':''}</text></g>`}).join('')}).join('')}
function ensureProfile(){s.milwaSteps??=0;s.teppeki??=false;s.elevatorFloors??=[];s.elevatorFloors=[...new Set(s.elevatorFloors.filter(Number.isInteger))].sort((a,b)=>a-b);s.pendingElevator??=false;ensureLibrary();s.templeReport??=[];s.corpses??=[];s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=s.members.map(()=>freshAilments());s.ailments=s.ailments.map(normalizeAilments);for(const r of s.reserve||[])if(r.ailments)r.ailments=normalizeAilments(r.ailments);s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.hp[i]<=0&&s.area!=='town'?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows','dispelRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
function equippedWeapon(i){return weapon(s.inventory[i][s.equipped[i]])}
function diceLabel(w){if(w.kind==='medicine')return w.description;if(w.part)return `${{head:"頭",body:"胴体",feet:"足"}[w.part]} AC −${w.ac}`;return `${w.dice[0]}d${w.dice[1]}${w.dice[2]?'+'+w.dice[2]:''}`}
function idle(){return !s.pendingElevator&&!allyTargetPick&&!currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
function enterTown(){if(!idle())return;const carried=s.defeatPending?[]:s.members.filter(m=>['dead','ash','lost','stone'].includes(m.status)).map(m=>({id:m.id,name:m.name||CLASSES[m.job??0].name,status:m.status}));s.area='town';const levels=s.members.map((m,i)=>m.status==='ok'?i:-1).filter(i=>i>=0);levelUp(levels);s.hp=s.members.map((m,i)=>m.status==='ok'?m.maxHP:s.hp[i]);s.mp=s.members.map((m,i)=>m.status==='ok'?m.maxMP:s.mp[i]);s.templeReport=carried.map(({name,status})=>({name,status}));s.ailments=s.ailments.map(()=>freshAilments());if(carried.length)removeFromParty(carried.map(x=>x.id));s.light=false;s.milwaSteps=0;s.teppeki=false;s.watchful=false;s.dumapicUses=0;s.floodUses=0;s.ailments=s.ailments.map(()=>freshAilments());s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.pendingElevator=false;resetDungeon();autoReorderParty('town');render();showTempleCarryReport()}
function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
function defeat(){
 if(s.defeatPending||!s.members.length)return;
 clearBattleSilence();clearBattleFear();
 s.members.forEach((m,i)=>{if(m.status==='stone')return;if(m.status==='ok')m.status='dead';s.hp[i]=0});
 (s.corpses??=[]).push({id:crypto.randomUUID(),floor:s.floor,cell:s.pos,records:structuredClone(partyRecords()),gold:s.gold});
 s.gold=0;s.defeatPending=true;s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;
 // Keep the party visible until its queued damage/death snapshots have played.
 log('一行は全滅した。遺体は迷宮に残された。町で態勢を立て直そう。');save();
}
function finishDefeat(){
 if(!s.defeatPending)return;
 for(const key of PARTY_FIELDS)s[key]=[];
 delete s.defeatPending;s.done=false;s.light=false;s.milwaSteps=0;s.teppeki=false;s.watchful=false;s.dumapicUses=0;s.floodUses=0;s.levelReport=[];
 resetPartyCommands();resetDungeon();render();
}
function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop);if(!pool.length)return;let w=weightedLoot(pool),i=lootRecipient(w);if(i<0){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);recordLibraryItem(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);recordLibraryItem(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
// 寺院の費用・成功率は本作の暫定式。成功率は百分率で返す。
function templeCost(m){return m.status==='dead'?Math.min(100*m.level,25*m.level*m.level):m.status==='ash'?Math.min(250*m.level,60*m.level*m.level):m.status==='stone'?Math.min(150*m.level,40*m.level*m.level):0}
function templeChance(m){return m.status==='dead'?Math.max(50,Math.min(95,50+3*m.level)):m.status==='ash'?Math.max(40,Math.min(90,40+3*m.level)):m.status==='stone'?100:0}
function templeRaise(id){
 if(s.area!=='town'||!idle())return false;
 const r=trainingRoster().find(r=>r.members.id===id);
 if(!r||!['dead','ash','stone'].includes(r.members.status))return false;
 const m=r.members,cost=templeCost(m),petrified=m.status==='stone';
 if(s.gold<cost)return false;
 s.gold-=cost;
 const success=petrified||Math.random()*100<templeChance(m);
 m.status=success?'ok':m.status==='dead'?'ash':'lost';
 const i=s.members.findIndex(m=>m.id===id),hp=success?m.maxHP:0;
 if(success){if(i>=0)s.mp[i]=m.maxMP;else r.mp=m.maxMP;}
 if(petrified){const ailments=freshAilments();if(i>=0)s.ailments[i]=ailments;else r.ailments=ailments;}
 if(i>=0)s.hp[i]=hp;else r.hp=hp;
 const result={id,name:m.name||CLASSES[m.job??0].name,success,status:m.status,cost,petrified};
 render();renderTemple(result);
 return result;
}
function renderTemple(result=null){
 $('#templegold').textContent=`金貨 ${s.gold} G`;
 if(result)$('#templenotice').textContent=result.petrified?`${result.name}の石化が解けた。HPが全快した。`:result.success?`${result.name}は蘇生した。HP・MPが全快した。`:`${result.name}の蘇生に失敗した。${result.status==='ash'?'灰になった。':'ロストした。'}`;
 const list=$('#templemembers');list.replaceChildren();
 const records=trainingRoster().filter(r=>['dead','ash','stone'].includes(r.members.status));
 if(!records.length){const p=document.createElement('p');p.textContent='蘇生が必要な冒険者はいません。';list.append(p)}
 for(const r of records){
  const m=r.members,row=document.createElement('div'),info=document.createElement('div'),name=document.createElement('b'),detail=document.createElement('small'),price=document.createElement('span'),button=document.createElement('button');
  row.className='shopitem';row.setAttribute('data-recruit-id',m.id);
  if(r===records[0])button.setAttribute('data-key-default','');
  name.textContent=m.name||CLASSES[m.job??0].name;
  detail.textContent=`${s.members.some(p=>p.id===m.id)?'パーティ':'控え'} · Lv.${m.level} · ${{dead:'死亡',ash:'灰',stone:'石化'}[m.status]} · 成功率 ${templeChance(m)}%`;
  price.textContent=`${templeCost(m)} G`;button.textContent=m.status==='stone'?'石化解除':'蘇生';
  button.disabled=s.area!=='town'||!idle()||s.gold<templeCost(m);
  button.onclick=()=>templeRaise(m.id);
  info.append(name,detail);row.append(info,price,button);list.append(row);
 }
}
$('#templeopen').onclick=()=>{if(s.area!=='town'||!idle())return;$('#templenotice').textContent='';renderTemple();$('#templedialog').showModal()};
$('#templeclose').onclick=()=>$('#templedialog').close();
function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
function openInventory(i){if(!idle())return;inventoryMember=i;renderInventory();$('#inventorydialog').showModal()}
function target(turn=0){const d=((s.dir||0)+turn+4)%4;const dx=[0,1,0,-1][d],dy=[-1,0,1,0][d];const x=s.pos%size()+dx,y=(s.pos/size()|0)+dy;return x<0||x>=size()||y<0||y>=size()?-1:y*size()+x}
function move(action){if(allyTargetPick||currentChest()||s.area!=='dungeon'||s.pendingStairs||s.pendingElevator||logBusy()||s.done||s.enemy||s.pendingBoss)return;if(action==='left'||action==='right'){s.dir=(s.dir+(action==='left'?3:1))%4;render();return}let i=target(({back:2,strafeLeft:-1,strafeRight:1})[action]??0);if(i<0){log('外壁が行く手を塞いでいる。');render();return}mode='move';cell(i,action)}
function flag(i){if(allyTargetPick||currentChest()||s.area!=='dungeon'||s.pendingStairs||s.pendingElevator||logBusy()||s.done||s.enemy||s.pendingBoss||i<0)return;let c=s.cells[i];if(c.open){log('探索済みのマスには旗を立てられません。');render();return}c.flag=c.flag?false:(s.flagKind||'power');render()}
function face(i){if(i<0)return {fill:'#202722',label:'外壁',symbol:'',sub:''};let c=s.cells[i];return {color:c.flag?FLAG_COLORS[placedFlag(c)]:'#e8d2a2',fill:c.open?'#3b493c':c.safe?'#34413a':'#151f1b',label:c.open?'探索済み':c.safe?'安全確認済み':'未探索',symbol:c.open&&c.type==='elevator'?'E':c.open&&c.type==='boss'?'☠':c.open&&c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.flag?'⚑':c.open?(c.spent?'×':String(num(i))):c.disarmed?'✓':c.safe?'✓':'？',sub:c.disarmed?'罠を解除済み':c.spent?'作動済みの罠':c.flag?'旗あり':c.open?'周囲の罠の数':''}}
function scene(){let combat=!!visibleCombat(),f=face(target()),l=face(target(-1)),r=face(target(1));if(combat){for(const v of [f,l,r])if(/^\d+$/.test(v.symbol))v.symbol='';}let txt=(x,y,t,size=17,color='#d6d9c9')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="700">${t}</text>`;let panel=(v,x,y)=>txt(x,y+24,v.symbol,x===320&&hasLight()&&diagonalSight().some(i=>i>=0)?38:58,v.color);let battle=visibleCombat()?drawEnemies():s.pendingBoss?`<rect x="200" y="90" width="240" height="170" rx="8" fill="#231b18" stroke="#b58663"/>${txt(320,196,'☠',55)}`:'';$('#scene').innerHTML=`<svg viewBox="0 0 640 400" preserveAspectRatio="none" role="img" aria-label="正面：${f.label} ${f.symbol}、左：${l.label} ${l.symbol}、右：${r.label} ${r.symbol}"><path d="M0 0H640L440 100H200Z" fill="#121914"/><path d="M0 400H640L440 300H200Z" fill="#2d382d"/><path d="M0 0L200 100V300L0 400Z" fill="${l.fill}"/><path d="M640 0L440 100V300L640 400Z" fill="${r.fill}"/><path d="M200 100H440V300H200Z" fill="${f.fill}"/><g fill="none" stroke="#829079" stroke-width="1.5"><path d="M0 0L200 100H440L640 0M0 400L200 300H440L640 400M200 100V300M440 100V300"/></g>${panel(l,96,185,'左のマス')}${panel(f,320,185,'正面のマス')}${panel(r,544,185,'右のマス')}${combat?'':txt(320,378,String(num(s.pos)),36,'#ffdf9e')}${distantSight()}${battle}</svg>${visibleCombat()?`<div class="scene-enemies" aria-label="敵の列">${enemyGroups(visibleCombat()).filter(g=>g.units.some(e=>!e.rewarded)).map(g=>`<div>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</div>`).join('')}</div>`:''}${encounterNotice?`<div class="encounter-notice" role="status">${encounterNotice}</div>`:''}`}
function render(){let focusedAllyTarget=document.activeElement?.dataset?.allyTarget;ensureProfile();renderElevatorDialogs();$('#clearresult').hidden=s.area!=='dungeon'||!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('#cleartown').disabled=!idle();$('#clearchestnotice').hidden=!currentChest();$('#clearedmark').hidden=!s.cleared;$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();if(escapeMapHold&&!logBusy())escapeMapHold=false;const mapCombat=!!visibleCombat()||escapeMapHold;if(mapCombat&&$('#mapdialog').open)$('#mapdialog').close();$('#maptoggle').hidden=s.area!=='dungeon'||mapCombat;if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic&&s.guardianKilledThisRun?' / 秘宝 ✦':''}`;$('#party').innerHTML=(displayVitals?.members||s.members).map((m,i)=>{let n=m.name||CLASSES[m.job??i].name;return `${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`}).join('');const corpseCells=new Set(s.corpses.filter(c=>c.floor===s.floor).map(c=>c.cell));$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${corpseCells.has(i)?'遺体 ':''}${c.open&&c.type==='elevator'?'昇降機 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${corpseCells.has(i)?'🦴':s.pos===i?num(i):c.open?(c.type==='elevator'?'E':c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').textContent=s.pendingBoss?'戦う':'はい';$('#bossno').textContent=s.pendingBoss?'戻る':'いいえ';$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div>`;renderCommandEntry()}$('#frontflag').disabled=!!allyTargetPick||!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||s.pendingElevator||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!allyTargetPick||!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||s.pendingElevator||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();$('#statsopen').disabled=!!allyTargetPick;$('#maptoggle').disabled=!!allyTargetPick;renderAllyTargetPick(focusedAllyTarget);scene()}
$('#statsopen').onclick=e=>{if(allyTargetPick){if(e)partyTargetEvent(e);return}renderStats();$('#statsdialog').showModal()};$('#party').onclick=$('#statsopen').onclick;$('#party').onkeydown=e=>{if(globalThis.KeyNav||e.ctrlKey||e.altKey||e.metaKey)return;if(partyTargetEvent(e))return;if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#statsopen').onclick()}};$('#statsclose').onclick=()=>$('#statsdialog').close();$('#statsbody').onclick=e=>{let b=e.target.closest('[data-stat-inventory]');if(b)openInventory(+b.dataset.statInventory);let cast=e.target.closest('[data-stat-cast]');if(cast){$('#statsdialog').close();openMagic(+cast.dataset.statCast)}};$('#catalogclose').onclick=()=>$('#catalogdialog').close();$('#maptoggle').onclick=()=>{if(visibleCombat()||escapeMapHold)return;$('#mapdialogbody').append($('#mappanel'));$('#mapdialog').showModal()};$('#mapclose').onclick=()=>$('#mapdialog').close();$('#mapdialog').addEventListener('close',()=>$('#mapdock').append($('#mappanel')));
$('#bossyes').onclick=()=>s.pendingStairs?answerStairs(true):answerBoss(true);$('#bossno').onclick=()=>s.pendingStairs?answerStairs(false):answerBoss(false);$('#board').onclick=e=>{let b=e.target.closest('[data-i]');if(b)flag(+b.dataset.i)};document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>move(b.dataset.action));$('#frontflag').onclick=()=>flag(target());
$('#party').onchange=e=>{if(e.target.matches('[data-attack-row]')&&!logBusy()&&s.enemy){s.attackRows[+e.target.dataset.attackRow]=e.target.value;render();return}if(!e.target.matches('input[data-person]')||logBusy()||!s.enemy)return;s.commands[+e.target.dataset.person]=e.target.value;render()};
$('#cleartown').onclick=enterTown;$('#backtown').onclick=enterTown;$('#entrance').onclick=enterDungeon;$('#blacksmith').onclick=()=>{if(!s.members.length)return;renderShop();$('#shopdialog').showModal()};$('#shopclose').onclick=()=>$('#shopdialog').close();$('#inventoryclose').onclick=()=>$('#inventorydialog').close();$('#shopmember').onchange=()=>{renderShop();$('#shopnotice').textContent=''};$('#shopitems').onclick=e=>{let b=e.target.closest('[data-buy]');if(b)buy(b.dataset.buy,+$('#shopmember').value)};$('#shopinventory').onclick=()=>openInventory(+$('#shopmember').value);$('#inventoryslots').onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.useMedicine!==undefined)openMedicine(inventoryMember,+b.dataset.useMedicine);if(b.dataset.equip!==undefined)equip(inventoryMember,+b.dataset.equip);if(b.dataset.sell!==undefined)sell(inventoryMember,+b.dataset.sell)};
try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();s.guardiansDefeated??=[];s.guardiansDefeated=[...new Set(s.guardiansDefeated)].sort((a,b)=>a-b);migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}s.guardianKilledThisRun??=!!s.relic;if(s.floor<MAX_FLOOR&&(s.guardiansDefeated||[]).includes(s.floor)&&s.cells[s.boss].type==='boss'){s.cells[s.boss].type='down';s.relic=true}if(s.cells[s.start].type!=='boss'&&s.cells[s.start].type!=='down')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}if(s.area==='town'&&!s.defeatPending){const carried=s.members.filter(m=>m.status!=='ok').map(m=>({id:m.id,name:m.name||CLASSES[m.job??0].name,status:m.status}));if(carried.length){s.templeReport=carried.map(({name,status})=>({name,status}));removeFromParty(carried.map(x=>x.id));s.levelReport=[];s.templeReportFromLoad=true;save()}autoReorderParty('load')}render();if(s.area==='town'&&s.templeReport?.length)showTempleCarryReport()}
if(s.defeatPending)finishDefeat();

for(const id of ['mapdialog','statsdialog','leveldialog']){const d=$('#'+id);d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()})}

function isEquipped(i,slot){return s.equipped[i]===slot||Object.values(s.armor[i]).includes(slot)}
function effectiveAC(i){return memberClass(i).ac-Object.values(s.armor[i]).reduce((n,k)=>n+(weapon(s.inventory[i][k])?.ac||0),0)-Math.max(s.teppeki?2:0,s.enemy?.partyAC||0)}
$('#resetopen').onclick=()=>$('#resetdialog').showModal();$('#resetcancel').onclick=()=>$('#resetdialog').close();$('#resetconfirm').onclick=()=>{s=null;fresh();s.area='town';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);$('#resetdialog').close();render()};

function visibleAilments(i){let a=(displayVitals?.ailments||s.ailments)[i]||{},hp=(displayVitals?.hp||s.hp)[i],status=shownMember(i).status,label={dead:'死亡',ash:'灰',lost:'ロスト',stone:'石化'}[status];return label?[[status,label]]:hp<=0?[['dead','死亡']]:[[a.poison,'poison','毒'],[a.paralysis>0,'paralysis','麻痺'],[a.sleep>0,'sleep','睡眠'],[a.silence>0,'silence','沈黙'],[a.fear>0,'fear','恐怖']].filter(([active])=>active).map(([,kind,label])=>[kind,label])}
function ailmentLabel(i){return visibleAilments(i).map(([,label])=>label).join('・')||'正常'}
function ailmentTags(i){return visibleAilments(i).map(([kind,label])=>`<span class="ailment-tag ailment-${kind}">${label}</span>`).join('')}
function afflict(i,type){
 if(!activeMember(i))return;
 if(!['poison','paralysis','stone','silence','fear'].includes(type)){console.warn('Unknown ailment type:',type);return}
 displayVitals??=snapshotVitals();
 if(type==='stone'){s.members[i].status='stone';s.ailments[i]=freshAilments();log(`${NAMES[i]}は石になった。`);return}
 if(type==='fear'){s.ailments[i].fear=3;log(`${NAMES[i]}は恐怖に怯えた。`);return}
 if(type==='silence'){s.ailments[i].silence=3;log(`${NAMES[i]}は沈黙した。`);return}
 if(type==='poison')s.ailments[i].poison=true;else if(type==='paralysis')s.ailments[i].paralysis=4;
 if(type==='poison'||type==='paralysis')log(`${NAMES[i]}は${type==='poison'?'毒':'麻痺'}に侵された。`);
}
// Silence counts completed combat turns, independently of poison/paralysis at turn start.
function tickBattleSilence(){
 if(!s.enemy)return;
 for(let i=0;i<s.members.length;i++)if(s.ailments[i].silence>0){
  s.ailments[i].silence--;
  if(s.ailments[i].silence===0)log(`${NAMES[i]}の沈黙が解けた。`);
 }
}
function clearBattleSilence(){for(const a of s.ailments)a.silence=0}
// Fear follows the same completed-turn boundaries as silence.
function tickBattleFear(){
 if(!s.enemy)return;
 for(let i=0;i<s.members.length;i++)if(s.ailments[i].fear>0){
  s.ailments[i].fear--;
  if(s.ailments[i].fear===0)log(`${NAMES[i]}は落ち着きを取り戻した。`);
 }
}
function clearBattleFear(){for(const a of s.ailments)a.fear=0}
function tickAilments(logPoison=true){
 for(const id of s.members.map(m=>m.id)){
  const i=s.members.findIndex(m=>m.id===id),a=s.ailments[i];
  if(!activeMember(i))continue;
  if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}
  if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);markDeaths();if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}
  if(!activeMembers().length){defeat();return}
 }
 markDeaths();if(!activeMembers().length)defeat();else autoReorderParty('ailment-tick');
}
function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=activeMembers(),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);markDeaths();log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(!activeMembers().length)defeat();else autoReorderParty('chest-trap')}
function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),i=lootRecipient(w);if(i>=0){s.inventory[i].push(w.id);recordLibraryItem(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else log(`${w.name}を見つけたが、アイテムがいっぱいだ。`)}dropMedicine()}
function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
$('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
$('#chestopen').onclick=()=>openChest(false);

function rememberFloor(){s.floors??={};s.floors[s.floor]={floor:s.floor,size:s.size,cells:structuredClone(s.cells),start:s.start,boss:s.boss,relic:s.relic,guardianKilledThisRun:s.guardianKilledThisRun};}
function placeElevator(){if(!s.elevatorFloors.includes(s.floor))return;const eligible=i=>{const c=s.cells[i];return c&&c.type===''&&!c.trap&&!c.chest&&!s.corpses.some(x=>x.floor===s.floor&&x.cell===i)&&i!==s.pos&&i!==s.start&&i!==s.boss};let pool=s.cells.map((_,i)=>i).filter(i=>eligible(i));if(s.floor===1)pool=pool.filter(i=>Math.max(Math.abs(i%size()-s.start%size()),Math.abs((i/size()|0)-(s.start/size()|0)))<=2);if(!pool.length)return;const i=pool[Math.random()*pool.length|0];s.cells[i].type='elevator';s.cells[i].open=false;}
function checkElevatorUnlock(){if(s.elevatorFloors.includes(s.floor)||!s.cells.every(c=>c.trap||c.open))return;s.elevatorFloors.push(s.floor);s.elevatorFloors.sort((a,b)=>a-b);placeElevator();const msg=s.floor===1?'昇降機が使えるようになった！ 昇降機（E）から解放した階へ移動できます。':`地下${s.floor}階に昇降機が止まるようになった。`;log(msg);s.elevatorNotice=msg;}
function travelElevator(n){if(!s.elevatorFloors.includes(n)||n===s.floor)return false;s.milwaSteps=0;rememberFloor();const floors=s.floors,scan=s.scan,saved=floors[n];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;}else{fresh(n);s.floors=floors;s.scan=scan;}s.pos=s.cells.findIndex(c=>c.type==='elevator');if(s.pos<0){placeElevator();s.pos=s.cells.findIndex(c=>c.type==='elevator')}s.cells[s.pos].open=true;s.clearNotice=false;s.pendingStairs=false;s.pendingElevator=false;render();return true;}
function travelFloor(next,fromTown=false){if(!Number.isInteger(next)||next<1||next>MAX_FLOOR)return false;let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||(!(s.relic||((s.guardiansDefeated||[]).includes(s.floor)&&s.floor<MAX_FLOOR)))||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}if(next!==previous)s.milwaSteps=0;rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.clearNotice=false;s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}

function abandonChest(){if(logBusy()||s.enemy||!currentChest())return;delete s.cells[s.pos].chest;log('宝箱を放棄した。');render()}
$('#chestabandon').onclick=abandonChest;

function enemyTurn(cmds){
 // Guard/flee commands belong to people even when a previous enemy moved them.
 const commandsById=new Map(s.members.map((m,i)=>[m.id,cmds[i]]));
 for(const e of s.enemy.units.filter(e=>e.hp>0)){
  if(!activeMembers().length)break;
  const currentCommands=s.members.map(m=>commandsById.get(m.id));
  if(e.sleep>0){e.sleep--;log(`${enemyDisplay(e)}は眠っている。`)}
  else if(!monsterAction(e,currentCommands)){
   const d=enemyDefinition(e.id);
   for(let n=0;n<d.swings;n++){
    const alive=activeMembers(),front=alive.filter(i=>i<3),pool=d.rear||!front.length?alive:front;
    if(!pool.length)break;
    const i=pool[Math.random()*pool.length|0];
    if(!hits(d.hit+levelHitBonus(e,i),effectiveAC(i))){log(`${NAMES[i]}は${enemyDisplay(e)}の攻撃をかわした。`);continue}
    monsterHurt(i,dice(...d.attack).value,currentCommands,enemyDisplay(e));if(s.hp[i]>0)monsterOnHit(e,i);
   }
  }
  if(activeMembers().length>0)autoReorderParty('enemy-action');
 }
 if(!activeMembers().length){defeat();return}
 if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle();
}

function monsterLevel(e){return enemyDefinition(e.id).level}
// Relative levels preserve the floor-tuned CSV hit values at the intended party level.
function levelHitBonus(e,i){return Math.max(-3,Math.min(3,Math.trunc((monsterLevel(e)-s.members[i].level)/3)))||0}
function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(activeMember(i)&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
var escapeMapHold=false;
function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals=snapshotVitals();tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}clearBattleSilence();clearBattleFear();s.enemy=null;s.pos=to;s.previousPos=from;autoReorderParty('escape');escapeMapHold=true;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}tickBattleSilence();tickBattleFear();render()}

magicUI();medicineUI();flagUI();partyUI();libraryUI();

function coloredLog(text){
 const foes=[...ENEMIES.flatMap(e=>[e.name,e.unknown]),'毒スライム','ゴーストナイト','地獄の犬','オーク戦士','ゴヅメヅ'];
 const spells=MAGIC.map(x=>x.name);
 const flagNames=Object.values(FLAG_NAMES);const names=[...foes,...NAMES,...spells,...flagNames].filter(Boolean).sort((a,b)=>b.length-a.length);
 const escape=t=>t.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pattern=new RegExp(names.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')+'|\\d+(?:\\.\\d+)?(?:ダメージ|回復)','g');
 let result='',last=0;
 for(const match of text.matchAll(pattern)){
  const word=match[0],at=match.index;
  const kind=flagNames.includes(word)?'flag-'+Object.keys(FLAG_NAMES).find(k=>FLAG_NAMES[k]===word):foes.includes(word)?'enemy':NAMES.includes(word)?'ally':spells.includes(word)?'spell':word.endsWith('回復')?'heal':'damage';
  result+=escape(text.slice(last,at))+'<span class="log-'+kind+'">'+escape(word)+'</span>';last=at+word.length;
 }
 return result+escape(text.slice(last));
}
inventoryPartyUI();

$('#levelclose').onclick=()=>$('#leveldialog').close();
$('#templecarryok').onclick=()=>$('#templecarrydialog').close();$('#templecarrydialog').addEventListener('close',()=>{s.templeReport=[];save();if(s.templeReportFromLoad){delete s.templeReportFromLoad;save()}else showLevelReport()});

function renderElevatorDialogs(){if(s.area!=='dungeon'){s.pendingElevator=false;s.elevatorNotice=null;return}if(s.elevatorNotice&&!logBusy()&&!s.enemy&&!visibleCombat()&&!s.done&&!$('#elevatordialog').open){$('#elevatormessage').textContent=s.elevatorNotice;s.elevatorNotice=null;$('#elevatordialog').showModal()}if(s.pendingElevator&&!$('#elevatorpick').open&&!$('#elevatordialog').open){renderElevatorPick();$('#elevatorpick').showModal()}}
function renderElevatorPick(){const root=$('#elevatorchoices');root.replaceChildren();for(const n of s.elevatorFloors.filter(n=>n!==s.floor)){const b=document.createElement('button');b.textContent=`地下${n}階`;b.setAttribute('data-elevator-floor',n);if(!root.children.length)b.setAttribute('data-key-default','');b.onclick=()=>{ $('#elevatorpick').close();travelElevator(n)};root.append(b)}if(!root.children.length){const p=document.createElement('p');p.textContent='移動できる階はありません。';root.append(p)} }
$('#elevatorok').onclick=()=>$('#elevatordialog').close();$('#elevatorcancel').onclick=()=>$('#elevatorpick').close();$('#elevatorpick').addEventListener('click',e=>{if(e.target===$('#elevatorpick'))$('#elevatorpick').close()});$('#elevatorpick').addEventListener('close',()=>{if(s.pendingElevator){s.pendingElevator=false;render()}});
