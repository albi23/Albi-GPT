import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  signal,
  WritableSignal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Renderable} from '../../model/renderable';
import {fromEvent, take} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';

type Point = { x: number, y: number }
type Move = { dx: number, dy: number }

@Component({
  selector: 'albi-snake-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakeGameComponent extends Renderable {

  endGame: WritableSignal<boolean> = signal(false);

  private canvasRef!: HTMLCanvasElement;
  private canvasContext!: CanvasRenderingContext2D;
  private move: Move = {dx: 10, dy: 0};
  private nextMove: Move = {dx: 10, dy: 0};
  private snake: Point[] = this.initSnake(250, 100, 10);


  constructor(private chr: ChangeDetectorRef) {
    super();
    const keySignal = toSignal<Event>(fromEvent(document, 'keydown'));
    effect((): void => {
      if (keySignal()) {
        this.nextMove = this.changeDirection(keySignal() as KeyboardEvent, this.move);
      }
    });
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
    this.chr.markForCheck();
    this.gameLoop();
  }

  private gameLoop(): void {
    setTimeout((): void => {
      this.clearCanvas(this.canvasContext, this.canvasRef);
      const end: boolean = this.isEndGame();
      this.move = this.nextMove;
      this.moveSnake(this.move);
      this.drawSnake(end);
      if (end) {
        this.endGame.set(true);
        return;
      }
      this.gameLoop();
    }, 50);
  }


  private clearCanvas(context: CanvasRenderingContext2D,
                      canvasRef: HTMLCanvasElement,
                      // gameBackground = 'rgba(12,125,125,0.3)',
                      gameBackground = 'rgb(12,125,125)',
                      gameBordersColor = '#FF0099'): void {
    context.fillStyle = gameBackground;
    context.strokeStyle = gameBordersColor;
    context.fillRect(0, 0, canvasRef.width, canvasRef.height);
    context.strokeRect(0, 0, canvasRef.width, canvasRef.height);
  }

  private renderSnake(context: CanvasRenderingContext2D,
                      snakePart: Point,
                      fillStyle = 'yellow',
                      strokeStyle = 'blue'): void {
    context.fillStyle = fillStyle;
    context.strokeStyle = strokeStyle;
    context.fillRect(snakePart.x, snakePart.y, 10, 10);
    context.strokeRect(snakePart.x, snakePart.y, 10, 10);
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    this.initGameState();
    fromEvent(document.getElementById('continueBtn') as HTMLButtonElement, 'click')
      .pipe(take(1))
      .subscribe(() => evt.emit(true));
  }


  private moveSnake(move: Move) {
    const head = {x: this.snake[0].x + move.dx, y: this.snake[0].y + move.dy};
    this.snake.unshift(head);
    this.snake.pop();
  }


  private changeDirection(event: KeyboardEvent, move: Move): Move {
    const goingUp = move.dy === -10;
    const goingDown = move.dy === 10;
    const goingRight = move.dx === 10;
    const goingLeft = move.dx === -10;

    if (event.key === 'ArrowLeft' && !goingRight) {
      return {dx: -10, dy: 0};
    }

    if (event.key === 'ArrowUp' && !goingDown) {
      return {dx: 0, dy: -10};
    }

    if (event.key === 'ArrowRight' && !goingLeft) {
      return {dx: 10, dy: 0};
    }

    if (event.key === 'ArrowDown' && !goingUp) {
      return {dx: 0, dy: 10};
    }
    return move;
  }


  private drawSnake(end: boolean): void {
    if (end) {
      [0, 1, 2].map(i => this.snake[i]).forEach(p => {
        this.renderSnake(this.canvasContext, p, 'red');
      });

      this.snake.slice(3).forEach((p: Point) => this.renderSnake(this.canvasContext, p));
    } else {

      this.snake.forEach((p: Point) => this.renderSnake(this.canvasContext, p));
    }
  }

  isEndGame(): boolean {
    for (let i = 4; i < this.snake.length; i++) {
      if (this.snake[i].x === this.snake[0].x /* collision */
        && this.snake[i].y === this.snake[0].y)
        return true;
    }
    const hitLeftWall = this.snake[0].x < 0;
    const hitRightWall = this.snake[0].x > this.canvasRef.width - 10;
    const hitTopWall = this.snake[0].y < 0;
    const hitBottomWall = this.snake[0].y > this.canvasRef.height - 10;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
  }

  restartGame(): void {
    this.endGame.set(false);
    this.snake = this.initSnake(250, 100, 30);
    this.gameLoop();
  }
}
