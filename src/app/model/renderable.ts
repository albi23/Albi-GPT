import {EventEmitter} from '@angular/core';
import {delay, interval, of, take} from 'rxjs';

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

  static progressiveScroll(scrollPercentage: number, timeInterval : number = 100): void {
    if (scrollPercentage < 0 && scrollPercentage > 1) {
      throw Error('Percentage arg \'scrollPercentage\' must be in range  [0,1]');
    }
    const objDiv = document.getElementById('scrollable-root') as HTMLDivElement;
    const lengthToScroll: number = objDiv.scrollHeight;
    const maxSteps = Math.round(1.0 / scrollPercentage);

    interval(timeInterval)
      .pipe(
        take(maxSteps),
      ).subscribe({
      next: (step) => {
        objDiv.scrollTop = (step + 1)  * lengthToScroll * scrollPercentage;
      },
      complete: () => {
        objDiv.scrollTop = lengthToScroll;
      }
    });
  }
}
