import { EXERCISES } from "../constants/exercises";
import { SelectedExercise } from "../types/exercise";

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

const issueDate = (): string => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

function rxCell(label: string, value: string, unit: string): string {
  return `
  <div class="rx-cell">
    <div class="rx-label">${label}</div>
    <div class="rx-body">
      <span class="rx-value">${value}</span>
      <span class="rx-unit">${unit}</span>
    </div>
  </div>`;
}

function rxCellText(label: string, text: string): string {
  return `
  <div class="rx-cell rx-cell-wide">
    <div class="rx-label">${label}</div>
    <div class="rx-body"><div class="rx-text">${esc(text)}</div></div>
  </div>`;
}

function renderPage(
  sel: SelectedExercise,
  ex: (typeof EXERCISES)[number],
  index: number,
  total: number,
  isLast: boolean,
  imageUri?: string,
  sheetPurpose?: string,
  landscape?: boolean,
  startImageUri?: string
): string {
  const rxCells: string[] = [
    rxCell("回数", String(sel.reps), "回"),
    rxCell("セット", String(sel.sets), "セット"),
  ];
  if (sel.holdSeconds !== undefined) {
    rxCells.push(rxCell("保持", String(sel.holdSeconds), "秒"));
  }
  if (sel.restSeconds > 0) {
    rxCells.push(rxCell("休息", String(sel.restSeconds), "秒"));
  }
  rxCells.push(rxCellText("頻度", sel.frequency));

  const pointsHtml = ex.keyPoints
    .map(
      (p, i) => `
      <div class="pt-row${i === ex.keyPoints.length - 1 ? " pt-last" : ""}">
        <div class="pt-num">${i + 1}</div>
        <div class="pt-body">${esc(p)}</div>
      </div>`
    )
    .join("");

  const noteHtml =
    sel.notes && sel.notes.trim()
      ? `
    <div class="note">
      <div class="note-icon">！</div>
      <div class="note-content">
        <div class="note-label">注　意</div>
        <div class="note-body">${esc(sel.notes)}</div>
      </div>
    </div>`
      : "";

  const header = `
    <header class="page-header">
      <div>
        <div class="title">自主トレーニング指導書</div>
        <div class="issue">発行日　${issueDate()}</div>
      </div>
      <div class="page-badge">第 ${index} 枚 / 全 ${total} 枚</div>
    </header>
    ${sheetPurpose ? `<div class="sheet-purpose">目的：${esc(sheetPurpose)}</div>` : ""}`;

  const titleBlock = `
    <div class="title-block">
      <div class="tags">
        <span class="tag tag-navy">${esc(ex.posture)}</span>
        <span class="tag tag-teal">ターゲット：${esc(ex.target)}</span>
      </div>
      <h1 class="ex-name">${esc(ex.name)}</h1>
      ${sel.purpose ? `<div class="ex-purpose">${esc(sel.purpose)}</div>` : ""}
    </div>`;

  // 開始姿勢がある運動は2枚（開始 → 動作中）、無ければ従来どおり1枚
  const illustBlock = startImageUri && imageUri
    ? `
    <div class="illust illust-pair">
      <div class="illust-item">
        <div class="illust-frame"><img src="${esc(startImageUri)}" alt=""/></div>
        <div class="illust-cap">① 開始</div>
      </div>
      <div class="illust-arrow">▶</div>
      <div class="illust-item">
        <div class="illust-frame"><img src="${esc(imageUri)}" alt=""/></div>
        <div class="illust-cap">② 動作</div>
      </div>
    </div>`
    : `
    <div class="illust">
      ${imageUri ? `<img src="${esc(imageUri)}" alt=""/>` : `<div class="illust-placeholder">${esc(ex.name)}</div>`}
    </div>`;

  const footer = `
    <footer class="page-footer">
      <span>痛みや違和感がある場合は無理をせず中止し、担当の先生にご相談ください</span>
      <span class="page-num">${index} / ${total} ページ</span>
    </footer>`;

  if (landscape) {
    return `
    <section class="page landscape${isLast ? "" : " break"}">
      ${header}
      ${titleBlock}
      ${illustBlock}
      <div class="rx-strip">${rxCells.join("")}</div>
      <div class="points">
        <div class="points-heading">
          <div class="points-bar"></div>
          <div class="points-title">やり方のポイント</div>
        </div>
        <div class="points-list">${pointsHtml}</div>
      </div>
      ${noteHtml}
      ${footer}
    </section>`;
  }

  return `
  <section class="page${isLast ? "" : " break"}">
    ${header}
    ${titleBlock}
    ${illustBlock}
    <div class="rx-strip">${rxCells.join("")}</div>
    <div class="points">
      <div class="points-heading">
        <div class="points-bar"></div>
        <div class="points-title">やり方のポイント</div>
      </div>
      <div class="points-list">${pointsHtml}</div>
    </div>
    ${noteHtml}
    ${footer}
  </section>`;
}

