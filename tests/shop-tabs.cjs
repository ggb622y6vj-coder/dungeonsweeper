const assert=require('node:assert/strict');
const fs=require('node:fs');
const {game}=require('../scripts/sim/harness.cjs');
const g=game(null,()=>.5);
g.run("for(const job of [0,1]){const r=generateRecruit('冒険者',job);registerRecruit(r);changeRecruitParty(r.members.id,true)}s.gold=10000;$('#blacksmith').onclick()");
assert.equal(g.run('shopTab'),'weapon');
for(const tab of ['weapon','head','body','feet']){
 g.run(`$('#shoptab-${tab}').onclick()`);
 const actual=g.run("$('#shopitems').innerHTML");
 const expected=JSON.parse(g.run("JSON.stringify(WEAPONS.filter(w=>w.shop!==false&&(w.part||'weapon')===shopTab&&w.classes.includes(jobOf(0))).map(w=>w.id))"));
 assert.deepEqual([...actual.matchAll(/data-buy="([^"]+)"/g)].map(x=>x[1]),expected);
 assert.equal(g.run(`$('#shoptab-${tab}').attributes['aria-selected']`),'true');
 assert.equal(g.run("$('#shopitems').attributes['aria-labelledby']"),'shoptab-'+tab);
}
g.run("$('#shopmember').value='1';$('#shopmember').onchange()");assert.equal(g.run('shopTab'),'feet');
g.run("$('#shopclose').onclick();$('#blacksmith').onclick()");assert.equal(g.run('shopTab'),'weapon');
g.run("var originalTimeout=setTimeout,noticeDelay;setTimeout=(fn,ms)=>{noticeDelay=ms;return originalTimeout(fn,ms)};$('#shopmember').value='0';renderShop();var beforeGold=s.gold,beforeCount=s.inventory[0].length;buy('helm',0)");
assert.equal(g.run('s.gold'),g.run("beforeGold-weapon('helm').price"));
assert.equal(g.run('s.inventory[0].length'),g.run('beforeCount+1'));
assert.equal(g.run("$('#shoppurchasemessage').textContent"),g.run("`${NAMES[0]}が${weapon('helm').name}を購入した。`"));
assert.equal(g.run("$('#shoppurchasedialog').open"),true);
assert.equal(g.run('SHOP_PURCHASE_NOTICE_MS'),500);
assert.equal(g.run('noticeDelay'),500);
g.drain();assert.equal(g.run("$('#shoppurchasedialog').open"),false);
g.run("s.gold=0;buy('helm',0)");assert.equal(g.run("$('#shoppurchasedialog').open"),false);
const source=fs.readFileSync('dist/game.js','utf8');
assert.match(source,/shoppurchasedialog'\).addEventListener\('cancel',e=>e.preventDefault\(\)\)/);
console.log('PASS shop tabs: classification, member persistence, reopen reset, purchase data and timed modal, failed purchase');
