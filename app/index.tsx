import { useState, useMemo } from "react";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { EXERCISES } from "../src/constants/exercises";
import { useHepStore } from "../src/stores/hepStore";
import { ExerciseCard } from "../src/components/ExerciseCard";
import { FilterBar } from "../src/components/FilterBar";
import { BodyPart, Posture } from "../src/types/exercise";

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
];

export default function ExerciseLibrary() {
  const [bodyPartFilter, setBodyPartFilter] = useState<"すべて" | BodyPart>(
    "すべて"
  );
  const [postureFilter, setPostureFilter] = useState<"すべて" | Posture>(
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
  }, [bodyPartFilter, postureFilter, searchText]);

  const selectedIds = new Set(selectedExercises.map((e) => e.exerciseId));
  const selectedCount = selectedExercises.length;

  return (
    <View className="flex-1 bg-surface">
      {/* 検索バー */}
      <View className="px-4 pt-2">
        <TextInput
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-text-primary"
          placeholder="運動名・ターゲットで検索..."
          placeholderTextColor="#94A3B8"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
      </View>

      {/* 部位フィルタ */}
      <FilterBar
        filters={BODY_PART_FILTERS}
        selected={bodyPartFilter}
        onSelect={(v) => setBodyPartFilter(v as "すべて" | BodyPart)}
      />

      {/* 姿勢フィルタ */}
      <FilterBar
        filters={POSTURE_FILTERS}
        selected={postureFilter}
        onSelect={(v) => setPostureFilter(v as "すべて" | Posture)}
      />

      {/* 運動リスト */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-lg text-text-secondary">
              該当する運動がありません
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              フィルタや検索条件を変更してください
            </Text>
          </View>
        }
        renderItem={({ item }) => (
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
        )}
      />

      {/* 下部CTA */}
      {selectedCount > 0 && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 pb-8 pt-4">
          <Pressable
            onPress={() => router.push("/preview")}
            className="items-center rounded-xl bg-primary py-4"
          >
            <Text className="text-lg font-bold text-white">
              指導書を作成（{selectedCount}種目）
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
