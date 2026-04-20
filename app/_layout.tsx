import "../global.css";
import { useEffect, useState } from "react";
import { AppState, Platform, View } from "react-native";
import { Stack } from "expo-router";

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
        <Stack.Screen name="preview" options={{ title: "指導書プレビュー" }} />
        <Stack.Screen name="print" options={{ headerShown: false }} />
      </Stack>
      {isBackground && (
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-white" />
      )}
    </>
  );
}
