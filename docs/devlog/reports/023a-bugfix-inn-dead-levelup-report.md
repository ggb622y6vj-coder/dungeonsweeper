# 023a-bugfix-inn-dead-levelup 報告
- モデル：gpt-6-luna（low）、1回目で完了
- コミット：08c7b6e（main へ push 済み）
- 変更：dist/game.js levelUp() に対象インデックス引数を追加し、stayAtInn() は status ok のメンバーのみレベルアップ。#innopen の文言を「正常な冒険者の Lv × 10 G の合計」に。innCost は不変。
- テスト：tests/game.cjs に回帰テスト追加（dead/ash は Lv・maxHP 不変、ok は上昇、蘇生後の馬小屋で上昇、文言確認）。既存の宿屋アサートは維持。
- 結果：game / training / death-status / temple / compile-monsters --check すべて PASS。MANIFEST.sha256 再生成。
- sim：数値変更なしのため未実施。ブラウザ未確認。
