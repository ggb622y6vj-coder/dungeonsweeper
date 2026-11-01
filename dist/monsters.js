function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}

// A completed battle pays only for defeated enemies, never escaped enemies.
function finishMonsterBattle(){
 const combat=s.enemy,defeated=combat.units.filter(e=>e.rewarded&&!e.escaped);
 awardVictory(combat);
 if(combat.chestBattle&&defeated.length){s.cells[s.pos].chest={gold:combat.lootGold,opened:false};fixChestTrap(s.cells[s.pos].chest);log('宝箱が現れた。開けるか、放棄するか。')}
 s.enemy=null;
 if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){s.relic=true;s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
 else if(!defeated.length)log('敵はいなくなった。');
}
function migrateMonsterBattle(){
 if(!s.enemy||s.enemy.dataVersion===1)return;
 const mapping=s.floor>=3?{slime:'acidslime',skeleton:'archer',wolf:'blackwolf',goblin:'shaman',guardian:'watcher'}:s.floor===2?{slime:'poisonslime',skeleton:'ghostknight',wolf:'wolf',goblin:'orc',guardian:'general'}:{};
 for(const e of s.enemy.units){e.row??=e.id;e.id=mapping[e.id]||e.id;if(!ENEMIES.some(d=>d.id===e.id))e.id='slime';const d=enemyDefinition(e.id);e.hp=Math.min(e.hp,d.hp[0]*d.hp[1]+d.hp[2]);}
 s.enemy.dataVersion=1;
}
function monsterResists(e,effect){return effect==='poison'&&enemyDefinition(e.id).resistance.includes('毒無効')}
function afflictMonster(e,effect){if(monsterResists(e,effect))return false;e[effect]=true;return true}

// Dispel checks every living undead separately. The exact original formula is undocumented here.
function dispelUndead(i){
 log(`${NAMES[i]}は呪いを解こうとした。`);
 let targets=s.enemy.units.filter(e=>e.hp>0&&enemyDefinition(e.id).race==='不死');
 if(!targets.length){log('効果はなかった。');return}
 for(const e of targets){let chance=Math.max(.05,Math.min(.95,.5+.05*(s.members[i].level-monsterLevel(e))));if(Math.random()<chance){let name=enemyDisplay(e);e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は消え去った。`)}else log(`${enemyDisplay(e)}には効かなかった。`)}
}
