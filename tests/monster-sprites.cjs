const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inflateSync } = require('node:zlib');
const { game } = require('../scripts/sim/harness.cjs');
const g = game();

const races = Object.fromEntries(g.run('Array.from(RACE_SPRITES)'));
const expected = {
  不定形: 'futeikei.png', 不死: 'fushi.png', 獣: 'kemono.png', 人型: 'hitogata.png',
  虫: 'mushi.png', 構造体: 'kouzoutai.png', 悪魔: 'akuma.png', 魔獣: 'majuu.png',
  竜: 'ryuu.png', 植物: 'shokubutu.png',
};
assert.deepEqual(races, expected);
const enemies = g.run('ENEMIES');
const ids = [...enemies].map(e => e.id);
const registered = g.run('Array.from(MONSTER_SPRITES)');
assert.equal(ids.length, 114);
assert.equal(new Set(ids).size, ids.length);
assert.equal(registered.length, new Set(registered).size);
assert.deepEqual([...registered].sort(), [...ids].sort());
assert.equal(g.run('MONSTER_SPRITES.size'), 114);
const uniqueDir = path.join(__dirname, '../dist/assets/monsters');
assert.deepEqual(fs.readdirSync(uniqueDir).filter(f => f.endsWith('.png')).sort(), ids.map(id => id+'.png').sort());
for (const { id, race } of enemies) {
  assert.ok(Object.hasOwn(races, race), id);
  assert.equal(g.run(`enemySpritePath({id:${JSON.stringify(id)},identified:false})`),
    'assets/monsters/unknown/' + expected[race], id);
  assert.equal(g.run(`enemySpritePath({id:${JSON.stringify(id)}})`),
    'assets/monsters/unknown/' + expected[race], id);
  assert.equal(g.run(`enemySpritePath({id:${JSON.stringify(id)},identified:true})`),
    'assets/monsters/' + id + '.png', id);
}
// An unregistered monster keeps its race sprite even after identification.
g.run("MONSTER_SPRITES.delete('slime')");
assert.equal(g.run("enemySpritePath({id:'slime',identified:true})"), 'assets/monsters/unknown/futeikei.png');
g.run("MONSTER_SPRITES.add('slime')");
assert.equal(g.run("enemySpritePath({id:'slime',identified:true})"), 'assets/monsters/slime.png');
// Unidentified groups never put the monster ID into the scene markup.
const hidden = g.run("drawEnemies([{units:[{id:'succubus',uid:5}]},{units:[{id:'dragon',uid:6,identified:true}]}])");
assert.match(hidden.sprites, /data-enemy-uid="5" src="assets\/monsters\/unknown\/akuma\.png"/);
assert.match(hidden.sprites, /data-enemy-uid="6" src="assets\/monsters\/dragon\.png"/);
assert.doesNotMatch(hidden.sprites, /succubus/);
// A failed unique image falls back to the frame and icon, like a failed race image.
g.run("failedEnemySprites.add('assets/monsters/dragon.png')");
const failed = g.run("drawEnemies([{units:[{id:'dragon',uid:8,identified:true}]}])");
assert.equal(failed.sprites, '');
assert.match(failed.frames, /data-enemy-uid="8"><rect x="266" y="160" width="108" height="121"/);
assert.ok(failed.frames.includes('>'+g.run("enemyDefinition('dragon').icon")+'</text>'));
assert.match(g.run("drawEnemies([{units:[{id:'dragon',uid:8}]}])").sprites, /src="assets\/monsters\/unknown\/ryuu\.png"/);
g.run("failedEnemySprites.clear()");
g.run("enemyDefinition('wolf').race='未登録'");
const fallback = g.run("drawEnemies([{units:[{id:'wolf',uid:9}]}])");
assert.equal(fallback.sprites, '');
assert.match(fallback.frames, /data-enemy-uid="9"><rect x="266" y="160" width="108" height="121"/);
assert.match(fallback.frames, /<text x="320" y="244\.5"/);
assert.ok(fallback.frames.includes('>'+g.run("enemyDefinition('wolf').icon")+'</text>'));
console.log('PASS all 114 unique sprites registered with PNGs, identified-only unique paths, failure and unknown race fallback');

