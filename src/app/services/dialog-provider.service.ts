import {Injectable} from '@angular/core';
import {DialogElem} from '../model/dialog-elem';
import {JavaTipsComponent} from '../components/java-tips/java-tips.component';
import {MapComponent} from '../components/map/map.component';
import {SkillsComponent} from '../components/skills/skills.component';
import {SnakeGameComponent} from '../components/snake-game/snake-game.component';
import {AngularSnippetComponent} from '../components/angular-snippet/angular-snippet.component';
import {PUNCTUATION_SPACE} from '../constans/litelar.constans';

@Injectable()
export class DialogProviderService {
  private readonly conversation: ReadonlyArray<DialogElem> = [
    {
      id: 1,
      question: 'What is your name?',
      answer: 'Hi, my name is Albert!',
    },
    {
      id: 2,
      question: 'Where are you from?',
      answer: 'From the motherland of the best programmers - Poland!',
    },
    {
      id: 3,
      question: 'Where the Poland is located?',
      answer: 'In central Europe.',
      dynamicComponent: MapComponent,
    },
    {
      id: 4,
      question: 'Who are you?',
      answer: 'I\'m a full-stack developer. I\'m creating software mainly using the Angular framework when it comes to UI.\n' +
        'By contrast, when it comes to creating business logic on the backend I use Java for this purpose.' + PUNCTUATION_SPACE,
    },
    {
      id: 5,
      question: 'What technologies are you using in your front-end applications?  ',
      answer: 'Here you have a few of them:',
      dynamicComponent: SkillsComponent,
    },
    {
      id: 6,
      question: 'If you are good enough then you could at least write snake game...',
      dynamicComponent: SnakeGameComponent,
      answer: 'Here you go:',
    },
    {
      id: 7,
      question: 'Ok,  can you make it bigger and a little bit slower?',
      dynamicComponent: SnakeGameComponent,
      answer: 'Of course! Catch this:',
    },
    {
      id: 8,
      question: 'Can you share some piece of code from that application with small explanations?',
      dynamicComponent: AngularSnippetComponent,
      answer: 'Below you will see a code responsible for skipping game slide in case of user inactivity.\n' +
        'User events such as mouse move, keyboard click etc. are tracked by activityService.\n' +
        'Using rxJs operators anytime when user perform some action than the timer is restarted and the apps\n' +
        'starts counting down once again after 10s.',
    },
    {
      id: 9,
      question: 'You said that You are Full Stack dev so how about the backend?',
      answer: 'What do you want to know?' + PUNCTUATION_SPACE,
    },
    {
      id: 10,
      question: 'Show me some usefully hints about... testing Java code.',
      dynamicComponent: JavaTipsComponent,
      answer: 'I have some productive Junit5 tip for You. Enabling parallel tests execution for selected classes:',
    },
    {
      id: 11,
      question: 'Next question in build phase... ;)',
      answer: '. . .' + PUNCTUATION_SPACE,
    }
  ];


  get dialog(): ReadonlyArray<DialogElem> {
    return this.conversation;
  }
}
