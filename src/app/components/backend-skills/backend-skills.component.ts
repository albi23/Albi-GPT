import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Signal} from '@angular/core';
import {Renderable} from '../../model/renderable';
import {toSignal} from '@angular/core/rxjs-interop';
import {interval, take, tap} from 'rxjs';

@Component({
  selector: 'albi-backend-skills',
  standalone: true,
  imports: [],
  templateUrl: './backend-skills.component.html',
  styleUrl: './backend-skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackendSkillsComponent implements Renderable {

  private readonly RENDER_ITEM_DELAY: number = 900;

  skillCount = toSignal<number>(interval(this.RENDER_ITEM_DELAY)
    .pipe(tap(() => {
        Renderable.scrollToBottomAfterDelay(200);
        this.cdr.markForCheck();
      }),
      take(8))) as Signal<number>;


  constructor(private cdr: ChangeDetectorRef) {
  }

  renderDone(evt: EventEmitter<boolean>): void {
    Renderable.actionAfterDelay(8_000, () => evt.emit(true));
  }


  openLink(url: string): void {
    window.open(url, '_blank');
  }
}
