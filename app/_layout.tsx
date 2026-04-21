import "../global.css";
import { useEffect, useState } from "react";
import { AppState, Platform, Pressable, Text, View, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";

function BackToLibrary() {
  const router = useRouter();
  const handleBack = () => {
    if (Platform.OS === "web") {
      if (window.confirm("運動ライブラリに戻りますか？")) {
        router.replace("/");
      }
    } else {
      Alert.alert("確認", "運動ライブラリに戻りますか？", [
        { text: "キャンセル", style: "cancel" },
        { text: "戻る", onPress: () => router.back() },
      ]);
    }
  };
  return (
    <Pressable onPress={handleBack} style={{ marginLeft: 4 }}>
      <Text style={{ fontSize: 16, color: "#0B2545", fontWeight: "600" }}>← 戻る</Text>
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
            title: "指導書プレビュー",
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
