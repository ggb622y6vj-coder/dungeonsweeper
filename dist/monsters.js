// Shared by enemy drain and 抵抗無効化; equipment and learned spells are retained.
function lowerMemberLevel(i){if(s.members[i].level<=1)return false;let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);return true}
function monsterFormation(boss){
 const floor=Math.min(Math.max(...ENEMIES.flatMap(d=>d.floors)),s.floor||1);
 const pool=ENEMIES.filter(d=>d.floors.includes(floor)&&!d.boss);
 if(boss){
  const guardian=ENEMIES.find(d=>d.floors.includes(floor)&&d.boss);
  return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[])];
 }
 const guardian=(s.guardiansDefeated||[]).includes(s.floor)?ENEMIES.find(d=>d.floors.includes(floor)&&d.boss):null;
 const encounterPool=guardian?[...pool,guardian]:pool;
 const formation=Array.from({length:1+(Math.random()*3|0)},()=>encounterPool[Math.random()*encounterPool.length|0].id);
 if(guardian){
  const first=formation.indexOf(guardian.id);
  for(let row=first+1;row<formation.length;row++){
   if(formation[row]===guardian.id)formation[row]=pool[Math.random()*pool.length|0].id;
  }
 }
 return formation;
}
function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(`${name}は${NAMES[i]}に${n}ダメージ。`);if(n>0)sacrificeAfterDamage(i)}
const ENEMY_SPELL_IDS=new Set([
 'halito','katino','dilto','mahalito','morlis','dalto','mamahalito','madalto','mamorlis','tiltowait',
 'dios','kalki','montino','matu','dialko','dial','latumofis','dialma','lorto','madi','malikto'
]);
const ENEMY_SPELLS=MAGIC.filter(x=>ENEMY_SPELL_IDS.has(x.id)&&['battle','both'].includes(x.where));
const ENEMY_DAMAGE_DICE={dalto:[5,6,0],madalto:[6,8,0],tiltowait:[8,8,0]};
const ENEMY_CURE_STATUSES=['sleep','silence','paralysis','fear'];

