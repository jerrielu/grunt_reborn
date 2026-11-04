// Minimal DOM menu overlay
export function showMenu(onStart: (generalId: string) => void): void {
  const root = document.getElementById("game")!;
  // clear
  root.querySelectorAll(".overlay").forEach((e) => e.remove());
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  // pixelate the DOM overlay by rendering at half resolution then scaling up
  overlay.style.cssText = "position:absolute;inset:0;image-rendering:pixelated;image-rendering:crisp-edges;z-index:10;overflow:hidden;";
  const inner = document.createElement("div");
  inner.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,10,30,0.9);color:#fff;font-family:monospace;transform:scale(2);transform-origin:top left;width:50%;height:50%;";
  overlay.appendChild(inner);
  const title = document.createElement("h1");
  title.textContent = "小兵重来 · Grunt Reborn";
  inner.appendChild(title);
  const sub = document.createElement("p");
  sub.textContent = "选择武将开始闯关";
  inner.appendChild(sub);
  for (const g of ["shoucheng", "vanguard", "summoner"]) {
    const btn = document.createElement("button");
    btn.textContent = g === "shoucheng" ? "守成校尉（防御）" : g === "vanguard" ? "先锋骑将（冲阵）" : "招魂将（召唤）";
    btn.style.cssText = "margin:6px;padding:10px 20px;font-size:16px;cursor:pointer;";
    btn.onclick = () => { overlay.remove(); onStart(g); };
    inner.appendChild(btn);
  }
  root.style.position = "relative";
  root.appendChild(overlay);
}
