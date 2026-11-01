#!/usr/bin/env node
const { game } = require('./harness.cjs');

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!['--jobs', '--level', '--floor', '--n', '--boss'].includes(key)) throw Error(`不明な引数: ${key}`);
    if (Object.hasOwn(out, key.slice(2))) throw Error(`重複した引数: ${key}`);
    if (key === '--boss') { out.boss = true; continue; }
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`値が必要です: ${key}`);
    out[key.slice(2)] = argv[++i];
  }
  if (!/^[0-3](,[0-3]){0,5}$/.test(out.jobs || '')) throw Error('--jobs は0〜3の職業IDを1〜6個指定してください');
  const jobs = out.jobs.split(',').map(Number);
  const level = Number(out.level), floor = Number(out.floor), n = Number(out.n);
  if (!Number.isInteger(level) || level < 1 || level > 30) throw Error('--level は1〜30で指定してください');
  if (!Number.isInteger(floor) || floor < 1 || floor > 3) throw Error('--floor は1〜3で指定してください');
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw Error('--n は1〜100000で指定してください');
  return { jobs, level, floor, n, boss: !!out.boss };
}

// One reproducible stream per invocation; never rewind it between trials.
function seededRandom(seed = 0x6d2b79f5) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function createParty(g, jobs) {
  // The harness starts with the current game's empty town roster.
  for (let i = 0; i < jobs.length; i++) {
    const ok = g.run(`(() => {
      const recruit = generateRecruit('sim${i}', ${jobs[i]});
      return registerRecruit(recruit) && changeRecruitParty(recruit.members.id, true);
    })()`);
    if (!ok) throw Error('パーティ作成に失敗しました');
  }
  if (g.run('s.members.length') !== jobs.length) throw Error('パーティ人数が一致しません');
  // Observe the real completion path, even if enemies all flee during an ambush.
  g.run(`var simBase = structuredClone(partyRecords());
    var simBattleFinished = false, simFinishMonsterBattle = finishMonsterBattle;
    finishMonsterBattle = function() { simBattleFinished = true; return simFinishMonsterBattle(); };`);
}

function prepareTrial(g, opt) {
  g.run(`
    // Restore every parallel party field, including Lv1 growth and spells.
    for (const key of PARTY_FIELDS) s[key] = structuredClone(simBase.map(r => r[key]));
    fresh(1);
    s.members.forEach(m => { m.xp = m.xpTargets[${opt.level}]; });
    levelUp();
    s.hp = s.members.map(m => m.maxHP);
    s.mp = s.members.map(m => m.maxMP);
    s.ailments = s.members.map(() => ({poison:false, paralysis:0}));
    if (${opt.floor} > 1) fresh(${opt.floor});
    s.area = 'dungeon';
    resetPartyCommands();
    simBattleFinished = false;
    s.cells[s.pos].type = ${opt.boss ? "'boss'" : "'stairs'"};
  `);
  // Include damage from the initial enemy ambush in HP loss.
  const initialHP = g.run('s.hp.reduce((a,b) => a+b, 0)');
  g.run('encounter(s.pos, false);');
  g.drain();
  return initialHP;
}

function planTurn(g) {
  g.run(`
    s.magicPlans = s.members.map(() => null);
    s.commands = s.members.map((m,i) => {
      if (s.hp[i] <= 0 || s.ailments[i].paralysis > 0) return 'guard';
      if (jobOf(i) === 2) {
        const target = s.hp.map((_,j) => j)
          .filter(j => s.hp[j] > 0 && s.hp[j] / s.members[j].maxHP < .45)
          .sort((a,b) => s.hp[a] / s.members[a].maxHP - s.hp[b] / s.members[b].maxHP)[0];
        const id = ['dialma','dial','dios'].find(id => m.known.includes(id) && s.mp[i] >= spellCost(magic(id)));
        if (target !== undefined && id) { s.magicPlans[i] = {id,target}; return 'spell'; }
      }
      if (jobOf(i) === 1 && s.mp[i] >= 6) {
        const id = ['tiltowait','lakanito','dalto','mahalito','katino','halito']
          .find(id => m.known.includes(id) && s.mp[i] >= spellCost(magic(id)));
        const target = enemyGroups().flatMap(g => g.units).find(e => e.hp > 0)?.uid;
        if (id && target !== undefined) { s.magicPlans[i] = {id,target}; return 'spell'; }
      }
      if (canWeaponAttack(i)) {
        const group = reachableEnemyGroups(i)[0];
        if (group) { s.attackRows[i] = group.key; return 'fight'; }
      }
      return 'guard';
    });
  `);
}

function resolveBattle(g, maxRounds = 200) {
  let rounds = 0;
  while (g.run('!!s.enemy && !s.done')) {
    if (rounds >= maxRounds) throw Error(`${maxRounds}ラウンド以内に決着しませんでした（未決着を勝利には数えません）`);
    const retreat = g.run('s.hp.reduce((a,b) => a+b, 0) < .25 * s.members.reduce((a,m) => a+m.maxHP, 0) && escapeChance() > 0');
    if (retreat) g.run('flee()');
    else { planTurn(g); g.run('attack()'); }
    // A failed escape already spends a turn. Do not also attack this round.
    g.drain();
    rounds++;
  }
  const result = g.run(`({
    alive: s.hp.filter(h => h > 0).length,
    deaths: s.hp.filter(h => h <= 0).length,
    total: s.hp.reduce((a,b) => a+b, 0),
    cleared: simBattleFinished
  })`);
  return { ...result, outcome: result.alive === 0 ? 'wipe' : result.cleared ? 'win' : 'escape', rounds };
}

function simulate(opt) {
  const g = game(null, seededRandom());
  createParty(g, opt.jobs);
  let wins = 0, wipes = 0, deaths = 0, hpLoss = 0, rounds = 0;
  for (let trial = 0; trial < opt.n; trial++) {
    const initialHP = prepareTrial(g, opt);
    let result;
    try { result = resolveBattle(g); }
    catch (error) { throw Error(`試行${trial + 1}: ${error.message}`); }
    if (result.outcome === 'win') wins++;
    if (result.outcome === 'wipe') wipes++;
    deaths += result.deaths;
    hpLoss += 1 - result.total / initialHP;
    rounds += result.rounds;
  }
  return { winRate: wins / opt.n, wipeRate: wipes / opt.n, deathsPerBattle: deaths / opt.n, hpLossRate: hpLoss / opt.n, averageRounds: rounds / opt.n };
}

if (require.main === module) {
  try { process.stdout.write(JSON.stringify(simulate(args(process.argv.slice(2)))) + '\n'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle };
