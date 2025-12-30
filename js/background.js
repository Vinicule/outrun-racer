import Sprite from './sprite.js';
import { resource } from './util.js';

class Background {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.layer1Speed = 0.001;
    this.layer2Speed = 0.002;
    this.layer3Speed = 0.003;
    this.layer1Offset = 0;
    this.layer2Offset = 0;
    this.layer3Offset = 0;
    this.layer1 = new Sprite();
    this.layer2 = new Sprite();
    this.layer3 = new Sprite();
  }

  create() {
    this.layer1.image = resource.get('skyClear');
    this.layer2.image = resource.get('hill');
    this.layer3.image = resource.get('tree');
    this.layer1.name = 'bgSky';
    this.layer2.name = 'bgHill';
    this.layer3.name = 'bgTree';
  }

  update(player, camera, road, director) {
    if (director.paused) {
      const increase = (start, increment, max) => {
        let result = start + increment;
        while (result >= max) { result -= max; }
        while (result < 0) { result += max; }
        return result;
      };
      const segment = road.getSegment(camera.cursor);
      const speedPercent = player.runningPower / player.maxSpeed;
      
      this.layer1Offset = increase(
        this.layer1Offset, this.layer1Speed * segment.curve * speedPercent * -1, 2,
      );
      this.layer2Offset = increase(
        this.layer2Offset, this.layer2Speed * segment.curve * speedPercent * -1, 2,
      );
      this.layer3Offset = increase(
        this.layer3Offset, this.layer3Speed * segment.curve * speedPercent * -1, 2,
      );
    }
  }

  render(render, camera, player, roadWidth) {
    const ctx = render.renderingThings;
    const { width, height } = ctx.canvas;

    // Helper to draw a scrolling background layer
    const drawLayer = (layer, offset, verticalOffset) => {
      const img = layer.image;
      if (!img) return;

      const rotation = (offset * width) % width; 
      
      const destY = verticalOffset || 0;
      const imgH = img.height;
      
      // Draw Left Side
      ctx.drawImage(
        img, 
        0, 0, img.width, imgH, // Source
        -rotation, destY, width, height / 2  // Dest (Stretched to width, half height)
      );
      
      // Draw Right Side (to fill the gap as it scrolls)
      ctx.drawImage(
        img, 
        0, 0, img.width, imgH, 
        width - rotation, destY, width, height / 2
      );

      // Handle the case where rotation is negative or wraps weirdly
      if (rotation > 0) {
         ctx.drawImage(
          img, 
          0, 0, img.width, imgH, 
          -rotation + width, destY, width, height / 2
        );
      }
    };


    drawLayer(this.layer1, this.layer1Offset, 0);

    drawLayer(this.layer2, this.layer2Offset, 10);

    // Trees (Layer 3)
    drawLayer(this.layer3, this.layer3Offset, 20);
  }
}

export default Background;