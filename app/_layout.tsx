import "../global.css";
import { useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { Stack } from "expo-router";

export default function RootLayout() {
  const [isBackground, setIsBackground] = useState(false);

  useEffect(() => {
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
      </Stack>
      {isBackground && (
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-white" />
      )}
    </>
  );
}
