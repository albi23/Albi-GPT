import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'albi-clipboard-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clipboard-button.component.html',
  styleUrl: './clipboard-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClipboardButtonComponent {

}

