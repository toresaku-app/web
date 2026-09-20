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
 * @page margin: 10mm を差し引いた実際の印刷可能領域（96dpi換算・理論値）。
 * A4 = 210mm×297mm。1mm = 96/25.4px として四辺から10mmずつ引くと
 *   縦（portrait）= 190mm×277mm → 幅718.11px・高さ1046.93px
 *   横（landscape）= 277mm×190mm → 幅1046.93px・高さ718.11px
 * 表紙・運動ページの高さで使うのは各向きの「高さ」なので、
 * portraitと比較するのは1046.93px、landscapeと比較するのは718.11px。
 * PROVEN_SAFE より緩いが、こちらは「これを超えたら物理的に確実に2ページに割れる」
 * というハード上限。表紙の目的欄（cover-purpose）の1行固定が効いているかの
 * 回帰チェックに使う（詳細は DESIGN.md §7）。
 */
const PRINTABLE_AREA = { portrait: 1046.93, landscape: 718.11 };

/**
 * 2026-09-20、目的欄（表紙・運動ページとも）を1行/2行に固定するCSS修正
 * （white-space: nowrap + ellipsis / -webkit-line-clamp）を入れた際に、
 * headless Chrome の CDP（Emulation.setDeviceMetricsOverride で印刷可能領域幅
 * ＝ページ幅-左右10mmぶんに設定、高さ3000pxの十分広いビューポート）で
 * 3/10/15/20種目・目的欄あり/なしの全パターンを実測し直した値
 * （scratchpad の coverfix/remeasure.mjs、結果は remeasure_html/results.json）。
 * このスクリプトはレンダリングできないので、値は手で記録している。
 * **要素を足し引きしたら再測定してここを更新すること。**
 *
 * cover は種目数に比例して伸びる: base + perExercise * N + (目的欄ありなら purposeExtra)
 *   縦 実測（目的欄なし）: 3種目=477px / 10種目=648.5px / 15種目=788.5px / 20種目=928.5px
 *   横 実測（目的欄なし）: 3種目=360.1px / 10種目=483.9px / 15種目=572.4px / 20種目=660.8px
 *
 * 横(landscape)は3〜20種目まで完全な直線（base=307, perExercise=17.7で4点とも
 * 誤差0.2px未満）。
 * 縦(portrait)は3→10種目の区間だけ傾きが緩く(+24.5px/種目)、10→20種目は
 * ちょうど+28px/種目の直線（10種目648.5→15種目788.5→20種目928.5、誤差0px）。
 * 表紙が上限に近づくのは種目数が多いとき（10〜20種目）なので、その区間に
 * ぴったり一致する base=368.5, perExercise=28 を採用した
 * （368.5+28×10=648.5 / 368.5+28×15=788.5 / 368.5+28×20=928.5、いずれも実測と一致）。
 * 3種目付近ではこの式は実測より低く出る（368.5+28×3=452.5 vs 実測477、-24.5px）が、
 * 3種目は上限にまったく近くないため、この式の誤差が警告の見逃しにつながることはない。
 *
 * purposeExtra は SHEET_PURPOSE_MAX_LENGTH（src/constants/textLimits.ts）文字まで
 * 埋めても1行に収まる（nowrapなので文字数によらず高さは一定）ことを確認済み。
 * 3/10/15/20種目のどの種目数でも縦+52px・横+46pxで完全に一定（誤差なし）。
 *   縦 実測: 目的欄ありで +52px（例: 20種目 928.5px → 980.5px）
 *   横 実測: 目的欄ありで +46px（例: 20種目 660.8px → 706.8px）
 */
const MEASURED = {
  exercisePage: { portrait: 736, landscape: 619 },
  cover: {
    portrait: { base: 368.5, perExercise: 28, purposeExtra: 52 },
    landscape: { base: 307, perExercise: 17.7, purposeExtra: 46 },
  },
};

