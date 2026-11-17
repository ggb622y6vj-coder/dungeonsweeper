// Keeps the inline stylesheet in the shape left by the 2026-11-17 cleanup:
// one rule per line, opaque colors only through the :root palette, no rule
// for a selector repeated inside the same media context.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
assert.equal(html.split('<style>').length, 2, 'exactly one inline stylesheet');
const css = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'));

// The palette is the :root rule; it may span several lines.
const rootStart = css.indexOf(':root{');
const rootEnd = css.indexOf('}', rootStart);
assert.ok(rootStart >= 0 && rootEnd > rootStart, ':root palette rule');
const palette = new Map();
for (const decl of css.slice(rootStart + 6, rootEnd).split(';')) {
  const i = decl.indexOf(':');
  const name = decl.slice(0, i).trim();
  if (name.startsWith('--')) {
    assert.ok(!palette.has(name), `palette token defined twice: ${name}`);
    palette.set(name, decl.slice(i + 1).trim());
  }
}
assert.ok(palette.size >= 20, 'palette tokens are defined');

const body = css.slice(0, rootStart) + css.slice(rootEnd + 1);
const rules = [];
let media = '';
for (const raw of body.split('\n')) {
  const line = raw.trim();
  if (!line || line.startsWith('/*')) continue;
  if (line.startsWith('@media')) { assert.equal(media, '', 'media blocks are not nested'); media = line.slice(6, -1).trim(); continue; }
  if (line === '}') { assert.notEqual(media, '', 'stray closing brace'); media = ''; continue; }
  if (line.startsWith('@keyframes')) continue;
  const open = line.indexOf('{');
  assert.ok(open > 0 && line.endsWith('}') && line.indexOf('}') === line.length - 1, `one rule per line: ${line.slice(0, 60)}`);
  rules.push({ media, selector: line.slice(0, open), declarations: line.slice(open + 1, -1) });
}
assert.equal(media, '', 'unclosed media block');
assert.ok(rules.length > 300, 'rules were parsed');

// Opaque hex colors live in the palette. Translucent ones (#rgba, #rrggbbaa) and the per-floor
// --theme-* values stay literal.
for (const rule of rules) {
  for (const decl of rule.declarations.split(';')) {
    if (decl.trim().startsWith('--theme-')) continue;
    for (const hex of decl.match(/#[0-9a-fA-F]+\b/g) || []) {
      assert.ok(hex.length === 5 || hex.length === 9, `use a palette token instead of ${hex} in ${rule.selector}`);
    }
  }
}

// Every referenced custom property exists, and every palette token is used.
const defined = new Set(palette.keys());
for (const rule of rules) for (const m of rule.declarations.matchAll(/(?:^|;)\s*(--[\w-]+)\s*:/g)) defined.add(m[1]);
const referenced = new Set();
for (const m of css.matchAll(/var\((--[\w-]+)/g)) referenced.add(m[1]);
for (const name of referenced) assert.ok(defined.has(name), `undefined custom property ${name}`);
for (const name of palette.keys()) assert.ok(referenced.has(name), `unused palette token ${name}`);

// A selector has one rule per media context. These three are split on purpose: their later
// declarations must stay after other rules of equal specificity.
const allowedRepeats = new Set(['|main', '|.hpvalue', '|.statcard>button']);
const seen = new Set();
for (const rule of rules) {
  const key = rule.media + '|' + rule.selector;
  if (seen.has(key)) assert.ok(allowedRepeats.has(key), `merge the repeated rule for ${rule.selector}${rule.media ? ' in @media ' + rule.media : ''}`);
  seen.add(key);
}

console.log(`PASS stylesheet structure: ${rules.length} rules, ${palette.size} palette tokens, colors via tokens, no repeated selectors`);
