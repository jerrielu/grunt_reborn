import { Component, Color } from "./base";

export class Body extends Component {
  constructor(position: [number, number] = [0, 0], color: Color = [50, 100, 200, 255]) {
    super();
    this.color = color;
    this.position = position;
    this.rects = [
      [-6, -7, 12, 1], [-7, -6, 14, 1], [-8, -5, 16, 1], [-8, -4, 16, 1],
      [-8, -3, 16, 1], [-8, -2, 16, 1], [-8, -1, 16, 1], [-8, 0, 16, 1],
      [-8, 1, 16, 1], [-8, 2, 16, 1], [-7, 3, 14, 1], [-7, 4, 14, 1],
      [-6, 5, 12, 1], [-5, 6, 10, 1],
    ];
  }
}
