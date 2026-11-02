import { Component, CompositeComponent, Color } from "./base";

const SKIN: Color = [255, 200, 150, 255];
const HAIR: Color = [60, 40, 20, 255];
const EYES: Color = [20, 20, 20, 255];

const _HEAD_RECTS: [number, number, number, number][] = [
  [0, -8, 1, 1], [-3, -7, 7, 1], [-5, -6, 11, 1], [-6, -5, 13, 1], [-6, -4, 13, 1],
  [-7, -3, 15, 1], [-7, -2, 15, 1], [-7, -1, 15, 1], [-8, 0, 17, 1], [-7, 1, 15, 1],
  [-7, 2, 15, 1], [-7, 3, 15, 1], [-6, 4, 13, 1], [-6, 5, 13, 1], [-5, 6, 11, 1],
  [-3, 7, 7, 1], [0, 8, 1, 1],
];

export class Head extends CompositeComponent {
  constructor(position: [number, number] = [0, 0], skinColor: Color = SKIN, hairColor: Color = HAIR, eyeColor: Color = EYES) {
    super();
    const [px, py] = position;
    const skin = new Component();
    skin.color = skinColor;
    skin.position = [px, py];
    skin.rects = _HEAD_RECTS.map((r) => [...r]) as any;

    const hair = new Component();
    hair.color = hairColor;
    hair.position = [px, py];
    hair.rects = _HEAD_RECTS.map((r) => [...r]) as any;
    hair.clip = [-8, -8, 9, 5];

    const face = new Component();
    face.color = eyeColor;
    face.position = [px, py];
    face.rects = [[-1, 4, 3, 2]] as any;

    this.children = [skin, hair, face];
  }
}

export { SKIN as HEAD_SKIN, HAIR as HEAD_HAIR, EYES as HEAD_EYES };
