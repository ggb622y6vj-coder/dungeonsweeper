const FLOOR_TRAPS=[{id:'needle',name:'針',weight:25},{id:'blast',name:'爆発',weight:25},{id:'poison',name:'毒霧',weight:20},{id:'paralysis',name:'麻痺の針',weight:15},{id:'pitfall',name:'落とし穴',weight:5},{id:'teleport',name:'転移',weight:10}];
function descendPitfall(){if(s.floor>=MAX_FLOOR)return false;let next=s.floor+1;s.milwaSteps=0;const generated=enterFloor(next,{keepLog:true});if(!generated)log(`地下${next}階に到着した。`);let candidates=s.cells.map((c,i)=>!c.type&&!c.trap&&!c.flag&&!c.chest?i:-1).filter(i=>i>=0);let destination=candidates.length?candidates[Math.random()*candidates.length|0]:s.start;s.previousPos=destination;s.pos=destination;s.cells[s.pos].open=true;if(generated&&destination!==s.start)s.cells[s.start].open=false;s.pendingStairs=false;s.pendingElevator=false;s.clearNotice=false;revealHeadlight();log(`警告：周囲に罠が${num(s.pos)}個。`);return true}
function triggerFloorTrap(c){
 // 針のダメージ式と末尾の全滅判定・並び替えは triggerChestTrap (game.js) と意図的に対応。変更時は双方を確認・同期し、並び替え理由などの意図的な違いは保つ。
 log('罠だ！',{trap:true});let roll=Math.random()*100,t=FLOOR_TRAPS.find(t=>(roll-=t.weight)<0)||FLOOR_TRAPS[0];c.trap=false;c.spent=true;c.trapKind=t.id;let alive=activeMembers(),i=alive[Math.random()*alive.length|0];if(i===undefined)return;displayVitals??=snapshotVitals();
 if(t.id==='needle'){let n=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(`針の罠！ ${NAMES[i]}に${n}ダメージ。`);sacrificeAfterDamage(i)}
 else if(t.id==='blast'){let n=Math.max(1,Math.floor(dice(2,6,3).value*trapPower(s.floor)));for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);markDeaths();log(`爆発の罠！ 全員に${n}ダメージ。`);for(const j of alive)sacrificeAfterDamage(j)}
 else if(t.id==='poison'){log('毒霧の罠！ 毒霧が噴き出した。');for(let j of alive)afflict(j,'poison')}
 else if(t.id==='paralysis'){log('麻痺の針の罠！ 針が飛び出した。');afflict(i,'paralysis')}
 else if(t.id==='pitfall'){if(s.floor>=MAX_FLOOR)log('落とし穴の罠は不発に終わった。');else{log('落とし穴の罠！ 一行は下の階へ落ちた。');descendPitfall()}}
 else {let candidates=s.cells.map((v,j)=>j!==s.pos&&!v.type&&!v.trap&&!v.flag&&!v.chest?j:-1).filter(j=>j>=0);if(candidates.length){s.previousPos=s.pos;s.pos=candidates[Math.random()*candidates.length|0];s.cells[s.pos].open=true;log('転移の罠！ 一行は別の部屋に飛ばされた。');log(`警告：周囲に罠が${num(s.pos)}個。`)}else log('転移の罠は不発に終わった。')}
 if(!activeMembers().length)defeat();else autoReorderParty('floor-trap');return t.id==='teleport'||t.id==='pitfall';
}
