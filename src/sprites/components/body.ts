import { Component, CompositeComponent, Color } from "./base";

const CHEST: [number, number, number, number][] = [
  [-6, -7, 12, 1], [-7, -6, 14, 1], [-8, -5, 16, 1], [-8, -4, 16, 1],
  [-8, -3, 16, 1], [-8, -2, 16, 1], [-8, -1, 16, 1],
];
const HIPS: [number, number, number, number][] = [
  [-8, 0, 16, 1], [-8, 1, 16, 1], [-8, 2, 16, 1],
  [-7, 3, 14, 1], [-7, 4, 14, 1], [-6, 5, 12, 1], [-5, 6, 10, 1],
];

export class Body extends CompositeComponent {
  constructor(position: [number, number] = [0, 0], color: Color = [50, 100, 200, 255]) {
    super();
    const [px, py] = position;
    const chest = new Component();
    chest.color = color;
    chest.position = [px, py];
    chest.rects = CHEST.map((r) => [...r]) as any;

    const hips = new Component();
    hips.color = color;
    hips.position = [px, py];
    hips.rects = HIPS.map((r) => [...r]) as any;

    this.children = [chest, hips];
    this.position = position;
  }
}