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
  private readonly ANIMATION_DURATION = 1_500;

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
    const icon: HTMLElement = this.constructIcon(mouseEvt);
    this.element.nativeElement?.appendChild(icon);
    setTimeout(() => this.element.nativeElement?.removeChild(icon), this.ANIMATION_DURATION);
  }


  private constructIcon(mouseEvt: MouseEvent): HTMLElement {
    const icon: HTMLElement = this.document.createElement('i');
    icon.style.left = `${mouseEvt.x}px`;
    icon.style.top = `${mouseEvt.y}px`;
    icon.style.color = Utils.pickRandom(this.colors);
    icon.style.animation = Utils.pickRandom(this.animation);
    icon.style.animationDuration = `${this.ANIMATION_DURATION + 1}ms`;
    icon.className = 'absolute fa-solid fa-dollar-sign';
    return icon;
  }
}