export const PDF_STYLE = `
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif;
    color: #0F172A;
  }

  .page {
    page-break-inside: avoid;
  }
  .break { page-break-after: always; }

  /* ── ヘッダー ── */
  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding-bottom: 8px; border-bottom: 3px solid #0B2545;
  }
  .title { font-size: 20pt; font-weight: 700; color: #0B2545; line-height: 1.2; }
  .issue { font-size: 12pt; color: #475569; margin-top: 2px; }
  .page-badge {
    padding: 4px 10px; border-radius: 6px;
    background: #0B2545; color: #fff;
    font-size: 12pt; font-weight: 700; white-space: nowrap;
  }

  /* ── 指導書の目的 ── */
  .sheet-purpose {
    font-size: 13pt; font-weight: 500; color: #0B2545;
    padding: 4px 8px; margin-top: 6px;
    background: #EEF2F9; border-radius: 5px;
  }

  /* ── タイトルブロック ── */
  .title-block { padding: 8px 0 6px; }
  .tags { display: flex; gap: 6px; margin-bottom: 4px; }
  .tag {
    padding: 2px 8px; border-radius: 5px;
    font-size: 12pt; font-weight: 700;
  }
  .tag-navy { background: #EEF2F9; color: #0B2545; }
  .tag-teal { background: #E6F4F2; color: #0F766E; }
  .ex-name { font-size: 24pt; font-weight: 700; color: #0F172A; line-height: 1.2; }
  .ex-purpose { font-size: 13pt; color: #475569; margin-top: 2px; }

  /* ── イラスト ── */
  .illust {
    height: 220px;
    border-radius: 10px;
    background: #F7F9FC; border: 1px solid #E6EAF0;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; padding: 8px;
    margin-top: 6px;
  }
  .illust img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .illust-placeholder { font-size: 11pt; color: #94A3B8; }

  /* ── イラスト2枚（開始姿勢 → 動作中） ── */
  /* 枠の高さ(.illust)は1枚時と同じに保つ。変えると印刷のページ数較正が崩れる */
  .illust-pair { gap: 6px; padding: 6px 8px; }
  .illust-item {
    flex: 1; min-width: 0; height: 100%;
    display: flex; flex-direction: column; align-items: center;
  }
  .illust-frame {
    flex: 1; min-height: 0; width: 100%;
    display: flex; align-items: center; justify-content: center;
  }
  .illust-cap {
    font-size: 10pt; font-weight: 700; color: #0B2545;
    background: #EEF2F9; border-radius: 4px;
    padding: 1px 8px; margin-top: 2px; white-space: nowrap;
  }
  .illust-arrow {
    flex-shrink: 0; color: #B91C1C;
    font-size: 22pt; font-weight: 700; line-height: 1;
  }

  /* ── 処方ストリップ ── */
  .rx-strip { display: flex; gap: 6px; margin-top: 10px; }
  .rx-cell {
    flex: 1; border: 2px solid #0B2545; border-radius: 8px;
    background: #fff; overflow: hidden;
  }
  .rx-cell-wide { flex: 1.5; }
  .rx-label {
    background: #0B2545; color: #fff;
    font-size: 11pt; font-weight: 700; letter-spacing: 1.5px;
    padding: 2px 6px; text-align: center;
  }
  .rx-body {
    padding: 4px;
    display: flex; align-items: center; justify-content: center;
  }
  .rx-value {
    font-size: 28pt; font-weight: 700; color: #0B2545;
    line-height: 1; font-variant-numeric: tabular-nums;
  }
  .rx-unit { font-size: 14pt; font-weight: 700; color: #0F172A; margin-left: 2px; }
  .rx-text { font-size: 17pt; font-weight: 700; color: #0F172A; text-align: center; }

  /* ── やり方のポイント ── */
  .points { margin-top: 10px; }
  .points-heading { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .points-bar { width: 4px; height: 16px; background: #0B2545; border-radius: 2px; }
  .points-title { font-size: 15pt; font-weight: 700; color: #0F172A; }
  .points-list { }
  .pt-row {
    display: flex; gap: 8px; align-items: center;
    padding: 5px 0; border-bottom: 1px solid #E6EAF0;
  }
  .pt-last { border-bottom: none; }
  .pt-num {
    width: 20px; height: 20px; border-radius: 5px;
    background: #0B2545; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 12pt; font-weight: 700; flex-shrink: 0;
  }
  .pt-body { font-size: 14pt; color: #0F172A; line-height: 1.5; flex: 1; }

  /* ── 注意ボックス ── */
  .note {
    margin-top: 8px; padding: 8px 12px;
    background: #FBEAEA; border: 1px solid #F5D2D2;
    border-left: 5px solid #B91C1C; border-radius: 6px;
    display: flex; gap: 8px; align-items: center;
  }
  .note-icon {
    width: 24px; height: 24px; border-radius: 12px;
    background: #B91C1C; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 14pt; font-weight: 700; flex-shrink: 0;
  }
  .note-content { flex: 1; }
  .note-label { font-size: 11pt; font-weight: 700; color: #B91C1C; letter-spacing: 1.5px; margin-bottom: 1px; }
  .note-body { font-size: 13pt; color: #7F1D1D; line-height: 1.4; font-weight: 500; }

  /* ── フッター ── */
  .page-footer {
    margin-top: 8px;
    padding-top: 6px; border-top: 1px solid #E6EAF0;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 10pt; color: #94A3B8;
  }
  .page-num { color: #475569; font-weight: 500; }

  /* ── 表紙 ── */
  .cover { padding: 8px 0; }
  .cover-title-block {
    text-align: center; padding: 14px 0 10px;
    border-bottom: 3px solid #0B2545;
  }
  .cover-main-title {
    font-size: 24pt; font-weight: 700; color: #0B2545; line-height: 1.25;
  }
  .cover-subtitle {
    font-size: 13pt; color: #94A3B8; margin-top: 4px; letter-spacing: 2px;
  }
  .cover-purpose {
    margin-top: 10px; padding: 7px 14px;
    background: #EEF2F9; border-radius: 8px;
    font-size: 14pt; color: #0B2545; font-weight: 500;
  }
  .cover-purpose-label {
    display: inline-block; background: #0B2545; color: #fff;
    padding: 2px 8px; border-radius: 4px; font-size: 11pt;
    font-weight: 700; margin-right: 8px; letter-spacing: 1px;
  }
  .cover-date {
    margin-top: 8px; font-size: 12pt; color: #475569; text-align: right;
  }
  .cover-summary { margin-top: 10px; }
  .cover-summary-title {
    font-size: 15pt; font-weight: 700; color: #0B2545;
    padding-left: 10px; border-left: 4px solid #0B2545; margin-bottom: 6px;
  }
  .cover-table {
    width: 100%; border-collapse: collapse; font-size: 11pt;
  }
  .cover-th {
    background: #0B2545; color: #fff; font-weight: 700;
    padding: 5px 8px; text-align: left; font-size: 10pt;
    letter-spacing: 0.5px;
  }
  .cover-table td {
    padding: 3px 8px; border-bottom: 1px solid #E6EAF0;
    font-size: 10.5pt; color: #0F172A; line-height: 1.25;
  }
  .cover-num { text-align: center; font-weight: 700; color: #0B2545; width: 30px; }
  .cover-name { font-weight: 600; }
  .cover-target { color: #0F766E; font-size: 10pt; }
  .cover-rx { font-size: 10pt; white-space: nowrap; }
  .cover-freq { font-size: 10pt; color: #475569; white-space: nowrap; }
  .cover-notice {
    margin-top: 12px; padding: 9px 16px;
    background: #FBEAEA; border: 1px solid #F5D2D2;
    border-left: 5px solid #B91C1C; border-radius: 8px;
  }
  .cover-notice-title {
    font-size: 12pt; font-weight: 700; color: #B91C1C;
    letter-spacing: 1.5px; margin-bottom: 6px;
  }
  .cover-notice-list {
    margin: 0; padding-left: 18px;
    font-size: 11pt; color: #7F1D1D; line-height: 1.5;
  }

  /* ── 実施チェック表 ── */
  .howto {
    margin-top: 6px; padding: 5px 10px;
    background: #EEF2F9; border-radius: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .howto-label {
    background: #0B2545; color: #fff;
    padding: 2px 8px; border-radius: 4px;
    font-size: 11pt; font-weight: 700; letter-spacing: 1px; white-space: nowrap;
  }
  .howto-body { font-size: 12pt; color: #0B2545; font-weight: 500; line-height: 1.4; }
  .howto-body b { font-size: 14pt; }

  .week { margin-top: 5px; }
  .week-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 1px; }
  .week-num {
    font-size: 11pt; font-weight: 700; color: #0B2545;
    padding-left: 8px; border-left: 4px solid #0B2545;
  }
  .week-date { font-size: 11pt; color: #94A3B8; }
  .check-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .check-table th, .check-table td { border: 1px solid #D5DCE6; }
  .check-table th {
    background: #0B2545; color: #fff;
    font-size: 10pt; font-weight: 700; padding: 1px 2px; text-align: center;
  }
  .check-ex-col { width: 36%; text-align: left; padding-left: 8px; }
  .check-sat { color: #93C5FD; }
  .check-sun { color: #FCA5A5; }
  .check-table td { height: 18px; background: #fff; }
  .check-ex-cell {
    padding: 1px 6px; background: #FAFBFD;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.15;
  }
  .check-ex-name { font-size: 9.5pt; font-weight: 700; color: #0F172A; }
  .check-ex-rx { font-size: 7.5pt; color: #475569; margin-left: 5px; }

  .memo { margin-top: 8px; }
  .memo-head { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
  .memo-title { font-size: 13pt; font-weight: 700; color: #0F172A; }
  .memo-sub { font-size: 10pt; color: #94A3B8; }
  .memo-lines { border: 1px solid #E6EAF0; border-radius: 8px; padding: 0 12px; }
  .memo-line { height: 18px; border-bottom: 1px dashed #D5DCE6; }
  .memo-line:last-child { border-bottom: none; }
  .bring { font-size: 10pt; font-weight: 700; color: #B91C1C; }
  /* チェック表のヘッダーは運動ページより小さくして縦を稼ぐ */
  .check-page .page-header { padding-bottom: 5px; }
  .check-page .title { font-size: 16pt; }
  .check-page .issue { font-size: 10pt; }

  /* ── 横向き時のコンパクト化 ── */
  .landscape .page-header { padding-bottom: 4px; }
  .landscape .sheet-purpose { margin-top: 3px; padding: 2px 8px; }
  .landscape .title-block { padding: 4px 0 3px; }
  .landscape .illust { height: 150px; margin-top: 4px; padding: 4px; }
  .landscape .rx-strip { margin-top: 6px; gap: 4px; }
  .landscape .rx-label { padding: 1px 6px; }
  .landscape .rx-body { padding: 2px; }
  .landscape .points { margin-top: 6px; }
  .landscape .points-heading { margin-bottom: 2px; }
  .landscape .pt-row { padding: 3px 0; }
  .landscape .note { margin-top: 5px; padding: 5px 10px; }
  .landscape .page-footer { margin-top: 5px; padding-top: 3px; }
  .landscape .howto { margin-top: 5px; padding: 4px 10px; }
  .landscape .week { margin-top: 5px; }
  .landscape .check-table td { height: 17px; }
  .landscape .check-ex-col { width: 54%; }
  .landscape .memo { margin-top: 6px; }
  .landscape .memo-line { height: 18px; }
  /* 表紙も横向きでは縦を詰める（A4横の高さは718pxしかない） */
  .landscape .cover { padding: 2px 0; }
  .landscape .cover-title-block { padding: 8px 0 6px; }
  .landscape .cover-main-title { font-size: 22pt; }
  .landscape .cover-subtitle { font-size: 11pt; margin-top: 2px; }
  .landscape .cover-purpose { margin-top: 8px; padding: 6px 12px; font-size: 12pt; }
  .landscape .cover-date { margin-top: 6px; font-size: 11pt; }
  .landscape .cover-summary { margin-top: 8px; }
  .landscape .cover-summary-title { font-size: 13pt; margin-bottom: 5px; }
  .landscape .cover-table td { padding: 3px 8px; }
  .landscape .cover-th { padding: 3px 8px; }
  .landscape .cover-notice { margin-top: 10px; padding: 8px 12px; }
  .landscape .cover-notice-title { margin-bottom: 4px; }
  .landscape .cover-notice-list { line-height: 1.5; }
  /* 横向きは横幅が余るので週ブロックを2列に並べて縦を節約する */
  .landscape .weeks { display: flex; flex-wrap: wrap; gap: 10px; }
  .landscape .weeks .week { width: calc(50% - 5px); }
`;

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"] as const;

