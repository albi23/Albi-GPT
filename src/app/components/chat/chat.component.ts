import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
  Type,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {delay, filter, interval, map, mergeMap, mergeWith, Observable, of, scan, take, tap} from 'rxjs';
import {DialogElem} from '../../model/dialog-elem';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SafePipe} from '../../pipes/safe.pipe';
import {DynamicComponentDirective} from '../../directives/dynamic-component.directive';
import {Renderable} from '../../model/renderable';
import {Optional} from '../../shared/utils/optional';
import {environment} from '../../../environments/environment';
import {UserActivityService} from '../../services/user-activity.service';

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
  private readonly userKeyboardAction$: Observable<number>;

  constructor(private readonly userActivities: UserActivityService) {
    this.isMobileDevice = window.matchMedia('(max-width: 767px)').matches;
    this.userKeyboardAction$ = this.userActivities.listenUserEvents().pipe(
      filter((evt: Event | null) => {
        return !!evt && evt instanceof KeyboardEvent && (evt as KeyboardEvent).code === 'Space';
      }),
      map(() => -1)
    );
  }

  ngAfterViewInit(): void {
    // this.focusElem(this.questionBox.nativeElement);
    this.contentFiller(this.dialogElem.question, // question generation
      this.dialogElem?.questionDelay || 0
    ).subscribe(
      {
        next: (letter: string) => {
          const prevHeight = this.questionBox.nativeElement.scrollHeight;
          this.questionBox.nativeElement.value += letter;
          this.autoHeightAdjuster();
          if (this.questionBox.nativeElement.scrollHeight > prevHeight){
            Renderable.scrollToBottom();
          }
        },
        complete: (): void => {
          this.button.nativeElement.click();
          this.questionBox.nativeElement.disabled = true;
          this.questionBox.nativeElement.value = this.dialogElem.question; // In case when someone will start to write sth- reset it
          this.autoHeightAdjuster();
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
            const prevHeight = this.terminalPre.nativeElement.clientHeight;
            this.terminalPre.nativeElement.innerText += letter;
            if (this.terminalPre.nativeElement.clientHeight > prevHeight){
              Renderable.scrollToBottom();
            }
          },
          complete: (): void => {
            // Components
            Optional.of(this.dialogElem.dynamicComponent).ifPresentOrElse(
              (dynamicComponent: Type<Renderable>): void => {
                const componentRef = this.dynamicRef.viewContainerRef.createComponent<Renderable>(dynamicComponent);
                componentRef.instance.renderDone(this.answeredEvt);
              },
              (): void => { // Just text
                // this.focusElem(this.questionBox.nativeElement);
                Renderable.scrollToBottom();
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
                        delayMs = 0,
                        scrollToBottom = false): Observable<string> {
    const letters: string[] = [...text];
    const baseObservable =  of(null)
      .pipe(
        tap(() => {
          if (scrollToBottom) {
            Renderable.scrollToBottomAfterDelay(100);
          }
        }),
        delay(delayMs),
        tap(() => this.questionInProgress.set(false)),
        take(1),
      );
    return (environment.ENABLE_PAUSING) ?
      baseObservable.pipe(
        mergeWith(interval(this.letterGeneratingSpeed), this.userKeyboardAction$),
        scan((acc: number, next: number | null): number => {
          const isPositive = (!!next && next > 0);
          if (acc < 0) {
            return isPositive ? -1 : 1;
          }
          return isPositive ? 1 : -1;
        }, 1),
        filter(x => x > 0),
        map(() => letters.shift() as string),
        take(text.length)
      ):
      baseObservable.pipe(
        mergeMap(() => interval(this.letterGeneratingSpeed)),
        map(() => letters.shift() as string),
        take(text.length)
      );
  }


}
