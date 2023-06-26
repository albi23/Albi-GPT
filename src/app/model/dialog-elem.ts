import {Type} from '@angular/core';
import {Renderable} from './renderable';

export class DialogElem {
  question:  string = '';
  answer:  string = '';
  questionDelay?: number =  400; /*ms*/
  renderDoneDelay?: number =  0; /*ms*/
  dynamicComponent?: Type<Renderable>;
}
