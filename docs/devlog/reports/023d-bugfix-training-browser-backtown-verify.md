# 023d 検証 (9fcfaa9) — OK
- 差分: tests/training-browser.py の `#backtown` クリック1行を、開始マスで pendingStairs → 実際の `#bossyes`（はい）ボタンのクリックに置き換え。アサーションの削除・弱化なし
- 実行: /tmp/pyv の python playwright で、Chromeのパスだけ /usr/bin/google-chrome に差し替えて本番(13300fe)に対し実行 → 1280px・390px とも PASS（町での全快と死亡、馬小屋でok全員のレベルアップと報告、有料の部屋なし、JSエラー・はみ出しなし）
- Chromium のパスが /usr/bin/chromium に固定されている → todo/023g（環境変数＋候補パス）
