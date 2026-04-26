import { useState, useMemo } from "react";
import { View, Text, FlatList, Pressable, TextInput, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { EXERCISES } from "../src/constants/exercises";
import { useHepStore } from "../src/stores/hepStore";
import { ExerciseCard } from "../src/components/ExerciseCard";
import { FilterBar } from "../src/components/FilterBar";
import { BodyPart, Category, Posture } from "../src/types/exercise";

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
  const { selectedExercises, addExercise, removeExercise } = useHepStore();
  const router = useRouter();

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((e) => {
      if (bodyPartFilter !== "すべて" && e.bodyPart !== bodyPartFilter)
        return false;
      if (postureFilter !== "すべて" && e.posture !== postureFilter)
        return false;
      if (categoryFilter !== "すべて" && e.category !== categoryFilter)
        return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.nameEn.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bodyPartFilter, postureFilter, categoryFilter, searchText]);

  const selectedIds = new Set(selectedExercises.map((e) => e.exerciseId));
  const selectedCount = selectedExercises.length;

  return (
    <SafeAreaView className="flex-1 bg-card" edges={["top"]}>
      {/* ヘッダー */}
      <View className="border-b border-line bg-card">
        <View className="flex-row items-center justify-between px-5 pb-0.5 pt-1">
          <View className="flex-row items-center gap-2">
            <View className="h-[22px] w-[22px] items-center justify-center rounded-md bg-navy">
              <Text className="text-[10px] font-extrabold text-white">ト</Text>
            </View>
            <Text className="text-[13px] font-semibold text-ink">
              トレさく
            </Text>
          </View>
          <Pressable
            onPress={() =>
              Linking.openURL(
                "https://docs.google.com/forms/d/e/1FAIpQLSdnlPwtqKpPcYBHKTdR4XfThPmxwbd3qjPAj3PTih2LD9LhxQ/viewform"
              )
            }
            accessibilityRole="button"
            accessibilityLabel="ご意見・ご要望を送る"
            className="rounded-lg border border-line px-2.5 py-1"
          >
            <Text className="text-[12px] text-ink3">ご意見</Text>
          </Pressable>
        </View>
        <View className="px-5 pb-3.5 pt-1.5">
          <Text className="text-[26px] font-bold tracking-tight text-ink">
            運動ライブラリ
          </Text>
          <Text className="mt-1 text-[13px] text-ink2">
            処方する運動を選択してください ·{" "}
            <Text className="font-semibold text-navy">
              {filteredExercises.length}件
            </Text>
          </Text>
        </View>
      </View>

      {/* 運動リスト */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        className="bg-surface"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            {/* 検索バー */}
            <View className="bg-card px-5 pb-3">
              <View className="h-[42px] flex-row items-center rounded-[11px] border border-line bg-[#F4F6FA] px-3.5">
                <Text className="mr-2 text-ink3">🔍</Text>
                <TextInput
                  className="flex-1 text-[14px] text-ink"
                  placeholder="運動名・英名・部位で検索"
                  placeholderTextColor="#94A3B8"
                  value={searchText}
                  onChangeText={setSearchText}
                  clearButtonMode="while-editing"
                />
              </View>
            </View>

            {/* フィルタ */}
            <View className="border-b border-line bg-card py-2">
              <FilterBar
                label="部位"
                filters={BODY_PART_FILTERS}
                selected={bodyPartFilter}
                onSelect={setBodyPartFilter}
              />
              <FilterBar
                label="姿勢"
                filters={POSTURE_FILTERS}
                selected={postureFilter}
                onSelect={setPostureFilter}
              />
              <FilterBar
                label="種類"
                filters={CATEGORY_FILTERS}
                selected={categoryFilter}
                onSelect={setCategoryFilter}
              />
            </View>

            <View className="h-4" />
          </View>
        }
        ListEmptyComponent={
          <View className="items-center px-4 py-20">
            <Text className="text-lg text-ink2">
              該当する運動がありません
            </Text>
            <Text className="mt-2 text-sm text-ink3">
              フィルタや検索条件を変更してください
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-4">
            <ExerciseCard
              exercise={item}
              isSelected={selectedIds.has(item.id)}
              onToggle={() => {
                if (selectedIds.has(item.id)) {
                  removeExercise(item.id);
                } else {
                  addExercise(item.id);
                }
              }}
            />
          </View>
        )}
        ListFooterComponent={
          <View className="mt-4 items-center px-4 pb-4">
            <Pressable
              onPress={() =>
                Linking.openURL(
                  "https://docs.google.com/forms/d/e/1FAIpQLSdnlPwtqKpPcYBHKTdR4XfThPmxwbd3qjPAj3PTih2LD9LhxQ/viewform"
                )
              }
              accessibilityRole="button"
              accessibilityLabel="ご意見・ご要望を送る"
              className="mb-3 rounded-lg border border-line bg-card px-4 py-2.5"
            >
              <Text className="text-[13px] font-medium text-ink2">
                ご意見・ご要望
              </Text>
            </Pressable>
            <View className="flex-row justify-center gap-4">
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    "https://toresaku-app.github.io/privacy-policy/"
                  )
                }
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
              >
                <Text className="text-xs text-ink3 underline">利用規約</Text>
              </Pressable>
            </View>
          </View>
        }
      />

      {/* 下部CTA */}
      {selectedCount > 0 && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-card px-5 pb-7 pt-3">
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
            <Text className="text-base font-bold text-white">
              指導書を作成
            </Text>
            <View className="ml-2.5 rounded-full bg-white/20 px-2.5 py-0.5">
              <Text className="text-[13px] font-bold text-white">
                {selectedCount}
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
