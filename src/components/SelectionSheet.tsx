import { Modal, View, Text, Pressable, ScrollView, Image } from "react-native";
import { EXERCISES } from "../constants/exercises";
import { ILLUSTRATIONS } from "../constants/illustrations";
import { SelectedExercise } from "../types/exercise";

interface Props {
  visible: boolean;
  selected: SelectedExercise[];
  onClose: () => void;
  onRemove: (exerciseId: string) => void;
  onProceed: () => void;
}

/**
 * 選択中の運動を一覧・解除できるシート。
 * 100件のリストを遡らずに「何を選んだか」を確認できるようにする。
 */
export function SelectionSheet({
  visible,
  selected,
  onClose,
  onRemove,
  onProceed,
}: Props) {
  const sorted = [...selected].sort((a, b) => a.order - b.order);

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
        accessibilityLabel="閉じる"
      />
      <View className="max-h-[75%] rounded-t-[20px] border-t border-line bg-card pb-8">
        <View className="items-center pt-2.5">
          <View className="h-1 w-10 rounded-full bg-line" />
        </View>

        <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
          <Text className="text-[17px] font-bold text-ink">
            選択中の運動{" "}
            <Text className="text-[15px] font-semibold text-navy">
              {sorted.length}
            </Text>
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="h-9 w-9 items-center justify-center rounded-lg border border-line bg-[#F4F6FA]"
          >
            <Text className="text-[15px] text-ink2">✕</Text>
          </Pressable>
        </View>

        <ScrollView className="shrink px-5">
          {sorted.map((sel, i) => {
            const ex = EXERCISES.find((e) => e.id === sel.exerciseId);
            if (!ex) return null;
            const illustration = ILLUSTRATIONS[ex.id];
            return (
              <View
                key={sel.exerciseId}
                className="mb-2 flex-row items-center gap-3 rounded-[12px] border border-line bg-card p-2.5"
              >
                <View className="h-[22px] w-[22px] items-center justify-center rounded-md bg-[#EEF2F9]">
                  <Text className="text-[12px] font-bold text-navy">
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                </View>
                {illustration && (
                  <View className="h-[44px] w-[56px] items-center justify-center overflow-hidden rounded-[8px] border border-line bg-[#F4F6FA] p-0.5">
                    <Image
                      source={illustration}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </View>
                )}
                <View className="flex-1">
                  <Text
                    className="text-[14px] font-bold leading-tight text-ink"
                    numberOfLines={1}
                  >
                    {ex.name}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-ink3">
                    {ex.target}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onRemove(sel.exerciseId)}
                  accessibilityRole="button"
                  accessibilityLabel={`${ex.name}を外す`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="h-9 w-9 items-center justify-center rounded-[9px] border border-[#F5D2D2] bg-warn-soft"
                >
                  <Text className="text-[13px] text-warn">✕</Text>
                </Pressable>
              </View>
            );
          })}
          <View className="h-2" />
        </ScrollView>

        <View className="border-t border-line px-5 pt-3">
          <Pressable
            onPress={onProceed}
            accessibilityRole="button"
            accessibilityLabel="指導書を作成"
            className="h-[52px] flex-row items-center justify-center rounded-[14px] bg-navy"
          >
            <Text className="text-[15px] font-bold text-white">
              指導書を作成
            </Text>
          </Pressable>
        </View>
      </View>
      </View>
    </Modal>
  );
}
