import { Component, Color } from "./base";

export class Body extends Component {
  constructor(position: [number, number] = [0, 0], color: Color = [50, 100, 200, 255]) {
    super();
    this.color = color;
    this.position = position;
    this.rects = [
      [-9, -5, 18, 1], [-9, -4, 18, 1], [-9, -3, 18, 1], [-9, -2, 18, 1],
      [-9, -1, 18, 1], [-9, 0, 18, 1], [-9, 1, 18, 1], [-9, 2, 18, 1],
      [-9, 3, 18, 1], [-9, 4, 18, 1],
      [-7, 5, 14, 1], [-7, 6, 14, 1],
    ];
  }
}
