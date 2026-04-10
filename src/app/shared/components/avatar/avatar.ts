import { Component, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: ` <img [src]="src()" [alt]="alt()" class="h-6 w-6 rounded-full object-cover" /> `,
})
export class AvatarComponent {
  src = input.required<string>();
  alt = input<string>('');
}
