import { Component, CompositeComponent, Color } from "./base";

const _LEG_RECTS: [number, number, number, number][] = [
  [-3, -4, 6, 1], [-3, -3, 6, 1], [-3, -2, 6, 1], [-3, -1, 6, 1],
  [-3, 0, 6, 1], [-3, 1, 6, 1],
];
const _SHOE_RECTS: [number, number, number, number][] = [
  [-4, 0, 8, 1], [-4, 1, 8, 1], [-4, 2, 8, 1],
];

const PANTS: Color = [60, 60, 80, 255];
const SHOES: Color = [40, 40, 40, 255];

export class Leg extends CompositeComponent {
  constructor(position: [number, number] = [0, 0], side = "left", pantsColor: Color = PANTS, shoeColor: Color = SHOES) {
    super();
    const leg = new Component();
    leg.color = pantsColor;
    leg.position = position;
    leg.rects = _LEG_RECTS.map((r) => [...r]) as any;

    const shoe = new Component();
    shoe.color = shoeColor;
    const dx = side === "left" ? -2 : 2;
    shoe.position = [position[0] + dx, position[1] + 5];
    shoe.rects = _SHOE_RECTS.map((r) => [...r]) as any;

    this.children = [leg, shoe];
  }
}
