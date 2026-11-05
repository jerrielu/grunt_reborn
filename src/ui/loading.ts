import { mountScreen } from "./screen";

const RESOURCES = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

export async function runLoadingScreen(): Promise<void> {
  const overlay = mountScreen("loading", "display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a1408;color:#e8d9a8;font-family:monospace;");

  const title = document.createElement("div");
  title.textContent = "小兵重来";
  title.style.cssText = "font-size:28px;font-weight:bold;margin-bottom:32px;letter-spacing:2px;";

  const barWrap = document.createElement("div");
  barWrap.style.cssText = "width:60%;max-width:240px;height:10px;background:#3a2410;border:1px solid #c9a86a;overflow:hidden;";
  const bar = document.createElement("div");
  bar.style.cssText = "height:100%;width:0%;background:#c9a86a;transition:width 0.15s linear;";
  barWrap.appendChild(bar);

  const status = document.createElement("div");
  status.style.cssText = "margin-top:14px;font-size:12px;color:#c9a86a;";
  status.textContent = "准备加载...";

  overlay.append(title, barWrap, status);

  const setProgress = (p: number, text?: string) => {
    bar.style.width = `${Math.max(0, Math.min(100, p))}%`;
    if (text) status.textContent = text;
  };

  // Service worker registration + auto-update (no confirmation)
  if ("serviceWorker" in navigator) {
    try {
      status.textContent = "检查更新...";
      const reg = await navigator.serviceWorker.register("/sw.js");
      await reg.update().catch(() => undefined);
      const waitForControllerChange = () =>
        new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 4000);
          navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => { clearTimeout(timer); resolve(); },
            { once: true }
          );
        });
      if (reg.waiting) {
        status.textContent = "更新到最新版本...";
        setProgress(5, "更新到最新版本...");
        reg.waiting.postMessage("SKIP_WAITING");
        await waitForControllerChange();
        location.reload();
        await new Promise(() => {});
      }
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && reg.waiting) {
            reg.waiting.postMessage("SKIP_WAITING");
          }
        });
      });
    } catch {
      // ignore
    }
  }

  // Load PWA resources with progress
  let done = 0;
  const total = RESOURCES.length;
  for (const url of RESOURCES) {
    status.textContent = `加载资源 ${done + 1}/${total}`;
    try {
      const res = await fetch(url, { cache: "reload" });
      await res.blob().catch(() => undefined);
    } catch {
      // ignore individual failures
    }
    done++;
    setProgress(Math.round((done / total) * 100), `加载资源 ${done}/${total}`);
  }

  setProgress(100, "加载完成");
  await new Promise((r) => setTimeout(r, 300));
  overlay.remove();
}