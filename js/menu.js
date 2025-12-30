import {
  handleInput, tracks, startPosition, drivers, resource,
} from './util.js';
import Opponent from './opponent.js';
import Sprite from './sprite.js';

class Menu {
  constructor(width, height, animations) {
    this.showMenu = 0;
    this.height = height;
    this.state = 'title';
    this.width = width;
    this.menuY = 0;
    this.menuX = 5;
    this.updateTime = 6 / 60;
    this.updateAnimationsTime = 1 / 60;
    this.menuPhrase = {
      0: 'Select Track: ',
      1: 'Opponents: ',
      2: 'Difficulty: ',
      3: 'Music: ',
      4: 'Volume: ',
      5: 'Race ',
    };
    this.menu = {
      0: Object.keys(tracks),
      1: ['1', '3', '5', '7', '9', '11'],
      2: ['easy', 'medium', 'hard'],
      3: ['on', 'off'],
      4: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      5: ['start'],
    };
    this.selectedOptions = {
      0: 'starterland',
      1: '11',
      2: 'easy',
      3: 'on',
      4: '1',
      5: 'start',
    };
    this.arrowUpBlink = 0;
    this.arrowDownBlink = 0;
    this.menuTitle = { pos: 0, direction: 1 };
    this.animations = animations;
  }

  adjustDifficulty() {
    if (this.selectedOptions[2] === 'easy') return 0.87;
    if (this.selectedOptions[2] === 'medium') return 0.935;
    return 1;
  }

  startRace(player, road, opponents, director) {
    const roadParam = road;
    const zero = 0;
    drivers.forEach((driver) => opponents.push(new Opponent(
      driver.power * this.adjustDifficulty(),
      startPosition(tracks[this.selectedOptions[zero]].trackSize, driver.position),
      driver.trackSide, 'opponents', driver.name, driver.carColor,
    )));

    opponents.forEach((opponentNumber) => opponentNumber.create());
    opponents.splice(this.selectedOptions[1], opponents.length);
    roadParam.trackName = this.selectedOptions[zero];
    roadParam.create();
    player.create(this, tracks[this.selectedOptions[zero]].trackSize);
    director.create(road, this.selectedOptions[0]);
  }

  update(player, road, opponents, director) {
    const {
      arrowup, arrowdown, arrowleft, arrowright,
    } = handleInput.map;
    const maxX = Object.keys(this.menu).length - 1;
    const maxY = this.menu[this.menuX].length - 1;
    if (handleInput.mapPress.enter && !this.showMenu) {
      this.selectedOptions[3] = 'off';
      this.showMenu = 1;
      this.menuTitle.pos = 0;
      handleInput.mapPress.enter = false;
    }

    if (this.showMenu) {
      if (!arrowdown) this.arrowDownBlink = false;
      if (!arrowup) this.arrowUpBlink = false;

      if (this.menuX < maxX && arrowdown) {
        this.arrowDownBlink = !this.arrowDownBlink;
        this.menuX += 1;
        this.menuY = this.menu[this.menuX]
          .findIndex((item) => item === this.selectedOptions[this.menuX]);
      } else if (this.menuX === maxX && arrowdown) {
        this.arrowDownBlink = 1;
        this.menuX = 0;
        this.menuY = this.menu[this.menuX]
          .findIndex((item) => item === this.selectedOptions[this.menuX]);
      }

      if (this.menuX > 0 && arrowup) {
        this.arrowUpBlink = 1;
        this.menuX -= 1;
        this.menuY = this.menu[this.menuX]
          .findIndex((item) => item === this.selectedOptions[this.menuX]);
      } else if (this.menuX === 0 && arrowup) {
        this.arrowUpBlink = 1;
        this.menuX = maxX;
        this.menuY = this.menu[this.menuX]
          .findIndex((item) => item === this.selectedOptions[this.menuX]);
      }

      if (this.menuY < maxY && arrowright) this.menuY += 1;
      else if (this.menuY === maxY && arrowright) this.menuY = 0;

      if (this.menuY > 0 && arrowleft) this.menuY -= 1;
      else if (this.menuY === 0 && arrowleft) this.menuY = maxY;

      const lastMenuOption = Object.keys(this.menu).length - 1;

      if (this.menuX !== lastMenuOption) {
        this.selectedOptions[this.menuX] = this.menu[this.menuX][this.menuY];
        handleInput.mapPress.enter = false;
      }

      if (handleInput.mapPress.enter && this.menuX === lastMenuOption) {
        const pauseBtn = document.querySelector('#pauseBtn');
        const fps = document.querySelector('#fps');
        const mute = document.querySelector('#mute');
        pauseBtn.classList.toggle('hidden');
        mute.classList.toggle('hidden');
        const okBtn = document.querySelector('.rightControls').firstElementChild;
        okBtn.classList.toggle('hidden');
        this.startRace(player, road, opponents, director);
        this.state = 'race';
        handleInput.mapPress.enter = false;
        fps.firstElementChild.classList.remove('hidden');
      }
    }
  }

