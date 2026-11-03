import { Component, CompositeComponent, Color } from "./base";
import { Head } from "./head";
import { Body } from "./body";
import { Weapon } from "./weapon";

export class GameIcon extends CompositeComponent {
  constructor(size: number = 64) {
    super();
    const bg: Color = [26, 26, 46, 255];
    const border: Color = [230, 200, 60, 255];
    const accent: Color = [180, 60, 60, 255];

    const background = new Component();
    background.color = bg;
    background.position = [0, 0];
    background.rects = [[0, 0, size, size]];

    // 2px border
    const borderComp = new Component();
    borderComp.color = border;
    borderComp.position = [0, 0];
    borderComp.rects = [
      [0, 0, size, 2], [0, size - 2, size, 2], [0, 0, 2, size], [size - 2, 0, 2, size],
    ];

    const head = new Head([Math.round(size / 2), Math.round(size * 0.32)]);
    const body = new Body([Math.round(size / 2), Math.round(size * 0.55)], accent);
    const weapon = new Weapon([Math.round(size * 0.72), Math.round(size * 0.45)]);

    const titleBar = new Component();
    titleBar.color = [230, 200, 60, 255];
    titleBar.position = [0, 0];
    titleBar.rects = [[Math.round(size * 0.15), Math.round(size * 0.78), Math.round(size * 0.7), 3]];

    this.children = [background, borderComp, head, body, weapon, titleBar];
  }
}