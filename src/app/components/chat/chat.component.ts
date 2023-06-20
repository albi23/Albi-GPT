import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {delay, interval, map, mergeMap, Observable, of, take, takeWhile, tap} from "rxjs";
import {DialogElem} from "../../model/dialog-elem";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SafePipe} from "../../pipes/safe.pipe";
import {DynamicComponentDirective} from "../../directives/dynamic-component.directive";
import {Renderable} from "../../model/renderable";

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

  @ViewChild("terminal", {read: ElementRef}) terminalPre!: ElementRef<HTMLPreElement>
  @ViewChild("questionBox", {read: ElementRef}) questionBox!: ElementRef<HTMLTextAreaElement>
  @ViewChild("btn", {read: ElementRef}) button!: ElementRef<HTMLButtonElement>
  @ViewChild(DynamicComponentDirective, {static: true}) dynamicRef!: DynamicComponentDirective;

  @Input({required: true}) dialogElem!: DialogElem;
  @Output() answeredEvt = new EventEmitter<boolean>();

  readonly questionInProgress: WritableSignal<boolean> = signal<boolean>(false);
  private readonly ANSWER_DELAY: number = 600;

  ngAfterViewInit(): void {
    this.focusElem(this.questionBox.nativeElement);

    this.contentFiller(this.dialogElem.question,
      this.dialogElem?.questionDelay || 0
    ).subscribe(
      {
        next: (letter: string) => this.questionBox.nativeElement.value += letter,
        complete: (): void => {
          this.button.nativeElement.click();
          this.questionInProgress.set(true)
          this.answerGeneration();
        }
      }
    );

  }

  private answerGeneration() {
    this.contentFiller(this.dialogElem.answer, this.ANSWER_DELAY)
      .subscribe({
          next: (l: string) => this.terminalPre.nativeElement.innerText += l,
          complete: (): void => {
            if (this.dialogElem.dynamicComponent) {
              this.dynamicRef.viewContainerRef.createComponent<Renderable>(this.dialogElem.dynamicComponent);
            }
            console.log(this.dialogElem.renderDoneDelay);
            this.nextQuestion(this.dialogElem.renderDoneDelay || 0)
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
    const letters: string[] = [...text]
    return of(null)
      .pipe(
        delay(delayMs),
        tap(_ => this.questionInProgress.set(false)),
        take(1),
        mergeMap(_ => interval(70)),
        map(_ => letters.shift() as string),
        takeWhile(letter => !!letter)
      )
  }

  private nextQuestion(delayMs = 0): void {
    if (delayMs !== 0){
      this.focusElem(this.terminalPre.nativeElement);
    }
    of(null)
      .pipe(
        delay(delayMs),
        take(1)
      ).subscribe(_ => {
      this.answeredEvt.emit(true)
    })
  }

}
