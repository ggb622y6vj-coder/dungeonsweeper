# 029b verify (6501fd7, origin/main HEAD)
判定: OK
- Pages 反映後 live = dist 一致。全 tests/*.cjs、compile-monsters --check、selftest PASS。
- live browser 1280/390: training / target-select / town-layout / auto-temple / tavern / load-carry-browser(新規) 全 PASS
  （健全ロード・迷宮内ロードはダイアログ無し、旧セーブ dead/ash/lost→搬送ダイアログのみ・配列整合・保存、寺院に控え表示、酒場保存/迷宮入場可）。
- 実装: ロード時 s.area==='town'&&!defeatPending で非okを removeFromParty→templeReport、levelReport=[]、templeReportFromLoad で OK後のレベル報告を抑止。酒場は在籍非ok=「死亡したメンバーを外してください。」/加入=「…加入できません。」に分離。
- レベル報告破棄の検証 (/tmp/v029b.py, 1280/390): 帰還で4人レベルアップ(levelReport 6行・未確認)→1人を非ok化して保存→リロード。
  全員の level/maxHP/maxMP/xp は帰還直後と完全一致（搬送者含む）、再リロード後も保持、ok者HP満タン。ポップアップのみ出ない（搬送ダイアログ→OK後もレベル報告なし）。JSエラー無し。→ 実レベルアップの喪失なし。
- temple.cjs (0dddaa2比): 1行の期待値変更のみ。パーティ内蘇生失敗(灰/ロスト)時のリロード後 members.length を 1→0 に（029b仕様どおり控えへ搬送）、さらに搬送ダイアログ表示の assert を追加。ロスター内容一致・費用・通知等の assert は全て維持 → 弱体化なし。
