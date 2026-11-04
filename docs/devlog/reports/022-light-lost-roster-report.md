# 022-light-lost-roster 実装報告
- モデル：gpt-6-luna（low）、1回目
- コミット：338c9b6
- 変更：dist/recruits.js changeRecruitParty で status==='lost' の加入を拒否。dist/training.js で 死亡/灰/ロスト を状態欄に表示、ロストの加入ボタンを disabled。tests/training.cjs に回帰テスト追加（lost 加入不可・抹消可、dead/ash 加入可）。
- 注記：Codex は既存の6人上限テストを書き換えて training.cjs を失敗させていたため、既存テストを元に戻し、新規ゲームで独立したテストブロックを追加した（Codexは全PASSと報告していたが実際は失敗）。
- テスト：game / training / compile-monsters --check / tests/*.cjs 全PASS。数値変更なしのため sim なし。ブラウザ未確認。
