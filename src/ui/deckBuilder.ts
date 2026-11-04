import { GameController } from "../game";
import { CARDS, getCard } from "../config/cards";
import { UNLOCKS, canPurchase } from "../config/unlocks";
import { renderCardCanvas } from "../sprites/cardSprite";

const MAX_DECK = 20;
const MAX_COPIES = 3;

const CATS = ["全部", "武将", "士兵", "技能", "武器", "防具", "阵法", "道具"];

function cardCategory(id: string): string {
  const def = getCard(id);
  if (!def) return "道具";
  if (def.type === "summon") return "士兵";
  if (def.type === "equipment") return def.equipmentSlot === "weapon" ? "武器" : "防具";
  if (def.type === "instant") return "道具";
  return "技能"; // tactic
}

function borderColor(id: string): string {
  const cat = cardCategory(id);
  const map: Record<string, string> = {
    武将: "#8b6914", 士兵: "#2d5a27", 技能: "#a63a2f",
    武器: "#8a8a8a", 防具: "#4a6a7a", 阵法: "#1a2a4a", 道具: "#c9a86a",
  };
  return map[cat] ?? "#555";
}

export function openDeckBuilder(controller: GameController): void {
  const root = document.getElementById("game")!;
  document.querySelectorAll(".deckbuilder").forEach((e) => e.remove());

  const overlay = document.createElement("div");
  overlay.className = "deckbuilder";
  overlay.style.cssText = "position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;background:#1a1408;font-family:monospace;color:#e8d9a8;overflow:hidden;";

  // wood texture
  const tex = document.createElement("div");
  tex.style.cssText = "position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.08) 0 2px,transparent 2px 14px),repeating-linear-gradient(0deg,rgba(255,200,100,0.03) 0 3px,transparent 3px 18px);";
  overlay.appendChild(tex);

  let activeCat = "全部";
  let deck: string[] = [...(controller.meta.state.deck ?? [])];
  if (deck.length === 0) deck = ["steady", "guard", "heavyArmor", "firstAid", "summonFootman", "spear"];

  function save() { controller.meta.state.deck = [...deck]; controller.meta.persist(); }

  // --- top bar ---
  const top = document.createElement("div");
  top.style.cssText = "position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:6px 8px;height:44px;background:#2a1a0a;border-bottom:2px solid #0a0604;box-sizing:border-box;";
  const mkPlaque = (label: string, onClick: () => void) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.cssText = "background:#3a2410;color:#e8d9a8;border:2px solid #0a0604;padding:4px 8px;font-family:monospace;font-size:11px;cursor:pointer;image-rendering:pixelated;";
    b.onclick = onClick;
    return b;
  };
  const backBtn = mkPlaque("返回", () => { save(); overlay.remove(); });
  const saveBtn = mkPlaque("保存", () => { save(); flash("已保存"); });
  const filterBtn = mkPlaque("筛选", () => { /* placeholder */ });
  const mid = document.createElement("div");
  mid.style.cssText = "flex:1;text-align:center;font-size:12px;font-weight:bold;";
  const title = document.createElement("div"); title.textContent = "卡组构筑";
  const count = document.createElement("div"); count.style.cssText = "font-size:10px;color:#c9a86a;";
  mid.appendChild(title); mid.appendChild(count);
  top.appendChild(backBtn);
  top.appendChild(mid);
  const right = document.createElement("div"); right.style.cssText = "display:flex;gap:4px;";
  right.appendChild(filterBtn); right.appendChild(saveBtn);
  top.appendChild(right);
  overlay.appendChild(top);

  // --- upper deck area ---
  const deckWrap = document.createElement("div");
  deckWrap.style.cssText = "position:relative;z-index:2;flex:0 0 150px;padding:6px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;background:rgba(0,0,0,0.25);";
  const deckRow = document.createElement("div");
  deckRow.style.cssText = "display:inline-flex;gap:6px;align-items:center;height:100%;";
  deckWrap.appendChild(deckRow);
  overlay.appendChild(deckWrap);

  // --- divider bamboo ---
  const divider = document.createElement("div");
  divider.style.cssText = "position:relative;z-index:2;height:24px;display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,#5a3a1a,#3a2410,#5a3a1a);border-top:2px solid #0a0604;border-bottom:2px solid #0a0604;color:#e8d9a8;font-size:10px;";
  divider.textContent = "当前编制  ·  帐下诸卡";
  overlay.appendChild(divider);

  // --- category tabs ---
  const tabs = document.createElement("div");
  tabs.style.cssText = "position:relative;z-index:2;display:flex;gap:4px;padding:6px;overflow-x:auto;background:#1a1408;";
  overlay.appendChild(tabs);

  // --- collection grid ---
  const grid = document.createElement("div");
  grid.style.cssText = "position:relative;z-index:2;flex:1;overflow-y:auto;padding:6px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;align-content:start;";
  overlay.appendChild(grid);

  // --- toast ---
  const toast = document.createElement("div");
  toast.style.cssText = "position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:#3a2410;color:#e8d9a8;padding:4px 10px;border:2px solid #c9a86a;font-size:11px;display:none;z-index:5;";
  overlay.appendChild(toast);
  function flash(msg: string) { toast.textContent = msg; toast.style.display = "block"; setTimeout(() => toast.style.display = "none", 1200); }

  // --- detail modal ---
  let modalEl: HTMLElement | null = null;
  function openDetail(id: string) {
    if (modalEl) modalEl.remove();
    const def = getCard(id);
    const m = document.createElement("div");
    m.style.cssText = "position:absolute;inset:0;background:rgba(0,0,0,0.7);z-index:6;display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "width:280px;background:#d9c9a0;color:#1a1408;border:2px solid #8b6914;padding:10px;position:relative;";
    // gold corners
    for (const [cx, cy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const c = document.createElement("div");
      c.style.cssText = `position:absolute;${cx ? "right" : "left"}:2px;${cy ? "bottom" : "top"}:2px;width:8px;height:8px;background:#c9a86a;`;
      box.appendChild(c);
    }
    const canvas = renderCardCanvas(id, 2);
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.cssText = "width:128px;height:192px;image-rendering:pixelated;display:block;margin:0 auto;border:2px solid #8b6914;";
    box.appendChild(img);
    const name = document.createElement("div"); name.style.cssText = "text-align:center;font-weight:bold;margin-top:6px;"; name.textContent = def?.name ?? id;
    box.appendChild(name);
    const type = document.createElement("div"); type.style.cssText = "text-align:center;font-size:10px;color:#5a3a1a;"; type.textContent = `类型: ${cardCategory(id)}  费用: -`;
    box.appendChild(type);
    const desc = document.createElement("div"); desc.style.cssText = "margin-top:6px;font-size:11px;line-height:1.3;"; desc.textContent = def?.description ?? "";
    box.appendChild(desc);
    const btnRow = document.createElement("div"); btnRow.style.cssText = "display:flex;gap:6px;margin-top:8px;justify-content:center;";
    const addB = mkPlaque("加入编制", () => { addToDeck(id); m.remove(); modalEl = null; });
    const remB = mkPlaque("移出编制", () => { removeFromDeck(id); m.remove(); modalEl = null; });
    const cancelB = mkPlaque("取消", () => { m.remove(); modalEl = null; });
    btnRow.appendChild(addB); btnRow.appendChild(remB); btnRow.appendChild(cancelB);
    box.appendChild(btnRow);
    m.appendChild(box);
    m.onclick = (e) => { if (e.target === m) { m.remove(); modalEl = null; } };
    overlay.appendChild(m);
    modalEl = m;
  }

  function addToDeck(id: string) {
    const copies = deck.filter((x) => x === id).length;
    if (copies >= MAX_COPIES) { flash("已达携带上限"); return; }
    if (deck.length >= MAX_DECK) { flash("卡组已满"); return; }
    const def = getCard(id);
    const unlocked = controller.meta.state.unlockedCards.includes(id);
    if (!unlocked) {
      const u = UNLOCKS.find((x) => x.id === id);
      if (u && controller.buyUnlock(u.id)) { flash("已解锁"); }
      else { flash("积分不足"); return; }
    }
    deck.push(id);
    save();
    render();
  }

  function removeFromDeck(id: string) {
    const idx = deck.lastIndexOf(id);
    if (idx >= 0) { deck.splice(idx, 1); save(); render(); }
  }

  function render() {
    // update count
    count.textContent = `${deck.length} / ${MAX_DECK}`;

    // deck row
    deckRow.innerHTML = "";
    if (deck.length === 0) {
      const empty = document.createElement("div"); empty.style.cssText = "color:#888;font-size:11px;"; empty.textContent = "点击下方卡牌加入编制";
      deckRow.appendChild(empty);
    }
    deck.forEach((id, i) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = "position:relative;display:inline-block;cursor:pointer;";
      const canvas = renderCardCanvas(id, 1);
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.style.cssText = `width:62px;height:94px;image-rendering:pixelated;border:2px solid ${borderColor(id)};`;
      wrap.appendChild(img);
      // quantity badge bottom-right
      const badge = document.createElement("div");
      badge.style.cssText = "position:absolute;right:2px;bottom:2px;background:#0a0604;color:#e8d9a8;font-size:9px;padding:0 3px;border:1px solid #c9a86a;";
      const c = deck.filter((x) => x === id).length;
      badge.textContent = String(c);
      wrap.appendChild(badge);
      // click remove
      wrap.onclick = () => removeFromDeck(id);
      // long press detail
      let timer: any = null;
      wrap.onpointerdown = () => { timer = setTimeout(() => openDetail(id), 450); };
      wrap.onpointerup = () => { if (timer) clearTimeout(timer); };
      wrap.onpointercancel = () => { if (timer) clearTimeout(timer); };
      deckRow.appendChild(wrap);
    });

    // tabs
    tabs.innerHTML = "";
    CATS.forEach((cat) => {
      const t = document.createElement("button");
      t.textContent = cat;
      const active = cat === activeCat;
      t.style.cssText = `background:${active ? "#c9a86a" : "#3a2410"};color:${active ? "#1a1408" : "#e8d9a8"};border:2px solid #0a0604;padding:4px 8px;font-family:monospace;font-size:10px;cursor:pointer;white-space:nowrap;${active ? "box-shadow:0 0 0 2px #8b6914 inset;" : ""}`;
      t.onclick = () => { activeCat = cat; render(); };
      tabs.appendChild(t);
    });

    // collection grid
    grid.innerHTML = "";
    const list = CARDS.filter((c) => activeCat === "全部" || cardCategory(c.id) === activeCat);
    list.forEach((def) => {
      const id = def.id;
      const unlocked = controller.meta.state.unlockedCards.includes(id);
      const copies = deck.filter((x) => x === id).length;
      const atCap = copies >= MAX_COPIES;
      const cell = document.createElement("div");
      cell.style.cssText = `position:relative;cursor:pointer;opacity:${atCap ? 0.45 : 1};`;
      const canvas = renderCardCanvas(id, 1);
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.style.cssText = `width:100%;height:auto;image-rendering:pixelated;border:2px solid ${borderColor(id)};display:block;`;
      cell.appendChild(img);
      // quantity badge top-right (held count = unlocked? use copies+1? show held = unlocked?1:0; we show copies in deck)
      const badge = document.createElement("div");
      badge.style.cssText = "position:absolute;right:2px;top:2px;background:#0a0604;color:#e8d9a8;font-size:9px;padding:0 3px;border:1px solid #c9a86a;";
      badge.textContent = String(copies);
      cell.appendChild(badge);
      if (!unlocked) {
        const lock = document.createElement("div");
        lock.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);color:#c9a86a;font-size:10px;text-align:center;";
        const u = UNLOCKS.find((x) => x.id === id);
        lock.textContent = u ? `${u.cost}积分` : "未解锁";
        cell.appendChild(lock);
      }
      cell.onclick = () => {
        if (atCap) { flash("已达携带上限"); return; }
        addToDeck(id);
      };
      // long press detail
      let timer: any = null;
      cell.onpointerdown = () => { timer = setTimeout(() => openDetail(id), 450); };
      cell.onpointerup = () => { if (timer) clearTimeout(timer); };
      cell.onpointercancel = () => { if (timer) clearTimeout(timer); };
      grid.appendChild(cell);
    });
  }

  root.style.position = "relative";
  root.appendChild(overlay);
  render();
}