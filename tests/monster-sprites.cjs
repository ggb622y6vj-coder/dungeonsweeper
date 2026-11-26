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
for (const { id, race } of g.run('ENEMIES')) {
  assert.ok(Object.hasOwn(races, race), id);
  for (const identified of [false, true]) {
    assert.equal(g.run(`enemySpritePath({id:${JSON.stringify(id)},identified:${identified}})`),
      'assets/monsters/unknown/' + expected[race], id);
  }
}
assert.equal(g.run('MONSTER_SPRITES.size'), 0);
g.run("MONSTER_SPRITES.add('slime')");
assert.equal(g.run("enemySpritePath({id:'slime',identified:false})"), 'assets/monsters/unknown/futeikei.png');
assert.equal(g.run("enemySpritePath({id:'slime',identified:true})"), 'assets/monsters/slime.png');
g.run("enemyDefinition('wolf').race='未登録'");
const fallback = g.run("drawEnemies([{units:[{id:'wolf',uid:9}]}])");
assert.equal(fallback.sprites, '');
assert.match(fallback.frames, /data-enemy-uid="9"><rect/);
assert.ok(fallback.frames.includes('>'+g.run("enemyDefinition('wolf').icon")+'</text>'));
console.log('PASS all monster race mappings, identified-only unique sprites and unknown race fallback');

// Reverse the PNG row filters for the bundled non-interlaced, 8-bit RGBA sprites.
function paeth(a, b, c) {
  const p = a+b-c, da = Math.abs(p-a), db = Math.abs(p-b), dc = Math.abs(p-c);
  if (da <= db && da <= dc) return a;
  return db <= dc ? b : c;
}
function checkPixels(file) {
  const png = fs.readFileSync(path.join(__dirname, '../dist/assets/monsters/unknown', file));
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
Object.values(races).forEach(checkPixels);
console.log('PASS all 10 sprite PNGs decode to transparent 48x48 images with four grayscale levels');

for (const [width,height,dpr,want] of [
  [640,400,1,144], [640,200,2,96], [320,200,1,75], [320,200,2,72], [40,100,1,9.375]
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
assert.match(battle, /data-enemy-uid="7"/);
assert.match(battle, /<text x="96"[^>]*>⚑</);
assert.doesNotMatch(battle, /<text x="(?:320|544|229|411)"/);
assert.equal((battle.match(/class="透視"/g) || []).length, 2);
const after = g.run("displayCombat=undefined;scene();$('#scene').innerHTML");
for (const x of [320,229,411]) assert.match(after, new RegExp(`<text x="${x}"[^>]*>？</text>`));
assert.match(after, /<text x="544"[^>]*>\d+<\/text>/);
assert.doesNotMatch(after, /data-enemy-uid/);
console.log('PASS front and distant symbols follow combat snapshots through the last log, side flags remain');
