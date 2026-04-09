import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private transloco = inject(TranslocoService);

  ngOnInit() {
    const saved = localStorage.getItem('lang');
    if (saved && ['es', 'en'].includes(saved)) {
      this.transloco.setActiveLang(saved);
    }
  }
}
