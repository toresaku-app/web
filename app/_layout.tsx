import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}
