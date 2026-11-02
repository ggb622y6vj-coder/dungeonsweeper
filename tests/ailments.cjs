const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const expected = { poison: false, paralysis: 0, sleep: 0, silence: 0, fear: 0 };
const g = game(null, () => .5);
const json = expression => JSON.parse(g.run(`JSON.stringify(${expression})`));
const ailments = () => json('s.ailments');

assert.deepEqual(ailments(), []);
g.run("var r=generateRecruit('A',0);registerRecruit(r);changeRecruitParty(r.members.id,true)");
assert.deepEqual(ailments()[0], expected, 'new recruit has the complete shape');
g.run("s.reserve=[structuredClone(trainingRoster()[0])];s.reserve[0].ailments={poison:true,paralysis:2};ensureProfile()");
assert.deepEqual(json('s.reserve[0].ailments'), { ...expected, poison: true, paralysis: 2 }, 'reserve records are normalized');
g.run("s.ailments[0]={poison:true,paralysis:2};afflict(0,'xxx')");
assert.deepEqual(ailments()[0], { poison: true, paralysis: 2 }, 'unknown type leaves ailments unchanged');
assert.equal(g.run("consoleWarnings=0;console.warn=()=>consoleWarnings++;afflict(0,'xxx');consoleWarnings"), 1);
g.run("afflict(0,'stone')");
assert.deepEqual(ailments()[0], expected, 'stone clears existing ailments and uses the complete shape');

const legacy = JSON.parse(g.run('localStorage.getItem(\'ash-v1\')'));
legacy.area = 'town';
legacy.roster[0].ailments = { poison: true, paralysis: 1 };
const loaded = game(JSON.stringify(legacy));
assert.deepEqual(jsonLoaded(loaded, 's.ailments[0]'), { ...expected, poison: true, paralysis: 1 }, 'legacy party ailments are completed during load');
assert.equal(jsonLoaded(loaded, 's.reserve.length'), 0, 'single member is restored to party');
assert.equal(loaded.run("JSON.parse(localStorage.getItem('ash-v1')).roster.every(r=>Object.keys(r.ailments).sort().join(',')==='fear,paralysis,poison,silence,sleep')"), true);
console.log('PASS fresh ailments, legacy load completion, reserve migration, unknown affliction no-op and warning');
function jsonLoaded(target, expression) { return JSON.parse(target.run(`JSON.stringify(${expression})`)); }
