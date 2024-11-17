import {Utils} from '../../shared/utils/utils';
import {Particle} from './particle';

export class Firework {
  private readonly distanceToTarget: number;
  private readonly coordinateCount: number = 3;
  private x: number;
  private y: number;
  private distanceTraveled: number = 0;
  private coordinates: number[][] = [];
  private angle: number = Math.atan2(this.targetY - this.startY, this.targetX - this.startX);
  private speed: number = 2;
  private acceleration: number = 1.05;
  private brightness: number = Utils.random(50, 70);

  constructor(private startX: number,
              private startY: number,
              private targetX: number,
              private targetY: number,
              private hue: number,
              private ctx: CanvasRenderingContext2D) {
    this.x = startX;
    this.y = startY;
    this.distanceToTarget = Utils.calculateDistance({x: startX, y: startY}, {x: targetX, y: targetY});
    for (let i = 0; i < this.coordinateCount; i++) {
      this.coordinates.push([this.x, this.y]);
    }
  }

  update(fireworks: Firework[], index: number): Particle[] {
    this.coordinates.pop(); // remove last item in coordinates array
    // add current coordinates to the start of the array
    this.coordinates.unshift([this.x, this.y]);

    // speed up the firework
    this.speed *= this.acceleration;

    // get the current velocities based on angle and speed
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    // how far will the firework have traveled with velocities applied?
    this.distanceTraveled = Utils.calculateDistance({x: this.startX, y: this.startY}, {x: this.x + vx, y: this.y + vy});

    // if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
    if (this.distanceTraveled >= this.distanceToTarget) {
      fireworks.splice(index, 1);
      return this.createParticles(this.targetX, this.targetY);
      // remove the firework, use the index passed into the update function to determine which to remove
    } else {
      // target not reached, keep traveling
      this.x += vx;
      this.y += vy;
      return [];
    }
  }

  private createParticles(x: number, y: number): Particle[] {
    const particles: Particle[] = [];
    let particleCount = 30;
    while (particleCount--) {
      particles.push(new Particle(x, y, this.hue, this.ctx));
    }
    return particles;
  }


  draw(): void {
    this.ctx.beginPath();
    // move to the last tracked coordinate in the set, then draw a line to the current x and y
    this.ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    this.ctx.lineTo(this.x, this.y);
    this.ctx.strokeStyle = 'hsl(' + this.hue + ', 100%, ' + this.brightness + '%)';
    this.ctx.stroke();
  }
}
