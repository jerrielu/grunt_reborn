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
const RED: Color = [220, 60, 60, 255];
const ORANGE: Color = [240, 140, 40, 255];

export class ScooterRiderTemplate extends SpriteTemplate {
  static WIDTH = 32;
  static HEIGHT = 32;
  static DEFAULT_OUTPUT = "scooterRider.png";

  constructor() {
    super();
    const components: any[] = [];
    // ground shadow
    const shadow = new Component(); shadow.color = [0, 0, 0, 90]; shadow.position = [0, 0]; shadow.rects = [[4, 29, 24, 2]];
    components.push(shadow);
    // rear wheel (left)
    const rearWheel = new Component(); rearWheel.color = DARK; rearWheel.position = [0, 0]; rearWheel.rects = [[5, 22, 8, 7]];
    components.push(rearWheel);
    const rearWheelHi = new Component(); rearWheelHi.color = LIGHTGRAY; rearWheelHi.position = [0, 0]; rearWheelHi.rects = [[5, 22, 8, 2]];
    components.push(rearWheelHi);
    // front wheel (right)
    const frontWheel = new Component(); frontWheel.color = DARK; frontWheel.position = [0, 0]; frontWheel.rects = [[20, 22, 8, 7]];
    components.push(frontWheel);
    const frontWheelHi = new Component(); frontWheelHi.color = LIGHTGRAY; frontWheelHi.position = [0, 0]; frontWheelHi.rects = [[20, 22, 8, 2]];
    components.push(frontWheelHi);
    // frame (horizontal body)
    const frame = new Component(); frame.color = GRAY; frame.position = [0, 0]; frame.rects = [[8, 16, 18, 4]];
    components.push(frame);
    const frameHi = new Component(); frameHi.color = LIGHTGRAY; frameHi.position = [0, 0]; frameHi.rects = [[8, 16, 18, 1]];
    components.push(frameHi);
    const frameShade = new Component(); frameShade.color = DARK; frameShade.position = [0, 0]; frameShade.rects = [[8, 19, 18, 1]];
    components.push(frameShade);
    // seat
    const seat = new Component(); seat.color = DARK; seat.position = [0, 0]; seat.rects = [[10, 14, 12, 3]];
    components.push(seat);
    // handlebars (front, up)
    const handle = new Component(); handle.color = LIGHTGRAY; handle.position = [0, 0]; handle.rects = [[24, 10, 2, 7]];
    components.push(handle);
    const handleGrip = new Component(); handleGrip.color = DARK; handleGrip.position = [0, 0]; handleGrip.rects = [[23, 9, 4, 2]];
    components.push(handleGrip);
    // rider legs
    const legL = new Component(); legL.color = YELLOW_DARK; legL.position = [0, 0]; legL.rects = [[12, 17, 3, 6]];
    components.push(legL);
    const legR = new Component(); legR.color = YELLOW_DARK; legR.position = [0, 0]; legR.rects = [[16, 17, 3, 6]];
    components.push(legR);
    // rider body (sitting)
    const body = new Component(); body.color = YELLOW; body.position = [0, 0]; body.rects = [[11, 8, 9, 7]];
    components.push(body);
    const bodyShade = new Component(); bodyShade.color = YELLOW_DARK; bodyShade.position = [0, 0]; bodyShade.rects = [[11, 13, 9, 2]];
    components.push(bodyShade);
    // arms
    const arm = new Component(); arm.color = YELLOW; arm.position = [0, 0]; arm.rects = [[19, 9, 5, 3]];
    components.push(arm);
    // helmet
    const helmet = new Component(); helmet.color = YELLOW; helmet.position = [0, 0]; helmet.rects = [[10, 0, 10, 8]];
    components.push(helmet);
    const helmetHi = new Component(); helmetHi.color = [255, 230, 80, 255]; helmetHi.position = [0, 0]; helmetHi.rects = [[10, 0, 10, 2]];
    components.push(helmetHi);
    const helmetShade = new Component(); helmetShade.color = YELLOW_DARK; helmetShade.position = [0, 0]; helmetShade.rects = [[10, 6, 10, 2]];
    components.push(helmetShade);
    const visor = new Component(); visor.color = DARK; visor.position = [0, 0]; visor.rects = [[18, 2, 3, 4]];
    components.push(visor);
    // lamp on helmet
    const lampGlow = new Component(); lampGlow.color = LAMP_GLOW; lampGlow.position = [0, 0]; lampGlow.rects = [[13, -1, 6, 2]];
    components.push(lampGlow);
    const lamp = new Component(); lamp.color = LAMP; lamp.position = [0, 0]; lamp.rects = [[14, -1, 4, 2]];
    components.push(lamp);
    // delivery bag (外卖) on rear
    const bag = new Component(); bag.color = ORANGE; bag.position = [0, 0]; bag.rects = [[4, 7, 7, 8]];
    components.push(bag);
    const bagShade = new Component(); bagShade.color = [200, 100, 30, 255]; bagShade.position = [0, 0]; bagShade.rects = [[4, 13, 7, 2]];
    components.push(bagShade);
    const bagStripe = new Component(); bagStripe.color = WHITE; bagStripe.position = [0, 0]; bagStripe.rects = [[5, 9, 5, 2]];
    components.push(bagStripe);
    const bagLogo = new Component(); bagLogo.color = RED; bagLogo.position = [0, 0]; bagLogo.rects = [[6, 10, 3, 3]];
    components.push(bagLogo);
    this.COMPONENTS = components;
  }
}