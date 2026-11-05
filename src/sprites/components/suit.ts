import { Component, CompositeComponent, Color } from "./base";

const JACKET: Color = [25, 35, 80, 255];
const SHIRT: Color = [230, 230, 235, 255];
const TIE: Color = [180, 40, 40, 255];
const TIE_KNOT: Color = [150, 30, 30, 255];

const _JACKET_RECTS: [number, number, number, number][] = [
  [-9, -5, 18, 1], [-9, -4, 18, 1], [-9, -3, 18, 1], [-9, -2, 18, 1],
  [-9, -1, 18, 1], [-9, 0, 18, 1], [-9, 1, 18, 1], [-9, 2, 18, 1],
  [-9, 3, 18, 1], [-9, 4, 18, 1],
  [-7, 5, 14, 1], [-7, 6, 14, 1],
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
    shirt.rects = [[-3, -5, 6, 4], [-2, -1, 4, 3]] as any;

    const knot = new Component();
    knot.color = TIE_KNOT;
    knot.position = [px, py];
    knot.rects = [[-2, -2, 4, 2]] as any;

    const tie = new Component();
    tie.color = TIE;
    tie.position = [px, py];
    tie.rects = [[-1, 0, 2, 8]] as any;

    this.children = [jacket, shirt, knot, tie];
    this.position = position;
  }
}

export { JACKET as SUIT_JACKET, SHIRT as SUIT_SHIRT, TIE as SUIT_TIE };