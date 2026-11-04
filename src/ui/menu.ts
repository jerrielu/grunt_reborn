// Pixelated DOM menu overlay rendered on a low-res canvas (nearest-neighbor upscale)
export function showMenu(onStart: (generalId: string) => void): void {
  const root = document.getElementById("game")!;
  root.querySelectorAll(".overlay").forEach((e) => e.remove());

  const W = 180;
  const H = 390;

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#0a0a1e;z-index:10;overflow:hidden;";

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.style.cssText = "width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;cursor:pointer;";
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const generals = [
    { id: "shoucheng", label: "守成校尉（防御）" },
    { id: "vanguard", label: "先锋骑将（冲阵）" },
    { id: "summoner", label: "招魂将（召唤）" },
  ];

  const btnW = 140;
  const btnH = 22;
  const startX = Math.round((W - btnW) / 2);
  let y0 = 130;
  const rects: { id: string; x: number; y: number; w: number; h: number }[] = [];
  for (const g of generals) {
    rects.push({ id: g.id, x: startX, y: y0, w: btnW, h: btnH });
    y0 += 32;
  }

  let hovered = -1;

  function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0a0a1e";
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText("小兵重来", W / 2, 56);

    ctx.fillStyle = "#aaaacc";
    ctx.font = "8px monospace";
    ctx.fillText("选择武将开始闯关", W / 2, 78);

    rects.forEach((r, i) => {
      const g = generals[i];
      ctx.fillStyle = hovered === i ? "#4a4a8e" : "#2a2a4e";
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      ctx.fillStyle = "#ffffff";
      ctx.font = "8px monospace";
      ctx.fillText(g.label, r.x + r.w / 2, r.y + r.h / 2);
    });
  }

  draw();

  function toCanvas(e: { clientX: number; clientY: number }) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * W) / r.width,
      y: ((e.clientY - r.top) * H) / r.height,
    };
  }

  function hit(cx: number, cy: number): number {
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) return i;
    }
    return -1;
  }

  canvas.addEventListener("mousemove", (e) => {
    const { x, y } = toCanvas(e);
    const h = hit(x, y);
    if (h !== hovered) {
      hovered = h;
      draw();
    }
  });
  canvas.addEventListener("mouseleave", () => {
    if (hovered !== -1) {
      hovered = -1;
      draw();
    }
  });
  canvas.addEventListener("click", (e) => {
    const { x, y } = toCanvas(e);
    const i = hit(x, y);
    if (i >= 0) {
      overlay.remove();
      onStart(generals[i].id);
    }
  });
  canvas.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    const { x, y } = toCanvas(t);
    const i = hit(x, y);
    if (i >= 0) {
      overlay.remove();
      onStart(generals[i].id);
    }
  });

  overlay.appendChild(canvas);
  root.style.position = "relative";
  root.appendChild(overlay);
}