/** 1週分のチェック表（行=運動 × 列=曜日） */
function renderWeekBlock(
  weekNumber: number,
  rows: { name: string; rx: string }[],
  numberOffset = 0
): string {
  const head = WEEKDAYS.map((d) => {
    const cls = d === "土" ? " check-sat" : d === "日" ? " check-sun" : "";
    return `<th class="${cls.trim()}">${d}</th>`;
  }).join("");

  const body = rows
    .map(
      (r, i) => `
      <tr>
        <td class="check-ex-cell">
          <span class="check-ex-name">${numberOffset + i + 1}. ${esc(r.name)}</span><span class="check-ex-rx">${esc(r.rx)}</span>
        </td>
        ${WEEKDAYS.map(() => "<td></td>").join("")}
      </tr>`
    )
    .join("");

  return `
    <div class="week">
      <div class="week-head">
        <span class="week-num">第 ${weekNumber} 週</span>
        <span class="week-date">（　　月　　日 〜）</span>
      </div>
      <table class="check-table">
        <tr><th class="check-ex-col">運動</th>${head}</tr>
        ${body}
      </table>
    </div>`;
}

/**
 * 実施チェック表（患者が実施日に○を付ける紙の表）。
 * 4週間分。運動が5種目以上のときは2週ずつ2枚に分割してA4に収める。
 */
