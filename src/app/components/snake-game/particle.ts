import {Utils} from '../../shared/utils/utils';

export class Particle {

  readonly coordinateCount: number = 5;
  private coordinates: number[][] = [];
  // set a random angle in all possible directions, in radians
  private angle: number = Utils.random(0, Math.PI * 2);
  private speed: number = Utils.random(1, 10);
  // friction will slow the particle down
  private friction: number = 0.95;
  // gravity will be applied and pull the particle down
  private gravity: number = 1;
  // set the hue to a random number +-50 of the overall hue variable
  private hue: number = Utils.random(this.initialHue - 50, this.initialHue + 50);
  private brightness: number = Utils.random(50, 80);
  private alpha: number = 1;
  // set how fast the particle fades out
  private decay: number = Utils.random(0.015, 0.03);

  constructor(private x: number,
              private y: number,
              private initialHue: number,
              private ctx: CanvasRenderingContext2D) {

    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }
  }


  update(particles: Particle[], index: number): void {
    // remove last item in coordinates array
    this.coordinates.pop();
    // add current coordinates to the start of the array
    this.coordinates.unshift([this.x, this.y]);
    // slow down the particle
    this.speed *= this.friction;
    // apply velocity
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    // fade out the particle
    this.alpha -= this.decay;

    // remove the particle once the alpha is low enough, based on the passed in index
    if (this.alpha <= this.decay) {
      particles.splice(index, 1);
    }
  }


  draw(): void {
    this.ctx.beginPath();
    // move to the last tracked coordinates in the set, then draw a line to the current x and y
    this.ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    this.ctx.lineTo(this.x, this.y);
    this.ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
    this.ctx.stroke();
  }

}
