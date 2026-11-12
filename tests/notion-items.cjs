// 079: Compare every item against the canonical Notion snapshot, keyed by stable ID.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),ctx={};vm.createContext(ctx);
for(const file of ['weapons','items'])vm.runInContext(fs.readFileSync(path.join(root,'dist',file+'.js'),'utf8'),ctx);
const items=JSON.parse(vm.runInContext('JSON.stringify([...WEAPONS,...MEDICINES])',ctx));
const rows=JSON.parse(fs.readFileSync(path.join(root,'data/notion-items.json'),'utf8'));
const unesc=t=>String(t??'').replace(/<\/?p>/g,'').replace(/<br\s*\/>/g,'').replace(/\\([\\{}\[\]^*_])/g,'$1').trim();
const dice=t=>{const m=/^(\d+)d(\d+)(?:\+(\d+))?$/.exec(t);assert.ok(m,'bad dice '+t);return [+m[1],+m[2],+(m[3]||0)]};
const JOB={戦士:0,魔法使い:1,僧侶:2,盗賊:3,侍:4,君主:5,忍者:6,司教:7},PART={'防具(頭)':'head','防具(胴)':'body','防具(足)':'feet'};
const diffs=[],eq=(where,a,b)=>{try{assert.deepEqual(a,b)}catch{diffs.push(`${where}: game=${JSON.stringify(a)} notion=${JSON.stringify(b)}`)}};
assert.equal(rows.length,81);assert.equal(items.length,81);
assert.equal(new Set(rows.map(r=>r['userDefined:ID'])).size,rows.length);
assert.equal(new Set(items.map(w=>w.id)).size,items.length);
for(const r of rows){
 const id=r['userDefined:ID'],w=items.find(w=>w.id===id);if(!w){diffs.push(id+' missing in game');continue}
 if(!Object.hasOwn(r,'スタック最大数'))diffs.push(id+' スナップショット未更新: スタック最大数がありません');
 else eq(id+'.stack',w.kind==='medicine'?w.stack:1,r['スタック最大数']);
 const effectText=unesc(r['効果']),desc=effectText.split(/追加効果：|特殊効果[:：]/)[1];
 const b={name:r['名前'],sell:r['売却額'],classes:JSON.parse(r['装備職']).map(j=>{assert.ok(j in JOB);return JOB[j]}).sort()};
 if(r['種類']==='薬'){
  const m=/宝箱 (\d+)F.*重み(\d+)/.exec(unesc(r['入手']));assert.ok(m,id+' medicine source');
  Object.assign(b,{kind:'medicine',minFloor:+m[1],weight:+m[2]});
 }else{
  const m=/minFloor\s+(\d+)/.exec(unesc(r['備考']));assert.ok(m,id+' minFloor');b.minFloor=+m[1];
  b.part=PART[r['種類']];b.shop=!/店売りなし/.test(r['入手']);
  if(w.dice){b.range=r['種類']==='武器(遠距離)'?'ranged':'melee';b.dice=dice(effectText.match(/^\d+d\d+(?:\+\d+)?/)[0]);
   b.hitBonus=+(effectText.match(/命中\+(\d+)/)?.[1]||0);b.minAttacks=+(effectText.match(/最低(\d+)回攻撃/)?.[1]||1);b.drop=true;
  }else{const ac=/^AC-(\d+)/.exec(effectText);assert.ok(ac,id+' AC');b.ac=+ac[1]}
  if(r['購入価格']!==undefined)b.price=r['購入価格'];else b.price=r['売却額']*2;
 }
 for(const [k,v] of Object.entries(b))eq(id+'.'+k,k==='classes'?[...w.classes].sort():k==='shop'?w.shop!==false:w[k],v);
 eq(id+'.effect presence',!!w.effect,!!desc);
 if(desc)eq(id+'.desc includes original text',typeof w.desc==='string'&&w.desc.includes(desc),true);
}
for(const w of items)if(!rows.some(r=>r['userDefined:ID']===w.id))diffs.push(w.id+' not in Notion');
if(diffs.length){console.error(diffs.join('\n'));assert.fail(`${diffs.length} Notion/game differences`)}
console.log('PASS notion-items: 81 items match the Notion snapshot, 0 differences');

// Descriptors are the contract for the separately implemented combat hooks.
const effects={flagaxe:{kind:'flagDamage'},mitibikinoono:{kind:'flagDamage'},mumeinoken:{kind:'zeroSwings'},zerosword:{kind:'zeroSwings'},flagsword:{kind:'flagMatchAC'},reversalblade:{kind:'flagMatchAC'},hatajirusinosentui:{kind:'victoryDisarm',chance:.1},sealinghammer:{kind:'victoryDisarm',chance:.1},surveyorstaff:{kind:'surveyor'},hatajirusinotanken:{kind:'victoryOpen',chance:.2},scoutingdagger:{kind:'victoryOpen',chance:1},eighteyespear:{kind:'numberDamage'},hatajirusinoyumi:{kind:'flagMatchFirstHit',pct:10},deductiondagger:{kind:'flagMatchFirstHit',pct:15},makyuu:{kind:'firstHitUnexplored',pct:25}};
const {game}=require('../scripts/sim/harness.cjs'),g=game();
g.run("const r=generateRecruit('冒険者',0);registerRecruit(r);changeRecruitParty(r.members.id,true)");
for(const [id,effect] of Object.entries(effects)){
 const w=items.find(w=>w.id===id);assert.deepEqual(w.effect,effect,id);assert.equal(w.shop,false);assert.equal(w.drop,true);
 assert.ok(g.run(`libraryItemDetails(weapon('${id}')).some(([label,text])=>label==='追加効果'&&text===weapon('${id}').desc)`));
 g.run(`s.inventory[0]=['${id}'];s.equipped[0]=0;inventoryMember=0;renderInventory()`);
 assert.ok(g.run(`$('#inventoryslots').innerHTML.includes(weapon('${id}').desc)`),id+' inventory');
 // Temporarily expose the dungeon-only item to exercise the shared shop detail renderer.
 g.run(`weapon('${id}').shop=true;weapon('${id}').classes=[0];renderShop()`);
 assert.ok(g.run(`$('#shopitems').innerHTML.includes(weapon('${id}').desc)`),id+' shop');
}
assert.equal(g.run("itemDescription(weapon('sword'))"),'1d6+2 · 近距離');
assert.equal(g.run("libraryItemDetails(weapon('sword')).some(([label])=>label==='追加効果')"),false);
console.log('PASS notion-items: 15 descriptors and library/shop/inventory descriptions; ordinary weapon display unchanged');

for(const w of items){
 const details=JSON.parse(g.run(`JSON.stringify(libraryItemDetails(weapon('${w.id}')))`));
 assert.equal(details[0][0],'職業');
 assert.ok(!details.some(([label])=>label==='種類'));
 assert.ok(!details.find(([label])=>label==='価格')[1].includes('基準価格'));
 if(w.dice)assert.ok(!/近距離|遠距離/.test(details.find(([label])=>label==='性能')[1]));
}
