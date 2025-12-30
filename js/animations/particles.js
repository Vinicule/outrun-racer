import { canvas } from '../util.js';

const particleArray = [];

const connect = (render) => {
  const { renderingThings } = render;
  for (let a = 0; a < particleArray.length; a += 1) {
    for (let b = a; b < particleArray.length; b += 1) {
      const distance = ((particleArray[a].x - particleArray[b].x) * (particleArray[a].x - particleArray[b].x))
        + ((particleArray[a].y - particleArray[b].y) * (particleArray[a].y - particleArray[b].y));
      if (distance < (canvas.width / 3) * (canvas.height / 3)) {
        renderingThings.beginPath();
        renderingThings.moveTo(particleArray[a].x, particleArray[a].y);
        renderingThings.stroke();
      }
    }
  }
};

class Particle {
  constructor(x, y, dirX, dirY, size, color) {
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.size = size;
    this.color = color;
    this.speed = 12;
    this.updateTime = 1 / 60;
  }

  update() {
    if (this.x > canvas.width || this.x < 0) this.dirX = -this.dirX;
    if (this.y > canvas.height || this.y < 0) this.dirY = -this.dirY;
    this.x += this.dirX;
    this.y += this.dirY;
  }

  render(render) {
    const { renderingThings } = render;
    renderingThings.beginPath();
    renderingThings.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    renderingThings.fillStyle = this.color;
    renderingThings.fill();
    connect(render);
  }
}

const init = () => {
  const { height, width } = canvas;
  const numberOfParticles = 32;
  for (let i = 0; i < numberOfParticles; i += 1) {
    const size = (Math.random() * 2) + 2;
    const x = (Math.random() * ((width - size * 2) - (size * 2)) + size * 2);
    const y = (Math.random() * ((height - size * 2) - (size * 2)) + size * 2);
    const dirX = (Math.random() * 2);
    const dirY = (Math.random() * 2);
    const color = '#4462eb';
    particleArray.push(new Particle(x, y, dirX, dirY, size, color));
  }
  return particleArray;
};

const particles = init();

export default particles;