/** 各ページを構成するブロック。増減したら実測し直す必要がある */
const EXPECTED_BLOCKS = {
  exercisePage: ["page-header", "title-block", "illust", "rx-strip", "points", "page-footer"],
  // cover-purpose は sheetPurpose 指定時のみレンダリングされるが、テンプレート文字列としては
  // 常にソースに存在するので他のブロック同様に必須チェックできる
  cover: ["cover-title-block", "cover-purpose", "cover-date", "cover-summary", "cover-notice"],
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

// 表紙は種目数に比例。目的欄の有無でも変わる（purposeExtra）。どこで上限を超えるかを出す
for (const [orient, c] of Object.entries(MEASURED.cover)) {
  const limit = PROVEN_SAFE[orient];
  const heightAt = (n, withPurpose) => c.base + c.perExercise * n + (withPurpose ? c.purposeExtra : 0);
  const maxN = Math.floor((limit - c.base) / c.perExercise);
  const maxNWithPurpose = Math.floor((limit - c.base - c.purposeExtra) / c.perExercise);
  notes.push(
    `${orient} 表紙 ≒ ${c.base} + ${c.perExercise}×種目数 + 目的欄${c.purposeExtra}` +
      `（20種目・目的欄なし=${Math.round(heightAt(20, false))}px / ` +
      `目的欄あり=${Math.round(heightAt(20, true))}px）`
  );
  warn(
    maxN >= 20,
    `${orient}: 表紙は目的欄なしでも **${maxN + 1}種目以上**で上限 ${limit}px を超える見込みです` +
      `（${maxN + 1}種目 ≒ ${Math.round(heightAt(maxN + 1, false))}px）。` +
      ` 超えると表紙が2ページに割れます。実運用は10種目程度なので直ちに問題にはなりませんが、` +
      ` 上限の実測と、表紙のプログラム一覧の行を詰める検討が要ります`
  );
  warn(
    maxNWithPurpose >= 20,
    `${orient}: 表紙は目的欄ありだと **${maxNWithPurpose + 1}種目以上**で上限 ${limit}px を超える見込みです` +
      `（${maxNWithPurpose + 1}種目 ≒ ${Math.round(heightAt(maxNWithPurpose + 1, true))}px）。` +
      ` cover-purpose は1行固定（nowrap+ellipsis）にしてあるので高さ自体は種目数以外で伸びないが、` +
      ` 種目数が増えるとこの上限に近づく`
  );
  // ハード上限: 印刷可能領域(PRINTABLE_AREA)そのものを超えたら実際に2ページに割れる。
  // 目的欄（SHEET_PURPOSE_MAX_LENGTH 文字まで）を付けた状態で20種目が収まることは
  // このタスクで実機相当の headless Chrome + --print-to-pdf で確認済み。
  // この check はその前提（cover-purpose が1行固定である・要素が急に大きくなっていない）
  // が崩れていないかを見張るもの。
  check(
    heightAt(20, true) <= PRINTABLE_AREA[orient],
    `${orient}: 目的欄ありの20種目表紙が推定 ${Math.round(heightAt(20, true))}px となり、` +
      ` 印刷可能領域 ${PRINTABLE_AREA[orient]}px を超えます。` +
      ` cover-purpose の1行固定CSSが外れたか、他の表紙要素が大きくなっています`
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
  (c) => !EXPECTED_BLOCKS.cover.includes(c) &&
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

// ── 7. 目的欄の行数固定CSSが外れていないか（2026-09-20 追加） ────
//
// MEASURED.cover / PRINTABLE_AREA のチェックは「手で記録した高さの数値」を比較しているだけで、
// 実際に generateHtml.ts の CSS に nowrap / line-clamp が入っているかまでは見ていない。
// 将来誰かがこのCSSを（意図せず）削ると、上のチェックは高さの数値を再計算しないので気づけない。
// ここでは静的ソースを正規表現で見て、今回のバグ修正の根幹であるCSSプロパティの
// 存在そのものを直接アサートする。
const cssRuleBody = (selector) => {
  // 疑似要素・子孫セレクタなどネストした `{` は使っていない前提（このファイルのCSSは単純）
  const re = new RegExp(`(?<![.\\w-])${selector.replace(/[.]/g, "\\.")}\\s*\\{([^}]*)\\}`);
  const m = src.match(re);
  return m ? m[1] : null;
};

const coverPurposeBody = cssRuleBody(".cover-purpose");
check(coverPurposeBody !== null, ".cover-purpose のスタイルが見つかりません");
if (coverPurposeBody !== null) {
  check(
    /white-space\s*:\s*nowrap/.test(coverPurposeBody),
    ".cover-purpose に white-space: nowrap がありません。" +
      " 目的欄が2行に折り返すと横向き20種目で表紙が2ページに割れます（今回修正したバグの再発）"
  );
}

const sheetPurposeBody = cssRuleBody(".sheet-purpose");
check(sheetPurposeBody !== null, ".sheet-purpose のスタイルが見つかりません");
if (sheetPurposeBody !== null) {
  check(
    /white-space\s*:\s*nowrap/.test(sheetPurposeBody),
    ".sheet-purpose に white-space: nowrap がありません。" +
      " 運動ページのヘッダーに毎回表示される目的欄が折り返むと、そのページの高さが伸びます"
  );
}

const exPurposeBody = cssRuleBody(".ex-purpose");
check(exPurposeBody !== null, ".ex-purpose のスタイルが見つかりません");
if (exPurposeBody !== null) {
  check(
    /-webkit-line-clamp/.test(exPurposeBody),
    ".ex-purpose に -webkit-line-clamp がありません。" +
      " 運動ごとの目的欄の行数に上限がなく、際限なく高さが伸びる可能性があります"
  );
}

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
