import { Component, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  imports: [TranslocoModule],
  template: `
    <div class="relative sm:min-w-[300px]">
      <img
        src="search.svg"
        alt="Search"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-[10.5px] h-[10.5px] pointer-events-none opacity-70"
        style="filter: invert(38%) sepia(10%) saturate(400%) hue-rotate(155deg) brightness(90%)"
      />
      <input
        #searchInput
        type="search"
        [value]="searchValue()"
        (input)="onSearch(searchInput.value)"
        [placeholder]="'header.search' | transloco"
        class="w-full h-[50px] rounded bg-[#F0F4F7] border border-[rgba(169,180,185,0.1)] pl-9 pr-3 px-3 text-sm text-[#566166] placeholder:text-[#566166] focus:outline-none focus:ring-1 focus:ring-[rgba(169,180,185,0.3)]"
      />
    </div>
  `,
})
export class SearchComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  urlSearchPrefix = input<string>('/posts');

  private readonly currentQ = toSignal(
    this.route.queryParams.pipe(map((p) => (p['q'] as string) ?? '')),
    { initialValue: '' },
  );
  readonly searchValue = linkedSignal(() => this.currentQ());
  private readonly searchSubject$ = new Subject<string>();

  constructor() {
    this.searchSubject$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((q) => {
      this.router.navigate([this.urlSearchPrefix()], {
        queryParams: { q: q || null, page: 1 },
      });
    });
  }

  onSearch(value: string) {
    this.searchValue.set(value);
    this.searchSubject$.next(value);
  }
}
