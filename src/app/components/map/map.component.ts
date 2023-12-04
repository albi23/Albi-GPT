import {ChangeDetectorRef, Component, EventEmitter} from '@angular/core';
import {Renderable} from '../../model/renderable';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'albi-map',
  templateUrl: './map.component.html',
  standalone: true,
  styleUrls: ['./map.component.scss'],
  animations: [
    trigger('polPath', [
      transition(':enter', [
        style({fill: '#333', 'stroke-width': 0}),
        animate('1.5s ease-in',
          style(
            {fill: '#ff0099', 'stroke-width': 2},
          )
        ),
      ])
    ])
  ]
})
export class MapComponent extends Renderable {

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    this.cdr.markForCheck();
    Renderable.scrollToBottom();
    Renderable.actionAfterDelay(2000, () => evt.emit(true));
  }
}
