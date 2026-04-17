import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useHepStore } from "../src/stores/hepStore";
import { EXERCISES } from "../src/constants/exercises";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { SelectedExercise } from "../src/types/exercise";

const FREQUENCY_OPTIONS = [
  "1日1回",
  "1日2回",
  "1日2〜3回",
  "1日3回",
  "週3回",
  "週5回",
  "毎日",
];

function generateHtml(selectedExercises: SelectedExercise[]) {
  const exerciseCards = selectedExercises
    .sort((a, b) => a.order - b.order)
    .map((sel) => {
      const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
      if (!ex) return "";

      const holdText = sel.holdSeconds ? `${sel.holdSeconds}秒キープ × ` : "";
      const prescriptionText = `${holdText}${sel.reps}回 × ${sel.sets}セット`;

      return `
        <div class="exercise-card">
          <div class="exercise-header">
            <h2>${ex.name}</h2>
            <span class="prescription">${prescriptionText}</span>
          </div>
          <p class="description">${ex.description}</p>
          <div class="key-points">
            ${ex.keyPoints.map((kp) => `<div class="point">● ${kp}</div>`).join("")}
          </div>
          ${sel.notes ? `<div class="notes">※ ${sel.notes}</div>` : ""}
          <div class="frequency">頻度: ${sel.frequency}</div>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { margin: 15mm; }
        body {
          font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif;
          color: #1A1A1A;
          line-height: 1.6;
        }
        .title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          color: #2563EB;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 3px solid #2563EB;
        }
        .subtitle {
          text-align: center;
          font-size: 13px;
          color: #64748B;
          margin-bottom: 20px;
        }
        .exercise-card {
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .exercise-header h2 {
          font-size: 16px;
          margin: 0;
          color: #1A1A1A;
        }
        .prescription {
          background: #2563EB;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          white-space: nowrap;
        }
        .description {
          font-size: 13px;
          color: #475569;
          margin: 4px 0 8px 0;
        }
        .key-points {
          background: #F8FAFC;
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 6px;
        }
        .point {
          font-size: 12px;
          color: #334155;
          margin: 3px 0;
          line-height: 1.5;
        }
        .notes {
          font-size: 12px;
          color: #EF4444;
          font-weight: bold;
          margin-top: 6px;
        }
        .frequency {
          font-size: 11px;
          color: #64748B;
          text-align: right;
          margin-top: 4px;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #94A3B8;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #E2E8F0;
        }
      </style>
    </head>
    <body>
      <div class="title">自主トレーニング指導書</div>
      <div class="subtitle">痛みがある場合は無理をせず中止してください</div>
      ${exerciseCards}
      <div class="footer">
        作成日: ${new Date().toLocaleDateString("ja-JP")}
      </div>
    </body>
    </html>
  `;
}

export default function PreviewScreen() {
  const { selectedExercises, updateExercise, removeExercise, clearAll } =
    useHepStore();
  const router = useRouter();

  const handleExport = async () => {
    try {
      const html = generateHtml(selectedExercises);
      const { uri } = await printToFileAsync({ html });
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
        <Text className="mt-4 text-lg font-bold text-text-primary">
          運動が選択されていません
        </Text>
        <Text className="mt-2 text-center text-sm text-text-secondary">
          運動ライブラリから指導したい運動を選択してください
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-xl bg-primary px-8 py-3"
        >
          <Text className="font-bold text-white">運動を選ぶ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* ヘッダー操作 */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-sm text-text-secondary">
            {selectedExercises.length}種目を選択中
          </Text>
          <Pressable onPress={handleClearAll}>
            <Text className="text-sm text-red-500">すべて解除</Text>
          </Pressable>
        </View>

        {selectedExercises
          .sort((a, b) => a.order - b.order)
          .map((sel) => {
            const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
            if (!ex) return null;

            return (
              <ExerciseEditCard
                key={sel.exerciseId}
                exerciseName={ex.name}
                keyPoints={ex.keyPoints}
                sel={sel}
                hasHold={ex.defaultHoldSeconds !== undefined}
                onUpdate={(updates) =>
                  updateExercise(sel.exerciseId, updates)
                }
                onRemove={() => removeExercise(sel.exerciseId)}
              />
            );
          })}
      </ScrollView>

      {/* 下部CTA */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 pb-8 pt-4">
        <Pressable
          onPress={handleExport}
          className="items-center rounded-xl bg-primary py-4"
        >
          <Text className="text-lg font-bold text-white">PDF出力・共有</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ExerciseEditCard({
  exerciseName,
  keyPoints,
  sel,
  hasHold,
  onUpdate,
  onRemove,
}: {
  exerciseName: string;
  keyPoints: string[];
  sel: SelectedExercise;
  hasHold: boolean;
  onUpdate: (updates: Partial<SelectedExercise>) => void;
  onRemove: () => void;
}) {
  const [showFrequency, setShowFrequency] = useState(false);

  return (
    <View className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-lg font-bold text-text-primary">
          {exerciseName}
        </Text>
        <Pressable
          onPress={onRemove}
          className="rounded-full bg-red-50 px-3 py-1"
        >
          <Text className="text-sm text-red-500">削除</Text>
        </Pressable>
      </View>

      {/* パラメータ */}
      <View className="mt-3 flex-row items-center gap-3">
        <ParameterInput
          label="回数"
          value={sel.reps}
          unit="回"
          onChange={(v) => onUpdate({ reps: v })}
        />
        <ParameterInput
          label="セット"
          value={sel.sets}
          unit="セット"
          onChange={(v) => onUpdate({ sets: v })}
        />
        {hasHold && sel.holdSeconds !== undefined && (
          <ParameterInput
            label="保持"
            value={sel.holdSeconds}
            unit="秒"
            onChange={(v) => onUpdate({ holdSeconds: v })}
          />
        )}
      </View>

      {/* 頻度 */}
      <Pressable
        onPress={() => setShowFrequency(!showFrequency)}
        className="mt-3 flex-row items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
      >
        <Text className="text-sm text-text-secondary">頻度</Text>
        <Text className="text-sm font-medium text-text-primary">
          {sel.frequency} ▼
        </Text>
      </Pressable>

      {showFrequency && (
        <View className="mt-1 flex-row flex-wrap gap-2">
          {FREQUENCY_OPTIONS.map((freq) => (
            <Pressable
              key={freq}
              onPress={() => {
                onUpdate({ frequency: freq });
                setShowFrequency(false);
              }}
              className={`rounded-full px-3 py-1.5 ${
                sel.frequency === freq
                  ? "bg-primary"
                  : "border border-gray-300 bg-white"
              }`}
            >
              <Text
                className={`text-sm ${
                  sel.frequency === freq
                    ? "font-bold text-white"
                    : "text-text-secondary"
                }`}
              >
                {freq}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* メモ */}
      <TextInput
        className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-text-primary"
        placeholder="注意点・メモを入力..."
        placeholderTextColor="#94A3B8"
        value={sel.notes}
        onChangeText={(text) => onUpdate({ notes: text })}
        multiline
      />

      {/* ポイント */}
      <View className="mt-3">
        <Text className="mb-1 text-xs text-text-secondary">ポイント</Text>
        {keyPoints.map((kp, i) => (
          <Text key={i} className="text-sm leading-5 text-text-secondary">
            ● {kp}
          </Text>
        ))}
      </View>
    </View>
  );
}

function ParameterInput({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <View className="items-center">
      <Text className="mb-1 text-xs text-text-secondary">{label}</Text>
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={() => onChange(Math.max(1, value - 1))}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          accessibilityLabel={`${label}を減らす`}
        >
          <Text className="text-lg font-bold text-text-secondary">-</Text>
        </Pressable>
        <Text className="min-w-[40px] text-center text-base font-bold text-text-primary">
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(value + 1)}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          accessibilityLabel={`${label}を増やす`}
        >
          <Text className="text-lg font-bold text-text-secondary">+</Text>
        </Pressable>
      </View>
      <Text className="mt-0.5 text-xs text-text-secondary">{unit}</Text>
    </View>
  );
}
