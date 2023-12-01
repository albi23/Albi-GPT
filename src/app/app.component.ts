import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Signal,
  signal,
  VERSION,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {DialogElem} from './model/dialog-elem';
import {Optional} from './shared/utils/optional';
import {DialogProviderService} from './services/dialog-provider.service';
import {UserActivityService} from './services/user-activity.service';
import {DOCUMENT} from '@angular/common';
import {Point} from './types/types';
import {Utils} from './shared/utils/utils';
import {toSignal} from '@angular/core/rxjs-interop';
import {interval, map, take} from 'rxjs';

@Component({
  selector: 'albi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogProviderService, UserActivityService]
})
export class AppComponent implements AfterViewInit {
  protected readonly VERSION: string = VERSION.full;
  source!: DialogElem[];
  conversation: WritableSignal<DialogElem[]> = signal<DialogElem[]>([]);
  animationDone: Signal<boolean> = toSignal(interval(9_650).pipe(
    take(1),
    map(() => true)), {initialValue: false}) as Signal<boolean>;
  readonly grid25: number[] = new Array<number>(25);


  constructor(private readonly dialogService: DialogProviderService,
              private readonly userActivityService: UserActivityService) {
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

}
