// Saves older than the first published build are no longer converted. They must
// still fail safe: never crash at boot and never be padded with invented members.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty,seededRandom}=require('../scripts/sim/combat.cjs');

const source=game(null,seededRandom(1116));createParty(source,[0,1,2,3,0,2]);source.drain();
source.run("fresh(1);s.area='dungeon';save()");
const roster=JSON.parse(source.run("localStorage.getItem('ash-v1')"));
const parallel=JSON.parse(source.run('JSON.stringify(s)'));

// Current format: untouched by the cleanup.
let g=game(JSON.stringify(roster));
assert.equal(g.run('s.members.length'),6);
assert.deepEqual(JSON.parse(g.run('JSON.stringify(s.members.map(m=>m.id))')),roster.partyIds);

// Pre-roster parallel arrays still load as they are.
g=game(JSON.stringify(parallel));
assert.equal(g.run('s.members.length'),6);
assert.equal(g.run('s.members.map(m=>m.name).join()'),parallel.members.map(m=>m.name).join());

// A three-member save is kept at three members instead of being padded to six.
const three=structuredClone(parallel);delete three.partyVersion;
for(const key of ['members','hp','mp','inventory','equipped','armor','ailments'])three[key]=three[key].slice(0,3);
g=game(JSON.stringify(three));
assert.equal(g.run('s.members.length'),3);
assert.equal(g.run('s.members.map(m=>m.name).join()'),three.members.map(m=>m.name).join());
g.run('render();save()');
assert.equal(JSON.parse(g.run("localStorage.getItem('ash-v1')")).roster.length,3);

// No member list at all: start a new game rather than crash.
const ancient=structuredClone(parallel);
for(const key of ['members','hp','mp','inventory','equipped','armor','ailments','reserve','partyVersion'])delete ancient[key];
ancient.spell=2;ancient.heal=1;
g=game(JSON.stringify(ancient));
assert.equal(g.run('s.area'),'town');
assert.equal(g.run('s.members.length'),0);
g.run('render()');

// A battle without a unit list cannot be resumed and is dropped.
const oldBattle=structuredClone(roster);oldBattle.enemy={boss:false,hp:11};
g=game(JSON.stringify(oldBattle));
assert.equal(g.run('s.enemy'),null);
assert.equal(g.run('s.members.length'),6);
g.run('render()');

// An unfinished current-format battle is preserved.
const battle=structuredClone(roster);battle.enemy={dataVersion:1,boss:false,target:0,initiative:'normal',flagEffect:{},units:[{id:'slime',uid:1,row:1,hp:3,rewarded:false}]};
g=game(JSON.stringify(battle));
assert.equal(g.run('s.enemy.units[0].id'),'slime');

// A save actually written by the first published build (commit 88b675f, the
// 2026-11-01 GitHub Pages release: pre-roster parallel format, partyVersion 1)
// still loads with its party intact and re-saves in the current format.
const firstPublic=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'fixtures','first-public-save.json'),'utf8'));
g=game(JSON.stringify(firstPublic));
assert.equal(g.run('s.members.length'),6);
assert.equal(g.run('s.members.map(m=>m.name).join()'),firstPublic.members.map(m=>m.name).join());
g.run('render();save()');
assert.equal(JSON.parse(g.run("localStorage.getItem('ash-v1')")).rosterVersion,1);
assert.equal(game(g.run("localStorage.getItem('ash-v1')")).run('s.members.length'),6);

// A member list without one of its parallel arrays is an unsupported format:
// it must fail safe to a new game instead of crashing at boot.
for(const key of ['hp','mp','inventory','equipped','armor','ailments']){
  const broken=structuredClone(parallel);delete broken[key];
  g=game(JSON.stringify(broken));
  assert.equal(g.run('s.members.length'),0,key);
  assert.equal(g.run('s.area'),'town',key);
  g.run('render()');
}
console.log('PASS pre-publication saves fail safe; roster and parallel saves load unchanged');
