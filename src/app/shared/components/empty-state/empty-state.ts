import { Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-empty-state',
  imports: [TranslocoModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <p class="text-sm text-gray-400">{{ message() || ('common.empty' | transloco) }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  message = input<string>();
}
