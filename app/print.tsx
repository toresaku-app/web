import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { useHepStore } from "../src/stores/hepStore";
import { ILLUSTRATIONS } from "../src/constants/illustrations";
import { Asset } from "expo-asset";
import { generateBodyHtml, PDF_STYLE } from "../src/utils/generateHtml";

export default function PrintScreen() {
  const { selectedExercises } = useHepStore();
  const router = useRouter();
  const [bodyHtml, setBodyHtml] = useState<string>("");

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
    })();
  }, []);

  if (Platform.OS !== "web" || !bodyHtml) return null;

  return (
    // @ts-ignore - web-only HTML rendering
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div
        id="print-toolbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10000,
          background: "#0B2545",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            color: "#fff",
            background: "none",
            border: "none",
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ← 戻る
        </button>
        <span style={{ color: "#fff", fontSize: 14 }}>
          ブラウザの共有→プリントでPDF保存
        </span>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ${PDF_STYLE}
            @media print {
              #print-toolbar { display: none !important; }
            }
          `,
        }}
      />
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </div>
  );
}
