import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-loading-spinner',
  imports: [TranslocoModule],
  template: `
    <div
      class="flex items-center justify-center py-16"
      role="status"
      [attr.aria-label]="'common.loading' | transloco"
    >
      <div
        aria-hidden="true"
        class="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500"
      ></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
