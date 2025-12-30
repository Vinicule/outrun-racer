import {
  handleInput, formatTime, addItens, resource, tracks, canvas,
} from './util.js';
import Sprite from './sprite.js';
import rain from './animations/rain.js';

class Director {
  constructor() {
    this.realTime = 0;
    this.totalTime = 0;
    this.animTime = 0;
    this.timeSinceLastFrameSwap = 0;
    this.lap = 0;
    this.lastLap = 0;
    this.fastestLap = 0;
    this.totalLaptimes = [];
    this.laptimes = [];
    this.position = '';
    this.positions = [];
    this.running = true;
    this.startLights = new Sprite();
    this.paused = false;
    this.hudPositions = [];
    this.trackName = '';
    this.startTimer = 5000;
    this.carSegments = [];
    this.raining = false;
    this.rain = [];
    // Finish flag
    this.finish = false;
  }

  create(road, trackName) {
    //  Reset race variables
    this.totalTime = 0;
    this.animTime = 0;
    this.lap = 0;
    this.lastLap = 0;
    this.fastestLap = 0;
    this.totalLaptimes = [];
    this.laptimes = [];
    this.positions = [];
    this.finish = false;
    this.running = true;

    handleInput.mapPress.p = true;

    const segmentLineTen = road.getSegmentFromIndex(tracks[road.trackName].trackSize - 3);
    
    this.trackName = trackName;
    this.startLights.offsetX = 0;
    this.startLights.offsetY = 2;
    this.startLights.scaleX = 27;
    this.startLights.scaleY = 27;
    this.startLights.spritesInX = 6;
    this.startLights.sheetPosX = Math.ceil(this.animTime / 500);
    this.startLights.image = resource.get('startLights');
    this.startLights.name = 'tsStartLights';
    

    segmentLineTen.sprites.push(this.startLights);

    const startLineLeft = new Sprite();
    startLineLeft.offsetX = -1.15;
    startLineLeft.scaleX = 216;
    startLineLeft.scaleY = 708;
    startLineLeft.image = resource.get('startLightsBar');
    startLineLeft.name = 'tsStartLightsBar';

    const startLineRight = new Sprite();
    startLineRight.offsetX = 1.15;
    startLineRight.scaleX = 216;
    startLineRight.scaleY = 708;
    startLineRight.image = resource.get('startLightsBar');
    startLineRight.name = 'tsStartLightsBar';

    segmentLineTen.sprites.push(startLineLeft);
    segmentLineTen.sprites.push(startLineRight);

    const rainDrops = Math.random() * 500 + 100;
    this.rain = rain(rainDrops);
    this.raining = Math.round(Math.random() * 5) % 3 === 0;
    if (this.raining) canvas.classList.add('filter');
  }

  refreshPositions(player, opponents) {
    let arr = [];
    const {
      name, trackPosition, raceTime, x,
    } = player;
    arr.push({
      name, pos: trackPosition, raceTime, x: Number(x.toFixed(3)),
    });

    opponents.forEach((opp) => {
      const { opponentName, sprite } = opp;
      arr.push({
        name: opponentName,
        pos: opp.trackPosition,
        raceTime: opp.raceTime,
        x: Number((sprite.offsetX * 2).toFixed(3)),
      });
    });
    arr.sort((a, b) => b.pos - a.pos);
    arr = arr.map((item, index) => ({ ...item, position: index + 1 }));
    this.positions = arr;
  }

