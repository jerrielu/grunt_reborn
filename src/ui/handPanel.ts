import type { BattleSim } from "../core/battle/BattleSim";
import { getCard } from "../config/cards";

export function attachHandPanel(sim: BattleSim, onReward: (cardId: string) => void): void {
  const root = document.getElementById("game")!;
  const panel = document.createElement("div");
  panel.id = "hand-panel";
  panel.style.cssText = "position:absolute;left:0;right:0;bottom:0;padding:8px;background:rgba(0,0,0,0.7);color:#fff;font-family:monospace;z-index:9;display:none;flex-wrap:wrap;gap:6px;";
  root.appendChild(panel);

  function render(): void {
    const s = sim.state;
    if (s.phase !== "decide") { panel.style.display = "none"; return; }
    panel.style.display = "flex";
    panel.innerHTML = "";
    const title = document.createElement("div");
    title.style.cssText = "width:100%;font-size:12px;opacity:0.8;";
    title.textContent = "出牌窗口（暂停）— 选一张或不出牌";
    panel.appendChild(title);
    for (const inst of s.deck) {
      const def = getCard(inst.defId);
      if (!def) continue;
      const btn = document.createElement("button");
      btn.textContent = def.name;
      btn.title = def.description;
      btn.style.cssText = "padding:6px 10px;font-size:13px;cursor:pointer;";
      btn.onclick = () => { sim.playCard(inst.defId); };
      panel.appendChild(btn);
    }
    const skip = document.createElement("button");
    skip.textContent = "不出牌";
    skip.style.cssText = "padding:6px 10px;font-size:13px;cursor:pointer;background:#555;color:#fff;border:none;";
    skip.onclick = () => sim.skipCard();
    panel.appendChild(skip);
    const confirm = document.createElement("button");
    confirm.textContent = "确认结束";
    confirm.style.cssText = "padding:6px 10px;font-size:13px;cursor:pointer;background:#2a6;color:#fff;border:none;";
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
    const row = document.createElement("div"); row.style.cssText = "display:flex;gap:10px;";
    for (const c of choices) {
      const def = getCard(c);
      const btn = document.createElement("button");
      btn.textContent = def ? def.name : c;
      btn.title = def?.description ?? "";
      btn.style.cssText = "padding:12px 16px;font-size:14px;cursor:pointer;";
      btn.onclick = () => { onReward(c); overlay.remove(); };
      row.appendChild(btn);
    }
    overlay.appendChild(row);
    document.getElementById("game")!.appendChild(overlay);
  });
  render();
}