// Reverse the PNG row filters for the bundled non-interlaced, 8-bit RGBA sprites.
function paeth(a, b, c) {
  const p = a+b-c, da = Math.abs(p-a), db = Math.abs(p-b), dc = Math.abs(p-c);
  if (da <= db && da <= dc) return a;
  return db <= dc ? b : c;
}
function checkPixels(file, dir = 'unknown') {
  const png = fs.readFileSync(path.join(__dirname, '../dist/assets/monsters', dir, file));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file);
  assert.equal(png.toString('ascii', 12, 16), 'IHDR', file);
  assert.equal(png.readUInt32BE(16), 48, file);
  assert.equal(png.readUInt32BE(20), 48, file);
  assert.deepEqual([...png.subarray(24, 29)], [8, 6, 0, 0, 0], file);
  const chunks = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    if (png.toString('ascii', offset+4, offset+8) === 'IDAT') {
      chunks.push(png.subarray(offset+8, offset+8+length));
    }
    offset += length+12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = 48*4;
  assert.equal(raw.length, 48*(1+stride), file);
  let prev = Buffer.alloc(stride), transparent = false;
  const grays = new Set();
  for (let offset = 0; offset < raw.length; offset += stride+1) {
    const filter = raw[offset], row = raw.subarray(offset+1, offset+1+stride);
    assert.ok(filter <= 4, file);
    for (let x = 0; x < stride; x++) {
      const left = x < 4 ? 0 : row[x-4], up = prev[x], corner = x < 4 ? 0 : prev[x-4];
      const predictors = [0, left, up, (left+up)>>1, paeth(left, up, corner)];
      row[x] += predictors[filter];
    }
    for (let x = 0; x < stride; x += 4) {
      const [r, green, b, alpha] = row.subarray(x, x+4);
      assert.ok(r === green && r === b && [0, 85, 170, 255].includes(r), file);
      if (alpha === 0) transparent = true;
      else grays.add(r);
    }
    prev = row;
  }
  assert.ok(transparent, file);
  assert.ok(grays.size > 0, file);
}
Object.values(races).forEach(file => checkPixels(file));
ids.forEach(id => checkPixels(id+'.png', ''));
for (const id of ids) {
  assert.ok(fs.readFileSync(path.join(uniqueDir, id+'.png'))
    .equals(fs.readFileSync(path.join(__dirname, '../art-src/monster-sprites-v3', id+'.png'))), id);
}
console.log('PASS all 10 race and 114 unique sprite PNGs decode to transparent 48x48 images with four grayscale levels');

for (const [width,height,dpr,want] of [
  [640,400,1,192], [640,200,2,120], [280,200,1,75.46875], [280,200,2,72], [40,100,1,10.78125]
]) {
  assert.equal(g.run(`enemySpriteSize(${width},${height},${dpr})`), want);
}
console.log('PASS sprite sizing respects wall bounds, DPR and conditional pixel rounding');

const defs = g.run("$('#enemy-sprite-filters').innerHTML");
const themeColors = {green:'829079', blue:'7d86b5', yellow:'b59a5e', orange:'c08d54', red:'bd7268', purple:'9a7fc0'};
for (const [theme, color] of Object.entries(themeColors)) {
  const filter = defs.match(new RegExp(`<filter id="enemy-${theme}" color-interpolation-filters="sRGB">(.*?)</filter>`))[1];
  for (const [i, channel] of ['R', 'G', 'B'].entries()) {
    const mid = parseInt(color.slice(2*i, 2*i+2), 16)/255;
    const values = filter.match(new RegExp(`<feFunc${channel} type="table" tableValues="([^"]+)"`))[1];
    assert.deepEqual(values.split(' ').map(Number), [mid*.1, mid*.45, mid, mid*.4+.6]);
  }
  assert.doesNotMatch(filter, /feFuncA/);
}
console.log('PASS six sRGB sprite filters map the four input levels and preserve alpha');

