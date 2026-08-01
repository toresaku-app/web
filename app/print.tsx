import { useEffect } from "react";
import { View, Text, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useHepStore } from "../src/stores/hepStore";
import { ILLUSTRATIONS, START_ILLUSTRATIONS } from "../src/constants/illustrations";
import { Asset } from "expo-asset";
import { generateHtml } from "../src/utils/generateHtml";

export default function PrintScreen() {
  const { selectedExercises, sheetPurpose, orientation, includeCheckSheet } =
    useHepStore();
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
      const resolve = async (source: number): Promise<string | null> => {
        const asset = Asset.fromModule(source);
        await asset.downloadAsync();
        return asset.localUri || asset.uri || null;
      };

      const imageUris: Record<string, string> = {};
      const startImageUris: Record<string, string> = {};
      for (const sel of selectedExercises) {
        const source = ILLUSTRATIONS[sel.exerciseId];
        if (source) {
          const uri = await resolve(source);
          if (uri) imageUris[sel.exerciseId] = uri;
        }
        // 2枚化済みの運動のみ開始姿勢を追加（未生成の運動は1枚のまま）
        const startSource = START_ILLUSTRATIONS[sel.exerciseId];
        if (startSource) {
          const uri = await resolve(startSource);
          if (uri) startImageUris[sel.exerciseId] = uri;
        }
      }
      const html = generateHtml(selectedExercises, imageUris, {
        sheetPurpose,
        orientation,
        forScreen: true,
        includeCheckSheet,
        startImageUris,
      });

      const ua = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      const isAndroid = /Android/i.test(ua);
      const isMobile = isIOS || isAndroid;

      // 画面は A4 幅の viewport で描画され、端末幅に合わせて縮小表示される。
      // ツールバーはその縮小を打ち消さないと文字が極端に小さくなるため、逆数で拡大する。
      const pageWidth = orientation === "landscape" ? 1123 : 794;
      const screenWidth = Math.min(window.screen.width, window.screen.height);
      const k = isMobile ? Math.max(1, pageWidth / screenWidth) : 1;
      const px = (n: number) => Math.round(n * k);

      // 共有メニューの入口はOSで異なる（iOS Safari は「⋯」、Android Chrome は「⋮」）
      const printHint = isIOS
        ? "⋯ → 共有 → プリント"
        : "⋮ → 共有 → 印刷";
      const printButton = isMobile
        ? `<span style="color:#E2E8F0;font-size:${px(14)}px;font-weight:600;">${printHint}</span>`
        : `<button onclick="window.print()" style="color:#0B2545;background:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:14px;font-weight:bold;cursor:pointer;">印刷 / PDF保存</button>`;

      const toolbarH = px(26) + px(12) * 2;
      const wrappedHtml = html.replace(
        "</body>",
        `<div id="print-toolbar" style="position:fixed;top:0;left:0;right:0;z-index:10000;background:#0B2545;padding:${px(12)}px ${px(16)}px;display:flex;justify-content:space-between;align-items:center;gap:${px(12)}px;">
          <button onclick="window.location.href=window.location.pathname.replace('/print','/preview')" style="color:#fff;background:none;border:none;font-size:${px(16)}px;font-weight:bold;cursor:pointer;white-space:nowrap;">← 戻る</button>
          ${printButton}
        </div>
        <style>
          body { padding-top: ${toolbarH}px; -webkit-user-select: none; user-select: none; }
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
