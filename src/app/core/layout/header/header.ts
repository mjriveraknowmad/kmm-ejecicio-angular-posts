import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { filter, map } from 'rxjs/operators';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector';
import { SearchComponent } from '../../../shared/components/search/search';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [TranslocoModule, LanguageSelectorComponent, RouterLink, SearchComponent],
  templateUrl: './header.html',
})
export class HeaderComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly showSearch = computed(() => this.currentUrl().split('?')[0] === '/posts');

  logout() {
    this.auth.logout();
  }
}
