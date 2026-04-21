import { useState, useRef } from "react";
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
import { EXERCISES } from "../src/constants/exercises";
import { ILLUSTRATIONS } from "../src/constants/illustrations";
import { Asset } from "expo-asset";

// Native-only modules - lazy imported to avoid web bundler errors
let printToFileAsync: typeof import("expo-print").printToFileAsync;
let shareAsync: typeof import("expo-sharing").shareAsync;
let FileSystem: typeof import("expo-file-system/legacy");

if (Platform.OS !== "web") {
  import("expo-print")
    .then((m) => (printToFileAsync = m.printToFileAsync))
    .catch(() => console.warn("expo-print failed to load"));
  import("expo-sharing")
    .then((m) => (shareAsync = m.shareAsync))
    .catch(() => console.warn("expo-sharing failed to load"));
  import("expo-file-system/legacy")
    .then((m) => (FileSystem = m))
    .catch(() => console.warn("expo-file-system failed to load"));
}
import { SelectedExercise } from "../src/types/exercise";
import { generateHtml } from "../src/utils/generateHtml";

const FREQUENCY_OPTIONS = [
  "1日1回",
  "1日2回",
  "1日2〜3回",
  "毎日",
  "週3回",
  "カスタム",
];


export default function PreviewScreen() {
  const { selectedExercises, updateExercise, removeExercise, clearAll, sheetPurpose, setSheetPurpose, orientation, setOrientation } =
    useHepStore();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    if (Platform.OS === "web") {
      setIsExporting(false);
      router.push("/print");
      return;
    }

    // Native: expo-print + expo-sharing
    let fileUri: string | null = null;
    try {
      const imageUris: Record<string, string> = {};
      for (const sel of selectedExercises) {
        const source = ILLUSTRATIONS[sel.exerciseId];
        if (source) {
          const asset = Asset.fromModule(source);
          await asset.downloadAsync();
          if (asset.localUri && FileSystem) {
            const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            imageUris[sel.exerciseId] = `data:image/png;base64,${base64}`;
          }
        }
      }
      const html = generateHtml(selectedExercises, imageUris, sheetPurpose, orientation);
      const { uri } = await printToFileAsync({ html });
      fileUri = uri;
      setIsExporting(false);
      await new Promise((r) => setTimeout(r, 500));
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
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
      if (fileUri) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
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
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
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
            className="rounded-lg border border-line bg-[#F4F6FA] px-3 py-2.5 text-[13px] text-ink"
            placeholder="例: 退院後の自主トレ、転倒予防プログラム"
            placeholderTextColor="#94A3B8"
            value={sheetPurpose}
            onChangeText={setSheetPurpose}
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
          />
        </View>

        {/* プログレスバー */}
        <View className="mb-4 flex-row gap-1.5">
          <View className="h-[3px] flex-1 rounded-full bg-navy" />
          <View className="h-[3px] flex-1 rounded-full bg-navy" />
          <View className="h-[3px] flex-1 rounded-full bg-line" />
        </View>

        {[...selectedExercises]
          .sort((a, b) => a.order - b.order)
          .map((sel, idx) => {
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
                hasHold={ex.defaultHoldSeconds !== undefined}
                onUpdate={(updates) =>
                  updateExercise(sel.exerciseId, updates)
                }
                onRemove={() => removeExercise(sel.exerciseId)}
                scrollRef={scrollRef}
              />
            );
          })}
      </ScrollView>

      {/* 下部CTA */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-card px-5 pb-7 pt-3">
        {/* 印刷方向トグル */}
        <View className="mb-2 flex-row items-center justify-center gap-2">
          <Pressable
            onPress={() => setOrientation("portrait")}
            className={`rounded-lg px-4 py-1.5 ${orientation === "portrait" ? "bg-navy" : "border border-line bg-card"}`}
          >
            <Text className={`text-[13px] font-semibold ${orientation === "portrait" ? "text-white" : "text-ink2"}`}>
              縦向き
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setOrientation("landscape")}
            className={`rounded-lg px-4 py-1.5 ${orientation === "landscape" ? "bg-navy" : "border border-line bg-card"}`}
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
          端末内で完結 · クラウド送信なし
        </Text>
      </View>

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

function ExerciseEditCard({
  exerciseName,
  exerciseNameEn,
  exerciseId,
  posture,
  target,
  keyPoints,
  sel,
  index,
  hasHold,
  onUpdate,
  onRemove,
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
  hasHold: boolean;
  onUpdate: (updates: Partial<SelectedExercise>) => void;
  onRemove: () => void;
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
        <View className="w-6 items-center gap-1.5 pt-1">
          <View className="h-[22px] w-[22px] items-center justify-center rounded-md bg-[#EEF2F9]">
            <Text className="text-[12px] font-bold text-navy">
              {String(index).padStart(2, "0")}
            </Text>
          </View>
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
          onIncrement={() => onUpdate({ reps: sel.reps + 1 })}
          onDecrement={() => onUpdate({ reps: Math.max(1, sel.reps - 1) })}
        />
        <ParamCell
          label="セット"
          value={sel.sets}
          unit="セット"
          onIncrement={() => onUpdate({ sets: sel.sets + 1 })}
          onDecrement={() => onUpdate({ sets: Math.max(1, sel.sets - 1) })}
        />
        {hasHold && sel.holdSeconds !== undefined && (
          <ParamCell
            label="保持"
            value={sel.holdSeconds}
            unit="秒"
            onIncrement={() =>
              onUpdate({ holdSeconds: sel.holdSeconds! + 1 })
            }
            onDecrement={() =>
              onUpdate({ holdSeconds: Math.max(1, sel.holdSeconds! - 1) })
            }
          />
        )}
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
              className="rounded-lg border border-line bg-[#F4F6FA] px-3 py-2 text-[13px] text-ink"
              placeholder="例: 膝の安定性向上、筋力維持"
              placeholderTextColor="#94A3B8"
              value={sel.purpose}
              onChangeText={(text) => onUpdate({ purpose: text })}
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
                className="mt-2 rounded-lg border border-line bg-[#F4F6FA] px-3 py-2 text-[13px] text-ink"
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
                className="flex-1 px-3 py-2.5 text-[14px] text-[#7F1D1D]"
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
          <View className="mt-3.5 flex-row gap-2 border-t border-line pt-3">
            <Pressable
              onPress={() => {
                if (Platform.OS === "web") {
                  if (window.confirm(`「${exerciseName}」を削除しますか？`)) {
                    onRemove();
                  }
                } else {
                  Alert.alert("確認", `「${exerciseName}」を削除しますか？`, [
                    { text: "キャンセル", style: "cancel" },
                    { text: "削除", style: "destructive", onPress: onRemove },
                  ]);
                }
              }}
              className="h-9 w-9 items-center justify-center rounded-[9px] border border-[#F5D2D2] bg-warn-soft"
            >
              <Text className="text-sm text-warn">✕</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function ParamCell({
  label,
  value,
  unit,
  onIncrement,
  onDecrement,
}: {
  label: string;
  value: number;
  unit: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <View className="flex-1 items-center rounded-[10px] border border-line bg-card px-1 py-2">
      <Text className="text-[12px] font-semibold tracking-wide text-ink3">
        {label}
      </Text>
      <Text className="mt-1 text-xl font-bold text-ink">
        {value}
        <Text className="text-xs font-medium text-ink2"> {unit}</Text>
      </Text>
      <View className="mt-1.5 flex-row gap-1.5">
        <Pressable
          onPress={onDecrement}
          className="h-8 w-8 items-center justify-center rounded-lg bg-[#F4F6FA]"
          accessibilityLabel={`${label}を減らす`}
        >
          <Text className="text-base font-bold text-ink2">−</Text>
        </Pressable>
        <Pressable
          onPress={onIncrement}
          className="h-8 w-8 items-center justify-center rounded-lg bg-[#F4F6FA]"
          accessibilityLabel={`${label}を増やす`}
        >
          <Text className="text-base font-bold text-navy">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
