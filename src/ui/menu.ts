// Pixelated DOM menu overlay rendered on a low-res canvas (nearest-neighbor upscale)
import { GameController } from "../game";
import { CARDS } from "../config/cards";
import { UNLOCKS } from "../config/unlocks";
import { openDeckBuilder } from "./deckBuilder";

export function showMenu(controller: GameController, onStart: (generalId: string) => void): void {
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

  const allGenerals = [
    { id: "shoucheng", label: "守成校尉（防御）" },
    { id: "vanguard", label: "先锋骑将（冲阵）" },
    { id: "summoner", label: "招魂将（召唤）" },
  ];

  let screen: "main" | "generals" | "cards" = "main";
  let hovered = -1;
  let hoveredBack = false;

  const btnW = 200;
  const btnH = 32;
  const btnX = Math.round((W - btnW) / 2);

  const mainRects = [
    { id: "start", label: "开始游戏", x: btnX, y: 260, w: btnW, h: btnH },
    { id: "cards", label: "卡牌构筑", x: btnX, y: 312, w: btnW, h: btnH },
  ];

  let generalRects: { id: string; x: number; y: number; w: number; h: number }[] = [];
  const cardRects: { id: string; x: number; y: number; w: number; h: number }[] = [];

  const backRect = { x: Math.round((W - 120) / 2), y: H - 60, w: 120, h: 28 };

  function rebuildGeneralRects() {
    const unlocked = controller.meta.state.unlockedGenerals;
    const gens = allGenerals.filter((g) => unlocked.includes(g.id));
    const bw = 200, bh = 28, sx = Math.round((W - bw) / 2);
    let y0 = 200;
    generalRects = [];
    for (const g of gens) {
      generalRects.push({ id: g.id, x: sx, y: y0, w: bw, h: bh });
      y0 += 40;
    }
  }

  function rebuildCardRects() {
    cardRects.length = 0;
    const rowH = 30;
    const startY = 150;
    const x = 20, w = W - 40;
    CARDS.forEach((c, i) => {
      cardRects.push({ id: c.id, x, y: startY + i * rowH, w, h: 24 });
    });
  }

  rebuildGeneralRects();
  rebuildCardRects();

  function currentRects(): { id: string; x: number; y: number; w: number; h: number }[] {
    if (screen === "main") return mainRects;
    if (screen === "generals") return generalRects;
    return cardRects;
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0a0a1e";
    ctx.fillRect(0, 0, W, H);

    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const octx = off.getContext("2d")!;
    octx.imageSmoothingEnabled = false;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.clearRect(0, 0, W, H);

    const rects = currentRects();

    octx.fillStyle = "#ffffff";
    octx.font = "bold 44px monospace";
    if (screen === "main") octx.fillText("小兵重来", W / 2, 104);
    else if (screen === "generals") octx.fillText("选择武将", W / 2, 104);
    else octx.fillText("卡牌构筑", W / 2, 104);

    if (screen === "main") {
      octx.fillStyle = "#aaaacc";
      octx.font = "20px monospace";
      octx.fillText("轮回积分: " + controller.meta.state.points, W / 2, 160);
    } else if (screen === "generals") {
      octx.fillStyle = "#aaaacc";
      octx.font = "20px monospace";
      octx.fillText("选择武将开始闯关", W / 2, 160);
    } else {
      octx.fillStyle = "#aaaacc";
      octx.font = "16px monospace";
      octx.fillText("积分: " + controller.meta.state.points + "  点击锁定卡牌解锁", W / 2, 134);
    }

    rects.forEach((r, i) => {
      const isHover = hovered === i;
      ctx.fillStyle = isHover ? "#4a4a8e" : "#2a2a4e";
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    });

    if (screen === "cards") {
      cardRects.forEach((r, i) => {
        const c = CARDS[i];
        const unlocked = controller.meta.state.unlockedCards.includes(c.id);
        const isHover = hovered === i;
        ctx.fillStyle = isHover ? "#3a3a6e" : "#1e1e3e";
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = unlocked ? "#66cc66" : "#888888";
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      });
    }

    rects.forEach((r, i) => {
      octx.fillStyle = "#ffffff";
      octx.font = "bold 11px monospace";
      if (screen === "generals") {
        const gens = allGenerals.filter((gg) => controller.meta.state.unlockedGenerals.includes(gg.id));
        const g = gens[i];
        octx.fillText(g.label, r.x + r.w / 2, r.y + r.h / 2);
      } else if (screen === "main") {
        octx.font = "bold 13px monospace";
        octx.fillText(r.id === "start" ? "开始游戏" : "卡牌构筑", r.x + r.w / 2, r.y + r.h / 2);
      } else {
        const c = CARDS[i];
        const unlocked = controller.meta.state.unlockedCards.includes(c.id);
        octx.textAlign = "left";
        octx.font = "bold 10px monospace";
        octx.fillStyle = "#ffffff";
        octx.fillText(c.name, r.x + 6, r.y + r.h / 2);
        octx.textAlign = "right";
        octx.font = "9px monospace";
        octx.fillStyle = unlocked ? "#66cc66" : "#ffaa66";
        const unlockDef = UNLOCKS.find((u) => u.id === c.id);
        const cost = unlockDef ? unlockDef.cost : 0;
        octx.fillText(unlocked ? "已解锁" : (cost + "积分"), r.x + r.w - 6, r.y + r.h / 2);
        octx.textAlign = "center";
      }
    });

    const isBackHover = hoveredBack;
    if (screen !== "main") {
      ctx.fillStyle = isBackHover ? "#4a4a8e" : "#2a2a4e";
      ctx.fillRect(backRect.x, backRect.y, backRect.w, backRect.h);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(backRect.x + 0.5, backRect.y + 0.5, backRect.w - 1, backRect.h - 1);
      octx.fillStyle = "#ffffff";
      octx.font = "bold 11px monospace";
      octx.textAlign = "center";
      octx.fillText("返回", backRect.x + backRect.w / 2, backRect.y + backRect.h / 2);
    }

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

  function hitRects(cx: number, cy: number): number {
    const rects = currentRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) return i;
    }
    return -1;
  }

  function hitBack(cx: number, cy: number): boolean {
    if (screen === "main") return false;
    const r = backRect;
    return cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h;
  }

  function refresh() {
    rebuildGeneralRects();
    rebuildCardRects();
    draw();
  }

  canvas.addEventListener("mousemove", (e) => {
    const { x, y } = toCanvas(e);
    const h = hitRects(x, y);
    const hb = hitBack(x, y);
    if (h !== hovered || hb !== hoveredBack) {
      hovered = h;
      hoveredBack = hb;
      draw();
    }
  });
  canvas.addEventListener("mouseleave", () => {
    if (hovered !== -1 || hoveredBack) {
      hovered = -1;
      hoveredBack = false;
      draw();
    }
  });

  function handleSelect(i: number) {
    if (screen === "main") {
      if (i === 0) { screen = "generals"; hovered = -1; refresh(); }
      else if (i === 1) { openDeckBuilder(controller); }
    } else if (screen === "generals") {
      const gens = allGenerals.filter((gg) => controller.meta.state.unlockedGenerals.includes(gg.id));
      const g = gens[i];
      if (g) {
        overlay.remove();
        onStart(g.id);
      }
    } else if (screen === "cards") {
      const c = CARDS[i];
      if (!c) return;
      const unlocked = controller.meta.state.unlockedCards.includes(c.id);
      if (!unlocked) {
        const def = UNLOCKS.find((u) => u.id === c.id);
        if (def) {
          const ok = controller.buyUnlock(def.id);
          if (ok) refresh();
        }
      }
    }
  }

  canvas.addEventListener("click", (e) => {
    const { x, y } = toCanvas(e);
    if (hitBack(x, y)) {
      if (screen !== "main") {
        screen = "main";
        hovered = -1;
        hoveredBack = false;
        refresh();
      }
      return;
    }
    const i = hitRects(x, y);
    if (i >= 0) handleSelect(i);
  });
  canvas.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    const { x, y } = toCanvas(t);
    if (hitBack(x, y)) {
      if (screen !== "main") {
        screen = "main";
        hovered = -1;
        hoveredBack = false;
        refresh();
      }
      return;
    }
    const i = hitRects(x, y);
    if (i >= 0) handleSelect(i);
  });

  overlay.appendChild(canvas);
  root.style.position = "relative";
  root.appendChild(overlay);
}
