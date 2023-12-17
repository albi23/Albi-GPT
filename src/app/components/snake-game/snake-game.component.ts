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
import {
  filter,
  fromEvent,
  interval,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  timer
} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SnakeGame} from './snake-game';
import {UserActivityService} from '../../services/user-activity.service';
import {Utils} from '../../shared/utils/utils';


@Component({
  selector: 'albi-snake-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakeGameComponent extends Renderable implements AfterViewInit {

  score: WritableSignal<number> = signal(0);
  endGame: WritableSignal<boolean> = signal(false);
  notStartedGame: WritableSignal<boolean> = signal(true);
  buttonText: WritableSignal<string> = signal<string>('Next');
  isMobile: WritableSignal<boolean> = signal(true);


  private static instanceCount = 0;
  readonly idSuffix: number;
  private canvasRef!: HTMLCanvasElement;
  private game!: SnakeGame;
  private evt!: EventEmitter<boolean>;
  private readonly inactivitySkip = new Subject<void>();
  private readonly INACTIVITY_TIME_OUT = 10_000;

  constructor(private cdr: ChangeDetectorRef,
              private activityService: UserActivityService) {
    super();
    this.idSuffix = ++SnakeGameComponent.instanceCount;
    this.isMobile.set(Utils.isMobileDevice());

    fromEvent(document, 'keydown')
      .pipe(takeUntilDestroyed())
      .subscribe((evt: Event): void => this.forwardEvtIntoGameHandler(evt));
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    this.evt = evt;
    Renderable.scrollToBottom();
    this.cdr.markForCheck();
    Renderable.scrollToBottomAfterDelay(100);
  }

  ngAfterViewInit(): void {
    merge(
      fromEvent(document.getElementById('continueBtn' + this.idSuffix) as HTMLButtonElement, 'click'),
      this.inactivitySkip
    )
      .pipe(
        take(1),
        tap(() => this.inactivitySkip.next())
      )
      .subscribe(() => this.evt.emit(true));
    this.initGameState();
    this.startInactivityDetection();
  }

  startGame(): void {
    this.notStartedGame.set(false);
    this.game.gameLoop();
  }

  restartGame(): void {
    this.endGame.set(false);
    this.applySizeIfMobile();
    this.game = this.getSnakeGameInstance();
    this.startGame();
  }

  wrapNeEvent(direction: string): void {
    const c = new CustomEvent('Move', {detail: {key: direction}});
    c.preventDefault();
    this.forwardEvtIntoGameHandler(c);
  }

  private forwardEvtIntoGameHandler(evt: Event | CustomEvent<{ key: string }>): void {
    this.game?.newKeyboardMove(evt);
  }

  private startInactivityDetection(): void {
    const userMoves$ = this.activityService.listenUserEvents()
      .pipe(filter(x => x !== null)) as Observable<Event>;

    interval(this.INACTIVITY_TIME_OUT).pipe(
      take(1),
      switchMap(() => userMoves$),
      tap(() => this.buttonText.set('Next')),
      switchMap(() =>
        interval(this.INACTIVITY_TIME_OUT).pipe(
          take(1),
          switchMap(() => timer(0, 1000).pipe(map((i: number) => i + 1))),
        )
      ),
      filter((val: number): boolean => val > 4),
      takeUntil(this.inactivitySkip),
    ).subscribe((count: number): void => {
      this.buttonText.set(`Next ${10 - count}`);
      if (count == 10) {
        this.buttonText.set('Next');
        this.inactivitySkip.next();
      }
    });
  }

  private initGameState(): void {
    this.canvasRef = document.getElementById('game' + this.idSuffix) as HTMLCanvasElement;
    this.applySizeIfMobile();
    this.game = this.getSnakeGameInstance();
    this.game.initialGameState();
    this.cdr.markForCheck();
  }

  private applySizeIfMobile() {
    this.canvasRef.width = Math.min(1000, (this.canvasRef.parentElement as HTMLElement).offsetWidth - 20);
    this.canvasRef.height = Math.min(400, window.screen.height);
  }

  private getSnakeGameInstance(): SnakeGame {

    return (SnakeGameComponent.instanceCount === 1) ?
      new SnakeGame(this.canvasRef, this.score, this.endGame, this.isMobile() ? 70 : 50) :
      new SnakeGame(this.canvasRef, this.score, this.endGame, this.isMobile() ? 100 : 70, 20);
  }
}
