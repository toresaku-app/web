import { useState, useMemo } from "react";
import { View, Text, FlatList, Pressable, TextInput, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { EXERCISES } from "../src/constants/exercises";
import { useHepStore } from "../src/stores/hepStore";
import { ExerciseCard } from "../src/components/ExerciseCard";
import { FilterSheet } from "../src/components/FilterSheet";
import { ExerciseDetailModal } from "../src/components/ExerciseDetailModal";
import { SelectionSheet } from "../src/components/SelectionSheet";
import { BodyPart, Category, Exercise, Posture } from "../src/types/exercise";

const FEEDBACK_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdnlPwtqKpPcYBHKTdR4XfThPmxwbd3qjPAj3PTih2LD9LhxQ/viewform";

const BODY_PART_FILTERS: ("すべて" | BodyPart)[] = [
  "すべて",
  "下肢",
  "体幹",
  "上肢",
];

const POSTURE_FILTERS: ("すべて" | Posture)[] = [
  "すべて",
  "臥位",
  "側臥位",
  "座位",
  "立位",
  "四つ這い",
];

const CATEGORY_FILTERS: ("すべて" | Category)[] = [
  "すべて",
  "筋トレ",
  "ストレッチ",
  "バランス",
  "ADL",
  "呼吸",
];

/** ひらがな・カタカナを相互にヒットさせるための正規化 */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) + 0x60)
    );

