import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  signal,
  WritableSignal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Renderable} from '../../model/renderable';
import {fromEvent, take} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SnakeGame} from './snake-game';


@Component({
  selector: 'albi-snake-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakeGameComponent extends Renderable implements AfterViewInit {

  static instanceCount = 0;
  endGame: WritableSignal<boolean> = signal(false);
  notStartedGame: WritableSignal<boolean> = signal(true);
  score: WritableSignal<number> = signal(0);

  readonly idSuffix: number;
  private canvasRef!: HTMLCanvasElement;
  private game!: SnakeGame;
  private evt!: EventEmitter<boolean>;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.idSuffix = ++SnakeGameComponent.instanceCount;
    fromEvent(document, 'keydown')
      .pipe(takeUntilDestroyed())
      .subscribe((evt: Event): void => this.game?.newKeyboardMove(evt));
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    this.evt = evt;
    Renderable.scrollToBottom();
    this.cdr.markForCheck();
  }

  ngAfterViewInit(): void {
    fromEvent(document.getElementById('continueBtn' + this.idSuffix) as HTMLButtonElement, 'click')
      .pipe(take(1))
      .subscribe(() => this.evt.emit(true));
    this.initGameState();
  }


  private initGameState(): void {
    this.canvasRef = document.getElementById('game' + this.idSuffix) as HTMLCanvasElement;
    this.applySizeIfMobile();
    this.game = this.getSnakeGameInstance();
    this.game.initialGameState();
    this.cdr.markForCheck();
  }

  private applySizeIfMobile() {
    this.canvasRef.width = Math.min(800, (this.canvasRef.parentElement as HTMLElement).offsetWidth - 20);
    this.canvasRef.height = Math.min(400, window.screen.height);
  }

  startGame(): void {
    this.notStartedGame.set(false);
    this.game.gameLoop();
  }

  restartGame(): void {
    this.endGame.set(false);
    this.applySizeIfMobile();
    this.game = new SnakeGame(this.canvasRef, this.score, this.endGame);
    this.startGame();
  }

  private getSnakeGameInstance(): SnakeGame {
    return (SnakeGameComponent.instanceCount === 1) ?
      new SnakeGame(this.canvasRef, this.score, this.endGame) :
      new SnakeGame(this.canvasRef, this.score, this.endGame, 70, 20);
  }
}
