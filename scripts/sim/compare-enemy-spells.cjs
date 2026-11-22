// Run against either revision's dist and simulator without changing the worktree.
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(process.argv[2] || path.join(__dirname, '../..'));
const { game } = require(path.join(root, 'scripts/sim/harness.cjs'));
const { createParty, prepareTrial, resolveBattle, seededRandom } = require(path.join(root, 'scripts/sim/combat.cjs'));
const trials = Number(process.argv[3] || 500);
if (!Number.isSafeInteger(trials) || trials < 1) throw Error('試行数は正の整数で指定してください');

function measure(floor, boss, level) {
  let random = seededRandom(127);
  const g = game(null, () => random());
  createParty(g, [0, 0, 2, 3, 1, 2]);
  const openings = createHash('sha256');
  g.run(`
    const drawFormation = monsterFormation;
    monsterFormation = function(boss) {
      let ids;
      do { ids = drawFormation(boss); } while (!ids.some(id => enemyDefinition(id).spell > 0));
      return ids;
    };
    let casts, negated, actor, selected, opening;
    const observe = recordLibraryEncounter, act = monsterAction, record = log;
    recordLibraryEncounter = function(combat) {
      opening = JSON.stringify([s.pos, combat.initiative, s.hp, s.mp, s.members.map(m=>m.known),
        combat.units.map(e=>[e.id,e.row,e.hp])]);
      return observe(combat);
    };
    if (typeof chooseEnemySpell === 'function') {
      const choose = chooseEnemySpell;
      chooseEnemySpell = function(...args) { selected = choose(...args); return selected; };
    }
    monsterAction = function(e,cmds) {
      actor = e;
      try { return act(e,cmds); } finally { actor = null; selected = null; }
    };
    log = function(message, ...options) {
      if (actor) {
        let name = /は([^は]+)を唱えた。$/.exec(message)?.[1];
        if (message === '反呪文の結界に打ち消された！') {
          name = selected?.name ?? magic(enemyDefinition(actor.id).spellInfo.id).name;
          negated++;
        }
        if (name) casts[name] = (casts[name] || 0) + 1;
      }
      record(message, ...options);
    };
    // Skip repainting each intermediate log frame, retaining the settled render.
    const paint = render, replay = pumpLog;
    pumpLog = function() {
      if (!logQueue.length) return replay();
      render = () => {};
      try { replay(); } finally { render = paint; }
    };
  `);
  const bins = {};
  for (let i = 0; i < trials; i++) {
    random = seededRandom(127000 + i);
    g.run('casts = {}; negated = 0; s.guardiansDefeated = []; s.cleared = false');
    const hp = prepareTrial(g, { floor, boss, level });
    openings.update(g.run('opening'));
    const result = resolveBattle(g);
    const band = result.rounds >= 1 && result.rounds <= 3 ? '1–3'
      : result.rounds >= 10 && result.rounds <= 20 ? '10–20' : 'other';
    const bin = bins[band] ??= { n: 0, hpLoss: 0, wipes: 0, negated: 0, casts: {} };
    bin.n++;
    bin.hpLoss += 1 - result.total / hp;
    bin.wipes += Number(result.outcome === 'wipe');
    bin.negated += g.run('negated');
    for (const [name, count] of Object.entries(g.run('casts'))) bin.casts[name] = (bin.casts[name] || 0) + count;
  }
  console.log(JSON.stringify({ floor, boss, level, trials, openings: openings.digest('hex'), bins }));
}

measure(4, false, 6);
measure(5, true, 8);
measure(10, true, 20);
