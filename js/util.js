import HandleInput from './handleInput.js';
import Resource from './resource.js';

const canvas = document.querySelector('#gameCanvas');
const fieldOfView = (120 / 180) * Math.PI;
const theta = fieldOfView * 0.5;

const handleInput = new HandleInput();
const resource = new Resource();

const addItens = (liId, text) => {
  const li = document.querySelector(liId);
  li.textContent = text;
};

const toggleMusic = (_e, toggle, volume = '2') => {
  const music = document.getElementById('music');
  const mute = document.getElementById('mute');

  music.volume = Number(volume) / 10;
  if (!toggle) {
    music.play();
    mute.classList.toggle('off');
    music.muted = !music.muted;
  }

  if (toggle === 'off') {
    music.play();
    mute.classList.remove('off');
    music.muted = false;
  } else if (toggle === 'on') {
    mute.classList.add('off');
    music.muted = true;
  }
};

const playMusic = () => {
  const music = document.getElementById('music');
  const mute = document.getElementById('mute');
  music.loop = true;
  music.volume = 0.3;
  music.muted = 'true';
  mute.classList.toggle('off');
  mute.addEventListener('click', toggleMusic);
};

const formatTime = (dt) => {
  const time = Math.round(dt);
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor(time / 1000) - (minutes * 60);
  const tenths = time.toString().slice(-3);
  return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}.${time < 100 ? '000' : tenths}`;
};

const startPosition = (trackSize, position) => (trackSize - (position * 16)) * 200;

const overlap = (x1, w1, x2, w2, percent = 1) => {
  const half = percent / 2;
  const callerL = x1 - (w1 * half);
  const callerR = x1 + (w1 * half);
  const objL = x2 - (w2 * half);
  const objR = x2 + (w2 * half);
  return !((callerR < objL) || (callerL > objR));
};

const calcCrashSpeed = (callerSpd, objSpd, objMult) => {
  if (!objMult) return 0;
  if (!objSpd) return ((callerSpd + objSpd) * 0.5) * objMult;
  if (callerSpd - objSpd <= 120) return callerSpd - 120;
  return Math.max(callerSpd - ((callerSpd - objSpd) * 1.6), 20);
};


const tracks = {

  starterland: {
    trackName: 'Starterland',
    trackSize: 8632,
    laps: 15,
    colors: {
      lightRoad: '#424142',
      darkRoad: '#393839',
      lightGrass: '#7a0088',
      darkGrass: '#550066',
      lightCurb: '#ffffff',
      darkCurb: '#ff0000',
      lightTunnel: '#c300ff',
      darkTunnel: '#6d008b',
    },
    curves: [
      {
        min: 200, max: 400, curveIncl: -4, curb: 1,
      },
      {
        min: 600, max: 800, curveIncl: 4, curb: 1,
      },
      {
        min: 900, max: 1500, curveIncl: -2, curb: 1,
      },
      {
        min: 2500, max: 2750, curveIncl: -5, curb: 1,
      },
      {
        min: 2950, max: 3200, curveIncl: -3, curb: 1,
      },
      {
        min: 3600, max: 3725, curveIncl: 4, curb: 1,
      },
      {
        min: 3850, max: 3975, curveIncl: 3, curb: 1,
      },
      {
        min: 4225, max: 4475, curveIncl: 5, curb: 1,
      },
      {
        min: 4600, max: 5100, curveIncl: -5, curb: 1,
      },
      {
        min: 5300, max: 5350, curveIncl: 2, curb: 1,
      },
      {
        min: 5475, max: 5675, curveIncl: 6, curb: 1,
      },
      {
        min: 6050, max: 6300, curveIncl: -4, curb: 1,
      },
      {
        min: 6800, max: 7000, curveIncl: -6, curb: 1,
      },
      {
        min: 7100, max: 7200, curveIncl: -3, curb: 1,
      },
      {
        min: 7575, max: 7700, curveIncl: -4, curb: 1,
      },
      {
        min: 8075, max: 8200, curveIncl: -3, curb: 1,
      },
    ],
    hills: [
      { initialSeg: 1, size: 800, altimetry: -40 },
      { initialSeg: 900, size: 600, altimetry: 15 },
      { initialSeg: 2500, size: 750, altimetry: -35 },
      { initialSeg: 3500, size: 500, altimetry: 20 },
      { initialSeg: 4200, size: 650, altimetry: -30 },
      { initialSeg: 5000, size: 650, altimetry: 35 },
      { initialSeg: 5700, size: 600, altimetry: -25 },
      { initialSeg: 6400, size: 400, altimetry: -15 },
      { initialSeg: 7000, size: 700, altimetry: 70 },
      { initialSeg: 7700, size: 300, altimetry: 20 },
      { initialSeg: 8100, size: 500, altimetry: -10 },
      { initialSeg: 8632, size: 0, altimetry: 0 },
    ],
    tunnels: [
      {
        min: 0, max: 0, name: '', height: 1,
      },
    ],
  },
  secondstage: {
    trackName: 'Second Stage',
    trackSize: 6656,
    laps: 10,
    colors: {
      lightRoad: '#424142',
      darkRoad: '#393839',
      lightGrass: '#7a0088',
      darkGrass: '#550066',
      lightCurb: '#ffffff',
      darkCurb: '#ff0000',
      lightTunnel: '#c300ff',
      darkTunnel: '#6d008b',
    },
    curves: [
      {
        min: 0, max: 160, curveIncl: 1, curb: 0,
      },
      {
        min: 260, max: 400, curveIncl: 7, curb: 1,
      },
      {
        min: 510, max: 570, curveIncl: -2, curb: 1,
      },
      {
        min: 680, max: 740, curveIncl: 2, curb: 1,
      },
      {
        min: 790, max: 850, curveIncl: -2, curb: 1,
      },
      {
        min: 910, max: 970, curveIncl: 2, curb: 1,
      },
      {
        min: 1050, max: 1330, curveIncl: -2, curb: 1,
      },
      {
        min: 1420, max: 1600, curveIncl: 3, curb: 1,
      },
      {
        min: 1850, max: 2090, curveIncl: 5, curb: 1,
      },
      {
        min: 2130, max: 2190, curveIncl: -4, curb: 1,
      },
      {
        min: 2270, max: 2550, curveIncl: -7, curb: 1,
      },
      {
        min: 2690, max: 2780, curveIncl: 4, curb: 1,
      },
      {
        min: 2990, max: 3120, curveIncl: 3, curb: 1,
      },
      {
        min: 3310, max: 3640, curveIncl: 2, curb: 0,
      },
      {
        min: 3770, max: 3930, curveIncl: 1, curb: 0,
      },
      {
        min: 4020, max: 4120, curveIncl: -3, curb: 1,
      },
      {
        min: 4170, max: 4210, curveIncl: 3, curb: 1,
      },
      {
        min: 4230, max: 4290, curveIncl: 3, curb: 1,
      },
      {
        min: 4310, max: 4350, curveIncl: -3, curb: 1,
      },
      {
        min: 4710, max: 4790, curveIncl: -3, curb: 1,
      },
      {
        min: 4920, max: 4970, curveIncl: -3, curb: 1,
      },
      {
        min: 4980, max: 5020, curveIncl: 3, curb: 1,
      },
      {
        min: 5080, max: 5150, curveIncl: 3, curb: 1,
      },
      {
        min: 5200, max: 5260, curveIncl: -3, curb: 1,
      },
      {
        min: 5320, max: 5590, curveIncl: -1, curb: 0,
      },
      {
        min: 5670, max: 5850, curveIncl: 6, curb: 1,
      },
      {
        min: 6060, max: 6150, curveIncl: 5, curb: 1,
      },
      {
        min: 6150, max: 6240, curveIncl: -3, curb: 1,
      },
      {
        min: 6280, max: 6656, curveIncl: 1, curb: 0,
      },
    ],
    hills: [
      { initialSeg: 140, size: 175, altimetry: 20 },
      { initialSeg: 400, size: 600, altimetry: 50 },
      { initialSeg: 1020, size: 370, altimetry: -50 },
      { initialSeg: 1560, size: 1000, altimetry: -35 },
      { initialSeg: 2600, size: 500, altimetry: -45 },
      { initialSeg: 3870, size: 250, altimetry: -30 },
      { initialSeg: 4160, size: 1500, altimetry: 25 },
      { initialSeg: 5670, size: 340, altimetry: 50 },
      { initialSeg: 6050, size: 150, altimetry: -30 },
      { initialSeg: 6656, size: 0, altimetry: 0 },
    ],
    tunnels: [
      {
        min: 3250, max: 3900, name: '', height: 12500,
      },
    ],
  },
 
};

const drivers = [
  {
    power: 1060, position: 1, trackSide: -1, name: 'Price', carColor: 4,
  },
  {
    power: 1065, position: 2, trackSide: 1, name: 'Soap', carColor: 7,
  },
  {
    power: 1060, position: 3, trackSide: -1, name: 'Drost', carColor: 3,
  },
  {
    power: 1050, position: 4, trackSide: 1, name: 'Ronny', carColor: 2,
  },
  {
    power: 1055, position: 5, trackSide: -1, name: 'Mactavish', carColor: 7,
  },
  {
    power: 1050, position: 6, trackSide: 1, name: 'Alejandro', carColor: 4,
  },
  {
    power: 1050, position: 7, trackSide: -1, name: 'Graves', carColor: 3,
  },
  {
    power: 1055, position: 8, trackSide: 1, name: 'Leone', carColor: 2,
  },
  {
    power: 1020, position: 9, trackSide: -1, name: 'Kennedy', carColor: 0,
  },
  {
    power: 1015, position: 10, trackSide: 1, name: 'Oliveira', carColor: 0,
  },
  {
    power: 1010, position: 11, trackSide: -1, name: 'Carlos', carColor: 5,
  },
];

const updateOpponentsCarOffset = (car, player, director, oppArr) => {
  const carParam = car;
  const playerParam = player;
  const oppArrParam = oppArr;
  const lookAhead = 40;
  const crash = 6;
  const { carSegments: carSeg } = director;
  const cSeg = (carSeg.find(({ name }) => name === carParam.opponentName));
  const arrObjSeg = carSeg.filter(({ pos }) => pos < cSeg.pos + lookAhead && pos > cSeg.pos);
  const objCrash = carSeg.find(({ pos }) => pos < cSeg.pos + crash && pos > cSeg.pos);
  let dir = carParam.opponentX;

  if (cSeg && cSeg.x <= -1.65) dir = 0.5;
  if (cSeg && cSeg.x >= 1.65) dir = -0.5;
  arrObjSeg.forEach((objSeg) => {
    if (objSeg && objSeg.name !== playerParam.name) {
      const isOverlapped = overlap(cSeg.x, 0.663125, objSeg.x, 0.663125, 1);

      if (isOverlapped) {
        const changeX = 1;
        const diffCarsX = Math.abs(objSeg.x - cSeg.x);

        if (objSeg.x > 1 || (objSeg.x > 0 && diffCarsX < 0.3)) dir = -changeX;
        if (objSeg.x < -1 || (objSeg.x < 0 && diffCarsX < 0.3)) dir = changeX;
        if (objCrash && objCrash.name !== playerParam.name) {
          const opp = oppArrParam.findIndex(({ opponentName }) => opponentName === objCrash.name);
          oppArrParam[opp].runningPower *= 1.02;
          carParam.runningPower *= 0.98;
        }
      }
    }
    if (objSeg && objSeg.name === playerParam.name && !car.isCrashed) {
      const isOverlapped = overlap(cSeg.x, 0.663125, objSeg.x, 0.8, 1.2);

      if (carParam.runningPower > playerParam.runningPower && isOverlapped) {
        const changeX = 5;
        const diffCarsX = Math.abs(objSeg.x - cSeg.x);
        if (objSeg.x > 0.95 || (objSeg.x > 0 && diffCarsX < 0.4)) dir = changeX * -1;
        else if (objSeg.x < -0.95 || (objSeg.x < 0 && diffCarsX < 0.4)) dir = changeX;

        if (objCrash) {
          const x = (carParam.runningPower - playerParam.runningPower) / 2;
          playerParam.runningPower += x * 1.8;
          carParam.runningPower += x * -1.5;
        }
      }
    }
  });
  return dir;
};

const degToRad = (angle) => ((angle * Math.PI) / 180);

const speedToDeg = (speed, maxSpeed, startAngle, finalAngle) => {
  const angle = finalAngle - startAngle;
  const ratioSpeed = speed / maxSpeed;
  return -30 + ratioSpeed * angle;
};

export {
  handleInput, resource, canvas, fieldOfView, theta, addItens, toggleMusic, playMusic, formatTime,
  startPosition, overlap, calcCrashSpeed, updateOpponentsCarOffset, tracks, drivers,
  speedToDeg, degToRad,
};
