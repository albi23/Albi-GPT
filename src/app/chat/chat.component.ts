import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter, inject,
  Input,
  Output,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {delay, interval, map, mergeMap, Observable, of, take, takeWhile, tap} from "rxjs";
import {DialogElem} from "../model/dialog-elem";
import {FormsModule} from "@angular/forms";
import {CommonModule, DOCUMENT} from "@angular/common";
import {SafePipe} from "../pipes/safe.pipe";
import {AdDirective} from "../directives/ad.directive";
import {Renderable} from "../model/renderable";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CommonModule,
    SafePipe,
    AdDirective
  ]
})
export class ChatComponent implements AfterViewInit {

  @ViewChild("terminal", {read: ElementRef}) terminalPre!: ElementRef<HTMLPreElement>
  @ViewChild("questionBox", {read: ElementRef}) questionBox!: ElementRef<HTMLTextAreaElement>
  @ViewChild("btn", {read: ElementRef}) button!: ElementRef<HTMLButtonElement>
  @ViewChild(AdDirective, {static: true}) adHost!: AdDirective;

  @Input() dialogElem!: DialogElem;
  @Output() answeredEvt = new EventEmitter<boolean>();

  readonly questionInProgress: WritableSignal<boolean> = signal<boolean>(false);
  private readonly ANSWER_DELAY: number = 600;
  document: Document = inject(DOCUMENT)

  ngAfterViewInit(): void {
    this.focusElem(this.questionBox.nativeElement);

    this.contentFiller(this.dialogElem.question,
      this.dialogElem?.delay || 0
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
            if (this.dialogElem.specialContent) {
              this.adHost.viewContainerRef.createComponent<Renderable>(this.dialogElem.specialContent);
            }
            this.document.querySelector('#q-'+this.dialogElem.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            this.answeredEvt.emit(true)
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
                        delayMs: number = 0): Observable<string> {
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

}
