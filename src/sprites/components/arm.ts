import { Component, Color } from "./base";

const RECTS = [
  [-3, -7, 6, 1], [-3, -6, 6, 1], [-3, -5, 6, 1], [-3, -4, 6, 1], [-3, -3, 6, 1],
  [-3, -2, 6, 1], [-3, -1, 6, 1], [-3, 0, 6, 1], [-3, 1, 6, 1], [-3, 2, 6, 1],
  [-3, 3, 6, 1], [-3, 4, 6, 1], [-3, 5, 6, 1], [-3, 6, 6, 1], [0, 6, 1, 1],
  [-1, 7, 3, 1], [-2, 8, 5, 1], [-1, 9, 1, 1], [0, 10, 1, 1],
];

export class Arm extends Component {
  constructor(position: [number, number] = [0, 0], color: Color = [255, 200, 150, 255], mirrored = false) {
    super();
    this.color = color;
    this.position = position;
    this.mirrored = mirrored;
    this.rects = RECTS.map((r) => [...r]) as any;
  }
}
