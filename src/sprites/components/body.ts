import { Component, Color } from "./base";

export class Body extends Component {
  constructor(position: [number, number] = [0, 0], color: Color = [50, 100, 200, 255]) {
    super();
    this.color = color;
    this.position = position;
    this.rects = [
      [-7, -8, 14, 1], [-7, -7, 14, 1], [-7, -6, 14, 1], [-7, -5, 14, 1], [-7, -4, 14, 1],
      [-7, -3, 14, 1], [-7, -2, 14, 1], [-7, -1, 14, 1], [-7, 0, 14, 1], [-7, 1, 14, 1],
      [-7, 2, 14, 1], [-7, 3, 14, 1], [-7, 4, 14, 1], [-7, 5, 14, 1], [-7, 6, 14, 1],
      [-7, 7, 14, 1],
    ];
  }
}
