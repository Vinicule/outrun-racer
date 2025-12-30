import { canvas } from '../util.js';

const arrRain = [];
const { width, height } = canvas;

class RainDrop {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 0.9;
    this.directionX = -4 + Math.random() * 4 + 2;
    this.directionY = Math.random() * 5 + 10;
  }

  update() {
    this.x += this.directionX;
    this.y += this.directionY;
    if (this.x > width || this.y > height) {
      this.x = Math.random() * width;
      this.y = -20;
    }
  }

  render(render, player) {
    const { renderingThings } = render;
    const { maxSpeed, runningPower } = player;
    const accel = runningPower / maxSpeed;
    renderingThings.strokeStyle = 'rgba(174,194,224,0.9)';
    renderingThings.lineWidth = 0.5;
    renderingThings.lineCap = 'round';
    renderingThings.beginPath();
    renderingThings.moveTo(this.x, this.y);
    const drizzle = (this.directionY * accel) / 1.66;
    renderingThings.lineTo(this.x + this.size * drizzle, this.y + this.size * this.directionY);
    renderingThings.stroke();
  }
}

const rain = (rainDrops) => {
  for (let i = 0; i < rainDrops; i += 1) arrRain.push(new RainDrop());
  return arrRain;
};

export default rain;
