import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[adHost]',
  standalone: true
})
export class DynamicComponentDirective {

  constructor(public viewContainerRef: ViewContainerRef) {
  }

}
