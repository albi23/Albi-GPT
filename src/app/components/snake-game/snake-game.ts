import {signal, WritableSignal} from '@angular/core';
import {ScoreCalculator} from './score-calculator';
import {Move, Point, ScoreTracker} from '../../types/types';
import {Utils} from '../../shared/utils/utils';
import {Optional} from '../../shared/utils/optional';
import {FireworksRenderer} from './fireworks-renderer';

enum EndGameReason {
  COLLISION = 'COLLISION',
  WALL_HIT = 'WALL_HIT'
}

export class SnakeGame {

  private readonly canvasContext!: CanvasRenderingContext2D;

  private currMove: Move;
  private nextMove: Move;
  private apple: Point;
  private snake: Point[];
  private readonly scoreGenerator: ScoreCalculator = new ScoreCalculator();
  private readonly fireworksRenderer: FireworksRenderer;

  /**
   * canvasRef   - anchor for rendering game
   * endGame     - signal for informing parent component about end game state. If no provided
   * than game will just end without notification
   * snakeLength - defines how many block will the snake have as his length
   */
  constructor(private readonly canvasRef: HTMLCanvasElement,
              private readonly score: WritableSignal<ScoreTracker>,
              private readonly endGame: WritableSignal<boolean> = signal(false),
              private readonly GAME_SPEED: number = 50,
              private readonly snakeDotSize: number = 10,
              private readonly snakeLength: number = 10) {
    this.canvasContext = canvasRef.getContext('2d') as CanvasRenderingContext2D;
    this.snake = this.initSnake(0, 0, this.snakeLength);
    this.currMove = this.calculateInitialMove();
    this.nextMove = structuredClone(this.currMove); // deep clone
    this.apple = this.renderApple();
    this.fireworksRenderer = new FireworksRenderer(canvasRef.width, canvasRef.height, this.canvasContext);
  }

  public initialGameState(): void {
    this.initializeScoreTracker(this.score());
    this.clearCanvas(this.canvasContext, this.canvasRef);
    this.drawSnake(false);
    this.apple = this.renderApple();
  }

  lunchGame(): void {
    this.gameLoop();
  }

  private gameLoop(): void {
    setTimeout((): void => {
      this.clearCanvas(this.canvasContext, this.canvasRef);
      this.currMove = this.nextMove;
      this.moveSnake(this.currMove);
      this.checkScore();
      const end: boolean | EndGameReason = this.isEndGame();
      this.drawSnake(end);
      if (end) {
        this.endGame.set(true);
        this.endingFireworks(end);

        return;
      }
      this.gameLoop();
    }, this.GAME_SPEED);
  }

  private endingFireworks(end: EndGameReason.COLLISION | EndGameReason.WALL_HIT | boolean) {
    setTimeout(() => {
      this.drawSnake(end);
      this.clearCanvas(this.canvasContext, this.canvasRef);
      this.fireworksRenderer.renderFireworks();
      if (this.endGame()) {
        this.endingFireworks(end);
      } else {
        this.fireworksRenderer.restoreDefaultsCanvas();
      }
    }, this.GAME_SPEED * 0.5);
  }

  private initializeScoreTracker(currentScore: ScoreTracker): void {
    Optional.of(localStorage.getItem('SCORE'))
      .ifPresentOrElse((savedScore): void => {
          const scoreFromLocalStorage = +(savedScore as string);
          this.score.set({currScore: 0, bestScore: Math.max(currentScore.currScore, scoreFromLocalStorage)});
        },
        (): void => this.score.set({currScore: 0, bestScore: Math.max(currentScore.bestScore, currentScore.currScore)})
      );
    localStorage.setItem('SCORE', String(this.score().bestScore));
  }


  public newKeyboardMove(event: Event | CustomEvent<{ key: string }> | undefined): void {
    if (event) {
      this.nextMove = this.changeDirection(event as KeyboardEvent | CustomEvent<{ key: string }>, this.currMove);
    }
  }

  private initSnake(startX: number, startY: number, length: number): Point[] {
    if (length < 3) {
      throw Error('At least snake must be 3 unit width');
    }
    if (startX < 0 || startY < 0 || startX > (this.canvasRef.width - this.snakeDotSize)
      || startY > (this.canvasRef.height - this.snakeDotSize)) {
      throw Error(`Provided incorrect value [startX: ${startX}, startY: ${startY}].\n
       Allowed: 0 <= startX <= ${this.canvasRef.width - this.snakeDotSize}\n
                0 <= startY <= ${this.canvasRef.height - this.snakeDotSize}\n`
      );
    }
    const arr: Point[] = [];
    const maxXCord: number = (this.canvasRef.width);
    let xPos: number = startX;
    let yPos: number = startY;
    let step: number = this.snakeDotSize;
    for (let i = 0; i < length; i++) {
      if (xPos >= maxXCord || xPos < 0) {
        xPos = (xPos >= maxXCord) ? maxXCord - this.snakeDotSize : 0;
        yPos += Math.abs(step);
        step = -step;
      }
      arr.unshift({x: xPos, y: yPos});
      xPos += step;
    }
    return arr;
  }

