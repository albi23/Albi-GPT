import {ChangeDetectorRef, Component, EventEmitter, Signal} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {RxJsComponent} from './rx-js/rx-js.component';
import {Renderable} from '../../model/renderable';
import {interval, take, tap} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
    selector: 'albi-skills',
    templateUrl: './ui-skills.component.html',
    styleUrls: ['./ui-skills.component.scss'],
    imports: [
    NgOptimizedImage,
    RxJsComponent
]
})
export class UiSkillsComponent extends Renderable {

  private readonly RENDER_ITEM_DELAY: number = 900;

  skillCount = toSignal<number>(interval(this.RENDER_ITEM_DELAY)
    .pipe(tap(() => Renderable.scrollToBottomAfterDelay(200)),
      take(8))) as Signal<number>;


  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    Renderable.actionAfterDelay(8_000, () => evt.emit(true));
    this.cdr.markForCheck();
  }

}
