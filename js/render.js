class Render {

  constructor(renderingThings) {
    this.renderingThings = renderingThings;
  }

  clear(x, y, w, h) {
    this.renderingThings.clearRect(x, y, w, h);
  }

  save() {
    this.renderingThings.save();
  }

  restore() {
    this.renderingThings.restore();
  }

  drawTrapezium(x1, y1, w1, x2, y2, w2, color = 'green') {
    this.drawPolygon(color, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2);
  }

  drawPolygon(color, ...coords) {
    if (coords.length > 1) {
      const { renderingThings } = this;
      renderingThings.save();
      renderingThings.fillStyle = color;
      renderingThings.beginPath();
      renderingThings.moveTo(coords[0], coords[1]);
      for (let i = 2; i < coords.length; i += 2) {
        renderingThings.lineTo(coords[i], coords[(i + 1) % coords.length]);
      }
      renderingThings.closePath();
      renderingThings.fill();
      renderingThings.restore();
    }
  }

  drawCircle(x, y, radius, startAngle, endAngle, anticlockwise, color = 'black') {
    const { renderingThings } = this;
    renderingThings.beginPath();
    renderingThings.strokeStyle = color;
    renderingThings.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    renderingThings.stroke();
  }

  drawText(color, text, screenX = 300, screenY = 200, fontSize = '2',
    font = 'Comic Sans', align = 'center', colorStroke = 'black', stroke = false) {
    const { renderingThings } = this;
    renderingThings.fillStyle = color;
    renderingThings.font = font;
    renderingThings.font = `${fontSize}em ${font}`;
    renderingThings.textAlign = align;
    renderingThings.textBaseline = 'middle';
    renderingThings.fillText(text, screenX, screenY);
    renderingThings.strokeStyle = colorStroke;
    if (stroke) {
      renderingThings.strokeText(text, screenX, screenY);
    }
    renderingThings.restore();
  }

  drawSprite(sprite, camera, player, roadWidth, scale,
    destX, destY, clip, spritesInX = 1, spritesInY = 1) {
    let newDestX = destX;
    let newDestY = destY;
    const { midpoint } = camera.screen;
    const spriteWidth = sprite.width;
    const spriteHeight = sprite.height;
    const factor = 1 / 3;
    const offsetY = sprite.offsetY || 1;
    const {
      sheetPosX, sheetPosY, scaleX, scaleY,
    } = sprite;
    const destWidth = (spriteWidth * scale * midpoint.x)
      * (((roadWidth * scaleX) / (player.width ?? 64)) * factor);
    const destHeight = (spriteHeight * scale * midpoint.x)
      * (((roadWidth * scaleY) / (player.width ?? 64)) * factor);
    newDestX += -destWidth * 0.5;
    newDestY -= (destHeight * spritesInX * offsetY) / spritesInY;
    const clipHeight = clip ? Math.max(0, (newDestY + destHeight - clip)) : 0;

    if (clipHeight < destHeight) {
      this.renderingThings.drawImage(
        sprite.image,
        (spriteWidth / spritesInX) * sheetPosX, (spriteHeight / spritesInY) * sheetPosY,
        spriteWidth / spritesInX,
        (spriteHeight - (spriteHeight * clipHeight) / (destHeight * spritesInX)) / spritesInY,
        newDestX, newDestY,
        destWidth, (((destHeight * spritesInX) - clipHeight) / spritesInY),
      );
    }
  }

  roundRect(color, x, y, width, height, radius = 5, fill, stroke = true) {
    const { renderingThings } = this;

    const radii = {
      tl: 0, tr: 0, br: 0, bl: 0,
    };
    if (typeof radius === 'number') {
      radii.tl = radius;
      radii.tr = radius;
      radii.br = radius;
      radii.bl = radius;
    }
    renderingThings.fillStyle = color;
    renderingThings.beginPath();
    renderingThings.moveTo(x + radii.tl, y);
    renderingThings.lineTo(x + width - radii.tr, y);
    renderingThings.quadraticCurveTo(x + width, y, x + width, y + radii.tr);
    renderingThings.lineTo(x + width, y + height - radii.br);
    renderingThings.quadraticCurveTo(x + width, y + height, x + width - radii.br, y + height);
    renderingThings.lineTo(x + radii.bl, y + height);
    renderingThings.quadraticCurveTo(x, y + height, x, y + height - radii.bl);
    renderingThings.lineTo(x, y + radii.tl);
    renderingThings.quadraticCurveTo(x, y, x + radii.tl, y);
    renderingThings.closePath();

    if (fill) {
      renderingThings.fill();
    }
    if (stroke) {
      renderingThings.stroke();
    }
  }
}

export default Render;
