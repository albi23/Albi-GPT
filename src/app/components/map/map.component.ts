import { ChangeDetectorRef, Component, EventEmitter, inject } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  tooltip = {
    visible: false,
    text: '',
    x: 0,
    y: 0,
  };

  override renderDone(evt: EventEmitter<boolean>): void {
    this.cdr.markForCheck();
    Renderable.scrollToBottom();
    Renderable.actionAfterDelay(2000, () => evt.emit(true));
  }

  onMouseMove(event: MouseEvent) {
    const target = event.target as SVGPathElement;

    if (target?.tagName !== 'path') {
      this.tooltip.visible = false;
      return;
    }

    const country = target.getAttribute('name');
    if (!country) {
      this.tooltip.visible = false;
      return;
    }

    this.tooltip.visible = true;
    this.tooltip.text = country;
    this.tooltip.x = event.clientX + 12;
    this.tooltip.y = event.clientY + 12;
  }

  onMouseLeave() {
    this.tooltip.visible = false;
    }
}
