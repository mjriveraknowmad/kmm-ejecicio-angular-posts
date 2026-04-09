import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector';
import { AuthService } from '../../auth/services/auth.service';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SearchComponent } from '../../../shared/components/search';

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
  readonly showSearch = computed(() => this.currentUrl().startsWith('/posts'));

  logout() {
    this.auth.logout();
  }
}
