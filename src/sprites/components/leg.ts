import { Component, CompositeComponent, Color } from "./base";

const PANTS: Color = [60, 60, 80, 255];
const SHOES: Color = [40, 40, 40, 255];

const THIGH: [number, number, number, number][] = [
  [-3, -4, 6, 1], [-3, -3, 6, 1], [-3, -2, 6, 1],
];
const CALF: [number, number, number, number][] = [
  [-3, -1, 6, 1], [-3, 0, 6, 1], [-3, 1, 6, 1],
];
const FOOT: [number, number, number, number][] = [
  [-4, 2, 8, 1], [-4, 3, 8, 1], [-4, 4, 8, 1],
];

export class Leg extends CompositeComponent {
  constructor(position: [number, number] = [0, 0], side = "left", pantsColor: Color = PANTS, shoeColor: Color = SHOES) {
    super();
    const [px, py] = position;
    const thigh = new Component();
    thigh.color = pantsColor;
    thigh.position = [px, py];
    thigh.rects = THIGH.map((r) => [...r]) as any;

    const calf = new Component();
    calf.color = pantsColor;
    calf.position = [px, py];
    calf.rects = CALF.map((r) => [...r]) as any;

    const shoe = new Component();
    shoe.color = shoeColor;
    const dx = side === "left" ? -2 : 2;
    shoe.position = [px + dx, py + 2];
    shoe.rects = FOOT.map((r) => [...r]) as any;

    this.children = [thigh, calf, shoe];
    this.position = position;
  }
}