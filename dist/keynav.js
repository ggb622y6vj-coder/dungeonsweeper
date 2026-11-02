/* Keyboard UI navigation. No game state or save migration belongs here. */
(function (global) {
 'use strict';
 const directions={w:'up',ArrowUp:'up',s:'down',ArrowDown:'down',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
 function direction(key){return directions[key]||directions[key.toLowerCase()]||null;}
 function nearest(current,items,way,rect=el=>el.getBoundingClientRect()){
  if(!current)return items[0]||null;
  const from=rect(current),x=from.left+from.width/2,y=from.top+from.height/2;
  let best=current,distance=Infinity;
  for(const item of items){
   if(item===current)continue;
   const box=rect(item),dx=box.left+box.width/2-x,dy=box.top+box.height/2-y;
   const forward={up:-dy,down:dy,left:-dx,right:dx}[way];
   if(!(forward>0))continue;
   const score=dx*dx+dy*dy;
   if(score<distance){best=item;distance=score;}
  }
  return best;
 }
 function disabled(el){return !!el&&(el.disabled||el.matches?.(':disabled')||el.getAttribute?.('aria-disabled')==='true');}
 function activate(el){if(!el||disabled(el))return false;el.click();return true;}
 function ignores(e){return !!(e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.isComposing);}
 function editing(el){return !!el.matches?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])');}
 function clearKeyboardFocus(document){
  document.documentElement.classList.remove('keynav-keyboard');
  document.querySelectorAll('.kfocus').forEach(el=>el.classList.remove('kfocus'));
 }
 const api={direction,nearest,disabled,activate,ignores,editing,clearKeyboardFocus};
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
  if(typeof allyTargetPick!=='undefined'&&allyTargetPick)return {id:allyTargetPick,kind:'ally',roots:[...doc.querySelectorAll('#party .targetable'),$('#allytargetbar'),$('#allytargetbattlebar'),$('#allytargetcancel')]};
  const command=$('#commandentry');
  if(visible(command))return {id:'command:'+command.getAttribute('data-key-context'),kind:'command',roots:[command,$('#flee')]};
  if(visible($('#town')))return {id:'town',kind:'town',roots:[$('#town'),$('#statsopen')]};
  const prompts=[$('#bosschoice'),$('#chestactions'),$('#clearresult'),$('#backtown')];
  return {id:'explore:'+prompts.filter(visible).map(el=>el.id).join(','),kind:'explore',
   roots:[...prompts,$('#dungeon'),$('#statsopen'),$('#maptoggle')]};
 }
 const labels={dialog:'画面内',ally:'味方対象',command:'戦闘コマンド',town:'町メニュー',explore:'探索ボタン'};
 let hints=true;
 try{hints=localStorage.getItem('ash-keyhint')!=='off';}catch(_){/* Storage can be unavailable. */}
 function updateHint(){
  const hint=$('#keyhint'),toggle=$('#keyhinttoggle');
  if(hint){
   if(hint.hidden!==!hints)hint.hidden=!hints;
   const reason=keyboard&&disabled(selected)&&selected.title?`　${selected.title}`:'';
   const value=layer?.id==='explore:'
    ? '探索　W/S・↑/↓：前進/後退　A/D・←/→：旋回　Q/E：横移動　F：旗　G：旗種　M：地図　C：ステータス'
    : `${labels[layer?.kind]||'選択'}　W/A/S/D・矢印：選択　Space・Enter：決定　Esc：戻る${reason}`;
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
 function defaultItem(items){return items.find(el=>el.hasAttribute('data-key-default'))||items.find(el=>!el.hasAttribute('data-key-back'))||items[0]||null;}
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
    target=opener||defaultItem(layer.items);
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
  const button=layer.items.find(el=>el.hasAttribute('data-key-back')&&!disabled(el));
  if(button)activate(button);
  else if(layer.kind==='dialog')layer.id.close();
  sync();
 }
 function keydown(e){
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
   const active=typeof allyTargetPick!=='undefined'&&allyTargetPick||typeof currentChest==='function'&&currentChest()||s.area!=='dungeon'||s.pendingStairs||s.done||s.enemy||s.pendingBoss||typeof logBusy==='function'&&logBusy();
   if(action){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat&&!active)move(action);return;}
   if((e.key==='f'||e.key==='F')&&!active){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat)$('#frontflag').click();return;}
   if((e.key==='g'||e.key==='G')&&!active){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat)$('#flagopen').click();return;}
   if((e.key==='m'||e.key==='M')&&!active){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat)$('#maptoggle').click();return;}
   if((e.key==='c'||e.key==='C')&&!active){consume(e);keyboard=true;doc.documentElement.classList.add('keynav-keyboard');if(!e.repeat)$('#statsopen').click();return;}
  }
  const way=direction(e.key),decide=e.key===' '||e.key==='Enter',tab=e.key==='Tab';
  const tabEdge=e.target.getAttribute?.('role')==='tab'&&['Home','End'].includes(e.key);
  if(!way&&!decide&&!tab&&e.key!=='Escape'&&!tabEdge)return;
  keyboard=true;doc.documentElement.classList.add('keynav-keyboard');sync();
  // Focus set by Tab, mouse, or existing UI is authoritative, except for the
  // logical disabled cursor whose DOM focus intentionally lives on the layer.
  if(layer.items.includes(doc.activeElement))focus(doc.activeElement,false);
  if(e.key==='Escape'){
   consume(e);
   if(inField){focus(layer.items.find(el=>el.hasAttribute('data-key-back')&&!disabled(el))||defaultItem(layer.items));return;}
   if(!e.repeat)back();return;
  }
  if(tab){
   const items=layer.items.filter(el=>!disabled(el)&&el.getAttribute('tabindex')!=='-1');
   if(!items.length)return;
   consume(e);const i=items.indexOf(selected),step=e.shiftKey?-1:1;
   focus(items[(i+step+items.length)%items.length]);return;
  }
  consume(e);
  if(decide){if(!e.repeat)activate(selected);sync();return;}
  const tabs=layer.items.filter(el=>el.getAttribute('role')==='tab');
  const target=tabEdge?(e.key==='Home'?tabs[0]:tabs[tabs.length-1]):nearest(selected,layer.items,way);
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