export default function ExerciseLibrary() {
  const [bodyPartFilter, setBodyPartFilter] = useState<"すべて" | BodyPart>(
    "すべて"
  );
  const [postureFilter, setPostureFilter] = useState<"すべて" | Posture>(
    "すべて"
  );
  const [categoryFilter, setCategoryFilter] = useState<"すべて" | Category>(
    "すべて"
  );
  const [searchText, setSearchText] = useState("");
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSelectionOpen, setSelectionOpen] = useState(false);
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);

  const { selectedExercises, addExercise, removeExercise } = useHepStore();
  const router = useRouter();

  const filteredExercises = useMemo(() => {
    const q = normalize(searchText.trim());
    return EXERCISES.filter((e) => {
      if (bodyPartFilter !== "すべて" && e.bodyPart !== bodyPartFilter)
        return false;
      if (postureFilter !== "すべて" && e.posture !== postureFilter)
        return false;
      if (categoryFilter !== "すべて" && e.category !== categoryFilter)
        return false;
      if (q) {
        return (
          normalize(e.name).includes(q) ||
          normalize(e.nameEn).includes(q) ||
          normalize(e.target).includes(q)
        );
      }
      return true;
    });
  }, [bodyPartFilter, postureFilter, categoryFilter, searchText]);

  const selectedIds = new Set(selectedExercises.map((e) => e.exerciseId));
  const selectedCount = selectedExercises.length;

  // シートに入れている絞り込み（姿勢・種類）の適用数
  const sheetActiveCount =
    (postureFilter !== "すべて" ? 1 : 0) + (categoryFilter !== "すべて" ? 1 : 0);

  const toggle = (id: string) => {
    if (selectedIds.has(id)) {
      removeExercise(id);
    } else {
      addExercise(id);
    }
  };

  const selectedNames = [...selectedExercises]
    .sort((a, b) => a.order - b.order)
    .map((s) => EXERCISES.find((e) => e.id === s.exerciseId)?.name)
    .filter(Boolean)
    .join("、");

  return (
    <SafeAreaView className="flex-1 bg-card" edges={["top"]}>
      {/* ヘッダー（1行に圧縮してリストの面積を確保） */}
      <View className="border-b border-line bg-card px-5 pb-2.5 pt-1.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-[24px] w-[24px] items-center justify-center rounded-md bg-navy">
              <Text className="text-[11px] font-extrabold text-white">ト</Text>
            </View>
            <Text className="text-[21px] font-bold tracking-tight text-ink">
              運動ライブラリ
            </Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL(FEEDBACK_URL)}
            accessibilityRole="button"
            accessibilityLabel="ご意見・ご要望を送る"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="rounded-lg border border-line px-2.5 py-1.5"
          >
            <Text className="text-[12px] text-ink3">ご意見</Text>
          </Pressable>
        </View>
        <Text className="mt-1 text-[12px] text-ink2">
          処方する運動を選択してください ·{" "}
          <Text className="font-semibold text-navy">
            {filteredExercises.length}件
          </Text>
        </Text>
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        className="bg-surface"
        contentContainerStyle={{ paddingBottom: selectedCount > 0 ? 160 : 24 }}
        ListHeaderComponent={
          <View className="border-b border-line bg-card px-5 pb-2.5 pt-2.5">
            {/* 検索 + 絞り込み */}
            <View className="flex-row items-center gap-2">
              <View className="h-[42px] flex-1 flex-row items-center rounded-[11px] border border-line bg-[#F4F6FA] px-3.5">
                <Text className="mr-2 text-ink3">🔍</Text>
                <TextInput
                  className="flex-1 text-[14px] text-ink"
                  placeholder="運動名・部位で検索"
                  placeholderTextColor="#94A3B8"
                  value={searchText}
                  onChangeText={setSearchText}
                  clearButtonMode="while-editing"
                />
              </View>
              <Pressable
                onPress={() => setFilterOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`絞り込み${sheetActiveCount > 0 ? `（${sheetActiveCount}件適用中）` : ""}`}
                className={`h-[42px] flex-row items-center gap-1.5 rounded-[11px] px-3.5 ${
                  sheetActiveCount > 0
                    ? "bg-navy"
                    : "border border-line bg-card"
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    sheetActiveCount > 0 ? "text-white" : "text-ink2"
                  }`}
                >
                  絞り込み
                </Text>
                {sheetActiveCount > 0 && (
                  <View className="h-[18px] w-[18px] items-center justify-center rounded-full bg-white/25">
                    <Text className="text-[11px] font-bold text-white">
                      {sheetActiveCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* 部位（常設） */}
            <View className="mt-2.5 flex-row gap-1.5">
              {BODY_PART_FILTERS.map((filter) => {
                const isSelected = bodyPartFilter === filter;
                return (
                  <Pressable
                    key={filter}
                    onPress={() => setBodyPartFilter(filter)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`部位: ${filter}`}
                    className={`h-[38px] flex-1 items-center justify-center rounded-full ${
                      isSelected ? "bg-navy" : "border border-line bg-card"
                    }`}
                  >
                    <Text
                      className={`text-[13px] ${
                        isSelected
                          ? "font-semibold text-white"
                          : "font-medium text-ink2"
                      }`}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 適用中の絞り込みチップ */}
            {sheetActiveCount > 0 && (
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                {postureFilter !== "すべて" && (
                  <ActiveChip
                    label={`姿勢: ${postureFilter}`}
                    onClear={() => setPostureFilter("すべて")}
                  />
                )}
                {categoryFilter !== "すべて" && (
                  <ActiveChip
                    label={`種類: ${categoryFilter}`}
                    onClear={() => setCategoryFilter("すべて")}
                  />
                )}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center px-8 py-20">
            <Text className="text-lg font-bold text-ink2">
              該当する運動がありません
            </Text>
            <Text className="mt-2 text-center text-sm text-ink3">
              検索語や絞り込みを変えてみてください
            </Text>
            <Pressable
              onPress={() => {
                setSearchText("");
                setBodyPartFilter("すべて");
                setPostureFilter("すべて");
                setCategoryFilter("すべて");
              }}
              accessibilityRole="button"
              accessibilityLabel="条件をすべて解除"
              className="mt-5 h-11 justify-center rounded-xl bg-navy px-6"
            >
              <Text className="font-bold text-white">条件をすべて解除</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-4 pt-2.5">
            <ExerciseCard
              exercise={item}
              isSelected={selectedIds.has(item.id)}
              onToggle={() => toggle(item.id)}
              onOpenDetail={() => setDetailExercise(item)}
            />
          </View>
        )}
        ListFooterComponent={
          <View className="mt-4 items-center px-4 pb-4">
            <Pressable
              onPress={() => Linking.openURL(FEEDBACK_URL)}
              accessibilityRole="button"
              accessibilityLabel="ご意見・ご要望を送る"
              className="mb-3 h-11 justify-center rounded-lg border border-line bg-card px-4"
            >
              <Text className="text-[13px] font-medium text-ink2">
                ご意見・ご要望
              </Text>
            </Pressable>
            <View className="flex-row justify-center gap-4">
              <Pressable
                onPress={() =>
                  Linking.openURL("https://toresaku-app.github.io/privacy-policy/")
                }
                hitSlop={{ top: 8, bottom: 8 }}
              >
                <Text className="text-xs text-ink3 underline">
                  プライバシーポリシー
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    "https://toresaku-app.github.io/privacy-policy/terms.html"
                  )
                }
                hitSlop={{ top: 8, bottom: 8 }}
              >
                <Text className="text-xs text-ink3 underline">利用規約</Text>
              </Pressable>
            </View>
          </View>
        }
      />

      {/* 下部: 選択トレイ + CTA */}
      {selectedCount > 0 && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-card px-5 pb-7 pt-2.5">
          <Pressable
            onPress={() => setSelectionOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`選択中の運動を確認（${selectedCount}種目）`}
            className="mb-2 flex-row items-center gap-2 rounded-[10px] bg-[#F4F6FA] px-3 py-2"
          >
            <Text className="text-[12px] font-semibold text-navy">
              選択中
            </Text>
            <Text
              className="flex-1 text-[12px] text-ink2"
              numberOfLines={1}
            >
              {selectedNames}
            </Text>
            <Text className="text-[12px] text-ink3">確認 ›</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/preview")}
            accessibilityRole="button"
            accessibilityLabel={`指導書を作成（${selectedCount}種目選択中）`}
            className="h-[56px] flex-row items-center justify-center rounded-[14px] bg-navy"
            style={{
              shadowColor: "#0B2545",
              shadowOpacity: 0.35,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            <Text className="text-base font-bold text-white">指導書を作成</Text>
            <View className="ml-2.5 rounded-full bg-white/20 px-2.5 py-0.5">
              <Text className="text-[13px] font-bold text-white">
                {selectedCount}
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      <FilterSheet
        visible={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        resultCount={filteredExercises.length}
        activeCount={sheetActiveCount}
        onReset={() => {
          setPostureFilter("すべて");
          setCategoryFilter("すべて");
        }}
        sections={[
          {
            label: "姿勢",
            options: POSTURE_FILTERS,
            selected: postureFilter,
            onSelect: (v) => setPostureFilter(v as "すべて" | Posture),
          },
          {
            label: "種類",
            options: CATEGORY_FILTERS,
            selected: categoryFilter,
            onSelect: (v) => setCategoryFilter(v as "すべて" | Category),
          },
        ]}
      />

      <ExerciseDetailModal
        exercise={detailExercise}
        isSelected={detailExercise ? selectedIds.has(detailExercise.id) : false}
        onToggle={() => {
          if (detailExercise) toggle(detailExercise.id);
        }}
        onClose={() => setDetailExercise(null)}
      />

      <SelectionSheet
        visible={isSelectionOpen}
        selected={selectedExercises}
        onClose={() => setSelectionOpen(false)}
        onRemove={removeExercise}
        onProceed={() => {
          setSelectionOpen(false);
          router.push("/preview");
        }}
      />
    </SafeAreaView>
  );
}

function ActiveChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <Pressable
      onPress={onClear}
      accessibilityRole="button"
      accessibilityLabel={`${label} を解除`}
      hitSlop={{ top: 8, bottom: 8 }}
      className="flex-row items-center gap-1.5 rounded-full bg-[#EEF2F9] px-3 py-1.5"
    >
      <Text className="text-[12px] font-semibold text-navy">{label}</Text>
      <Text className="text-[12px] font-bold text-navy">✕</Text>
    </Pressable>
  );
}
