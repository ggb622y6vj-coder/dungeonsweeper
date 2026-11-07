// 072: data/notion-*.json (Notion monster/spell DB snapshots) must match the game data field by field.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'dist/monster-data.js'),'utf8')+';this.ENEMIES=ENEMIES',ctx);
vm.runInContext(fs.readFileSync(path.join(root,'dist/spells.js'),'utf8')+';this.MAGIC=MAGIC',ctx);
const ENEMIES=JSON.parse(JSON.stringify(ctx.ENEMIES)),MAGIC=JSON.parse(JSON.stringify(ctx.MAGIC));
const nm=JSON.parse(fs.readFileSync(path.join(root,'data/notion-monsters.json'),'utf8'));
const ns=JSON.parse(fs.readFileSync(path.join(root,'data/notion-spells.json'),'utf8'));
const unesc=t=>String(t??'').replace(/<[^>]*>/g,'').replace(/[”“]/g,'"').replace(/\\([\\{}\[\]^*_])/g,'$1').trim();
const dice=t=>{const m=/^(\d+)d(\d+)(?:\+(\d+))?$/.exec(t);assert.ok(m,'bad dice '+t);return [+m[1],+m[2],+(m[3]||0)]};
const pct=t=>Math.round(parseFloat(t)*1000)/100000;
const STATUS={毒:'poison',麻痺:'paralysis',石化:'stone',恐怖:'fear'};
const diffs=[];const eq=(where,a,b)=>{try{assert.deepEqual(a,b)}catch{diffs.push(`${where}: game=${JSON.stringify(a)} notion=${JSON.stringify(b)}`)}};
function notionMonster(r){
  const o={statuses:[],rear:false,flee:0,summon:0,steal:0,drain:0,death:0,resist:[],breath:null,spell:0,spellInfo:null,summonCap:null};
  for(let part of unesc(r['特殊']).split(/\s+\/(?:\s+|$)/).map(x=>x.trim()).filter(Boolean)){
    let m;
    if((m=/^(毒|麻痺|石化|恐怖)\/命中時(\d+)%$/.exec(part)))o.statuses.push({type:STATUS[m[1]],chance:pct(m[2])});
    else if(part==='後衛攻撃可')o.rear=true;
    else if((m=/^逃走(\d+)%$/.exec(part)))o.flee=pct(m[1]);
    else if((m=/^仲間呼び(\d+)%\(上限(\d+)\)$/.exec(part))){o.summon=pct(m[1]);o.summonCap=+m[2]}
    else if((m=/^アイテム奪取(\d+)%$/.exec(part)))o.steal=pct(m[1]);
    else if((m=/^Lv吸収(\d+)%$/.exec(part)))o.drain=pct(m[1]);
    else if((m=/^即死(\d+)%$/.exec(part)))o.death=pct(m[1]);
    else if(/^(毒無効|炎半減|氷半減)$/.test(part))o.resist.push(part);
    else if((m=/^ブレス\s*(\{.*\})$/.exec(part))){o.breath=JSON.parse(m[1]);const effect=/^(.+)[(（]命中時(\d+)[%％]で(毒|麻痺)状態にする[)）]$/.exec(o.breath.element);if(effect){o.breath.element=effect[1];o.breath.statuses=[{type:STATUS[effect[3]],chance:pct(effect[2])}]}}
    else if((m=/^呪文(\d+)%\s*(\{.*\})$/.exec(part))){o.spell=pct(m[1]);const j=JSON.parse(m[2]);o.spellInfo={id:j.id,target:j.target,dice:j.dice}}
    else diffs.push(`${r['userDefined:ID']}: unparsed 特殊 "${part}"`);
  }
  o.statuses.sort((a,b)=>a.type.localeCompare(b.type));o.resist.sort();
  const g=r['群れ'].split(/[〜～]/).map(Number);
  return {id:r['userDefined:ID'],name:r['名前'],unknown:r['不確定名'],floors:JSON.parse(r['出現階']).map(f=>parseInt(f)).sort((a,b)=>a-b),level:r.Lv,hp:dice(r.HP),ac:r.AC,hit:r['命中補正'],
    attack:dice(r['物理ダメージ']),xp:r['経験値'],groupSize:g.length===1?[g[0],g[0]]:g,gold:dice(r['金貨']),race:r['種族'],swings:r['攻撃回数'],
    mageResist:(r['魔法使い呪文抵抗']||0)/100,priestResist:(r['僧侶呪文抵抗']||0)/100,boss:/守護者/.test(r['備考']||''),...o};
}
function gameMonster(e){
  return {id:e.id,name:e.name,unknown:e.unknown,floors:e.floors,level:e.level,hp:e.hp,ac:e.ac,hit:e.hit,attack:e.attack,xp:e.xp,groupSize:e.groupSize,gold:e.gold,race:e.race,swings:e.swings,
    mageResist:e.mageResist,priestResist:e.priestResist,boss:e.boss,statuses:[...e.statuses].map(s=>({type:s.type,chance:s.chance})).sort((a,b)=>a.type.localeCompare(b.type)),
    rear:e.rear,flee:e.flee,summon:e.summon,steal:e.steal,drain:e.drain,death:e.death,resist:e.resistance==='なし'?[]:e.resistance.split('・').sort(),
    breath:e.breath,spell:e.spell,spellInfo:e.spellInfo&&{id:e.spellInfo.id,target:e.spellInfo.target,dice:e.spellInfo.dice},summonCap:e.summon?e.summonCap:null};
}
// Blank spell resistance and explicit zero remain equivalent.
for(const field of ['魔法使い呪文抵抗','僧侶呪文抵抗']){
  const row=nm.find(r=>r['userDefined:ID']==='takenoko');
  assert.deepEqual(notionMonster({...row,[field]:null}),notionMonster({...row,[field]:0}));
}
assert.equal(nm.length,100,'Notion monster rows');assert.equal(ENEMIES.length,100,'game monsters');
const gm=new Map(ENEMIES.map(e=>[e.id,e]));
for(const r of nm){const id=r['userDefined:ID'];if(!gm.has(id)){diffs.push(`monster ${id} missing in game`);continue}
  const a=gameMonster(gm.get(id)),b=notionMonster(r);for(const k of Object.keys(b))eq(`monster ${id}.${k}`,a[k],b[k])}
