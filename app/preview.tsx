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
} from "react-native";
import { useRouter } from "expo-router";
import { useHepStore } from "../src/stores/hepStore";
import { EXERCISES } from "../src/constants/exercises";
import { ILLUSTRATIONS } from "../src/constants/illustrations";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import { Asset } from "expo-asset";
import { SelectedExercise } from "../src/types/exercise";

const FREQUENCY_OPTIONS = [
  "1日1回",
  "1日2回",
  "1日2〜3回",
  "毎日",
  "週3回",
];

// HTML エスケープ
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
  imageUri?: string
): string {
  const rxCells: string[] = [
    rxCell("回数", String(sel.reps), "回"),
    rxCell("セット", String(sel.sets), "セット"),
  ];
  if (sel.holdSeconds !== undefined) {
    rxCells.push(rxCell("保持", String(sel.holdSeconds), "秒"));
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
      <div>
        <div class="note-label">注　意</div>
        <div class="note-body">${esc(sel.notes)}</div>
      </div>
    </div>`
      : "";

  return `
  <section class="page${isLast ? "" : " break"}">
    <header class="page-header">
      <div>
        <div class="title">自主トレーニング指導書</div>
        <div class="issue">発行日　${issueDate()}</div>
      </div>
      <div class="page-badge">第 ${index} 枚 / 全 ${total} 枚</div>
    </header>

    <div class="title-block">
      <div class="tags">
        <span class="tag tag-navy">${esc(ex.posture)}</span>
        <span class="tag tag-teal">ターゲット：${esc(ex.target)}</span>
      </div>
      <h1 class="ex-name">${esc(ex.name)}</h1>
    </div>

    <div class="illust">
      ${imageUri ? `<img src="${esc(imageUri)}" alt=""/>` : `<div class="illust-placeholder">${esc(ex.name)}</div>`}
    </div>

    <div class="rx-strip">${rxCells.join("")}</div>

    <div class="points">
      <div class="points-heading">
        <div class="points-bar"></div>
        <div class="points-title">やり方のポイント</div>
      </div>
      <div class="points-list">${pointsHtml}</div>
    </div>

    ${noteHtml}

    <footer class="page-footer">
      <span>痛みや違和感がある場合は無理をせず中止し、担当の先生にご相談ください</span>
      <span class="page-num">${index} / ${total} ページ</span>
    </footer>
  </section>`;
}

function generateHtml(
  selectedExercises: SelectedExercise[],
  imageUris: Record<string, string>
) {
  const sorted = [...selectedExercises].sort((a, b) => a.order - b.order);
  const total = sorted.length;

  const pages = sorted
    .map((sel, i) => {
      const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
      if (!ex) return "";
      return renderPage(sel, ex, i + 1, total, i === sorted.length - 1, imageUris[sel.exerciseId]);
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8"/>
<title>自主トレーニング指導書</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif;
    color: #0F172A;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .break { page-break-after: always; }

  /* ヘッダー */
  .page-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    padding-bottom: 6px; border-bottom: 3px solid #0B2545;
    flex-shrink: 0;
  }
  .title { font-size: 18pt; font-weight: 700; color: #0B2545; line-height: 1.1; }
  .issue { font-size: 10pt; color: #475569; margin-top: 3px; }
  .page-badge {
    padding: 3px 8px; border-radius: 6px;
    background: #0B2545; color: #fff;
    font-size: 10pt; font-weight: 700; white-space: nowrap;
  }

  /* タイトル */
  .title-block { padding: 6px 0; flex-shrink: 0; }
  .tags { display: flex; gap: 6px; margin-bottom: 6px; }
  .tag { padding: 2px 8px; border-radius: 5px; font-size: 10pt; font-weight: 700; }
  .tag-navy { background: #EEF2F9; color: #0B2545; }
  .tag-teal { background: #E6F4F2; color: #0F766E; }
  .ex-name { font-size: 28pt; font-weight: 700; color: #0F172A; line-height: 1.15; }

  /* イラスト — flex:1で残りスペースを吸収、注意が増えたら縮む */
  .illust {
    flex: 1 1 0;
    min-height: 80px;
    max-height: 200px;
    border-radius: 10px;
    background: #F7F9FC; border: 1px solid #E6EAF0;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; padding: 8px;
    margin-top: 4px;
  }
  .illust img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .illust-placeholder { font-size: 12pt; color: #94A3B8; }

  /* 処方 */
  .rx-strip { display: flex; gap: 5px; margin-top: 6px; flex-shrink: 0; }
  .rx-cell {
    flex: 1; border: 2px solid #0B2545; border-radius: 8px;
    background: #fff; overflow: hidden;
  }
  .rx-cell-wide { flex: 1.6; }
  .rx-label {
    background: #0B2545; color: #fff;
    font-size: 9pt; font-weight: 700; letter-spacing: 1.5px;
    padding: 2px 6px; text-align: center;
  }
  .rx-body {
    padding: 4px 6px;
    display: flex; align-items: center; justify-content: center;
  }
  .rx-value {
    font-size: 28pt; font-weight: 700; color: #0B2545;
    line-height: 1; font-variant-numeric: tabular-nums;
  }
  .rx-unit { font-size: 12pt; font-weight: 700; color: #0F172A; margin-left: 2px; }
  .rx-text { font-size: 16pt; font-weight: 700; color: #0F172A; text-align: center; }

  /* ポイント */
  .points { margin-top: 6px; flex-shrink: 0; }
  .points-heading { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .points-bar { width: 4px; height: 16px; background: #0B2545; border-radius: 2px; }
  .points-title { font-size: 14pt; font-weight: 700; color: #0F172A; }
  .pt-row {
    display: flex; gap: 8px; align-items: flex-start;
    padding: 3px 0; border-bottom: 1px solid #E6EAF0;
  }
  .pt-last { border-bottom: none; }
  .pt-num {
    width: 20px; height: 20px; border-radius: 5px;
    background: #0B2545; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 10pt; font-weight: 700; flex-shrink: 0;
  }
  .pt-body { font-size: 12pt; color: #0F172A; line-height: 1.45; padding-top: 1px; flex: 1; }

  /* 注意 */
  .note {
    margin-top: 6px; padding: 8px 12px;
    background: #FBEAEA; border: 1px solid #F5D2D2;
    border-left: 5px solid #B91C1C; border-radius: 6px;
    display: flex; gap: 8px; align-items: flex-start;
    flex-shrink: 0;
  }
  .note-icon {
    width: 22px; height: 22px; border-radius: 11px;
    background: #B91C1C; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 14pt; font-weight: 700; flex-shrink: 0;
  }
  .note-label { font-size: 9pt; font-weight: 700; color: #B91C1C; letter-spacing: 1px; }
  .note-body { font-size: 11pt; color: #7F1D1D; line-height: 1.4; }

  /* フッター — 常にページ最下部 */
  .page-footer {
    margin-top: auto;
    padding-top: 6px; border-top: 1px solid #E6EAF0;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 8pt; color: #94A3B8;
    flex-shrink: 0;
  }
  .page-num { color: #475569; font-weight: 500; }
</style>
</head>
<body>
${pages}
</body>
</html>`;
}

export default function PreviewScreen() {
  const { selectedExercises, updateExercise, removeExercise, clearAll } =
    useHepStore();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const handleExport = async () => {
    try {
      // イラストのローカルURIを解決
      const imageUris: Record<string, string> = {};
      for (const sel of selectedExercises) {
        const source = ILLUSTRATIONS[sel.exerciseId];
        if (source) {
          const asset = Asset.fromModule(source as number);
          await asset.downloadAsync();
          imageUris[sel.exerciseId] = asset.localUri || "";
        }
      }
      const html = generateHtml(selectedExercises, imageUris);
      const { uri } = await printToFileAsync({
        html,
        width: 595,
        height: 842,
      });
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch {
      Alert.alert("エラー", "PDF出力に失敗しました");
    }
  };

  const handleClearAll = () => {
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
          onPress={() => router.back()}
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
              <Text className="text-[11.5px] font-semibold text-navy">
                {selectedExercises.length}種目
              </Text>
            </View>
          </View>
          <Pressable onPress={handleClearAll}>
            <Text className="text-sm text-warn">すべて解除</Text>
          </Pressable>
        </View>

        {/* プログレスバー */}
        <View className="mb-4 flex-row gap-1.5">
          <View className="h-[3px] flex-1 rounded-full bg-navy" />
          <View className="h-[3px] flex-1 rounded-full bg-navy" />
          <View className="h-[3px] flex-1 rounded-full bg-line" />
        </View>

        {selectedExercises
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
        <Pressable
          onPress={handleExport}
          className="h-[56px] items-center justify-center rounded-[14px] bg-navy"
          style={{
            shadowColor: "#0B2545",
            shadowOpacity: 0.35,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <Text className="text-base font-bold text-white">
            PDFを出力・共有
          </Text>
        </Pressable>
        <Text className="mt-2 text-center text-[11px] text-ink3">
          端末内で完結 · クラウド送信なし
        </Text>
      </View>
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
            <Text className="text-[11px] font-bold text-navy">
              {String(index).padStart(2, "0")}
            </Text>
          </View>
        </View>

        {illustration && (
          <View className="h-[60px] w-[78px] items-center justify-center overflow-hidden rounded-[9px] border border-line bg-[#F4F6FA] p-0.5">
            <Image
              source={illustration}
              className="h-full w-full"
              resizeMode="contain"
            />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-[14.5px] font-bold leading-tight text-ink">
            {exerciseName}
          </Text>
          <Text className="mt-0.5 text-[11px] text-ink3">
            {exerciseNameEn}
          </Text>
          <View className="mt-1.5 flex-row gap-1">
            <View className="rounded-md bg-[#EEF2F9] px-2 py-0.5">
              <Text className="text-[11.5px] font-semibold text-navy">
                {posture}
              </Text>
            </View>
            <View className="rounded-md bg-teal-soft px-2 py-0.5">
              <Text className="text-[11.5px] font-semibold text-teal">
                {target}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-7 w-7 items-center justify-center rounded-lg border border-line bg-[#F4F6FA]">
          <Text className="text-xs text-ink2">{expanded ? "▼" : "▶"}</Text>
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
          {/* 頻度 */}
          <View className="mb-3.5">
            <Text className="mb-2 text-[11px] font-semibold tracking-widest text-ink3">
              実施頻度
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {FREQUENCY_OPTIONS.map((freq) => (
                <Pressable
                  key={freq}
                  onPress={() => onUpdate({ frequency: freq })}
                  className={`rounded-full px-3 py-1.5 ${
                    sel.frequency === freq
                      ? "bg-navy"
                      : "border border-line bg-card"
                  }`}
                >
                  <Text
                    className={`text-[13px] ${
                      sel.frequency === freq
                        ? "font-semibold text-white"
                        : "font-medium text-ink2"
                    }`}
                  >
                    {freq}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ポイント */}
          <View className="mb-3.5">
            <Text className="mb-2 text-[11px] font-semibold tracking-widest text-ink3">
              実施ポイント
            </Text>
            <View className="rounded-[10px] border border-line bg-[#FAFBFD] p-3">
              {keyPoints.map((kp, i) => (
                <View key={i} className={`flex-row gap-2 ${i > 0 ? "mt-2" : ""}`}>
                  <View className="mt-0.5 h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-[#EEF2F9]">
                    <Text className="text-[10px] font-bold text-navy">
                      {i + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-[12.5px] leading-5 text-ink">
                    {kp}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 注意メモ */}
          <View ref={noteRef}>
            <Text className="mb-2 text-[11px] font-semibold tracking-widest text-ink3">
              患者への注意
            </Text>
            <View className="flex-row overflow-hidden rounded-[10px] border border-[#F5D2D2] bg-warn-soft">
              <View className="w-1 bg-warn" />
              <TextInput
                className="flex-1 px-3 py-2.5 text-[12.5px] text-[#7F1D1D]"
                placeholder="注意点を入力..."
                placeholderTextColor="#94A3B8"
                value={sel.notes}
                onChangeText={(text) => onUpdate({ notes: text })}
                multiline
                onFocus={() => {
                  setTimeout(() => {
                    noteRef.current?.measureLayout(
                      scrollRef.current as any,
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
              onPress={onRemove}
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
      <Text className="text-[10px] font-semibold tracking-wide text-ink3">
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
