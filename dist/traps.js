const FLOOR_TRAPS=[{id:'needle',name:'針',weight:25},{id:'blast',name:'爆発',weight:25},{id:'poison',name:'毒霧',weight:20},{id:'paralysis',name:'麻痺の針',weight:15},{id:'teleport',name:'転移',weight:15}];
function triggerFloorTrap(c){log('罠だ！',{trap:true});let roll=Math.random()*100,t=FLOOR_TRAPS.find(t=>(roll-=t.weight)<0)||FLOOR_TRAPS[0];c.trap=false;c.spent=true;c.trapKind=t.id;let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;displayVitals??=snapshotVitals();
 if(t.id==='needle'){let n=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(`針の罠！ ${NAMES[i]}に${n}ダメージ。`)}
 else if(t.id==='blast'){let n=Math.max(1,Math.floor(dice(2,6,3).value*trapPower(s.floor)));for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);markDeaths();log(`爆発の罠！ 全員に${n}ダメージ。`)}
 else if(t.id==='poison'){log('毒霧の罠！ 毒霧が噴き出した。');for(let j of alive)afflict(j,'poison')}
 else if(t.id==='paralysis'){log('麻痺の針の罠！ 針が飛び出した。');afflict(i,'paralysis')}
 else {let candidates=s.cells.map((v,j)=>j!==s.pos&&!v.type&&!v.trap&&!v.flag&&!v.chest?j:-1).filter(j=>j>=0);if(candidates.length){s.previousPos=s.pos;s.pos=candidates[Math.random()*candidates.length|0];s.cells[s.pos].open=true;log('転移の罠！ 一行は別の部屋に飛ばされた。');log(`警告：周囲に罠が${num(s.pos)}個。`)}else log('転移の罠は不発に終わった。')}
 if(s.hp.every(h=>h===0))defeat();else autoReorderParty('floor-trap');return t.id==='teleport';
}