for(const e of ENEMIES)if(!nm.some(r=>r['userDefined:ID']===e.id))diffs.push(`monster ${e.id} not in Notion`);

if(!diffs.length)console.log('PASS notion-sync monsters: 100 definitions match the Notion snapshot field by field (0 differences)');
else {console.error(diffs.join('\n'));assert.fail(`${diffs.length} monster differences`)}

const JOB={魔法使い:1,僧侶:2},WHERE={探索:'field',戦闘:'battle','戦闘・探索':'both',宝箱:'chest'};
const TARGET={前方:'front',敵1体:'enemy',敵1列:'group',敵全体:'all',味方1人:'ally',味方全員:'party',階選択:'floor',宝箱:'chest'};
const where=t=>{const places=JSON.parse(t);return places.includes('探索')&&places.includes('戦闘')?'both':WHERE[places[0]]};
const value=t=>{t=unesc(t);if(!t)return null;const m=/^(\d+)d(\d+)(?:\+(\d+))?$/.exec(t);return m?(m[3]?[+m[1],+m[2],+m[3]]:[+m[1],+m[2]]):+t};
assert.equal(ns.length,41,'Notion spell rows');assert.equal(MAGIC.length,41,'game spells');
for(const r of ns){const id=r['userDefined:ID'],x=MAGIC.find(m=>m.id===id);if(!x){diffs.push(`spell ${id} missing in game`);continue}
  const mp=unesc(r.MP);
  // flagdebuff has a blank numeric cell; its description and 083 specify AC +1.
  const b={name:r['名前'],job:JOB[r['系統']],level:r['習得Lv'],mp:/^\d+$/.test(mp)?+mp:id==='dumapic'?2:parseInt(mp),guaranteed:r['確定習得']==='確定',
    where:where(r['使用場面']),target:TARGET[r['対象']],effect:r['効果種別'],value:id==='flagdebuff'&&!unesc(r['数値'])?1:value(r['数値']),description:unesc(r['説明'])};
  for(const k of Object.keys(b))eq(`spell ${id}.${k}`,x[k],b[k]);}
for(const x of MAGIC)if(!ns.some(r=>r['userDefined:ID']===x.id))diffs.push(`spell ${x.id} not in Notion`);
if(diffs.length){console.error(diffs.join('\n'));assert.fail(`${diffs.length} Notion/game differences`)}
console.log('PASS notion-sync: 100 monsters and 41 spells match the Notion snapshot field by field');
