import {Directive, Host, Input, NgIterable} from '@angular/core';
import {NgForOf} from '@angular/common';

@Directive({
  selector: '[ngForTrackByProperty]',
  standalone: true
})
export class NgForTrackByFieldDirective<T> {

  @Input() ngForOf!: NgIterable<T>;
  @Input() ngForTrackByProperty!: keyof T;

  constructor(@Host() ngForOHost: NgForOf<T>) {
    ngForOHost.ngForTrackBy = (_, item: T): T[keyof T] =>  item[this.ngForTrackByProperty];
  }
}
