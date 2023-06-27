import {Component, EventEmitter} from '@angular/core';
import {Renderable} from '../../model/renderable';

@Component({
  selector: 'albi-map',
  templateUrl: './map.component.svg',
  standalone: true
})
export class MapComponent extends Renderable {
  svgWidth = Math.min(window.screen.width, 727);
  svgHeight = Math.min(window.screen.width, 480);

  override renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    Renderable.actionAfterDelay(2000, () => evt.emit(true));
  }
}
