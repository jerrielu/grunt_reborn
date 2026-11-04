// Pixelated DOM menu overlay rendered on a low-res canvas (nearest-neighbor upscale)
export function showMenu(onStart: (generalId: string) => void): void {
  const root = document.getElementById("game")!;
  root.querySelectorAll(".overlay").forEach((e) => e.remove());

  const W = 360;
  const H = 780;

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

  const btnW = 150;
  const btnH = 28;
  const startX = Math.round((W - btnW) / 2);
  let y0 = 200;
  const rects: { id: string; x: number; y: number; w: number; h: number }[] = [];
  for (const g of generals) {
    rects.push({ id: g.id, x: startX, y: y0, w: btnW, h: btnH });
    y0 += 40;
  }

  let hovered = -1;

  function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0a0a1e";
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    rects.forEach((r, i) => {
      const g = generals[i];
      ctx.fillStyle = hovered === i ? "#4a4a8e" : "#2a2a4e";
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    });

    // Render text to an offscreen buffer then threshold alpha so glyphs become
    // crisp pixel blocks (no anti-aliasing mud) when scaled with nearest-neighbor.
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const octx = off.getContext("2d")!;
    octx.imageSmoothingEnabled = false;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.clearRect(0, 0, W, H);

    octx.fillStyle = "#ffffff";
    octx.font = "bold 44px monospace";
    octx.fillText("小兵重来", W / 2, 104);

    octx.fillStyle = "#aaaacc";
    octx.font = "22px monospace";
    octx.fillText("选择武将开始闯关", W / 2, 160);

    rects.forEach((r, i) => {
      const g = generals[i];
      octx.fillStyle = "#ffffff";
      octx.font = "bold 11px monospace";
      octx.fillText(g.label, r.x + r.w / 2, r.y + r.h / 2);
    });

    const img = octx.getImageData(0, 0, W, H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 128) {
        d[i + 3] = 255;
      } else {
        d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 0;
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0);
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