  update(player, opponent) {
    this.paused = handleInput.mapPress.p;
    
    //  Logic to handle running state, start timer, and finish state
    if (this.totalTime < this.startTimer || !this.paused || this.finish) {
      this.running = false;
    } else if (this.totalTime >= this.startTimer && this.paused && !this.finish) {
      this.running = true;
    }

    this.totalTime += (1 / 60) * 1000 * this.paused;
    this.animTime += (1 / 60) * 1000 * this.paused;
    this.lastLap = this.laptimes[this.lap - 2] ? this.laptimes[this.lap - 2] : 0;
    this.fastestLap = this.laptimes.length ? Math.min.apply(null, this.laptimes) : 0;

    this.position = (this.positions.findIndex((elem) => elem.name === player.name) + 1).toString();
    if (this.position < 10) this.position = `0${this.position}`;
    let numberOfCars = this.positions.length;
    if (numberOfCars < 10) numberOfCars = `0${numberOfCars}`;

    this.refreshPositions(player, opponent);
    if (this.animTime > this.startTimer) this.startLights.sheetPosX = 0;
    else if (this.animTime > 2000 + 2500) this.startLights.sheetPosX = 5;
    else if (this.animTime > 2000 + 2000) this.startLights.sheetPosX = 4;
    else if (this.animTime > 2000 + 1500) this.startLights.sheetPosX = 3;
    else if (this.animTime > 2000 + 1000) this.startLights.sheetPosX = 2;
    else if (this.animTime > 2000 + 500) this.startLights.sheetPosX = 1;

    if (this.paused) {
      const actualPos = Number(this.position);
      this.hudPositions = this.positions.filter((_, index) => {
        if (actualPos <= 2) return index <= 2 && index >= 0;
        if (actualPos === this.positions.length) return index === 0 || index >= actualPos - 2;
        return (index === 0) || (index >= actualPos - 2 && index <= actualPos - 1);
      }).map((item, index, array) => {
        const result = {
          pos: item.position, name: item.name, lap: item.raceTime.length, relTime: '- Leader', totalTime: (Math.round(item.raceTime.at(-1)) / 1000).toFixed(3),
        };
        const actualItem = item.raceTime.at(-1);
        const actualLap = item.raceTime.length;

        if (index) {
          const prevItem = array[index - 1].raceTime.at(-1) || 0;
          const prevLap = array[index - 1].raceTime.length || 0;
          if (actualLap === prevLap) {
            result.relTime = `+ ${(Math.round(actualItem - prevItem) / 1000).toFixed(3)}`;
          } else if (actualLap !== prevLap) {
            result.relTime = `- ${prevLap - actualLap} Lap`;
          }
        }
        return result;
      });

      this.carSegments = this.positions.map((driver) => ({
        name: driver.name,
        pos: Math.floor(driver.pos / 200) % tracks[this.trackName].trackSize,
        x: driver.x,
      })).sort((a, b) => a.pos - b.pos);

      if (this.raining) this.rain.forEach((item) => item.update());
      
      // Check if race is finished
      if (this.lap > tracks[this.trackName].laps && !this.finish) {
        this.finish = true;
        this.running = false;
      }
    }
  }

  render(render, player) {
    if (!this.paused) {
      render.drawText('#FFFF00', 'Game Paused!', 320, 175,
        2, 'Comic Sans', 'center', 'black', true);
    }
    if (!this.paused) { 
      render.drawText('#FFFF00', 'Press P to Continue', 320, 215, 
        2, 'Comic Sans', 'center', 'black', true);
    }
    if (this.totalTime < 2500) {
      render.drawText('#FFFF00', 'GET READY!', 320, 135,
        2, 'Comic Sans', 'center', 'black', true);
    }
  
    // --- HUD BACKGROUNDS ---
    // Left Panel (Lap & Leaderboard)
    render.roundRect('rgba(0, 0, 0, 0.5)', 2, 25, 145, 90, 5, true, false);
    
    // Right Panel (Times)
    render.roundRect('rgba(0, 0, 0, 0.5)', 490, 25, 148, 80, 5, true, false);
    // -----------------------

    // Left Side Stats (Changed color to White/Yellow for visibility)
    render.drawText('#FFFF00', `Lap ${this.lap} of ${tracks[this.trackName].laps}`, 10, 44, 0.8, 'Comic Sans', 'left');
    
    this.hudPositions.forEach(({ pos, name, relTime }, index) => {
      const alignPos = pos < 10 ? `0${pos}` : pos;
      // Position Number
      render.drawText('#FFFFFF', `${alignPos}`, 10, `${60 + (index * 16)}`, 0.8, 'Comic Sans', 'left');
      // Name & Time
      render.drawText('#FFFFFF', `${name} ${relTime}`, 38, `${60 + (index * 16)}`, 0.8, 'Comic Sans', 'left');
    });

    // Right Side Stats
    render.drawText('#FFFFFF', `Total: ${formatTime(this.totalTime)}`, 630, 44, 0.8, 'Comic Sans', 'right');
    render.drawText('#FFFFFF', `Lap: ${formatTime(this.animTime)}`, 630, 60, 0.8, 'Comic Sans', 'right');
    render.drawText('#FFFFFF', `Last: ${formatTime(this.lastLap)}`, 630, 76, 0.8, 'Comic Sans', 'right');
    render.drawText('#FFFFFF', `Fastest: ${formatTime(this.fastestLap)}`, 630, 92, 0.8, 'Comic Sans', 'right');

    if (this.raining) this.rain.forEach((item) => item.render(render, player));

    //  Render Result Screen
    if (this.finish) {
      render.roundRect('#050B1A', 100, 100, 440, 170, 20, true, false);
      render.drawText('#FFFF00', 'RACE FINISHED', 320, 130, 2, 'Comic Sans', 'center');
      render.drawText('#FFFFFF', `Position: ${this.position}`, 320, 170, 1.5, 'Comic Sans', 'center');
      render.drawText('#FFFFFF', `Time: ${formatTime(this.totalTime)}`, 320, 200, 1.5, 'Comic Sans', 'center');
      render.drawText('#FFFFFF', 'Press Enter to Menu', 320, 240, 1, 'Comic Sans', 'center');
    }
  }
}

export default Director;