import { Directive, ElementRef, inject, input, OnDestroy, OnInit, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  readonly scrolled = output<void>();
  /** Scrollable container that acts as the IntersectionObserver root. */
  readonly root = input<HTMLElement | null>(null);

  private observer?: IntersectionObserver;
  private el = inject(ElementRef);

  ngOnInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.scrolled.emit();
        }
      },
      { root: this.root(), threshold: 0.1 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
