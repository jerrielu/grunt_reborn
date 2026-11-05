import { Component, CompositeComponent, Color } from "./base";

const JACKET: Color = [25, 35, 80, 255];
const SHIRT: Color = [230, 230, 235, 255];
const TIE: Color = [180, 40, 40, 255];
const TIE_KNOT: Color = [150, 30, 30, 255];

const _JACKET_RECTS: [number, number, number, number][] = [
  [-6, -7, 12, 1], [-7, -6, 14, 1], [-8, -5, 16, 1], [-8, -4, 16, 1],
  [-8, -3, 16, 1], [-8, -2, 16, 1], [-8, -1, 16, 1], [-8, 0, 16, 1],
  [-8, 1, 16, 1], [-8, 2, 16, 1], [-7, 3, 14, 1], [-7, 4, 14, 1],
  [-6, 5, 12, 1], [-5, 6, 10, 1],
];

export class SuitBody extends CompositeComponent {
  constructor(position: [number, number] = [0, 0]) {
    super();
    const [px, py] = position;

    const jacket = new Component();
    jacket.color = JACKET;
    jacket.position = [px, py];
    jacket.rects = _JACKET_RECTS.map((r) => [...r]) as any;

    const shirt = new Component();
    shirt.color = SHIRT;
    shirt.position = [px, py];
    shirt.rects = [[-3, -6, 6, 5], [-2, -1, 4, 5]] as any;

    const knot = new Component();
    knot.color = TIE_KNOT;
    knot.position = [px, py];
    knot.rects = [[-2, -2, 4, 2]] as any;

    const tie = new Component();
    tie.color = TIE;
    tie.position = [px, py];
    tie.rects = [[-1, 0, 2, 10]] as any;

    this.children = [jacket, shirt, knot, tie];
    this.position = position;
  }
}

export { JACKET as SUIT_JACKET, SHIRT as SUIT_SHIRT, TIE as SUIT_TIE };