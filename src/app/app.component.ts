import {AfterViewInit, ChangeDetectionStrategy, Component, signal, WritableSignal} from '@angular/core';
import {DialogElem} from "./model/dialog-elem";
import {SkillsComponent} from "./components/skills/skills.component";
import {MapComponent} from "./components/map/map.component";

@Component({
  selector: 'albi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  conversation: WritableSignal<DialogElem[]> = signal<DialogElem[]>([])
  source: DialogElem[] = [
    {
      question: 'What is your name?',
      answer: 'Hi, my name is Albert!',
    },
    {
      question: 'Where are you from?',
      answer: 'From the motherland of the best programmers - Poland!',
    },
    {
      question: 'Where the Poland is located?',
      answer: 'In central Europe.',
      dynamicComponent: MapComponent,
      renderDoneDelay: 2000
    },
    {
      question: 'Who are you?',
      answer: 'I am a full-stack developer. I creating software mainly using the Angular framework when it comes to UI.\n' +
        'By contrast, when it comes to creating business logic on the backend I use Java for this purpose.',
    },
    {
      question: 'What technologies are you using in your front-end applications?  ',
      answer: 'Here you have a few of them:',
      dynamicComponent: SkillsComponent,
      renderDoneDelay: 8000
    }
  ];

  ngAfterViewInit(): void {
    this.nextQuestion()
  }


  nextQuestion(): void {
    this.conversation.mutate((curr: DialogElem[]) => {
      const item = this.source.shift();
      if (item) {
        curr.push(item)
      }
    })

  }


}
