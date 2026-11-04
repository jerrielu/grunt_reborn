import type { BattleSim } from "../core/battle/BattleSim";
import { getCard } from "../config/cards";
import { renderCardCanvas } from "../sprites/cardSprite";

export function attachHandPanel(sim: BattleSim, onReward: (cardId: string) => void): void {
  const root = document.getElementById("game")!;

  // remove any leftover panel from a previous run
  document.getElementById("hand-panel")?.remove();

  const panel = document.createElement("div");
  panel.id = "hand-panel";
  panel.style.cssText = "position:absolute;left:0;right:0;bottom:0;height:10%;background:linear-gradient(180deg,#5a3a1a 0%,#3a2410 100%);color:#fff;font-family:monospace;z-index:9;display:flex;align-items:center;justify-content:space-between;padding:6px 10px;box-sizing:border-box;border-top:2px solid #2a1a08;overflow:visible;";
  root.appendChild(panel);

  // desk texture lines
  const desk = document.createElement("div");
  desk.style.cssText = "position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.04) 0 2px,transparent 2px 12px);";
  panel.appendChild(desk);

  const handArea = document.createElement("div");
  handArea.style.cssText = "position:relative;flex:0 0 80%;display:flex;align-items:flex-end;justify-content:flex-start;height:100%;overflow:visible;padding:0 6px 4px 6px;box-sizing:border-box;";
  panel.appendChild(handArea);

  const deckArea = document.createElement("div");
  deckArea.style.cssText = "position:relative;flex:0 0 20%;height:100%;display:flex;align-items:flex-end;justify-content:center;padding:4px 6px;box-sizing:border-box;";
  panel.appendChild(deckArea);

  let preview: HTMLElement | null = null;
  let isDragging = false;
  let pendingRender = false;
  let isDrawing = false;
  let dragState: { defId: string; startY: number; el: HTMLElement; moved: boolean } | null = null;
  let cooldownSweep: HTMLElement | null = null;

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
    const canvas = renderCardCanvas(defId, 2);
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.cssText = "width:256px;height:384px;image-rendering:pixelated;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.8);";
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

  function playCardWithEffect(cardId: string, source: HTMLElement): void {
    if ((source as any)._playing) { console.log("[cardplay] already playing, skip", cardId); return; }
    (source as any)._playing = true;
    console.log("[cardplay] start", cardId);
    const def = getCard(cardId);
    let srcRect: DOMRect;
    try { srcRect = source.getBoundingClientRect(); } catch { srcRect = new DOMRect(0, 0, 62, 94); }
    const rootRect = root.getBoundingClientRect();
    const float = document.createElement("div");
    float.style.cssText = "position:absolute;z-index:20;pointer-events:none;display:flex;flex-direction:column;align-items:center;";
    const canvas = renderCardCanvas(cardId, 2);
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.cssText = "width:256px;height:384px;image-rendering:pixelated;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.8);";
    float.appendChild(img);
    const label = document.createElement("div");
    label.style.cssText = "margin-top:6px;font-size:12px;color:#fff;text-align:center;max-width:220px;";
    label.textContent = def ? def.name + " — " + def.description : cardId;
    float.appendChild(label);
    const startLeft = srcRect.left - rootRect.left;
    const startTop = srcRect.top - rootRect.top;
    float.style.left = startLeft + "px";
    float.style.top = startTop + "px";
    float.style.transform = "scale(0.24)";
    float.style.transformOrigin = "top left";
    root.appendChild(float);

    const targetLeft = (root.clientWidth - 256) / 2;
    const targetTop = (root.clientHeight - 384) / 2;
    const moveAnim = float.animate([
      { left: startLeft + "px", top: startTop + "px", transform: "scale(0.24)" },
      { left: targetLeft + "px", top: targetTop + "px", transform: "scale(1)" },
    ], { duration: 280, easing: "cubic-bezier(0.2,0.8,0.2,1)", fill: "forwards" });
    let done = false;
    let blast: HTMLDivElement | null = null;
    const finish = () => {
      if (done) return;
      done = true;
      console.log("[cardplay] finish", cardId);
      try { moveAnim.cancel(); } catch {}
      try { if (blast) blast.remove(); } catch {}
      float.remove();
      (source as any)._playing = false;
      sim.playCard(cardId);
    };
    const startBlast = () => {
      console.log("[cardplay] startBlast", cardId);
      float.style.left = targetLeft + "px";
      float.style.top = targetTop + "px";
      float.style.transform = "scale(1)";
      float.style.transformOrigin = "";
      blast = document.createElement("div");
      blast.style.cssText = "position:absolute;left:50%;top:50%;width:40px;height:40px;margin-left:-20px;margin-top:-20px;border-radius:50%;background:radial-gradient(circle,rgba(255,220,80,0.95),rgba(255,120,0,0.5) 55%,transparent 72%);z-index:21;pointer-events:none;";
      root.appendChild(blast);
      const blastAnim = blast.animate([
        { transform: "scale(0.4)", opacity: 1 },
        { transform: "scale(7)", opacity: 0 },
      ], { duration: 420, easing: "ease-out", fill: "forwards" });
      blastAnim.onfinish = finish;
      blastAnim.oncancel = finish;
    };
    moveAnim.onfinish = () => { console.log("[cardplay] move finished", cardId); startBlast(); };
    moveAnim.oncancel = () => { console.log("[cardplay] move cancelled", cardId); startBlast(); };
    window.setTimeout(() => {
      if (!done) {
        console.log("[cardplay] fallback move timeout", cardId);
        if (!blast) startBlast();
        window.setTimeout(() => { console.log("[cardplay] fallback finish timeout", cardId); finish(); }, 450);
      }
    }, 320);
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
    wrap.addEventListener("pointerdown", (e) => {
      isDragging = true;
      dragState = { defId, startY: e.clientY, el: wrap, moved: false };
      try { wrap.setPointerCapture(e.pointerId); } catch {}
      (wrap as any)._origZ = wrap.style.zIndex;
      wrap.style.zIndex = "100";
    });
    wrap.addEventListener("pointermove", (e) => {
      if (!dragState || dragState.el !== wrap) return;
      if (e.clientY < dragState.startY - 10) dragState.moved = true;
      if (dragState.moved) {
        wrap.style.transform = `translateY(${e.clientY - dragState.startY}px)`;
      }
    });
    const finishDrag = (endY: number) => {
      if (!isDragging || !dragState || dragState.el !== wrap) return;
      const ds = dragState;
      const dy = endY - ds.startY;
      isDragging = false;
      dragState = null;
      wrap.style.transform = "";
      wrap.style.zIndex = (wrap as any)._origZ ?? "";
      console.log("[cardplay] drag end", defId, "dy=", dy, "moved=", ds.moved);
      if (dy < -40) {
        playCardWithEffect(defId, wrap);
      } else {
        showPreview(defId);
      }
      if (pendingRender) { pendingRender = false; render(); }
    };
    wrap.addEventListener("pointerup", (e) => { finishDrag(e.clientY); });
    wrap.addEventListener("pointercancel", () => { finishDrag(dragState ? dragState.startY : 0); });

    wrap.title = def?.description ?? "";
    return wrap;
  }

  function animateDraw(defId: string): void {
    isDrawing = true;
    const deckRect = deckArea.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const handRect = handArea.getBoundingClientRect();
    const n = sim.state.deck.length;
    const avail = (handArea.clientWidth || Math.round(root.clientWidth * 0.8) || 314) - 12;
    const cardW = 70; const cardH = 98; const maxSpacing = 29;
    const spread = n > 8 ? 4 : n > 5 ? 6 : 10;
    const maxAngle = ((n - 1) / 2) * spread * (Math.PI / 180);
    const proj = cardW * Math.cos(maxAngle) + cardH * Math.sin(maxAngle);
    const spacing = n <= 1 ? 0 : Math.min(maxSpacing, (avail - proj) / (n - 1));
    const offset = ((n - 1) / 2) * spacing;
    const startLeft = deckRect.left - rootRect.left + deckRect.width / 2 - 31;
    const startTop = deckRect.top - rootRect.top + deckRect.height / 2 - 47;
    const endLeft = handRect.left - rootRect.left + handRect.width / 2 + offset - 31;
    const endTop = handRect.bottom - rootRect.top - 98;

    const float = document.createElement("div");
    float.style.cssText = "position:absolute;z-index:22;pointer-events:none;display:flex;flex-direction:column;align-items:center;";
    const canvas = renderCardCanvas(defId);
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.cssText = "width:62px;height:94px;image-rendering:pixelated;border:1px solid #333;box-shadow:0 2px 4px rgba(0,0,0,0.5);";
    float.appendChild(img);
    float.style.left = startLeft + "px";
    float.style.top = startTop + "px";
    root.appendChild(float);

    // sparkle flash at draw point
    const flash = document.createElement("div");
    flash.style.cssText = "position:absolute;z-index:23;pointer-events:none;left:" + (startLeft + 31) + "px;top:" + (startTop + 47) + "px;width:8px;height:8px;margin-left:-4px;margin-top:-4px;background:radial-gradient(circle,rgba(255,230,120,1) 0%,rgba(255,180,40,0.7) 40%,transparent 75%);image-rendering:pixelated;";
    root.appendChild(flash);
    const flashAnim = flash.animate([
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(6)", opacity: 0 },
    ], { duration: 320, easing: "steps(6,end)", fill: "forwards" });
    flashAnim.onfinish = () => { try { flash.remove(); } catch {} };
    flashAnim.oncancel = () => { try { flash.remove(); } catch {} };

    const midLeft = (startLeft + endLeft) / 2;
    const midTop = Math.min(startTop, endTop) - 30;
    const anim = float.animate([
      { left: startLeft + "px", top: startTop + "px", transform: "perspective(400px) rotateY(180deg) scale(0.85)", opacity: 1, offset: 0 },
      { left: midLeft + "px", top: midTop + "px", transform: "perspective(400px) rotateY(90deg) scale(1)", opacity: 1, offset: 0.4 },
      { left: endLeft + "px", top: endTop + "px", transform: "perspective(400px) rotateY(0deg) scale(1)", opacity: 1, offset: 1 },
    ], { duration: 420, easing: "cubic-bezier(0.2,0.8,0.2,1)", fill: "forwards" });
    const finish = () => {
      try { anim.cancel(); } catch {}
      float.remove();
      isDrawing = false;
      render();
    };
    anim.onfinish = finish;
    anim.oncancel = finish;
    window.setTimeout(() => { if (isDrawing) finish(); }, 500);
  }

  function render(): void {
    if (isDragging) { pendingRender = true; console.log("[cardplay] render deferred (dragging)"); return; }
    handArea.innerHTML = "";
    const s = sim.state;
    // fan layout
const cards = s.deck;
    const n = cards.length;
    const avail = (handArea.clientWidth || Math.round(root.clientWidth * 0.8) || 314) - 12;
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
      el.style.bottom = "4px";
      const angle = (i - (n - 1) / 2) * spread;
      el.style.transform = `translateX(-50%) rotate(${angle}deg)`;
      el.style.transformOrigin = "bottom center";
      el.style.zIndex = String(i);
      handArea.appendChild(el);
    });

    deckArea.innerHTML = "";
    // deck stack visual
    const stack = document.createElement("div");
    stack.style.cssText = "position:relative;width:62px;height:94px;margin-bottom:4px;";
    for (let i = 0; i < 3; i++) {
      const c = document.createElement("div");
      c.style.cssText = `position:absolute;left:${i * 2}px;top:${i * 2}px;width:62px;height:94px;background:#222;border:1px solid #555;image-rendering:pixelated;`;
      stack.appendChild(c);
    }
    // cooldown sweep on the top card back (golden, pixel-ish)
    const topCard = stack.lastElementChild as HTMLElement;
    const cool = document.createElement("div");
    cool.style.cssText = "position:absolute;left:2px;right:2px;top:2px;bottom:2px;pointer-events:none;overflow:hidden;";
    const sweep = document.createElement("div");
    sweep.style.cssText = "position:absolute;left:0;bottom:0;width:100%;height:100%;background:repeating-linear-gradient(180deg,rgba(255,200,60,0.85) 0 2px,rgba(210,150,30,0.7) 2px 4px);image-rendering:pixelated;transform-origin:bottom center;";
    cool.appendChild(sweep);
    topCard.appendChild(cool);
    cooldownSweep = sweep;
    deckArea.appendChild(stack);
  }

  // global fallback to finish a drag if the card element was removed mid-drag
  const onGlobalPointerUp = (e: PointerEvent) => {
    if (isDragging && dragState) {
      const el = dragState.el;
      finishDragAny(e.clientY);
    }
  };
  const finishDragAny = (endY: number) => {
    if (!isDragging || !dragState) return;
    const ds = dragState;
    const wrap = ds.el;
    const dy = endY - ds.startY;
    isDragging = false;
    dragState = null;
    try { wrap.style.transform = ""; wrap.style.zIndex = (wrap as any)._origZ ?? ""; } catch {}
    console.log("[cardplay] global drag end", ds.defId, "dy=", dy);
    if (dy < -40) {
      playCardWithEffect(ds.defId, wrap);
    } else {
      showPreview(ds.defId);
    }
    if (pendingRender) { pendingRender = false; render(); }
  };
  window.addEventListener("pointerup", onGlobalPointerUp);
  window.addEventListener("pointercancel", () => { if (isDragging && dragState) finishDragAny(dragState.startY); });

  sim.events.on("card.drawn", (e) => { animateDraw(e.data.defId as string); });
  sim.events.on("card.played", () => render());
  sim.events.on("card.rejected", () => render());
  sim.events.on("level.start", () => render());
  sim.events.on("phase.changed", () => { if (!isDrawing) render(); });

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

  // cooldown sweep driver
  function updateCooldown(): void {
    if (cooldownSweep) {
      const s = sim.state as any;
      const remaining = Math.max(0, (s?.nextDrawAt ?? 0) - (s?.levelTime ?? 0));
      const frac = Math.min(1, remaining / 5);
      cooldownSweep.style.height = (frac * 100) + "%";
    }
    requestAnimationFrame(updateCooldown);
  }
  requestAnimationFrame(updateCooldown);

  render();
}