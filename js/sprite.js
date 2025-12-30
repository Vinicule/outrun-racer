class Sprite {

  constructor() {
    this.image = {};
    this.offsetX = 0;
    this.offsetY = 0;
    this.sheetPosX = 0;
    this.sheetPosY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.spritesInX = 1;
    this.spritesInY = 1;
    this.name = 'sprite';
    this.runningPower = { speed: 0, mult: 0 };
  }

  get width() {
    return this.image.width;
  }

  get height() {
    return this.image.height;
  }
}

export default Sprite;
