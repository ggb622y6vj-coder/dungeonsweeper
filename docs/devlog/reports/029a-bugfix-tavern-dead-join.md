# 029a bugfix: 酒場で死亡/灰/ロストを加入不可 — 完了

- commit: 0dddaa2 (main, pushed 2026-11-02 JST; base e67bd3f)
- model: gpt-6-luna (reasoning low), 1回目で成功 (~2分20秒)

## Codex の実装
- dist/party.js: 酒場の option で status!=='ok' を disabled、名前に（死亡）/（灰）/（ロスト）付与 (tavernStatusName)。
- 町用ラッパー setTownPartyFromRoster を追加 (setPartyFromRoster は迷宮内用途のため維持)。非 ok を含む編成は false を返し #townnotice に「死亡したメンバーは加入できません。」。#tavernsave はラッパー経由。
- tests/auto-temple.cjs に酒場ケース追加 (disabled 表示、改ざん保存拒否、灰も拒否、ok 並び替え可)。MANIFEST 更新。
- Codex 環境ではブラウザ検証不可 (Playwright/サーバー起動不可) と報告。

## executor の修正
- 拒否メッセージが modal の背面 (#townnotice) にしか出ず見えない → 酒場ダイアログ内に #tavernnotice (role=status, 空なら非表示) を追加し両方に表示。開くたび・成功保存時にクリア、成功時は #townnotice の同メッセージもクリア。
- ラッパーが不正 index も「死亡…」扱いにしていた → status 判定のみに限定 (不正 index は従来どおり setPartyFromRoster が拒否)。
- 新規 tests/tavern-browser.py (1280/390): 戦闘で死亡/灰/ロスト→帰還→酒場で3種とも disabled+ラベル、ok 控えは有効; DOM 改ざん (disabled 解除+change+保存) を3種とも拒否、パーティ不変、ダイアログ内/町の通知表示; ok の並び替え・外す・控えからの加入成功、リロード保持、迷宮入場可、JSエラー/横スクロール無し。
- auto-temple.cjs に #tavernnotice の assert 追加。docs/SPECIFICATION.md に酒場の仕様追記。

## テスト結果 (全 PASS)
- node tests/*.cjs: auto-temple, death-status, final-boss, game, library, monster-dice, target-select, temple, training
- python3 scripts/compile-monsters.py --check (88 定義)
- scripts/sim/selftest.cjs (クリーン worktree で実行) + worktree で MANIFEST sha256 -c OK
- browser 1280/390: auto-temple, target-select, tavern(新規), town-layout, training
- スクショ: /workspace/sim/v029a-tavern-{1280,390}.png

## 備考
- 町でパーティに非 ok が残っている旧データでは、その人を「空き」にすれば保存可能 (保持したままは不可)。
