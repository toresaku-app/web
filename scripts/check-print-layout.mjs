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

/**
 * 実機で「収まった」ことが確認できている上限（これを超える budget は不可）。
 *
 * ⚠️ この値の根拠は「運動ページ（縦700px）は1枚に収まっている」という観測だったが、
 * 2026-08-05 の実測で**運動ページは縦736px**であることが判明した。
 * つまり 700 という数字はもう現物と対応していない。
 * 実機で1回印刷して実効領域を測り直すまで、保守的にこの値を据え置く。
 * 手順は DESIGN.md §7 を参照。
 */
const PROVEN_SAFE = { portrait: 700, landscape: 480 };

/**
 * 2026-08-05 に実ブラウザ（/print）で測った各ページの高さ。
 * このスクリプトはレンダリングできないので、値は手で記録している。
 * **要素を足し引きしたら再測定してここを更新すること。**
 *
 * cover は種目数に比例して伸びる: base + perExercise * N
 *   縦 実測: 3種目=532px / 10種目=721px / 20種目=1001px
 *   横 実測: 3種目=475px / 10種目=647px
 */
const MEASURED = {
  exercisePage: { portrait: 736, landscape: 619 },
  cover: {
    portrait: { base: 449, perExercise: 27.6 },
    landscape: { base: 401, perExercise: 24.6 },
  },
};

/** 各ページを構成するブロック。増減したら実測し直す必要がある */
const EXPECTED_BLOCKS = {
  exercisePage: ["page-header", "title-block", "illust", "rx-strip", "points", "page-footer"],
  cover: ["cover-title-block", "cover-date", "cover-summary", "cover-notice"],
};

const failures = [];
const warnings = [];
const notes = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};
const warn = (ok, message) => {
  if (!ok) warnings.push(message);
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

// ── 5. 運動ページ・表紙の高さ（2026-08-05 追加） ────
//
// このスクリプトはレンダリングできないため、高さそのものは MEASURED に手で記録している。
// ここでできるのは「記録が無効になる変更が入っていないか」の検出。

for (const [orient, h] of Object.entries(MEASURED.exercisePage)) {
  notes.push(`${orient} 運動ページ = ${h}px（実測・種目数によらず一定）`);
  warn(
    h <= PROVEN_SAFE[orient],
    `${orient}: 運動ページの実測 ${h}px が、実機で確認できている上限 ${PROVEN_SAFE[orient]}px を超えています。` +
      ` 現状で破綻の報告はないので上限側の値が古い可能性が高いですが、実機印刷での確認が必要です`
  );
}

// 表紙は種目数に比例。どこで上限を超えるかを出す
for (const [orient, c] of Object.entries(MEASURED.cover)) {
  const limit = PROVEN_SAFE[orient];
  const maxN = Math.floor((limit - c.base) / c.perExercise);
  notes.push(
    `${orient} 表紙 ≒ ${c.base} + ${c.perExercise}×種目数` +
      `（10種目=${c.base + c.perExercise * 10}px / 20種目=${c.base + c.perExercise * 20}px）`
  );
  warn(
    maxN >= 20,
    `${orient}: 表紙は **${maxN + 1}種目以上**で上限 ${limit}px を超える見込みです` +
      `（${maxN + 1}種目 ≒ ${c.base + c.perExercise * (maxN + 1)}px）。` +
      ` 超えると表紙が2ページに割れます。実運用は10種目程度なので直ちに問題にはなりませんが、` +
      ` 上限の実測と、表紙のプログラム一覧の行を詰める検討が要ります`
  );
}

// 構成ブロックが変わっていないか（変わったら MEASURED は無効）
const exerciseSection = src.slice(src.indexOf("<header class=\"page-header\""), src.indexOf("function renderCoverPage"));
for (const cls of EXPECTED_BLOCKS.exercisePage) {
  check(
    exerciseSection.includes(`class="${cls}`),
    `運動ページから ${cls} が見つかりません。構成が変わったなら MEASURED.exercisePage を実測し直してください`
  );
}
const coverSection = src.slice(src.indexOf("function renderCoverPage"));
for (const cls of EXPECTED_BLOCKS.cover) {
  check(
    coverSection.includes(`class="${cls}`),
    `表紙から ${cls} が見つかりません。構成が変わったなら MEASURED.cover を実測し直してください`
  );
}
// 想定外のブロックが増えていないか（表紙直下の div のみ見る）
const coverChildren = [...coverSection.matchAll(/<div class="(cover-[a-z-]+)"/g)].map((x) => x[1]);
const unknown = [...new Set(coverChildren)].filter(
  (c) => !EXPECTED_BLOCKS.cover.includes(c) && !c.startsWith("cover-purpose") &&
    !["cover-main-title", "cover-subtitle", "cover-summary-title", "cover-notice-title"].includes(c)
);
warn(
  unknown.length === 0,
  `表紙に未知のブロックがあります: ${unknown.join(", ")}。高さが変わっている可能性があるので実測し直してください`
);

// ── 6. 画面用スタイルがPDF生成に混入していないか ────
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

if (warnings.length > 0) {
  console.log(`\n⚠ ${warnings.length} 件の要確認（実機印刷での確認待ち。ビルドは止めない）:\n`);
  for (const w of warnings) console.log(`  - ${w}\n`);
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length} 件の問題:\n`);
  for (const f of failures) console.error(`  - ${f}\n`);
  process.exit(1);
}
console.log("✓ すべて通過");
