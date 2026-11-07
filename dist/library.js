// Account records live beside the roster in ash-v1, never in party/floor data.
function ensureLibrary(){
 s.library??={monsters:{},items:{}};
 s.library.monsters??={};s.library.items??={};
 if(!s.library.monsterIdentifyVersion){for(const r of Object.values(s.library.monsters))if(r?.count>0)r.identified=true;s.library.monsterIdentifyVersion=1}
 // Legacy saves have no spell record: seed it from every registered adventurer (party + reserve).
 if(!s.library.spells){s.library.spells={};recordLibrarySpells()}
}
function recordLibraryEncounter(combat){ensureLibrary();for(const e of combat.units||[])if(ENEMIES.some(d=>d.id===e.id)){const r=s.library.monsters[e.id]??={count:0};r.seen=true}}
function recordLibraryIdentification(combat){ensureLibrary();for(const e of combat.units||[])if(e.identifiedBySpell&&ENEMIES.some(d=>d.id===e.id)){const r=s.library.monsters[e.id]??={count:0};r.identified=true}}
// Permanent spell record: once learned by anyone it stays, even after deletion, wipe or loss.
function recordLibrarySpells(ids){
 if(!s.library?.spells)return ensureLibrary();
 if(!ids){
  let members=s.members||[];
  try{if(typeof trainingRoster==='function')members=[...members,...trainingRoster().map(r=>r?.members)]}catch{}
  ids=members.flatMap(m=>m?.known||[]);
 }
 for(const id of ids)if(MAGIC.some(x=>x.id===id))s.library.spells[id]=true;
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
 if(d.breath)abilities.push(`${d.breath.element}のブレス${(d.breath.statuses||[]).map(a=>`（${({poison:'毒',paralysis:'麻痺'})[a.type]}）`).join('')}`);
 for(const a of d.statuses)if(a.chance>0)abilities.push({kind:a.type,label:({poison:'毒',paralysis:'麻痺',stone:'石化',fear:'恐怖',sleep:'睡眠',silence:'沈黙'})[a.type]||a.type});
 for(const [key,label] of [['steal','アイテム奪取'],['drain','レベル吸収'],['death','即死'],['summon','仲間呼び'],['rear','後衛攻撃'],['flee','逃走']])if(d[key])abilities.push(label);
 if(d.resistance&&d.resistance!=='なし')for(const resistance of d.resistance.split(/[・、]/))abilities.push(resistance);
 const attacks=document.createElement('dd');
 if(abilities.length){for(const ability of abilities){const tag=libraryElement('span',typeof ability==='string'?ability:ability.label);tag.className=`ailment-tag ${typeof ability==='string'?'ailment-other':`ailment-${ability.kind}`}`;attacks.append(tag)}}else attacks.textContent='なし';
 return [
  ['種族',d.race],['出現階',d.floors.map(f=>`${f}F`).join('・')],['HP',libraryDice(d.hp)],['物理ダメージ',libraryDice(d.attack)],['攻撃回数',`${d.swings}回`],
  ['特殊能力',abilities.length?attacks:'なし'],['使用呪文',d.spell>0?(d.spellInfo?.effect==='silence'?`${d.spellInfo.name}（${d.spellInfo.name==='沈黙'?'':'沈黙・'}全体）`:(d.spellInfo?.name||'ハリト')):'なし'],
  ['経験値',String(Number.isInteger(d.xp)?d.xp:Math.round(d.xp))],['撃破数',`${record.count}体`]
 ];
}
function libraryItemDetails(w){
 const medicine=w.kind==='medicine',shop=!medicine&&w.shop!==false;
 const performance=medicine?w.description:w.part?`AC −${w.ac}`:
  `攻撃 ${libraryDice(w.dice)} / hitBonus ${w.hitBonus>=0?'+':''}${w.hitBonus} / 最低攻撃回数 ${w.minAttacks}回`;
 return [['職業',w.classes.map(i=>CLASSES[i].name).join('・')],
  ['性能',performance],...(w.desc?[['追加効果',w.desc]]:[]),['価格',`${Number.isFinite(w.price)?w.price+' G':'購入価格なし'} / 売却 ${w.sell} G`],
  ['入手先',`${shop?'店売り・迷宮':'迷宮限定'}（地下${w.minFloor||1}階〜）`]];
}
function libraryElement(tag,text){const el=document.createElement(tag);el.textContent=text;return el}
function libraryEntry(name,details,key=null,subtext=''){
 const entry=document.createElement('article');entry.className='library-entry';
 entry.append(libraryElement('h4',name));
 if(subtext){const sub=libraryElement('small',subtext);sub.className='library-subtext';entry.append(sub)}
 if(key)entry.setAttribute('data-library-entry',key);
 if(details){
  const list=document.createElement('dl');
  for(const [label,value] of details){list.append(libraryElement('dt',label));const dd=typeof value==='string'?libraryElement('dd',value):value;list.append(dd)}
  entry.append(list);
 }
 return entry;
}
function libraryMonsterFloors(){return [...new Set(ENEMIES.map(d=>d.floors[0]))].sort((a,b)=>a-b)}
function renderLibrary(tab='monsters',spellJob=1,itemKind='weapon',monsterFloor=libraryMonsterFloors()[0]){
 ensureLibrary();
 const monsterCount=ENEMIES.filter(d=>s.library.monsters[d.id]?.identified).length;
 const itemCount=WEAPONS.filter(w=>s.library.items[w.id]).length;
 $('#libraryprogress').textContent=`モンスター ${monsterCount}/${ENEMIES.length} · アイテム ${itemCount}/${WEAPONS.length}`;
 for(const name of ['monsters','items','spells']){
  const button=$('#librarytab-'+name),active=name===tab;
  button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
 }
 const body=$('#librarybody');body.replaceChildren();body.setAttribute('aria-labelledby','librarytab-'+tab);
 const spellTabs=$('#library-spell-tabs');spellTabs.hidden=tab!=='spells';
 for(const job of [1,2]){
  const button=$('#libraryspelltab-'+job),active=tab==='spells'&&job===spellJob;
  button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
 }
 const itemTabs=$('#library-item-tabs');itemTabs.hidden=tab!=='items';
 for(const kind of ['weapon','head','body','feet','medicine']){
  const button=$('#libraryitemtab-'+kind),active=tab==='items'&&kind===itemKind;
  button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
 }
 const monsterTabs=$('#library-monster-tabs');monsterTabs.hidden=tab!=='monsters';
 body.classList.toggle('library-monsters',tab==='monsters');
 for(const floor of libraryMonsterFloors()){
  const button=$('#librarymonstertab-'+floor),active=tab==='monsters'&&floor===monsterFloor;
  button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
 }
 if(tab==='monsters'){
  for(const d of ENEMIES.filter(d=>d.floors[0]===monsterFloor)){
   const record=s.library.monsters[d.id],identified=!!record?.identified,seen=!!record?.seen||record?.count>0;
   const mark=d.id==='labyrinthlord'?' ★ 迷宮の主':d.boss?' ◆ 守護者':'';
   let entry;
   if(identified)entry=libraryEntry(d.name+mark,libraryMonsterDetails(d,record),'monster-'+d.id,d.unknown||'');
   else if(seen)entry=libraryEntry(d.unknown||'？？？',[['撃破数',`${record.count||0}体`]],'monster-'+d.id);
   else entry=libraryEntry('？？？',null,'monster-'+d.id);
   body.append(entry);
  }
 }else if(tab==='items'){
  if(itemKind==='medicine')body.append(libraryElement('p',`薬 ${MEDICINES.filter(w=>s.library.items[w.id]).length}/${MEDICINES.length}`));
  for(const w of [...WEAPONS,...MEDICINES].filter(w=>(w.kind==='medicine'?'medicine':w.part||'weapon')===itemKind)){
   const known=!!s.library.items[w.id];
   const entry=libraryEntry(known?w.name:'？？？',known?libraryItemDetails(w):null,'item-'+w.id);
   if(known&&itemKind==='weapon'){
    const tag=libraryElement('span',w.range==='ranged'?'遠距離':'近距離');tag.className='ailment-tag ailment-other';entry.children[0].append(tag);
   }
   body.append(entry);
  }
 }
 if(tab==='spells'){
  // Permanent record: a spell stays discovered once any adventurer has learned it.
  recordLibrarySpells();
  let level;
  for(const spell of MAGIC.filter(spell=>spell.job===spellJob).sort((a,b)=>a.level-b.level)){
  if(spell.level!==level){level=spell.level;body.append(libraryElement('h3',`Lv.${level}`))}
  const known=!!s.library.spells[spell.id];
  body.append(libraryEntry(known?spell.name:'？？？',known?[['消費MP',spell.id==='dumapic'||spell.id==='floodfill'?`${spell.mp}（使用ごとに倍増）`:String(spell.mp)],['使用場所',({field:'探索',battle:'戦闘',both:'探索・戦闘',chest:'宝箱'})[spell.where]||spell.where],
   ['効果',spell.description]]:null,'spell-'+spell.id));
  }
 }
 body.scrollTop=0;
}
function libraryUI(){
 const monsterTabs=$('#library-monster-tabs');monsterTabs.replaceChildren();
 for(const floor of libraryMonsterFloors()){
  const button=libraryElement('button',String(floor));button.id='librarymonstertab-'+floor;
  button.setAttribute('role','tab');button.setAttribute('aria-controls','librarybody');
  button.setAttribute('aria-selected','false');button.tabIndex=-1;
  monsterTabs.append(button);
  $('#librarymonstertab-'+floor).onclick=()=>renderLibrary('monsters',1,'weapon',floor);
 }
 $('#libraryopen').onclick=()=>{if(s.area!=='town'||!idle()||s.done)return;renderLibrary();$('#librarydialog').showModal()};
 $('#libraryclose').onclick=()=>$('#librarydialog').close();
 for(const tab of ['monsters','items','spells']){
  const button=$('#librarytab-'+tab);
  button.onclick=()=>renderLibrary(tab);
 }
 for(const kind of ['weapon','head','body','feet','medicine'])$('#libraryitemtab-'+kind).onclick=()=>renderLibrary('items',1,kind);
 for(const job of [1,2])$('#libraryspelltab-'+job).onclick=()=>renderLibrary('spells',job);
}
