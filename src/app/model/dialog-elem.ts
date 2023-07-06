import {Type} from '@angular/core';
import {Renderable} from './renderable';

export class DialogElem {
  question:  string = '';
  answer:  string = '';
  questionDelay?: number =  555; /*ms*/
  dynamicComponent?: Type<Renderable>;
}
