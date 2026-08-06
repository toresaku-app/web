// LP 用スクショ撮影スクリプト。
// ヘッドレス Chrome を CDP で操作し、Web 版アプリの画面を PNG で撮る。
//
//   npx expo start --web --port 8081     # 別ターミナルで先に起動しておく
//   node scripts/shoot-lp-screenshots.cjs
//
// 撮る画面と操作手順は scripts/lp-shots.json に定義する。
// 出力先は scripts/.lp-shots-out/。WebP 化と差し替えは手動（docs/dev-notes.md 参照）。
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9222;
const URL = "http://localhost:8081/";
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, ".lp-shots-out");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function getJSON(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port: PORT, path }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    }).on("error", reject);
  });
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    return r.result && r.result.value;
  }
}

async function main() {
  const args = [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--user-data-dir=" + path.join(OUT, "chrome-profile"),
    "about:blank",
  ];
  fs.mkdirSync(OUT, { recursive: true });
  const chrome = spawn(CHROME, args, { stdio: "ignore" });
  await wait(3000);

  const targets = await getJSON("/json/list");
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 });
  await new Promise((r) => ws.on("open", r));
  const cdp = new CDP(ws);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  const shots = JSON.parse(fs.readFileSync(path.join(__dirname, "lp-shots.json"), "utf8"));

  for (const shot of shots) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: shot.width,
      height: shot.height,
      deviceScaleFactor: shot.scale || 2,
      mobile: !!shot.mobile,
    });
    await cdp.send("Page.navigate", { url: URL });
    await wait(3000);
    // 前ショットの選択状態が persist で残るので毎回クリアしてから撮る
    await cdp.evaluate("try{localStorage.clear();sessionStorage.clear();}catch(e){}; 'cleared'");
    await cdp.send("Page.navigate", { url: URL });
    await wait(shot.settle || 7000);

    for (const step of shot.steps || []) {
      const out = await cdp.evaluate(step.js);
      console.log("  step ->", JSON.stringify(out));
      await wait(step.wait || 1200);
    }

    if (shot.gotoAfter) {
      await cdp.send("Page.navigate", { url: "http://localhost:8081" + shot.gotoAfter });
      await wait(shot.afterSettle || 6000);
      for (const step of shot.afterSteps || []) {
        const out = await cdp.evaluate(step.js);
        console.log("  after ->", JSON.stringify(out));
        await wait(step.wait || 1200);
      }
    }

    const { data } = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync(`${OUT}/${shot.name}.png`, Buffer.from(data, "base64"));
    console.log("captured", shot.name, shot.width + "x" + shot.height + "@" + (shot.scale || 2));
  }

  ws.close();
  chrome.kill();
}

main().catch((e) => {
  console.error("FAIL", e);
  process.exit(1);
});
