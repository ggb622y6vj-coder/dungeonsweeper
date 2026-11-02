// UI-only state: never persisted in ash-v1. Both cards and fallback controls
// finish this same selection before invoking the action (including log playback).
let allyTargetPick=null;
function beginAllyTargetPick({candidates,onPick,onCancel,prompt,fallback=null}){
 if(logBusy()||allyTargetPick)return false;
 const parent=fallback?.parentNode;
 allyTargetPick={candidates,onPick,onCancel,prompt,fallback,parent};
 for(const id of ['magicdialog','medicinedialog','inventorydialog','statsdialog'])if($('#'+id).open)$('#'+id).close();
 if(fallback)$('#allytargetfallback').append(fallback);
 render();
 $('#party').scrollIntoView?.({block:'nearest'});
 ($('#party .targetable')||$('#allytargetcancel')).focus?.();
 return true;
}
function endAllyTargetPick(){
 const pick=allyTargetPick;if(!pick)return null;
 allyTargetPick=null;
 if(pick.fallback)pick.parent.append(pick.fallback);
 $('#allytargetbar').hidden=true;
 return pick;
}
function pickAllyTarget(target){
 const pick=allyTargetPick;
 if(!pick||logBusy()||!pick.candidates().includes(target))return;
 endAllyTargetPick();pick.onPick(target);
}
function cancelAllyTargetPick(){
 if(!allyTargetPick||logBusy())return;
 const pick=endAllyTargetPick();pendingSpell=null;choosingRow=false;render();pick.onCancel();
}
function renderAllyTargetPick(focusedTarget){
 const pick=allyTargetPick,party=$('#party');
 $('#allytargetbar').hidden=!pick;
 party.setAttribute('role',pick?'group':'button');
 party.setAttribute('tabindex',pick?'-1':'0');
 party.setAttribute('aria-label',pick?'味方の対象選択':'パーティーを開く');
 party.setAttribute('aria-haspopup',pick?'false':'dialog');
 if(!pick)return;
 const candidates=logBusy()?[]:pick.candidates();
 $('#allytargetprompt').textContent='対象を選んでください：'+pick.prompt;
 $('#allytargetcancel').disabled=logBusy();
 $('#allytargetcancel').onclick=cancelAllyTargetPick;
 document.querySelectorAll('#allytargetfallback button,#allytargetfallback select').forEach(el=>el.disabled=logBusy());
 document.querySelectorAll('#party .card').forEach((card,i)=>{
  const available=candidates.includes(i);
  card.dataset.allyTarget=String(i);
  card.classList.toggle('targetable',available);card.classList.toggle('untargetable',!available);
  card.setAttribute('role','button');card.setAttribute('tabindex',available?'0':'-1');
  card.setAttribute('aria-disabled',String(!available));
  card.setAttribute('aria-label',`${NAMES[i]}を対象に選ぶ HP ${(displayVitals?.hp||s.hp)[i]}/${shownMember(i).maxHP}`);
 });
 if(focusedTarget!==undefined)($('#party .targetable[data-ally-target="'+focusedTarget+'"]')||$('#party .targetable'))?.focus();
}
function partyTargetEvent(e){
 if(!allyTargetPick)return false;
 if(e.type==='click'||e.key==='Enter'||e.key===' '){
  e.preventDefault();const card=e.target.closest('[data-ally-target]');if(card)pickAllyTarget(+card.dataset.allyTarget);
 }
 return true;
}
let commandIndex=0,commandConfirmed=[],choosingRow=false,pendingSpell=null;
function commandMembers(){return s.members.map((m,i)=>i).filter(i=>s.hp[i]>0&&!s.ailments[i].paralysis)}
function resetCommandEntry(){endAllyTargetPick();commandIndex=0;commandConfirmed=[];choosingRow=false;pendingSpell=null}
function confirmCommand(i){if(!s.enemy||logBusy())return;commandConfirmed[i]=true;commandIndex=commandMembers().indexOf(i)+1;choosingRow=false;pendingSpell=null;render()}
function commandSummary(i){let c=s.commands[i];if(c==='dispel')return '呪いを解く';if(c==='guard')return '守る';if(c==='spell')return magic(s.magicPlans[i]?.id)?.name||'呪文';if(c==='item')return weapon(s.itemPlans[i]?.id)?.name||'アイテム';let g=enemyGroups().find(g=>String(g.key)===String(s.attackRows[i]));return '戦う'+(g?' → '+(g.index+1)+'列':'')}
function renderCommandEntry(){let box=$('#commandentry'),members=commandMembers(),i=members[commandIndex],busy=logBusy(),ready=i===undefined;box.hidden=!visibleCombat();if(box.hidden)return;let disabled=busy?'disabled':'';box.innerHTML=busy?'<div>戦闘中</div>':ready?`<b class="commandheading">行動確認</b><div class="commandchoices"><button id="attack">この行動で戦う</button><button data-command-back>戻る</button></div>`:`<b class="commandheading">${NAMES[i]}：${pendingSpell?pendingSpell.name:choosingRow?'戦う':'行動'} <small>${commandIndex+1} / ${members.length}</small></b><div class="commandchoices">${pendingSpell?spellTargetButtons(pendingSpell):choosingRow?reachableEnemyGroups(i).map(g=>`<button data-row-choice="${g.key}">${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>e.hp>0).length}</button>`).join(''):`${canWeaponAttack(i)?'<button data-command-choice="fight">戦う</button>':''}<button data-command-choice="guard">守る</button>${jobOf(i)===2?'<button data-command-choice="dispel">呪いを解く</button>':''}${hasSpells(i)?'<button data-command-choice="spell">呪文</button>':''}${medicineSlots(i).length?'<button data-command-choice="item">アイテム</button>':''}`}</div><button data-command-back ${commandIndex===0&&!choosingRow&&!pendingSpell&&!allyTargetPick?'disabled':''}>戻る</button>`;
 let popup=$('#commandreviewpopup');popup.hidden=!ready||busy||!s.enemy;popup.innerHTML=popup.hidden?'':`<b>行動確認</b><table class="commandreview" aria-label="選択した行動"><tbody>${members.map(j=>`<tr><th scope="row">${NAMES[j]}</th><td>${commandSummary(j)}</td></tr>`).join('')}</tbody></table>`;
 if(ready&&!busy){$('#attack').onclick=attack;$('#attack').hidden=false;$('#attack').disabled=false;}else if($('#attack'))$('#attack').hidden=true;$('#flee').hidden=busy||ready||!!allyTargetPick;
 box.onclick=e=>{if(logBusy()||!s.enemy)return;if(e.target.closest('[data-command-back]')){if(allyTargetPick){cancelAllyTargetPick();return}if(pendingSpell)pendingSpell=null;else if(choosingRow)choosingRow=false;else commandIndex=Math.max(0,commandIndex-1);render();return}let st=e.target.closest('[data-spell-target]');if(st&&pendingSpell){if(allyTargetPick){pickAllyTarget(+st.dataset.spellTarget);return}if(!validMagicTarget(pendingSpell,+st.dataset.spellTarget))return;s.commands[i]='spell';s.magicPlans[i]={id:pendingSpell.id,target:+st.dataset.spellTarget};confirmCommand(i);return}if(allyTargetPick)return;let row=e.target.closest('[data-row-choice]');if(row){if(!reachableEnemyGroups(i).some(g=>String(g.key)===row.dataset.rowChoice))return;s.commands[i]='fight';s.attackRows[i]=row.dataset.rowChoice;confirmCommand(i);return}let b=e.target.closest('[data-command-choice]');if(!b)return;let c=b.dataset.commandChoice;if(c==='fight'){if(!canWeaponAttack(i))return;let groups=reachableEnemyGroups(i);if(groups.length===1){s.commands[i]='fight';s.attackRows[i]=groups[0].key;confirmCommand(i)}else{choosingRow=true;render()}}else if(c==='dispel'){s.commands[i]='dispel';confirmCommand(i)}else if(c==='guard'){s.commands[i]='guard';confirmCommand(i)}else if(c==='spell')openMagic(i);else openMedicine(i)};
}

function spellTargets(x){if(x.target==='ally')return allyTargetCandidates().map(i=>[i,`${NAMES[i]} ${s.hp[i]}/${maxHP(i)}`]);if(x.target==='enemy'||x.target==='group')return enemyGroups().filter(g=>g.units.some(e=>e.hp>0)).map(g=>[g.units.find(e=>e.hp>0).uid,`${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>e.hp>0).length}`]);return []}
function spellTargetButtons(x){return spellTargets(x).map(([id,name])=>`<button data-spell-target="${id}">${name}</button>`).join('')}
function chooseBattleSpell(i,x){if(!s.enemy||logBusy()||spellReason(i,x))return;$('#magicdialog').close();let options=spellTargets(x);if(x.target==='ally'){pendingSpell=x;choosingRow=false;beginAllyTargetPick({candidates:allyTargetCandidates,prompt:x.name,onPick:t=>commitMagicChoice(i,x,t),onCancel:()=>$('#commandentry [data-command-choice="spell"]')?.focus()});return}if(options.length>1){pendingSpell=x;choosingRow=false;render()}else{s.commands[i]='spell';s.magicPlans[i]={id:x.id,target:options.length?options[0][0]:null};confirmCommand(i)}}
