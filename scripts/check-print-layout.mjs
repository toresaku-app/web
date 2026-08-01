#!/usr/bin/env node
/**
 * 印刷レイアウトの回帰ガード（依存なし・Node標準のみ）
 *
 * 過去に踏んだ失敗を再発させないための静的チェック。
 *   - チェック表が実機（iOS Safari）でページをはみ出し、フッターだけ次ページに落ちた
 *   - イラスト枠の高さを変えるとページ数較正が崩れる
 *
 * 注意: これはレンダリング結果を測るテストではない。
 * 「較正の前提が崩れていないか」を静的に見張るガードなので、
 * 要素の見た目を変えたときは実ブラウザでの再計測が別途必要。
 *
 * 実行: node scripts/check-print-layout.mjs
 */
import { readFileSync } from "node:fs";

const SRC = "src/utils/generateHtml.ts";
const src = readFileSync(SRC, "utf8");

/** 実機で「収まった」ことが確認できている上限（これを超える budget は不可） */
const PROVEN_SAFE = { portrait: 700, landscape: 480 };

const failures = [];
const notes = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

// ── 1. 較正係数の抽出 ──────────────────────────────
const coeffRe =
  /\?\s*\{\s*fixed:\s*([\d.]+),\s*perWeek:\s*([\d.]+),\s*rowH:\s*([\d.]+),\s*memo:\s*([\d.]+),\s*budget:\s*([\d.]+),\s*columns:\s*(\d+)\s*\}\s*:\s*\{\s*fixed:\s*([\d.]+),\s*perWeek:\s*([\d.]+),\s*rowH:\s*([\d.]+),\s*memo:\s*([\d.]+),\s*budget:\s*([\d.]+),\s*columns:\s*(\d+)\s*\}/;
const m = src.match(coeffRe);

if (!m) {
  console.error(
    `✗ ${SRC} から renderCheckSheets の較正係数を読み取れませんでした。\n` +
      `  係数の形を変えた場合は本スクリプトの正規表現も更新してください。`
  );
  process.exit(1);
}

const n = (i) => Number(m[i]);
const MODEL = {
  landscape: { fixed: n(1), perWeek: n(2), rowH: n(3), memo: n(4), budget: n(5), columns: n(6) },
  portrait: { fixed: n(7), perWeek: n(8), rowH: n(9), memo: n(10), budget: n(11), columns: n(12) },
};

// ── 2. budget が実績値を超えていないか ──────────────
for (const [orient, cfg] of Object.entries(MODEL)) {
  check(
    cfg.budget <= PROVEN_SAFE[orient],
    `${orient}: budget ${cfg.budget} が実績のある上限 ${PROVEN_SAFE[orient]} を超えています。` +
      ` 実機で収まることを確認せずに上げないでください`
  );
}

// ── 3. 各運動数で選ばれる週数が budget に収まるか ────
const estimate = (cfg, weeks, rows) =>
  cfg.fixed + Math.ceil(weeks / cfg.columns) * (cfg.perWeek + cfg.rowH * rows) + cfg.memo;

// renderCheckSheets と同じ分割ロジックを再現する
const planSheets = (cfg, totalRows) => {
  const maxRowsPerSheet = Math.max(
    1,
    Math.floor((cfg.budget - cfg.fixed - cfg.memo - cfg.perWeek) / cfg.rowH)
  );
  const chunkCount = Math.ceil(totalRows / maxRowsPerSheet);
  const maxChunkRows = Math.min(totalRows, maxRowsPerSheet);
  const weeks =
    [4, 2, 1].find((w) => estimate(cfg, w, maxChunkRows) <= cfg.budget) ?? 1;
  const weekGroups = Math.ceil(4 / weeks);
  return {
    weeks,
    maxChunkRows,
    sheets: weekGroups * chunkCount,
    height: Math.round(estimate(cfg, weeks, maxChunkRows)),
  };
};

for (const [orient, cfg] of Object.entries(MODEL)) {
  for (let rows = 1; rows <= 100; rows++) {
    const p = planSheets(cfg, rows);
    check(
      p.height <= cfg.budget,
      `${orient} ${rows}種目: ${p.weeks}週/枚・最大${p.maxChunkRows}行でも ${p.height}px となり` +
        ` budget ${cfg.budget} を超えます（要素が大きすぎる）`
    );
    if (rows === 3) {
      notes.push(
        `${orient} 3種目 → ${p.weeks}週/枚・${p.height}px・計${p.sheets}枚（budget ${cfg.budget}）`
      );
      // 3種目は最も一般的な構成。4週1枚に収まることを維持したい
      check(
        p.weeks === 4 && p.sheets === 1,
        `${orient} 3種目が ${p.weeks}週/枚・${p.sheets}枚になっています（4週1枚を維持したい）。` +
          ` チェック表の要素を大きくしていないか確認してください`
      );
    }
    if (rows === 20) {
      notes.push(`${orient} 20種目 → ${p.weeks}週/枚・最大${p.maxChunkRows}行・計${p.sheets}枚`);
    }
  }
}

// ── 4. イラスト2枚化が枠の高さを変えていないか ──────
const pairRule = src.match(/\.illust-pair\s*\{([^}]*)\}/);
check(pairRule !== null, ".illust-pair のスタイルが見つかりません");
if (pairRule) {
  check(
    !/(^|[^-])height\s*:/.test(pairRule[1]),
    `.illust-pair が height を指定しています。1枚時と枠の高さが変わると` +
      ` ページ数の較正が崩れます（中身の分割だけで対応してください）`
  );
}

// ── 5. 画面用スタイルがPDF生成に混入していないか ────
check(
  /forScreen \? screenStyle\(pageWidthPx\) : ""/.test(src),
  "screenStyle が forScreen で分岐していません。PDF生成に画面用スタイルが混入します"
);
check(
  /forScreen \? `<meta name="viewport"/.test(src),
  "viewport メタが forScreen で分岐していません"
);

// ── 結果 ────────────────────────────────────────
console.log("印刷レイアウト回帰ガード");
console.log("─".repeat(52));
for (const note of notes) console.log(`  ${note}`);
console.log("─".repeat(52));

if (failures.length > 0) {
  console.error(`✗ ${failures.length} 件の問題:\n`);
  for (const f of failures) console.error(`  - ${f}\n`);
  process.exit(1);
}
console.log("✓ すべて通過");
