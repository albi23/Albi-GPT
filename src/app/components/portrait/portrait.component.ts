import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {Renderable} from '../../model/renderable';
import {asciiLZWEncodedImage} from './portrait.consts';

@Component({
    selector: 'albi-portrait',
    imports: [],
    templateUrl: './portrait.component.html',
    styleUrl: './portrait.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortraitComponent implements Renderable, AfterViewInit {

  @ViewChild('portrait', {read: ElementRef}) portrait!: ElementRef<HTMLPreElement>;

  ngAfterViewInit(): void {
    const beforeRender: number = Renderable.currScrollHeight();
    this.portrait.nativeElement.textContent = this.lzwDecode(asciiLZWEncodedImage);
    this.centerOnXAxis(this.portrait.nativeElement);
    Renderable.progressiveScroll(0.25, Renderable.currScrollHeight() - beforeRender, 500);
  }


  renderDone(evt: EventEmitter<boolean>): void {
    Renderable.actionAfterDelay(2000, () => evt.emit(true));
  }


  private lzwDecode(inputString: string): string {
    const dict: { [key: string]: string } = {};
    const data: string[] = (inputString + '').split('');
    let currChar: string = data[0];
    let oldPhrase: string = currChar;
    const out: string[] = [currChar];
    let code: number = 256;
    let phrase: string;
    for (let i: number = 1; i < data.length; i++) {
      const currCode = data[i].charCodeAt(0);
      if (currCode < 256) {
        phrase = data[i];
      } else {
        phrase = dict['_' + currCode] ? dict['_' + currCode] : (oldPhrase + currChar);
      }
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict['_' + code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    return out.join('');
  }

  private centerOnXAxis(nativeElement: HTMLPreElement): void {
    nativeElement.scrollLeft += nativeElement.scrollWidth * 0.25;
  }
}
