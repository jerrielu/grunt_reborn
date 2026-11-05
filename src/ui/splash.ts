import { mountScreen } from "./screen";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function runSplashScreen(): Promise<void> {
  const overlay = mountScreen(
    "splash",
    "display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0a0a14;color:#e8d9a8;font-family:monospace;"
  );

  const canvas = document.createElement("canvas");
  const cell = 6;
  const grid = [
    [1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 2],
    [1, 0, 0, 0, 0, 2],
    [1, 0, 0, 0, 0, 2],
    [1, 0, 0, 0, 0, 2],
    [1, 2, 2, 2, 2, 2],
  ];
  const colors = ["#c9a86a", "#f0e0b0", "#3a2410"];
  const size = grid.length * cell;
  canvas.width = size;
  canvas.height = size;
  canvas.style.cssText = `image-rendering:pixelated;width:${size * 2}px;height:${size * 2}px;margin-bottom:18px;opacity:0;transition:opacity 0.35s ease;`;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const v = grid[y][x];
      ctx.fillStyle = colors[v];
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  const name = document.createElement("div");
  name.textContent = "Pixel small";
  name.style.cssText =
    "font-size:22px;font-weight:bold;letter-spacing:4px;opacity:0;transition:opacity 0.35s ease;";

  overlay.append(canvas, name);

  // fade in
  requestAnimationFrame(() => {
    canvas.style.opacity = "1";
    name.style.opacity = "1";
  });

  await sleep(1500);

  // fade out
  canvas.style.opacity = "0";
  name.style.opacity = "0";
  await sleep(400);

  overlay.remove();
}
