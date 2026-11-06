const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(root, 'dist/monster-data.js'), 'utf8');
const dataContext = vm.createContext({});
vm.runInContext(dataSrc, dataContext);
const enemies = JSON.parse(vm.runInContext('JSON.stringify(ENEMIES)', dataContext));
for (const id of ['succubus', 'daidaraboti']) {
  assert.deepEqual(Array.from(enemies.find(d => d.id === id).floors), [9, 10]);
  assert.equal(enemies.find(d => d.id === id).floor, 9);
}
const gas = enemies.find(d => d.id === 'gas');
const kasha = enemies.find(d => d.id === 'kashadokuro');
assert.deepEqual(Array.from(gas.floors), [2, 3]);
assert.deepEqual([enemies.find(d => d.id === 'venomspider').name, enemies.find(d => d.id === 'venomspider').unknown], ['髑髏武者グモ', 'おぞましい虫']);
const firefly = enemies.find(d => d.id === 'firefly');
const archer = enemies.find(d => d.id === 'archer');
assert.deepEqual(Array.from(firefly.floors), [3]);
assert.deepEqual([firefly.mageResist, firefly.priestResist], [.05, .05]);
assert.deepEqual(Array.from(archer.floors), [3, 4]);
assert.deepEqual([gas.hp, gas.ac, gas.attack, gas.xp], [[3, 9, 0], 7, [1, 5, 1], 20]);
assert.deepEqual([gas.level, gas.hit, Array.from(gas.groupSize), gas.gold, gas.race, gas.swings, gas.icon], [5, 3, [2, 4], [2, 4, 0], '不定形', 1, '◉']);
assert.deepEqual(Array.from(kasha.floors), [9, 10]);
assert.deepEqual([kasha.hp, kasha.ac, kasha.attack, kasha.xp], [[10, 8, 14], -5, [5, 8, 0], 3600]);
assert.deepEqual([kasha.level, kasha.hit, Array.from(kasha.groupSize), kasha.gold, kasha.race, kasha.swings, kasha.icon], [23, 11, [1, 1], [100, 3, 0], '不死', 2, '☠']);
assert.deepEqual(kasha.breath, { element: '炎', dice: [15, 8, 0], chance: .25 });
assert.equal(kasha.resistance, '炎半減');
assert.equal(kasha.race, '不死');
assert.equal(kasha.statuses.length, 0);

const context = vm.createContext({ s: { floor: 1 }, ENEMIES: enemies, Math: Object.create(Math) });
vm.runInContext(fs.readFileSync(path.join(root, 'dist/monsters.js'), 'utf8'), context);
for (const floor of [8, 9, 10]) {
  context.s.floor = floor;
  const seen = new Set();
  for (let i = 0; i < 5000; i++) {
    for (const id of vm.runInContext('monsterFormation(false)', context)) seen.add(id);
  }
  assert.equal(seen.has('succubus'), floor === 9 || floor === 10, `succubus on ${floor}F`);
  assert.equal(seen.has('daidaraboti'), floor === 9 || floor === 10, `daidaraboti on ${floor}F`);
  assert.equal(seen.has('kashadokuro'), floor === 9 || floor === 10, `kashadokuro on ${floor}F`);
}
for (const floor of [1, 2, 3, 4]) {
  context.s.floor = floor;
  const seen = new Set();
  for (let i = 0; i < 5000; i++) for (const id of vm.runInContext('monsterFormation(false)', context)) seen.add(id);
  assert.equal(seen.has('gas'), floor === 2 || floor === 3, `gas on ${floor}F`);
  assert.equal(seen.has('firefly'), floor === 3, `firefly on ${floor}F`);
  assert.equal(seen.has('archer'), floor === 3 || floor === 4, `archer on ${floor}F`);
}

const libraryContext = vm.createContext({
  ENEMIES: enemies,
  document: { createElement: () => ({ set textContent(value) { this.value = value; }, append() {} }) },
  s: { library: { monsters: {}, items: {}, spells: {} } },
  WEAPONS: [], MEDICINES: [], MAGIC: [], CLASSES: [],
});
vm.runInContext(fs.readFileSync(path.join(root, 'dist/library.js'), 'utf8'), libraryContext);
for (const id of ['succubus', 'daidaraboti']) {
  const value = vm.runInContext(`libraryMonsterDetails(ENEMIES.find(d=>d.id==='${id}'),{count:0})[1][1]`, libraryContext);
  assert.equal(value, '9F・10F');
}

// Library: multi-floor monsters appear only on their primary floor tab.
{
  const { game } = require('../scripts/sim/harness.cjs');
  const g = game(null, () => .5);
  for (const floor of [9, 10]) {
    g.run(`renderLibrary('monsters',1,'weapon',${floor})`);
    for (const id of ['succubus', 'daidaraboti', 'kashadokuro']) {
      assert.equal(g.run(`$('#librarybody').children.some(e=>e.attributes['data-library-entry']==='monster-${id}')`), floor === 9, `${id} on primary floor tab ${floor}`);
    }
  }
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'monster-floors-'));
try {
  fs.mkdirSync(path.join(temp, 'scripts'));
  fs.mkdirSync(path.join(temp, 'data'));
  fs.mkdirSync(path.join(temp, 'dist'));
  fs.copyFileSync(path.join(root, 'scripts/compile-monsters.py'), path.join(temp, 'scripts/compile-monsters.py'));
  let csv = fs.readFileSync(path.join(root, 'data/monsters.csv'), 'utf8');
  csv = csv.replace(/^テアシナガ,([^,]+),1F,/m, 'テアシナガ,$1,1F・2F,');
  fs.writeFileSync(path.join(temp, 'data/monsters.csv'), csv);
  const result = spawnSync('python3', [path.join(temp, 'scripts/compile-monsters.py')], { encoding: 'utf8' });
  assert.notEqual(result.status, 0, 'compiler rejects a guardian on multiple floors');
  assert.match(result.stderr, /Guardian must have exactly one floor/);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log('PASS monster floors: firefly 3F, archer 3F/4F, 2F exclusion, 9F/10F encounters and guardian validation');
