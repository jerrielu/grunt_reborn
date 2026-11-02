import type { BattleSim } from "../core/battle/BattleSim";
import { getCard } from "../config/cards";
import { CardSpriteTemplate } from "../sprites/cardSprite";

export function attachHandPanel(sim: BattleSim, onReward: (cardId: string) => void): void {
  const root = document.getElementById("game")!;
  const panel = document.createElement("div");
  panel.id = "hand-panel";
  panel.style.cssText = "position:absolute;left:0;right:0;bottom:0;padding:8px;background:rgba(0,0,0,0.7);color:#fff;font-family:monospace;z-index:9;display:none;flex-wrap:wrap;gap:6px;justify-content:center;align-items:flex-end;";
  root.appendChild(panel);

  function makeCard(defId: string, onClick: () => void): HTMLElement {
    const def = getCard(defId);
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:rotate(" + (Math.random() * 6 - 3) + "deg);margin:0 2px;";
    const tpl = new CardSpriteTemplate(defId);
    const canvas = tpl.renderToCanvas();
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.cssText = "width:64px;height:96px;image-rendering:pixelated;border:1px solid #333;box-shadow:0 2px 4px rgba(0,0,0,0.5);";
    const label = document.createElement("div");
    label.style.cssText = "font-size:9px;margin-top:2px;max-width:64px;text-align:center;overflow:hidden;white-space:nowrap;";
    label.textContent = def ? def.name : defId;
    wrap.appendChild(img);
    wrap.appendChild(label);
    wrap.onclick = onClick;
    wrap.title = def?.description ?? "";
    return wrap;
  }

  function render(): void {
    const s = sim.state;
    if (s.phase !== "decide") { panel.style.display = "none"; return; }
    panel.style.display = "flex";
    panel.innerHTML = "";
    const title = document.createElement("div");
    title.style.cssText = "width:100%;font-size:12px;opacity:0.8;text-align:center;";
    title.textContent = "出牌窗口（暂停）— 选一张或不出牌";
    panel.appendChild(title);
    for (const inst of s.deck) {
      const def = getCard(inst.defId);
      if (!def) continue;
      panel.appendChild(makeCard(inst.defId, () => { sim.playCard(inst.defId); }));
    }
    const skip = document.createElement("button");
    skip.textContent = "不出牌";
    skip.style.cssText = "padding:6px 10px;font-size:13px;cursor:pointer;background:#555;color:#fff;border:none;margin:4px;";
    skip.onclick = () => sim.skipCard();
    panel.appendChild(skip);
    const confirm = document.createElement("button");
    confirm.textContent = "确认结束";
    confirm.style.cssText = "padding:6px 10px;font-size:13px;cursor:pointer;background:#2a6;color:#fff;border:none;margin:4px;";
    confirm.onclick = () => sim.endDecide();
    panel.appendChild(confirm);
  }

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
      const card = makeCard(c, () => { onReward(c); overlay.remove(); });
      row.appendChild(card);
    }
    overlay.appendChild(row);
    document.getElementById("game")!.appendChild(overlay);
  });
  render();
}