  private calculateInitialMove(): Move {
    const isGoingToLeft: boolean = (this.snake[0].x - this.snake[1].x < 0);
    if (isGoingToLeft) {
      const isCloseToLeftWall: boolean = (this.snake[0].x === 0 || this.snake[0].x === this.snakeDotSize);
      return (isCloseToLeftWall) ? {dx: 0, dy: this.snakeDotSize} : {dx: -this.snakeDotSize, dy: 0};
    } else {
      const isCloseToRightWall: boolean = (this.snake[0].x === this.canvasRef.width - 2 * this.snakeDotSize ||
        this.snake[0].x === this.canvasRef.width - this.snakeDotSize);
      return (isCloseToRightWall) ? {dx: 0, dy: this.snakeDotSize} : {dx: this.snakeDotSize, dy: 0};
    }
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

  private renderApple(applePosition?: Point): Point {
    if (!applePosition) {
      applePosition = this.getRandomPoint();
      while (this.snake.find((snakePoint) => snakePoint.x === applePosition?.x && snakePoint.y === applePosition?.y)) {
        applePosition = this.getRandomPoint();
      }
    }
    this.renderCircle(this.canvasContext, applePosition, 'green', 'black');
    return applePosition;
  }

  private renderCircle(context: CanvasRenderingContext2D,
                       snakePart: Point,
                       fillStyle = 'yellow',
                       strokeStyle = 'blue'): void {
    context.fillStyle = fillStyle;
    context.strokeStyle = strokeStyle;

    context.beginPath();
    const radius = this.snakeDotSize * 0.5;
    context.arc(snakePart.x + radius, snakePart.y + radius, radius, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
  }


  private moveSnake(move: Move) {
    const newStep = {x: this.snake[0].x + move.dx, y: this.snake[0].y + move.dy};
    this.snake.unshift(newStep);
    this.snake.pop();
  }


  private changeDirection(event: KeyboardEvent | CustomEvent<{ key: string }>, move: Move): Move {
    const upMove: boolean = move.dy === -this.snakeDotSize;
    const downMove: boolean = move.dy === this.snakeDotSize;
    const rightMove: boolean = move.dx === this.snakeDotSize;
    const leftMove: boolean = move.dx === -this.snakeDotSize;

    const key = (event instanceof KeyboardEvent) ? event.key : event.detail.key;
    if (key === 'ArrowLeft' && !rightMove) {
      return {dx: -this.snakeDotSize, dy: 0};
    }

    if (key === 'ArrowUp' && !downMove) {
      event.preventDefault();
      return {dx: 0, dy: -this.snakeDotSize};
    }

    if (key === 'ArrowRight' && !leftMove) {
      return {dx: this.snakeDotSize, dy: 0};
    }

    if (key === 'ArrowDown' && !upMove) {
      event.preventDefault();
      return {dx: 0, dy: this.snakeDotSize};
    }
    return move;
  }


  private drawSnake(end: boolean | EndGameReason): void {
    if (end) {
      const coloredIndexes = (end === EndGameReason.WALL_HIT) ? [0, 1] : [0, 1, 2];
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
    const hitRightWall = this.snake[0].x > this.canvasRef.width - this.snakeDotSize;
    const hitTopWall = this.snake[0].y < 0;
    const hitBottomWall = this.snake[0].y > this.canvasRef.height - this.snakeDotSize;

    return (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) ?
      EndGameReason.WALL_HIT : false;
  }

  private getRandomPoint(): Point {
    const randPossibility = Math.random();
    let randX = Utils.getRandomInt(this.canvasRef.width - this.snakeDotSize);
    let randY = Utils.getRandomInt(this.canvasRef.height - this.snakeDotSize);
    randX = (randPossibility > 0.5) ? randX - randX % this.snakeDotSize : randX + (this.snakeDotSize - randX % this.snakeDotSize);
    randY = (randPossibility > 0.5) ? randY - randY % this.snakeDotSize : randY + (this.snakeDotSize - randY % this.snakeDotSize);
    return {x: randX, y: randY};
  }

  private checkScore(): void {
    if (this.snake[0].x === this.apple.x && this.snake[0].y === this.apple.y) {
      const score = {x: this.apple.x + this.currMove.dx, y: this.apple.y + this.currMove.dy};
      this.snake.unshift(score);
      this.score.update(this.calculateScore());
      this.apple = this.renderApple();
    } else {
      this.apple = this.renderApple(this.apple);
    }
  }

  private calculateScore(): (val: ScoreTracker) => ScoreTracker {
    return (scoreTracker: ScoreTracker): ScoreTracker => {
      const gainedDots: number = this.snake.length - this.snakeLength;
      return {
        currScore: this.scoreGenerator.calculateScore(scoreTracker.currScore, gainedDots),
        bestScore: scoreTracker.bestScore
      };
    };
  }

}

