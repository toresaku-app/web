# Phase 2: 運動メニュー拡充（+12種 → 合計22種）

## 1. イラスト作成（PROMPT_TEMPLATE.md のスタイルに準拠）

### 体幹（+4種）
- [x] ダイアゴナル（バードドッグ） → `bird-dog.png`
- [x] プランク → `plank.png`
- [x] シットアップ → `sit-up.png`
- [x] トランクローテーション → `trunk-rotation.png`

### 上肢（+4種）
- [x] 肩関節屈曲挙上 → `shoulder-flexion.png`
- [x] 肩関節外転挙上 → `shoulder-abduction.png`
- [x] 肩外旋運動 → `shoulder-external-rotation.png`
- [x] グーパー運動 → `hand-grip.png`

### 下肢（+4種）
- [x] ヒップアブダクション → `hip-abduction.png`
- [x] ハムストリングスカール → `hamstring-curl.png`
- [x] タンデム立位 → `tandem-stance.png`
- [x] ステップ運動 → `step-up.png`

## 2. コード実装
- [x] `src/constants/exercises.ts` に12種追加
- [x] `src/constants/illustrations.ts` に12種のrequire追加
- [x] `src/types/exercise.ts` のPosture型に「四つ這い」追加（バードドッグ用）
- [x] フィルタに「四つ這い」追加（`app/index.tsx`）

## 3. 動作確認
- [x] 全22種がライブラリに表示される
- [x] フィルタ・検索が正常動作
- [x] PDF出力で新規運動のイラストが表示される
- [x] 型チェック通過（`npx tsc --noEmit`）

## 4. リリース
- [ ] app.jsonのバージョンを1.1.0に更新
- [ ] Xcodeでアーカイブ → App Store Connectにアップロード
- [ ] App Storeの「新機能」に追加運動の説明を記載