g.run(`s.area='dungeon';s.pos=3*size()+3;s.dir=0;s.light=true;
  for(const i of [target(),target(-1),target(1),...diagonalSight()]){
    Object.assign(s.cells[i],{open:false,safe:false,spent:false,disarmed:false,flag:false,type:'',chest:null});
  }
  s.cells[target(-1)].flag='power';s.cells[target(1)].open=true;
  s.enemy=null;displayCombat={units:[{id:'slime',uid:7,hp:0}]};scene()`);
const battle = g.run("$('#scene').innerHTML");
assert.match(battle, /<\/svg><div class="combat-shade" aria-hidden="true"><\/div><img class="enemy-sprite"/);
assert.match(battle, /data-enemy-uid="7"/);
assert.match(battle, /<text x="96"[^>]*>⚑</);
assert.doesNotMatch(battle, /<text x="(?:320|544|229|411)"/);
assert.equal((battle.match(/class="透視"/g) || []).length, 2);
const after = g.run("displayCombat=undefined;scene();$('#scene').innerHTML");
for (const x of [320,229,411]) assert.match(after, new RegExp(`<text x="${x}"[^>]*>？</text>`));
assert.match(after, /<text x="544"[^>]*>\d+<\/text>/);
assert.doesNotMatch(after, /data-enemy-uid/);
assert.doesNotMatch(after, /class="combat-shade"/);
console.log('PASS combat snapshots control shade and wall symbols through the last log, side flags remain');

// Replay through log()/pumpLog(): the live unit is already identified, but the frame
// for the earlier unidentified snapshot must not leak the unique sprite or name.
const replay = game();
replay.run(`s.area='dungeon';s.pos=3*size()+3;s.dir=0;s.light=true;
  s.enemy={units:[{id:'slime',uid:21,row:0,hp:5,maxHp:5,identified:false}]};
  displayCombat=undefined;logQueue=[];logTimer=null;
  log('未識別のフレーム');s.enemy.units[0].identified=true;log('識別済みのフレーム')`);
assert.deepEqual([...replay.run('logQueue.map(e=>e.enemy.units[0].identified)')], [false, true]);
assert.equal(replay.run('s.enemy.units[0].identified'), true);
replay.run('pumpLog()');
assert.equal(replay.run('visibleCombat().units[0].identified'), false);
const hiddenFrame = replay.run("$('#scene').innerHTML");
assert.match(hiddenFrame, /data-enemy-uid="21" src="assets\/monsters\/unknown\/futeikei\.png"/);
assert.doesNotMatch(hiddenFrame, /assets\/monsters\/slime\.png/);
assert.doesNotMatch(hiddenFrame, /slime/);
assert.ok(!hiddenFrame.includes(replay.run("enemyDefinition('slime').name")));
assert.ok(hiddenFrame.includes('1：'+replay.run('UNKNOWN_NAMES.slime')+' ×1(1)'));
replay.run('pumpLog()');
const knownFrame = replay.run("$('#scene').innerHTML");
assert.match(knownFrame, /data-enemy-uid="21" src="assets\/monsters\/slime\.png"/);
assert.ok(knownFrame.includes('1：'+replay.run("enemyDefinition('slime').name")+' ×1(1)'));
replay.run('pumpLog()');
assert.equal(replay.run('displayCombat'), undefined);
assert.match(replay.run("$('#scene').innerHTML"), /data-enemy-uid="21" src="assets\/monsters\/slime\.png"/);
console.log('PASS log replay shows the race sprite and unknown name until the identified snapshot');
