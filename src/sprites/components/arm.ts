import { Component, Color } from "./base";

const RECTS = [
  [-2, -4, 4, 1], [-2, -3, 4, 1], [-2, -2, 4, 1], [-2, -1, 4, 1],
  [-2, 0, 4, 1], [-2, 1, 4, 1], [-2, 2, 4, 1], [-2, 3, 4, 1],
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
