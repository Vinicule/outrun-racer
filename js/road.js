import SegmentLine from './segmentLine.js';
import Sprite from './sprite.js';
import Tunnel from './tunnel.js';
import { resource, tracks } from './util.js';

class Road {
 
  #segments = [];
  #segmentLength = 200; 
  visibleSegments = 600;
  #k = 13; 
  #width = 2000;
  constructor(trackName) {
    this.trackName = trackName;
  }

  get k() {
    return this.#k;
  }

  get segmentLength() {
    return this.#segmentLength;
  }

  get segmentsLength() {
    return this.#segments.length;
  }

  get length() {
    return this.segmentsLength * this.segmentLength;
  }

  get width() {
    return this.#width;
  }


  getSegment(cursor) {
    const length = this.segmentsLength;

    const index = Math.floor(cursor / this.#segmentLength) % length;
    return this.#segments[(index + length) % length];
  }

  getSegmentFromIndex(index) {
    const length = this.segmentsLength;
    return this.#segments[(index % length + length) % length];
  }

  create() {
    this.#segments = [];
    const { k } = this;
    const { trackSize, colors } = tracks[this.trackName];
    for (let i = 0; i < trackSize; i += 1) {
      const lightestColors = {
        road: colors.lightRoad,
        grass: colors.lightGrass,
        curb: colors.lightCurb, 
        strip: '', 
        tunnel: colors.lightTunnel,
      };
      const lightColors = {
        road: '#393839', 
        grass: colors.darkGrass, 
        curb: colors.lightCurb, 
        strip: '', 
        tunnel: colors.lightTunnel,
      };
      const darkColors = {
        road: '#393839', 
        grass: colors.lightGrass,
        curb: colors.darkCurb, 
        strip: '#fff', 
        tunnel: colors.darkTunnel,
      };
      const darkestColors = {
        road: colors.lightRoad,
        grass: colors.darkGrass, 
        curb: colors.darkCurb, 
        strip: '#fff', 
        tunnel: colors.darkTunnel,
      };

      const segmentLine = new SegmentLine();
      segmentLine.index = i;

      if (Math.floor(i / k) % 4 === 0) segmentLine.colors = lightestColors;
      if (Math.floor(i / k) % 4 === 1) segmentLine.colors = darkestColors;
      if (Math.floor(i / k) % 4 === 2) segmentLine.colors = lightColors;
      if (Math.floor(i / k) % 4 === 3) segmentLine.colors = darkColors;


      if (i >= trackSize - 13) {
        segmentLine.colors.road = '#fff';
        i % 4 === 0 || i % 4 === 1 ? segmentLine.colors.checkers = 'one' : segmentLine.colors.checkers = 'two';
      }

      const { world } = segmentLine.points;
      world.w = this.width;
      world.z = (i + 1) * this.segmentLength;
      this.#segments.push(segmentLine);

      // adding curves
      const createCurve = (min, max, curve, curb) => {
        if (i >= min && i <= max) {
          segmentLine.curve = curve;
          segmentLine.curb = curb;
        }
      }
      tracks[this.trackName].curves
        .forEach((curve) => createCurve(curve.min, curve.max, curve.curveIncl, curve.curb));

      // Road Sprites
      const {curve: curvePower, curb} = this.getSegmentFromIndex(i);
      if (i % (k * 2) === 0 && Math.abs(curvePower) > 1 && curb) {
        const curveSignal = new Sprite();
        curveSignal.offsetX = curvePower > 0 ? -1.5 : 1.5;
        curveSignal.scaleX = 72;
        curveSignal.scaleY = 72;
        curveSignal.image = resource.get(curvePower > 0 ? 'leftSignal' : 'rightSignal');
        curveSignal.name = 'tsCurveSignal';
        segmentLine.sprites.push(curveSignal);
      }
    }

    // adding hills
    const createHills = (lastHillSegment, startHillSegment, hillSize, altimetry, position) => {
      let lastWorld = { x: 0, y: 0, z: 200, w: 2000 };
      let counterSegment = 0.5;
      let counterAngle = hillSize / 4;
      const finalSegment = startHillSegment + hillSize;
      for (let i = lastHillSegment, previousSegment; i < finalSegment; i += 1) {
        const baseSegment = this.getSegmentFromIndex(i);
        const world = baseSegment.points.world;

        lastWorld = this.getSegmentFromIndex(i - 1).points.world;
        world.y = lastWorld.y;

        if (i >= startHillSegment && counterSegment <= hillSize) {
          const multiplier = altimetry * hillSize / -4;
          const actualSin = Math.sin((counterAngle + 1) / (hillSize / 2) * Math.PI) * multiplier;
          const lastSin = Math.sin(counterAngle / (hillSize / 2) * Math.PI) * multiplier;
          world.y += (actualSin - lastSin);
          counterSegment += 1;
          counterAngle += 0.5;
        }

        const tunnelInfo = tracks[this.trackName].tunnels[0];
        // tunnels
        if (i >= tunnelInfo.min && i <= tunnelInfo.max) {
          if (i === tunnelInfo.min) {
            previousSegment = baseSegment;
            const tunnel = new Tunnel();
            tunnel.worldH = tunnelInfo.height;

            baseSegment.tunnel = tunnel;
            baseSegment.colors.tunnel = '#fff';
            tunnel.title = tunnelInfo.name;

          } else if (i % (k * 1) === 0) {
            const tunnel = new Tunnel();
            tunnel.worldH = tunnelInfo.height;
            tunnel.previousSegment = previousSegment;
            previousSegment = baseSegment;
            baseSegment.tunnel = tunnel;
          }
        }
      }

      if (tracks[this.trackName].hills[position + 1]) {
        const { initialSeg, size, altimetry } = tracks[this.trackName].hills[position + 1];
        createHills(finalSegment, initialSeg, size, altimetry, position + 1)
      }
    }
    const { initialSeg, size, altimetry } = tracks[this.trackName].hills[0];
    createHills(1, initialSeg, size, altimetry, 0);


    if (trackSize > 200) {
        for(let i = 0; i < 200; i++) {
            const index = trackSize - 200 + i;
            const segment = this.getSegmentFromIndex(index);
            if (segment && segment.points && segment.points.world) {
                segment.points.world.y *= (1 - (i/200)); 
            }
        }
    }
  }

  /**
   *
   * @param {Render} render
   * @param {Camera} camera
   * @param {Player} player
   */
  render(render, camera, player) {
    const cameraClass = camera;
    const { segmentsLength } = this;
    const baseSegment = this.getSegment(camera.cursor);
    const startPos = baseSegment.index;
    cameraClass.y = camera.h + baseSegment.points.world.y;
    let maxY = camera.screen.height;
    let anx = 0;
    let snx = 0;

    for (let i = startPos; i < startPos + this.visibleSegments; i += 1) {
      const currentSegment = this.getSegmentFromIndex(i);
      cameraClass.z = camera.cursor - (i >= segmentsLength ? this.length : 0);
      cameraClass.x = player.x * currentSegment.points.world.w - snx;
      currentSegment.project(camera);
      anx += currentSegment.curve;
      snx += anx;

      const currentScreenPoint = currentSegment.points.screen;
      currentSegment.clip = maxY;
      if (
        currentScreenPoint.y >= maxY
        || camera.deltaZ <= camera.distanceToProjectionPlane
      ) {
        continue;
      }

      if (i > 0) {
        const previousSegment = this.getSegmentFromIndex(i - 1);
        const previousScreenPoint = previousSegment.points.screen;
        const { colors } = currentSegment;

        if (currentScreenPoint.y >= previousScreenPoint.y) {
          continue;
        }

        render.drawTrapezium(
          previousScreenPoint.x, previousScreenPoint.y, previousScreenPoint.w,
          currentScreenPoint.x, currentScreenPoint.y, currentScreenPoint.w,
          colors.road,
        );

        // left grass
        render.drawPolygon(
          colors.grass,
          0, previousScreenPoint.y,
          previousScreenPoint.x - previousScreenPoint.w, previousScreenPoint.y,
          currentScreenPoint.x - currentScreenPoint.w, currentScreenPoint.y,
          0, currentScreenPoint.y,
        );

        // right grass
        render.drawPolygon(
          colors.grass,
          previousScreenPoint.x + previousScreenPoint.w * 1, previousScreenPoint.y,
          camera.screen.width, previousScreenPoint.y,
          camera.screen.width, currentScreenPoint.y,
          currentScreenPoint.x + currentScreenPoint.w, currentScreenPoint.y,
        );

        if (currentSegment.curb) {
          // left curb
          render.drawPolygon(
            colors.curb,
            previousScreenPoint.x - previousScreenPoint.w * 1.3, previousScreenPoint.y,
            previousScreenPoint.x - previousScreenPoint.w, previousScreenPoint.y,
            currentScreenPoint.x - currentScreenPoint.w, currentScreenPoint.y,
            currentScreenPoint.x - currentScreenPoint.w * 1.3, currentScreenPoint.y,
          );

          // right curb
          render.drawPolygon(
            colors.curb,
            previousScreenPoint.x + previousScreenPoint.w * 1.3, previousScreenPoint.y,
            previousScreenPoint.x + previousScreenPoint.w, previousScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w, currentScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * 1.3, currentScreenPoint.y,
          );
        }

        // center strip and lateral stripes
        if (colors.strip) {
          // left stripe
          render.drawPolygon(
            colors.strip,
            previousScreenPoint.x + previousScreenPoint.w * -0.97, previousScreenPoint.y,
            previousScreenPoint.x + previousScreenPoint.w * -0.94, previousScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * -0.94, currentScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * -0.97, currentScreenPoint.y,
          );

          render.drawPolygon(
            colors.strip,
            previousScreenPoint.x + previousScreenPoint.w * -0.91, previousScreenPoint.y,
            previousScreenPoint.x + previousScreenPoint.w * -0.88, previousScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * -0.88, currentScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * -0.91, currentScreenPoint.y,
          );

          // right stripe
          render.drawPolygon(
            colors.strip,
            previousScreenPoint.x + previousScreenPoint.w * 0.97, previousScreenPoint.y,
            previousScreenPoint.x + previousScreenPoint.w * 0.94, previousScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * 0.94, currentScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * 0.97, currentScreenPoint.y,
          );

          render.drawPolygon(
            colors.strip,
            previousScreenPoint.x + previousScreenPoint.w * 0.91, previousScreenPoint.y,
            previousScreenPoint.x + previousScreenPoint.w * 0.88, previousScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * 0.88, currentScreenPoint.y,
            currentScreenPoint.x + currentScreenPoint.w * 0.91, currentScreenPoint.y,
          );

          // center strip
          const value = 0.02;
          render.drawTrapezium(
            previousScreenPoint.x, previousScreenPoint.y, previousScreenPoint.w * value,
            currentScreenPoint.x, currentScreenPoint.y, currentScreenPoint.w * value,
            colors.strip,
          );
        }

        //checkered road
        if (colors.checkers === 'one') {
          for (let i = -1; i < 0.9; i += 2 / 3) {
            render.drawPolygon(
              'black',
              previousScreenPoint.x + previousScreenPoint.w * i, previousScreenPoint.y,
              previousScreenPoint.x + previousScreenPoint.w * (i + 1 / 3), previousScreenPoint.y,
              currentScreenPoint.x + currentScreenPoint.w * (i + 1 / 3), currentScreenPoint.y,
              currentScreenPoint.x + currentScreenPoint.w * i, currentScreenPoint.y,
            );
          };
        }
        if (colors.checkers === 'two') {
          for (let i = -2 / 3; i < 0.9; i += 2 / 3) {
            render.drawPolygon(
              'black',
              previousScreenPoint.x + previousScreenPoint.w * i, previousScreenPoint.y,
              previousScreenPoint.x + previousScreenPoint.w * (i + 1 / 3), previousScreenPoint.y,
              currentScreenPoint.x + currentScreenPoint.w * (i + 1 / 3), currentScreenPoint.y,
              currentScreenPoint.x + currentScreenPoint.w * i, currentScreenPoint.y,
            );
          };
        }
      }

      maxY = currentScreenPoint.y;
    }
    for (let i = (this.visibleSegments + startPos) - 1; i >= startPos; i -= 1) {
      this.getSegmentFromIndex(i)
        .drawSprite(render, camera, player)
        .drawTunnel(render, camera, player);
    }
  }
}

export default Road;