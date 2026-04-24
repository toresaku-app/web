# exercise-curator 引き継ぎノート

**最終更新**: 2026-04-24

このファイルは**流動的な情報**を扱う。作業区切りごとに更新すること。

---

## 現在の状態

### データ状況
- `exercises.ts`: 100 種（Batch 1〜7 完了）
- `illustrations.ts`: 100 件のマッピング
- `assets/illustrations/`: 100 枚の WebP
- `npx tsc --noEmit`: エラーなし

### コミット状態（重要：過去の記憶は誤認）
- **Batch 3〜7 のデータは既にコミット済み**。前回のセッションで「大量の未コミット変更がある」と記録していたが、これは誤認。実際は app-developer が並行ターミナルでコミット済みだった
- 起動時には必ず `git log --oneline -20` と `git status` で実態を確認すること

### API クレジット
- OpenAI API の $5 チャージは使い切り済み（約 24 枚生成で枯渇）
- 以降は ChatGPT 手動生成に切り替えて Batch 7 まで完遂
- 追加チャージは未実施

---

## 直近で完了した作業

- Batch 7（13 種）の画像リネーム・WebP 変換・`exercises.ts` 追加・`illustrations.ts` 登録・型チェック
- **100 種到達**
- PNG / WebP 分離（`originals/` サブフォルダ運用）
- `.env` の `.gitignore` 追加

---

## 未完の TODO

### 優先度 高（リリースブロッカー、ただし一部は app-developer 領域）
- [ ] **app-developer へ依頼**: `app/index.tsx` の `CATEGORY_FILTERS` に「ADL」「呼吸」を追加
- [ ] **app-developer へ依頼**: 100 種での実機テスト（フィルタ・検索・PDF 出力）
- [ ] **app-developer へ依頼**: Web 版の更新デプロイ（100 種反映）
- [ ] **app-developer へ依頼**: iOS 版の審査再提出（100 種対応版）

### 優先度 中（curator 範囲内）
- [x] ~~**pm 雇用後に依頼**: `plan.md` のフェーズ一覧更新（Phase 7, 8 を「完了」に）~~ → pm が対応済み（C-20260424-01 で確認）
- [ ] `prompts.csv` に Batch 4〜7 の運動プロンプトを追加（現在 Batch 1〜3 + 一部のみ。手動生成分は Excel にしか残っていない）
- [ ] `PROMPT_TEMPLATE.md` を 100 種分に更新（現在 10 種分のみ記載）

### 優先度 低（将来）
- [ ] 画像生成モデルの改善時に全イラストを差し替え（`generate-illustrations.py --skip-existing` 無効化で一括再生成可能）
- [ ] 運動イラスト 2 枚化（開始姿勢→動作中）※`illustration2?: string` の型追加は app-developer 担当、実装決定後に curator が画像生成
- [ ] 100 種を超える追加運動の選定
- [ ] OpenAI API クレジットの追加チャージ

---

## 詰まっているところ・懸念

### 技術的に未解決
- **PDF の 100 種対応**: PDF 出力で 100 種すべてを含む指導書のパフォーマンスは未検証（通常は 10 種程度の選択なので実運用では問題ないはず）
- **Metro bundler の画像ロード**: 100 枚の WebP を `require()` でバンドルした場合のビルド時間・アプリサイズへの影響は未検証

### 判断保留中
- **Batch 7 の運動選定の妥当性**: 臨床使用頻度とカバレッジのギャップから選定したが、医学的レビューは未実施
- **イラストの医学的正確性**: ChatGPT/API 生成イラストの関節角度や体位の正確性検証はユーザーに委ねている

### 要検証
- **WebP の実機表示**: 以前のバージョンで iOS 表示に懸念があった。100 枚での実機確認は未実施
- **カテゴリフィルタ追加後の UI**: 「ADL」「呼吸」追加で 6 カテゴリになる。フィルタバーが横スクロールで収まるか、UI が崩れないか

---

## 次の一手（候補）

ユーザーから指示がなければこの順を推奨：
1. `plan.md`・`tasks/phase8-*.md` の進捗表記更新（完了フラグ）
2. `PROMPT_TEMPLATE.md` を 100 種分に更新
3. app-developer へ `CATEGORY_FILTERS` 追加を依頼
