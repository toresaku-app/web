# Phase 4: Webアプリ化

## 1. 調査・設計
- [x] Expo Web対応の現状確認（`expo start --web` での動作テスト）
- [x] NativeWind v4のWeb互換性確認
- [x] PDF出力のWeb対応方針決定 → window.open + window.print()
- [x] 共有機能のWeb対応方針 → ブラウザ印刷ダイアログからPDF保存
- [x] デプロイ先の選定 → GitHub Pages（Vercelはセキュリティインシデントのため除外）

## 2. Web対応実装
- [x] Web用PDF出力の実装（window.print）
- [x] Native-onlyモジュールの動的import化（expo-print/sharing/file-system）
- [x] Alert.alert → window.confirm 分岐
- [x] AppState バックグラウンド監視 Webスキップ
- [x] findNodeHandle Webスキップ
- [x] Image style修正（className → style）

## 3. デプロイ
- [x] ビルド設定（`npx expo export --platform web`）
- [x] GitHub Actions ワークフロー作成
- [x] GitHub Pages デプロイ完了 → https://toresaku-app.github.io/web/
- [ ] カスタムドメイン設定（任意）

## 4. 動作確認
- [x] PC ブラウザでの動作テスト
- [x] モバイルブラウザでの動作テスト
- [x] PDF出力の動作確認
