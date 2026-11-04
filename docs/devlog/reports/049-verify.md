# 049 石化メンバーのグレーアウト 検証 — OK（既存の軽い問題1点）
対象: 47fdb08（origin/main b2526e1、/workspace/verify-clone2、push なし）

## 結果（OKの判定方法 1〜6）
- デプロイ: dist/*.js と index.html がライブと一致。sha256sum -c OK
- 6. テスト: Node 19件・compile --check（88体）・selftest・ブラウザ15件（ライブURL）すべてPASS
- ライブ 1280（マウス）/390（タップ）、探索・戦闘の両方（/tmp/v049/b.py）:
  - 1. ディオス: 石化カードが .untargetable・aria-disabled=true・opacity .4・cursor not-allowed
  - 2. 石化カードをクリック／タップ: MP・HP・持ち物・ログ・予約がすべて不変。メッセージなし。選択モードは続く
  - 3. マディ: 石化カードは選択可（opacity 1）。探索では石化が解ける（status=ok）。戦闘では magicPlans={madi,target:3}
  - 4. 薬: 1・2 と同じ（グレー表示、無反応）
  - 5. キーボード: 矢印キーでの移動では、石化カードにはフォーカスが行かない
  - JSエラーなし

## 問題（049 で入ったものではない。軽微）
- 内容: グレーのカード（石化・死亡）をマウスでクリックすると、反応はしないがフォーカスがそのカードに乗る。その状態で Space を押すと、先頭の候補（冒1）に呪文・薬が使われる。
- 確認したケース:
  - 死亡カード → ディオスが冒1に発動し、MP −2
  - 薬 → 冒1に「HPは満タンだ。」
- 原因: keynav.js detect() は、キーボード候補のカードだけを roots に入れる。フォーカスが roots の外にあると、Space は現在の既定（先頭の候補）を実行する。
- 再現手順: ディオス → 灰色カードをクリック → Space
- 修正案（別タスク）:
  - .untargetable のカードでは mousedown で preventDefault してフォーカスさせない
  - または、Space の対象が allyTargetCanWork でなければ何もしない