function groupSpellLevels(e){
 const groups=s.enemy.spellLevels??={};
 const key=`row/${rowKey(e)}`,d=enemyDefinition(e.id);
 // Existing zeroes belong to this encounter, including newly summoned units.
 const levels=groups[key]??={};
 levels.mage??=d.mageSpellLevel;
 levels.priest??=d.priestSpellLevel;
 return levels;
}
function initEnemySpellState(){
 for(const e of s.enemy.units){
  e.maxHP??=e.hp;
  groupSpellLevels(e);
 }
}
function livingMonster(e){return e.hp>0&&!e.escaped&&!e.rewarded}
function needsEnemySpell(e,effect){
 const hurt=e.hp<(e.maxHP??e.hp);
 if(effect==='heal')return hurt;
 if(effect==='antidote')return !!e.poison;
 const impaired=ENEMY_CURE_STATUSES.some(status=>e[status]);
 return effect==='restore'?(hurt||impaired||e.poison):impaired;
}
function enemySpellCandidates(e){
 const levels=groupSpellLevels(e),party=activeMembers(),allies=s.enemy.units.filter(livingMonster);
 return ENEMY_SPELLS.filter(x=>{
  if(x.level>(x.job===1?levels.mage:levels.priest))return false;
  if(x.target==='ally')return allies.some(unit=>needsEnemySpell(unit,x.effect));
  if(x.effect==='buff')return x.value>(s.enemy.monsterAC||0);
  if(x.effect==='debuff')return x.value>(s.enemy.partyACPenalty||0);
  if(x.effect==='sleep'||x.effect==='silence')return party.some(i=>!s.ailments[i][x.effect]);
  return true;
 });
}
function randomSpellChoice(items){
 return items.length>1?items[Math.floor(Math.random()*items.length)]:items[0];
}
function chooseEnemySpell(e,unavailable){
 const candidates=enemySpellCandidates(e).filter(x=>!unavailable?.has(x.id));
 const schools=[1,2].map(job=>candidates.filter(x=>x.job===job)).filter(group=>group.length);
 const school=randomSpellChoice(schools);
 if(!school)return null;
 const highest=Math.max(...school.map(x=>x.level)),lower=school.filter(x=>x.level<highest);
 return randomSpellChoice(lower.length&&Math.random()>=.6?lower:school.filter(x=>x.level===highest));
}
function enemySpellTargets(x){
 if(x.target==='ally'||x.target==='party'){
  const allies=s.enemy.units.filter(livingMonster);
  if(x.target==='party')return allies;
  const eligible=allies.filter(e=>needsEnemySpell(e,x.effect));
  if(x.effect==='heal'||x.effect==='restore'){
   eligible.sort((a,b)=>a.hp/(a.maxHP??a.hp)-b.hp/(b.maxHP??b.hp)
    ||((b.maxHP??b.hp)-b.hp)-((a.maxHP??a.hp)-a.hp));
  }
  return eligible.slice(0,1);
 }
 const alive=activeMembers();
 if(x.effect==='debuff'||x.target==='all')return alive;
 if(x.target==='enemy')return alive.length?[randomSpellChoice(alive)]:[];
 const rows=[alive.filter(i=>i<3),alive.filter(i=>i>=3)].filter(row=>row.length);
 return randomSpellChoice(rows)||[];
}
function applyEnemySpell(e,x,targets,cmds,name){
 if(x.effect==='buff'){
  s.enemy.monsterAC=Math.max(s.enemy.monsterAC||0,x.value);
  log('敵の守りが強まった。');return;
 }
 if(x.effect==='debuff'){
  s.enemy.partyACPenalty=Math.max(s.enemy.partyACPenalty||0,x.value);
  log('パーティーの守りが弱まった。');return;
 }
 if(x.target==='ally'){
  const unit=targets[0],targetName=enemyDisplay(unit),maxHP=unit.maxHP??unit.hp;
  if(x.effect==='heal'||x.effect==='restore'){
   unit.hp=x.effect==='restore'?maxHP:Math.min(maxHP,unit.hp+dice(...x.value).value);
  }
  if(x.effect==='restore'||x.effect==='cure'){
   for(const status of ENEMY_CURE_STATUSES)delete unit[status];
  }
  if(x.effect==='restore'||x.effect==='antidote')delete unit.poison;
  log(x.effect==='cure'||x.effect==='antidote'?`${targetName}の状態異常が治った。`:`${targetName}は回復した。`);
  return;
 }
 for(const i of targets){
  if(x.effect==='damage')monsterHurt(i,dice(...(ENEMY_DAMAGE_DICE[x.id]||x.value)).value,cmds,name);
  else if(x.effect==='sleep'){
   if(!sacrificeBeforeAilment(i,'sleep')){
    leaveHiding(i);s.ailments[i].sleep=Math.max(s.ailments[i].sleep||0,2);log(`${NAMES[i]}は眠った。`);
   }
  }else if(x.effect==='silence'){
   const chance=Math.max(5,Math.min(94,50+5*(monsterLevel(e)-s.members[i].level)));
   if(Math.random()*100<chance)afflict(i,'silence');else log(`${NAMES[i]}には効かなかった。`);
  }
 }
}
function castEnemySpell(e,cmds,name){
 // Resolve at the actor's turn, against the surviving targets and current AC.
 const unavailable=new Set();
 while(true){
  const x=chooseEnemySpell(e,unavailable);
  if(!x)return false;
  const targets=enemySpellTargets(x);
  if(!targets.length){unavailable.add(x.id);continue}
  const size=s.enemy.units.filter(unit=>rowKey(unit)===rowKey(e)&&livingMonster(unit)).length;
  if(isAntimagicZone())log('反呪文の結界に打ち消された！');
  else{
   log(`${name}は${x.name}を唱えた。`);
   applyEnemySpell(e,x,targets,cmds,name);
  }
  if(Math.random()<1/(size+2)){
   const levels=groupSpellLevels(e),key=x.job===1?'mage':'priest';
   levels[key]=Math.max(0,...ENEMY_SPELLS.filter(sp=>sp.job===x.job&&sp.level<levels[key]).map(sp=>sp.level));
   log(`${name}の魔力が衰えた。`);
  }
  return true;
 }
}
function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(activeMember(i)){monsterHurt(i,dice(...d.breath.dice).value,cmds,name);for(const a of d.breath.statuses||[])if(activeMember(i)&&Math.random()<a.chance)afflict(i,a.type)}return true}if(r<d.spell&&!e.silence)return castEnemySpell(e,cmds,name);
 return false;
}
function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses){if(!activeMember(i))break;if(Math.random()<a.chance)afflict(i,a.type)}if(!activeMember(i))return;if(Math.random()<d.death){s.hp[i]=0;markDeaths();log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){lowerMemberLevel(i);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n)&&!boundItem(s.inventory[i][n]));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=visibleItem(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}

