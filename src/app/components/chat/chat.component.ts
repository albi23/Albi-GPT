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
import {Optional} from '../utils/optional';
import {environment} from '../../../environments/environment.development';

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
  private readonly ANSWER_DELAY: number = 600;
  private readonly letterGeneratingSpeed: number = environment.letterGeneratingSpeed;


  constructor() {
    this.isMobileDevice = window.matchMedia('(max-width: 767px)').matches;
  }

  ngAfterViewInit(): void {
    this.focusElem(this.questionBox.nativeElement);

    this.contentFiller(this.dialogElem.question,
      this.dialogElem?.questionDelay || 0
    ).subscribe(
      {
        next: (letter: string) => {
          this.questionBox.nativeElement.value += letter;
          this.autoHeightAdjuster();
        },
        complete: (): void => {
          this.button.nativeElement.click();
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
    this.contentFiller(this.dialogElem.answer, this.ANSWER_DELAY)
      .subscribe({
          next: (letter: string) => {
            this.terminalPre.nativeElement.innerText += letter;
            if (this.isMobileDevice){
              Renderable.scrollToBottom(); // TODO: improve it
            }
          },
          complete: (): void => {
            Optional.of(this.dialogElem.dynamicComponent).ifPresentOrElse(
              (dynamicComponent: Type<Renderable>): void => {
                const componentRef = this.dynamicRef.viewContainerRef.createComponent<Renderable>(dynamicComponent);
                componentRef.instance.renderDone(this.answeredEvt);
              },
              () => {
                this.focusElem(this.questionBox.nativeElement);
                this.answeredEvt.emit(true);
              }
            );
          }
        }
      );
  }

  private focusElem(elem: HTMLElement): void {
    setTimeout(() => { // this will make the execution after the above boolean has changed
      elem.focus();
    }, 0);
  }


  private contentFiller(text: string,
                        delayMs = 0): Observable<string> {
    const letters: string[] = [...text];
    return of(null)
      .pipe(
        delay(delayMs),
        tap(() => this.questionInProgress.set(false)),
        take(1),
        mergeMap(() => interval(this.letterGeneratingSpeed)),
        map(() => letters.shift() as string),
        takeWhile(letter => !!letter)
      );
  }


}
