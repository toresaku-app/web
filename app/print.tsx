import { useEffect } from "react";
import { View, Text, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useHepStore } from "../src/stores/hepStore";
import { ILLUSTRATIONS } from "../src/constants/illustrations";
import { Asset } from "expo-asset";
import { generateHtml } from "../src/utils/generateHtml";

export default function PrintScreen() {
  const { selectedExercises } = useHepStore();
  const router = useRouter();

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
          const asset = Asset.fromModule(source);
          await asset.downloadAsync();
          if (asset.localUri || asset.uri) {
            imageUris[sel.exerciseId] = asset.localUri || asset.uri;
          }
        }
      }
      const html = generateHtml(selectedExercises, imageUris);
      // 戻るボタンを追加したHTMLに書き換え
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      const printButton = isMobile
        ? `<span style="color:#94A3B8;font-size:13px;">共有 → プリントでPDF保存</span>`
        : `<button onclick="window.print()" style="color:#fff;background:#0EA5E9;border:none;border-radius:8px;padding:8px 16px;font-size:14px;font-weight:bold;cursor:pointer;">印刷 / PDF保存</button>`;
      const wrappedHtml = html.replace(
        "</body>",
        `<div id="print-toolbar" style="position:fixed;top:0;left:0;right:0;z-index:10000;background:#0B2545;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
          <button onclick="window.location.href=window.location.pathname.replace('/print','/preview')" style="color:#fff;background:none;border:none;font-size:16px;font-weight:bold;cursor:pointer;">← 戻る</button>
          ${printButton}
        </div>
        <style>
          body { padding-top: 52px; -webkit-user-select: none; user-select: none; }
          @media print { #print-toolbar { display: none !important; } body { padding-top: 0; } }
        </style>
        <script>
          document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
          document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); }
          });
        </script>
        </body>`
      );
      document.open();
      document.write(wrappedHtml);
      document.close();
    })();
  }, []);

  // ローディング表示（document.writeで上書きされるまで）
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-base font-bold text-ink">指導書を準備中...</Text>
    </View>
  );
}
