# 003-bugfix-attack-dead-branch 検証結果 — 判定: OK
- 対象: 0d94aaa（dist/game.js と MANIFEST だけ変更）
- テスト: 3つとも成功
- attack() の `cmds[i]==='spell'?'呪文':'攻撃'` を削除済みで、ログは `${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。` に固定。呪文コマンドは前段の castMagic 分岐で continue するので、呪文ログ（spells.js、未変更）には影響なし
- 本番（一致を確認済み）のheadless実行: 「〇〇の攻撃。〜に△ダメージ。」形式のログが出て、不正な「の呪文。」ログは0件、pageerror 0
