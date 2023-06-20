import { Component } from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RxJsComponent} from "./rx-js/rx-js.component";

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
export class SkillsComponent {

}
