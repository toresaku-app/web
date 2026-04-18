# トレさく - 自主トレ指導書をサクッと作成

理学療法士が患者向けの自主トレーニング指導書（HEP: Home Exercise Program）を素早く作成・出力するアプリ。

## 技術スタック
- Expo SDK 54 + React Native 0.81
- TypeScript (strict mode)
- Expo Router (file-based routing)
- NativeWind v4 (Tailwind CSS)
- Zustand v5 (状態管理)
- expo-sqlite (ローカルDB、バックエンド不要)
- expo-print / expo-sharing (PDF出力・共有)

## デザイン
- UIデザインガイド: DESIGN.md を参照（カラー、タイポグラフィ、コンポーネント仕様）

## ディレクトリ構成
- app/ - Expo Routerのページ
- src/components/ - UIコンポーネント
- src/stores/ - Zustandストア
- src/db/ - SQLiteスキーマ・クエリ
- src/types/ - 型定義
- src/constants/ - 運動データ・定数
- src/utils/ - ユーティリティ
- assets/illustrations/ - 運動イラスト(SVG/PNG)

## 開発コマンド
- `npx expo start` - 開発サーバー起動
- `npx tsc --noEmit` - 型チェック
- `npx expo lint` - Lint実行

## アーキテクチャ方針
- ローカルオンリー: 患者データはデバイス内のみ、クラウド送信しない
- 個人情報最小化: 患者名は任意、匿名IDでも運用可能
- SaMD非該当: 「記録・出力ツール」に徹し、診断・治療目的の機能や表現を避ける

## コーディング規約
- 関数コンポーネントのみ使用
- anyの使用禁止
- console.logを本番コードに残さない
- NativeWindのクラス名で直接スタイリング（StyleSheet不使用）

## タスク管理ルール
- 全体計画: plan.md → 各フェーズの詳細: tasks/phase*.md
- タスク完了時: 該当のtasks/phase*.mdのチェックボックスを[x]に更新すること
- 新課題発見時: plan.mdに追記し、対応するtasks/*.mdも作成or更新すること
- タスク管理ファイルの更新はClaude側が責任を持つ（ユーザーに手動更新させない）

## 禁止事項
- 「この運動で治る」等の効能表現
- 患者データのクラウド送信
- 既存アーキテクチャの無断変更