function renderCheckSheets(
  sorted: SelectedExercise[],
  isLandscape: boolean
): string {
  const rows = sorted
    .map((sel) => {
      const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
      if (!ex) return null;
      return {
        name: ex.name,
        rx: `${sel.reps}回 × ${sel.sets}セット`,
      };
    })
    .filter((r): r is { name: string; rx: string } => r !== null);

  if (rows.length === 0) return "";

  // A4 に収まる週数を実測値から求める（超えると印刷時に半端なページが生まれるため）
  // 係数は実際のレンダリング高さを計測して較正した値
  // 係数は実測（ヘッダー/使い方帯/週ブロック/メモ/フッターの各高さ）から較正。
  // budget は A4 の理論値（縦1047 / 横718）ではなく、実機の iOS Safari で
  // 印刷したときに収まった実効値から逆算した保守的な値。
  // 実測: 縦791px の内容がフッターだけ次ページに落ちた → 実効高は 750px 前後。
  // 同様に横は 529px で溢れた → 実効高 490px 前後。ここから安全側に倒している。
  const m = isLandscape
    ? { fixed: 123, perWeek: 72, rowH: 20, memo: 75, budget: 480, columns: 2 }
    : { fixed: 133, perWeek: 52, rowH: 20, memo: 77, budget: 700, columns: 1 };

  const estimateFor = (weeks: number, rowCount: number): number => {
    const weekRows = Math.ceil(weeks / m.columns);
    return m.fixed + weekRows * (m.perWeek + m.rowH * rowCount) + m.memo;
  };

  // 種目が多いと1週だけでも収まらないため、運動そのものも分割する
  const maxRowsPerSheet = Math.max(
    1,
    Math.floor((m.budget - m.fixed - m.memo - m.perWeek) / m.rowH)
  );
  const rowChunks: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += maxRowsPerSheet) {
    rowChunks.push(rows.slice(i, i + maxRowsPerSheet));
  }

  // 週数は最も行数の多いチャンクに合わせる（全シートで週の区切りを揃える）
  const maxChunkRows = Math.max(...rowChunks.map((c) => c.length));
  const weeksPerSheet =
    [4, 2, 1].find((w) => estimateFor(w, maxChunkRows) <= m.budget) ?? 1;

  const weekGroups: number[][] = [];
  for (let w = 1; w <= 4; w += weeksPerSheet) {
    weekGroups.push(
      Array.from({ length: weeksPerSheet }, (_, i) => w + i).filter((n) => n <= 4)
    );
  }

  // シート = 週グループ × 運動チャンク
  const sheets: { weeks: number[]; rows: typeof rows; offset: number }[] = [];
  for (const weeks of weekGroups) {
    rowChunks.forEach((chunk, ci) => {
      sheets.push({ weeks, rows: chunk, offset: ci * maxRowsPerSheet });
    });
  }

  return sheets
    .map(({ weeks, rows: sheetRows, offset }, sheetIndex) => {
      const isLastSheet = sheetIndex === sheets.length - 1;
      const badge =
        sheets.length > 1
          ? `チェック表 ${sheetIndex + 1} / ${sheets.length}`
          : "チェック表";

      return `
  <section class="page check-page${isLandscape ? " landscape" : ""}${isLastSheet ? "" : " break"}">
    <header class="page-header">
      <div>
        <div class="title">実施チェック表</div>
        <div class="issue">発行日　${issueDate()}</div>
      </div>
      <div class="page-badge">${badge}</div>
    </header>

    <div class="howto">
      <span class="howto-label">使い方</span>
      <span class="howto-body">運動が<b>できた日に ○</b> を書きましょう。全部できなくても大丈夫です。</span>
    </div>

    <div class="weeks">${weeks.map((w) => renderWeekBlock(w, sheetRows, offset)).join("")}</div>

    ${
      isLastSheet
        ? `<div class="memo">
      <div class="memo-head">
        <div class="points-bar"></div>
        <span class="memo-title">メモ</span>
        <span class="memo-sub">気づいたこと・困ったことがあれば書いてください</span>
      </div>
      <div class="memo-lines">
        <div class="memo-line"></div>
        <div class="memo-line"></div>
      </div>
    </div>`
        : ""
    }

    <footer class="page-footer">
      <span>トレさく — 自主トレ指導書作成アプリ</span>
      <span class="bring">次回の外来・リハビリの際に、この用紙をお持ちください</span>
    </footer>
  </section>`;
    })
    .join("\n");
}

