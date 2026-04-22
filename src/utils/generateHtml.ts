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
  landscape?: boolean
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

  const illustBlock = `
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
`;

export function generateHtml(
  selectedExercises: SelectedExercise[],
  imageUris: Record<string, string>,
  sheetPurpose?: string,
  orientation?: "portrait" | "landscape"
) {
  const sorted = [...selectedExercises].sort((a, b) => a.order - b.order);
  const total = sorted.length;
  const purpose = sheetPurpose?.trim() || undefined;
  const isLandscape = orientation === "landscape";

  const pages = sorted
    .map((sel, i) => {
      const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
      if (!ex) return "";
      return renderPage(sel, ex, i + 1, total, i === sorted.length - 1, imageUris[sel.exerciseId], purpose, isLandscape);
    })
    .join("\n");

  const pageStyle = isLandscape
    ? "@page { size: A4 landscape; margin: 10mm; }"
    : "@page { size: A4; margin: 10mm; }";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8"/>
<title>自主トレーニング指導書</title>
<style>${PDF_STYLE.replace("@page { size: A4; margin: 10mm; }", pageStyle)}</style>
</head>
<body>
${pages}
</body>
</html>`;
}

