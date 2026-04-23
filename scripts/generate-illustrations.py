#!/usr/bin/env python3
"""
トレさく — 運動イラスト一括生成スクリプト
OpenAI API を使用して、CSVのプロンプトから運動イラストを生成する。
PNG → WebP 変換まで自動で行う。

使い方:
  1. .env ファイルにAPIキーを記載:
     OPENAI_API_KEY=sk-...

  2. 全運動を生成:
     python scripts/generate-illustrations.py

  3. 特定の運動だけ生成:
     python scripts/generate-illustrations.py squat bridge plank

  4. 品質を指定（low / medium / high）:
     python scripts/generate-illustrations.py --quality high
"""

import argparse
import base64
import csv
import shutil
import subprocess
import sys
import time
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("openai パッケージが必要です。インストールしてください:")
    print("  pip install openai")
    sys.exit(1)

# ── 設定 ──
SCRIPT_DIR = Path(__file__).parent

from dotenv import load_dotenv
load_dotenv(SCRIPT_DIR.parent / ".env")

CSV_PATH = SCRIPT_DIR / "prompts.csv"
ILLUSTRATIONS_DIR = SCRIPT_DIR.parent / "assets" / "illustrations"
ORIGINALS_DIR = ILLUSTRATIONS_DIR / "originals"

STYLE_PREFIX = """以下のスタイルで運動指導用のイラストを1枚作成してください。

【スタイル】
- セミリアリスティックなフラットイラスト
- 白背景、影なし
- 人物: 中年男性、短髪黒髪、白い半袖Tシャツ、紺のハーフパンツ、白い靴下
- 輪郭線: 細い黒線
- 色数: 最小限（肌色、白、紺、青）
- 運動の動作方向を示す赤い矢印（太め、はっきり見える）
- 補助具がある場合は青色で描く（枕、タオルなど）
- 医療的に正確な関節角度と体の向き
- 余計なテキストや文字は入れない
- 横長の構図（アスペクト比 4:3）

"""


def load_prompts(csv_path: Path) -> dict[str, str]:
    """CSVからプロンプトを読み込む"""
    prompts = {}
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            prompts[row["id"]] = row["prompt"]
    return prompts


def convert_to_webp(png_path: Path, webp_path: Path) -> bool:
    """PNG を WebP に変換する"""
    cwebp = shutil.which("cwebp")
    if not cwebp:
        print("警告: cwebp が見つかりません。WebP変換をスキップします。")
        print("  インストール: brew install webp")
        return False
    result = subprocess.run(
        [cwebp, "-q", "80", str(png_path), "-o", str(webp_path)],
        capture_output=True,
    )
    return result.returncode == 0


def generate_image(
    client: OpenAI,
    exercise_id: str,
    prompt: str,
    quality: str,
    model: str,
) -> tuple[Path, Path | None]:
    """1枚の画像を生成し、PNG保存 → WebP変換する"""
    full_prompt = STYLE_PREFIX + prompt

    result = client.images.generate(
        model=model,
        prompt=full_prompt,
        quality=quality,
        size="1536x1024",
    )

    # PNG を originals/ に保存
    ORIGINALS_DIR.mkdir(exist_ok=True)
    png_path = ORIGINALS_DIR / f"{exercise_id}.png"
    img_bytes = base64.b64decode(result.data[0].b64_json)
    with open(png_path, "wb") as f:
        f.write(img_bytes)

    # WebP に変換して illustrations/ に保存
    webp_path = ILLUSTRATIONS_DIR / f"{exercise_id}.webp"
    if convert_to_webp(png_path, webp_path):
        return png_path, webp_path
    return png_path, None


def main():
    parser = argparse.ArgumentParser(description="運動イラスト一括生成")
    parser.add_argument(
        "exercises",
        nargs="*",
        help="生成する運動ID（省略で全件）",
    )
    parser.add_argument(
        "--quality",
        choices=["low", "medium", "high"],
        default="high",
        help="画像品質 (default: high)",
    )
    parser.add_argument(
        "--model",
        default="gpt-image-1.5",
        help="使用するモデル (default: gpt-image-1.5)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="APIを呼ばずにプロンプトだけ表示",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="既存のWebPファイルがあればスキップ",
    )
    args = parser.parse_args()

    # プロンプト読み込み
    prompts = load_prompts(CSV_PATH)
    print(f"CSV読み込み完了: {len(prompts)}件のプロンプト")

    # 対象の運動を決定
    if args.exercises:
        targets = args.exercises
        unknown = [t for t in targets if t not in prompts]
        if unknown:
            print(f"エラー: 不明な運動ID: {', '.join(unknown)}")
            print(f"利用可能: {', '.join(prompts.keys())}")
            sys.exit(1)
    else:
        targets = list(prompts.keys())

    # スキップ判定
    if args.skip_existing:
        before = len(targets)
        targets = [t for t in targets if not (ILLUSTRATIONS_DIR / f"{t}.webp").exists()]
        skipped = before - len(targets)
        if skipped:
            print(f"既存ファイルスキップ: {skipped}件")

    if not targets:
        print("生成対象がありません。")
        return

    print(f"生成対象: {len(targets)}件 (モデル: {args.model}, 品質: {args.quality})")
    print(f"PNG出力先: {ORIGINALS_DIR}")
    print(f"WebP出力先: {ILLUSTRATIONS_DIR}")
    print()

    if args.dry_run:
        for exercise_id in targets:
            print(f"--- {exercise_id} ---")
            print(STYLE_PREFIX + prompts[exercise_id])
            print()
        print("(dry-run: APIは呼んでいません)")
        return

    # OpenAIクライアント初期化
    client = OpenAI()

    success = 0
    errors = []

    for i, exercise_id in enumerate(targets, 1):
        print(f"[{i}/{len(targets)}] {exercise_id} を生成中...", end=" ", flush=True)
        try:
            png_path, webp_path = generate_image(
                client, exercise_id, prompts[exercise_id], args.quality, args.model
            )
            png_kb = png_path.stat().st_size / 1024
            if webp_path:
                webp_kb = webp_path.stat().st_size / 1024
                print(f"OK (PNG: {png_kb:.0f} KB → WebP: {webp_kb:.0f} KB)")
            else:
                print(f"OK (PNG: {png_kb:.0f} KB, WebP変換失敗)")
            success += 1
        except Exception as e:
            print(f"エラー: {e}")
            errors.append((exercise_id, str(e)))

        # レートリミット対策: 少し待つ
        if i < len(targets):
            time.sleep(2)

    print()
    print(f"完了: {success}/{len(targets)} 成功")
    if errors:
        print("失敗した運動:")
        for eid, err in errors:
            print(f"  - {eid}: {err}")


if __name__ == "__main__":
    main()