function renderCoverPage(
  sorted: SelectedExercise[],
  sheetPurpose?: string,
  isLandscape?: boolean,
): string {
  const rows = sorted
    .map((sel, i) => {
      const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
      if (!ex) return "";
      const holdText = sel.holdSeconds !== undefined ? ` × ${sel.holdSeconds}秒保持` : "";
      const restText = sel.restSeconds > 0 ? `　休息${sel.restSeconds}秒` : "";
      return `
      <tr>
        <td class="cover-num">${i + 1}</td>
        <td class="cover-name">${esc(ex.name)}</td>
        <td class="cover-target">${esc(ex.target)}</td>
        <td class="cover-rx">${sel.reps}回 × ${sel.sets}セット${holdText}${restText}</td>
        <td class="cover-freq">${esc(sel.frequency)}</td>
      </tr>`;
    })
    .join("");

  return `
  <section class="page${isLandscape ? " landscape" : ""} break">
    <div class="cover">
      <div class="cover-title-block">
        <div class="cover-main-title">自主トレーニング指導書</div>
        <div class="cover-subtitle">Home Exercise Program</div>
      </div>
      ${sheetPurpose ? `<div class="cover-purpose"><span class="cover-purpose-label">目的</span>${esc(sheetPurpose)}</div>` : ""}
      <div class="cover-date">発行日：${issueDate()}</div>
      <div class="cover-summary">
        <div class="cover-summary-title">プログラム内容（全${sorted.length}種目）</div>
        <table class="cover-table">
          <thead>
            <tr>
              <th class="cover-th">#</th>
              <th class="cover-th">運動名</th>
              <th class="cover-th">ターゲット</th>
              <th class="cover-th">処方</th>
              <th class="cover-th">頻度</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="cover-notice">
        <div class="cover-notice-title">ご注意</div>
        <ul class="cover-notice-list">
          <li>痛みや違和感がある場合は無理をせず中止し、担当の先生にご相談ください</li>
          <li>体調がすぐれない時は運動を控えてください</li>
          <li>運動の内容や量は担当の先生の指示に従ってください</li>
        </ul>
      </div>
    </div>
    <footer class="page-footer">
      <span>トレさく — 自主トレ指導書作成アプリ</span>
    </footer>
  </section>`;
}

