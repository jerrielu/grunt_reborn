import { Component, CompositeComponent, Color } from "./base";

const SKIN: Color = [255, 200, 150, 255];

const UPPER: [number, number, number, number][] = [
  [-2, -4, 4, 1], [-2, -3, 4, 1], [-2, -2, 4, 1], [-2, -1, 4, 1],
];
const LOWER: [number, number, number, number][] = [
  [-2, 0, 4, 1], [-2, 1, 4, 1], [-2, 2, 4, 1], [-2, 3, 4, 1],
];
const HAND: [number, number, number, number][] = [
  [-3, 4, 6, 1], [-3, 5, 6, 1],
];

export class Arm extends CompositeComponent {
  constructor(position: [number, number] = [0, 0], color: Color = SKIN, mirrored = false) {
    super();
    const [px, py] = position;
    const upper = new Component();
    upper.color = color;
    upper.position = [px, py];
    upper.rects = UPPER.map((r) => [...r]) as any;

    const lower = new Component();
    lower.color = color;
    lower.position = [px, py];
    lower.rects = LOWER.map((r) => [...r]) as any;

    const hand = new Component();
    hand.color = SKIN;
    hand.position = [px, py];
    hand.rects = HAND.map((r) => [...r]) as any;

    this.children = [upper, lower, hand];
    this.position = position;
    this.mirrored = mirrored;
  }
}