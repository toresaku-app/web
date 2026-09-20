import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  findNodeHandle,
} from "react-native";
import { useRouter } from "expo-router";
import { useHepStore } from "../src/stores/hepStore";
import { useIssuerStore, formatIssuerLine, ISSUER_MAX } from "../src/stores/issuerStore";
import { EXERCISES } from "../src/constants/exercises";
import { ILLUSTRATIONS, START_ILLUSTRATIONS } from "../src/constants/illustrations";
import {
  SHEET_PURPOSE_MAX_LENGTH,
  EXERCISE_PURPOSE_MAX_LENGTH,
} from "../src/constants/textLimits";
import { Asset } from "expo-asset";

// Native-only modules - lazy imported to avoid web bundler errors
type NativeModules = {
  printToFileAsync: typeof import("expo-print").printToFileAsync;
  shareAsync: typeof import("expo-sharing").shareAsync;
  FileSystem: typeof import("expo-file-system/legacy");
};

// 3モジュールを1つのPromiseにまとめてモジュールスコープにキャッシュする。
// 失敗したらキャッシュを破棄し、次回呼び出しで再importできるようにする
// （そうしないと「再試行」を押しても未解決のまま同じエラーを繰り返すため）。
let nativeModulesPromise: Promise<NativeModules> | null = null;

function loadNativeModules(): Promise<NativeModules> {
  if (!nativeModulesPromise) {
    nativeModulesPromise = Promise.all([
      import("expo-print"),
      import("expo-sharing"),
      import("expo-file-system/legacy"),
    ])
      .then(([printModule, sharingModule, fileSystemModule]) => ({
        printToFileAsync: printModule.printToFileAsync,
        shareAsync: sharingModule.shareAsync,
        FileSystem: fileSystemModule,
      }))
      .catch((error) => {
        nativeModulesPromise = null;
        throw error;
      });
  }
  return nativeModulesPromise;
}

// expo-print の型定義では printToFileAsync の引数(FilePrintOptions)に orientation が
// 含まれていないが、iOS ネイティブ実装は printAsync と共通の PrintOptions 構造体を使うため
// 実際には orientation を解釈する。型定義に忠実にしつつ orientation を渡せるよう拡張する。
type PrintToFileOptions = import("expo-print").FilePrintOptions & {
  orientation?: import("expo-print").PrintOptions["orientation"];
};

// A4は72dpiで595×842pt(縦向き)。iOSのexpo-printはHTML側の@page sizeを無視し
// 既定でUSレター(612×792pt)を使うため、width/heightで明示する。
const A4_WIDTH_PT = 595;
const A4_HEIGHT_PT = 842;
// 余白10mm（Web版の@page marginと同じ）。iOSは@page marginも無視し、未指定だと
// 余白0で紙端まで描画されるため、ネイティブのmarginsで明示する（2026-09 シミュレータで実測）。
const PAGE_MARGIN_PT = 28.35;
// 72dpi(iOS印刷) / 96dpi(Web印刷)
const NATIVE_CSS_ZOOM = 0.75;
import { SelectedExercise } from "../src/types/exercise";
import { generateHtml } from "../src/utils/generateHtml";
import { track } from "../src/utils/analytics";

/**
 * 共有シートに表示するファイル名用に、端末のローカル日付を YYYY-MM-DD 形式にする。
 * Date#toISOString はUTC基準になるため使わず、ローカルのgetFullYear/getMonth/getDateから組み立てる。
 */
