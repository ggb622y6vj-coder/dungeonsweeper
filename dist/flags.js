const FLAG_KINDS=['power','guard','magic'];
const FLAG_CHANCE_PER=.04,FLAG_CHANCE_CAP=.40;
const FLAG_NAMES={power:'怪力の旗',guard:'堅牢の旗',magic:'呪禁の旗'};
const FLAG_COLORS={power:'#ffaaaa',guard:'#acd2ff',magic:'#d9b7ff'};
function placedFlag(c){return FLAG_KINDS.includes(c.flag)?c.flag:(s.flagKind||'power')}
function flagEffect(){let counts={power:0,guard:0,magic:0},curses=[];for(let c of s.cells.filter(c=>c.flag)){let kind=placedFlag(c);if(c.trap)counts[kind]++;else if(!curses.includes(kind))curses.push(kind)}return {counts,curses,bad:!!curses.length}}
function currentFlagEffect(){let f=s.enemy?.flagEffect;if(!s.enemy)return flagEffect();if(!f)return {counts:{},curses:[],bad:false};if(f.counts)return f;return {counts:{[f.kind]:f.count},curses:f.bad?[f.kind]:[],bad:f.bad}}
function flagChance(f,kind){return Math.min(FLAG_CHANCE_CAP,FLAG_CHANCE_PER*(f?.counts?.[kind]||0))}
function flagProc(kind){let f=currentFlagEffect();return !f.bad&&flagChance(f,kind)>0&&Math.random()<flagChance(f,kind)}
function flagDamage(value,incoming=false){if(!s.enemy)return value;let f=currentFlagEffect(),kind=incoming?'guard':'power';if(f.curses.includes(kind))return Math.max(1,incoming?Math.round(value*1.5):Math.floor(value*.65));if(!flagProc(kind))return value;log(FLAG_NAMES[kind]+'がはためいた！');return Math.max(1,Math.round(value*(incoming?.5:1.5)))}
function flagSpellCost(cost){return s.enemy&&currentFlagEffect().curses.includes('magic')?Math.ceil(cost*1.5):cost}
function flagConsumeMP(i,cost){if(flagProc('magic')){log('呪禁の旗がはためいた！');s.mp[i]-=Math.ceil(cost/2);return}s.mp[i]-=flagSpellCost(cost)}
function renderFlags(){let kind=s.flagKind||'power';for(let id of ['#flagopen','#mapflagopen']){let b=$(id);b.textContent='⚑ '+FLAG_NAMES[kind];b.className='flag-button flag-'+kind;b.title=FLAG_NAMES[kind]+'：押すと切り替え';b.disabled=!!s.enemy||!!visibleCombat()||logBusy();b.setAttribute('aria-label',FLAG_NAMES[kind]+'：種類を切り替え')}}
function flagUI(){for(let id of ['#flagopen','#mapflagopen'])$(id).onclick=()=>{if(s.enemy||visibleCombat()||logBusy())return;s.flagKind=FLAG_KINDS[(FLAG_KINDS.indexOf(s.flagKind||'power')+1)%FLAG_KINDS.length];render()}}
