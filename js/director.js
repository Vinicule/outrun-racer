import {
  handleInput, formatTime, resource, tracks, canvas,
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
    this.finish = false;

    // Pause Menu State
    this.pauseOption = 0; 
    this.keyState = { up: false, down: false, left: false, right: false, enter: false };
    this.volume = 0.3;
    
    // Separate timer for the start sequence
    this.startSequenceTime = 0;
  }

  create(road, trackName) {
    this.totalTime = 0;
    this.animTime = 0;
    this.startSequenceTime = 0;
    this.lap = 0;
    this.lastLap = 0;
    this.fastestLap = 0;
    this.totalLaptimes = [];
    this.laptimes = [];
    this.positions = [];
    this.finish = false;
    this.running = true;
    this.pauseOption = 0;
    handleInput.mapPress.p = true;

    const segmentLineTen = road.getSegmentFromIndex(tracks[road.trackName].trackSize - 3);
    
    this.trackName = trackName;
    this.startLights.offsetX = 0;
    this.startLights.offsetY = 2;
    this.startLights.scaleX = 27;
    this.startLights.scaleY = 27;
    this.startLights.spritesInX = 6;
    this.startLights.sheetPosX = Math.ceil(this.startSequenceTime / 500);
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
    
    const music = document.getElementById('music');
    if (music) this.volume = music.volume;
  }

  refreshPositions(player, opponents) {
    let arr = [];
    const { name, trackPosition, raceTime, x } = player;
    arr.push({ name, pos: trackPosition, raceTime, x: Number(x.toFixed(3)) });

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

  handlePauseInput(menu, player, opponents, road, camera) {
    const { arrowup, arrowdown, arrowleft, arrowright, enter } = handleInput.map;
    
    if (arrowup && !this.keyState.up) {
        this.pauseOption = (this.pauseOption - 1 + 4) % 4;
        this.keyState.up = true;
    } else if (!arrowup) this.keyState.up = false;

    if (arrowdown && !this.keyState.down) {
        this.pauseOption = (this.pauseOption + 1) % 4;
        this.keyState.down = true;
    } else if (!arrowdown) this.keyState.down = false;

    if (this.pauseOption === 2) {
        const music = document.getElementById('music');
        if (arrowleft && !this.keyState.left) {
            this.volume = Math.max(0, this.volume - 0.1);
            if(music) music.volume = this.volume;
            this.keyState.left = true;
        } else if (!arrowleft) this.keyState.left = false;

        if (arrowright && !this.keyState.right) {
            this.volume = Math.min(1, this.volume + 0.1);
            if(music) music.volume = this.volume;
            this.keyState.right = true;
        } else if (!arrowright) this.keyState.right = false;
    }

    if (enter && !this.keyState.enter) {
        this.keyState.enter = true;
        switch(this.pauseOption) {
            case 0: // Resume
                handleInput.mapPress.p = true;
                break;
            case 1: // Restart
                opponents.length = 0; 
                menu.startRace(player, road, opponents, this, camera);
                handleInput.mapPress.p = true; 
                break;
            case 2: // Volume
                break;
            case 3: // Main Menu
                menu.state = 'title';
                menu.showMenu = 1;
                handleInput.mapPress.enter = false;
                handleInput.mapPress.p = true; 
                
                const pauseBtn = document.querySelector('#pauseBtn');
                const mute = document.querySelector('#mute');
                const fps = document.querySelector('#fps');
                const okBtn = document.querySelector('.rightControls').firstElementChild;

                if(pauseBtn) pauseBtn.classList.add('hidden');
                if(mute) mute.classList.add('hidden');
                if(fps && fps.firstElementChild) fps.firstElementChild.classList.add('hidden');
                if(okBtn) okBtn.classList.add('hidden');
                canvas.classList.remove('filter');
                break;
        }
    } else if (!enter) this.keyState.enter = false;
  }

  update(player, opponent, menu, road, camera) {
    this.paused = handleInput.mapPress.p;
    
    // Determine running state based on startSequenceTime
    if (this.startSequenceTime < this.startTimer || !this.paused || this.finish) {
      this.running = false;
    } else if (this.startSequenceTime >= this.startTimer && this.paused && !this.finish) {
      this.running = true;
    }

    if (!this.paused && !this.finish) {
        this.handlePauseInput(menu, player, opponent, road, camera);
    }

    if (!this.finish) {
      this.startSequenceTime += (1 / 60) * 1000 * this.paused;

      if (this.running) {
        this.totalTime += (1 / 60) * 1000 * this.paused;
        this.animTime += (1 / 60) * 1000 * this.paused;
      }
    }

    this.lastLap = this.laptimes[this.lap - 2] ? this.laptimes[this.lap - 2] : 0;
    this.fastestLap = this.laptimes.length ? Math.min.apply(null, this.laptimes) : 0;

    this.position = (this.positions.findIndex((elem) => elem.name === player.name) + 1).toString();
    if (this.position < 10) this.position = `0${this.position}`;

    this.refreshPositions(player, opponent);
    
    // Start Lights logic
    if (this.startSequenceTime > this.startTimer) this.startLights.sheetPosX = 0;
    else if (this.startSequenceTime > 2000 + 2500) this.startLights.sheetPosX = 5;
    else if (this.startSequenceTime > 2000 + 2000) this.startLights.sheetPosX = 4;
    else if (this.startSequenceTime > 2000 + 1500) this.startLights.sheetPosX = 3;
    else if (this.startSequenceTime > 2000 + 1000) this.startLights.sheetPosX = 2;
    else if (this.startSequenceTime > 2000 + 500) this.startLights.sheetPosX = 1;

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
      
      if (this.lap > tracks[this.trackName].laps && !this.finish) {
        this.finish = true;
        this.running = false;
      }
    }
  }

  render(render, player) {
    if (!this.paused) {
      render.roundRect('rgba(0, 0, 0, 0.85)', 170, 70, 300, 220, 15, true, true);
      render.drawText('#FFFF00', 'PAUSED', 320, 100, 2.5, 'Comic Sans', 'center', 'black', true);
      
      const options = [
          'Resume', 
          'Restart', 
          `Volume: ${Math.round(this.volume * 10)}`, 
          'Main Menu'
      ];

      options.forEach((text, index) => {
          const color = this.pauseOption === index ? '#FFFF00' : '#FFFFFF';
          const size = this.pauseOption === index ? 1.8 : 1.5;
          const stroke = this.pauseOption === index;
          render.drawText(color, text, 320, 150 + (index * 40), size, 'Comic Sans', 'center', 'black', stroke);
      });
      return;
    }
    
    // NEW: Countdown Text
    if (this.startSequenceTime < 2500) {
      render.drawText('#FFFF00', 'GET READY!', 320, 135, 2, 'Comic Sans', 'center', 'black', true);
    } else if (this.startSequenceTime >= 2500 && this.startSequenceTime < 3500) {
      render.drawText('#FFFF00', '3', 320, 135, 4, 'Comic Sans', 'center', 'black', true);
    } else if (this.startSequenceTime >= 3500 && this.startSequenceTime < 4500) {
       render.drawText('#FFFF00', '2', 320, 135, 4, 'Comic Sans', 'center', 'black', true);
    } else if (this.startSequenceTime >= 4500 && this.startSequenceTime < 5000) {
       render.drawText('#FFFF00', '1', 320, 135, 4, 'Comic Sans', 'center', 'black', true);
    } else if (this.startSequenceTime >= 5000 && this.startSequenceTime < 6000) {
       render.drawText('#FFFF00', 'GO!', 320, 135, 4, 'Comic Sans', 'center', 'black', true);
    }
  
    // HUD PANELS
    render.roundRect('rgba(0, 0, 0, 0.5)', 2, 25, 145, 105, 5, true, false);
    render.roundRect('rgba(0, 0, 0, 0.5)', 490, 25, 148, 80, 5, true, false);

    // Position
    render.drawText('#ffffffff', `POS`, 25, 44, 0.8, 'Comic Sans', 'left', 'black', true);
    render.drawText('#FFFFFF', `${this.position}/${this.positions.length}`, 75, 44, 0.8, 'Comic Sans', 'left', 'black', true);
    
    // Lap
    render.drawText('#ffffffff', `LAP`, 25, 62, 0.8, 'Comic Sans', 'left', 'black', true);
    render.drawText('#FFFFFF', `${this.lap} / ${tracks[this.trackName].laps}`, 75, 62, 0.8, 'Comic Sans', 'left', 'black', true);

    // Leaderboard 
    this.hudPositions.forEach(({ pos, name, relTime }, index) => {
       // Only show top 3 or relevant neighbors if needed, but for now just shifting y
       const alignPos = pos < 10 ? `0${pos}` : pos;
       const yPos = 80 + (index * 16);
       if(yPos < 115) { // Clip to panel
           render.drawText('#FFFFFF', `${alignPos}`, 10, yPos, 0.8, 'Comic Sans', 'left');
           render.drawText('#FFFFFF', `${name} ${relTime}`, 38, yPos, 0.8, 'Comic Sans', 'left');
       }
    });

    render.drawText('#FFFFFF', `Total: ${formatTime(this.totalTime)}`, 630, 44, 0.8, 'Comic Sans', 'right');
    render.drawText('#FFFFFF', `Lap: ${formatTime(this.animTime)}`, 630, 60, 0.8, 'Comic Sans', 'right');
    render.drawText('#FFFFFF', `Last: ${formatTime(this.lastLap)}`, 630, 76, 0.8, 'Comic Sans', 'right');
    render.drawText('#FFFFFF', `Fastest: ${formatTime(this.fastestLap)}`, 630, 92, 0.8, 'Comic Sans', 'right');

    if (this.raining) this.rain.forEach((item) => item.render(render, player));

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