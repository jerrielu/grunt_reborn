import type { BattleSim } from "../core/battle/BattleSim";
import { getCard } from "../config/cards";
import { renderCardCanvas } from "../sprites/cardSprite";

export function attachHandPanel(sim: BattleSim, onReward: (cardId: string) => void): void {
  const root = document.getElementById("game")!;

  // remove any leftover panel from a previous run
  document.getElementById("hand-panel")?.remove();

  const panel = document.createElement("div");
  panel.id = "hand-panel";
  panel.style.cssText = "position:absolute;left:0;right:0;bottom:0;height:10%;background:linear-gradient(180deg,#5a3a1a 0%,#3a2410 100%);color:#fff;font-family:monospace;z-index:9;display:flex;align-items:center;justify-content:space-between;padding:4px 8px;box-sizing:border-box;border-top:2px solid #2a1a08;overflow:visible;";
  root.appendChild(panel);

  // desk texture lines
  const desk = document.createElement("div");
  desk.style.cssText = "position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.04) 0 2px,transparent 2px 12px);";
  panel.appendChild(desk);

  const handArea = document.createElement("div");
  handArea.style.cssText = "position:relative;flex:0 0 80%;display:flex;align-items:flex-end;justify-content:flex-start;height:100%;overflow:visible;";
  panel.appendChild(handArea);

  const deckArea = document.createElement("div");
  deckArea.style.cssText = "position:relative;flex:0 0 20%;height:100%;display:flex;align-items:center;justify-content:center;";
  panel.appendChild(deckArea);

  let preview: HTMLElement | null = null;

  function closePreview() {
    if (preview) { preview.remove(); preview = null; }
  }

  function showPreview(defId: string) {
    closePreview();
    const def = getCard(defId);
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:12;";
    const card = document.createElement("div");
    card.style.cssText = "display:flex;flex-direction:column;align-items:center;";
    const canvas = renderCardCanvas(defId);
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.cssText = "width:192px;height:288px;image-rendering:pixelated;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.8);";
    card.appendChild(img);
    const label = document.createElement("div");
    label.style.cssText = "margin-top:6px;font-size:12px;color:#fff;text-align:center;";
    label.textContent = def ? def.name + " — " + def.description : defId;
    card.appendChild(label);
    overlay.appendChild(card);
    overlay.onclick = closePreview;
    root.appendChild(overlay);
    preview = overlay;
  }

  function makeCard(defId: string): HTMLElement {
    const def = getCard(defId);
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:grab;touch-action:none;user-select:none;margin:0;";
    const canvas = renderCardCanvas(defId);
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.cssText = "width:62px;height:94px;image-rendering:pixelated;border:1px solid #333;box-shadow:0 2px 4px rgba(0,0,0,0.5);pointer-events:none;";
    wrap.appendChild(img);

    // gesture: slide up to play
    let startY = 0;
    let moved = false;
    wrap.addEventListener("pointerdown", (e) => {
      startY = e.clientY;
      moved = false;
      wrap.setPointerCapture(e.pointerId);
      (wrap as any)._origZ = wrap.style.zIndex;
      wrap.style.zIndex = "100";
    });
    wrap.addEventListener("pointermove", (e) => {
      if (e.clientY < startY - 10) moved = true;
      if (moved) {
        wrap.style.transform = `translateY(${e.clientY - startY}px)`;
      }
    });
    wrap.addEventListener("pointerup", (e) => {
      const dy = e.clientY - startY;
      wrap.style.transform = "";
      wrap.style.zIndex = (wrap as any)._origZ ?? "";
      if (dy < -40) {
        playCardWithEffect(defId, wrap);
      } else {
        showPreview(defId);
      }
    });

    function playCardWithEffect(cardId: string, source: HTMLElement): void {
      if ((source as any)._playing) return;
      (source as any)._playing = true;
      const def = getCard(cardId);
      const rootRect = root.getBoundingClientRect();
      const srcRect = source.getBoundingClientRect();
      const float = document.createElement("div");
      float.style.cssText = "position:absolute;z-index:20;pointer-events:none;display:flex;flex-direction:column;align-items:center;";
      const canvas = renderCardCanvas(cardId);
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.style.cssText = "width:192px;height:288px;image-rendering:pixelated;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.8);";
      float.appendChild(img);
      const label = document.createElement("div");
      label.style.cssText = "margin-top:6px;font-size:12px;color:#fff;text-align:center;max-width:220px;";
      label.textContent = def ? def.name + " — " + def.description : cardId;
      float.appendChild(label);
      const startLeft = srcRect.left - rootRect.left;
      const startTop = srcRect.top - rootRect.top;
      float.style.left = startLeft + "px";
      float.style.top = startTop + "px";
      float.style.transform = "scale(0.32)";
      float.style.transformOrigin = "top left";
      root.appendChild(float);

      const targetLeft = (root.clientWidth - 192) / 2;
      const targetTop = (root.clientHeight - 288) / 2;
      const moveAnim = float.animate([
        { left: startLeft + "px", top: startTop + "px", transform: "scale(0.32)" },
        { left: targetLeft + "px", top: targetTop + "px", transform: "scale(1)" },
      ], { duration: 280, easing: "cubic-bezier(0.2,0.8,0.2,1)", fill: "forwards" });
      moveAnim.onfinish = () => {
        float.style.left = targetLeft + "px";
        float.style.top = targetTop + "px";
        float.style.transform = "scale(1)";
        float.style.transformOrigin = "";
        // magic blast
        const blast = document.createElement("div");
        blast.style.cssText = "position:absolute;left:50%;top:50%;width:40px;height:40px;margin-left:-20px;margin-top:-20px;border-radius:50%;background:radial-gradient(circle,rgba(255,220,80,0.95),rgba(255,120,0,0.5) 55%,transparent 72%);z-index:21;pointer-events:none;";
        root.appendChild(blast);
        const blastAnim = blast.animate([
          { transform: "scale(0.4)", opacity: 1 },
          { transform: "scale(7)", opacity: 0 },
        ], { duration: 420, easing: "ease-out", fill: "forwards" });
        blastAnim.onfinish = () => {
          blast.remove();
          float.remove();
          (source as any)._playing = false;
          sim.playCard(cardId);
        };
      };
    }

    wrap.title = def?.description ?? "";
    return wrap;
  }

  function render(): void {
    handArea.innerHTML = "";
    const s = sim.state;
    // fan layout
const cards = s.deck;
    const n = cards.length;
    const avail = handArea.clientWidth || Math.round(root.clientWidth * 0.8) || 314;
    const cardW = 70;
    const cardH = 98;
    const maxSpacing = 29;
    const spread = n > 8 ? 4 : n > 5 ? 6 : 10;
    const maxAngle = ((n - 1) / 2) * spread * (Math.PI / 180);
    const proj = cardW * Math.cos(maxAngle) + cardH * Math.sin(maxAngle);
    const spacing = n <= 1 ? 0 : Math.min(maxSpacing, (avail - proj) / (n - 1));
    cards.forEach((inst, i) => {
      const el = makeCard(inst.defId);
      el.style.position = "absolute";
      el.style.left = `calc(50% + ${(i - (n - 1) / 2) * spacing}px)`;
      el.style.bottom = "0";
      const angle = (i - (n - 1) / 2) * spread;
      el.style.transform = `translateX(-50%) rotate(${angle}deg)`;
      el.style.transformOrigin = "bottom center";
      el.style.zIndex = String(i);
      handArea.appendChild(el);
    });

    deckArea.innerHTML = "";
    // deck stack visual
    const stack = document.createElement("div");
    stack.style.cssText = "position:relative;width:53px;height:79px;";
    for (let i = 0; i < 3; i++) {
      const c = document.createElement("div");
      c.style.cssText = `position:absolute;left:${i * 2}px;top:${i * 2}px;width:48px;height:72px;background:#222;border:1px solid #555;image-rendering:pixelated;`;
      stack.appendChild(c);
    }
    const deckLabel = document.createElement("div");
    deckLabel.style.cssText = "position:absolute;bottom:-14px;left:0;right:0;text-align:center;font-size:8px;color:#ccc;";
    deckLabel.textContent = "牌库";
    stack.appendChild(deckLabel);
    deckArea.appendChild(stack);
  }

  sim.events.on("card.drawn", () => render());
  sim.events.on("card.played", () => render());
  sim.events.on("card.rejected", () => render());
  sim.events.on("level.start", () => render());
  sim.events.on("phase.changed", () => render());

  // reward modal
  sim.events.on("level.cleared", (e) => {
    const choices = (e.data.choices as string[]) ?? [];
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,10,30,0.9);color:#fff;font-family:sans-serif;z-index:11;";
    const h = document.createElement("h2"); h.textContent = `第 ${e.data.level} 关通关！回血 ${e.data.heal}`; overlay.appendChild(h);
    const row = document.createElement("div"); row.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;justify-content:center;";
    for (const c of choices) {
      const def = getCard(c);
      const card = makeCard(c);
      card.onclick = () => { onReward(c); overlay.remove(); render(); };
      row.appendChild(card);
    }
    overlay.appendChild(row);
    root.appendChild(overlay);
  });

  render();
}