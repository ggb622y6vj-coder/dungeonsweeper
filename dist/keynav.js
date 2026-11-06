/* Keyboard UI navigation. No game state or save migration belongs here. */
(function (global) {
 'use strict';
 const directions={w:'up',ArrowUp:'up',s:'down',ArrowDown:'down',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
 function direction(key){return directions[key]||directions[key.toLowerCase()]||null;}
 function nearest(current,items,way,rect=el=>el.getBoundingClientRect()){
  if(!current)return items[0]||null;
  const from=rect(current),x=from.left+from.width/2,y=from.top+from.height/2;
  // Items sharing the row/column band (overlapping perpendicular extent) win
  // over off-axis items, so a full-width button above a 2-column grid does not
  // steal A/D between the columns. Otherwise the nearest center wins.
  let best=current,distance=Infinity,aligned=null,alignedDistance=Infinity;
  const vertical=way==='up'||way==='down';
  for(const item of items){
   if(item===current)continue;
   const box=rect(item),dx=box.left+box.width/2-x,dy=box.top+box.height/2-y;
   const forward={up:-dy,down:dy,left:-dx,right:dx}[way];
   if(!(forward>0))continue;
   const score=dx*dx+dy*dy;
   if(score<distance){best=item;distance=score;}
   const overlap=vertical?Math.min(from.left+from.width,box.left+box.width)-Math.max(from.left,box.left)
    :Math.min(from.top+from.height,box.top+box.height)-Math.max(from.top,box.top);
   if(overlap>0&&score<alignedDistance){aligned=item;alignedDistance=score;}
  }
  return aligned||best;
 }
 function step(current,items,way,wrap=false){
  if(!items.length)return null;
  const i=items.indexOf(current),next=i+(way==='up'||way==='left'?-1:1);
  return items[wrap?(next+items.length)%items.length:Math.max(0,Math.min(items.length-1,next))];
 }
 // Grid rows use the rendered positions, including responsive party layouts.
 // Prefer the same row/column so a slightly taller card cannot cause a diagonal jump.
 function gridMove(current,items,way){
  const r=current?.getBoundingClientRect();if(!r)return items[0]||null;
  const vertical=way==='up'||way==='down';
  const aligned=items.filter(el=>{const b=el.getBoundingClientRect();return vertical
   ? Math.min(r.right,b.right)>Math.max(r.left,b.left)
   : Math.min(r.bottom,b.bottom)>Math.max(r.top,b.top);});
  return nearest(current,aligned,way);
 }
 function disabled(el){return !!el&&(el.disabled||el.matches?.(':disabled')||el.getAttribute?.('aria-disabled')==='true');}
 function activate(el){if(!el||disabled(el))return false;el.click();return true;}
 function ignores(e){return !!(e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.isComposing);}
 function editing(el){return !!el.matches?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])');}
 function clearKeyboardFocus(document){
  document.documentElement.classList.remove('keynav-keyboard');
  document.querySelectorAll('.kfocus').forEach(el=>el.classList.remove('kfocus'));
 }
 const api={direction,nearest,step,gridMove,disabled,activate,ignores,editing,clearKeyboardFocus};
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(typeof document==='undefined')return;
 global.KeyNav=api;
 const doc=document,$=selector=>doc.querySelector(selector);
 const selector='button,input:not([type="hidden"]),textarea,select,summary,[role="button"],[role="tab"],[tabindex="0"]';
 let keyboard=false,selected=null,layer=null,stack=[],syncing=false;
 const openers=new WeakMap();
 function visible(el){
  if(!el?.isConnected||el.closest('[hidden],[inert],dialog:not([open])'))return false;
  // A closed details element's descendants can have layout boxes in some engines.
  for(let p=el.parentElement;p;p=p.parentElement){
   if(p.tagName==='DETAILS'&&!p.open&&!p.querySelector('summary')?.contains(el))return false;
   const style=getComputedStyle(p);if(style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse'||style.opacity==='0')return false;
  }
  const style=getComputedStyle(el),r=el.getBoundingClientRect();
  return style.display!=='none'&&style.visibility!=='hidden'&&style.visibility!=='collapse'&&style.opacity!=='0'&&r.width>0&&r.height>0;
 }
 function collect(roots){
  const result=[];
  for(const root of roots.filter(Boolean)){
   for(const el of [root,...root.querySelectorAll('*')]){
    const choice=Array.from(el.attributes).some(a=>/^data-.+-choice$/.test(a.name));
    if((el.matches(selector)||choice)&&visible(el)&&!result.includes(el))result.push(el);
   }
  }
  return result;
 }
 function describe(el){
  if(!el)return null;
  return {element:el,id:el.id,tag:el.tagName,
   row:el.closest('[data-recruit-id]')?.getAttribute('data-recruit-id'),
   data:Array.from(el.attributes).filter(a=>a.name.startsWith('data-')&&!a.name.startsWith('data-key-')).map(a=>[a.name,a.value]),
   text:el.textContent};
 }
 function resolve(saved,items){
  if(!saved)return null;
  if(items.includes(saved.element))return saved.element;
  if(saved.id)return items.find(el=>el.id===saved.id)||null;
  return items.find(el=>el.tagName===saved.tag&&el.closest('[data-recruit-id]')?.getAttribute('data-recruit-id')===saved.row&&
   (saved.data.length?saved.data.every(([k,v])=>el.getAttribute(k)===v):el.textContent===saved.text))||null;
 }
 let savedSelection=null;
 function detect(){
  const dialogs=Array.from(doc.querySelectorAll('dialog[open]'));
  stack=stack.filter(d=>dialogs.includes(d));
  for(const d of dialogs)if(!stack.includes(d))stack.push(d);
  if(stack.length){const d=stack[stack.length-1];return {id:d,kind:'dialog',roots:[d]};}
  if(typeof allyTargetPick!=='undefined'&&allyTargetPick){
   const candidates=keyboard&&allyTargetPick.keyboardCandidates?allyTargetPick.keyboardCandidates():allyTargetPick.candidates();
   const targets=[...doc.querySelectorAll('#party .targetable')];
   // Native Shift+Tab from a protected select must also skip keyboard-ineligible
   // cards. Pointer mode restores their existing tab order and click behavior.
   for(const el of targets)el.tabIndex=candidates.includes(+el.dataset.allyTarget)?0:-1;
   const cards=targets.filter(el=>candidates.includes(+el.dataset.allyTarget));
   return {id:allyTargetPick,kind:'ally',roots:[...cards,$('#allytargetbar'),$('#allytargetbattlebar'),$('#allytargetcancel')]};
  }
  const command=$('#commandentry');
  if(visible(command))return {id:'command:'+command.getAttribute('data-key-context'),kind:'command',roots:[command,$('#flee')]};
  if(visible($('#town')))return {id:'town',kind:'town',roots:[$('#town'),$('#statsopen')]};
  if(visible($('#bosschoice')))return {id:s.pendingStairs?'stairs':'boss',kind:'confirm',roots:[$('#bosschoice')]};
  if(visible($('#chestactions')))return {id:'chest',kind:'confirm',roots:[$('#chestactions')]};
  if(visible($('#clearresult')))return {id:'clear',kind:'report',roots:[$('#clearresult')]};
  const prompts=[$('#bosschoice'),$('#chestactions'),$('#clearresult'),$('#backtown')];
  return {id:'explore:'+prompts.filter(visible).map(el=>el.id).join(','),kind:'explore',
   roots:[...prompts,$('#dungeon'),$('#statsopen'),$('#maptoggle')]};
 }
 const labels={dialog:'画面内',ally:'味方対象',command:'戦闘コマンド',town:'町メニュー',explore:'探索ボタン',confirm:'確認',report:'報告'};
 let hints=true;
 try{hints=localStorage.getItem('ash-keyhint')!=='off';}catch(_){/* Storage can be unavailable. */}
 function updateHint(){
  const hint=$('#keyhint'),toggle=$('#keyhinttoggle');
  if(hint){
   if(hint.hidden!==!hints)hint.hidden=!hints;
   const reason=keyboard&&disabled(selected)?`　${selected.title||'選択できません'}`:'';
   const value=layer?.id==='explore:'
    ? '探索　W/S・↑/↓：前進/後退　A/D・←/→：旋回　Q/E：横移動　F：旗　G：旗種　M：地図　C：ステータス'
    : `${labels[layer?.kind]||'選択'}　W/A/S/D・矢印：選択　Space・Enter：決定　Esc：${layer?.id==='chest'?'何もしない':'戻る'}${layer?.items?.some(el=>el.getAttribute('role')==='tab')?'　Q/E：タブ':''}${reason}`;
   if(hint.textContent!==value)hint.textContent=value;
  }
  if(toggle){toggle.setAttribute('aria-pressed',String(hints));const value='キーヒント：'+(hints?'表示':'非表示');if(toggle.textContent!==value)toggle.textContent=value;}
 }
 function paint(){
  doc.querySelectorAll('.kfocus').forEach(el=>{if(el!==selected||!keyboard)el.classList.remove('kfocus');});
  if(keyboard&&selected&&!selected.classList.contains('kfocus'))selected.classList.add('kfocus');
 }
 function focus(el,moveFocus=true){
  selected=el;savedSelection=describe(el);paint();
  if(!el)return;
  if(moveFocus){
   if(disabled(el)){
    // Native disabled buttons must stay disabled (including for pointer users).
    // Keep a logical cursor on them, with DOM focus on the containing layer.
    const host=el.closest('dialog')||$('#maincontent');
    if(host){if(!host.hasAttribute('tabindex'))host.tabIndex=-1;host.focus({preventScroll:true});}
   }else{
    if(!el.matches('button,input,textarea,select,summary,[tabindex]'))el.tabIndex=-1;
    el.focus({preventScroll:true});
   }
   el.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  const status=$('#keynavstatus'),statusHost=el.closest('dialog')||$('#maincontent');
  if(status&&statusHost&&status.parentElement!==statusHost)statusHost.append(status);
  const reason=disabled(el)?`${el.textContent.trim()}：${el.title||'選択できません'}`:'';
  if(status&&status.textContent!==reason)status.textContent=reason;
 }
 function defaultItem(items){
  if(layer?.id==='boss')return $('#bossno');
  if(layer?.id==='stairs')return $('#bossyes');
  if(keyboard&&layer?.id?.id==='statsdialog')return items.find(el=>el.matches('.statcard'))||items[0];
  const defaults=items.filter(el=>el.hasAttribute('data-key-default'));
  return defaults.find(el=>!el.hasAttribute('data-key-back'))||defaults[0]||items.find(el=>!el.hasAttribute('data-key-back'))||items[0]||null;
 }
 function sync(){
  if(syncing)return;
  syncing=true;
  try{
   const previous=layer,next=detect(),changed=previous?.id!==next.id;
   layer=next;layer.items=collect(layer.roots);
   let target=resolve(savedSelection,layer.items);
   if(changed){
    // Only restore into the active layer; chained reports/target picking take priority.
    const opener=previous?.kind==='dialog'&&!previous.id.open?resolve(openers.get(previous.id),layer.items):null;
    // Ally cancellation explicitly focuses its spell/item command after render.
    // Do not replace that newly created button with the first command.
    const cancelled=previous?.kind==='ally'&&next.kind==='command'&&layer.items.includes(doc.activeElement)?doc.activeElement:null;
    target=cancelled||opener||defaultItem(layer.items);
   }
   if(!target)target=defaultItem(layer.items);
   if(changed||target!==selected)focus(target,changed||keyboard);
   else paint();
   updateHint();
  }finally{syncing=false;}
 }
 // Capture the opener before showModal() performs the browser's autofocus step.
 // Per-dialog hooks leave the native dialog prototype untouched.
 for(const dialog of doc.querySelectorAll('dialog')){
  const show=dialog.showModal;
  dialog.showModal=function(...args){
   const wasOpen=this.open,opener=describe(doc.activeElement===doc.body?selected:doc.activeElement);
   const result=show.apply(this,args);
   if(!wasOpen){openers.set(this,opener);stack=stack.filter(d=>d!==this);stack.push(this);sync();}
   return result;
  };
  dialog.addEventListener('close',sync);
 }
 function consume(e){e.preventDefault();e.stopImmediatePropagation();}
 function back(){
  if(layer.id==='chest')return;
  if((layer.kind==='command'||layer.kind==='ally'||layer.kind==='confirm')&&logBusy())return;
  if(layer.kind==='dialog'&&layer.id.id==='trainingorderdialog'&&trainingOrderPicked){
   cancelTrainingOrderPick();sync();return;
  }
  const button=layer.items.find(el=>el.hasAttribute('data-key-back')&&!disabled(el));
  if(button)activate(button);
  else if(layer.kind==='dialog')layer.id.close();
  sync();
 }
 function navigate(way){
  if(layer.kind==='confirm')return step(selected,layer.items,way,true);
  if(layer.kind==='ally'&&selected?.matches('[data-ally-target]'))return gridMove(selected,layer.items.filter(el=>el.matches('[data-ally-target]')),way);
  if(selected?.matches('.statcard'))return gridMove(selected,layer.items.filter(el=>el.matches('.statcard')),way);
  const list=selected?.closest('#magiclist,#medicinelist');
  if(list&&(way==='up'||way==='down'))return step(selected,layer.items.filter(el=>list.contains(el)),way);
  // W/S traverse the entire row/spell target list, even when it wraps to two columns.
  if(selected?.matches('[data-row-choice],[data-spell-target]')&&(way==='up'||way==='down'))
   return step(selected,layer.items.filter(el=>el.matches('[data-row-choice],[data-spell-target]')),way);
  // A/D in two-column lists stay on the same visual row of that list; the
  // full-width back button below must not win on raw centre distance.
  const group=list?layer.items.filter(el=>list.contains(el)):selected?.matches('[data-row-choice],[data-spell-target]')?layer.items.filter(el=>el.matches('[data-row-choice],[data-spell-target]')):null;
  if(group&&(way==='left'||way==='right')){const next=gridMove(selected,group,way);if(next&&next!==selected)return next;}
  // Battle commands are a 2-column grid above full-width 戻る/逃げる: prefer
  // the same visual row/column band, then fall back to 038's centre distance.
  // 070: a disabled 戻る (first member) is never a W/S/A/D stop, so the move from
  // the grid to クイック攻撃｜逃げる is the same at every width.
  if(layer.kind==='command'){
   const items=layer.items.filter(el=>el===selected||!(el.hasAttribute('data-key-back')&&disabled(el)));
   // 071: the heading's クイック攻撃 is entered only by W from the grid's top row
   // and S leaves it back into the grid, so 逃げる/戻る -W-> grid at every width.
   const grid=items.filter(el=>el.matches('.commandchoices button'));
   if(selected?.matches('#quickattack')&&way==='down'&&grid.length)return nearest(selected,grid,way);
   if(way==='up'&&grid.length&&!selected?.closest('.commandchoices')){const rest=items.filter(el=>!el.matches('#quickattack'));const next=gridMove(selected,rest,way);return next&&next!==selected?next:nearest(selected,rest,way);}
   const next=gridMove(selected,items,way);if(next&&next!==selected)return next;return nearest(selected,items,way);
  }
  return nearest(selected,layer.items,way);
 }
 // Tab rows and their lists have an explicit vertical boundary; geometry alone
 // would jump back to a header when a long list has scrolled beneath it.
 function tabNavigation(way,key){
  const allTabs=layer.items.filter(el=>el.getAttribute('role')==='tab');
  if(!allTabs.length)return false;
  const shortcut=key.toLowerCase()==='q'?-1:key.toLowerCase()==='e'?1:0;
  const selectedGroup=selected?.getAttribute?.('role')==='tab'?selected.parentElement:null;
  // Nested tablists (library spell jobs) navigate within themselves, while
  // Q/E remains the shortcut for the dialog's primary tablist.
  const group=shortcut?allTabs[0].parentElement:selectedGroup||allTabs[0].parentElement;
  const tabs=allTabs.filter(el=>el.parentElement===group);
  const active=tabs.find(el=>el.getAttribute('aria-selected')==='true')||tabs[0];
  const panel=doc.getElementById(active.getAttribute('aria-controls'));
  const entries=panel?.hasAttribute('data-key-list')?layer.items.filter(el=>el!==panel&&panel.contains(el)):[];
  const onTab=tabs.includes(selected),index=entries.indexOf(selected);
  if(shortcut||(onTab&&['left','right'].includes(way))||(onTab&&['Home','End'].includes(key))){
   const step=shortcut||(way==='left'?-1:1);
   const current=onTab?selected:active;
   const target=key==='Home'?tabs[0]:key==='End'?tabs.at(-1):tabs[(tabs.indexOf(current)+step+tabs.length)%tabs.length];
   activate(target);sync();focus(target);return true;
  }
  if(onTab&&way==='down'&&panel?.id==='librarybody'){focus(panel);return true;}
  if(selected===panel&&panel?.id==='librarybody'&&way==='up'){focus(active);return true;}
  if(onTab&&way==='down'&&entries.length){focus(entries[0]);return true;}
  if(index>=0&&(way==='up'||way==='down')){
   focus(way==='up'?(index===0?active:entries[index-1]):entries[Math.min(index+1,entries.length-1)]);return true;
  }
  return false;
 }
 function keydown(e){
  if($('#shoppurchasedialog')?.open){consume(e);return;}
  if(ignores(e))return;
  const inField=editing(e.target);
  if(inField&&e.key!=='Escape'){
   if(e.key==='Tab'){keyboard=true;doc.documentElement.classList.add('keynav-keyboard');paint();}
   return;
  }
  sync();
  if(layer.kind==='dialog'&&layer.id.id==='mapdialog'&&e.key.toLowerCase()==='m'){
   consume(e);if(!e.repeat)back();return;
  }
  // Exploration controls are dispatched here once, alongside UI shortcuts.
  if(layer?.kind==='explore'&&layer.id==='explore:'&&typeof move==='function'){
   const action={w:'forward',W:'forward',ArrowUp:'forward',s:'back',S:'back',ArrowDown:'back',a:'left',A:'left',ArrowLeft:'left',d:'right',D:'right',ArrowRight:'right',q:'strafeLeft',Q:'strafeLeft',e:'strafeRight',E:'strafeRight'}[e.key];
   const active=typeof allyTargetPick!=='undefined'&&allyTargetPick||typeof currentChest==='function'&&currentChest()||s.area!=='dungeon'||s.pendingStairs||s.pendingElevator||s.done||s.enemy||s.pendingBoss||typeof logBusy==='function'&&logBusy();
   if(action){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat&&!active)move(action);return;}
   if((e.key==='f'||e.key==='F')&&!active){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat)$('#frontflag').click();return;}
   if((e.key==='g'||e.key==='G')&&!active){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat)$('#flagopen').click();return;}
   if((e.key==='m'||e.key==='M')&&!active){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat)$('#maptoggle').click();return;}
   if((e.key==='c'||e.key==='C')&&!active){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat)$('#statsopen').click();return;}
  }
  const way=direction(e.key),decide=e.key===' '||e.key==='Enter',tab=e.key==='Tab';
  const tabShortcut=['q','e'].includes(e.key.toLowerCase())&&layer.items.some(el=>el.getAttribute('role')==='tab');
  const tabEdge=e.target.getAttribute?.('role')==='tab'&&['Home','End'].includes(e.key);
  if(!way&&!decide&&!tab&&e.key!=='Escape'&&!tabEdge&&!tabShortcut)return;
  keyboard=true;doc.documentElement.classList.add('keynav-keyboard');sync();
  // Focus set by Tab, mouse, or existing UI is authoritative, except for the
  // logical disabled cursor whose DOM focus intentionally lives on the layer.
  if(layer.items.includes(doc.activeElement))focus(doc.activeElement,false);
  if(selected?.id==='librarybody'&&(way==='down'||way==='up')){
   const body=selected,delta=way==='down'?120:-120;
   if(delta>0||body.scrollTop>0){consume(e);body.scrollTop+=delta;return;}
  }
  if(e.key==='Escape'){
   consume(e);
   if(e.repeat)return;
   if(inField){
    const adjacent=doc.getElementById(e.target.getAttribute('data-key-exit'));
    focus(layer.items.includes(adjacent)?adjacent:layer.items.find(el=>el.hasAttribute('data-key-back')&&!disabled(el))||defaultItem(layer.items));return;
   }
   back();return;
  }
  if(tab){
   const items=layer.items.filter(el=>!disabled(el)&&el.getAttribute('tabindex')!=='-1');
   if(!items.length)return;
   consume(e);const i=items.indexOf(selected),step=e.shiftKey?-1:1;
   focus(items[(i+step+items.length)%items.length]);return;
  }
  consume(e);
  if(decide){
   if(!e.repeat&&!(typeof logBusy==='function'&&logBusy())){
    // Pointer focus can land on a card omitted from keyboard navigation.
    // Never let Space/Enter fall back to the first candidate in that case.
    if(layer.kind==='ally'&&selected?.matches('[data-ally-target]')&&!allyTargetSelectable(+selected.dataset.allyTarget)){sync();return;}
    activate(selected?.matches('.statcard')?selected.querySelector('[data-stat-inventory]'):selected);
   }
   sync();return;
  }
  if(tabNavigation(way,e.key)){sync();return;}
  if(way&&selected?.hasAttribute('data-order-member')){
   focus(nearest(selected,layer.items.filter(el=>el.hasAttribute('data-order-member')),way));return;
  }
  const tabs=layer.items.filter(el=>el.getAttribute('role')==='tab');
  const target=tabEdge?(e.key==='Home'?tabs[0]:tabs[tabs.length-1]):navigate(way);
  focus(target);
  // Preserve the library's existing automatic horizontal tab activation.
  if(target?.getAttribute('role')==='tab'&&(tabEdge||((way==='left'||way==='right')&&e.target.getAttribute?.('role')==='tab')))activate(target);
  sync();
 }
 doc.addEventListener('keydown',keydown,true);
 doc.addEventListener('pointerdown',()=>{keyboard=false;clearKeyboardFocus(doc);},true);
 doc.addEventListener('focusin',e=>{
  if(!syncing&&layer?.items.includes(e.target)){selected=e.target;savedSelection=describe(selected);paint();}
 });
 $('#keysettingsopen').onclick=()=>$('#keysettingsdialog').showModal();
 $('#keysettingsclose').onclick=()=>$('#keysettingsdialog').close();
 $('#keyhinttoggle').onclick=()=>{hints=!hints;try{localStorage.setItem('ash-keyhint',hints?'on':'off');}catch(_){}updateHint();};
 new MutationObserver(sync).observe(doc.querySelector('main'),{subtree:true,childList:true,attributes:true,
  attributeFilter:['open','hidden','disabled','aria-disabled','style','class','data-key-context']});
 api.sync=sync;api.current=()=>selected;api.layer=()=>layer?.kind;
 sync();
})(globalThis);
