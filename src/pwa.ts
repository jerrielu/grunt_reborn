let registration: ServiceWorkerRegistration | null = null;
let updateCallback: (() => void) | null = null;
let updateAvailable = false;

export function initPWA(): void {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    try {
      registration = await navigator.serviceWorker.register("/sw.js");
      // Pick up an update that is already waiting (safety net).
      if (registration.waiting && navigator.serviceWorker.controller) {
        if (updateCallback) {
          updateCallback();
        } else {
          updateAvailable = true;
        }
      }
      registration.addEventListener("updatefound", () => {
        const worker = registration?.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            if (updateCallback) {
              updateCallback();
            } else {
              updateAvailable = true;
            }
          }
        });
      });
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    } catch {
      // ignore
    }
  });
}

export function setUpdateHandler(handler: (() => void) | null): void {
  updateCallback = handler;
  if (handler && updateAvailable) {
    updateAvailable = false;
    handler();
  }
}

export function applyUpdate(): void {
  registration?.waiting?.postMessage("SKIP_WAITING");
}

export async function forceUpdatePWA(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const reg = registration ?? (await navigator.serviceWorker.getRegistration().catch(() => undefined));
      if (reg) {
        await reg.update().catch(() => undefined);
        if (reg.waiting) {
          reg.waiting.postMessage("SKIP_WAITING");
          return;
        }
        if (reg.installing) {
          const worker = reg.installing;
          await new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, 5000);
            worker.addEventListener("statechange", () => {
              if (worker.state === "installed" && reg.waiting) {
                clearTimeout(timer);
                reg.waiting.postMessage("SKIP_WAITING");
                resolve();
              }
            });
          });
          return;
        }
      }
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // ignore
  }
  window.location.reload();
}
