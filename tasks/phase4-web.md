# Phase 4: Webアプリ化

## 1. 調査・設計
- [ ] Expo Web対応の現状確認（`expo start --web` での動作テスト）
- [ ] NativeWind v4のWeb互換性確認
- [ ] PDF出力のWeb対応方針決定（expo-printはWeb非対応 → window.print() or jsPDF等）
- [ ] 共有機能のWeb対応方針（Web Share API / ダウンロードリンク）
- [ ] デプロイ先の選定（Vercel / Cloudflare Pages / GitHub Pages等）

## 2. Web対応実装
- [ ] Web用PDF出力の実装
- [ ] Web用共有・ダウンロード機能の実装
- [ ] レスポンシブ対応（PC/タブレット/スマホ）
- [ ] Web固有のUIアジャスト（ホバー、カーソル等）

## 3. デプロイ
- [ ] ビルド設定（`npx expo export --platform web`）
- [ ] ホスティング設定・デプロイ
- [ ] カスタムドメイン設定（任意）

## 4. 動作確認
- [ ] 主要ブラウザでの動作テスト（Chrome, Safari, Firefox）
- [ ] モバイルブラウザでの動作テスト
- [ ] PDF出力の品質確認
