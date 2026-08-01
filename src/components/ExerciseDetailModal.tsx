import { Modal, View, Text, Pressable, ScrollView, Image } from "react-native";
import { Exercise } from "../types/exercise";
import { ILLUSTRATIONS, START_ILLUSTRATIONS } from "../constants/illustrations";

interface Props {
  exercise: Exercise | null;
  isSelected: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/**
 * 運動の詳細モーダル。サムネイルタップで開く。
 * 選択前の内容確認（フロー2）と、指導直前のポイント再確認（フロー6）を兼ねる。
 */
export function ExerciseDetailModal({
  exercise,
  isSelected,
  onToggle,
  onClose,
}: Props) {
  if (!exercise) return null;
  const illustration = ILLUSTRATIONS[exercise.id];
  const startIllustration = START_ILLUSTRATIONS[exercise.id];

  return (
    <Modal
      visible={exercise !== null}
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
      <View className="max-h-[85%] rounded-t-[20px] border-t border-line bg-card pb-8">
        <View className="items-center pt-2.5">
          <View className="h-1 w-10 rounded-full bg-line" />
        </View>

        <ScrollView className="shrink px-5 pt-3">
          {/* 見出し */}
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-[20px] font-bold leading-tight text-ink">
                {exercise.name}
              </Text>
              <Text className="mt-0.5 text-[13px] text-ink3">
                {exercise.nameEn}
              </Text>
            </View>
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

          {/* 属性 */}
          <View className="mt-2.5 flex-row flex-wrap gap-1.5">
            <Tag label={exercise.posture} tone="navy" />
            <Tag label={exercise.bodyPart} tone="neutral" />
            <Tag label={exercise.category} tone="neutral" />
            <Tag label={exercise.target} tone="teal" />
          </View>

          {/* イラスト（2枚化済みなら 開始 → 動作 の2枚） */}
          {illustration && startIllustration && (
            <View className="mt-3.5 h-[160px] flex-row items-center gap-1.5">
              <IllustPane source={startIllustration} caption="① 開始" />
              <Text className="text-[18px] font-bold text-warn">▶</Text>
              <IllustPane source={illustration} caption="② 動作" />
            </View>
          )}
          {illustration && !startIllustration && (
            <View className="mt-3.5 h-[200px] items-center justify-center overflow-hidden rounded-[12px] border border-line bg-[#F4F6FA] p-3">
              <Image
                source={illustration}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </View>
          )}

          {/* 説明 */}
          <View className="mt-3.5">
            <Text className="mb-1.5 text-[12px] font-semibold tracking-widest text-ink3">
              やり方
            </Text>
            <Text className="text-[14px] leading-6 text-ink">
              {exercise.description}
            </Text>
          </View>

          {/* ポイント */}
          <View className="mt-3.5">
            <Text className="mb-2 text-[12px] font-semibold tracking-widest text-ink3">
              実施ポイント
            </Text>
            <View className="rounded-[10px] border border-line bg-[#FAFBFD] p-3">
              {exercise.keyPoints.map((kp, i) => (
                <View
                  key={i}
                  className={`flex-row gap-2 ${i > 0 ? "mt-2" : ""}`}
                >
                  <View className="mt-0.5 h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-[#EEF2F9]">
                    <Text className="text-[12px] font-bold text-navy">
                      {i + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-[14px] leading-5 text-ink">
                    {kp}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 初期値 */}
          <View className="mb-4 mt-3.5 flex-row gap-2">
            <DefaultCell label="回数" value={`${exercise.defaultReps}回`} />
            <DefaultCell label="セット" value={`${exercise.defaultSets}セット`} />
            {exercise.defaultHoldSeconds !== undefined && (
              <DefaultCell
                label="保持"
                value={`${exercise.defaultHoldSeconds}秒`}
              />
            )}
          </View>
        </ScrollView>

        {/* 選択トグル */}
        <View className="border-t border-line px-5 pt-3">
          <Pressable
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel={
              isSelected
                ? `${exercise.name}を指導書から外す`
                : `${exercise.name}を指導書に追加`
            }
            className={`h-[52px] flex-row items-center justify-center rounded-[14px] ${
              isSelected ? "border border-line bg-card" : "bg-navy"
            }`}
          >
            <Text
              className={`text-[15px] font-bold ${
                isSelected ? "text-ink2" : "text-white"
              }`}
            >
              {isSelected ? "✓ 選択中 — タップで外す" : "指導書に追加"}
            </Text>
          </Pressable>
        </View>
      </View>
      </View>
    </Modal>
  );
}

function IllustPane({
  source,
  caption,
}: {
  source: number;
  caption: string;
}) {
  return (
    <View className="h-full flex-1">
      <View className="flex-1 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-[#F4F6FA] p-2">
        <Image
          source={source}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
      <Text className="mt-1 text-center text-[11px] font-semibold text-navy">
        {caption}
      </Text>
    </View>
  );
}

function Tag({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "navy" | "teal";
}) {
  const bg =
    tone === "navy"
      ? "bg-[#EEF2F9]"
      : tone === "teal"
        ? "bg-teal-soft"
        : "bg-[#F1F5F9]";
  const fg =
    tone === "navy" ? "text-navy" : tone === "teal" ? "text-teal" : "text-ink2";
  return (
    <View className={`rounded-md px-2 py-0.5 ${bg}`}>
      <Text className={`text-[13px] font-semibold ${fg}`}>{label}</Text>
    </View>
  );
}

function DefaultCell({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-[10px] border border-line bg-[#FAFBFD] py-2">
      <Text className="text-[11px] font-semibold tracking-wide text-ink3">
        {label}
      </Text>
      <Text className="mt-0.5 text-[15px] font-bold text-ink">{value}</Text>
    </View>
  );
}
