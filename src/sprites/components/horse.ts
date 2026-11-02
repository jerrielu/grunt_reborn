import { Component, CompositeComponent, Color } from "./base";

const BROWN: Color = [120, 70, 40, 255];
const DARK: Color = [80, 45, 25, 255];
const EYE: Color = [20, 20, 20, 255];

export class Horse extends CompositeComponent {
  constructor(position: [number, number] = [0, 0]) {
    super();
    const [px, py] = position;
    const body = new Component();
    body.color = BROWN;
    body.position = [px, py];
    body.rects = [[-12, -6, 24, 12]] as any;

    const neck = new Component();
    neck.color = BROWN;
    neck.position = [px + 12, py - 8];
    neck.rects = [[-3, -6, 6, 8]] as any;

    const head = new Component();
    head.color = BROWN;
    head.position = [px + 16, py - 14];
    head.rects = [[-4, -4, 8, 8]] as any;

    const ear = new Component();
    ear.color = DARK;
    ear.position = [px + 14, py - 18];
    ear.rects = [[0, -2, 2, 2]] as any;

    const eye = new Component();
    eye.color = EYE;
    eye.position = [px + 18, py - 14];
    eye.rects = [[0, 0, 1, 1]] as any;

    const mane = new Component();
    mane.color = DARK;
    mane.position = [px + 8, py - 12];
    mane.rects = [[0, -4, 3, 6]] as any;

    const legs = [-8, -2, 8, 14].map((dx) => {
      const l = new Component();
      l.color = DARK;
      l.position = [px + dx, py + 6];
      l.rects = [[-2, 0, 3, 8]] as any;
      return l;
    });

    const tail = new Component();
    tail.color = DARK;
    tail.position = [px - 12, py - 2];
    tail.rects = [[-3, -2, 3, 6]] as any;

    this.children = [body, neck, head, ear, eye, mane, ...legs, tail];
    this.position = position;
  }
}