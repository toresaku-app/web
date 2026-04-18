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
      className={`mb-2.5 flex-row gap-3 rounded-[14px] border bg-card p-3 ${
        isSelected ? "border-[#C7D7F5]" : "border-line"
      }`}
      style={
        isSelected
          ? { shadowColor: "#1D4ED8", shadowOpacity: 0.08, shadowRadius: 1, shadowOffset: { width: 0, height: 0 } }
          : { shadowColor: "#0F172A", shadowOpacity: 0.03, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }
      }
    >
      {/* サムネイル */}
      {illustration && (
        <View
          className={`h-[72px] w-[92px] items-center justify-center overflow-hidden rounded-[10px] border p-1 ${
            isSelected ? "border-[#C7D7F5] bg-primary-soft" : "border-line bg-[#F4F6FA]"
          }`}
        >
          <Image
            source={illustration}
            className="h-full w-full"
            resizeMode="contain"
          />
        </View>
      )}

      {/* テキスト情報 */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text className="text-[15px] font-bold leading-tight text-ink">
              {exercise.name}
            </Text>
            <Text className="mt-0.5 text-[11.5px] text-ink3">
              {exercise.nameEn}
            </Text>
          </View>
          {/* チェックボックス */}
          <View
            className={`h-[26px] w-[26px] items-center justify-center rounded-lg ${
              isSelected
                ? "bg-navy"
                : "border-[1.5px] border-[#CBD5E1] bg-card"
            }`}
          >
            {isSelected && (
              <Text className="text-xs font-bold text-white">✓</Text>
            )}
          </View>
        </View>

        <View className="mt-2 flex-row flex-wrap gap-1">
          <Pill label={exercise.posture} tone="navy" />
          <Pill label={exercise.bodyPart} tone="neutral" />
          <Pill label={exercise.target} tone="teal" />
        </View>
      </View>
    </Pressable>
  );
}

function Pill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "navy" | "teal";
}) {
  const styles = {
    neutral: "bg-[#F1F5F9] text-ink2",
    navy: "bg-[#EEF2F9] text-navy",
    teal: "bg-teal-soft text-teal",
  };

  return (
    <View className={`rounded-md px-2 py-0.5 ${styles[tone]}`}>
      <Text className={`text-[11.5px] font-semibold ${tone === "neutral" ? "text-ink2" : tone === "navy" ? "text-navy" : "text-teal"}`}>
        {label}
      </Text>
    </View>
  );
}
