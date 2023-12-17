import {ChangeDetectorRef, Component, EventEmitter, Signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RxJsComponent} from './rx-js/rx-js.component';
import {Renderable} from '../../model/renderable';
import {interval, take, tap} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {Utils} from '../../shared/utils/utils';

@Component({
  selector: 'albi-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  imports: [
    NgOptimizedImage,
    RxJsComponent,
    CommonModule,
  ],
  standalone: true
})
export class SkillsComponent extends Renderable {

  isMobileDevice = false;

  private readonly RENDER_ITEM_DELAY: number = 900;

  skillCount = toSignal<number>(interval(this.RENDER_ITEM_DELAY)
    .pipe(tap(() => Renderable.scrollToBottomAfterDelay(200)),
      take(8))) as Signal<number>;


  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.isMobileDevice = Utils.isMobileDevice();
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    Renderable.actionAfterDelay(8_000, () => evt.emit(true));
    this.cdr.markForCheck();
  }

}
