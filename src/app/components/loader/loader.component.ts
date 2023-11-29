import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'albi-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {

  readonly grid25: number[] = this.fill(25);
  readonly grid20: number[] = this.fill(20);

  fill(size: number): number[] {
    const arr =  new Array<number>(size);
    for (let i = 1; i <= arr.length; i++) {
      arr[i - 1] = i;
    }
    return arr;
  }
}