/**
 * 画面表示（Web の /print）専用スタイル。
 * A4 を紙らしく見せ、狭い画面でも横に破綻しないようにする。
 * expo-print の PDF 生成には適用しない（forScreen フラグで制御）。
 */
const screenStyle = (pageWidthPx: number) => `
  @media screen {
    body { background: #E5E9F0; padding: 16px 0; }
    .page {
      width: ${pageWidthPx}px;
      margin: 0 auto 16px;
      padding: 38px 36px;
      background: #fff;
      box-shadow: 0 4px 24px rgba(15,23,42,.15);
    }
  }`;

interface GenerateOptions {
  sheetPurpose?: string;
  orientation?: "portrait" | "landscape";
  /** 画面表示用（Web の /print）。PDF生成時は false のまま使う */
  forScreen?: boolean;
  includeCheckSheet?: boolean;
  /** 開始姿勢の画像。登録がある運動だけ2枚表示になる */
  startImageUris?: Record<string, string>;
}

export function generateHtml(
  selectedExercises: SelectedExercise[],
  imageUris: Record<string, string>,
  options: GenerateOptions = {}
) {
  const {
    sheetPurpose,
    orientation,
    forScreen = false,
    includeCheckSheet = false,
    startImageUris = {},
  } = options;
  const sorted = [...selectedExercises].sort((a, b) => a.order - b.order);
  const total = sorted.length;
  const purpose = sheetPurpose?.trim() || undefined;
  const isLandscape = orientation === "landscape";

  const coverPage = renderCoverPage(sorted, purpose, isLandscape);

  const checkSheets = includeCheckSheet
    ? renderCheckSheets(sorted, isLandscape)
    : "";

  const pages = sorted
    .map((sel, i) => {
      const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
      if (!ex) return "";
      // チェック表が続く場合は最終運動ページの後にも改ページが必要
      const isLast = i === sorted.length - 1 && !checkSheets;
      return renderPage(
        sel, ex, i + 1, total, isLast,
        imageUris[sel.exerciseId], purpose, isLandscape,
        startImageUris[sel.exerciseId]
      );
    })
    .join("\n");

  const pageStyle = isLandscape
    ? "@page { size: A4 landscape; margin: 10mm; }"
    : "@page { size: A4; margin: 10mm; }";

  // A4 の実寸（96dpi）。狭い画面では viewport をこの幅に固定してブラウザ側で縮小させる
  const pageWidthPx = isLandscape ? 1123 : 794;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8"/>
${forScreen ? `<meta name="viewport" content="width=${pageWidthPx}"/>` : ""}
<title>自主トレーニング指導書</title>
<style>${PDF_STYLE.replace("@page { size: A4; margin: 10mm; }", pageStyle)}${forScreen ? screenStyle(pageWidthPx) : ""}</style>
</head>
<body>
${coverPage}
${pages}
${checkSheets}
</body>
</html>`;
}

