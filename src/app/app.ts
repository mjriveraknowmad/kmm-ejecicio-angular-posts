import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  constructor() {
    const transloco = inject(TranslocoService);
    const saved = localStorage.getItem('lang');
    if (saved && ['es', 'en'].includes(saved)) {
      transloco.setActiveLang(saved);
    }
  }
}
