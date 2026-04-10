import { Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-error-state',
  imports: [TranslocoModule],
  template: `
    <div
      class="flex flex-col items-center justify-center py-16 text-center animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <p class="text-sm text-red-400">{{ message() || ('common.error' | transloco) }}</p>
    </div>
  `,
})
export class ErrorStateComponent {
  message = input<string>();
}
