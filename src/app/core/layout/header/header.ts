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

@Component({
  selector: 'app-header',
  imports: [TranslocoModule, LanguageSelectorComponent, RouterLink],
  templateUrl: './header.html',
})
export class HeaderComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private URL_SEARCH_PREFIX = '/posts';
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly showSearch = computed(() => this.currentUrl().startsWith(this.URL_SEARCH_PREFIX));

  private readonly currentQ = toSignal(
    this.route.queryParams.pipe(map((p) => (p['q'] as string) ?? '')),
    { initialValue: '' },
  );
  readonly searchValue = linkedSignal(() => this.currentQ());
  private readonly searchSubject$ = new Subject<string>();

  constructor() {
    this.searchSubject$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((q) => {
      this.router.navigate([this.URL_SEARCH_PREFIX], {
        queryParams: { q: q || null, page: 1 },
      });
    });
  }

  onSearch(value: string) {
    this.searchValue.set(value);
    this.searchSubject$.next(value);
  }

  logout() {
    this.auth.logout();
  }
}
