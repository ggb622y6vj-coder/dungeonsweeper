# 029 完了報告：帰還時に死者を自動で寺院へ
- コミット: e67bd3f（main に push 済み。baec29f の次）
- モデル: gpt-6-luna low（1回目で実装。Codex 環境に Playwright がなくブラウザ検証とブラウザテスト作成は executor が実施）
- 日時: 2026-11-02 JST

## 変更ファイル
- dist/game.js：enterTown で死亡・灰・ロストを removeFromParty で控えへ移し s.templeReport に記録（ash-v1 に保存）。showTempleCarryReport（搬送ダイアログ→閉じたら showLevelReport）。読込時に未表示の templeReport があれば再表示。全滅処理中（defeatPending）は搬送しない
- dist/index.html：#templecarrydialog（見出し「寺院への搬送」、#templecarrylist、OK #templecarryok）
- dist/recruits.js：removeFromParty(ids) を追加、changeRecruitParty の加入を status==='ok' のみに
- dist/training.js：訓練所の「加入」ボタンを正常以外で無効（従来は lost のみ）
- docs/SPECIFICATION.md・docs/HANDOFF.md：追記
- tests/auto-temple.cjs（新規）、tests/auto-temple-browser.py（新規）、tests/death-status.cjs・tests/training.cjs・tests/training-browser.py（新仕様に合わせて更新）
- MANIFEST.sha256：再生成（クリーンな worktree で sha256sum -c OK）

## executor の修正
1. Codex の removeFromParty は作っただけで未使用（enterTown に同じ処理を直書き）→ enterTown から removeFromParty を使うよう整理
2. 「リロードで未表示なら再表示」が未実装 → 読込時に町で templeReport があれば搬送ダイアログを開く
3. 搬送したメンバーの毒・麻痺が残っていた → 搬送前に全員の状態異常を解除（従来の帰還仕様どおり）
4. 全滅処理中に帰還（#backtown）すると全員が控えに移り遺体フローを壊す恐れ → defeatPending 中は搬送しない
5. 訓練所 UI の「加入」ボタンが dead/ash で押せた → 無効化
6. Codex が tests/death-status.cjs の assert を大幅に削っていた（死者のMP非回復、XP/レベル保持、状態ごとの入場拒否、並べ替え後の状態表示、スナップショット表示）→ 控えに移った記録を対象に全て復元。入場拒否ガード（020）は setPartyFromRoster で死者を戻して確認
7. tests/auto-temple.cjs を強化：搬送者の XP/レベル/所持品/装備不変、生存者のレベルアップ（+1）と全回復、templeReport の内容、保存→再読込（4人・控え2・報告保持・再表示）、OK と Esc の両方でレベル報告へ、寺院一覧「控え · Lv.N · 死亡/灰」、加入拒否、蘇生後も控え、迷宮に入れる、死者なしでダイアログなし、ロストの別行メッセージ、全滅時は搬送せず遺体が残る
8. tests/training-browser.py：帰還時に死者がパーティーに残る前提だった → 死者は控えに移り XP/HP0 保持、搬送ダイアログ→OK→レベル報告の順を確認するよう更新（判定は弱めていない）
9. tests/auto-temple-browser.py を新規作成

## テスト結果（すべて PASS）
- node tests/*.cjs：auto-temple, death-status, final-boss, game, library, monster-dice, target-select, temple, training の9本（作業ツリーとクリーンな worktree の両方）
- python3 scripts/compile-monsters.py --check：88 monster definitions validated
- sim selftest（node scripts/sim/selftest.cjs、e67bd3f のクリーンな worktree）：PASS
- training-browser / target-select-browser / town-layout-browser / auto-temple-browser：1280・390 とも PASS（JS エラーなし、横スクロールなし）

## 所見
- 酒場（#taverndialog）の編成では死亡・灰を選べる可能性があるが今回の範囲外（入場時の 020 ガードで止まる）
- スクリーンショット: /workspace/sim/v029-carry-{1280,390}.png、v029-temple-{1280,390}.png
