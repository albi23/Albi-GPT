import {AfterViewInit, ChangeDetectionStrategy, Component, signal, WritableSignal} from '@angular/core';
import {DialogElem} from './model/dialog-elem';
import {SkillsComponent} from './components/skills/skills.component';
import {MapComponent} from './components/map/map.component';
import {SnakeGameComponent} from './components/snake-game/snake-game.component';
import {Optional} from './components/utils/optional';

@Component({
  selector: 'albi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  conversation: WritableSignal<DialogElem[]> = signal<DialogElem[]>([]);
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
    },
    {
      question: 'Who are you?',
      answer: 'I\'m a full-stack developer. I\'m creating software mainly using the Angular framework when it comes to UI.\n' +
        'By contrast, when it comes to creating business logic on the backend I use Java for this purpose.',
    },
    {
      question: 'What technologies are you using in your front-end applications?  ',
      answer: 'Here you have a few of them:',
      dynamicComponent: SkillsComponent,
    },
    {
      question: 'If you are good enough then you could at least write snake game...',
      dynamicComponent: SnakeGameComponent,
      answer: 'Here you go:',
    },
    {
      question: 'Ok,  can you make it bigger and a little bit slower?',
      dynamicComponent: SnakeGameComponent,
      answer: 'Of course! Catch this:',
    },
    {
      question: 'You said that You are Full Stack dev so how about the backend?',
      answer: 'What do you want to know?',
    },
    {
      question: 'Next question in build phase... ;)',
      answer: '. . .',
    }
    // {
    //   question: 'What tools are you using ',
    //   dynamicComponent: DevToolsComponent,
    //   answer: 'What do you want to know?',
    // }
  ];

  ngAfterViewInit(): void {
    this.nextQuestion();
  }


  nextQuestion(): void {
    Optional.of(this.source.shift()).ifPresent((dialogElem: DialogElem) => {
      this.conversation.set(this.conversation().concat(dialogElem));
    });

  }


}
