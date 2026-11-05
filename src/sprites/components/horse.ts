import { Component, CompositeComponent, Color } from "./base";

const BROWN: Color = [120, 70, 40, 255];
const DARK: Color = [80, 45, 25, 255];
const EYE: Color = [20, 20, 20, 255];

export class Horse extends CompositeComponent {
  constructor(position: [number, number] = [0, 0]) {
    super();
    const [px, py] = position;
    // body (oval from top)
    const body = new Component();
    body.color = BROWN;
    body.position = [px, py];
    body.rects = [
      [-10, -6, 20, 1], [-11, -5, 22, 1], [-11, -4, 22, 1], [-12, -3, 24, 1],
      [-12, -2, 24, 1], [-12, -1, 24, 1], [-12, 0, 24, 1], [-12, 1, 24, 1],
      [-12, 2, 24, 1], [-11, 3, 22, 1], [-11, 4, 22, 1], [-10, 5, 20, 1],
    ] as any;

    // neck (toward bottom/front)
    const neck = new Component();
    neck.color = BROWN;
    neck.position = [px, py + 9];
    neck.rects = [[-4, 0, 8, 5]] as any;

    // head
    const head = new Component();
    head.color = BROWN;
    head.position = [px, py + 16];
    head.rects = [[-5, 0, 10, 1], [-6, 1, 12, 1], [-6, 2, 12, 1], [-6, 3, 12, 1],
      [-6, 4, 12, 1], [-5, 5, 10, 1]] as any;

    // ear
    const ear = new Component();
    ear.color = DARK;
    ear.position = [px, py + 21];
    ear.rects = [[-2, 0, 4, 2]] as any;

    // eye
    const eye = new Component();
    eye.color = EYE;
    eye.position = [px + 3, py + 16];
    eye.rects = [[0, 0, 1, 1]] as any;

    // mane
    const mane = new Component();
    mane.color = DARK;
    mane.position = [px, py + 4];
    mane.rects = [[-2, -4, 4, 6]] as any;

    // legs (four small)
    const legs = [[-9, -6], [-5, -7], [5, -7], [9, -6]].map((d) => {
      const l = new Component();
      l.color = DARK;
      l.position = [px + d[0], py + d[1]];
      l.rects = [[-2, -4, 4, 4]] as any;
      return l;
    });

    const tail = new Component();
    tail.color = DARK;
    tail.position = [px, py - 9];
    tail.rects = [[-2, -4, 4, 4]] as any;

    this.children = [body, neck, head, ear, eye, mane, ...legs, tail];
    this.position = position;
  }
}
