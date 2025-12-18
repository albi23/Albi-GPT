import { Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[adHost]',
  standalone: true
})
export class DynamicComponentDirective {  viewContainerRef = inject(ViewContainerRef);


}
