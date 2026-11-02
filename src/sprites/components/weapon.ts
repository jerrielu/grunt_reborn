import { Component, CompositeComponent, Color } from "./base";

const WOOD: Color = [140, 90, 50, 255];
const STEEL: Color = [200, 200, 210, 255];

export class Weapon extends CompositeComponent {
  constructor(position: [number, number] = [0, 0]) {
    super();
    const shaft = new Component();
    shaft.color = WOOD;
    shaft.position = position;
    shaft.rects = [[0, 0, 5, 40]] as any;

    const blade = new Component();
    blade.color = STEEL;
    blade.position = [position[0] - 2, position[1] - 10];
    blade.rects = [[0, 0, 9, 14]] as any;

    this.children = [shaft, blade];
    this.position = position;
  }
}