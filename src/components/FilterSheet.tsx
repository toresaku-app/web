import { Modal, View, Text, Pressable, ScrollView } from "react-native";

interface Section<T extends string> {
  label: string;
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  resultCount: number;
  activeCount: number;
  onReset: () => void;
  // 型が異なる複数セクションを1つのシートで扱うため、呼び出し側で組み立てて渡す
  sections: Section<string>[];
}

/**
 * 姿勢・種類の絞り込みシート。
 * 横スクロールを廃止し、全選択肢を折り返しグリッドで見せる（選択肢の見落とし防止）。
 * 選択は即時反映され、シートは「閉じる」だけで完了する。
 */
export function FilterSheet({
  visible,
  onClose,
  resultCount,
  activeCount,
  onReset,
  sections,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
      <Pressable
        className="absolute bottom-0 left-0 right-0 top-0 bg-black/40"
        onPress={onClose}
        accessibilityLabel="絞り込みを閉じる"
      />
      <View className="max-h-[75%] rounded-t-[20px] border-t border-line bg-card pb-8">
        {/* ハンドル */}
        <View className="items-center pt-2.5">
          <View className="h-1 w-10 rounded-full bg-line" />
        </View>

        {/* ヘッダー */}
        <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
          <Text className="text-[17px] font-bold text-ink">絞り込み</Text>
          {activeCount > 0 && (
            <Pressable
              onPress={onReset}
              accessibilityRole="button"
              accessibilityLabel="絞り込みをすべて解除"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="rounded-lg border border-line px-3 py-1.5"
            >
              <Text className="text-[13px] font-medium text-ink2">
                すべて解除
              </Text>
            </Pressable>
          )}
        </View>

        <ScrollView className="shrink px-5">
          {sections.map((section) => (
            <View key={section.label} className="mb-4">
              <Text className="mb-2 text-[12px] font-semibold tracking-widest text-ink3">
                {section.label}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {section.options.map((option) => {
                  const isSelected = section.selected === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => section.onSelect(option)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${section.label}: ${option}`}
                      className={`h-11 justify-center rounded-full px-4 ${
                        isSelected ? "bg-navy" : "border border-line bg-card"
                      }`}
                    >
                      <Text
                        className={`text-[14px] ${
                          isSelected
                            ? "font-semibold text-white"
                            : "font-medium text-ink2"
                        }`}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 確定 */}
        <View className="border-t border-line px-5 pt-3">
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={`絞り込みを閉じる（${resultCount}件）`}
            className="h-[52px] flex-row items-center justify-center rounded-[14px] bg-navy"
          >
            <Text className="text-[15px] font-bold text-white">
              {resultCount}件を表示
            </Text>
          </Pressable>
        </View>
      </View>
      </View>
    </Modal>
  );
}
