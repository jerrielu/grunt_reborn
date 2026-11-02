import { Component, CompositeComponent, Color } from "./base";

export class CardFrame extends CompositeComponent {
  constructor(w: number, h: number, accent: Color, stars: number = 3) {
    super();
    const light: Color = [250, 245, 230, 255];
    const dark: Color = [30, 25, 20, 255];
    const mid: Color = [200, 190, 160, 255];

    const bg = new Component(); bg.color = light; bg.position = [0, 0]; bg.rects = [[0, 0, w, h]];
    const outer = new Component(); outer.color = dark; outer.position = [0, 0]; outer.rects = [
      [0, 0, w, 2], [0, h - 2, w, 2], [0, 0, 2, h], [w - 2, 0, 2, h],
    ];
    const nameBar = new Component(); nameBar.color = mid; nameBar.position = [0, 0]; nameBar.rects = [[4, 4, w - 8, 10]];
    const artWin = new Component(); artWin.color = [210, 205, 195, 255]; artWin.position = [0, 0]; artWin.rects = [[6, 16, w - 12, 34]];
    const artBorder = new Component(); artBorder.color = dark; artBorder.position = [0, 0]; artBorder.rects = [
      [6, 16, w - 12, 1], [6, 49, w - 12, 1], [6, 16, 1, 34], [w - 7, 16, 1, 34],
    ];
    const typeLine = new Component(); typeLine.color = [225, 215, 190, 255]; typeLine.position = [0, 0]; typeLine.rects = [[6, 52, w - 12, 7]];
    const effectArea = new Component(); effectArea.color = [245, 238, 215, 255]; effectArea.position = [0, 0]; effectArea.rects = [[6, 61, w - 12, 24]];
    const statBar = new Component(); statBar.color = accent; statBar.position = [0, 0]; statBar.rects = [[6, 87, w - 12, 5]];

    const starComps: Component[] = [];
    for (let i = 0; i < stars; i++) {
      const st = new Component();
      st.color = [230, 200, 60, 255];
      st.position = [0, 0];
      st.rects = [[8 + i * 10, 6, 6, 6]];
      starComps.push(st);
    }

    this.children = [bg, outer, nameBar, artWin, artBorder, typeLine, effectArea, statBar, ...starComps];
  }
}

export class CardIcon extends Component {
  constructor(rects: [number, number, number, number][], color: Color, scale: number = 2, offset: [number, number] = [10, 20]) {
    super();
    this.color = color;
    this.position = [0, 0];
    this.rects = rects.map(([x, y, w, h]) => [x * scale + offset[0], y * scale + offset[1], w * scale, h * scale]) as any;
  }
}