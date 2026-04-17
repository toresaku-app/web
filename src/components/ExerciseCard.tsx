import { View, Text, Pressable } from "react-native";
import { Exercise } from "../types/exercise";

interface Props {
  exercise: Exercise;
  isSelected: boolean;
  onToggle: () => void;
}

export function ExerciseCard({ exercise, isSelected, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      className={`mb-3 rounded-xl border-2 p-4 ${
        isSelected
          ? "border-primary bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-text-primary">
            {exercise.name}
          </Text>
          <Text className="mt-0.5 text-sm text-text-secondary">
            {exercise.nameEn}
          </Text>
        </View>
        <View
          className={`h-7 w-7 items-center justify-center rounded-full ${
            isSelected ? "bg-primary" : "border-2 border-gray-300 bg-white"
          }`}
        >
          {isSelected && (
            <Text className="text-sm font-bold text-white">✓</Text>
          )}
        </View>
      </View>

      <View className="mt-2 flex-row flex-wrap gap-1.5">
        <Badge label={exercise.posture} />
        <Badge label={exercise.bodyPart} />
        <Badge label={exercise.target} variant="target" />
      </View>

      <Text className="mt-2 text-sm text-text-secondary" numberOfLines={2}>
        {exercise.description}
      </Text>
    </Pressable>
  );
}

function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "target";
}) {
  return (
    <View
      className={`rounded-full px-2.5 py-0.5 ${
        variant === "target" ? "bg-red-50" : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          variant === "target" ? "text-red-600" : "text-text-secondary"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
