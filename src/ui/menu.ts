// Minimal DOM menu overlay
export function showMenu(onStart: (generalId: string) => void): void {
  const root = document.getElementById("game")!;
  // clear
  root.querySelectorAll(".overlay").forEach((e) => e.remove());
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,10,30,0.9);color:#fff;font-family:sans-serif;z-index:10;";
  const title = document.createElement("h1");
  title.textContent = "小兵重来 · Grunt Reborn";
  overlay.appendChild(title);
  const sub = document.createElement("p");
  sub.textContent = "选择武将开始闯关";
  overlay.appendChild(sub);
  for (const g of ["shoucheng", "vanguard", "summoner"]) {
    const btn = document.createElement("button");
    btn.textContent = g === "shoucheng" ? "守成校尉（防御）" : g === "vanguard" ? "先锋骑将（冲阵）" : "招魂将（召唤）";
    btn.style.cssText = "margin:6px;padding:10px 20px;font-size:16px;cursor:pointer;";
    btn.onclick = () => { overlay.remove(); onStart(g); };
    overlay.appendChild(btn);
  }
  root.style.position = "relative";
  root.appendChild(overlay);
}
