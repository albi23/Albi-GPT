import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  signal,
  VERSION,
  WritableSignal
} from '@angular/core';
import {DialogElem} from './model/dialog-elem';
import {Optional} from './components/utils/optional';
import {DialogProviderService} from './services/dialog-provider.service';
import {UserActivityService} from './services/user-activity.service';

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
  activeListener(event: Event): void {
    this.userActivityService.nextEvt(event);
  }

}
