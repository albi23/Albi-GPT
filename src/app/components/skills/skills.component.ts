import {Component, EventEmitter} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RxJsComponent} from "./rx-js/rx-js.component";
import {Renderable} from "../../model/renderable";

@Component({
  selector: 'albi-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  imports: [
    NgOptimizedImage,
    RxJsComponent
  ],
  standalone: true
})
export class SkillsComponent extends Renderable {


  override renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    Renderable.actionAfterDelay(8000, () => evt.emit(true))
  }

}
