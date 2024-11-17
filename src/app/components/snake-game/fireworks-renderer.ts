import {Utils} from '../../shared/utils/utils';
import {Firework} from './firework';
import {Particle} from './particle';

export class FireworksRenderer {
  private readonly fireworks: Firework[] = [];
  private readonly particles: Particle[] = [];

  private hue: number = 120;
  private timerTotal: number = 10;
  private timerTick: number = 0;

  constructor(private canvasWidth: number,
              private canvasHeight: number,
              private ctx: CanvasRenderingContext2D) {
  }

  renderFireworks(): void {
    this.hue = Utils.random(0, 360);
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx.globalCompositeOperation = 'lighter';


    if (this.timerTick >= this.timerTotal) {
      this.fireworks.push(
        new Firework(
          this.canvasWidth * 0.5,
          this.canvasHeight,
          Utils.random(0, this.canvasWidth),
          Utils.random(0, this.canvasHeight * 0.5),
          this.hue,
          this.ctx
        )
      );
      this.timerTick = 0;
    } else {
      this.timerTick += 1;
    }

    let i = this.fireworks.length;
    while (i--) {
      this.fireworks[i].draw();
      this.particles.push(...this.fireworks[i].update(this.fireworks, i));
    }

    this.renderParticles();
  }

  restoreDefaultsCanvas(): void {
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private renderParticles(): void {
    let i = this.particles.length;
    while (i--) {
      this.particles[i].draw();
      this.particles[i].update(this.particles, i);
    }
  }
}
