import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'albi-rx-js',
    imports: [CommonModule],
    templateUrl: './rx-js.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RxJsComponent {

}
