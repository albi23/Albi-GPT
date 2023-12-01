import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {interval, take} from 'rxjs';

@Component({
  selector: 'albi-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent implements AfterViewInit {
  readonly grid25: number[] = this.fill(25);
  readonly grid20: number[] = this.fill(20);
  percentage: WritableSignal<number> =  signal(0);

  ngAfterViewInit(): void {
    interval(96.5).pipe(
      take(100))
      .subscribe((num: number) => this.percentage.set(num + 1));
  }


  fill(size: number): number[] {
    const arr = new Array<number>(size);
    for (let i = 1; i <= arr.length; i++) {
      arr[i - 1] = i;
    }
    return arr;
  }
}
