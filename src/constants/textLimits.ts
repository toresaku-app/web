/**
 * 自由入力テキストの文字数上限。
 *
 * 表紙・運動ページの高さはこれらの文字数を前提に較正されている（1行に収まる想定）。
 * ここを変更したら `src/utils/generateHtml.ts` の `.cover-purpose` / `.ex-purpose` の
 * 行数固定CSSと、`scripts/check-print-layout.mjs` の高さモデルも実測のうえ更新すること。
 * 詳細な実測根拠は DESIGN.md §7 を参照。
 */

/** 指導書の目的（表紙）。全角換算で1行に収まる文字数（横向き20種目の余白が最も少ないため、それを基準に決定） */
export const SHEET_PURPOSE_MAX_LENGTH = 30;

/** 運動ごとの目的（運動ページ）。表紙より余白に余裕があるぶん長めに許容 */
export const EXERCISE_PURPOSE_MAX_LENGTH = 40;
