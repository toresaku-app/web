# exercise-curator 暗黙知・文脈メモ

CLAUDE.md には書かれていない、画像生成フロー・作業の作法と注意点。

---

## ユーザー（オーナー）について

- 理学療法士が本業。プログラミングは専門外で「バイブコーディング」スタイル
- 技術的な説明は短く、判断を求める時は選択肢を出す
- 「よろ」「ろ」「おk」= 承認の意味
- ターミナル操作には不慣れ。コマンドは curator 側で実行する方がスムーズ
- 画像のクオリティには目が厳しい（「AI で作った感が強すぎる」と却下された経緯あり）
- API キー等のセキュリティ知識は薄い。一度チャットに API キーを貼ってしまった経緯あり → **機密情報の扱いは curator 側が誘導する**

---

## コミュニケーションの癖

- 「見せて」→ `open` コマンドで Finder/プレビューで開く（チャット内プレビューだけでは不十分）
- 「まだ生成しないで」と前置きされたら情報提供のみ、API / スクリプト実行は控える
- plan mode に入っても実質「確認して即実行」のテンポ。長い設計議論より手を動かす方を好む
- エクセルを作ってと言われたら openpyxl で生成して `open` で開く
- 技術的質問への回答は短く、表形式で比較する

---

## 画像生成のワークフロー（現在の運用）

### 現状
- **API クレジットは切れている**。$5 チャージ分を使い切り
- 以降は ChatGPT 手動生成に切り替え

### 手動生成フロー
1. curator が Excel にフルプロンプトを入れて渡す
2. ユーザーが ChatGPT にコピペ → 1 枚ずつ生成
3. ユーザーが `originals/` に画像を入れる
4. curator が画像を 1 枚ずつ `Read` で確認して運動を特定
5. 時系列順に Excel の運動リストと対応させて対応表を作成
6. ユーザーに確認を取る
7. 承認後に `mv` でリネーム → `cwebp -q 80` で WebP 変換 → `illustrations.ts` に登録

### ChatGPT の画像ファイル名
- `ChatGPT Image 2026年4月XX日 HH_MM_SS.png` という名前で保存される
- 時系列順に Excel の運動リストと対応させる

---

## `exercises.ts` の書き方

### パターン
- `defaultReps`: ストレッチ系は 3 回、筋トレ系は 10〜15 回、呼吸系は 5〜10 回
- `defaultSets`: ほぼすべて 2 セット（骨盤底筋運動のみ 3 セット）
- `defaultHoldSeconds`: ストレッチ 20 秒、筋トレ 3〜5 秒、バランス 10〜15 秒。動的運動ではフィールド自体を省略
- `keyPoints`: 必ず 3 つ、臨床的に重要な順
- `description`: 1 文完結、「〜します」で終わる

### 注意
- `category` と `bodyPart` を混同しない（「体幹」は `bodyPart`）
- `category` の値: `"筋トレ" | "ストレッチ" | "バランス" | "ADL" | "呼吸"`
- UI の `CATEGORY_FILTERS` には「ADL」「呼吸」が未追加（app-developer 領域の TODO）
- `illustration` フィールドは型に存在するが使われていない（`illustrations.ts` のマッピングで管理）

---

## ファイル配置ルール

- アプリが参照: `assets/illustrations/*.webp` のみ
- PNG 原本: `assets/illustrations/originals/`（`.gitignore` 済み）
- スクリプト関連: `scripts/` に集約
  - `generate-illustrations.py`
  - `prompts.csv`
  - `README.md`
  - `batch*-prompts.xlsx`

---

## 地雷・注意点

### 絶対に踏まない地雷
- **Category 型に「体幹」を追加**（必ずハマる。体幹は BodyPart）
- **`.env` の中身をチャットに出力**（API キー漏洩）
- **既存イラストを上書き**（`squat.png` を一度テスト生成で上書きして `git checkout` で戻した事例）
- **コミットを勝手に実行**（git 操作は app-developer 領域）
- **UI フィルタ配列を触る**（`CATEGORY_FILTERS` は app-developer 領域）
- **型だけ追加して UI 反映を忘れる**（型追加時は必ず app-developer に UI 反映を依頼）

### 環境固有の注意
- macOS の `pip`: `pip` は使えない。`pip3 install --break-system-packages` が必要
- OpenAI API クレジット: 切れている。API 経由生成はエラー
- Excel の文字化け: openpyxl 生成 Excel は Numbers で開く。Excel で開くとエンコーディング問題
- 画像サイズの不統一: ChatGPT 手動生成は正方形/4:3/16:9 混在。API 生成は 1536x1024 統一

---

## タスク管理

- CLAUDE.md: 「タスク管理ファイルの更新は Claude 側が責任を持つ」
- 運動追加時、その場で `tasks/phase8-exercise-100.md` のチェックボックスを更新
- バッチ完了時は進捗テーブルのステータスも更新
- **現状 pm が未雇用なので、`plan.md` の更新は app-developer が暫定担当**

---

## ユーザーの次のアクション候補

- OpenAI API クレジットの追加チャージ（急ぎではない）
- 100 種での実機テスト（app-developer 領域）
- iOS 審査再提出 / Web 版デプロイ（app-developer 領域）
- テンプレート機能（Phase 3）の着手（app-developer 領域）
