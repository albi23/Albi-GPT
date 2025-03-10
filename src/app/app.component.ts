import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  HostListener,
  Signal,
  signal,
  VERSION,
  WritableSignal
} from '@angular/core';
import {DialogElem} from './model/dialog-elem';
import {Optional} from './shared/utils/optional';
import {DialogProviderService} from './services/dialog-provider.service';
import {UserActivityService} from './services/user-activity.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {interval, map, take} from 'rxjs';
import {environment} from '../environments/environment';
import {Utils} from './shared/utils/utils';

@Component({
    selector: 'albi-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DialogProviderService, UserActivityService],
    standalone: false
})
export class AppComponent implements AfterViewInit {
  protected readonly VERSION: string = VERSION.full;
  source!: DialogElem[];
  conversation: WritableSignal<DialogElem[]> = signal<DialogElem[]>([]);
  isMobile: Signal<boolean> = signal<boolean>(Utils.isMobileDevice());
  animationDone: Signal<boolean> = toSignal(interval(environment.WELCOME_ANIMATION_DURATION).pipe(
    take(1),
    map(() => true)), {initialValue: false}) as Signal<boolean>;
  readonly grid25: number[] = new Array<number>(25);


  constructor(private readonly dialogService: DialogProviderService,
              private readonly userActivityService: UserActivityService) {
    this.source = this.dialogService.dialog.slice();
    effect((): void => {
      if (this.animationDone()) {
        this.startHeaderAnimations();
      }
    });
  }

  ngAfterViewInit(): void {
    this.nextQuestion();
  }

  private startHeaderAnimations(): void {
    setTimeout((): void => {
      const starsToAnimate = document.getElementsByClassName('magic-star') as HTMLCollectionOf<HTMLSpanElement>;
      for (let i = 0; i < starsToAnimate.length; i++) {
        const star = starsToAnimate.item(i) as HTMLSpanElement;
        setTimeout((): void => {
          this.starAnimation(star);
          setInterval((): void => this.starAnimation(star), 750);
        }, (i) * 250);
      }
    }, 1);

  }

  private starAnimation(star: HTMLSpanElement): void {
    star.style.setProperty('--star-left', `${Utils.getRandomInRange(-10, 100)}%`);
    star.style.setProperty('--star-top', `${Utils.getRandomInRange(-10, 80)}%`);
    star.style.animation = 'none';
    star.offsetHeight;
    star.style.animation = '';
  }

  nextQuestion(): void {
    Optional.of(this.source.shift()).ifPresent((dialogElem: DialogElem) => {
      this.conversation.set(this.conversation().concat(dialogElem));
    });
  }

  @HostListener('click', ['$event'])
  @HostListener('mousemove', ['$event'])
  @HostListener('window:keydown', ['$event'])
  @HostListener('touchstart', ['$event'])
  activeUserListener(event: Event): void {
    this.userActivityService.nextEvt(event);
  }

}
