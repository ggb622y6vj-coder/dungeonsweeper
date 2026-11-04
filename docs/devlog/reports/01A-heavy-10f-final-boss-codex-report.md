# 01A-heavy-10f-final-boss 作業報告

実装・自動回帰検証は完了。総合判定は未完了（指定の勝率条件を満たさず、ブラウザ表示も未確認）。

## 変更ファイル

- `dist/monsters.js`：10Fの迷宮の主を含む守護者戦の勝利時に `cleared=true` とクリア通知を設定。下り階段を作らず指定文を `log()` に追加。1〜9Fの階段は従来どおり。
- `dist/game.js`：踏破記録を帰還・階層移動・再探索でも保持。旧セーブの未設定値をfalseに補完。`travelFloor` は1〜10の整数以外をfalseで拒否し、訪問済み階への転移も上限を越えられない。旧セーブの10F以降の下り階段も無効化。ログ再生後にクリア表示を出す。
- `dist/index.html`：クリア表示・町への帰還ボタン・町の小さな「迷宮踏破済み」表示。既存の宝箱処理を維持し、開封／放棄が必要な場合は説明を表示。
- `docs/SPECIFICATION.md`：最深階、クリア条件、保存・再探索、宝箱処理後の帰還を記載。
- `tests/final-boss.cjs`：実際の守護者編成・attack経路を使い、随伴が残る間の未クリア、通常10F戦では未クリア、10Fクリア、ログ表示順、帰還・再攻略、9F階段、ash-v1の保存復元、旧セーブ移行、11Fへの階段／転移拒否を検証。
- `tests/game.cjs`：上記回帰テストを共通テストに組み込み。

## 検証

- `node tests/game.cjs`：PASS。
- `node tests/training.cjs`：PASS。
- `python3 scripts/compile-monsters.py --check`：PASS（88種）。
- `node scripts/sim/selftest.cjs`：PASS。
- `git diff --check`：PASS。
- ブラウザ：未確認。Python Playwrightは未導入。既存Chromeのheadless起動も `crashpad ... setsockopt: Operation not permitted (1)`（終了コード133）で失敗した。UI状態の自動テストはDOMスタブであり、実ブラウザ確認の代用とはしていない。

## 勝率条件：未達

いずれも固定シード、Lv18、6人（戦士・戦士・僧侶・盗賊・魔法使い・僧侶）、10F守護者・随伴込み、300戦。

```sh
node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 18 --floor 10 --boss --gear shop --n 300
node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 18 --floor 10 --boss --gear drop --n 300
```

| 装備 | 勝率 | 全滅率 | 平均死者 | HP損耗率 | 平均ラウンド |
| --- | ---: | ---: | ---: | ---: | ---: |
| 店装備 | 95.33% | 4.67% | 0.41 | 0.3263691561 | 4.9533333333 |
| 迷宮装備を含む | 100% | 0% | 0.0033333333 | 0.1021777271 | 2.4966666667 |

指定の65〜90%を超える。既存の `/workspace/dsw-queue/report/01A-sim-before.txt` にある変更前の両装備の結果と一致。今回の変更内容に敵能力・装備・戦闘AIの調整は含まれないため、数値は変更していない。約78%の再現条件の確認または別途バランス調整が残る。

## キュー管理

総合判定が未完了のため `todo/01A-heavy-10f-final-boss.md` はdoneへ移していない。また、外部キュー `/workspace/dsw-queue` はこの実行環境の書込み許可範囲外（許可は作業リポジトリと `/tmp` のみ）。報告は書込み可能な本リポジトリの `report/` に保存した。
