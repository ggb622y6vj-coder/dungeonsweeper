# 029b light: 町ロード時の非ok自動搬送 — 完了

- コミット: 6501fd7（main に push 済み、2026-11-02 16:40 JST）
- モデル: gpt-6-luna / reasoning low、1回目で成功（約1.5分）

## 変更
- dist/game.js: ロード時 `s.area==='town' && !s.defeatPending` でパーティー内の status!=='ok' を `removeFromParty` で控えへ移し、`s.templeReport` 設定、`s.levelReport=[]`、`s.templeReportFromLoad=true`、save()。搬送ダイアログを閉じた時、ロード由来ならレベル報告を出さない。迷宮内ロードは対象外。
- dist/party.js: 酒場の保存で、在籍中の非okメンバーを残したままなら「死亡したメンバーを外してください。」、控えからの非ok加入は従来の「死亡したメンバーは加入できません。」。
- tests/auto-temple.cjs: 旧セーブケース（配列整合・控え・保存・ダイアログのみ・迷宮入場、正常ロード/迷宮ロードはダイアログ無し）と酒場文言の分岐を追加。
- tests/load-carry-browser.py 新規（1280/390）。
- docs/SPECIFICATION.md, docs/HANDOFF.md に追記。MANIFEST 再生成。

## Executor による修正
1. Codex の酒場判定は「パーティーに非okがいれば、その人を外した保存も含めて常に拒否」になっていた → 保存後の並びに在籍中の非okが残る時だけ拒否するよう修正（外せば保存が通る）。townnotice の新文言もクリア対象に追加。auto-temple.cjs に「外すと保存が通る」確認を追加。
2. ロード搬送後に明示的な save() を追加（仕様「そのあと保存する」）。
3. Codex は tests/temple.cjs でパーティー内蘇生を「事前に控えへ移してから蘇生」に変え、パーティー内蘇生の経路をテストしなくなっていた → 元のパーティー内蘇生を復元し、再読込時に「成功なら在籍1人、失敗(灰/ロスト)ならロード搬送で0人＋搬送ダイアログ表示」を確認するよう強化。
4. ブラウザテスト新規作成（Codex は Playwright 不在で未実施）。ロストは寺院一覧に出ない仕様に合わせた。

## テスト結果（全 PASS、JSエラー無し）
- node tests/*.cjs 全9本: auto-temple, death-status, final-boss, game, library, monster-dice, target-select, temple, training
- python3 scripts/compile-monsters.py --check（88 monsters）
- node scripts/sim/selftest.cjs
- /tmp/pyv/bin/python tests/*-browser.py 全6本（各 1280/390）: auto-temple, load-carry(新規), target-select, tavern, town-layout, training
- スクショ: /workspace/sim/v029b-load-carry-{1280,390}.png

## 補足
- ロード搬送時は既存の未表示 levelReport も破棄する（タスクの「レベル報告は出さない」に従った）。
