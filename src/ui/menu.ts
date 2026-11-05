// Pixelated DOM menu overlay rendered on a low-res canvas (nearest-neighbor upscale)
import { GameController } from "../game";
import { CARDS, getCard } from "../config/cards";
import { UNLOCKS } from "../config/unlocks";
import { openDeckBuilder } from "./deckBuilder";
import { openSettings } from "./settings";
import { setUpdateHandler, applyUpdate } from "../pwa";
import { gameRoot, mountScreen } from "./screen";
import { renderCardCanvas } from "../sprites/cardSprite";

declare const __APP_VERSION__: string;

const GACHA_POOL = CARDS.map((c) => c.id);
function gachaName(id: string): string { return getCard(id)?.name ?? id; }

export function showMenu(controller: GameController, onStart: (generalId: string) => void): void {
  gameRoot().querySelectorAll(".overlay").forEach((e) => e.remove());

  const W = 360;
  const H = 780;

  const overlay = mountScreen("overlay", "z-index:10;display:flex;align-items:center;justify-content:center;background:#1a1408;overflow:hidden;");

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

  let screen: "main" | "generals" | "cards" | "gacha" = "main";
  let hovered = -1;
  let hoveredBack = false;

  const btnW = 200;
  const btnH = 32;
  const btnX = Math.round((W - btnW) / 2);

  const mainRects = [
    { id: "start", label: "开始游戏", x: btnX, y: 240, w: btnW, h: btnH },
    { id: "gacha", label: "抽卡", x: btnX, y: 292, w: btnW, h: btnH },
    { id: "cards", label: "卡牌构筑", x: btnX, y: 344, w: btnW, h: btnH },
    { id: "settings", label: "设置", x: btnX, y: 396, w: btnW, h: btnH },
  ];

  let generalRects: { id: string; x: number; y: number; w: number; h: number }[] = [];
  const cardRects: { id: string; x: number; y: number; w: number; h: number }[] = [];
  const gachaRects: { id: string; x: number; y: number; w: number; h: number }[] = [
    { id: "draw1", x: Math.round((W - 240) / 2), y: 200, w: 110, h: 32 },
    { id: "draw10", x: Math.round((W - 240) / 2) + 130, y: 200, w: 110, h: 32 },
  ];
  let gachaResults: string[] = [];
  let gachaAnimating = false;
  let gachaAnimStart = 0;

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
    if (screen === "gacha") return gachaRects;
    return cardRects;
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#1a1408";
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

    octx.fillStyle = "#e8d9a8";
    octx.font = "bold 44px monospace";
    if (screen === "main") octx.fillText("小兵重来", W / 2, 104);
    else if (screen === "generals") octx.fillText("选择武将", W / 2, 104);
    else if (screen === "gacha") octx.fillText("抽卡", W / 2, 104);
    else octx.fillText("卡牌构筑", W / 2, 104);

    if (screen === "main") {
      octx.fillStyle = "#c9a86a";
      octx.font = "20px monospace";
      octx.fillText("轮回积分: " + controller.meta.state.points, W / 2, 160);
    } else if (screen === "generals") {
      octx.fillStyle = "#c9a86a";
      octx.font = "20px monospace";
      octx.fillText("选择武将开始闯关", W / 2, 160);
    } else if (screen === "gacha") {
      octx.fillStyle = "#c9a86a";
      octx.font = "16px monospace";
      octx.fillText("轮回积分: " + controller.meta.state.points, W / 2, 134);
      octx.fillText("点击按钮抽卡", W / 2, 160);
    } else {
      octx.fillStyle = "#c9a86a";
      octx.font = "16px monospace";
      octx.fillText("积分: " + controller.meta.state.points + "  点击锁定卡牌解锁", W / 2, 134);
    }

    rects.forEach((r, i) => {
      const isHover = hovered === i;
      ctx.fillStyle = isHover ? "#5a3a1a" : "#3a2410";
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = "#c9a86a";
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    });

    if (screen === "cards") {
      cardRects.forEach((r, i) => {
        const c = CARDS[i];
        const unlocked = controller.meta.state.unlockedCards.includes(c.id);
        const isHover = hovered === i;
        ctx.fillStyle = isHover ? "#3a2410" : "#2a1a0a";
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = unlocked ? "#c9a86a" : "#888888";
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      });
    }

    rects.forEach((r, i) => {
      octx.fillStyle = "#e8d9a8";
      octx.font = "bold 11px monospace";
      if (screen === "generals") {
        const gens = allGenerals.filter((gg) => controller.meta.state.unlockedGenerals.includes(gg.id));
        const g = gens[i];
        octx.fillText(g.label, r.x + r.w / 2, r.y + r.h / 2);
      } else if (screen === "main") {
        octx.font = "bold 13px monospace";
         const mainLabels: Record<string,string> = { start: "开始游戏", gacha: "抽卡", cards: "卡牌构筑", settings: "设置" };
        octx.fillText(mainLabels[r.id] ?? r.id, r.x + r.w / 2, r.y + r.h / 2);
      } else if (screen === "gacha") {
        octx.font = "bold 12px monospace";
        const gLabels: Record<string,string> = { draw1: "抽一次", draw10: "抽十次" };
        octx.fillText(gLabels[r.id] ?? r.id, r.x + r.w / 2, r.y + r.h / 2);
      } else {
        const c = CARDS[i];
        const unlocked = controller.meta.state.unlockedCards.includes(c.id);
        octx.textAlign = "left";
        octx.font = "bold 10px monospace";
        octx.fillStyle = "#e8d9a8";
        octx.fillText(c.name, r.x + 6, r.y + r.h / 2);
        octx.textAlign = "right";
        octx.font = "9px monospace";
        octx.fillStyle = unlocked ? "#c9a86a" : "#ffaa66";
        const unlockDef = UNLOCKS.find((u) => u.id === c.id);
        const cost = unlockDef ? unlockDef.cost : 0;
        octx.fillText(unlocked ? "已解锁" : (cost + "积分"), r.x + r.w - 6, r.y + r.h / 2);
        octx.textAlign = "center";
      }
    });

    const isBackHover = hoveredBack;
    if (screen !== "main") {
      ctx.fillStyle = isBackHover ? "#5a3a1a" : "#3a2410";
      ctx.fillRect(backRect.x, backRect.y, backRect.w, backRect.h);
      ctx.strokeStyle = "#c9a86a";
      ctx.lineWidth = 1;
      ctx.strokeRect(backRect.x + 0.5, backRect.y + 0.5, backRect.w - 1, backRect.h - 1);
      octx.fillStyle = "#e8d9a8";
      octx.font = "bold 11px monospace";
      octx.textAlign = "center";
      octx.fillText("返回", backRect.x + backRect.w / 2, backRect.y + backRect.h / 2);
    }

    if (screen === "main") {
      octx.textAlign = "left";
      octx.textBaseline = "bottom";
      octx.fillStyle = "#ffffff";
      octx.font = "9px monospace";
      octx.fillText("v" + __APP_VERSION__, 6, H - 4);
      octx.textAlign = "center";
      octx.textBaseline = "middle";
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

    if (screen === "gacha" && gachaResults.length > 0) {
      const t = gachaAnimating ? (performance.now() - gachaAnimStart) : 999999;
      const n = gachaResults.length;
      const cols = n === 1 ? 1 : 5;
      const rows = n === 1 ? 1 : 2;
      const cardW = n === 1 ? 192 : 60;
      const cardH = n === 1 ? 288 : 90;
      const gapX = n === 1 ? 0 : 10;
      const gapY = n === 1 ? 0 : 14;
      const totalW = cols * cardW + (cols - 1) * gapX;
      const totalH = rows * cardH + (rows - 1) * gapY;
      const startX = Math.round((W - totalW) / 2);
      const startY = 250;
      const stagger = n === 1 ? 0 : 120;
      const dur = 420;
      gachaResults.forEach((id, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (cardW + gapX);
        const y = startY + row * (cardH + gapY);
        const delay = i * stagger;
        const prog = Math.min(1, Math.max(0, (t - delay) / dur));
        const ease = 1 - Math.pow(1 - prog, 3);
        const scale = 0.15 + 0.85 * ease;
        const alpha = Math.min(1, prog * 1.5);
        if (prog > 0) {
          ctx.save();
          ctx.globalAlpha = 0.45 * alpha;
          ctx.fillStyle = "#ffd700";
          ctx.fillRect(x - 5, y - 5, cardW + 10, cardH + 10);
          ctx.restore();
        }
        const cardCanvas = renderCardCanvas(id, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        const cx = x + cardW / 2;
        const cy = y + cardH / 2;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cardCanvas, -cardW / 2, -cardH / 2, cardW, cardH);
        ctx.restore();
        if (prog >= 0.75) {
          ctx.fillStyle = "#e8d9a8";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.fillText(gachaName(id), cx, y + cardH + 12);
        }
      });
    }
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

  function startGachaDraw(count: number) {
    gachaResults = [];
    for (let i = 0; i < count; i++) {
      const id = GACHA_POOL[Math.floor(Math.random() * GACHA_POOL.length)];
      gachaResults.push(id);
      controller.meta.unlockCard(id);
      controller.meta.state.deck.push(id);
    }
    controller.meta.persist();
    gachaAnimStart = performance.now();
    gachaAnimating = true;
    const total = count === 1 ? 500 : 10 * 110 + 500;
    const loop = () => {
      if (!gachaAnimating) return;
      draw();
      if (performance.now() - gachaAnimStart < total) requestAnimationFrame(loop);
      else { gachaAnimating = false; draw(); }
    };
    requestAnimationFrame(loop);
  }

  function handleSelect(i: number) {
    if (screen === "main") {
      const r = mainRects[i];
      if (!r) return;
      if (r.id === "start") { screen = "generals"; hovered = -1; refresh(); }
      else if (r.id === "gacha") { screen = "gacha"; gachaResults = []; gachaAnimating = false; hovered = -1; refresh(); }
      else if (r.id === "cards") { openDeckBuilder(controller); }
      else if (r.id === "settings") { openSettings(controller); }
    } else if (screen === "generals") {
      const gens = allGenerals.filter((gg) => controller.meta.state.unlockedGenerals.includes(gg.id));
      const g = gens[i];
      if (g) {
        overlay.remove();
        onStart(g.id);
      }
    } else if (screen === "gacha") {
      if (gachaAnimating) return;
      const r = gachaRects[i];
      if (!r) return;
      if (r.id === "draw1") startGachaDraw(1);
      else if (r.id === "draw10") startGachaDraw(10);
    } else if (screen === "cards") {
      const c = CARDS[i];
      if (!c) return;
      const unlocked = controller.meta.state.unlockedCards.includes(c.id);
      if (!unlocked) {
        controller.meta.unlockCard(c.id);
        controller.meta.persist();
        refresh();
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

  setUpdateHandler(() => {
    applyUpdate();
  });
  overlay.appendChild(canvas);
}
