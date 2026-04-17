import { View, Text, Pressable, ScrollView } from "react-native";

interface Props {
  filters: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function FilterBar({ filters, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
    >
      <View className="flex-row gap-2 px-4">
        {filters.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => onSelect(filter)}
            className={`rounded-full px-4 py-2 ${
              selected === filter
                ? "bg-primary"
                : "border border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selected === filter ? "text-white" : "text-text-secondary"
              }`}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
