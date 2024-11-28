import {AfterViewInit, Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[albiTextRandomizer]',
  standalone: true
})
export class TextRandomizerDirective implements AfterViewInit {

  private readonly alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly DATA_KEY = 'value';


  constructor(private readonly element: ElementRef) {
  }


  ngAfterViewInit(): void {
    this.element.nativeElement.dataset[this.DATA_KEY] = this.element.nativeElement.innerText;
  }


  @HostListener('mouseover', ['$event'])
  delayedRandomizer(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.innerText != target.dataset[this.DATA_KEY]) {
      return;
    }

    let iterations: number = -2;

    const interval = setInterval(() => {
      target.innerText = target.innerText.split('')
        .map((letter: string, index: number): string => {
          if (index < iterations || letter.match('[\t ]')) {
            return (target.dataset[this.DATA_KEY] as string)[index];
          }
          return this.alphabet[Math.floor(Math.random() * 26)];
        })
        .join('');

      if (iterations >= target.innerText.length) {
        clearInterval(interval);
      }

      iterations += 0.25;
    }, 75);
  }

}
