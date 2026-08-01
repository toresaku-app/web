import "../global.css";
import { useEffect, useState } from "react";
import { AppState, Platform, Pressable, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";

function BackToLibrary() {
  const router = useRouter();
  // 選択内容はストアに保持されるため確認は不要（戻っても失われない）
  const handleBack = () => {
    if (Platform.OS === "web") {
      router.replace("/");
    } else {
      router.back();
    }
  };
  return (
    <Pressable
      onPress={handleBack}
      accessibilityRole="button"
      accessibilityLabel="運動ライブラリに戻る"
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={{ marginLeft: 4 }}
    >
      <Text style={{ fontSize: 20, color: "#0B2545" }}>←</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  const [isBackground, setIsBackground] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = AppState.addEventListener("change", (state) => {
      setIsBackground(state !== "active");
    });
    return () => sub.remove();
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#0F172A",
          headerTitleStyle: { fontWeight: "bold" },
          headerShadowVisible: false,
          headerBackTitle: "戻る",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="preview"
          options={{
            title: "内容を調整",
            headerLeft: () => <BackToLibrary />,
          }}
        />
        <Stack.Screen name="print" options={{ headerShown: false }} />
      </Stack>
      {isBackground && (
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-white" />
      )}
    </>
  );
}
