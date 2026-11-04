# 049 石化メンバーのグレーアウト 報告

- ブランチ: hold/049（main 5ad5413 から）、コミット 47fdb08。未push。
- 実装: Codex gpt-6-luna low（1回目で成功）＋レビュー修正。

## 変更
- dist/combatui.js: `beginAllyTargetPick` に `canWork` を追加。効果のない対象は `.untargetable`・aria-disabled・tabindex -1。クリック/タップは無反応。レビューで `pickAllyTarget` 自体にも `canWork` ガードを追加（Codex版はクリックハンドラのみ）。
- dist/spells.js / combatui.js（戦闘・探索の呪文）: 石化は `effect==='restore'`（マディ）以外不可。dist/items.js（薬）: 石化は常に不可。
- dist/index.html: `.untargetable` を opacity .4・cursor:not-allowed・アニメ/アウトラインなしに変更。
- docs/SPECIFICATION.md: 194行の記述を更新。MANIFEST.sha256 を再生成。

## テスト
- tests/petrify.cjs: ディオス/ディアルコ/マディ、薬3種の canWork/キーボード候補を検証。実際の戦闘経路（chooseBattleSpell→pickAllyTarget）でディオスは石化を選べず、ログ・MP・コマンドが変わらないこと、マディは選べることを検証（ガードを外すと失敗することを確認済み）。
- tests/petrify-browser.py（1280/390）: 探索ディアルコ・薬・戦闘ディオスでグレー表示（opacity 0.4, not-allowed）、クリックしてもログ・MP・所持品が変わらないこと、戦闘マディでは選べること。
  - テスト変更の説明: 旧テストは「石化カードをクリック→『ディアルコではBの石化を治せない。』」を期待していたが、仕様変更でクリックは無反応になったため、メッセージが出ず MP 100 のままであることを検証する形に置き換えた。グレーのカードは aria-disabled のため Playwright の click(force=True) で実クリックを送っている。キャンセル後は呪文ダイアログに戻る挙動に合わせた。
- 全 tests/*.cjs、compile-monsters --check、全 *-browser.py（1280/390）成功。petrify-browser.py 10/10。sha256sum -c OK。
- sim: selftest はクリーンな worktree（main/hold/049）で両方 PASS、出力同一。combat.cjs（jobs 0,0,1,2,2,3、level=階×3、n=400）の1〜10Fは main と完全同一（UIのみの変更）。

## 仕様の確認事項
- 「石化を治せない」メッセージはクリック経路では出なくなった（ロジック側には防御として残置）。
- 回復対象外になるのは石化のみ（死亡等はもともと候補外）。