// A completed battle pays only for defeated enemies, never escaped enemies.
function finishMonsterBattle(){
 const combat=s.enemy,defeated=combat.units.filter(e=>e.rewarded&&!e.escaped);
 combat.hiddenIds=[];clearBattleSilence();clearBattleFear();
 recordLibraryVictory(combat);
 if(defeated.length)victoryWeaponEffects(combat);
 awardVictory(combat);
 if(combat.chestBattle&&defeated.length){
  // A battle saved before 108 has no snapshot ID; its original first unit remains in units.
  const monsterId=combat.lootMonsterId??combat.units[0].id,items=rollChestItems(monsterId,s.floor);
  s.cells[s.pos].chest={gold:combat.lootGold,opened:false,rewardVersion:1,lootGroup:LOOT_TABLES.monsterGroups[monsterId],items};
  fixChestTrap(s.cells[s.pos].chest);log('宝箱が現れた。開けるか、放棄するか。');
 }
 s.enemy=null;
 if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){
  s.relic=true;s.guardianKilledThisRun=true;
  s.guardiansDefeated=[...new Set([...(s.guardiansDefeated||[]),s.floor])].sort((a,b)=>a-b);
  if(s.floor===MAX_FLOOR&&defeated.some(e=>e.id==='labyrinthlord')){
   s.cells[s.boss].type='';s.pendingStairs=false;s.cleared=true;s.clearNotice=true;
   log('迷宮の主は倒れた。迷宮に静寂が戻った……');
  }else if(s.floor<MAX_FLOOR){s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
 }
 else if(!defeated.length)log('敵はいなくなった。');
 autoReorderParty('battle-end');
}
function monsterResists(e,effect){return effect==='poison'&&enemyDefinition(e.id).resistance.includes('毒無効')}
function afflictMonster(e,effect){if(monsterResists(e,effect))return false;e[effect]=true;return true}

// The undead-level median is 12; this keeps the formula centered on the intended party level range.
const DISPEL_LEVEL_OFFSET=12;
function dispelChance(casterLevel,targetLevel){return Math.max(.05,Math.min(.95,.5+.05*casterLevel-.10*targetLevel+.05*DISPEL_LEVEL_OFFSET))}
function livingUndeadGroups(combat=s.enemy){return enemyGroups(combat).filter(g=>g.units.some(e=>e.hp>0&&enemyDefinition(e.id).race==='不死'))}
function dispelUndead(i){
 log(`${NAMES[i]}は呪いを解こうとした。`);
 let groups=livingUndeadGroups(),key=s.dispelRows?.[i],group=groups.find(g=>String(g.key)===String(key))||groups[0];
 let targets=group?group.units.filter(e=>e.hp>0&&enemyDefinition(e.id).race==='不死'):[];
 if(!targets.length){log('効果はなかった。');return}
 for(const e of targets){let chance=dispelChance(s.members[i].level,monsterLevel(e));if(Math.random()<chance){let name=enemyDisplay(e);e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は消え去った。`)}else log(`${enemyDisplay(e)}には効かなかった。`)}
}
