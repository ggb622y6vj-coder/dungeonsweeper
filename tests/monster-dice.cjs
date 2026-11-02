const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const csv = fs.readFileSync(path.join(__dirname, '../data/monsters.csv'), 'utf8');
const rows = new Map(csv.trimEnd().split(/\r?\n/).slice(1).map(line => {
  const fields = line.split(',');
  return [fields[0], fields];
}));
const expected = new Map([
  ['毒スライム', '1d8+1'], ['亡霊騎士', '1d8+1'], ['オーク戦士', '1d8+1'],
  ['大蜘蛛', '1d8+1'], ['洞窟の魔術師', '1d8+1'], ['山賊の頭目', '1d8+1'],
  ['腐肉食い', '1d8+1'], ['石の番人', '1d8+1'], ['火蜻蛉', '1d8'],
  ['酸性スライム', '2d6+2'], ['骸骨の射手', '2d6+2'], ['オーク呪術師', '2d6+2'],
  ['影の盗人', '2d6+2'], ['黒牙狼', '2d8+2'],
]);

assert.equal(rows.size, csv.trimEnd().split(/\r?\n/).length - 1, 'monster names must stay unique');
for (const [name, damage] of expected) {
  assert.ok(rows.has(name), `${name} exists`);
  const fields = rows.get(name);
  assert.equal(fields[2], name === '酸性スライム' || name === '骸骨の射手' || name === 'オーク呪術師' || name === '影の盗人' || name === '黒牙狼' ? '3F' : '2F');
  assert.equal(fields[7], damage, `${name} physical damage`);
}
assert.equal(rows.get('深層の魔将')[7], '3d7', '2F guardian remains unchanged');
assert.equal(rows.get('奈落の監視者')[7], '3d6+2', '3F guardian remains unchanged');
for (const [name, breath] of [['火蜻蛉', '炎/全体/2d6/60%'], ['深層の魔将', '炎/全体/2d8/60%'], ['奈落の監視者', '氷/全体/2d8/60%'], ['黒牙狼', 'なし']]) {
  assert.equal(rows.get(name)[14], breath, `${name} breath remains unchanged`);
}
const compiledSrc = fs.readFileSync(path.join(__dirname, '../dist/monster-data.js'), 'utf8');
const ENEMIES = new Function(`${compiledSrc}\nreturn ENEMIES;`)();
for (const [name, damage] of expected) {
  const m = ENEMIES.find(e => e.name === name);
  assert.ok(m, `${name} compiled`);
  const [, n, d, b = '0'] = damage.match(/^(\d+)d(\d+)(?:\+(\d+))?$/);
  assert.deepEqual(m.attack, [+n, +d, +b], `${name} compiled attack ${damage}`);
}
console.log(`PASS monster physical damage dice: ${expected.size} regular monsters; guardians and breath unchanged`);
