import { Component, CompositeComponent, Color } from "./base";
import { Weapon } from "./weapon";

const HANDLE: Color = [110, 70, 35, 255];
const GUARD: Color = [200, 170, 60, 255];
const BLADE: Color = [225, 225, 235, 255];
const JADE: Color = [60, 160, 120, 255];

export class Sword extends Weapon {
  constructor(position: [number, number] = [0, 0]) {
    super(position);
    const handle = new Component();
    handle.color = HANDLE;
    handle.position = [position[0], position[1] + 12];
    handle.rects = [[0, 0, 4, 16]] as any;

    const guard = new Component();
    guard.color = GUARD;
    guard.position = [position[0] - 5, position[1] - 2];
    guard.rects = [[0, 0, 14, 3]] as any;

    const jade = new Component();
    jade.color = JADE;
    jade.position = [position[0], position[1] + 4];
    jade.rects = [[0, 0, 4, 4]] as any;

    const blade = new Component();
    blade.color = BLADE;
    blade.position = [position[0] - 1, position[1] - 26];
    blade.rects = [[0, 0, 6, 30]] as any;

    const tip = new Component();
    tip.color = BLADE;
    tip.position = [position[0], position[1] - 28];
    tip.rects = [[0, 0, 4, 2]] as any;

    this.children = [handle, guard, jade, blade, tip];
    this.position = position;
  }
}