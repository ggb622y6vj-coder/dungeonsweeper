// Shared by enemy drain and 抵抗無効化; equipment and learned spells are retained.
function lowerMemberLevel(i){if(s.members[i].level<=1)return false;let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);return true}
function monsterFormation(boss){let floor=Math.min(Math.max(...ENEMIES.flatMap(d=>d.floors)),s.floor||1),pool=ENEMIES.filter(d=>d.floors.includes(floor)&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floors.includes(floor)&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(`${name}は${NAMES[i]}に${n}ダメージ。`);if(n>0)sacrificeAfterDamage(i)}
function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(activeMember(i)){monsterHurt(i,dice(...d.breath.dice).value,cmds,name);for(const a of d.breath.statuses||[])if(activeMember(i)&&Math.random()<a.chance)afflict(i,a.type)}return true}if((r-=d.spell)<0){if(e.silence)return false;let alive=activeMembers();if(alive.length){let sp=d.spellInfo||{id:'halito',name:'ハリト',target:'one',dice:[1,8,0]};log(`${name}は${magic(sp.id)?.name||sp.name}を唱えた。`);for(let i of sp.target==='all'?alive:[alive[Math.random()*alive.length|0]]){if(sp.effect==='sleep'){if(!sacrificeBeforeAilment(i,'sleep')){s.ailments[i].sleep=Math.max(s.ailments[i].sleep||0,2);log(`${NAMES[i]}は眠った。`)}}else if(sp.effect==='silence'){let chance=Math.max(5,Math.min(94,50+5*(d.level-s.members[i].level)));if(Math.random()*100<chance)afflict(i,'silence');else log(`${NAMES[i]}には効かなかった。`)}else monsterHurt(i,dice(...sp.dice).value,cmds,name)}}return true}return false}
function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses){if(!activeMember(i))break;if(Math.random()<a.chance)afflict(i,a.type)}if(!activeMember(i))return;if(Math.random()<d.death){s.hp[i]=0;markDeaths();log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){lowerMemberLevel(i);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}

// A completed battle pays only for defeated enemies, never escaped enemies.
function finishMonsterBattle(){
 const combat=s.enemy,defeated=combat.units.filter(e=>e.rewarded&&!e.escaped);
 clearBattleSilence();clearBattleFear();
 recordLibraryVictory(combat);
 if(defeated.length)victoryWeaponEffects(combat);
 awardVictory(combat);
 if(combat.chestBattle&&defeated.length){s.cells[s.pos].chest={gold:combat.lootGold,opened:false};fixChestTrap(s.cells[s.pos].chest);log('宝箱が現れた。開けるか、放棄するか。')}
 s.enemy=null;
 if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){
  s.relic=true;s.guardianKilledThisRun=true;
  if(s.floor<MAX_FLOOR){s.guardiansDefeated=[...new Set([...(s.guardiansDefeated||[]),s.floor])].sort((a,b)=>a-b)}
  if(s.floor===MAX_FLOOR&&defeated.some(e=>e.id==='labyrinthlord')){
   s.cells[s.boss].type='';s.pendingStairs=false;s.cleared=true;s.clearNotice=true;
   log('迷宮の主は倒れた。迷宮に静寂が戻った……');
  }else if(s.floor<MAX_FLOOR){s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
 }
 else if(!defeated.length)log('敵はいなくなった。');
 autoReorderParty('battle-end');
}
function migrateMonsterBattle(){
 if(!s.enemy||s.enemy.dataVersion===1)return;
 const mapping=s.floor>=3?{slime:'acidslime',skeleton:'archer',wolf:'blackwolf',goblin:'shaman',guardian:'watcher'}:s.floor===2?{slime:'poisonslime',skeleton:'ghostknight',wolf:'wolf',goblin:'orc',guardian:'general'}:{};
 for(const e of s.enemy.units){e.row??=e.id;e.id=mapping[e.id]||e.id;if(!ENEMIES.some(d=>d.id===e.id))e.id='slime';const d=enemyDefinition(e.id);e.hp=Math.min(e.hp,d.hp[0]*d.hp[1]+d.hp[2]);}
 s.enemy.dataVersion=1;
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
