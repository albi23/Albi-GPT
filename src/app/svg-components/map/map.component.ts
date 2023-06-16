import { Component } from '@angular/core';
import {Renderable} from "../../model/renderable";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.svg',
  standalone: true
})
export class MapComponent implements Renderable{}
