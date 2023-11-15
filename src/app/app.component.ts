import {AfterViewInit, ChangeDetectionStrategy, Component, signal, WritableSignal} from '@angular/core';
import {DialogElem} from './model/dialog-elem';
import {Optional} from './components/utils/optional';
import {DialogProviderService} from './services/dialog-provider.service';

@Component({
  selector: 'albi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogProviderService]
})
export class AppComponent implements AfterViewInit {
  conversation: WritableSignal<DialogElem[]> = signal<DialogElem[]>([]);
  source!: DialogElem[];

  constructor(private readonly dialogService: DialogProviderService) {
    this.source = this.dialogService.dialog.slice(this.dialogService.dialog.slice().length-2);
  }

  ngAfterViewInit(): void {
    this.nextQuestion();
  }


  nextQuestion(): void {
    Optional.of(this.source.shift()).ifPresent((dialogElem: DialogElem) => {
      this.conversation.set(this.conversation().concat(dialogElem));
    });

  }


}
