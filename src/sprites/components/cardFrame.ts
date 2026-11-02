import { Component, CompositeComponent, Color } from "./base";

export class CardFrame extends CompositeComponent {
  constructor(w: number, h: number, accent: Color) {
    super();
    const bg = new Component();
    bg.color = [245, 235, 210, 255];
    bg.position = [0, 0];
    bg.rects = [[0, 0, w, h]];

    const border = new Component();
    border.color = [50, 35, 20, 255];
    border.position = [0, 0];
    border.rects = [
      [0, 0, w, 1], [0, h - 1, w, 1],
      [0, 0, 1, h], [w - 1, 0, 1, h],
    ];

    const header = new Component();
    header.color = accent;
    header.position = [0, 0];
    header.rects = [[2, 2, w - 4, 9]];

    const footer = new Component();
    footer.color = [70, 55, 35, 255];
    footer.position = [0, 0];
    footer.rects = [[2, h - 11, w - 4, 9]];

    this.children = [bg, border, header, footer];
  }
}

export class CardIcon extends Component {
  constructor(rects: [number, number, number, number][], color: Color, position: [number, number] = [0, 0]) {
    super();
    this.color = color;
    this.position = position;
    this.rects = rects.map((r) => [...r]) as any;
  }
}