// Account records live beside the roster in ash-v1, never in party/floor data.
function ensureLibrary(){
 s.library??={monsters:{},items:{}};
 s.library.monsters??={};s.library.items??={};
}
function recordLibraryVictory(combat){
 if(combat.libraryRecorded)return;
 ensureLibrary();
 for(const e of combat.units){
  if(!e.rewarded||e.escaped||!ENEMIES.some(d=>d.id===e.id))continue;
  const record=s.library.monsters[e.id]??={count:0,firstFloor:s.floor};
  record.count++;
 }
 combat.libraryRecorded=true;
}
function recordLibraryItem(id){
 if(!weapon(id))return;
 ensureLibrary();s.library.items[id]=true;
}
function libraryDice(values){
 const [n,d,add=0]=values;
 return `${n}d${d}${add>0?'+':''}${add||''}`;
}
function libraryMonsterDetails(d,record){
 const abilities=[];
 if(d.breath)abilities.push(`${d.breath.element}のブレス`);
 for(const a of d.statuses)if(a.chance>0)abilities.push(({poison:'毒',paralysis:'麻痺',sleep:'睡眠',stone:'石化'})[a.type]||a.type);
 for(const [key,label] of [['steal','アイテム奪取'],['drain','レベル吸収'],['death','即死'],['summon','仲間を呼ぶ'],['rear','後衛攻撃'],['flee','逃走']])if(d[key])abilities.push(label);
 if(d.resistance&&d.resistance!=='なし')abilities.push(`耐性：${d.resistance}`);
 return [
  ['出現階',`地下${d.floor}階`],['HPの目安',libraryDice(d.hp)],['攻撃回数',`${d.swings}回`],
  ['使う呪文',d.spell>0?(d.spellInfo?.name||'ハリト'):'なし'],['特殊能力',abilities.join('・')||'なし'],
  ['撃破数',`${record.count}体`],['初撃破階',`地下${record.firstFloor}階`]
 ];
}
function libraryItemKind(w){return w.kind==='medicine'?'薬':w.part?({head:'防具（頭）',body:'防具（胴体）',feet:'防具（足）'})[w.part]:'武器'}
function libraryItemDetails(w){
 const medicine=w.kind==='medicine',shop=!medicine&&w.shop!==false;
 const performance=medicine?w.description:w.part?`AC −${w.ac}`:
  `攻撃 ${libraryDice(w.dice)} / ${w.range==='ranged'?'遠距離':'近距離'} / hitBonus ${w.hitBonus>=0?'+':''}${w.hitBonus} / 最低攻撃回数 ${w.minAttacks}回`;
 return [['種類',libraryItemKind(w)],[medicine?'使用できる職業':'装備できる職業',w.classes.map(i=>CLASSES[i].name).join('・')],
  ['性能',performance],['価格',`${Number.isFinite(w.price)?w.price+' G（基準価格）':'購入価格なし'} / 売却 ${w.sell} G`],
  ['入手先',`${shop?'店売り・迷宮':'迷宮限定'}（地下${w.minFloor||1}階〜）`]];
}
function libraryElement(tag,text){const el=document.createElement(tag);el.textContent=text;return el}
function libraryEntry(name,details){
 const entry=document.createElement('article');entry.className='library-entry';
 entry.append(libraryElement('h4',name));
 if(details){
  const list=document.createElement('dl');
  for(const [label,value] of details)list.append(libraryElement('dt',label),libraryElement('dd',value));
  entry.append(list);
 }
 return entry;
}
function renderLibrary(tab='monsters'){
 ensureLibrary();
 const monsterCount=ENEMIES.filter(d=>s.library.monsters[d.id]?.count>0).length;
 const itemCount=WEAPONS.filter(w=>s.library.items[w.id]).length;
 $('#libraryprogress').textContent=`モンスター ${monsterCount}/${ENEMIES.length} · アイテム ${itemCount}/${WEAPONS.length}`;
 for(const name of ['monsters','items']){
  const button=$('#librarytab-'+name),active=name===tab;
  button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
 }
 const body=$('#librarybody');body.replaceChildren();body.setAttribute('aria-labelledby','librarytab-'+tab);
 if(tab==='monsters'){
  let floor;
  for(const d of [...ENEMIES].sort((a,b)=>a.floor-b.floor)){
   if(d.floor!==floor){floor=d.floor;body.append(libraryElement('h3',`地下${floor}階`))}
   const record=s.library.monsters[d.id],known=record?.count>0;
   const mark=d.id==='labyrinthlord'?' ★ 迷宮の主':d.boss?' ◆ 守護者':'';
   body.append(libraryEntry(known?d.name+mark:'？？？',known?libraryMonsterDetails(d,record):null));
  }
 }else{
  for(const kind of ['武器','防具（頭）','防具（胴体）','防具（足）','薬']){
   body.append(libraryElement('h3',kind==='薬'?`薬（別枠） ${MEDICINES.filter(w=>s.library.items[w.id]).length}/${MEDICINES.length}`:kind));
   for(const w of [...WEAPONS,...MEDICINES].filter(w=>libraryItemKind(w)===kind)){
    const known=!!s.library.items[w.id];body.append(libraryEntry(known?w.name:'？？？',known?libraryItemDetails(w):null));
   }
  }
 }
 body.scrollTop=0;
}
function libraryUI(){
 $('#libraryopen').onclick=()=>{if(s.area!=='town'||!idle()||s.done)return;renderLibrary();$('#librarydialog').showModal()};
 $('#libraryclose').onclick=()=>$('#librarydialog').close();
 for(const tab of ['monsters','items']){
  const button=$('#librarytab-'+tab);
  button.onclick=()=>renderLibrary(tab);
  button.onkeydown=e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();const next=e.key==='Home'?'monsters':e.key==='End'?'items':tab==='monsters'?'items':'monsters';
   renderLibrary(next);$('#librarytab-'+next).focus();
  };
 }
}
