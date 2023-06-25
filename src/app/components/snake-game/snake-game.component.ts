import {ChangeDetectionStrategy, Component, DestroyRef, effect, EventEmitter, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Renderable} from '../../model/renderable';
import {fromEvent} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';

type Point = { x: number, y: number }

@Component({
  selector: 'albi-snake-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakeGameComponent extends Renderable {

  private canvasRef!: HTMLCanvasElement;
  private canvasContext!: CanvasRenderingContext2D;
  private dx = 10;
  private dy = 0;
  private snake: Point[] = this.initSnake(250, 100, 40);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);


  constructor() {
    super();
    const keySignal = toSignal<Event>(fromEvent(document, 'keydown'));
    effect((): void => keySignal() && this.changeDirection(keySignal() as KeyboardEvent));
  }

  private initSnake(startX: number, startY: number, length: number): Point[] {
    const arr: Point[] = [];
    for (let i = 0; i < length; i++) {
      arr.push({x: startX - (i * 10), y: startY});
    }
    return arr;
  }

  private initGameState(): void {
    this.canvasRef = document.getElementById('game') as HTMLCanvasElement;
    this.canvasContext = this.canvasRef.getContext('2d') as CanvasRenderingContext2D;
    this.gameLoop();
  }

  private gameLoop(): void {
    setTimeout((): void => {
      this.clearCanvas(this.canvasContext, this.canvasRef);
      this.moveSnake();
      this.drawSnake();
      this.gameLoop();
    }, 100);
  }


  private clearCanvas(context: CanvasRenderingContext2D,
                      canvasRef: HTMLCanvasElement,
                      gameBackground = 'rgba(12,125,125,0.3)',
                      gameBordersColor = 'red'): void {
    context.fillStyle = gameBackground;
    context.strokeStyle = gameBordersColor;
    context.fillRect(0, 0, canvasRef.width, canvasRef.height);
    context.strokeRect(0, 0, canvasRef.width, canvasRef.height);
  }

  private renderSnake(context: CanvasRenderingContext2D, snakePart: Point): void {
    context.fillStyle = 'yellow';
    context.strokeStyle = 'blue';
    context.fillRect(snakePart.x, snakePart.y, 10, 10);
    context.strokeRect(snakePart.x, snakePart.y, 10, 10);
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    this.initGameState();
  }


  private moveSnake() {
    const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
    this.snake.unshift(head);
    this.snake.pop();
  }


  private changeDirection(event: KeyboardEvent): void {
    const goingUp = this.dy === -10;
    const goingDown = this.dy === 10;
    const goingRight = this.dx === 10;
    const goingLeft = this.dx === -10;

    if (event.key === 'ArrowLeft' && !goingRight) {
      this.dx = -10;
      this.dy = 0;
      return;
    }

    if (event.key === 'ArrowUp' && !goingDown) {
      this.dx = 0;
      this.dy = -10;
      return;
    }

    if (event.key === 'ArrowRight' && !goingLeft) {
      this.dx = 10;
      this.dy = 0;
      return;
    }

    if (event.key === 'ArrowDown' && !goingUp) {
      this.dx = 0;
      this.dy = 10;
    }
  }


  private drawSnake(): void {
    this.snake.forEach(cord => this.renderSnake(this.canvasContext, cord));
  }


}
