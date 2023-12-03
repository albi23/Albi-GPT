import {Type} from '@angular/core';
import {Renderable} from './renderable';

export class DialogElem {
  readonly id: number = 0;
  readonly question:  string = '';
  readonly answer:  string = '';
  readonly dynamicComponent?: Type<Renderable>;
  readonly questionDelay =  350; /*ms*/


  constructor(id: number, question: string, answer: string,
              dynamicComponent?: Type<Renderable>) {
    this.id = id;
    this.question = question;
    this.answer = answer;
    this.dynamicComponent = dynamicComponent;
  }
}
