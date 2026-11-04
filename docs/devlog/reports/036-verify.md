# 036 verify — 沈黙とモンティノ（84e2108）

結論: **OK**

## モンスター名
- 「暗黒僧侶」はリポジトリのどこにも無い（rg で0件）。コミットの英語表記「dark priest」を和訳したものと思われる。
- 実装は id `darkpriest` = **闇の司祭**（CSV 38行目・compile-monsters の ids と一致、4F・Lv8）。仕様どおり。
- もう1体は witch = 魔女（8F・Lv14）。montino を使う敵はこの2体だけ。

## テスト変更
- game.cjs: `MAGIC.length 25→26`、Lv13 僧侶の既知呪文数 `13→14`。モンティノ（guaranteed=true）の追加分だけで、厳密一致のまま。弱化なし。
- training.cjs: fixture を `{...freshAilments(),poison:true,paralysis:2}` に変更。形が変わっただけで検証内容は同じ。弱化なし。
- selftest.cjs: 5キー形の確認とモンティノ AI テストを追加。既存チェックの削除なし。

## OK判定（独自スクリプト /tmp/v036.cjs、/tmp/v036b.py）
1. 敵モンティノ: 闇の司祭（Lv8）→ Lv8 メンバー 18000判定で **50.2%**（仕様 50%）。魔女（Lv14）→ Lv8 で **79.7%**（式 50+30=80%）。成功時は silence=3。
   - 沈黙中の敵: 2000回行動して呪文0回。呪文の抽選に当たると false を返し、通常攻撃に回る（game.js:259）。
2. 味方モンティノ: 僧侶 Lv3・MP4・戦闘専用・列対象。Lv8 vs Lv8 の4000回で **48.8%**（49%）、ボスには500回中0回。
3. 沈黙した味方:
   - castMagic は false、理由は「沈黙している」。
   - 攻撃は可能（6ダメージ）、傷薬も使えた（+8）。
   - ライブ 1280/390 のコマンド欄: 呪文だけ disabled、戦う・防御・アイテムは有効。状態タグ「沈黙」を表示、JSエラーなし。
   - 他の僧侶のマディで解除できる。ディアルコ・気付け薬での解除は silence.cjs で確認。
4. 解除:
   - 勝利（finishMonsterBattle）・逃走成功（flee）・帰還（enterTown）で0。
   - 3ターンで自然回復し、毒の tick では減らない（silence.cjs）。
5. 自動並び替え: 沈黙は対象外（partyIncapacitated=false、隊列不変）。
6. sim: selftest PASS（新形状の確認と「沈黙した術者は攻撃する」テストを含む）。
7. フルスイート: node 13件・compile-monsters --check・selftest・ブラウザ9件（ライブ、Pages の反映を cmp で確認）すべて PASS。

## 補足
- 共有の /tmp/st.log が別の作業者の selftest 出力（fear）で上書きされていた。自分の実行は /tmp/v036-st.log に取り直して確認済み。各検証者のログ名は分けたほうが安全。
