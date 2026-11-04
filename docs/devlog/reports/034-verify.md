# 034 verify — 寺院の石化解除でMP全快（b7e6069）

結論: **OK**

## 差分（ac053d1..b7e6069）
- dist/game.js templeRaise: `if(success&&!petrified)` → `if(success)` の1行のみ。石化解除成功時にパーティ在籍・控えの両方で mp=maxMP。
- spells.js / party.js は無変更（マディの処理に差分なし）。
- tests: petrify.cjs の旧期待「stone treatment preserves MP(=2)」を maxMP に変更（仕様変更による正当な更新）、リロード後のMP保持チェックを追加。petrify-browser.py に mp===maxMP と リロード後の確認を追加。既存チェックの削除・緩和なし。

## OK判定
1. 寺院石化解除 → HP・MPとも最大、status=ok、保存→リロード後も同じ: petrify.cjs（控え/在籍 × Lv1,2,3,4,5,10,30）と petrify-browser.py（ライブ、1280/390）でPASS。費用 min(150L,40L²)・成功率100%の既存検証もPASS。
2. マディ挙動が ac053d1 と同一: ac053d1 の worktree と b7e6069 で同じスクリプト（/tmp/v034m.cjs）を実行し、石化・麻痺・毒・HP1 の4ケースで出力が完全一致（status ok、HP全快、状態異常クリア、対象MPは変化なし、術者MP 100→85、隊列 ABCDEF）。
3. フルスイート: node tests 11件・compile-monsters --check・selftest・ブラウザテスト8件（ライブURL）すべてPASS、JSエラーなし。

## ライブ
dist/*.js と index.html がライブと一致（Pages デプロイ済み）を確認してからブラウザテストを実行。
