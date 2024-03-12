import {ChangeDetectionStrategy, Component, EventEmitter, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Renderable} from '../../model/renderable';
import {MarkdownComponent} from 'ngx-markdown';
import {ClipboardButtonComponent} from '../java-tips/clipboard-button/clipboard-button.component';

@Component({
  selector: 'albi-angular-snippet',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './angular-snippet.component.html',
  styleUrl: './angular-snippet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AngularSnippetComponent extends Renderable {
  parsingDone: WritableSignal<boolean> = signal(false);
  readonly clipboardButton = ClipboardButtonComponent;
  readonly rxJsSnippet = '```ts' +
    '\n  private startInactivityDetection(): void {\n' +
    '    const userMoves$ = this.activityService.listenUserEvents()\n' +
    '      .pipe(filter(x => x !== null)) as Observable<Event>;\n' +
    '\n' +
    '    interval(this.INACTIVITY_TIME_OUT).pipe(\n' +
    '        take(1),\n' +
    '        switchMap(() => userMoves$),\n' +
    '        tap(() => this.buttonText.set(\'Next\')),\n' +
    '        switchMap(() =>\n' +
    '          interval(this.INACTIVITY_TIME_OUT).pipe(\n' +
    '            take(1),\n' +
    '            switchMap(() => timer(0, 1000).pipe(map((i: number) => i + 1))),\n' +
    '          )\n' +
    '        ),\n' +
    '        filter((val: number): boolean => val > 4),\n' +
    '        takeUntil(this.inactivitySkip),\n' +
    '      ).subscribe((count: number): void => {\n' +
    '      this.buttonText.set(`Next ${10 - count}`);\n' +
    '      if (count == 10) {\n' +
    '        this.buttonText.set(\'Next\');\n' +
    '        this.inactivitySkip.next();\n' +
    '      }\n' +
    '    });\n' +
    '  }';


  override renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    Renderable.scrollToBottomAfterDelay(1000);
    Renderable.actionAfterDelay(6000, () => evt.emit(true));
  }

  onParseReady(): void {
    this.parsingDone.set(true);
    Renderable.scrollToBottom();
  }
}
