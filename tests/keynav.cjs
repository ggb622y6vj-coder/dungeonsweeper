const assert=require('node:assert/strict');
const nav=require('../dist/keynav.js');
function element(x,y,width=40,height=40){return {
 disabled:false,clicks:0,
 getBoundingClientRect:()=>({left:x,top:y,width,height}),
 click(){this.clicks++},getAttribute(){return null}
};}
// Two columns, three rows; coordinates deliberately differ from DOM order.
const [a,b,c,d,e,f]=[element(0,0),element(100,0),element(0,80),element(100,80),element(0,160),element(100,160)];
const grid=[f,b,d,a,e,c];
for(const [key,from,to] of [
 ['w',c,a],['W',e,c],['s',a,c],['S',c,e],['a',d,c],['A',f,e],['d',c,d],['D',e,f],
 ['ArrowUp',f,d],['ArrowDown',b,d],['ArrowLeft',b,a],['ArrowRight',a,b],
 ['w',a,a],['s',f,f],['a',c,c],['d',d,d]
])assert.equal(nav.nearest(from,grid,nav.direction(key)),to,key);
assert.equal(nav.nearest(null,grid,'down'),f);
assert.equal(nav.nearest(null,[],'down'),null);
assert.equal(nav.direction('e'),null);
// Euclidean distance in the directional half-plane, measured from centers.
const origin=element(0,0),diagonal=element(35,25),far=element(150,0);
assert.equal(nav.nearest(origin,[origin,far,diagonal],'right'),diagonal);
const wide=element(-100,100,240,40),narrow=element(40,100);
assert.equal(nav.nearest(origin,[origin,narrow,wide],'down'),wide);
// 040 town menu: a full-width button above a 2-column grid must not win A/D
// between the columns (it is closer by center distance but off the row band).
const entrance=element(360,276,560,64),training=element(360,352,274,52),tavern=element(646,352,274,52);
const smith=element(360,416,274,52),temple=element(646,416,274,52),library=element(360,480,560,52);
const town=[entrance,training,tavern,smith,temple,library];
for(const [way,from,to] of [['right',training,tavern],['left',tavern,training],['right',smith,temple],['left',temple,smith],
 ['down',entrance,training],['up',training,entrance],['up',tavern,entrance],['down',smith,library],['down',temple,library],['up',library,smith]])
 assert.equal(nav.nearest(from,town,way),to,`town ${way}`);
b.disabled=true;b.title='沈黙している';
assert.equal(nav.nearest(a,grid,'right'),b,'disabled stays navigable');
assert.equal(nav.activate(b),false);assert.equal(b.clicks,0);assert.equal(b.title,'沈黙している');
assert.equal(nav.activate(a),true);assert.equal(a.clicks,1);
assert.equal(nav.activate(null),false);
const unavailable=element(0,0);unavailable.getAttribute=k=>k==='aria-disabled'?'true':null;
assert.equal(nav.activate(unavailable),false);assert.equal(unavailable.clicks,0);
const fieldsetChild=element(0,0);fieldsetChild.matches=s=>s===':disabled';
assert.equal(nav.activate(fieldsetChild),false);
for(const modifier of ['ctrlKey','altKey','metaKey','isComposing','defaultPrevented']){
 for(const key of ['w','ArrowDown',' ','Enter','Escape'])assert(nav.ignores({key,[modifier]:true}),`${modifier} ${key}`);
}
assert.equal(nav.ignores({key:'Escape'}),false);
for(const tag of ['input','textarea','select'])assert(nav.editing({matches:selector=>selector.split(',').includes(tag)}));
assert.equal(nav.editing({matches:()=>false}),false);
// The pointer handler clears the ring without changing focus, disabled state,
// click routes, or any gameplay data. No synthetic mouse input is needed in the
// keyboard-only browser suite.
const rings=[new Set(['kfocus','other']),new Set(['kfocus'])],root=new Set(['keynav-keyboard']);
nav.clearKeyboardFocus({documentElement:{classList:{remove:c=>root.delete(c)}},
 querySelectorAll:()=>rings.map(classes=>({classList:{remove:c=>classes.delete(c)}}))});
assert(!root.has('keynav-keyboard'));assert(rings.every(s=>!s.has('kfocus')));assert(rings[0].has('other'));
console.log('PASS keynav: 2×3 spatial navigation, edges, centers, disabled focus/activation, modifier/input guards, pointer ring removal');
// 041: battle command grid (2 columns above a full-width back button).
{
 const box=(x,y,w,h)=>({getBoundingClientRect:()=>({left:x,top:y,width:w,height:h,right:x+w,bottom:y+h})});
 const fight=box(113,531,317,44),guard=box(437,531,317,44),dispel=box(113,582,317,44),spell=box(437,582,317,44),item=box(113,633,317,44),back=box(113,683,642,48);
 const items=[fight,guard,dispel,spell,item,back];
 // 038's centre distance alone picked the wide back button; 040 band priority in nearest() now agrees with gridMove.
 assert.equal(nav.nearest(fight,items,'right'),guard,'band priority keeps D on the same row');
 assert.equal(nav.nearest(item,items,'right'),back,'no same-row item: centre-distance fallback');
 assert.equal(nav.gridMove(fight,items,'right'),guard);
 assert.equal(nav.gridMove(guard,items,'down'),spell);
 assert.equal(nav.gridMove(spell,items,'left'),dispel);
 assert.equal(nav.gridMove(item,items,'down'),back);
 assert.equal(nav.step(fight,items,'up'),fight);
 assert.equal(nav.step(back,items,'down',true),fight);
}
console.log('PASS 041 keynav grid/step');
