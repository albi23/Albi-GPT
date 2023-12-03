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
    new DialogElem(
      1,
      'What is your name?',
      'Hi, my name is Albert!',
    ),
    new DialogElem(
      2,
      'Where are you from?',
      'From the motherland of the best programmers - Poland!',
    ),
    new DialogElem(
      3,
      'Where the Poland is located?',
      'In central Europe.',
      MapComponent,
    ),
    new DialogElem(
      4,
      'Who are you?',
      'I\'m a software engineer. I\'m creating software mainly using the Angular framework when it comes to UI.\n' +
      'By contrast, when it comes to creating business logic on the backend I use Java for this purpose.' + PUNCTUATION_SPACE,
    ),
    new DialogElem(
      5,
      'What technologies are you using in your front-end applications?  ',
      'Here you have a few of them:',
      SkillsComponent,
    ),
    new DialogElem(
      6,
      'If you are good enough then you could at least write snake game...',
      'Here you go:',
      SnakeGameComponent,
    ),
    new DialogElem(
      7,
      'Ok,  can you make it bigger and a little bit slower?',
      'Of course! Catch this:',
      SnakeGameComponent,
    ),
    new DialogElem(
      8,
      'Can you share some piece of code from that application with small explanations?',
      'Below you will see a code responsible for skipping game slide in case of user inactivity.\n' +
      'User events such as mouse move, keyboard click etc. are tracked by activityService.\n' +
      'Using rxJs operators anytime when user perform some action than the timer is restarted and the apps\n' +
      'starts counting down once again after 10s.',
      AngularSnippetComponent,
    ),
    new DialogElem(
      9,
      'You said that You are Full Stack dev so how about the backend?',
      'What do you want to know?' + PUNCTUATION_SPACE,
    ),
    new DialogElem(
      10,
      'Show me some usefully hints about... testing Java code.',
      'I have some productive Junit5 tip for You. Enabling parallel tests execution for selected classes:',
      JavaTipsComponent
    ),
    new DialogElem(
      11,
      'Next question in build phase... ;)',
      '. . .' + PUNCTUATION_SPACE,
    )
  ];


  get dialog(): ReadonlyArray<DialogElem> {
    return this.conversation;
  }
}
