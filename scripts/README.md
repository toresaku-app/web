# 運動イラスト自動生成ガイド

## 概要
OpenAI API (gpt-image-1.5) を使って、運動イラストをコマンド1つで一括生成する。

## 前提条件
- Python 3 + `openai` + `python-dotenv` がインストール済み
- `.env` に `OPENAI_API_KEY=sk-...` が設定済み
- `cwebp` がインストール済み（`brew install webp`）

## ファイル構成
```
scripts/
├── README.md                  # このファイル
├── generate-illustrations.py  # 生成スクリプト
└── prompts.csv                # 運動ごとのプロンプト一覧
```

## 新しい運動を追加する手順

### 1. prompts.csv にプロンプトを追加

```csv
exercise-id,"【運動】運動名（English Name）
ポーズの説明。
視点: 横から（側面図）。
赤い矢印: 動作方向を示す。"
```

- 共通スタイル（服装・背景・色など）はスクリプト内に定義済み。個別プロンプトには運動固有の内容だけ書く
- 既存プロンプトを参考にする。スタイルの詳細は `assets/illustrations/PROMPT_TEMPLATE.md` を参照

### 2. 画像を生成

```bash
# rehab-hep フォルダで実行
cd ~/Desktop/rehab-hep

# 特定の運動だけ生成
python3 scripts/generate-illustrations.py --quality high exercise-id

# 複数指定も可能
python3 scripts/generate-illustrations.py --quality high id1 id2 id3

# 全運動を一括生成（既存スキップ）
python3 scripts/generate-illustrations.py --quality high --skip-existing
```

PNG が `assets/illustrations/` に保存される。

### 3. WebP に変換

```bash
cd assets/illustrations
cwebp -q 80 exercise-id.png -o exercise-id.webp
```

### 4. exercises.ts にデータ追加

`src/constants/exercises.ts` に運動データを追加:

```typescript
{
  id: "exercise-id",
  name: "運動名",
  nameEn: "English Name",
  target: "ターゲット筋",
  posture: "座位",        // 臥位 | 側臥位 | 座位 | 立位 | 四つ這い
  category: "ストレッチ",  // 筋トレ | ストレッチ | 体幹 | バランス | ADL | 呼吸
  bodyPart: "下肢",       // 下肢 | 体幹 | 上肢
  defaultReps: 3,
  defaultSets: 2,
  defaultHoldSeconds: 20,
  description: "運動の説明文",
  keyPoints: [
    "ポイント1",
    "ポイント2",
    "ポイント3",
  ],
},
```

### 5. illustrations.ts に登録

`src/constants/illustrations.ts` に追加:

```typescript
"exercise-id": require("../../assets/illustrations/exercise-id.webp"),
```

### 6. 型チェック

```bash
npx tsc --noEmit
```

### 7. tasks/phase8-exercise-100.md のチェックボックスを更新

## コマンド早見表

| やりたいこと | コマンド |
|-------------|---------|
| 1枚テスト生成 | `python3 scripts/generate-illustrations.py --quality high exercise-id` |
| 全件一括生成 | `python3 scripts/generate-illustrations.py --quality high` |
| 既存スキップで新規だけ | `python3 scripts/generate-illustrations.py --quality high --skip-existing` |
| プロンプト確認（API呼ばない） | `python3 scripts/generate-illustrations.py --dry-run` |
| モデル変更 | `python3 scripts/generate-illustrations.py --model gpt-image-2` |
| WebP変換 | `cwebp -q 80 name.png -o name.webp` |
| 型チェック | `npx tsc --noEmit` |

## 費用目安（gpt-image-1.5, high）
- 1枚: $0.068
- 10枚: $0.68
- 100枚: $6.80（約1,000円）

## 注意事項
- `.env` は `.gitignore` に入っているのでgitには上がらない
- APIキーを再発行した場合は `.env` を更新する
- 画像のクオリティに不満があれば、新モデル指定で再生成するだけで差し替え可能
