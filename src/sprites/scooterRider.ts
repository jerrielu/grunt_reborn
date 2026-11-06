import { SpriteTemplate } from "./sprite_template";
import { Component, Color } from "./components/base";

const DARK: Color = [30, 30, 35, 255];
const GRAY: Color = [80, 80, 90, 255];
const LIGHTGRAY: Color = [150, 150, 160, 255];
const YELLOW: Color = [255, 204, 0, 255];
const YELLOW_DARK: Color = [200, 160, 0, 255];
const WHITE: Color = [255, 255, 255, 255];
const LAMP: Color = [120, 220, 255, 255];
const LAMP_GLOW: Color = [200, 240, 255, 200];

export class ScooterRiderTemplate extends SpriteTemplate {
  static WIDTH = 32;
  static HEIGHT = 32;
  static DEFAULT_OUTPUT = "scooterRider.png";

  constructor() {
    super();
    const components: any[] = [];
    // ground shadow
    const shadow = new Component(); shadow.color = [0, 0, 0, 90]; shadow.position = [0, 0]; shadow.rects = [[8, 28, 16, 3]];
    components.push(shadow);
    // rear wheel
    const rearWheel = new Component(); rearWheel.color = DARK; rearWheel.position = [0, 0]; rearWheel.rects = [[7, 24, 18, 7]];
    components.push(rearWheel);
    const rearWheelHi = new Component(); rearWheelHi.color = LIGHTGRAY; rearWheelHi.position = [0, 0]; rearWheelHi.rects = [[7, 24, 18, 2]];
    components.push(rearWheelHi);
    // motorcycle frame/body
    const frame = new Component(); frame.color = GRAY; frame.position = [0, 0]; frame.rects = [[9, 16, 14, 7]];
    components.push(frame);
    const frameShade = new Component(); frameShade.color = DARK; frameShade.position = [0, 0]; frameShade.rects = [[9, 21, 14, 2]];
    components.push(frameShade);
    const frameHi = new Component(); frameHi.color = LIGHTGRAY; frameHi.position = [0, 0]; frameHi.rects = [[9, 16, 14, 2]];
    components.push(frameHi);
    // seat
    const seat = new Component(); seat.color = DARK; seat.position = [0, 0]; seat.rects = [[10, 17, 12, 3]];
    components.push(seat);
    // handlebars
    const handleL = new Component(); handleL.color = LIGHTGRAY; handleL.position = [0, 0]; handleL.rects = [[6, 15, 4, 2]];
    components.push(handleL);
    const handleR = new Component(); handleR.color = LIGHTGRAY; handleR.position = [0, 0]; handleR.rects = [[22, 15, 4, 2]];
    components.push(handleR);
    // rider body
    const body = new Component(); body.color = YELLOW; body.position = [0, 0]; body.rects = [[11, 10, 10, 6]];
    components.push(body);
    const bodyShade = new Component(); bodyShade.color = YELLOW_DARK; bodyShade.position = [0, 0]; bodyShade.rects = [[11, 14, 10, 2]];
    components.push(bodyShade);
    // bag
    const bag = new Component(); bag.color = WHITE; bag.position = [0, 0]; bag.rects = [[19, 11, 5, 5]];
    components.push(bag);
    const bagShade = new Component(); bagShade.color = [220, 220, 220, 255]; bagShade.position = [0, 0]; bagShade.rects = [[19, 15, 5, 1]];
    components.push(bagShade);
    // helmet
    const helmet = new Component(); helmet.color = YELLOW; helmet.position = [0, 0]; helmet.rects = [[10, 3, 12, 8]];
    components.push(helmet);
    const helmetShade = new Component(); helmetShade.color = YELLOW_DARK; helmetShade.position = [0, 0]; helmetShade.rects = [[10, 9, 12, 2]];
    components.push(helmetShade);
    const helmetHi = new Component(); helmetHi.color = [255, 230, 80, 255]; helmetHi.position = [0, 0]; helmetHi.rects = [[10, 3, 12, 2]];
    components.push(helmetHi);
    // ears/antennae
    const earL = new Component(); earL.color = WHITE; earL.position = [0, 0]; earL.rects = [[9, 1, 2, 5]];
    components.push(earL);
    const earR = new Component(); earR.color = WHITE; earR.position = [0, 0]; earR.rects = [[21, 1, 2, 5]];
    components.push(earR);
    // top lamp on head
    const lampGlow = new Component(); lampGlow.color = LAMP_GLOW; lampGlow.position = [0, 0]; lampGlow.rects = [[13, 0, 6, 2]];
    components.push(lampGlow);
    const lamp = new Component(); lamp.color = LAMP; lamp.position = [0, 0]; lamp.rects = [[14, 0, 4, 2]];
    components.push(lamp);
    this.COMPONENTS = components;
  }
}
