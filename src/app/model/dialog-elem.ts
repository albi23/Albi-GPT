import {Type} from '@angular/core';
import {Renderable} from './renderable';

export class DialogElem {
  id: number = 0;
  question:  string = '';
  answer:  string = '';
  questionDelay?: number =  555; /*ms*/
  dynamicComponent?: Type<Renderable>;
}
