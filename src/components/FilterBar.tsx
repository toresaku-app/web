import { View, Text, Pressable, ScrollView } from "react-native";

interface Props {
  label: string;
  filters: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function FilterBar({ label, filters, selected, onSelect }: Props) {
  return (
    <View className="px-5 py-1">
      <Text className="mb-1.5 text-[10px] font-semibold tracking-widest text-ink3">
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View className="flex-row gap-1.5">
          {filters.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => onSelect(filter)}
              className={`rounded-full px-3.5 py-2 ${
                selected === filter
                  ? "bg-navy"
                  : "border border-line bg-card"
              }`}
            >
              <Text
                className={`text-[13px] ${
                  selected === filter
                    ? "font-semibold text-white"
                    : "font-medium text-ink2"
                }`}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
