import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Input,
  Output,
  signal, Type,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {delay, interval, map, mergeMap, Observable, of, take, takeWhile, tap} from 'rxjs';
import {DialogElem} from '../../model/dialog-elem';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SafePipe} from '../../pipes/safe.pipe';
import {DynamicComponentDirective} from '../../directives/dynamic-component.directive';
import {Renderable} from '../../model/renderable';
import {Optional} from '../../shared/utils/optional';
import {environment} from '../../../environments/environment';
import {PUNCTUATION_SPACE} from '../../constans/litelar.constans';

@Component({
  selector: 'albi-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CommonModule,
    SafePipe,
    DynamicComponentDirective
  ]
})
export class ChatComponent implements AfterViewInit {

  @ViewChild('terminal', {read: ElementRef}) terminalPre!: ElementRef<HTMLPreElement>;
  @ViewChild('questionBox', {read: ElementRef}) questionBox!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('btn', {read: ElementRef}) button!: ElementRef<HTMLButtonElement>;
  @ViewChild(DynamicComponentDirective, {static: true}) dynamicRef!: DynamicComponentDirective;

  @Input({required: true}) dialogElem!: DialogElem;
  @Output() answeredEvt = new EventEmitter<boolean>();

  readonly questionInProgress: WritableSignal<boolean> = signal<boolean>(false);
  readonly isMobileDevice: boolean;
  private readonly ANSWER_DELAY: number = environment.ANSWER_DELAY;
  private readonly letterGeneratingSpeed: number = environment.letterGeneratingSpeed;


  constructor() {
    this.isMobileDevice = window.matchMedia('(max-width: 767px)').matches;
  }

  ngAfterViewInit(): void {
    this.focusElem(this.questionBox.nativeElement);

    this.contentFiller(this.dialogElem.question, // question generation
      this.dialogElem?.questionDelay || 0
    ).subscribe(
      {
        next: (letter: string) => {
          this.questionBox.nativeElement.value += letter;
          this.autoHeightAdjuster();
        },
        complete: (): void => {
          this.button.nativeElement.click();
          this.questionBox.nativeElement.disabled = true;
          this.questionInProgress.set(true);
          this.answerGeneration();
        }
      }
    );

  }

  @HostListener('window:resize', ['$event'])
  autoHeightAdjuster(): void {
    this.questionBox.nativeElement.style.height = '5px';
    this.questionBox.nativeElement.style.height = (this.questionBox.nativeElement.scrollHeight - 10) + 'px';
  }

  private answerGeneration(): void {
    this.contentFiller(this.dialogElem.answer, this.ANSWER_DELAY, true)
      .subscribe({
          next: (letter: string) => {
            this.terminalPre.nativeElement.innerText += letter;
            this.scrollToContentIfNeeded(letter);
          },
          complete: (): void => {
            // Components
            Optional.of(this.dialogElem.dynamicComponent).ifPresentOrElse(
              (dynamicComponent: Type<Renderable>): void => {
                const componentRef = this.dynamicRef.viewContainerRef.createComponent<Renderable>(dynamicComponent);
                componentRef.instance.renderDone(this.answeredEvt);
              },
              (): void => { // Just text
                this.focusElem(this.questionBox.nativeElement);
                Renderable.scrollToBottom();
                this.answeredEvt.emit(true);
              }
            );
          }
        }
      );
  }

  private scrollToContentIfNeeded(letter: string): void {
    if (letter === PUNCTUATION_SPACE) {
      Renderable.scrollToBottom();
      return;
    }
    if (this.isMobileDevice && this.terminalPre.nativeElement.innerText.length % 20 === 0) {
      Renderable.scrollToBottom();
    } else if (!this.isMobileDevice && (letter === '\n' || this.terminalPre.nativeElement.innerText.length % 50 === 0)) {
      Renderable.scrollToBottom();
    }
  }

  private focusElem(elem: HTMLElement): void {
    setTimeout(() => { // this will make the execution after the above boolean has changed
      elem.focus();
    }, 0);
  }


  private contentFiller(text: string,
                        delayMs = 0,
                        scrollToBottom = false): Observable<string> {
    const letters: string[] = [...text];
    return of(null)
      .pipe(
        tap(() => {
          if (scrollToBottom) {
            Renderable.scrollToBottomAfterDelay(100);
          }
        }),
        delay(delayMs),
        tap(() => this.questionInProgress.set(false)),
        take(1),
        mergeMap(() => interval(this.letterGeneratingSpeed)),
        map(() => letters.shift() as string),
        take(text.length)
      );
  }


}
