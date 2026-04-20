import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, Pressable, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useHepStore } from "../src/stores/hepStore";
import { ILLUSTRATIONS } from "../src/constants/illustrations";
import { Asset } from "expo-asset";
import { generateBodyHtml, PDF_STYLE } from "../src/utils/generateHtml";

export default function PrintScreen() {
  const { selectedExercises } = useHepStore();
  const router = useRouter();
  const [bodyHtml, setBodyHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "web") {
      router.replace("/");
      return;
    }
    if (selectedExercises.length === 0) {
      router.replace("/");
      return;
    }

    (async () => {
      const imageUris: Record<string, string> = {};
      for (const sel of selectedExercises) {
        const source = ILLUSTRATIONS[sel.exerciseId];
        if (source) {
          const asset = Asset.fromModule(source as number);
          await asset.downloadAsync();
          if (asset.localUri || asset.uri) {
            imageUris[sel.exerciseId] = asset.localUri || asset.uri;
          }
        }
      }
      const html = generateBodyHtml(selectedExercises, imageUris);
      setBodyHtml(html);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || !bodyHtml) return;
    // 印刷用スタイルをheadに追加
    const style = document.createElement("style");
    style.id = "print-page-style";
    style.textContent = `
      ${PDF_STYLE}
      @media print {
        #print-toolbar { display: none !important; }
        html, body, #root, #root > div, #root > div > div {
          display: block !important;
          height: auto !important;
          overflow: visible !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("print-page-style");
      if (el) el.remove();
    };
  }, [bodyHtml]);

  if (Platform.OS !== "web") return null;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0B2545" />
        <Text className="mt-4 text-base font-bold text-ink">指導書を準備中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* ツールバー */}
      <View id="print-toolbar" className="flex-row items-center justify-between bg-[#0B2545] px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base font-bold text-white">← 戻る</Text>
        </Pressable>
        <Pressable
          onPress={() => window.print()}
          className="rounded-lg bg-[#0EA5E9] px-4 py-2"
        >
          <Text className="text-sm font-bold text-white">印刷 / PDF保存</Text>
        </Pressable>
      </View>

      {/* 指導書HTML - Web専用のdivでレンダリング */}
      <PrintContent html={bodyHtml} />
    </View>
  );
}

function PrintContent({ html }: { html: string }) {
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.innerHTML = html;
    }
  }, [html]);

  return (
    // @ts-ignore - web-only ref callback with HTMLDivElement
    <div ref={ref} style={{ flex: 1, overflow: "auto", padding: 8, background: "#fff" }} />
  );
}