function formatLocalDateForFilename(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const FREQUENCY_OPTIONS = [
  "1日1回",
  "1日2回",
  "1日2〜3回",
  "毎日",
  "週3回",
  "カスタム",
];


export default function PreviewScreen() {
  const { selectedExercises, updateExercise, removeExercise, reorderExercises, clearAll, sheetPurpose, setSheetPurpose, orientation, setOrientation, includeCheckSheet, setIncludeCheckSheet } =
    useHepStore();
  const { facilityName, staffName, setFacilityName, setStaffName } = useIssuerStore();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showIssuer, setShowIssuer] = useState(false);
  const issuerLine = formatIssuerLine(facilityName, staffName);

  const handleExport = async () => {
    setIsExporting(true);
    track({
      name: "pdf_export",
      exercise_count: selectedExercises.length,
      orientation,
      check_sheet: includeCheckSheet,
      has_purpose: sheetPurpose.trim() !== "",
    });

    if (Platform.OS === "web") {
      setIsExporting(false);
      router.push("/print");
      return;
    }

    // Native: expo-print + expo-sharing + expo-file-system
    // 3モジュールすべてが解決するまで待つ。未解決（初回import前や失敗後）なら
    // ここで打ち切り、失敗時はキャッシュが破棄されているので「再試行」で再importされる。
    let native: NativeModules;
    try {
      native = await loadNativeModules();
    } catch {
      setIsExporting(false);
      Alert.alert(
        "PDF出力エラー",
        "指導書の生成に失敗しました。もう一度お試しください。",
        [
          { text: "キャンセル", style: "cancel" },
          { text: "再試行", onPress: handleExport },
        ]
      );
      return;
    }
    const { printToFileAsync, shareAsync, FileSystem } = native;

    let fileUri: string | null = null;
    let renamedFileUri: string | null = null;
    let shareTempDir: string | null = null;
    try {
      const toDataUri = async (source: number): Promise<string | null> => {
        const asset = Asset.fromModule(source);
        await asset.downloadAsync();
        if (!asset.localUri) return null;
        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return `data:image/png;base64,${base64}`;
      };

      const imageUris: Record<string, string> = {};
      const startImageUris: Record<string, string> = {};
      for (const sel of selectedExercises) {
        const source = ILLUSTRATIONS[sel.exerciseId];
        if (source) {
          const uri = await toDataUri(source);
          if (uri) imageUris[sel.exerciseId] = uri;
        }
        // 2枚化済みの運動のみ開始姿勢を追加（未生成の運動は1枚のまま）
        const startSource = START_ILLUSTRATIONS[sel.exerciseId];
        if (startSource) {
          const uri = await toDataUri(startSource);
          if (uri) startImageUris[sel.exerciseId] = uri;
        }
      }
      const html = generateHtml(selectedExercises, imageUris, {
        sheetPurpose,
        orientation,
        includeCheckSheet,
        startImageUris,
        issuerLine,
      });
      const isLandscape = orientation === "landscape";
      // iOSの印刷はCSS 1px = 1pt(1/72in)で描画し、Web(Chrome)の1px = 1/96inより1.33倍大きくなる。
      // zoomで縮尺をWebに揃え、DESIGN.md §7のページ高さ較正（Chromeで実測）をそのまま効かせる。
      // Android(未リリース)は描画の縮尺が異なるため、実測済みのiOSだけに適用する。
      const nativeHtml =
        Platform.OS === "ios"
          ? html.replace("</head>", `<style>html{zoom:${NATIVE_CSS_ZOOM}}</style></head>`)
          : html;
      const printOptions: PrintToFileOptions = {
        html: nativeHtml,
        // 横向きはJS側でwidth/heightを入れ替えて渡す。iOSはheight > widthのときだけ
        // 反転するため二重反転しない（node_modules/expo-print/ios/PrintOptions.swift:55-57）。
        // Androidはorientationを===で比較するPrintPDFRenderTask.kt:71の分岐に依存せず、
        // 常に正しい向きの寸法をそのまま使える。
        width: isLandscape ? A4_HEIGHT_PT : A4_WIDTH_PT,
        height: isLandscape ? A4_WIDTH_PT : A4_HEIGHT_PT,
        orientation,
        margins: {
          top: PAGE_MARGIN_PT,
          bottom: PAGE_MARGIN_PT,
          left: PAGE_MARGIN_PT,
          right: PAGE_MARGIN_PT,
        },
      };
      const { uri } = await printToFileAsync(printOptions);
      fileUri = uri;
      setIsExporting(false);
      await new Promise((r) => setTimeout(r, 500));

      // 共有シートに出るファイル名がprintToFileAsyncのUUID名のままだと何のファイルか
      // 分からないため、分かりやすい名前にリネームしてから共有する。Caches/Print/配下を
      // 直接上書きすると同じ日に複数回出力した際に衝突しうるので、都度ユニークな
      // 一時フォルダを作ってその中に置く。
      let shareUri = uri;
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        try {
          const dateLabel = formatLocalDateForFilename(new Date());
          shareTempDir = `${cacheDir}hep-share-${Date.now()}/`;
          await FileSystem.makeDirectoryAsync(shareTempDir, { intermediates: true });
          const candidateUri = `${shareTempDir}自主トレ指導書_${dateLabel}.pdf`;
          // moveAsyncだと失敗時に元ファイルが既に消えている/中途半端な状態になっている
          // 恐れがあり、フォールバック先の安全性が下がるため、失敗しても元ファイルを
          // 確実に残せるcopyAsyncを使う。
          await FileSystem.copyAsync({ from: uri, to: candidateUri });
          renamedFileUri = candidateUri;
          shareUri = candidateUri;
        } catch {
          // リネームに失敗しても元のUUID名ファイル(uri)はそのまま残っているので、
          // それを共有して従来どおり動作を継続する。
          shareUri = uri;
        }
      }

      await shareAsync(shareUri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch {
      setIsExporting(false);
      Alert.alert(
        "PDF出力エラー",
        "指導書の生成に失敗しました。もう一度お試しください。",
        [
          { text: "キャンセル", style: "cancel" },
          { text: "再試行", onPress: handleExport },
        ]
      );
    } finally {
      // 3つの削除を独立して実行する（allSettledなので1つ失敗しても残りは実行され、
      // finally自体が例外を投げて未処理rejectionになることもない）。
      await Promise.allSettled([
        fileUri ? FileSystem.deleteAsync(fileUri, { idempotent: true }) : Promise.resolve(),
        renamedFileUri ? FileSystem.deleteAsync(renamedFileUri, { idempotent: true }) : Promise.resolve(),
        shareTempDir ? FileSystem.deleteAsync(shareTempDir, { idempotent: true }) : Promise.resolve(),
      ]);
    }
  };

  const handleClearAll = () => {
    if (Platform.OS === "web") {
      if (window.confirm("選択した運動をすべて解除しますか？")) {
        clearAll();
        router.replace("/");
      }
      return;
    }
    Alert.alert("確認", "選択した運動をすべて解除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "すべて解除",
        style: "destructive",
        onPress: () => {
          clearAll();
          router.back();
        },
      },
    ]);
  };

  if (selectedExercises.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-6xl">📋</Text>
        <Text className="mt-4 text-lg font-bold text-ink">
          運動が選択されていません
        </Text>
        <Text className="mt-2 text-center text-sm text-ink2">
          運動ライブラリから指導したい運動を選択してください
        </Text>
        <Pressable
          onPress={() => router.replace("/")}
          className="mt-6 rounded-xl bg-navy px-8 py-3"
        >
          <Text className="font-bold text-white">運動を選ぶ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ヘッダー */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-md bg-[#EEF2F9] px-2 py-0.5">
              <Text className="text-[13px] font-semibold text-navy">
                {selectedExercises.length}種目
              </Text>
            </View>
          </View>
          <Pressable onPress={handleClearAll}>
            <Text className="text-sm text-warn">すべて解除</Text>
          </Pressable>
        </View>

        {/* 指導書の目的 */}
        <View className="mb-3">
          <Text className="mb-1.5 text-[13px] font-semibold tracking-widest text-ink3">
            指導書の目的（任意）
          </Text>
          <TextInput
            className="rounded-lg border border-line bg-[#F4F6FA] px-3 py-2.5 text-[16px] text-ink"
            placeholder="例: 退院後の自主トレ、転倒予防プログラム"
            placeholderTextColor="#94A3B8"
            value={sheetPurpose}
            onChangeText={setSheetPurpose}
            maxLength={SHEET_PURPOSE_MAX_LENGTH}
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
          />
        </View>

        {/* ステップ表示 */}
        <StepIndicator current={2} />

        <View className="mb-4" />

        {[...selectedExercises]
          .sort((a, b) => a.order - b.order)
          .map((sel, idx, sorted) => {
            const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
            if (!ex) return null;

            return (
              <ExerciseEditCard
                key={sel.exerciseId}
                exerciseName={ex.name}
                exerciseNameEn={ex.nameEn}
                exerciseId={ex.id}
                posture={ex.posture}
                target={ex.target}
                keyPoints={ex.keyPoints}
                sel={sel}
                index={idx + 1}
                total={sorted.length}
                hasHold={ex.defaultHoldSeconds !== undefined}
                onUpdate={(updates) =>
                  updateExercise(sel.exerciseId, updates)
                }
                onRemove={() => removeExercise(sel.exerciseId)}
                onMoveUp={() => {
                  if (idx === 0) return;
                  const newList = [...sorted];
                  [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
                  reorderExercises(newList);
                }}
                onMoveDown={() => {
                  if (idx === sorted.length - 1) return;
                  const newList = [...sorted];
                  [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
                  reorderExercises(newList);
                }}
                scrollRef={scrollRef}
              />
            );
          })}
        {/* 出力ブロック（リスト末尾に配置。固定バーをやめてリストの面積を確保） */}
        <View className="mt-2 rounded-[14px] border border-line bg-card p-4">
        <Text className="mb-2.5 text-[12px] font-semibold tracking-widest text-ink3">
          3. 出力
        </Text>
        {/* 実施チェック表 */}
        <Pressable
          onPress={() => {
            setIncludeCheckSheet(!includeCheckSheet);
            track({ name: "check_sheet_toggle", enabled: !includeCheckSheet });
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: includeCheckSheet }}
          accessibilityLabel="実施チェック表を付ける"
          className={`mb-2 h-11 flex-row items-center gap-2.5 rounded-[10px] border px-3 ${
            includeCheckSheet
              ? "border-[#C7D7F5] bg-primary-soft"
              : "border-line bg-[#F4F6FA]"
          }`}
        >
          <View
            className={`h-[22px] w-[22px] items-center justify-center rounded-md ${
              includeCheckSheet
                ? "bg-navy"
                : "border-[1.5px] border-[#CBD5E1] bg-card"
            }`}
          >
            {includeCheckSheet && (
              <Text className="text-[11px] font-bold text-white">✓</Text>
            )}
          </View>
          <Text className="flex-1 text-[13px] font-semibold text-ink">
            実施チェック表を付ける
          </Text>
          <Text className="text-[11px] text-ink3">患者さんの記録用</Text>
        </Pressable>

        {/* 発行者（任意）。一度入れたら端末に残るので、既定は畳んでおく */}
        <Pressable
          onPress={() => setShowIssuer(!showIssuer)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showIssuer }}
          accessibilityLabel="発行者情報を編集する"
          className="mb-2 h-11 flex-row items-center gap-2 rounded-[10px] border border-line bg-[#F4F6FA] px-3"
        >
          <Text className="text-[13px] font-semibold text-ink">発行者</Text>
          <Text
            className={`flex-1 text-[13px] ${issuerLine ? "text-ink2" : "text-ink3"}`}
            numberOfLines={1}
          >
            {issuerLine ?? "未設定（任意）"}
          </Text>
          <Text className="text-[12px] text-ink3">{showIssuer ? "▲" : "▼"}</Text>
        </Pressable>
        {showIssuer && (
          <View className="mb-2 gap-2 rounded-[10px] border border-line bg-[#F4F6FA] p-3">
            <Text className="text-[12px] text-ink3">
              指導書の表紙に入ります。患者さんの情報は入れないでください
            </Text>
            <TextInput
              className="rounded-lg border border-line bg-card px-3 py-2.5 text-[16px] text-ink"
              placeholder="施設名（例: 〇〇総合病院）"
              placeholderTextColor="#94A3B8"
              value={facilityName}
              onChangeText={setFacilityName}
              maxLength={ISSUER_MAX.facility}
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
            />
            <TextInput
              className="rounded-lg border border-line bg-card px-3 py-2.5 text-[16px] text-ink"
              placeholder="担当者名（例: 理学療法士 佐藤）"
              placeholderTextColor="#94A3B8"
              value={staffName}
              onChangeText={setStaffName}
              maxLength={ISSUER_MAX.staff}
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
            />
          </View>
        )}

        {/* 用紙の向き */}
        <View className="mb-2 flex-row items-center justify-center gap-2">
          <Text className="text-[12px] font-semibold tracking-widest text-ink3">
            用紙
          </Text>
          <Pressable
            onPress={() => setOrientation("portrait")}
            accessibilityRole="button"
            accessibilityState={{ selected: orientation === "portrait" }}
            accessibilityLabel="用紙を縦向きにする"
            hitSlop={{ top: 8, bottom: 8 }}
            className={`rounded-lg px-4 py-2 ${orientation === "portrait" ? "bg-navy" : "border border-line bg-card"}`}
          >
            <Text className={`text-[13px] font-semibold ${orientation === "portrait" ? "text-white" : "text-ink2"}`}>
              縦向き
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setOrientation("landscape")}
            accessibilityRole="button"
            accessibilityState={{ selected: orientation === "landscape" }}
            accessibilityLabel="用紙を横向きにする"
            hitSlop={{ top: 8, bottom: 8 }}
            className={`rounded-lg px-4 py-2 ${orientation === "landscape" ? "bg-navy" : "border border-line bg-card"}`}
          >
            <Text className={`text-[13px] font-semibold ${orientation === "landscape" ? "text-white" : "text-ink2"}`}>
              横向き
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={handleExport}
          disabled={isExporting}
          className={`h-[56px] items-center justify-center rounded-[14px] ${
            isExporting ? "bg-ink3" : "bg-navy"
          }`}
          style={
            isExporting
              ? undefined
              : {
                  shadowColor: "#0B2545",
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                }
          }
        >
          <Text className="text-base font-bold text-white">
            PDFを出力・共有
          </Text>
        </Pressable>
        <Text className="mt-2 text-center text-[13px] text-ink3">
          自由入力内容・作成PDFは外部へ自動送信されません
        </Text>
      </View>
      </ScrollView>

      {/* ローディングオーバーレイ */}
      {isExporting && (
        <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-black/40">
          <View className="items-center rounded-2xl bg-card px-10 py-8">
            <ActivityIndicator size="large" color="#0B2545" />
            <Text className="mt-4 text-base font-bold text-ink">
              PDF生成中...
            </Text>
            <Text className="mt-1 text-sm text-ink2">
              しばらくお待ちください
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const STEPS = ["選ぶ", "調整", "出力"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <View className="flex-row gap-1.5">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const isDone = step <= current;
        return (
          <View key={label} className="flex-1">
            <View
              className={`h-[3px] rounded-full ${isDone ? "bg-navy" : "bg-line"}`}
            />
            <Text
              className={`mt-1 text-[11px] ${
                step === current
                  ? "font-bold text-navy"
                  : isDone
                    ? "font-medium text-ink3"
                    : "text-ink3"
              }`}
            >
              {step}. {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ExerciseEditCard({
  exerciseName,
  exerciseNameEn,
  exerciseId,
  posture,
  target,
  keyPoints,
  sel,
  index,
  total,
  hasHold,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  scrollRef,
}: {
  exerciseName: string;
  exerciseNameEn: string;
  exerciseId: string;
  posture: string;
  target: string;
  keyPoints: string[];
  sel: SelectedExercise;
  index: number;
  total: number;
  hasHold: boolean;
  onUpdate: (updates: Partial<SelectedExercise>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  scrollRef: React.RefObject<ScrollView | null>;
}) {
  const [expanded, setExpanded] = useState(index === 1);
  const illustration = ILLUSTRATIONS[exerciseId];
  const noteRef = useRef<View>(null);

  return (
    <View className="mb-2.5 overflow-hidden rounded-[14px] border border-line bg-card">
      {/* ヘッダー */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row gap-3 p-3"
      >
        <View className="w-6 items-center gap-1 pt-0.5">
          <Pressable
            onPress={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 1}
            accessibilityRole="button"
            accessibilityLabel="上に移動"
            hitSlop={{ top: 12, bottom: 12, left: 14, right: 14 }}
            className={`h-5 w-5 items-center justify-center rounded ${index === 1 ? "opacity-20" : ""}`}
          >
            <Text className="text-[10px] font-bold text-ink2">▲</Text>
          </Pressable>
          <View className="h-[22px] w-[22px] items-center justify-center rounded-md bg-[#EEF2F9]">
            <Text className="text-[12px] font-bold text-navy">
              {String(index).padStart(2, "0")}
            </Text>
          </View>
          <Pressable
            onPress={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === total}
            accessibilityRole="button"
            accessibilityLabel="下に移動"
            hitSlop={{ top: 12, bottom: 12, left: 14, right: 14 }}
            className={`h-5 w-5 items-center justify-center rounded ${index === total ? "opacity-20" : ""}`}
          >
            <Text className="text-[10px] font-bold text-ink2">▼</Text>
          </Pressable>
        </View>

        {illustration && (
          <View className="h-[60px] w-[78px] items-center justify-center overflow-hidden rounded-[9px] border border-line bg-[#F4F6FA] p-0.5">
            <Image
              source={illustration}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-[14.5px] font-bold leading-tight text-ink">
            {exerciseName}
          </Text>
          <Text className="mt-0.5 text-[13px] text-ink3">
            {exerciseNameEn}
          </Text>
          <View className="mt-1.5 flex-row gap-1">
            <View className="rounded-md bg-[#EEF2F9] px-2 py-0.5">
              <Text className="text-[13px] font-semibold text-navy">
                {posture}
              </Text>
            </View>
            <View className="rounded-md bg-teal-soft px-2 py-0.5">
              <Text className="text-[13px] font-semibold text-teal">
                {target}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-center gap-1">
          <View className="h-7 w-7 items-center justify-center rounded-lg border border-line bg-[#F4F6FA]">
            <Text className="text-xs text-ink2">{expanded ? "▼" : "▶"}</Text>
          </View>
          {!expanded && sel.notes.trim() !== "" && (
            <Text className="text-[10px] text-warn">📝</Text>
          )}
        </View>
      </Pressable>

      {/* 処方帯（常時表示） */}
      <View className="flex-row flex-wrap gap-1.5 border-t border-line bg-[#FAFBFD] px-3 py-2.5">
        <ParamCell
          label="回数"
          value={sel.reps}
          unit="回"
          onChange={(reps) => onUpdate({ reps })}
        />
        <ParamCell
          label="セット"
          value={sel.sets}
          unit="セット"
          onChange={(sets) => onUpdate({ sets })}
        />
        {hasHold && sel.holdSeconds !== undefined && (
          <ParamCell
            label="保持"
            value={sel.holdSeconds}
            unit="秒"
            onChange={(holdSeconds) => onUpdate({ holdSeconds })}
          />
        )}
        <ParamCell
          label="休息"
          value={sel.restSeconds}
          unit="秒"
          step={5}
          min={0}
          onChange={(restSeconds) => onUpdate({ restSeconds })}
        />
      </View>

      {/* 展開エリア */}
      {expanded && (
        <View className="border-t border-line p-3.5">
          {/* この運動の目的 */}
          <View className="mb-3.5">
            <Text className="mb-2 text-[13px] font-semibold tracking-widest text-ink3">
              この運動の目的（任意）
            </Text>
            <TextInput
              className="rounded-lg border border-line bg-[#F4F6FA] px-3 py-2 text-[16px] text-ink"
              placeholder="例: 膝の安定性向上、筋力維持"
              placeholderTextColor="#94A3B8"
              value={sel.purpose}
              onChangeText={(text) => onUpdate({ purpose: text })}
              maxLength={EXERCISE_PURPOSE_MAX_LENGTH}
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
            />
          </View>

          {/* 頻度 */}
          <View className="mb-3.5">
            <Text className="mb-2 text-[13px] font-semibold tracking-widest text-ink3">
              実施頻度
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {FREQUENCY_OPTIONS.map((freq) => {
                const isCustom = !FREQUENCY_OPTIONS.slice(0, -1).includes(sel.frequency);
                const isSelected = freq === "カスタム" ? isCustom : sel.frequency === freq;
                return (
                  <Pressable
                    key={freq}
                    onPress={() => {
                      if (freq === "カスタム") {
                        onUpdate({ frequency: "" });
                      } else {
                        onUpdate({ frequency: freq });
                      }
                    }}
                    className={`rounded-full px-3 py-1.5 ${
                      isSelected
                        ? "bg-navy"
                        : "border border-line bg-card"
                    }`}
                  >
                    <Text
                      className={`text-[13px] ${
                        isSelected
                          ? "font-semibold text-white"
                          : "font-medium text-ink2"
                      }`}
                    >
                      {freq}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {!FREQUENCY_OPTIONS.slice(0, -1).includes(sel.frequency) && (
              <TextInput
                className="mt-2 rounded-lg border border-line bg-[#F4F6FA] px-3 py-2 text-[16px] text-ink"
                placeholder="例: 週5回、毎日朝晩"
                placeholderTextColor="#94A3B8"
                value={sel.frequency}
                onChangeText={(text) => onUpdate({ frequency: text })}
                autoCorrect={false}
              />
            )}
          </View>

          {/* ポイント */}
          <View className="mb-3.5">
            <Text className="mb-2 text-[13px] font-semibold tracking-widest text-ink3">
              実施ポイント
            </Text>
            <View className="rounded-[10px] border border-line bg-[#FAFBFD] p-3">
              {keyPoints.map((kp, i) => (
                <View key={i} className={`flex-row gap-2 ${i > 0 ? "mt-2" : ""}`}>
                  <View className="mt-0.5 h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-[#EEF2F9]">
                    <Text className="text-[12px] font-bold text-navy">
                      {i + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-[14px] leading-5 text-ink">
                    {kp}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 注意メモ */}
          <View ref={noteRef}>
            <Text className="mb-2 text-[13px] font-semibold tracking-widest text-ink3">
              患者への注意
            </Text>
            <View className="flex-row overflow-hidden rounded-[10px] border border-[#F5D2D2] bg-warn-soft">
              <View className="w-1 bg-warn" />
              <TextInput
                className="flex-1 px-3 py-2.5 text-[16px] text-[#7F1D1D]"
                placeholder="注意点を入力..."
                placeholderTextColor="#94A3B8"
                value={sel.notes}
                onChangeText={(text) => onUpdate({ notes: text })}
                multiline
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                onFocus={() => {
                  if (Platform.OS === "web") return;
                  setTimeout(() => {
                    const scrollNode = findNodeHandle(scrollRef.current);
                    if (!noteRef.current || !scrollNode) return;
                    noteRef.current.measureLayout(
                      scrollNode,
                      (_x, y) => {
                        scrollRef.current?.scrollTo({ y: y - 100, animated: true });
                      },
                      () => {}
                    );
                  }, 300);
                }}
              />
            </View>
          </View>

          {/* アクション */}
          <View className="mt-3.5 border-t border-line pt-3">
            <Pressable
              onPress={() => {
                if (Platform.OS === "web") {
                  if (window.confirm(`「${exerciseName}」を指導書から外しますか？`)) {
                    onRemove();
                  }
                } else {
                  Alert.alert("確認", `「${exerciseName}」を指導書から外しますか？`, [
                    { text: "キャンセル", style: "cancel" },
                    { text: "外す", style: "destructive", onPress: onRemove },
                  ]);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`${exerciseName}を指導書から外す`}
              className="h-11 flex-row items-center justify-center gap-1.5 rounded-[10px] border border-[#F5D2D2] bg-warn-soft"
            >
              <Text className="text-sm text-warn">✕</Text>
              <Text className="text-[13px] font-semibold text-warn">
                この運動を外す
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

/** 連続増減の安全上限（onPressOut が来ない場合の暴走防止） */
const MAX_REPEAT = 100;

/**
 * ステッパーボタン。単発タップは onPress、長押し中は 100ms 間隔で連続増減する。
 * onPressIn は RN Web の Pressable で発火しないため使わない。
 */
function StepperButton({
  onStep,
  symbol,
  accessibilityLabel,
  tone,
}: {
  onStep: () => void;
  symbol: string;
  accessibilityLabel: string;
  tone: "minus" | "plus";
}) {
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // interval のクロージャが古い値を掴まないよう、常に最新の onStep を参照する
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  const stopRepeat = () => {
    if (repeatRef.current) clearInterval(repeatRef.current);
    repeatRef.current = null;
  };

  const startRepeat = () => {
    stopRepeat();
    let count = 0;
    onStepRef.current();
    repeatRef.current = setInterval(() => {
      onStepRef.current();
      if (++count >= MAX_REPEAT) stopRepeat();
    }, 100);
  };

  useEffect(() => stopRepeat, []);

  return (
    <Pressable
      onPress={() => onStepRef.current()}
      onLongPress={startRepeat}
      onPressOut={stopRepeat}
      delayLongPress={500}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 6, bottom: 6, left: 7, right: 7 }}
      className="h-11 flex-1 items-center justify-center rounded-lg bg-[#F4F6FA]"
    >
      <Text
        className={`text-lg font-bold ${tone === "plus" ? "text-navy" : "text-ink2"}`}
      >
        {symbol}
      </Text>
    </Pressable>
  );
}

function ParamCell({
  label,
  value,
  unit,
  step = 1,
  min = 1,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step?: number;
  min?: number;
  onChange: (next: number) => void;
}) {
  // 長押し連打中も最新値から計算するための参照
  const valueRef = useRef(value);
  valueRef.current = value;

  return (
    <View className="flex-1 items-center rounded-[10px] border border-line bg-card px-1 py-2">
      <Text className="text-[12px] font-semibold tracking-wide text-ink3">
        {label}
      </Text>
      <Text className="mt-1 text-xl font-bold text-ink">
        {value}
        <Text className="text-xs font-medium text-ink2"> {unit}</Text>
      </Text>
      <View className="mt-1.5 w-full flex-row gap-1">
        <StepperButton
          tone="minus"
          symbol="−"
          accessibilityLabel={`${label}を減らす`}
          onStep={() => onChange(Math.max(min, valueRef.current - step))}
        />
        <StepperButton
          tone="plus"
          symbol="+"
          accessibilityLabel={`${label}を増やす`}
          onStep={() => onChange(valueRef.current + step)}
        />
      </View>
    </View>
  );
}
