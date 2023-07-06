import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  EventEmitter,
  signal,
  WritableSignal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Renderable} from '../../model/renderable';
import {fromEvent, take} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {SnakeGame} from './snake-game';


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
  notStartedGame: WritableSignal<boolean> = signal(true);
  score: WritableSignal<number> = signal(0);

  private canvasRef!: HTMLCanvasElement;
  private game!: SnakeGame;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    const keySignal = toSignal<Event>(fromEvent(document, 'keydown'));
    effect((): void => this.game?.newKeyboardMove(keySignal()));
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    this.initGameState();
    fromEvent(document.getElementById('continueBtn') as HTMLButtonElement, 'click')
      .pipe(take(1))
      .subscribe(() => evt.emit(true));
  }

  private initGameState(): void {
    this.canvasRef = document.getElementById('game') as HTMLCanvasElement;
    this.applySizeIfMobile();
    this.game = new SnakeGame(this.canvasRef, this.score, this.endGame);
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
}
