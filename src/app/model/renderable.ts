import {EventEmitter} from '@angular/core';
import {delay, of, take} from 'rxjs';

export type RenderFun = ((evt: EventEmitter<boolean>) => void)

export class Renderable {

  renderDone(evt: EventEmitter<boolean>): void {
    Renderable.actionAfterDelay(0, () => evt.emit(true));
  }

  static actionAfterDelay(delayMs: number, action: () => void): void {
    if (delayMs < 0) {
      throw Error('Negative delay arg ' + delayMs);
    }
    of(null)
      .pipe(
        delay(delayMs),
        take(1)
      ).subscribe(_ => action());

  }

  static scrollToBottom(): void {
    const objDiv = document.getElementById('scrollable-root') as HTMLDivElement;
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  static scrollToBottomAfterDelay(delay: number): void {
    Renderable.actionAfterDelay(delay, () => Renderable.scrollToBottom());
  }
}