  static drawButtons(render, x, y, size, text) {
    render.drawCircle(x, y + 3, size, 0, Math.PI * 2);
    render.drawText('black', text, x, y, 1.3, 'Comic Sans', 'center');
  }

  render(render) {
    this.animations.forEach((item) => item.render(render));
    render.drawText('#8019ad', 'Outrun Racer', 320, 30, 4, 'Comic SansBold');

    if (!this.showMenu) {
      if (this.menuTitle.pos >= 12) this.menuTitle.direction = -1;
      if (this.menuTitle.pos <= -12) this.menuTitle.direction = 1;
      this.menuTitle.pos += (this.menuTitle.direction / 2);
      if (window.navigator.maxTouchPoints) {
        render.drawText('black', 'Press Enter To Start', 320, 180 + this.menuTitle.pos);
      } else {
        render.drawText('black', 'Press Enter To Start', 320, 180 + this.menuTitle.pos);
      }
    }

    if (this.showMenu) {
      if (this.menuTitle.pos >= 4) this.menuTitle.direction = -1;
      if (this.menuTitle.pos <= -4) this.menuTitle.direction = 1;
      this.menuTitle.pos += (this.menuTitle.direction / 2);
      const maxX = Object.keys(this.menu).length - 1;
      const menuLow = this.menuX - 1 >= 0 ? this.menuX - 1 : maxX;
      const menuHigh = this.menuX + 1 <= maxX ? this.menuX + 1 : 0;
      const lowText = `${this.menuPhrase[menuLow]} ${this.selectedOptions[menuLow].toLocaleUpperCase()}`;
      const highText = `${this.menuPhrase[menuHigh]} ${this.selectedOptions[menuHigh].toLocaleUpperCase()}`;

      render.roundRect('#9f2ceb', 100, 100, 440, 170, 20, true, false);
      render.drawText('#330642', lowText, 320, 180 - 45, 1.6);
      console.log('1', this.menuPhrase[this.menuX], '2', this.menu[this.menuX][this.menuY]);
      const phrase = `${this.menuPhrase[this.menuX]} ${this.menu[this.menuX][this.menuY].toLocaleUpperCase()}`;
      render.drawText('#050B1A', phrase, 320, 180 + (this.menuTitle.pos / 4), 1.6);
      render.drawText('#330642', highText, 320, 180 + 45, 1.6);

      if (window.navigator.maxTouchPoints) {
        Menu.drawButtons(render, 145, 310, 15, 'U');
        Menu.drawButtons(render, 185, 310, 15, 'D');
        Menu.drawButtons(render, 225, 310, 15, 'L');
        Menu.drawButtons(render, 265, 310, 15, 'R');
        render.drawText('black', 'Navigate', 150, 345, 1.3, 'Comic Sans', 'left');
        Menu.drawButtons(render, 418, 310, 18, 'OK');
        render.drawText('black', 'Confirm', 490, 345, 1.3, 'Comic Sans', 'right');
      } else {
        const arrowKeys = new Sprite();
        arrowKeys.image = resource.get('arrowKeys');
        arrowKeys.name = 'mnArrowKeys';

        const enterKey = new Sprite();
        enterKey.image = resource.get('enterKey');
        enterKey.name = 'mnEnterKey';

        render.drawText('black', 'Navigate', 590, 320, 1.3, 'Comic Sans', 'right');
        render.renderingThings.drawImage(arrowKeys.image, 595, 310, 28, 18);
        render.drawText('black', 'Confirm', 590, 345, 1.3, 'Comic Sans', 'right');
        render.renderingThings.drawImage(enterKey.image, 597, 335, 23, 18);
      }

      if (this.arrowUpBlink) {
        render.drawText('#050B1A', 'c', 520, 140, 2, 'Arrows');
      } else {
        render.drawText('#330642', 'c', 520, 140, 2, 'Arrows');
      }
      if (this.arrowDownBlink) {
        render.drawText('#050B1A', 'd', 520, 240, 2, 'Arrows');
      } else {
        render.drawText('#330642', 'd', 520, 240, 2, 'Arrows');
      }
    }
  }
}

export default Menu; //exports this to the main class 
