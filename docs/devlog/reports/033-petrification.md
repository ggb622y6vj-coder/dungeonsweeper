# 033 heavy: 石化（stone） — 完了

- コミット: ac053d1（main に push 済み、2026-11-02 18:43 JST）
- モデル: gpt-6-astra / reasoning high、1回目で成功（約13分）。Codex は Playwright・ソケット無しで browser 未実行のため push せず終了 → executor が検証・修正して push。
- Codex ログ: report/codex033.log

## 変更（Codex）
- dist/party.js: `activeMember(i)`（HP>0 かつ dead/ash/lost/stone でない）/`activeMembers()`。partyIncapacitated は activeMember と麻痺から判定。thiefMember も同関数。酒場ラベル（石化）。
- dist/game.js: afflict(i,'stone') → status='stone'、ailments 解除、HP 保持、ログ「{名前}は石になった。」→ 032 の自動後退「…が後列に下がった。」。敵の攻撃対象・罠・hurt・毒tick・逃走率・識別・経験値分配を activeMember 基準に。全員が 死亡/灰/ロスト/石化 で全滅（030 遺体フロー、石化者は stone と HP のまま遺体記録）。enterTown で stone も控えへ搬送（回復・Lvアップ無し、XP/HP/MP保持）、搬送ダイアログ「B（石化）を寺院に運んだ。寺院で石化を解除できます。」。寺院: templeCost min(150L,40L²)、成功率100%、「石化解除」ボタン、HP 全快・ok（MP は保持）。
- dist/spells.js: マディ(restore)が石化を解く（「…の石化が解けた。」）。他の味方呪文は「{呪文}では{名前}の石化を治せない。」で MP 消費無し。石化者は呪文を唱えられない（理由「石化」）。
- dist/items.js: 石化者は薬を使えない。気付け薬・毒消し等は「{薬}では{名前}の石化を治せない。」で消費無し。
- dist/training.js: （石化）表示・加入不可。dist/library.js: 能力に「石化」。dist/index.html: 寺院説明文。
- data/monsters.csv + compile-monsters.py: 「石化/命中時N%」→ type 'stone'。ガーゴイル5%、石巨人8%、邪眼10%（麻痺30%維持）、混沌の落とし子5%。dist/monster-data.js 再生成。
- scripts/sim: 石化者は行動不可・通常回復の対象外、マディ選択、全滅時の死亡数/HP損耗。selftest 追加。
- tests/petrify.cjs、tests/petrify-browser.py 新規。tests/game.cjs から petrify.cjs を require。tests/auto-reorder.cjs の「帰還後も石化者がパーティに残る(ACDBEF)」期待値を 033 仕様（控えへ搬送・stone 保持）に変更（仕様変更に伴うもので弱体化ではない）。

## Executor による修正
1. tests/petrify-browser.py: 酒場の（石化）option の無効判定が Playwright `is_disabled()` で偽陰性になり失敗 → tavern-browser.py と同じ `e.disabled` 評価に変更（実 DOM は disabled 付き、判定強度同等）。
2. docs/HANDOFF.md・docs/TEST_RESULTS.txt の「ブラウザ未検証・push未実施」を実結果に差し替え。MANIFEST 再生成。

## テスト結果（clean worktree of ac053d1、compile-monsters 再生成で差分無し）
- node tests/*.cjs 11本 全PASS、compile-monsters.py --check PASS（88体）、sim selftest PASS（石化含む）。
- browser 8本（auto-reorder, auto-temple, load-carry, petrify[新], target-select, tavern, town-layout, training）× 1280/390 全PASS、JSエラー・横スクロール無し。

## 試遊への確認事項
1. 全滅時の status: 以前の defeat() は全員を 'dead' に上書きしていた（灰/ロストも dead 化）。033 では stone は維持、灰/ロストも維持、ok のみ dead にする変更が入った。030/031 テストは不変で PASS。意図どおりか確認を。
2. 寺院の石化解除は HP 全快・ok だが MP は保持（蘇生は HP・MP 全快）。MP も全快にすべきか。
3. 前衛に石化者がいて後衛に行動可能者がいない（3人以下等）場合は並べ替えず、敵は残りの前衛生存者のみ狙う（前衛全員が対象外なら全員から選ぶ）。
4. 石化者は ディオス等の対象カードとしては選択可能（実行時に「…では石化を治せない」ログで不発、MP消費無し）。対象から外す方が良いか。
