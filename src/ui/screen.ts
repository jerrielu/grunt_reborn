export function gameRoot(): HTMLElement {
  return document.getElementById("game")!;
}

/**
 * Mount a full-bleed layer into #game.
 *
 * Full-screen geometry lives in one place (the `.screen` rule in index.html):
 * the layer is always `position:absolute; inset:0` inside the fixed #game box,
 * so it covers the real viewport on every device without per-page vh/dvh math.
 */
export function mountScreen(className: string, extraCss = ""): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `screen ${className}`.trim();
  el.style.cssText = extraCss;
  gameRoot().appendChild(el);
  return el;
}
