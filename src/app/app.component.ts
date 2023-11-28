import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, ElementRef,
  HostListener, Inject,
  signal,
  VERSION, ViewChild,
  WritableSignal
} from '@angular/core';
import {DialogElem} from './model/dialog-elem';
import {Optional} from './shared/utils/optional';
import {DialogProviderService} from './services/dialog-provider.service';
import {UserActivityService} from './services/user-activity.service';
import {DOCUMENT} from '@angular/common';
import {Point} from './types/types';
import {Utils} from './shared/utils/utils';

@Component({
  selector: 'albi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogProviderService, UserActivityService]
})
export class AppComponent implements AfterViewInit {
  protected readonly VERSION: string = VERSION.full;
  conversation: WritableSignal<DialogElem[]> = signal<DialogElem[]>([]);
  source!: DialogElem[];
  @ViewChild('gptSection') private gptSection!: ElementRef;
  private lastRendered: Point = {x: 0, y: 0};
  private colors: string[] = ['#ec4899', '#8b5cf6', '#4338ca', '#c026d3'];
  private animation: string[] = ['fall', 'fall2', 'fall3'];

  constructor(private readonly dialogService: DialogProviderService,
              private readonly userActivityService: UserActivityService,
              @Inject(DOCUMENT) private document: Document) {
    this.source = this.dialogService.dialog.slice();
  }

  ngAfterViewInit(): void {
    this.nextQuestion();
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

  @HostListener('mousemove', ['$event'])
  renderStars(mouseEvt: MouseEvent): void {
    const currPoint: Point = {x: mouseEvt.x, y: mouseEvt.y};
    if (Utils.calculateDistance(currPoint, this.lastRendered) < 100) {
      return;
    }
    this.lastRendered = currPoint;
    const star: HTMLElement = this.constructStar(mouseEvt);
    this.gptSection.nativeElement?.appendChild(star);
    setTimeout(() => this.gptSection.nativeElement?.removeChild(star), 1500);
  }


  private constructStar(mouseEvt: MouseEvent): HTMLElement {
    const star: HTMLElement = this.document.createElement('i');
    star.style.left = `${mouseEvt.x}px`;
    star.style.top = `${mouseEvt.y}px`;
    star.style.color = Utils.pickRandom(this.colors);
    star.style.animation = Utils.pickRandom(this.animation);
    star.style.animationDuration = '1501ms';
    star.className = 'dot fa-solid fa-star';
    return star;
  }

}
