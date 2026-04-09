import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="flex items-center justify-center py-16">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500"
      ></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
