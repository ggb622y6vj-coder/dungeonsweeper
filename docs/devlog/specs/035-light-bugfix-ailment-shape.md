# 035 [light][bugfix] 状態異常オブジェクトの形と afflict の種類判定を整理する（036/037の前提）

## 共通ルール
- 作業ツリーは担当者自身のもの。/workspace/dungeonsweeper 以外の他人のツリーには触らない。push はオーナー指示があるまでしない。
- 既存テストのチェックは削除・緩和しない。仕様変更で期待値が変わる場合は理由をコミットメッセージに書く。
- 完了条件: node tests 全件・`python3 scripts/compile-monsters.py --check`・`node scripts/sim/selftest.cjs`・ブラウザテスト全件（1280/390）PASS、JSエラーなし。

## 目的
現状 `afflict(i,type)` は poison/stone 以外の type をすべて「麻痺4」として扱う（else 分岐）。沈黙・恐怖を追加すると、取りこぼした呼び出しが黙って麻痺になる。また ailments の初期化が `{poison:false,paralysis:0}` と `{...,sleep:0}` の2形で game.js/party.js/recruits.js/spells.js に計11か所散在している。

## 変更内容
- `freshAilments()` を1つ作り `{poison:false,paralysis:0,sleep:0,silence:0,fear:0}` を返す。既存の初期化11か所をすべてこれに置換（enterTown・石化・蘇生・加入・ロード時の補完を含む）。
- 旧セーブ(ash-v1)ロード時、欠けているキーを 0/false で補完する。
- afflict: type を poison/paralysis/stone/silence/fear で明示分岐し、未知の type は何もせず console.warn（麻痺にしない）。silence/fear の中身は036/037で実装（ここでは分岐の枠だけ）。

## OKの判定方法
1. 既存の毒・麻痺・石化の挙動とログが ac053d1（＋034）と同一（既存テストPASS）。
2. node で `afflict(0,'xxx')` → ailments 変化なし。
3. 旧セーブ（sleep等キー欠落）をロード → 全キーが揃い、JSエラーなし。
4. `rg "paralysis:0}" dist` が freshAilments 定義以外でヒットしない。
