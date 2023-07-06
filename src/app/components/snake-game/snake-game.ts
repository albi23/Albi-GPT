import {signal, WritableSignal} from '@angular/core';

type Point = { x: number, y: number }
type Move = { dx: number, dy: number }

enum EndGameReason {
  COLLISION = 'COLLISION',
  WALL_HIT = 'WALL_HIT'
}

export class SnakeGame {

  private readonly GAME_SPEED: number = 50;
  private readonly snakeWidth: number = 10;
  private readonly canvasContext!: CanvasRenderingContext2D;

  private currMove: Move;
  private nextMove: Move;
  private apple: Point;
  private snake: Point[];

  /**
   * canvasRef   - anchor for rendering game
   * endGame     - signal for informing parent component about end game state. If no provided
   * than game will just end without notification
   * snakeLength - defines how many block will the snake have as his length
   */
  constructor(private readonly canvasRef: HTMLCanvasElement,
              private readonly score: WritableSignal<number>,
              private readonly endGame: WritableSignal<boolean> = signal(false),
              private readonly snakeLength: number = 10) {
    this.canvasContext = canvasRef.getContext('2d') as CanvasRenderingContext2D;
    this.currMove = {dx: this.snakeWidth, dy: 0};
    this.nextMove = structuredClone(this.currMove); // deep clone
    this.apple = this.getRandomPoint();
    this.snake = this.initSnake(this.snakeWidth * snakeLength, this.snakeWidth, this.snakeLength);
  }

  public initialGameState(): void {
    this.clearCanvas(this.canvasContext, this.canvasRef);
    this.drawSnake(false);
    this.renderApple();
  }

  public gameLoop(): void {
    setTimeout((): void => {
      this.clearCanvas(this.canvasContext, this.canvasRef);
      this.currMove = this.nextMove;
      this.moveSnake(this.currMove);
      this.checkScore();
      const end: boolean | EndGameReason = this.isEndGame();
      this.drawSnake(end);
      if (end) {
        this.score.update(() => 0);
        this.endGame.set(true);
        return;
      }
      this.gameLoop();
    }, this.GAME_SPEED);
  }


  public newKeyboardMove(event: Event | undefined): void {
    if (event) {
      this.nextMove = this.changeDirection(event as KeyboardEvent, this.currMove);
    }
  }

  private initSnake(startX: number, startY: number, length: number): Point[] {
    if (length < 3) {
      throw Error('At least snake must be 3 unit width');
    }
    const arr: Point[] = [];
    for (let i = 0; i < length; i++) {
      arr.push({x: startX - (i * this.snakeWidth), y: startY});
    }
    return arr;
  }


  private clearCanvas(context: CanvasRenderingContext2D,
                      canvasRef: HTMLCanvasElement,
                      gameBackground = '#000022',
                      gameBordersColor = '#FF0099'): void {
    context.fillStyle = gameBackground;
    context.strokeStyle = gameBordersColor;
    context.fillRect(0, 0, canvasRef.width, canvasRef.height);
    context.strokeRect(0, 0, canvasRef.width, canvasRef.height);
  }

  private renderApple(applePosition?: Point): void {
    if (!applePosition) {
      applePosition = this.getRandomPoint();
      while (this.snake.includes(applePosition)) {
        applePosition = this.getRandomPoint();
      }
      this.apple = applePosition;
    }
    this.renderCircle(this.canvasContext, applePosition, 'green', 'black');
  }

  private renderCircle(context: CanvasRenderingContext2D,
                       snakePart: Point,
                       fillStyle = 'yellow',
                       strokeStyle = 'blue'): void {
    context.fillStyle = fillStyle;
    context.strokeStyle = strokeStyle;

    context.beginPath();
    const radius = this.snakeWidth * 0.5;
    context.arc(snakePart.x + radius, snakePart.y + radius, radius, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
  }


  private moveSnake(move: Move) {
    const newStep = {x: this.snake[0].x + move.dx, y: this.snake[0].y + move.dy};
    this.snake.unshift(newStep);
    this.snake.pop();
  }


  private changeDirection(event: KeyboardEvent, move: Move): Move {
    const upMove: boolean = move.dy === -this.snakeWidth;
    const downMove: boolean = move.dy === this.snakeWidth;
    const rightMove: boolean = move.dx === this.snakeWidth;
    const leftMove: boolean = move.dx === -this.snakeWidth;

    if (event.key === 'ArrowLeft' && !rightMove) {
      return {dx: -this.snakeWidth, dy: 0};
    }

    if (event.key === 'ArrowUp' && !downMove) {
      event.preventDefault();
      return {dx: 0, dy: -this.snakeWidth};
    }

    if (event.key === 'ArrowRight' && !leftMove) {
      return {dx: this.snakeWidth, dy: 0};
    }

    if (event.key === 'ArrowDown' && !upMove) {
      event.preventDefault();
      return {dx: 0, dy: this.snakeWidth};
    }
    return move;
  }


  private drawSnake(end: boolean | EndGameReason): void {
    if (end) {
      const coloredIndexes = (EndGameReason.WALL_HIT) ? [0, 1] : [0, 1, 2];
      coloredIndexes.map(i => this.snake[i])
        .forEach((p: Point) => this.renderCircle(this.canvasContext, p, 'red'));
      this.snake.slice(coloredIndexes.length).forEach((p: Point) => this.renderCircle(this.canvasContext, p));
    } else {
      this.snake.forEach((p: Point) => this.renderCircle(this.canvasContext, p));
    }
  }

  private isEndGame(): boolean | EndGameReason {
    for (let i = 4; i < this.snake.length; i++) {
      if (this.snake[i].x === this.snake[0].x /* collision */
        && this.snake[i].y === this.snake[0].y)
        return EndGameReason.COLLISION;
    }

    const hitLeftWall = this.snake[0].x < 0;
    const hitRightWall = this.snake[0].x > this.canvasRef.width - this.snakeWidth;
    const hitTopWall = this.snake[0].y < 0;
    const hitBottomWall = this.snake[0].y > this.canvasRef.height - this.snakeWidth;

    return (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) ?
      EndGameReason.WALL_HIT : false;
  }

  private getRandomPoint(): Point {
    const randPossibility = Math.random();
    let randX = this.getRandomInt(this.canvasRef.width - this.snakeWidth);
    let randY = this.getRandomInt(this.canvasRef.height - this.snakeWidth);
    randX = (randPossibility > 0.5) ? randX - randX % this.snakeWidth : randX + (this.snakeWidth - randX % this.snakeWidth);
    randY = (randPossibility > 0.5) ? randY - randY % this.snakeWidth : randY + (this.snakeWidth - randY % this.snakeWidth);
    return {x: randX, y: randY};
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  private checkScore(): void {
    if (this.snake[0].x === this.apple.x && this.snake[0].y === this.apple.y) {
      const score = {x: this.apple.x + this.currMove.dx, y: this.apple.y + this.currMove.dy};
      this.snake.unshift(score);
      this.score.update(this.calculateScore());
      this.renderApple();
    } else {
      this.renderApple(this.apple);
    }
  }

  private calculateScore() {
    return (val: number): number => {
      const gainedDots: number = this.snake.length - this.snakeLength;
      if (gainedDots < 4) {
        return val + 10;
      }
      if (gainedDots < 6) {
        return val + 20;
      }
      if (gainedDots < 10) {
        return val + 30;
      }
      if (gainedDots < 15) {
        return val + 40;
      }
      if (gainedDots < 20) {
        return val + 40;
      }
      return val + (gainedDots + 20);
    };
  }
}
