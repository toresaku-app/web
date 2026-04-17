import { View, Text, Pressable, Image } from "react-native";
import { Exercise } from "../types/exercise";
import { ILLUSTRATIONS } from "../constants/illustrations";

interface Props {
  exercise: Exercise;
  isSelected: boolean;
  onToggle: () => void;
}

export function ExerciseCard({ exercise, isSelected, onToggle }: Props) {
  const illustration = ILLUSTRATIONS[exercise.id];

  return (
    <Pressable
      onPress={onToggle}
      className={`mb-4 rounded-xl border-2 p-4 ${
        isSelected
          ? "border-primary bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <View className="flex-row">
        {/* サムネイル */}
        {illustration && (
          <Image
            source={illustration}
            className="mr-3 h-[72px] w-[96px] rounded-lg bg-gray-50"
            resizeMode="contain"
          />
        )}

        {/* テキスト情報 */}
        <View className="flex-1">
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
                isSelected
                  ? "bg-primary"
                  : "border-2 border-gray-300 bg-white"
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
        </View>
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
