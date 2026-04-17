import { useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { EXERCISES } from "../src/constants/exercises";
import { useHepStore } from "../src/stores/hepStore";
import { ExerciseCard } from "../src/components/ExerciseCard";
import { FilterBar } from "../src/components/FilterBar";
import { BodyPart } from "../src/types/exercise";

const BODY_PART_FILTERS: ("すべて" | BodyPart)[] = [
  "すべて",
  "下肢",
  "体幹",
  "上肢",
];

export default function ExerciseLibrary() {
  const [bodyPartFilter, setBodyPartFilter] = useState<"すべて" | BodyPart>(
    "すべて"
  );
  const { selectedExercises, addExercise, removeExercise } = useHepStore();
  const router = useRouter();

  const filteredExercises =
    bodyPartFilter === "すべて"
      ? EXERCISES
      : EXERCISES.filter((e) => e.bodyPart === bodyPartFilter);

  const selectedIds = new Set(selectedExercises.map((e) => e.exerciseId));
  const selectedCount = selectedExercises.length;

  return (
    <View className="flex-1 bg-surface">
      <FilterBar
        filters={BODY_PART_FILTERS}
        selected={bodyPartFilter}
        onSelect={(v) => setBodyPartFilter(v as "すべて" | BodyPart)}
      />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
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
