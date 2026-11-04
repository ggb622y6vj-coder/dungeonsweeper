# 030-heavy-corpse-on-wipe 検証 (62fac1d) — ゲーム本体OK／シミュレータ回帰1件
## テスト
- tests/*.cjs 全PASS、compile-monsters --check PASS
- **scripts/sim/selftest.cjs FAIL**（113行 wipe.deaths 0 !== 6）。直前コミットではPASS。全滅でパーティが空になり、sim が死者0と数える。combat.cjs Lv1 3F指定 300戦: deathsPerBattle 2.73→1.06（勝率・全滅率は同程度で試行間の復元は機能）→ todo/030a
- テスト差分: 削除行は tests/training.cjs のハーネス2行のみ（el に dataset/children 追加、training.js 読込追加）。アサーション削除・弱化なし、+58行のassert追加
## 実装確認（コード）
- defeat(): 全員dead・HP0、corpses に {id(UUID),floor,cell,records(完全コピー),gold} 追加、gold=0、defeatPending、save()。ログ再生終了で finishDefeat()：PARTY_FIELDS を空、resetDungeon（area=town）。起動時 defeatPending なら finishDefeat
- rosterSaveState: defeatPending 中は roster=控えのみ・partyIds=[]（再生途中リロードでもパーティが控えに混入しない）、corpses 保存、旧セーブは []
## 実機（Pages=62fac1d一致）
- 1F守護者戦で実際に全滅→ログ再生中（defeatPending=true, 6人表示）: gold 777→0、corpse {地下1階, cell14, gold777, 6人dead}。SS v030-wipe-replay.png
- 再生途中でリロード→ area=town、パーティ0人、gold0、corpses1、名簿は控えRのみ（全滅組は名簿にも控えにもいない）
- 訓練所「迷宮に残された遺体：地下1階（W0、W1、W2、W3、W4、W5）」 SS v030-training.png / v030-mobile-training.png(390x844)
- 継続性: 所持金0でも訓練所で新規作成（UI）→控えR+新2人でパーティ→迷宮入場OK。ソフトロックなし（作成は無料）。ただし控えなし・金0でも新規作成で再開可能
- 寺院: 「蘇生が必要な冒険者はいません。」＝全滅組は寺院にも出ない。030/031仕様どおり（031で回収→控えにdeadで戻り寺院へ）
- 再リロードで corpses 保持、corpses を消した旧形式セーブ→ [] で例外なし。pageerror 0。SS v030-after.png
## 注意点（仕様判断、todoなし）
- 回収前に遺体の金貨は失われたまま、031未実装の間は全滅組は取り戻せない（031で解消予定）
- 遺体は floor/cell を保持するが 1F は resetDungeon で毎回再生成される → 031の cell 再配置仕様で対処予定
