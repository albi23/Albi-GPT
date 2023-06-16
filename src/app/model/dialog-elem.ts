import {Type} from "@angular/core";
import {Renderable} from "./renderable";

export class DialogElem {
  question:  string = '';
  answer:  string = '';
  delay?: number =  0/*ms*/
  specialContent?: Type<Renderable>;
  id: number = 0
}
