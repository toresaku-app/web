import { Platform } from "react-native";
import { BodyPart, Category } from "../types/exercise";

/**
 * GA4 イベント送信。
 *
 * 設計方針は docs/analytics-design.md を参照。要点:
 *
 * 1. **Web版のみ**。iOS ネイティブでは何もしない（no-op）。
 *    App Store の「Data Not Collected」宣言とオフライン訴求を維持するため。
 *
 * 2. **利用者の自由入力は絶対に送らない**。
 *    指導書の目的 / 運動ごとの目的 / 患者への注意メモ / 検索語 / 頻度のカスタム入力。
 *    これを構造的に防ぐため、送信できる値を下の AnalyticsEvent 型で列挙し、
 *    任意の文字列を受け取る口を作っていない。**この型を緩めないこと。**
 *    （新しいイベントを足すときも、値はアプリが定義済みの列挙・数値・真偽値に限る）
 *
 * 3. 計測の失敗でアプリが壊れないこと。GA4 未ロード時は黙って無視する。
 */

type Orientation = "portrait" | "landscape";

export type AnalyticsEvent =
  /** 運動を選択した（解除は送らない） */
  | {
      name: "exercise_select";
      exercise_id: string;
      body_part: BodyPart;
      category: Category;
    }
  /** 詳細モーダルを開いた（検討されたが選ばれなかった運動を知る手がかり） */
  | { name: "exercise_detail_open"; exercise_id: string }
  /** 「指導書を作成」で調整画面へ進んだ */
  | { name: "sheet_edit_open"; exercise_count: number }
  /** PDF出力を実行した。has_purpose は入力の有無のみで内容は含まない */
  | {
      name: "pdf_export";
      exercise_count: number;
      orientation: Orientation;
      check_sheet: boolean;
      has_purpose: boolean;
    }
  /** 実施チェック表のトグル操作 */
  | { name: "check_sheet_toggle"; enabled: boolean }
  /** 絞り込みの適用。filter_value はアプリ定義の選択肢のみ */
  | {
      name: "filter_apply";
      filter_type: "body_part" | "posture" | "category";
      filter_value: string;
    }
  /** 検索の利用。検索語そのものは送らない（患者名等が入りうるため） */
  | { name: "search_use"; result_count: number; has_result: boolean };

type Gtag = (
  command: "event",
  eventName: string,
  params?: Record<string, string | number | boolean>
) => void;

const getGtag = (): Gtag | null => {
  if (Platform.OS !== "web") return null;
  const g = (globalThis as { gtag?: Gtag }).gtag;
  return typeof g === "function" ? g : null;
};

export function track(event: AnalyticsEvent): void {
  const gtag = getGtag();
  if (!gtag) return;

  const { name, ...params } = event;
  try {
    gtag("event", name, params as Record<string, string | number | boolean>);
  } catch {
    // 計測の失敗はアプリの動作に影響させない
  }
}
