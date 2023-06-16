import {ChangeDetectionStrategy, Component, signal, WritableSignal} from '@angular/core';
import {DialogElem} from "./model/dialog-elem";
import {MapComponent} from "./svg-components/map/map.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  conversation: WritableSignal<DialogElem[]> = signal<DialogElem[]>([])
  id: number = 0
  source: DialogElem[] = [
    {
      question: 'Who are you?',
      answer: 'Hi, my name is Albert!',
    },
    {
      question: 'Where are you from?',
      answer: 'From the motherland of the best programmers - Poland!',
    },
    {
      question: 'Where the Poland is located?',
      answer: 'In Europe.',
      specialContent: MapComponent
    },
  ].map((x) => {
    return {
      id: ++this.id, ...x
    }
  })

  constructor() {
    this.nextQuestion()
  }


  nextQuestion(): void {
    if (this.conversation.length > 1) {
      return
    }
    this.conversation.mutate((curr: DialogElem[]) => {
      const item = this.source.shift();
      if (item) {
        curr.push(item)
      }
    })

  }


}
