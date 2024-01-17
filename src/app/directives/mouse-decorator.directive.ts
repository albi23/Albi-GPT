import {Directive, ElementRef, HostListener, Inject} from '@angular/core';
import {Point} from '../types/types';
import {Utils} from '../shared/utils/utils';
import {DOCUMENT} from '@angular/common';

@Directive({
  selector: '[mouseDecorator]',
  standalone: true
})
export class MouseDecoratorDirective {
  private lastRendered: Point = {x: 0, y: 0};
  private readonly colors: string[] = ['#ec4899', '#8b5cf6', '#4338ca', '#c026d3'];
  private readonly animation: string[] = ['fall', 'fall2', 'fall3'];

  constructor(private readonly element: ElementRef,
              @Inject(DOCUMENT) private document: Document) {
  }

  @HostListener('mousemove', ['$event'])
  renderStars(mouseEvt: MouseEvent): void {
    const currPoint: Point = {x: mouseEvt.x, y: mouseEvt.y};
    if (Utils.calculateDistance(currPoint, this.lastRendered) < 100) {
      return;
    }
    this.lastRendered = currPoint;
    const star: HTMLElement = this.constructStar(mouseEvt);
    this.element.nativeElement?.appendChild(star);
    setTimeout(() => this.element.nativeElement?.removeChild(star), 1_500);
  }


  private constructStar(mouseEvt: MouseEvent): HTMLElement {
    const star: HTMLElement = this.document.createElement('i');
    star.style.left = `${mouseEvt.x}px`;
    star.style.top = `${mouseEvt.y}px`;
    star.style.color = Utils.pickRandom(this.colors);
    star.style.animation = Utils.pickRandom(this.animation);
    star.style.animationDuration = '1501ms';
    star.className = 'star fa-solid fa-star';
    return star;
  }
}
