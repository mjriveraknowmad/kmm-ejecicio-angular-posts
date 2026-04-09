import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './header.html',
})
export class HeaderComponent {
  protected auth = inject(AuthService);
  private transloco = inject(TranslocoService);

  protected currentLang = signal(this.transloco.getActiveLang());

  toggleLang() {
    const next = this.currentLang() === 'es' ? 'en' : 'es';
    this.transloco.setActiveLang(next);
    this.currentLang.set(next);
    localStorage.setItem('lang', next);
  }

  logout() {
    this.auth.logout();
  }
}
