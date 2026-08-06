import { create, StateCreator } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { Platform } from "react-native";

/**
 * 発行者情報（施設名・担当者名）。どちらも任意。
 *
 * ## hepStore と保存先が違う理由
 *
 * hepStore は「患者に渡す指導書の中身」なので、Web版はセッションストレージに置き、
 * タブを閉じたら消えるようにしている（個人情報最小化）。
 *
 * こちらは**指導書を作る側＝利用者自身の情報**で、毎回入力させる意味がない。
 * そのためセッションを跨いで保持する（Web=localStorage / ネイティブ=expo-sqlite）。
 * 一貫性のために sessionStorage へ揃えないこと。
 *
 * **患者の情報は入れない。** ここに入るのは施設名と担当者名だけ。
 */
interface IssuerState {
  /** 施設名（任意）。例: 〇〇総合病院 */
  facilityName: string;
  /** 担当者名（任意）。例: 理学療法士 佐藤 */
  staffName: string;
  setFacilityName: (value: string) => void;
  setStaffName: (value: string) => void;
  clearIssuer: () => void;
}

const storeCreator: StateCreator<IssuerState> = (set) => ({
  facilityName: "",
  staffName: "",
  setFacilityName: (facilityName: string) => set({ facilityName }),
  setStaffName: (staffName: string) => set({ staffName }),
  clearIssuer: () => set({ facilityName: "", staffName: "" }),
});

/**
 * ネイティブ側の保存先。expo-sqlite の KV ストアを使う（依存の追加なし）。
 * Web に SQLite の WASM を持ち込まないよう、require は遅延させている。
 */
const createNativeStorage = (): StateStorage => {
  const store: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  } = require("expo-sqlite/kv-store").default;

  return {
    getItem: (name) => store.getItem(name),
    setItem: (name, value) => store.setItem(name, value),
    removeItem: (name) => store.removeItem(name),
  };
};

const isWeb = Platform.OS === "web";
const hasLocalStorage = typeof localStorage !== "undefined";
const canPersist = isWeb ? hasLocalStorage : true;

export const useIssuerStore = canPersist
  ? create<IssuerState>()(
      persist(storeCreator, {
        name: "issuer-store",
        storage: createJSONStorage(() =>
          isWeb ? localStorage : createNativeStorage()
        ),
      })
    )
  : create<IssuerState>()(storeCreator);

/**
 * 入力の上限文字数。
 *
 * 表紙フッターの発行者は**1行に収める必要がある**（折り返すと表紙が伸びて
 * ページ較正が崩れる）。上限いっぱいでも1行に収まる値にしてある。
 * 変えたら実測し直すこと（`.cover-issuer` の max-width も併せて確認）。
 */
export const ISSUER_MAX = { facility: 18, staff: 10 } as const;

/** PDF に刷る1行。両方空なら undefined（＝何も刷らない） */
export const formatIssuerLine = (
  facilityName: string,
  staffName: string
): string | undefined => {
  const facility = facilityName.trim();
  const staff = staffName.trim();
  if (!facility && !staff) return undefined;
  if (!staff) return facility;
  if (!facility) return `担当：${staff}`;
  return `${facility}　担当：${staff}`;
};
