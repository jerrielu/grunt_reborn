let registration: ServiceWorkerRegistration | null = null;
let updateCallback: (() => void) | null = null;
let updateAvailable = false;

export function initPWA(): void {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    try {
      registration = await navigator.serviceWorker.register("/sw.js");
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
